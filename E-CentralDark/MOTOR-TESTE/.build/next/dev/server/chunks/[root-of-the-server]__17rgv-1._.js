module.exports = [
"[project]/src/lib/usage/callLogsBoundedQueries.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectReferencedArtifacts",
    ()=>collectReferencedArtifacts,
    "selectCallLogIdsBefore",
    ()=>selectCallLogIdsBefore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
// #5618 — node:sqlite's StatementSync.all() materializes the ENTIRE result set as
// JS objects at once. On a large storage.sqlite (~170 MB+) an unbounded
// `SELECT … FROM call_logs` over the whole table blows the V8 heap during the
// startup cleanup pass (`cleanupExpiredLogs` → `rotateCallLogs`), crashing the
// daemon before it binds. These helpers page through call_logs in bounded chunks
// so peak memory stays flat regardless of table size.
const CALL_LOG_QUERY_PAGE = 5000;
function collectReferencedArtifacts() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const referenced = new Set();
    const stmt = db.prepare("SELECT artifact_relpath FROM call_logs WHERE artifact_relpath IS NOT NULL LIMIT ? OFFSET ?");
    for(let offset = 0;; offset += CALL_LOG_QUERY_PAGE){
        const rows = stmt.all(CALL_LOG_QUERY_PAGE, offset);
        for (const row of rows){
            if (typeof row.artifact_relpath === "string") referenced.add(row.artifact_relpath);
        }
        if (rows.length < CALL_LOG_QUERY_PAGE) break;
    }
    return referenced;
}
function selectCallLogIdsBefore(cutoff, limit = CALL_LOG_QUERY_PAGE) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT id FROM call_logs WHERE timestamp < ? ORDER BY timestamp ASC LIMIT ?").all(cutoff, limit);
    return rows.map((row)=>String(row.id));
}
}),
"[project]/open-sse/translator/formats.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/utils/streamPayloadCollector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildStreamSummaryFromEvents",
    ()=>buildStreamSummaryFromEvents,
    "compactStructuredStreamPayload",
    ()=>compactStructuredStreamPayload,
    "createStructuredSSECollector",
    ()=>createStructuredSSECollector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [app-route] (ecmascript)");
