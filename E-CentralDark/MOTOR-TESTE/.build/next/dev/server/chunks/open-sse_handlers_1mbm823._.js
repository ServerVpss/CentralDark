module.exports = [
"[project]/open-sse/handlers/responseSanitizer/reasoning.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONTENT_OPEN_TAG_REGEX",
    ()=>CONTENT_OPEN_TAG_REGEX,
    "EXCESSIVE_NEWLINES",
    ()=>EXCESSIVE_NEWLINES,
    "REASONING_CLOSE_TAG_REGEX",
    ()=>REASONING_CLOSE_TAG_REGEX,
    "REASONING_TAG_FRAGMENT_REGEX",
    ()=>REASONING_TAG_FRAGMENT_REGEX,
    "REASONING_TAG_NAMES",
    ()=>REASONING_TAG_NAMES,
    "REASONING_TAG_PATTERN",
    ()=>REASONING_TAG_PATTERN,
    "THINK_TAG_REGEX",
    ()=>THINK_TAG_REGEX,
    "UNCLOSED_REASONING_TAG_REGEX",
    ()=>UNCLOSED_REASONING_TAG_REGEX,
    "cleanReasoningFragment",
    ()=>cleanReasoningFragment,
    "collapseExcessiveNewlines",
    ()=>collapseExcessiveNewlines,
    "extractThinkingFromContent",
    ()=>extractThinkingFromContent,
    "isAntigravityReasoningRoute",
    ()=>isAntigravityReasoningRoute,
    "isTextualReasoningTagNativeRoute",
    ()=>isTextualReasoningTagNativeRoute,
    "movePrefixBeforeContentTagToThinking",
    ()=>movePrefixBeforeContentTagToThinking,
    "normalizeReasoningRouteId",
    ()=>normalizeReasoningRouteId,
    "shouldParseTextualReasoningTags",
    ()=>shouldParseTextualReasoningTags,
    "splitClosingOnlyReasoningPrefix",
    ()=>splitClosingOnlyReasoningPrefix
]);
const REASONING_TAG_NAMES = [
    "think",
    "thinking",
    "thought",
    "internal_thought"
];
const REASONING_TAG_PATTERN = REASONING_TAG_NAMES.join("|");
const THINK_TAG_REGEX = new RegExp(`<(${REASONING_TAG_PATTERN})\\b[^>]*>([\\s\\S]*?)<\\/\\1>`, "gi");
const REASONING_CLOSE_TAG_REGEX = new RegExp(`</(${REASONING_TAG_PATTERN})>`, "i");
const REASONING_TAG_FRAGMENT_REGEX = new RegExp(`</?(${REASONING_TAG_PATTERN})\\b[^>]*>`, "gi");
const CONTENT_OPEN_TAG_REGEX = /<content\b[^>]*>/i;
const UNCLOSED_REASONING_TAG_REGEX = new RegExp(`<(${REASONING_TAG_PATTERN})(?:\\s[^>]*)?(?:>|\\r?\\n)([\\s\\S]*)$`, "i");
const EXCESSIVE_NEWLINES = /\n{2,}/g;
function collapseExcessiveNewlines(text) {
    return text.replace(EXCESSIVE_NEWLINES, "\n\n");
}
function cleanReasoningFragment(text) {
    return text.replace(REASONING_TAG_FRAGMENT_REGEX, "").trim();
}
function splitClosingOnlyReasoningPrefix(text) {
    const closeMatch = text.match(REASONING_CLOSE_TAG_REGEX);
    if (!closeMatch || closeMatch.index === undefined || closeMatch.index === 0) return null;
    const closeIndex = closeMatch.index;
    const suffix = text.slice(closeIndex + closeMatch[0].length);
    if (!CONTENT_OPEN_TAG_REGEX.test(suffix)) return null;
    const thinking = cleanReasoningFragment(text.slice(0, closeIndex));
    if (!thinking) return null;
    return {
        content: suffix.trim(),
        thinking
    };
}
function movePrefixBeforeContentTagToThinking(cleaned, thinkingParts) {
    const contentMatch = cleaned.match(CONTENT_OPEN_TAG_REGEX);
    if (!contentMatch || contentMatch.index === undefined || contentMatch.index <= 0) return cleaned;
    const contentIndex = contentMatch.index;
    const prefix = cleanReasoningFragment(cleaned.slice(0, contentIndex));
    if (prefix) thinkingParts.unshift(prefix);
    return cleaned.slice(contentIndex);
}
function extractThinkingFromContent(text) {
    if (!text || typeof text !== "string") {
        return {
            content: text || "",
            thinking: null
        };
    }
    const thinkingParts = [];
    let hasThinkTags = false;
    let cleaned = text.replace(THINK_TAG_REGEX, (_match, _tagName, thinkContent)=>{
        hasThinkTags = true;
        const trimmed = thinkContent.trim();
        if (trimmed) {
            thinkingParts.push(trimmed);
        }
        return "";
    });
    if (!hasThinkTags) {
        const closingOnly = splitClosingOnlyReasoningPrefix(cleaned);
        if (closingOnly) {
            return closingOnly;
        }
    }
    const unclosedMatch = cleaned.match(UNCLOSED_REASONING_TAG_REGEX);
    if (unclosedMatch?.index !== undefined) {
        hasThinkTags = true;
        const reasoning = String(unclosedMatch[2] || "").trim();
        if (reasoning) thinkingParts.push(reasoning);
        const prefix = cleaned.slice(0, unclosedMatch.index);
        cleaned = /^(?:\s|§\d+§)*$/.test(prefix) ? "" : prefix;
    }
    if (!hasThinkTags) {
        return {
            content: text,
            thinking: null
        };
    }
    cleaned = movePrefixBeforeContentTagToThinking(cleaned, thinkingParts);
    return {
        content: cleaned.trim(),
        thinking: thinkingParts.length > 0 ? thinkingParts.join("\n\n") : null
    };
}
function normalizeReasoningRouteId(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
}
function isAntigravityReasoningRoute(providerId, modelId) {
    return providerId.includes("antigravity") || providerId === "agy" || modelId.includes("antigravity/") || modelId.startsWith("agy/");
}
function isTextualReasoningTagNativeRoute(providerId, modelId) {
    const routeId = `${providerId}/${modelId}`;
    return /deepseek[-_/]?r1\b/.test(routeId) || /r1[-_/]?distill\b/.test(routeId) || /(?:^|[/:_-])qwq(?:[/._:-]|$)/.test(routeId) || /(?:^|[/_-])k3(?:[/._:-]|$)/.test(modelId) || providerId !== "minimax" && providerId !== "minimax-cn" && /minimax[-_]?m3\b/.test(routeId);
}
function shouldParseTextualReasoningTags(provider, model) {
    const providerId = normalizeReasoningRouteId(provider);
    const modelId = normalizeReasoningRouteId(model);
    return !isAntigravityReasoningRoute(providerId, modelId) && isTextualReasoningTagNativeRoute(providerId, modelId);
}
}),
"[project]/open-sse/handlers/responseSanitizer.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OMIT_STREAMING_CHUNK_MARKER",
    ()=>OMIT_STREAMING_CHUNK_MARKER,
    "isResponsesCommentaryMessageItem",
    ()=>isResponsesCommentaryMessageItem,
    "sanitizeOpenAIResponse",
    ()=>sanitizeOpenAIResponse,
    "sanitizeResponsesApiResponse",
    ()=>sanitizeResponsesApiResponse,
    "sanitizeStreamingChunk",
    ()=>sanitizeStreamingChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer/reasoning.ts [instrumentation] (ecmascript)");
;
;
;
;
;
/**
 * Response Sanitizer — Normalizes LLM responses to strict OpenAI SDK format.
 *
 * Fixes Issues:
 * 1. Strips non-standard fields (x_groq, usage_breakdown, service_tier) that
 *    break OpenAI Python SDK v1.83+ Pydantic validation (returns str instead of object)
 * 2. Optionally extracts native textual reasoning tags from known tag-style models
 * 3. Normalizes response id, object, and usage fields
 * 4. Converts developer role → system for non-OpenAI providers
 */ const ALLOWED_USAGE_FIELDS = new Set([
    "prompt_tokens",
    "completion_tokens",
    "total_tokens",
    "cached_tokens",
    "prompt_tokens_details",
    "completion_tokens_details",
    // Keep through sanitize → applyClientUsageBuffer so heuristic web usage is
    // not inflated by the default USAGE_TOKEN_BUFFER (2000).
    "estimated"
]);
const ALLOWED_RESPONSES_USAGE_FIELDS = new Set([
    "input_tokens",
    "output_tokens",
    "total_tokens",
    "input_tokens_details",
    "output_tokens_details",
    "estimated",
    "cost_in_usd_ticks",
    "server_side_tool_usage_details",
    "server_side_tool_usage"
]);
const RESPONSES_EXTRA_TOP_LEVEL_FIELDS = [
    "server_side_tool_usage_details",
    "server_side_tool_usage",
    "cost_in_usd_ticks"
];
const OMIT_STREAMING_CHUNK_MARKER = "__omniroute_omit_streaming_chunk";
function toRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value;
}
function toString(value) {
    return typeof value === "string" ? value : undefined;
}
function toNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function deleteOpenAICompatibleReasoningFields(record) {
    delete record.reasoning_content;
    delete record.reasoning;
    delete record.reasoning_text;
    delete record.reasoning_details;
}
function stripZeroWidthText(value) {
    return value.replace(/[\u200B-\u200D\uFEFF]/g, "");
}
function stripZeroWidthToolArgumentJson(value) {
    return stripZeroWidthText(typeof value === "string" ? value : JSON.stringify(value || {}));
}
function stripZeroWidthFunctionArguments(functionCall) {
    const fn = toRecord(functionCall);
    if (!fn || typeof fn.arguments !== "string") return functionCall;
    const stripped = stripZeroWidthText(fn.arguments);
    // Fast path: return the original reference when there is nothing to strip, so
    // hot streaming paths avoid a per-chunk shallow clone of every tool call.
    if (stripped === fn.arguments) return functionCall;
    return {
        ...fn,
        arguments: stripped
    };
}
function stripZeroWidthToolCallArguments(toolCall) {
    const tc = toRecord(toolCall);
    if (!tc) return toolCall;
    const fn = stripZeroWidthFunctionArguments(tc.function);
    return fn === tc.function ? toolCall : {
        ...tc,
        function: fn
    };
}
function stripZeroWidthValue(value) {
    if (typeof value === "string") return stripZeroWidthText(value);
    if (Array.isArray(value)) return value.map((item)=>stripZeroWidthValue(item));
    const record = toRecord(value);
    if (record) {
        return Object.fromEntries(Object.entries(record).map(([key, item])=>[
                key,
                stripZeroWidthValue(item)
            ]));
    }
    return value;
}
function findBalancedJsonEnd(text, startIndex) {
    if (startIndex < 0 || startIndex >= text.length || text[startIndex] !== "{") return -1;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for(let index = startIndex; index < text.length; index += 1){
        const char = text[index];
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === "\\") {
                escaped = true;
                continue;
            }
            if (char === '"') {
                inString = false;
            }
            continue;
        }
        if (char === '"') {
            inString = true;
            continue;
        }
        if (char === "{") {
            depth += 1;
            continue;
        }
        if (char === "}") {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
}
function stripInternalToolEnvelopeText(content) {
    let sanitized = stripZeroWidthText(content);
    const markerRegex = /to=(?:functions\.[A-Za-z0-9_.-]+|multi_tool_use\.[A-Za-z0-9_.-]+|[A-Za-z_][A-Za-z0-9_]*)/g;
    while(true){
        const match = markerRegex.exec(sanitized);
        if (!match || match.index < 0) break;
        const searchWindowEnd = Math.min(sanitized.length, match.index + 1200);
        const jsonStart = sanitized.indexOf("{", match.index);
        if (jsonStart < 0 || jsonStart >= searchWindowEnd) {
            sanitized = `${sanitized.slice(0, match.index)}${sanitized.slice(match.index + match[0].length)}`;
            markerRegex.lastIndex = 0;
            continue;
        }
        const jsonEnd = findBalancedJsonEnd(sanitized, jsonStart);
        if (jsonEnd < 0) {
            sanitized = sanitized.slice(0, match.index);
            break;
        }
        const prefix = sanitized.slice(0, match.index).replace(/[ \t]+$/g, "");
        const suffix = sanitized.slice(jsonEnd + 1).replace(/^[ \t]+/g, "");
        sanitized = `${prefix}${suffix}`;
        markerRegex.lastIndex = 0;
    }
    return sanitized.replace(/\n{3,}/g, "\n\n").trim();
}
function parseTextualToolCallContent(content) {
    if (typeof content !== "string") return null;
    const normalized = stripInternalToolEnvelopeText(content);
    const toolCallIndex = normalized.lastIndexOf("[Tool call:");
    if (toolCallIndex < 0) return null;
    const candidate = normalized.slice(toolCallIndex);
    const headerMatch = candidate.match(/^\[Tool call:\s*([^\]\n]+)\]\s*\nArguments:\s*/);
    if (!headerMatch) return null;
    const name = headerMatch[1]?.trim();
    const rawArgs = candidate.slice(headerMatch[0].length).trim();
    if (!name || !rawArgs) return null;
    const decoders = [
        (value)=>value,
        (value)=>{
            if (value.startsWith('"') && value.endsWith('"')) {
                const decoded = JSON.parse(value);
                return typeof decoded === "string" ? decoded : value;
            }
            return value;
        }
    ];
    for (const decode of decoders){
        try {
            const decoded = decode(rawArgs);
            return {
                name,
                args: stripZeroWidthValue(JSON.parse(decoded))
            };
        } catch  {}
    }
    return null;
}
// Matches the exact header format required by parseTextualToolCallContent:
// "[Tool call: name]\nArguments:" (with optional whitespace).  Using the full
// header pattern prevents false positives when the model quotes "[Tool call:"
// in prose, code examples, or terminal output (#3355).
const TEXTUAL_TOOL_CALL_HEADER = /\[Tool call:[^\]\n]+\]\s*\nArguments:/;
function containsTextualToolCallContent(content) {
    return typeof content === "string" && TEXTUAL_TOOL_CALL_HEADER.test(stripInternalToolEnvelopeText(content));
}
function sanitizeOpenAIResponse(body, options = {}) {
    const bodyRecord = toRecord(body);
    if (!bodyRecord) return body;
    const stripReasoning = options.stripReasoning === true;
    const parseTextualReasoningTags = options.parseTextualReasoningTags === true;
    // Build sanitized response with only allowed top-level fields
    const sanitized = {};
    // Ensure required fields exist
    sanitized.id = normalizeResponseId(bodyRecord.id);
    sanitized.object = toString(bodyRecord.object) || "chat.completion";
    sanitized.created = toNumber(bodyRecord.created) ?? Math.floor(Date.now() / 1000);
    sanitized.model = toString(bodyRecord.model) || "unknown";
    // Sanitize choices
    if (Array.isArray(bodyRecord.choices)) {
        sanitized.choices = bodyRecord.choices.map((choice, idx)=>{
            const sanitizedChoice = sanitizeChoice(choice, idx, {
                parseTextualReasoningTags
            });
            const message = toRecord(sanitizedChoice.message);
            if (message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0 && sanitizedChoice.finish_reason !== "tool_calls") {
                sanitizedChoice.finish_reason = "tool_calls";
            }
            if (stripReasoning && message) {
                deleteOpenAICompatibleReasoningFields(message);
            }
            return sanitizedChoice;
        });
    } else {
        sanitized.choices = [];
    }
    // Sanitize usage
    if (bodyRecord.usage !== undefined) {
        sanitized.usage = sanitizeUsage(bodyRecord.usage);
    }
    // Keep system_fingerprint if present (it's a valid OpenAI field)
    if (bodyRecord.system_fingerprint) {
        sanitized.system_fingerprint = bodyRecord.system_fingerprint;
    }
    return sanitized;
}
function sanitizeResponsesApiResponse(body) {
    const bodyRecord = toRecord(body);
    if (!bodyRecord) return body;
    if (Array.isArray(bodyRecord.choices)) {
        return convertOpenAIResponseToResponses(bodyRecord);
    }
    const responseRoot = bodyRecord.object === "response" ? bodyRecord : toRecord(bodyRecord.response ?? bodyRecord) || bodyRecord;
    const sanitized = {
        id: normalizeResponsesId(responseRoot.id),
        object: "response",
        created_at: toNumber(responseRoot.created_at) ?? toNumber(responseRoot.created) ?? Math.floor(Date.now() / 1000),
        model: toString(responseRoot.model) || "unknown",
        status: toString(responseRoot.status) || "completed",
        background: typeof responseRoot.background === "boolean" ? responseRoot.background : false,
        error: responseRoot.error ?? null
    };
    const output = sanitizeResponsesOutput(responseRoot.output);
    // Some upstreams return a shorthand Responses body that carries the answer only
    // in `output_text` with an empty/absent `output[]`. Synthesize a message item so
    // the sanitized response still has usable structured output — otherwise the text
    // is dropped and the response is later flagged malformed (#4942 regression).
    if (output.length === 0 && typeof responseRoot.output_text === "string" && responseRoot.output_text.trim().length > 0) {
        output.push({
            id: "msg_0",
            type: "message",
            role: "assistant",
            content: [
                {
                    type: "output_text",
                    text: responseRoot.output_text.trim()
                }
            ]
        });
    }
    sanitized.output = output;
    const outputText = extractResponsesOutputText(output);
    if (outputText.length > 0) {
        sanitized.output_text = outputText;
    }
    if (responseRoot.usage !== undefined) {
        sanitized.usage = sanitizeResponsesUsage(responseRoot.usage);
    }
    for (const key of RESPONSES_EXTRA_TOP_LEVEL_FIELDS){
        if (responseRoot[key] !== undefined) sanitized[key] = responseRoot[key];
    }
    return sanitized;
}
/**
 * Sanitize a single choice object.
 */ function sanitizeChoice(choice, defaultIndex, options = {}) {
    const choiceRecord = toRecord(choice);
    const sanitized = {
        index: defaultIndex,
        finish_reason: null
    };
    if (choiceRecord?.index !== undefined) {
        sanitized.index = choiceRecord.index;
    }
    if (choiceRecord?.finish_reason !== undefined) {
        sanitized.finish_reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReason"])(choiceRecord.finish_reason);
    }
    if (choiceRecord?.message !== undefined) {
        sanitized.message = sanitizeMessage(choiceRecord.message, options);
    }
    if (choiceRecord?.delta !== undefined) {
        sanitized.delta = sanitizeMessage(choiceRecord.delta, options);
    }
    if (choiceRecord?.logprobs !== undefined) {
        sanitized.logprobs = choiceRecord.logprobs;
    }
    return sanitized;
}
function sanitizeMessageContent(msgRecord, options = {}) {
    if (typeof msgRecord.content === "string") {
        const strippedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(msgRecord.content));
        const nativeReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReadableReasoningValue"])(msgRecord);
        const { content, thinking } = options.parseTextualReasoningTags === true && !nativeReasoning ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractThinkingFromContent"])(strippedContent) : {
            content: strippedContent,
            thinking: null
        };
        const sanitized = {
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(content)
        };
        if (thinking) sanitized.reasoning_content = thinking;
        return sanitized;
    }
    return msgRecord.content !== undefined ? {
        content: msgRecord.content
    } : {};
}
function applyTextualToolCallSanitization(sanitized, msgRecord) {
    const textualToolCall = parseTextualToolCallContent(sanitized.content);
    if (textualToolCall && !msgRecord.tool_calls) {
        sanitized.content = null;
        sanitized.tool_calls = [
            {
                id: `call_${Date.now()}_0`,
                type: "function",
                function: {
                    name: textualToolCall.name,
                    arguments: JSON.stringify(textualToolCall.args || {})
                }
            }
        ];
    } else if (containsTextualToolCallContent(sanitized.content) && !msgRecord.tool_calls) {
        sanitized.content = null;
    }
}
function sanitizeMessage(msg, options = {}) {
    const msgRecord = toRecord(msg);
    if (!msgRecord) return msg;
    const sanitized = {};
    if (msgRecord.role) sanitized.role = msgRecord.role;
    if (msgRecord.refusal !== undefined) sanitized.refusal = msgRecord.refusal;
    Object.assign(sanitized, sanitizeMessageContent(msgRecord, options));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["copyOpenAICompatibleReasoningFields"])(msgRecord, sanitized);
    applyTextualToolCallSanitization(sanitized, msgRecord);
    if (msgRecord.tool_calls) {
        sanitized.tool_calls = Array.isArray(msgRecord.tool_calls) ? msgRecord.tool_calls.map((toolCall)=>stripZeroWidthToolCallArguments(toolCall)) : msgRecord.tool_calls;
    }
    if (msgRecord.function_call) {
        sanitized.function_call = stripZeroWidthFunctionArguments(msgRecord.function_call);
    }
    return sanitized;
}
/**
 * Sanitize usage object — keep only standard fields.
 */ function sanitizeUsage(usage) {
    const usageRecord = toRecord(usage);
    if (!usageRecord) return usage;
    const sanitized = {};
    // Cross-map Claude-style → OpenAI-style field names.
    // Some providers return input_tokens/output_tokens instead of prompt_tokens/completion_tokens.
    // Without this mapping, the whitelist filter below strips them, resulting in NaN/0 tokens (#617).
    if (usageRecord.input_tokens !== undefined && usageRecord.prompt_tokens === undefined) {
        usageRecord.prompt_tokens = usageRecord.input_tokens;
    }
    if (usageRecord.output_tokens !== undefined && usageRecord.completion_tokens === undefined) {
        usageRecord.completion_tokens = usageRecord.output_tokens;
    }
    for (const key of ALLOWED_USAGE_FIELDS){
        if (usageRecord[key] !== undefined) {
            sanitized[key] = usageRecord[key];
        }
    }
    // Ensure required fields
    const promptTokens = toNumber(sanitized.prompt_tokens) ?? 0;
    const completionTokens = toNumber(sanitized.completion_tokens) ?? 0;
    const totalTokens = toNumber(sanitized.total_tokens) ?? promptTokens + completionTokens;
    sanitized.prompt_tokens = promptTokens;
    sanitized.completion_tokens = completionTokens;
    sanitized.total_tokens = totalTokens;
    return sanitized;
}
function sanitizeResponsesUsage(usage) {
    const usageRecord = toRecord(usage);
    if (!usageRecord) return usage;
    const normalized = {
        ...usageRecord
    };
    if (normalized.prompt_tokens !== undefined && normalized.input_tokens === undefined) {
        normalized.input_tokens = normalized.prompt_tokens;
    }
    if (normalized.completion_tokens !== undefined && normalized.output_tokens === undefined) {
        normalized.output_tokens = normalized.completion_tokens;
    }
    if (normalized.prompt_tokens_details !== undefined && normalized.input_tokens_details === undefined) {
        normalized.input_tokens_details = normalized.prompt_tokens_details;
    }
    if (normalized.completion_tokens_details !== undefined && normalized.output_tokens_details === undefined) {
        normalized.output_tokens_details = normalized.completion_tokens_details;
    }
    const inputDetails = toRecord(normalized.input_tokens_details) || {};
    const cachedTokens = normalized.cached_tokens ?? normalized.cache_read_input_tokens;
    if (cachedTokens !== undefined && inputDetails.cached_tokens === undefined) {
        inputDetails.cached_tokens = cachedTokens;
    }
    if (normalized.cache_creation_input_tokens !== undefined && inputDetails.cache_creation_tokens === undefined) {
        inputDetails.cache_creation_tokens = normalized.cache_creation_input_tokens;
    }
    if (Object.keys(inputDetails).length > 0) {
        normalized.input_tokens_details = inputDetails;
    }
    const outputDetails = toRecord(normalized.output_tokens_details) || {};
    if (normalized.reasoning_tokens !== undefined && outputDetails.reasoning_tokens === undefined) {
        outputDetails.reasoning_tokens = normalized.reasoning_tokens;
    }
    if (Object.keys(outputDetails).length > 0) {
        normalized.output_tokens_details = outputDetails;
    }
    const sanitized = {};
    for (const key of ALLOWED_RESPONSES_USAGE_FIELDS){
        if (normalized[key] !== undefined) {
            sanitized[key] = normalized[key];
        }
    }
    const inputTokens = toNumber(sanitized.input_tokens) ?? 0;
    const outputTokens = toNumber(sanitized.output_tokens) ?? 0;
    const totalTokens = toNumber(sanitized.total_tokens) ?? inputTokens + outputTokens;
    sanitized.input_tokens = inputTokens;
    sanitized.output_tokens = outputTokens;
    sanitized.total_tokens = totalTokens;
    return sanitized;
}
/**
 * Normalize response ID to use chatcmpl- prefix.
 */ function normalizeResponseId(id) {
    if (!id || typeof id !== "string") {
        return `chatcmpl-${crypto.randomUUID().replace(/-/g, "").slice(0, 29)}`;
    }
    // Already correct format
    if (id.startsWith("chatcmpl-")) return id;
    // Keep custom IDs but don't break them
    return id;
}
function normalizeResponsesId(id) {
    if (!id || typeof id !== "string") {
        return `resp_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    }
    if (id.startsWith("resp_")) return id;
    return `resp_${id}`;
}
function isResponsesCommentaryMessageItem(item) {
    const itemRecord = toRecord(item);
    if (!itemRecord) return false;
    const type = toString(itemRecord.type) || "message";
    if (type !== "message") return false;
    const role = toString(itemRecord.role) || "assistant";
    const phase = toString(itemRecord.phase);
    return role === "assistant" && phase === "commentary";
}
function sanitizeResponsesStreamingOutputItem(item) {
    const itemRecord = toRecord(item);
    if (!itemRecord) return null;
    const type = toString(itemRecord.type) || "message";
    if (type === "message") {
        const role = toString(itemRecord.role) || "assistant";
        if (isResponsesCommentaryMessageItem(itemRecord)) {
            return null;
        }
        const content = sanitizeResponsesMessageContent(itemRecord.content).filter((part)=>{
            const partRecord = toRecord(part);
            const partPhase = partRecord ? toString(partRecord.phase) : undefined;
            return partPhase !== "commentary";
        });
        if (role === "assistant" && content.length === 0) {
            return null;
        }
        return {
            ...itemRecord,
            type: "message",
            role,
            content
        };
    }
    if (type === "reasoning") {
        const summary = Array.isArray(itemRecord.summary) ? itemRecord.summary.map((part)=>{
            const partRecord = toRecord(part);
            if (!partRecord) return null;
            return {
                ...partRecord,
                type: toString(partRecord.type) || "summary_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(toString(partRecord.text) || ""))
            };
        }).filter((part)=>part !== null) : [];
        return {
            ...itemRecord,
            type: "reasoning",
            summary
        };
    }
    if (type === "function_call") {
        return {
            ...itemRecord,
            type: "function_call",
            arguments: stripZeroWidthToolArgumentJson(itemRecord.arguments)
        };
    }
    if (type === "function_call_output") {
        return {
            ...itemRecord,
            type: "function_call_output",
            output: typeof itemRecord.output === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(itemRecord.output)) : JSON.stringify(itemRecord.output ?? "")
        };
    }
    return {
        ...itemRecord
    };
}
function sanitizeResponsesStreamingOutput(output) {
    if (!Array.isArray(output)) return [];
    return output.map((item)=>sanitizeResponsesStreamingOutputItem(item)).filter((item)=>item !== null);
}
// Native Responses streaming events that carry raw model text directly on the
// root `delta` field. These must get the same zero-width-joiner stripping as the
// non-streaming path so agent words (opencode/cursor/aider) are not corrupted.
// Scoped as an allow-list on purpose: other root `delta` events may carry non-text payloads.
// Function-call argument events are handled separately by stripping only zero-width code points.
const RESPONSES_STREAMING_TEXT_DELTA_EVENTS = new Set([
    "response.output_text.delta",
    "response.reasoning_summary_text.delta",
    "response.reasoning_text.delta"
]);
// Matching `*.done` events that carry the finalized text on the root `text` field.
const RESPONSES_STREAMING_TEXT_DONE_EVENTS = new Set([
    "response.output_text.done",
    "response.reasoning_summary_text.done",
    "response.reasoning_text.done"
]);
function sanitizeResponsesStreamingEvent(parsedRecord) {
    const sanitized = {
        ...parsedRecord
    };
    const eventType = toString(parsedRecord.type) || "";
    // Root-level text events (output_text / reasoning_summary_text / reasoning_text)
    // carry the model text directly on the event, not under item/output. Strip ZWJ
    // there too. Only touch string values and only the allow-listed event types —
    // never function-call argument events.
    if (RESPONSES_STREAMING_TEXT_DELTA_EVENTS.has(eventType) && typeof sanitized.delta === "string") {
        sanitized.delta = stripZeroWidthText(sanitized.delta);
    }
    if (RESPONSES_STREAMING_TEXT_DONE_EVENTS.has(eventType) && typeof sanitized.text === "string") {
        sanitized.text = stripZeroWidthText(sanitized.text);
    }
    if (eventType === "response.function_call_arguments.delta" && typeof sanitized.delta === "string") {
        sanitized.delta = stripZeroWidthText(sanitized.delta);
    }
    if (eventType === "response.function_call_arguments.done" && typeof sanitized.arguments === "string") {
        sanitized.arguments = stripZeroWidthText(sanitized.arguments);
    }
    if (parsedRecord.item !== undefined) {
        const sanitizedItem = sanitizeResponsesStreamingOutputItem(parsedRecord.item);
        if (sanitizedItem) {
            sanitized.item = sanitizedItem;
        } else {
            delete sanitized.item;
            if (eventType === "response.output_item.added" || eventType === "response.output_item.done") {
                sanitized[OMIT_STREAMING_CHUNK_MARKER] = true;
            }
        }
    }
    if (Array.isArray(parsedRecord.output)) {
        const output = sanitizeResponsesStreamingOutput(parsedRecord.output);
        sanitized.output = output;
        const outputText = extractResponsesOutputText(output);
        if (outputText.length > 0) {
            sanitized.output_text = outputText;
        } else {
            delete sanitized.output_text;
        }
    }
    const responseRecord = toRecord(parsedRecord.response);
    if (responseRecord) {
        const responseOutput = Array.isArray(responseRecord.output) ? sanitizeResponsesStreamingOutput(responseRecord.output) : undefined;
        const sanitizedResponse = {
            ...responseRecord,
            ...responseOutput ? {
                output: responseOutput
            } : {}
        };
        const responseOutputText = responseOutput ? extractResponsesOutputText(responseOutput) : "";
        if (responseOutputText.length > 0) {
            sanitizedResponse.output_text = responseOutputText;
        } else {
            delete sanitizedResponse.output_text;
        }
        sanitized.response = sanitizedResponse;
    }
    return sanitized;
}
function sanitizeResponsesOutput(output) {
    if (!Array.isArray(output)) return [];
    return output.map((item, index)=>sanitizeResponsesOutputItem(item, index)).filter((item)=>item !== null);
}
function sanitizeResponsesOutputItem(item, index) {
    const itemRecord = toRecord(item);
    if (!itemRecord) return null;
    const type = toString(itemRecord.type) || "message";
    if (type === "message") {
        const content = sanitizeResponsesMessageContent(itemRecord.content);
        const sanitized = {
            id: toString(itemRecord.id) || `msg_${index}`,
            type: "message",
            role: toString(itemRecord.role) || "assistant",
            content
        };
        return sanitized;
    }
    if (type === "reasoning") {
        const summary = Array.isArray(itemRecord.summary) ? itemRecord.summary.map((part)=>{
            const partRecord = toRecord(part);
            if (!partRecord) return null;
            return {
                type: toString(partRecord.type) || "summary_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(toString(partRecord.text) || "")
            };
        }).filter((part)=>part !== null) : [];
        return {
            id: toString(itemRecord.id) || `rs_${index}`,
            type: "reasoning",
            summary
        };
    }
    if (type === "function_call") {
        const callId = toString(itemRecord.call_id) || toString(itemRecord.id) || `call_${index}`;
        return {
            id: toString(itemRecord.id) || `fc_${callId}`,
            type: "function_call",
            call_id: callId,
            name: toString(itemRecord.name) || "",
            arguments: stripZeroWidthToolArgumentJson(itemRecord.arguments)
        };
    }
    if (type === "function_call_output") {
        return {
            id: toString(itemRecord.id) || `fco_${toString(itemRecord.call_id) || index}`,
            type: "function_call_output",
            call_id: toString(itemRecord.call_id) || "",
            output: itemRecord.output ?? ""
        };
    }
    return {
        ...itemRecord,
        type
    };
}
function sanitizeResponsesMessageContent(content) {
    if (typeof content === "string") {
        if (content.length === 0) return [];
        return [
            {
                type: "output_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(content))),
                annotations: []
            }
        ];
    }
    if (!Array.isArray(content)) return [];
    return content.map((part)=>{
        const partRecord = toRecord(part);
        if (!partRecord) {
            if (typeof part === "string") {
                return {
                    type: "output_text",
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(part))),
                    annotations: []
                };
            }
            return null;
        }
        const partType = toString(partRecord.type);
        if (partType === "output_text" || partType === "text" || (partType === undefined || partType === "") && typeof partRecord.text === "string") {
            return {
                ...partRecord,
                type: "output_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(toString(partRecord.text) || ""))),
                annotations: Array.isArray(partRecord.annotations) ? partRecord.annotations : []
            };
        }
        return {
            ...partRecord
        };
    }).filter((part)=>part !== null);
}
function extractResponsesOutputText(output) {
    const parts = [];
    for (const item of output){
        if (item.type !== "message" || !Array.isArray(item.content)) continue;
        for (const part of item.content){
            const partRecord = toRecord(part);
            if (!partRecord) continue;
            if ((partRecord.type === "output_text" || partRecord.type === "text") && typeof partRecord.text === "string" && partRecord.text.length > 0) {
                parts.push(partRecord.text);
            }
        }
    }
    return parts.join("");
}
function convertOpenAIResponseToResponses(openaiResponse) {
    const responseId = normalizeResponsesId(openaiResponse.id);
    const createdAt = toNumber(openaiResponse.created) ?? Math.floor(Date.now() / 1000);
    const model = toString(openaiResponse.model) || "unknown";
    const choice = Array.isArray(openaiResponse.choices) ? toRecord(openaiResponse.choices[0]) ?? {} : {};
    const message = toRecord(choice.message) || {};
    const output = [];
    const reasoningContent = toString(message.reasoning_content) || (typeof message.reasoning === "string" ? message.reasoning : "");
    if (reasoningContent) {
        output.push({
            id: `rs_${responseId}_0`,
            type: "reasoning",
            summary: [
                {
                    type: "summary_text",
                    text: reasoningContent
                }
            ]
        });
    }
    const hasToolCalls = Array.isArray(message.tool_calls) && message.tool_calls.length > 0;
    const messageContent = sanitizeResponsesMessageContent(message.content);
    if (messageContent.length > 0 || !hasToolCalls && !reasoningContent) {
        output.push({
            id: `msg_${responseId}_0`,
            type: "message",
            role: toString(message.role) || "assistant",
            content: messageContent.length > 0 ? messageContent : [
                {
                    type: "output_text",
                    text: "",
                    annotations: []
                }
            ]
        });
    }
    const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : message.function_call ? [
        {
            id: toString(choice.id) || "call_0",
            type: "function",
            function: message.function_call
        }
    ] : [];
    for(let index = 0; index < toolCalls.length; index += 1){
        const toolCall = toRecord(toolCalls[index]) || {};
        const fn = toRecord(toolCall.function) || {};
        const callId = toString(toolCall.id) || `call_${index}`;
        output.push({
            id: `fc_${callId}`,
            type: "function_call",
            call_id: callId,
            name: toString(fn.name) || "",
            arguments: stripZeroWidthToolArgumentJson(fn.arguments)
        });
    }
    const sanitized = {
        id: responseId,
        object: "response",
        created_at: createdAt,
        model,
        status: "completed",
        background: false,
        error: null,
        output
    };
    const outputText = extractResponsesOutputText(output);
    if (outputText.length > 0) {
        sanitized.output_text = outputText;
    }
    if (openaiResponse.usage !== undefined) {
        sanitized.usage = sanitizeResponsesUsage(openaiResponse.usage);
    }
    return sanitized;
}
function sanitizeStreamingChunk(parsed) {
    const parsedRecord = toRecord(parsed);
    if (!parsedRecord) return parsed;
    const eventType = toString(parsedRecord.type) || "";
    if (eventType.startsWith("response.") || parsedRecord.object === "response") {
        return sanitizeResponsesStreamingEvent(parsedRecord);
    }
    // #8271: Anthropic-native streaming events (content_block_delta with
    // text_delta / thinking_delta) bypass the OpenAI choices[].delta.content
    // path below. Strip zero-width characters from their text payloads so
    // U+200D and friends don't leak to the client on the Messages API.
    if (eventType === "content_block_delta") {
        const deltaRecord = toRecord(parsedRecord.delta);
        if (deltaRecord) {
            if (typeof deltaRecord.text === "string") {
                deltaRecord.text = stripZeroWidthText(deltaRecord.text);
            }
            if (typeof deltaRecord.thinking === "string") {
                deltaRecord.thinking = stripZeroWidthText(deltaRecord.thinking);
            }
        }
        return parsedRecord;
    }
    // Build sanitized chunk
    const sanitized = {};
    // Keep only standard fields — normalize id to string to avoid AI_InvalidResponseDataError
    if (parsedRecord.id !== undefined && parsedRecord.id !== null) {
        sanitized.id = normalizeResponseId(typeof parsedRecord.id === "string" ? parsedRecord.id : String(parsedRecord.id));
    }
    sanitized.object = toString(parsedRecord.object) || "chat.completion.chunk";
    if (parsedRecord.created !== undefined) sanitized.created = parsedRecord.created;
    if (parsedRecord.model !== undefined) sanitized.model = parsedRecord.model;
    // Sanitize choices with delta
    if (Array.isArray(parsedRecord.choices)) {
        sanitized.choices = parsedRecord.choices.map((choice)=>{
            const c = {
                index: 0
            };
            const choiceRecord = toRecord(choice);
            if (!choiceRecord) return c;
            c.index = toNumber(choiceRecord.index) ?? 0;
            if (choiceRecord.delta !== undefined) {
                const deltaRecord = toRecord(choiceRecord.delta);
                if (deltaRecord) {
                    const delta = {};
                    if (deltaRecord.role !== undefined) delta.role = deltaRecord.role;
                    if (deltaRecord.content !== undefined) {
                        delta.content = typeof deltaRecord.content === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(deltaRecord.content)) : deltaRecord.content;
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["copyOpenAICompatibleReasoningFields"])(deltaRecord, delta);
                    // Parity with the non-streaming path: strip the zero-width joiners that the
                    // request side injects into agent words. copyOpenAICompatibleReasoningFields
                    // is shared, so strip locally on the fields it writes (string values only).
                    for (const reasoningKey of [
                        "reasoning_content",
                        "reasoning",
                        "reasoning_text"
                    ]){
                        if (typeof delta[reasoningKey] === "string") {
                            delta[reasoningKey] = stripZeroWidthText(delta[reasoningKey]);
                        }
                    }
                    if (deltaRecord.tool_calls !== undefined) {
                        delta.tool_calls = Array.isArray(deltaRecord.tool_calls) ? deltaRecord.tool_calls.map((tc)=>{
                            const t = toRecord(tc);
                            if (!t) return tc;
                            const strippedToolCall = stripZeroWidthToolCallArguments(t);
                            const strippedRecord = toRecord(strippedToolCall) || t;
                            if (t.id !== undefined && t.id !== null && typeof t.id !== "string") {
                                return {
                                    ...strippedRecord,
                                    id: String(t.id)
                                };
                            }
                            return strippedRecord;
                        }) : deltaRecord.tool_calls;
                    }
                    if (deltaRecord.function_call !== undefined) delta.function_call = stripZeroWidthFunctionArguments(deltaRecord.function_call);
                    c.delta = delta;
                } else {
                    c.delta = choiceRecord.delta;
                }
            }
            if (choiceRecord.finish_reason !== undefined) {
                c.finish_reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReason"])(choiceRecord.finish_reason);
            }
            if (choiceRecord.logprobs !== undefined) c.logprobs = choiceRecord.logprobs;
            return c;
        });
    }
    // Sanitize usage if present
    if (parsedRecord.usage !== undefined) {
        sanitized.usage = sanitizeUsage(parsedRecord.usage);
    }
    // Keep system_fingerprint if present
    if (parsedRecord.system_fingerprint) {
        sanitized.system_fingerprint = parsedRecord.system_fingerprint;
    }
    return sanitized;
}
}),
"[project]/open-sse/handlers/embeddingStructuredInput.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "hasStructuredEmbeddingInput",
    ()=>hasStructuredEmbeddingInput,
    "prepareStructuredEmbeddingRequest",
    ()=>prepareStructuredEmbeddingRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/validation/schemas/apiV1.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const AGGREGATE_SIZE_ERROR = "decoded inline media must not exceed 16 MiB per request";
function isStructuredItem(value) {
    return typeof value === "object" && value !== null && "type" in value;
}
function hasStructuredEmbeddingInput(input) {
    return Array.isArray(input) && input.some(isStructuredItem);
}
async function sourceToInlineData(item, fetchMedia) {
    if (item.source.type === "base64") {
        return {
            data: item.source.data,
            mediaType: item.source.media_type
        };
    }
    const fetched = await fetchMedia(item.source.url);
    if (!fetched.contentType) {
        throw new Error("Remote embedding media must include a Content-Type header");
    }
    return {
        data: fetched.buffer.toString("base64"),
        mediaType: fetched.contentType
    };
}
/**
 * Resolve every non-text item's inline data SEQUENTIALLY (not `Promise.all`),
 * enforcing the documented "16 MiB decoded per request" cap across ALL
 * sources — base64 AND fetched URLs.
 *
 * The Zod schema (`embeddingMultimodalInputSchema.superRefine` in
 * `src/shared/validation/schemas/apiV1.ts`) only sums base64-sourced items
 * before this handler ever runs — URL-sourced items are excluded from that
 * aggregate there. Each URL item is individually capped at 8 MiB via
 * `fetchRemoteImage(url, { maxBytes: MAX_EMBEDDING_INLINE_ITEM_BYTES })`, but
 * fetching all up to 32 items concurrently could otherwise pull ~256 MiB into
 * memory at once — 16x past the documented per-request bound. Processing
 * items one at a time and checking a running byte budget after every fetch
 * closes that gap: at most one URL fetch is ever in flight, and no further
 * URL fetch is started once the aggregate budget is already exhausted.
 */ async function resolveInlineItems(items, fetchMedia) {
    const results = [];
    let remainingBytes = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MAX_EMBEDDING_INLINE_TOTAL_BYTES"];
    for (const item of items){
        if (item.type === "text") {
            results.push({
                item,
                inline: null
            });
            continue;
        }
        if (item.source.type === "url" && remainingBytes <= 0) {
            throw new Error(AGGREGATE_SIZE_ERROR);
        }
        const { data, mediaType } = await sourceToInlineData(item, fetchMedia);
        const decodedBytes = Buffer.byteLength(data, "base64");
        if (decodedBytes > remainingBytes) {
            throw new Error(AGGREGATE_SIZE_ERROR);
        }
        remainingBytes -= decodedBytes;
        results.push({
            item,
            inline: {
                data,
                mediaType
            }
        });
    }
    return results;
}
async function prepareJinaInput(items, fetchMedia) {
    const resolved = await resolveInlineItems(items, fetchMedia);
    return resolved.map(({ item, inline })=>{
        if (item.type === "text") return {
            text: item.text
        };
        const key = item.type === "document" ? "pdf" : item.type;
        return {
            [key]: `data:${inline.mediaType};base64,${inline.data}`
        };
    });
}
function mapGeminiTaskType(value) {
    if (value === "retrieval.query") return "RETRIEVAL_QUERY";
    if (value === "retrieval.passage") return "RETRIEVAL_DOCUMENT";
    return value;
}
async function prepareGeminiParts(items, fetchMedia) {
    const resolved = await resolveInlineItems(items, fetchMedia);
    return resolved.map(({ item, inline })=>{
        if (item.type === "text") return {
            text: item.text
        };
        return {
            inline_data: {
                mime_type: inline.mediaType,
                data: inline.data
            }
        };
    });
}
function normalizeGeminiResponse(data) {
    const embedding = data.embedding;
    return {
        object: "list",
        data: [
            {
                object: "embedding",
                embedding: embedding?.values ?? [],
                index: 0
            }
        ],
        usage: {
            prompt_tokens: 0,
            total_tokens: 0
        }
    };
}
async function prepareStructuredEmbeddingRequest(provider, model, body, token, options) {
    const items = body.input;
    if (provider.structuredInputProtocol === "jina-v1") {
        return {
            url: provider.baseUrl,
            body: {
                ...body,
                model,
                input: await prepareJinaInput(items, options.fetchMedia)
            }
        };
    }
    if (provider.structuredInputProtocol === "gemini-embed-content") {
        const parts = await prepareGeminiParts(items, options.fetchMedia);
        const request = {
            content: {
                parts
            }
        };
        if (body.dimensions !== undefined) request.output_dimensionality = body.dimensions;
        if (body.task !== undefined) request.task_type = mapGeminiTaskType(body.task);
        return {
            url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent`,
            body: request,
            authHeader: {
                name: "x-goog-api-key",
                value: token
            },
            normalizeResponse: normalizeGeminiResponse
        };
    }
    throw new Error(`Provider ${provider.id} has no structured embedding input translator`);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/embeddings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleEmbedding",
    ()=>handleEmbedding
]);
/**
 * Embedding Handler
 *
 * Handles POST /v1/embeddings requests.
 * Proxies to upstream embedding providers using OpenAI-compatible format.
 *
 * Request format (OpenAI-compatible):
 * {
 *   "model": "nebius/Qwen/Qwen3-Embedding-8B",
 *   "input": "text" | ["text1", "text2"],
 *   "dimensions": 4096,       // optional
 *   "encoding_format": "float" // optional
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/requestLogger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/detailedLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$upstreamError$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/upstreamError.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$upstreamResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/upstreamResponseHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/remoteImageFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddingStructuredInput$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/embeddingStructuredInput.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/validation/schemas/apiV1.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddingStructuredInput$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddingStructuredInput$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
 * Flatten a single embedding item's vector to the OpenAI-spec `number[]` shape.
 *
 * Some OpenAI-compatible embedding backends — notably a llama.cpp
 * `llama-server --embedding --pooling ...` instance — return each vector wrapped in one
 * extra array level: `[[...floats]]` instead of `[...floats]` for a single input. That
 * extra level is silently spec-breaking, since a standard OpenAI-SDK consumer reading
 * `response.data[i].embedding` gets a length-1 array holding the real vector instead of
 * the vector itself. Unwrap only that single redundant level; vectors that are already
 * flat (or genuinely multi-row) are left untouched. See issue #9089.
 */ function flattenSingleRowEmbedding(item) {
    if (!item || typeof item !== "object" || !("embedding" in item)) return;
    const record = item;
    const embedding = record.embedding;
    if (Array.isArray(embedding) && embedding.length === 1 && Array.isArray(embedding[0]) && typeof embedding[0][0] === "number") {
        record.embedding = embedding[0];
    }
}
async function handleEmbedding({ body, credentials, log, resolvedProvider = null, resolvedModel = null, clientRawRequest = null, apiKeyId = null, apiKeyName = null, connectionId = null }) {
    // Use pre-resolved provider/model from route handler if available (supports dynamic provider_nodes).
    let provider;
    let model;
    let providerConfig;
    if (resolvedProvider) {
        provider = resolvedProvider.id;
        model = resolvedModel;
        providerConfig = resolvedProvider;
    } else {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseEmbeddingModel"])(body.model);
        provider = parsed.provider;
        model = parsed.model;
        providerConfig = provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEmbeddingProvider"])(provider) : null;
    }
    const startTime = Date.now();
    // Set up request logger for pipeline artifact capture
    const detailedLoggingEnabled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDetailedLoggingEnabled"])();
    const captureStreamChunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogPipelineCaptureStreamChunks"])();
    const reqLogger = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createRequestLogger"])(provider || "openai", "openai", body.model, {
        enabled: detailedLoggingEnabled,
        captureStreamChunks,
        connectionId: connectionId || undefined,
        model: model || body.model,
        provider: provider || undefined
    });
    // Log client raw request
    if (clientRawRequest) {
        reqLogger.logClientRawRequest(clientRawRequest.endpoint, clientRawRequest.body, clientRawRequest.headers);
    }
    // Summarized request body for call log (avoid storing large embedding input arrays)
    const logRequestBody = {
        model: body.model,
        input_count: Array.isArray(body.input) ? body.input.length : 1,
        dimensions: body.dimensions || undefined
    };
    if (!provider) {
        return {
            success: false,
            status: 400,
            error: `Invalid embedding model: ${body.model}. Use format: provider/model`
        };
    }
    if (!providerConfig) {
        return {
            success: false,
            status: 400,
            error: `Unknown embedding provider: ${provider}`
        };
    }
    const structuredItems = Array.isArray(body.input) ? body.input.filter((item)=>typeof item === "object" && item !== null && "type" in item) : [];
    if (structuredItems.length > 0) {
        const supportedModalities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEmbeddingModelModalities"])(providerConfig, model);
        if (!supportedModalities) {
            return {
                success: false,
                status: 400,
                error: `Embedding model ${body.model} does not advertise structured embedding input support`
            };
        }
        const unsupported = structuredItems.find((item)=>!supportedModalities.includes(item.type));
        if (unsupported) {
            return {
                success: false,
                status: 400,
                error: `Embedding model ${body.model} does not support ${unsupported.type} input`
            };
        }
    }
    // Build upstream request — start with standard fields, then forward extra fields
    // the client sent (e.g. input_type, user, truncate for NVIDIA NIM asymmetric models).
    const KNOWN_FIELDS = new Set([
        "model",
        "input",
        "dimensions",
        "encoding_format"
    ]);
    let upstreamBody = {
        model: model,
        input: body.input
    };
    if (body.dimensions !== undefined) upstreamBody.dimensions = body.dimensions;
    if (body.encoding_format !== undefined) upstreamBody.encoding_format = body.encoding_format;
    for (const [key, value] of Object.entries(body)){
        if (!KNOWN_FIELDS.has(key) && value !== undefined) {
            upstreamBody[key] = value;
        }
    }
    // Gemini embedding models (gemini-embedding-001 / -2-preview / text-embedding-004)
    // default to 3072-dim vectors. Clients targeting pgvector-style schemas typically
    // request a smaller size (e.g. 1536) via OpenAI's `dimensions` field, but Google's
    // OpenAI-compatibility shim at /v1beta/openai/embeddings does not document the
    // `dimensions` → `outputDimensionality` translation. Mirror the request value into
    // the Gemini-native `outputDimensionality` field so the upstream actually returns
    // the requested vector size. Ported from upstream decolua/9router#1366.
    if (provider === "gemini" && upstreamBody.outputDimensionality === undefined) {
        const outputDimensionality = Number(body.dimensions);
        if (Number.isFinite(outputDimensionality) && outputDimensionality > 0) {
            upstreamBody.outputDimensionality = outputDimensionality;
        }
    }
    // Inject model-level default params (e.g. NVIDIA NIM asymmetric models require
    // `input_type`) only for keys the client did not already supply, so a
    // client-sent value is never overwritten. Symmetric models carry no defaults
    // and are unaffected. See issue #1378.
    const defaultParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEmbeddingModelDefaultParams"])(providerConfig, model);
    if (defaultParams) {
        for (const [key, value] of Object.entries(defaultParams)){
            if (upstreamBody[key] === undefined) {
                upstreamBody[key] = value;
            }
        }
    }
    let upstreamUrl = providerConfig.baseUrl;
    if (provider === "ollama-local") {
        const configuredBaseUrl = credentials?.providerSpecificData?.baseUrl;
        const rawBaseUrl = typeof configuredBaseUrl === "string" && configuredBaseUrl.trim().length > 0 ? configuredBaseUrl : providerConfig.baseUrl;
        // Use the shared O(n) helper instead of `/\/+$/` — that regex is
        // vulnerable to polynomial backtracking on adversarial input
        // (CodeQL js/polynomial-redos) since baseUrl is operator-configured
        // per-connection data. See open-sse/utils/urlSanitize.ts.
        const normalizedBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(rawBaseUrl.trim());
        const ollamaHost = normalizedBaseUrl.replace(/\/v1\/(?:chat\/completions|embeddings)$/i, "").replace(/\/api\/chat$/i, "").replace(/\/v1$/i, "");
        upstreamUrl = `${ollamaHost}/v1/embeddings`;
    }
    let normalizeProviderResponse = null;
    // Build headers
    const headers = {
        "Content-Type": "application/json"
    };
    // Skip credential injection for local providers (authType: "none")
    const token = providerConfig.authType === "none" ? null : credentials?.apiKey || credentials?.accessToken;
    if (token) {
        if (providerConfig.authHeader === "bearer") {
            headers["Authorization"] = `Bearer ${token}`;
        } else if (providerConfig.authHeader === "x-api-key") {
            headers["x-api-key"] = token;
        }
    } else if (providerConfig.authType !== "none") {
        return {
            success: false,
            status: 401,
            error: `No valid authentication token for provider ${provider}. Check provider credentials.`
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddingStructuredInput$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasStructuredEmbeddingInput"])(body.input)) {
        if (!model) {
            return {
                success: false,
                status: 400,
                error: `Invalid embedding model: ${body.model}. Use format: provider/model`
            };
        }
        try {
            const prepared = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddingStructuredInput$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareStructuredEmbeddingRequest"])(providerConfig, model, body, token ?? "", {
                fetchMedia: async (url)=>{
                    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(url, {
                        guard: "public-only",
                        maxBytes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$apiV1$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MAX_EMBEDDING_INLINE_ITEM_BYTES"],
                        pinDns: true
                    });
                    return {
                        buffer: result.buffer,
                        contentType: result.contentType || null
                    };
                }
            });
            upstreamBody = prepared.body;
            upstreamUrl = prepared.url;
            normalizeProviderResponse = prepared.normalizeResponse ?? null;
            if (prepared.authHeader) {
                delete headers.Authorization;
                delete headers["x-api-key"];
                headers[prepared.authHeader.name] = prepared.authHeader.value;
            }
        } catch (error) {
            return {
                success: false,
                status: 400,
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)
            };
        }
    }
    if (log) {
        log.info("EMBED", `${provider}/${model} | input: ${Array.isArray(body.input) ? body.input.length + " items" : "1 item"}`);
    }
    try {
        // Quota share enforcement (fail-open: errors allow the request through)
        if (apiKeyId && connectionId && provider) {
            try {
                const { enforceQuotaShare } = await __turbopack_context__.A("[project]/src/lib/quota/enforce.ts [instrumentation] (ecmascript, async loader)");
                const quotaDecision = await enforceQuotaShare({
                    apiKeyId,
                    connectionId,
                    provider,
                    // Per-(key,model) cap — resolved embedding model id (same scope used in logs/routing).
                    model: model || undefined
                });
                if (quotaDecision.kind === "block") {
                    return {
                        success: false,
                        status: quotaDecision.httpStatus ?? 429,
                        error: quotaDecision.reason || "Quota share limit reached"
                    };
                }
            } catch  {
            // fail-open per B16
            }
        }
        // Log provider request
        reqLogger.logTargetRequest(upstreamUrl, headers, upstreamBody);
        const response = await fetch(upstreamUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) {
                log.error("EMBED", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            }
            // Log provider response
            reqLogger.logProviderResponse(response.status, "", response.headers, errorText.slice(0, 500));
            // Build client error response
            const clientErrorBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$upstreamError$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toJsonErrorPayload"])(errorText.slice(0, 500), "Embedding provider error");
            reqLogger.logConvertedResponse(clientErrorBody);
            const pipelinePayloads = detailedLoggingEnabled ? reqLogger.getPipelinePayloads() : null;
            // Save error call log for Logger panel
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/embeddings",
                status: response.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500),
                requestBody: logRequestBody,
                pipelinePayloads,
                apiKeyId,
                apiKeyName,
                connectionId
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: errorText,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$upstreamResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripStaleEncodingHeaders"])(response.headers)
            };
        }
        const rawData = await response.json();
        const data = normalizeProviderResponse ? normalizeProviderResponse(rawData) : rawData;
        // Log provider response
        reqLogger.logProviderResponse(response.status, "", response.headers, data);
        // OpenAI-spec compliance (#9089): each item's `embedding` must be a flat number[].
        // Some OpenAI-compatible backends (e.g. a llama.cpp `llama-server --embedding`
        // instance) return the vector wrapped in one extra array level — `[[...floats]]`
        // instead of `[...floats]` — for a single input, which silently breaks any standard
        // OpenAI-SDK consumer doing `response.data[i].embedding`. Flatten that one redundant
        // level without touching providers that already return flat vectors.
        const responseItems = data.data || data;
        if (Array.isArray(responseItems)) {
            for (const item of responseItems){
                flattenSingleRowEmbedding(item);
            }
        }
        // Normalize response to OpenAI format
        const normalizedResponse = {
            object: "list",
            data: data.data || data,
            model: `${provider}/${model}`,
            usage: data.usage || {
                prompt_tokens: 0,
                total_tokens: 0
            }
        };
        // Log client response
        reqLogger.logConvertedResponse(normalizedResponse);
        const pipelinePayloads = detailedLoggingEnabled ? reqLogger.getPipelinePayloads() : null;
        // Save success call log for Logger panel
        // Embeddings only have input tokens (prompt_tokens + total_tokens), no output/completion tokens
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/embeddings",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            tokens: {
                prompt_tokens: data.usage?.prompt_tokens || data.usage?.total_tokens || 0,
                completion_tokens: 0
            },
            requestBody: logRequestBody,
            responseBody: {
                usage: data.usage || null,
                object: "list",
                data_count: Array.isArray(data.data) ? data.data.length : 0
            },
            pipelinePayloads,
            apiKeyId,
            apiKeyName,
            connectionId
        }).catch(()=>{});
        // Record quota consumption (fire-and-forget, never blocks)
        if (apiKeyId && connectionId && provider) {
            try {
                const { scheduleRecordConsumption } = await __turbopack_context__.A("[project]/src/lib/quota/spendRecorder.ts [instrumentation] (ecmascript, async loader)");
                scheduleRecordConsumption({
                    apiKeyId,
                    connectionId,
                    provider,
                    // Per-(key,model) cap accounting — same resolved model id used at enforce time.
                    model: model || undefined,
                    cost: {
                        tokens: data.usage?.prompt_tokens || data.usage?.total_tokens || 0,
                        requests: 1
                    }
                });
            } catch  {
            // fail-open per B29
            }
        }
        return {
            success: true,
            data: normalizedResponse,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$upstreamResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripStaleEncodingHeaders"])(response.headers)
        };
    } catch (err) {
        if (log) {
            log.error("EMBED", `${provider} fetch error: ${err.message}`);
        }
        // Log error
        reqLogger.logError(err, upstreamBody);
        const pipelinePayloads = detailedLoggingEnabled ? reqLogger.getPipelinePayloads() : null;
        // Save exception call log for Logger panel
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/embeddings",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message,
            requestBody: logRequestBody,
            pipelinePayloads,
            apiKeyId,
            apiKeyName,
            connectionId
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Embedding provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/usageExtractor.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extract usage from non-streaming response body
 * Handles different provider response formats
 */ __turbopack_context__.s([
    "extractUsageFromResponse",
    ()=>extractUsageFromResponse
]);
function extractUsageFromResponse(responseBody, provider) {
    if (!responseBody || typeof responseBody !== "object") return null;
    const providerId = typeof provider === "string" ? provider.toLowerCase() : "";
    const isClaudeProvider = providerId === "claude" || providerId === "anthropic" || providerId.startsWith("anthropic-compatible");
    // OpenAI format (has prompt_tokens / completion_tokens)
    if (responseBody.usage && typeof responseBody.usage === "object" && responseBody.usage.prompt_tokens !== undefined) {
        return {
            prompt_tokens: responseBody.usage.prompt_tokens || 0,
            completion_tokens: responseBody.usage.completion_tokens || 0,
            // DeepSeek native API uses flat prompt_cache_hit_tokens (NOT
            // prompt_tokens_details.cached_tokens). Fall back to it so V4 cache
            // gets surfaced into kanban call_logs alongside the OpenAI/Claude paths.
            cached_tokens: responseBody.usage.prompt_tokens_details?.cached_tokens ?? responseBody.usage.input_tokens_details?.cached_tokens ?? responseBody.usage.prompt_cache_hit_tokens ?? responseBody.usage.cached_tokens,
            reasoning_tokens: responseBody.usage.completion_tokens_details?.reasoning_tokens ?? responseBody.usage.output_tokens_details?.reasoning_tokens ?? responseBody.usage.reasoning_tokens,
            // xAI's exact provider-reported cost (port of decolua/9router#2453, capability A —
            // @ryanngit). Only set the key when present so non-xAI OpenAI-shaped usage
            // (Codex, DeepSeek, etc.) is unaffected. Ticks → USD conversion happens in
            // costCalculator.ts, not here.
            ...typeof responseBody.usage.cost_in_usd_ticks === "number" && Number.isFinite(responseBody.usage.cost_in_usd_ticks) && responseBody.usage.cost_in_usd_ticks >= 0 ? {
                cost_in_usd_ticks: responseBody.usage.cost_in_usd_ticks
            } : {}
        };
    }
    // Claude format
    if (isClaudeProvider && responseBody.usage && typeof responseBody.usage === "object" && (responseBody.usage.input_tokens !== undefined || responseBody.usage.output_tokens !== undefined)) {
        const inputTokens = responseBody.usage.input_tokens || 0;
        const cacheRead = responseBody.usage.cache_read_input_tokens || 0;
        const cacheCreation = responseBody.usage.cache_creation_input_tokens || 0;
        // Total prompt tokens = input + cache_read + cache_creation (per Claude API docs)
        const promptTokens = inputTokens + cacheRead + cacheCreation;
        return {
            prompt_tokens: promptTokens,
            completion_tokens: responseBody.usage.output_tokens || 0,
            cache_read_input_tokens: cacheRead,
            cache_creation_input_tokens: cacheCreation,
            ...typeof responseBody.usage.output_tokens_details?.thinking_tokens === "number" ? {
                reasoning_tokens: responseBody.usage.output_tokens_details.thinking_tokens
            } : {}
        };
    }
    // OpenAI Responses API format (input_tokens / output_tokens)
    const responsesUsage = responseBody.response?.usage || responseBody.usage;
    if (responsesUsage && typeof responsesUsage === "object" && (responsesUsage.input_tokens !== undefined || responsesUsage.output_tokens !== undefined)) {
        return {
            prompt_tokens: responsesUsage.input_tokens || 0,
            completion_tokens: responsesUsage.output_tokens || 0,
            cache_read_input_tokens: responsesUsage.cache_read_input_tokens,
            cached_tokens: responsesUsage.input_tokens_details?.cached_tokens ?? responsesUsage.prompt_tokens_details?.cached_tokens ?? responsesUsage.cache_read_input_tokens,
            cache_creation_input_tokens: responsesUsage.cache_creation_input_tokens,
            reasoning_tokens: responsesUsage.output_tokens_details?.reasoning_tokens ?? responsesUsage.completion_tokens_details?.reasoning_tokens ?? responsesUsage.reasoning_tokens
        };
    }
    // Gemini format
    if (responseBody.usageMetadata && typeof responseBody.usageMetadata === "object") {
        // Gemini reports thoughts outside candidates. Fold them into completion so
        // every provider keeps reasoning as a subset of completion tokens.
        const thoughts = responseBody.usageMetadata.thoughtsTokenCount || 0;
        return {
            prompt_tokens: responseBody.usageMetadata.promptTokenCount || 0,
            completion_tokens: (responseBody.usageMetadata.candidatesTokenCount || 0) + thoughts,
            reasoning_tokens: thoughts
        };
    }
    return null;
}
}),
"[project]/open-sse/handlers/responseTranslator.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translateNonStreamingResponse",
    ()=>translateNonStreamingResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/textualToolCall.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function firstPositiveNumber(...values) {
    for (const value of values){
        const parsed = toNumber(value, 0);
        if (parsed > 0) {
            return parsed;
        }
    }
    return 0;
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
function parseTextualToolCall(text) {
    if (typeof text !== "string") return null;
    // Gemini/Antigravity sometimes imitates the request-side fallback with small
    // variations, e.g. a leading "(empty)" marker or zero-width chars inserted
    // into argument strings. Normalize those variants before parsing so the
    // response is still surfaced as a structured OpenAI tool call.
    const normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const match = normalized.match(/^[\s\S]*?\[Tool call:\s*([^\]\n]+)\]\s*\nArguments:\s*([\s\S]+?)\s*$/);
    if (!match) return null;
    const name = match[1]?.trim();
    const rawArgs = match[2]?.trim();
    if (!name || !rawArgs) return null;
    try {
        let args = JSON.parse(rawArgs);
        if (typeof args === "string") {
            const trimmed = args.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                args = JSON.parse(trimmed);
            }
        }
        if (args && typeof args === "object" && !Array.isArray(args)) {
            return {
                name,
                args
            };
        }
    } catch  {}
    return null;
}
function extractMessageOutputText(item) {
    if (!Array.isArray(item.content)) return "";
    let text = "";
    for (const part of item.content){
        if (!part || typeof part !== "object") continue;
        const partObj = toRecord(part);
        if (partObj.type === "output_text" && typeof partObj.text === "string") {
            text += partObj.text;
        }
    }
    return text;
}
/**
 * T19: Pick the last non-empty message output text from Responses API output.
 * Falls back to the last message item even when all message texts are empty.
 */ function findBestMessageText(output) {
    const messageItems = output.map((item)=>toRecord(item)).filter((item)=>item.type === "message" && Array.isArray(item.content));
    for(let i = messageItems.length - 1; i >= 0; i -= 1){
        const text = extractMessageOutputText(messageItems[i]);
        if (text.trim().length > 0) {
            return {
                text,
                selectedMessageIndex: i,
                messageItems
            };
        }
    }
    if (messageItems.length > 0) {
        const lastIndex = messageItems.length - 1;
        return {
            text: extractMessageOutputText(messageItems[lastIndex]),
            selectedMessageIndex: lastIndex,
            messageItems
        };
    }
    return {
        text: "",
        selectedMessageIndex: -1,
        messageItems: []
    };
}
function translateNonStreamingResponse(responseBody, targetFormat, sourceFormat, toolNameMap) {
    // If already in source format, return as-is
    if (targetFormat === sourceFormat) {
        if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(responseBody, toolNameMap);
        }
        return responseBody;
    }
    let intermediateOpenAI = responseBody;
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(intermediateOpenAI, toolNameMap);
    }
    // Handle OpenAI Responses API format
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
        const responseRoot = toRecord(responseBody);
        const response = responseRoot.object === "response" ? responseRoot : toRecord(responseRoot.response ?? responseRoot);
        const output = Array.isArray(response.output) ? response.output : [];
        const usage = toRecord(response.usage ?? responseRoot.usage);
        const messageSelection = findBestMessageText(output);
        let textContent = messageSelection.text;
        let reasoningContent = "";
        const toolCalls = [];
        for (const item of output){
            if (!item || typeof item !== "object") continue;
            const itemObj = toRecord(item);
            if (itemObj.type === "message" && Array.isArray(itemObj.content)) {
                for (const part of itemObj.content){
                    if (!part || typeof part !== "object") continue;
                    const partObj = toRecord(part);
                    if (partObj.type === "summary_text" && typeof partObj.text === "string") {
                        // #9500 — reasoning summary parts are discrete segments; join with "\n\n"
                        // (matches extractThinkingFromContent convention) so they don't glue back-to-back.
                        reasoningContent += reasoningContent ? `\n\n${partObj.text}` : partObj.text;
                    }
                }
            } else if (itemObj.type === "reasoning" && Array.isArray(itemObj.summary)) {
                for (const part of itemObj.summary){
                    const partObj = toRecord(part);
                    if (partObj.type === "summary_text" && typeof partObj.text === "string") {
                        // #9500 — reasoning summary parts are discrete segments; join with "\n\n"
                        // (matches extractThinkingFromContent convention) so they don't glue back-to-back.
                        reasoningContent += reasoningContent ? `\n\n${partObj.text}` : partObj.text;
                    }
                }
            } else if (itemObj.type === "function_call") {
                const callId = toString(itemObj.call_id) || toString(itemObj.id) || `call_${Date.now()}_${toolCalls.length}`;
                let argsToEmit = itemObj.arguments;
                if (argsToEmit != null && typeof argsToEmit === "object" && !Array.isArray(argsToEmit)) {
                    const cleaned = {
                        ...argsToEmit
                    };
                    for (const [k, v] of Object.entries(cleaned)){
                        if (v === "" || Array.isArray(v) && v.length === 0) delete cleaned[k];
                    }
                    argsToEmit = cleaned;
                }
                const fnArgs = typeof argsToEmit === "string" ? argsToEmit : JSON.stringify(argsToEmit || {});
                const rawName = toString(itemObj.name);
                // Strip Claude OAuth proxy_ prefix using toolNameMap
                const resolvedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                toolCalls.push({
                    id: callId,
                    type: "function",
                    function: {
                        name: resolvedName,
                        arguments: fnArgs
                    }
                });
            }
        }
        const message = {
            role: "assistant"
        };
        if (textContent) {
            message.content = textContent;
        }
        if (reasoningContent) {
            message.reasoning_content = reasoningContent;
        }
        if (toolCalls.length > 0) {
            message.tool_calls = toolCalls;
        }
        if (message.content === undefined) {
            message.content = "";
        }
        if (process.env.DEBUG_RESPONSES_SSE_TO_JSON === "true") {
            console.log(`[ResponsesSSE] ${output.length} output items, ${messageSelection.messageItems.length} message items`);
            messageSelection.messageItems.forEach((item, idx)=>{
                const textLen = extractMessageOutputText(item).length;
                console.log(`  [${idx}] text length: ${textLen}`);
            });
            console.log(`  → Selected message index: ${messageSelection.selectedMessageIndex}`);
            console.log(`  → Final text content length: ${textContent.length}`);
        }
        const createdAt = toNumber(response.created_at, Math.floor(Date.now() / 1000));
        const model = toString(response.model || responseRoot.model, "openai-responses");
        const finishReason = toolCalls.length > 0 ? "tool_calls" : "stop";
        const result = {
            id: `chatcmpl-${toString(response.id, String(Date.now()))}`,
            object: "chat.completion",
            created: createdAt,
            model,
            choices: [
                {
                    index: 0,
                    message,
                    finish_reason: finishReason
                }
            ]
        };
        if (Object.keys(usage).length > 0) {
            const inputTokens = toNumber(usage.input_tokens, 0);
            const outputTokens = toNumber(usage.output_tokens, 0);
            const inputTokensDetails = toRecord(usage.input_tokens_details);
            const outputTokensDetails = toRecord(usage.output_tokens_details);
            const promptTokensDetails = toRecord(usage.prompt_tokens_details);
            const completionTokensDetails = toRecord(usage.completion_tokens_details);
            const cachedInputTokens = firstPositiveNumber(inputTokensDetails.cached_tokens, promptTokensDetails.cached_tokens, usage.cache_read_input_tokens);
            const cacheCreationInputTokens = firstPositiveNumber(inputTokensDetails.cache_creation_tokens, promptTokensDetails.cache_creation_tokens, usage.cache_creation_input_tokens);
            const reasoningTokens = firstPositiveNumber(outputTokensDetails.reasoning_tokens, completionTokensDetails.reasoning_tokens, usage.reasoning_tokens);
            result.usage = {
                prompt_tokens: inputTokens,
                completion_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens
            };
            if (reasoningTokens > 0) {
                result.usage.completion_tokens_details = {
                    reasoning_tokens: reasoningTokens
                };
            }
            if (cachedInputTokens > 0 || cacheCreationInputTokens > 0) {
                result.usage.prompt_tokens_details = {};
                const promptDetails = result.usage.prompt_tokens_details;
                if (cachedInputTokens > 0) {
                    promptDetails.cached_tokens = cachedInputTokens;
                }
                if (cacheCreationInputTokens > 0) {
                    promptDetails.cache_creation_tokens = cacheCreationInputTokens;
                }
            }
        }
        intermediateOpenAI = result;
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) {
        const root = toRecord(responseBody);
        const response = toRecord(root.response ?? root);
        const candidates = Array.isArray(response.candidates) ? response.candidates : [];
        const usage = toRecord(response.usageMetadata ?? root.usageMetadata);
        const promptFeedback = toRecord(response.promptFeedback ?? root.promptFeedback);
        if (candidates.length > 0 || Object.keys(promptFeedback).length > 0) {
            const createdMs = Date.parse(toString(response.createTime));
            const created = Number.isFinite(createdMs) ? Math.floor(createdMs / 1000) : Math.floor(Date.now() / 1000);
            const choices = candidates.length > 0 ? candidates.map((candidateValue, index)=>{
                const candidate = toRecord(candidateValue);
                const content = toRecord(candidate.content);
                let textContent = "";
                const contentParts = [];
                const toolCalls = [];
                let reasoningContent = "";
                let pendingThoughtSignature = "";
                if (Array.isArray(content.parts)) {
                    for (const part of content.parts){
                        const partObj = toRecord(part);
                        if (partObj.thought === true && typeof partObj.text === "string") {
                            // #9500 — Gemini thinking parts are discrete segments; join with "\n\n"
                            // (matches extractThinkingFromContent convention) so they don't glue back-to-back.
                            reasoningContent += reasoningContent ? `\n\n${partObj.text}` : partObj.text;
                            continue;
                        }
                        // Capture thoughtSignature from thinking parts (Gemini thinking models)
                        // so it can be stored alongside any subsequent functionCall part.
                        const partThoughtSig = toString(partObj.thoughtSignature ?? partObj.thought_signature);
                        if (partThoughtSig) {
                            pendingThoughtSignature = partThoughtSig;
                        }
                        if (typeof partObj.text === "string") {
                            const textualToolCall = parseTextualToolCall(partObj.text);
                            if (textualToolCall) {
                                const toolCallId = `call_${toString(textualToolCall.name, "unknown")}_${Date.now()}_${toolCalls.length}`;
                                toolCalls.push({
                                    id: toolCallId,
                                    type: "function",
                                    function: {
                                        name: textualToolCall.name,
                                        arguments: JSON.stringify(textualToolCall.args || {})
                                    }
                                });
                            } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["containsTextualToolCallMarker"])(partObj.text)) {
                                textContent += partObj.text;
                                contentParts.push({
                                    type: "text",
                                    text: partObj.text
                                });
                            }
                        }
                        const inlineData = toRecord(partObj.inlineData ?? partObj.inline_data);
                        if (typeof inlineData.data === "string" && inlineData.data.length > 0) {
                            const mimeType = toString(inlineData.mimeType ?? inlineData.mime_type, "image/png");
                            contentParts.push({
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${inlineData.data}`
                                }
                            });
                        }
                        if (partObj.functionCall) {
                            const fn = toRecord(partObj.functionCall);
                            const rawName = toString(fn.name);
                            const restoredName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                            const nativeId = toString(fn.id);
                            const toolCallId = nativeId.length > 0 ? nativeId : `call_${toString(restoredName, "unknown")}_${Date.now()}_${toolCalls.length}`;
                            // Persist the thought signature so openai-to-gemini can
                            // resolve it on the next turn. Use the part-level field
                            // (part.thoughtSignature) and fall back to any signature
                            // captured from an earlier thinking-only part.
                            const sig = partThoughtSig || pendingThoughtSignature;
                            if (sig) {
                                const sigKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(null, toolCallId);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeGeminiThoughtSignature"])(sigKey, sig);
                            }
                            toolCalls.push({
                                id: toolCallId,
                                type: "function",
                                function: {
                                    name: restoredName,
                                    arguments: JSON.stringify(normalizeToolCallArgs(fn.args || {}))
                                }
                            });
                        }
                    }
                }
                const message = {
                    role: "assistant"
                };
                if (contentParts.length === 1 && contentParts[0].type === "text") {
                    message.content = contentParts[0].text;
                } else if (contentParts.length > 0) {
                    message.content = contentParts;
                } else if (textContent) {
                    message.content = textContent;
                }
                if (reasoningContent) {
                    message.reasoning_content = reasoningContent;
                }
                if (toolCalls.length > 0) {
                    message.tool_calls = toolCalls;
                }
                if (!message.content && !message.tool_calls) {
                    message.content = "";
                }
                let finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReasonString"])(toString(candidate.finishReason, "stop"));
                if (finishReason === "stop" && toolCalls.length > 0) {
                    finishReason = "tool_calls";
                }
                return {
                    index,
                    message,
                    finish_reason: finishReason
                };
            }) : [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: ""
                    },
                    finish_reason: "content_filter"
                }
            ];
            const result = {
                id: `chatcmpl-${toString(response.responseId, String(Date.now()))}`,
                object: "chat.completion",
                created,
                model: toString(response.modelVersion, "gemini"),
                choices
            };
            if (Object.keys(usage).length > 0) {
                const promptTokens = toNumber(usage.promptTokenCount, 0);
                const reasoningTokens = toNumber(usage.thoughtsTokenCount, 0);
                const completionTokens = toNumber(usage.candidatesTokenCount, 0) + reasoningTokens;
                result.usage = {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: toNumber(usage.totalTokenCount, 0)
                };
                if (reasoningTokens > 0) {
                    result.usage.completion_tokens_details = {
                        reasoning_tokens: reasoningTokens
                    };
                }
                if (toNumber(usage.cachedContentTokenCount, 0) > 0) {
                    result.usage.prompt_tokens_details = {
                        cached_tokens: toNumber(usage.cachedContentTokenCount, 0)
                    };
                }
            }
            intermediateOpenAI = result;
        }
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        const root = toRecord(responseBody);
        const contentBlocks = Array.isArray(root.content) ? root.content : [];
        if (contentBlocks.length > 0) {
            let textContent = "";
            let thinkingContent = "";
            const toolCalls = [];
            for (const block of contentBlocks){
                const blockObj = toRecord(block);
                if (blockObj.type === "text") {
                    textContent += toString(blockObj.text);
                } else if (blockObj.type === "thinking") {
                    thinkingContent += toString(blockObj.thinking);
                } else if (blockObj.type === "tool_use") {
                    const rawName = toString(blockObj.name);
                    const strippedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                    toolCalls.push({
                        id: toString(blockObj.id, `call_${Date.now()}_${toolCalls.length}`),
                        type: "function",
                        function: {
                            name: strippedName,
                            arguments: JSON.stringify(blockObj.input || {})
                        }
                    });
                }
            }
            const message = {
                role: "assistant"
            };
            if (textContent) {
                message.content = textContent;
            }
            if (thinkingContent) {
                message.reasoning_content = thinkingContent;
            }
            if (toolCalls.length > 0) {
                message.tool_calls = toolCalls;
            }
            if (message.content === undefined) {
                message.content = "";
            }
            let finishReason = toString(root.stop_reason, "stop");
            if (finishReason === "end_turn") finishReason = "stop";
            if (finishReason === "tool_use") finishReason = "tool_calls";
            const result = {
                id: `chatcmpl-${toString(root.id, String(Date.now()))}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: toString(root.model, "claude"),
                choices: [
                    {
                        index: 0,
                        message,
                        finish_reason: finishReason
                    }
                ]
            };
            const usage = toRecord(root.usage);
            if (Object.keys(usage).length > 0) {
                // Mirror the streaming translator's usage contract (#1426/#2215):
                // cache_read folds into prompt_tokens (it is billed prompt input);
                // cache_creation stays out of prompt_tokens and is exposed via
                // prompt_tokens_details, alongside cached_tokens (OpenAI field name).
                const cachedTokens = toNumber(usage.cache_read_input_tokens, 0);
                const cacheCreationTokens = toNumber(usage.cache_creation_input_tokens, 0);
                const promptTokens = toNumber(usage.input_tokens, 0) + cachedTokens;
                const completionTokens = toNumber(usage.output_tokens, 0);
                const reasoningTokens = firstPositiveNumber(toRecord(usage.output_tokens_details).thinking_tokens, toRecord(usage.completion_tokens_details).reasoning_tokens, usage.reasoning_tokens);
                const usageOut = {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens
                };
                if (reasoningTokens > 0) {
                    usageOut.reasoning_tokens = reasoningTokens;
                    usageOut.completion_tokens_details = {
                        reasoning_tokens: reasoningTokens
                    };
                }
                if (cachedTokens > 0 || cacheCreationTokens > 0) {
                    const details = {};
                    if (cachedTokens > 0) details.cached_tokens = cachedTokens;
                    if (cacheCreationTokens > 0) details.cache_creation_tokens = cacheCreationTokens;
                    usageOut.prompt_tokens_details = details;
                }
                result.usage = usageOut;
            }
            intermediateOpenAI = result;
        }
    }
    // Phase 3: Translate from OpenAI back to Client Source format
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && sourceFormat !== targetFormat) {
        return convertOpenAINonStreamingToClaude(toRecord(intermediateOpenAI));
    }
    // Gemini-family clients (Gemini, Antigravity): the streaming SSE path already
    // projects OpenAI chunks into the `{ response: { candidates: [...] } }` envelope
    // via the registered FORMATS.OPENAI -> FORMATS.ANTIGRAVITY translator
    // (translator/response/openai-to-antigravity.ts), but this non-streaming path had
    // no equivalent back-conversion step — it silently returned the raw OpenAI
    // chat.completion shape (leaking `choices[]`/`tool_calls` instead of
    // `candidates[]`/`functionCall`) to any non-streaming Gemini/Antigravity client.
    if ((sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) && sourceFormat !== targetFormat) {
        return convertOpenAINonStreamingToGeminiFamily(toRecord(intermediateOpenAI));
    }
    // Return intermediateOpenAI (which is either the raw response if unknown targetFormat, or an OpenAI compatible payload)
    return intermediateOpenAI;
}
/**
 * Resolve reasoning/thinking text off a non-streaming OpenAI-format message object.
 * Delegates to the shared reasoning-field resolver (`open-sse/utils/reasoningFields.ts`)
 * so every reasoning alias — DeepSeek-style `reasoning_content`, the OpenRouter/StepFun
 * `reasoning` string, GitHub Copilot's `reasoning_text`, `thinking`/`thought`, and
 * `reasoning_details[]` (array of { text | content }) — is read from one place instead
 * of a divergent local copy. Mirrors the streaming translator's fallback chain in
 * open-sse/translator/response/openai-to-claude.ts.
 */ function resolveReasoningText(messageObj) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAnyReasoningValue"])(messageObj);
}
/**
 * Helper to convert an OpenAI chat.completion JSON object to Claude format for non-streaming.
 */ function convertOpenAINonStreamingToClaude(openaiResponse) {
    const choices = openaiResponse.choices;
    const isChoicesArray = Array.isArray(choices);
    if (!isChoicesArray && openaiResponse.object !== "chat.completion") {
        return openaiResponse; // If it doesn't look like OpenAI, return as-is
    }
    const choice = isChoicesArray ? choices[0] : null;
    const choiceObj = choice ? toRecord(choice) : {};
    const messageObj = choiceObj.message ? toRecord(choiceObj.message) : {};
    const content = [];
    let hasTextOrReasoning = false;
    const reasoningText = resolveReasoningText(messageObj);
    if (reasoningText) {
        hasTextOrReasoning = true;
        content.push({
            type: "thinking",
            thinking: reasoningText
        });
    }
    // Always include text if it exists (even empty string), or if there are no tool calls and no reasoning
    const hasToolCalls = Array.isArray(messageObj.tool_calls) && messageObj.tool_calls.length > 0;
    if (messageObj.content !== undefined && messageObj.content !== null) {
        hasTextOrReasoning = true;
        const resolvedText = toString(messageObj.content);
        content.push({
            type: "text",
            text: resolvedText === "" ? "(empty response)" : resolvedText
        });
    } else if (!hasTextOrReasoning) {
        content.push({
            type: "text",
            text: "(empty response)"
        });
    }
    if (Array.isArray(messageObj.tool_calls)) {
        for (const tool of messageObj.tool_calls){
            const toolObj = toRecord(tool);
            const fn = toRecord(toolObj.function);
            content.push({
                type: "tool_use",
                id: toString(toolObj.id, `call_${Date.now()}`),
                name: toString(fn.name),
                input: typeof fn.arguments === "string" ? JSON.parse(fn.arguments || "{}") : fn.arguments || {}
            });
        }
    }
    let stopReason = toString(choiceObj.finish_reason, "end_turn");
    if (stopReason === "stop") stopReason = "end_turn";
    if (stopReason === "tool_calls") stopReason = "tool_use";
    const usageSrc = toRecord(openaiResponse.usage);
    const promptTokens = toNumber(usageSrc.prompt_tokens, 0);
    const outputTokens = toNumber(usageSrc.completion_tokens, 0);
    // Extract cache tokens from prompt_tokens_details (mirrors the streaming
    // translator in open-sse/translator/response/openai-to-claude.ts lines 119-148).
    const promptDetails = toRecord(usageSrc.prompt_tokens_details);
    const cachedTokens = toNumber(promptDetails.cached_tokens, 0);
    const cacheCreationTokens = toNumber(promptDetails.cache_creation_tokens, 0);
    // OpenAI's prompt_tokens includes all prompt-side tokens (cached + non-cached).
    // Claude expects input_tokens to be only non-cached tokens, with cached tokens
    // exposed separately as cache_read_input_tokens.
    const inputTokens = promptTokens - cachedTokens - cacheCreationTokens;
    const usage = {
        input_tokens: inputTokens,
        output_tokens: outputTokens
    };
    // Add cache_read_input_tokens if present
    if (cachedTokens > 0) {
        usage.cache_read_input_tokens = cachedTokens;
    }
    // Add cache_creation_input_tokens if present
    if (cacheCreationTokens > 0) {
        usage.cache_creation_input_tokens = cacheCreationTokens;
    }
    const claudeResponse = {
        id: toString(openaiResponse.id, `msg_${Date.now()}`),
        type: "message",
        role: "assistant",
        model: toString(openaiResponse.model, "claude"),
        content,
        stop_reason: stopReason,
        stop_sequence: null,
        usage
    };
    return claudeResponse;
}
const OPENAI_TO_GEMINI_FINISH_REASON = {
    stop: "STOP",
    length: "MAX_TOKENS",
    tool_calls: "STOP",
    content_filter: "SAFETY"
};
/**
 * Parse an OpenAI tool-call `arguments` payload into a Gemini `functionCall.args`
 * object. Never throws: a provider emitting malformed/truncated JSON must not take
 * down the whole non-streaming response path, so an unparseable payload degrades to
 * `{}` (matching the streaming Gemini translator's behaviour).
 */ function parseFunctionCallArgs(args) {
    if (typeof args !== "string") return toRecord(args);
    try {
        return toRecord(JSON.parse(args || "{}"));
    } catch  {
        return {};
    }
}
/**
 * Helper to convert an OpenAI chat.completion JSON object into the Gemini/Antigravity
 * `{ response: { candidates: [...] } }` envelope for non-streaming clients. Mirrors the
 * shape already produced for streaming by the registered
 * FORMATS.OPENAI -> FORMATS.ANTIGRAVITY translator
 * (translator/response/openai-to-antigravity.ts) so both paths agree.
 */ function convertOpenAINonStreamingToGeminiFamily(openaiResponse) {
    const choices = openaiResponse.choices;
    const isChoicesArray = Array.isArray(choices);
    if (!isChoicesArray && openaiResponse.object !== "chat.completion") {
        return openaiResponse; // If it doesn't look like OpenAI, return as-is
    }
    const choice = isChoicesArray ? toRecord(choices[0]) : {};
    const messageObj = toRecord(choice.message);
    const parts = [];
    const reasoningText = resolveReasoningText(messageObj);
    if (reasoningText) {
        parts.push({
            text: reasoningText,
            thought: true
        });
    }
    if (typeof messageObj.content === "string" && messageObj.content.length > 0) {
        parts.push({
            text: messageObj.content
        });
    }
    const toolCalls = Array.isArray(messageObj.tool_calls) ? messageObj.tool_calls : [];
    for (const toolCall of toolCalls){
        const toolObj = toRecord(toolCall);
        const fn = toRecord(toolObj.function);
        parts.push({
            functionCall: {
                name: toString(fn.name),
                args: parseFunctionCallArgs(fn.arguments)
            }
        });
    }
    if (parts.length === 0) parts.push({
        text: ""
    });
    const finishReason = OPENAI_TO_GEMINI_FINISH_REASON[toString(choice.finish_reason, "stop")] ?? "STOP";
    const usageSrc = toRecord(openaiResponse.usage);
    const promptTokens = toNumber(usageSrc.prompt_tokens, 0);
    const completionTokens = toNumber(usageSrc.completion_tokens, 0);
    const geminiResponse = {
        response: {
            candidates: [
                {
                    content: {
                        role: "model",
                        parts
                    },
                    finishReason,
                    index: 0
                }
            ],
            usageMetadata: {
                promptTokenCount: promptTokens,
                candidatesTokenCount: completionTokens,
                totalTokenCount: toNumber(usageSrc.total_tokens, promptTokens + completionTokens)
            },
            modelVersion: toString(openaiResponse.model, "unknown"),
            responseId: toString(openaiResponse.id, `resp_${Date.now()}`)
        }
    };
    return geminiResponse;
}
}),
"[project]/open-sse/handlers/sseParser.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractSSEErrorMessage",
    ()=>extractSSEErrorMessage,
    "parseSSEToClaudeResponse",
    ()=>parseSSEToClaudeResponse,
    "parseSSEToOpenAIResponse",
    ()=>parseSSEToOpenAIResponse,
    "parseSSEToResponsesOutput",
    ()=>parseSSEToResponsesOutput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolCallArguments$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/toolCallArguments.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
;
;
function extractSSEErrorMessage(rawSSE) {
    const lines = String(rawSSE || "").split("\n");
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let parsed;
        try {
            parsed = JSON.parse(payload);
        } catch  {
            continue; // Ignore malformed lines and keep scanning.
        }
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;
        const record = parsed;
        // A chunk with content (choices) is not an error-only chunk — defer to the
        // normal content parsers so the valid-SSE path is never short-circuited.
        if (Array.isArray(record.choices)) continue;
        const err = record.error;
        if (err == null) continue;
        let message = "";
        if (typeof err === "string") {
            message = err;
        } else if (typeof err === "object" && !Array.isArray(err)) {
            const errRecord = err;
            if (typeof errRecord.message === "string") {
                message = errRecord.message;
            } else {
                message = JSON.stringify(err);
            }
        } else {
            message = String(err);
        }
        const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message);
        if (sanitized) return sanitized;
    }
    return null;
}
/**
 * Convert OpenAI-style SSE chunks into a single non-streaming JSON response.
 * Used as a fallback when upstream returns text/event-stream for stream=false.
 */ function readSSEEvents(rawSSE) {
    const lines = String(rawSSE || "").split("\n");
    const events = [];
    let currentEvent = "";
    let currentData = [];
    const flush = ()=>{
        if (currentData.length === 0) {
            currentEvent = "";
            return;
        }
        const payload = currentData.join("\n").trim();
        currentData = [];
        if (!payload || payload === "[DONE]") {
            currentEvent = "";
            return;
        }
        try {
            const data = JSON.parse(payload);
            if (currentEvent && data && typeof data === "object" && !Array.isArray(data) && typeof data.type !== "string") {
                data.type = currentEvent;
            }
            events.push({
                event: currentEvent || undefined,
                data
            });
        } catch  {
        // Ignore malformed SSE events and continue best-effort parsing.
        }
        currentEvent = "";
    };
    for (const rawLine of lines){
        const line = rawLine.replace(/\r$/, "");
        if (line.trim() === "") {
            flush();
            continue;
        }
        if (line.startsWith("event:")) {
            // Some relays omit the blank separator between Claude events. Flush the
            // previous event before accepting the next event name.
            if (currentData.length > 0) flush();
            currentEvent = line.slice(6).trim();
            continue;
        }
        if (line.startsWith("data:")) {
            const dataLine = line.slice(5).trimStart();
            if (dataLine.trim() === "[DONE]") {
                flush();
                currentEvent = "";
                continue;
            }
            currentData.push(dataLine);
        }
    }
    flush();
    return events;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function parseSSEToOpenAIResponse(rawSSE, fallbackModel) {
    const lines = String(rawSSE || "").split("\n");
    const chunks = [];
    let sawChoices = false;
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
            const parsed = JSON.parse(payload);
            if (Array.isArray(parsed?.choices)) {
                sawChoices = true;
            }
            chunks.push(parsed);
        } catch  {
        // Ignore malformed SSE lines and continue best-effort parsing.
        }
    }
    if (chunks.length === 0 || !sawChoices) return null;
    const first = chunks[0];
    const contentParts = [];
    const reasoningParts = [];
    const accumulatedToolCalls = new Map();
    let unknownToolCallSeq = 0;
    let finishReason = "stop";
    let usage = null;
    const getToolCallKey = (toolCall)=>{
        if (Number.isInteger(toolCall?.index)) return `idx:${toolCall.index}`;
        if (toolCall?.id != null) return `id:${String(toolCall.id)}`;
        unknownToolCallSeq += 1;
        return `seq:${unknownToolCallSeq}`;
    };
    for (const chunk of chunks){
        const choice = chunk?.choices?.[0];
        const delta = choice?.delta || {};
        if (typeof delta.content === "string" && delta.content.length > 0) {
            contentParts.push(delta.content);
        }
        if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
            reasoningParts.push(delta.reasoning_content);
        }
        // Normalize `reasoning` alias (NVIDIA kimi-k2.5 etc.)
        if (typeof delta.reasoning === "string" && delta.reasoning.length > 0 && !delta.reasoning_content) {
            reasoningParts.push(delta.reasoning);
        }
        // T18: Accumulate tool calls correctly across streamed chunks
        if (delta.tool_calls) {
            for (const tc of delta.tool_calls){
                const key = getToolCallKey(tc);
                const existing = accumulatedToolCalls.get(key);
                const deltaArgs = typeof tc?.function?.arguments === "string" ? tc.function.arguments : "";
                if (!existing) {
                    accumulatedToolCalls.set(key, {
                        id: tc?.id != null ? String(tc.id) : null,
                        index: Number.isInteger(tc?.index) ? tc.index : accumulatedToolCalls.size,
                        type: tc?.type || "function",
                        function: {
                            name: tc?.function?.name || "unknown",
                            arguments: deltaArgs
                        }
                    });
                } else {
                    existing.id = existing.id || (tc?.id != null ? String(tc.id) : null);
                    if (!Number.isInteger(existing.index) && Number.isInteger(tc?.index)) {
                        existing.index = tc.index;
                    }
                    if (tc?.function?.name && !existing.function?.name) {
                        existing.function.name = tc.function.name;
                    }
                    existing.function.arguments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolCallArguments$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["appendToolCallArgumentDelta"])(existing.function.arguments, deltaArgs);
                    accumulatedToolCalls.set(key, existing);
                }
            }
        }
        if (choice?.finish_reason) {
            finishReason = choice.finish_reason;
        }
        if (chunk?.usage && typeof chunk.usage === "object") {
            usage = chunk.usage;
        }
    }
    const joinedContent = contentParts.length > 0 ? contentParts.join("").trim() : "";
    const joinedReasoning = reasoningParts.length > 0 ? reasoningParts.join("").trim() : null;
    const message = {
        role: "assistant",
        content: joinedContent
    };
    if (joinedReasoning) {
        message.reasoning_content = joinedReasoning;
    }
    const finalToolCalls = [
        ...accumulatedToolCalls.values()
    ].filter(Boolean).sort((a, b)=>{
        const ai = Number.isInteger(a?.index) ? a.index : 0;
        const bi = Number.isInteger(b?.index) ? b.index : 0;
        return ai - bi;
    });
    if (finalToolCalls.length > 0) {
        finishReason = "tool_calls"; // T18 normalization
        message.tool_calls = finalToolCalls;
    }
    const result = {
        id: first.id != null ? String(first.id) : `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: first.created || Math.floor(Date.now() / 1000),
        model: first.model || fallbackModel || "unknown",
        choices: [
            {
                index: 0,
                message,
                finish_reason: finishReason
            }
        ]
    };
    if (usage) {
        result.usage = usage;
    }
    return result;
}
function parseSSEToClaudeResponse(rawSSE, fallbackModel) {
    const payloads = readSSEEvents(rawSSE).map((event)=>toRecord(event.data)).filter((payload)=>Object.keys(payload).length > 0);
    if (payloads.length === 0) return null;
    const blocks = new Map();
    const usage = {};
    let messageId = "";
    let model = fallbackModel || "claude";
    let role = "assistant";
    let stopReason = "end_turn";
    let stopSequence = null;
    let sawClaudeEvent = false;
    const mergeUsage = (incoming)=>{
        const usageRecord = toRecord(incoming);
        for (const [key, value] of Object.entries(usageRecord)){
            if (typeof value === "number" && Number.isFinite(value)) {
                usage[key] = value;
            } else if (value && typeof value === "object" && !Array.isArray(value)) {
                usage[key] = {
                    ...toRecord(usage[key]),
                    ...toRecord(value)
                };
            } else if (typeof value === "string" && value.trim().length > 0) {
                usage[key] = value;
            }
        }
    };
    const tryParseJson = (raw)=>{
        try {
            return JSON.parse(raw);
        } catch  {
            return raw;
        }
    };
    for (const payload of payloads){
        const eventType = toString(payload.type);
        if (eventType === "message_start") {
            sawClaudeEvent = true;
            const message = toRecord(payload.message);
            messageId = toString(message.id, messageId || `msg_${Date.now()}`);
            model = toString(message.model, model);
            role = toString(message.role, role);
            mergeUsage(message.usage);
            continue;
        }
        if (eventType === "content_block_start") {
            sawClaudeEvent = true;
            const index = toNumber(payload.index, blocks.size);
            const contentBlock = toRecord(payload.content_block);
            const blockType = toString(contentBlock.type);
            if (blockType === "thinking") {
                blocks.set(index, {
                    type: "thinking",
                    index,
                    thinking: toString(contentBlock.thinking),
                    signature: toString(contentBlock.signature) || undefined
                });
            } else if (blockType === "tool_use") {
                blocks.set(index, {
                    type: "tool_use",
                    index,
                    id: toString(contentBlock.id, `toolu_${Date.now()}_${index}`),
                    name: toString(contentBlock.name),
                    input: contentBlock.input ?? {},
                    inputJson: ""
                });
            } else {
                blocks.set(index, {
                    type: "text",
                    index,
                    text: toString(contentBlock.text)
                });
            }
            continue;
        }
        if (eventType === "content_block_delta") {
            sawClaudeEvent = true;
            const index = toNumber(payload.index, 0);
            const delta = toRecord(payload.delta);
            const deltaType = toString(delta.type);
            const existing = blocks.get(index);
            if (deltaType === "input_json_delta") {
                const toolUse = existing && existing.type === "tool_use" ? existing : {
                    type: "tool_use",
                    index,
                    id: `toolu_${Date.now()}_${index}`,
                    name: "",
                    input: {},
                    inputJson: ""
                };
                toolUse.inputJson += toString(delta.partial_json);
                blocks.set(index, toolUse);
                continue;
            }
            const isThinkingDelta = deltaType === "thinking_delta" || typeof delta.thinking === "string";
            const isSignatureDelta = deltaType === "signature_delta" || typeof delta.signature === "string";
            if (isThinkingDelta || isSignatureDelta) {
                const thinking = existing && existing.type === "thinking" ? existing : {
                    type: "thinking",
                    index,
                    thinking: "",
                    signature: undefined
                };
                if (isThinkingDelta) thinking.thinking += toString(delta.thinking);
                const signature = toString(delta.signature);
                if (signature) thinking.signature = `${thinking.signature || ""}${signature}`;
                blocks.set(index, thinking);
                continue;
            }
            const textBlock = existing && existing.type === "text" ? existing : {
                type: "text",
                index,
                text: ""
            };
            textBlock.text += toString(delta.text);
            blocks.set(index, textBlock);
            continue;
        }
        if (eventType === "message_delta") {
            sawClaudeEvent = true;
            const delta = toRecord(payload.delta);
            stopReason = toString(delta.stop_reason, stopReason);
            stopSequence = typeof delta.stop_sequence === "string" ? String(delta.stop_sequence) : stopSequence;
            mergeUsage(payload.usage);
            continue;
        }
        mergeUsage(payload.usage);
    }
    if (!sawClaudeEvent) return null;
    const content = [];
    for (const block of [
        ...blocks.values()
    ].sort((a, b)=>a.index - b.index)){
        if (block.type === "text") {
            if (block.text) content.push({
                type: "text",
                text: block.text
            });
            continue;
        }
        if (block.type === "thinking") {
            const hasSignature = typeof block.signature === "string" && block.signature.length > 0;
            if (block.thinking || hasSignature) {
                content.push({
                    type: "thinking",
                    thinking: block.thinking || "",
                    ...hasSignature ? {
                        signature: block.signature
                    } : {}
                });
            }
            continue;
        }
        const input = block.inputJson.trim().length > 0 ? tryParseJson(block.inputJson) : block.input;
        content.push({
            type: "tool_use",
            id: block.id,
            name: block.name,
            input
        });
    }
    return {
        id: messageId || `msg_${Date.now()}`,
        type: "message",
        role,
        model,
        content,
        stop_reason: stopReason,
        ...stopSequence ? {
            stop_sequence: stopSequence
        } : {},
        ...Object.keys(usage).length > 0 ? {
            usage
        } : {}
    };
}
/**
 * Convert Responses API SSE events into a single non-streaming response object.
 * Expects events such as response.created / response.in_progress / response.completed.
 */ const RESPONSES_TERMINAL_EVENT_TYPES = new Set([
    "response.completed",
    "response.done",
    "response.cancelled",
    "response.canceled",
    "response.failed",
    "response.incomplete"
]);
function toOutputIndex(value) {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isInteger(parsed)) return parsed;
    }
    return null;
}
function toIdString(value) {
    return value === null || value === undefined ? "" : String(value);
}
function cloneResponseItem(item) {
    const record = toRecord(item);
    return {
        ...record,
        id: record.id != null ? String(record.id) : record.id,
        call_id: record.call_id != null ? String(record.call_id) : record.call_id,
        ...Array.isArray(record.content) ? {
            content: record.content.map((contentPart)=>{
                const part = toRecord(contentPart);
                return {
                    ...part
                };
            })
        } : {},
        ...Array.isArray(record.summary) ? {
            summary: record.summary.map((summaryPart)=>{
                const part = toRecord(summaryPart);
                return {
                    ...part
                };
            })
        } : {}
    };
}
function ensureResponsesMessageItem(outputItems, outputIndex) {
    const existing = outputItems.get(outputIndex);
    if (existing?.type === "message") return existing;
    const next = {
        ...existing && typeof existing === "object" ? existing : {},
        id: existing?.id != null ? String(existing.id) : `msg_${Date.now()}_${outputIndex}`,
        type: "message",
        role: "assistant",
        content: Array.isArray(existing?.content) ? existing.content.map((contentPart)=>({
                ...toRecord(contentPart)
            })) : [
            {
                type: "output_text",
                annotations: [],
                text: ""
            }
        ]
    };
    if (next.content.length === 0) {
        next.content.push({
            type: "output_text",
            annotations: [],
            text: ""
        });
    }
    outputItems.set(outputIndex, next);
    return next;
}
function ensureResponsesReasoningItem(outputItems, outputIndex, itemId) {
    const existing = outputItems.get(outputIndex);
    if (existing?.type === "reasoning") return existing;
    const next = {
        ...existing && typeof existing === "object" ? existing : {},
        id: itemId || (existing?.id != null ? String(existing.id) : null) || `rs_${Date.now()}_${outputIndex}`,
        type: "reasoning",
        summary: Array.isArray(existing?.summary) ? existing.summary.map((summaryPart)=>({
                ...toRecord(summaryPart)
            })) : [
            {
                type: "summary_text",
                text: ""
            }
        ]
    };
    if (next.summary.length === 0) {
        next.summary.push({
            type: "summary_text",
            text: ""
        });
    }
    outputItems.set(outputIndex, next);
    return next;
}
function ensureResponsesFunctionCallItem(outputItems, outputIndex, itemId, callId, name) {
    const existing = outputItems.get(outputIndex);
    const normalizedItemId = toIdString(itemId);
    const normalizedCallId = toIdString(callId);
    const existingId = existing?.id != null ? String(existing.id) : "";
    const existingCallId = existing?.call_id != null ? String(existing.call_id) : "";
    if (existing?.type === "function_call") {
        if (existing.call_id != null) existing.call_id = String(existing.call_id);
        if (existing.id != null) existing.id = String(existing.id);
        if (normalizedCallId && !existing.call_id) existing.call_id = normalizedCallId;
        if (name && !existing.name) existing.name = name;
        if (normalizedItemId && !existing.id) existing.id = normalizedItemId;
        return existing;
    }
    const next = {
        ...existing && typeof existing === "object" ? existing : {},
        id: normalizedItemId || existingId || `fc_${normalizedCallId || `${Date.now()}_${outputIndex}`}`,
        type: "function_call",
        call_id: normalizedCallId || existingCallId || "",
        name: name || existing?.name || "",
        arguments: typeof existing?.arguments === "string" ? existing.arguments : ""
    };
    outputItems.set(outputIndex, next);
    return next;
}
function mergeResponseItems(existing, incoming) {
    const next = cloneResponseItem(incoming);
    if (!existing || typeof existing !== "object") return next;
    return {
        ...existing,
        ...next,
        ...Array.isArray(next.content) ? {
            content: next.content
        } : {},
        ...Array.isArray(next.summary) ? {
            summary: next.summary
        } : {}
    };
}
function parseSSEToResponsesOutput(rawSSE, fallbackModel) {
    const lines = String(rawSSE || "").split("\n");
    const events = [];
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
            const parsed = JSON.parse(payload);
            const record = toRecord(parsed);
            if (Object.keys(record).length > 0) {
                events.push(record);
            }
        } catch  {
        // Ignore malformed lines and continue best-effort parsing.
        }
    }
    if (events.length === 0) return null;
    let terminalResponse = null;
    let terminalEventType = "";
    let latestResponse = null;
    const outputItems = new Map();
    for (const evt of events){
        const eventType = toString(evt?.type);
        const outputIndex = toOutputIndex(evt?.output_index);
        const item = toRecord(evt?.item);
        if (outputIndex !== null && eventType === "response.output_item.added") {
            outputItems.set(outputIndex, cloneResponseItem(item));
        }
        if (outputIndex !== null && eventType === "response.output_item.done") {
            const existing = outputItems.get(outputIndex);
            outputItems.set(outputIndex, mergeResponseItems(existing, item));
        }
        if (outputIndex !== null && eventType === "response.output_text.delta") {
            const messageItem = ensureResponsesMessageItem(outputItems, outputIndex);
            const content = Array.isArray(messageItem.content) ? messageItem.content : [];
            const firstPart = content.length > 0 ? {
                ...toRecord(content[0])
            } : {
                type: "output_text",
                annotations: []
            };
            firstPart.type = firstPart.type || "output_text";
            firstPart.annotations = Array.isArray(firstPart.annotations) ? firstPart.annotations : [];
            firstPart.text = `${toString(firstPart.text)}${toString(evt.delta)}`;
            content[0] = firstPart;
            messageItem.content = content;
        }
        if (outputIndex !== null && eventType === "response.output_text.done") {
            const messageItem = ensureResponsesMessageItem(outputItems, outputIndex);
            const content = Array.isArray(messageItem.content) ? messageItem.content : [];
            const firstPart = content.length > 0 ? {
                ...toRecord(content[0])
            } : {
                type: "output_text",
                annotations: []
            };
            firstPart.type = firstPart.type || "output_text";
            firstPart.annotations = Array.isArray(firstPart.annotations) ? firstPart.annotations : [];
            firstPart.text = toString(evt.text, toString(firstPart.text));
            content[0] = firstPart;
            messageItem.content = content;
        }
        if (outputIndex !== null && eventType === "response.reasoning_summary_text.delta") {
            const reasoningItem = ensureResponsesReasoningItem(outputItems, outputIndex, toIdString(evt.item_id));
            const summary = Array.isArray(reasoningItem.summary) ? reasoningItem.summary : [];
            // #9500 — respect summary_index: each segment is a distinct summary_text
            // part. Place deltas at summary[summary_index] (growing the array) so
            // segments are preserved for later "\n\n" joining on the non-stream path,
            // instead of overwriting summary[0] regardless of index.
            const summaryIndex = typeof evt.summary_index === "number" ? evt.summary_index : 0;
            const part = summary[summaryIndex] && typeof summary[summaryIndex] === "object" ? {
                ...toRecord(summary[summaryIndex])
            } : {
                type: "summary_text",
                text: ""
            };
            part.type = part.type || "summary_text";
            part.text = `${toString(part.text)}${toString(evt.delta)}`;
            summary[summaryIndex] = part;
            reasoningItem.summary = summary;
        }
        if (outputIndex !== null && eventType === "response.reasoning_summary_text.done") {
            const reasoningItem = ensureResponsesReasoningItem(outputItems, outputIndex, toIdString(evt.item_id));
            const summary = Array.isArray(reasoningItem.summary) ? reasoningItem.summary : [];
            // #9500 — respect summary_index on the terminal done event too.
            const summaryIndex = typeof evt.summary_index === "number" ? evt.summary_index : 0;
            const part = summary[summaryIndex] && typeof summary[summaryIndex] === "object" ? {
                ...toRecord(summary[summaryIndex])
            } : {
                type: "summary_text",
                text: ""
            };
            part.type = part.type || "summary_text";
            part.text = toString(evt.text, toString(part.text));
            summary[summaryIndex] = part;
            reasoningItem.summary = summary;
        }
        if (outputIndex !== null && eventType === "response.function_call_arguments.delta") {
            const functionCallItem = ensureResponsesFunctionCallItem(outputItems, outputIndex, toIdString(evt.item_id), "", "");
            functionCallItem.arguments = `${toString(functionCallItem.arguments)}${toString(evt.delta)}`;
        }
        if (outputIndex !== null && eventType === "response.function_call_arguments.done") {
            const functionCallItem = ensureResponsesFunctionCallItem(outputItems, outputIndex, toIdString(evt.item_id), "", "");
            functionCallItem.arguments = toString(evt.arguments, toString(functionCallItem.arguments));
        }
        if (RESPONSES_TERMINAL_EVENT_TYPES.has(eventType) && evt.response) {
            terminalResponse = evt.response;
            terminalEventType = eventType;
        }
        if (evt?.response && typeof evt.response === "object") {
            latestResponse = evt.response;
        } else if (evt?.object === "response") {
            latestResponse = evt;
        }
    }
    const picked = terminalResponse || latestResponse;
    if (!picked || typeof picked !== "object") return null;
    const reconstructedOutput = [
        ...outputItems.entries()
    ].sort((a, b)=>a[0] - b[0]).map(([, item])=>item).filter((item)=>item && typeof item === "object");
    const pickedOutput = Array.isArray(picked.output) ? picked.output : [];
    // #3948 — A Responses-API terminal snapshot (`response.completed`) can carry a
    // non-empty `output` that LACKS the assistant message item (e.g. only a
    // `reasoning` item) even though the streamed `output_text` deltas reconstructed
    // a full message. Preferring such a textless terminal output drops the
    // assistant text → empty content on `stream:false` (n8n combo). When the
    // terminal output has no message item but the reconstructed delta output does,
    // use the reconstructed output (a superset carrying the message). The terminal
    // snapshot still wins whenever it already contains the message item.
    const outputHasMessage = (items)=>items.some((item)=>toRecord(item).type === "message");
    const chosenOutput = pickedOutput.length > 0 && !outputHasMessage(pickedOutput) && outputHasMessage(reconstructedOutput) ? reconstructedOutput : pickedOutput.length > 0 ? pickedOutput : reconstructedOutput;
    const statusFallback = terminalEventType === "response.cancelled" ? "cancelled" : terminalEventType === "response.canceled" ? "canceled" : terminalEventType === "response.failed" ? "failed" : terminalEventType === "response.incomplete" ? "incomplete" : terminalResponse ? "completed" : "in_progress";
    return {
        id: picked.id != null ? String(picked.id) : `resp_${Date.now()}`,
        object: picked.object || "response",
        model: picked.model || fallbackModel || "unknown",
        output: chosenOutput.map((item)=>{
            const record = toRecord(item);
            return {
                ...record,
                id: record.id != null ? String(record.id) : record.id,
                call_id: record.call_id != null ? String(record.call_id) : record.call_id
            };
        }),
        usage: picked.usage || null,
        status: picked.status || statusFallback,
        created_at: picked.created_at || Math.floor(Date.now() / 1000),
        metadata: picked.metadata || {}
    };
}
}),
"[project]/open-sse/handlers/sseParser/geminiResponse.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseSSEToGeminiResponse",
    ()=>parseSSEToGeminiResponse
]);
// Gemini/Antigravity buffered-SSE -> chat.completion conversion (#7408).
// Extracted verbatim from sseParser.ts (file-size cap): pure parsing, no host
// state, following the handlers submodule pattern (chatCore/, responseSanitizer/).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
;
function stripZeroWidth(value) {
    if (typeof value === "string") return value.replace(/[\u200B-\u200D\uFEFF]/g, "");
    return value;
}
/**
 * Detect the `[Tool call: name]\nArguments: {...}` textual convention some
 * Gemini/Antigravity models emit instead of a native functionCall part.
 */ function tryParseTextualToolCall(text) {
    const normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const match = normalized.match(/^[\s\S]*?\[Tool call:\s*([^\]\n]+)\]\s*\nArguments:\s*([\s\S]+?)\s*$/);
    if (!match) return null;
    const name = match[1]?.trim();
    const rawArgs = match[2]?.trim();
    if (!name || !rawArgs) return null;
    try {
        return {
            name,
            args: stripZeroWidth(JSON.parse(rawArgs))
        };
    } catch  {
        return null;
    }
}
/** Extract the markdown shortcut some Gemini variants send (top-level or nested). */ function extractGeminiMarkdownShortcut(parsed) {
    if (typeof parsed.markdown === "string") return parsed.markdown;
    const response = parsed.response;
    return typeof response?.markdown === "string" ? response.markdown : null;
}
/** Append one candidate content part (text or textual tool call) onto the accumulator. */ function applyCandidatePart(part, acc) {
    if (typeof part.text !== "string" || part.thought || part.thoughtSignature) return;
    const textualToolCall = tryParseTextualToolCall(part.text);
    if (textualToolCall) {
        acc.toolCalls.push({
            id: `${textualToolCall.name}-${Date.now()}-${acc.toolCalls.length}`,
            index: acc.toolCalls.length,
            type: "function",
            function: {
                name: textualToolCall.name,
                arguments: JSON.stringify(textualToolCall.args || {})
            }
        });
    } else {
        acc.textContent += part.text;
    }
    acc.sawContent = true;
}
/** Walk the first candidate's content parts, if present, mutating the accumulator. */ function applyCandidateContentParts(candidate, acc) {
    const content = candidate?.content;
    const parts = content?.parts;
    if (!Array.isArray(parts)) return;
    for (const part of parts){
        applyCandidatePart(part, acc);
    }
}
/** Normalize and apply the candidate's finishReason, if present. */ function applyFinishReason(candidate, acc) {
    if (!candidate?.finishReason) return;
    acc.finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReasonString"])(String(candidate.finishReason).toLowerCase());
}
/** Extract usageMetadata into the OpenAI-shaped usage object, if present. */ function applyUsageMetadata(parsed, acc) {
    const response = parsed.response;
    const um = response?.usageMetadata;
    if (!um) return;
    acc.usage = {
        prompt_tokens: um.promptTokenCount || 0,
        completion_tokens: um.candidatesTokenCount || 0,
        total_tokens: um.totalTokenCount || 0
    };
}
/** Parse one `data:` line's JSON payload and fold it into the accumulator (best-effort). */ function applyGeminiSSEDataLine(payload, acc) {
    try {
        const parsed = JSON.parse(payload);
        const markdown = extractGeminiMarkdownShortcut(parsed);
        if (markdown) {
            acc.textContent += markdown;
            acc.sawContent = true;
        }
        const response = parsed.response;
        const candidates = response?.candidates;
        const candidate = Array.isArray(candidates) ? candidates[0] : undefined;
        applyCandidateContentParts(candidate, acc);
        applyFinishReason(candidate, acc);
        applyUsageMetadata(parsed, acc);
    } catch  {
    // Ignore malformed lines
    }
}
/** Assemble the final non-streaming chat.completion payload from the accumulator. */ function buildChatCompletionFromAccumulator(acc, fallbackModel) {
    const message = {
        role: "assistant",
        content: acc.textContent || null
    };
    let finishReason = acc.finishReason;
    if (acc.toolCalls.length > 0) {
        message.tool_calls = acc.toolCalls;
        finishReason = "tool_calls";
    }
    const result = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: fallbackModel || "unknown",
        choices: [
            {
                index: 0,
                message,
                finish_reason: finishReason
            }
        ]
    };
    if (acc.usage) {
        result.usage = acc.usage;
    }
    return result;
}
function parseSSEToGeminiResponse(rawSSE, fallbackModel) {
    const lines = String(rawSSE || "").split("\n");
    const acc = {
        textContent: "",
        finishReason: "stop",
        usage: null,
        sawContent: false,
        toolCalls: []
    };
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        applyGeminiSSEDataLine(payload, acc);
    }
    if (!acc.sawContent && acc.toolCalls.length === 0) return null;
    return buildChatCompletionFromAccumulator(acc, fallbackModel);
}
}),
"[project]/open-sse/handlers/search/perplexitySearch.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildPerplexityRequest",
    ()=>buildPerplexityRequest,
    "parsePerplexitySearchOptions",
    ()=>parsePerplexitySearchOptions
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const searchDateSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/, "Expected MM/DD/YYYY");
const searchOptionsSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    max_tokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].coerce.number().int().min(1).max(1_000_000).optional(),
    max_tokens_per_page: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].coerce.number().int().min(1).max(1_000_000).optional(),
    search_language_filter: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^[A-Za-z]{2}$/, "Expected a two-letter ISO 639-1 language code").transform((value)=>value.toLowerCase())).max(10).optional(),
    last_updated_after_filter: searchDateSchema.optional(),
    last_updated_before_filter: searchDateSchema.optional(),
    search_after_date_filter: searchDateSchema.optional(),
    search_before_date_filter: searchDateSchema.optional(),
    search_recency_filter: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "hour",
        "day",
        "week",
        "month",
        "year"
    ]).optional()
});
function normalizeLanguage(language) {
    const primary = language?.split(/[-_]/, 1)[0]?.toLowerCase();
    return primary && /^[a-z]{2}$/.test(primary) ? primary : undefined;
}
function parsePerplexitySearchOptions(params) {
    const parsed = searchOptionsSchema.safeParse(params.providerOptions ?? {});
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return {
            error: `Invalid Perplexity Search option: ${issue?.message || "invalid value"}`
        };
    }
    const includes = params.domainFilter?.some((domain)=>!domain.startsWith("-"));
    const excludes = params.domainFilter?.some((domain)=>domain.startsWith("-"));
    if (includes && excludes) {
        return {
            error: "Perplexity Search domain filters must use either include_domains or exclude_domains, not both"
        };
    }
    if (params.language && !parsed.data.search_language_filter && !normalizeLanguage(params.language)) {
        return {
            error: "Perplexity Search language must be a two-letter ISO 639-1 code"
        };
    }
    return {
        options: parsed.data
    };
}
function buildPerplexityRequest(config, params) {
    const options = parsePerplexitySearchOptions(params).options ?? {};
    const body = {
        query: params.query,
        max_results: params.maxResults,
        ...options
    };
    if (params.country) body.country = params.country.toUpperCase();
    const language = normalizeLanguage(params.language);
    if (language && !body.search_language_filter) body.search_language_filter = [
        language
    ];
    if (params.domainFilter?.length) body.search_domain_filter = params.domainFilter;
    if (params.timeRange && params.timeRange !== "any" && !body.search_recency_filter) {
        body.search_recency_filter = params.timeRange;
    }
    return {
        url: config.baseUrl,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${params.token}`
            },
            body: JSON.stringify(body)
        }
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/search/firecrawlSearch.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildFirecrawlSearchRequest",
    ()=>buildFirecrawlSearchRequest,
    "collectFirecrawlSearchHits",
    ()=>collectFirecrawlSearchHits,
    "normalizeFirecrawlSearchResponse",
    ()=>normalizeFirecrawlSearchResponse
]);
function parseDomainFilter(domainFilter) {
    if (!domainFilter?.length) return {
        includes: [],
        excludes: []
    };
    const includes = domainFilter.filter((d)=>!d.startsWith("-"));
    const excludes = domainFilter.filter((d)=>d.startsWith("-")).map((d)=>d.slice(1));
    return {
        includes,
        excludes
    };
}
function firecrawlSearchTbs(timeRange) {
    if (!timeRange || timeRange === "any") return undefined;
    const map = {
        day: "qdr:d",
        week: "qdr:w",
        month: "qdr:m",
        year: "qdr:y"
    };
    return map[timeRange];
}
function buildFirecrawlSearchRequest(config, params) {
    const envBase = process.env.FIRECRAWL_BASE_URL?.trim().replace(/\/+$/, "");
    const providerData = params.providerSpecificData;
    const paramBase = typeof params.baseUrl === "string" ? params.baseUrl : providerData?.baseUrl;
    const customBase = typeof paramBase === "string" && paramBase.trim() ? paramBase.trim().replace(/\/+$/, "") : undefined;
    const rawBase = envBase || customBase;
    const url = rawBase ? `${rawBase}/v2/search` : config.baseUrl;
    const { includes, excludes } = parseDomainFilter(params.domainFilter);
    const source = params.searchType === "news" ? "news" : "web";
    const body = {
        query: params.query,
        limit: params.maxResults,
        sources: [
            source
        ]
    };
    if (params.country) body.country = params.country.toLowerCase();
    if (params.language) body.lang = params.language;
    const tbs = firecrawlSearchTbs(params.timeRange);
    if (tbs) body.tbs = tbs;
    if (includes.length) body.includeDomains = includes.map((d)=>d.toLowerCase());
    if (excludes.length) body.excludeDomains = excludes.map((d)=>d.toLowerCase());
    const headers = {
        "Content-Type": "application/json"
    };
    if (params.token) {
        headers.Authorization = `Bearer ${params.token}`;
    }
    return {
        url,
        init: {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        }
    };
}
function pickFirecrawlSearchItems(data, searchType) {
    const buckets = data?.data;
    if (!buckets || Array.isArray(buckets)) return [];
    const items = searchType === "news" ? buckets.news : buckets.web;
    return Array.isArray(items) ? items : [];
}
function collectFirecrawlSearchHits(data, searchType) {
    const isNews = searchType === "news";
    return pickFirecrawlSearchItems(data, searchType).map((item)=>({
            title: item.title || item.metadata?.title || "",
            url: item.url || item.metadata?.sourceURL || item.link || "",
            snippet: item.description || item.snippet || item.markdown?.slice(0, 300) || item.content?.slice(0, 300) || "",
            published_at: item.date || item.published_at || item.metadata?.publishedTime || null,
            image_url: item.imageUrl || undefined,
            source_type: isNews ? "news" : undefined
        }));
}
function normalizeFirecrawlSearchResponse(data, searchType, makeResult) {
    const now = new Date().toISOString();
    const results = collectFirecrawlSearchHits(data, searchType).map((item, idx)=>makeResult("firecrawl", item, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
}),
"[project]/open-sse/handlers/search.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleSearch",
    ()=>handleSearch
]);
/**
 * Search Handler
 *
 * Handles POST /v1/search requests.
 * Routes to search providers with automatic failover:
 *   serper-search, brave-search, perplexity-search, exa-search, tavily-search,
 *   firecrawl, google-pse-search, linkup-search, searchapi-search,
 *   youcom-search, searxng-search, ollama-search, zai-search, duckduckgo-free
 *
 * Request format:
 * {
 *   "query": "search query",
 *   "provider": "serper-search" | "brave-search" | ... // optional, auto-selects cheapest
 *   "max_results": 5,
 *   "search_type": "web" | "news"
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/searchRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$perplexitySearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/search/perplexitySearch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$firecrawlSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/search/firecrawlSearch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$freeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/freeWebSearch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$streamableHttp$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$perplexitySearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$freeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$streamableHttp$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$perplexitySearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$freeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$streamableHttp$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
// ── Constants ────────────────────────────────────────────────────────────
const GLOBAL_TIMEOUT_MS = 15_000;
// Non-retriable HTTP status codes — fail immediately, don't try alternate
const NON_RETRIABLE = new Set([
    400,
    401,
    403,
    404
]);
// ── Input Sanitization ──────────────────────────────────────────────────
// Control characters that should never appear in search queries
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
function sanitizeQuery(query) {
    if (CONTROL_CHAR_RE.test(query)) {
        return {
            clean: "",
            error: "Query contains invalid control characters"
        };
    }
    const clean = query.normalize("NFKC").trim().replace(/\s+/g, " ");
    if (clean.length === 0) {
        return {
            clean: "",
            error: "Query is empty after normalization"
        };
    }
    return {
        clean
    };
}
// ── Response Normalizers ────────────────────────────────────────────────
function makeResult(providerId, item, idx, now) {
    const url = item.url || "";
    return {
        title: item.title || "",
        url,
        display_url: url ? url.replace(/^https?:\/\/(www\.)?/, "").split("?")[0] : undefined,
        snippet: item.snippet || "",
        position: idx + 1,
        score: typeof item.score === "number" ? Math.min(1, Math.max(0, item.score)) : null,
        published_at: item.published_at || null,
        favicon_url: item.favicon_url || null,
        content: item.full_text ? {
            format: item.text_format || "text",
            text: item.full_text,
            length: item.full_text.length
        } : null,
        metadata: {
            author: item.author || null,
            language: null,
            source_type: item.source_type || null,
            image_url: item.image_url || null
        },
        citation: {
            provider: providerId,
            retrieved_at: now,
            rank: idx + 1
        },
        provider_raw: null
    };
}
function normalizeSerperResponse(data, _query, searchType) {
    const now = new Date().toISOString();
    const items = searchType === "news" ? data.news : data.organic;
    if (!Array.isArray(items)) return {
        results: [],
        totalResults: null
    };
    const results = items.map((item, idx)=>makeResult("serper-search", {
            title: item.title,
            url: item.link,
            snippet: item.snippet || item.description,
            published_at: item.date
        }, idx, now));
    return {
        results,
        totalResults: typeof data.searchParameters?.totalResults === "number" ? data.searchParameters.totalResults : null
    };
}
function normalizeBraveResponse(data, _query, searchType) {
    const now = new Date().toISOString();
    // Brave news endpoint returns { results: [...] } directly,
    // while web endpoint returns { web: { results: [...] } }
    const container = searchType === "news" ? data.news || data : data.web;
    const items = container?.results;
    if (!Array.isArray(items)) return {
        results: [],
        totalResults: null
    };
    const results = items.map((item, idx)=>makeResult("brave-search", {
            title: item.title,
            url: item.url,
            snippet: item.description,
            published_at: item.page_age || item.age,
            favicon_url: item.meta_url?.favicon || item.favicon
        }, idx, now));
    return {
        results,
        totalResults: container?.totalCount ?? null
    };
}
// ── Helpers ─────────────────────────────────────────────────────────────
function parseDomainFilter(domainFilter) {
    if (!domainFilter?.length) return {
        includes: [],
        excludes: []
    };
    const includes = domainFilter.filter((d)=>!d.startsWith("-"));
    const excludes = domainFilter.filter((d)=>d.startsWith("-")).map((d)=>d.slice(1));
    return {
        includes,
        excludes
    };
}
function getProviderSettingString(params, key) {
    const fromOptions = params.providerOptions?.[key];
    if (typeof fromOptions === "string" && fromOptions.trim().length > 0) {
        return fromOptions.trim();
    }
    const fromProviderData = params.providerSpecificData?.[key];
    if (typeof fromProviderData === "string" && fromProviderData.trim().length > 0) {
        return fromProviderData.trim();
    }
    return undefined;
}
function resolveSearchBaseUrl(config, params) {
    const override = getProviderSettingString(params, "baseUrl");
    return (override || config.baseUrl).replace(/\/+$/, "");
}
function toSearchPageNumber(offset, maxResults) {
    if (typeof offset !== "number" || offset <= 0 || maxResults <= 0) return undefined;
    return Math.floor(offset / maxResults) + 1;
}
function buildSerperRequest(config, params) {
    const endpoint = params.searchType === "news" ? "/news" : "/search";
    const body = {
        q: params.query,
        num: params.maxResults
    };
    if (params.country) body.gl = params.country.toLowerCase();
    if (params.language) body.hl = params.language;
    return {
        url: `${config.baseUrl}${endpoint}`,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": params.token
            },
            body: JSON.stringify(body)
        }
    };
}
function buildBraveRequest(config, params) {
    const endpoint = params.searchType === "news" ? "/news/search" : "/web/search";
    const qp = new URLSearchParams({
        q: params.query,
        count: String(params.maxResults)
    });
    if (params.country) qp.set("country", params.country);
    if (params.language) qp.set("search_lang", params.language);
    return {
        url: `${config.baseUrl}${endpoint}?${qp}`,
        init: {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-Subscription-Token": params.token
            }
        }
    };
}
function buildExaRequest(config, params) {
    const { includes, excludes } = parseDomainFilter(params.domainFilter);
    const body = {
        query: params.query,
        numResults: params.maxResults,
        type: "auto",
        text: true,
        highlights: true
    };
    if (includes.length) body.includeDomains = includes;
    if (excludes.length) body.excludeDomains = excludes;
    if (params.searchType === "news") body.category = "news";
    return {
        url: config.baseUrl,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": params.token
            },
            body: JSON.stringify(body)
        }
    };
}
function buildTavilyRequest(config, params) {
    const { includes, excludes } = parseDomainFilter(params.domainFilter);
    const body = {
        query: params.query,
        max_results: params.maxResults,
        topic: params.searchType === "news" ? "news" : "general"
    };
    if (includes.length) body.include_domains = includes;
    if (excludes.length) body.exclude_domains = excludes;
    if (params.country) body.country = params.country;
    return {
        url: config.baseUrl,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${params.token}`
            },
            body: JSON.stringify(body)
        }
    };
}
function buildGooglePseRequest(config, params) {
    const apiKey = params.token;
    const cx = getProviderSettingString(params, "cx");
    if (!apiKey || !cx) {
        throw new Error("Google Programmable Search requires both apiKey and cx");
    }
    const qp = new URLSearchParams({
        key: apiKey,
        cx,
        q: params.query,
        num: String(Math.min(params.maxResults, 10))
    });
    if (params.country) qp.set("gl", params.country.toLowerCase());
    if (params.language) qp.set("hl", params.language);
    if (params.timeRange && params.timeRange !== "any") {
        const dateRestrictMap = {
            day: "d1",
            week: "w1",
            month: "m1",
            year: "y1"
        };
        const dateRestrict = dateRestrictMap[params.timeRange];
        if (dateRestrict) qp.set("dateRestrict", dateRestrict);
    }
    if (typeof params.offset === "number" && params.offset > 0) {
        qp.set("start", String(Math.min(params.offset + 1, 91)));
    }
    return {
        url: `${resolveSearchBaseUrl(config, params)}?${qp}`,
        init: {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        }
    };
}
function buildLinkupRequest(config, params) {
    const apiKey = params.token;
    if (!apiKey) {
        throw new Error("Linkup Search requires an API key");
    }
    const { includes, excludes } = parseDomainFilter(params.domainFilter);
    const requestedDepth = getProviderSettingString(params, "depth");
    const depth = requestedDepth && [
        "fast",
        "standard",
        "deep"
    ].includes(requestedDepth) ? requestedDepth : "standard";
    const body = {
        q: params.query,
        depth,
        outputType: "searchResults",
        maxResults: params.maxResults
    };
    if (includes.length) body.includeDomains = includes;
    if (excludes.length) body.excludeDomains = excludes;
    if (params.timeRange && params.timeRange !== "any") {
        const today = new Date();
        const toDate = today.toISOString().slice(0, 10);
        const from = new Date(today);
        if (params.timeRange === "day") from.setUTCDate(from.getUTCDate() - 1);
        if (params.timeRange === "week") from.setUTCDate(from.getUTCDate() - 7);
        if (params.timeRange === "month") from.setUTCMonth(from.getUTCMonth() - 1);
        if (params.timeRange === "year") from.setUTCFullYear(from.getUTCFullYear() - 1);
        body.fromDate = from.toISOString().slice(0, 10);
        body.toDate = toDate;
    }
    return {
        url: resolveSearchBaseUrl(config, params),
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        }
    };
}
function buildSearchApiRequest(config, params) {
    const apiKey = params.token;
    if (!apiKey) {
        throw new Error("SearchAPI requires an API key");
    }
    const qp = new URLSearchParams({
        engine: params.searchType === "news" ? "google_news" : "google",
        q: params.query,
        api_key: apiKey
    });
    if (params.country) qp.set("gl", params.country.toLowerCase());
    if (params.language) qp.set("hl", params.language);
    const page = toSearchPageNumber(params.offset, params.maxResults);
    if (page) qp.set("page", String(page));
    return {
        url: `${resolveSearchBaseUrl(config, params)}?${qp}`,
        init: {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        }
    };
}
function buildYouComRequest(config, params) {
    const apiKey = params.token;
    if (!apiKey) {
        throw new Error("You.com Search requires an API key");
    }
    const { includes, excludes } = parseDomainFilter(params.domainFilter);
    const qp = new URLSearchParams({
        query: params.query,
        count: String(Math.min(params.maxResults, 100))
    });
    if (params.timeRange && params.timeRange !== "any") {
        qp.set("freshness", params.timeRange);
    }
    if (typeof params.offset === "number" && params.offset > 0 && params.maxResults > 0) {
        qp.set("offset", String(Math.min(Math.floor(params.offset / params.maxResults), 9)));
    }
    if (params.country) qp.set("country", params.country);
    if (params.language) qp.set("language", params.language);
    if (includes.length) qp.set("include_domains", includes.join(","));
    if (excludes.length) qp.set("exclude_domains", excludes.join(","));
    if (params.contentOptions?.full_page) {
        qp.set("livecrawl", params.searchType === "news" ? "news" : "web");
        qp.append("livecrawl_formats", params.contentOptions.format === "markdown" ? "markdown" : "html");
    }
    return {
        url: `${resolveSearchBaseUrl(config, params)}?${qp}`,
        init: {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-API-Key": apiKey
            }
        }
    };
}
function buildSearxngRequest(config, params) {
    const baseUrl = resolveSearchBaseUrl(config, params);
    const url = baseUrl.endsWith("/search") ? baseUrl : `${baseUrl}/search`;
    const qp = new URLSearchParams({
        q: params.query,
        format: "json",
        categories: params.searchType === "news" ? "news" : "general"
    });
    if (params.language) qp.set("language", params.language);
    if (params.timeRange && params.timeRange !== "any") qp.set("time_range", params.timeRange);
    const page = toSearchPageNumber(params.offset, params.maxResults);
    if (page) qp.set("pageno", String(page));
    const headers = {
        Accept: "application/json"
    };
    if (params.token) {
        headers["Authorization"] = `Bearer ${params.token}`;
    }
    return {
        url: `${url}?${qp}`,
        init: {
            method: "GET",
            headers
        }
    };
}
function buildOllamaRequest(config, params) {
    return {
        url: resolveSearchBaseUrl(config, params),
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...params.token ? {
                    Authorization: `Bearer ${params.token}`
                } : {}
            },
            body: JSON.stringify({
                query: params.query,
                max_results: params.maxResults
            })
        }
    };
}
function buildRequest(config, params) {
    if (config.id === "serper-search") return buildSerperRequest(config, params);
    if (config.id === "brave-search") return buildBraveRequest(config, params);
    if (config.id === "perplexity-search") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$perplexitySearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildPerplexityRequest"])(config, params);
    if (config.id === "exa-search") return buildExaRequest(config, params);
    if (config.id === "tavily-search") return buildTavilyRequest(config, params);
    if (config.id === "firecrawl") return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$firecrawlSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFirecrawlSearchRequest"](config, params);
    if (config.id === "google-pse-search") return buildGooglePseRequest(config, params);
    if (config.id === "linkup-search") return buildLinkupRequest(config, params);
    if (config.id === "searchapi-search") return buildSearchApiRequest(config, params);
    if (config.id === "youcom-search") return buildYouComRequest(config, params);
    if (config.id === "searxng-search") return buildSearxngRequest(config, params);
    if (config.id === "ollama-search") return buildOllamaRequest(config, params);
    // Fallback for future providers: POST with bearer auth
    return {
        url: resolveSearchBaseUrl(config, params),
        init: {
            method: config.method,
            headers: {
                "Content-Type": "application/json",
                ...params.token ? {
                    Authorization: `Bearer ${params.token}`
                } : {}
            },
            body: JSON.stringify({
                query: params.query,
                max_results: params.maxResults,
                search_type: params.searchType
            })
        }
    };
}
function normalizePerplexityResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = data.results;
    if (!Array.isArray(items)) return {
        results: [],
        totalResults: null
    };
    const results = items.map((item, idx)=>makeResult("perplexity-search", {
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            published_at: item.date || item.last_updated
        }, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
function normalizeExaResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = data.results;
    if (!Array.isArray(items)) return {
        results: [],
        totalResults: null
    };
    const results = items.map((item, idx)=>makeResult("exa-search", {
            title: item.title,
            url: item.url,
            snippet: item.highlights?.[0] || item.text?.slice(0, 300) || "",
            score: item.score,
            published_at: item.publishedDate,
            favicon_url: item.favicon,
            author: item.author,
            image_url: item.image,
            full_text: item.text,
            text_format: "text"
        }, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
function normalizeTavilyResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = data.results;
    if (!Array.isArray(items)) return {
        results: [],
        totalResults: null
    };
    const results = items.map((item, idx)=>makeResult("tavily-search", {
            title: item.title,
            url: item.url,
            snippet: item.content || "",
            score: item.score,
            published_at: item.published_date,
            full_text: item.raw_content,
            text_format: "text"
        }, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
function normalizeGooglePseResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = Array.isArray(data.items) ? data.items : [];
    const results = items.map((item, idx)=>makeResult("google-pse-search", {
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            image_url: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"]
        }, idx, now));
    const totalResultsRaw = data.searchInformation?.totalResults ?? data.queries?.request?.[0]?.totalResults ?? null;
    const totalResults = typeof totalResultsRaw === "string" ? Number(totalResultsRaw) : totalResultsRaw;
    return {
        results,
        totalResults: Number.isFinite(totalResults) ? totalResults : null
    };
}
function normalizeLinkupResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = Array.isArray(data.results) ? data.results : [];
    const results = items.map((item, idx)=>makeResult("linkup-search", {
            title: item.name || item.title,
            url: item.url,
            snippet: item.content || item.snippet || "",
            source_type: item.type || "web",
            image_url: item.image_url || item.imageUrl || null,
            full_text: item.content,
            text_format: "text"
        }, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
function normalizeSearchApiResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = Array.isArray(data.organic_results) ? data.organic_results : Array.isArray(data.top_stories) ? data.top_stories : [];
    const results = items.map((item, idx)=>makeResult("searchapi-search", {
            title: item.title,
            url: item.link,
            snippet: item.snippet || item.description || "",
            published_at: item.date || item.published_at,
            favicon_url: item.favicon,
            author: item.source || null,
            image_url: item.thumbnail || null
        }, idx, now));
    const totalResults = typeof data.search_information?.total_results === "number" ? data.search_information.total_results : typeof data.search_information?.total_results === "string" ? Number(data.search_information.total_results) : null;
    return {
        results,
        totalResults: Number.isFinite(totalResults) ? totalResults : results.length
    };
}
function normalizeYouComResponse(data, _query, searchType) {
    const now = new Date().toISOString();
    const resultsContainer = data?.results && typeof data.results === "object" ? data.results : undefined;
    const section = searchType === "news" ? resultsContainer?.news || [] : resultsContainer?.web || [];
    const items = Array.isArray(section) ? section : [];
    const results = items.map((item, idx)=>{
        const firstSnippet = Array.isArray(item.snippets) ? item.snippets.find((value)=>typeof value === "string") : null;
        const livecrawlText = typeof item.markdown === "string" ? item.markdown : typeof item.html === "string" ? item.html : undefined;
        const livecrawlFormat = typeof item.markdown === "string" ? "markdown" : "html";
        return makeResult("youcom-search", {
            title: item.title,
            url: item.url,
            snippet: typeof firstSnippet === "string" ? firstSnippet : typeof item.description === "string" ? item.description : "",
            published_at: item.page_age,
            favicon_url: item.favicon_url,
            image_url: item.thumbnail_url,
            source_type: searchType,
            full_text: livecrawlText,
            text_format: livecrawlText ? livecrawlFormat : undefined
        }, idx, now);
    });
    return {
        results,
        totalResults: results.length
    };
}
function normalizeSearxngResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = Array.isArray(data.results) ? data.results : [];
    const results = items.map((item, idx)=>makeResult("searxng-search", {
            title: item.title,
            url: item.url,
            snippet: item.content || item.snippet || "",
            published_at: item.publishedDate || item.published_date || null,
            source_type: Array.isArray(item.engines) ? item.engines.join(", ") : item.engine || item.category || null,
            image_url: item.thumbnail || item.img_src || null
        }, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
function normalizeOllamaResponse(data, _query, _searchType) {
    const now = new Date().toISOString();
    const items = Array.isArray(data?.results) ? data.results : [];
    const results = items.map((item, idx)=>makeResult("ollama-search", {
            title: item?.title,
            url: item?.url,
            snippet: item?.content || "",
            full_text: item?.content,
            text_format: "text"
        }, idx, now));
    return {
        results,
        totalResults: results.length
    };
}
// ── Z.AI Coding Plan Search MCP Execution ───────────────────────────
// Schema for the Z.AI MCP web_search_prime tool result. Z.AI double-encodes
// the results array as a JSON string inside the MCP text content, so we
// safely unwrap it with a typed schema instead of `JSON.parse(parsed)`.
const ZaiSearchItemSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    link: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    publish_date: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    icon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    media: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
}).passthrough();
const ZaiSearchResultsSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(ZaiSearchItemSchema);
/**
 * Unwrap the double-encoded JSON from a Z.AI MCP web_search_prime response.
 *
 * Quirk: the MCP server returns a text content block whose body is a JSON
 * string. That JSON string, once parsed, is itself another JSON string
 * containing the actual results array. We try a single parse first
 * (in case the upstream behavior ever changes), then a nested parse.
 * Both paths are validated through `ZaiSearchResultsSchema` so any shape
 * regression upstream lands in our error path instead of corrupting results.
 */ function unwrapZaiContent(rawText) {
    let parsed;
    try {
        parsed = JSON.parse(rawText);
    } catch  {
        return null;
    }
    // Direct array path (defensive, in case Z.AI stops double-encoding).
    const direct = ZaiSearchResultsSchema.safeParse(parsed);
    if (direct.success) return direct.data;
    // Documented Z.AI behavior: parsed is a JSON string of the results array.
    if (typeof parsed !== "string") return null;
    let inner;
    try {
        inner = JSON.parse(parsed);
    } catch  {
        return null;
    }
    const validated = ZaiSearchResultsSchema.safeParse(inner);
    return validated.success ? validated.data : null;
}
async function zaiSearchExecute(params) {
    const baseUrl = resolveSearchBaseUrl(params.config, params.params);
    const transport = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$streamableHttp$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["StreamableHTTPClientTransport"](new URL(baseUrl), {
        fetch: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"],
        requestInit: {
            headers: {
                Authorization: `Bearer ${params.token}`
            }
        }
    });
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$modelcontextprotocol$2f$sdk$2f$dist$2f$esm$2f$client$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Client"]({
        name: "omniroute-search",
        version: "1.0"
    }, {
        capabilities: {}
    });
    const { signal } = params;
    let abortHandler;
    if (signal) {
        if (signal.aborted) {
            throw new DOMException("The operation was aborted", "AbortError");
        }
        abortHandler = ()=>{
            client.close().catch(()=>{});
        };
        signal.addEventListener("abort", abortHandler, {
            once: true
        });
    }
    try {
        await client.connect(transport);
        if (signal?.aborted) {
            throw new DOMException("The operation was aborted", "AbortError");
        }
        const args = {
            search_query: params.query
        };
        const { includes } = parseDomainFilter(params.params.domainFilter);
        if (includes.length > 0) {
            args.search_domain_filter = includes.join(",");
        }
        const toolResult = await client.callTool({
            name: "web_search_prime",
            arguments: args
        });
        const rawContent = Array.isArray(toolResult.content) ? toolResult.content : [];
        const rawText = rawContent.filter((c)=>c?.type === "text").map((c)=>typeof c?.text === "string" ? c.text : "").join("\n");
        if (!rawText.trim()) {
            return {
                results: [],
                totalResults: null
            };
        }
        const items = unwrapZaiContent(rawText);
        if (!items) {
            return {
                results: [],
                totalResults: null
            };
        }
        const now = new Date().toISOString();
        const results = items.map((item, idx)=>makeResult("zai-search", {
                title: item.title,
                url: item.link,
                snippet: item.content || "",
                published_at: item.publish_date,
                favicon_url: item.icon,
                source_type: item.media
            }, idx, now));
        return {
            results,
            totalResults: results.length
        };
    } finally{
        if (abortHandler && signal) {
            signal.removeEventListener("abort", abortHandler);
        }
        await client.close();
    }
}
async function tryZaiMCPProvider(config, params, token, providerSpecificData, startTime, globalStartTime, log) {
    const { query, searchType, maxResults } = params;
    const remainingGlobal = GLOBAL_TIMEOUT_MS - (Date.now() - globalStartTime);
    const timeout = Math.min(config.timeoutMs, Math.max(remainingGlobal, 1000));
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeout);
    try {
        const normalized = await zaiSearchExecute({
            config,
            query,
            token,
            params: {
                ...params,
                token,
                providerSpecificData
            },
            signal: controller.signal
        });
        clearTimeout(timer);
        const results = normalized.results.slice(0, maxResults);
        const duration = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: config.method,
            path: "/v1/search",
            status: 200,
            model: config.id,
            provider: config.id,
            duration,
            requestType: "search",
            tokens: {
                prompt_tokens: 0,
                completion_tokens: 0
            },
            requestBody: {
                query: query.slice(0, 200),
                search_type: searchType,
                max_results: maxResults
            },
            responseBody: {
                results_count: results.length,
                cached: false
            }
        }).catch(()=>{
        /* non-critical — logging must not block search response */ });
        return {
            success: true,
            data: {
                provider: config.id,
                query,
                results,
                answer: null,
                usage: {
                    queries_used: 1,
                    search_cost_usd: config.costPerQuery
                },
                metrics: {
                    response_time_ms: duration,
                    upstream_latency_ms: duration,
                    total_results_available: normalized.totalResults
                },
                errors: []
            }
        };
    } catch (err) {
        clearTimeout(timer);
        const isTimeout = err.name === "AbortError";
        if (log) {
            log.error("SEARCH", `${config.id} MCP ${isTimeout ? "timeout" : "error"}: ${err.message}`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: config.method,
            path: "/v1/search",
            status: isTimeout ? 504 : 502,
            model: config.id,
            provider: config.id,
            duration: Date.now() - startTime,
            requestType: "search",
            error: err.message,
            requestBody: {
                query: query.slice(0, 200),
                search_type: searchType,
                max_results: maxResults
            }
        }).catch(()=>{
        /* non-critical — logging must not block search response */ });
        return {
            success: false,
            status: isTimeout ? 504 : 502,
            error: `Search provider ${isTimeout ? "timeout" : "error"}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message)}`
        };
    }
}
function normalizeResponse(providerId, data, query, searchType) {
    if (providerId === "serper-search") return normalizeSerperResponse(data, query, searchType);
    if (providerId === "brave-search") return normalizeBraveResponse(data, query, searchType);
    if (providerId === "perplexity-search") return normalizePerplexityResponse(data, query, searchType);
    if (providerId === "exa-search") return normalizeExaResponse(data, query, searchType);
    if (providerId === "tavily-search") return normalizeTavilyResponse(data, query, searchType);
    if (providerId === "firecrawl") return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$firecrawlSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeFirecrawlSearchResponse"](data, searchType, makeResult);
    if (providerId === "google-pse-search") return normalizeGooglePseResponse(data, query, searchType);
    if (providerId === "linkup-search") return normalizeLinkupResponse(data, query, searchType);
    if (providerId === "searchapi-search") return normalizeSearchApiResponse(data, query, searchType);
    if (providerId === "youcom-search") return normalizeYouComResponse(data, query, searchType);
    if (providerId === "searxng-search") return normalizeSearxngResponse(data, query, searchType);
    if (providerId === "ollama-search") return normalizeOllamaResponse(data, query, searchType);
    return {
        results: [],
        totalResults: null
    };
}
async function handleSearch(options) {
    const { query, provider: providerId, maxResults, searchType, country, language, timeRange, offset, domainFilter, contentOptions, providerOptions, credentials, alternateProvider, alternateCredentials, log } = options;
    const startTime = Date.now();
    // 1. Sanitize input
    const { clean: cleanQuery, error: sanitizeError } = sanitizeQuery(query);
    if (sanitizeError) {
        return {
            success: false,
            status: 400,
            error: sanitizeError
        };
    }
    // 2. Use resolved provider from route (no re-resolution)
    const primaryConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSearchProvider"])(providerId);
    if (!primaryConfig) {
        return {
            success: false,
            status: 400,
            error: `Unknown search provider: ${providerId}`
        };
    }
    // 3. Get alternate config for failover (pre-resolved by route)
    const alternateConfig = alternateProvider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSearchProvider"])(alternateProvider) : null;
    const requestParams = {
        query: cleanQuery,
        searchType,
        maxResults,
        country,
        language,
        timeRange,
        offset,
        domainFilter,
        contentOptions,
        providerOptions
    };
    if (primaryConfig.id === "perplexity-search") {
        const perplexityValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2f$perplexitySearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parsePerplexitySearchOptions"])(requestParams);
        if (perplexityValidation.error) {
            return {
                success: false,
                status: 400,
                error: perplexityValidation.error
            };
        }
    }
    // 4. Try primary provider
    const result = await tryProvider(primaryConfig, requestParams, credentials, startTime, log);
    if (result.success) return result;
    // 5. Failover to alternate (only for retriable errors and auto-select mode)
    if (alternateConfig && alternateCredentials && !NON_RETRIABLE.has(result.status || 0) && Date.now() - startTime < GLOBAL_TIMEOUT_MS) {
        if (log) {
            log.warn("SEARCH", `${primaryConfig.id} failed (${result.status}), trying ${alternateConfig.id}`);
        }
        const fallbackResult = await tryProvider(alternateConfig, requestParams, alternateCredentials, startTime, log);
        if (fallbackResult.success) return fallbackResult;
    }
    return result;
}
/**
 * Free DuckDuckGo lite provider — no API key, HTML scraping (free-claude-code port).
 * Dedicated path because the lite endpoint returns HTML, not the JSON the generic
 * tryProvider() flow expects. See open-sse/services/freeWebSearch.ts.
 */ async function tryDuckDuckGoFreeProvider(config, params, startTime, globalStartTime, log) {
    const { query, searchType, maxResults } = params;
    const remainingGlobal = GLOBAL_TIMEOUT_MS - (Date.now() - globalStartTime);
    const timeout = Math.min(config.timeoutMs, Math.max(remainingGlobal, 1000));
    if (log) {
        log.info?.("SEARCH", `${config.id} | query: "${query.slice(0, 80)}" | type: ${searchType}`);
    }
    const requestBody = {
        query: query.slice(0, 200),
        search_type: searchType,
        max_results: maxResults
    };
    try {
        const freeResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$freeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["freeWebSearch"])(query, maxResults, timeout);
        const now = new Date().toISOString();
        const results = freeResults.slice(0, maxResults).map((r, idx)=>makeResult(config.id, {
                title: r.title,
                url: r.url,
                snippet: r.snippet
            }, idx, now));
        const duration = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: config.method,
            path: "/v1/search",
            status: 200,
            model: config.id,
            provider: config.id,
            duration,
            requestType: "search",
            tokens: {
                prompt_tokens: 0,
                completion_tokens: 0
            },
            requestBody,
            responseBody: {
                results_count: results.length,
                cached: false
            }
        }).catch(()=>{
        /* non-critical — logging must not block search response */ });
        return {
            success: true,
            data: {
                provider: config.id,
                query,
                results,
                answer: null,
                usage: {
                    queries_used: 1,
                    search_cost_usd: 0
                },
                metrics: {
                    response_time_ms: duration,
                    upstream_latency_ms: duration,
                    total_results_available: results.length
                },
                errors: []
            }
        };
    } catch (err) {
        const duration = Date.now() - startTime;
        const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
        if (log) {
            log.error?.("SEARCH", `${config.id} error: ${message}`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: config.method,
            path: "/v1/search",
            status: 502,
            model: config.id,
            provider: config.id,
            duration,
            requestType: "search",
            error: message.slice(0, 500),
            requestBody
        }).catch(()=>{
        /* non-critical */ });
        return {
            success: false,
            status: 502,
            error: `DuckDuckGo free search failed: ${message}`
        };
    }
}
async function tryProvider(config, params, credentials, globalStartTime, log) {
    const startTime = Date.now();
    const providerSpecificData = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" ? credentials.providerSpecificData : undefined;
    const token = credentials.apiKey || credentials.accessToken || undefined;
    if (config.authType !== "none" && !token) {
        return {
            success: false,
            status: 401,
            error: `No credentials for search provider: ${config.id}`
        };
    }
    const { query, searchType, maxResults } = params;
    if (config.id === "duckduckgo-free") {
        return tryDuckDuckGoFreeProvider(config, params, startTime, globalStartTime, log);
    }
    if (config.id === "zai-search" && token) {
        return tryZaiMCPProvider(config, params, token, providerSpecificData, startTime, globalStartTime, log);
    }
    let url = "";
    let init = {};
    try {
        ({ url, init } = buildRequest(config, {
            ...params,
            token,
            providerSpecificData
        }));
    } catch (err) {
        return {
            success: false,
            status: 400,
            error: err?.message || `Invalid search configuration for provider: ${config.id}`
        };
    }
    // Timeout: min of provider timeout and remaining global timeout
    const remainingGlobal = GLOBAL_TIMEOUT_MS - (Date.now() - globalStartTime);
    const timeout = Math.min(config.timeoutMs, Math.max(remainingGlobal, 1000));
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeout);
    if (log) {
        log.info("SEARCH", `${config.id} | query: "${query.slice(0, 80)}" | type: ${searchType}`);
    }
    try {
        const response = await fetch(url, {
            ...init,
            signal: controller.signal
        });
        clearTimeout(timer);
        if (!response.ok) {
            const errorText = await response.text();
            if (log) {
                log.error("SEARCH", `${config.id} error ${response.status}: ${errorText.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: config.method,
                path: "/v1/search",
                status: response.status,
                model: config.id,
                provider: config.id,
                duration: Date.now() - startTime,
                requestType: "search",
                error: errorText.slice(0, 500),
                requestBody: {
                    query: query.slice(0, 200),
                    search_type: searchType,
                    max_results: maxResults
                }
            }).catch(()=>{
            /* non-critical — logging must not block search response */ });
            return {
                success: false,
                status: response.status,
                error: `Search provider ${config.id} returned ${response.status}`
            };
        }
        const data = await response.json();
        const normalized = normalizeResponse(config.id, data, query, searchType);
        // Enforce max_results — some providers return more than requested
        const results = normalized.results.slice(0, maxResults);
        const totalResults = normalized.totalResults;
        const duration = Date.now() - startTime;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: config.method,
            path: "/v1/search",
            status: 200,
            model: config.id,
            provider: config.id,
            duration,
            requestType: "search",
            tokens: {
                prompt_tokens: 0,
                completion_tokens: 0
            },
            requestBody: {
                query: query.slice(0, 200),
                search_type: searchType,
                max_results: maxResults
            },
            responseBody: {
                results_count: results.length,
                cached: false
            }
        }).catch(()=>{
        /* non-critical — logging must not block search response */ });
        return {
            success: true,
            data: {
                provider: config.id,
                query,
                results,
                answer: null,
                usage: {
                    queries_used: 1,
                    search_cost_usd: config.costPerQuery
                },
                metrics: {
                    response_time_ms: duration,
                    upstream_latency_ms: duration,
                    total_results_available: totalResults
                },
                errors: []
            }
        };
    } catch (err) {
        clearTimeout(timer);
        const isTimeout = err.name === "AbortError";
        if (log) {
            log.error("SEARCH", `${config.id} ${isTimeout ? "timeout" : "fetch error"}: ${err.message}`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: config.method,
            path: "/v1/search",
            status: isTimeout ? 504 : 502,
            model: config.id,
            provider: config.id,
            duration: Date.now() - startTime,
            requestType: "search",
            error: err.message,
            requestBody: {
                query: query.slice(0, 200),
                search_type: searchType,
                max_results: maxResults
            }
        }).catch(()=>{
        /* non-critical — logging must not block search response */ });
        return {
            success: false,
            status: isTimeout ? 504 : 502,
            error: `Search provider ${isTimeout ? "timeout" : "error"}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/webFetch.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleWebFetch",
    ()=>handleWebFetch
]);
/**
 * Web Fetch Handler
 *
 * Handles POST /v1/web/fetch requests.
 * Dispatches to a web-fetch provider executor (Firecrawl, Jina Reader, Tavily, or TinyFish).
 *
 * Request format:
 * {
 *   "url": "https://example.com",
 *   "provider": "firecrawl" | "jina-reader" | "tavily-search" | "tinyfish",  // optional
 *   "format": "markdown" | "html" | "links" | "screenshot",
 *   "depth": 0 | 1 | 2,
 *   "wait_for_selector": "main",
 *   "include_metadata": true
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$firecrawl$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/firecrawl-fetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$jina$2d$reader$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/jina-reader-fetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$tavily$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/tavily-fetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$tinyfish$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/tinyfish-fetch.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const WEB_FETCH_PROVIDERS = [
    "firecrawl",
    "jina-reader",
    "tavily-search",
    "tinyfish"
];
async function handleWebFetch(req, credentials, resolvedProvider) {
    const provider = resolvedProvider ?? req.provider ?? "firecrawl";
    const format = req.format ?? "markdown";
    const includeMetadata = req.include_metadata ?? false;
    try {
        switch(provider){
            case "firecrawl":
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$firecrawl$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["firecrawlFetch"])({
                    url: req.url,
                    format,
                    depth: req.depth ?? 0,
                    waitForSelector: req.wait_for_selector,
                    includeMetadata,
                    credentials
                });
            case "jina-reader":
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$jina$2d$reader$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jinaReaderFetch"])({
                    url: req.url,
                    format,
                    includeMetadata,
                    credentials
                });
            case "tavily-search":
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$tavily$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tavilyFetch"])({
                    url: req.url,
                    format,
                    includeMetadata,
                    credentials
                });
            case "tinyfish":
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$tinyfish$2d$fetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tinyfishFetch"])({
                    url: req.url,
                    format,
                    includeMetadata,
                    credentials
                });
            default:
                {
                    const _exhaustive = provider;
                    return {
                        success: false,
                        status: 400,
                        error: `Unknown web fetch provider: ${_exhaustive}`
                    };
                }
        }
    } catch (err) {
        const msg = err instanceof Error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(String(err));
        const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(502, msg);
        return {
            success: false,
            status: 502,
            error: body.error.message
        };
    }
}
}),
"[project]/open-sse/handlers/imageUpscale/shared.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MAX_UPSCALE_SOURCE_BYTES",
    ()=>MAX_UPSCALE_SOURCE_BYTES,
    "UPSCALE_CALL_LOG_PATH",
    ()=>UPSCALE_CALL_LOG_PATH,
    "buildUpscaleImageEntry",
    ()=>buildUpscaleImageEntry,
    "extractUpscaleSourceImage",
    ()=>extractUpscaleSourceImage,
    "readImageDimensions",
    ()=>readImageDimensions,
    "resolveUpscaleImageSource",
    ()=>resolveUpscaleImageSource,
    "saveUpscaleErrorResult",
    ()=>saveUpscaleErrorResult,
    "saveUpscaleSuccessResult",
    ()=>saveUpscaleSuccessResult,
    "scaleDimensions",
    ()=>scaleDimensions,
    "sniffImageMime",
    ()=>sniffImageMime,
    "toBlobBytes",
    ()=>toBlobBytes
]);
/**
 * Shared plumbing for the `/v1/images/upscale` provider handlers.
 *
 * Kept separate from `handlers/imageGeneration.ts` on purpose: upscaling needs raw
 * source bytes + pixel dimensions (to turn a 2x/4x factor into an output size for
 * providers that only accept absolute targets), neither of which the generation
 * handler exposes.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/remoteImageFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const UPSCALE_CALL_LOG_PATH = "/v1/images/upscale";
const MAX_UPSCALE_SOURCE_BYTES = 20 * 1024 * 1024;
function toBlobBytes(buffer) {
    const out = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(out).set(buffer);
    return out;
}
function extractUpscaleSourceImage(body) {
    if (!body || typeof body !== "object") return null;
    const b = body;
    const providerOptions = b.provider_options && typeof b.provider_options === "object" && !Array.isArray(b.provider_options) ? b.provider_options : {};
    const keys = [
        "image_url",
        "imageUrl",
        "input_image",
        "source_image",
        "promptImage",
        "prompt_image",
        "image",
        "images",
        "image_urls",
        "imageUrls",
        "input_images",
        "reference_images",
        "referenceImages",
        "reference_image"
    ];
    for (const key of keys){
        const found = firstImageCandidate(b[key]) || firstImageCandidate(providerOptions[key]);
        if (found) return found;
    }
    if (Array.isArray(b.messages)) {
        for (const msg of b.messages){
            if (!msg || typeof msg !== "object") continue;
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const part of content){
                if (!part || typeof part !== "object") continue;
                const p = part;
                if (p.type === "image_url" || p.type === "image") {
                    const found = firstImageCandidate(p.image_url ?? p.image ?? p.url);
                    if (found) return found;
                }
            }
        }
    }
    return null;
}
function firstImageCandidate(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
        return trimmed;
    }
    if (Array.isArray(value)) {
        for (const item of value){
            const found = firstImageCandidate(item);
            if (found) return found;
        }
        return null;
    }
    if (value && typeof value === "object") {
        const o = value;
        if (typeof o.url === "string") return firstImageCandidate(o.url);
        if (typeof o.image_url === "string") return firstImageCandidate(o.image_url);
        if (o.image_url && typeof o.image_url === "object") {
            return firstImageCandidate(o.image_url.url);
        }
        if (typeof o.b64_json === "string") return `data:image/png;base64,${o.b64_json}`;
        if (typeof o.base64 === "string") return `data:image/png;base64,${o.base64}`;
    }
    return null;
}
async function resolveUpscaleImageSource(source) {
    const trimmed = String(source || "").trim();
    if (!trimmed) throw new Error("Invalid image source");
    const dataUri = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i.exec(trimmed);
    if (dataUri) {
        const contentType = (dataUri[1] || "image/png").trim().toLowerCase();
        const base64 = (dataUri[2] || "").replace(/\s/g, "");
        const buffer = Buffer.from(base64, "base64");
        assertSourceBytes(buffer);
        return {
            buffer,
            base64,
            contentType: contentType.startsWith("image/") ? contentType : "image/png"
        };
    }
    if (/^https?:\/\//i.test(trimmed)) {
        const remote = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(trimmed);
        assertSourceBytes(remote.buffer);
        // fetchRemoteImage falls back to application/octet-stream; sniff whenever the
        // server did not send a usable image/* type so multipart uploads stay correct.
        const declared = (remote.contentType || "").split(";")[0].trim().toLowerCase();
        return {
            buffer: remote.buffer,
            base64: remote.buffer.toString("base64"),
            contentType: declared.startsWith("image/") ? declared : sniffImageMime(remote.buffer)
        };
    }
    const buffer = Buffer.from(trimmed.replace(/\s/g, ""), "base64");
    assertSourceBytes(buffer);
    return {
        buffer,
        base64: buffer.toString("base64"),
        contentType: sniffImageMime(buffer)
    };
}
function assertSourceBytes(buffer) {
    if (!buffer.length) throw new Error("Source image decoded to empty bytes");
    if (buffer.length > MAX_UPSCALE_SOURCE_BYTES) {
        throw new Error(`Source image too large (${buffer.length} bytes; max ${MAX_UPSCALE_SOURCE_BYTES})`);
    }
}
function sniffImageMime(buffer) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }
    if (buffer.length >= 8 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
        return "image/png";
    }
    if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") return "image/gif";
    if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
        return "image/webp";
    }
    if (buffer.length >= 2 && buffer.toString("ascii", 0, 2) === "BM") return "image/bmp";
    return "image/png";
}
function readImageDimensions(buffer) {
    try {
        if (buffer.length >= 24 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
            // IHDR is always the first chunk: 8-byte signature + 4 length + 4 "IHDR".
            return {
                width: buffer.readUInt32BE(16),
                height: buffer.readUInt32BE(20)
            };
        }
        if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") {
            return {
                width: buffer.readUInt16LE(6),
                height: buffer.readUInt16LE(8)
            };
        }
        if (buffer.length >= 26 && buffer.toString("ascii", 0, 2) === "BM") {
            return {
                width: buffer.readInt32LE(18),
                height: Math.abs(buffer.readInt32LE(22))
            };
        }
        if (buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
            return readWebpDimensions(buffer);
        }
        if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
            return readJpegDimensions(buffer);
        }
    } catch  {
        return null;
    }
    return null;
}
function readWebpDimensions(buffer) {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8 " && buffer.length >= 30) {
        // Lossy: 3-byte frame tag + 3-byte sync code, then 14-bit width/height.
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff
        };
    }
    if (chunk === "VP8L" && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: (bits >> 14 & 0x3fff) + 1
        };
    }
    if (chunk === "VP8X" && buffer.length >= 30) {
        const width = 1 + (buffer[24] | buffer[25] << 8 | buffer[26] << 16);
        const height = 1 + (buffer[27] | buffer[28] << 8 | buffer[29] << 16);
        return {
            width,
            height
        };
    }
    return null;
}
function readJpegDimensions(buffer) {
    let offset = 2;
    while(offset + 9 < buffer.length){
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        const marker = buffer[offset + 1];
        // Standalone markers (no length payload).
        if (marker === 0xd8 || marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) {
            offset += 2;
            continue;
        }
        const length = buffer.readUInt16BE(offset + 2);
        // SOF0..SOF15 except DHT(c4)/JPGA(c8)/DAC(cc) carry the frame dimensions.
        const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSof) {
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7)
            };
        }
        if (length <= 0) return null;
        offset += 2 + length;
    }
    return null;
}
function scaleDimensions(buffer, factor, maxEdge = 32000) {
    const source = readImageDimensions(buffer);
    if (!source || source.width <= 0 || source.height <= 0) return null;
    const safeFactor = Number.isFinite(factor) && factor > 0 ? factor : 2;
    const scale = Math.min(safeFactor, maxEdge / Math.max(source.width, source.height));
    return {
        width: Math.max(1, Math.round(source.width * Math.max(1, scale))),
        height: Math.max(1, Math.round(source.height * Math.max(1, scale)))
    };
}
function saveUpscaleSuccessResult(opts) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: UPSCALE_CALL_LOG_PATH,
        status: 200,
        model: `${opts.provider}/${opts.model}`,
        provider: opts.provider,
        duration: Date.now() - opts.startTime,
        requestBody: opts.requestBody ?? null,
        responseBody: opts.responseBody ?? {
            images_count: opts.images.length
        }
    }).catch(()=>{});
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: opts.images,
            ...opts.meta ? {
                upscale: opts.meta
            } : {}
        }
    };
}
function saveUpscaleErrorResult(opts) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: UPSCALE_CALL_LOG_PATH,
        status: opts.status,
        model: `${opts.provider}/${opts.model}`,
        provider: opts.provider,
        duration: Date.now() - opts.startTime,
        error: typeof opts.error === "string" ? opts.error.slice(0, 500) : String(opts.error).slice(0, 500),
        requestBody: opts.requestBody ?? null
    }).catch(()=>{});
    return {
        success: false,
        status: opts.status,
        error: opts.error
    };
}
function buildUpscaleImageEntry(opts) {
    const wantsBase64 = String(opts.responseFormat ?? "").toLowerCase() === "b64_json";
    if (opts.buffer && opts.buffer.length > 0) {
        const base64 = opts.buffer.toString("base64");
        const mime = opts.contentType || sniffImageMime(opts.buffer);
        return wantsBase64 ? {
            b64_json: base64
        } : {
            url: `data:${mime};base64,${base64}`
        };
    }
    return {
        url: String(opts.url || "")
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageUpscale/adobeFirefly.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdobeFireflyImageUpscale",
    ()=>handleAdobeFireflyImageUpscale
]);
/**
 * Adobe Firefly upscale handler — Topaz Labs models on firefly-3p `/v2/3p-images/upsample`.
 *
 * Flow (mirrors the SPA and the Firefly generate path):
 *   1. Resolve the durable session (JWT + Cookie → ARP rebuild, sticky ARP, submit gate).
 *   2. Upload the source image to `/v2/storage/image` → blob id, reusing that ARP.
 *   3. POST the upsample job, poll the BKS result link, return the presigned URL.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyUpscale.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageUpscale/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handleAdobeFireflyImageUpscale({ model, provider, body, credentials, log, fetchImpl = fetch }) {
    const startTime = Date.now();
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeUpscaleModel"])(model);
    if (!resolved) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: `Unsupported Adobe Firefly upscale model: ${model}. Use topaz-standard or topaz-bloom.`
        });
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractUpscaleSourceImage"])(body)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: "Adobe Firefly upscale requires a source image"
        });
    }
    try {
        const accessToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeAccessToken"])(credentials, fetchImpl);
        // Keep the raw credential blob for Cookie + sherlockToken (x-arp-session-id).
        const psd = credentials?.providerSpecificData;
        const sessionCookie = typeof psd?.cookie === "string" && psd.cookie.trim() || typeof credentials?.apiKey === "string" && credentials.apiKey.trim() || (typeof credentials?.accessToken === "string" && credentials.accessToken.includes(";") ? credentials.accessToken : undefined);
        // Upscale consumes exactly one source; upload it under the same ARP as submit.
        const blobIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeSourceImageIds"])({
            accessToken,
            body,
            max: 1,
            sessionCookie,
            prompt: "upsample",
            fetchImpl,
            log
        });
        if (blobIds.length === 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
                provider,
                model,
                status: 400,
                startTime,
                error: "Adobe Firefly upscale could not resolve the source image"
            });
        }
        const timeoutMs = normalizePositiveNumber(body.timeout_ms, 0);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyUpscaleImage"])({
            accessToken,
            model,
            blobId: blobIds[0],
            upsamplerFactor: readFactor(body),
            creativityPercent: readCreativityPercent(body),
            creativityLevel: body.creativity_level ?? body.creativityLevel,
            sessionCookie,
            ...timeoutMs > 0 ? {
                timeoutMs
            } : {},
            fetchImpl,
            log
        });
        log?.info?.("IMAGE", `${provider}/${model} (adobe-firefly upsample) | ${result.factor}x` + (resolved.spec.supportsCreativity ? ` | creativityLevel=${result.creativityLevel}` : ""));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleSuccessResult"])({
            provider,
            model,
            startTime,
            images: [
                {
                    url: result.url
                }
            ],
            meta: {
                provider,
                model,
                factor: result.factor,
                ...resolved.spec.supportsCreativity ? {
                    creativity_level: result.creativityLevel
                } : {}
            }
        });
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AdobeFireflyError"]) {
            log?.error?.("IMAGE", `${provider} adobe-firefly upscale error ${err.status}: ${err.message}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
                provider,
                model,
                status: err.status,
                startTime,
                error: err.message
            });
        }
        const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        log?.error?.("IMAGE", `${provider} adobe-firefly upscale exception: ${errorText}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
            provider,
            model,
            status: 500,
            startTime,
            error: errorText
        });
    }
}
function readFactor(body) {
    return body.factor ?? body.scale ?? body.upscale_factor ?? body.upscaleFactor ?? body.upsampler_factor ?? body.upsamplerFactor;
}
function readCreativityPercent(body) {
    const raw = body.creativity ?? body.creativity_percent ?? body.creativityPercent;
    if (raw === undefined || raw === null) return undefined;
    const n = typeof raw === "number" ? raw : Number(String(raw).replace("%", "").trim());
    if (!Number.isFinite(n)) return undefined;
    if (n > 0 && n < 1) return Math.max(0, Math.min(100, n * 100));
    return Math.max(0, Math.min(100, n));
}
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractImageGenerationCalls",
    ()=>extractImageGenerationCalls,
    "handleCodexImageEdit",
    ()=>handleCodexImageEdit,
    "handleImageEdit",
    ()=>handleImageEdit,
    "handleImageGeneration",
    ()=>handleImageGeneration,
    "handleOpenAIImageEdit",
    ()=>handleOpenAIImageEdit,
    "resolveImageBaseUrl",
    ()=>resolveImageBaseUrl,
    "saveImageErrorResult",
    ()=>saveImageErrorResult,
    "saveImageSuccessResult",
    ()=>saveImageSuccessResult
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
/**
 * Image Generation Handler
 *
 * Handles POST /v1/images/generations requests.
 * Proxies to upstream image generation providers using OpenAI-compatible format.
 *
 * Request format (OpenAI-compatible):
 * {
 *   "model": "openai/gpt-image-2",
 *   "prompt": "a beautiful sunset over mountains",
 *   "n": 1,
 *   "size": "1024x1024",
 *   "quality": "standard",       // optional: "standard" | "hd"
 *   "response_format": "url"     // optional: "url" | "b64_json"
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityClientProfile.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/image/sizeMapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/chatgpt-web.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/chatgptImageCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/sleep.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/comfyuiClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/remoteImageFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/fetchTimeout.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
// --- Per-provider handlers (extracted to co-located files in PR-#4582-batch) ---
// Imported locally so internal callers (handleImageGeneration / handleImageEdit)
// resolve to a real binding. extractMarkdownImageUrls + CHATGPT_WEB_IMAGE_ID_RE
// are still used by handleImageEdit below, so they are imported (not re-defined).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/sdWebUI.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/hyperbolic.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/huggingface.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/comfyUI.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/imagen3.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/googleImagen.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/ideogram.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/haiper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/leonardo.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/freepik.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/chatgptWeb.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/nvidiaNim.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/segmind.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/designerWeb.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/minimax.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/adobeFirefly.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$alibabaImage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/alibabaImage.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$pollinationsAnonAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/pollinationsAnonAuth.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const OPENAI_IMAGE_TO_IMAGE_MODELS = new Set([
    "black-forest-labs/FLUX.2-max",
    "black-forest-labs/FLUX.2-pro",
    "black-forest-labs/FLUX.2-flex",
    "black-forest-labs/FLUX.2-dev",
    "openai/gpt-image-1.5",
    "Wan-AI/Wan2.6-image",
    "Qwen/Qwen-Image-2.0-Pro",
    "Qwen/Qwen-Image-2.0",
    "google/flash-image-3.1",
    "google/gemini-3-pro-image",
    "flux-kontext-max",
    "flux-kontext",
    "flux-kontext-pro",
    "qwen-image"
]);
const IMAGE_ASPECT_RATIO_PATTERN = /^\d+:\d+$/;
function resolveImageBaseUrl(credentials, fallback, endpoint = "generations") {
    const psd = credentials?.providerSpecificData;
    const psdBaseUrl = psd && typeof psd === "object" && typeof psd.baseUrl === "string" && psd.baseUrl.trim() ? psd.baseUrl.trim() : null;
    const topLevelBaseUrl = typeof credentials?.baseUrl === "string" && credentials.baseUrl.trim() ? credentials.baseUrl.trim() : null;
    const nodeBaseUrl = psdBaseUrl || topLevelBaseUrl;
    if (!nodeBaseUrl) return fallback;
    // A single configured node serves both image routes: honor a base URL that already
    // points at the requested OpenAI image path, and rewrite one that points at the other
    // image endpoint (e.g. `.../images/generations` requested for edits) (#3214/#3215).
    const suffix = `/images/${endpoint}`;
    // Trim trailing slashes without a backtracking-prone regex (`/\/+$/` is a
    // polynomial-ReDoS pattern on long runs of "/" — CodeQL js/polynomial-redos).
    let normalized = nodeBaseUrl;
    while(normalized.endsWith("/"))normalized = normalized.slice(0, -1);
    if (normalized.endsWith(suffix)) return normalized;
    const stripped = normalized.replace(/\/images\/(?:generations|edits)$/, "");
    return `${stripped}${suffix}`;
}
function normalizeImageAspectRatio(value, fallbackSize) {
    if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (IMAGE_ASPECT_RATIO_PATTERN.test(trimmedValue)) return trimmedValue;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(typeof fallbackSize === "string" ? fallbackSize : null);
}
function parseJsonOrNull(value) {
    try {
        return JSON.parse(value);
    } catch  {
        return null;
    }
}
function sanitizeImageProviderError(errorText) {
    const parsed = parseJsonOrNull(errorText);
    if (parsed !== null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeUpstreamDetails"])(parsed) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errorText);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errorText);
}
const BFL_MODEL_ENDPOINTS = {
    "flux-2-max": "/v1/flux-2-max",
    "flux-2-pro": "/v1/flux-2-pro",
    "flux-2-flex": "/v1/flux-2-flex",
    "flux-2-klein-9b": "/v1/flux-2-klein-9b",
    "flux-2-klein-4b": "/v1/flux-2-klein-4b",
    "flux-kontext-pro": "/v1/flux-kontext-pro",
    "flux-kontext-max": "/v1/flux-kontext-max",
    "flux-pro-1.1": "/v1/flux-pro-1.1",
    "flux-pro-1.1-ultra": "/v1/flux-pro-1.1-ultra",
    "flux-dev": "/v1/flux-dev",
    "flux-pro": "/v1/flux-pro"
};
const BFL_EDIT_MODELS = new Set([
    "flux-2-max",
    "flux-2-pro",
    "flux-2-flex",
    "flux-kontext-pro",
    "flux-kontext-max"
]);
const BFL_FAILURE_STATUSES = new Set([
    "Error",
    "Failed",
    "Content Moderated",
    "Request Moderated"
]);
function formatImageProviderError(err) {
    const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
    const message = (sanitized || "").replace(/^Error:\s*/i, "").trim();
    return message ? `Image provider error: ${message}` : "Image provider error";
}
const STABILITY_GENERATION_ENDPOINTS = {
    "sd3.5-large": "/v2beta/stable-image/generate/sd3",
    "sd3.5-large-turbo": "/v2beta/stable-image/generate/sd3",
    "sd3.5-medium": "/v2beta/stable-image/generate/sd3",
    "sd3.5-flash": "/v2beta/stable-image/generate/sd3",
    "stable-image-ultra": "/v2beta/stable-image/generate/ultra",
    "stable-image-core": "/v2beta/stable-image/generate/core"
};
const STABILITY_EDIT_ENDPOINTS = {
    inpaint: "/v2beta/stable-image/edit/inpaint",
    outpaint: "/v2beta/stable-image/edit/outpaint",
    erase: "/v2beta/stable-image/edit/erase",
    "search-and-replace": "/v2beta/stable-image/edit/search-and-replace",
    "search-and-recolor": "/v2beta/stable-image/edit/search-and-recolor",
    "remove-background": "/v2beta/stable-image/edit/remove-background",
    "replace-background-and-relight": "/v2beta/stable-image/edit/replace-background-and-relight",
    fast: "/v2beta/stable-image/upscale/fast",
    conservative: "/v2beta/stable-image/upscale/conservative",
    creative: "/v2beta/stable-image/upscale/creative",
    sketch: "/v2beta/stable-image/control/sketch",
    structure: "/v2beta/stable-image/control/structure",
    style: "/v2beta/stable-image/control/style",
    "style-transfer": "/v2beta/stable-image/control/style-transfer"
};
const STABILITY_CONTROL_MODELS = new Set([
    "sketch",
    "structure",
    "style",
    "style-transfer"
]);
function appendOptionalFormValue(formData, key, value) {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
}
function appendImageFormValue(formData, key, source, filename) {
    formData.append(key, new Blob([
        source.buffer
    ], {
        type: source.contentType || "application/octet-stream"
    }), filename);
}
const FAL_PRESET_SIZES = {
    "1024x1024": "square_hd",
    "512x512": "square",
    "1792x1024": "landscape_16_9",
    "1024x1792": "portrait_16_9",
    "1024x768": "landscape_4_3",
    "768x1024": "portrait_4_3",
    "1536x1024": "landscape_3_2",
    "1024x1536": "portrait_3_2",
    "576x1024": "portrait_16_9",
    "1024x576": "landscape_16_9"
};
async function handleImageGeneration({ body, credentials, log, resolvedProvider = null, signal = null, clientHeaders = null }) {
    let provider, model;
    if (resolvedProvider) {
        // Provider was already resolved by the route layer (custom model from DB)
        // Extract model name from the full "provider/model" string
        provider = resolvedProvider;
        const modelStr = body.model || "";
        model = modelStr.startsWith(provider + "/") ? modelStr.slice(provider.length + 1) : modelStr;
    } else {
        // Standard path: resolve from built-in image registry
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseImageModel"])(body.model);
        provider = parsed.provider;
        model = parsed.model;
    }
    if (!provider) {
        return {
            success: false,
            status: 400,
            error: `Invalid image model: ${body.model}. Use format: provider/model`
        };
    }
    const providerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getImageProvider"])(provider);
    // For custom models without a built-in provider config, use OpenAI-compatible handler
    // with a synthetic config based on the provider's credentials
    if (!providerConfig) {
        if (!resolvedProvider) {
            return {
                success: false,
                status: 400,
                error: `Unknown image provider: ${provider}`
            };
        }
        // Custom model: use OpenAI-compatible format with provider's base URL
        // The credentials were already resolved by the route layer
        if (log) {
            log.info("IMAGE", `Custom model ${provider}/${model} — using OpenAI-compatible handler`);
        }
        const syntheticConfig = {
            id: provider,
            // #3205: custom OpenAI-compatible nodes store their base URL in
            // credentials.providerSpecificData.baseUrl (same as the chat path —
            // see executors/default.ts:buildUrl / services/provider.ts:buildProviderUrl).
            // Previously only the (always-absent) top-level credentials.baseUrl was
            // read, so every custom image node fell back to the Gemini endpoint and
            // returned "Please pass a valid API key".
            baseUrl: resolveImageBaseUrl(credentials, `https://generativelanguage.googleapis.com/v1beta/openai/images/generations`),
            authType: "apikey",
            authHeader: "bearer",
            format: "openai"
        };
        return handleOpenAIImageGeneration({
            model,
            provider,
            providerConfig: syntheticConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "gemini-image") {
        return handleGeminiImageGeneration({
            model,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "imagen3") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleImagen3ImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "google-imagen") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleGoogleImagenGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "hyperbolic") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleHyperbolicImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "huggingface-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleHuggingFaceImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "fal-ai") {
        return handleFalAIImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "stability-ai") {
        return handleStabilityAIImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "black-forest-labs") {
        return handleBlackForestLabsImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "recraft") {
        return handleRecraftImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "topaz") {
        return handleTopazImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "segmind") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSegmindImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "chatgpt-web") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleChatGptWebImageGeneration"])({
            model,
            provider,
            body,
            credentials,
            log,
            signal,
            clientHeaders
        });
    }
    if (providerConfig.format === "designer-web") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleDesignerWebImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "adobe-firefly-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAdobeFireflyImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "nanobanana") {
        return handleNanoBananaImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "kie-image") {
        return handleKieImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "sdwebui") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSDWebUIImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            log
        });
    }
    if (providerConfig.format === "comfyui") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleComfyUIImageGeneration"])({
            model,
            provider,
            providerConfig: {
                ...providerConfig,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComfyUiBaseUrl"])(credentials, providerConfig.baseUrl)
            },
            body,
            log
        });
    }
    if (providerConfig.format === "codex-responses") {
        return handleCodexImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "haiper-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleHaiperImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "leonardo-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleLeonardoImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "ideogram-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleIdeogramImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "freepik-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleFreepikImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "nvidia-nim") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleNvidiaNimImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "minimax-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleMinimaxImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "alibaba-image" || providerConfig.format === "qwen-cloud-image" || providerConfig.format === "qwen-token-plan-image" || providerConfig.format === "bailian-coding-plan-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$alibabaImage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAlibabaImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    return handleOpenAIImageGeneration({
        model,
        provider,
        providerConfig,
        body,
        credentials,
        log
    });
}
function normalizeKieImageResult(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(data.response) ? data.response : {};
    const resultJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKieResultJson"])(recordData);
    const urls = new Set();
    const add = (val)=>{
        if (typeof val === "string" && val.startsWith("http")) urls.add(val);
        if (Array.isArray(val)) {
            val.forEach((v)=>{
                if (typeof v === "string" && v.startsWith("http")) urls.add(v);
            });
        }
    };
    // Check resultJson (common in Market API)
    add(resultJson?.resultUrls);
    add(resultJson?.imageUrls);
    add(resultJson?.resultUrl);
    add(resultJson?.imageUrl);
    // Check data.response (common in 4o-image API)
    add(response.resultUrls);
    add(response.resultUrl);
    // Check direct data fields
    add(data.resultImageUrls);
    add(data.resultImageUrl);
    add(data.url);
    return Array.from(urls);
}
async function handleKieImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken;
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300000);
    const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, 2500);
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const size = typeof body.size === "string" ? body.size : undefined;
    if (!token) {
        return saveImageErrorResult({
            provider,
            model,
            status: 401,
            startTime,
            error: "KIE API key is required"
        });
    }
    // Check if model is a Market model (unified API)
    const fullRegistry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getImageProvider"])(provider);
    const modelEntry = fullRegistry?.models?.find((m)=>m.id === model);
    const isMarket = modelEntry?.isMarket || model.includes("/");
    const { imageUrl } = extractImageInputs(body);
    let baseUrl = "";
    let payload = {};
    if (isMarket) {
        // Unified Market API endpoint
        baseUrl = `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/jobs/createTask`;
        const input = {
            prompt,
            aspect_ratio: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(size)
        };
        if (imageUrl) {
            input.image_url = imageUrl;
        }
        payload = {
            model,
            input
        };
    } else {
        // Legacy/Direct endpoint
        const modelPath = model.replace("-t2i", "").replace("-i2i", "");
        baseUrl = providerConfig.baseUrl.includes(model) ? providerConfig.baseUrl : `https://api.kie.ai/api/v1/${modelPath}/generate`;
        payload = {
            prompt,
            size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(size),
            nVariants: body.n || 1
        };
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (${isMarket ? "market" : "direct"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const endpoint = isMarket ? "/api/v1/jobs/createTask" : new URL(baseUrl).pathname;
        const createBaseUrl = isMarket ? providerConfig.baseUrl : baseUrl.replace(endpoint, "");
        const createData = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl: createBaseUrl,
            token,
            payload,
            endpoint
        });
        const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieTaskId"])(createData);
        if (!taskId) {
            const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE image generation did not return taskId";
            if (log) {
                log.error("IMAGE", `KIE createTask failed: ${JSON.stringify(createData)}`);
            }
            return saveImageErrorResult({
                provider,
                model,
                status: 502,
                startTime,
                error: errorMessage,
                requestBody: payload
            });
        }
        // Use statusUrl from providerConfig if available, fallback to dynamic derivation
        const statusUrl = isMarket ? `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/jobs/recordInfo` : providerConfig.statusUrl && !providerConfig.statusUrl.includes("jobs/recordInfo") ? providerConfig.statusUrl : baseUrl.replace(/\/generate$/, "/record-info");
        const { data: recordData, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs,
            pollIntervalMs
        });
        if (state === "success") {
            if (log) {
                log.info("IMAGE", `KIE poll success for task ${taskId}`);
            }
            const urls = normalizeKieImageResult(recordData);
            const images = urls.map((url)=>({
                    url,
                    revised_prompt: prompt
                }));
            return saveImageSuccessResult({
                provider,
                model,
                startTime,
                requestBody: payload,
                responseBody: {
                    images_count: images.length
                },
                images
            });
        }
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
        const recordDataBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
        const errorMessage = recordDataBody.errorMessage || recordDataBody.failMsg || record.msg || "KIE image task failed";
        if (log) {
            log.error("IMAGE", `KIE poll failed for task ${taskId}: ${JSON.stringify(recordData)}`);
        }
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: String(errorMessage),
            requestBody: payload
        });
    } catch (err) {
        return saveImageErrorResult({
            provider,
            model,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorStatus"])(err, 502),
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorMessage"])(err, "KIE image generation failed")}`
        });
    }
}
/**
 * Handle Gemini-format image generation (Antigravity / Nano Banana)
 * Uses Gemini's generateContent API with responseModalities: ["TEXT", "IMAGE"]
 */ async function handleGeminiImageGeneration({ model, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const url = providerConfig.baseUrl;
    const provider = "antigravity";
    const credentialRecord = credentials || {};
    const token = credentialRecord.accessToken || credentialRecord.apiKey;
    const providerSpecificData = credentialRecord.providerSpecificData;
    const providerSpecificProjectId = providerSpecificData && typeof providerSpecificData === "object" ? providerSpecificData.projectId : null;
    const credentialProjectId = typeof credentialRecord.projectId === "string" ? credentialRecord.projectId.trim() : "";
    const providerProjectId = typeof providerSpecificProjectId === "string" ? providerSpecificProjectId.trim() : "";
    const projectId = credentialProjectId || providerProjectId || null;
    const candidateCount = typeof body.n === "number" && Number.isFinite(body.n) && body.n > 0 ? Math.floor(body.n) : 1;
    const promptText = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    // Summarized request for call log
    const logRequestBody = {
        model: body.model,
        prompt: promptText.slice(0, 200),
        size: body.size || "default",
        n: candidateCount
    };
    if (!projectId || typeof projectId !== "string") {
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "Missing Google projectId for Antigravity account. Please reconnect OAuth in Providers so OmniRoute can fetch your Cloud Code project.",
            requestBody: logRequestBody
        });
    }
    const antigravityBody = {
        project: projectId,
        requestId: `image_gen/${Date.now()}/${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])()}/0`,
        request: {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ],
            generationConfig: {
                candidateCount,
                imageConfig: {
                    aspectRatio: normalizeImageAspectRatio(body.aspect_ratio, body.size)
                }
            }
        },
        model,
        userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityEnvelopeUserAgent"])(credentialRecord),
        requestType: "image_gen"
    };
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyAntigravityClientProfileHeaders"])(headers, credentialRecord, antigravityBody);
    delete headers["x-goog-user-project"];
    if (log) {
        const promptPreview = promptText.slice(0, 60);
        log.info("IMAGE", `antigravity/${model} (gemini) | prompt: "${promptPreview}..." | format: gemini-image`);
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(antigravityBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            const safeError = sanitizeImageProviderError(errorText);
            const safeErrorLog = typeof safeError === "string" ? safeError : JSON.stringify(safeError ?? {});
            if (log) {
                log.error("IMAGE", `antigravity error ${response.status}: ${safeErrorLog.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: response.status,
                model: `antigravity/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: safeErrorLog.slice(0, 500),
                requestBody: logRequestBody
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: safeError
            };
        }
        const data = await response.json();
        const responseBody = data.response || data;
        // Extract image data from Antigravity's wrapped Gemini response.
        const images = [];
        const candidates = responseBody.candidates || [];
        for (const candidate of candidates){
            const parts = candidate.content?.parts || [];
            for (const part of parts){
                if (part.inlineData) {
                    images.push({
                        b64_json: part.inlineData.data,
                        revised_prompt: parts.find((p)=>p.text)?.text || promptText
                    });
                }
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `antigravity/${model}`,
            provider,
            duration: Date.now() - startTime,
            tokens: {
                prompt_tokens: 0,
                completion_tokens: 0
            },
            requestBody: logRequestBody,
            responseBody: {
                images_count: images.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: images
            }
        };
    } catch (err) {
        if (log) {
            log.error("IMAGE", `antigravity fetch error: ${err.message}`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `antigravity/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message,
            requestBody: logRequestBody
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
/**
 * Handle OpenAI-compatible image generation (standard providers + Nebius fallback)
 */ async function handleOpenAIImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    // Summarized request for call log
    const logRequestBody = {
        model: body.model,
        prompt: typeof body.prompt === "string" ? body.prompt.slice(0, 200) : String(body.prompt ?? "").slice(0, 200),
        size: body.size || "default",
        n: body.n || 1,
        quality: body.quality || undefined
    };
    // Build upstream request (OpenAI-compatible format)
    const upstreamBody = {
        model: model,
        prompt: body.prompt
    };
    // Pass optional parameters
    if (body.n !== undefined) upstreamBody.n = body.n;
    if (body.size !== undefined) upstreamBody.size = body.size;
    if (body.quality !== undefined) upstreamBody.quality = body.quality;
    if (body.response_format !== undefined) upstreamBody.response_format = body.response_format;
    if (body.style !== undefined) upstreamBody.style = body.style;
    const { imageUrl } = extractImageInputs(body);
    if (imageUrl && OPENAI_IMAGE_TO_IMAGE_MODELS.has(model)) {
        upstreamBody.image_url = imageUrl;
    }
    // Build headers
    let headers = {
        "Content-Type": "application/json"
    };
    const token = credentials.apiKey || credentials.accessToken;
    if (token && providerConfig.authHeader === "bearer") {
        headers["Authorization"] = `Bearer ${token}`;
    } else if (token && providerConfig.authHeader === "x-api-key") {
        headers["x-api-key"] = token;
    }
    // #8085 — keyless Pollinations image requests (the common free case) get
    // no Authorization header above. Mirror the chat executor's anonymous
    // fingerprint-pool fallback (open-sse/executors/pollinations.ts) so the
    // outbound request isn't sent bare and rejected by Pollinations' own 401.
    let pollinationsAnonSession = null;
    if (providerConfig.id === "pollinations") {
        const anon = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$pollinationsAnonAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyPollinationsAnonymousFallback"])(providerConfig.id, token, headers);
        headers = anon.headers;
        pollinationsAnonSession = anon.session;
    }
    if (log) {
        const promptPreview = typeof body.prompt === "string" ? body.prompt.slice(0, 60) : String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} | prompt: "${promptPreview}..." | size: ${body.size || "default"}`);
    }
    const requestBody = JSON.stringify(upstreamBody);
    // Try primary URL
    let result = await fetchImageEndpoint(providerConfig.baseUrl, headers, requestBody, provider, log);
    // Fallback for providers with fallbackUrl (e.g., Nebius)
    if (!result.success && providerConfig.fallbackUrl && [
        404,
        410,
        502,
        503
    ].includes(result.status)) {
        if (log) {
            log.info("IMAGE", `${provider}: primary URL failed (${result.status}), trying fallback...`);
        }
        result = await fetchImageEndpoint(providerConfig.fallbackUrl, headers, requestBody, provider, log);
    }
    if (pollinationsAnonSession) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$pollinationsAnonAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportPollinationsAnonOutcome"])(pollinationsAnonSession, result.status);
    }
    // Save call log after result is determined
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/generations",
        status: result.status || (result.success ? 200 : 502),
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        tokens: {
            prompt_tokens: 0,
            completion_tokens: 0
        },
        error: result.success ? null : typeof result.error === "string" ? result.error.slice(0, 500) : null,
        requestBody: logRequestBody,
        responseBody: result.success ? {
            images_count: result.data?.data?.length || 0
        } : null
    }).catch(()=>{});
    return result;
}
async function handleOpenAIImageEdit({ model, provider, credentials, prompt, imageBytes, imageMime, size, responseFormat, n = 1, log }) {
    const startTime = Date.now();
    const url = resolveImageBaseUrl(credentials, `https://generativelanguage.googleapis.com/v1beta/openai/images/edits`, "edits");
    // Build the multipart body as a Buffer with an explicit boundary instead of a global
    // `FormData`. In production `globalThis.fetch` is patched with node_modules/undici's fetch,
    // whose `FormData` class differs from `globalThis.FormData` — passing a native FormData
    // makes undici serialize it as the string "[object FormData]" (text/plain), dropping every
    // field (including `model`, which reaches the upstream empty). A Buffer body is accepted
    // verbatim by any fetch implementation. (#3273)
    const boundary = `----OmniRouteImageEdit${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "")}`;
    const CRLF = "\r\n";
    const partBuffers = [];
    const appendField = (name, value)=>{
        partBuffers.push(Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`));
    };
    appendField("model", model);
    appendField("prompt", prompt);
    if (size) appendField("size", size);
    if (responseFormat) appendField("response_format", responseFormat);
    appendField("n", String(n || 1));
    partBuffers.push(Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="image.png"${CRLF}` + `Content-Type: ${imageMime || "image/png"}${CRLF}${CRLF}`));
    partBuffers.push(imageBytes);
    partBuffers.push(Buffer.from(`${CRLF}--${boundary}--${CRLF}`));
    const multipartBody = Buffer.concat(partBuffers);
    const headers = {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
    };
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (log) {
        log.info("IMAGE", `${provider}/${model} (edit) | prompt: "${prompt.slice(0, 60)}..." -> ${url}`);
    }
    const result = await fetchImageEndpoint(url, headers, multipartBody, provider, log);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/edits",
        status: result.status || (result.success ? 200 : 502),
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        tokens: {
            prompt_tokens: 0,
            completion_tokens: 0
        },
        error: result.success ? null : typeof result.error === "string" ? result.error.slice(0, 500) : null,
        requestBody: {
            model,
            prompt: prompt.slice(0, 200),
            size: size || "default",
            n: n || 1
        },
        responseBody: result.success ? {
            images_count: result.data?.data?.length || 0
        } : null
    }).catch(()=>{});
    return result;
}
async function handleImageEdit({ provider, model, body, imageBytes, credentials, log, signal = null, clientHeaders = null }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "Prompt is required for image edit"
        });
    }
    if (!credentials?.apiKey) {
        return saveImageErrorResult({
            provider,
            model,
            status: 401,
            startTime,
            error: "ChatGPT Web credentials missing session cookie"
        });
    }
    const imageHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(imageBytes).digest("hex");
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findChatGptImageBySha256"])(imageHash);
    const wantsBase64 = body.response_format === "b64_json";
    const requestBody = {
        model,
        prompt: prompt.slice(0, 500),
        size: body.size || undefined,
        image_hash: imageHash.slice(0, 16),
        image_bytes: imageBytes.length,
        cached_match: Boolean(cached?.entry.context)
    };
    if (!cached?.entry.context) {
        // chatgpt-web's image_gen tool can only edit an image when we continue
        // the original conversation node. If we never generated this image (or
        // its 30-minute TTL elapsed), there's no node to continue. Return a
        // clear, actionable error — much better than silently spawning an
        // unrelated image and confusing the user.
        log?.warn?.("IMAGE", `chatgpt-web edit: no cached match for sha256=${imageHash.slice(0, 16)} (bytes=${imageBytes.length}); returning 400`);
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "chatgpt-web image edit only works for images recently generated through this OmniRoute instance " + "(cache window: 30 minutes). Re-generate the image and try the edit immediately, or disable image-edit " + "in your client to use plain chat-completion edit prompts instead.",
            requestBody
        });
    }
    // Build a synthetic chat thread that surfaces the cached image URL on
    // the assistant turn. The executor's parseOpenAIMessages picks up the
    // URL, findCachedImageContext resolves it to {conversationId,
    // parentMessageId}, and looksLikeImageEditRequest fires on the user
    // prompt — together producing a continuation request that actually
    // edits the saved image.
    //
    // The synthetic user prompt is anchored with both an edit verb AND an
    // image-gen verb so the executor's heuristics fire regardless of what
    // wording the caller used ("now make it brighter", "tweak this", ...):
    //   - looksLikeImageEditRequest: matches "edit" + "image" within 120 chars
    //   - looksLikeImageGenRequest:  matches "generate" + "image" within 40 chars
    // Either match alone would set forImageGen, but covering both is cheap
    // insurance for prompts that don't fit common phrasings.
    const messages = [
        {
            role: "assistant",
            // The base URL is irrelevant — only the path is parsed by
            // CACHED_IMAGE_URL_RE in the executor's findCachedImageContext.
            content: `![image](http://internal/v1/chatgpt-web/image/${cached.id})`
        },
        {
            role: "user",
            content: `Edit the image and generate the new image: ${prompt}`
        }
    ];
    const executor = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatGptWebExecutor"]();
    const result = await executor.execute({
        model,
        body: {
            messages
        },
        stream: false,
        credentials,
        signal,
        log,
        clientHeaders
    });
    const responseText = await result.response.text();
    if (result.response.status >= 400) {
        return saveImageErrorResult({
            provider,
            model,
            status: result.response.status,
            startTime,
            error: responseText,
            requestBody
        });
    }
    let content = "";
    try {
        const json = JSON.parse(responseText);
        content = String(json?.choices?.[0]?.message?.content || "");
    } catch  {
        content = responseText;
    }
    const urls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMarkdownImageUrls"])(content);
    if (urls.length === 0) {
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `ChatGPT Web edit completed without returning image markdown: ${content.slice(0, 300)}`,
            requestBody
        });
    }
    const images = [];
    for (const url of urls){
        if (!wantsBase64) {
            images.push({
                url
            });
            continue;
        }
        const id = url.match(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CHATGPT_WEB_IMAGE_ID_RE"])?.[1];
        const cachedNew = id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatGptImage"])(id) : null;
        if (!cachedNew) {
            return saveImageErrorResult({
                provider,
                model,
                status: 502,
                startTime,
                error: "ChatGPT Web image bytes expired before b64_json conversion",
                requestBody
            });
        }
        images.push({
            b64_json: cachedNew.bytes.toString("base64")
        });
    }
    return saveImageSuccessResult({
        provider,
        model,
        startTime,
        requestBody,
        responseBody: {
            images_count: images.length,
            edit_match: Boolean(cached?.entry.context)
        },
        images
    });
}
async function handleFalAIImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const { imageUrl, imageUrls } = extractImageInputs(body);
    const upstreamBody = {
        prompt: body.prompt,
        sync_mode: body.sync_mode ?? true
    };
    if (body.n !== undefined) upstreamBody.num_images = Number(body.n) || 1;
    if (body.negative_prompt) upstreamBody.negative_prompt = body.negative_prompt;
    if (body.seed !== undefined) upstreamBody.seed = body.seed;
    if (body.style) upstreamBody.style = normalizeRecraftStyle(body.style);
    const outputFormat = normalizeRequestedImageFormat(body, "png");
    if (outputFormat) upstreamBody.output_format = outputFormat;
    if (model.includes("flux-pro/v1.1") && !model.includes("ultra")) {
        upstreamBody.image_size = mapFalImageSize(body.size, "landscape_4_3");
    } else if (model.includes("bytedance/") || model.includes("stable-diffusion") || model.includes("ideogram") || model.includes("recraft/v3")) {
        upstreamBody.image_size = mapFalImageSize(body.size, "square_hd");
    } else {
        upstreamBody.aspect_ratio = body.aspect_ratio || mapFalAspectRatio(body.size, "1:1");
    }
    if (body.quality === "hd" && model.includes("ultra")) {
        upstreamBody.raw = true;
    }
    if (imageUrl && model.includes("flux-pro/v1.1-ultra")) {
        upstreamBody.image_url = imageUrl;
    }
    if (imageUrls.length > 0 && model.includes("ideogram")) {
        upstreamBody.image_urls = imageUrls;
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (fal-ai) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}/${model}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Key ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const payload = await response.json();
        const images = await normalizeProviderImagePayload(payload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: payload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleStabilityAIImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const endpoint = STABILITY_GENERATION_ENDPOINTS[model] || STABILITY_EDIT_ENDPOINTS[model];
    if (!endpoint) {
        return {
            success: false,
            status: 400,
            error: `Unsupported Stability AI image model: ${model}`
        };
    }
    const { imageUrl, maskUrl } = extractImageInputs(body);
    const upstreamBody = {
        output_format: model === "remove-background" ? normalizeRequestedImageFormat(body, "png", [
            "png",
            "webp"
        ]) : normalizeRequestedImageFormat(body, "png")
    };
    const formData = new FormData();
    appendOptionalFormValue(formData, "output_format", upstreamBody.output_format);
    if (body.prompt) {
        upstreamBody.prompt = body.prompt;
        appendOptionalFormValue(formData, "prompt", body.prompt);
    }
    if (body.negative_prompt) {
        upstreamBody.negative_prompt = body.negative_prompt;
        appendOptionalFormValue(formData, "negative_prompt", body.negative_prompt);
    }
    if (body.seed !== undefined) {
        upstreamBody.seed = body.seed;
        appendOptionalFormValue(formData, "seed", body.seed);
    }
    try {
        if (STABILITY_GENERATION_ENDPOINTS[model]) {
            if (model.startsWith("sd3.5")) {
                upstreamBody.model = model;
                appendOptionalFormValue(formData, "model", model);
            }
            if (imageUrl) {
                const imageSource = await resolveImageSource(imageUrl);
                upstreamBody.mode = "image-to-image";
                appendOptionalFormValue(formData, "mode", "image-to-image");
                upstreamBody.image = imageSource.base64;
                appendImageFormValue(formData, "image", imageSource, "image");
                if (body.strength !== undefined) {
                    upstreamBody.strength = body.strength;
                    appendOptionalFormValue(formData, "strength", body.strength);
                }
            } else {
                upstreamBody.mode = "text-to-image";
                appendOptionalFormValue(formData, "mode", "text-to-image");
            }
            if (!model.startsWith("sd3.5") || !imageUrl) {
                const aspectRatio = body.aspect_ratio || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
                upstreamBody.aspect_ratio = aspectRatio;
                appendOptionalFormValue(formData, "aspect_ratio", aspectRatio);
            }
            if (body.style_preset) {
                upstreamBody.style_preset = body.style_preset;
                appendOptionalFormValue(formData, "style_preset", body.style_preset);
            }
        } else {
            if (imageUrl) {
                const imageSource = await resolveImageSource(imageUrl);
                upstreamBody.image = imageSource.base64;
                appendImageFormValue(formData, "image", imageSource, "image");
            }
            if (maskUrl && shouldIncludeStabilityMask(model)) {
                const maskSource = await resolveImageSource(maskUrl);
                upstreamBody.mask = maskSource.base64;
                appendImageFormValue(formData, "mask", maskSource, "mask");
            }
            if (body.search_prompt) {
                upstreamBody.search_prompt = body.search_prompt;
                appendOptionalFormValue(formData, "search_prompt", body.search_prompt);
            }
            if (body.grow_mask !== undefined) {
                upstreamBody.grow_mask = body.grow_mask;
                appendOptionalFormValue(formData, "grow_mask", body.grow_mask);
            }
            if (body.control_strength !== undefined) {
                upstreamBody.control_strength = body.control_strength;
                appendOptionalFormValue(formData, "control_strength", body.control_strength);
            }
            if (body.creativity !== undefined) {
                upstreamBody.creativity = body.creativity;
                appendOptionalFormValue(formData, "creativity", body.creativity);
            }
            if (body.left !== undefined) {
                upstreamBody.left = body.left;
                appendOptionalFormValue(formData, "left", body.left);
            }
            if (body.right !== undefined) {
                upstreamBody.right = body.right;
                appendOptionalFormValue(formData, "right", body.right);
            }
            if (body.up !== undefined) {
                upstreamBody.up = body.up;
                appendOptionalFormValue(formData, "up", body.up);
            }
            if (body.down !== undefined) {
                upstreamBody.down = body.down;
                appendOptionalFormValue(formData, "down", body.down);
            }
            if (body.style_preset) {
                upstreamBody.style_preset = body.style_preset;
                appendOptionalFormValue(formData, "style_preset", body.style_preset);
            }
            if (STABILITY_CONTROL_MODELS.has(model) && !upstreamBody.prompt) {
                upstreamBody.prompt = body.prompt || "";
                appendOptionalFormValue(formData, "prompt", body.prompt || "");
            }
        }
        if (log) {
            const promptPreview = String(body.prompt ?? "").slice(0, 60);
            log.info("IMAGE", `${provider}/${model} (stability-ai) | prompt: "${promptPreview}..."`);
        }
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}${endpoint}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const contentType = response.headers.get("content-type") || "";
        let payload;
        if (contentType.includes("application/json")) {
            payload = await response.json();
        } else {
            const buffer = Buffer.from(await response.arrayBuffer());
            payload = {
                image: buffer.toString("base64")
            };
        }
        const images = await normalizeProviderImagePayload(payload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: payload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleBlackForestLabsImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const endpoint = BFL_MODEL_ENDPOINTS[model];
    if (!endpoint) {
        return {
            success: false,
            status: 400,
            error: `Unsupported Black Forest Labs image model: ${model}`
        };
    }
    const { imageUrl, maskUrl } = extractImageInputs(body);
    const upstreamBody = {
        prompt: body.prompt,
        output_format: normalizeRequestedImageFormat(body, "png")
    };
    try {
        if (BFL_EDIT_MODELS.has(model) && imageUrl) {
            upstreamBody.input_image = (await resolveImageSource(imageUrl)).base64;
        } else if (imageUrl && isHttpUrl(imageUrl)) {
            upstreamBody.image_url = imageUrl;
        }
        if (maskUrl && (model === "flux-pro-1.0-fill" || model === "flux-kontext-pro")) {
            upstreamBody.mask = (await resolveImageSource(maskUrl)).base64;
        }
        if (model === "flux-kontext-pro" || model === "flux-kontext-max") {
            upstreamBody.aspect_ratio = body.aspect_ratio || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
        } else if (typeof body.size === "string" && body.size.includes("x")) {
            const { width, height } = parseSizeToDimensions(body.size, 1024);
            upstreamBody.width = width;
            upstreamBody.height = height;
        }
        if (body.seed !== undefined) upstreamBody.seed = body.seed;
        if (body.n !== undefined && model.includes("ultra")) upstreamBody.num_images = Number(body.n) || 1;
        if (body.quality === "hd" && model.includes("ultra")) upstreamBody.raw = true;
        if (body.left !== undefined) upstreamBody.left = body.left;
        if (body.right !== undefined) upstreamBody.right = body.right;
        if (body.top !== undefined) upstreamBody.top = body.top;
        if (body.bottom !== undefined) upstreamBody.bottom = body.bottom;
        if (body.steps !== undefined) upstreamBody.steps = body.steps;
        if (body.guidance !== undefined) upstreamBody.guidance = body.guidance;
        if (body.grow_mask !== undefined) upstreamBody.grow_mask = body.grow_mask;
        if (body.safety_tolerance !== undefined) upstreamBody.safety_tolerance = body.safety_tolerance;
        if (log) {
            const promptPreview = String(body.prompt ?? "").slice(0, 60);
            log.info("IMAGE", `${provider}/${model} (black-forest-labs) | prompt: "${promptPreview}..."`);
        }
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "x-key": token
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const initialPayload = await response.json();
        const finalPayload = initialPayload.polling_url ? await pollBlackForestLabsResult({
            pollingUrl: initialPayload.polling_url,
            token,
            body,
            log
        }) : initialPayload;
        const images = await normalizeProviderImagePayload(finalPayload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: finalPayload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleRecraftImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const upstreamBody = {
        model,
        prompt: body.prompt
    };
    if (body.n !== undefined) upstreamBody.n = body.n;
    if (body.size !== undefined) upstreamBody.size = body.size;
    if (body.response_format !== undefined) upstreamBody.response_format = body.response_format;
    if (body.style !== undefined) upstreamBody.style = body.style;
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (recraft) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}/v1/images/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const payload = await response.json();
        const images = await normalizeProviderImagePayload(payload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: payload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleTopazImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const { imageUrl } = extractImageInputs(body);
    if (!imageUrl) {
        return {
            success: false,
            status: 400,
            error: `Topaz model ${model} requires an input image`
        };
    }
    try {
        const imageSource = await resolveImageSource(imageUrl);
        const formData = new FormData();
        const blob = new Blob([
            imageSource.buffer
        ], {
            type: imageSource.contentType || "image/png"
        });
        formData.append("image", blob, "image.png");
        if (typeof body.size === "string" && body.size.includes("x")) {
            const { width, height } = parseSizeToDimensions(body.size, 1024);
            formData.append("output_width", String(width));
            formData.append("output_height", String(height));
        }
        if (log) {
            const promptPreview = String(body.prompt ?? "enhance image").slice(0, 60);
            log.info("IMAGE", `${provider}/${model} (topaz) | prompt: "${promptPreview}..."`);
        }
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}/image/v1/enhance`, {
            method: "POST",
            headers: {
                Accept: "image/jpeg",
                "X-API-Key": token
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText
            });
        }
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString("base64");
        const wantsBase64 = body.response_format === "b64_json";
        const images = [
            wantsBase64 ? {
                b64_json: base64,
                revised_prompt: body.prompt
            } : {
                url: `data:${contentType};base64,${base64}`,
                revised_prompt: body.prompt
            }
        ];
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            responseBody: {
                images_count: images.length
            },
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function pollBlackForestLabsResult({ pollingUrl, token, body, log }) {
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300000);
    const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, 1500);
    const deadline = Date.now() + timeoutMs;
    while(Date.now() < deadline){
        const response = await fetch(pollingUrl, {
            method: "GET",
            headers: {
                "x-key": token
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`BFL polling failed (${response.status}): ${errorText}`);
        }
        const payload = await response.json();
        const status = payload?.status;
        if (status === "Ready") {
            return payload;
        }
        if (BFL_FAILURE_STATUSES.has(status)) {
            throw new Error(`BFL image generation failed: ${status}`);
        }
        if (log) {
            log.info("IMAGE", `black-forest-labs polling status: ${String(status || "Pending")}`);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(pollIntervalMs);
    }
    throw new Error(`BFL polling timed out after ${timeoutMs}ms`);
}
function extractImageInputs(body) {
    const imageUrls = [];
    const seen = new Set();
    const pushCandidate = (candidate)=>{
        if (typeof candidate !== "string") return;
        const trimmed = candidate.trim();
        if (!trimmed || seen.has(trimmed)) return;
        seen.add(trimmed);
        imageUrls.push(trimmed);
    };
    pushCandidate(body?.image_url);
    pushCandidate(body?.image);
    if (Array.isArray(body?.imageUrls)) {
        for (const candidate of body.imageUrls)pushCandidate(candidate);
    }
    if (Array.isArray(body?.image_urls)) {
        for (const candidate of body.image_urls)pushCandidate(candidate);
    }
    if (Array.isArray(body?.messages)) {
        for (const msg of body.messages){
            if (!Array.isArray(msg?.content)) continue;
            for (const part of msg.content){
                if (part?.type === "image_url") {
                    pushCandidate(part?.image_url?.url);
                }
            }
        }
    }
    return {
        imageUrl: imageUrls[0] || null,
        imageUrls,
        maskUrl: typeof body?.mask_url === "string" ? body.mask_url : typeof body?.mask === "string" ? body.mask : null
    };
}
async function resolveImageSource(source) {
    if (typeof source !== "string" || source.trim().length === 0) {
        throw new Error("Invalid image source");
    }
    const trimmed = source.trim();
    const dataUriMatch = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);
    if (dataUriMatch) {
        const [, contentType, base64] = dataUriMatch;
        return {
            buffer: Buffer.from(base64, "base64"),
            base64,
            contentType
        };
    }
    if (isHttpUrl(trimmed)) {
        const remoteImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(trimmed);
        return {
            buffer: remoteImage.buffer,
            base64: remoteImage.buffer.toString("base64"),
            contentType: remoteImage.contentType
        };
    }
    return {
        buffer: Buffer.from(trimmed, "base64"),
        base64: trimmed,
        contentType: "application/octet-stream"
    };
}
function parseSizeToDimensions(size, fallback = 1024) {
    if (typeof size !== "string" || !size.includes("x")) {
        return {
            width: fallback,
            height: fallback
        };
    }
    const [widthRaw, heightRaw] = size.split("x");
    const width = Number(widthRaw);
    const height = Number(heightRaw);
    return {
        width: Number.isFinite(width) && width > 0 ? width : fallback,
        height: Number.isFinite(height) && height > 0 ? height : fallback
    };
}
function normalizeRequestedImageFormat(body, fallback = "png", allowedFormats = [
    "jpeg",
    "png",
    "webp"
]) {
    const formatCandidate = typeof body?.output_format === "string" ? body.output_format.toLowerCase() : typeof body?.response_format === "string" && ![
        "url",
        "b64_json"
    ].includes(body.response_format.toLowerCase()) ? body.response_format.toLowerCase() : fallback;
    if (allowedFormats.includes(formatCandidate)) {
        return formatCandidate;
    }
    return fallback;
}
function mapFalImageSize(size, fallback = "square_hd") {
    if (typeof size !== "string") return fallback;
    if (FAL_PRESET_SIZES[size]) return FAL_PRESET_SIZES[size];
    if (size.includes("x")) {
        const { width, height } = parseSizeToDimensions(size, 1024);
        return {
            width,
            height
        };
    }
    return fallback;
}
function mapFalAspectRatio(size, fallback = "1:1") {
    if (!size) return fallback;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(size);
}
function normalizeRecraftStyle(style) {
    if (style === "vivid") return "digital_illustration";
    if (style === "natural") return "realistic_image";
    return style;
}
function shouldIncludeStabilityMask(model) {
    return new Set([
        "inpaint",
        "erase",
        "search-and-replace",
        "search-and-recolor",
        "replace-background-and-relight"
    ]).has(model);
}
async function normalizeProviderImagePayload(payload, body, log) {
    const candidates = [];
    const pushCandidate = (value)=>{
        if (value === undefined || value === null) return;
        candidates.push(value);
    };
    if (Array.isArray(payload?.data)) {
        for (const item of payload.data)pushCandidate(item);
    }
    if (Array.isArray(payload?.images)) {
        for (const item of payload.images)pushCandidate(item);
    }
    if (payload?.image) pushCandidate({
        b64_json: payload.image
    });
    if (payload?.url) pushCandidate({
        url: payload.url
    });
    if (payload?.sample) pushCandidate({
        url: payload.sample
    });
    if (payload?.result?.sample) pushCandidate({
        url: payload.result.sample
    });
    if (Array.isArray(payload?.result?.images)) {
        for (const item of payload.result.images)pushCandidate(item);
    }
    const normalized = [];
    for (const candidate of candidates){
        const item = await normalizeProviderImageCandidate(candidate, body);
        if (item) normalized.push(item);
    }
    if (normalized.length === 0 && log) {
        log.warn("IMAGE", `Provider returned no recognizable image payload: ${JSON.stringify(payload).slice(0, 240)}`);
    }
    return normalized;
}
async function normalizeProviderImageCandidate(candidate, body) {
    const wantsBase64 = body?.response_format === "b64_json";
    let url = null;
    let b64 = null;
    if (typeof candidate === "string") {
        const dataUriMatch = /^data:[^;]+;base64,(.+)$/i.exec(candidate);
        if (dataUriMatch) {
            b64 = dataUriMatch[1];
        } else if (isHttpUrl(candidate)) {
            url = candidate;
        } else {
            b64 = candidate;
        }
    } else if (candidate && typeof candidate === "object") {
        url = firstString(candidate.url, candidate.image_url, candidate.sample, candidate.file_url) || null;
        b64 = firstString(candidate.b64_json, candidate.image, candidate.base64, candidate.data) || null;
    }
    if (wantsBase64 && !b64 && url) {
        b64 = (await resolveImageSource(url)).base64;
    }
    if (url && !wantsBase64) {
        return {
            url,
            revised_prompt: body?.prompt
        };
    }
    if (b64) {
        return {
            b64_json: b64,
            revised_prompt: body?.prompt
        };
    }
    if (url) {
        return {
            url,
            revised_prompt: body?.prompt
        };
    }
    return null;
}
function firstString(...values) {
    for (const value of values){
        if (typeof value === "string" && value.length > 0) return value;
    }
    return null;
}
function isHttpUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value);
}
function extractImageGenerationCalls(sseText) {
    const results = [];
    const lines = String(sseText || "").split("\n");
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let evt;
        try {
            evt = JSON.parse(payload);
        } catch  {
            continue;
        }
        if (evt?.type !== "response.output_item.done") continue;
        const item = evt.item;
        if (!item || item.type !== "image_generation_call") continue;
        const result = typeof item.result === "string" ? item.result : "";
        if (!result) continue;
        const revisedPrompt = typeof item.revised_prompt === "string" ? item.revised_prompt : null;
        results.push({
            b64: result,
            revisedPrompt
        });
    }
    return results;
}
// The image_generation hosted tool accepts { "auto" | "low" | "medium" | "high" }
// for `quality`. Legacy image clients often send "standard" / "hd". Map those values
// so OpenWebUI's quality dropdown doesn't silently get rejected upstream.
function mapLegacyImageQualityToImageTool(value) {
    const normalized = value.toLowerCase();
    if (normalized === "standard") return "medium";
    if (normalized === "hd") return "high";
    return normalized;
}
async function handleCodexImageGeneration({ model, provider, providerConfig, body, credentials, log, referenceImages = [], signal = null, logPath = "/v1/images/generations" }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!prompt.trim()) {
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "Prompt is required for Codex image generation",
            path: logPath
        });
    }
    const requestedCount = Number.isInteger(body.n) && body.n > 0 ? body.n : 1;
    if (log && requestedCount > 1) {
        log.warn("IMAGE", `Codex hosted image_generation returns one image per call; requested n=${requestedCount} will fan out in parallel`);
    }
    const token = credentials?.accessToken || credentials?.apiKey;
    if (!token) {
        return saveImageErrorResult({
            provider,
            model,
            status: 401,
            startTime,
            error: "Codex credentials missing accessToken — reconnect the Codex provider",
            path: logPath
        });
    }
    const workspaceId = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && !Array.isArray(credentials.providerSpecificData) ? credentials.providerSpecificData.workspaceId : undefined;
    // Forward size/quality from the GPT-Image-style body into the hosted tool so
    // OpenWebUI's size/quality selectors actually take effect. Everything else
    // (model, n, background, moderation, output_compression) is left to the
    // Codex backend's defaults — today that's `gpt-image-2`.
    const toolConfig = {
        type: "image_generation",
        output_format: "png"
    };
    if (referenceImages.length > 0) toolConfig.action = "edit";
    if (typeof body.size === "string" && body.size.trim()) {
        toolConfig.size = body.size.trim();
    }
    if (typeof body.quality === "string" && body.quality.trim()) {
        toolConfig.quality = mapLegacyImageQualityToImageTool(body.quality.trim());
    }
    const inputContent = [
        {
            type: "input_text",
            text: prompt
        }
    ];
    for (const image of referenceImages){
        inputContent.push({
            type: "input_image",
            image_url: `data:${image.mime || "image/png"};base64,${image.bytes.toString("base64")}`
        });
    }
    const upstreamBody = {
        model,
        instructions: referenceImages.length > 0 ? `You must call the image_generation tool exactly once to edit the supplied ${referenceImages.length === 1 ? "reference image" : "reference images"}. Treat all supplied images as references for the user's requested composition or style. Do not add narration.` : "You must call the image_generation tool exactly once to fulfill the user's request. Do not add narration.",
        input: [
            {
                role: "user",
                content: inputContent
            }
        ],
        tools: [
            toolConfig
        ],
        stream: true,
        store: false
    };
    const requestBodyForLog = referenceImages.length > 0 ? {
        model,
        prompt_chars: prompt.length,
        reference_images: referenceImages.map((image)=>({
                mime: image.mime || "image/png",
                bytes: image.bytes.length
            })),
        tools: [
            toolConfig
        ],
        stream: true,
        store: false
    } : upstreamBody;
    const headers = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
        Version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexClientVersion"])(),
        "User-Agent": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexUserAgent"])(),
        originator: "codex_cli_rs"
    };
    if (typeof workspaceId === "string" && workspaceId) {
        headers["chatgpt-account-id"] = workspaceId;
        headers["session_id"] = workspaceId;
    }
    if (log) {
        const promptSummary = referenceImages.length > 0 ? `${prompt.length} chars` : `"${prompt.slice(0, 60)}..."`;
        log.info("IMAGE", `${provider}/${model} (codex-responses) | prompt: ${promptSummary}`);
    }
    const fetchOneImage = async ()=>{
        let response;
        try {
            response = await fetch(providerConfig.baseUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(upstreamBody),
                signal
            });
        } catch (err) {
            const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
            if (log) log.error("IMAGE", `${provider} fetch error: ${message}`);
            return {
                ok: false,
                error: {
                    provider,
                    model,
                    status: 502,
                    startTime,
                    error: `Image provider error: ${message}`,
                    requestBody: requestBodyForLog,
                    path: logPath
                }
            };
        }
        if (!response.ok) {
            const errorText = await response.text();
            const safeError = sanitizeImageProviderError(errorText);
            const safeErrorLog = typeof safeError === "string" ? safeError : JSON.stringify(safeError ?? {});
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${safeErrorLog}`);
            return {
                ok: false,
                error: {
                    provider,
                    model,
                    status: response.status,
                    startTime,
                    error: safeError,
                    requestBody: requestBodyForLog,
                    path: logPath
                }
            };
        }
        const rawSSE = await response.text();
        const items = extractImageGenerationCalls(rawSSE);
        if (items.length === 0) {
            return {
                ok: false,
                error: {
                    provider,
                    model,
                    status: 502,
                    startTime,
                    error: "Codex completed without producing an image_generation_call — the model may have declined the tool",
                    requestBody: requestBodyForLog,
                    path: logPath
                }
            };
        }
        return {
            ok: true,
            items
        };
    };
    const imageResults = await Promise.all(Array.from({
        length: requestedCount
    }, ()=>fetchOneImage()));
    const collected = [];
    for (const imageResult of imageResults){
        if (!imageResult.ok) return saveImageErrorResult(imageResult.error);
        for (const item of imageResult.items){
            collected.push({
                b64_json: item.b64,
                ...item.revisedPrompt ? {
                    revised_prompt: item.revisedPrompt
                } : {}
            });
        }
    }
    const wantsUrl = body.response_format !== "b64_json";
    const data = wantsUrl ? collected.map((item)=>({
            url: `data:image/png;base64,${item.b64_json}`,
            ...item.revised_prompt ? {
                revised_prompt: item.revised_prompt
            } : {}
        })) : collected;
    return saveImageSuccessResult({
        provider,
        model,
        startTime,
        requestBody: requestBodyForLog,
        responseBody: {
            images_count: data.length
        },
        images: data,
        path: logPath
    });
}
async function handleCodexImageEdit({ model, provider, providerConfig, body, referenceImages, credentials, log, signal = null }) {
    const result = await handleCodexImageGeneration({
        model,
        provider,
        providerConfig,
        body: {
            ...body,
            n: 1
        },
        credentials,
        log,
        referenceImages,
        signal,
        logPath: "/v1/images/edits"
    });
    return result;
}
function saveImageSuccessResult({ provider, model, startTime, requestBody = null, responseBody = null, created = null, images, path = "/v1/images/generations" }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path,
        status: 200,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        requestBody,
        responseBody
    }).catch(()=>{});
    return {
        success: true,
        data: {
            created: created || Math.floor(Date.now() / 1000),
            data: images
        }
    };
}
function saveImageErrorResult({ provider, model, status, startTime, error, requestBody = null, path = "/v1/images/generations" }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path,
        status,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: typeof error === "string" ? error.slice(0, 500) : String(error).slice(0, 500),
        requestBody
    }).catch(()=>{});
    return {
        success: false,
        status,
        error
    };
}
/**
 * Fetch a single image endpoint and normalize response
 */ async function fetchImageEndpoint(url, headers, body, provider, log) {
    try {
        let response;
        try {
            response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchWithTimeout"])(url, {
                method: "POST",
                headers,
                body,
                timeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConfiguredTimeout"])()
            });
        } catch (err) {
            const isAbortError = typeof err === "object" && err !== null && "name" in err && err.name === "AbortError";
            if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FetchTimeoutError"] || isAbortError) {
                const message = err instanceof Error ? err.message : String(err);
                if (log) {
                    log.error("IMAGE", `${provider} fetch error: ${message}`);
                }
                return {
                    success: false,
                    status: 504,
                    error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message || err)}`
                };
            }
            throw err;
        }
        if (!response.ok) {
            const errorText = await response.text();
            if (log) {
                log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            }
            return {
                success: false,
                status: response.status,
                error: errorText
            };
        }
        const data = await response.json();
        // Normalize response to OpenAI format
        return {
            success: true,
            data: {
                created: data.created || Math.floor(Date.now() / 1000),
                data: data.data || []
            }
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (log) {
            log.error("IMAGE", `${provider} fetch error: ${message}`);
        }
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message || err)}`
        };
    }
}
/**
 * Handle Hyperbolic image generation
 * Uses { model_name, prompt, height, width } and returns { images: [{ image: base64 }] }
 */ async function handleNanoBananaImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    // Route to pro URL for "nanobanana-pro" model
    const isPro = model === "nanobanana-pro";
    const submitUrl = isPro && providerConfig.proUrl ? providerConfig.proUrl : providerConfig.baseUrl;
    const statusUrl = providerConfig.statusUrl;
    const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio : typeof body.aspect_ratio === "string" ? body.aspect_ratio : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
    let resolution = typeof body.resolution === "string" ? body.resolution : inferResolutionFromSize(body.size) || "1K";
    if (body.quality === "hd" && resolution === "1K") {
        resolution = "2K";
    }
    const upstreamBody = isPro ? {
        prompt: body.prompt,
        resolution,
        aspectRatio,
        ...Array.isArray(body.imageUrls) ? {
            imageUrls: body.imageUrls
        } : {}
    } : {
        prompt: body.prompt,
        type: Array.isArray(body.imageUrls) && body.imageUrls.length > 0 ? "IMAGETOIAMGE" : "TEXTTOIAMGE",
        numImages: Number.isFinite(body.n) ? Math.max(1, Number(body.n)) : 1,
        image_size: aspectRatio,
        ...Array.isArray(body.imageUrls) ? {
            imageUrls: body.imageUrls
        } : {}
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (nanobanana ${isPro ? "pro" : "flash"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const submitResp = await fetch(submitUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!submitResp.ok) {
            const errorText = await submitResp.text();
            if (log) {
                log.error("IMAGE", `${provider} submit error ${submitResp.status}: ${errorText.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: submitResp.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: submitResp.status,
                error: errorText
            };
        }
        const submitData = await submitResp.json();
        // Backward compatibility: handle providers returning image payload synchronously
        const hasSyncPayload = Boolean(submitData?.image) || Array.isArray(submitData?.images) || Array.isArray(submitData?.data) || Boolean(submitData?.data?.[0]?.url) || Boolean(submitData?.data?.[0]?.b64_json);
        if (hasSyncPayload) {
            const syncResult = normalizeNanoBananaSyncPayload(submitData, body.prompt);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: 200,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                responseBody: {
                    images_count: syncResult.data?.length || 0,
                    mode: "sync"
                }
            }).catch(()=>{});
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: syncResult.data
                }
            };
        }
        const taskId = submitData?.data?.taskId || submitData?.taskId;
        if (!taskId) {
            const errorText = `NanoBanana submit did not return taskId: ${JSON.stringify(submitData).slice(0, 400)}`;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: errorText
            };
        }
        if (!statusUrl) {
            const errorText = "NanoBanana statusUrl is not configured";
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: 500,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText
            }).catch(()=>{});
            return {
                success: false,
                status: 500,
                error: errorText
            };
        }
        const timeoutMs = normalizePositiveNumber(body.timeout_ms, normalizePositiveNumber(process.env.NANOBANANA_POLL_TIMEOUT_MS, 120000));
        const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, normalizePositiveNumber(process.env.NANOBANANA_POLL_INTERVAL_MS, 2500));
        let lastTaskData = null;
        const deadline = Date.now() + timeoutMs;
        while(Date.now() < deadline){
            const pollResp = await fetch(`${statusUrl}?taskId=${encodeURIComponent(taskId)}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!pollResp.ok) {
                const errorText = await pollResp.text();
                if (log) {
                    log.error("IMAGE", `${provider} poll error ${pollResp.status}: ${errorText.slice(0, 200)}`);
                }
                return {
                    success: false,
                    status: pollResp.status,
                    error: errorText
                };
            }
            const pollData = await pollResp.json();
            const taskData = pollData?.data || pollData;
            lastTaskData = taskData;
            const successFlag = Number(taskData?.successFlag);
            if (successFlag === 1) {
                const normalized = await normalizeNanoBananaTaskResult(taskData, body, log);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/images/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    responseBody: {
                        images_count: normalized.length,
                        mode: "async",
                        taskId
                    }
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: normalized
                    }
                };
            }
            if (successFlag === 2 || successFlag === 3) {
                const errorText = taskData?.errorMessage || `NanoBanana task failed (successFlag=${String(successFlag)})`;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/images/generations",
                    status: 502,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: errorText.slice(0, 500),
                    responseBody: {
                        taskId,
                        successFlag,
                        errorCode: taskData?.errorCode ?? null
                    }
                }).catch(()=>{});
                return {
                    success: false,
                    status: 502,
                    error: errorText
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(pollIntervalMs);
        }
        const timeoutError = `NanoBanana task timeout after ${timeoutMs}ms (taskId=${taskId}, successFlag=${String(lastTaskData?.successFlag ?? "unknown")})`;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: timeoutError,
            responseBody: {
                taskId,
                lastSuccessFlag: lastTaskData?.successFlag ?? null
            }
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: timeoutError
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
function normalizeNanoBananaSyncPayload(data, prompt) {
    const images = [];
    if (data.image) {
        images.push({
            b64_json: data.image,
            revised_prompt: prompt
        });
    } else if (Array.isArray(data.images)) {
        for (const img of data.images){
            images.push({
                b64_json: typeof img === "string" ? img : img?.image || img?.data,
                revised_prompt: prompt
            });
        }
    } else if (Array.isArray(data.data)) {
        for (const img of data.data){
            if (!img) continue;
            images.push(img);
        }
    }
    return {
        data: images.filter(Boolean)
    };
}
async function normalizeNanoBananaTaskResult(taskData, body, log) {
    const response = taskData?.response || {};
    const urlCandidates = [
        response?.resultImageUrl,
        response?.originImageUrl,
        taskData?.resultImageUrl,
        taskData?.originImageUrl
    ].filter((v)=>typeof v === "string" && v.length > 0);
    if (Array.isArray(response?.resultImageUrls)) {
        for (const u of response.resultImageUrls){
            if (typeof u === "string" && u.length > 0) urlCandidates.push(u);
        }
    }
    const b64Candidates = [
        response?.resultImageBase64,
        response?.resultImage,
        taskData?.resultImageBase64,
        taskData?.resultImage
    ].filter((v)=>typeof v === "string" && v.length > 0);
    if (Array.isArray(response?.resultImageBase64List)) {
        for (const b64 of response.resultImageBase64List){
            if (typeof b64 === "string" && b64.length > 0) b64Candidates.push(b64);
        }
    }
    const wantsBase64 = body.response_format === "b64_json";
    if (wantsBase64) {
        if (b64Candidates.length > 0) {
            return b64Candidates.map((b64)=>({
                    b64_json: b64,
                    revised_prompt: body.prompt
                }));
        }
        if (urlCandidates.length > 0) {
            const firstUrl = urlCandidates[0];
            const remoteImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(firstUrl);
            const base64 = remoteImage.buffer.toString("base64");
            return [
                {
                    b64_json: base64,
                    revised_prompt: body.prompt
                }
            ];
        }
    }
    if (urlCandidates.length > 0) {
        return urlCandidates.map((url)=>({
                url,
                revised_prompt: body.prompt
            }));
    }
    if (b64Candidates.length > 0) {
        return b64Candidates.map((b64)=>({
                b64_json: b64,
                revised_prompt: body.prompt
            }));
    }
    if (log) {
        log.warn("IMAGE", `NanoBanana task completed without image payload: ${JSON.stringify(taskData).slice(0, 240)}`);
    }
    return [];
}
function inferResolutionFromSize(size) {
    if (typeof size !== "string") return null;
    const [wRaw, hRaw] = size.split("x");
    const width = Number(wRaw);
    const height = Number(hRaw);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
    const longestSide = Math.max(width, height);
    if (longestSide <= 1024) return "1K";
    if (longestSide <= 2048) return "2K";
    return "4K";
}
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.floor(n);
} /**
 * Handle SD WebUI image generation (local, no auth)
 * POST {baseUrl} with { prompt, negative_prompt, width, height, steps }
 * Response: { images: ["base64..."] }
 */ 
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/rerank.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleRerank",
    ()=>handleRerank,
    "transformRequestForProvider",
    ()=>transformRequestForProvider,
    "transformResponseFromProvider",
    ()=>transformResponseFromProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cors.ts [instrumentation] (ecmascript)");
/**
 * Rerank Handler
 *
 * Handles /v1/rerank requests following the Cohere rerank API format.
 * Routes to the appropriate provider based on the model prefix or lookup.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/rerankRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
 * Build authorization header for a rerank provider
 */ function buildAuthHeader(providerConfig, token) {
    if (providerConfig.authHeader === "bearer") {
        return {
            Authorization: `Bearer ${token}`
        };
    }
    return {};
}
function transformRequestForProvider(providerConfig, body) {
    if (providerConfig.format === "nvidia") {
        return {
            model: body.model,
            query: {
                text: body.query
            },
            passages: (body.documents || []).map((doc)=>({
                    text: typeof doc === "string" ? doc : doc.text || ""
                })),
            top_n: body.top_n
        };
    }
    // DeepInfra inference API: the model goes in the URL path (handled by the caller), the body
    // carries {queries:[query], documents:[strings]} and the response is a positional {scores:[…]}.
    if (providerConfig.format === "deepinfra") {
        return {
            queries: [
                body.query
            ],
            documents: (body.documents || []).map((doc)=>typeof doc === "string" ? doc : doc.text || "")
        };
    }
    // Voyage AI: uses `top_k` instead of `top_n`, and rejects only exact empty
    // strings (whitespace-only documents are accepted and ranked upstream). We
    // filter out exact empty strings and track original indices implicitly via the
    // response adapter, which reconstructs the map from options.documents (#7809).
    // `return_documents` is always forced off upstream: Voyage echoes documents as
    // plain strings (not Cohere's {text}), so we never rely on the echo — document
    // text is always synthesized locally from the caller's originals (#7811).
    if (providerConfig.format === "voyage") {
        const docTexts = (body.documents || []).map((doc)=>typeof doc === "string" ? doc : doc?.text || "").filter((text)=>text !== "");
        return {
            model: body.model,
            query: body.query,
            documents: docTexts,
            top_k: body.top_n || docTexts.length,
            return_documents: false
        };
    }
    // Default: Cohere-compatible format (used by Together, Fireworks, Cohere, SiliconFlow)
    return body;
}
function transformResponseFromProvider(providerConfig, data, options = {}) {
    if (providerConfig.format === "nvidia") {
        return {
            id: data.id != null ? String(data.id) : `rerank-${Date.now()}`,
            results: (data.rankings || []).map((r)=>({
                    index: r.index,
                    relevance_score: r.logit || r.score || 0,
                    document: {
                        text: r.text || ""
                    }
                })),
            meta: {
                api_version: {
                    version: "2"
                },
                billed_units: {
                    search_units: 1
                }
            }
        };
    }
    // DeepInfra returns {scores:[…]} — one float per document, in document order. Map to Cohere's
    // results[] (index + relevance_score + optional document), sorted by score desc, honoring top_n.
    if (providerConfig.format === "deepinfra") {
        const documents = Array.isArray(options.documents) ? options.documents : [];
        const returnDocuments = options.return_documents !== false;
        const scored = (Array.isArray(data.scores) ? data.scores : []).map((score, index)=>{
            const doc = documents[index];
            const text = typeof doc === "string" ? doc : doc?.text || "";
            return {
                index,
                relevance_score: typeof score === "number" ? score : 0,
                ...returnDocuments ? {
                    document: {
                        text
                    }
                } : {}
            };
        });
        scored.sort((a, b)=>b.relevance_score - a.relevance_score);
        const topN = typeof options.top_n === "number" && options.top_n > 0 ? options.top_n : undefined;
        return {
            id: `rerank-${Date.now()}`,
            results: topN ? scored.slice(0, topN) : scored,
            meta: {
                api_version: {
                    version: "2"
                },
                billed_units: {
                    search_units: 1
                }
            }
        };
    }
    // Voyage AI returns {data:[{relevance_score,index}], usage:{total_tokens}} — `index` refers
    // to the filtered document array we sent (empty strings removed). We remap back to the
    // caller's original positions and sort by score descending, honoring top_n (#7809).
    if (providerConfig.format === "voyage") {
        const documents = Array.isArray(options.documents) ? options.documents : [];
        const returnDocuments = options.return_documents !== false;
        // Reconstruct the index map: the request adapter filtered out exact empty
        // strings, so we replicate that filter here to get original → filtered mapping.
        const indexMap = [];
        documents.forEach((doc, i)=>{
            const text = typeof doc === "string" ? doc : doc?.text || "";
            if (text !== "") indexMap.push(i);
        });
        const scored = (Array.isArray(data.data) ? data.data : []).map((entry)=>{
            const filteredIdx = entry.index ?? 0;
            const originalIdx = indexMap[filteredIdx] ?? filteredIdx;
            const doc = documents[originalIdx];
            const text = typeof doc === "string" ? doc : doc?.text || "";
            return {
                index: originalIdx,
                relevance_score: typeof entry.relevance_score === "number" ? entry.relevance_score : 0,
                ...returnDocuments ? {
                    document: {
                        text
                    }
                } : {}
            };
        });
        scored.sort((a, b)=>b.relevance_score - a.relevance_score);
        const topN = typeof options.top_n === "number" && options.top_n > 0 ? options.top_n : undefined;
        return {
            id: `rerank-${Date.now()}`,
            results: topN ? scored.slice(0, topN) : scored,
            meta: {
                api_version: {
                    version: "2"
                },
                billed_units: {
                    search_units: 1
                }
            }
        };
    }
    return data;
}
async function handleRerank({ model, query, documents, top_n, return_documents, credentials, connectionId = null }) {
    const startTime = Date.now();
    if (!model) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "model is required");
    if (!query) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "query is required");
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "documents must be a non-empty array");
    }
    const { provider: providerId, model: modelId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseRerankModel"])(model);
    const providerConfig = providerId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRerankProvider"])(providerId) : null;
    if (!providerConfig) {
        const availableProviders = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RERANK_PROVIDERS"]).join(", ");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, `No rerank provider found for model "${model}". Available: ${availableProviders}`);
    }
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(401, `No credentials for rerank provider: ${providerId}`);
    }
    const requestBody = transformRequestForProvider(providerConfig, {
        model: modelId,
        query,
        documents,
        top_n: top_n || documents.length,
        return_documents: return_documents !== false
    });
    // DeepInfra puts the model in the URL path (POST /v1/inference/<model>); all others use a fixed
    // rerank endpoint with the model in the body.
    const rerankUrl = providerConfig.format === "deepinfra" ? `${providerConfig.baseUrl}/${modelId}` : providerConfig.baseUrl;
    // Resolve per-connection proxy so rerank honors the same proxy pinning as chat
    // and embeddings (#7350). Without this, rerank requests egress directly and fail
    // when the provider blocks certain IP ranges (e.g. Voyage AI from Russian IPs).
    let proxyInfo = null;
    if (connectionId) {
        try {
            proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionId);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("RERANK", `Proxy resolution failed for connection ${connectionId}: ${err}`);
        }
    }
    const doFetch = ()=>fetch(rerankUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...buildAuthHeader(providerConfig, token)
            },
            body: JSON.stringify(requestBody)
        });
    try {
        const res = connectionId ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, doFetch) : await doFetch();
        if (!res.ok) {
            const errData = await res.json().catch(()=>({}));
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(res.status, errData.message || errData.error?.message || `Provider returned HTTP ${res.status}`);
        }
        const data = await res.json();
        const result = transformResponseFromProvider(providerConfig, data, {
            documents,
            top_n: top_n || documents.length,
            return_documents
        });
        const searchUnits = Number(result?.meta?.billed_units?.search_units) || 0;
        const costUsd = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateModalCost"])("rerank", providerId, modelId, {
            searchUnits
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/rerank",
            status: 200,
            model: `${providerId}/${modelId}`,
            provider: providerId,
            duration: Date.now() - startTime,
            tokens: {
                prompt_tokens: 0,
                completion_tokens: 0
            },
            responseBody: {
                results_count: Array.isArray(result?.results) ? result.results.length : 0
            }
        }).catch(()=>{});
        const headers = new Headers({
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
            "Content-Type": "application/json"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(headers, {
            provider: providerId,
            model: modelId,
            costUsd,
            latencyMs: Date.now() - startTime,
            requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])()
        });
        return new Response(JSON.stringify(result), {
            status: 200,
            headers
        });
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, `Rerank request failed: ${err.message}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/openrouterTranscription.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleOpenRouterTranscription",
    ()=>handleOpenRouterTranscription,
    "resolveOpenRouterAudioFormat",
    ()=>resolveOpenRouterAudioFormat
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/registryUtils.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$audioTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/audioTranscription.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$audioTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$audioTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function resolveOpenRouterAudioFormat(file) {
    const fileName = typeof file.name === "string" ? file.name.toLowerCase() : "";
    const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";
    if ([
        "wav",
        "mp3",
        "flac",
        "m4a",
        "ogg",
        "webm",
        "aac"
    ].includes(extension)) {
        return extension;
    }
    const mimeFormats = {
        "audio/wav": "wav",
        "audio/x-wav": "wav",
        "audio/mpeg": "mp3",
        "audio/mp3": "mp3",
        "audio/flac": "flac",
        "audio/x-flac": "flac",
        "audio/mp4": "m4a",
        "audio/ogg": "ogg",
        "audio/webm": "webm",
        "audio/aac": "aac"
    };
    // Browser-recorded blobs carry codec params (e.g. "audio/webm;codecs=opus");
    // match on the base MIME type only.
    const mimeType = (file.type || "").split(";")[0].trim().toLowerCase();
    return mimeFormats[mimeType] || "wav";
}
async function handleOpenRouterTranscription(provider, file, model, token, formData) {
    const body = {
        model,
        input_audio: {
            data: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(await file.arrayBuffer()).toString("base64"),
            format: resolveOpenRouterAudioFormat(file)
        }
    };
    const language = formData.get("language");
    if (language !== null) body.language = String(language);
    const responseFormat = formData.get("response_format");
    if (responseFormat !== null) body.response_format = String(responseFormat);
    // temperature arrives as a string from multipart form data; the JSON payload
    // needs a number or the upstream API rejects it.
    const temperature = formData.get("temperature");
    if (temperature !== null) {
        const parsed = Number.parseFloat(String(temperature));
        if (!Number.isNaN(parsed)) body.temperature = parsed;
    }
    // Forward timestamp granularities as a JSON array (the multipart path sends
    // them as repeated `timestamp_granularities[]` fields).
    const granularities = formData.getAll("timestamp_granularities[]");
    if (granularities.length > 0) {
        body.timestamp_granularities = granularities.map(String);
    }
    try {
        const res = await fetch(provider.baseUrl, {
            method: "POST",
            headers: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(provider, token),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$audioTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
        return new Response(await res.text(), {
            status: res.status,
            headers: {
                "Content-Type": res.headers.get("content-type") || "application/json"
            }
        });
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, `Transcription request failed: ${error.message}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/audioTranscription.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildMultipartBody",
    ()=>buildMultipartBody,
    "handleAudioTranscription",
    ()=>handleAudioTranscription,
    "upstreamErrorResponse",
    ()=>upstreamErrorResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cors.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
/**
 * Audio Transcription Handler
 *
 * Handles POST /v1/audio/transcriptions (Whisper API format).
 * Proxies multipart/form-data to upstream providers.
 *
 * Supported provider formats:
 * - OpenAI/Groq/Qwen3: standard multipart form-data proxy
 * - Deepgram: raw binary audio POST with model via query param
 * - AssemblyAI: async workflow (upload → submit → poll)
 * - Gladia: async workflow (upload → submit pre-recorded job → poll result_url)
 * - Nvidia NIM: multipart POST, transform response to { text }
 * - HuggingFace Inference: POST raw binary to /models/{model_id}
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/audioRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/registryUtils.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/vertexMedia.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$openrouterTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/openrouterTranscription.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$openrouterTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$openrouterTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
function upstreamErrorResponse(res, errText) {
    // Always return JSON so the client can parse the error reliably
    let errorMessage;
    try {
        const parsed = JSON.parse(errText);
        // Guard against `parsed.error` or `parsed.detail` being objects
        const raw = parsed?.err_msg || parsed?.error?.message || (typeof parsed?.error === "string" ? parsed.error : null) || parsed?.message || (typeof parsed?.detail === "string" ? parsed.detail : parsed?.detail?.message) || null;
        errorMessage = raw ? String(raw) : errText || `Upstream error (${res.status})`;
    } catch  {
        errorMessage = errText || `Upstream error (${res.status})`;
    }
    return Response.json({
        error: {
            message: errorMessage,
            code: res.status
        }
    }, {
        status: res.status,
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
/**
 * Validate a path segment to prevent path traversal / SSRF.
 */ function isValidPathSegment(segment) {
    return !segment.includes("..") && !segment.includes("//");
}
function getUploadedFileName(file) {
    return typeof file.name === "string" && file.name.length > 0 ? file.name : "audio.wav";
}
async function buildMultipartBody(file, fields, fileFieldName = "file") {
    const boundary = "----OmniRouteAudioBoundary" + Date.now().toString(36);
    const parts = [];
    const encoder = new TextEncoder();
    for (const [name, value] of Object.entries(fields)){
        parts.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
    }
    const fileName = getUploadedFileName(file).replace(/["]/g, "_").replace(/[\r\n]/g, "_");
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    parts.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`));
    parts.push(fileBytes);
    parts.push(encoder.encode(`\r\n--${boundary}--\r\n`));
    const totalLength = parts.reduce((sum, p)=>sum + p.length, 0);
    const body = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts){
        body.set(part, offset);
        offset += part.length;
    }
    return {
        body,
        contentType: "multipart/form-data; boundary=" + boundary
    };
}
/**
 * Infer a suitable Content-Type for Deepgram from the browser-provided MIME
 * type and the original filename.  Deepgram accepts `audio/*` and many raw
 * formats, but `video/*` causes it to silently fail with "no speech detected".
 *
 * Strategy:
 * 1. If the browser says `audio/*`, keep it as-is.
 * 2. If it's `video/*` (e.g. `.mp4`), remap to the audio equivalent so
 *    Deepgram extracts the audio track.  `.mp4` → `audio/mp4`, etc.
 * 3. Fall back to `application/octet-stream` which tells Deepgram to
 *    auto-detect from the raw bytes (most reliable for unknown formats).
 */ function resolveAudioContentType(file) {
    const browserType = (file.type || "").toLowerCase();
    const fileName = typeof file.name === "string" ? file.name.toLowerCase() : "";
    // 1) Browser already says it's audio — trust it
    if (browserType.startsWith("audio/")) return browserType;
    // 2) Derive from file extension (covers video/* and empty MIME)
    const ext = fileName.includes(".") ? fileName.split(".").pop() : "";
    const EXT_TO_MIME = {
        mp3: "audio/mpeg",
        mp4: "audio/mp4",
        m4a: "audio/mp4",
        wav: "audio/wav",
        ogg: "audio/ogg",
        flac: "audio/flac",
        webm: "audio/webm",
        aac: "audio/aac",
        wma: "audio/x-ms-wma",
        opus: "audio/opus"
    };
    if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
    // 3) Fallback — let Deepgram auto-detect from raw bytes
    return "application/octet-stream";
}
/**
 * Handle Deepgram transcription (raw binary audio, model via query param)
 */ async function handleDeepgramTranscription(providerConfig, file, modelId, token, formData) {
    const url = new URL(providerConfig.baseUrl);
    url.searchParams.set("model", modelId);
    url.searchParams.set("smart_format", "true");
    url.searchParams.set("punctuate", "true");
    // Language: if caller specified one, use it; otherwise let Deepgram auto-detect
    const langParam = formData?.get("language");
    if (typeof langParam === "string" && langParam.trim()) {
        url.searchParams.set("language", langParam.trim());
    } else {
        url.searchParams.set("detect_language", "true");
    }
    const arrayBuffer = await file.arrayBuffer();
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token),
            "Content-Type": resolveAudioContentType(file)
        },
        body: arrayBuffer
    });
    if (!res.ok) {
        return upstreamErrorResponse(res, await res.text());
    }
    const data = await res.json();
    // Transform Deepgram response to OpenAI Whisper format
    const text = data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? null;
    // null means the audio had no recognizable speech (music, silence, etc.)
    // Return it explicitly so the client can distinguish from a credentials error
    return Response.json({
        text: text ?? "",
        noSpeechDetected: text === null || text === ""
    }, {
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
/**
 * Handle AssemblyAI transcription (async: upload file → submit → poll)
 */ async function handleAssemblyAITranscription(providerConfig, file, modelId, token) {
    const authHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token);
    // Step 1: Upload the audio file
    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": "application/octet-stream"
        },
        body: arrayBuffer
    });
    if (!uploadRes.ok) {
        return upstreamErrorResponse(uploadRes, await uploadRes.text());
    }
    const { upload_url } = await uploadRes.json();
    // Step 2: Submit transcription request
    const submitRes = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            audio_url: upload_url,
            speech_models: [
                modelId
            ],
            language_detection: true
        })
    });
    if (!submitRes.ok) {
        return upstreamErrorResponse(submitRes, await submitRes.text());
    }
    const { id: transcriptId } = await submitRes.json();
    // Step 3: Poll for completion (max 120s)
    const pollUrl = `${providerConfig.baseUrl}/${transcriptId}`;
    const maxWait = 120_000;
    const start = Date.now();
    while(Date.now() - start < maxWait){
        await new Promise((r)=>setTimeout(r, 2000));
        const pollRes = await fetch(pollUrl, {
            headers: authHeaders
        });
        if (!pollRes.ok) continue;
        const result = await pollRes.json();
        if (result.status === "completed") {
            return Response.json({
                text: result.text || ""
            }, {
                headers: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
                }
            });
        }
        if (result.status === "error") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, result.error || "AssemblyAI transcription failed");
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(504, "AssemblyAI transcription timed out after 120s");
}
/**
 * Handle Gladia transcription (async: upload file → submit pre-recorded job → poll result_url)
 */ async function handleGladiaTranscription(providerConfig, file, modelId, token) {
    const authHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token);
    // Step 1: Upload the audio file (multipart/form-data)
    const { body: uploadBody, contentType: uploadCT } = await buildMultipartBody(file, {});
    const uploadRes = await fetch("https://api.gladia.io/v2/upload", {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": uploadCT
        },
        body: uploadBody
    });
    if (!uploadRes.ok) {
        return upstreamErrorResponse(uploadRes, await uploadRes.text());
    }
    const { audio_url } = await uploadRes.json();
    // Step 2: Submit the pre-recorded transcription job
    const submitRes = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            audio_url,
            model: modelId
        })
    });
    if (!submitRes.ok) {
        return upstreamErrorResponse(submitRes, await submitRes.text());
    }
    const { result_url: resultUrl } = await submitRes.json();
    if (!resultUrl) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, "Gladia did not return a result_url");
    }
    // Step 3: Poll for completion (max 120s)
    const maxWait = 120_000;
    const start = Date.now();
    while(Date.now() - start < maxWait){
        await new Promise((r)=>setTimeout(r, 2000));
        const pollRes = await fetch(resultUrl, {
            headers: authHeaders
        });
        if (!pollRes.ok) continue;
        const result = await pollRes.json();
        if (result.status === "done") {
            const text = result.result?.transcription?.full_transcript || "";
            return Response.json({
                text
            }, {
                headers: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
                }
            });
        }
        if (result.status === "error") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, result.error_code || result.error || "Gladia transcription failed");
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(504, "Gladia transcription timed out after 120s");
}
/**
 * Handle Nvidia NIM transcription
 * Multipart POST, transform response to { text }
 */ async function handleNvidiaTranscription(providerConfig, file, modelId, token) {
    const { body, contentType } = await buildMultipartBody(file, {
        model: modelId
    });
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token),
            "Content-Type": contentType
        },
        body
    });
    if (!res.ok) {
        return upstreamErrorResponse(res, await res.text());
    }
    const data = await res.json();
    // Normalize to { text } — Nvidia may return { text } directly or nested
    const text = data.text || data.transcript || "";
    return Response.json({
        text
    }, {
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
/**
 * Handle HuggingFace Inference transcription
 * POST raw binary audio to {baseUrl}/{model_id}, returns { text }
 */ async function handleHuggingFaceTranscription(providerConfig, file, modelId, token) {
    if (!isValidPathSegment(modelId)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "Invalid model ID");
    }
    const url = `${providerConfig.baseUrl}/${modelId}`;
    const arrayBuffer = await file.arrayBuffer();
    const res = await fetch(url, {
        method: "POST",
        headers: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token),
            "Content-Type": resolveAudioContentType(file)
        },
        body: arrayBuffer
    });
    if (!res.ok) {
        return upstreamErrorResponse(res, await res.text());
    }
    const data = await res.json();
    // HuggingFace returns { text } directly
    const text = data.text || "";
    return Response.json({
        text
    }, {
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
/**
 * Handle Kie.ai transcription
 */ function normalizeKieTranscriptionText(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(data.response) ? data.response : {};
    for (const value of [
        response.text,
        data.resultText,
        data.text,
        record.text
    ]){
        if (typeof value === "string") return value;
    }
    return "";
}
async function handleKieAudioTranscription(providerConfig, file, modelId, token) {
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(fileBuffer).toString("base64");
    let data;
    try {
        data = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl,
            token,
            payload: {
                model: modelId,
                input: {
                    file_name: getUploadedFileName(file),
                    file_base64: fileBase64
                }
            }
        });
    } catch (err) {
        const status = typeof err === "object" && err !== null && "status" in err ? Number(err.status) || 502 : 502;
        return Response.json({
            error: {
                message: err instanceof Error ? err.message : "Kie transcription createTask failed",
                code: status
            }
        }, {
            status,
            headers: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
            }
        });
    }
    const taskId = data?.data?.taskId || data?.taskId;
    if (taskId) {
        return pollKieTranscriptionResult(baseUrl, modelId, taskId, token);
    }
    return Response.json({
        text: data?.data?.text || data?.text || ""
    }, {
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
/**
 * Internal polling for Kie.ai async transcription tasks
 */ async function pollKieTranscriptionResult(baseUrl, modelId, taskId, token) {
    void modelId;
    const statusUrl = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].getTaskStatusUrl(baseUrl);
    try {
        const { data, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs: 120000,
            pollIntervalMs: 2000
        });
        if (state === "success") {
            const text = normalizeKieTranscriptionText(data);
            return Response.json({
                text
            }, {
                headers: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
                }
            });
        }
    } catch (err) {
        const status = typeof err === "object" && err !== null && "status" in err ? Number(err.status) || 504 : 504;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(status, err instanceof Error ? err.message : "Kie transcription generation timed out or failed");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(504, "Kie transcription generation timed out or failed");
}
/**
 * Handle Rev AI transcription (async: submit job with media upload → poll → fetch transcript)
 *
 * Rev AI accepts the audio file directly in the job-submission multipart body
 * (field "media"), avoiding AssemblyAI's separate upload step. Once the job
 * reaches a terminal state we fetch the plain-text transcript.
 */ async function handleRevAiTranscription(providerConfig, file, modelId, token) {
    const authHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token);
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    // Step 1: submit the job — multipart body with "media" (file) + "options" (JSON)
    const options = JSON.stringify({
        transcriber: modelId
    });
    const { body, contentType } = await buildMultipartBody(file, {
        options
    }, "media");
    const submitRes = await fetch(`${baseUrl}/jobs`, {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": contentType
        },
        body
    });
    if (!submitRes.ok) {
        return upstreamErrorResponse(submitRes, await submitRes.text());
    }
    const { id: jobId } = await submitRes.json();
    // Step 2: poll for completion (max 120s)
    const jobUrl = `${baseUrl}/jobs/${jobId}`;
    const maxWait = 120_000;
    const start = Date.now();
    while(Date.now() - start < maxWait){
        await new Promise((r)=>setTimeout(r, 2000));
        const pollRes = await fetch(jobUrl, {
            headers: authHeaders
        });
        if (!pollRes.ok) continue;
        const result = await pollRes.json();
        if (result.status === "transcribed") {
            const transcriptRes = await fetch(`${jobUrl}/transcript`, {
                headers: {
                    ...authHeaders,
                    Accept: "text/plain"
                }
            });
            if (!transcriptRes.ok) {
                return upstreamErrorResponse(transcriptRes, await transcriptRes.text());
            }
            const text = await transcriptRes.text();
            return Response.json({
                text: text || ""
            }, {
                headers: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
                }
            });
        }
        if (result.status === "failed") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, result.failure_detail || "Rev AI transcription failed");
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(504, "Rev AI transcription timed out after 120s");
}
/**
 * Speechmatics operating point (accuracy tier). Catalog model ids are the
 * real Speechmatics `operating_point` values ("standard", "enhanced",
 * "melia-1"), so this passes straight through — kept as a named seam in
 * case a future catalog id needs remapping.
 */ function speechmaticsOperatingPoint(modelId) {
    return modelId;
}
/**
 * Fetch and return the finished Speechmatics transcript once a job reaches
 * the "done" state.
 */ async function fetchSpeechmaticsTranscript(jobUrl, authHeaders) {
    const transcriptRes = await fetch(`${jobUrl}/transcript?format=txt`, {
        headers: {
            ...authHeaders,
            Accept: "text/plain"
        }
    });
    if (!transcriptRes.ok) {
        return upstreamErrorResponse(transcriptRes, await transcriptRes.text());
    }
    const text = await transcriptRes.text();
    return Response.json({
        text: text || ""
    }, {
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
function speechmaticsJobErrorMessage(result) {
    const errors = result?.job?.errors;
    const first = Array.isArray(errors) ? errors[0] : null;
    return first?.message || "Speechmatics transcription failed";
}
/**
 * Poll a submitted Speechmatics job until it reaches a terminal state
 * (max 120s), then fetch its transcript.
 */ async function pollSpeechmaticsJob(jobUrl, authHeaders) {
    const maxWait = 120_000;
    const start = Date.now();
    while(Date.now() - start < maxWait){
        await new Promise((r)=>setTimeout(r, 2000));
        const pollRes = await fetch(jobUrl, {
            headers: authHeaders
        });
        if (!pollRes.ok) continue;
        const result = await pollRes.json();
        const status = result?.job?.status;
        if (status === "done") {
            return fetchSpeechmaticsTranscript(jobUrl, authHeaders);
        }
        if (status === "rejected") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, speechmaticsJobErrorMessage(result));
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(504, "Speechmatics transcription timed out after 120s");
}
/**
 * Handle Speechmatics transcription (async batch: submit multipart job → poll → fetch transcript)
 *
 * Speechmatics batch mode accepts the audio file directly in the job-submission
 * multipart body (field "data_file") alongside a JSON "config" field describing
 * the requested transcription options. Streaming (real-time WebSocket) mode is
 * out of scope for v1 — this handler only implements batch (REST) transcription.
 */ async function handleSpeechmaticsTranscription(providerConfig, file, modelId, token) {
    const authHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token);
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    // Step 1: submit the job — multipart body with "data_file" (audio) + "config" (JSON)
    const config = JSON.stringify({
        type: "transcription",
        transcription_config: {
            operating_point: speechmaticsOperatingPoint(modelId)
        }
    });
    const { body, contentType } = await buildMultipartBody(file, {
        config
    }, "data_file");
    const submitRes = await fetch(baseUrl, {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": contentType
        },
        body
    });
    if (!submitRes.ok) {
        return upstreamErrorResponse(submitRes, await submitRes.text());
    }
    const { id: jobId } = await submitRes.json();
    if (!jobId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, "Speechmatics did not return a job id");
    }
    // Step 2: poll for completion (max 120s)
    return pollSpeechmaticsJob(`${baseUrl}/${jobId}`, authHeaders);
}
async function handleAudioTranscription({ formData, credentials, resolvedProvider = null, resolvedModel = null }) {
    const model = formData.get("model");
    if (typeof model !== "string" || !model) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "model is required");
    }
    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof Blob)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "file is required");
    }
    const file = fileEntry;
    // Use pre-resolved provider/model from route handler if available (supports dynamic provider_nodes).
    let providerConfig = resolvedProvider;
    let modelId = resolvedModel;
    if (!providerConfig) {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseTranscriptionModel"])(model);
        providerConfig = parsed.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTranscriptionProvider"])(parsed.provider) : null;
        modelId = parsed.model;
    }
    if (!providerConfig) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, `No transcription provider found for model "${model}". Available: openai, openrouter, groq, deepgram, assemblyai, nvidia, huggingface, qwen, gladia, rev-ai, speechmatics`);
    }
    // Skip credential check for local providers (authType: "none")
    const token = providerConfig.authType === "none" ? null : credentials?.apiKey || credentials?.accessToken;
    if (providerConfig.authType !== "none" && !token) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(401, `No credentials for transcription provider: ${providerConfig.id}`);
    }
    // Route to provider-specific handler
    if (providerConfig.format === "vertex-gemini") {
        try {
            const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(await file.arrayBuffer());
            const uploadedType = typeof file.type === "string" && file.type ? file.type : "audio/wav";
            const languageValue = formData.get("language");
            const promptValue = formData.get("prompt");
            const text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertexTranscribe"])(credentials ?? {}, {
                model: modelId,
                audioBase64: buffer.toString("base64"),
                mimeType: uploadedType,
                prompt: typeof promptValue === "string" ? promptValue : undefined,
                language: typeof languageValue === "string" ? languageValue : undefined
            });
            return Response.json({
                text
            }, {
                headers: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
                }
            });
        } catch (err) {
            const error = err;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(typeof error?.status === "number" ? error.status : 500, `Vertex transcription failed: ${error?.message || "unknown error"}`);
        }
    }
    if (providerConfig.format === "deepgram") {
        return handleDeepgramTranscription(providerConfig, file, modelId, token, formData);
    }
    if (providerConfig.format === "assemblyai") {
        return handleAssemblyAITranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "gladia") {
        return handleGladiaTranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "nvidia-asr") {
        return handleNvidiaTranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "huggingface-asr") {
        return handleHuggingFaceTranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "kie-audio") {
        return handleKieAudioTranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "rev-ai") {
        return handleRevAiTranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "speechmatics") {
        return handleSpeechmaticsTranscription(providerConfig, file, modelId, token);
    }
    if (providerConfig.format === "openrouter-stt") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$openrouterTranscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleOpenRouterTranscription"])(providerConfig, file, modelId, token, formData);
    }
    // Default: OpenAI/Groq/Qwen3-compatible multipart proxy
    const extraFields = {};
    for (const key of [
        "language",
        "prompt",
        "response_format",
        "temperature",
        "timestamp_granularities[]"
    ]){
        const val = formData.get(key);
        if (val !== null && val !== undefined) {
            extraFields[key] = String(val);
        }
    }
    const { body: multipartBody, contentType: multipartCT } = await buildMultipartBody(file, {
        model: modelId,
        ...extraFields
    });
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token),
                "Content-Type": multipartCT
            },
            body: multipartBody
        });
        if (!res.ok) {
            return upstreamErrorResponse(res, await res.text());
        }
        const data = await res.text();
        const respContentType = res.headers.get("content-type") || "application/json";
        return new Response(data, {
            status: 200,
            headers: {
                "Content-Type": respContentType
            }
        });
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, `Transcription request failed: ${error.message}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/audioSpeech.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAudioSpeech",
    ()=>handleAudioSpeech
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cors.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [instrumentation] (ecmascript)");
/**
 * Audio Speech Handler (TTS)
 *
 * Handles POST /v1/audio/speech (OpenAI TTS API format).
 * Returns audio binary stream.
 *
 * Supported provider formats:
 * - OpenAI / Qwen3 (openai-compatible): standard JSON → audio stream proxy
 * - Hyperbolic: POST { text } → { audio: base64 }
 * - Deepgram: POST { text } with model via query param, Token auth
 * - ElevenLabs: POST { text, model_id } to /v1/text-to-speech/{voice_id}
 * - Nvidia NIM: POST { input: { text }, voice, model } → audio binary
 * - HuggingFace Inference: POST { inputs: text } to /models/{model_id}
 * - Coqui TTS: POST { text, speaker_id } → WAV audio (local, no auth)
 * - Tortoise TTS: POST { text, voice } → audio binary (local, no auth)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/audioRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/registryUtils.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/vertexMedia.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$awsPollyTts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/awsPollyTts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$edgeTts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/edgeTts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$gtts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/gtts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/audioResponse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function normalizeKieElevenLabsVoice(voice) {
    const value = typeof voice === "string" ? voice.trim() : "";
    const aliases = {
        alloy: "Rachel",
        echo: "Adam",
        fable: "Brian",
        onyx: "Antoni",
        nova: "Bella",
        shimmer: "Dorothy"
    };
    return aliases[value.toLowerCase()] || value || "Rachel";
}
function findAudioUrlDeep(value) {
    if (!value) return null;
    if (typeof value === "string") {
        if (/^https?:\/\//i.test(value) && !/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(value)) {
            return value;
        }
        return null;
    }
    if (Array.isArray(value)) {
        for (const item of value){
            const url = findAudioUrlDeep(item);
            if (url) return url;
        }
        return null;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(value)) {
        const preferredKeys = [
            "audio_url",
            "audioUrl",
            "stream_audio_url",
            "streamAudioUrl",
            "resultUrl",
            "url",
            "downloadUrl",
            "resultUrls"
        ];
        for (const key of preferredKeys){
            const url = findAudioUrlDeep(value[key]);
            if (url) return url;
        }
        for (const item of Object.values(value)){
            const url = findAudioUrlDeep(item);
            if (url) return url;
        }
    }
    return null;
}
function findKieAudioUrl(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const resultJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKieResultJson"])(recordData);
    const response = data.response;
    const nestedData = data.data;
    const candidates = [
        response,
        data,
        resultJson,
        ...Array.isArray(response) ? response : [],
        ...Array.isArray(nestedData) ? nestedData : [],
        ...Array.isArray(resultJson.data) ? resultJson.data : [],
        ...Array.isArray(resultJson.result) ? resultJson.result : []
    ];
    for (const item of candidates){
        const url = findAudioUrlDeep(item);
        if (url) {
            return url;
        }
    }
    return null;
}
/**
 * Validate a path segment to prevent path traversal / SSRF.
 * Returns true if safe, false if it contains traversal sequences.
 */ function isValidPathSegment(segment) {
    return !segment.includes("..") && !segment.includes("//");
}
function getStringValue(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function getProviderSpecificData(credentials) {
    return credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && !Array.isArray(credentials.providerSpecificData) ? credentials.providerSpecificData : {};
}
function normalizeXiaomiMimoSpeechUrl(baseUrl) {
    const configured = getStringValue(baseUrl) || "https://api.xiaomimimo.com/v1";
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(configured).replace(/\/chat\/completions$/i, "");
    return `${normalized}/chat/completions`;
}
function normalizeXiaomiMimoMimeType(format) {
    switch(getStringValue(format)?.toLowerCase()){
        case undefined:
        case null:
        case "mp3":
        case "audio/mp3":
        case "audio/mpeg":
            return "audio/mpeg";
        case "wav":
        case "audio/wav":
            return "audio/wav";
        default:
            return null;
    }
}
function getXiaomiMimoAudioData(data) {
    const messageAudio = data?.choices?.[0]?.message?.audio;
    const directAudio = data?.audio || data?.output_audio;
    const firstDataItem = Array.isArray(data?.data) ? data.data[0] : null;
    return getStringValue(messageAudio?.data) || getStringValue(messageAudio?.b64_json) || getStringValue(directAudio?.data) || getStringValue(directAudio?.b64_json) || getStringValue(firstDataItem?.b64_json) || getStringValue(firstDataItem?.audio) || getStringValue(data?.audioContent) || getStringValue(data?.audio_content);
}
/**
 * Handle Hyperbolic TTS (returns base64 audio in JSON)
 */ async function handleHyperbolicSpeech(providerConfig, body, token) {
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            text: body.input
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    const data = await res.json();
    // Hyperbolic returns { audio: "<base64>" }, decode to binary
    const audioBuffer = Uint8Array.from(atob(data.audio), (c)=>c.charCodeAt(0));
    return new Response(audioBuffer, {
        status: 200,
        headers: {
            "Content-Type": "audio/mpeg"
        }
    });
}
/**
 * Handle Deepgram TTS (model via query param, Token auth, returns binary audio)
 */ async function handleDeepgramSpeech(providerConfig, body, modelId, token) {
    const url = new URL(providerConfig.baseUrl);
    url.searchParams.set("model", modelId);
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            text: body.input
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res);
}
/**
 * Handle ElevenLabs TTS
 * POST {baseUrl}/{voice_id} with { text, model_id }
 * voice_id is mapped from the OpenAI `voice` parameter
 */ async function handleElevenLabsSpeech(providerConfig, body, modelId, token) {
    // ElevenLabs uses voice_id in URL path; default to "21m00Tcm4TlvDq8ikWAM" (Rachel)
    const voiceId = body.voice || "21m00Tcm4TlvDq8ikWAM";
    if (!isValidPathSegment(voiceId)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "Invalid voice ID");
    }
    const url = `${providerConfig.baseUrl}/${voiceId}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            text: body.input,
            model_id: modelId
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res);
}
/**
 * Handle Nvidia NIM TTS
 * POST with { input: { text }, voice, model } → audio binary
 */ async function handleNvidiaTtsSpeech(providerConfig, body, modelId, token) {
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            input: {
                text: body.input
            },
            voice: body.voice || "default",
            model: modelId
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res, "audio/wav");
}
/**
 * Handle HuggingFace Inference TTS
 * POST {baseUrl}/{model_id} with { inputs: text } → audio binary
 */ async function handleHuggingFaceTtsSpeech(providerConfig, body, modelId, token) {
    if (!isValidPathSegment(modelId)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "Invalid model ID");
    }
    const url = `${providerConfig.baseUrl}/${modelId}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            inputs: body.input
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res, "audio/wav");
}
/**
 * Handle Inworld TTS
 * POST { text, voiceId, modelId, audioConfig } → JSON { audioContent: "<base64>" }
 * Docs: https://docs.inworld.ai/api-reference/ttsAPI/texttospeech/synthesize-speech
 */ const INWORLD_AUDIO_FORMATS = {
    mp3: {
        audioEncoding: "MP3",
        mimeType: "audio/mpeg"
    },
    wav: {
        audioEncoding: "WAV",
        mimeType: "audio/wav"
    },
    opus: {
        audioEncoding: "OPUS",
        mimeType: "audio/opus"
    },
    pcm: {
        audioEncoding: "PCM",
        mimeType: "audio/pcm"
    }
};
async function handleInworldSpeech(providerConfig, body, modelId, token) {
    const requestedFormat = typeof body.response_format === "string" ? body.response_format.toLowerCase() : "mp3";
    const audioFormat = INWORLD_AUDIO_FORMATS[requestedFormat];
    if (!audioFormat) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "Inworld TTS supports response_format mp3, wav, opus, or pcm only");
    }
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${token}`
        },
        body: JSON.stringify({
            text: body.input,
            voiceId: body.voice || undefined,
            modelId,
            audioConfig: {
                audioEncoding: audioFormat.audioEncoding
            }
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    const data = await res.json();
    // Decode base64 audioContent to binary
    const audioBuffer = Uint8Array.from(atob(data.audioContent ?? ""), (c)=>c.charCodeAt(0));
    const mimeType = typeof data.contentType === "string" && data.contentType ? data.contentType : audioFormat.mimeType;
    return new Response(audioBuffer, {
        status: 200,
        headers: {
            "Content-Type": mimeType
        }
    });
}
/**
 * Handle Cartesia TTS
 * POST { model_id, transcript, voice, output_format } → binary audio bytes
 * Docs: https://docs.cartesia.ai/api-reference/tts/bytes
 */ async function handleCartesiaSpeech(providerConfig, body, modelId, token) {
    const outputFormat = body.response_format === "wav" ? {
        container: "wav",
        sample_rate: 44100
    } : {
        container: "mp3",
        bit_rate: 128000,
        sample_rate: 44100
    };
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": token,
            "Cartesia-Version": "2024-06-10"
        },
        body: JSON.stringify({
            model_id: modelId,
            transcript: body.input,
            ...body.voice ? {
                voice: {
                    mode: "id",
                    id: body.voice
                }
            } : {},
            output_format: outputFormat
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res);
}
/**
 * Handle Fish Audio TTS
 * POST { text, format, reference_id, prosody } → binary audio bytes
 * Auth: Authorization: Bearer <api-key>, model as an HTTP header
 * Docs: https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech
 */ async function handleFishAudioSpeech(providerConfig, body, modelId, token) {
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            model: modelId
        },
        body: JSON.stringify({
            text: body.input,
            format: body.response_format || "mp3",
            ...body.voice ? {
                reference_id: body.voice
            } : {},
            ...body.speed ? {
                prosody: {
                    speed: body.speed
                }
            } : {}
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res);
}
/**
 * Handle PlayHT TTS
 * POST { text, voice, voice_engine, output_format } → audio stream
 * Auth: X-USER-ID header (from token string "userId:apiKey")
 * Docs: https://docs.play.ht/reference/api-generate-tts-audio-stream
 */ async function handlePlayHtSpeech(providerConfig, body, modelId, token) {
    // PlayHT tokens are stored as "userId:apiKey"
    const [userId, apiKey] = (token || ":").split(":");
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
            "X-USER-ID": userId || "",
            Authorization: `Bearer ${apiKey || token}`
        },
        body: JSON.stringify({
            text: body.input,
            voice: body.voice || "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json",
            voice_engine: modelId || "PlayDialog",
            output_format: body.response_format || "mp3",
            speed: body.speed || 1
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res);
}
/**
 * Handle Kie.ai TTS
 * Kie.ai has model-specific endpoints or uses unified jobs API.
 */ async function handleKieAudioSpeech(providerConfig, body, modelId, token) {
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const voice = normalizeKieElevenLabsVoice(body.voice);
    const payload = {
        model: modelId,
        callBackUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieCallbackUrl"])(body),
        input: {
            text: body.input,
            voice,
            stability: typeof body.stability === "number" ? body.stability : 0.5,
            similarity_boost: typeof body.similarity_boost === "number" ? body.similarity_boost : 0.75,
            style: typeof body.style === "number" ? body.style : 0,
            speed: typeof body.speed === "number" ? body.speed : 1,
            timestamps: body.timestamps === true,
            previous_text: body.previous_text || "",
            next_text: body.next_text || "",
            language_code: body.language_code || ""
        }
    };
    let data;
    try {
        data = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl,
            token,
            payload
        });
    } catch (err) {
        const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorStatus"])(err, 502);
        return Response.json({
            error: {
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorMessage"])(err, "Kie audio createTask failed"),
                code: status
            }
        }, {
            status,
            headers: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
            }
        });
    }
    const taskId = data?.data?.taskId || data?.taskId;
    if (taskId) {
        return pollKieAudioResult(baseUrl, modelId, taskId, token);
    }
    const audioUrl = findKieAudioUrl(data);
    if (typeof audioUrl === "string" && audioUrl.length > 0) {
        const audioRes = await fetch(audioUrl);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(audioRes);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, data?.msg || data?.message || "Kie audio generation did not return taskId or audio URL");
}
/**
 * Internal polling for Kie.ai async audio tasks
 */ async function pollKieAudioResult(baseUrl, modelId, taskId, token) {
    void modelId;
    const statusUrl = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].getTaskStatusUrl(baseUrl);
    try {
        const { data, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs: 60000,
            pollIntervalMs: 2000
        });
        if (state === "success") {
            const url = findKieAudioUrl(data);
            if (url) {
                const audioRes = await fetch(url);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(audioRes);
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, "Kie audio task completed without audio URL");
        }
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorStatus"])(err, 504), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorMessage"])(err, "Kie audio generation timed out or failed"));
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(504, "Kie audio generation timed out or failed");
}
/**
 * Xiaomi MiMo TTS uses chat/completions with an audio config instead of OpenAI's /audio/speech
 * request body.
 */ async function handleXiaomiMimoSpeech(providerConfig, body, modelId, token, credentials) {
    const providerSpecificData = getProviderSpecificData(credentials);
    const url = normalizeXiaomiMimoSpeechUrl(providerSpecificData.baseUrl || providerConfig.baseUrl);
    const audioMimeType = normalizeXiaomiMimoMimeType(body.response_format);
    if (!audioMimeType) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "Xiaomi MiMo TTS supports response_format mp3 or wav only");
    }
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            model: modelId,
            messages: [
                {
                    role: "assistant",
                    content: body.input
                }
            ],
            audio: {
                format: audioMimeType,
                voice: body.voice || getStringValue(providerSpecificData.defaultVoice) || "mimo_default"
            }
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("audio/")) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res, audioMimeType);
    }
    const data = await res.json();
    const audioBase64 = getXiaomiMimoAudioData(data);
    if (!audioBase64) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, "Xiaomi MiMo TTS response did not contain audio data");
    }
    const audioBuffer = Uint8Array.from(atob(audioBase64), (c)=>c.charCodeAt(0));
    return new Response(audioBuffer, {
        status: 200,
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
            "Content-Type": audioMimeType
        }
    });
}
/**
 * MiniMax T2A v2 — POST returns hex-encoded audio in a JSON envelope guarded by
 * `base_resp.status_code` (0 = success).
 * Port of decolua/9router#1043 by toanalien <toanalien@gmail.com>.
 */ function hexToBytes(audioHex) {
    const clean = typeof audioHex === "string" ? audioHex.trim() : "";
    if (!clean) throw new Error("MiniMax TTS returned no audio");
    if (clean.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(clean)) {
        throw new Error("MiniMax TTS returned invalid audio");
    }
    const len = clean.length / 2;
    const out = new Uint8Array(len);
    for(let i = 0; i < len; i++){
        out[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return out;
}
async function handleMinimaxSpeech(providerConfig, body, modelId, token) {
    const voiceId = typeof body.voice === "string" && body.voice || "English_expressive_narrator";
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
        },
        body: JSON.stringify({
            model: modelId || "speech-2.8-hd",
            text: body.input,
            stream: false,
            language_boost: "auto",
            output_format: "hex",
            voice_setting: {
                voice_id: voiceId,
                speed: typeof body.speed === "number" ? body.speed : 1,
                vol: 1,
                pitch: 0
            },
            audio_setting: {
                sample_rate: 32000,
                bitrate: 128000,
                format: "mp3",
                channel: 1
            }
        })
    });
    const rawText = await res.text();
    let data = {};
    if (rawText) {
        try {
            const parsed = JSON.parse(rawText);
            if (parsed && typeof parsed === "object") data = parsed;
        } catch  {
            data = {};
        }
    }
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, rawText);
    }
    const baseResp = data.base_resp || data.baseResp || {};
    const statusCode = Number(baseResp.status_code ?? baseResp.statusCode ?? 0);
    const statusMessage = String(baseResp.status_msg || baseResp.statusMsg || data.message || "");
    if (statusCode !== 0) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, `MiniMax TTS: ${statusMessage || "upstream error"}`);
    }
    const audioField = data.data?.audio;
    let bytes;
    try {
        bytes = hexToBytes(audioField);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "invalid audio";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, `MiniMax TTS: ${msg}`);
    }
    return new Response(bytes, {
        status: 200,
        headers: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
            "Content-Type": "audio/mpeg"
        }
    });
}
/**
 * Handle Coqui TTS (local, no auth)
 * POST {baseUrl} with { text, speaker_id } → WAV audio
 */ async function handleCoquiSpeech(providerConfig, body) {
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: body.input,
            speaker_id: body.voice || undefined
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    const contentType = res.headers.get("content-type") || "audio/wav";
    return new Response(res.body, {
        status: 200,
        headers: {
            "Content-Type": contentType
        }
    });
}
/**
 * Handle Tortoise TTS (local, no auth)
 * POST {baseUrl} with { text, voice } → audio binary
 */ async function handleTortoiseSpeech(providerConfig, body) {
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: body.input,
            voice: body.voice || "random"
        })
    });
    if (!res.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
    }
    const contentType = res.headers.get("content-type") || "audio/wav";
    return new Response(res.body, {
        status: 200,
        headers: {
            "Content-Type": contentType
        }
    });
}
/**
 * Handle gTTS TTS (local no-auth, Google Translate batchexecute RPC).
 * `voice` doubles as the language code since gTTS has no voice concept —
 * defaults to English when omitted or unrecognized.
 */ async function handleGttsSpeech(body) {
    try {
        const audio = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$gtts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["synthesizeGtts"])({
            text: body.input,
            lang: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$gtts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeGttsLang"])(body.voice)
        });
        return new Response(audio, {
            status: 200,
            headers: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
                "Content-Type": "audio/mpeg"
            }
        });
    } catch (err) {
        const status = err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$gtts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GttsUpstreamError"] ? err.status : 502;
        const message = err instanceof Error ? err.message : "gTTS synthesis failed";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(status, message);
    }
}
async function handleAudioSpeech({ body, credentials, resolvedProvider = null, resolvedModel = null, clientIp = null }) {
    if (!body.model) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "model is required");
    }
    if (!body.input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "input is required");
    }
    // Use pre-resolved provider/model from route handler if available (supports dynamic provider_nodes).
    // Falls back to hardcoded registry lookup for backward compatibility.
    let providerConfig = resolvedProvider;
    let modelId = resolvedModel;
    if (!providerConfig) {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseSpeechModel"])(body.model);
        providerConfig = parsed.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSpeechProvider"])(parsed.provider) : null;
        modelId = parsed.model;
    }
    if (!providerConfig) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, `No speech provider found for model "${body.model}". Use format provider/model. Available: openai, hyperbolic, deepgram, nvidia, elevenlabs, huggingface, inworld, cartesia, fishaudio, playht, kie, aws-polly, xiaomi-mimo, edgetts, gtts, coqui, tortoise, qwen`);
    }
    // Skip credential check for local providers (authType: "none")
    const token = providerConfig.authType === "none" ? null : credentials?.apiKey || credentials?.accessToken;
    if (providerConfig.authType !== "none" && !token) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(401, `No credentials for speech provider: ${providerConfig.id}`);
    }
    try {
        // Route to provider-specific handler
        if (providerConfig.format === "vertex-gemini-tts") {
            const { audio, contentType } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertexGenerateSpeech"])(credentials, {
                model: modelId,
                input: body.input,
                voice: body.voice
            });
            return new Response(audio, {
                status: 200,
                headers: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
                    "Content-Type": contentType
                }
            });
        }
        if (providerConfig.format === "hyperbolic") {
            return handleHyperbolicSpeech(providerConfig, body, token);
        }
        if (providerConfig.format === "deepgram") {
            return handleDeepgramSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "elevenlabs") {
            return handleElevenLabsSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "nvidia-tts") {
            return handleNvidiaTtsSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "huggingface-tts") {
            return handleHuggingFaceTtsSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "inworld") {
            return handleInworldSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "cartesia") {
            return handleCartesiaSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "fishaudio") {
            return handleFishAudioSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "playht") {
            return handlePlayHtSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "kie-audio") {
            return handleKieAudioSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "aws-polly") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$awsPollyTts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAwsPollySpeech"])(providerConfig, body, modelId, token, credentials);
        }
        if (providerConfig.format === "edgetts") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$edgeTts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleEdgeTtsSpeech"])(body, clientIp);
        }
        if (providerConfig.format === "gtts") {
            return handleGttsSpeech(body);
        }
        if (providerConfig.format === "xiaomi-mimo-tts") {
            return handleXiaomiMimoSpeech(providerConfig, body, modelId, token, credentials);
        }
        if (providerConfig.format === "minimax-tts") {
            return handleMinimaxSpeech(providerConfig, body, modelId, token);
        }
        if (providerConfig.format === "coqui") {
            return handleCoquiSpeech(providerConfig, body);
        }
        if (providerConfig.format === "tortoise") {
            return handleTortoiseSpeech(providerConfig, body);
        }
        // Default: OpenAI-compatible JSON → audio stream proxy (also used by Qwen3)
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAuthHeaders"])(providerConfig, token)
            },
            body: JSON.stringify({
                model: modelId,
                input: body.input,
                voice: body.voice || "alloy",
                response_format: body.response_format || "mp3",
                speed: body.speed || 1.0
            })
        });
        if (!res.ok) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstreamErrorResponse"])(res, await res.text());
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$audioResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["audioStreamResponse"])(res);
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, `Speech request failed: ${err.message}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/moderations.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleModeration",
    ()=>handleModeration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cors.ts [instrumentation] (ecmascript)");
/**
 * Moderation Handler
 *
 * Handles POST /v1/moderations (OpenAI Moderations API format).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$moderationRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/moderationRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function handleModeration({ body, credentials }) {
    const startTime = Date.now();
    if (!body.input) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "input is required");
    }
    // Default to latest moderation model
    const model = body.model || "omni-moderation-latest";
    const { provider: providerId, model: modelId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$moderationRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseModerationModel"])(model);
    const providerConfig = providerId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$moderationRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModerationProvider"])(providerId) : null;
    if (!providerConfig) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, `No moderation provider found for model "${model}". Available: openai`);
    }
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(401, `No credentials for moderation provider: ${providerId}`);
    }
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                model: modelId,
                input: body.input
            })
        });
        if (!res.ok) {
            const errText = await res.text();
            return new Response(errText, {
                status: res.status,
                headers: {
                    "Content-Type": "application/json",
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
                }
            });
        }
        const data = await res.json();
        const headers = new Headers({
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
            "Content-Type": "application/json"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(headers, {
            provider: providerId,
            model: modelId,
            costUsd: 0,
            latencyMs: Date.now() - startTime,
            requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])()
        });
        return new Response(JSON.stringify(data), {
            status: 200,
            headers
        });
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(500, `Moderation request failed: ${err.message}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/googleFlow.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Google Flow (labs.google/flow) video generation — pure helpers.
 *
 * Google Flow drives Veo video generation through Google's internal AI Sandbox
 * endpoint (`aisandbox-pa.googleapis.com`) using a Google account OAuth bearer
 * token — the same Google OAuth credential family that the Antigravity provider
 * already uses (accessToken + Cloud Code projectId). The request/response shape
 * mirrors the *documented* Veo `predictLongRunning` long-running-operation API
 * (see `open-sse/executors/vertexMedia.ts::vertexGenerateVideo`):
 *
 *   submit  →  { instances: [{ prompt, image? }], parameters: { sampleCount, ... } }  →  { name: <operation> }
 *   poll    →  { operationName }  →  { done, error?, response: { videos: [{ bytesBase64Encoded | gcsUri }] } }
 *
 * ⚠️ PENDING LIVE VALIDATION (Hard Rule #18): the exact AI-Sandbox URL path and
 * whether Flow wraps the Veo body in the Cloud-Code `{ project, request }` envelope
 * cannot be unit-tested — they require a real Google Flow account + a captured HAR.
 * Everything that depends on the wire host/path is isolated in the two constants
 * below and in the handler, so confirming a captured HAR is a one-line change.
 * The transformation logic in this file is grounded in the documented Veo shape
 * and is fully unit-tested.
 */ /**
 * Google Flow has no standalone connection — it reuses the Antigravity Google
 * OAuth credential (accessToken + Cloud Code projectId). Credential lookups for
 * the `googleflow` provider resolve against this provider id.
 */ __turbopack_context__.s([
    "GOOGLE_FLOW_CREDENTIAL_PROVIDER",
    ()=>GOOGLE_FLOW_CREDENTIAL_PROVIDER,
    "GOOGLE_FLOW_HOST",
    ()=>GOOGLE_FLOW_HOST,
    "GOOGLE_FLOW_POLL_PATH",
    ()=>GOOGLE_FLOW_POLL_PATH,
    "GOOGLE_FLOW_SUBMIT_PATH",
    ()=>GOOGLE_FLOW_SUBMIT_PATH,
    "buildGoogleFlowSubmitBody",
    ()=>buildGoogleFlowSubmitBody,
    "normalizeFlowVideoParams",
    ()=>normalizeFlowVideoParams,
    "parseFlowOperationName",
    ()=>parseFlowOperationName,
    "parseFlowOperationResult",
    ()=>parseFlowOperationResult,
    "resolveFlowAccessToken",
    ()=>resolveFlowAccessToken,
    "resolveFlowProjectId",
    ()=>resolveFlowProjectId,
    "resolveVideoCredentialProvider",
    ()=>resolveVideoCredentialProvider
]);
const GOOGLE_FLOW_CREDENTIAL_PROVIDER = "antigravity";
function resolveVideoCredentialProvider(provider) {
    return provider === "googleflow" ? GOOGLE_FLOW_CREDENTIAL_PROVIDER : provider;
}
const GOOGLE_FLOW_HOST = "https://aisandbox-pa.googleapis.com";
const GOOGLE_FLOW_SUBMIT_PATH = "/v1:generateVideo";
const GOOGLE_FLOW_POLL_PATH = "/v1:fetchOperation";
function asTrimmedString(value) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
const ASPECT_RATIO_RE = /^\d{1,2}:\d{1,2}$/;
function normalizeFlowVideoParams(body) {
    const b = body ?? {};
    const prompt = typeof b.prompt === "string" ? b.prompt : String(b.prompt ?? "");
    const sizeMaybeRatio = asTrimmedString(b.size);
    const aspectRatio = asTrimmedString(b.aspect_ratio) ?? asTrimmedString(b.aspectRatio) ?? (sizeMaybeRatio && ASPECT_RATIO_RE.test(sizeMaybeRatio) ? sizeMaybeRatio : undefined);
    const durationRaw = typeof b.duration === "number" ? b.duration : typeof b.durationSeconds === "number" ? b.durationSeconds : undefined;
    const durationSeconds = typeof durationRaw === "number" && Number.isFinite(durationRaw) && durationRaw > 0 ? Math.floor(durationRaw) : undefined;
    const nRaw = typeof b.n === "number" ? b.n : undefined;
    const sampleCount = typeof nRaw === "number" && Number.isFinite(nRaw) && nRaw > 0 ? Math.floor(nRaw) : 1;
    return {
        prompt,
        aspectRatio,
        durationSeconds,
        sampleCount,
        negativePrompt: asTrimmedString(b.negative_prompt) ?? asTrimmedString(b.negativePrompt),
        resolution: asTrimmedString(b.resolution)
    };
}
function buildGoogleFlowSubmitBody(params) {
    const parameters = {
        sampleCount: params.sampleCount
    };
    if (params.aspectRatio) parameters.aspectRatio = params.aspectRatio;
    if (typeof params.durationSeconds === "number") parameters.durationSeconds = params.durationSeconds;
    if (params.negativePrompt) parameters.negativePrompt = params.negativePrompt;
    if (params.resolution) parameters.resolution = params.resolution;
    return {
        instances: [
            {
                prompt: params.prompt
            }
        ],
        parameters
    };
}
function parseFlowOperationName(json) {
    if (!json || typeof json !== "object") return null;
    const direct = json.name;
    if (typeof direct === "string" && direct.length > 0) return direct;
    const op = json.operation;
    if (op && typeof op === "object" && typeof op.name === "string" && op.name.length > 0) {
        return op.name;
    }
    return null;
}
function extractVideoFromResponse(response) {
    if (!response || typeof response !== "object") return null;
    // Documented Veo LRO shape: response.videos[].bytesBase64Encoded | gcsUri
    const videos = response.videos;
    if (Array.isArray(videos) && videos.length > 0) {
        const v = videos[0];
        if (v && typeof v === "object") {
            const rec = v;
            if (typeof rec.bytesBase64Encoded === "string") return {
                base64: rec.bytesBase64Encoded
            };
            if (typeof rec.gcsUri === "string") return {
                url: rec.gcsUri
            };
            if (typeof rec.uri === "string") return {
                url: rec.uri
            };
        }
    }
    // Alternate Veo shape: response.generateVideoResponse.generatedSamples[].video.uri
    const gen = response.generateVideoResponse;
    const samples = gen && typeof gen === "object" ? gen.generatedSamples : undefined;
    if (Array.isArray(samples) && samples.length > 0) {
        const sample = samples[0];
        const video = sample && typeof sample === "object" ? sample.video : undefined;
        if (video && typeof video === "object") {
            const rec = video;
            if (typeof rec.uri === "string") return {
                url: rec.uri
            };
            if (typeof rec.bytesBase64Encoded === "string") return {
                base64: rec.bytesBase64Encoded
            };
        }
    }
    return null;
}
function parseFlowOperationResult(json) {
    if (!json || typeof json !== "object") return {
        done: false
    };
    const done = Boolean(json.done);
    if (!done) return {
        done: false
    };
    const opError = json.error;
    if (opError && typeof opError === "object") {
        return {
            done: true,
            error: String(opError.message || "Google Flow video operation failed")
        };
    }
    const response = json.response;
    const video = extractVideoFromResponse(response);
    if (video?.base64) return {
        done: true,
        base64: video.base64,
        format: "mp4"
    };
    if (video?.url) return {
        done: true,
        url: video.url,
        format: "mp4"
    };
    return {
        done: true,
        error: "Google Flow operation completed but returned no video"
    };
}
function resolveFlowProjectId(credentials) {
    const cred = credentials ?? {};
    const direct = asTrimmedString(cred.projectId);
    if (direct) return direct;
    const psd = cred.providerSpecificData;
    if (psd && typeof psd === "object") {
        const fromPsd = asTrimmedString(psd.projectId);
        if (fromPsd) return fromPsd;
    }
    return null;
}
function resolveFlowAccessToken(credentials) {
    const cred = credentials ?? {};
    return asTrimmedString(cred.accessToken) ?? asTrimmedString(cred.apiKey) ?? null;
}
}),
"[project]/open-sse/handlers/videoGeneration/googleFlowHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGoogleFlowVideoGeneration",
    ()=>handleGoogleFlowVideoGeneration
]);
/**
 * Veo video generation via Google Flow (labs.google/flow) — request orchestration.
 *
 * Uses the Google account OAuth bearer + Cloud Code projectId that the Antigravity
 * provider already establishes — no separate OAuth flow is added. Submits the
 * documented Veo `predictLongRunning` body to Google's AI Sandbox endpoint, polls
 * the long-running operation, and returns the MP4 (base64 or URL).
 *
 * ⚠️ PENDING LIVE VALIDATION (Hard Rule #18): the AI-Sandbox host/path and the
 * Cloud-Code request envelope cannot be unit-tested — they require a real Google
 * Flow account + a captured HAR. The wire surface is isolated to the two path
 * constants (`GOOGLE_FLOW_SUBMIT_PATH`/`GOOGLE_FLOW_POLL_PATH`) and the `project`
 * wrap below, so confirming a captured HAR is a one-line change. The pure
 * transformation helpers are fully unit-tested (google-flow-video-4569.test.ts).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/googleFlow.ts [instrumentation] (ecmascript)");
;
;
const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 5 * 60 * 1000;
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
async function handleGoogleFlowVideoGeneration({ model, providerConfig, body, credentials, log }) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFlowAccessToken"])(credentials);
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "Missing Google OAuth token for Google Flow. Connect a Google account in Providers (the Antigravity/Cloud Code connection) first."
        };
    }
    const projectId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFlowProjectId"])(credentials);
    if (!projectId) {
        return {
            success: false,
            status: 400,
            error: "Missing Google projectId for Google Flow. Please reconnect OAuth in Providers so OmniRoute can fetch your Cloud Code project."
        };
    }
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeFlowVideoParams"])(body);
    const submitBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGoogleFlowSubmitBody"])(params);
    // PENDING LIVE VALIDATION: Cloud-Code envelope wraps the Veo body with `project`/`model`.
    const wireBody = {
        ...submitBody,
        project: projectId,
        model
    };
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
    try {
        log?.info?.("VIDEO", `googleflow/${model} (veo) | submitting | aspect: ${params.aspectRatio ?? "default"}`);
        const submitRes = await fetch(`${baseUrl}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GOOGLE_FLOW_SUBMIT_PATH"]}`, {
            method: "POST",
            headers,
            body: JSON.stringify(wireBody)
        });
        if (!submitRes.ok) {
            const errorText = await submitRes.text();
            return {
                success: false,
                status: submitRes.status,
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Google Flow submit failed: ${errorText.slice(0, 300)}`)
            };
        }
        const operationName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseFlowOperationName"])(await submitRes.json());
        if (!operationName) {
            return {
                success: false,
                status: 502,
                error: "Google Flow did not return an operation name"
            };
        }
        const deadline = Date.now() + MAX_WAIT_MS;
        while(Date.now() < deadline){
            await sleep(POLL_INTERVAL_MS);
            const pollRes = await fetch(`${baseUrl}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GOOGLE_FLOW_POLL_PATH"]}`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    operationName
                })
            });
            if (!pollRes.ok) {
                const errorText = await pollRes.text();
                return {
                    success: false,
                    status: pollRes.status,
                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Google Flow poll failed: ${errorText.slice(0, 300)}`)
                };
            }
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseFlowOperationResult"])(await pollRes.json());
            if (!result.done) continue;
            if (result.error) {
                return {
                    success: false,
                    status: 502,
                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(result.error)
                };
            }
            const item = result.base64 ? {
                b64_json: result.base64,
                format: result.format
            } : {
                url: result.url,
                format: result.format
            };
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: [
                        item
                    ]
                }
            };
        }
        return {
            success: false,
            status: 504,
            error: "Google Flow video generation timed out"
        };
    } catch (err) {
        const e = err ?? {};
        log?.error?.("VIDEO", `Google Flow generation failed: ${e.message}`);
        return {
            success: false,
            status: typeof e.status === "number" ? e.status : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(e.message || "Google Flow generation failed")
        };
    }
}
}),
"[project]/open-sse/handlers/videoGeneration/deepinfraHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildDeepinfraVideoRequestBody",
    ()=>buildDeepinfraVideoRequestBody,
    "extractDeepinfraErrorMessage",
    ()=>extractDeepinfraErrorMessage,
    "handleDeepinfraVideoGeneration",
    ()=>handleDeepinfraVideoGeneration
]);
/**
 * DeepInfra native text/image-to-video generation.
 *
 * DeepInfra's `/v1/inference/{model}` endpoint is already proven in this codebase for
 * reranking (`open-sse/handlers/rerank.ts` + `open-sse/config/rerankRegistry.ts`) — same
 * host, same Bearer auth, same non-OpenAI response shape. This reuses the stored
 * `deepinfra` provider credential (already registered for chat) — no new credential flow.
 *
 * Confirmed against DeepInfra's own docs (https://deepinfra.com/<model>/api): the call is
 * synchronous — `POST {prompt}` returns `{video_url, seed, request_id, inference_status}`
 * directly, no task/poll loop like `kie-video`/`dashscope-video`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function buildDeepinfraVideoRequestBody(body) {
    const payload = {
        prompt: typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "")
    };
    if (typeof body.negative_prompt === "string" && body.negative_prompt) {
        payload.negative_prompt = body.negative_prompt;
    }
    const image = body.image ?? body.image_url;
    if (typeof image === "string" && image) {
        payload.image = image;
    }
    if (typeof body.seed === "number" && Number.isFinite(body.seed)) {
        payload.seed = body.seed;
    }
    return payload;
}
function extractDeepinfraErrorMessage(data) {
    if (!isRecord(data)) return null;
    const direct = data.error ?? data.detail ?? data.message;
    if (typeof direct === "string" && direct) return direct;
    if (isRecord(direct) && typeof direct.message === "string" && direct.message) {
        return direct.message;
    }
    const status = data.inference_status;
    if (isRecord(status) && typeof status.error === "string" && status.error) {
        return status.error;
    }
    return null;
}
function logDeepinfraCall(ctx, status, extra) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status,
        model: `${ctx.provider}/${ctx.model}`,
        provider: ctx.provider,
        duration: Date.now() - ctx.startTime,
        ...extra
    }).catch(()=>{});
}
function buildDeepinfraFetchError(ctx, status, data, log) {
    const errorMessage = extractDeepinfraErrorMessage(data) || `DeepInfra returned HTTP ${status}`;
    log?.error?.("VIDEO", `${ctx.provider} deepinfra-video error ${status}: ${errorMessage}`);
    logDeepinfraCall(ctx, status, {
        error: errorMessage.slice(0, 500)
    });
    return {
        success: false,
        status,
        error: errorMessage
    };
}
function buildDeepinfraSuccess(ctx, videoUrl) {
    logDeepinfraCall(ctx, 200, {
        responseBody: {
            videos_count: 1
        }
    });
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    url: videoUrl,
                    format: "mp4"
                }
            ]
        }
    };
}
function buildDeepinfraCatchError(ctx, err, log) {
    const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error";
    log?.error?.("VIDEO", `${ctx.provider} deepinfra-video error: ${errorMessage}`);
    logDeepinfraCall(ctx, 502, {
        error: errorMessage
    });
    return {
        success: false,
        status: 502,
        error: errorMessage
    };
}
async function fetchDeepinfraVideo(baseUrl, model, token, requestBody) {
    const res = await fetch(`${baseUrl}/${model}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });
    const data = await res.json().catch(()=>({}));
    return {
        res,
        data
    };
}
async function handleDeepinfraVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const ctx = {
        provider,
        model,
        startTime: Date.now()
    };
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "DeepInfra API key is required"
        };
    }
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const requestBody = buildDeepinfraVideoRequestBody(body);
    const promptPreview = String(body.prompt ?? "").slice(0, 60);
    log?.info?.("VIDEO", `${provider}/${model} (deepinfra-video) | prompt: "${promptPreview}..."`);
    try {
        const { res, data } = await fetchDeepinfraVideo(baseUrl, model, token, requestBody);
        if (!res.ok) return buildDeepinfraFetchError(ctx, res.status, data, log);
        const videoUrl = typeof data.video_url === "string" ? data.video_url : null;
        if (!videoUrl) {
            const errorMessage = extractDeepinfraErrorMessage(data) || "DeepInfra video generation did not return video_url";
            return {
                success: false,
                status: 502,
                error: errorMessage
            };
        }
        return buildDeepinfraSuccess(ctx, videoUrl);
    } catch (err) {
        return buildDeepinfraCatchError(ctx, err, log);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/leonardoHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleLeonardoVideoGeneration",
    ()=>handleLeonardoVideoGeneration
]);
/**
 * Leonardo AI (Phoenix) video generation: submit → poll → fetch output.
 *
 * Extracted out of the frozen `videoGeneration.ts` god-file (unchanged behavior) to make
 * room for the new DeepInfra video adapter without pushing the file-size ratchet over its
 * baseline — mirrors the existing `googleFlowHandler.ts` extraction.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function handleLeonardoVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            modelId: "phoenix",
            prompt: body.prompt,
            width: 1024,
            height: 576,
            num_frames: 24
        })
    });
    if (!res.ok) {
        const errorText = await res.text();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: res.status,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errorText.slice(0, 500)
        }).catch(()=>{});
        return {
            success: false,
            status: res.status,
            error: errorText
        };
    }
    const { sdGenerationJob } = await res.json();
    const genId = sdGenerationJob?.generationId;
    if (!genId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "No generation ID returned"
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: "No generation ID returned"
        };
    }
    const deadline = Date.now() + 300000;
    while(Date.now() < deadline){
        await sleep(5000);
        const statusRes = await fetch(`${providerConfig.baseUrl}/${genId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const status = await statusRes.json();
        const gen = status.generations_by_pk || status;
        if (gen.status === "COMPLETE") {
            const imgUrl = gen.generated_images?.[0]?.url;
            if (imgUrl) {
                const videoRes = await fetch(imgUrl);
                const buf = await videoRes.arrayBuffer();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                b64_json: Buffer.from(buf).toString("base64"),
                                format: "mp4"
                            }
                        ]
                    }
                };
            }
        }
        if (gen.status === "FAILED") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "Leonardo video generation failed"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "Leonardo video generation failed"
            };
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status: 504,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: "Leonardo video generation timed out"
    }).catch(()=>{});
    return {
        success: false,
        status: 504,
        error: "Leonardo video generation timed out"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/dashscopeHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDashscopeVideoGeneration",
    ()=>handleDashscopeVideoGeneration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handleDashscopeVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
    const token = credentials?.apiKey || credentials?.accessToken;
    const isAlibabaManagedMediaProvider = provider === "alibaba" || provider === "bailian-coding-plan" || provider === "qwen-cloud" || provider === "qwen-cloud-token-plan";
    const isRegisteredAlibabaMediaModel = !isAlibabaManagedMediaProvider || providerConfig.models?.some((entry)=>entry.id === model) === true;
    if (!isRegisteredAlibabaMediaModel) {
        return {
            success: false,
            status: 400,
            error: `Unsupported ${provider} video model: ${model}`
        };
    }
    const baseUrl = (isAlibabaManagedMediaProvider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlibabaProviderMediaBaseUrl"])(provider, credentials?.providerSpecificData, providerConfig.baseUrl) : providerConfig.baseUrl).replace(/\/$/, "");
    const statusUrl = (isAlibabaManagedMediaProvider ? `${baseUrl}/tasks` : providerConfig.statusUrl || `${baseUrl}/tasks`).replace(/\/$/, "");
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "Alibaba DashScope API key is required"
        };
    }
    const payload = provider === "qwen-cloud" || provider === "alibaba" ? buildAlibabaMediaPayload(provider, model, prompt, body) : provider === "qwen-cloud-token-plan" || provider === "bailian-coding-plan" ? buildHappyHorsePayload(model, prompt, body) : buildLegacyDashscopePayload(model, prompt, body);
    if ("error" in payload) {
        return {
            success: false,
            status: 400,
            error: payload.error
        };
    }
    if (log) {
        log.info("VIDEO", `${provider}/${model} (dashscope-video) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        // Step 1: create async task (X-DashScope-Async: enable)
        const createRes = await fetch(`${baseUrl}/services/aigc/video-generation/video-synthesis`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-DashScope-Async": "enable"
            },
            body: JSON.stringify(payload)
        });
        const createData = await createRes.json().catch(()=>({}));
        const taskId = createData?.output?.task_id;
        if (!taskId) {
            const errorMessage = createData?.message || createData?.errors?.[0]?.message || "DashScope video generation did not return task_id";
            if (log) {
                log.error("VIDEO", `DashScope createTask failed: ${JSON.stringify(createData)}`);
            }
            return {
                success: false,
                status: 502,
                error: String(errorMessage)
            };
        }
        // Step 2: poll statusUrl/{task_id} until terminal
        const deadline = startTime + timeoutMs;
        let lastStatus = "PENDING";
        while(Date.now() < deadline){
            await new Promise((resolve)=>setTimeout(resolve, pollIntervalMs));
            const pollRes = await fetch(`${statusUrl}/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const pollData = await pollRes.json().catch(()=>({}));
            lastStatus = pollData?.output?.task_status || "PENDING";
            if (lastStatus === "SUCCEEDED") {
                const videoUrl = pollData?.output?.video_url;
                if (!videoUrl) {
                    return {
                        success: false,
                        status: 502,
                        error: "DashScope task SUCCEEDED but no video_url"
                    };
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    responseBody: {
                        videos_count: 1
                    }
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                url: videoUrl,
                                format: "mp4"
                            }
                        ]
                    }
                };
            }
            if (lastStatus === "FAILED" || lastStatus === "UNKNOWN_ERROR") {
                const errorMessage = pollData?.output?.message || pollData?.output?.errors?.[0]?.message || "DashScope video task FAILED";
                return {
                    success: false,
                    status: 502,
                    error: String(errorMessage)
                };
            }
        // PENDING / RUNNING → keep polling
        }
        return {
            success: false,
            status: 504,
            error: `DashScope task ${taskId} timed out (status: ${lastStatus})`
        };
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
function buildLegacyDashscopePayload(model, prompt, body) {
    const sizeParam = normalizeDashscopeSize(body.size, body.aspect_ratio);
    const parameters = {};
    if (sizeParam) parameters.size = sizeParam;
    if (body.duration != null) parameters.duration = Number(body.duration);
    return {
        model,
        input: {
            prompt,
            ...typeof body.negative_prompt === "string" ? {
                negative_prompt: body.negative_prompt
            } : {}
        },
        parameters
    };
}
function buildHappyHorsePayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const media = collectDashscopeMedia(body);
    if (model.endsWith("-i2v")) {
        const firstFrame = media.find((item)=>item.type === "first_frame") || media.find((item)=>item.type === "reference_image");
        if (!firstFrame) {
            return {
                error: `Image input is required for video model: ${model}`
            };
        }
        input.media = [
            {
                type: "first_frame",
                url: firstFrame.url
            }
        ];
    } else if (model.endsWith("-r2v")) {
        const referenceImages = media.filter((item)=>item.type === "first_frame" || item.type === "reference_image").map((item)=>({
                type: "reference_image",
                url: item.url
            }));
        if (referenceImages.length === 0) {
            return {
                error: `Reference image input is required for video model: ${model}`
            };
        }
        input.media = referenceImages;
    }
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, !model.endsWith("-i2v"))
    };
}
function buildAlibabaMediaPayload(provider, model, prompt, body) {
    if (model === "happyhorse-1.1-i2v" || model === "happyhorse-1.1-t2v" || model === "happyhorse-1.1-r2v") {
        return buildHappyHorsePayload(model, prompt, body);
    }
    if (model === "happyhorse-1.0-video-edit" || model === "wan2.7-videoedit") {
        return buildModernDashscopeVideoEditPayload(model, prompt, body);
    }
    if (model === "wan2.7-t2v" || model === "wan2.7-t2v-2026-06-12") {
        return buildModernDashscopeTextToVideoPayload(model, prompt, body);
    }
    if (model === "wan2.7-i2v" || model === "wan2.7-i2v-2026-04-25" || model === "wan2.6-i2v-flash") {
        return buildModernDashscopeImageToVideoPayload(model, prompt, body);
    }
    if (model === "wan2.7-r2v-2026-06-12") {
        return buildModernDashscopeReferenceToVideoPayload(model, prompt, body);
    }
    return {
        error: `Unsupported ${provider} video model: ${model}`
    };
}
function buildModernDashscopeTextToVideoPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const audio = collectDashscopeMedia(body).find((item)=>item.type === "driving_audio");
    if (audio) input.audio_url = audio.url;
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, true)
    };
}
function buildModernDashscopeImageToVideoPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const media = collectDashscopeMedia(body);
    const firstFrame = media.find((item)=>item.type === "first_frame") || media.find((item)=>item.type === "reference_image");
    if (!firstFrame) {
        return {
            error: `Image input is required for video model: ${model}`
        };
    }
    input.media = [
        {
            type: "first_frame",
            url: firstFrame.url
        },
        ...media.filter((item)=>item.type === "last_frame" || item.type === "driving_audio").map((item)=>copyDashscopeMediaItem(item))
    ];
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, false)
    };
}
function buildModernDashscopeReferenceToVideoPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const references = collectDashscopeMedia(body).flatMap((item)=>{
        if (item.type === "first_frame" || item.type === "last_frame" || item.type === "reference_image") {
            return [
                copyDashscopeMediaItem(item, "reference_image")
            ];
        }
        if (item.type === "video" || item.type === "first_clip" || item.type === "reference_video") {
            return [
                copyDashscopeMediaItem(item, "reference_video")
            ];
        }
        return [];
    });
    if (references.length === 0) {
        return {
            error: `Reference image or video input is required for video model: ${model}`
        };
    }
    input.media = references;
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, true)
    };
}
function buildModernDashscopeVideoEditPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const media = collectDashscopeMedia(body);
    const sourceVideo = media.find((item)=>item.type === "video" || item.type === "first_clip" || item.type === "reference_video");
    if (!sourceVideo) {
        return {
            error: `Video input is required for video model: ${model}`
        };
    }
    input.media = [
        {
            type: "video",
            url: sourceVideo.url
        },
        ...media.filter((item)=>item.type === "first_frame" || item.type === "reference_image").map((item)=>copyDashscopeMediaItem(item, "reference_image"))
    ];
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, true)
    };
}
const DASHSCOPE_MEDIA_TYPES = new Set([
    "first_frame",
    "last_frame",
    "first_clip",
    "reference_image",
    "reference_video",
    "video",
    "driving_audio"
]);
function buildDashscopeInput(prompt, body) {
    return {
        ...prompt ? {
            prompt
        } : {},
        ...typeof body.negative_prompt === "string" && body.negative_prompt.trim() ? {
            negative_prompt: body.negative_prompt.trim()
        } : {}
    };
}
function buildModernDashscopeParameters(body, includeRatio) {
    const parameters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(body.parameters) ? {
        ...body.parameters
    } : {};
    const resolution = normalizeHappyHorseResolution(body.resolution, body.size);
    if (resolution) parameters.resolution = resolution;
    const ratio = normalizeHappyHorseRatio(body.ratio, body.aspect_ratio, body.size);
    if (ratio && includeRatio) parameters.ratio = ratio;
    if (body.duration != null && Number.isFinite(Number(body.duration))) {
        parameters.duration = Number(body.duration);
    }
    if (typeof body.prompt_extend === "boolean") parameters.prompt_extend = body.prompt_extend;
    if (typeof body.watermark === "boolean") parameters.watermark = body.watermark;
    if (Number.isInteger(body.seed) && Number(body.seed) >= 0) parameters.seed = Number(body.seed);
    if (typeof body.shot_type === "string" && body.shot_type.trim()) {
        parameters.shot_type = body.shot_type.trim();
    }
    return parameters;
}
function copyDashscopeMediaItem(item, type = item.type) {
    return {
        type,
        url: item.url,
        ...item.reference_voice ? {
            reference_voice: item.reference_voice
        } : {}
    };
}
function collectDashscopeMedia(body) {
    if (Array.isArray(body.media)) {
        const explicit = body.media.filter(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"]).flatMap((item)=>{
            const normalized = toDashscopeMediaItem(item, "reference_image");
            return normalized ? [
                normalized
            ] : [];
        });
        if (explicit.length > 0) return dedupeDashscopeMedia(explicit);
    }
    const media = [];
    const imageCandidates = [
        body.image,
        body.image_url,
        body.imageUrls,
        body.image_urls
    ].flatMap((value)=>Array.isArray(value) ? value : [
            value
        ]);
    imageCandidates.forEach((value, index)=>{
        const item = toDashscopeMediaItem(value, index === 0 ? "first_frame" : "reference_image");
        if (item) media.push(item);
    });
    addDashscopeMedia(media, body.reference_images, "reference_image");
    addDashscopeMedia(media, [
        body.video,
        body.video_url,
        body.videoUrls,
        body.video_urls
    ], "video");
    addDashscopeMedia(media, body.reference_videos, "reference_video");
    addDashscopeMedia(media, [
        body.audio,
        body.audio_url
    ], "driving_audio");
    return dedupeDashscopeMedia(media);
}
function addDashscopeMedia(media, value, type) {
    const values = Array.isArray(value) ? value : [
        value
    ];
    for (const candidate of values.flatMap((item)=>Array.isArray(item) ? item : [
            item
        ])){
        const normalized = toDashscopeMediaItem(candidate, type);
        if (normalized) media.push(normalized);
    }
}
function toDashscopeMediaItem(value, fallbackType) {
    if (typeof value === "string" && value.trim()) {
        return {
            type: fallbackType,
            url: value.trim()
        };
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(value)) return null;
    const url = [
        value.url,
        value.image_url,
        value.video_url,
        value.audio_url
    ].find((candidate)=>typeof candidate === "string" && candidate.trim());
    if (typeof url !== "string") return null;
    const type = typeof value.type === "string" && DASHSCOPE_MEDIA_TYPES.has(value.type) ? value.type : fallbackType;
    return {
        type,
        url: url.trim(),
        ...typeof value.reference_voice === "string" && value.reference_voice.trim() ? {
            reference_voice: value.reference_voice.trim()
        } : {}
    };
}
function dedupeDashscopeMedia(media) {
    const seen = new Set();
    return media.filter((item)=>{
        const key = `${item.type}\0${item.url}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function normalizeHappyHorseResolution(resolution, size) {
    if (typeof resolution === "string" && /^(720|1080)p$/i.test(resolution.trim())) {
        return resolution.trim().toUpperCase();
    }
    if (typeof size !== "string") return undefined;
    const match = size.trim().match(/^(\d+)[x*](\d+)$/i);
    if (!match) return undefined;
    return Math.max(Number(match[1]), Number(match[2])) >= 1920 ? "1080P" : "720P";
}
function normalizeHappyHorseRatio(ratio, aspectRatio, size) {
    const explicit = [
        ratio,
        aspectRatio
    ].find((value)=>typeof value === "string" && /^\d+:\d+$/.test(value.trim()));
    if (typeof explicit === "string") return explicit.trim();
    if (typeof size !== "string") return undefined;
    const match = size.trim().match(/^(\d+)[x*](\d+)$/i);
    if (!match) return undefined;
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (width === height) return "1:1";
    if (width * 9 === height * 16) return "16:9";
    if (width * 16 === height * 9) return "9:16";
    if (width * 3 === height * 4) return "4:3";
    if (width * 4 === height * 3) return "3:4";
    return undefined;
}
// Map OmniRoute size/aspect_ratio → Alibaba DashScope "WxH" (1280*720).
// Accepts "1280*720", "1280x720", or a ratio "16:9". Returns undefined if unparseable
// (then omitted from the payload so DashScope applies its own default).
function normalizeDashscopeSize(size, aspectRatio) {
    if (typeof size === "string") {
        if (/^\d+\*\d+$/.test(size)) return size;
        if (/^\d+x\d+$/.test(size)) return size.replace("x", "*");
    }
    if (typeof aspectRatio === "string") {
        const ratioMap = {
            "16:9": "1280*720",
            "9:16": "720*1280",
            "1:1": "960*960"
        };
        return ratioMap[aspectRatio];
    }
    return undefined;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/novita.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Novita AI video generation — pure helpers.
 *
 * Novita exposes per-model async endpoints under `/v3/async/<model-slug>` (e.g.
 * `/v3/async/wan-t2v`, `/v3/async/kling-v1.6-t2v`) — unlike DashScope/Kie there is
 * no single shared submit path; the model id IS the path segment. Every model
 * shares one poll endpoint: `GET /v3/async/task-result?task_id=...`, returning
 * `{ task: { status, reason, progress_percent }, videos: [{ video_url }] }`.
 * Confirmed against Novita's published API reference (2026-07-17):
 * https://novita.ai/docs/api-reference/model-apis-wan-t2v
 * https://novita.ai/docs/api-reference/model-apis-kling-v1.6-t2v
 */ __turbopack_context__.s([
    "buildNovitaPollUrl",
    ()=>buildNovitaPollUrl,
    "buildNovitaSubmitBody",
    ()=>buildNovitaSubmitBody,
    "buildNovitaSubmitUrl",
    ()=>buildNovitaSubmitUrl,
    "normalizeNovitaVideoParams",
    ()=>normalizeNovitaVideoParams,
    "parseNovitaTaskId",
    ()=>parseNovitaTaskId,
    "parseNovitaTaskResult",
    ()=>parseNovitaTaskResult
]);
const NOVITA_TERMINAL_SUCCESS = new Set([
    "TASK_STATUS_SUCCEED",
    "SUCCEED",
    "SUCCEEDED"
]);
const NOVITA_TERMINAL_FAILURE = new Set([
    "TASK_STATUS_FAILED",
    "FAILED",
    "UNKNOWN_ERROR"
]);
function buildNovitaSubmitUrl(baseUrl, model) {
    return `${baseUrl.replace(/\/$/, "")}/${model}`;
}
function buildNovitaPollUrl(statusUrl, taskId) {
    return `${statusUrl.replace(/\/$/, "")}?task_id=${encodeURIComponent(taskId)}`;
}
function normalizeNovitaVideoParams(body) {
    const b = body ?? {};
    const prompt = typeof b.prompt === "string" ? b.prompt : String(b.prompt ?? "");
    const negativePrompt = typeof b.negative_prompt === "string" ? b.negative_prompt : undefined;
    const durationRaw = typeof b.duration === "number" ? b.duration : undefined;
    const duration = typeof durationRaw === "number" && Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : undefined;
    let width;
    let height;
    if (typeof b.size === "string") {
        const match = /^(\d+)\s*[x*]\s*(\d+)/.exec(b.size);
        if (match) {
            width = Number(match[1]);
            height = Number(match[2]);
        }
    }
    return {
        prompt,
        negativePrompt,
        duration,
        width,
        height
    };
}
function buildNovitaSubmitBody(params) {
    const payload = {
        prompt: params.prompt
    };
    if (params.negativePrompt) payload.negative_prompt = params.negativePrompt;
    if (typeof params.duration === "number") payload.duration = params.duration;
    if (typeof params.width === "number") payload.width = params.width;
    if (typeof params.height === "number") payload.height = params.height;
    return payload;
}
function parseNovitaTaskId(json) {
    if (!json || typeof json !== "object") return null;
    const taskId = json.task_id;
    return typeof taskId === "string" && taskId.length > 0 ? taskId : null;
}
/**
 * Interpret a `/v3/async/task-result` poll response into a normalized result.
 * `done: false` means still queued/processing — callers should keep polling.
 */ function extractNovitaVideoUrl(json) {
    const videos = json?.videos;
    if (!Array.isArray(videos) || videos.length === 0) return null;
    const first = videos[0];
    if (!first || typeof first !== "object") return null;
    const videoUrl = first.video_url;
    return typeof videoUrl === "string" && videoUrl.length > 0 ? videoUrl : null;
}
function parseNovitaTaskResult(json) {
    if (!json || typeof json !== "object") {
        return {
            done: false,
            status: "UNKNOWN"
        };
    }
    const task = json.task;
    const taskRec = task && typeof task === "object" ? task : {};
    const status = typeof taskRec.status === "string" ? taskRec.status : "UNKNOWN";
    if (NOVITA_TERMINAL_FAILURE.has(status)) {
        const reason = typeof taskRec.reason === "string" && taskRec.reason ? taskRec.reason : null;
        return {
            done: true,
            status,
            errorMessage: reason || `Novita video task ${status}`
        };
    }
    if (!NOVITA_TERMINAL_SUCCESS.has(status)) {
        return {
            done: false,
            status
        };
    }
    const videoUrl = extractNovitaVideoUrl(json);
    if (videoUrl) return {
        done: true,
        status,
        videoUrl
    };
    return {
        done: true,
        status,
        errorMessage: "Novita task succeeded but returned no video_url"
    };
}
}),
"[project]/open-sse/handlers/videoGeneration/novitaHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleNovitaVideoGeneration",
    ()=>handleNovitaVideoGeneration
]);
/**
 * Novita AI video generation — request orchestration.
 *
 * Reuses the stored Novita provider Bearer apiKey (same credential the Novita
 * chat/LLM gateway already uses — no separate credential flow). Submits to the
 * model-specific `/v3/async/<model>` endpoint, polls the shared `task-result`
 * endpoint by `task_id` with backoff, and returns the OpenAI-like response shape.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/novita.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_TIMEOUT_MS = 300_000;
const DEFAULT_POLL_INTERVAL_MS = 2500;
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/** Submit the async video task; returns the task_id or a ready-to-return error result. */ async function submitNovitaTask(submitUrl, headers, payload, log) {
    const submitRes = await fetch(submitUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });
    const submitData = await submitRes.json().catch(()=>({}));
    const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNovitaTaskId"])(submitData);
    if (taskId) return {
        taskId
    };
    const errorMessage = submitData?.message || "Novita did not return a task_id";
    log?.error?.("VIDEO", `Novita createTask failed: ${JSON.stringify(submitData)}`);
    return {
        error: {
            success: false,
            status: submitRes.ok ? 502 : submitRes.status,
            error: String(errorMessage)
        }
    };
}
/** Resolve the request timeout + poll interval, falling back to the module defaults. */ function resolveNovitaTiming(body) {
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : DEFAULT_TIMEOUT_MS;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : DEFAULT_POLL_INTERVAL_MS;
    return {
        timeoutMs,
        pollIntervalMs
    };
}
/** Poll task-result until terminal (success/failure) or the deadline elapses. */ async function pollNovitaTask(pollUrl, token, taskId, deadline, pollIntervalMs) {
    let lastStatus = "UNKNOWN";
    while(Date.now() < deadline){
        await sleep(pollIntervalMs);
        const pollRes = await fetch(pollUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const pollData = await pollRes.json().catch(()=>({}));
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNovitaTaskResult"])(pollData);
        lastStatus = result.status;
        if (!result.done) continue;
        if (result.videoUrl) {
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: [
                        {
                            url: result.videoUrl,
                            format: "mp4"
                        }
                    ]
                }
            };
        }
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(result.errorMessage)
        };
    }
    return {
        success: false,
        status: 504,
        error: `Novita task ${taskId} timed out (status: ${lastStatus})`
    };
}
async function handleNovitaVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "Novita AI API key is required"
        };
    }
    const { timeoutMs, pollIntervalMs } = resolveNovitaTiming(body);
    const statusUrl = providerConfig.statusUrl || `${providerConfig.baseUrl}/task-result`;
    const submitUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNovitaSubmitUrl"])(providerConfig.baseUrl, model);
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeNovitaVideoParams"])(body);
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNovitaSubmitBody"])(params);
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    log?.info?.("VIDEO", `${provider}/${model} (novita-video) | prompt: "${params.prompt.slice(0, 60)}..."`);
    try {
        const submitted = await submitNovitaTask(submitUrl, headers, payload, log);
        if ("error" in submitted) return submitted.error;
        const pollUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNovitaPollUrl"])(statusUrl, submitted.taskId);
        return await pollNovitaTask(pollUrl, token, submitted.taskId, Date.now() + timeoutMs, pollIntervalMs);
    } catch (err) {
        const e = err ?? {};
        log?.error?.("VIDEO", `Novita video generation failed: ${e.message}`);
        return {
            success: false,
            status: typeof e.status === "number" ? e.status : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(e.message || "Novita video generation failed")
        };
    }
}
}),
"[project]/open-sse/handlers/videoGeneration/xaiGrokImagineHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleXaiVideoGeneration",
    ()=>handleXaiVideoGeneration
]);
/**
 * xAI Grok Imagine video generation: create async job → poll → MP4.
 * Reuses the stored xai provider Bearer apiKey (same credential the
 * image-generation "xai" entry in imageRegistry.ts already uses) — no
 * separate credential flow. Mirrors the DashScope create+poll shape in
 * videoGeneration.ts, adapted to xAI's request_id / status
 * ("pending"|"processing"|"done"|"failed") job shape
 * (https://docs.x.ai/developers/rest-api-reference/inference/videos).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/** Map the OmniRoute video body onto xAI's create-job payload. */ function buildXaiVideoPayload(model, prompt, body) {
    const payload = {
        model,
        prompt
    };
    if (typeof body.image === "string") payload.image = body.image;
    if (body.duration != null) payload.duration = Number(body.duration);
    if (typeof body.aspect_ratio === "string") payload.aspect_ratio = body.aspect_ratio;
    if (typeof body.resolution === "string") payload.resolution = body.resolution;
    return payload;
}
/** POST the create-job request; resolves to the request_id or a ready error message. */ async function createXaiVideoJob({ baseUrl, token, payload, log }) {
    const createRes = await fetch(`${baseUrl}/generations`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const createData = await createRes.json().catch(()=>({}));
    const requestId = createData?.request_id;
    if (requestId) return {
        requestId: String(requestId)
    };
    const errorMessage = createData?.error?.message || createData?.message || "xAI video generation did not return request_id";
    if (log) {
        log.error("VIDEO", `xAI createJob failed: ${JSON.stringify(createData)}`);
    }
    return {
        error: String(errorMessage)
    };
}
/**
 * Poll statusUrl/{request_id} until a terminal status or the deadline.
 * Date.now() is read only in the loop condition, so the caller keeps full
 * control over the timeout budget it computed from its own startTime.
 */ async function pollXaiVideoJob({ statusUrl, requestId, token, deadline, pollIntervalMs }) {
    let lastStatus = "pending";
    while(Date.now() < deadline){
        await new Promise((resolve)=>setTimeout(resolve, pollIntervalMs));
        const pollRes = await fetch(`${statusUrl}/${requestId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const pollData = await pollRes.json().catch(()=>({}));
        lastStatus = pollData?.status || "pending";
        if (lastStatus === "done") return {
            terminal: "done",
            videoUrl: pollData?.video?.url
        };
        if (lastStatus === "failed") return {
            terminal: "failed",
            error: pollData?.error
        };
    // pending / processing → keep polling
    }
    return {
        terminal: "timeout",
        lastStatus
    };
}
/** Resolve the request knobs (timeouts, credential, endpoints, prompt) from the call. */ function resolveXaiVideoOptions(body, providerConfig, credentials) {
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    return {
        timeoutMs: Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000,
        pollIntervalMs: Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500,
        token: credentials?.apiKey || credentials?.accessToken,
        baseUrl,
        statusUrl: (providerConfig.statusUrl || baseUrl).replace(/\/$/, ""),
        prompt: typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "")
    };
}
/** Map a terminal poll outcome onto the OpenAI-like video response (or an error). */ function buildXaiVideoResponse({ outcome, requestId, provider, model, startTime }) {
    if (outcome.terminal === "failed") {
        return {
            success: false,
            status: 502,
            error: String(outcome.error || "xAI video job failed")
        };
    }
    if (outcome.terminal === "timeout") {
        return {
            success: false,
            status: 504,
            error: `xAI video job ${requestId} timed out (status: ${outcome.lastStatus})`
        };
    }
    if (!outcome.videoUrl) {
        return {
            success: false,
            status: 502,
            error: "xAI video job done but no video.url"
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status: 200,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        responseBody: {
            videos_count: 1
        }
    }).catch(()=>{});
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    url: outcome.videoUrl,
                    format: "mp4"
                }
            ]
        }
    };
}
async function handleXaiVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const { timeoutMs, pollIntervalMs, token, baseUrl, statusUrl, prompt } = resolveXaiVideoOptions(body, providerConfig, credentials);
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "xAI API key is required"
        };
    }
    if (log) {
        log.info("VIDEO", `${provider}/${model} (xai-video) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const created = await createXaiVideoJob({
            baseUrl,
            token,
            payload: buildXaiVideoPayload(model, prompt, body),
            log
        });
        if (!created.requestId) {
            return {
                success: false,
                status: 502,
                error: created.error
            };
        }
        const outcome = await pollXaiVideoJob({
            statusUrl,
            requestId: created.requestId,
            token,
            deadline: startTime + timeoutMs,
            pollIntervalMs
        });
        return buildXaiVideoResponse({
            outcome,
            requestId: created.requestId,
            provider,
            model,
            startTime
        });
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/providers/segmind.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleSegmindVideoGeneration",
    ()=>handleSegmindVideoGeneration
]);
// Segmind video-generation provider (#6656).
//
// Thin body-builder + response-formatter around the shared Segmind REST
// client (open-sse/utils/segmindClient.ts) — same wire shape as the image
// handler (imageGeneration/providers/segmind.ts): x-api-key auth, raw video
// bytes response (e.g. `video/mp4`) on success, no JSON envelope.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/segmindClient.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function buildSegmindVideoBody(body, prompt) {
    const upstreamBody = {
        prompt
    };
    if (typeof body.negative_prompt === "string") upstreamBody.negative_prompt = body.negative_prompt;
    if (typeof body.seed === "number") upstreamBody.seed = body.seed;
    if (body.duration != null) upstreamBody.duration = Number(body.duration);
    if (typeof body.aspect_ratio === "string") upstreamBody.aspect_ratio = body.aspect_ratio;
    return upstreamBody;
}
async function handleSegmindVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const token = credentials?.apiKey || credentials?.accessToken || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const upstreamBody = buildSegmindVideoBody(body, prompt);
    if (log) {
        log.info("VIDEO", `${provider}/${model} (segmind) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["segmindRequest"])({
        baseUrl: providerConfig.baseUrl,
        model,
        token,
        upstreamBody,
        callLogPath: "/v1/videos/generations",
        provider,
        scope: "VIDEO",
        log
    });
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSegmindFailure"])(result)) {
        return {
            success: false,
            status: result.status,
            error: result.error
        };
    }
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    b64_json: result.buffer.toString("base64"),
                    format: "mp4"
                }
            ]
        }
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/adobeFireflyHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdobeFireflyVideoGeneration",
    ()=>handleAdobeFireflyVideoGeneration
]);
// Adobe Firefly (unofficial) video-generation handler.
// Family: adobe-firefly-video | Provider: adobe-firefly
//
// Credentials: IMS access_token (JWT) or full Cookie header from
// firefly.adobe.com / new.express.adobe.com.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyClient.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
async function handleAdobeFireflyVideoGeneration({ model, provider, body, credentials, log, fetchImpl = fetch }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
        return {
            success: false,
            status: 400,
            error: "Prompt is required for Adobe Firefly video generation"
        };
    }
    try {
        const accessToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeAccessToken"])(credentials, fetchImpl);
        const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300_000);
        const seed = typeof body.seed === "number" ? body.seed : typeof body.seed === "string" && String(body.seed).trim() ? Number(body.seed) : undefined;
        // Keep raw paste for Cookie + sherlockToken (x-arp-session-id).
        const psd = credentials?.providerSpecificData;
        const sessionCookie = typeof psd?.cookie === "string" && psd.cookie.trim() || typeof credentials?.apiKey === "string" && credentials.apiKey.trim() || (typeof credentials?.accessToken === "string" && credentials.accessToken.includes(";") ? credentials.accessToken : undefined);
        // Kling i2v / Veo ref / Sora frame: upload reference images first.
        const { id: videoModelId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeVideoModel"])(String(model));
        const maxFrames = videoModelId.includes("kling") || videoModelId.includes("sora") ? 2 : 3;
        const sourceImageIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeSourceImageIds"])({
            accessToken,
            body,
            max: maxFrames,
            sessionCookie,
            prompt,
            fetchImpl,
            log
        });
        log?.info?.("VIDEO", `${provider}/${model} (adobe-firefly) | prompt: "${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}"` + (sourceImageIds.length ? ` | frames: ${sourceImageIds.length}` : ""));
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyGenerateVideo"])({
            accessToken,
            prompt,
            model,
            size: body.size,
            aspectRatio: body.aspect_ratio ?? body.aspectRatio ?? body.ratio ?? body.size,
            duration: body.duration ?? body.durationSeconds,
            quality: body.quality,
            resolution: body.resolution ?? body.quality,
            seed: Number.isFinite(seed) ? seed : undefined,
            negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : typeof body.negativePrompt === "string" ? body.negativePrompt : undefined,
            generateAudio: body.generate_audio !== false && body.generateAudio !== false,
            sourceImageIds: sourceImageIds.length ? sourceImageIds : undefined,
            sessionCookie,
            timeoutMs,
            fetchImpl,
            log
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: [
                    {
                        url: result.url,
                        format: result.format || "mp4"
                    }
                ]
            }
        };
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AdobeFireflyError"]) {
            log?.error?.("VIDEO", `${provider} adobe-firefly error ${err.status}: ${err.message}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: err.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: err.message.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: err.status,
                error: err.message
            };
        }
        const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        log?.error?.("VIDEO", `${provider} adobe-firefly exception: ${errorText}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 500,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errorText.slice(0, 500)
        }).catch(()=>{});
        return {
            success: false,
            status: 500,
            error: errorText
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleVideoGeneration",
    ()=>handleVideoGeneration
]);
/**
 * Video Generation Handler
 *
 * Handles POST /v1/videos/generations requests. Proxies to upstream video
 * generation providers (ComfyUI AnimateDiff/SVD, SD WebUI AnimateDiff, and
 * more — see the per-format handlers below). Response format (OpenAI-like):
 * { "created": 1234567890, "data": [{ "b64_json": "...", "format": "mp4" }] }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/videoRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/vertexMedia.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlowHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/googleFlowHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/deepinfraHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/leonardoHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/dashscopeHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novitaHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/novitaHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/xaiGrokImagineHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/providers/segmind.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/adobeFireflyHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/runway.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/comfyuiClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function handleVideoGeneration({ body, credentials, log }) {
    const { provider, model } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseVideoModel"])(body.model);
    if (!provider) {
        return {
            success: false,
            status: 400,
            error: `Invalid video model: ${body.model}. Use format: provider/model`
        };
    }
    const providerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVideoProvider"])(provider);
    if (!providerConfig) {
        return {
            success: false,
            status: 400,
            error: `Unknown video provider: ${provider}`
        };
    }
    if (providerConfig.format === "vertex-veo") {
        return handleVertexVeoGeneration({
            model,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "google-flow") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlowHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleGoogleFlowVideoGeneration"])({
            model,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "comfyui") {
        return handleComfyUIVideoGeneration({
            model,
            provider,
            providerConfig: {
                ...providerConfig,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComfyUiBaseUrl"])(credentials, providerConfig.baseUrl)
            },
            body,
            log
        });
    }
    if (providerConfig.format === "sdwebui-video") {
        return handleSDWebUIVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            log
        });
    }
    if (providerConfig.format === "kie-video") {
        return handleKieVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "runwayml") {
        return handleRunwayVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "haiper-video") {
        return handleHaiperVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "veoaifree-web") {
        return handleVeoAiFreeVideoGeneration({
            model,
            provider,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "leonardo-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleLeonardoVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "deepinfra-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleDeepinfraVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "dashscope-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleDashscopeVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "segmind") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSegmindVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "novita-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novitaHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleNovitaVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "xai-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleXaiVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "adobe-firefly-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAdobeFireflyVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    return {
        success: false,
        status: 400,
        error: `Unsupported video format: ${providerConfig.format}`
    };
}
/**
 * Veo video generation via Vertex AI (predictLongRunning → poll → MP4).
 * Uses the Vertex chat credentials (Service Account JSON or Express key).
 */ async function handleVertexVeoGeneration({ model, body, credentials, log }) {
    try {
        const aspectRatio = typeof body.aspect_ratio === "string" ? body.aspect_ratio : typeof body.aspectRatio === "string" ? body.aspectRatio : typeof body.size === "string" ? body.size : undefined;
        const durationSeconds = typeof body.duration === "number" ? body.duration : typeof body.durationSeconds === "number" ? body.durationSeconds : undefined;
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertexGenerateVideo"])(credentials, {
            model,
            prompt: String(body.prompt ?? ""),
            aspectRatio,
            durationSeconds,
            negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : undefined
        });
        const item = result.base64 ? {
            b64_json: result.base64,
            format: result.format
        } : {
            url: result.url,
            format: result.format
        };
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: [
                    item
                ]
            }
        };
    } catch (err) {
        log?.error?.("VIDEO", `Vertex Veo generation failed: ${err?.message}`);
        return {
            success: false,
            status: typeof err?.status === "number" ? err.status : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err?.message || "Vertex Veo generation failed")
        };
    }
}
/**
 * Handle ComfyUI video generation
 * Submits an AnimateDiff or SVD workflow, polls for completion, fetches output video
 */ async function handleVeoAiFreeVideoGeneration({ model, provider, body, credentials, log }) {
    const executor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])(provider);
    if (!executor) {
        return {
            success: false,
            status: 400,
            error: `Unknown video provider: ${provider}`
        };
    }
    const prompt = String(body.prompt ?? "");
    const systemParts = [];
    if (body.size) systemParts.push(`aspect_ratio: ${body.size}`);
    if (body.aspect_ratio) systemParts.push(`aspect_ratio: ${body.aspect_ratio}`);
    const response = await executor.execute({
        model,
        body: {
            ...body,
            model: `${provider}/${model}`,
            messages: [
                ...systemParts.length > 0 ? [
                    {
                        role: "system",
                        content: systemParts.join("\n")
                    }
                ] : [],
                {
                    role: "user",
                    content: prompt
                }
            ]
        },
        stream: false,
        credentials: credentials || {
            connectionId: "noauth"
        },
        signal: null,
        log
    });
    const upstreamResponse = response instanceof Response ? response : response.response;
    if (!upstreamResponse.ok) {
        return {
            success: false,
            status: upstreamResponse.status || 502,
            error: await upstreamResponse.text().catch(()=>"Video provider error")
        };
    }
    const payload = await upstreamResponse.json().catch(()=>null);
    const item = Array.isArray(payload?.data) ? payload.data[0] : null;
    if (!payload || !Array.isArray(payload.data) || payload.data.length !== 1 || !item || typeof item.b64_json !== "string" || item.b64_json.trim().length === 0 || item.format !== "mp4" || typeof item.url === "string") {
        return {
            success: false,
            status: 502,
            error: {
                error: {
                    message: "Veo AI Free did not return a valid MP4 artifact",
                    type: "upstream_error",
                    code: "VIDEO_ARTIFACT_UNAVAILABLE"
                }
            }
        };
    }
    return {
        success: true,
        data: payload
    };
}
async function handleComfyUIVideoGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const [width, height] = (body.size || "512x512").split("x").map(Number);
    const frames = body.frames || 16;
    // AnimateDiff workflow template
    const workflow = {
        "1": {
            class_type: "CheckpointLoaderSimple",
            inputs: {
                ckpt_name: model
            }
        },
        "2": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.prompt,
                clip: [
                    "1",
                    1
                ]
            }
        },
        "3": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.negative_prompt || "",
                clip: [
                    "1",
                    1
                ]
            }
        },
        "4": {
            class_type: "EmptyLatentImage",
            inputs: {
                width: width || 512,
                height: height || 512,
                batch_size: frames
            }
        },
        "5": {
            class_type: "KSampler",
            inputs: {
                seed: Math.floor(Math.random() * 2 ** 32),
                steps: body.steps || 20,
                cfg: body.cfg_scale || 7,
                sampler_name: "euler",
                scheduler: "normal",
                denoise: 1,
                model: [
                    "1",
                    0
                ],
                positive: [
                    "2",
                    0
                ],
                negative: [
                    "3",
                    0
                ],
                latent_image: [
                    "4",
                    0
                ]
            }
        },
        "6": {
            class_type: "VAEDecode",
            inputs: {
                samples: [
                    "5",
                    0
                ],
                vae: [
                    "1",
                    2
                ]
            }
        },
        "7": {
            class_type: "SaveAnimatedWEBP",
            inputs: {
                filename_prefix: "omniroute_video",
                fps: body.fps || 8,
                lossless: false,
                quality: 80,
                method: "default",
                images: [
                    "6",
                    0
                ]
            }
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (comfyui) | prompt: "${promptPreview}..." | frames: ${frames}`);
    }
    try {
        const promptId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["submitComfyWorkflow"])(providerConfig.baseUrl, workflow);
        const historyEntry = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pollComfyResult"])(providerConfig.baseUrl, promptId, 300_000);
        const outputFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractComfyOutputFiles"])(historyEntry);
        const videos = [];
        for (const file of outputFiles){
            const buffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchComfyOutput"])(providerConfig.baseUrl, file.filename, file.subfolder, file.type);
            const base64 = Buffer.from(buffer).toString("base64");
            videos.push({
                b64_json: base64,
                format: "webp"
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                videos_count: videos.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: videos
            }
        };
    } catch (err) {
        if (log) log.error("VIDEO", `${provider} comfyui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
/**
 * Handle SD WebUI video generation via AnimateDiff extension
 * POST to the AnimateDiff API endpoint
 */ async function handleSDWebUIVideoGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const [width, height] = (body.size || "512x512").split("x").map(Number);
    const url = `${providerConfig.baseUrl}/animatediff/v1/generate`;
    const upstreamBody = {
        prompt: body.prompt,
        negative_prompt: body.negative_prompt || "",
        width: width || 512,
        height: height || 512,
        steps: body.steps || 20,
        cfg_scale: body.cfg_scale || 7,
        frames: body.frames || 16,
        fps: body.fps || 8
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (sdwebui) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("VIDEO", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: response.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: errorText
            };
        }
        const data = await response.json();
        // SD WebUI AnimateDiff returns { video: "base64..." } or { images: [...] }
        const videos = [];
        if (data.video) {
            videos.push({
                b64_json: data.video,
                format: "mp4"
            });
        } else if (data.images) {
            for (const img of data.images){
                videos.push({
                    b64_json: typeof img === "string" ? img : img.image,
                    format: "mp4"
                });
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                videos_count: videos.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: videos
            }
        };
    } catch (err) {
        if (log) log.error("VIDEO", `${provider} sdwebui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
function normalizeKieVideoResult(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(data.response) ? data.response : {};
    const resultJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKieResultJson"])(recordData);
    const urls = Array.isArray(resultJson?.resultUrls) ? resultJson.resultUrls : Array.isArray(resultJson?.videoUrls) ? resultJson.videoUrls : Array.isArray(response.resultUrls) ? response.resultUrls : [];
    return urls.filter((url)=>typeof url === "string" && url.length > 0);
}
async function handleKieVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
    const token = credentials?.apiKey || credentials?.accessToken;
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "KIE API key is required"
        };
    }
    const payload = {
        model,
        input: {
            prompt,
            duration: body.duration ? String(body.duration) : "5",
            aspect_ratio: typeof body.aspect_ratio === "string" ? body.aspect_ratio : "16:9",
            sound: body.sound === true
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (kie-video) | prompt: "${promptPreview}..."`);
    }
    try {
        const createData = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl,
            token,
            payload
        });
        const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieTaskId"])(createData);
        if (!taskId) {
            const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE video generation did not return taskId";
            if (log) {
                log.error("VIDEO", `KIE createTask failed: ${JSON.stringify(createData)}`);
            }
            return {
                success: false,
                status: 502,
                error: errorMessage
            };
        }
        const statusUrl = providerConfig.statusUrl || `${baseUrl}/api/v1/jobs/recordInfo`;
        const { data: recordData, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs,
            pollIntervalMs
        });
        if (state === "success") {
            const videoUrls = normalizeKieVideoResult(recordData);
            const videos = videoUrls.map((url)=>({
                    url,
                    format: "mp4"
                }));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 200,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                responseBody: {
                    videos_count: videos.length
                }
            }).catch(()=>{});
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: videos
                }
            };
        }
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
        const errorMessage = data.failMsg || data.errorMessage || record.msg || "KIE video task failed";
        return {
            success: false,
            status: 502,
            error: String(errorMessage)
        };
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
async function handleRunwayVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 400,
            error: "No credentials for Runway provider"
        };
    }
    const promptImage = resolveRunwayPromptImage(body);
    const useImageToVideo = Boolean(promptImage);
    if (!useImageToVideo && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RUNWAYML_IMAGE_REQUIRED_MODELS"].has(model)) {
        return {
            success: false,
            status: 400,
            error: `Runway model ${model} requires promptImage for image-to-video generation`
        };
    }
    const ratio = resolveRunwayRatio(body);
    const duration = resolveRunwayDuration(body);
    const timeoutMs = resolvePositiveInteger(body.timeout_ms, 300000);
    const pollIntervalMs = resolvePositiveInteger(body.poll_interval_ms, 5000);
    const submitUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayApiUrl"])(useImageToVideo ? "/image_to_video" : "/text_to_video", providerConfig.baseUrl);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayHeaders"])(token);
    // prettier-ignore
    const upstreamBody = {
        model,
        promptText: body.prompt,
        ratio,
        duration
    };
    if (useImageToVideo) upstreamBody.promptImage = promptImage;
    if (typeof body.seed === "number" && Number.isFinite(body.seed)) {
        upstreamBody.seed = Math.max(0, Math.floor(body.seed));
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (runway ${useImageToVideo ? "image_to_video" : "text_to_video"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const submitResponse = await fetch(submitUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(upstreamBody)
        });
        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            if (log) {
                log.error("VIDEO", `${provider} submit error ${submitResponse.status}: ${errorText.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: submitResponse.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: submitResponse.status,
                error: errorText
            };
        }
        const submitData = await submitResponse.json();
        const taskId = typeof submitData?.id === "string" ? submitData.id : "";
        if (!taskId) {
            const errorText = `Runway submit did not return task id: ${JSON.stringify(submitData).slice(0, 400)}`;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: errorText
            };
        }
        const deadline = Date.now() + timeoutMs;
        let lastTask = null;
        while(Date.now() < deadline){
            const taskResponse = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayApiUrl"])(`/tasks/${encodeURIComponent(taskId)}`, providerConfig.baseUrl), {
                method: "GET",
                headers
            });
            if (!taskResponse.ok) {
                const errorText = await taskResponse.text();
                if (log) {
                    log.error("VIDEO", `${provider} poll error ${taskResponse.status}: ${errorText.slice(0, 200)}`);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: taskResponse.status,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: errorText.slice(0, 500),
                    responseBody: {
                        taskId,
                        stage: "poll"
                    }
                }).catch(()=>{});
                return {
                    success: false,
                    status: taskResponse.status,
                    error: errorText
                };
            }
            const task = await taskResponse.json();
            lastTask = task;
            const status = String(task?.status || "").toUpperCase();
            if (status === "SUCCEEDED") {
                const videos = await normalizeRunwayVideoResult(task, body);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    responseBody: {
                        videos_count: videos.length,
                        taskId,
                        mode: "async"
                    }
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: videos
                    }
                };
            }
            if (RUNWAY_TERMINAL_FAILURE_STATUSES.has(status)) {
                const errorText = extractRunwayFailureMessage(task) || `Runway task failed with status ${status}`;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 502,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: errorText.slice(0, 500),
                    responseBody: {
                        taskId,
                        status
                    }
                }).catch(()=>{});
                return {
                    success: false,
                    status: 502,
                    error: errorText
                };
            }
            await sleep(pollIntervalMs);
        }
        const timeoutError = `Runway task timeout after ${timeoutMs}ms (taskId=${taskId}, status=${String(lastTask?.status || "unknown")})`;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: timeoutError,
            responseBody: {
                taskId,
                status: lastTask?.status ?? null
            }
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: timeoutError
        };
    } catch (err) {
        if (log) log.error("VIDEO", `${provider} runway error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
const RUNWAY_TERMINAL_FAILURE_STATUSES = new Set([
    "FAILED",
    "CANCELED",
    "CANCELLED",
    "ABORTED",
    "DELETED"
]);
function resolveRunwayPromptImage(body) {
    const directCandidates = [
        body.promptImage,
        body.prompt_image,
        body.image,
        body.image_url,
        body.imageUrl,
        body.provider_options?.promptImage,
        body.provider_options?.prompt_image
    ];
    for (const candidate of directCandidates){
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
        if (candidate && typeof candidate === "object") return candidate;
        if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    }
    const arrayCandidates = [
        body.imageUrls,
        body.image_urls,
        body.provider_options?.imageUrls,
        body.provider_options?.image_urls
    ];
    for (const candidate of arrayCandidates){
        if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    }
    return null;
}
function resolveRunwayRatio(body) {
    const aspectRatio = typeof body.aspect_ratio === "string" ? body.aspect_ratio : body.aspectRatio;
    if (aspectRatio === "1280:720" || aspectRatio === "720:1280") return aspectRatio;
    if (aspectRatio === "16:9") return "1280:720";
    if (aspectRatio === "9:16") return "720:1280";
    const size = typeof body.size === "string" ? body.size : "";
    const [widthRaw, heightRaw] = size.split("x");
    const width = Number(widthRaw);
    const height = Number(heightRaw);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return width >= height ? "1280:720" : "720:1280";
    }
    return "1280:720";
}
function resolveRunwayDuration(body) {
    if (Number.isFinite(body.duration)) {
        return clampRunwayDuration(body.duration);
    }
    if (Number.isFinite(body.frames) && Number.isFinite(body.fps) && Number(body.fps) > 0) {
        return clampRunwayDuration(Number(body.frames) / Number(body.fps));
    }
    return 5;
}
function clampRunwayDuration(value) {
    const duration = Math.round(Number(value));
    if (!Number.isFinite(duration)) return 5;
    return Math.min(10, Math.max(2, duration));
}
function resolvePositiveInteger(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
    return Math.floor(numeric);
}
function extractRunwayOutputUrls(task) {
    const rawOutput = Array.isArray(task?.output) ? task.output : Array.isArray(task?.result) ? task.result : [];
    return rawOutput.map((entry)=>{
        if (typeof entry === "string") return entry;
        if (!entry || typeof entry !== "object") return null;
        return entry.url || entry.uri || entry.videoUrl || entry.video_url || null;
    }).filter((value)=>typeof value === "string" && value.length > 0);
}
function extractRunwayFailureMessage(task) {
    const directCandidates = [
        task?.failure,
        task?.failureReason,
        task?.error,
        task?.errorMessage,
        task?.message
    ];
    for (const candidate of directCandidates){
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    if (task?.failure && typeof task.failure === "object") {
        const nestedCandidates = [
            task.failure.message,
            task.failure.reason,
            task.failure.error,
            task.failure.code
        ];
        for (const candidate of nestedCandidates){
            if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
        }
    }
    return null;
}
async function normalizeRunwayVideoResult(task, body) {
    const urls = extractRunwayOutputUrls(task);
    if (urls.length === 0) {
        throw new Error(`Runway task completed without output URLs: ${JSON.stringify(task).slice(0, 400)}`);
    }
    if (body.response_format === "url") {
        return urls.map((url)=>({
                url,
                format: "mp4"
            }));
    }
    const videos = [];
    for (const url of urls){
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Runway output fetch failed (${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        videos.push({
            b64_json: Buffer.from(arrayBuffer).toString("base64"),
            format: "mp4"
        });
    }
    return videos;
}
async function handleHaiperVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            HAIPER_KEY: token
        },
        body: JSON.stringify({
            prompt: body.prompt,
            duration: 4,
            aspect_ratio: "16:9"
        })
    });
    if (!res.ok) {
        const errorText = await res.text();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: res.status,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errorText.slice(0, 500)
        }).catch(()=>{});
        return {
            success: false,
            status: res.status,
            error: errorText
        };
    }
    const { job_id } = await res.json();
    const deadline = Date.now() + 300000;
    while(Date.now() < deadline){
        await sleep(5000);
        const statusRes = await fetch(`${providerConfig.statusUrl}/${job_id}`, {
            headers: {
                HAIPER_KEY: token
            }
        });
        const status = await statusRes.json();
        if (status.status === "completed" || status.status === "succeeded") {
            const videoUrl = status.creation_url || status.output?.video_url;
            if (videoUrl) {
                const videoRes = await fetch(videoUrl);
                const buf = await videoRes.arrayBuffer();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                b64_json: Buffer.from(buf).toString("base64"),
                                format: "mp4"
                            }
                        ]
                    }
                };
            }
        }
        if (status.status === "failed") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "Haiper video generation failed"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "Haiper video generation failed"
            };
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status: 504,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: "Haiper video generation timed out"
    }).catch(()=>{});
    return {
        success: false,
        status: 504,
        error: "Haiper video generation timed out"
    };
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/musicGeneration.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleMusicGeneration",
    ()=>handleMusicGeneration
]);
/**
 * Music Generation Handler
 *
 * Handles POST /v1/music/generations requests.
 * Proxies to upstream music generation providers.
 *
 * Supported provider formats:
 * - ComfyUI: submit audio workflow → poll → fetch output
 *
 * Response format (OpenAI-like):
 * {
 *   "created": 1234567890,
 *   "data": [{ "b64_json": "...", "format": "wav" }]
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/musicRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/vertexMedia.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/comfyuiClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
function normalizeKieSunoModel(model) {
    const map = {
        "suno-v3.5": "V3_5",
        "suno-v4.0": "V4"
    };
    return map[model] || model;
}
function normalizeKieMusicTracks(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(data.response) ? data.response : {};
    const resultJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKieResultJson"])(recordData);
    const candidates = [
        response.sunoData,
        response.data,
        data.data,
        data.sunoData,
        resultJson.sunoData,
        resultJson.data,
        resultJson.result
    ];
    for (const candidate of candidates){
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate.map((track)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(track) ? track : typeof track === "string" ? {
                    audioUrl: track
                } : null).filter((track)=>track !== null);
        }
    }
    const singleUrl = response.audioUrl || response.audio_url || data.resultUrl || data.audio_url || resultJson.audioUrl || resultJson.audio_url || resultJson.url;
    return typeof singleUrl === "string" && singleUrl.length > 0 ? [
        {
            audioUrl: singleUrl
        }
    ] : [];
}
async function handleMusicGeneration({ body, credentials, log }) {
    const { provider, model } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseMusicModel"])(body.model);
    if (!provider) {
        return {
            success: false,
            status: 400,
            error: `Invalid music model: ${body.model}. Use format: provider/model`
        };
    }
    const providerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMusicProvider"])(provider);
    if (!providerConfig) {
        return {
            success: false,
            status: 400,
            error: `Unknown music provider: ${provider}`
        };
    }
    if (providerConfig.format === "vertex-lyria") {
        try {
            const { base64, format } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertexGenerateMusic"])(credentials, {
                model,
                prompt: String(body.prompt ?? ""),
                negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : undefined,
                sampleCount: typeof body.sample_count === "number" ? body.sample_count : undefined,
                seed: typeof body.seed === "number" ? body.seed : undefined
            });
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: [
                        {
                            b64_json: base64,
                            format
                        }
                    ]
                }
            };
        } catch (err) {
            log?.error?.("MUSIC", `Vertex Lyria generation failed: ${err?.message}`);
            return {
                success: false,
                status: typeof err?.status === "number" ? err.status : 502,
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err?.message || "Vertex Lyria generation failed")
            };
        }
    }
    if (providerConfig.format === "comfyui") {
        return handleComfyUIMusicGeneration({
            model,
            provider,
            providerConfig: {
                ...providerConfig,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComfyUiBaseUrl"])(credentials, providerConfig.baseUrl)
            },
            body,
            log
        });
    }
    if (providerConfig.format === "kie-music") {
        return handleKieMusicGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "suno-music") {
        return handleSunoMusicGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "udio-music") {
        return handleUdioMusicGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    return {
        success: false,
        status: 400,
        error: `Unsupported music format: ${providerConfig.format}`
    };
}
/**
 * Handle ComfyUI music generation
 * Submits an audio generation workflow (Stable Audio / MusicGen), polls, fetches output
 */ async function handleComfyUIMusicGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const duration = body.duration || 10; // seconds
    // Audio generation workflow template for ComfyUI
    const workflow = {
        "1": {
            class_type: "CheckpointLoaderSimple",
            inputs: {
                ckpt_name: model
            }
        },
        "2": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.prompt,
                clip: [
                    "1",
                    1
                ]
            }
        },
        "3": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.negative_prompt || "",
                clip: [
                    "1",
                    1
                ]
            }
        },
        "4": {
            class_type: "EmptyLatentAudio",
            inputs: {
                seconds: duration
            }
        },
        "5": {
            class_type: "KSampler",
            inputs: {
                seed: Math.floor(Math.random() * 2 ** 32),
                steps: body.steps || 100,
                cfg: body.cfg_scale || 7,
                sampler_name: "euler",
                scheduler: "normal",
                denoise: 1,
                model: [
                    "1",
                    0
                ],
                positive: [
                    "2",
                    0
                ],
                negative: [
                    "3",
                    0
                ],
                latent_image: [
                    "4",
                    0
                ]
            }
        },
        "6": {
            class_type: "VAEDecodeAudio",
            inputs: {
                samples: [
                    "5",
                    0
                ],
                vae: [
                    "1",
                    2
                ]
            }
        },
        "7": {
            class_type: "SaveAudio",
            inputs: {
                filename_prefix: "omniroute_music",
                audio: [
                    "6",
                    0
                ]
            }
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("MUSIC", `${provider}/${model} (comfyui) | prompt: "${promptPreview}..." | duration: ${duration}s`);
    }
    try {
        const promptId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["submitComfyWorkflow"])(providerConfig.baseUrl, workflow);
        const historyEntry = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pollComfyResult"])(providerConfig.baseUrl, promptId, 300_000);
        const outputFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractComfyOutputFiles"])(historyEntry);
        const audioFiles = [];
        for (const file of outputFiles){
            const buffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchComfyOutput"])(providerConfig.baseUrl, file.filename, file.subfolder, file.type);
            const base64 = Buffer.from(buffer).toString("base64");
            audioFiles.push({
                b64_json: base64,
                format: "wav"
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/music/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                audio_count: audioFiles.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: audioFiles
            }
        };
    } catch (err) {
        if (log) log.error("MUSIC", `${provider} comfyui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/music/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Music provider error"
        };
    }
}
async function handleKieMusicGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
    const token = credentials?.apiKey || credentials?.accessToken;
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "KIE API key is required"
        };
    }
    // Check if model is a Market model
    const fullRegistry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMusicProvider"])(provider);
    const modelEntry = fullRegistry?.models?.find((m)=>m.id === model);
    const isMarket = modelEntry?.isMarket || model.includes("/");
    let url = "";
    let payload = {};
    if (isMarket) {
        url = `${baseUrl}/api/v1/jobs/createTask`;
        payload = {
            model,
            callBackUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieCallbackUrl"])(body),
            input: {
                prompt,
                instrumental: true
            }
        };
    } else {
        url = `${baseUrl}/api/v1/generate`;
        payload = {
            prompt,
            customMode: false,
            instrumental: true,
            model: normalizeKieSunoModel(model),
            callBackUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieCallbackUrl"])(body)
        };
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("MUSIC", `${provider}/${model} (${isMarket ? "market" : "direct"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const endpoint = new URL(url).pathname;
        const createData = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl,
            token,
            payload,
            endpoint
        });
        const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieTaskId"])(createData);
        if (!taskId) {
            const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE music generation did not return taskId";
            if (log) {
                log.error("MUSIC", `KIE createTask failed: ${JSON.stringify(createData)}`);
            }
            return {
                success: false,
                status: 502,
                error: errorMessage
            };
        }
        const statusUrl = isMarket ? `${baseUrl}/api/v1/jobs/recordInfo` : providerConfig.statusUrl && !providerConfig.statusUrl.includes("jobs/recordInfo") ? providerConfig.statusUrl : `${baseUrl}/api/v1/generate/record-info`;
        const { data: recordData, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs,
            pollIntervalMs
        });
        if (state === "success") {
            const tracks = normalizeKieMusicTracks(recordData);
            const audioFiles = tracks.map((track)=>typeof track.audioUrl === "string" ? track.audioUrl : typeof track.audio_url === "string" ? track.audio_url : typeof track.url === "string" ? track.url : null).filter((url)=>typeof url === "string" && url.length > 0).map((url)=>({
                    url,
                    format: "mp3"
                }));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/music/generations",
                status: 200,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                responseBody: {
                    audio_count: audioFiles.length
                }
            }).catch(()=>{});
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: audioFiles
                }
            };
        }
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
        const errorMessage = data.errorMessage || data.failMsg || record.msg || "KIE music task failed";
        return {
            success: false,
            status: 502,
            error: String(errorMessage)
        };
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Music provider error"
        };
    }
}
async function handleSunoMusicGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const cookie = credentials?.apiKey || credentials?.providerSpecificData?.cookie || "";
    if (!cookie) {
        return {
            success: false,
            status: 401,
            error: "Suno session cookie is required"
        };
    }
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (log) {
        log.info("MUSIC", `${provider}/${model} (suno) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie
            },
            body: JSON.stringify({
                gpt_description_prompt: prompt,
                mv: model || "chirp-v3-5",
                prompt: body.lyrics || "",
                title: body.title || "",
                tags: body.tags || "",
                make_instrumental: body.instrumental || false
            })
        });
        if (!res.ok) {
            const errorText = await res.text();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/music/generations",
                status: res.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: res.status,
                error: errorText
            };
        }
        const clips = await res.json();
        const ids = clips.map((c)=>c.id).filter(Boolean);
        if (ids.length === 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/music/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "No clips returned from Suno"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "No clips returned from Suno"
            };
        }
        const deadline = Date.now() + 300000;
        while(Date.now() < deadline){
            await new Promise((r)=>setTimeout(r, 5000));
            const feedRes = await fetch(`${providerConfig.statusUrl}?ids=${ids.join(",")}`, {
                headers: {
                    Cookie: cookie
                }
            });
            const songs = await feedRes.json();
            const ready = songs.filter((s)=>s.audio_url);
            if (ready.length > 0) {
                const audioRes = await fetch(ready[0].audio_url);
                if (!audioRes.ok) {
                    return {
                        success: false,
                        status: audioRes.status,
                        error: `Failed to download audio: ${audioRes.status}`
                    };
                }
                const buf = await audioRes.arrayBuffer();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/music/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                b64_json: Buffer.from(buf).toString("base64"),
                                format: "mp3"
                            }
                        ]
                    }
                };
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/music/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "Suno music generation timed out"
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: "Suno music generation timed out"
        };
    } catch (err) {
        if (log) log.error("MUSIC", `${provider} suno error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/music/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Music provider error"
        };
    }
}
async function handleUdioMusicGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const cookie = credentials?.apiKey || credentials?.providerSpecificData?.cookie || "";
    if (!cookie) {
        return {
            success: false,
            status: 401,
            error: "Udio session cookie is required"
        };
    }
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (log) {
        log.info("MUSIC", `${provider}/${model} (udio) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie
            },
            body: JSON.stringify({
                prompt,
                samplerOptions: {
                    seed: -1
                }
            })
        });
        if (!res.ok) {
            const errorText = await res.text();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/music/generations",
                status: res.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: res.status,
                error: errorText
            };
        }
        const data = await res.json();
        const trackIds = data.track_ids || [];
        if (trackIds.length === 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/music/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "No tracks returned from Udio"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "No tracks returned from Udio"
            };
        }
        const deadline = Date.now() + 300000;
        while(Date.now() < deadline){
            await new Promise((r)=>setTimeout(r, 5000));
            const statusRes = await fetch(`https://www.udio.com/api/songs?songIds=${trackIds.join(",")}`, {
                headers: {
                    Cookie: cookie
                }
            });
            const songs = await statusRes.json();
            const ready = songs.filter((s)=>s.finished && s.song_path);
            if (ready.length > 0) {
                const audioRes = await fetch(ready[0].song_path);
                if (!audioRes.ok) {
                    return {
                        success: false,
                        status: audioRes.status,
                        error: `Failed to download audio: ${audioRes.status}`
                    };
                }
                const buf = await audioRes.arrayBuffer();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/music/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                b64_json: Buffer.from(buf).toString("base64"),
                                format: "mp3"
                            }
                        ]
                    }
                };
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/music/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "Udio music generation timed out"
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: "Udio music generation timed out"
        };
    } catch (err) {
        if (log) log.error("MUSIC", `${provider} udio error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/music/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Music provider error"
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_handlers_1mbm823._.js.map