;
;
function getEventName(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;
    if (typeof payload.event === "string") {
        return payload.event;
    }
    if (typeof payload.type === "string") {
        return payload.type;
    }
    if (payload.done === true) {
        return "[DONE]";
    }
    return undefined;
}
function asRecord(value) {
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
function normalizeFormat(format) {
    if (!format) return "";
    if (format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSE) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
    return format;
}
function inferFormatFromEvents(events, fallbackFormat) {
    const normalizedFallback = normalizeFormat(fallbackFormat);
    if (normalizedFallback) return normalizedFallback;
    for (const evt of events){
        const payload = asRecord(evt.data);
        const eventType = toString(payload.type || evt.event);
        if (eventType.startsWith("response.") || payload.object === "response") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
        }
        if (eventType === "message_start" || eventType === "content_block_start" || eventType === "content_block_delta" || eventType === "message_delta" || eventType === "message_stop" || eventType === "ping") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE;
        }
        if (Array.isArray(payload.candidates) || payload.usageMetadata) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI;
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI;
}
function mergeUsage(target, incoming) {
    const usage = asRecord(incoming);
    for (const [key, value] of Object.entries(usage)){
        if (typeof value === "number" && Number.isFinite(value)) {
            if (target[key] === undefined || value > 0) {
                target[key] = value;
            }
        } else if (value && typeof value === "object" && !Array.isArray(value)) {
            target[key] = {
                ...asRecord(target[key]),
                ...asRecord(value)
            };
        } else if (typeof value === "string" && value.trim().length > 0) {
            target[key] = value;
        }
    }
}
function tryParseJson(raw) {
    try {
        return JSON.parse(raw);
    } catch  {
        return raw;
    }
}
function buildOpenAISummary(events, fallbackModel) {
    const payloads = events.map((evt)=>asRecord(evt.data)).filter((payload)=>Object.keys(payload).length);
    if (payloads.length === 0) return null;
    const first = payloads[0];
    const contentParts = [];
    const reasoningParts = [];
    const toolCalls = new Map();
    // Aliases every `idx:N` key we've seen to the `id:X` it was first observed with (and
    // vice versa), so a later delta chunk that only carries one of the two dimensions
    // (e.g. a continuation chunk with `id` but no `index` — a known quirk of some
    // OpenAI-compatible proxies) still resolves to the SAME accumulator entry instead of
    // splitting one logical tool call into two (#6276).
    const keyAliases = new Map();
    let unknownToolCallSeq = 0;
    let finishReason = "stop";
    let usage = null;
    const getToolCallKey = (toolCall)=>{
        const idKey = typeof toolCall.id === "string" && toolCall.id ? `id:${toolCall.id}` : null;
        const idxKey = Number.isInteger(toolCall.index) ? `idx:${toolCall.index}` : null;
        const resolvedKey = idKey && keyAliases.get(idKey) || idxKey && keyAliases.get(idxKey);
        const key = resolvedKey || idKey || idxKey;
        if (key) {
            if (idKey) keyAliases.set(idKey, key);
            if (idxKey) keyAliases.set(idxKey, key);
            return key;
        }
        unknownToolCallSeq += 1;
        return `seq:${unknownToolCallSeq}`;
    };
    for (const chunk of payloads){
        const choice = asRecord(Array.isArray(chunk.choices) ? chunk.choices[0] : null);
        const delta = asRecord(choice.delta);
        if (typeof delta.content === "string" && delta.content.length > 0) {
            contentParts.push(delta.content);
        }
        if (Array.isArray(delta.content)) {
            for (const part of delta.content){
                const partObj = asRecord(part);
                if (typeof partObj.text === "string" && partObj.text.length > 0) {
                    contentParts.push(partObj.text);
                }
            }
        }
        if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
            reasoningParts.push(delta.reasoning_content);
        }
        // Normalize `reasoning` alias (NVIDIA kimi-k2.5 etc.)
        if (typeof delta.reasoning === "string" && delta.reasoning.length > 0 && !delta.reasoning_content) {
            reasoningParts.push(delta.reasoning);
        }
        if (Array.isArray(delta.tool_calls)) {
            for (const item of delta.tool_calls){
                const toolCall = asRecord(item);
                const key = getToolCallKey(toolCall);
                const existing = toolCalls.get(key);
                const deltaArgs = typeof asRecord(toolCall.function).arguments === "string" ? String(asRecord(toolCall.function).arguments) : "";
                if (!existing) {
                    toolCalls.set(key, {
                        id: typeof toolCall.id === "string" ? toolCall.id : null,
                        index: Number.isInteger(toolCall.index) ? Number(toolCall.index) : toolCalls.size,
                        type: toString(toolCall.type, "function"),
                        function: {
                            name: toString(asRecord(toolCall.function).name, "unknown"),
                            arguments: deltaArgs
                        }
                    });
                    continue;
                }
                existing.id = existing.id || (typeof toolCall.id === "string" ? toolCall.id : null);
                if ((!Number.isInteger(existing.index) || existing.index < 0) && Number.isInteger(toolCall.index)) {
                    existing.index = Number(toolCall.index);
                }
                if (typeof asRecord(toolCall.function).name === "string" && !existing.function.name) {
                    existing.function.name = String(asRecord(toolCall.function).name);
                }
                existing.function.arguments += deltaArgs;
            }
        }
        if (typeof choice.finish_reason === "string" && choice.finish_reason.length > 0) {
            finishReason = choice.finish_reason;
        }
        if (chunk.usage && typeof chunk.usage === "object") {
            usage = {
                ...asRecord(chunk.usage)
            };
        }
    }
    const joinedContent = contentParts.length > 0 ? contentParts.join("").trim() : null;
    const joinedReasoning = reasoningParts.length > 0 ? reasoningParts.join("").trim() : null;
    const message = {
        role: "assistant",
        content: joinedContent || null
    };
    if (joinedReasoning) {
        message.reasoning_content = joinedReasoning;
    }
    const finalToolCalls = [
        ...toolCalls.values()
    ].sort((a, b)=>a.index - b.index);
    if (finalToolCalls.length > 0) {
        finishReason = "tool_calls";
        message.tool_calls = finalToolCalls;
    }
    const result = {
        id: toString(first.id, `chatcmpl-${Date.now()}`),
        object: "chat.completion",
        created: toNumber(first.created, Math.floor(Date.now() / 1000)),
        model: toString(first.model, fallbackModel || "unknown"),
        choices: [
            {
                index: 0,
                message,
                finish_reason: finishReason
            }
        ]
    };
    if (usage && Object.keys(usage).length > 0) {
        result.usage = usage;
    }
    return result;
}
function buildResponsesSummary(events, fallbackModel) {
    const payloads = events.map((evt)=>asRecord(evt.data)).filter((payload)=>Object.keys(payload).length);
    if (payloads.length === 0) return null;
    let completed = null;
    let latestResponse = null;
    let usage = null;
    const textParts = [];
    const buildOutputFromText = ()=>textParts.length > 0 ? [
            {
                type: "message",
                role: "assistant",
                content: [
                    {
                        type: "output_text",
                        text: textParts.join("")
                    }
                ]
            }
        ] : [];
    for (const payload of payloads){
        const eventType = toString(payload.type);
        if (eventType === "response.completed" && payload.response && typeof payload.response === "object") {
            completed = asRecord(payload.response);
        }
        if (payload.response && typeof payload.response === "object") {
            latestResponse = asRecord(payload.response);
        } else if (payload.object === "response") {
            latestResponse = payload;
        }
        if (eventType === "response.output_text.delta" && typeof payload.delta === "string" && payload.delta.length > 0) {
            textParts.push(payload.delta);
        }
        if (payload.usage && typeof payload.usage === "object") {
            usage = {
                ...asRecord(payload.usage)
            };
        } else if (payload.response && typeof asRecord(payload.response).usage === "object") {
            usage = {
                ...asRecord(asRecord(payload.response).usage)
            };
        }
    }
    const picked = completed || latestResponse;
    if (picked && Object.keys(picked).length > 0) {
        const pickedOutput = Array.isArray(picked.output) ? picked.output : [];
        return {
            id: toString(picked.id, `resp_${Date.now()}`),
            object: "response",
            model: toString(picked.model, fallbackModel || "unknown"),
            output: pickedOutput.length > 0 ? pickedOutput : buildOutputFromText(),
            usage: picked.usage ?? usage ?? null,
            status: toString(picked.status, completed ? "completed" : "in_progress"),
            created_at: toNumber(picked.created_at, Math.floor(Date.now() / 1000)),
            metadata: asRecord(picked.metadata)
        };
    }
    return {
        id: `resp_${Date.now()}`,
        object: "response",
        model: fallbackModel || "unknown",
        output: buildOutputFromText(),
        usage: usage ?? null,
        status: "completed",
        created_at: Math.floor(Date.now() / 1000),
        metadata: {}
    };
}
function buildClaudeSummary(events, fallbackModel) {
    const payloads = events.map((evt)=>asRecord(evt.data)).filter((payload)=>Object.keys(payload).length);
    if (payloads.length === 0) return null;
    const blocks = new Map();
    const usage = {};
    let messageId = "";
    let model = fallbackModel || "claude";
    let role = "assistant";
    let stopReason = "end_turn";
    let stopSequence = null;
    // Context Editing (`anthropic-beta: context-management-2025-06-27`) surfaces
    // `context_management.applied_edits[]` on the final `message_delta` snapshot. Preserve it
    // so streaming context-clear savings reach `extractContextEditingTelemetry`, mirroring the
    // non-streaming JSON path. Last-writer-wins: the final snapshot is authoritative.
    let contextManagement = null;
    for (const payload of payloads){
        const eventType = toString(payload.type);
        if (payload.context_management && typeof payload.context_management === "object" && !Array.isArray(payload.context_management)) {
            contextManagement = asRecord(payload.context_management);
        }
        if (eventType === "message_start") {
            const message = asRecord(payload.message);
            messageId = toString(message.id, messageId || `msg_${Date.now()}`);
            model = toString(message.model, model);
            role = toString(message.role, role);
            mergeUsage(usage, message.usage);
            continue;
        }
        if (eventType === "content_block_start") {
            const index = toNumber(payload.index, blocks.size);
            const contentBlock = asRecord(payload.content_block);
            const blockType = toString(contentBlock.type);
            if (blockType === "thinking") {
                blocks.set(index, {
                    type: "thinking",
                    index,
                    thinking: toString(contentBlock.thinking),
                    signature: typeof contentBlock.signature === "string" ? contentBlock.signature : undefined
                });
            } else if (blockType === "tool_use") {
                blocks.set(index, {
                    type: "tool_use",
                    index,
                    id: toString(contentBlock.id, `toolu_${Date.now()}_${index}`),
                    name: toString(contentBlock.name),
                    input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(contentBlock.input ?? {}),
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
            const index = toNumber(payload.index, 0);
            const delta = asRecord(payload.delta);
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
            if (deltaType === "thinking_delta" || typeof delta.thinking === "string") {
                const thinking = existing && existing.type === "thinking" ? existing : {
                    type: "thinking",
                    index,
                    thinking: "",
                    signature: undefined
                };
                thinking.thinking += toString(delta.thinking);
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
            const delta = asRecord(payload.delta);
            stopReason = toString(delta.stop_reason, stopReason);
            stopSequence = typeof delta.stop_sequence === "string" ? String(delta.stop_sequence) : stopSequence;
            mergeUsage(usage, payload.usage);
            continue;
        }
        mergeUsage(usage, payload.usage);
    }
    const content = [
        ...blocks.values()
    ].sort((a, b)=>a.index - b.index).flatMap((block)=>{
        if (block.type === "text") {
            return block.text ? [
                {
                    type: "text",
                    text: block.text
                }
            ] : [];
        }
        if (block.type === "thinking") {
            return block.thinking ? [
                {
                    type: "thinking",
                    thinking: block.thinking,
                    ...block.signature ? {
                        signature: block.signature
                    } : {}
                }
            ] : [];
        }
        const parsedInput = block.inputJson.trim().length > 0 ? tryParseJson(block.inputJson) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(block.input);
        return [
            {
                type: "tool_use",
                id: block.id,
                name: block.name,
                input: parsedInput
            }
        ];
    });
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
        } : {},
        ...contextManagement ? {
            context_management: contextManagement
        } : {}
    };
}
function buildGeminiSummary(events, fallbackModel) {
    const payloads = events.map((evt)=>asRecord(evt.data)).filter((payload)=>Object.keys(payload).length);
    if (payloads.length === 0) return null;
    const parts = [];
    const usageMetadata = {};
    let modelVersion = fallbackModel || "gemini";
    let finishReason = "STOP";
    let role = "model";
    const appendPart = (part)=>{
        const last = parts[parts.length - 1];
        if (last && typeof last.text === "string" && typeof part.text === "string" && Boolean(last.thought) === Boolean(part.thought)) {
            last.text += part.text;
            return;
        }
        parts.push(part);
    };
    for (const payload of payloads){
        if (typeof payload.modelVersion === "string" && payload.modelVersion.length > 0) {
            modelVersion = payload.modelVersion;
        }
        mergeUsage(usageMetadata, payload.usageMetadata);
        const candidate = asRecord(Array.isArray(payload.candidates) ? payload.candidates[0] : null);
        if (typeof candidate.finishReason === "string" && candidate.finishReason.length > 0) {
            finishReason = candidate.finishReason;
        }
        const content = asRecord(candidate.content);
        if (typeof content.role === "string" && content.role.length > 0) {
            role = content.role;
        }
        if (!Array.isArray(content.parts)) continue;
        for (const item of content.parts){
            const part = asRecord(item);
            if (part.functionCall && typeof part.functionCall === "object") {
                parts.push({
                    functionCall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(part.functionCall)
                });
            } else if (typeof part.text === "string" && part.text.length > 0) {
                appendPart({
                    text: part.text,
                    ...part.thought === true ? {
                        thought: true
                    } : {}
                });
            }
        }
    }
    return {
        candidates: [
            {
                index: 0,
                content: {
                    role,
                    parts
                },
                finishReason
            }
        ],
        ...Object.keys(usageMetadata).length > 0 ? {
            usageMetadata
        } : {},
        modelVersion
    };
}
function buildStreamSummaryFromEvents(events, fallbackFormat, fallbackModel) {
    const format = inferFormatFromEvents(events, fallbackFormat);
    switch(format){
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES:
            return buildResponsesSummary(events, fallbackModel);
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE:
            return buildClaudeSummary(events, fallbackModel);
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI:
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY:
            return buildGeminiSummary(events, fallbackModel);
        default:
            return buildOpenAISummary(events, fallbackModel);
    }
}
function compactStructuredStreamPayload(payload) {
    const record = asRecord(payload);
    if (record._streamed !== true || !("summary" in record)) {
        return payload;
    }
    const streamMeta = {
        format: toString(record._format, "sse-json"),
        stage: toString(record._stage, "response"),
        eventCount: toNumber(record._eventCount, 0)
    };
    if (record._truncated === true) {
        streamMeta.truncated = true;
    }
    if (typeof record._droppedEvents === "number" && record._droppedEvents > 0) {
        streamMeta.droppedEvents = record._droppedEvents;
    }
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(record.summary);
    if (summary && typeof summary === "object" && !Array.isArray(summary)) {
        return {
            ...summary,
            _omniroute_stream: streamMeta
        };
    }
    return {
        summary,
        _omniroute_stream: streamMeta
    };
}
function createStructuredSSECollector(options = {}) {
    const { maxEvents = 200, maxBytes = 49152, stage } = options;
    const events = [];
    let usedBytes = 0;
    let droppedEvents = 0;
    return {
        push (payload, explicitEvent) {
            if (payload === null || payload === undefined) return;
            const event = {
                index: events.length + droppedEvents,
                timestamp: new Date().toISOString(),
                data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(payload)
            };
            const eventName = explicitEvent || getEventName(payload);
            if (eventName) {
                event.event = eventName;
            }
            const serializedSize = JSON.stringify(event).length;
            if (events.length >= maxEvents || usedBytes + serializedSize > maxBytes) {
                droppedEvents += 1;
                return;
            }
            usedBytes += serializedSize;
            events.push(event);
        },
        getEvents () {
            return events.map((event)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(event));
        },
        build (summary, buildOptions = {}) {
            const { includeEvents = true } = buildOptions;
            return {
                _streamed: true,
                _format: "sse-json",
                ...stage ? {
                    _stage: stage
                } : {},
                _eventCount: events.length + droppedEvents,
                ...droppedEvents > 0 ? {
                    _truncated: true,
                    _droppedEvents: droppedEvents
                } : {},
                ...includeEvents ? {
                    events
                } : {},
                ...summary === undefined ? {} : {
                    summary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloneLogPayload"])(summary)
                }
            };
        }
    };
}
}),
"[project]/src/lib/db/detailedLogs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getRequestDetailLogByCallLogId",
    ()=>getRequestDetailLogByCallLogId,
    "getRequestDetailLogById",
    ()=>getRequestDetailLogById,
    "getRequestDetailLogCount",
    ()=>getRequestDetailLogCount,
    "getRequestDetailLogs",
    ()=>getRequestDetailLogs,
    "isDetailedLoggingEnabled",
    ()=>isDetailedLoggingEnabled,
    "resetRequestDetailLogsTableExistsCache",
    ()=>resetRequestDetailLogsTableExistsCache,
    "saveRequestDetailLog",
    ()=>saveRequestDetailLog
]);
/**
 * Detailed Request Logs DB Layer (#378)
 *
 * Legacy compatibility layer for detailed request logs.
 * New requests now store pipeline details inside unified call log artifacts.
 * This module remains available for reading historical request_detail_logs rows.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-route] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamPayloadCollector.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
let requestDetailLogsTableExistsCache;
function requestDetailLogsTableExists() {
    if (requestDetailLogsTableExistsCache !== undefined) {
        return requestDetailLogsTableExistsCache;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'request_detail_logs'").get();
    requestDetailLogsTableExistsCache = Boolean(row?.name);
    return requestDetailLogsTableExistsCache;
}
function resetRequestDetailLogsTableExistsCache() {
    requestDetailLogsTableExistsCache = undefined;
}
async function isDetailedLoggingEnabled() {
    const envOverride = process.env.ENABLE_REQUEST_LOGS;
    if (envOverride !== undefined) {
        return envOverride.trim().toLowerCase() === "true";
    }
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const val = settings.call_log_pipeline_enabled;
        return val === true || val === "1" || val === "true";
    } catch  {
        return false;
    }
}
function saveRequestDetailLog(entry) {
    const noLogEnabled = Boolean(entry.no_log) || (entry.api_key_id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoLog"])(entry.api_key_id) : false);
    if (noLogEnabled || !requestDetailLogsTableExists()) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = entry.id ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const compactProviderResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compactStructuredStreamPayload"])(entry.provider_response);
    const compactClientResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compactStructuredStreamPayload"])(entry.client_response);
    db.prepare(`
    INSERT INTO request_detail_logs
      (id, call_log_id, timestamp, client_request, translated_request,
       provider_response, client_response, provider, model, source_format, target_format, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, entry.call_log_id ?? null, timestamp, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.client_request)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.translated_request)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compactProviderResponse)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compactClientResponse)), entry.provider ?? null, entry.model ?? null, entry.source_format ?? null, entry.target_format ?? null, entry.duration_ms ?? 0);
}
function getRequestDetailLogs(limit = 50, offset = 0) {
    if (!requestDetailLogsTableExists()) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`
      SELECT * FROM request_detail_logs
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return rows.map(mapDetailedLogRow);
}
function getRequestDetailLogById(id) {
    if (!requestDetailLogsTableExists()) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM request_detail_logs WHERE id = ?").get(id);
    return row ? mapDetailedLogRow(row) : null;
}
function getRequestDetailLogByCallLogId(callLogId) {
    if (!requestDetailLogsTableExists()) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`
      SELECT * FROM request_detail_logs
      WHERE call_log_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).get(callLogId);
    return row ? mapDetailedLogRow(row) : null;
}
function getRequestDetailLogCount() {
    if (!requestDetailLogsTableExists()) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT COUNT(*) as cnt FROM request_detail_logs").get();
    return row?.cnt ?? 0;
}
function mapDetailedLogRow(row) {
    return {
        id: typeof row.id === "string" ? row.id : undefined,
        call_log_id: typeof row.call_log_id === "string" ? row.call_log_id : null,
        timestamp: typeof row.timestamp === "string" ? row.timestamp : undefined,
        client_request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.client_request),
        translated_request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.translated_request),
        provider_response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.provider_response),
        client_response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.client_response),
        provider: typeof row.provider === "string" ? row.provider : null,
        model: typeof row.model === "string" ? row.model : null,
        source_format: typeof row.source_format === "string" ? row.source_format : null,
        target_format: typeof row.target_format === "string" ? row.target_format : null,
        duration_ms: typeof row.duration_ms === "number" ? row.duration_ms : 0
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/src/lib/usage/migrations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CALL_LOGS_DIR",
    ()=>CALL_LOGS_DIR,
    "LOG_ARCHIVES_DIR",
    ()=>LOG_ARCHIVES_DIR,
    "archiveLegacyRequestLogs",
    ()=>archiveLegacyRequestLogs,
    "migrateLegacyUsageFiles",
    ()=>migrateLegacyUsageFiles,
    "migrateUsageJsonToSqlite",
    ()=>migrateUsageJsonToSqlite,
    "shouldPersistToDisk",
    ()=>shouldPersistToDisk
]);
// @ts-nocheck
/**
 * Usage Migrations — extracted from usageDb.js (T-15)
 *
 * Handles legacy file migration (.data → data/), JSON → SQLite migration,
 * and one-time archival of legacy request log layouts into a zip backup.
 *
 * @module lib/usage/migrations
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yazl$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/yazl/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [app-route] (ecmascript)");
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
const shouldPersistToDisk = !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"];
const LEGACY_DATA_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLegacyDotDataDir"])();
const CALL_LOGS_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "call_logs");
const LOG_ARCHIVES_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "log_archives");
const LEGACY_LAYOUT_MARKER = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LOG_ARCHIVES_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOG_ARCHIVES_DIR, "legacy-request-logs.json");
const CURRENT_REQUEST_LOGS_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "logs");
const CURRENT_REQUEST_SUMMARY_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "log.txt");
// Legacy paths
const LEGACY_DB_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LEGACY_DATA_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LEGACY_DATA_DIR, "usage.json");
const LEGACY_CALL_LOGS_DB_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LEGACY_DATA_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LEGACY_DATA_DIR, "call_logs.json");
// Current-location JSON files (for migration into SQLite)
const USAGE_JSON_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "usage.json");
const CALL_LOGS_JSON_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "call_logs.json");
function buildLegacyRequestSummary(requestType, requestBody) {
    if (requestType !== "search" || !requestBody || typeof requestBody !== "object") return null;
    const record = requestBody;
    const summary = {};
    if (typeof record.query === "string" && record.query.trim().length > 0) {
        summary.query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizePII"])(record.query).text;
    }
    const filters = Object.fromEntries(Object.entries(record).filter(([key])=>key !== "query" && key !== "provider"));
    if (Object.keys(filters).length > 0) {
        summary.filters = filters;
    }
    return Object.keys(summary).length > 0 ? JSON.stringify(summary) : null;
}
function copyIfMissing(fromPath, toPath, label) {
    if (!fromPath || !toPath) return;
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(fromPath) || __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(toPath)) return;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(fromPath).isDirectory()) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].cpSync(fromPath, toPath, {
            recursive: true
        });
    } else {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].copyFileSync(fromPath, toPath);
    }
    console.log(`[usageDb] Migrated ${label}: ${fromPath} -> ${toPath}`);
}
function containsLegacyCallLogLayout(dirPath) {
    if (!dirPath || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dirPath)) return false;
    try {
        const topLevelEntries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(dirPath);
        for (const topLevelEntry of topLevelEntries){
            const topLevelPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dirPath, topLevelEntry);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(topLevelPath);
            if (stat.isFile() && /^\d{6}_.+_\d{3}\.json$/i.test(topLevelEntry)) {
                return true;
            }
            if (!stat.isDirectory()) {
                continue;
            }
            const nestedEntries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(topLevelPath);
            for (const nestedEntry of nestedEntries){
                if (/^\d{6}_.+_\d{3}\.json$/i.test(nestedEntry)) {
                    return true;
                }
            }
        }
    } catch  {
        return false;
    }
    return false;
}
function ensureArchiveDir() {
    if (!LOG_ARCHIVES_DIR) return;
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(LOG_ARCHIVES_DIR, {
        recursive: true
    });
}
/**
 * Directory the live file logger writes to (`buildLogger()` in
 * `src/shared/utils/logger.ts`), so the legacy-log sweep below never zips-then-deletes
 * a directory it does not own. Since PR #6234 (fix for #6197) the default app log path
 * moved from a `process.cwd()`-anchored location to `DATA_DIR/logs/application/app.log`,
 * landing it inside the same `DATA_DIR/logs` tree this "legacy" migration sweeps (#6799).
 */ function getLiveAppLogDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogFilePath"])());
    } catch  {
        return null;
    }
}
function listRequestLogArchiveEntries() {
    if (!CURRENT_REQUEST_LOGS_DIR || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CURRENT_REQUEST_LOGS_DIR)) return [];
    const liveAppLogDir = getLiveAppLogDir();
    const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(CURRENT_REQUEST_LOGS_DIR);
    const targets = [];
    for (const entry of entries){
        const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(CURRENT_REQUEST_LOGS_DIR, entry);
        if (liveAppLogDir && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSamePath"])(entryPath, liveAppLogDir)) continue;
        targets.push({
            sourcePath: entryPath,
            archiveRoot: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].posix.join("data/logs", entry),
            deleteAfterArchive: true
        });
    }
    return targets;
}
function listArchiveTargets() {
    const targets = listRequestLogArchiveEntries();
    if (CURRENT_REQUEST_SUMMARY_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CURRENT_REQUEST_SUMMARY_FILE)) {
        targets.push({
            sourcePath: CURRENT_REQUEST_SUMMARY_FILE,
            archiveRoot: "data/log.txt",
            deleteAfterArchive: true
        });
    }
    if (CALL_LOGS_DIR && containsLegacyCallLogLayout(CALL_LOGS_DIR)) {
        targets.push({
            sourcePath: CALL_LOGS_DIR,
            archiveRoot: "data/call_logs",
            deleteAfterArchive: true
        });
    }
    return targets;
}
function addPathToZip(zipFile, sourcePath, archivePath) {
    const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(sourcePath);
    if (stat.isDirectory()) {
        const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(sourcePath);
        if (entries.length === 0) {
            zipFile.addEmptyDirectory(archivePath);
            return;
        }
        for (const entry of entries){
            addPathToZip(zipFile, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(sourcePath, entry), __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].posix.join(archivePath, entry));
        }
        return;
    }
    zipFile.addFile(sourcePath, archivePath);
}
function createLegacyArchive(targets) {
    return new Promise((resolve, reject)=>{
        if (!LOG_ARCHIVES_DIR) {
            reject(new Error("LOG_ARCHIVES_DIR is not configured"));
            return;
        }
        ensureArchiveDir();
        const timestamp = new Date().toISOString().replace(/[:]/g, "-");
        const archiveFilename = `${timestamp}_legacy-request-logs.zip`;
        const archivePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOG_ARCHIVES_DIR, archiveFilename);
        const zipFile = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yazl$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZipFile"]();
        const output = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].createWriteStream(archivePath);
        let settled = false;
        // yazl detects a stat->stream size mismatch (a file growing while being zipped, e.g.
        // an actively-written log — #6401) by emitting "error" on the ZipFile instance itself,
        // not on `output`. Left unwired, that "error" event has no listener and Node re-throws
        // it as an uncaughtException that crashes the process. Wiring it here converts that
        // crash into a normal rejection the caller's try/catch already handles.
        const fail = (error)=>{
            if (settled) return;
            settled = true;
            output.destroy();
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(archivePath, {
                force: true
            });
            reject(error);
        };
        output.on("close", ()=>{
            if (settled) return;
            settled = true;
            resolve(archiveFilename);
        });
        output.on("error", fail);
        zipFile.on("error", fail);
        zipFile.outputStream.pipe(output);
        try {
            for (const target of targets){
                addPathToZip(zipFile, target.sourcePath, target.archiveRoot);
            }
            zipFile.end();
        } catch (error) {
            fail(error);
        }
    });
}
function writeLegacyLayoutMarker(archiveFilename) {
    if (!LEGACY_LAYOUT_MARKER) return;
    ensureArchiveDir();
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(LEGACY_LAYOUT_MARKER, JSON.stringify({
        migratedAt: new Date().toISOString(),
        archiveFilename
    }, null, 2));
}
function deleteArchivedTargets(targets) {
    for (const target of targets){
        if (!target.deleteAfterArchive || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(target.sourcePath)) {
            continue;
        }
        const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(target.sourcePath);
        if (stat.isDirectory()) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(target.sourcePath, {
                recursive: true,
                force: true
            });
        } else {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(target.sourcePath, {
                force: true
            });
        }
    }
}
function migrateLegacyUsageFiles() {
    if (!shouldPersistToDisk || !LEGACY_DATA_DIR) return;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSamePath"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], LEGACY_DATA_DIR)) return;
    try {
        copyIfMissing(LEGACY_DB_FILE, USAGE_JSON_FILE, "usage history");
        copyIfMissing(LEGACY_CALL_LOGS_DB_FILE, CALL_LOGS_JSON_FILE, "call log index");
    } catch (error) {
        console.error("[usageDb] Legacy migration failed:", error.message);
    }
}
async function archiveLegacyRequestLogs() {
    if (!shouldPersistToDisk) return null;
    if (LEGACY_LAYOUT_MARKER && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(LEGACY_LAYOUT_MARKER)) return null;
    const targets = listArchiveTargets();
    if (targets.length === 0) return null;
    const archiveFilename = await createLegacyArchive(targets);
    deleteArchivedTargets(targets);
    writeLegacyLayoutMarker(archiveFilename);
    console.log(`[usageDb] Archived legacy request logs to ${archiveFilename}`);
    return archiveFilename;
}
function migrateUsageJsonToSqlite() {
    if (!shouldPersistToDisk) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (USAGE_JSON_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(USAGE_JSON_FILE)) {
        try {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(USAGE_JSON_FILE, "utf-8");
            const data = JSON.parse(raw);
            const history = data.history || [];
            if (history.length > 0) {
                console.log(`[usageDb] Migrating ${history.length} usage entries from JSON → SQLite...`);
                const insert = db.prepare(`
          INSERT INTO usage_history (provider, model, connection_id, account_key, account_label,
            account_label_priority, api_key_id, api_key_name, tokens_input, tokens_output,
            tokens_cache_read, tokens_cache_creation, tokens_reasoning, status, success, latency_ms,
            ttft_ms, error_code, combo_strategy, timestamp)
          VALUES (@provider, @model, @connectionId, @accountKey, @accountLabel,
            @accountLabelPriority, @apiKeyId, @apiKeyName, @tokensInput, @tokensOutput,
            @tokensCacheRead, @tokensCacheCreation, @tokensReasoning, @status, @success,
            @latencyMs, @ttftMs, @errorCode, @comboStrategy, @timestamp)
        `);
                const findConnection = db.prepare("SELECT * FROM provider_connections WHERE id = ?");
                const tx = db.transaction(()=>{
                    for (const entry of history){
                        const connectionId = entry.connectionId || entry.connection_id || null;
                        const connection = connectionId ? findConnection.get(connectionId) : null;
                        const fallbackIdentity = connection ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(connection) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveOrphanedUsageAccountIdentity"])(entry.provider, connectionId);
                        const identity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveImportedUsageAccountIdentity"])(entry, fallbackIdentity);
                        insert.run({
                            provider: entry.provider || null,
                            model: entry.model || null,
                            connectionId,
                            accountKey: identity.accountKey,
                            accountLabel: identity.accountLabel,
                            accountLabelPriority: identity.accountLabelPriority,
                            apiKeyId: entry.apiKeyId || null,
                            apiKeyName: entry.apiKeyName || null,
                            tokensInput: entry.tokens?.input ?? entry.tokens?.prompt_tokens ?? entry.tokens?.in ?? 0,
                            tokensOutput: entry.tokens?.output ?? entry.tokens?.completion_tokens ?? entry.tokens?.out ?? 0,
                            tokensCacheRead: entry.tokens?.cacheRead ?? entry.tokens?.cached_tokens ?? 0,
                            tokensCacheCreation: entry.tokens?.cacheCreation ?? entry.tokens?.cache_creation_input_tokens ?? 0,
                            tokensReasoning: entry.tokens?.reasoning ?? entry.tokens?.reasoning_tokens ?? 0,
                            status: entry.status || null,
                            success: entry.success === false ? 0 : 1,
                            latencyMs: Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0,
                            ttftMs: Number.isFinite(Number(entry.timeToFirstTokenMs)) ? Number(entry.timeToFirstTokenMs) : Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0,
                            errorCode: entry.errorCode || null,
                            comboStrategy: entry.comboStrategy || entry.combo_strategy || "direct",
                            timestamp: entry.timestamp || new Date().toISOString()
                        });
                    }
                });
                tx();
                console.log(`[usageDb] ✓ Migrated ${history.length} usage entries`);
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(USAGE_JSON_FILE, `${USAGE_JSON_FILE}.migrated`);
        } catch (error) {
            console.error("[usageDb] Failed to migrate usage.json:", error.message);
        }
    }
    if (CALL_LOGS_JSON_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CALL_LOGS_JSON_FILE)) {
        try {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(CALL_LOGS_JSON_FILE, "utf-8");
            const data = JSON.parse(raw);
            const logs = data.logs || [];
            if (logs.length > 0) {
                console.log(`[usageDb] Migrating ${logs.length} call log entries from JSON → SQLite...`);
                const insert = db.prepare(`
          INSERT OR IGNORE INTO call_logs (id, timestamp, method, path, status, model, requested_model, provider,
            account, connection_id, duration, tokens_in, tokens_out, source_format, target_format,
            api_key_id, api_key_name, combo_name, combo_step_id, combo_execution_key, error_summary,
            detail_state, artifact_relpath, artifact_size_bytes, artifact_sha256,
            has_request_body, has_response_body, has_pipeline_details, request_summary)
          VALUES (@id, @timestamp, @method, @path, @status, @model, @requestedModel, @provider,
            @account, @connectionId, @duration, @tokensIn, @tokensOut, @sourceFormat, @targetFormat,
            @apiKeyId, @apiKeyName, @comboName, @comboStepId, @comboExecutionKey, @errorSummary,
            @detailState, @artifactRelPath, @artifactSizeBytes, @artifactSha256,
            @hasRequestBody, @hasResponseBody, @hasPipelineDetails, @requestSummary)
        `);
                const tx = db.transaction(()=>{
                    for (const log of logs){
                        const id = log.id || `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                        const timestamp = log.timestamp || new Date().toISOString();
                        const protectedRequestBody = log.requestBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.requestBody) : null;
                        const protectedResponseBody = log.responseBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.responseBody) : null;
                        const protectedError = log.error && typeof log.error === "object" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.error) : log.error || null;
                        const detailExpected = protectedRequestBody !== null || protectedResponseBody !== null || protectedError !== null;
                        let detailState = "none";
                        let artifactRelPath = null;
                        let artifactSizeBytes = null;
                        let artifactSha256 = null;
                        if (detailExpected) {
                            const artifact = {
                                schemaVersion: 5,
                                summary: {
                                    id,
                                    timestamp,
                                    method: log.method || "POST",
                                    path: log.path || "/v1/chat/completions",
                                    status: log.status || 0,
                                    model: log.model || "-",
                                    requestedModel: log.requestedModel || null,
                                    provider: log.provider || "-",
                                    account: log.account || "-",
                                    connectionId: log.connectionId || null,
                                    duration: log.duration || 0,
                                    tokens: {
                                        in: log.tokens?.in ?? 0,
                                        out: log.tokens?.out ?? 0,
                                        cacheRead: null,
                                        cacheWrite: null,
                                        reasoning: null
                                    },
                                    requestType: log.requestType || null,
                                    sourceFormat: log.sourceFormat || null,
                                    targetFormat: log.targetFormat || null,
                                    apiKeyId: log.apiKeyId || null,
                                    apiKeyName: log.apiKeyName || null,
                                    comboName: log.comboName || null,
                                    comboStepId: log.comboStepId || null,
                                    comboExecutionKey: log.comboExecutionKey || null
                                },
                                requestBody: protectedRequestBody,
                                responseBody: protectedResponseBody,
                                error: protectedError
                            };
                            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact);
                            if (artifactResult) {
                                detailState = "ready";
                                artifactRelPath = artifactResult.relPath;
                                artifactSizeBytes = artifactResult.sizeBytes;
                                artifactSha256 = artifactResult.sha256;
                            } else {
                                detailState = "missing";
                            }
                        }
                        insert.run({
                            id,
                            timestamp,
                            method: log.method || "POST",
                            path: log.path || null,
                            status: log.status || 0,
                            model: log.model || null,
                            requestedModel: log.requestedModel || null,
                            provider: log.provider || null,
                            account: log.account || null,
                            connectionId: log.connectionId || null,
                            duration: log.duration || 0,
                            tokensIn: log.tokens?.in ?? 0,
                            tokensOut: log.tokens?.out ?? 0,
                            sourceFormat: log.sourceFormat || null,
                            targetFormat: log.targetFormat || null,
                            apiKeyId: log.apiKeyId || null,
                            apiKeyName: log.apiKeyName || null,
                            comboName: log.comboName || null,
                            comboStepId: log.comboStepId || null,
                            comboExecutionKey: log.comboExecutionKey || log.comboStepId || null,
                            errorSummary: typeof protectedError === "string" ? protectedError.slice(0, 4000) : protectedError ? JSON.stringify(protectedError).slice(0, 4000) : null,
                            detailState,
                            artifactRelPath,
                            artifactSizeBytes,
                            artifactSha256,
                            hasRequestBody: protectedRequestBody ? 1 : 0,
                            hasResponseBody: protectedResponseBody ? 1 : 0,
                            hasPipelineDetails: 0,
                            requestSummary: buildLegacyRequestSummary(log.requestType, protectedRequestBody)
                        });
                    }
                });
                tx();
                console.log(`[usageDb] ✓ Migrated ${logs.length} call log entries`);
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(CALL_LOGS_JSON_FILE, `${CALL_LOGS_JSON_FILE}.migrated`);
        } catch (error) {
            console.error("[usageDb] Failed to migrate call_logs.json:", error.message);
        }
    }
}
migrateLegacyUsageFiles();
if (shouldPersistToDisk) {
    try {
        await archiveLegacyRequestLogs();
    } catch (error) {
        console.error("[usageDb] Failed to archive legacy request logs:", error.message);
    }
    try {
        migrateUsageJsonToSqlite();
    } catch  {
    // Best-effort startup migration.
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/usage/callLogApiKeyContext.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCallLogApiKeyContext",
    ()=>getCallLogApiKeyContext,
    "runWithCallLogApiKeyContext",
    ()=>runWithCallLogApiKeyContext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
;
const callLogApiKeyContext = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function runWithCallLogApiKeyContext(context, callback) {
    return callLogApiKeyContext.run(context, callback);
}
function getCallLogApiKeyContext() {
    return callLogApiKeyContext.getStore() ?? null;
}
}),
"[project]/src/lib/usage/tokenAccounting.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatUsageLog",
    ()=>formatUsageLog,
    "getLoggedInputTokens",
    ()=>getLoggedInputTokens,
    "getLoggedOutputTokens",
    ()=>getLoggedOutputTokens,
    "getObservedReasoning",
    ()=>getObservedReasoning,
    "getPromptCacheCreationTokens",
    ()=>getPromptCacheCreationTokens,
    "getPromptCacheCreationTokensOrNull",
    ()=>getPromptCacheCreationTokensOrNull,
    "getPromptCacheReadTokens",
    ()=>getPromptCacheReadTokens,
    "getPromptCacheReadTokensOrNull",
    ()=>getPromptCacheReadTokensOrNull,
    "getReasoningTokens",
    ()=>getReasoningTokens,
    "getReasoningTokensOrNull",
    ()=>getReasoningTokensOrNull
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
function getPromptTokenDetails(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = asRecord(tokenRecord.prompt_tokens_details);
    if (Object.keys(promptDetails).length > 0) return promptDetails;
    return asRecord(tokenRecord.input_tokens_details);
}
function getPromptCacheReadTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    return toFiniteNumber(tokenRecord.cacheRead ?? tokenRecord.cache_read_input_tokens ?? tokenRecord.cached_tokens ?? promptDetails.cached_tokens);
}
function getPromptCacheCreationTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    return toFiniteNumber(tokenRecord.cacheCreation ?? tokenRecord.cache_creation_input_tokens ?? promptDetails.cache_creation_tokens);
}
function getLoggedInputTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    if (tokenRecord.input !== undefined && tokenRecord.input !== null) {
        return toFiniteNumber(tokenRecord.input);
    }
    // Prefer prompt_tokens when present: translators normalize provider-specific
    // usage into OpenAI shape there, and may keep input_tokens for compatibility.
    // Treating that input_tokens as raw Claude usage would add cache tokens again.
    if (tokenRecord.prompt_tokens !== undefined && tokenRecord.prompt_tokens !== null) {
        return toFiniteNumber(tokenRecord.prompt_tokens);
    }
    if (tokenRecord.input_tokens !== undefined && tokenRecord.input_tokens !== null) {
        // Anthropic / anthropic-compatible-cc streaming: input_tokens is only the
        // non-cached portion.  The cache counters sit as separate top-level fields
        // (cache_read_input_tokens, cache_creation_input_tokens).  We need to add
        // them to get the true total input.
        return toFiniteNumber(tokenRecord.input_tokens) + toFiniteNumber(tokenRecord.cache_read_input_tokens) + toFiniteNumber(tokenRecord.cache_creation_input_tokens);
    }
    return 0;
}
function getLoggedOutputTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    if (tokenRecord.output !== undefined && tokenRecord.output !== null) {
        return toFiniteNumber(tokenRecord.output);
    }
    return toFiniteNumber(tokenRecord.completion_tokens ?? tokenRecord.output_tokens);
}
function getReasoningTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const completionDetails = asRecord(tokenRecord.completion_tokens_details);
    return toFiniteNumber(tokenRecord.reasoning ?? tokenRecord.reasoning_tokens ?? completionDetails.reasoning_tokens);
}
// Non-greedy, single-capture, no nested variable-length quantifiers → ReDoS-safe.
const THINK_BLOCK_RE = /<think>([\s\S]*?)<\/think>/gi;
function getObservedReasoning(message) {
    const record = asRecord(message);
    // Explicit reasoning field: `reasoning_content` is the raw provider field;
    // `reasoning` is what sseTextTransform maps it to.
    const explicit = record.reasoning_content ?? record.reasoning;
    if (typeof explicit === "string" && explicit.trim().length > 0) {
        return {
            source: "content",
            chars: explicit.length
        };
    }
    // Inline <think>...</think> blocks embedded in message content.
    const content = record.content;
    if (typeof content === "string" && content.length > 0) {
        let chars = 0;
        for (const match of content.matchAll(THINK_BLOCK_RE)){
            chars += (match[1] ?? "").length;
        }
        if (chars > 0) return {
            source: "think",
            chars
        };
    }
    return {
        source: null,
        chars: 0
    };
}
// ─── Nullable variants ──────────────────────────────────────────────────
// Return `null` when the provider simply doesn't report the field,
// vs `0` when the provider explicitly reported zero.
function hasAnyKey(record, keys) {
    return keys.some((k)=>record[k] !== undefined && record[k] !== null);
}
function getPromptCacheReadTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    if (hasAnyKey(tokenRecord, [
        "cacheRead",
        "cache_read_input_tokens",
        "cached_tokens"
    ]) || hasAnyKey(promptDetails, [
        "cached_tokens"
    ])) {
        return getPromptCacheReadTokens(tokens);
    }
    return null;
}
function getPromptCacheCreationTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    if (hasAnyKey(tokenRecord, [
        "cacheCreation",
        "cache_creation_input_tokens"
    ]) || hasAnyKey(promptDetails, [
        "cache_creation_tokens"
    ])) {
        return getPromptCacheCreationTokens(tokens);
    }
    return null;
}
function getReasoningTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const completionDetails = asRecord(tokenRecord.completion_tokens_details);
    if (hasAnyKey(tokenRecord, [
        "reasoning",
        "reasoning_tokens"
    ]) || hasAnyKey(completionDetails, [
        "reasoning_tokens"
    ])) {
        return getReasoningTokens(tokens);
    }
    return null;
}
function formatUsageLog(tokens) {
    const input = getLoggedInputTokens(tokens);
    const output = getLoggedOutputTokens(tokens);
    const cacheRead = getPromptCacheReadTokens(tokens);
    const cacheWrite = getPromptCacheCreationTokens(tokens);
    const reasoning = getReasoningTokens(tokens);
    let msg = `in=${input} | out=${output}`;
    if (cacheRead > 0) {
        msg += ` | CR=${cacheRead}`;
    }
    if (cacheWrite > 0) {
        msg += ` | CW=${cacheWrite}`;
    }
    if (reasoning > 0) {
        msg += ` | R=${reasoning}`;
    }
    return msg;
}
}),
"[project]/src/lib/usage/callLogs/format.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "buildRequestSummary",
    ()=>buildRequestSummary,
    "normalizeDetailState",
    ()=>normalizeDetailState,
    "parseInlineError",
    ()=>parseInlineError,
    "protectPipelinePayloads",
    ()=>protectPipelinePayloads,
    "sanitizeErrorForLog",
    ()=>sanitizeErrorForLog,
    "toStoredErrorSummary",
    ()=>toStoredErrorSummary,
    "toStringOrNull",
    ()=>toStringOrNull,
    "truncateText",
    ()=>truncateText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-route] (ecmascript)");
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function truncateText(value, maxLength) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
}
function parseInlineError(value) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
function normalizeDetailState(value) {
    if (value === "ready" || value === "missing" || value === "corrupt" || value === "legacy-inline") {
        return value;
    }
    return "none";
}
function sanitizeErrorForLog(error) {
    if (error === null || error === undefined) return null;
    if (typeof error === "string") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizePII"])(error).text;
    if (error instanceof Error) {
        return {
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizePII"])(error.message).text,
            stack: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizePII"])(error.stack || "").text || undefined,
            name: error.name
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(error);
}
function toStoredErrorSummary(error) {
    const sanitized = sanitizeErrorForLog(error);
    if (sanitized === null || sanitized === undefined) return null;
    if (typeof sanitized === "string") {
        return truncateText(sanitized, 4000);
    }
    try {
        return truncateText(JSON.stringify(sanitized), 4000);
    } catch  {
        return truncateText(String(sanitized), 4000);
    }
}
function protectPipelinePayloads(payloads) {
    if (!payloads || typeof payloads !== "object") return null;
    const protectedPayloads = {};
    for (const [key, value] of Object.entries(payloads)){
        if (value === null || value === undefined) continue;
        if (key === "streamChunks" && value && typeof value === "object") {
            const chunks = value;
            const compacted = Object.fromEntries(Object.entries(chunks).filter(([, chunkValue])=>Array.isArray(chunkValue) && chunkValue.length > 0));
            if (Object.keys(compacted).length > 0) {
                protectedPayloads.streamChunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compacted);
            }
            continue;
        }
        protectedPayloads[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(value);
    }
    return Object.keys(protectedPayloads).length > 0 ? protectedPayloads : null;
}
function buildRequestSummary(requestType, requestBody) {
    if (requestType !== "search") return null;
    const body = asRecord(requestBody);
    if (Object.keys(body).length === 0) return null;
    const summary = {};
    if (typeof body.query === "string" && body.query.trim().length > 0) {
        summary.query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizePII"])(body.query).text;
    }
    const filters = Object.fromEntries(Object.entries(body).filter(([key])=>key !== "query" && key !== "provider"));
    if (Object.keys(filters).length > 0) {
        summary.filters = filters;
    }
    if (Object.keys(summary).length === 0) return null;
    return JSON.stringify(summary);
}
}),
"[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Canonical numeric coercion helpers — DRY extraction from ~51 near-identical
 * local `toNumber` definitions scattered across `src/` and `open-sse/` (#7879).
 *
 * All three variants share the SAME strict coercion shape as the dominant
 * pre-existing pattern found across the codebase:
 *   - `number` inputs pass through only when `Number.isFinite`.
 *   - `string` inputs are `trim()`-med first; empty/whitespace-only strings
 *     are treated as absent. The trimmed string is coerced with `Number(...)`
 *     and accepted only when the result is finite (rejects `"12abc"`,
 *     `"Infinity"`, `"NaN"`, etc).
 *   - Every other type (`null`, `undefined`, `boolean`, `object`, `array`, ...)
 *     is treated as absent.
 *
 * This is intentionally the STRICT variant — it does NOT use `parseFloat`
 * (which would accept `"12abc"` -> `12`). A small number of call sites in the
 * codebase intentionally keep `parseFloat` (leniency is a documented,
 * deliberate behavior choice there, not a bug) — see
 * `open-sse/services/crofUsageFetcher.ts` for the annotated exception.
 *
 * Migration is happening tier-by-tier (report/analytics first, then
 * quota/billing, then hot-path auth/costRules/combo) to avoid silently
 * changing fallback semantics anywhere cost or quota math depends on it.
 * See the issue for the full plan.
 */ /**
 * Coerce an unknown value to a finite number, or return `fallback` (default
 * `0`) when the value cannot be strictly coerced.
 *
 * @param v - the value to coerce.
 * @param fallback - value returned when coercion fails (default `0`).
 */ __turbopack_context__.s([
    "toNumber",
    ()=>toNumber,
    "toNumberArray",
    ()=>toNumberArray,
    "toNumberOrNull",
    ()=>toNumberOrNull
]);
function toNumber(v, fallback = 0) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim().length > 0) {
        const parsed = Number(v.trim());
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toNumberOrNull(v) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim().length > 0) {
        const parsed = Number(v.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
function toNumberArray(v, fallback = []) {
    if (!Array.isArray(v)) return fallback;
    return v.map((item)=>toNumber(item, 0));
}
}),
"[project]/src/lib/usage/callLogs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cleanupOrphanCallLogFiles",
    ()=>cleanupOrphanCallLogFiles,
    "cleanupOverflowCallLogFiles",
    ()=>cleanupOverflowCallLogFiles,
    "deleteCallLogsBefore",
    ()=>deleteCallLogsBefore,
    "exportCallLogsSince",
    ()=>exportCallLogsSince,
    "getCallLogById",
    ()=>getCallLogById,
    "getCallLogs",
    ()=>getCallLogs,
    "rotateCallLogs",
    ()=>rotateCallLogs,
    "saveCallLog",
    ()=>saveCallLog,
    "scheduleCallLogRotation",
    ()=>scheduleCallLogRotation,
    "trimCallLogsToMaxRows",
    ()=>trimCallLogsToMaxRows
]);
/**
 * Structured call log management.
 *
 * SQLite stores only summary metadata. Detailed request/response payloads live in
 * filesystem artifacts and are loaded only for explicit detail/export flows.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogsBoundedQueries.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/detailedLogs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogApiKeyContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogApiKeyContext.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs/format.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const CALL_LOG_ROTATE_THROTTLE_MS = 60_000;
let lastCallLogRotationScheduledAt = 0;
let callLogRotateInFlight = false;
let callLogRotateScheduled = false;
const RESOLVED_ACCOUNT_SQL = "COALESCE(NULLIF(pc.name, ''), NULLIF(pc.email, ''), cl.account)";
let logIdCounter = 0;
function generateLogId() {
    logIdCounter++;
    return `${Date.now()}-${logIdCounter}`;
}
async function resolveAccountName(connectionId) {
    let account = connectionId ? connectionId.slice(0, 8) : "-";
    if (!connectionId) {
        return account;
    }
    try {
        const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const connections = await getProviderConnections();
        const conn = connections.find((item)=>item.id === connectionId);
        if (conn) {
            account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(conn.name),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(conn.email)
            ], true, account);
        }
    } catch  {
    // Best-effort lookup only.
    }
    return account;
}
async function resolveProviderPrefix(providerId) {
    if (!providerId) return null;
    try {
        const { getProviderNodeById } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const node = await getProviderNodeById(providerId);
        if (node && typeof node.prefix === "string" && node.prefix.trim().length > 0) {
            return node.prefix.trim();
        }
    } catch  {
    // Best-effort lookup only.
    }
    return null;
}
function isCompatibleProviderId(providerId) {
    if (!providerId) return false;
    return providerId.startsWith("openai-compatible-") || providerId.startsWith("anthropic-compatible-");
}
function applyNodePrefix(requestedModel, provider, nodePrefix) {
    if (!requestedModel || !provider || !nodePrefix) return requestedModel;
    if (requestedModel.startsWith(provider + "/")) {
        return nodePrefix + "/" + requestedModel.slice(provider.length + 1);
    }
    return requestedModel;
}
function buildArtifact(logEntry, requestBody, responseBody, error, pipelinePayloads) {
    return {
        schemaVersion: 5,
        summary: {
            id: logEntry.id,
            timestamp: logEntry.timestamp,
            method: logEntry.method,
            path: logEntry.path,
            status: logEntry.status,
            model: logEntry.model,
            requestedModel: logEntry.requestedModel,
            provider: logEntry.provider,
            account: logEntry.account,
            connectionId: logEntry.connectionId,
            duration: logEntry.duration,
            tokens: {
                in: logEntry.tokensIn,
                out: logEntry.tokensOut,
                cacheRead: logEntry.tokensCacheRead,
                cacheWrite: logEntry.tokensCacheCreation,
                reasoning: logEntry.tokensReasoning,
                compressed: logEntry.tokensCompressed
            },
            requestType: logEntry.requestType,
            sourceFormat: logEntry.sourceFormat,
            targetFormat: logEntry.targetFormat,
            apiKeyId: logEntry.apiKeyId,
            apiKeyName: logEntry.apiKeyName,
            comboName: logEntry.comboName,
            comboStepId: logEntry.comboStepId,
            comboExecutionKey: logEntry.comboExecutionKey
        },
        requestBody: requestBody ?? null,
        responseBody: responseBody ?? null,
        error: error ?? null,
        ...pipelinePayloads ? {
            pipeline: pipelinePayloads
        } : {}
    };
}
// #6187: extract the assistant message from a chat-completion-shaped response
// body so we can inspect its reasoning_content / <think> content.
function extractAssistantMessage(responseBody) {
    if (!responseBody || typeof responseBody !== "object") return responseBody;
    const choices = responseBody.choices;
    if (Array.isArray(choices) && choices.length > 0) {
        const first = choices[0];
        return first?.message ?? first?.delta ?? first;
    }
    return responseBody;
}
// #6187: decide the reasoning SOURCE and (char-only) count recorded alongside
// the usage-derived tokens_reasoning. Usage is authoritative when it reports
// non-zero reasoning tokens; otherwise we fall back to observed reasoning
// content so "reasoned but metered 0" stays distinguishable. reasoning_chars is
// a CHARACTER count, never a token count — it must not touch cost math.
function resolveReasoningObservation(usageReasoning, responseBody) {
    if (usageReasoning != null && usageReasoning > 0) {
        return {
            source: "usage",
            chars: null
        };
    }
    const observed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getObservedReasoning"])(extractAssistantMessage(responseBody));
    if (observed.chars > 0) {
        return {
            source: observed.source,
            chars: observed.chars
        };
    }
    return {
        source: null,
        chars: null
    };
}
function hasTable(tableName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName));
}
function readLegacyLogFromDisk(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"] || !entry.timestamp) return null;
    try {
        const date = new Date(entry.timestamp);
        if (Number.isNaN(date.getTime())) return null;
        const dateFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], dateFolder);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) return null;
        const time = `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
        const safeModel = (entry.model || "unknown").replace(/[/:]/g, "-");
        const expectedName = `${time}_${safeModel}_${entry.status}.json`;
        const exactPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, expectedName);
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(exactPath)) {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(exactPath, "utf8"));
        }
        const files = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir).filter((file)=>file.startsWith(time) && file.endsWith(`_${entry.status}.json`));
        if (files.length > 0) {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, files[0]), "utf8"));
        }
    } catch (error) {
        console.error("[callLogs] Failed to read legacy disk log:", error.message);
    }
    return null;
}
function clearArtifactReference(relativePath, nextState) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`
      UPDATE call_logs
      SET detail_state = ?,
          artifact_relpath = NULL,
          artifact_size_bytes = NULL,
          artifact_sha256 = NULL
      WHERE artifact_relpath = ?
    `).run(nextState, relativePath);
}
function listReferencedArtifacts() {
    // #5618: paged to avoid an unbounded `.all()` OOM on large call_logs tables.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectReferencedArtifacts"])();
}
// #5217: SQLite caps a statement at SQLITE_MAX_VARIABLE_NUMBER bound params
// (~999 on many builds). Callers like trimCallLogsToMaxRows() passed up to 5000
// ids in one `IN (...)` → "too many SQL variables" aborted trimming. Chunk well
// under the limit so each DELETE/SELECT stays valid.
const DELETE_ID_CHUNK_SIZE = 500;
function deleteCallLogRowsByIds(ids) {
    if (ids.length === 0) {
        return {
            deletedRows: 0,
            deletedArtifacts: 0
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let deletedRows = 0;
    let deletedArtifacts = 0;
    for(let i = 0; i < ids.length; i += DELETE_ID_CHUNK_SIZE){
        const chunk = ids.slice(i, i + DELETE_ID_CHUNK_SIZE);
        const placeholders = chunk.map(()=>"?").join(", ");
        const rows = db.prepare(`SELECT artifact_relpath FROM call_logs WHERE id IN (${placeholders})`).all(...chunk);
        const result = db.prepare(`DELETE FROM call_logs WHERE id IN (${placeholders})`).run(...chunk);
        deletedRows += result.changes;
        for (const row of rows){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(row.artifact_relpath)) {
                deletedArtifacts++;
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])();
    return {
        deletedRows,
        deletedArtifacts
    };
}
function cleanupOrphanCallLogFiles(baseDir = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return 0;
    try {
        const referenced = listReferencedArtifacts();
        let deleted = 0;
        for (const file of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCallLogArtifactFiles"])(baseDir)){
            if (referenced.has(file.relativePath)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(file.relativePath)) {
                deleted++;
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])(baseDir);
        return deleted;
    } catch (error) {
        console.error("[callLogs] Failed to prune orphan request artifacts:", error.message);
        return 0;
    }
}
function cleanupOverflowCallLogFiles(baseDir = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], maxEntries) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return 0;
    const limit = maxEntries ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogMaxEntries"])();
    if (!Number.isInteger(limit) || limit < 1) return 0;
    try {
        let deleted = 0;
        const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCallLogArtifactFiles"])(baseDir);
        for (const file of files.slice(limit)){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(file.relativePath)) {
                clearArtifactReference(file.relativePath, "missing");
                deleted++;
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])(baseDir);
        return deleted;
    } catch (error) {
        console.error("[callLogs] Failed to prune overflow request artifacts:", error.message);
        return 0;
    }
}
function deleteCallLogsBefore(cutoff) {
    // #5618: page the id selection so a large backlog never loads in one `.all()`.
    let deletedRows = 0;
    let deletedArtifacts = 0;
    for(;;){
        const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectCallLogIdsBefore"])(cutoff);
        if (ids.length === 0) break;
        const result = deleteCallLogRowsByIds(ids);
        deletedRows += result.deletedRows;
        deletedArtifacts += result.deletedArtifacts;
        if (result.deletedRows === 0) break;
    }
    return {
        deletedRows,
        deletedArtifacts
    };
}
function trimCallLogsToMaxRows(maxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])()) {
    if (!Number.isInteger(maxRows) || maxRows < 1) {
        return {
            deletedRows: 0,
            deletedArtifacts: 0
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let deletedRows = 0;
    let deletedArtifacts = 0;
    const batchSize = 5000;
    while(true){
        const currentCount = db.prepare("SELECT COUNT(*) AS cnt FROM call_logs").get();
        if (currentCount.cnt <= maxRows) break;
        const toDelete = Math.min(currentCount.cnt - maxRows, batchSize);
        const ids = db.prepare("SELECT id FROM call_logs ORDER BY timestamp ASC LIMIT ?").all(toDelete).map((row)=>String(row.id));
        const result = deleteCallLogRowsByIds(ids);
        deletedRows += result.deletedRows;
        deletedArtifacts += result.deletedArtifacts;
        if (result.deletedRows === 0) break;
    }
    return {
        deletedRows,
        deletedArtifacts
    };
}
function resolveProviderDisplay(provider, nodeName, nodePrefix) {
    const rawProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(provider);
    if (!rawProvider) return null;
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(nodeName)?.trim();
    if (name) return name;
    const prefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(nodePrefix)?.trim();
    if (prefix) return prefix;
    return null;
}
function mapSummaryRow(row) {
    const detailState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeDetailState"])(row.detail_state);
    const provider = row.provider;
    const nodeName = row.provider_node_name ?? null;
    const nodePrefix = row.provider_node_prefix ?? null;
    return {
        id: row.id,
        timestamp: row.timestamp,
        method: row.method,
        path: row.path,
        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.status),
        model: row.model,
        requestedModel: applyNodePrefix(row.requested_model, provider, nodePrefix),
        provider,
        providerDisplay: resolveProviderDisplay(provider, nodeName, nodePrefix),
        account: row.resolved_account || row.account,
        connectionId: row.connection_id,
        duration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.duration),
        tokens: {
            in: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_in),
            out: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_out),
            cacheRead: row.tokens_cache_read != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_cache_read) : null,
            cacheWrite: row.tokens_cache_creation != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_cache_creation) : null,
            reasoning: row.tokens_reasoning != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_reasoning) : null,
            compressed: row.tokens_compressed != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_compressed) : null
        },
        cacheSource: row.cache_source || "upstream",
        requestType: row.request_type,
        sourceFormat: row.source_format,
        targetFormat: row.target_format,
        apiKeyId: row.api_key_id,
        apiKeyName: row.api_key_name,
        comboName: row.combo_name,
        comboStepId: row.combo_step_id,
        comboExecutionKey: row.combo_execution_key,
        error: row.error_summary,
        detailState,
        artifactRelPath: row.artifact_relpath,
        artifactSizeBytes: row.artifact_size_bytes,
        artifactSha256: row.artifact_sha256,
        requestSummary: row.request_summary ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_summary) : null,
        hasRequestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.has_request_body) === 1,
        hasResponseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.has_response_body) === 1,
        hasPipelineDetails: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.has_pipeline_details) === 1,
        correlationId: row.correlation_id || null,
        modelPinned: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.model_pinned) === 1,
        sessionTag: row.session_tag || null
    };
}
function buildLegacyPipelinePayloads(id) {
    const detailed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestDetailLogByCallLogId"])(id);
    if (!detailed) return null;
    return {
        clientRequest: detailed.client_request ?? null,
        providerRequest: detailed.translated_request ?? null,
        providerResponse: detailed.provider_response ?? null,
        clientResponse: detailed.client_response ?? null
    };
}
function getLegacyInlineDetail(id) {
    if (!hasTable("call_logs_v1_legacy")) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT request_body, response_body, error FROM call_logs_v1_legacy WHERE id = ?").get(id);
    if (!row) return null;
    return {
        requestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_body),
        responseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.response_body),
        error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseInlineError"])(row.error)
    };
}
async function saveCallLog(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldPersistToDisk"]) return;
    try {
        const apiKeyContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogApiKeyContext$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogApiKeyContext"])();
        // `||` (not `??`): an empty-string apiKeyId/apiKeyName is "unattributed",
        // same as before this fallback existed — it must not be persisted verbatim
        // nor block the request-scoped context.
        const apiKeyId = entry.apiKeyId || apiKeyContext?.apiKeyId || null;
        const apiKeyName = entry.apiKeyName || apiKeyContext?.apiKeyName || null;
        const noLogEnabled = Boolean(entry.noLog) || (apiKeyId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoLog"])(apiKeyId) : false);
        const protectedRequestBody = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.requestBody);
        const protectedResponseBody = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.responseBody);
        const protectedPipelinePayloads = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["protectPipelinePayloads"])(entry.pipelinePayloads ?? entry.pipeline ?? null);
        const protectedError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeErrorForLog"])(entry.error);
        const account = await resolveAccountName(entry.connectionId || null);
        const rawProvider = entry.provider || "-";
        const rawRequestedModel = entry.requestedModel || null;
        let resolvedRequestedModel = rawRequestedModel;
        if (rawRequestedModel && isCompatibleProviderId(rawProvider)) {
            const nodePrefix = await resolveProviderPrefix(rawProvider);
            resolvedRequestedModel = applyNodePrefix(rawRequestedModel, rawProvider, nodePrefix);
        }
        // #6187: usage-derived reasoning tokens stay UNCHANGED (cost math reads this),
        // while reasoning source/char-count are recorded separately for observability.
        const tokensReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReasoningTokensOrNull"])(entry.tokens);
        const reasoningObservation = resolveReasoningObservation(tokensReasoning, entry.responseBody);
        const logEntry = {
            id: typeof entry.id === "string" && entry.id.length > 0 ? entry.id : generateLogId(),
            timestamp: typeof entry.timestamp === "string" ? entry.timestamp : new Date().toISOString(),
            method: entry.method || "POST",
            path: entry.path || "/v1/chat/completions",
            status: entry.status || 0,
            model: entry.model || "-",
            requestedModel: resolvedRequestedModel,
            provider: rawProvider,
            account,
            connectionId: entry.connectionId || null,
            duration: entry.duration || 0,
            tokensIn: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(entry.tokens)),
            tokensOut: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(entry.tokens)),
            tokensCacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPromptCacheReadTokensOrNull"])(entry.tokens),
            tokensCacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPromptCacheCreationTokensOrNull"])(entry.tokens),
            tokensReasoning,
            reasoningSource: reasoningObservation.source,
            reasoningChars: reasoningObservation.chars,
            tokensCompressed: entry.tokensCompressed != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(entry.tokensCompressed) : null,
            cacheSource: entry.cacheSource === "semantic" ? "semantic" : "upstream",
            requestType: entry.requestType || null,
            sourceFormat: entry.sourceFormat || null,
            targetFormat: entry.targetFormat || null,
            apiKeyId,
            apiKeyName,
            comboName: entry.comboName || null,
            comboStepId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboStepId),
            comboExecutionKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboExecutionKey) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboStepId),
            correlationId: entry.correlationId || null,
            modelPinned: entry.modelPinned ? 1 : 0,
            sessionTag: entry.sessionTag || null
        };
        const requestSummary = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildRequestSummary"])(logEntry.requestType, protectedRequestBody);
        const detailExpected = !noLogEnabled && (protectedRequestBody !== null || protectedResponseBody !== null || protectedError !== null || protectedPipelinePayloads !== null);
        let detailState = "none";
        let artifactRelPath = null;
        let artifactSizeBytes = null;
        let artifactSha256 = null;
        if (detailExpected) {
            const artifact = buildArtifact(logEntry, protectedRequestBody, protectedResponseBody, protectedError, protectedPipelinePayloads);
            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact);
            if (artifactResult) {
                detailState = "ready";
                artifactRelPath = artifactResult.relPath;
                artifactSizeBytes = artifactResult.sizeBytes;
                artifactSha256 = artifactResult.sha256;
            } else {
                detailState = "missing";
            }
        }
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare(`
      INSERT INTO call_logs (
        id, timestamp, method, path, status, model, requested_model, provider,
        account, connection_id, duration, tokens_in, tokens_out,
        tokens_cache_read, tokens_cache_creation, tokens_reasoning, tokens_compressed,
        reasoning_source, reasoning_chars,
        cache_source, request_type, source_format, target_format, api_key_id, api_key_name,
        combo_name, combo_step_id, combo_execution_key, error_summary, detail_state,
        artifact_relpath, artifact_size_bytes, artifact_sha256,
        has_request_body, has_response_body, has_pipeline_details, request_summary,
        correlation_id, model_pinned, session_tag
      )
      VALUES (
        @id, @timestamp, @method, @path, @status, @model, @requestedModel, @provider,
        @account, @connectionId, @duration, @tokensIn, @tokensOut,
        @tokensCacheRead, @tokensCacheCreation, @tokensReasoning, @tokensCompressed,
        @reasoningSource, @reasoningChars,
        @cacheSource, @requestType, @sourceFormat, @targetFormat, @apiKeyId, @apiKeyName,
        @comboName, @comboStepId, @comboExecutionKey, @errorSummary, @detailState,
        @artifactRelPath, @artifactSizeBytes, @artifactSha256,
        @hasRequestBody, @hasResponseBody, @hasPipelineDetails, @requestSummary,
        @correlationId, @modelPinned, @sessionTag
      )
    `).run({
            ...logEntry,
            errorSummary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStoredErrorSummary"])(protectedError),
            detailState,
            artifactRelPath,
            artifactSizeBytes,
            artifactSha256,
            hasRequestBody: protectedRequestBody !== null ? 1 : 0,
            hasResponseBody: protectedResponseBody !== null ? 1 : 0,
            hasPipelineDetails: protectedPipelinePayloads ? 1 : 0,
            requestSummary
        });
        scheduleCallLogRotation();
    } catch (error) {
        console.error("[callLogs] Failed to save call log:", error.message);
    }
}
function rotateCallLogs() {
    try {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"] || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"])) return;
        const retentionMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])() * 24 * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - retentionMs).toISOString();
        deleteCallLogsBefore(cutoff);
        trimCallLogsToMaxRows((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])());
        cleanupOverflowCallLogFiles(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCallLogMaxEntries"])());
        cleanupOrphanCallLogFiles(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]);
    } catch (error) {
        console.error("[callLogs] Failed to rotate request artifacts:", error.message);
    }
}
function runScheduledCallLogRotation() {
    if (callLogRotateInFlight) return;
    callLogRotateInFlight = true;
    setImmediate(()=>{
        try {
            rotateCallLogs();
        } catch (error) {
            console.error("[callLogs] Failed to rotate request artifacts:", error.message);
        } finally{
            callLogRotateInFlight = false;
        }
    });
}
function scheduleCallLogRotation() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]) return;
    const elapsed = Date.now() - lastCallLogRotationScheduledAt;
    if (elapsed >= CALL_LOG_ROTATE_THROTTLE_MS) {
        lastCallLogRotationScheduledAt = Date.now();
        runScheduledCallLogRotation();
        return;
    }
    if (callLogRotateScheduled) return;
    callLogRotateScheduled = true;
    lastCallLogRotationScheduledAt = Date.now();
    const timer = setTimeout(()=>{
        callLogRotateScheduled = false;
        runScheduledCallLogRotation();
    }, CALL_LOG_ROTATE_THROTTLE_MS - elapsed);
    timer.unref?.();
}
if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldPersistToDisk"] && ("TURBOPACK compile-time value", "development") !== "test") {
    scheduleCallLogRotation();
}
/**
 * Pushes a `column LIKE %value%` condition (mirrors the correlationId/sessionTag substring-match
 * precedent). Extracted so getCallLogs stays under the max-lines-per-function ratchet — #8249.
 */ function pushLikeFilter(conditions, params, column, paramKey, value) {
    if (!value) return;
    conditions.push(`cl.${column} LIKE @${paramKey}`);
    params[paramKey] = `%${value}%`;
}
async function getCallLogs(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = `
    SELECT cl.*,
      pn.name AS provider_node_name, pn.prefix AS provider_node_prefix,
      ${RESOLVED_ACCOUNT_SQL} AS resolved_account
    FROM call_logs cl
    LEFT JOIN provider_nodes pn ON pn.id = cl.provider
    LEFT JOIN provider_connections pc ON pc.id = cl.connection_id
  `;
    const conditions = [];
    const params = {};
    if (filter.status) {
        if (filter.status === "error") {
            conditions.push("(cl.status >= 400 OR cl.error_summary IS NOT NULL)");
        } else if (filter.status === "ok") {
            conditions.push("cl.status >= 200 AND cl.status < 300");
        } else {
            const statusCode = Number.parseInt(filter.status, 10);
            if (!Number.isNaN(statusCode)) {
                conditions.push("cl.status = @statusCode");
                params.statusCode = statusCode;
            }
        }
    }
    if (filter.model) {
        conditions.push("(cl.model LIKE @modelQ OR cl.requested_model LIKE @modelQ)");
        params.modelQ = `%${filter.model}%`;
    }
    if (filter.provider) {
        conditions.push("cl.provider LIKE @providerQ");
        params.providerQ = `%${filter.provider}%`;
    }
    if (filter.account) {
        conditions.push(`(cl.account LIKE @accountQ OR ${RESOLVED_ACCOUNT_SQL} LIKE @accountQ)`);
        params.accountQ = `%${filter.account}%`;
    }
    if (filter.apiKey) {
        conditions.push("(cl.api_key_name LIKE @apiKeyQ OR cl.api_key_id LIKE @apiKeyQ)");
        params.apiKeyQ = `%${filter.apiKey}%`;
    }
    pushLikeFilter(conditions, params, "correlation_id", "correlationId", filter.correlationId);
    pushLikeFilter(conditions, params, "session_tag", "sessionTag", filter.sessionTag);
    if (filter.combo) {
        conditions.push("cl.combo_name IS NOT NULL");
    }
    if (filter.since) {
        conditions.push("cl.timestamp >= @since");
        params.since = filter.since instanceof Date ? filter.since.toISOString() : String(filter.since);
    }
    if (filter.until) {
        conditions.push("cl.timestamp <= @until");
        params.until = filter.until instanceof Date ? filter.until.toISOString() : String(filter.until);
    }
    if (filter.search) {
        conditions.push(`(
      cl.model LIKE @searchQ OR cl.path LIKE @searchQ OR cl.account LIKE @searchQ OR
      ${RESOLVED_ACCOUNT_SQL} LIKE @searchQ OR
      cl.requested_model LIKE @searchQ OR cl.provider LIKE @searchQ OR
      cl.api_key_name LIKE @searchQ OR cl.api_key_id LIKE @searchQ OR
      cl.combo_name LIKE @searchQ OR CAST(cl.status AS TEXT) LIKE @searchQ
      OR cl.combo_step_id LIKE @searchQ OR cl.combo_execution_key LIKE @searchQ
      OR cl.error_summary LIKE @searchQ
      OR cl.correlation_id LIKE @searchQ
    )`);
        params.searchQ = `%${filter.search}%`;
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    const limit = Number.isInteger(filter.limit) && filter.limit > 0 ? filter.limit : 200;
    const offset = Number.isInteger(filter.offset) && filter.offset > 0 ? filter.offset : 0;
    sql += ` ORDER BY cl.timestamp DESC LIMIT @__limit OFFSET @__offset`;
    params.__limit = limit;
    params.__offset = offset;
    const rows = db.prepare(sql).all(params);
    return rows.map(mapSummaryRow);
}
async function getCallLogById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT cl.*,
        pn.name AS provider_node_name,
        pn.prefix AS provider_node_prefix,
        ${RESOLVED_ACCOUNT_SQL} AS resolved_account
       FROM call_logs cl
       LEFT JOIN provider_nodes pn ON pn.id = cl.provider
       LEFT JOIN provider_connections pc ON pc.id = cl.connection_id
       WHERE cl.id = ?`).get(id);
    if (!row) return null;
    const entry = mapSummaryRow(row);
    let detailState = entry.detailState;
    let artifactRelPath = entry.artifactRelPath;
    if (artifactRelPath) {
        const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCallArtifact"])(artifactRelPath);
        if (artifactResult.state === "ready" && artifactResult.artifact) {
            return {
                ...entry,
                detailState: "ready",
                requestBody: artifactResult.artifact.requestBody ?? null,
                responseBody: artifactResult.artifact.responseBody ?? null,
                error: artifactResult.artifact.error ?? entry.error,
                pipelinePayloads: artifactResult.artifact.pipeline ?? buildLegacyPipelinePayloads(id),
                hasPipelineDetails: Boolean(artifactResult.artifact.pipeline) || entry.hasPipelineDetails,
                active: false
            };
        }
        detailState = artifactResult.state;
        if (artifactResult.state === "missing") {
            clearArtifactReference(artifactRelPath, "missing");
            artifactRelPath = null;
        } else {
            db.prepare("UPDATE call_logs SET detail_state = ? WHERE id = ?").run("corrupt", id);
        }
    }
    if (detailState === "legacy-inline") {
        const legacyInline = getLegacyInlineDetail(id);
        if (legacyInline) {
            const legacyPipeline = buildLegacyPipelinePayloads(id);
            return {
                ...entry,
                detailState,
                artifactRelPath,
                ...legacyInline,
                pipelinePayloads: legacyPipeline,
                hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
                active: false
            };
        }
    }
    const legacyDisk = readLegacyLogFromDisk(entry);
    if (legacyDisk) {
        const legacyPipeline = buildLegacyPipelinePayloads(id);
        return {
            ...entry,
            detailState,
            artifactRelPath,
            requestBody: legacyDisk.requestBody ?? null,
            responseBody: legacyDisk.responseBody ?? null,
            error: legacyDisk.error ?? entry.error,
            pipelinePayloads: legacyPipeline,
            hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
            active: false
        };
    }
    const legacyPipeline = buildLegacyPipelinePayloads(id);
    return {
        ...entry,
        detailState,
        artifactRelPath,
        requestBody: null,
        responseBody: null,
        error: entry.error,
        pipelinePayloads: legacyPipeline,
        hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
        active: false
    };
}
async function exportCallLogsSince(since) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const ids = db.prepare("SELECT id FROM call_logs WHERE timestamp >= ? ORDER BY timestamp DESC").all(since).map((row)=>String(row.id));
    const logs = [];
    for (const id of ids){
        const log = await getCallLogById(id);
        if (log) logs.push(log);
    }
    return logs;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__17rgv-1._.js.map