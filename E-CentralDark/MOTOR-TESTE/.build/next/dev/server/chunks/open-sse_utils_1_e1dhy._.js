module.exports = [
"[project]/open-sse/utils/cors.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Static CORS headers for open-sse handlers.
 *
 * `Access-Control-Allow-Origin` is set by the Next.js middleware
 * (`src/server/cors/origins.ts`). Handlers in this package only need the
 * methods/headers list; the middleware overlays the allowed origin per
 * the central allowlist on the way out.
 */ __turbopack_context__.s([
    "CORS_HEADERS",
    ()=>CORS_HEADERS
]);
const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, anthropic-version, x-omniroute-connection, x-internal-test, accept"
};
}),
"[project]/open-sse/utils/responsesInputNormalization.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeCodexResponsesInput",
    ()=>normalizeCodexResponsesInput,
    "normalizeResponsesInputForChat",
    ()=>normalizeResponsesInputForChat
]);
function normalizeAgentMessageForChat(item) {
    if (item.type !== "agent_message") return null;
    if (!Array.isArray(item.content)) return null;
    const textParts = [];
    for (const partValue of item.content){
        if (!partValue || typeof partValue !== "object" || Array.isArray(partValue)) {
            return null;
        }
        const part = partValue;
        if (part.type === "encrypted_content") {
            // Chat Completions has no encrypted agent-message equivalent. Do not leak a
            // partial plaintext envelope or forward an opaque payload the model cannot use.
            return null;
        }
        if (part.type !== "input_text" || typeof part.text !== "string") return null;
        textParts.push(part.text);
    }
    const text = textParts.join("\n");
    if (!text.trim()) return null;
    return {
        type: "message",
        role: "assistant",
        content: [
            {
                type: "input_text",
                text
            }
        ]
    };
}
function textPartTypeForRole(role) {
    return role === "assistant" ? "output_text" : "input_text";
}
function normalizeCodexMessageContentPart(part, role) {
    if (typeof part === "string") return {
        type: textPartTypeForRole(role),
        text: part
    };
    if (!part || typeof part !== "object" || Array.isArray(part)) return part;
    const record = {
        ...part
    };
    if (record.type === "text") record.type = textPartTypeForRole(role);
    // Assistant history in the Responses API must use `output_text` (or `refusal`),
    // never `input_text` (which is user-only). codex-cli sends assistant turns as
    // `input_text`; normalize them so the Codex/OpenAI backend accepts the replay.
    if (role === "assistant" && (record.type === "input_text" || record.type === "text")) {
        record.type = "output_text";
        delete record.annotations;
        delete record.logprobs;
        delete record.obfuscation;
    }
    return record;
}
function buildCodexMessageContent(item, role) {
    if (Array.isArray(item.content)) {
        return item.content.map((part)=>normalizeCodexMessageContentPart(part, role));
    }
    if (typeof item.content === "string") {
        return [
            {
                type: textPartTypeForRole(role),
                text: item.content
            }
        ];
    }
    if (typeof item.text === "string") {
        return [
            {
                type: textPartTypeForRole(role),
                text: item.text
            }
        ];
    }
    return [];
}
function normalizeCodexResponsesInputItem(itemValue) {
    if (typeof itemValue === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: itemValue
                }
            ]
        };
    }
    if (!itemValue || typeof itemValue !== "object" || Array.isArray(itemValue)) return itemValue;
    const item = {
        ...itemValue
    };
    const role = typeof item.role === "string" ? item.role : "user";
    const type = typeof item.type === "string" ? item.type : "";
    if (type === "additional_tools") {
        delete item.content;
        return item;
    }
    if (!type && item.content === undefined && typeof item.text === "string") {
        return {
            type: "message",
            role,
            content: [
                {
                    type: textPartTypeForRole(role),
                    text: item.text
                }
            ]
        };
    }
    if (!type && role) item.type = "message";
    if (item.type === "message" || !type && item.content !== undefined) {
        item.role = role;
        item.content = buildCodexMessageContent(item, role);
        item.type = "message";
    }
    return item;
}
function normalizeCodexResponsesInput(body) {
    if (Array.isArray(body.input)) {
        body.input = body.input.map(normalizeCodexResponsesInputItem);
        return;
    }
    // undefined → leave as-is; null → empty list (not [null], which would surface a bogus
    // item downstream); anything else → wrap the single item.
    if (body.input === undefined) return;
    body.input = body.input === null ? [] : [
        normalizeCodexResponsesInputItem(body.input)
    ];
}
function normalizeResponsesInputItemForChat(value) {
    if (typeof value === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: value
                }
            ]
        };
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const item = {
        ...value
    };
    const hasType = typeof item.type === "string" && item.type.length > 0;
    const hasRole = typeof item.role === "string" && item.role.length > 0;
    const agentMessage = normalizeAgentMessageForChat(item);
    if (agentMessage) return agentMessage;
    if (item.type === "agent_message") {
        // Encrypted or malformed agent messages have no lossless Chat equivalent.
        // Treat them like other Responses-only metadata instead of failing the whole turn.
        return {
            type: "reasoning"
        };
    }
    if (hasType || hasRole) {
        if (!hasType && hasRole) item.type = "message";
        return item;
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
    if (item.content !== undefined) return {
        type: "message",
        role: "user",
        content: item.content
    };
    return item;
}
function normalizeResponsesInputForChat(input) {
    // == null matches both undefined and null (neither is a spec-valid input) → empty list.
    if (input == null) return [];
    if (Array.isArray(input)) return input.map(normalizeResponsesInputItemForChat);
    return [
        normalizeResponsesInputItemForChat(input)
    ];
}
}),
"[project]/open-sse/utils/cursorAgentProtobuf/wire.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Low-level protobuf wire-format primitives for the Cursor Agent codec, extracted
// verbatim from ../cursorAgentProtobuf.ts (god-file decomposition). Pure and
// dependency-free (Buffer only): varint/tag/length-delimited encode+decode and the
// generic field walker. Framing, the value codec, and the message encoders/decoders
// all build on this layer. Nothing here was part of the module's public API, so the
// host imports these back internally (no re-export).
// ─── Wire-type constants ───────────────────────────────────────────────────
__turbopack_context__.s([
    "WT_LEN",
    ()=>WT_LEN,
    "WT_VARINT",
    ()=>WT_VARINT,
    "checkedLen",
    ()=>checkedLen,
    "decodeFields",
    ()=>decodeFields,
    "decodeStringField",
    ()=>decodeStringField,
    "decodeVarint",
    ()=>decodeVarint,
    "decodeVarintField",
    ()=>decodeVarintField,
    "encodeBoolField",
    ()=>encodeBoolField,
    "encodeBytes",
    ()=>encodeBytes,
    "encodeDoubleField",
    ()=>encodeDoubleField,
    "encodeMessage",
    ()=>encodeMessage,
    "encodeString",
    ()=>encodeString,
    "encodeTag",
    ()=>encodeTag,
    "encodeUInt32Field",
    ()=>encodeUInt32Field,
    "encodeVarint",
    ()=>encodeVarint,
    "findField",
    ()=>findField
]);
const WT_VARINT = 0;
const WT_LEN = 2;
function encodeVarint(value) {
    let v = typeof value === "bigint" ? value : BigInt(value);
    const bytes = [];
    while(v > 0x7fn){
        bytes.push(Number(v & 0x7fn) | 0x80);
        v >>= 7n;
    }
    bytes.push(Number(v));
    return Buffer.from(bytes);
}
function encodeTag(fieldNumber, wireType) {
    return encodeVarint(fieldNumber << 3 | wireType);
}
function encodeBytes(fieldNumber, value) {
    const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
    return Buffer.concat([
        encodeTag(fieldNumber, WT_LEN),
        encodeVarint(buf.length),
        buf
    ]);
}
function encodeString(fieldNumber, value) {
    return encodeBytes(fieldNumber, Buffer.from(value, "utf8"));
}
function encodeMessage(fieldNumber, parts) {
    const inner = Buffer.concat(parts);
    return Buffer.concat([
        encodeTag(fieldNumber, WT_LEN),
        encodeVarint(inner.length),
        inner
    ]);
}
function encodeUInt32Field(fieldNumber, value) {
    return Buffer.concat([
        encodeTag(fieldNumber, WT_VARINT),
        encodeVarint(value)
    ]);
}
function encodeBoolField(fieldNumber, value) {
    return Buffer.concat([
        encodeTag(fieldNumber, WT_VARINT),
        encodeVarint(value ? 1 : 0)
    ]);
}
function encodeDoubleField(fieldNumber, value) {
    // wire type 1 = 64-bit fixed (double)
    const buf = Buffer.alloc(8);
    buf.writeDoubleLE(value, 0);
    return Buffer.concat([
        encodeTag(fieldNumber, 1),
        buf
    ]);
}
function decodeVarint(buf, offset) {
    let result = 0n;
    let shift = 0n;
    let pos = offset;
    while(pos < buf.length){
        const byte = buf[pos++];
        result |= BigInt(byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) return [
            result,
            pos
        ];
        shift += 7n;
    }
    throw new Error("varint truncated");
}
function checkedLen(len, pos, buf) {
    if (len < 0n || len > BigInt(buf.length - pos)) {
        throw new Error(`length-delimited field overruns buffer (len=${len}, remaining=${buf.length - pos})`);
    }
    return Number(len);
}
function decodeFields(buf) {
    const fields = [];
    let pos = 0;
    while(pos < buf.length){
        const [tag, np] = decodeVarint(buf, pos);
        pos = np;
        const fieldNumber = Number(tag >> 3n);
        const wireType = Number(tag & 0x7n);
        if (wireType === WT_VARINT) {
            const [v, np2] = decodeVarint(buf, pos);
            pos = np2;
            fields.push({
                fieldNumber,
                wireType: 0,
                varint: v
            });
        } else if (wireType === WT_LEN) {
            const [len, np2] = decodeVarint(buf, pos);
            pos = np2;
            const lenN = checkedLen(len, pos, buf);
            fields.push({
                fieldNumber,
                wireType: 2,
                bytes: buf.subarray(pos, pos + lenN)
            });
            pos += lenN;
        } else if (wireType === 5) {
            pos += 4;
        } else if (wireType === 1) {
            pos += 8;
        } else {
            throw new Error(`unsupported wireType ${wireType}`);
        }
    }
    return fields;
}
function findField(fields, fieldNumber) {
    return fields.find((f)=>f.fieldNumber === fieldNumber);
}
function decodeStringField(buf, fieldNumber) {
    const fields = decodeFields(buf);
    const f = findField(fields, fieldNumber);
    if (f && f.wireType === 2) return f.bytes.toString("utf8");
    return "";
}
function decodeVarintField(buf, fieldNumber) {
    const fields = decodeFields(buf);
    const f = findField(fields, fieldNumber);
    if (f && f.wireType === 0) return Number(f.varint);
    return 0;
}
}),
"[project]/open-sse/utils/cursorAgentProtobuf/nativeTodoWrite.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeNativeTodoWriteCompletion",
    ()=>decodeNativeTodoWriteCompletion
]);
// Pure decoder for Cursor's native TodoWrite completion envelope. Kept separate
// from the main Agent codec so the frozen host remains below its file-size
// ceiling and TodoWrite's fail-closed wire semantics stay independently auditable.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cursorAgentProtobuf/wire.ts [middleware] (ecmascript)");
;
// ToolCallCompletedUpdate { tool_call_id (1), tool_call (2) }
// ToolCall.todo_write (9) -> TodoWriteDetails.args (1)
// TodoWriteArgs { todos (1 repeated), merge (2) }
// TodoItem { content (2), status (3) }
const TCCU_TOOL_CALL_ID = 1;
const TCCU_TOOL_CALL = 2;
const TOOL_CALL_TODO_WRITE = 9;
const TODO_WRITE_ARGS = 1;
const TODO_ARGS_TODOS = 1;
const TODO_ARGS_MERGE = 2;
const TODO_ITEM_CONTENT = 2;
const TODO_ITEM_STATUS = 3;
function decodeNativeTodoStatus(value) {
    switch(value){
        case 1n:
            return "pending";
        case 2n:
            return "in_progress";
        case 3n:
            return "completed";
        case 4n:
            return "cancelled";
        default:
            return null;
    }
}
function uniqueLenField(fields, fieldNumber) {
    const matches = fields.filter((field)=>field.fieldNumber === fieldNumber);
    if (matches.length !== 1) return null;
    const field = matches[0];
    return field.wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_LEN"] ? field : null;
}
function uniqueVarintField(fields, fieldNumber) {
    const matches = fields.filter((field)=>field.fieldNumber === fieldNumber);
    if (matches.length !== 1) return null;
    const field = matches[0];
    return field.wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"] ? field : null;
}
function decodeNonEmptyUtf8(bytes) {
    const value = bytes.toString("utf8");
    if (!value || !Buffer.from(value, "utf8").equals(bytes)) return null;
    return value;
}
function decodeNativeTodoWriteCompletion(payload) {
    const completedFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(payload);
    const toolCallIdField = uniqueLenField(completedFields, TCCU_TOOL_CALL_ID);
    const toolCallField = uniqueLenField(completedFields, TCCU_TOOL_CALL);
    if (!toolCallIdField || !toolCallField) return null;
    const toolCallId = decodeNonEmptyUtf8(toolCallIdField.bytes);
    if (!toolCallId) return null;
    const todoWriteField = uniqueLenField((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(toolCallField.bytes), TOOL_CALL_TODO_WRITE);
    if (!todoWriteField) return null;
    const argsField = uniqueLenField((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(todoWriteField.bytes), TODO_WRITE_ARGS);
    if (!argsField) return null;
    const argsFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(argsField.bytes);
    const todos = [];
    const mergeFields = argsFields.filter((field)=>field.fieldNumber === TODO_ARGS_MERGE);
    if (mergeFields.length > 1) return null;
    const mergeField = mergeFields.length === 1 ? uniqueVarintField(argsFields, TODO_ARGS_MERGE) : null;
    if (mergeFields.length === 1 && !mergeField) return null;
    const merge = mergeField ? mergeField.varint !== 0n : false;
    for (const field of argsFields){
        if (field.fieldNumber === TODO_ARGS_MERGE) continue;
        if (field.fieldNumber !== TODO_ARGS_TODOS) continue;
        if (field.wireType !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_LEN"]) return null;
        const itemFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(field.bytes);
        const contentField = uniqueLenField(itemFields, TODO_ITEM_CONTENT);
        const statusField = uniqueVarintField(itemFields, TODO_ITEM_STATUS);
        if (!contentField || !statusField) return null;
        const content = decodeNonEmptyUtf8(contentField.bytes);
        const status = decodeNativeTodoStatus(statusField.varint);
        if (!content || !status) return null;
        todos.push({
            content,
            status
        });
    }
    return {
        kind: "native_todo_write",
        toolCallId,
        merge,
        todos
    };
}
}),
"[project]/open-sse/utils/cursorAgentProtobuf.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAgentRequestBody",
    ()=>buildAgentRequestBody,
    "decodeAgentServerMessage",
    ()=>decodeAgentServerMessage,
    "decodeExecRequestContext",
    ()=>decodeExecRequestContext,
    "decodeExecServerEvent",
    ()=>decodeExecServerEvent,
    "decodeKvServerEvent",
    ()=>decodeKvServerEvent,
    "decodeProtobufValue",
    ()=>decodeProtobufValue,
    "encodeAgentRunRequest",
    ()=>encodeAgentRunRequest,
    "encodeExecBackgroundShellSpawnRejected",
    ()=>encodeExecBackgroundShellSpawnRejected,
    "encodeExecDeleteRejected",
    ()=>encodeExecDeleteRejected,
    "encodeExecDiagnosticsResult",
    ()=>encodeExecDiagnosticsResult,
    "encodeExecFetchError",
    ()=>encodeExecFetchError,
    "encodeExecGrepError",
    ()=>encodeExecGrepError,
    "encodeExecLsRejected",
    ()=>encodeExecLsRejected,
    "encodeExecMcpError",
    ()=>encodeExecMcpError,
    "encodeExecMcpResult",
    ()=>encodeExecMcpResult,
    "encodeExecReadRejected",
    ()=>encodeExecReadRejected,
    "encodeExecShellRejected",
    ()=>encodeExecShellRejected,
    "encodeExecWriteRejected",
    ()=>encodeExecWriteRejected,
    "encodeExecWriteShellStdinError",
    ()=>encodeExecWriteShellStdinError,
    "encodeKvGetBlobResult",
    ()=>encodeKvGetBlobResult,
    "encodeKvSetBlobResult",
    ()=>encodeKvSetBlobResult,
    "encodeMcpToolDefinitionBody",
    ()=>encodeMcpToolDefinitionBody,
    "encodeRequestContextResponse",
    ()=>encodeRequestContextResponse,
    "encodeSelectedImageBody",
    ()=>encodeSelectedImageBody,
    "flattenMessages",
    ()=>flattenMessages,
    "iterateConnectFrames",
    ()=>iterateConnectFrames,
    "jsonSchemaToProtobufValue",
    ()=>jsonSchemaToProtobufValue,
    "normalizeCursorModelId",
    ()=>normalizeCursorModelId,
    "openAIToolsToMcpDefs",
    ()=>openAIToolsToMcpDefs,
    "resolveRequestedModel",
    ()=>resolveRequestedModel,
    "wrapConnectFrame",
    ()=>wrapConnectFrame
]);
/**
 * Hand-rolled protobuf encoder/decoder for Cursor's `agent.v1.AgentService/Run`
 * RPC, the endpoint cursor-agent uses for everything (chat + composer + auto).
 *
 * Replaces the legacy aiserver.v1.ChatService/StreamUnifiedChatWithTools path,
 * which doesn't accept "auto" or "composer-*" model ids.
 *
 * Schema sourced from:
 *   - On-the-wire captures of cursor-agent (decoded against the protobuf
 *     descriptor shipped in cursor-agent's bundle)
 *   - Cross-checked against router-for-me/CLIProxyAPI's reference Go impl
 *     and KooshaPari/cliproxyapi-plusplus's hand-rolled field tables
 *
 * The endpoint is a Connect-RPC client-streaming RPC. We send one frame
 * (AgentClientMessage with a RunRequest) and end the stream; the server
 * streams back an AgentServerMessage per chunk.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$zlib__$5b$external$5d$__$28$node$3a$zlib$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:zlib [external] (node:zlib, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$nativeTodoWrite$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cursorAgentProtobuf/nativeTodoWrite.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cursorAgentProtobuf/wire.ts [middleware] (ecmascript)");
;
;
;
;
// ─── Field numbers (from agent.proto descriptor) ───────────────────────────
const ACM_RUN_REQUEST = 1; // AgentClientMessage.run_request
const ARR_CONVERSATION_STATE = 1; // AgentRunRequest.conversation_state
const ARR_ACTION = 2; // AgentRunRequest.action
const ARR_MODEL_DETAILS = 3; // AgentRunRequest.model_details (ModelDetails, msg 88)
const ARR_CONVERSATION_ID = 5; // AgentRunRequest.conversation_id
const ARR_MCP_TOOLS = 4; // AgentRunRequest.mcp_tools (empty placeholder required)
const ARR_REQUESTED_MODEL = 9; // AgentRunRequest.requested_model
const ARR_UNKNOWN_12 = 12; // observed varint=0 in cursor-agent traffic
const ARR_REQUEST_ID = 16; // observed UUID, same value as conversation_id
const CSS_ROOT_PROMPT = 1; // ConversationStateStructure.root_prompt_messages_json
const CSS_TURNS = 8; // ConversationStateStructure.turns
const CA_USER_MESSAGE_ACTION = 1; // ConversationAction.user_message_action
const UMA_USER_MESSAGE = 1; // UserMessageAction.user_message
const UM_TEXT = 1; // UserMessage.text
const UM_MESSAGE_ID = 2; // UserMessage.message_id
const UM_SELECTED_CONTEXT = 3; // UserMessage.selected_context (empty placeholder required)
const UM_MODE = 4; // UserMessage.mode (cursor-agent sends 1)
// ─── Vision input (image) field numbers ────────────────────────────────────
// Pinned from cursor-agent's agent.v1 protobuf descriptor (bundle version
// 2026.06.02-8c11d9f, cross-checked against composer-api's older-endpoint
// encoder for shape). Images attach to the current UserMessage through its
// selected_context (field 3): UserMessage.selected_context is a SelectedContext
// whose `selected_images` (field 1) is a repeated SelectedImage. Each
// SelectedImage carries the raw bytes inline in its `data_or_blob_id` oneof
// (the `data` case, field 8) — cursor-agent's CLI instead sends a local file
// `path`, which a proxy cannot use, so we inline the bytes like composer-api.
const SC_SELECTED_IMAGES = 1; // SelectedContext.selected_images [repeated SelectedImage]
const SI_UUID = 2; // SelectedImage.uuid
const SI_DIMENSION = 4; // SelectedImage.dimension (SelectedImage.Dimension)
const SI_MIME_TYPE = 7; // SelectedImage.mime_type
const SI_DATA = 8; // SelectedImage.data (oneof data_or_blob_id) — inline image bytes
const DIM_WIDTH = 1; // SelectedImage.Dimension.width (int32)
const DIM_HEIGHT = 2; // SelectedImage.Dimension.height (int32)
const RM_MODEL_ID = 1; // RequestedModel.model_id
const RM_PARAMETERS = 3; // RequestedModel.parameters [repeated]
// ModelDetails (msg 88) — the model envelope cursor-agent actually uses to resolve
// pinned model variants. Field numbers pinned from the cursor-agent descriptor (and
// CLIProxyAPIPlus's cursor proto). #3714: pinned Claude/GPT *thinking* variants returned
// an empty turn when sent only via RequestedModel (field 9) with a bare model_id; the
// working reference sends them as ModelDetails with all three string fields set.
const MD_MODEL_ID = 1; // ModelDetails.model_id
const MD_DISPLAY_MODEL_ID = 3; // ModelDetails.display_model_id
const MD_DISPLAY_NAME = 4; // ModelDetails.display_name
const RMP_ID = 1; // RequestedModel.ModelParameter.id
const RMP_VALUE = 2; // RequestedModel.ModelParameter.value
const ACM_EXEC_CLIENT_MESSAGE = 2; // AgentClientMessage.exec_client_message
const ECM_ID = 1; // ExecClientMessage.id
const ECM_EXEC_ID = 15; // ExecClientMessage.exec_id
const ECM_REQUEST_CONTEXT_RESULT = 10; // ExecClientMessage.request_context_result
const RCR_SUCCESS = 1; // RequestContextResult.success
const RCS_REQUEST_CONTEXT = 1; // RequestContextSuccess.request_context
const ASM_INTERACTION_UPDATE = 1; // AgentServerMessage.interaction_update
const ASM_EXEC_SERVER_MESSAGE = 2; // AgentServerMessage.exec_server_message
const ASM_KV_SERVER_MESSAGE = 4; // AgentServerMessage.kv_server_message
// Cursor sends kv_server_message frames once the model stops generating
// (it saves the assistant turn into a blob). For non-tool-calling chats
// this functions as our end-of-response marker.
const ESM_ID = 1; // ExecServerMessage.id
const ESM_EXEC_ID = 15; // ExecServerMessage.exec_id
const ESM_REQUEST_CONTEXT_ARGS = 10; // ExecServerMessage.request_context_args
const IU_TEXT_DELTA = 1; // InteractionUpdate.text_delta
const IU_THINKING_DELTA = 4; // InteractionUpdate.thinking_delta
const IU_THINKING_COMPLETED = 5;
const IU_TOOL_CALL_STARTED = 2;
const IU_TOOL_CALL_COMPLETED = 3;
const IU_TOKEN_DELTA = 8;
const IU_HEARTBEAT = 13;
const IU_TURN_ENDED = 14;
const TDU_TEXT = 1; // TextDeltaUpdate.text
// ─── Phase 1+: tool-use field numbers ──────────────────────────────────────
// Field numbers in result-message oneof discriminators (RES_*) are best-known
// values; verified against wire-tap captures during integration testing.
const ACM_KV_CLIENT_MESSAGE = 3; // AgentClientMessage.kv_client_message
// CSS_ROOT_PROMPT and CSS_TURNS already declared above (lines 34-35)
// CSS_TURNS_OLD = 2 is deprecated; CSS_TURNS = 8 is current.
// ExecClientMessage payload variants (mirror ESM_*)
const ECM_SHELL_RESULT = 2;
const ECM_WRITE_RESULT = 3;
const ECM_DELETE_RESULT = 4;
const ECM_GREP_RESULT = 5;
const ECM_READ_RESULT = 7;
const ECM_LS_RESULT = 8;
const ECM_DIAGNOSTICS_RESULT = 9;
const ECM_MCP_RESULT = 11;
const ECM_BACKGROUND_SHELL_SPAWN_RES = 16;
const ECM_FETCH_RESULT = 20;
const ECM_WRITE_SHELL_STDIN_RESULT = 23;
// ExecServerMessage variant tags (used by exec router in Phase 2)
const ESM_SHELL_ARGS = 2;
const ESM_WRITE_ARGS = 3;
const ESM_DELETE_ARGS = 4;
const ESM_GREP_ARGS = 5;
const ESM_READ_ARGS = 7;
const ESM_LS_ARGS = 8;
const ESM_DIAGNOSTICS_ARGS = 9;
const ESM_MCP_ARGS = 11;
const ESM_SHELL_STREAM_ARGS = 14;
const ESM_BACKGROUND_SHELL_SPAWN = 16;
const ESM_FETCH_ARGS = 20;
const ESM_WRITE_SHELL_STDIN_ARGS = 23;
// Args sub-message field numbers (path and shell variants)
const ARG_PATH = 1; // ReadArgs.path / WriteArgs.path / DeleteArgs.path / LsArgs.path
const ARG_SHELL_COMMAND = 1; // ShellArgs.command
const ARG_SHELL_WORKING_DIR = 2; // ShellArgs.working_directory
const ARG_SHELL_TIMEOUT = 3; // ShellArgs.timeout
const ARG_SHELL_IS_BACKGROUND = 11; // ShellArgs.is_background
const ARG_SHELL_HARD_TIMEOUT = 14; // ShellArgs.hard_timeout
const ARG_FETCH_URL = 1; // FetchArgs.url
// KvServerMessage / KvClientMessage
const KSM_ID = 1;
const KSM_GET_BLOB_ARGS = 2;
const KSM_SET_BLOB_ARGS = 3;
// Field 4 of KvServerMessage is an opaque request-correlation/metadata
// envelope — observed in real wire captures. The exact schema isn't
// public; we capture its raw bytes and echo them back in our reply
// so cursor can match request to response.
const KSM_REQUEST_METADATA = 4;
const KCM_ID = 1;
const KCM_GET_BLOB_RESULT = 2;
const KCM_SET_BLOB_RESULT = 3;
const KCM_REQUEST_METADATA = 4;
// GetBlobArgs / GetBlobResult / SetBlobArgs
const GBA_BLOB_ID = 1; // GetBlobArgs.blob_id (bytes)
const SBA_BLOB_ID = 1; // SetBlobArgs.blob_id (bytes)
const SBA_BLOB_DATA = 2; // SetBlobArgs.blob_data (bytes)
const GBR_BLOB_DATA = 1; // GetBlobResult.blob_data (bytes) — verified by wire test (cursor parses field 1 as JSON)
// Rejection sub-messages (path-based: read/write/delete/ls)
const REJ_PATH = 1;
const REJ_REASON = 2;
// ShellRejected (command + working_dir + reason)
const SREJ_COMMAND = 1;
const SREJ_WORKING_DIR = 2;
const SREJ_REASON = 3;
// Generic error sub-messages
const ERR_MESSAGE = 1; // GrepError.error / WriteShellStdinError.error
const FERR_URL = 1; // FetchError.url
const FERR_ERROR = 2; // FetchError.error
// Result-message variant discriminators (oneof). field 1 = success/accepted,
// field 2 = rejected/error. Matches existing RCR_SUCCESS=1 pattern.
const RES_REJECTED = 2; // rejected variant for read/write/delete/ls/shell/bg_shell
// McpToolDefinition
const MTD_NAME = 1;
const MTD_DESCRIPTION = 2;
const MTD_INPUT_SCHEMA = 3;
const MTD_PROVIDER_IDENTIFIER = 4;
const MTD_TOOL_NAME = 5;
// McpArgs (used by Phase 5 decoder)
const MCA_NAME = 1;
const MCA_ARGS = 2; // map<string, bytes>
const MCA_TOOL_CALL_ID = 3;
const MCA_PROVIDER_IDENTIFIER = 4;
const MCA_TOOL_NAME = 5;
// McpResult variants
const MCR_SUCCESS = 1;
const MCR_ERROR = 2;
const MCS_CONTENT = 1; // McpSuccess.content (repeated McpToolResultContentItem)
const MCS_IS_ERROR = 2;
const MCC_TEXT = 1; // McpToolResultContentItem.text (oneof) -> McpTextContent
const MTC_TEXT = 1; // McpTextContent.text
// google.protobuf.Value (well-known type)
const VAL_NULL = 1;
const VAL_NUMBER = 2;
const VAL_STRING = 3;
const VAL_BOOL = 4;
const VAL_STRUCT = 5;
const VAL_LIST = 6;
const STRUCT_FIELDS = 1; // Struct.fields = map<string, Value>
const LIST_VALUES = 1; // ListValue.values = repeated Value
// proto3 map<K,V> serializes as repeated FieldsEntry { key=1, value=2 }
const MAP_KEY = 1;
const MAP_VALUE = 2;
// ─── Connect-RPC framing ───────────────────────────────────────────────────
const FLAG_NONE = 0x00;
const FLAG_GZIP = 0x01;
function wrapConnectFrame(payload, compressed = false) {
    const data = compressed ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$zlib__$5b$external$5d$__$28$node$3a$zlib$2c$__cjs$29$__["default"].gzipSync(payload) : payload;
    const header = Buffer.alloc(5);
    header[0] = compressed ? FLAG_GZIP : FLAG_NONE;
    header.writeUInt32BE(data.length, 1);
    return Buffer.concat([
        header,
        data
    ]);
}
function* iterateConnectFrames(stream) {
    let pos = 0;
    while(pos + 5 <= stream.length){
        const flags = stream[pos];
        const length = stream.readUInt32BE(pos + 1);
        if (pos + 5 + length > stream.length) return;
        const raw = stream.subarray(pos + 5, pos + 5 + length);
        const payload = flags & FLAG_GZIP ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$zlib__$5b$external$5d$__$28$node$3a$zlib$2c$__cjs$29$__["default"].gunzipSync(raw) : raw;
        yield {
            flags,
            payload
        };
        pos += 5 + length;
    }
}
// ─── Model id translation ──────────────────────────────────────────────────
/**
 * Canonicalize common spelling variants of cursor's composer model ids to the
 * exact ids cursor's server accepts. Without this, an off-by-a-character id
 * (composer-2-5, composer-2.5-sdk, composer-latest, or an empty model) reaches
 * cursor verbatim and is rejected. Only these known-equivalent spellings are
 * remapped (case-insensitively); every other id — including the canonical
 * composer-2.5/composer-2.5-fast and all claude, gpt, and gemini ids — passes
 * through unchanged, so existing behavior is preserved exactly.
 */ const CURSOR_MODEL_ALIASES = {
    "": "composer-2.5",
    "composer-2-5": "composer-2.5",
    "composer-2.5-sdk": "composer-2.5",
    "composer-latest": "composer-2.5",
    "composer-2-5-fast": "composer-2.5-fast",
    "composer-2.5-sdk-fast": "composer-2.5-fast",
    "composer-latest-fast": "composer-2.5-fast"
};
function normalizeCursorModelId(modelId) {
    const id = (modelId ?? "").trim();
    const alias = CURSOR_MODEL_ALIASES[id.toLowerCase()];
    return alias ?? id;
}
// #7289: pinned Claude/GPT model ids carry an effort/reasoning suffix
// (e.g. "claude-opus-4-8-high", "gpt-5.5-high"). cursor's server has no route
// for the suffixed id — it only accepts the base id plus an out-of-band
// ModelParameter. Ground truth captured from the real cursor-agent client:
// Claude ids surface the suffix as {id:"effort", value:<suffix>}, GPT ids as
// {id:"reasoning", value:<suffix>}. "-fast"/"-thinking" are separate toggles
// (already handled elsewhere / not covered by this suffix set) and must not
// be misread as an effort value.
const CURSOR_EFFORT_SUFFIXES = [
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
];
/**
 * If `normalized` starts with `prefix` and ends with one of the known effort
 * suffixes, split it into the base model id plus a `{id: paramId, value}`
 * ModelParameter. Returns null when no known suffix matches, leaving the id
 * untouched (e.g. "claude-2.5" with no suffix, or an unrecognized tail).
 */ function splitCursorEffortSuffix(normalized, prefix, paramId) {
    if (!normalized.startsWith(prefix)) {
        return null;
    }
    for (const suffix of CURSOR_EFFORT_SUFFIXES){
        const marker = `-${suffix}`;
        if (normalized.endsWith(marker) && normalized.length > prefix.length + marker.length) {
            return {
                modelId: normalized.slice(0, -marker.length),
                parameters: [
                    {
                        id: paramId,
                        value: suffix
                    }
                ]
            };
        }
    }
    return null;
}
function resolveRequestedModel(modelId) {
    const normalized = normalizeCursorModelId(modelId);
    if (normalized === "auto") {
        return {
            modelId: "default",
            parameters: []
        };
    }
    // Strip the "-fast" suffix and surface it as a parameter — only the composer
    // family observably needs this split today, but the protocol field is generic.
    if (normalized.startsWith("composer-") && normalized.endsWith("-fast")) {
        return {
            modelId: normalized.slice(0, -"-fast".length),
            parameters: [
                {
                    id: "fast",
                    value: "true"
                }
            ]
        };
    }
    const claudeSplit = splitCursorEffortSuffix(normalized, "claude-", "effort");
    if (claudeSplit) {
        return claudeSplit;
    }
    const gptSplit = splitCursorEffortSuffix(normalized, "gpt-", "reasoning");
    if (gptSplit) {
        return gptSplit;
    }
    return {
        modelId: normalized,
        parameters: []
    };
}
function encodeSelectedImageBody(img) {
    const parts = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(SI_UUID, img.uuid)
    ];
    if (typeof img.width === "number" && typeof img.height === "number" && Number.isFinite(img.width) && Number.isFinite(img.height) && img.width > 0 && img.height > 0) {
        parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(SI_DIMENSION, [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeUInt32Field"])(DIM_WIDTH, Math.floor(img.width)),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeUInt32Field"])(DIM_HEIGHT, Math.floor(img.height))
        ]));
    }
    if (img.mimeType) {
        parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(SI_MIME_TYPE, img.mimeType));
    }
    // data_or_blob_id oneof = data (inline bytes) — field 8, written last to
    // keep ascending field order.
    parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBytes"])(SI_DATA, img.data));
    return Buffer.concat(parts);
}
function openAIToolsToMcpDefs(tools) {
    return tools.map((t)=>{
        const params = t.function?.parameters ?? {
            type: "object",
            properties: {}
        };
        return {
            name: t.function.name,
            description: t.function.description ?? "",
            inputSchemaBytes: jsonSchemaToProtobufValue(params),
            providerIdentifier: "omniroute",
            toolName: t.function.name
        };
    });
}
function encodeAgentRunRequest(input) {
    const conversationId = input.conversationId || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID();
    const messageId = input.messageId || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID();
    const { modelId, parameters } = resolveRequestedModel(input.modelId);
    // UserMessage { text, message_id, selected_context, mode=1 }.
    // selected_context is normally an empty placeholder (required by the server
    // even when empty — see below), but when the turn carries vision input we
    // populate its selected_images[] with the inline-encoded images. The
    // empty-images path produces byte-identical output to the text-only request.
    const selectedContextParts = [];
    if (input.images && input.images.length > 0) {
        for (const img of input.images){
            selectedContextParts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(SC_SELECTED_IMAGES, [
                encodeSelectedImageBody(img)
            ]));
        }
    }
    // The empty selected_context placeholder and mode=1 match cursor-agent's
    // wire format; without them the server accepts the request but never
    // streams a response.
    const userMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(UMA_USER_MESSAGE, [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(UM_TEXT, input.userText),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(UM_MESSAGE_ID, messageId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(UM_SELECTED_CONTEXT, selectedContextParts),
        Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeTag"])(UM_MODE, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeVarint"])(1)
        ])
    ]);
    // UserMessageAction { user_message }
    const userMessageAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(CA_USER_MESSAGE_ACTION, [
        userMessage
    ]);
    // ConversationAction { user_message_action }
    const action = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ARR_ACTION, [
        userMessageAction
    ]);
    // ConversationStateStructure. When a system prompt is present, hash it to
    // a sha256 blob id and reference the blob from root_prompt_messages_json;
    // the server requests the blob over the KV channel during the turn.
    const cssParts = [];
    if (input.systemPrompt && input.blobStore) {
        const systemJson = JSON.stringify({
            role: "system",
            content: input.systemPrompt
        });
        const blobBytes = Buffer.from(systemJson, "utf8");
        const blobId = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(blobBytes).digest();
        input.blobStore.set(blobId.toString("hex"), blobBytes);
        cssParts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBytes"])(CSS_ROOT_PROMPT, blobId));
    }
    const conversationState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ARR_CONVERSATION_STATE, cssParts);
    // RequestedModel { model_id, [parameters...] }
    const rmParts = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(RM_MODEL_ID, modelId)
    ];
    for (const param of parameters){
        rmParts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RM_PARAMETERS, [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(RMP_ID, param.id),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(RMP_VALUE, param.value)
        ]));
    }
    const requestedModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ARR_REQUESTED_MODEL, rmParts);
    // ModelDetails { model_id, display_model_id, display_name } — all set to the resolved
    // model id. #3714: RequestedModel (field 9) alone resolves server-routed ids
    // (auto → default, composer-*) but pinned Claude/GPT *thinking* variants returned an
    // empty turn without this envelope. cursor-agent's working wire format sends both, so
    // we keep RequestedModel (preserves the -fast `parameters` it carries) and add this.
    const modelDetails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ARR_MODEL_DETAILS, [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MD_MODEL_ID, modelId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MD_DISPLAY_MODEL_ID, modelId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MD_DISPLAY_NAME, modelId)
    ]);
    // mcp_tools: McpTools envelope at field 4 of AgentRunRequest. Each tool
    // is packed inside the envelope at field 1 (repeated McpToolDefinition).
    // Empty placeholder for non-tool calls (the field is observably required
    // even when empty — cursor errors if it's omitted entirely).
    const mcpToolDefs = input.tools ? openAIToolsToMcpDefs(input.tools) : [];
    const mcpToolsBlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ARR_MCP_TOOLS, mcpToolDefs.map((def)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ARR_MCP_TOOLS_INNER, [
            encodeMcpToolDefinitionBody(def)
        ])));
    // AgentRunRequest. Field order mirrors cursor-agent's wire format; empty
    // placeholders for mcp_tools and request_id are observably required.
    const agentRunRequest = [
        conversationState,
        action,
        modelDetails,
        mcpToolsBlock,
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ARR_CONVERSATION_ID, conversationId),
        requestedModel,
        Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeTag"])(ARR_UNKNOWN_12, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeVarint"])(0)
        ]),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ARR_REQUEST_ID, conversationId)
    ];
    // AgentClientMessage { run_request }
    const acm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ACM_RUN_REQUEST, agentRunRequest);
    return acm;
}
// McpTools.tool field number — repeated McpToolDefinition entries go under
// field 1 of the McpTools wrapper (which itself is field 4 of AgentRunRequest).
const ARR_MCP_TOOLS_INNER = 1;
function buildAgentRequestBody(input) {
    return wrapConnectFrame(encodeAgentRunRequest(input));
}
function decodeAgentServerMessage(payload) {
    const out = [];
    for (const top of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(payload)){
        if (top.fieldNumber === ASM_KV_SERVER_MESSAGE && top.wireType === 2) {
            out.push({
                kind: "kv_server_message"
            });
            continue;
        }
        if (top.fieldNumber !== ASM_INTERACTION_UPDATE || top.wireType !== 2) continue;
        for (const update of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(top.bytes)){
            if (update.wireType !== 2 && update.wireType !== 0) continue;
            switch(update.fieldNumber){
                case IU_TEXT_DELTA:
                    if (update.wireType === 2) {
                        out.push({
                            kind: "text",
                            text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(update.bytes, TDU_TEXT)
                        });
                    }
                    break;
                case IU_THINKING_DELTA:
                    if (update.wireType === 2) {
                        out.push({
                            kind: "thinking",
                            text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(update.bytes, TDU_TEXT)
                        });
                    }
                    break;
                case IU_THINKING_COMPLETED:
                    out.push({
                        kind: "thinking_complete"
                    });
                    break;
                case IU_TOOL_CALL_STARTED:
                    out.push({
                        kind: "tool_call_started"
                    });
                    break;
                case IU_TOOL_CALL_COMPLETED:
                    if (update.wireType === 2) {
                        const todoWrite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$nativeTodoWrite$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeNativeTodoWriteCompletion"])(update.bytes);
                        if (todoWrite) out.push(todoWrite);
                    }
                    out.push({
                        kind: "tool_call_completed"
                    });
                    break;
                case IU_TOKEN_DELTA:
                    if (update.wireType === 2) {
                        out.push({
                            kind: "token_delta",
                            tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarintField"])(update.bytes, 1)
                        });
                    }
                    break;
                case IU_HEARTBEAT:
                    out.push({
                        kind: "heartbeat"
                    });
                    break;
                case IU_TURN_ENDED:
                    out.push({
                        kind: "turn_ended"
                    });
                    break;
                default:
                    out.push({
                        kind: "unknown",
                        field: update.fieldNumber
                    });
            }
        }
    }
    return out;
}
function decodeExecRequestContext(payload) {
    const event = decodeExecServerEvent(payload);
    if (event && event.kind === "exec_request_context") {
        return {
            id: event.execMsgId,
            execId: event.execId
        };
    }
    return null;
}
function decodeKvServerEvent(payload) {
    for (const top of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(payload)){
        if (top.fieldNumber !== ASM_KV_SERVER_MESSAGE || top.wireType !== 2) continue;
        let kvId = 0;
        let getBlobArgs = null;
        let setBlobArgs = null;
        let requestMetadata = null;
        for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(top.bytes)){
            if (f.fieldNumber === KSM_ID && f.wireType === 0) {
                kvId = Number(f.varint);
            } else if (f.fieldNumber === KSM_GET_BLOB_ARGS && f.wireType === 2) {
                getBlobArgs = f.bytes;
            } else if (f.fieldNumber === KSM_SET_BLOB_ARGS && f.wireType === 2) {
                setBlobArgs = f.bytes;
            } else if (f.fieldNumber === KSM_REQUEST_METADATA && f.wireType === 2) {
                requestMetadata = f.bytes;
            }
        }
        if (getBlobArgs) {
            // GetBlobArgs { blob_id (1): bytes }
            let blobId = Buffer.alloc(0);
            for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(getBlobArgs)){
                if (f.fieldNumber === GBA_BLOB_ID && f.wireType === 2) {
                    blobId = f.bytes;
                }
            }
            return {
                kind: "kv_get_blob",
                kvId,
                blobId,
                requestMetadata
            };
        }
        if (setBlobArgs) {
            // SetBlobArgs { blob_id (1): bytes, blob_data (2): bytes }
            let blobId = Buffer.alloc(0);
            let blobData = Buffer.alloc(0);
            for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(setBlobArgs)){
                if (f.fieldNumber === SBA_BLOB_ID && f.wireType === 2) {
                    blobId = f.bytes;
                } else if (f.fieldNumber === SBA_BLOB_DATA && f.wireType === 2) {
                    blobData = f.bytes;
                }
            }
            return {
                kind: "kv_set_blob",
                kvId,
                blobId,
                blobData,
                requestMetadata
            };
        }
    }
    return null;
}
function decodeShellArgs(payload) {
    const decoded = {
        command: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(payload, ARG_SHELL_COMMAND),
        workingDir: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(payload, ARG_SHELL_WORKING_DIR),
        timeout: 0,
        isBackground: false,
        hardTimeout: 0
    };
    for (const field of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(payload)){
        if (field.wireType !== 0) continue;
        if (field.fieldNumber === ARG_SHELL_TIMEOUT) decoded.timeout = Number(field.varint);
        else if (field.fieldNumber === ARG_SHELL_IS_BACKGROUND) {
            decoded.isBackground = field.varint !== 0n;
        } else if (field.fieldNumber === ARG_SHELL_HARD_TIMEOUT) {
            decoded.hardTimeout = Number(field.varint);
        }
    }
    return decoded;
}
function decodeExecServerEvent(payload) {
    for (const top of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(payload)){
        if (top.fieldNumber !== ASM_EXEC_SERVER_MESSAGE || top.wireType !== 2) continue;
        let execMsgId = 0;
        let execId = "";
        let variantField = 0;
        let variantBytes = null;
        for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(top.bytes)){
            if (f.fieldNumber === ESM_ID && f.wireType === 0) {
                execMsgId = Number(f.varint);
            } else if (f.fieldNumber === ESM_EXEC_ID && f.wireType === 2) {
                execId = f.bytes.toString("utf8");
            } else if (f.wireType === 2) {
                // Any other LEN field is the variant payload. Take the first one we
                // see — variants don't co-occur in a well-formed message.
                if (variantField === 0) {
                    variantField = f.fieldNumber;
                    variantBytes = f.bytes;
                }
            }
        }
        if (variantBytes === null) continue;
        switch(variantField){
            case ESM_REQUEST_CONTEXT_ARGS:
                return {
                    kind: "exec_request_context",
                    execMsgId,
                    execId
                };
            case ESM_READ_ARGS:
                return {
                    kind: "exec_read",
                    execMsgId,
                    execId,
                    path: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(variantBytes, ARG_PATH)
                };
            case ESM_WRITE_ARGS:
                return {
                    kind: "exec_write",
                    execMsgId,
                    execId,
                    path: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(variantBytes, ARG_PATH)
                };
            case ESM_DELETE_ARGS:
                return {
                    kind: "exec_delete",
                    execMsgId,
                    execId,
                    path: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(variantBytes, ARG_PATH)
                };
            case ESM_LS_ARGS:
                return {
                    kind: "exec_ls",
                    execMsgId,
                    execId,
                    path: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(variantBytes, ARG_PATH)
                };
            case ESM_GREP_ARGS:
                return {
                    kind: "exec_grep",
                    execMsgId,
                    execId
                };
            case ESM_DIAGNOSTICS_ARGS:
                return {
                    kind: "exec_diagnostics",
                    execMsgId,
                    execId
                };
            case ESM_SHELL_ARGS:
                {
                    const shell = decodeShellArgs(variantBytes);
                    return {
                        kind: "exec_shell",
                        execMsgId,
                        execId,
                        ...shell
                    };
                }
            case ESM_SHELL_STREAM_ARGS:
                {
                    const shell = decodeShellArgs(variantBytes);
                    return {
                        kind: "exec_shell_stream",
                        execMsgId,
                        execId,
                        ...shell
                    };
                }
            case ESM_BACKGROUND_SHELL_SPAWN:
                {
                    const shell = decodeShellArgs(variantBytes);
                    return {
                        kind: "exec_bg_shell",
                        execMsgId,
                        execId,
                        ...shell
                    };
                }
            case ESM_FETCH_ARGS:
                return {
                    kind: "exec_fetch",
                    execMsgId,
                    execId,
                    url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeStringField"])(variantBytes, ARG_FETCH_URL)
                };
            case ESM_WRITE_SHELL_STDIN_ARGS:
                return {
                    kind: "exec_write_shell_stdin",
                    execMsgId,
                    execId
                };
            case ESM_MCP_ARGS:
                {
                    // McpArgs.args is map<string, bytes>; each value is a protobuf-
                    // encoded google.protobuf.Value. Decode keys and value-bytes here,
                    // then convert each Value to its JSON shape.
                    let toolName = "";
                    let toolCallId = "";
                    const args = {};
                    for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(variantBytes)){
                        if (f.wireType !== 2) continue;
                        if (f.fieldNumber === MCA_TOOL_NAME) {
                            toolName = f.bytes.toString("utf8");
                        } else if (f.fieldNumber === MCA_NAME && !toolName) {
                            // tool_name (5) takes precedence; fall back to name (1)
                            toolName = f.bytes.toString("utf8");
                        } else if (f.fieldNumber === MCA_TOOL_CALL_ID) {
                            toolCallId = f.bytes.toString("utf8");
                        } else if (f.fieldNumber === MCA_ARGS) {
                            // FieldsEntry { key (1): string, value (2): bytes }
                            let key = "";
                            let valueBytes = null;
                            for (const entry of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(f.bytes)){
                                if (entry.fieldNumber === MAP_KEY && entry.wireType === 2) {
                                    key = entry.bytes.toString("utf8");
                                } else if (entry.fieldNumber === MAP_VALUE && entry.wireType === 2) {
                                    valueBytes = entry.bytes;
                                }
                            }
                            if (key && valueBytes !== null) {
                                args[key] = decodeProtobufValue(valueBytes);
                            }
                        }
                    }
                    return {
                        kind: "exec_mcp",
                        execMsgId,
                        execId,
                        toolName,
                        toolCallId,
                        args
                    };
                }
            default:
                // Unknown variant — return null so caller can keep buffering.
                return null;
        }
    }
    return null;
}
function encodeRequestContextResponse(id, execId, tools) {
    const rcParts = [];
    if (tools && tools.length > 0) {
        for (const tool of tools){
            rcParts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RCS_TOOLS, [
                encodeMcpToolDefinitionBody(tool)
            ]));
        }
    }
    const requestContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RCS_REQUEST_CONTEXT, rcParts);
    const success = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RCR_SUCCESS, [
        requestContext
    ]);
    const ecm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ACM_EXEC_CLIENT_MESSAGE, [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeUInt32Field"])(ECM_ID, id),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ECM_EXEC_ID, execId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ECM_REQUEST_CONTEXT_RESULT, [
            success
        ])
    ]);
    return wrapConnectFrame(ecm);
}
// RequestContext.tools field number — multiple tool defs are repeated within
// the inner RequestContext message.
const RCS_TOOLS = 2;
// ─── ExecClientMessage wrapper ──────────────────────────────────────────────
/**
 * Build an ExecClientMessage frame:
 *   AgentClientMessage {
 *     exec_client_message (2): ExecClientMessage {
 *       id (1): execMsgId,
 *       exec_id (15): execId,
 *       <resultFieldNumber>: resultPayload,
 *     }
 *   }
 * Connect-RPC framed, ready to write to the h2 stream.
 *
 * `exec_id` is force-set even when empty (matches kaitranntt's behavior).
 */ function wrapExecClientMessage(execMsgId, execId, resultFieldNumber, resultPayload) {
    const ecm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ACM_EXEC_CLIENT_MESSAGE, [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeUInt32Field"])(ECM_ID, execMsgId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ECM_EXEC_ID, execId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(resultFieldNumber, [
            resultPayload
        ])
    ]);
    return wrapConnectFrame(ecm);
}
// ─── Phase 1: built-in tool rejection encoders ─────────────────────────────
// Cursor's model invokes built-in tools (read/write/shell/grep/etc.) which we
// can't safely run inside the proxy. We respond with a typed rejection so the
// model continues without that tool — matches kaitranntt's stance and avoids
// stalling the h2 stream.
function encodePathRejection(path, reason) {
    return Buffer.concat([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(REJ_PATH, path),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(REJ_REASON, reason)
    ]);
}
function encodeShellRejection(command, workingDir, reason) {
    return Buffer.concat([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(SREJ_COMMAND, command),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(SREJ_WORKING_DIR, workingDir),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(SREJ_REASON, reason)
    ]);
}
function encodeExecReadRejected(execMsgId, execId, path, reason) {
    const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        encodePathRejection(path, reason)
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_READ_RESULT, rejected);
}
function encodeExecWriteRejected(execMsgId, execId, path, reason) {
    const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        encodePathRejection(path, reason)
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_WRITE_RESULT, rejected);
}
function encodeExecDeleteRejected(execMsgId, execId, path, reason) {
    const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        encodePathRejection(path, reason)
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_DELETE_RESULT, rejected);
}
function encodeExecLsRejected(execMsgId, execId, path, reason) {
    const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        encodePathRejection(path, reason)
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_LS_RESULT, rejected);
}
function encodeExecShellRejected(execMsgId, execId, command, workingDir, reason) {
    const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        encodeShellRejection(command, workingDir, reason)
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_SHELL_RESULT, rejected);
}
function encodeExecBackgroundShellSpawnRejected(execMsgId, execId, command, workingDir, reason) {
    const rejected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        encodeShellRejection(command, workingDir, reason)
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_BACKGROUND_SHELL_SPAWN_RES, rejected);
}
function encodeExecGrepError(execMsgId, execId, errMsg) {
    const grepError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ERR_MESSAGE, errMsg);
    const errorVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        grepError
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_GREP_RESULT, errorVariant);
}
function encodeExecFetchError(execMsgId, execId, url, errMsg) {
    const fetchError = Buffer.concat([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(FERR_URL, url),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(FERR_ERROR, errMsg)
    ]);
    const errorVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        fetchError
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_FETCH_RESULT, errorVariant);
}
function encodeExecWriteShellStdinError(execMsgId, execId, errMsg) {
    const stdinError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ERR_MESSAGE, errMsg);
    const errorVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(RES_REJECTED, [
        stdinError
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_WRITE_SHELL_STDIN_RESULT, errorVariant);
}
function encodeExecDiagnosticsResult(execMsgId, execId) {
    // DiagnosticsResult is empty — there's no rejection variant.
    return wrapExecClientMessage(execMsgId, execId, ECM_DIAGNOSTICS_RESULT, Buffer.alloc(0));
}
function encodeExecMcpResult(execMsgId, execId, content, isError) {
    // McpTextContent { text } → McpToolResultContentItem.text
    const textContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(MCC_TEXT, [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MTC_TEXT, content)
    ]);
    const successFields = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(MCS_CONTENT, [
            textContent
        ])
    ];
    if (isError) successFields.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBoolField"])(MCS_IS_ERROR, true));
    const success = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(MCR_SUCCESS, successFields);
    return wrapExecClientMessage(execMsgId, execId, ECM_MCP_RESULT, success);
}
function encodeExecMcpError(execMsgId, execId, errMsg) {
    const mcpError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(ERR_MESSAGE, errMsg);
    const errorVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(MCR_ERROR, [
        mcpError
    ]);
    return wrapExecClientMessage(execMsgId, execId, ECM_MCP_RESULT, errorVariant);
}
function encodeKvGetBlobResult(kvId, blobData, requestMetadata = null) {
    const getBlobResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBytes"])(GBR_BLOB_DATA, blobData);
    const parts = [];
    if (kvId !== 0) parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeUInt32Field"])(KCM_ID, kvId));
    parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(KCM_GET_BLOB_RESULT, [
        getBlobResult
    ]));
    if (requestMetadata && requestMetadata.length > 0) {
        parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBytes"])(KCM_REQUEST_METADATA, requestMetadata));
    }
    const kcm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ACM_KV_CLIENT_MESSAGE, parts);
    return wrapConnectFrame(kcm);
}
function encodeKvSetBlobResult(kvId, requestMetadata = null) {
    const parts = [];
    if (kvId !== 0) parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeUInt32Field"])(KCM_ID, kvId));
    parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(KCM_SET_BLOB_RESULT, []));
    if (requestMetadata && requestMetadata.length > 0) {
        parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBytes"])(KCM_REQUEST_METADATA, requestMetadata));
    }
    const kcm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(ACM_KV_CLIENT_MESSAGE, parts);
    return wrapConnectFrame(kcm);
}
function encodeMcpToolDefinitionBody(def) {
    const parts = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MTD_NAME, def.name),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MTD_DESCRIPTION, def.description),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeBytes"])(MTD_INPUT_SCHEMA, def.inputSchemaBytes)
    ];
    if (def.providerIdentifier) {
        parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MTD_PROVIDER_IDENTIFIER, def.providerIdentifier));
    }
    if (def.toolName) {
        parts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MTD_TOOL_NAME, def.toolName));
    }
    return Buffer.concat(parts);
}
function jsonSchemaToProtobufValue(json) {
    return encodeProtobufValue(json);
}
function decodeProtobufValue(buf) {
    let pos = 0;
    while(pos < buf.length){
        const [t, np] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
        pos = np;
        const fieldNumber = Number(t >> 3n);
        const wireType = Number(t & 0x7n);
        switch(fieldNumber){
            case VAL_NULL:
                {
                    if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]) {
                        [, pos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                    }
                    return null;
                }
            case VAL_NUMBER:
                {
                    if (wireType === 1 && pos + 8 <= buf.length) {
                        const value = buf.readDoubleLE(pos);
                        pos += 8;
                        return value;
                    }
                    return 0;
                }
            case VAL_STRING:
                {
                    if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_LEN"]) {
                        const [len, np2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                        pos = np2;
                        const lenN = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["checkedLen"])(len, pos, buf);
                        const value = buf.subarray(pos, pos + lenN).toString("utf8");
                        pos += lenN;
                        return value;
                    }
                    return "";
                }
            case VAL_BOOL:
                {
                    if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]) {
                        const [val, np2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                        pos = np2;
                        return val !== 0n;
                    }
                    return false;
                }
            case VAL_STRUCT:
                {
                    if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_LEN"]) {
                        const [len, np2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                        pos = np2;
                        const lenN = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["checkedLen"])(len, pos, buf);
                        const inner = buf.subarray(pos, pos + lenN);
                        pos += lenN;
                        return decodeProtobufStruct(inner);
                    }
                    return {};
                }
            case VAL_LIST:
                {
                    if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_LEN"]) {
                        const [len, np2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                        pos = np2;
                        const lenN = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["checkedLen"])(len, pos, buf);
                        const inner = buf.subarray(pos, pos + lenN);
                        pos += lenN;
                        return decodeProtobufList(inner);
                    }
                    return [];
                }
            default:
                // Skip unknown field
                if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]) {
                    [, pos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                } else if (wireType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_LEN"]) {
                    const [len, np2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeVarint"])(buf, pos);
                    pos = np2;
                    pos += Number(len);
                } else if (wireType === 1) {
                    pos += 8;
                } else if (wireType === 5) {
                    pos += 4;
                }
        }
    }
    return null;
}
function decodeProtobufStruct(buf) {
    const result = {};
    for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(buf)){
        if (f.fieldNumber === STRUCT_FIELDS && f.wireType === 2) {
            let key = "";
            let valueBytes = null;
            for (const entry of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(f.bytes)){
                if (entry.fieldNumber === MAP_KEY && entry.wireType === 2) {
                    key = entry.bytes.toString("utf8");
                } else if (entry.fieldNumber === MAP_VALUE && entry.wireType === 2) {
                    valueBytes = entry.bytes;
                }
            }
            if (key && valueBytes) {
                result[key] = decodeProtobufValue(valueBytes);
            }
        }
    }
    return result;
}
function decodeProtobufList(buf) {
    const result = [];
    for (const f of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decodeFields"])(buf)){
        if (f.fieldNumber === LIST_VALUES && f.wireType === 2) {
            result.push(decodeProtobufValue(f.bytes));
        }
    }
    return result;
}
function encodeProtobufValue(value) {
    if (value === null || value === undefined) {
        // null_value (1) = NULL_VALUE = 0 (enum)
        return Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeTag"])(VAL_NULL, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeVarint"])(0)
        ]);
    }
    if (typeof value === "number") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeDoubleField"])(VAL_NUMBER, value);
    }
    if (typeof value === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(VAL_STRING, value);
    }
    if (typeof value === "boolean") {
        return Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeTag"])(VAL_BOOL, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeVarint"])(value ? 1 : 0)
        ]);
    }
    if (Array.isArray(value)) {
        // ListValue { values: repeated Value }
        const listParts = value.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(LIST_VALUES, [
                encodeProtobufValue(v)
            ]));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(VAL_LIST, listParts);
    }
    if (typeof value === "object") {
        // Struct { fields: map<string, Value> }
        const obj = value;
        const structParts = [];
        for (const [k, v] of Object.entries(obj)){
            const entry = Buffer.concat([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeString"])(MAP_KEY, k),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(MAP_VALUE, [
                    encodeProtobufValue(v)
                ])
            ]);
            structParts.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(STRUCT_FIELDS, [
                entry
            ]));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeMessage"])(VAL_STRUCT, structParts);
    }
    // Fallback: encode as null
    return Buffer.concat([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeTag"])(VAL_NULL, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WT_VARINT"]),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2f$wire$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeVarint"])(0)
    ]);
}
function flattenMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return "";
    const partsToText = (content)=>{
        if (typeof content === "string") return content;
        if (content == null) return "";
        if (!Array.isArray(content)) return "";
        return content.map((p)=>typeof p?.text === "string" ? p.text : "").filter(Boolean).join("\n");
    };
    // System instructions go first as a labeled prefix. (The cursor executor
    // routes system messages through the KV blob channel — see Phase 7 — but
    // this branch is kept for non-cursor callers.)
    const systemTexts = messages.filter((m)=>m.role === "system").map((m)=>partsToText(m.content)).filter(Boolean);
    const turn = messages.filter((m)=>m.role !== "system");
    // Single-user-message fast path (no tool_calls, no labels).
    if (turn.length === 1 && turn[0].role === "user" && !turn[0].tool_calls) {
        const userText = partsToText(turn[0].content);
        return systemTexts.length > 0 ? `${systemTexts.join("\n\n")}\n\n${userText}` : userText;
    }
    // Multi-turn / tool-using format. Each message is labeled. Tool calls
    // and tool results get their own labeled lines.
    const lines = [];
    for (const m of turn){
        const text = partsToText(m.content);
        if (m.role === "user") {
            if (text) lines.push(`User: ${text}`);
        } else if (m.role === "assistant") {
            if (text) lines.push(`Assistant: ${text}`);
            if (Array.isArray(m.tool_calls)) {
                for (const tc of m.tool_calls){
                    const args = tc.function?.arguments ?? "";
                    lines.push(`Assistant called tool ${tc.function?.name ?? "(unknown)"} ` + `(${tc.id}) with arguments: ${args}`);
                }
            }
        } else if (m.role === "tool") {
            const callId = m.tool_call_id ?? "(unknown)";
            lines.push(`Tool result (${callId}): ${text}`);
        } else {
            if (text) lines.push(`${m.role}: ${text}`);
        }
    }
    const labelled = lines.join("\n\n");
    return systemTexts.length > 0 ? `${systemTexts.join("\n\n")}\n\n${labelled}` : labelled;
}
}),
"[project]/open-sse/utils/cursorImages.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CursorImageError",
    ()=>CursorImageError,
    "MAX_CURSOR_IMAGES",
    ()=>MAX_CURSOR_IMAGES,
    "MAX_CURSOR_IMAGE_BYTES",
    ()=>MAX_CURSOR_IMAGE_BYTES,
    "assertResolvedAddressesPublic",
    ()=>assertResolvedAddressesPublic,
    "extractImageUrls",
    ()=>extractImageUrls,
    "resolveCursorImages",
    ()=>resolveCursorImages
]);
/**
 * Image resolution + security for Cursor vision input.
 *
 * Turns OpenAI `image_url` parts (base64 `data:` URIs or remote `http(s)`
 * URLs) into decoded bytes ready to inline into a cursor SelectedImage
 * (see ../utils/cursorAgentProtobuf.ts::encodeSelectedImageBody).
 *
 * Security (OmniRoute hard rules):
 *  - SSRF: remote fetches go through the repo's canonical outbound guard
 *    (`parseAndValidatePublicUrl`), which rejects non-http(s) schemes,
 *    embedded credentials, localhost, link-local, private/CGNAT ranges, and
 *    cloud-metadata hostnames. Client-supplied image URLs are always held to
 *    the strict public-only policy (never gated by the private-URL toggle that
 *    admin-configured provider URLs use).
 *  - Size cap: each image must decode to <= 1 MiB (matches composer-api).
 *    Enforced both before base64 decode (cheap pre-check) and while streaming
 *    a remote body (so a hostile server can't stream gigabytes).
 *  - Content type: data URIs and URL responses must be `image/*`.
 *  - Errors throw `CursorImageError` with a clean, path-free message; the
 *    executor routes it through the sanitized 400 path (hard rule #12).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$dns__$5b$external$5d$__$28$node$3a$dns$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:dns [external] (node:dns, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [middleware] (ecmascript)");
;
;
;
;
const MAX_CURSOR_IMAGE_BYTES = 1024 * 1024;
const MAX_CURSOR_IMAGES = 12;
// Wall-clock cap for a single remote image fetch. A malformed env value
// (NaN / non-positive) falls back to the default rather than breaking setTimeout.
const IMAGE_FETCH_TIMEOUT_MS = (()=>{
    const parsed = parseInt(process.env.CURSOR_IMAGE_FETCH_TIMEOUT_MS || "15000", 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 15000;
})();
// Bound on how many redirects fetchImageBytes will follow (each re-validated
// against the SSRF guard before the next hop).
const MAX_IMAGE_REDIRECTS = 3;
class CursorImageError extends Error {
    status;
    constructor(message, status = 400){
        super(message);
        this.name = "CursorImageError";
        this.status = status;
    }
}
function decodeDataUrl(url) {
    // data:[<mediatype>][;base64],<data>
    const comma = url.indexOf(",");
    if (comma < 0) {
        throw new CursorImageError("Image data URL is malformed.");
    }
    const header = url.slice(5, comma); // strip leading "data:"
    const payload = url.slice(comma + 1);
    const isBase64 = /;base64/i.test(header);
    const mimeType = (header.split(";")[0] || "").trim().toLowerCase() || "application/octet-stream";
    if (!mimeType.startsWith("image/")) {
        throw new CursorImageError("Image data URL must have an image/* media type.");
    }
    if (!isBase64) {
        // Non-base64 data URLs (percent-encoded) are not a real image transport;
        // reject rather than guess.
        throw new CursorImageError("Image data URL must be base64-encoded.");
    }
    // Reject on the raw payload length BEFORE the regex/normalize pass, so an
    // arbitrarily large data URL can't burn CPU on the whitespace strip. Base64
    // expands ~4:3, so 2x the byte cap is a safe upper bound on the encoded text.
    if (payload.length > MAX_CURSOR_IMAGE_BYTES * 2) {
        throw new CursorImageError("Image input is too large (max 1 MiB). Resize and retry.");
    }
    const normalized = payload.replace(/\s/g, "");
    // Cheap pre-check: 4 base64 chars -> 3 bytes. Reject obviously oversized
    // payloads before allocating the decode buffer.
    if (Math.floor(normalized.length * 3 / 4) > MAX_CURSOR_IMAGE_BYTES) {
        throw new CursorImageError("Image input is too large (max 1 MiB). Resize and retry.");
    }
    let data;
    try {
        data = Buffer.from(normalized, "base64");
    } catch  {
        throw new CursorImageError("Image data URL contains invalid base64 data.");
    }
    // Buffer.from(base64) silently drops invalid trailing chars; guard against a
    // payload that decoded to nothing despite being non-empty.
    if (normalized.length > 0 && data.length === 0) {
        throw new CursorImageError("Image data URL contains invalid base64 data.");
    }
    return {
        data,
        mimeType
    };
}
// Validate a URL through the SSRF guard, mapping guard errors to clean,
// non-sensitive CursorImageErrors (no URL echoed back).
function validatePublicImageUrl(url) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseAndValidatePublicUrl"])(url);
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OutboundUrlGuardError"]) {
            throw new CursorImageError(err.code === "OUTBOUND_URL_INVALID" ? "Image URL is invalid or uses an unsupported scheme." : "Image URL points to a blocked address.");
        }
        throw new CursorImageError("Image URL is invalid.");
    }
}
function assertResolvedAddressesPublic(addresses) {
    for (const addr of addresses){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isPrivateHost"])(addr)) {
            throw new CursorImageError("Image URL points to a blocked address.");
        }
    }
}
/**
 * Defence-in-depth against DNS-rebinding SSRF: `parseAndValidatePublicUrl`
 * only checks the hostname *string*, so a public-looking host that resolves to
 * a private/metadata IP would otherwise be fetched. Resolve the host and
 * reject if ANY answer is private. IP literals are skipped (already validated
 * by the guard above). This narrows — but doesn't fully eliminate — the
 * TOCTOU window between our resolution and fetch's own; a connection-time IP
 * filter (e.g. ssrf-req-filter) on the shared outbound guard would close it
 * for every caller.
 */ async function assertHostnameResolvesPublic(hostname) {
    const bare = hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(bare)) return; // IP literal — already checked by the URL guard.
    let resolved;
    try {
        resolved = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$dns__$5b$external$5d$__$28$node$3a$dns$2c$__cjs$29$__["default"].promises.lookup(bare, {
            all: true
        });
    } catch  {
        throw new CursorImageError("Image URL host could not be resolved.");
    }
    assertResolvedAddressesPublic(resolved.map((r)=>r.address));
}
async function fetchImageBytes(url) {
    // Follow redirects MANUALLY and re-validate every hop through the SSRF guard.
    // `fetch` follows redirects by default, so validating only the initial URL
    // would let a public host 30x-redirect to a private/link-local address and
    // bypass the guard. Each Location is resolved + re-checked before we fetch it.
    let currentUrl = url;
    for(let hop = 0; hop <= MAX_IMAGE_REDIRECTS; hop++){
        const parsed = validatePublicImageUrl(currentUrl);
        // Resolve + IP-check the host (DNS-rebinding defence) before connecting.
        await assertHostnameResolvesPublic(parsed.hostname);
        const controller = new AbortController();
        const timer = setTimeout(()=>controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(parsed.toString(), {
                method: "GET",
                signal: controller.signal,
                redirect: "manual"
            });
        } catch  {
            clearTimeout(timer);
            throw new CursorImageError("Could not fetch the image URL.");
        }
        try {
            // Manual redirect: resolve Location against the current URL and loop so
            // the next hop is re-validated by the SSRF guard.
            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get("location");
                if (!location) {
                    throw new CursorImageError("Image URL redirect is missing a destination.");
                }
                try {
                    currentUrl = new URL(location, parsed.toString()).toString();
                } catch  {
                    throw new CursorImageError("Image URL redirect destination is invalid.");
                }
                continue;
            }
            if (!response.ok) {
                throw new CursorImageError(`Could not fetch the image URL (status ${response.status}).`);
            }
            const contentType = (response.headers.get("content-type") || "").toLowerCase();
            const mimeType = contentType.split(";")[0].trim();
            if (!mimeType.startsWith("image/")) {
                throw new CursorImageError("Image URL did not return an image content type.");
            }
            // Reject early on an oversized Content-Length, then still cap during read
            // (the header is advisory / may be absent).
            const declaredLen = Number(response.headers.get("content-length") || "0");
            if (Number.isFinite(declaredLen) && declaredLen > MAX_CURSOR_IMAGE_BYTES) {
                throw new CursorImageError("Image input is too large (max 1 MiB). Resize and retry.");
            }
            const data = await readCapped(response, MAX_CURSOR_IMAGE_BYTES);
            return {
                data,
                mimeType
            };
        } finally{
            clearTimeout(timer);
        }
    }
    throw new CursorImageError("Image URL has too many redirects.");
}
/**
 * Read a fetch Response body into a Buffer, aborting as soon as the
 * accumulated size exceeds `cap`. Consumes the body incrementally — as an
 * async iterable (Node Readable streams and Web Streams both support this) or
 * via a web ReadableStream reader — so an oversized body is rejected mid-read
 * rather than fully buffered. The uncapped arrayBuffer() path is only a last
 * resort for exotic body shapes, and is still cap-checked afterwards.
 */ async function readCapped(response, cap) {
    const body = response.body;
    if (!body) {
        return Buffer.alloc(0);
    }
    const chunks = [];
    let total = 0;
    const pushCapped = (chunk)=>{
        total += chunk.byteLength;
        if (total > cap) {
            throw new CursorImageError("Image input is too large (max 1 MiB). Resize and retry.");
        }
        chunks.push(Buffer.from(chunk));
    };
    // Preferred: async iteration (works for Node Readable + Web Streams).
    if (typeof body[Symbol.asyncIterator] === "function") {
        for await (const chunk of body){
            pushCapped(chunk);
        }
        return Buffer.concat(chunks, total);
    }
    // Fallback: web ReadableStream reader.
    if (typeof body.getReader === "function") {
        const reader = body.getReader();
        try {
            for(;;){
                const { done, value } = await reader.read();
                if (done) break;
                if (value) pushCapped(value);
            }
        } finally{
            try {
                await reader.cancel();
            } catch  {
            /* already closed */ }
        }
        return Buffer.concat(chunks, total);
    }
    // Last resort: buffer then cap-check (only exotic non-stream bodies).
    const buf = Buffer.from(await response.arrayBuffer());
    if (buf.length > cap) {
        throw new CursorImageError("Image input is too large (max 1 MiB). Resize and retry.");
    }
    return buf;
}
async function resolveCursorImages(imageUrls) {
    if (imageUrls.length > MAX_CURSOR_IMAGES) {
        throw new CursorImageError(`Too many images in one request (max ${MAX_CURSOR_IMAGES}).`);
    }
    const out = [];
    for (const url of imageUrls){
        if (typeof url !== "string" || !url) {
            throw new CursorImageError("Image URL is missing.");
        }
        // The data: scheme is case-insensitive (RFC 2397); match it that way but
        // pass the original (un-lowercased) url so the base64 payload is preserved.
        const { data, mimeType } = url.toLowerCase().startsWith("data:") ? decodeDataUrl(url) : await fetchImageBytes(url);
        if (!data.length) {
            throw new CursorImageError("Image input is empty.");
        }
        if (data.length > MAX_CURSOR_IMAGE_BYTES) {
            throw new CursorImageError("Image input is too large (max 1 MiB). Resize and retry.");
        }
        out.push({
            data,
            mimeType,
            uuid: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID()
        });
    }
    return out;
}
function extractImageUrls(content) {
    if (!Array.isArray(content)) return [];
    const urls = [];
    for (const part of content){
        if (part && typeof part === "object" && part.type === "image_url") {
            const imageUrl = part.image_url;
            if (typeof imageUrl === "string") {
                urls.push(imageUrl);
            } else if (imageUrl && typeof imageUrl === "object" && typeof imageUrl.url === "string") {
                urls.push(imageUrl.url);
            }
        }
    }
    return urls;
}
}),
"[project]/open-sse/utils/streamPayloadCollector.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildStreamSummaryFromEvents",
    ()=>buildStreamSummaryFromEvents,
    "compactStructuredStreamPayload",
    ()=>compactStructuredStreamPayload,
    "createStructuredSSECollector",
    ()=>createStructuredSSECollector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
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
    if (format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSE) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
    return format;
}
function inferFormatFromEvents(events, fallbackFormat) {
    const normalizedFallback = normalizeFormat(fallbackFormat);
    if (normalizedFallback) return normalizedFallback;
    for (const evt of events){
        const payload = asRecord(evt.data);
        const eventType = toString(payload.type || evt.event);
        if (eventType.startsWith("response.") || payload.object === "response") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
        }
        if (eventType === "message_start" || eventType === "content_block_start" || eventType === "content_block_delta" || eventType === "message_delta" || eventType === "message_stop" || eventType === "ping") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE;
        }
        if (Array.isArray(payload.candidates) || payload.usageMetadata) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI;
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI;
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
                    input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(contentBlock.input ?? {}),
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
        const parsedInput = block.inputJson.trim().length > 0 ? tryParseJson(block.inputJson) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(block.input);
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
                    functionCall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(part.functionCall)
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
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES:
            return buildResponsesSummary(events, fallbackModel);
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE:
            return buildClaudeSummary(events, fallbackModel);
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI:
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY:
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
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(record.summary);
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
                data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(payload)
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
            return events.map((event)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(event));
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
                    summary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cloneLogPayload"])(summary)
                }
            };
        }
    };
}
}),
"[project]/open-sse/utils/usageTracking.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "COLORS",
    ()=>COLORS,
    "addBufferToUsage",
    ()=>addBufferToUsage,
    "estimateInputTokens",
    ()=>estimateInputTokens,
    "estimateOutputTokens",
    ()=>estimateOutputTokens,
    "estimateUsage",
    ()=>estimateUsage,
    "extractUsage",
    ()=>extractUsage,
    "filterUsageForFormat",
    ()=>filterUsageForFormat,
    "formatUsage",
    ()=>formatUsage,
    "hasValidUsage",
    ()=>hasValidUsage,
    "invalidateBufferTokensCache",
    ()=>invalidateBufferTokensCache,
    "logUsage",
    ()=>logUsage,
    "normalizeUsage",
    ()=>normalizeUsage,
    "setBufferTokensCache",
    ()=>setBufferTokensCache
]);
/**
 * Token Usage Tracking - Extract, normalize, estimate and log token usage
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const COLORS = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};
/**
 * Safety buffer added to reported token usage to prevent clients from hitting
 * context window limits. Accounts for overhead from system prompts,
 * tool definitions, and format translation that may not be reflected in raw usage.
 *
 * Configurable via:
 *   - Settings API / Dashboard: `usageTokenBuffer` (persisted in DB)
 *   - Environment variable: `USAGE_TOKEN_BUFFER`
 *   - Defaults to 2000 if neither is set
 *
 * Set to 0 to disable the buffer entirely (raw provider token counts).
 */ const DEFAULT_BUFFER_TOKENS = 2000;
let _cachedBuffer = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // Re-read from DB/env every 30s
function getBufferTokens() {
    const now = Date.now();
    const isExpired = _cachedBuffer !== null && now - _cacheTimestamp >= CACHE_TTL_MS;
    if (_cachedBuffer !== null && !isExpired) {
        return _cachedBuffer;
    }
    // Priority: env var > cached DB value > default
    const envVal = process.env.USAGE_TOKEN_BUFFER;
    if (envVal !== undefined) {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            _cachedBuffer = parsed;
            _cacheTimestamp = now;
            return parsed;
        }
    }
    // Return cached value or default; kick off async DB read to update cache.
    // On first call (_cachedBuffer is null), use the default.
    // On TTL expiry (_cachedBuffer is stale), continue returning the stale value
    // while refreshing asynchronously — prevents blocking the hot path.
    if (_cachedBuffer === null || isExpired) {
        if (_cachedBuffer === null) {
            _cachedBuffer = DEFAULT_BUFFER_TOKENS;
        }
        _cacheTimestamp = now;
        _loadBufferFromDb();
    }
    return _cachedBuffer;
}
async function _loadBufferFromDb() {
    try {
        const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [middleware] (ecmascript, async loader)");
        const settings = await getSettings();
        const val = settings.usageTokenBuffer;
        if (typeof val === "number" && val >= 0) {
            _cachedBuffer = val;
            _cacheTimestamp = Date.now();
        }
    } catch  {
    // DB not ready yet or settings unavailable — keep current value
    }
}
function invalidateBufferTokensCache() {
    _cachedBuffer = null;
    _cacheTimestamp = 0;
}
function setBufferTokensCache(value) {
    _cachedBuffer = value;
    _cacheTimestamp = Date.now();
}
// Get HH:MM:SS timestamp
function getTimeString() {
    return new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}
function addBufferToUsage(usage) {
    if (!usage || typeof usage !== "object") return usage;
    // Heuristic estimates (web/cookie providers with no upstream metering) should
    // not get the safety buffer — otherwise a 6-token "hi"/"PONG" becomes a flat
    // ~2000 for every request and looks like fake metering.
    if (usage.estimated === true) {
        return usage;
    }
    const buffer = getBufferTokens();
    if (buffer === 0) return usage;
    const result = {
        ...usage
    };
    // Claude format
    if (result.input_tokens !== undefined) {
        result.context_budget_input_tokens = result.input_tokens + buffer;
    }
    // OpenAI format
    if (result.prompt_tokens !== undefined) {
        result.context_budget_prompt_tokens = result.prompt_tokens + buffer;
    }
    // Calculate or update the context-budget total
    if (result.total_tokens !== undefined) {
        result.context_budget_total_tokens = result.total_tokens + buffer;
    } else if (result.prompt_tokens !== undefined && result.completion_tokens !== undefined) {
        // Calculate total_tokens if not exists (real value — not buffered)
        result.total_tokens = result.prompt_tokens + result.completion_tokens;
        result.context_budget_total_tokens = result.total_tokens + buffer;
    }
    return result;
}
function filterUsageForFormat(usage, targetFormat) {
    if (!usage || typeof usage !== "object") return usage;
    // Cross-map between Claude-style and OpenAI-style field names before filtering.
    // Some providers return input_tokens/output_tokens even when using OpenAI format.
    const convertedUsage = {
        ...usage
    };
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
        // OpenAI → Claude: prompt_tokens → input_tokens
        if (convertedUsage.prompt_tokens !== undefined && convertedUsage.input_tokens === undefined) {
            convertedUsage.input_tokens = convertedUsage.prompt_tokens;
        }
        if (convertedUsage.completion_tokens !== undefined && convertedUsage.output_tokens === undefined) {
            convertedUsage.output_tokens = convertedUsage.completion_tokens;
        }
    } else {
        // Claude → OpenAI: input_tokens → prompt_tokens
        if (convertedUsage.input_tokens !== undefined && convertedUsage.prompt_tokens === undefined) {
            convertedUsage.prompt_tokens = convertedUsage.input_tokens;
        }
        if (convertedUsage.output_tokens !== undefined && convertedUsage.completion_tokens === undefined) {
            convertedUsage.completion_tokens = convertedUsage.output_tokens;
        }
        // Ensure total_tokens is set
        if (convertedUsage.total_tokens === undefined && convertedUsage.prompt_tokens !== undefined && convertedUsage.completion_tokens !== undefined) {
            convertedUsage.total_tokens = convertedUsage.prompt_tokens + convertedUsage.completion_tokens;
        }
    }
    // Helper to pick only defined fields from usage
    const pickFields = (fields)=>{
        const filtered = {};
        for (const field of fields){
            if (convertedUsage[field] !== undefined) {
                filtered[field] = convertedUsage[field];
            }
        }
        return filtered;
    };
    // Define allowed fields for each format
    const formatFields = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE]: [
            "input_tokens",
            "output_tokens",
            "output_tokens_details",
            "cache_read_input_tokens",
            "cache_creation_input_tokens",
            "estimated"
        ],
        [__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI]: [
            "promptTokenCount",
            "candidatesTokenCount",
            "totalTokenCount",
            "cachedContentTokenCount",
            "thoughtsTokenCount",
            "estimated"
        ],
        [__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES]: [
            "input_tokens",
            "output_tokens",
            "total_tokens",
            "input_tokens_details",
            "output_tokens_details",
            "estimated",
            "cost_in_usd_ticks",
            "server_side_tool_usage_details",
            "server_side_tool_usage"
        ],
        // OpenAI format (default for OPENAI, CODEX, KIRO, etc.)
        default: [
            "prompt_tokens",
            "completion_tokens",
            "total_tokens",
            "cached_tokens",
            "reasoning_tokens",
            "prompt_tokens_details",
            "completion_tokens_details",
            "estimated"
        ]
    };
    // Get fields for target format
    let fields = formatFields[targetFormat];
    // Use same fields for similar formats
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) {
        fields = formatFields[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI];
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSE) {
        fields = formatFields[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES];
    } else if (!fields) {
        fields = formatFields.default;
    }
    return pickFields(fields);
}
function normalizeUsage(usage) {
    if (!usage || typeof usage !== "object" || Array.isArray(usage)) return null;
    const normalized = {};
    const assignNumber = (key, value)=>{
        if (value === undefined || value === null) return;
        const numeric = Number(value);
        if (Number.isFinite(numeric)) normalized[key] = numeric;
    };
    assignNumber("prompt_tokens", usage?.prompt_tokens);
    assignNumber("completion_tokens", usage?.completion_tokens);
    assignNumber("total_tokens", usage?.total_tokens);
    assignNumber("input_tokens", usage?.input_tokens);
    assignNumber("output_tokens", usage?.output_tokens);
    assignNumber("cache_read_input_tokens", usage?.cache_read_input_tokens);
    assignNumber("cache_creation_input_tokens", usage?.cache_creation_input_tokens);
    assignNumber("cached_tokens", usage?.cached_tokens);
    assignNumber("reasoning_tokens", usage?.reasoning_tokens);
    // xAI's exact provider-reported cost (port of decolua/9router#2453, capability A —
    // @ryanngit). Ticks → USD conversion happens in costCalculator.ts, not here.
    const exactCostTicks = usage?.cost_in_usd_ticks;
    if (typeof exactCostTicks === "number" && Number.isFinite(exactCostTicks) && exactCostTicks >= 0) {
        normalized.cost_in_usd_ticks = exactCostTicks;
    }
    if (Object.keys(normalized).length === 0) return null;
    return normalized;
}
function hasValidUsage(usage) {
    if (!usage || typeof usage !== "object") return false;
    // Check for known token fields with value > 0
    const tokenFields = [
        "prompt_tokens",
        "completion_tokens",
        "total_tokens",
        "input_tokens",
        "output_tokens",
        "promptTokenCount",
        "candidatesTokenCount"
    ];
    for (const field of tokenFields){
        if (typeof usage[field] === "number" && usage[field] > 0) {
            return true;
        }
    }
    return false;
}
function extractUsage(chunk) {
    if (!chunk || typeof chunk !== "object") return null;
    // Claude/Antigravity streaming: message_start event carries INPUT tokens
    // FIX #74: This event was not handled — input_tokens were being dropped
    // Structure: { type: "message_start", message: { usage: { input_tokens: N, output_tokens: 0 } } }
    //
    // Note: Claude's input_tokens is only the non-cached portion.
    // Sum cache tokens into prompt_tokens for a correct total (consistent with
    // extractUsageFromResponse in usageExtractor.ts for non-streaming).
    if (chunk.type === "message_start" && chunk.message?.usage) {
        const u = chunk.message.usage;
        const inputTokens = u.input_tokens || u.prompt_tokens || 0;
        const cacheRead = u.cache_read_input_tokens || 0;
        const cacheCreation = u.cache_creation_input_tokens || 0;
        if (inputTokens > 0 || cacheRead > 0 || cacheCreation > 0) {
            return normalizeUsage({
                prompt_tokens: inputTokens + cacheRead + cacheCreation,
                completion_tokens: u.output_tokens || u.completion_tokens || 0,
                input_tokens: inputTokens + cacheRead + cacheCreation,
                output_tokens: u.output_tokens || u.completion_tokens || 0,
                cache_read_input_tokens: u.cache_read_input_tokens,
                cache_creation_input_tokens: u.cache_creation_input_tokens
            });
        }
    }
    // Claude format (message_delta event) — typically carries OUTPUT tokens
    if (chunk.type === "message_delta" && chunk.usage && typeof chunk.usage === "object") {
        const deltaInput = chunk.usage.input_tokens || 0;
        const deltaCacheRead = chunk.usage.cache_read_input_tokens || 0;
        const deltaCacheCreation = chunk.usage.cache_creation_input_tokens || 0;
        return normalizeUsage({
            prompt_tokens: deltaInput + deltaCacheRead + deltaCacheCreation,
            completion_tokens: chunk.usage.output_tokens || 0,
            input_tokens: deltaInput + deltaCacheRead + deltaCacheCreation,
            output_tokens: chunk.usage.output_tokens || 0,
            cache_read_input_tokens: chunk.usage.cache_read_input_tokens,
            cache_creation_input_tokens: chunk.usage.cache_creation_input_tokens,
            reasoning_tokens: chunk.usage.output_tokens_details?.thinking_tokens
        });
    }
    // OpenAI Responses API format (response.completed or response.done)
    if ((chunk.type === "response.completed" || chunk.type === "response.done") && chunk.response?.usage && typeof chunk.response.usage === "object") {
        const usage = chunk.response.usage;
        return normalizeUsage({
            prompt_tokens: usage.input_tokens || usage.prompt_tokens || 0,
            completion_tokens: usage.output_tokens || usage.completion_tokens || 0,
            cached_tokens: usage.input_tokens_details?.cached_tokens ?? usage.prompt_tokens_details?.cached_tokens ?? usage.cache_read_input_tokens,
            cache_creation_input_tokens: usage.cache_creation_input_tokens,
            reasoning_tokens: usage.output_tokens_details?.reasoning_tokens ?? usage.completion_tokens_details?.reasoning_tokens ?? usage.reasoning_tokens
        });
    }
    // OpenAI format
    if (chunk.usage && typeof chunk.usage === "object" && (chunk.usage.prompt_tokens !== undefined || chunk.usage.input_tokens !== undefined)) {
        return normalizeUsage({
            prompt_tokens: chunk.usage.prompt_tokens ?? chunk.usage.input_tokens ?? 0,
            completion_tokens: chunk.usage.completion_tokens ?? chunk.usage.output_tokens ?? 0,
            cached_tokens: chunk.usage.prompt_tokens_details?.cached_tokens ?? chunk.usage.input_tokens_details?.cached_tokens ?? chunk.usage.prompt_cache_hit_tokens ?? chunk.usage.cached_tokens,
            reasoning_tokens: chunk.usage.completion_tokens_details?.reasoning_tokens ?? chunk.usage.output_tokens_details?.reasoning_tokens ?? chunk.usage.reasoning_tokens,
            // xAI's exact provider-reported cost (port of decolua/9router#2453, capability A).
            cost_in_usd_ticks: chunk.usage.cost_in_usd_ticks
        });
    }
    // Gemini format (Antigravity)
    // Antigravity wraps usageMetadata inside a `response` envelope:
    // { response: { usageMetadata: {...} } } — fall back to it so AG-shaped
    // chunks do not silently drop token usage.
    const usageMeta = chunk.usageMetadata || chunk.response?.usageMetadata;
    if (usageMeta && typeof usageMeta === "object") {
        // Gemini reports thoughts outside candidates. Fold them into completion so
        // every provider keeps reasoning as a subset of completion tokens.
        const thoughts = usageMeta.thoughtsTokenCount || 0;
        return normalizeUsage({
            prompt_tokens: usageMeta.promptTokenCount || 0,
            completion_tokens: (usageMeta.candidatesTokenCount || 0) + thoughts,
            total_tokens: usageMeta.totalTokenCount,
            cached_tokens: usageMeta.cachedContentTokenCount,
            reasoning_tokens: thoughts
        });
    }
    // Ollama NDJSON format (raw from provider, before translation)
    // Ollama sends: { "model": "...", "done": true, "prompt_eval_count": N, "eval_count": M }
    if (chunk.done === true && typeof chunk.prompt_eval_count === "number") {
        const promptEvalCount = chunk.prompt_eval_count || 0;
        const evalCount = chunk.eval_count || 0;
        return normalizeUsage({
            prompt_tokens: promptEvalCount,
            completion_tokens: evalCount,
            total_tokens: promptEvalCount + evalCount
        });
    }
    return null;
}
// Heuristic token estimation constants
const CHARS_PER_TOKEN_SCHEMA = 6; // ~6 chars/token for JSON schemas (more verbose per token)
/**
 * Improved token estimation heuristic (no dependency).
 * Splits text on common token boundaries (whitespace, punctuation, camelCase)
 * and applies a sub-word correction factor. Better accuracy for:
 * - English text (~4 chars/token)
 * - CJK text (~1 char/token for ideographs)
 * - Code (~3.5 chars/token, more punctuation-heavy)
 *
 * @param {string} text - Text to estimate tokens for
 * @returns {number} Estimated token count
 */ function estimateTokenCount(text) {
    if (!text || typeof text !== "string") return 0;
    // Count CJK ideographs separately — each is roughly 1 token
    const cjkMatches = text.match(/[\u3000-\u9fff\uf900-\ufaff\u{20000}-\u{2fa1f}]/gu);
    const cjkCount = cjkMatches ? cjkMatches.length : 0;
    // Remove CJK chars for the remaining estimation
    const nonCJK = text.replace(/[\u3000-\u9fff\uf900-\ufaff]/g, " ");
    // Split on token boundaries: whitespace, punctuation, camelCase transitions
    const tokens = nonCJK.split(/(\s+|[^\w\s]|(?<=[a-z])(?=[A-Z]))/).filter((t)=>t && t.trim().length > 0);
    // Apply sub-word correction: BPE tokenizers often split long words
    // into sub-word pieces, so raw token count underestimates slightly
    const estimatedNonCJK = Math.ceil(tokens.length * 1.3);
    return cjkCount + estimatedNonCJK;
}
function estimateInputTokens(body) {
    if (!body || typeof body !== "object") return 0;
    try {
        let toolTokens = 0;
        let messageTokens = 0;
        // Separate tool definitions from the rest of the body
        if (body.tools && Array.isArray(body.tools)) {
            const toolStr = JSON.stringify(body.tools);
            toolTokens = Math.ceil(toolStr.length / CHARS_PER_TOKEN_SCHEMA);
            // Estimate messages without tools
            const { tools, ...bodyWithoutTools } = body;
            messageTokens = estimateTokenCount(JSON.stringify(bodyWithoutTools));
        } else {
            messageTokens = estimateTokenCount(JSON.stringify(body));
        }
        return messageTokens + toolTokens;
    } catch (err) {
        // Fallback if stringify fails
        return 0;
    }
}
function estimateOutputTokens(contentLength) {
    if (!contentLength || contentLength <= 0) return 0;
    // When we only have a character count, use 4 chars/token with sub-word correction
    return Math.max(1, Math.ceil(contentLength / 3.5));
}
function formatUsage(inputTokens, outputTokens, targetFormat) {
    // Claude format uses input_tokens/output_tokens
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        return addBufferToUsage({
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated: true
        });
    }
    // Default: OpenAI format (works for openai, gemini, responses, etc.)
    return addBufferToUsage({
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        estimated: true
    });
}
function estimateUsage(body, contentLength, targetFormat = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
    return formatUsage(estimateInputTokens(body), estimateOutputTokens(contentLength), targetFormat);
}
function logUsage(provider, usage, model = null, connectionId = null, apiKeyInfo = null) {
    if (!usage || typeof usage !== "object") return;
    const p = provider?.toUpperCase() || "UNKNOWN";
    // Support both formats:
    // - OpenAI: prompt_tokens, completion_tokens
    // - Claude: input_tokens, output_tokens
    const inTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(usage);
    const outTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(usage);
    void apiKeyInfo;
    const normalizedConnectionId = typeof connectionId === "string" ? connectionId : undefined;
    const accountPrefix = normalizedConnectionId ? normalizedConnectionId.slice(0, 8) + "..." : "unknown";
    let msg = `[${getTimeString()}] 📊 ${COLORS.green}[USAGE] ${p} | in=${inTokens} | out=${outTokens} | account=${accountPrefix}${COLORS.reset}`;
    // Add estimated flag if present
    if (usage.estimated) {
        msg += ` ${COLORS.yellow}(estimated)${COLORS.reset}`;
    }
    // Add cache info if present (unified from different formats)
    const cacheRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getPromptCacheReadTokens"])(usage);
    if (cacheRead) msg += ` | cache_read=${cacheRead}`;
    const cacheCreation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getPromptCacheCreationTokens"])(usage);
    if (cacheCreation) msg += ` | cache_create=${cacheCreation}`;
    const reasoning = usage.reasoning_tokens;
    if (reasoning) msg += ` | reasoning=${reasoning}`;
    console.log(msg);
    // Streaming requests persist usage once in chatCore's completion callback.
    // Keep this helper side-effect free apart from console visibility.
    const tokens = {
        input: inTokens,
        output: outTokens,
        cacheRead: cacheRead || 0,
        cacheCreation: cacheCreation || 0,
        reasoning: reasoning || 0
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
        model: typeof model === "string" ? model : undefined,
        provider: typeof provider === "string" ? provider : undefined,
        connectionId: normalizedConnectionId,
        tokens,
        status: "200 OK"
    }).catch(()=>{});
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/utils/cursorAgentCliVersion.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CURSOR_AGENT_CLI_VERSION",
    ()=>CURSOR_AGENT_CLI_VERSION,
    "detectCursorAgentCliVersionFromFs",
    ()=>detectCursorAgentCliVersionFromFs,
    "extractVersionIdFromResolvedPath",
    ()=>extractVersionIdFromResolvedPath,
    "formatCursorAgentClientVersion",
    ()=>formatCursorAgentClientVersion,
    "getCursorAgentCliVersion",
    ()=>getCursorAgentCliVersion,
    "isCursorAgentCliVersionId",
    ()=>isCursorAgentCliVersionId,
    "newestVersionInDir",
    ()=>newestVersionInDir,
    "resetCursorAgentCliVersionCache",
    ()=>resetCursorAgentCliVersionCache
]);
/**
 * Cursor Agent CLI version for AgentService/Run impersonation.
 *
 * Wire header: `x-cursor-client-version: cli-${id}` where `id` is a dated
 * build like `2026.07.08-0c04a8a` (not the IDE `3.x` semver).
 *
 * Resolution: CURSOR_AGENT_CLI_VERSION env → local install detect → pin.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const CURSOR_AGENT_CLI_VERSION = "2026.07.08-0c04a8a";
const VERSION_ID_RE = /^\d{4}\.\d{2}\.\d{2}-[0-9a-f]+$/;
const CACHE_TTL_MS = 60 * 60 * 1000;
let cachedVersion = null;
let cachedAt = 0;
function isCursorAgentCliVersionId(value) {
    return VERSION_ID_RE.test(value);
}
function formatCursorAgentClientVersion(id) {
    return `cli-${id}`;
}
function extractVersionIdFromResolvedPath(resolvedPath) {
    const parts = resolvedPath.split(/[/\\]/);
    const versionsIdx = parts.lastIndexOf("versions");
    if (versionsIdx < 0 || versionsIdx + 1 >= parts.length) return null;
    const id = parts[versionsIdx + 1];
    return isCursorAgentCliVersionId(id) ? id : null;
}
function newestVersionInDir(versionsDir) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(versionsDir)) return null;
        const matches = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readdirSync"])(versionsDir).filter((name)=>{
            if (!isCursorAgentCliVersionId(name)) return false;
            try {
                return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["lstatSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(versionsDir, name)).isDirectory();
            } catch  {
                return false;
            }
        }).sort();
        return matches.length > 0 ? matches[matches.length - 1] : null;
    } catch  {
        return null;
    }
}
function versionFromShim(shimPath) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(shimPath)) return null;
        const resolved = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["realpathSync"])(shimPath);
        return extractVersionIdFromResolvedPath(resolved);
    } catch  {
        return null;
    }
}
function defaultVersionsDir(home) {
    if ("TURBOPACK compile-time truthy", 1) {
        const localAppData = process.env.LOCALAPPDATA || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(home, "AppData", "Local");
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(localAppData, "cursor-agent", "versions");
    }
    //TURBOPACK unreachable
    ;
}
function detectCursorAgentCliVersionFromFs(home = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])()) {
    const localBin = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(home, ".local", "bin");
    for (const name of [
        "agent",
        "cursor-agent"
    ]){
        const fromShim = versionFromShim((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(localBin, name));
        if (fromShim) return fromShim;
    }
    const dataDir = process.env.CURSOR_DATA_DIR;
    const versionsDir = dataDir ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dataDir, "versions") : defaultVersionsDir(home);
    return newestVersionInDir(versionsDir);
}
function getCursorAgentCliVersion() {
    const now = Date.now();
    if (cachedVersion && now - cachedAt < CACHE_TTL_MS) {
        return cachedVersion;
    }
    const fromEnv = process.env.CURSOR_AGENT_CLI_VERSION?.trim();
    if (fromEnv && isCursorAgentCliVersionId(fromEnv)) {
        cachedVersion = fromEnv;
        cachedAt = now;
        return cachedVersion;
    }
    const home = process.env.HOME || process.env.USERPROFILE || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])();
    const fromFs = detectCursorAgentCliVersionFromFs(home);
    if (fromFs) {
        cachedVersion = fromFs;
        cachedAt = now;
        return cachedVersion;
    }
    return CURSOR_AGENT_CLI_VERSION;
}
function resetCursorAgentCliVersionCache() {
    cachedVersion = null;
    cachedAt = 0;
}
}),
"[project]/open-sse/utils/composerToolCalls.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStreamingState",
    ()=>createStreamingState,
    "feedStreamingChunk",
    ()=>feedStreamingChunk,
    "hasComposerToolCalls",
    ()=>hasComposerToolCalls,
    "parseComposerToolCalls",
    ()=>parseComposerToolCalls
]);
/**
 * Parser for Cursor Composer's DeepSeek-style inline tool call format.
 *
 * Composer (Cursor's `cu/composer-2.5*` models) emits tool calls inside its
 * normal text output using sentinel markers, e.g.:
 *
 *     Optional preamble text...
 *     <｜tool▁calls▁begin｜>
 *     <｜tool▁call▁begin｜>
 *     tool_name
 *     <｜tool▁sep｜>arg_name
 *     arg_value
 *     <｜tool▁sep｜>arg_name_2
 *     arg_value_2
 *     <｜tool▁call▁end｜>
 *     <｜tool▁call▁begin｜>
 *     other_tool
 *     <｜tool▁sep｜>arg
 *     value
 *     <｜tool▁call▁end｜>
 *     <｜tool▁calls▁end｜>
 *     Optional trailing text...
 *
 * Markers use full-width pipes (`｜`, U+FF5C) and small-triangle separator
 * (`▁`, U+2581). We also accept ASCII fallbacks (`<|tool_calls_begin|>` etc.)
 * defensively in case Cursor ever changes encoding.
 *
 * The parser converts this into the OpenAI Chat Completions `tool_calls`
 * shape and returns the residual content (preamble + trailing text) so the
 * caller can decide whether to surface it as the assistant's visible message.
 */ const FW = "[｜|]"; // full-width or ASCII pipe
const SEP = "[▁_]"; // full-width separator or ASCII underscore
// Match the outer tool-calls block, lazily.
const OUTER_RE = new RegExp(`<${FW}tool${SEP}calls${SEP}begin${FW}>([\\s\\S]*?)<${FW}tool${SEP}calls${SEP}end${FW}>`, "i");
// Match a single tool-call block.
const INNER_RE = new RegExp(`<${FW}tool${SEP}call${SEP}begin${FW}>([\\s\\S]*?)<${FW}tool${SEP}call${SEP}end${FW}>`, "gi");
// Match an arg separator.
const ARG_SEP_RE = new RegExp(`<${FW}tool${SEP}sep${FW}>`, "gi");
// Heuristic: any partial opening marker (start of `<｜tool` ... without the
// final `>`). Used by the streaming parser to know it must hold back text.
const PARTIAL_OPEN_MARKER_RE = new RegExp(`<${FW}?(?:t(?:o(?:o(?:l(?:${SEP}(?:c(?:a(?:l(?:l(?:s)?(?:${SEP}(?:b(?:e(?:g(?:i(?:n${FW}?>?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?$`, "i");
function hasComposerToolCalls(text) {
    if (!text || typeof text !== "string") return false;
    return OUTER_RE.test(text);
}
function generateToolCallId(index) {
    // Format: call_<random>; mirrors what OpenAI clients expect.
    // Use crypto for deterministic-quality randomness (Hard Rule: no Math.random for IDs).
    const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
    return `call_${rand}${index}`;
}
/**
 * Parse a single inner tool-call block body (the text between
 * `<｜tool▁call▁begin｜>` and `<｜tool▁call▁end｜>`).
 *
 * Body shape:
 *   tool_name
 *   <｜tool▁sep｜>arg_name
 *   arg_value
 *   <｜tool▁sep｜>arg_name_2
 *   arg_value_2
 *
 * Returns {name, arguments} where arguments is a JSON string suitable for
 * the OpenAI tool_calls schema. Arg values are taken verbatim from the
 * text between one separator's argname-line and the next separator (or
 * end of body). We attempt to detect when a value is already valid JSON
 * (object/array/number/bool/null) and store it natively; otherwise we keep
 * it as a string.
 */ function parseInnerCall(body) {
    // Body starts with the tool name on (typically) its own line, optionally
    // surrounded by whitespace, then the first `<｜tool▁sep｜>`.
    const trimmed = body.replace(/^\s+|\s+$/g, "");
    // Split by argument separator first to isolate name + arg blocks.
    const segments = trimmed.split(ARG_SEP_RE);
    // First segment is the tool name (and any preamble whitespace).
    const name = (segments.shift() ?? "").trim();
    if (!name) {
        return null;
    }
    const args = {};
    for (const seg of segments){
        if (!seg) continue;
        // Each segment is normally `arg_name\nvalue\n...`: the arg name is the
        // first line, everything after the first newline is the value
        // (verbatim, including additional newlines). Some live Composer/Auto
        // captures instead separate the arg name and value with a single space
        // on the same line (no newline at all in the segment) — fall back to
        // splitting on the first whitespace boundary in that case so the value
        // isn't swallowed into an empty-valued, space-containing "arg name".
        const idxNl = seg.indexOf("\n");
        let argName;
        let argValue;
        if (idxNl < 0) {
            const idxSp = seg.search(/\s/);
            if (idxSp < 0) {
                argName = seg.trim();
                argValue = "";
            } else {
                argName = seg.slice(0, idxSp).trim();
                // Unlike the newline-delimited form, a space-delimited value has no
                // multi-line content to preserve — trim the trailing whitespace left
                // over from the boundary with the next `<｜tool▁sep｜>` marker.
                argValue = seg.slice(idxSp + 1).trim();
            }
        } else {
            argName = seg.slice(0, idxNl).trim();
            argValue = seg.slice(idxNl + 1);
        }
        if (!argName) continue;
        // Strip the trailing newline before the next separator (the separator
        // marker itself was already consumed by the split).
        argValue = argValue.replace(/\n+$/, "");
        // Attempt JSON parse so structured args (objects/arrays/numbers/bools)
        // come through as native JSON values rather than quoted strings.
        args[argName] = coerceArgValue(argValue);
    }
    return {
        name,
        arguments: JSON.stringify(args)
    };
}
function coerceArgValue(raw) {
    if (raw === "") return "";
    const stripped = raw.trim();
    if (stripped.startsWith("{") && stripped.endsWith("}") || stripped.startsWith("[") && stripped.endsWith("]")) {
        try {
            return JSON.parse(stripped);
        } catch  {
        // not valid JSON — fall through to string
        }
    }
    if (stripped === "true") return true;
    if (stripped === "false") return false;
    if (stripped === "null") return null;
    if (/^-?\d+$/.test(stripped)) {
        const n = Number(stripped);
        if (Number.isSafeInteger(n)) return n;
    }
    if (/^-?\d*\.\d+$/.test(stripped)) {
        const n = Number(stripped);
        if (Number.isFinite(n)) return n;
    }
    return raw;
}
function parseComposerToolCalls(text) {
    if (!text || typeof text !== "string") {
        return {
            content: text || "",
            toolCalls: []
        };
    }
    const match = text.match(OUTER_RE);
    if (!match || match.index === undefined) {
        return {
            content: text,
            toolCalls: []
        };
    }
    const preamble = text.slice(0, match.index);
    const trailing = text.slice(match.index + match[0].length);
    const block = match[1];
    const toolCalls = [];
    let idx = 0;
    for (const innerMatch of block.matchAll(INNER_RE)){
        const parsed = parseInnerCall(innerMatch[1]);
        if (!parsed) continue;
        toolCalls.push({
            id: generateToolCallId(idx),
            type: "function",
            function: parsed
        });
        idx += 1;
    }
    const residual = (preamble + trailing).trim();
    return {
        content: residual,
        toolCalls
    };
}
function createStreamingState() {
    return {
        emitted: 0,
        done: false
    };
}
function feedStreamingChunk(state, accumulated) {
    if (state.done) {
        return {
            safeDelta: "",
            ready: false,
            toolCalls: [],
            holdback: false
        };
    }
    if (!accumulated) {
        return {
            safeDelta: "",
            ready: false,
            toolCalls: [],
            holdback: false
        };
    }
    // 1. Complete block already in buffer? Parse it.
    const m = accumulated.match(OUTER_RE);
    if (m && m.index !== undefined) {
        const preamble = accumulated.slice(0, m.index);
        const block = m[1];
        const toolCalls = [];
        let idx = 0;
        for (const innerMatch of block.matchAll(INNER_RE)){
            const parsed = parseInnerCall(innerMatch[1]);
            if (!parsed) continue;
            toolCalls.push({
                id: generateToolCallId(idx),
                type: "function",
                function: parsed
            });
            idx += 1;
        }
        // Emit any preamble we haven't emitted yet.
        const safe = preamble;
        const safeDelta = safe.length > state.emitted ? safe.slice(state.emitted) : "";
        state.emitted = safe.length;
        state.done = true;
        return {
            safeDelta,
            ready: true,
            toolCalls,
            holdback: false
        };
    }
    // 2. Look for an opening-only marker. If found, everything before it is
    //    safe; everything after must be held until we see the closing marker.
    const openOnlyRe = new RegExp(`<${FW}tool${SEP}calls${SEP}begin${FW}>`, "i");
    const openMatch = accumulated.match(openOnlyRe);
    if (openMatch && openMatch.index !== undefined) {
        const safe = accumulated.slice(0, openMatch.index);
        const safeDelta = safe.length > state.emitted ? safe.slice(state.emitted) : "";
        state.emitted = safe.length;
        return {
            safeDelta,
            ready: false,
            toolCalls: [],
            holdback: true
        };
    }
    // 3. Partial opening marker at the tail? Hold back the suspicious tail.
    const tailMatch = accumulated.match(PARTIAL_OPEN_MARKER_RE);
    if (tailMatch && tailMatch.index !== undefined) {
        const safe = accumulated.slice(0, tailMatch.index);
        const safeDelta = safe.length > state.emitted ? safe.slice(state.emitted) : "";
        state.emitted = safe.length;
        return {
            safeDelta,
            ready: false,
            toolCalls: [],
            holdback: true
        };
    }
    // 4. No markers anywhere. Emit everything new.
    const safeDelta = accumulated.length > state.emitted ? accumulated.slice(state.emitted) : "";
    state.emitted = accumulated.length;
    return {
        safeDelta,
        ready: false,
        toolCalls: [],
        holdback: false
    };
}
}),
"[project]/open-sse/utils/anthropicHost.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Whether a configured Anthropic `baseUrl` targets the official `api.anthropic.com` host.
 *
 * Uses exact hostname equality (parsed via `new URL`) instead of a substring `.includes`,
 * so a look-alike upstream such as `https://api.anthropic.com.evil.test` or
 * `https://evil.test/?x=api.anthropic.com` is correctly treated as third-party
 * (CodeQL `js/incomplete-url-substring-sanitization`). An empty baseUrl means the default
 * official endpoint; a scheme-less host (e.g. `api.anthropic.com/v1`) is parsed with an
 * assumed `https://`; an unparseable baseUrl is treated as third-party (safer default —
 * the Bearer fallback is then emitted).
 */ __turbopack_context__.s([
    "isOfficialAnthropicBaseUrl",
    ()=>isOfficialAnthropicBaseUrl
]);
function isOfficialAnthropicBaseUrl(baseUrl) {
    if (!baseUrl) return true;
    let host = null;
    try {
        host = new URL(baseUrl).hostname;
    } catch  {
        try {
            host = new URL(`https://${baseUrl}`).hostname;
        } catch  {
            return false;
        }
    }
    return host === "api.anthropic.com";
}
}),
"[project]/open-sse/utils/reasoningContentInjector.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "injectReasoningContentForThinkingModel",
    ()=>injectReasoningContentForThinkingModel,
    "isThinkingMessageModel",
    ()=>isThinkingMessageModel,
    "requiresAuthenticReasoningContent",
    ()=>requiresAuthenticReasoningContent,
    "shouldInjectReasoningContentPlaceholder",
    ()=>shouldInjectReasoningContentPlaceholder
]);
/**
 * Thinking-mode upstreams (DeepSeek V4 Flash, Kimi, MiniMax, xiaomi-tokenplan
 * mimo, ...) require
 * `reasoning_content` to be echoed back on every assistant message in the
 * conversation history. Standard OpenAI clients do not preserve that field
 * across turns, so we inject a non-empty placeholder before forwarding.
 *
 * Without the placeholder these upstreams return:
 *   400 Bad Request — reasoning_content must be passed back
 *
 * Ported from decolua/9router#1099 (issue #1543). Pure helper — no I/O, no
 * cross-module deps — kept narrow so it can be reused by other meta-providers
 * that proxy to thinking-mode models.
 */ const PLACEHOLDER = " ";
/**
 * Model-id predicates for thinking-mode families that need the echo.
 * Matched case-insensitively against the resolved model id (post upstream
 * routing, e.g. `oc/deepseek-v4-flash-free` for the OpenCode meta-provider).
 */ const THINKING_MODEL_PATTERNS = [
    /deepseek/i,
    /\bkimi\b/i,
    /\bk2\b/i,
    /\bminimax\b/i,
    /\bmimo\b/i
];
const AUTHENTIC_REASONING_MODEL_PATTERN = /(?:^|\/)kimi-k(?:3|2\.7-code)(?:$|-)/i;
function requiresAuthenticReasoningContent(provider, model) {
    const normalizedProvider = String(provider ?? "").trim().toLowerCase();
    const normalizedModel = String(model ?? "").trim();
    return (normalizedProvider === "moonshot" || normalizedProvider === "kimi") && AUTHENTIC_REASONING_MODEL_PATTERN.test(normalizedModel);
}
function isThinkingMessageModel(model) {
    if (!model || typeof model !== "string") return false;
    return THINKING_MODEL_PATTERNS.some((re)=>re.test(model));
}
function shouldInjectReasoningContentPlaceholder(provider, model) {
    const normalizedProvider = String(provider ?? "").trim().toLowerCase();
    return (normalizedProvider === "moonshot" || normalizedProvider === "kimi") && !requiresAuthenticReasoningContent(normalizedProvider, model) && isThinkingMessageModel(model);
}
function hasNonEmptyReasoningContent(message) {
    return typeof message.reasoning_content === "string" && message.reasoning_content.trim().length > 0;
}
function isAssistantMessage(value) {
    return !!value && typeof value === "object" && !Array.isArray(value) && value.role === "assistant";
}
function injectReasoningContentForThinkingModel(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const record = body;
    if (!Array.isArray(record.messages)) return body;
    let modified = false;
    const messages = record.messages.map((message)=>{
        if (!isAssistantMessage(message)) return message;
        if (hasNonEmptyReasoningContent(message)) return message;
        modified = true;
        return {
            ...message,
            reasoning_content: PLACEHOLDER
        };
    });
    return modified ? {
        ...record,
        messages
    } : body;
}
}),
"[project]/open-sse/utils/opencodeHeaders.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "forwardOpencodeClientHeaders",
    ()=>forwardOpencodeClientHeaders
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
/**
 * Header keys that are forwarded from the client to the upstream provider.
 * Used by both OpencodeExecutor and DefaultExecutor.
 */ const OPENCODE_HEADER_KEYS = [
    "x-opencode-session",
    "x-opencode-request",
    "x-opencode-project",
    "x-opencode-client"
];
/**
 * Common agent-metadata headers used by non-OpenCode clients (custom agents/
 * providers) for upstream request tracking and attribution. Forwarded the same
 * way as the x-opencode-* set: case-insensitive lookup, client value wins.
 * Added for 9router#2413 — these were previously dropped for every client
 * outside the OpenCode allowlist.
 */ const AGENT_METADATA_HEADER_KEYS = [
    "x-session-id",
    "x-title"
];
/**
 * Case-insensitive lookup for a header in a headers record.
 */ function findHeader(headers, name) {
    return Object.entries(headers).find(([key])=>key.toLowerCase() === name.toLowerCase())?.[1];
}
function forwardOpencodeClientHeaders(headers, clientHeaders, options) {
    // 1. Forward User-Agent
    const clientUA = clientHeaders["User-Agent"] || clientHeaders["user-agent"];
    if (clientUA) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["setUserAgentHeader"])(headers, clientUA);
    }
    // 2. Forward x-opencode-* metadata headers
    for (const headerName of OPENCODE_HEADER_KEYS){
        const value = findHeader(clientHeaders, headerName);
        if (value) {
            headers[headerName] = value;
        }
    }
    // 2b. Forward agent-metadata headers (x-session-id, x-title) — 9router#2413
    for (const headerName of AGENT_METADATA_HEADER_KEYS){
        const value = findHeader(clientHeaders, headerName);
        if (value) {
            headers[headerName] = value;
        }
    }
    // 3. OpencodeExecutor-only: synthesize session/request id from fallback headers
    if (options?.synthesizeRequestId && !headers["x-opencode-session"]) {
        const sessionAffinity = findHeader(clientHeaders, "x-session-affinity") || findHeader(clientHeaders, "x-session-id");
        if (sessionAffinity) {
            headers["x-opencode-session"] = sessionAffinity;
            if (!headers["x-opencode-request"]) {
                headers["x-opencode-request"] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
            }
        }
    }
    // 4. OpencodeExecutor-only: synthesize the OpenCode CLI identity Cloudflare expects
    //    on VPS egress, for any key the client did not supply (#5997).
    if (options?.cliDefaults) {
        applyCliDefaults(headers, options.cliDefaults);
    }
}
/**
 * Fill the OpenCode CLI identity headers Cloudflare requires on VPS egress, but only for
 * keys the client did not already supply (client values always win). (#5997)
 */ function applyCliDefaults(headers, cliDefaults) {
    if (!headers["User-Agent"] && !headers["user-agent"]) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["setUserAgentHeader"])(headers, cliDefaults.userAgent);
    }
    headers["x-opencode-client"] ||= cliDefaults.client;
    headers["x-opencode-project"] ||= cliDefaults.project;
    headers["x-opencode-request"] ||= (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    headers["x-opencode-session"] ||= (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/utils/textualToolCall.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "containsTextualToolCallMarker",
    ()=>containsTextualToolCallMarker,
    "isValidToolCallHeaderPrefix",
    ()=>isValidToolCallHeaderPrefix,
    "parseTextualToolCallCandidate",
    ()=>parseTextualToolCallCandidate,
    "stripZeroWidth",
    ()=>stripZeroWidth
]);
function stripZeroWidth(value) {
    if (typeof value === "string") {
        return value.replace(/[\u200B-\u200D\uFEFF]/g, "");
    }
    if (Array.isArray(value)) {
        return value.map((item)=>stripZeroWidth(item));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item])=>[
                key,
                stripZeroWidth(item)
            ]));
    }
    return value;
}
function isValidToolCallHeaderPrefix(candidate) {
    if (!candidate.startsWith("[Tool call:")) return false;
    const bracketIndex = candidate.indexOf("]");
    if (bracketIndex === -1) {
        const namePart = candidate.slice("[Tool call:".length);
        if (namePart.includes("\n") || namePart.includes("[")) return false;
        return true;
    }
    const namePart = candidate.slice("[Tool call:".length, bracketIndex);
    if (namePart.includes("\n") || namePart.trim().length === 0) return false;
    const afterBracket = candidate.slice(bracketIndex + 1);
    const leadingWhitespaceMatch = afterBracket.match(/^[\s\r\n]*/);
    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : "";
    const textAfterWhitespace = afterBracket.slice(leadingWhitespace.length);
    if (textAfterWhitespace.length === 0) {
        return true;
    }
    if (!leadingWhitespace.includes("\n")) {
        return false;
    }
    const expectedText = "Arguments:";
    if (expectedText.startsWith(textAfterWhitespace)) {
        return true;
    }
    if (textAfterWhitespace.startsWith(expectedText)) {
        return true;
    }
    return false;
}
function parseTextualToolCallCandidate(text) {
    if (typeof text !== "string") return null;
    const normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const toolCallIndex = normalized.lastIndexOf("[Tool call:");
    if (toolCallIndex < 0) {
        const lastParen = normalized.lastIndexOf("(");
        if (lastParen !== -1 && "(empty)[Tool call:".startsWith(normalized.slice(lastParen))) {
            return {
                kind: "partial"
            };
        }
        const lastBracket = normalized.lastIndexOf("[");
        if (lastBracket !== -1 && "[Tool call:".startsWith(normalized.slice(lastBracket))) {
            return {
                kind: "partial"
            };
        }
        return null;
    }
    const candidate = normalized.slice(toolCallIndex);
    if (!isValidToolCallHeaderPrefix(candidate)) {
        return null;
    }
    const headerMatch = candidate.match(/^\[Tool call:\s*([^\]\n]+)\]\s*\nArguments:\s*/);
    if (!headerMatch) return {
        kind: "partial"
    };
    const name = headerMatch[1]?.trim();
    const rawArgs = candidate.slice(headerMatch[0].length).trim();
    if (!name || !rawArgs) return {
        kind: "partial"
    };
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
            const parsed = JSON.parse(decoded);
            return {
                kind: "complete",
                name,
                args: stripZeroWidth(parsed)
            };
        } catch  {}
    }
    return {
        kind: "partial"
    };
}
function containsTextualToolCallMarker(text) {
    if (typeof text !== "string") return false;
    const normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    if (!normalized.includes("[Tool call:")) return false;
    if (normalized.includes("Arguments:")) return true;
    const trimmed = normalized.trim();
    return trimmed.startsWith("[Tool call:") || trimmed.startsWith("(empty)[Tool call:");
}
}),
"[project]/open-sse/utils/reasoningFields.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asReasoningRecord",
    ()=>asReasoningRecord,
    "copyOpenAICompatibleReasoningFields",
    ()=>copyOpenAICompatibleReasoningFields,
    "extractReasoningDetailsText",
    ()=>extractReasoningDetailsText,
    "getAnyReasoningValue",
    ()=>getAnyReasoningValue,
    "getReadableReasoningValue",
    ()=>getReadableReasoningValue,
    "getUnsupportedReasoningValue",
    ()=>getUnsupportedReasoningValue,
    "hasAnyReasoningSignal",
    ()=>hasAnyReasoningSignal,
    "hasUnsupportedReasoningSignal",
    ()=>hasUnsupportedReasoningSignal
]);
function asReasoningRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function nonEmptyString(value) {
    return typeof value === "string" && value.length > 0 ? value : "";
}
function extractReasoningDetailsText(value) {
    const record = asReasoningRecord(value);
    if (!Array.isArray(record.reasoning_details)) return "";
    return record.reasoning_details.map((detail)=>{
        const item = asReasoningRecord(detail);
        return nonEmptyString(item.text) || nonEmptyString(item.content);
    }).join("");
}
function getReadableReasoningValue(value) {
    const record = asReasoningRecord(value);
    return nonEmptyString(record.reasoning_content) || nonEmptyString(record.reasoning);
}
function getUnsupportedReasoningValue(value) {
    const record = asReasoningRecord(value);
    return nonEmptyString(record.reasoning_text) || nonEmptyString(record.thinking) || nonEmptyString(record.thought) || extractReasoningDetailsText(record);
}
function getAnyReasoningValue(value) {
    return getReadableReasoningValue(value) || getUnsupportedReasoningValue(value);
}
function hasUnsupportedReasoningSignal(value) {
    const record = asReasoningRecord(value);
    return Boolean(!getReadableReasoningValue(record) && (nonEmptyString(record.reasoning_text) || nonEmptyString(record.thinking) || nonEmptyString(record.thought) || Array.isArray(record.reasoning_details) && record.reasoning_details.length > 0));
}
function hasAnyReasoningSignal(value) {
    const record = asReasoningRecord(value);
    return Boolean(getReadableReasoningValue(record) || nonEmptyString(record.reasoning_text) || nonEmptyString(record.thinking) || nonEmptyString(record.thought) || Array.isArray(record.reasoning_details) && record.reasoning_details.length > 0);
}
function copyOpenAICompatibleReasoningFields(source, target) {
    if (source.reasoning_content !== undefined) target.reasoning_content = source.reasoning_content;
    if (source.reasoning !== undefined) target.reasoning = source.reasoning;
    if (source.reasoning_text !== undefined) target.reasoning_text = source.reasoning_text;
    if (Array.isArray(source.reasoning_details)) target.reasoning_details = source.reasoning_details;
    if (!getReadableReasoningValue(target)) {
        const mirrored = getUnsupportedReasoningValue(source);
        if (mirrored) target.reasoning_content = mirrored;
    }
}
}),
"[project]/open-sse/utils/cacheControlPolicy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cache Control Policy
 *
 * Determines when to preserve client-side prompt caching headers (cache_control)
 * vs. applying OmniRoute's own caching strategy.
 *
 * Client-side caching (e.g., Claude Code) is preserved when:
 * 1. Client is Claude Code or similar caching-aware client
 * 2. Provider supports prompt caching (Anthropic, etc.)
 *
 * Combo membership / routing strategy no longer gates preservation: rewriting a
 * caching-aware client's markers produced per-request breakpoint positions that
 * thrashed the provider prompt cache, while preserving them is never worse
 * (see shouldPreserveCacheControl).
 */ __turbopack_context__.s([
    "isClaudeCodeClient",
    ()=>isClaudeCodeClient,
    "isDeterministicStrategy",
    ()=>isDeterministicStrategy,
    "providerHonorsOpenAIFormatCacheControl",
    ()=>providerHonorsOpenAIFormatCacheControl,
    "providerSupportsCaching",
    ()=>providerSupportsCaching,
    "resolveConnectionCacheOverride",
    ()=>resolveConnectionCacheOverride,
    "shouldPreserveCacheControl",
    ()=>shouldPreserveCacheControl,
    "trackCacheMetrics",
    ()=>trackCacheMetrics,
    "updateCacheTokenMetrics",
    ()=>updateCacheTokenMetrics
]);
/**
 * Routing strategies that are deterministic (same request → same provider)
 */ const DETERMINISTIC_STRATEGIES = new Set([
    "priority",
    "cost-optimized"
]);
/**
 * Providers that support prompt caching
 */ const CACHING_PROVIDERS = new Set([
    "claude",
    "anthropic",
    "zai",
    "deepseek",
    // Kimi Code's OpenAI protocol requires prompt_cache_key for Coding Plan
    // cache affinity. The OAuth card and hidden API-key compatibility ID share
    // the same upstream API.
    "kimi-coding",
    "kimi-coding-apikey",
    // #3088 — Xiaomi MiMo honors OpenAI-format cache_control breakpoints. Without
    // this entry, shouldPreserveCacheControl() returns false for Claude Code
    // clients and filterToOpenAIFormat() strips cache_control, so Xiaomi never
    // sees the cache hints and every request is a cache miss.
    "xiaomi-mimo",
    // #3955 — OpenAI / Codex / Azure-OpenAI use AUTOMATIC prefix caching: the longest
    // matching prefix of a request is cached upstream WITHOUT any explicit cache_control
    // markers. They must count as caching providers so the cache-aware compression guard
    // preserves the cacheable prefix (system prompt / earliest messages) instead of
    // rewriting it and forcing a cache miss. This also activates the intended
    // `prompt_cache_key` cache-routing hint for OpenAI in chatCore.
    "openai",
    "codex",
    "azure",
    // #2069 — DashScope's OpenAI-compatible endpoints (Alibaba Model Studio and
    // Qwen Cloud pay-as-you-go, upstream "alicode"/"alicode-intl") natively honor
    // `cache_control: {type:"ephemeral"}` breakpoints. Without these entries
    // shouldPreserveCacheControl() returns false for Claude Code clients and the
    // OpenAI-format translator strips cache_control, so DashScope never sees the
    // hints and every request is a cache miss.
    "alibaba",
    "alibaba-cn",
    "qwen-cloud"
]);
/**
 * Providers that honor EXPLICIT `cache_control` breakpoints carried inside an
 * OpenAI-format request body (i.e. the markers must be passed THROUGH the
 * Claude→OpenAI translation instead of stripped).
 *
 * This is a strict subset of CACHING_PROVIDERS and deliberately excludes
 * `openai` / `codex` / `azure`: those use AUTOMATIC prefix caching (#3955) and
 * do NOT accept explicit `cache_control` fields in the request — forwarding the
 * markers there is meaningless at best and a 400 "unknown field" at worst, and
 * it broke the chatCore "strips cache markers for non-Claude providers" test.
 * Claude-format providers re-inject markers via prepareClaudeRequest, so they
 * are not listed here either.
 */ const OPENAI_FORMAT_CACHE_CONTROL_PROVIDERS = new Set([
    // #2069 — DashScope OpenAI-compatible endpoints accept ephemeral breakpoints.
    "alibaba",
    "alibaba-cn",
    "qwen-cloud",
    // #3088 — Xiaomi MiMo honors OpenAI-format cache_control breakpoints.
    "xiaomi-mimo"
]);
function resolveConnectionCacheOverride(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return null;
    const cache = providerSpecificData.cache;
    if (!cache || typeof cache !== "object" || Array.isArray(cache)) return null;
    const record = cache;
    const result = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        result.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (record.cacheControlPassthrough === "strip" || record.cacheControlPassthrough === "openai-format" || record.cacheControlPassthrough === "claude-format") {
        result.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(result).length > 0 ? result : null;
}
function providerHonorsOpenAIFormatCacheControl(provider, connectionCacheOverride) {
    if (connectionCacheOverride?.cacheControlPassthrough === "openai-format") return true;
    if (connectionCacheOverride?.cacheControlPassthrough === "strip") return false;
    if (!provider) return false;
    return OPENAI_FORMAT_CACHE_CONTROL_PROVIDERS.has(provider.toLowerCase());
}
function isClaudeCodeClient(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    // Claude Code user agents
    if (ua.includes("claude-code") || ua.includes("claude_code")) return true;
    if (ua.includes("claude-cli/")) return true;
    if (ua.includes("sdk-cli")) return true;
    if (ua.includes("anthropic") && ua.includes("cli")) return true;
    return false;
}
function providerSupportsCaching(provider, targetFormat, connectionCacheOverride) {
    if (typeof connectionCacheOverride?.supportsPromptCaching === "boolean") {
        return connectionCacheOverride.supportsPromptCaching;
    }
    if (!provider) return false;
    if (CACHING_PROVIDERS.has(provider.toLowerCase())) return true;
    // All Claude-protocol providers support prompt caching
    if (targetFormat === "claude") return true;
    return false;
}
function isDeterministicStrategy(strategy) {
    if (!strategy) return false;
    return DETERMINISTIC_STRATEGIES.has(strategy);
}
function shouldPreserveCacheControl({ userAgent, targetProvider, targetFormat, settings, connectionCacheOverride }) {
    // User override takes precedence
    if (settings?.alwaysPreserveClientCache === "always") {
        return true;
    }
    if (settings?.alwaysPreserveClientCache === "never") {
        return false;
    }
    // Auto mode: must be a caching-aware client…
    if (!isClaudeCodeClient(userAgent)) {
        return false;
    }
    // …talking to a provider that supports prompt caching.
    return providerSupportsCaching(targetProvider, targetFormat, connectionCacheOverride);
}
function trackCacheMetrics({ preserved, provider, strategy, metrics, inputTokens, cachedTokens, cacheCreationTokens }) {
    const now = new Date().toISOString();
    // Initialize metrics if empty
    if (!metrics) {
        metrics = {
            totalRequests: 0,
            requestsWithCacheControl: 0,
            totalInputTokens: 0,
            totalCachedTokens: 0,
            totalCacheCreationTokens: 0,
            tokensSaved: 0,
            estimatedCostSaved: 0,
            byProvider: {},
            byStrategy: {},
            lastUpdated: now
        };
    }
    // Increment total requests
    metrics.totalRequests++;
    // Track token counts
    const input = inputTokens || 0;
    const cached = cachedTokens || 0;
    const creation = cacheCreationTokens || 0;
    metrics.totalInputTokens += input;
    metrics.totalCachedTokens += cached;
    metrics.totalCacheCreationTokens += creation;
    // Calculate tokens saved (cached tokens are reused, not charged)
    if (cached > 0) {
        metrics.tokensSaved += cached;
    }
    // Only track requests where cache_control was preserved
    if (preserved) {
        metrics.requestsWithCacheControl++;
        // Initialize provider tracking
        if (!metrics.byProvider[provider]) {
            metrics.byProvider[provider] = {
                requests: 0,
                inputTokens: 0,
                cachedTokens: 0,
                cacheCreationTokens: 0
            };
        }
        metrics.byProvider[provider].requests++;
        metrics.byProvider[provider].inputTokens += input;
        metrics.byProvider[provider].cachedTokens += cached;
        metrics.byProvider[provider].cacheCreationTokens += creation;
        // Initialize strategy tracking
        if (strategy && !metrics.byStrategy[strategy]) {
            metrics.byStrategy[strategy] = {
                requests: 0,
                inputTokens: 0,
                cachedTokens: 0,
                cacheCreationTokens: 0
            };
        }
        if (strategy) {
            metrics.byStrategy[strategy].requests++;
            metrics.byStrategy[strategy].inputTokens += input;
            metrics.byStrategy[strategy].cachedTokens += cached;
            metrics.byStrategy[strategy].cacheCreationTokens += creation;
        }
    }
    metrics.lastUpdated = now;
    return metrics;
}
function updateCacheTokenMetrics({ metrics, provider, strategy, inputTokens, cachedTokens, cacheCreationTokens, costSaved }) {
    metrics.totalCachedTokens += cachedTokens;
    metrics.totalCacheCreationTokens += cacheCreationTokens;
    metrics.totalInputTokens += inputTokens;
    // Cached tokens are reused (saved), creation tokens are new cache writes
    metrics.tokensSaved += cachedTokens;
    if (costSaved !== undefined) {
        metrics.estimatedCostSaved += costSaved;
    }
    // Update provider tracking
    if (metrics.byProvider[provider]) {
        metrics.byProvider[provider].cachedTokens += cachedTokens;
        metrics.byProvider[provider].cacheCreationTokens += cacheCreationTokens;
        metrics.byProvider[provider].inputTokens += inputTokens;
    }
    // Update strategy tracking
    if (strategy && metrics.byStrategy[strategy]) {
        metrics.byStrategy[strategy].cachedTokens += cachedTokens;
        metrics.byStrategy[strategy].cacheCreationTokens += cacheCreationTokens;
        metrics.byStrategy[strategy].inputTokens += inputTokens;
    }
    metrics.lastUpdated = new Date().toISOString();
    return metrics;
}
}),
"[project]/open-sse/utils/toolCallArguments.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appendToolCallArgumentDelta",
    ()=>appendToolCallArgumentDelta
]);
/**
 * Accumulate streamed tool-call `arguments` fragments without corrupting them.
 *
 * Providers stream tool-call arguments in one of two shapes:
 *   - Incremental deltas: each chunk carries only the NEW fragment. These must
 *     be concatenated verbatim — even when a fragment's leading bytes repeat the
 *     tail of what we already have (e.g. the doubled `l` in `ls -ll`).
 *   - Full snapshots: each chunk re-sends the ENTIRE accumulated arguments so
 *     far. Concatenating those would duplicate the payload (issue #3701).
 *
 * We only dedup the snapshot case when it is UNAMBIGUOUS: an identical repeat,
 * or a growing superset that still starts with everything seen so far. Every
 * other fragment is treated as an incremental delta and appended as-is.
 *
 * A fuzzy suffix/prefix-overlap heuristic must NOT be used here: it silently
 * drops bytes from legitimate incremental deltas (turning `ll` into `l`, `xx`
 * into `x`), which trades a visible duplication bug for a silent truncation bug.
 *
 * A third, non-conformant shape some upstreams emit (#6459): the FULL
 * `arguments` value delivered as an already-parsed JSON object/array instead
 * of a JSON-encoded string (violates the OpenAI streaming contract, but seen
 * from some Anthropic-shape-passthrough backends). Treating that as "not a
 * string" and silently discarding it left `tool_use.input` empty upstream —
 * or, when a caller re-serialized the buffer with plain string coercion
 * instead of JSON, rendered literally as `[object Object]` in the client
 * transcript. JSON.stringify it into a proper fragment instead of dropping it.
 */ function normalizeIncomingFragment(incoming) {
    if (typeof incoming === "string") return incoming;
    if (incoming == null) return "";
    if (typeof incoming === "object") {
        try {
            return JSON.stringify(incoming);
        } catch  {
            return "";
        }
    }
    return "";
}
function appendToolCallArgumentDelta(current, incoming) {
    const existing = typeof current === "string" ? current : "";
    const next = normalizeIncomingFragment(incoming);
    if (!existing) return next;
    if (!next) return existing;
    // Unambiguous snapshot repeat / growth — replace instead of concatenating.
    if (next === existing) return existing;
    if (next.startsWith(existing)) return next;
    // Incremental delta fragment — append verbatim (preserves repeated chars).
    return existing + next;
}
}),
"[project]/open-sse/utils/streamHelpers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appendBoundedText",
    ()=>appendBoundedText,
    "buildSyntheticChatChunk",
    ()=>buildSyntheticChatChunk,
    "createSSEDataLineNormalizer",
    ()=>createSSEDataLineNormalizer,
    "createSSEEventPrefixBuffer",
    ()=>createSSEEventPrefixBuffer,
    "fixInvalidId",
    ()=>fixInvalidId,
    "formatSSE",
    ()=>formatSSE,
    "hasActiveDeltaValue",
    ()=>hasActiveDeltaValue,
    "hasOpenAIFinishReason",
    ()=>hasOpenAIFinishReason,
    "hasValuableContent",
    ()=>hasValuableContent,
    "injectThinkingSignature",
    ()=>injectThinkingSignature,
    "isKnownNonClaudeStreamPayload",
    ()=>isKnownNonClaudeStreamPayload,
    "isOpenAIChoicesPayload",
    ()=>isOpenAIChoicesPayload,
    "parseSSEDataLines",
    ()=>parseSSEDataLines,
    "parseSSEDataPayload",
    ()=>parseSSEDataPayload,
    "parseSSELine",
    ()=>parseSSELine,
    "stripAnsiCodes",
    ()=>stripAnsiCodes,
    "unwrapGeminiChunk",
    ()=>unwrapGeminiChunk
]);
/**
 * Stream helper utilities for SSE processing.
 *
 * Thinking Content representations (preserved through translation, not normalized):
 * - Claude: `content_block_delta` with `delta.thinking` (string)
 * - OpenAI: `choices[0].delta.reasoning_content` (string)
 * - Gemini: `candidates[0].content.parts[].thought` (boolean flag + text)
 *
 * Each format's thinking field is mapped to the target format's equivalent
 * during translation. No normalization is applied because each consumer
 * expects its native format and normalization would lose format-specific metadata.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [middleware] (ecmascript) <locals>");
;
;
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
/**
 * Matches ANSI/VT100 terminal control sequences plus non-whitespace C0 control
 * codes, while preserving `\t` (0x09), `\n` (0x0a), and `\r` (0x0d).
 *
 * Some upstream CLIs (notably gemini-cli via the `gc/` bridge) prefix SSE frames
 * with cursor-movement escapes such as `\x1b[2K\x1b[1A` to redraw the terminal.
 * Those bytes are not whitespace, so `line.trimStart().startsWith("data:")` fails
 * and the frame is silently dropped, stalling the client SSE parser (issue #2273).
 *
 * The pattern is strictly bounded (no unbounded quantifiers over overlapping
 * alternatives) so it runs in linear time on untrusted input — ReDoS-safe.
 */ const ANSI_ESCAPE_RE = /\x1b(?:\[[0-9;?]*[A-Za-z]|\][^\x07\x1b]*(?:\x07|\x1b\\)|[A-Z\[\]\\^_`])|[\x00-\x08\x0b\x0c\x0e-\x1f]/g;
function stripAnsiCodes(str) {
    if (typeof str !== "string") return str;
    return str.replace(ANSI_ESCAPE_RE, "");
}
function parseSSEDataPayload(data, options = {}) {
    const payload = String(data ?? "").trim();
    if (!payload) return null;
    if (payload === "[DONE]") return {
        done: true
    };
    try {
        const parsed = JSON.parse(payload);
        const eventType = options.eventType;
        if (eventType && isRecord(parsed) && typeof parsed.type !== "string") {
            return {
                ...parsed,
                type: eventType
            };
        }
        return parsed;
    } catch (error) {
        if (options.logWarning !== false && payload.length > 0) {
            console.log(`[WARN] Failed to parse SSE payload (${payload.length} chars): ${payload.substring(0, 200)}...`);
        }
        return null;
    }
}
function parseSSEDataLines(dataLines, options = {}) {
    return parseSSEDataPayload(dataLines.join("\n"), options);
}
function parseSSELine(line) {
    if (!line) return null;
    // Trim leading whitespace before checking field name. Also strip ANSI/VT100
    // escape codes so terminal-redraw-prefixed frames (e.g. gemini-cli `\x1b[2K\x1b[1A`)
    // still resolve to a `data:` line instead of being silently dropped (#2273).
    const trimmed = line.trimStart();
    const clean = stripAnsiCodes(trimmed);
    if (!clean.startsWith("data:")) return null;
    return parseSSEDataPayload(clean.slice(5));
}
function extractSseDataLine(line) {
    const trimmed = stripAnsiCodes(line.trimStart().replace(/\r$/, ""));
    if (!trimmed.startsWith("data:")) return null;
    return trimmed.slice(5).trimStart();
}
function createSSEDataLineNormalizer() {
    let pendingEventLines = [];
    const getPendingDataLines = ()=>pendingEventLines.map((line)=>extractSseDataLine(line)).filter((line)=>line !== null);
    const hasSelfDescribingPendingDataPayload = ()=>{
        const dataLines = getPendingDataLines();
        const parsed = dataLines.length > 0 ? parseSSEDataLines(dataLines, {
            logWarning: false
        }) : null;
        if (!parsed) return false;
        return parsed.done === true || typeof parsed.type === "string" || typeof parsed.object === "string" || Array.isArray(parsed.choices) || Array.isArray(parsed.candidates) || isRecord(parsed.response);
    };
    const flush = (output)=>{
        if (pendingEventLines.length === 0) return;
        const eventLines = pendingEventLines.filter((line)=>line.trim().length > 0);
        const dataLines = [];
        const passthroughLines = [];
        for (const line of eventLines){
            const dataLine = extractSseDataLine(line);
            if (dataLine !== null) {
                dataLines.push(dataLine);
            } else {
                passthroughLines.push(line);
            }
        }
        output.push(...passthroughLines);
        if (dataLines.length > 0) {
            const parsed = parseSSEDataLines(dataLines, {
                logWarning: false
            });
            if (parsed) {
                output.push(parsed.done === true ? "data: [DONE]" : `data: ${JSON.stringify(parsed)}`);
            } else {
                output.push(...eventLines.filter((line)=>extractSseDataLine(line) !== null));
            }
        } else {
            output.push(...eventLines.filter((line)=>extractSseDataLine(line) !== null));
        }
        output.push("");
        pendingEventLines = [];
    };
    return {
        hasPending () {
            return pendingEventLines.length > 0;
        },
        normalize (lines) {
            const output = [];
            for (const line of lines){
                const normalizedLine = line.replace(/\r$/, "");
                const trimmed = normalizedLine.trim();
                if (trimmed && /^(?:event:|id:|retry:|:)/i.test(trimmed) && hasSelfDescribingPendingDataPayload()) {
                    flush(output);
                }
                pendingEventLines.push(normalizedLine);
                if (!trimmed) {
                    flush(output);
                }
            }
            return output;
        }
    };
}
function createSSEEventPrefixBuffer() {
    let lines = [];
    let emitted = false;
    const hasUnemitted = ()=>lines.length > 0 && !emitted;
    const prefix = (output)=>{
        if (!hasUnemitted()) return output;
        emitted = true;
        return `${lines.join("\n")}\n${output}`;
    };
    return {
        clear () {
            lines = [];
            emitted = false;
        },
        eventType () {
            for(let i = lines.length - 1; i >= 0; i--){
                const match = lines[i].trim().match(/^event:\s*(.+)$/i);
                if (match) return match[1].trim();
            }
            return "";
        },
        flush () {
            return hasUnemitted() ? prefix("\n") : "";
        },
        prefixData (output, line) {
            return line.startsWith("data:") ? prefix(output) : output;
        },
        remember (line) {
            lines.push(line);
            emitted = false;
        }
    };
}
function hasOpenAICompatibleStreamValue(parsed) {
    if (!Array.isArray(parsed.choices)) return false;
    return parsed.choices.some((choice)=>{
        if (!isRecord(choice)) return false;
        const delta = isRecord(choice.delta) ? choice.delta : null;
        if (!delta) return false;
        if (typeof delta.content === "string" && delta.content.length > 0) return true;
        if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
            return true;
        }
        if (typeof delta.reasoning_text === "string" && delta.reasoning_text.length > 0) {
            return true;
        }
        return Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0;
    });
}
function hasResponsesStreamValue(parsed, eventType = "") {
    const type = typeof parsed.type === "string" ? parsed.type : eventType;
    if (!type.startsWith("response.")) return false;
    if (type === "response.output_text.delta" || type === "response.reasoning_text.delta" || type === "response.reasoning_summary_text.delta" || type === "response.function_call_arguments.delta") {
        return typeof parsed.delta === "string" && parsed.delta.length > 0 || typeof parsed.text === "string" && parsed.text.length > 0 || typeof parsed.arguments === "string" && parsed.arguments.length > 0;
    }
    if (type === "response.output_item.added" || type === "response.output_item.done") {
        return isRecord(parsed.item);
    }
    if (type === "response.content_part.added") {
        return isRecord(parsed.part);
    }
    if (type === "response.completed" && isRecord(parsed.response)) {
        const output = parsed.response.output;
        return Array.isArray(output) && output.length > 0;
    }
    return false;
}
function hasGeminiCandidateStreamValue(parsed) {
    const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : isRecord(parsed.response) && Array.isArray(parsed.response.candidates) ? parsed.response.candidates : [];
    return candidates.some((candidate)=>{
        if (!isRecord(candidate)) return false;
        const content = isRecord(candidate.content) ? candidate.content : null;
        const parts = Array.isArray(content?.parts) ? content.parts : [];
        return parts.some((part)=>{
            if (!isRecord(part)) return false;
            if (typeof part.text === "string" && part.text.length > 0) return true;
            return isRecord(part.functionCall) || isRecord(part.executableCode);
        });
    });
}
function isOpenAIChoicesPayload(parsed) {
    return Array.isArray(parsed.choices);
}
function hasOpenAIFinishReason(parsed) {
    if (!Array.isArray(parsed.choices)) return false;
    return parsed.choices.some((choice)=>isRecord(choice) && choice.finish_reason != null);
}
function isKnownNonClaudeStreamPayload(parsed, eventType = "") {
    if (Array.isArray(parsed.choices)) {
        return hasOpenAICompatibleStreamValue(parsed);
    }
    const objectType = typeof parsed.object === "string" ? parsed.object : "";
    if (objectType === "chat.completion.chunk" || objectType === "text_completion" || objectType.endsWith(".completion.chunk")) {
        return hasOpenAICompatibleStreamValue(parsed);
    }
    const type = typeof parsed.type === "string" ? parsed.type : eventType;
    if (type.startsWith("response.")) return hasResponsesStreamValue(parsed, eventType);
    if (Array.isArray(parsed.candidates)) return hasGeminiCandidateStreamValue(parsed);
    const response = parsed.response;
    return isRecord(response) && Array.isArray(response.candidates) ? hasGeminiCandidateStreamValue(parsed) : false;
}
function hasValuableContent(chunk, format) {
    // OpenAI format
    if (format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        const choices = Array.isArray(chunk.choices) ? chunk.choices : [];
        const firstChoice = isRecord(choices[0]) ? choices[0] : null;
        const delta = isRecord(firstChoice?.delta) ? firstChoice.delta : null;
        if (!firstChoice || !delta) return false;
        if (typeof delta.content === "string" && delta.content.length > 0) return true;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasAnyReasoningSignal"])(delta)) return true;
        if (Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0) return true;
        if (firstChoice.finish_reason) return true;
        if (typeof delta.role === "string" && delta.role.length > 0) return true;
        return false;
    }
    // Claude format
    if (format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        const isContentBlockDelta = chunk.type === "content_block_delta";
        if (isContentBlockDelta) {
            const delta = isRecord(chunk.delta) ? chunk.delta : {};
            const hasText = typeof delta.text === "string" && delta.text.length > 0;
            const hasThinking = typeof delta.thinking === "string" && delta.thinking.length > 0;
            const hasInputJson = typeof delta.partial_json === "string" && delta.partial_json.length > 0;
            if (!hasText && !hasThinking && !hasInputJson) return false;
        }
        return true;
    }
    // Gemini / Antigravity format: filter chunks with no actual content parts
    if ((format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) && Array.isArray(chunk.candidates) && chunk.candidates[0]) {
        const candidate = isRecord(chunk.candidates[0]) ? chunk.candidates[0] : {};
        // Keep chunks with finish reason or safety ratings (they signal completion)
        if (candidate.finishReason) return true;
        // Filter out chunks where parts array is empty or missing
        const content = isRecord(candidate.content) ? candidate.content : null;
        const parts = Array.isArray(content?.parts) ? content.parts : null;
        if (!parts || parts.length === 0) return false;
        // Filter out chunks where all parts have empty text
        const hasContent = parts.some((p)=>{
            const part = isRecord(p) ? p : {};
            return typeof part.text === "string" && part.text.length > 0 || part.functionCall || part.executableCode;
        });
        return hasContent;
    }
    return true; // Other formats: keep all chunks
}
function unwrapGeminiChunk(parsed) {
    if (!parsed.candidates && isRecord(parsed.response)) {
        return parsed.response;
    }
    return parsed;
}
function fixInvalidId(parsed) {
    if (typeof parsed.id === "string" && (parsed.id === "chat" || parsed.id === "completion" || parsed.id.length < 8)) {
        const extendFields = isRecord(parsed.extend_fields) ? parsed.extend_fields : {};
        const fallbackId = extendFields.requestId || extendFields.traceId || Date.now().toString(36);
        parsed.id = `chatcmpl-${fallbackId}`;
        return true;
    }
    return false;
}
// Remove null perf_metrics from usage (common across formats)
function cleanPerfMetrics(data) {
    if (isRecord(data) && isRecord(data.usage) && data.usage.perf_metrics === null) {
        // Mutate in-place to avoid spread copy per chunk — data is ephemeral, used only for serialization.
        delete data.usage.perf_metrics;
    }
    return data;
}
function formatSSE(data, sourceFormat) {
    if (data === null || data === undefined) return ""; // Skip null/undefined — never send `data: null` (#483)
    if (isRecord(data) && data.done) return "data: [DONE]\n\n";
    // OpenAI Responses API format
    if (isRecord(data) && data.event && data.data) {
        return `event: ${data.event}\ndata: ${JSON.stringify(data.data)}\n\n`;
    }
    // Clean null perf_metrics before serialization
    data = cleanPerfMetrics(data);
    // Claude format
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && isRecord(data) && data.type) {
        return `event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`;
    }
    return `data: ${JSON.stringify(data)}\n\n`;
}
function buildSyntheticChatChunk(responsesId, model, delta, finishReason = null) {
    return {
        id: responsesId || `chatcmpl-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: model || "unknown",
        choices: [
            {
                index: 0,
                delta,
                finish_reason: finishReason
            }
        ]
    };
}
const STREAM_SUMMARY_TEXT_LIMIT = 64 * 1024;
function appendBoundedText(current, next) {
    if (!next) return current;
    // Avoid allocating `current + next` when already at/above limit — slide the window instead.
    if (current.length >= STREAM_SUMMARY_TEXT_LIMIT) {
        const keep = STREAM_SUMMARY_TEXT_LIMIT - next.length;
        if (keep <= 0) return next.slice(-STREAM_SUMMARY_TEXT_LIMIT);
        return current.slice(-keep) + next;
    }
    const combined = current + next;
    if (combined.length <= STREAM_SUMMARY_TEXT_LIMIT) return combined;
    return combined.slice(-STREAM_SUMMARY_TEXT_LIMIT);
}
function hasActiveDeltaValue(value) {
    if (typeof value === "string") return value.length > 0;
    if (Array.isArray(value)) return value.some((entry)=>hasActiveDeltaValue(entry));
    if (value && typeof value === "object") {
        return Object.values(value).some((entry)=>hasActiveDeltaValue(entry));
    }
    return value !== null && value !== undefined;
}
function injectThinkingSignature(parsed, provider) {
    if (provider !== null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider)?.ensureThinkingSignature === true && parsed.type === "content_block_start" && parsed.content_block?.type === "thinking" && parsed.content_block.signature === undefined) {
        parsed.content_block.signature = "";
        return true;
    }
    return false;
}
}),
"[project]/open-sse/utils/responsesCommentaryDrop.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTranslateCommentaryFilter",
    ()=>createTranslateCommentaryFilter,
    "shouldDropResponsesCommentaryEvent",
    ()=>shouldDropResponsesCommentaryEvent
]);
// open-sse/utils/responsesCommentaryDrop.ts
//
// #6199 / #6561 — statefully decide whether a Responses SSE event belongs to
// an internal "commentary" phase item and must be dropped from the
// passthrough stream. The `response.output_item.added` event announces the
// phase; the follow-up delta/done events only carry `item_id`/`output_index`,
// so we key off those (tracked across calls in the two Sets the caller owns).
//
// Extracted out of `stream.ts` (a frozen file — see
// config/quality/file-size-baseline.json) so the #6561 fix (clearing the
// buffered `event:` line alongside every drop) does not grow that file.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
;
;
function extractEventItem(parsed) {
    return parsed.item && typeof parsed.item === "object" && !Array.isArray(parsed.item) ? parsed.item : null;
}
function extractEventItemId(parsed, eventItem) {
    if (typeof parsed.item_id === "string") return parsed.item_id;
    if (eventItem && typeof eventItem.id === "string") return eventItem.id;
    return null;
}
function extractEventOutputIndex(parsed) {
    return typeof parsed.output_index === "number" ? parsed.output_index : null;
}
// The `response.output_item.added` event that announces a new commentary-phase
// item. Records its identifiers so follow-up delta/done events are recognized.
function isCommentaryStart(eventType, parsed, eventItemId, eventOutputIndex, commentaryItemIds, commentaryIndexes) {
    const isAddedEvent = eventType === "response.output_item.added";
    if (!isAddedEvent || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isResponsesCommentaryMessageItem"])(parsed.item)) return false;
    if (eventItemId) commentaryItemIds.add(eventItemId);
    if (eventOutputIndex !== null) commentaryIndexes.add(eventOutputIndex);
    return true;
}
// A follow-up delta/done event for an item already tracked as commentary.
// Untracks the item once its `output_item.done` event is seen.
function isCommentaryContinuation(eventType, eventItemId, eventOutputIndex, commentaryItemIds, commentaryIndexes) {
    const belongsToCommentary = eventItemId !== null && commentaryItemIds.has(eventItemId) || eventOutputIndex !== null && commentaryIndexes.has(eventOutputIndex);
    if (!belongsToCommentary) return false;
    if (eventType === "response.output_item.done") {
        if (eventItemId) commentaryItemIds.delete(eventItemId);
        if (eventOutputIndex !== null) commentaryIndexes.delete(eventOutputIndex);
    }
    return true;
}
function shouldDropResponsesCommentaryEvent(parsed, commentaryItemIds, commentaryIndexes) {
    const eventType = parsed.type;
    const eventItem = extractEventItem(parsed);
    const eventItemId = extractEventItemId(parsed, eventItem);
    const eventOutputIndex = extractEventOutputIndex(parsed);
    return isCommentaryStart(eventType, parsed, eventItemId, eventOutputIndex, commentaryItemIds, commentaryIndexes) || isCommentaryContinuation(eventType, eventItemId, eventOutputIndex, commentaryItemIds, commentaryIndexes);
}
function createTranslateCommentaryFilter(targetFormat) {
    const commentaryItemIds = new Set();
    const commentaryIndexes = new Set();
    const applies = targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
    return (parsed)=>applies && shouldDropResponsesCommentaryEvent(parsed, commentaryItemIds, commentaryIndexes);
}
}),
"[project]/open-sse/utils/streamErrorFormat.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatTranslatedStreamError",
    ()=>formatTranslatedStreamError,
    "normalizeStreamFailurePayload",
    ()=>normalizeStreamFailurePayload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [middleware] (ecmascript)");
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStreamFailureStatus(value) {
    if (typeof value === "number" && Number.isInteger(value) && value >= 400 && value <= 599) {
        return value;
    }
    if (typeof value === "string" && /^\d{3}$/.test(value.trim())) {
        const parsed = Number(value.trim());
        return parsed >= 400 && parsed <= 599 ? parsed : null;
    }
    return null;
}
function looksLikeStreamRateLimit(code, type, message) {
    const haystack = `${code} ${type} ${message}`.toLowerCase();
    return haystack.includes("usage_limit_reached") || haystack.includes("rate_limit") || haystack.includes("rate limit") || haystack.includes("quota") || haystack.includes("too many requests") || haystack.includes("limit reached") || haystack.includes("limit has been reached");
}
function normalizeStreamFailurePayload(payload) {
    const record = payload && typeof payload === "object" ? payload : {};
    const response = asRecord(record.response);
    const error = Object.keys(asRecord(response.error)).length ? asRecord(response.error) : Object.keys(asRecord(record.error)).length ? asRecord(record.error) : record;
    const code = typeof error.code === "string" ? error.code : "upstream_error";
    const type = typeof error.type === "string" ? error.type : undefined;
    const message = typeof error.message === "string" && error.message.trim() ? error.message : typeof record.message === "string" && record.message.trim() ? record.message : "Upstream failure";
    const status = toStreamFailureStatus(error.status_code) ?? toStreamFailureStatus(error.status) ?? toStreamFailureStatus(response.status_code) ?? toStreamFailureStatus(response.status) ?? toStreamFailureStatus(record.status_code) ?? toStreamFailureStatus(record.status) ?? (looksLikeStreamRateLimit(code, type || "", message) ? 429 : 502);
    return {
        status,
        message,
        code,
        ...type ? {
            type
        } : {}
    };
}
function formatTranslatedStreamError(payload, sourceFormat) {
    const failure = normalizeStreamFailurePayload(payload) ?? {
        status: 502,
        message: "Upstream stream error",
        code: "stream_error",
        type: "server_error"
    };
    const errorBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildErrorBody"])(failure.status, failure.message, undefined, {
        type: failure.type ?? "server_error",
        code: failure.code ?? "stream_error"
    });
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
        const failed = {
            type: "response.failed",
            response: {
                id: `resp_error_${Date.now()}`,
                object: "response",
                created_at: Math.floor(Date.now() / 1000),
                status: "failed",
                background: false,
                error: errorBody.error,
                output: []
            },
            sequence_number: 0
        };
        return `event: response.failed\ndata: ${JSON.stringify(failed)}\n\n`;
    }
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        return `event: error\ndata: ${JSON.stringify({
            type: "error",
            error: errorBody.error
        })}\n\n`;
    }
    return `data: ${JSON.stringify(errorBody)}\n\ndata: [DONE]\n\n`;
}
}),
"[project]/open-sse/utils/responsesStreamHelpers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "backfillResponsesCompletedOutput",
    ()=>backfillResponsesCompletedOutput,
    "normalizeResponsesCompletedUsage",
    ()=>normalizeResponsesCompletedUsage,
    "normalizeResponsesSseIds",
    ()=>normalizeResponsesSseIds,
    "pushUniqueResponsesOutputItems",
    ()=>pushUniqueResponsesOutputItems,
    "stringifyIdValue",
    ()=>stringifyIdValue,
    "stripResponsesLifecycleEcho",
    ()=>stripResponsesLifecycleEcho
]);
function stringifyIdValue(value) {
    return value === null || value === undefined ? null : String(value);
}
function normalizeResponsesOutputItemIds(item) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
        return item;
    }
    const record = item;
    let changed = false;
    const normalized = {
        ...record
    };
    const id = stringifyIdValue(record.id);
    if (id !== null && record.id !== id) {
        normalized.id = id;
        changed = true;
    }
    const callId = stringifyIdValue(record.call_id);
    if (callId !== null && record.call_id !== callId) {
        normalized.call_id = callId;
        changed = true;
    }
    return changed ? normalized : item;
}
function normalizeResponsesSseIds(payload) {
    let changed = false;
    for (const key of [
        "response_id",
        "item_id",
        "call_id"
    ]){
        const value = stringifyIdValue(payload[key]);
        if (value !== null && payload[key] !== value) {
            payload[key] = value;
            changed = true;
        }
    }
    if (payload.item && typeof payload.item === "object" && !Array.isArray(payload.item)) {
        const normalizedItem = normalizeResponsesOutputItemIds(payload.item);
        if (normalizedItem !== payload.item) {
            payload.item = normalizedItem;
            changed = true;
        }
    }
    if (payload.response && typeof payload.response === "object" && !Array.isArray(payload.response)) {
        const response = payload.response;
        let responseChanged = false;
        const normalizedResponse = {
            ...response
        };
        const responseId = stringifyIdValue(response.id);
        if (responseId !== null && response.id !== responseId) {
            normalizedResponse.id = responseId;
            responseChanged = true;
        }
        if (Array.isArray(response.output)) {
            const normalizedOutput = response.output.map(normalizeResponsesOutputItemIds);
            if (normalizedOutput.some((item, index)=>item !== response.output[index])) {
                normalizedResponse.output = normalizedOutput;
                responseChanged = true;
            }
        }
        if (responseChanged) {
            payload.response = normalizedResponse;
            changed = true;
        }
    }
    return changed;
}
function buildResponsesOutputItemKey(item) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
    }
    const record = item;
    const type = typeof record.type === "string" ? record.type : "";
    const id = stringifyIdValue(record.id) ?? "";
    const callId = stringifyIdValue(record.call_id) ?? "";
    const outputIndex = typeof record.output_index === "number" ? record.output_index : "";
    const name = typeof record.name === "string" ? record.name : "";
    if (!type && !id && !callId) {
        return null;
    }
    return `${type}:${id}:${callId}:${outputIndex}:${name}`;
}
function pushUniqueResponsesOutputItems(target, items) {
    const seen = new Set();
    for (const existingItem of target){
        const key = buildResponsesOutputItemKey(existingItem);
        if (key) {
            seen.add(key);
        }
    }
    for (const item of items){
        const key = buildResponsesOutputItemKey(item);
        if (key && seen.has(key)) {
            continue;
        }
        target.push(item);
        if (key) {
            seen.add(key);
        }
    }
}
function backfillResponsesCompletedOutput(parsed, collectedItems) {
    if (!collectedItems.length) return false;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    const obj = parsed;
    if (obj.type !== "response.completed") return false;
    const resp = obj.response;
    if (!resp || typeof resp !== "object" || Array.isArray(resp)) return false;
    const r = resp;
    const existing = r.output;
    if (Array.isArray(existing) && existing.length > 0) return false;
    r.output = collectedItems.slice();
    return true;
}
function normalizeResponsesCompletedUsage(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    const obj = parsed;
    if (obj.type !== "response.completed") return false;
    if (!obj.response || typeof obj.response !== "object" || Array.isArray(obj.response)) {
        return false;
    }
    const response = obj.response;
    const current = response.usage && typeof response.usage === "object" && !Array.isArray(response.usage) ? response.usage : {};
    const finiteNumber = (value)=>{
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    };
    const inputTokens = finiteNumber(current.input_tokens) ?? finiteNumber(current.prompt_tokens) ?? 0;
    const outputTokens = finiteNumber(current.output_tokens) ?? finiteNumber(current.completion_tokens) ?? 0;
    const totalTokens = finiteNumber(current.total_tokens) ?? inputTokens + outputTokens;
    const normalized = {
        ...current,
        input_tokens: inputTokens,
        output_tokens: outputTokens
    };
    normalized.total_tokens = totalTokens;
    const changed = !response.usage || current.input_tokens !== inputTokens || current.output_tokens !== outputTokens || current.total_tokens !== totalTokens;
    response.usage = normalized;
    return changed;
}
const RESPONSES_LIFECYCLE_EVENT_TYPES = new Set([
    "response.created",
    "response.in_progress",
    "response.completed"
]);
function stripResponsesLifecycleEcho(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    const obj = parsed;
    if (typeof obj.type !== "string" || !RESPONSES_LIFECYCLE_EVENT_TYPES.has(obj.type)) {
        return false;
    }
    const resp = obj.response;
    if (!resp || typeof resp !== "object" || Array.isArray(resp)) return false;
    const r = resp;
    let changed = false;
    if ("instructions" in r) {
        delete r.instructions;
        changed = true;
    }
    // Preserve tools on the terminal snapshot: response.completed is what
    // Codex CLI rebuilds its tool list from (#8990). Same special-case as
    // backfillResponsesCompletedOutput. Still stripped on created/in_progress.
    if (obj.type !== "response.completed" && "tools" in r) {
        delete r.tools;
        changed = true;
    }
    return changed;
}
}),
"[project]/open-sse/utils/passthroughTailProcessor.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "processBufferedPassthroughLine",
    ()=>processBufferedPassthroughLine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/usageTracking.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesStreamHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function getFunctionCallPendingKey(item) {
    if (!item) return null;
    if (typeof item.id === "string") return item.id;
    if (typeof item.call_id === "string") return item.call_id;
    return null;
}
function handleResponsesTailPayload(parsed, output, context) {
    const responsesIdsNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeResponsesSseIds"])(parsed);
    const parsedResponse = asRecord(parsed.response);
    const responseId = (parsedResponse ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(parsedResponse.id) : null) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(parsed.response_id);
    if (responseId) {
        context.setPassthroughResponsesId(responseId);
    }
    const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed);
    if (extracted) {
        context.setUsage(extracted);
    }
    if (typeof parsed.delta === "string") {
        context.addTotalContentLength(parsed.delta.length);
    }
    if (parsed.type === "response.output_text.delta" && typeof parsed.delta === "string") {
        context.appendPassthroughContent(parsed.delta);
    }
    if (parsed.type === "response.reasoning_summary_text.delta" || parsed.type === "response.reasoning_summary_text.done" || parsed.type === "response.reasoning_summary_part.done") {
        const reasoningKey = context.getResponsesReasoningKey(parsed);
        if (reasoningKey) {
            context.markResponsesReasoningSummarySeen(reasoningKey);
        }
    }
    if (parsed.type === "response.output_item.added" && asRecord(parsed.item).type === "function_call") {
        const item = {
            ...parsed.item
        };
        const pendingKey = getFunctionCallPendingKey(item);
        if (pendingKey) {
            if (typeof item.arguments !== "string") {
                item.arguments = "";
            }
            context.passthroughResponsesPendingFunctionCalls.set(pendingKey, item);
            context.setPassthroughResponsesCurrentFunctionCallKey(pendingKey);
        }
    }
    if (parsed.type === "response.function_call_arguments.delta") {
        const pendingKey = typeof parsed.item_id === "string" ? parsed.item_id : context.getPassthroughResponsesCurrentFunctionCallKey();
        const pending = pendingKey ? context.passthroughResponsesPendingFunctionCalls.get(pendingKey) : undefined;
        if (pending && typeof parsed.delta === "string") {
            const previousArgs = typeof pending.arguments === "string" ? pending.arguments : "";
            pending.arguments = previousArgs + parsed.delta;
        }
    }
    if (parsed.type === "response.function_call_arguments.done") {
        const pendingKey = typeof parsed.item_id === "string" ? parsed.item_id : context.getPassthroughResponsesCurrentFunctionCallKey();
        const pending = pendingKey ? context.passthroughResponsesPendingFunctionCalls.get(pendingKey) : undefined;
        if (pending) {
            if (typeof parsed.arguments === "string") {
                pending.arguments = parsed.arguments;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(context.passthroughResponsesOutputItems, [
                pending
            ]);
        }
    }
    if (parsed.type === "response.output_item.done" && parsed.item) {
        context.emitSyntheticResponsesReasoningSummary(parsed);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(context.passthroughResponsesOutputItems, [
            parsed.item
        ]);
        const item = asRecord(parsed.item);
        if (item.type === "function_call") {
            const pendingKey = getFunctionCallPendingKey(item);
            if (pendingKey) {
                context.passthroughResponsesPendingFunctionCalls.delete(pendingKey);
                if (context.getPassthroughResponsesCurrentFunctionCallKey() === pendingKey) {
                    context.setPassthroughResponsesCurrentFunctionCallKey(null);
                }
            }
        }
    }
    if (parsed.type === "response.completed" && Array.isArray(asRecord(parsed.response).output) && asRecord(parsed.response).output.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(context.passthroughResponsesOutputItems, asRecord(parsed.response).output);
    }
    if (parsed.type === "response.completed" && context.passthroughResponsesPendingFunctionCalls.size > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(context.passthroughResponsesOutputItems, [
            ...context.passthroughResponsesPendingFunctionCalls.values()
        ]);
        context.passthroughResponsesPendingFunctionCalls.clear();
        context.setPassthroughResponsesCurrentFunctionCallKey(null);
    }
    const textualToolCallBackfilled = parsed.type === "response.completed" && context.hasPassthroughToolCalls();
    const outputPayload = textualToolCallBackfilled ? context.toResponsesCompletedWithToolCalls(parsed) : parsed;
    const usageNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeResponsesCompletedUsage"])(outputPayload);
    const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripResponsesLifecycleEcho"])(outputPayload);
    const backfilled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["backfillResponsesCompletedOutput"])(outputPayload, context.passthroughResponsesOutputItems);
    if (stripped || backfilled || textualToolCallBackfilled || responsesIdsNormalized || usageNormalized) {
        output = `data: ${JSON.stringify(outputPayload)}\n\n`;
    }
    return output;
}
function handleOpenAiTailPayload(parsed, context) {
    const firstChoice = Array.isArray(parsed.choices) ? parsed.choices[0] : undefined;
    const delta = asRecord(firstChoice?.delta);
    if (typeof delta.content === "string") {
        context.appendPassthroughContent(delta.content);
        context.addTotalContentLength(delta.content.length);
    }
    const reasoningDelta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAnyReasoningValue"])(delta);
    if (reasoningDelta) {
        context.appendPassthroughReasoning(reasoningDelta);
    }
}
function processBufferedPassthroughLine(line, context) {
    const trimmed = line.trim();
    if (context.getSkipPassthroughEvent()) {
        if (!trimmed) {
            context.setSkipPassthroughEvent(false);
            context.clearPendingPassthroughEvent();
        }
        return false;
    }
    if (/^event:\s*keepalive\b/i.test(trimmed)) {
        context.setSkipPassthroughEvent(true);
        context.clearPendingPassthroughEvent();
        return false;
    }
    if (/^event:/i.test(trimmed)) {
        const eventType = trimmed.replace(/^event:\s*/i, "");
        if (context.shouldAbortOnClaudeLifecycle({
            type: eventType
        })) {
            context.emitClaudeEmptyStreamErrorAndAbort();
            return true;
        }
        context.passthroughEventPrefix.remember(line);
        return false;
    }
    if (/^(?::|id:|retry:)/i.test(trimmed)) {
        context.passthroughEventPrefix.remember(line);
        return false;
    }
    if (!trimmed) {
        const pendingOutput = context.passthroughEventPrefix.flush();
        if (pendingOutput) {
            context.emitConvertedOutput(pendingOutput);
        }
        context.clearPendingPassthroughEvent();
        return false;
    }
    if (!trimmed.startsWith("data:")) {
        context.passthroughEventPrefix.remember(line);
        return false;
    }
    const parsedPassthroughData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseSSEDataPayload"])(trimmed.slice(5), {
        eventType: context.passthroughEventPrefix.eventType()
    });
    if (parsedPassthroughData?.done === true) {
        return false;
    }
    let output = line.startsWith("data:") && !line.startsWith("data: ") ? `data: ${line.slice(5)}\n\n` : `${line}\n\n`;
    if (parsedPassthroughData) {
        context.pushProviderPayload(parsedPassthroughData);
        if (context.shouldAbortOnClaudeLifecycle(parsedPassthroughData)) {
            context.emitClaudeEmptyStreamErrorAndAbort();
            return true;
        }
        if (context.isClaudeEventPayload(parsedPassthroughData)) {
            context.updateClaudeEmptyResponseLifecycle(parsedPassthroughData);
        }
        const parsed = parsedPassthroughData;
        const parsedType = typeof parsed.type === "string" ? parsed.type : "";
        const isResponses = parsedType.startsWith("response.");
        const isClaude = context.isClaudeEventPayload(parsed);
        if (isResponses) {
            output = handleResponsesTailPayload(parsed, output, context);
        } else if (!isClaude) {
            const restoredToolName = context.restoreOpenAIToolNames(parsed);
            handleOpenAiTailPayload(parsed, context);
            if (restoredToolName) output = `data: ${JSON.stringify(parsed)}\n\n`;
        }
        context.pushClientPayload(parsed);
    }
    output = context.passthroughEventPrefix.prefixData(output, line);
    context.emitConvertedOutput(output);
    return false;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/utils/thinkTagParser.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyThinkTag",
    ()=>applyThinkTag,
    "containsOrMayEndWithThinkOpenTag",
    ()=>containsOrMayEndWithThinkOpenTag,
    "extractThinkTags",
    ()=>extractThinkTags,
    "flushThink",
    ()=>flushThink,
    "flushThinkBuffer",
    ()=>flushThinkBuffer,
    "hasThinkTags",
    ()=>hasThinkTags,
    "initThinkState",
    ()=>initThinkState,
    "processStreamingThinkDelta",
    ()=>processStreamingThinkDelta
]);
/**
 * Think Tag Parser
 *
 * Parses <think>...</think> tags from LLM output and converts them
 * to a structured `reasoning_content` field.
 *
 * Used by providers like DeepSeek, Qwen, and Qoder that embed
 * chain-of-thought reasoning inside <think> tags.
 *
 * Usage:
 *   import { extractThinkTags, hasThinkTags } from "./thinkTagParser.ts";
 *
 *   const { reasoning, content } = extractThinkTags(rawOutput);
 *   // reasoning = "step-by-step thinking..."
 *   // content = "final answer..."
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer/reasoning.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHelpers.ts [middleware] (ecmascript)");
;
;
const THINK_OPEN = "<think>";
const THINK_CLOSE = "</think>";
function initThinkState(isPassthroughMode, provider, model) {
    return {
        enabled: isPassthroughMode && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["shouldParseTextualReasoningTags"])(provider, model),
        insideThink: false,
        buffer: "",
        active: false,
        model
    };
}
function containsOrMayEndWithThinkOpenTag(value) {
    return value.includes(THINK_OPEN) || [
        "<",
        "<t",
        "<th",
        "<thi",
        "<thin"
    ].some((suffix)=>value.endsWith(suffix));
}
function hasThinkTags(text) {
    if (!text) return false;
    return text.includes(THINK_OPEN);
}
function extractThinkTags(text) {
    if (!text || !text.includes(THINK_OPEN)) {
        return {
            reasoning: null,
            content: text || ""
        };
    }
    let reasoning = "";
    let content = text;
    let iterations = 0;
    const maxIterations = 10; // safety limit
    while(content.includes(THINK_OPEN) && iterations < maxIterations){
        const openIdx = content.indexOf(THINK_OPEN);
        const closeIdx = content.indexOf(THINK_CLOSE, openIdx);
        if (closeIdx === -1) {
            // Unclosed think tag — treat everything after <think> as reasoning
            reasoning += content.slice(openIdx + THINK_OPEN.length);
            content = content.slice(0, openIdx);
            break;
        }
        // Extract the think content
        const thinkContent = content.slice(openIdx + THINK_OPEN.length, closeIdx);
        reasoning += (reasoning ? "\n" : "") + thinkContent;
        // Remove the think block from content
        content = content.slice(0, openIdx) + content.slice(closeIdx + THINK_CLOSE.length);
        iterations++;
    }
    return {
        reasoning: reasoning.trim() || null,
        content: content.trim()
    };
}
function processStreamingThinkDelta(delta, ctx) {
    if (!ctx.buffer) ctx.buffer = "";
    ctx.buffer += delta;
    let reasoningDelta = "";
    let contentDelta = "";
    while(ctx.buffer.length > 0){
        if (ctx.insideThink) {
            // Looking for closing tag
            const closeIdx = ctx.buffer.indexOf(THINK_CLOSE);
            if (closeIdx === -1) {
                // Might be a partial tag at the end — keep last few chars
                if (ctx.buffer.length > THINK_CLOSE.length) {
                    const safe = ctx.buffer.slice(0, -(THINK_CLOSE.length - 1));
                    reasoningDelta += safe;
                    ctx.buffer = ctx.buffer.slice(-(THINK_CLOSE.length - 1));
                }
                break;
            }
            reasoningDelta += ctx.buffer.slice(0, closeIdx);
            ctx.buffer = ctx.buffer.slice(closeIdx + THINK_CLOSE.length);
            ctx.insideThink = false;
        } else {
            // Looking for opening tag
            const openIdx = ctx.buffer.indexOf(THINK_OPEN);
            if (openIdx === -1) {
                // Might be a partial tag at the end
                if (ctx.buffer.length > THINK_OPEN.length) {
                    const safe = ctx.buffer.slice(0, -(THINK_OPEN.length - 1));
                    contentDelta += safe;
                    ctx.buffer = ctx.buffer.slice(-(THINK_OPEN.length - 1));
                }
                break;
            }
            contentDelta += ctx.buffer.slice(0, openIdx);
            ctx.buffer = ctx.buffer.slice(openIdx + THINK_OPEN.length);
            ctx.insideThink = true;
        }
    }
    return {
        reasoningDelta: reasoningDelta || null,
        contentDelta: contentDelta || null
    };
}
function applyThinkTag(ctx, delta) {
    if (!ctx.enabled || typeof delta?.content !== "string") return false;
    if (!ctx.active && !containsOrMayEndWithThinkOpenTag(delta.content)) return false;
    ctx.active = true;
    const { reasoningDelta, contentDelta } = processStreamingThinkDelta(delta.content, ctx);
    delta.content = contentDelta || "";
    if (reasoningDelta) delta.reasoning_content = reasoningDelta;
    return true;
}
function flushThinkBuffer(ctx) {
    if (!ctx.buffer) return {
        reasoningDelta: null,
        contentDelta: null
    };
    const remaining = ctx.buffer;
    ctx.buffer = "";
    if (ctx.insideThink) {
        return {
            reasoningDelta: remaining || null,
            contentDelta: null
        };
    }
    return {
        reasoningDelta: null,
        contentDelta: remaining || null
    };
}
function flushThink(ctx, responsesId, accReasoning, accContent) {
    if (!ctx.enabled || !ctx.active) return null;
    const { reasoningDelta, contentDelta } = flushThinkBuffer(ctx);
    if (!reasoningDelta && !contentDelta) return null;
    const delta = {};
    if (reasoningDelta) delta.reasoning_content = reasoningDelta;
    if (contentDelta) delta.content = contentDelta;
    const syntheticChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildSyntheticChatChunk"])(responsesId, ctx.model, delta);
    return {
        syntheticChunk,
        flushOutput: `data: ${JSON.stringify(syntheticChunk)}\n\n`,
        reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(accReasoning, reasoningDelta || ""),
        content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(accContent, contentDelta || ""),
        addedLength: (reasoningDelta?.length || 0) + (contentDelta?.length || 0)
    };
}
}),
"[project]/open-sse/utils/openAIStreamChunk.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeFinalOpenAIStreamChunk",
    ()=>normalizeFinalOpenAIStreamChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [middleware] (ecmascript)");
;
function normalizeFinalOpenAIStreamChunk(parsed, toolNameMap) {
    let changed = false;
    if (parsed.id != null && typeof parsed.id !== "string") {
        parsed.id = String(parsed.id);
        changed = true;
    }
    if (Array.isArray(parsed.choices)) {
        for (const choice of parsed.choices){
            const delta = choice?.delta;
            if (!Array.isArray(delta?.tool_calls)) continue;
            for (const toolCall of delta.tool_calls){
                if (toolCall?.id != null && typeof toolCall.id !== "string") {
                    toolCall.id = String(toolCall.id);
                    changed = true;
                }
            }
        }
    }
    changed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(parsed, toolNameMap) || changed;
    const firstChoice = Array.isArray(parsed.choices) ? parsed.choices[0] : undefined;
    return {
        changed,
        hasFinishReason: Boolean(firstChoice?.finish_reason)
    };
}
}),
"[project]/open-sse/utils/stream.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PENDING_REQUEST_CLEARED_MARKER",
    ()=>PENDING_REQUEST_CLEARED_MARKER,
    "createPassthroughStreamWithLogger",
    ()=>createPassthroughStreamWithLogger,
    "createSSEStream",
    ()=>createSSEStream,
    "createSSETransformStreamWithLogger",
    ()=>createSSETransformStreamWithLogger,
    "default",
    ()=>__TURBOPACK__default__export__,
    "toResponsesFunctionCallItem",
    ()=>toResponsesFunctionCallItem,
    "toStreamingToolCallDelta",
    ()=>toStreamingToolCallDelta,
    "withBodyTimeout",
    ()=>withBodyTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/index.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/usageTracking.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamPayloadCollector.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesCommentaryDrop$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesCommentaryDrop.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/textualToolCall.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamErrorFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamErrorFormat.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolLatencyTracker$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/toolLatencyTracker.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$toolSchemas$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/toolSchemas.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionManager.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesStreamHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$passthroughTailProcessor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/passthroughTailProcessor.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/pureHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkTagParser$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/thinkTagParser.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$openAIStreamChunk$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/openAIStreamChunk.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$passthroughTailProcessor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$passthroughTailProcessor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function withBodyTimeout(promise, timeoutMs = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_BODY_TIMEOUT_MS"]) {
    if (timeoutMs <= 0) return promise;
    let timer;
    const timeout = new Promise((_, reject)=>{
        timer = setTimeout(()=>{
            const err = new Error(`Response body read timeout after ${timeoutMs}ms`);
            err.name = "BodyTimeoutError";
            reject(err);
        }, timeoutMs);
    });
    return Promise.race([
        promise,
        timeout
    ]).finally(()=>clearTimeout(timer));
}
;
;
const PENDING_REQUEST_CLEARED_MARKER = "__omniroutePendingRequestCleared";
function markPendingRequestCleared(error) {
    error[PENDING_REQUEST_CLEARED_MARKER] = true;
    return error;
}
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
// #7936 — restore `{namespace, name}` on Responses passthrough `function_call`
// items when the request-side Responses→Chat flatten stamped the bare leaf on the
// Chat wire. Codex's ResponseItem::FunctionCall schema declares an independent
// `namespace: Option<String>` field (see codex-rs/protocol/src/models.rs and the
// `function_call_deserializes_optional_namespace` round-trip test); emit it back.
function restoreResponsesPassthroughFunctionCallIdentity(parsed, requestToolIdentityMap) {
    if (!(requestToolIdentityMap instanceof Map)) return false;
    const restoreItem = (item)=>{
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const functionCall = item;
        if (functionCall.type !== "function_call" || typeof functionCall.name !== "string") return false;
        const identity = requestToolIdentityMap.get(functionCall.name);
        if (!identity) return false;
        const changed = functionCall.namespace !== identity.namespace || functionCall.name !== identity.name;
        functionCall.namespace = identity.namespace;
        functionCall.name = identity.name;
        return changed;
    };
    if (parsed.type === "response.output_item.added" || parsed.type === "response.output_item.done") {
        return restoreItem(parsed.item);
    }
    if (parsed.type === "response.completed" && Array.isArray(asRecord(parsed.response).output)) {
        return asRecord(parsed.response).output.reduce((changed, item)=>restoreItem(item) || changed, false);
    }
    return false;
}
function parseTextualToolCallFromContent(text) {
    const candidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(text);
    return candidate?.kind === "complete" ? {
        name: candidate.name,
        args: candidate.args
    } : null;
}
function containsTextualToolCallCandidate(text) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(text) !== null;
}
function containsMalformedTextualToolCall(text, allowedToolNames) {
    if (typeof text !== "string") return false;
    const normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    let searchIdx = 0;
    while(true){
        const idx = normalized.indexOf("[Tool call:", searchIdx);
        if (idx === -1) break;
        const candidate = normalized.slice(idx);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isValidToolCallHeaderPrefix"])(candidate)) {
            const parsed = parseTextualToolCallFromContent(candidate);
            if (parsed) {
                if (allowedToolNames?.size && !allowedToolNames.has(parsed.name)) {
                    return true;
                }
            } else {
                return true;
            }
        }
        searchIdx = idx + 1;
    }
    return false;
}
function extractAllowedToolNames(body) {
    const record = asRecord(body);
    const tools = record.tools;
    if (!Array.isArray(tools)) return null;
    const names = new Set();
    for (const tool of tools){
        if (!tool || typeof tool !== "object" || Array.isArray(tool)) continue;
        const item = tool;
        const directName = typeof item.name === "string" ? item.name.trim() : "";
        const fn = item.function && typeof item.function === "object" && !Array.isArray(item.function) ? item.function : null;
        const functionName = typeof fn?.name === "string" ? fn.name.trim() : "";
        const name = functionName || directName;
        if (name) names.add(name);
    }
    return names.size > 0 ? names : null;
}
function collectPassthroughTextualToolCall(text, toolCalls, allowedToolNames) {
    const parsed = parseTextualToolCallFromContent(text);
    if (!parsed) return null;
    if (allowedToolNames?.size && !allowedToolNames.has(parsed.name)) return null;
    const key = `textual:${toolCalls.size}`;
    const toolCall = {
        id: `call_${Date.now()}_${toolCalls.size}`,
        index: toolCalls.size,
        type: "function",
        function: {
            name: parsed.name,
            arguments: JSON.stringify(parsed.args || {})
        }
    };
    toolCalls.set(key, toolCall);
    return toolCall;
}
function toStreamingToolCallDelta(toolCall) {
    return {
        index: toolCall.index,
        id: toolCall.id != null ? String(toolCall.id) : null,
        type: toolCall.type,
        function: {
            name: toolCall.function.name,
            arguments: toolCall.function.arguments
        }
    };
}
function toResponsesFunctionCallItem(toolCall) {
    return {
        type: "function_call",
        id: (toolCall.id != null ? String(toolCall.id) : null) || `fc_${toolCall.index}`,
        call_id: (toolCall.id != null ? String(toolCall.id) : null) || `call_${toolCall.index}`,
        name: toolCall.function.name,
        arguments: toolCall.function.arguments,
        status: "completed"
    };
}
function buildResponsesFunctionCallEvents(toolCall) {
    const item = toResponsesFunctionCallItem(toolCall);
    return [
        {
            type: "response.output_item.added",
            output_index: toolCall.index,
            item
        },
        {
            type: "response.function_call_arguments.done",
            item_id: item.id,
            output_index: toolCall.index,
            arguments: toolCall.function.arguments
        },
        {
            type: "response.output_item.done",
            output_index: toolCall.index,
            item
        }
    ];
}
function formatSSEDataEvents(events) {
    return events.map((event)=>`data: ${JSON.stringify(event)}\n\n`).join("");
}
function toChatCompletionChunkWithToolCall(base, toolCall) {
    const choice = asRecord(Array.isArray(base.choices) ? base.choices[0] : null);
    const delta = {
        ...asRecord(choice.delta)
    };
    delete delta.content;
    delete delta.reasoning_content;
    return {
        ...base,
        choices: [
            {
                ...choice,
                index: typeof choice.index === "number" ? choice.index : 0,
                delta: {
                    ...delta,
                    tool_calls: [
                        toStreamingToolCallDelta(toolCall)
                    ]
                },
                finish_reason: null
            }
        ]
    };
}
function toResponsesCompletedWithToolCalls(parsed, toolCalls) {
    const response = asRecord(parsed.response);
    const existingOutput = Array.isArray(response.output) ? response.output : [];
    return {
        ...parsed,
        response: {
            ...response,
            output: [
                ...existingOutput,
                ...toolCalls.map((toolCall)=>toResponsesFunctionCallItem(toolCall))
            ]
        }
    };
}
const SYNTHETIC_CLAUDE_EMPTY_RESPONSE_TEXT = "";
function createClaudeEmptyResponseLifecycle() {
    return {
        hasMessageStart: false,
        hasContentBlock: false,
        hasMessageDelta: false,
        hasMessageStop: false,
        hasError: false,
        syntheticContentInjected: false,
        warningLogged: false
    };
}
function getClaudeEventType(payload) {
    if (!payload || typeof payload !== "object") return null;
    const type = payload.type;
    return typeof type === "string" ? type : null;
}
function isClaudeEventPayload(payload) {
    return getClaudeEventType(payload) !== null;
}
function updateClaudeEmptyResponseLifecycle(lifecycle, payload) {
    const type = getClaudeEventType(payload);
    if (!type) return;
    switch(type){
        case "message_start":
            lifecycle.hasMessageStart = true;
            break;
        case "content_block_start":
        case "content_block_delta":
        case "content_block_stop":
            lifecycle.hasContentBlock = true;
            break;
        case "message_delta":
            lifecycle.hasMessageDelta = true;
            break;
        case "message_stop":
            lifecycle.hasMessageStop = true;
            break;
        case "error":
            lifecycle.hasError = true;
            break;
        default:
            break;
    }
}
function hasClaudeAssistantLifecycle(lifecycle) {
    return lifecycle.hasMessageStart || lifecycle.hasMessageDelta || lifecycle.hasMessageStop;
}
function shouldInjectClaudeEmptyResponseBeforeCurrentEvent(lifecycle, payload) {
    const type = getClaudeEventType(payload);
    if (!type || lifecycle.hasError || lifecycle.hasContentBlock) return false;
    if (!hasClaudeAssistantLifecycle(lifecycle)) return false;
    return type === "message_delta" || type === "message_stop";
}
function shouldInjectClaudeEmptyResponseOnFlush(lifecycle) {
    if (lifecycle.hasError || lifecycle.hasContentBlock) return false;
    return hasClaudeAssistantLifecycle(lifecycle);
}
function shouldInjectClaudeMissingFinalizersOnFlush(lifecycle) {
    if (lifecycle.hasError || !lifecycle.syntheticContentInjected) return false;
    return !lifecycle.hasMessageDelta || !lifecycle.hasMessageStop;
}
function buildSyntheticClaudeEmptyResponseEvents(lifecycle, model, options = {}) {
    const { includeContentBlock = true, includeMessageDelta = false, includeMessageStop = false } = options;
    const events = [];
    const resolvedModel = typeof model === "string" && model ? model : "unknown";
    if (includeContentBlock) {
        if (!lifecycle.hasMessageStart) {
            events.push({
                type: "message_start",
                message: {
                    id: `msg_synthetic_${Date.now()}`,
                    type: "message",
                    role: "assistant",
                    model: resolvedModel,
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
        events.push({
            type: "content_block_start",
            index: 0,
            content_block: {
                type: "text",
                text: ""
            }
        }, {
            type: "content_block_delta",
            index: 0,
            delta: {
                type: "text_delta",
                text: SYNTHETIC_CLAUDE_EMPTY_RESPONSE_TEXT
            }
        }, {
            type: "content_block_stop",
            index: 0
        });
    }
    if (includeMessageDelta) {
        events.push({
            type: "message_delta",
            delta: {
                stop_reason: "end_turn",
                stop_sequence: null
            },
            usage: {
                input_tokens: 0,
                output_tokens: 0
            }
        });
    }
    if (includeMessageStop) {
        events.push({
            type: "message_stop"
        });
    }
    return events;
}
function getOpenAIIntermediateChunks(value) {
    if (!value || typeof value !== "object") return [];
    const candidate = value._openaiIntermediate;
    return Array.isArray(candidate) ? candidate : [];
}
function restoreClaudePassthroughToolUseName(parsed, toolNameMap) {
    if (!(toolNameMap instanceof Map)) return false;
    if (!parsed || typeof parsed !== "object") return false;
    const block = parsed.content_block && typeof parsed.content_block === "object" ? parsed.content_block : null;
    if (!block || block.type !== "tool_use" || typeof block.name !== "string") return false;
    const restoredName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(block.name, toolNameMap) ?? block.name;
    if (restoredName === block.name) return false;
    block.name = restoredName;
    return true;
}
// Note: TextDecoder/TextEncoder are created per-stream inside createSSEStream()
// to avoid shared state issues with concurrent streams (TextDecoder with {stream:true}
// maintains internal buffering state between decode() calls).
// Stream modes
const STREAM_MODE = {
    TRANSLATE: "translate",
    PASSTHROUGH: "passthrough"
};
function createSSEStream(options = {}) {
    const { mode = STREAM_MODE.TRANSLATE, targetFormat, sourceFormat, clientResponseFormat = null, copilotCompatibleReasoning = false, suppressThinkClose = false, provider = null, reqLogger = null, toolNameMap = null, model = null, connectionId = null, apiKeyInfo = null, body = null, onComplete = null, onFailure = null, dropResponsesCommentary, customToolNames = new Set(), requestToolIdentityMap = null } = options;
    const signatureNamespace = connectionId;
    // Request-body-size metric (for monitoring payload size distribution & correlation with TTFT).
    // The size is JSON-serialised byte count; stored as a performance mark detail so monitoring
    // tools can query performance.getEntriesByType("mark") filtered by name.
    let bodySize = 0;
    try {
        bodySize = body ? Buffer.byteLength(JSON.stringify(body), "utf8") : 0;
    } catch  {
    /* body may not be JSON-serialisable (e.g. FormData, Blob) — metric stays 0 */ }
    if (bodySize > 0) {
        // Cleared immediately: this is a fixed-name mark created on every stream, so
        // leaving it in the global performance timeline would accumulate without bound
        // over a long-running server's lifetime. A wired PerformanceObserver still
        // receives the entry (delivery is queued independently of the buffer) even though
        // clearMarks() removes it from getEntriesByName()/getEntriesByType() right after.
        performance.mark("omni-request-body-size", {
            detail: bodySize
        });
        performance.clearMarks("omni-request-body-size");
    }
    // Drop internal commentary-phase Responses output before forwarding (#6199).
    // Explicit option wins; otherwise read the feature flag (default on) — resolved once per stream.
    const shouldDropResponsesCommentary = dropResponsesCommentary ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("RESPONSES_PASSTHROUGH_DROP_COMMENTARY");
    const clientExpectsResponsesStream = (mode === STREAM_MODE.PASSTHROUGH ? clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES : sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) === true;
    // Clients whose SSE protocol terminates naturally on the last
    // provider-shape event (not on a `data: [DONE]` line). Emitting
    // `[DONE]` to these clients produces a parser error in the SDK and
    // breaks follow-up turns (Capy/Anthropic SDK: text gets stuck in the
    // "Thought" area; subsequent /v1/messages calls retry into a corrupt
    // state). Skip the `[DONE]` for these formats.
    const clientExpectsClaudeStream = (mode === STREAM_MODE.PASSTHROUGH ? clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE : sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) === true;
    // Antigravity/cloudcode streams terminate naturally on their last
    // `data: {"response":{...}}` event, not on a `[DONE]` marker. Emitting
    // `[DONE]` to the Antigravity IDE causes a protobuf parse failure
    // (proto: syntax error (line 1:1): unexpected token [) because the
    // Go binary's protobuf deserializer receives `[DONE]` as input.
    const clientExpectsAntigravityStream = (mode === STREAM_MODE.PASSTHROUGH ? clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY : sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) === true;
    // Single source of truth for the [DONE] decision, used at both emission
    // sites below. Only OpenAI Chat Completions clients expect [DONE];
    // Responses API, Anthropic SSE, and Antigravity/cloudcode terminate on
    // their own protocol events (response.completed / message_stop / last
    // response candidate respectively).
    const shouldEmitDoneTerminator = !clientExpectsResponsesStream && !clientExpectsClaudeStream && !clientExpectsAntigravityStream;
    let buffer = "";
    let usage = null;
    /** Passthrough (OpenAI CC shape): saw tool_calls in stream before finish_reason */ let passthroughHasToolCalls = false;
    /** Passthrough: whether a chunk with non-null finish_reason was seen (#7800) */ let passthroughSawFinishReason = false;
    /** Passthrough: accumulate tool_calls deltas for call log responseBody */ const passthroughToolCalls = new Map();
    let passthroughToolCallSeq = 0;
    const allowedToolNames = extractAllowedToolNames(body);
    let skipPassthroughEvent = false;
    const thinkState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkTagParser$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["initThinkState"])(mode === STREAM_MODE.PASSTHROUGH, provider, model);
    // State for translate mode (accumulatedContent for call log response body)
    const state = mode === STREAM_MODE.TRANSLATE ? {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initState"])(sourceFormat),
        provider,
        toolNameMap,
        signatureNamespace,
        copilotCompatibleReasoning,
        suppressThinkClose,
        accumulatedContent: "",
        accumulatedReasoning: "",
        toolSchemas: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$toolSchemas$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractToolSchemaMap"])(body),
        customToolNames,
        requestToolIdentityMap
    } : null;
    // Track content length for usage estimation (both modes)
    let totalContentLength = 0;
    // Passthrough: accumulate content and reasoning separately for call log response body
    let passthroughAccumulatedContent = "";
    let passthroughAccumulatedReasoning = "";
    let passthroughBufferedTextualToolCallContent = "";
    // Passthrough Responses SSE: snapshots of items seen via `response.output_item.done`,
    // used to backfill `response.completed.response.output` when upstream returns it
    // empty (which happens when `store: false` — see backfillResponsesCompletedOutput).
    const passthroughResponsesOutputItems = [];
    const passthroughResponsesPendingFunctionCalls = new Map();
    let passthroughResponsesId = null;
    let passthroughResponsesCurrentFunctionCallKey = null;
    const passthroughResponsesReasoningSummarySeen = new Set();
    // #6199 — commentary-phase items announced via `response.output_item.added` are
    // internal. Their `response.output_text.delta`/`response.output_text.done`/
    // `response.output_item.done` events do not carry the `phase`, so we remember the
    // item id + output_index here and drop every matching follow-up event.
    const passthroughResponsesCommentaryItemIds = new Set();
    const passthroughResponsesCommentaryIndexes = new Set();
    const dropCommentary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesCommentaryDrop$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["createTranslateCommentaryFilter"])(targetFormat);
    // #5786 — highest Responses-API `sequence_number` already forwarded on this stream.
    // The Responses API guarantees a strictly increasing sequence_number, so any event at
    // or below this watermark is an upstream reconnect/retry replay and must be dropped —
    // otherwise the replayed deltas glue duplicated text into the client stream. Applies to
    // both translate mode (openai-responses → claude/openai) and Responses passthrough.
    let lastSeenResponsesSequenceNumber = -1;
    const isDuplicateResponsesSequence = (value)=>{
        if (typeof value !== "number" || !Number.isFinite(value)) return false;
        if (value <= lastSeenResponsesSequenceNumber) return true;
        lastSeenResponsesSequenceNumber = value;
        return false;
    };
    const streamStartedAt = Date.now();
    let lastToolCallChunkTime = null;
    let toolFinishTime = null;
    let contentAfterToolSeen = false;
    // Cross-request tool latency: fingerprint the session from the request body
    // so Request 2 can pick up the tool-finish timestamp left by Request 1.
    const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["generateSessionId"])(body, {
        provider: provider ?? undefined,
        connectionId: connectionId ?? undefined
    });
    let pendingToolFinishTime = null;
    try {
        pendingToolFinishTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["consumeToolFinishTime"])(sessionId);
    } catch  {} // best-effort read of optional timing state — absence is normal
    // Guard against duplicate [DONE] events — ensures exactly one per stream
    let doneSent = false;
    let upstreamErrorForwarded = false;
    const providerPayloadCollector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["createStructuredSSECollector"])({
        stage: "provider_response"
    });
    const clientPayloadCollector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["createStructuredSSECollector"])({
        stage: "client_response"
    });
    const requestRecord = asRecord(body);
    const requestStreamOptions = asRecord(requestRecord.stream_options ?? requestRecord.streamOptions);
    const expectsOpenAIUsageOnlyChunk = requestStreamOptions.include_usage === true || requestStreamOptions.includeUsage === true;
    // Per-stream instances to avoid shared state with concurrent streams
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    // Idle timeout state — closes stream if provider stops sending data
    let lastChunkTime = Date.now();
    let idleTimer = null;
    let streamTimedOut = false;
    const claudeEmptyResponseLifecycle = createClaudeEmptyResponseLifecycle();
    const passthroughEventPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["createSSEEventPrefixBuffer"])();
    const multilineSseDataLineNormalizer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["createSSEDataLineNormalizer"])();
    const clearIdleTimer = ()=>{
        if (idleTimer) {
            clearInterval(idleTimer);
            idleTimer = null;
        }
    };
    const clearPendingPassthroughEvent = ()=>{
        passthroughEventPrefix.clear();
    };
    const applyTextualToolCallStreamingGuard = (parsed)=>{
        const choice = Array.isArray(parsed.choices) ? parsed.choices[0] : undefined;
        const delta = asRecord(choice?.delta);
        let textualToolCallConverted = false;
        if (typeof delta?.content === "string") {
            const incomingContent = delta.content;
            const bufferedCandidate = passthroughBufferedTextualToolCallContent + incomingContent;
            if (passthroughBufferedTextualToolCallContent || containsTextualToolCallCandidate(incomingContent)) {
                const parsedCandidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(bufferedCandidate);
                if (parsedCandidate?.kind === "complete") {
                    const collectedToolCall = collectPassthroughTextualToolCall(bufferedCandidate, passthroughToolCalls, allowedToolNames);
                    if (collectedToolCall) {
                        parsed = toChatCompletionChunkWithToolCall(parsed, collectedToolCall);
                        passthroughHasToolCalls = true;
                    } else {
                        delete delta.content;
                        delete delta.reasoning_content;
                    }
                    textualToolCallConverted = true;
                    passthroughBufferedTextualToolCallContent = "";
                } else if (parsedCandidate?.kind === "partial") {
                    passthroughBufferedTextualToolCallContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughBufferedTextualToolCallContent, incomingContent);
                    textualToolCallConverted = true;
                    delta.content = "";
                } else {
                    if (passthroughBufferedTextualToolCallContent) {
                        delta.content = passthroughBufferedTextualToolCallContent + incomingContent;
                        textualToolCallConverted = true;
                    }
                    passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, passthroughBufferedTextualToolCallContent + incomingContent);
                    passthroughBufferedTextualToolCallContent = "";
                }
            } else {
                passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, incomingContent);
            }
        }
        return {
            parsed,
            textualToolCallConverted
        };
    };
    const emitSyntheticClaudeEmptyResponse = (controller, options = {})=>{
        const events = buildSyntheticClaudeEmptyResponseEvents(claudeEmptyResponseLifecycle, model, options);
        if (events.length === 0) return;
        if (!claudeEmptyResponseLifecycle.warningLogged) {
            claudeEmptyResponseLifecycle.warningLogged = true;
            console.warn(`[STREAM] Injecting synthetic Claude SSE response for empty upstream output (${provider || "provider"}:${model || "unknown"})`);
        }
        if (options.includeContentBlock !== false) {
            claudeEmptyResponseLifecycle.syntheticContentInjected = true;
            if (!passthroughAccumulatedContent.trim()) {
                passthroughAccumulatedContent = SYNTHETIC_CLAUDE_EMPTY_RESPONSE_TEXT;
            }
            if (state?.accumulatedContent !== undefined && !state.accumulatedContent.trim()) {
                state.accumulatedContent = SYNTHETIC_CLAUDE_EMPTY_RESPONSE_TEXT;
            }
        }
        for (const event of events){
            updateClaudeEmptyResponseLifecycle(claudeEmptyResponseLifecycle, event);
            clientPayloadCollector.push(event);
            const output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatSSE"])(event, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE);
            reqLogger?.appendConvertedChunk?.(output);
            controller.enqueue(encoder.encode(output));
        }
    };
    let pendingRequestClearedByStream = false;
    const clearPendingRequestFromStream = ()=>{
        if (pendingRequestClearedByStream) return;
        pendingRequestClearedByStream = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
    };
    const emitClaudeEmptyStreamErrorAndAbort = (controller, decrementPendingRequest = true)=>{
        clearIdleTimer();
        const msg = "Claude returned an empty response (no content block)";
        console.warn(`[STREAM] Empty Claude stream at flush - emitting error (${provider || "provider"}:${model || "unknown"})`);
        const errorBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildErrorBody"])(502, msg);
        const errorEvent = {
            type: "error",
            error: errorBody.error
        };
        const errOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatSSE"])(errorEvent, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE);
        reqLogger?.appendConvertedChunk?.(errOutput);
        clientPayloadCollector.push(errorEvent);
        controller.enqueue(encoder.encode(errOutput));
        let failureHandled = false;
        if (onFailure) {
            try {
                failureHandled = onFailure({
                    status: 502,
                    message: msg,
                    code: "empty_response"
                }) === true;
            } catch (e) {
                console.debug(`[STREAM] onFailure callback error (empty_response):`, e);
            }
        }
        if (decrementPendingRequest && !failureHandled) {
            clearPendingRequestFromStream();
        }
        controller.error(markPendingRequestCleared(new Error(msg)));
    };
    const emitTranslatedClientItem = (controller, item)=>{
        let itemSanitized = item;
        const isResponsesEvent = typeof item?.event === "string" && item.event.startsWith("response.");
        if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && !isResponsesEvent) {
            itemSanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeStreamingChunk"])(itemSanitized);
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValuableContent"])(itemSanitized, sourceFormat)) {
            return;
        }
        const isFinishChunk = itemSanitized.type === "message_delta" || itemSanitized.choices?.[0]?.finish_reason;
        if (state?.finishReason && isFinishChunk && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(itemSanitized.usage) && totalContentLength > 0) {
            const estimated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["estimateUsage"])(body, totalContentLength, sourceFormat);
            itemSanitized.usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["filterUsageForFormat"])(estimated, sourceFormat);
            state.usage = estimated;
        } else if (state?.finishReason && isFinishChunk && state.usage) {
            const buffered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["addBufferToUsage"])(state.usage);
            itemSanitized.usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["filterUsageForFormat"])(buffered, sourceFormat);
        }
        if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && shouldInjectClaudeEmptyResponseBeforeCurrentEvent(claudeEmptyResponseLifecycle, itemSanitized)) {
            emitClaudeEmptyStreamErrorAndAbort(controller);
            return;
        }
        if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && isClaudeEventPayload(itemSanitized)) {
            updateClaudeEmptyResponseLifecycle(claudeEmptyResponseLifecycle, itemSanitized);
        }
        const output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatSSE"])(itemSanitized, sourceFormat);
        clientPayloadCollector.push(itemSanitized);
        reqLogger?.appendConvertedChunk?.(output);
        controller.enqueue(encoder.encode(output));
    };
    const emitFinalSseMetadata = async (controller, finalUsage)=>{
        const costUsd = finalUsage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, finalUsage) : 0;
        const comment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildOmniRouteSseMetadataComment"])({
            provider,
            model,
            cacheHit: false,
            latencyMs: Date.now() - streamStartedAt,
            usage: finalUsage,
            costUsd
        });
        if (!comment) return;
        reqLogger?.appendConvertedChunk?.(comment);
        controller.enqueue(encoder.encode(comment));
    };
    const getResponsesReasoningKey = (payload)=>{
        const itemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(payload.item_id);
        if (itemId) {
            return itemId;
        }
        const item = payload.item && typeof payload.item === "object" && !Array.isArray(payload.item) ? payload.item : null;
        const outputItemId = item ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(item.id) : null;
        if (outputItemId) {
            return outputItemId;
        }
        const responseId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(payload.response_id) || passthroughResponsesId;
        const outputIndex = typeof payload.output_index === "number" && Number.isInteger(payload.output_index) ? payload.output_index : null;
        return responseId !== null && outputIndex !== null ? `${responseId}:${outputIndex}` : null;
    };
    const emitSyntheticResponsesReasoningSummary = (controller, payload)=>{
        const item = payload.item && typeof payload.item === "object" && !Array.isArray(payload.item) ? payload.item : null;
        if (!item || item.type !== "reasoning") {
            return;
        }
        // #7176/#7243: only synthesize summary events from real upstream plaintext —
        // never mutate `item` and never fabricate alarming placeholder text for
        // encrypted-only reasoning (`encrypted_content` still forwards intact).
        const visibleSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getVisibleResponsesReasoningSummaryText"])(item);
        if (!visibleSummary) {
            return;
        }
        const reasoningKey = getResponsesReasoningKey(payload);
        if (!reasoningKey || passthroughResponsesReasoningSummarySeen.has(reasoningKey)) {
            return;
        }
        passthroughResponsesReasoningSummarySeen.add(reasoningKey);
        const itemId = typeof item.id === "string" && item.id ? item.id : reasoningKey;
        const outputIndex = typeof payload.output_index === "number" && Number.isInteger(payload.output_index) ? payload.output_index : 0;
        const syntheticEvents = [
            {
                event: "response.reasoning_summary_text.delta",
                body: {
                    type: "response.reasoning_summary_text.delta",
                    item_id: itemId,
                    output_index: outputIndex,
                    summary_index: 0,
                    delta: visibleSummary
                }
            },
            {
                event: "response.reasoning_summary_part.done",
                body: {
                    type: "response.reasoning_summary_part.done",
                    item_id: itemId,
                    output_index: outputIndex,
                    summary_index: 0,
                    part: {
                        type: "summary_text",
                        text: visibleSummary
                    }
                }
            }
        ];
        for (const syntheticEvent of syntheticEvents){
            clientPayloadCollector.push(syntheticEvent.body);
            const output = `event: ${syntheticEvent.event}\ndata: ${JSON.stringify(syntheticEvent.body)}\n\n`;
            reqLogger?.appendConvertedChunk?.(output);
            controller.enqueue(encoder.encode(output));
        }
    };
    return new TransformStream({
        start (controller) {
            // Start idle watchdog — checks every 10s if provider has stopped sending
            if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_IDLE_TIMEOUT_MS"] > 0) {
                idleTimer = setInterval(()=>{
                    if (!streamTimedOut && Date.now() - lastChunkTime > __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_IDLE_TIMEOUT_MS"]) {
                        streamTimedOut = true;
                        clearIdleTimer();
                        const timeoutMsg = `[STREAM] Idle timeout: no data from ${provider || "provider"} for ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_IDLE_TIMEOUT_MS"]}ms (model: ${model || "unknown"})`;
                        console.warn(timeoutMsg);
                        let failureHandled = false;
                        if (onFailure) {
                            try {
                                failureHandled = onFailure({
                                    status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT,
                                    message: timeoutMsg,
                                    code: "stream_idle_timeout",
                                    type: "timeout_error"
                                }) === true;
                            } catch (e) {
                                console.debug(`[STREAM] onFailure callback error (idle_timeout):`, e);
                            }
                        }
                        if (!failureHandled) {
                            clearPendingRequestFromStream();
                        }
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                            model,
                            provider,
                            connectionId,
                            status: `FAILED ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT}`
                        }).catch(()=>{});
                        const timeoutError = new Error(timeoutMsg);
                        timeoutError.name = "StreamIdleTimeoutError";
                        controller.error(markPendingRequestCleared(timeoutError));
                    }
                }, 10_000);
            }
        },
        transform (chunk, controller) {
            if (streamTimedOut) return;
            const now = Date.now();
            lastChunkTime = now;
            const text = decoder.decode(chunk, {
                stream: true
            });
            buffer += text;
            reqLogger?.appendProviderChunk?.(text);
            const nlIdx = buffer.lastIndexOf("\n");
            const lines = nlIdx >= 0 ? buffer.slice(0, nlIdx).split("\n") : [];
            if (nlIdx >= 0) buffer = buffer.slice(nlIdx + 1);
            for (const line of multilineSseDataLineNormalizer.normalize(lines)){
                const trimmed = line.trim();
                // Passthrough mode: normalize and forward
                if (mode === STREAM_MODE.PASSTHROUGH) {
                    let output;
                    let injectedUsage = false;
                    let clientPayload = null;
                    let failurePayload = null;
                    if (skipPassthroughEvent) {
                        if (!trimmed) {
                            skipPassthroughEvent = false;
                            clearPendingPassthroughEvent();
                        }
                        continue;
                    }
                    // Drop whole keepalive event blocks — strict OpenAI-compatible SDKs
                    // try to JSON.parse empty keepalive payloads and crash.
                    if (/^event:\s*keepalive\b/i.test(trimmed)) {
                        skipPassthroughEvent = true;
                        clearPendingPassthroughEvent();
                        continue;
                    }
                    if (/^event:/i.test(trimmed)) {
                        const eventType = trimmed.replace(/^event:\s*/i, "");
                        if (shouldInjectClaudeEmptyResponseBeforeCurrentEvent(claudeEmptyResponseLifecycle, {
                            type: eventType
                        })) {
                            emitClaudeEmptyStreamErrorAndAbort(controller);
                            return;
                        }
                        passthroughEventPrefix.remember(line);
                        continue;
                    }
                    if (/^(?::|id:|retry:)/i.test(trimmed)) {
                        passthroughEventPrefix.remember(line);
                        continue;
                    }
                    if (!trimmed) {
                        const pendingOutput = passthroughEventPrefix.flush();
                        if (pendingOutput) {
                            reqLogger?.appendConvertedChunk?.(pendingOutput);
                            controller.enqueue(encoder.encode(pendingOutput));
                        }
                        clearPendingPassthroughEvent();
                        continue;
                    }
                    if (!trimmed.startsWith("data:")) {
                        passthroughEventPrefix.remember(line);
                        continue;
                    }
                    const parsedPassthroughData = trimmed.startsWith("data:") ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseSSEDataPayload"])(trimmed.slice(5), {
                        eventType: passthroughEventPrefix.eventType()
                    }) : null;
                    // #5786 — drop replayed Responses-API events (a re-sent event carrying an
                    // already-seen sequence_number) so their deltas are not forwarded twice.
                    if (parsedPassthroughData && typeof parsedPassthroughData.type === "string" && parsedPassthroughData.type.startsWith("response.") && isDuplicateResponsesSequence(parsedPassthroughData.sequence_number)) {
                        clearPendingPassthroughEvent();
                        continue;
                    }
                    if (trimmed.startsWith("data:")) {
                        const providerPayload = parsedPassthroughData ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseSSELine"])(trimmed);
                        if (providerPayload) {
                            providerPayloadCollector.push(providerPayload);
                            if (providerPayload.done === true) {
                                continue;
                            }
                        }
                    }
                    if (trimmed.startsWith("data:") && trimmed.slice(5).trim() === "[DONE]") {
                        continue;
                    }
                    if (trimmed.startsWith("data:") && trimmed.slice(5).trim() !== "[DONE]") {
                        try {
                            let parsed = parsedPassthroughData ?? JSON.parse(trimmed.slice(5).trim());
                            // Some upstream Responses-compatible providers leak an initial Chat Completions
                            // bootstrap chunk (assistant role + empty content) before emitting proper
                            // `response.*` events. That chunk is invalid on /v1/responses and breaks strict
                            // clients like OpenCode, so drop it only for Responses-native consumers.
                            const isEmptyAssistantBootstrapChunkForResponsesClient = clientExpectsResponsesStream && parsed?.object === "chat.completion.chunk" && Array.isArray(parsed?.choices) && parsed.choices.length > 0 && parsed.choices.every((choice)=>{
                                const candidate = choice && typeof choice === "object" ? choice : {};
                                const delta = candidate.delta && typeof candidate.delta === "object" ? candidate.delta : null;
                                if (!delta || delta.role !== "assistant") return false;
                                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasActiveDeltaValue"])(delta.content)) return false;
                                if (candidate.finish_reason !== null && candidate.finish_reason !== undefined) {
                                    return false;
                                }
                                const { role: _role, content: _content, ...restDelta } = delta;
                                return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasActiveDeltaValue"])(restDelta);
                            });
                            if (isEmptyAssistantBootstrapChunkForResponsesClient) {
                                continue;
                            }
                            // Detect Responses SSE payloads (have a `type` field like "response.created",
                            // "response.output_item.added", etc.) and skip Chat Completions-specific
                            // sanitization to avoid corrupting the stream for Responses-native clients.
                            const isResponsesSSE = parsed.type && typeof parsed.type === "string" && parsed.type.startsWith("response.");
                            // Detect Claude SSE payloads. Includes "ping" and "error" to ensure
                            // they bypass the Chat Completions sanitization path which would
                            // incorrectly process or drop them.
                            const isClaudeSSE = parsed.type && typeof parsed.type === "string" && (parsed.type.startsWith("message") || parsed.type.startsWith("content_block") || parsed.type === "ping" || parsed.type === "error");
                            if (isResponsesSSE) {
                                // #6199/#6561 — statefully drop internal commentary-phase output (see
                                // ./responsesCommentaryDrop.ts) and clear the buffered `event:` line
                                // for the same frame, or it flushes alone as an event-only SSE frame.
                                if (shouldDropResponsesCommentary && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesCommentaryDrop$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["shouldDropResponsesCommentaryEvent"])(parsed, passthroughResponsesCommentaryItemIds, passthroughResponsesCommentaryIndexes)) {
                                    clearPendingPassthroughEvent();
                                    continue;
                                }
                                const responsesIdsNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeResponsesSseIds"])(parsed);
                                const parsedResponse = parsed.response && typeof parsed.response === "object" && !Array.isArray(parsed.response) ? parsed.response : null;
                                const responseId = (parsedResponse ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(parsedResponse.id) : null) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stringifyIdValue"])(parsed.response_id);
                                if (responseId) {
                                    passthroughResponsesId = responseId;
                                }
                                // Responses SSE: only extract usage, forward payload as-is
                                const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed);
                                if (extracted) {
                                    usage = extracted;
                                }
                                // Keep generic Responses deltas for fallback usage estimates,
                                // but only visible text deltas may become assistant content in
                                // logs/replay payloads.
                                if (typeof parsed.delta === "string") {
                                    totalContentLength += parsed.delta.length;
                                }
                                if (parsed.type === "response.output_text.delta" && typeof parsed.delta === "string") {
                                    const incomingDelta = parsed.delta;
                                    const bufferedCandidate = passthroughBufferedTextualToolCallContent + incomingDelta;
                                    if (passthroughBufferedTextualToolCallContent || containsTextualToolCallCandidate(incomingDelta)) {
                                        const parsedCandidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(bufferedCandidate);
                                        if (parsedCandidate?.kind === "complete") {
                                            const collectedToolCall = collectPassthroughTextualToolCall(bufferedCandidate, passthroughToolCalls, allowedToolNames);
                                            if (collectedToolCall) {
                                                passthroughHasToolCalls = true;
                                                const responseToolCallEvents = buildResponsesFunctionCallEvents(collectedToolCall);
                                                output = formatSSEDataEvents(responseToolCallEvents);
                                                clientPayloadCollector.push(...responseToolCallEvents);
                                                reqLogger?.appendConvertedChunk?.(output);
                                                controller.enqueue(encoder.encode(output));
                                                injectedUsage = true;
                                            } else {
                                                output = `data: ${JSON.stringify(parsed)}\n\n`;
                                                injectedUsage = true;
                                            }
                                            passthroughBufferedTextualToolCallContent = "";
                                            parsed.delta = "";
                                        } else if (parsedCandidate?.kind === "partial") {
                                            passthroughBufferedTextualToolCallContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughBufferedTextualToolCallContent, incomingDelta);
                                            parsed.delta = "";
                                            output = `data: ${JSON.stringify(parsed)}\n\n`;
                                            injectedUsage = true;
                                        } else {
                                            if (passthroughBufferedTextualToolCallContent) {
                                                parsed.delta = passthroughBufferedTextualToolCallContent + incomingDelta;
                                                output = `data: ${JSON.stringify(parsed)}\n\n`;
                                                injectedUsage = true;
                                            }
                                            passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, passthroughBufferedTextualToolCallContent + incomingDelta);
                                            passthroughBufferedTextualToolCallContent = "";
                                        }
                                    } else {
                                        passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, incomingDelta);
                                    }
                                }
                                if (parsed.type === "response.failed") {
                                    failurePayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamErrorFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeStreamFailurePayload"])(parsed);
                                }
                                if (parsed.type === "response.reasoning_summary_text.delta" || parsed.type === "response.reasoning_summary_text.done" || parsed.type === "response.reasoning_summary_part.done") {
                                    const reasoningKey = getResponsesReasoningKey(parsed);
                                    if (reasoningKey) {
                                        passthroughResponsesReasoningSummarySeen.add(reasoningKey);
                                    }
                                }
                                if (parsed.type === "response.output_item.added" && parsed.item?.type === "function_call") {
                                    const item = parsed.item && typeof parsed.item === "object" && !Array.isArray(parsed.item) ? {
                                        ...parsed.item
                                    } : null;
                                    const pendingKey = item && typeof item.id === "string" ? item.id : item && typeof item.call_id === "string" ? item.call_id : null;
                                    if (item && pendingKey) {
                                        if (typeof item.arguments !== "string") {
                                            item.arguments = "";
                                        }
                                        passthroughResponsesPendingFunctionCalls.set(pendingKey, item);
                                        passthroughResponsesCurrentFunctionCallKey = pendingKey;
                                    }
                                }
                                if (parsed.type === "response.function_call_arguments.delta") {
                                    const pendingKey = typeof parsed.item_id === "string" ? parsed.item_id : passthroughResponsesCurrentFunctionCallKey;
                                    const pending = pendingKey ? passthroughResponsesPendingFunctionCalls.get(pendingKey) : undefined;
                                    if (pending && typeof parsed.delta === "string") {
                                        const previousArgs = typeof pending.arguments === "string" ? pending.arguments : "";
                                        pending.arguments = previousArgs + parsed.delta;
                                    }
                                }
                                if (parsed.type === "response.function_call_arguments.done") {
                                    const pendingKey = typeof parsed.item_id === "string" ? parsed.item_id : passthroughResponsesCurrentFunctionCallKey;
                                    const pending = pendingKey ? passthroughResponsesPendingFunctionCalls.get(pendingKey) : undefined;
                                    if (pending) {
                                        if (typeof parsed.arguments === "string") {
                                            pending.arguments = parsed.arguments;
                                        }
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(passthroughResponsesOutputItems, [
                                            pending
                                        ]);
                                    }
                                }
                                // Capture each completed output item so the final
                                // response.completed snapshot can be backfilled when upstream
                                // returns an empty `output` (happens with store: false).
                                if (parsed.type === "response.output_item.done" && parsed.item) {
                                    emitSyntheticResponsesReasoningSummary(controller, parsed);
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(passthroughResponsesOutputItems, [
                                        parsed.item
                                    ]);
                                    if (parsed.item?.type === "function_call") {
                                        const pendingKey = typeof parsed.item.id === "string" ? parsed.item.id : typeof parsed.item.call_id === "string" ? parsed.item.call_id : null;
                                        if (pendingKey) {
                                            passthroughResponsesPendingFunctionCalls.delete(pendingKey);
                                            if (passthroughResponsesCurrentFunctionCallKey === pendingKey) {
                                                passthroughResponsesCurrentFunctionCallKey = null;
                                            }
                                        }
                                    }
                                }
                                if (parsed.type === "response.completed" && Array.isArray(parsed.response?.output) && parsed.response.output.length > 0) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(passthroughResponsesOutputItems, parsed.response.output);
                                }
                                // #7936 — restore `namespace` + `name` fields on passthrough
                                // Responses function_call items for downstream Codex clients.
                                if (parsed.type === "response.output_item.added" || parsed.type === "response.output_item.done" || parsed.type === "response.completed") {
                                    restoreResponsesPassthroughFunctionCallIdentity(parsed, requestToolIdentityMap);
                                }
                                if (parsed.type === "response.completed" && passthroughResponsesPendingFunctionCalls.size > 0) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pushUniqueResponsesOutputItems"])(passthroughResponsesOutputItems, [
                                        ...passthroughResponsesPendingFunctionCalls.values()
                                    ]);
                                    passthroughResponsesPendingFunctionCalls.clear();
                                    passthroughResponsesCurrentFunctionCallKey = null;
                                }
                                // Two transport-level fixes for Responses passthrough:
                                //   1) Strip echoed `instructions` + `tools` from lifecycle
                                //      events — they can balloon a single SSE event past
                                //      100 KB and break parsers (e.g. GitHub Copilot CLI).
                                //   2) Backfill `response.completed.response.output` when
                                //      upstream sent it empty (store: false) — some clients
                                //      build their tool-call list from that snapshot rather
                                //      than from per-item events.
                                const textualToolCallBackfilled = parsed.type === "response.completed" && passthroughToolCalls.size > 0;
                                if (textualToolCallBackfilled) {
                                    parsed = toResponsesCompletedWithToolCalls(parsed, [
                                        ...passthroughToolCalls.values()
                                    ]);
                                }
                                const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripResponsesLifecycleEcho"])(parsed);
                                const backfilled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["backfillResponsesCompletedOutput"])(parsed, passthroughResponsesOutputItems);
                                const usageNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeResponsesCompletedUsage"])(parsed);
                                if (stripped || backfilled || textualToolCallBackfilled || responsesIdsNormalized || usageNormalized) {
                                    output = `data: ${JSON.stringify(parsed)}\n\n`;
                                    injectedUsage = true;
                                }
                            } else if (isClaudeSSE) {
                                // Claude SSE: extract usage, track content, forward as-is
                                const thinkingSignatureInjected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["injectThinkingSignature"])(parsed, provider);
                                const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed);
                                if (extracted) {
                                    // Non-destructive merge: never overwrite a positive value with 0
                                    // message_start carries input_tokens, message_delta carries output_tokens;
                                    if (!usage) usage = {};
                                    const u = usage;
                                    const eu = extracted;
                                    if (eu.prompt_tokens > 0) u.prompt_tokens = eu.prompt_tokens;
                                    if (eu.completion_tokens > 0) u.completion_tokens = eu.completion_tokens;
                                    if (eu.total_tokens > 0) u.total_tokens = eu.total_tokens;
                                    if (eu.cache_read_input_tokens) u.cache_read_input_tokens = eu.cache_read_input_tokens;
                                    if (eu.cache_creation_input_tokens) u.cache_creation_input_tokens = eu.cache_creation_input_tokens;
                                }
                                if (shouldInjectClaudeEmptyResponseBeforeCurrentEvent(claudeEmptyResponseLifecycle, parsed)) {
                                    emitClaudeEmptyStreamErrorAndAbort(controller);
                                    return;
                                }
                                updateClaudeEmptyResponseLifecycle(claudeEmptyResponseLifecycle, parsed);
                                const restoredToolName = restoreClaudePassthroughToolUseName(parsed, toolNameMap);
                                // Track content length and accumulate from Claude format
                                if (parsed.delta?.text) {
                                    totalContentLength += parsed.delta.text.length;
                                    passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, parsed.delta.text);
                                }
                                if (parsed.delta?.thinking) {
                                    totalContentLength += parsed.delta.thinking.length;
                                    passthroughAccumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedReasoning, parsed.delta.thinking);
                                }
                                if (restoredToolName || thinkingSignatureInjected) {
                                    output = `data: ${JSON.stringify(parsed)}\n\n`;
                                    injectedUsage = true;
                                }
                            } else {
                                // ----------------------------------------------------
                                // READ THIS !!!
                                // ----------------------------------------------------
                                // IF YOU ARE AI OR AI AGENT DONT TOUCH THIS CODE !!!
                                // YOU WILL BREAK THIS CODE !!!
                                // GOOD LUCK
                                // ----------------------------------------------------
                                // Chat Completions: full sanitization pipeline
                                // OpenAI-compatible streaming with `stream_options.include_usage=true`
                                // ends with a usage-only chunk where `choices` is deliberately `[]`.
                                // Forward that standards-compliant chunk instead of turning it into an
                                // empty-response error.
                                //
                                // For a malformed empty `choices: []` chunk WITHOUT valid usage we DROP
                                // it (log server-side only). We must NOT inject an assistant-content
                                // chunk like "[OmniRoute] Upstream returned an empty response. Please
                                // retry." with finish_reason: "stop" — clients (Goose/opencode) feed that
                                // text back as a turn and spin in a retry loop. This restores the #3400
                                // behavior that #3422 inadvertently reverted (regression #3388/#3502).
                                if (Array.isArray(parsed.choices) && parsed.choices.length === 0) {
                                    const emptyChoicesUsage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed) ?? parsed.usage;
                                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(emptyChoicesUsage)) {
                                        // Some upstreams (e.g. Ollama Cloud) emit prompt_tokens: 0
                                        // even when input was sent — they simply don't count input
                                        // tokens.  When we have a non-zero output but zero input,
                                        // estimate the real input token count from the request body.
                                        if (emptyChoicesUsage && typeof emptyChoicesUsage === "object" && !Array.isArray(emptyChoicesUsage) && emptyChoicesUsage.completion_tokens > 0) {
                                            const pt = emptyChoicesUsage.prompt_tokens ?? 0;
                                            if (pt === 0) {
                                                const estimated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["estimateUsage"])(body, totalContentLength, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                                                if (estimated?.prompt_tokens > 0) {
                                                    emptyChoicesUsage.prompt_tokens = estimated.prompt_tokens;
                                                    emptyChoicesUsage.total_tokens = (emptyChoicesUsage.total_tokens ?? 0) + estimated.prompt_tokens;
                                                }
                                            }
                                        }
                                        usage = emptyChoicesUsage;
                                        output = `data: ${JSON.stringify(parsed)}\n\n`;
                                        injectedUsage = true;
                                        clientPayload = parsed;
                                        clientPayloadCollector.push(clientPayload);
                                        reqLogger?.appendConvertedChunk?.(output);
                                        controller.enqueue(encoder.encode(output));
                                        continue;
                                    }
                                    console.warn(`[STREAM] Upstream returned empty choices array (${provider || "provider"}:${model || "unknown"}) — dropping chunk`);
                                    continue;
                                }
                                const hadNonStringToolCallId = Array.isArray(parsed.choices) ? parsed.choices.some((choice)=>Array.isArray(choice?.delta?.tool_calls) && choice.delta.tool_calls.some((tc)=>tc?.id != null && typeof tc.id !== "string")) : false;
                                const hadNonStringTopLevelId = parsed?.id != null && typeof parsed.id !== "string";
                                const rawDelta = parsed.choices?.[0]?.delta;
                                const hadReasoningAlias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasUnsupportedReasoningSignal"])(rawDelta);
                                parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeStreamingChunk"])(parsed);
                                if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OMIT_STREAMING_CHUNK_MARKER"]] === true) {
                                    continue;
                                }
                                const restoredOpenAIToolName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(parsed, toolNameMap);
                                const idFixed = hadNonStringTopLevelId ? false : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["fixInvalidId"])(parsed);
                                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValuableContent"])(parsed, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI)) {
                                    continue;
                                }
                                const delta = parsed.choices?.[0]?.delta;
                                let textualToolCallConverted = false;
                                let toolCallIdCoerced = false;
                                let splitMixedReasoningContent = false;
                                const thinkParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkTagParser$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyThinkTag"])(thinkState, delta);
                                // Split combined reasoning+content deltas into separate SSE events.
                                // Standard OpenAI streaming never mixes both fields in one delta;
                                // clients (e.g. LobeChat) may skip content when reasoning_content
                                // is present, causing the first content token to be lost.
                                if (delta?.reasoning_content && delta?.content) {
                                    // Shallow-clone only the mutated fields instead of a full
                                    // structuredClone — the original `parsed` is a JSON-derived
                                    // object so spreading preserves every field while skipping
                                    // the deep-clone overhead (GC pressure, polyfill fallback).
                                    const reasoningChunk = {
                                        ...parsed,
                                        usage: undefined,
                                        choices: [
                                            {
                                                ...parsed.choices[0],
                                                delta: {
                                                    ...parsed.choices[0].delta,
                                                    content: undefined
                                                },
                                                finish_reason: null
                                            },
                                            ...parsed.choices.slice(1)
                                        ]
                                    };
                                    const rOutput = `data: ${JSON.stringify(reasoningChunk)}\n\n`;
                                    passthroughAccumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedReasoning, delta.reasoning_content);
                                    totalContentLength += delta.reasoning_content.length;
                                    clientPayloadCollector.push(reasoningChunk);
                                    reqLogger?.appendConvertedChunk?.(rOutput);
                                    controller.enqueue(encoder.encode(rOutput));
                                    delete delta.reasoning_content;
                                    splitMixedReasoningContent = true;
                                }
                                // Track whether we need to re-serialize (separate from injectedUsage
                                // to avoid blocking subsequent finish_reason / usage mutations)
                                const needsReserialization = splitMixedReasoningContent || thinkParsed || hadReasoningAlias || delta?.content === "" && delta?.reasoning_content;
                                // T18: Track if we saw tool calls & accumulate for call log
                                if (delta?.tool_calls && delta.tool_calls.length > 0) {
                                    passthroughHasToolCalls = true;
                                    lastToolCallChunkTime = now;
                                    for (const tc of delta.tool_calls){
                                        // Note: sanitizeStreamingChunk above already coerces non-string
                                        // tool_call IDs, but this defensive check catches edge cases
                                        // where sanitize didn't run (e.g. flush path shortcuts).
                                        if (tc?.id != null && typeof tc.id !== "string") {
                                            tc.id = String(tc.id);
                                            toolCallIdCoerced = true;
                                        }
                                        // Key by index first — id only appears on the first delta in OpenAI streaming
                                        let key;
                                        if (Number.isInteger(tc?.index)) {
                                            key = `idx:${tc.index}`;
                                        } else if (tc?.id != null) {
                                            key = `id:${tc.id}`;
                                        } else {
                                            key = `seq:${++passthroughToolCallSeq}`;
                                        }
                                        const existing = passthroughToolCalls.get(key);
                                        const deltaArgs = typeof tc?.function?.arguments === "string" ? tc.function.arguments : "";
                                        if (!existing) {
                                            passthroughToolCalls.set(key, {
                                                id: tc?.id != null ? String(tc.id) : null,
                                                index: Number.isInteger(tc?.index) ? tc.index : passthroughToolCalls.size,
                                                type: tc?.type || "function",
                                                function: {
                                                    name: tc?.function?.name || "",
                                                    arguments: deltaArgs
                                                }
                                            });
                                        } else {
                                            if (tc?.id) existing.id = existing.id || String(tc.id);
                                            if (tc?.function?.name && !existing.function.name) existing.function.name = tc.function.name;
                                            existing.function.arguments += deltaArgs;
                                        }
                                    }
                                }
                                const content = delta?.content;
                                if (typeof content === "string") {
                                    totalContentLength += content.length;
                                    if (!contentAfterToolSeen) {
                                        const toolTs = toolFinishTime || pendingToolFinishTime;
                                        const lastChunkTs = lastToolCallChunkTime;
                                        if (toolTs || lastChunkTs) {
                                            contentAfterToolSeen = true;
                                            try {
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolLatencyTracker$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["recordToolLatency"])(provider || "unknown", toolTs ? now - toolTs : null, lastChunkTs ? now - lastChunkTs : null);
                                            } catch  {} // best-effort telemetry — must never break the stream
                                            pendingToolFinishTime = null;
                                        }
                                    }
                                }
                                const reasoningDelta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getReadableReasoningValue"])(delta);
                                if (reasoningDelta) {
                                    totalContentLength += reasoningDelta.length;
                                }
                                {
                                    const guarded = applyTextualToolCallStreamingGuard(parsed);
                                    parsed = guarded.parsed;
                                    textualToolCallConverted = guarded.textualToolCallConverted;
                                }
                                if (reasoningDelta) passthroughAccumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedReasoning, reasoningDelta);
                                const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed);
                                if (extracted) {
                                    usage = extracted;
                                }
                                const isFinishChunk = parsed.choices?.[0]?.finish_reason;
                                if (isFinishChunk) {
                                    passthroughSawFinishReason = true;
                                }
                                if (isFinishChunk && passthroughHasToolCalls) {
                                    toolFinishTime = now;
                                    try {
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["markToolFinish"])(sessionId);
                                    } catch  {} // best-effort bookkeeping write — a miss just skips latency correlation
                                }
                                // T18: Normalize finish_reason to 'tool_calls' if tool calls were used
                                if (isFinishChunk && passthroughHasToolCalls && parsed.choices[0].finish_reason !== "tool_calls") {
                                    parsed.choices[0].finish_reason = "tool_calls";
                                    // If we modify it, we must output the modified object
                                    if (!injectedUsage && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(parsed.usage)) {
                                        output = `data: ${JSON.stringify(parsed)}\n\n`;
                                        injectedUsage = true;
                                    }
                                }
                                if (isFinishChunk && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(parsed.usage) && !expectsOpenAIUsageOnlyChunk) {
                                    const estimated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["estimateUsage"])(body, totalContentLength, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                                    parsed.usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["filterUsageForFormat"])(estimated, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                                    output = `data: ${JSON.stringify(parsed)}\n\n`;
                                    usage = estimated;
                                    injectedUsage = true;
                                } else if (isFinishChunk && usage) {
                                    const buffered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["addBufferToUsage"])(usage);
                                    parsed.usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["filterUsageForFormat"])(buffered, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                                    output = `data: ${JSON.stringify(parsed)}\n\n`;
                                    injectedUsage = true;
                                } else if (textualToolCallConverted) {
                                    output = `data: ${JSON.stringify(parsed)}\n\n`;
                                    injectedUsage = true;
                                } else if (idFixed || needsReserialization || toolCallIdCoerced || hadNonStringToolCallId || hadNonStringTopLevelId || restoredOpenAIToolName) {
                                    output = `data: ${JSON.stringify(parsed)}\n\n`;
                                    injectedUsage = true;
                                }
                            }
                            clientPayload = parsed;
                        } catch  {
                            continue;
                        }
                    }
                    if (!injectedUsage) {
                        if (line.startsWith("data:") && !line.startsWith("data: ")) {
                            output = "data: " + line.slice(5) + "\n\n";
                        } else {
                            output = line + "\n\n";
                        }
                    }
                    output = passthroughEventPrefix.prefixData(output, line);
                    if (clientPayload) {
                        clientPayloadCollector.push(clientPayload);
                    }
                    reqLogger?.appendConvertedChunk?.(output);
                    controller.enqueue(encoder.encode(output));
                    if (failurePayload) {
                        let failureHandled = false;
                        if (onFailure) {
                            try {
                                failureHandled = onFailure(failurePayload) === true;
                            } catch (e) {
                                console.debug(`[STREAM] onFailure callback error:`, e);
                            }
                        }
                        clearIdleTimer();
                        if (!failureHandled) {
                            clearPendingRequestFromStream();
                        }
                        controller.error(markPendingRequestCleared(new Error(failurePayload.message || "Upstream failure")));
                        return;
                    }
                    if (!trimmed) {
                        clearPendingPassthroughEvent();
                    }
                    continue;
                }
                // Translate mode
                if (!trimmed) continue;
                if (state?.upstreamError) {
                    continue;
                }
                const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseSSELine"])(trimmed);
                if (!parsed) continue;
                if (upstreamErrorForwarded) continue;
                if (parsed.error) {
                    const output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamErrorFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatTranslatedStreamError"])(parsed, sourceFormat);
                    reqLogger?.appendConvertedChunk?.(output);
                    controller.enqueue(encoder.encode(output));
                    upstreamErrorForwarded = true;
                    doneSent = true;
                    continue;
                }
                // #5786 — drop replayed Responses-API events (identical/lower sequence_number
                // re-sent on an upstream reconnect) so their deltas are not glued twice into
                // the translated client stream.
                if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && isDuplicateResponsesSequence(parsed.sequence_number)) {
                    continue;
                }
                if (shouldDropResponsesCommentary && dropCommentary(parsed)) continue;
                providerPayloadCollector.push(parsed);
                if (parsed && parsed.done) {
                    continue;
                }
                if (parsed.choices?.[0]?.delta?.tool_calls) {
                    lastToolCallChunkTime = now;
                }
                if (parsed.choices?.[0]?.finish_reason === "tool_calls") {
                    toolFinishTime = now;
                    try {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["markToolFinish"])(sessionId);
                    } catch  {} // best-effort bookkeeping write — a miss just skips latency correlation
                }
                // Track content length and accumulate for call log (from raw provider chunk, so content is never missed)
                // Do this before translation so we capture content regardless of translator output shape
                // Claude format
                if (parsed.delta?.text) {
                    const t = parsed.delta.text;
                    totalContentLength += t.length;
                    if (state?.accumulatedContent !== undefined && typeof t === "string") state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, t);
                }
                if (parsed.delta?.thinking) {
                    const t = parsed.delta.thinking;
                    totalContentLength += t.length;
                    if (state?.accumulatedReasoning !== undefined && typeof t === "string") state.accumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedReasoning, t);
                }
                // OpenAI format
                if (parsed.choices?.[0]?.delta?.content) {
                    const c = parsed.choices[0].delta.content;
                    if (typeof c === "string") {
                        totalContentLength += c.length;
                        if (state?.accumulatedContent !== undefined) state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, c);
                    } else if (Array.isArray(c)) {
                        for (const part of c){
                            if (part?.text && typeof part.text === "string") {
                                totalContentLength += part.text.length;
                                if (state?.accumulatedContent !== undefined) state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, part.text);
                            }
                        }
                    }
                }
                const openAiDelta = parsed.choices?.[0]?.delta;
                const openAiReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getReadableReasoningValue"])(openAiDelta);
                if (openAiReasoning) {
                    totalContentLength += openAiReasoning.length;
                    if (state?.accumulatedReasoning !== undefined) state.accumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedReasoning, openAiReasoning);
                }
                // Mirror only client-unsupported reasoning aliases into `reasoning_content`.
                if (!openAiReasoning) {
                    const delta = openAiDelta;
                    const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getUnsupportedReasoningValue"])(delta);
                    if (typeof r === "string" && r.length > 0) {
                        parsed.choices[0].delta.reasoning_content = r;
                        delete parsed.choices[0].delta.thinking;
                        delete parsed.choices[0].delta.thought;
                        totalContentLength += r.length;
                        if (state?.accumulatedReasoning !== undefined) state.accumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedReasoning, r);
                    }
                }
                // Gemini / Cloud Code format - may have multiple parts
                // Cloud Code API wraps in { response: { candidates: [...] } }, so unwrap.
                // Only applies to Gemini-family formats — skip for OpenAI, Claude, etc.
                const isGeminiFormat = targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY;
                const geminiChunk = isGeminiFormat ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["unwrapGeminiChunk"])(parsed) : parsed;
                if (geminiChunk.candidates?.[0]?.content?.parts) {
                    for (const part of geminiChunk.candidates[0].content.parts){
                        if (part.text && typeof part.text === "string") {
                            totalContentLength += part.text.length;
                            if (state?.accumulatedContent !== undefined) state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, part.text);
                        }
                    }
                }
                // Generic fallback: delta string, top-level content/text (e.g. some SSE payloads)
                if (state?.accumulatedContent !== undefined) {
                    if (typeof parsed.delta === "string") {
                        const d = parsed.delta;
                        state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, d);
                        totalContentLength += d.length;
                    }
                    if (typeof parsed.content === "string") {
                        const c = parsed.content;
                        state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, c);
                        totalContentLength += c.length;
                    }
                    if (typeof parsed.text === "string") {
                        const t = parsed.text;
                        state.accumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(state.accumulatedContent, t);
                        totalContentLength += t.length;
                    }
                }
                const translateHasContent = typeof parsed.delta?.text === "string" || typeof parsed.choices?.[0]?.delta?.content === "string" || Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAnyReasoningValue"])(parsed.choices?.[0]?.delta));
                if (translateHasContent && !contentAfterToolSeen) {
                    const toolTs = toolFinishTime || pendingToolFinishTime;
                    const lastChunkTs = lastToolCallChunkTime;
                    if (toolTs || lastChunkTs) {
                        contentAfterToolSeen = true;
                        try {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolLatencyTracker$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["recordToolLatency"])(provider || "unknown", toolTs ? now - toolTs : null, lastChunkTs ? now - lastChunkTs : null);
                        } catch  {} // best-effort telemetry — must never break the stream
                        pendingToolFinishTime = null;
                    }
                }
                // Extract usage
                const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed);
                if (extracted) {
                    if (!state.usage) {
                        state.usage = extracted;
                    } else {
                        const su = state.usage;
                        const eu = extracted;
                        if (eu.prompt_tokens > 0) su.prompt_tokens = eu.prompt_tokens;
                        if (eu.completion_tokens > 0) su.completion_tokens = eu.completion_tokens;
                        if (eu.total_tokens > 0) su.total_tokens = eu.total_tokens;
                        if (eu.input_tokens > 0) su.input_tokens = eu.input_tokens;
                        if (eu.output_tokens > 0) su.output_tokens = eu.output_tokens;
                        if (eu.cache_read_input_tokens > 0) su.cache_read_input_tokens = eu.cache_read_input_tokens;
                        if (eu.cache_creation_input_tokens > 0) su.cache_creation_input_tokens = eu.cache_creation_input_tokens;
                        if (eu.cached_tokens > 0) su.cached_tokens = eu.cached_tokens;
                        if (eu.reasoning_tokens > 0) su.reasoning_tokens = eu.reasoning_tokens;
                    }
                }
                // Translate: targetFormat -> openai -> sourceFormat
                const translated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["translateResponse"])(targetFormat, sourceFormat, parsed, state);
                // Log OpenAI intermediate chunks (if available)
                for (const item of getOpenAIIntermediateChunks(translated)){
                    const openaiOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatSSE"])(item, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                    reqLogger?.appendOpenAIChunk?.(openaiOutput);
                }
                if (translated?.length > 0) {
                    for (const item of translated){
                        emitTranslatedClientItem(controller, item);
                    }
                }
            }
        },
        async flush (controller) {
            // Clean up idle watchdog timer
            if (idleTimer) {
                clearIdleTimer();
            }
            if (streamTimedOut) {
                return;
            }
            if (upstreamErrorForwarded) {
                clearPendingRequestFromStream();
                return;
            }
            try {
                const remaining = decoder.decode();
                if (remaining) buffer += remaining;
                let normalizedTailLines = [];
                if (multilineSseDataLineNormalizer.hasPending()) {
                    const tailLines = buffer ? [
                        buffer,
                        ""
                    ] : [
                        ""
                    ];
                    normalizedTailLines = multilineSseDataLineNormalizer.normalize(tailLines);
                    buffer = "";
                }
                if (mode === STREAM_MODE.PASSTHROUGH) {
                    const tailProcessorContext = {
                        getSkipPassthroughEvent: ()=>skipPassthroughEvent,
                        setSkipPassthroughEvent: (value)=>{
                            skipPassthroughEvent = value;
                        },
                        clearPendingPassthroughEvent,
                        shouldAbortOnClaudeLifecycle: (payload)=>shouldInjectClaudeEmptyResponseBeforeCurrentEvent(claudeEmptyResponseLifecycle, payload),
                        emitClaudeEmptyStreamErrorAndAbort: ()=>emitClaudeEmptyStreamErrorAndAbort(controller),
                        isClaudeEventPayload,
                        updateClaudeEmptyResponseLifecycle: (payload)=>updateClaudeEmptyResponseLifecycle(claudeEmptyResponseLifecycle, payload),
                        passthroughEventPrefix,
                        emitConvertedOutput: (output)=>{
                            reqLogger?.appendConvertedChunk?.(output);
                            controller.enqueue(encoder.encode(output));
                        },
                        pushProviderPayload: (payload)=>providerPayloadCollector.push(payload),
                        pushClientPayload: (payload)=>clientPayloadCollector.push(payload),
                        setPassthroughResponsesId: (value)=>{
                            passthroughResponsesId = value;
                        },
                        setUsage: (value)=>{
                            usage = value;
                        },
                        addTotalContentLength: (value)=>{
                            totalContentLength += value;
                        },
                        appendPassthroughContent: (value)=>{
                            passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, value);
                        },
                        appendPassthroughReasoning: (value)=>{
                            passthroughAccumulatedReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedReasoning, value);
                        },
                        getResponsesReasoningKey,
                        markResponsesReasoningSummarySeen: (key)=>{
                            passthroughResponsesReasoningSummarySeen.add(key);
                        },
                        emitSyntheticResponsesReasoningSummary: (payload)=>emitSyntheticResponsesReasoningSummary(controller, payload),
                        passthroughResponsesOutputItems,
                        passthroughResponsesPendingFunctionCalls,
                        getPassthroughResponsesCurrentFunctionCallKey: ()=>passthroughResponsesCurrentFunctionCallKey,
                        setPassthroughResponsesCurrentFunctionCallKey: (value)=>{
                            passthroughResponsesCurrentFunctionCallKey = value;
                        },
                        hasPassthroughToolCalls: ()=>passthroughToolCalls.size > 0,
                        toResponsesCompletedWithToolCalls: (parsed)=>toResponsesCompletedWithToolCalls(parsed, [
                                ...passthroughToolCalls.values()
                            ]),
                        restoreOpenAIToolNames: (parsed)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(parsed, toolNameMap)
                    };
                    for (const line of normalizedTailLines){
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$passthroughTailProcessor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["processBufferedPassthroughLine"])(line, tailProcessorContext)) {
                            return;
                        }
                    }
                    const bufferedLine = buffer.trim();
                    if (skipPassthroughEvent || /^event:\s*keepalive\b/i.test(bufferedLine)) {
                        skipPassthroughEvent = false;
                        clearPendingPassthroughEvent();
                    } else if (buffer) {
                        let output = buffer;
                        if (buffer.startsWith("data:") && !buffer.startsWith("data: ")) {
                            output = "data: " + buffer.slice(5);
                        }
                        const bufferedPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseSSELine"])(bufferedLine);
                        if (bufferedPayload) {
                            providerPayloadCollector.push(bufferedPayload);
                            if (shouldInjectClaudeEmptyResponseBeforeCurrentEvent(claudeEmptyResponseLifecycle, bufferedPayload)) {
                                emitClaudeEmptyStreamErrorAndAbort(controller);
                                return;
                            }
                            if (isClaudeEventPayload(bufferedPayload)) {
                                updateClaudeEmptyResponseLifecycle(claudeEmptyResponseLifecycle, bufferedPayload);
                            }
                            clientPayloadCollector.push(bufferedPayload);
                            if (typeof bufferedPayload === "object" && !Array.isArray(bufferedPayload)) {
                                const flushedParsed = bufferedPayload;
                                const flushedType = typeof flushedParsed.type === "string" ? flushedParsed.type : "";
                                const isResponses = flushedType.startsWith("response.");
                                const isClaude = isClaudeEventPayload(flushedParsed);
                                if (isResponses) {
                                    const idsNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeResponsesSseIds"])(flushedParsed);
                                    const usageNormalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStreamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeResponsesCompletedUsage"])(flushedParsed);
                                    if (idsNormalized || usageNormalized) {
                                        output = `data: ${JSON.stringify(flushedParsed)}\n\n`;
                                    }
                                } else if (!isClaude) {
                                    const { changed: flushChanged, hasFinishReason } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$openAIStreamChunk$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeFinalOpenAIStreamChunk"])(flushedParsed, toolNameMap);
                                    // #7800: track finish_reason in the flush path too, so a
                                    // final chunk without trailing newline still suppresses the
                                    // synthetic finish_reason synthesis.
                                    if (hasFinishReason) passthroughSawFinishReason = true;
                                    if (flushChanged) {
                                        output = `data: ${JSON.stringify(flushedParsed)}\n\n`;
                                    }
                                }
                            }
                        }
                        if (!bufferedLine) output = passthroughEventPrefix.flush() || output;
                        output = passthroughEventPrefix.prefixData(output, buffer);
                        if (output && !output.endsWith("\n\n")) {
                            output = output.endsWith("\n") ? `${output}\n` : `${output}\n\n`;
                        }
                        reqLogger?.appendConvertedChunk?.(output);
                        controller.enqueue(encoder.encode(output));
                    }
                    if (shouldInjectClaudeEmptyResponseOnFlush(claudeEmptyResponseLifecycle)) {
                        emitClaudeEmptyStreamErrorAndAbort(controller);
                        return;
                    } else if (shouldInjectClaudeMissingFinalizersOnFlush(claudeEmptyResponseLifecycle)) {
                        emitSyntheticClaudeEmptyResponse(controller, {
                            includeContentBlock: false,
                            includeMessageDelta: !claudeEmptyResponseLifecycle.hasMessageDelta,
                            includeMessageStop: !claudeEmptyResponseLifecycle.hasMessageStop
                        });
                    }
                    clearPendingPassthroughEvent();
                    if (passthroughBufferedTextualToolCallContent) {
                        // Flush any remaining buffered content as plain text.
                        // Previously gated on !includes("Arguments:"), which silently dropped
                        // incomplete tool-call headers (buffer held "Arguments:" but JSON was
                        // never finished before stream ended) — fix #3355 bug 2.
                        let flushOutput = "";
                        if (clientExpectsResponsesStream) {
                            const syntheticChunk = {
                                type: "response.output_text.delta",
                                delta: passthroughBufferedTextualToolCallContent
                            };
                            flushOutput = `data: ${JSON.stringify(syntheticChunk)}\n\n`;
                        } else if (clientExpectsClaudeStream) {
                            const syntheticChunk = {
                                type: "content_block_delta",
                                index: 0,
                                delta: {
                                    type: "text_delta",
                                    text: passthroughBufferedTextualToolCallContent
                                }
                            };
                            flushOutput = `data: ${JSON.stringify(syntheticChunk)}\n\n`;
                        } else {
                            const syntheticChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildSyntheticChatChunk"])(passthroughResponsesId, model, {
                                content: passthroughBufferedTextualToolCallContent
                            });
                            flushOutput = `data: ${JSON.stringify(syntheticChunk)}\n\n`;
                        }
                        reqLogger?.appendConvertedChunk?.(flushOutput);
                        controller.enqueue(encoder.encode(flushOutput));
                        passthroughAccumulatedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["appendBoundedText"])(passthroughAccumulatedContent, passthroughBufferedTextualToolCallContent);
                        passthroughBufferedTextualToolCallContent = "";
                    }
                    const accR = passthroughAccumulatedReasoning;
                    const accC = passthroughAccumulatedContent;
                    const thinkFlush = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkTagParser$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["flushThink"])(thinkState, passthroughResponsesId, accR, accC);
                    if (thinkFlush) {
                        passthroughAccumulatedReasoning = thinkFlush.reasoning;
                        passthroughAccumulatedContent = thinkFlush.content;
                        totalContentLength += thinkFlush.addedLength;
                        clientPayloadCollector.push(thinkFlush.syntheticChunk);
                        reqLogger?.appendConvertedChunk?.(thinkFlush.flushOutput);
                        controller.enqueue(encoder.encode(thinkFlush.flushOutput));
                    }
                    // Estimate usage if provider didn't return valid usage
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(usage) && totalContentLength > 0) {
                        usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["estimateUsage"])(body, totalContentLength, sourceFormat || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                    }
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(usage)) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["logUsage"])(provider, usage, model, connectionId, apiKeyInfo);
                    } else {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                            model,
                            provider,
                            connectionId,
                            tokens: null,
                            status: "200 OK"
                        }).catch(()=>{});
                    }
                    if (!doneSent) {
                        // #7800: Some providers close the SSE stream without emitting a final
                        // chunk carrying a non-null finish_reason. OpenAI spec requires the
                        // terminal chunk to include finish_reason (e.g. "stop"); strict clients
                        // (pi CLI) reject the stream with "Stream ended without finish_reason".
                        // Synthesize a terminal chunk when the upstream omitted one.
                        if (shouldEmitDoneTerminator && !passthroughSawFinishReason) {
                            const syntheticFinishChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildSyntheticChatChunk"])(passthroughResponsesId, model, {}, passthroughHasToolCalls ? "tool_calls" : "stop");
                            const finishOutput = `data: ${JSON.stringify(syntheticFinishChunk)}\n\n`;
                            reqLogger?.appendConvertedChunk?.(finishOutput);
                            controller.enqueue(encoder.encode(finishOutput));
                            clientPayloadCollector.push(syntheticFinishChunk);
                        }
                        await emitFinalSseMetadata(controller, usage);
                        doneSent = true;
                        if (shouldEmitDoneTerminator) {
                            clientPayloadCollector.push({
                                done: true
                            });
                            const doneOutput = "data: [DONE]\n\n";
                            reqLogger?.appendConvertedChunk?.(doneOutput);
                            controller.enqueue(encoder.encode(doneOutput));
                        }
                    }
                    // Notify caller for call log persistence (include full response body with accumulated content)
                    if (onComplete) {
                        try {
                            const u = usage;
                            const prompt = Number(u?.prompt_tokens ?? u?.input_tokens ?? 0);
                            const completion = Number(u?.completion_tokens ?? u?.output_tokens ?? 0);
                            let content = passthroughAccumulatedContent.trim() || "";
                            const finalBufferedTextualToolCall = passthroughBufferedTextualToolCallContent.trim();
                            if (finalBufferedTextualToolCall) {
                                if (collectPassthroughTextualToolCall(finalBufferedTextualToolCall, passthroughToolCalls, allowedToolNames)) {
                                    passthroughHasToolCalls = true;
                                }
                                passthroughBufferedTextualToolCallContent = "";
                            }
                            if (content && collectPassthroughTextualToolCall(content, passthroughToolCalls, allowedToolNames)) {
                                passthroughHasToolCalls = true;
                                content = "";
                            } else if (containsMalformedTextualToolCall(content, allowedToolNames)) {
                                content = "";
                            }
                            const message = {
                                role: "assistant",
                                content: content || null
                            };
                            const reasoning = passthroughAccumulatedReasoning.trim();
                            if (reasoning) {
                                message.reasoning_content = reasoning;
                            }
                            if (passthroughToolCalls.size > 0) {
                                message.tool_calls = [
                                    ...passthroughToolCalls.values()
                                ].sort((a, b)=>a.index - b.index);
                            }
                            // Hardening: log empty assistant response after tool completion
                            // for observability — helps diagnose Copilot "Sorry, no response was returned"
                            if (passthroughHasToolCalls && !content.trim() && !reasoning.trim()) {
                                console.warn(`[STREAM] Empty assistant response after tool_calls completion (${provider || "provider"}:${model || "unknown"}) — sessionId=${sessionId}`);
                            } else if (passthroughHasToolCalls && !content.trim() && reasoning.trim()) {
                                message.content = "";
                            }
                            const responseBody = {
                                choices: [
                                    {
                                        message,
                                        finish_reason: passthroughHasToolCalls ? "tool_calls" : "stop"
                                    }
                                ],
                                usage: {
                                    prompt_tokens: prompt,
                                    completion_tokens: completion,
                                    total_tokens: prompt + completion
                                },
                                _streamed: true
                            };
                            onComplete({
                                status: 200,
                                usage,
                                responseBody,
                                providerPayload: providerPayloadCollector.build((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildStreamSummaryFromEvents"])(providerPayloadCollector.getEvents(), sourceFormat, model), {
                                    includeEvents: false
                                }),
                                clientPayload: clientPayloadCollector.build(responseBody, {
                                    includeEvents: false
                                })
                            });
                        } catch (e) {
                            console.debug(`[STREAM] onComplete callback error (${model || "unknown"}):`, e);
                        }
                    } else {
                        clearPendingRequestFromStream();
                    }
                    return;
                }
                // Translate mode: process remaining buffer
                if (buffer.trim()) {
                    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseSSELine"])(buffer.trim());
                    if (parsed && !parsed.done) {
                        providerPayloadCollector.push(parsed);
                        // Extract usage from remaining buffer — if the usage-bearing event
                        // (e.g. response.completed) is the last SSE line, it ends up here
                        // in the flush handler where extractUsage was not called.
                        // Non-destructive merge: some providers send usage across multiple
                        // events (e.g. prompt_tokens in message_start, completion_tokens
                        // in message_delta). Direct assignment would lose earlier data.
                        const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractUsage"])(parsed);
                        if (extracted) {
                            if (!state.usage) {
                                state.usage = extracted;
                            } else {
                                const su = state.usage;
                                const eu = extracted;
                                if (eu.prompt_tokens > 0) su.prompt_tokens = eu.prompt_tokens;
                                if (eu.completion_tokens > 0) su.completion_tokens = eu.completion_tokens;
                                if (eu.total_tokens > 0) su.total_tokens = eu.total_tokens;
                                if (eu.input_tokens > 0) su.input_tokens = eu.input_tokens;
                                if (eu.output_tokens > 0) su.output_tokens = eu.output_tokens;
                                if (eu.cache_read_input_tokens > 0) su.cache_read_input_tokens = eu.cache_read_input_tokens;
                                if (eu.cache_creation_input_tokens > 0) su.cache_creation_input_tokens = eu.cache_creation_input_tokens;
                                if (eu.cached_tokens > 0) su.cached_tokens = eu.cached_tokens;
                                if (eu.reasoning_tokens > 0) su.reasoning_tokens = eu.reasoning_tokens;
                            }
                        }
                        const translated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["translateResponse"])(targetFormat, sourceFormat, parsed, state);
                        // Log OpenAI intermediate chunks
                        for (const item of getOpenAIIntermediateChunks(translated)){
                            const openaiOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatSSE"])(item, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                            reqLogger?.appendOpenAIChunk?.(openaiOutput);
                        }
                        if (translated?.length > 0) {
                            for (const item of translated){
                                emitTranslatedClientItem(controller, item);
                            }
                        }
                    }
                }
                if (state?.upstreamError) {
                    const err = state.upstreamError;
                    // Flush pending translation events BEFORE erroring the stream.
                    // This lets the openai-responses translator emit a proper
                    // `response.completed` with `status: "failed"` and close any
                    // open items (reasoning, tool calls, etc.), instead of silently
                    // aborting the stream and leaving partial items dangling.
                    try {
                        const flushed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["translateResponse"])(targetFormat, sourceFormat, null, state);
                        if (flushed?.length > 0) {
                            for (const item of flushed){
                                emitTranslatedClientItem(controller, item);
                            }
                        }
                    } catch  {
                    // Swallow flush errors — the controller.error below is the
                    // terminal signal for the client.
                    }
                    let failureHandled = false;
                    if (onFailure) {
                        try {
                            failureHandled = onFailure({
                                status: err.status,
                                message: err.message,
                                code: err.code,
                                type: err.type
                            }) === true;
                        } catch (e) {
                            console.debug(`[STREAM] onFailure callback error (${model || "unknown"}):`, e);
                        }
                    }
                    const errorBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildErrorBody"])(err.status, err.message);
                    if (onComplete) {
                        try {
                            onComplete({
                                status: err.status,
                                usage: state?.usage,
                                responseBody: errorBody,
                                error: err.message,
                                errorCode: err.code,
                                providerPayload: providerPayloadCollector.build((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildStreamSummaryFromEvents"])(providerPayloadCollector.getEvents(), targetFormat, model), {
                                    includeEvents: false
                                }),
                                clientPayload: clientPayloadCollector.build(errorBody, {
                                    includeEvents: false
                                })
                            });
                            failureHandled = true;
                        } catch (e) {
                            console.debug(`[STREAM] onComplete callback error in error path (${model || "unknown"}):`, e);
                        }
                    }
                    clearIdleTimer();
                    if (!failureHandled) {
                        clearPendingRequestFromStream();
                    }
                    controller.error(markPendingRequestCleared(new Error(err.message || "Upstream failure")));
                    return;
                }
                // Flush remaining events (only once at stream end)
                const flushed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["translateResponse"])(targetFormat, sourceFormat, null, state);
                // Log OpenAI intermediate chunks for flushed events
                for (const item of getOpenAIIntermediateChunks(flushed)){
                    const openaiOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatSSE"])(item, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                    reqLogger?.appendOpenAIChunk?.(openaiOutput);
                }
                if (flushed?.length > 0) {
                    for (const item of flushed){
                        emitTranslatedClientItem(controller, item);
                    }
                }
                if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
                    if (shouldInjectClaudeEmptyResponseOnFlush(claudeEmptyResponseLifecycle)) {
                        emitClaudeEmptyStreamErrorAndAbort(controller);
                        return;
                    } else if (shouldInjectClaudeMissingFinalizersOnFlush(claudeEmptyResponseLifecycle)) {
                        emitSyntheticClaudeEmptyResponse(controller, {
                            includeContentBlock: false,
                            includeMessageDelta: !claudeEmptyResponseLifecycle.hasMessageDelta,
                            includeMessageStop: !claudeEmptyResponseLifecycle.hasMessageStop
                        });
                    }
                }
                /**
           * Usage injection strategy:
           * Usage data (input/output tokens) is injected into the last content chunk
           * or the finish_reason chunk rather than sent as a separate SSE event.
           * This ensures all major clients (Claude CLI, Continue, Cursor) receive
           * usage data even if they stop reading after the finish signal.
           * The usage buffer (state.usage) accumulates across chunks and is only
           * emitted once at stream end when merged into the final translated chunk.
           */ // Send [DONE] (only if not already sent during transform)
                if (!doneSent) {
                    await emitFinalSseMetadata(controller, state?.usage);
                    doneSent = true;
                    if (shouldEmitDoneTerminator) {
                        clientPayloadCollector.push({
                            done: true
                        });
                        const doneOutput = "data: [DONE]\n\n";
                        reqLogger?.appendConvertedChunk?.(doneOutput);
                        controller.enqueue(encoder.encode(doneOutput));
                    }
                }
                // Estimate usage if provider didn't return valid usage (for translate mode)
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(state?.usage) && totalContentLength > 0) {
                    state.usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["estimateUsage"])(body, totalContentLength, sourceFormat);
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasValidUsage"])(state?.usage)) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["logUsage"])(state.provider || targetFormat, state.usage, model, connectionId, apiKeyInfo);
                } else {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                        model,
                        provider,
                        connectionId,
                        tokens: null,
                        status: "200 OK"
                    }).catch(()=>{});
                }
                // Notify caller for call log persistence (include full response body with accumulated content)
                if (onComplete) {
                    try {
                        const u = state?.usage;
                        const prompt = Number(u?.prompt_tokens ?? u?.input_tokens ?? 0);
                        const completion = Number(u?.completion_tokens ?? u?.output_tokens ?? 0);
                        let content = (state?.accumulatedContent ?? "").trim() || "";
                        const normalizedToolCalls = state?.toolCalls?.size ? [
                            ...state.toolCalls.values()
                        ].map((tc)=>({
                                id: tc.id != null ? String(tc.id) : null,
                                index: tc.index ?? tc.blockIndex ?? 0,
                                type: tc.type ?? "function",
                                function: tc.function ?? {
                                    name: tc.name ?? "",
                                    arguments: ""
                                }
                            })).sort((a, b)=>a.index - b.index) : [];
                        const textualToolCall = parseTextualToolCallFromContent(content);
                        if (textualToolCall) {
                            normalizedToolCalls.push({
                                id: `call_${Date.now()}_${normalizedToolCalls.length}`,
                                index: normalizedToolCalls.length,
                                type: "function",
                                function: {
                                    name: textualToolCall.name,
                                    arguments: JSON.stringify(textualToolCall.args || {})
                                }
                            });
                            content = "";
                        } else if (containsMalformedTextualToolCall(content, allowedToolNames)) {
                            content = "";
                        }
                        const reasoning = (state?.accumulatedReasoning ?? "").trim();
                        const message = {
                            role: "assistant",
                            content: content || null
                        };
                        if (reasoning) {
                            message.reasoning_content = reasoning;
                        }
                        const hasToolCalls = normalizedToolCalls.length > 0;
                        if (hasToolCalls) {
                            message.tool_calls = normalizedToolCalls;
                        }
                        const responseBody = {
                            choices: [
                                {
                                    message,
                                    finish_reason: hasToolCalls ? "tool_calls" : "stop"
                                }
                            ],
                            usage: {
                                prompt_tokens: prompt,
                                completion_tokens: completion,
                                total_tokens: prompt + completion
                            },
                            _streamed: true
                        };
                        onComplete({
                            status: 200,
                            usage: state?.usage,
                            responseBody,
                            providerPayload: providerPayloadCollector.build((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildStreamSummaryFromEvents"])(providerPayloadCollector.getEvents(), targetFormat, model), {
                                includeEvents: false
                            }),
                            clientPayload: clientPayloadCollector.build(responseBody, {
                                includeEvents: false
                            })
                        });
                    } catch (e) {
                        console.debug(`[STREAM] onComplete callback error in flush (${model || "unknown"}):`, e);
                    }
                } else {
                    clearPendingRequestFromStream();
                }
            } catch (error) {
                console.log(`[STREAM] Error in flush (${model || "unknown"}):`, error.message || error);
            }
        },
        cancel (reason) {
            clearIdleTimer();
        }
    }, {
        highWaterMark: 16384
    }, {
        highWaterMark: 16384
    });
}
const __TURBOPACK__default__export__ = createSSEStream;
function createSSETransformStreamWithLogger(targetFormat, sourceFormat, provider = null, reqLogger = null, toolNameMap = null, model = null, connectionId = null, body = null, onComplete = null, apiKeyInfo = null, onFailure = null, copilotCompatibleReasoning = false, suppressThinkClose = false, customToolNames = new Set(), requestToolIdentityMap = null) {
    return createSSEStream({
        mode: STREAM_MODE.TRANSLATE,
        targetFormat,
        sourceFormat,
        provider,
        reqLogger,
        toolNameMap,
        model,
        connectionId,
        apiKeyInfo,
        body,
        onComplete,
        onFailure,
        copilotCompatibleReasoning,
        suppressThinkClose,
        customToolNames,
        requestToolIdentityMap
    });
}
function createPassthroughStreamWithLogger(provider = null, reqLogger = null, toolNameMap = null, model = null, connectionId = null, body = null, onComplete = null, apiKeyInfo = null, onFailure = null, clientResponseFormat = null, requestToolIdentityMap = null) {
    return createSSEStream({
        mode: STREAM_MODE.PASSTHROUGH,
        provider,
        reqLogger,
        toolNameMap,
        model,
        connectionId,
        apiKeyInfo,
        body,
        onComplete,
        onFailure,
        clientResponseFormat,
        requestToolIdentityMap
    });
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/utils/streamReadiness.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStreamContentWatcher",
    ()=>createStreamContentWatcher,
    "ensureStreamReadiness",
    ()=>ensureStreamReadiness,
    "hasStreamReadinessSignal",
    ()=>hasStreamReadinessSignal,
    "hasUsefulStreamContent",
    ()=>hasUsefulStreamContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [middleware] (ecmascript)");
;
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function hasNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}
function hasUsefulValue(value) {
    if (hasNonEmptyString(value)) return true;
    if (Array.isArray(value)) return value.some(hasUsefulValue);
    if (!isRecord(value)) return false;
    for (const key of [
        "content",
        "text",
        "delta",
        "reasoning_content",
        "reasoning",
        // Mistral/Magistral thinking arrays and StepFun/OpenRouter reasoning_details are
        // valid model output — without these a reasoning-only stream was misclassified as
        // "no useful content" and turned into a spurious 502 (#2520).
        "thinking",
        "reasoning_details",
        "partial_json",
        "arguments",
        "name",
        "thought",
        "error",
        "executableCode",
        "codeExecutionResult"
    ]){
        const candidate = value[key];
        if (hasNonEmptyString(candidate)) return true;
        if ((Array.isArray(candidate) || isRecord(candidate)) && hasUsefulValue(candidate)) return true;
    }
    for (const key of [
        "tool_calls",
        "tool_use",
        "function",
        "functionCall",
        "function_call",
        "function_call_output",
        "output",
        "content_block",
        "response",
        "choices",
        "candidates",
        "parts"
    ]){
        if (hasUsefulValue(value[key])) return true;
    }
    return false;
}
function hasUsefulJsonPayload(payload) {
    if (!isRecord(payload)) return false;
    return hasUsefulValue(payload);
}
function isPingEventType(type) {
    return /^(?:ping|keepalive|heartbeat)$/i.test(type);
}
function getPayloadType(payload, eventType = "") {
    if (!isRecord(payload)) return eventType;
    const type = payload.type ?? payload.event ?? payload.object;
    return typeof type === "string" ? type : eventType;
}
// Keys that indicate a frame carries (or is starting to carry) actual model
// output — as opposed to a bare `{error:{...}}` frame with no output signal
// at all. A stream that only ever emits error-only frames (e.g. a CLI
// passthrough executor's mid-stream spawn failure, #7503) must NOT be
// classified as "ready" — treating it as ready lets the malformed frame
// reach the client as a fake 200 success and blocks combo fallback to the
// next candidate.
const CONTENT_BEARING_KEYS = [
    "choices",
    "candidates",
    "content_block",
    "delta",
    "output",
    "response",
    "parts",
    "tool_calls",
    "tool_use",
    "function_call",
    "function_call_output"
];
function isErrorOnlyStructuredPayload(payload) {
    if (!("error" in payload)) return false;
    return !CONTENT_BEARING_KEYS.some((key)=>key in payload);
}
function hasNonPingStructuredPayload(payload, eventType = "") {
    const type = getPayloadType(payload, eventType);
    if (isPingEventType(eventType) || isPingEventType(type)) return false;
    if (Array.isArray(payload)) return payload.length > 0;
    if (isRecord(payload)) {
        if (Object.keys(payload).length === 0) return false;
        return !isErrorOnlyStructuredPayload(payload);
    }
    return payload !== null && payload !== undefined;
}
function hasUsefulStreamContent(text) {
    const lines = text.split(/\r?\n/);
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (/^event:\s*(?:ping|keepalive)$/i.test(trimmed)) continue;
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
            if (hasUsefulJsonPayload(JSON.parse(data))) return true;
        } catch  {
            if (data.length > 0) return true;
        }
    }
    return false;
}
// Terminal states where a completion legitimately carries no content, kept in
// step with errorClassifier.ts's LEGIT_EMPTY_OPENAI_FINISH / LEGIT_EMPTY_CLAUDE_STOP
// so the streaming and non-streaming empty-content checks agree.
const LEGIT_EMPTY_TERMINAL_REASONS = new Set([
    "length",
    "tool_calls",
    "content_filter",
    "max_tokens",
    "tool_use"
]);
const TERMINAL_REASON_PATTERN = /"(?:finish_reason|stop_reason)"\s*:\s*"([^"]+)"/g;
const SSE_FIELD_LINE = /(?:^|\r?\n)\s*(?:data|event):/;
function createStreamContentWatcher() {
    const MAX_BUFFERED = 64 * 1024;
    let pending = "";
    let content = false;
    let legitEmpty = false;
    let sse = false;
    const inspect = (frame)=>{
        if (!frame) return;
        if (!sse && SSE_FIELD_LINE.test(frame)) sse = true;
        if (!content && hasUsefulStreamContent(frame)) content = true;
        if (legitEmpty) return;
        for (const match of frame.matchAll(TERMINAL_REASON_PATTERN)){
            if (LEGIT_EMPTY_TERMINAL_REASONS.has(match[1])) {
                legitEmpty = true;
                return;
            }
        }
    };
    return {
        note (text) {
            if (!text) return;
            pending += text;
            for(;;){
                const boundary = pending.search(/\r?\n\r?\n/);
                if (boundary === -1) break;
                inspect(pending.slice(0, boundary));
                pending = pending.slice(boundary).replace(/^\r?\n\r?\n/, "");
            }
            if (pending.length > MAX_BUFFERED) {
                inspect(pending);
                pending = "";
            }
        },
        finish () {
            inspect(pending);
            pending = "";
        },
        sawContent: ()=>content,
        sawLegitEmptyTerminal: ()=>legitEmpty,
        sawSseFrame: ()=>sse
    };
}
function resetCurrentEvent(state) {
    state.currentEvent = "";
    state.dataLines = [];
}
function processStreamReadinessEvent(state) {
    const eventType = state.currentEvent;
    const data = state.dataLines.join("\n").trim();
    resetCurrentEvent(state);
    if (isPingEventType(eventType) || !data || data === "[DONE]") return false;
    try {
        const payload = JSON.parse(data);
        if (!state.upstreamDiagnostic && isRecord(payload) && isErrorOnlyStructuredPayload(payload)) {
            const error = payload.error;
            const rawMessage = typeof error === "string" ? error : isRecord(error) && typeof error.message === "string" ? error.message : "";
            const diagnostic = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(rawMessage).trim();
            if (diagnostic) state.upstreamDiagnostic = diagnostic;
        }
        return hasNonPingStructuredPayload(payload, eventType);
    } catch  {
        return data.length > 0;
    }
}
function processStreamReadinessLine(state, line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) {
        if (!trimmed) return processStreamReadinessEvent(state);
        return false;
    }
    if (trimmed.startsWith("event:")) {
        state.currentEvent = trimmed.slice(6).trim();
        return false;
    }
    if (trimmed.startsWith("data:")) {
        state.dataLines.push(trimmed.slice(5).trimStart());
    }
    return false;
}
function appendStreamReadinessSignal(state, chunk) {
    const lines = `${state.pendingLine}${chunk}`.split(/\r?\n/);
    state.pendingLine = lines.pop() ?? "";
    for (const line of lines){
        if (processStreamReadinessLine(state, line)) return true;
    }
    return false;
}
function finishStreamReadinessSignal(state) {
    if (state.pendingLine && processStreamReadinessLine(state, state.pendingLine)) return true;
    state.pendingLine = "";
    return processStreamReadinessEvent(state);
}
function hasStreamReadinessSignal(text) {
    const state = {
        currentEvent: "",
        dataLines: [],
        pendingLine: "",
        upstreamDiagnostic: null
    };
    if (appendStreamReadinessSignal(state, text)) return true;
    return finishStreamReadinessSignal(state);
}
function createErrorResponse(status, message, code, type, upstreamDiagnostic) {
    return new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildErrorBody"])(status, message, upstreamDiagnostic ? {
        error: {
            message: upstreamDiagnostic
        }
    } : undefined, {
        code,
        type
    })), {
        status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
function prependBufferedChunks(chunks, reader) {
    return new ReadableStream({
        async start (controller) {
            try {
                for (const chunk of chunks){
                    controller.enqueue(chunk);
                }
                while(true){
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (value) controller.enqueue(value);
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            } finally{
                reader.releaseLock();
            }
        },
        async cancel (reason) {
            await reader.cancel(reason).catch(()=>{});
            reader.releaseLock();
        }
    });
}
function readWithTimeout(reader, timeoutMs) {
    return new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>reject(new Error("STREAM_READINESS_TIMEOUT")), timeoutMs);
        reader.read().then((value)=>{
            clearTimeout(timeout);
            resolve(value);
        }, (error)=>{
            clearTimeout(timeout);
            reject(error);
        });
    });
}
async function ensureStreamReadiness(response, options) {
    if (!response.body || options.timeoutMs <= 0) return {
        ok: true,
        response
    };
    const reader = response.body.getReader();
    const chunks = [];
    const decoder = new TextDecoder();
    const readinessState = {
        currentEvent: "",
        dataLines: [],
        pendingLine: "",
        upstreamDiagnostic: null
    };
    const startedAt = Date.now();
    const effectiveTimeoutMs = Math.max(0, Math.floor(options.timeoutMs));
    const deadline = startedAt + effectiveTimeoutMs;
    let handedOffReader = false;
    const buildReadyResponse = ()=>new Response(prependBufferedChunks(chunks, reader), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    const timeoutReason = ()=>`Stream produced no non-ping SSE event within ${effectiveTimeoutMs}ms`;
    try {
        while(true){
            const remainingMs = deadline - Date.now();
            if (remainingMs <= 0) {
                const reason = timeoutReason();
                options.log?.warn?.("STREAM", `${reason} (${options.provider || "provider"}/${options.model || "unknown"})`);
                await reader.cancel(reason).catch(()=>{});
                return {
                    ok: false,
                    reason,
                    classificationReason: reason,
                    code: "STREAM_READINESS_TIMEOUT",
                    type: "stream_timeout",
                    response: createErrorResponse(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT, reason, "STREAM_READINESS_TIMEOUT", "stream_timeout")
                };
            }
            let readResult;
            try {
                readResult = await readWithTimeout(reader, remainingMs);
            } catch  {
                const reason = timeoutReason();
                options.log?.warn?.("STREAM", `${reason} (${options.provider || "provider"}/${options.model || "unknown"})`);
                await reader.cancel(reason).catch(()=>{});
                return {
                    ok: false,
                    reason,
                    classificationReason: reason,
                    code: "STREAM_READINESS_TIMEOUT",
                    type: "stream_timeout",
                    response: createErrorResponse(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT, reason, "STREAM_READINESS_TIMEOUT", "stream_timeout")
                };
            }
            if (readResult.done) {
                const tail = decoder.decode(undefined, {
                    stream: false
                });
                if (tail && appendStreamReadinessSignal(readinessState, tail)) {
                    handedOffReader = true;
                    return {
                        ok: true,
                        response: buildReadyResponse()
                    };
                }
                if (finishStreamReadinessSignal(readinessState)) {
                    handedOffReader = true;
                    return {
                        ok: true,
                        response: buildReadyResponse()
                    };
                }
                const classificationReason = "Stream ended before producing a non-ping SSE event";
                const upstreamDiagnostic = readinessState.upstreamDiagnostic || undefined;
                const reason = upstreamDiagnostic ? `${classificationReason}: ${upstreamDiagnostic}` : classificationReason;
                options.log?.warn?.("STREAM", `${reason} (${options.provider || "provider"}/${options.model || "unknown"})`);
                return {
                    ok: false,
                    reason,
                    classificationReason,
                    ...upstreamDiagnostic ? {
                        upstreamDiagnostic
                    } : {},
                    code: "STREAM_EARLY_EOF",
                    type: "stream_early_eof",
                    response: createErrorResponse(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, classificationReason, "STREAM_EARLY_EOF", "stream_early_eof", upstreamDiagnostic)
                };
            }
            if (!readResult.value) continue;
            chunks.push(readResult.value);
            const decodedChunk = decoder.decode(readResult.value, {
                stream: true
            });
            if (appendStreamReadinessSignal(readinessState, decodedChunk)) {
                options.log?.debug?.("STREAM", `Stream readiness confirmed in ${Date.now() - startedAt}ms (${options.provider || "provider"}/${options.model || "unknown"})`);
                handedOffReader = true;
                return {
                    ok: true,
                    response: buildReadyResponse()
                };
            }
        }
    } finally{
        if (!handedOffReader) {
            reader.releaseLock();
        }
    }
}
}),
"[project]/open-sse/utils/thinkCloseMarker.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "THINKING_MARKER_HEADER",
    ()=>THINKING_MARKER_HEADER,
    "resolveSuppressThinkClose",
    ()=>resolveSuppressThinkClose,
    "shouldSuppressThinkCloseMarker",
    ()=>shouldSuppressThinkCloseMarker,
    "thinkingMarkerHeaderSignal",
    ()=>thinkingMarkerHeaderSignal
]);
/**
 * `</think>` close-marker client policy.
 *
 * When OmniRoute translates a Claude-native streamed response to OpenAI Chat
 * Completions shape (`claude-to-openai.ts`), it historically emitted a single
 * `</think>` close marker as `delta.content` so clients that scan content for
 * the marker (Claude Code, Cursor) could split reasoning from the final answer
 * — see #4633.
 *
 * Modern Chat Completions clients already receive reasoning on the separate
 * `reasoning_content` field. Emitting the in-band marker by default now
 * corrupts that split (literal `</think>` in visible content) for ordinary
 * OpenAI clients — see #8245. OpenCode / Antigravity had the same leak earlier
 * (#5245 / #1061).
 *
 * Policy (#8245):
 *   - Default: SUPPRESS the marker on OpenAI Chat Completions.
 *   - Explicit opt-in: `x-omniroute-thinking-marker: on` force-keeps it for the
 *     shrinking set of content-scanning clients (#4633).
 *   - Explicit opt-out: `x-omniroute-thinking-marker: off` (same as default).
 *   - Responses API (`openai-responses`): always suppress (#7747) — wins over
 *     the header; there is no legitimate marker consumer on that path.
 *
 * The User-Agent allowlist below is retained for diagnostics / callers that
 * still query `shouldSuppressThinkCloseMarker` directly; the resolved default
 * no longer depends on UA.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
;
const THINKING_MARKER_HEADER = "x-omniroute-thinking-marker";
// Lowercased User-Agent substrings of clients that historically rendered the
// textual `</think>` marker verbatim (#5245 / #1061). Kept for direct callers;
// resolveSuppressThinkClose no longer needs UA to decide the default (#8245).
const SUPPRESS_THINK_CLOSE_UA_MARKERS = [
    "opencode",
    "antigravity"
];
function shouldSuppressThinkCloseMarker(userAgent) {
    if (!userAgent || typeof userAgent !== "string") return false;
    const ua = userAgent.toLowerCase();
    return SUPPRESS_THINK_CLOSE_UA_MARKERS.some((marker)=>ua.includes(marker));
}
function thinkingMarkerHeaderSignal(headerValue) {
    if (typeof headerValue !== "string") return null;
    const value = headerValue.trim().toLowerCase();
    if (value === "off" || value === "false" || value === "0" || value === "suppress") return true;
    if (value === "on" || value === "true" || value === "1" || value === "keep") return false;
    return null;
}
function resolveSuppressThinkClose(opts) {
    // The marker only exists for Chat Completions clients that scan content for
    // it; Responses API clients receive reasoning as structured items instead.
    // This wins over the explicit header: there is no legitimate marker consumer
    // in the Responses format.
    if (opts.clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) return true;
    const headerSignal = thinkingMarkerHeaderSignal(opts.thinkingMarkerHeader);
    if (headerSignal !== null) return headerSignal;
    // #8245: suppress by default. Reasoning already ships as reasoning_content.
    // Legacy content-scanning clients opt in with x-omniroute-thinking-marker: on.
    return true;
}
}),
"[project]/open-sse/utils/nextAuthCookie.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * NextAuth session-token cookie helpers shared by web-cookie providers that
 * authenticate via __Secure-next-auth.session-token (chatgpt-web, perplexity-web, …).
 *
 * Rotation can change the shape (unchunked → chunked or vice versa). When that
 * happens, every old family member must be dropped — keeping the stale variant
 * alongside the new one would send both, and depending on parser precedence the
 * server could read the stale value and fail auth.
 */ __turbopack_context__.s([
    "SESSION_TOKEN_FAMILY_RE",
    ()=>SESSION_TOKEN_FAMILY_RE,
    "buildSessionCookieHeader",
    ()=>buildSessionCookieHeader,
    "mergeRefreshedCookie",
    ()=>mergeRefreshedCookie
]);
const SESSION_TOKEN_FAMILY_RE = /^__Secure-next-auth\.session-token(?:\.\d+)?$/;
function mergeRefreshedCookie(originalCookie, setCookieHeader) {
    if (!setCookieHeader) return null;
    const matches = Array.from(setCookieHeader.matchAll(/(__Secure-next-auth\.session-token(?:\.\d+)?)=([^;,\s]+)/g));
    if (matches.length === 0) return null;
    const refreshed = new Map();
    for (const m of matches)refreshed.set(m[1], m[2]);
    let blob = originalCookie.trim();
    if (/^cookie\s*:\s*/i.test(blob)) blob = blob.replace(/^cookie\s*:\s*/i, "");
    // Bare value (no `=`): the original was just the session-token contents.
    if (!/=/.test(blob)) {
        return Array.from(refreshed, ([k, v])=>`${k}=${v}`).join("; ");
    }
    const pairs = blob.split(/;\s*/).filter(Boolean);
    const result = [];
    let mutated = false;
    let droppedStale = false;
    for (const pair of pairs){
        const eqIdx = pair.indexOf("=");
        if (eqIdx < 0) {
            result.push(pair);
            continue;
        }
        const name = pair.slice(0, eqIdx).trim();
        const value = pair.slice(eqIdx + 1);
        if (SESSION_TOKEN_FAMILY_RE.test(name)) {
            if (!refreshed.has(name) || refreshed.get(name) !== value) mutated = true;
            droppedStale = true;
            continue;
        }
        result.push(`${name}=${value}`);
    }
    for (const [name, value] of refreshed){
        result.push(`${name}=${value}`);
    }
    if (!droppedStale) mutated = true;
    return mutated ? result.join("; ") : null;
}
function buildSessionCookieHeader(rawInput) {
    let s = rawInput.trim();
    if (/^cookie\s*:\s*/i.test(s)) s = s.replace(/^cookie\s*:\s*/i, "");
    if (/__Secure-next-auth\.session-token(?:\.\d+)?\s*=/.test(s)) {
        return s;
    }
    return `__Secure-next-auth.session-token=${s}`;
}
}),
"[project]/open-sse/utils/sha3-512.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setSha3NativeForTesting",
    ()=>__setSha3NativeForTesting,
    "sha3_512Hex",
    ()=>sha3_512Hex,
    "sha3_512HexJs",
    ()=>sha3_512HexJs
]);
// Runtime-portable SHA3-512 (FIPS-202).
//
// The ChatGPT-Web sentinel proof-of-work (open-sse/executors/chatgpt-web.ts)
// hashes with SHA3-512. Node built against OpenSSL has it natively, but the
// **Electron desktop app** ships Node built against **BoringSSL, which does not
// implement the SHA-3 family** (electron/electron#30530). There,
// `createHash("sha3-512")` throws `Error: Digest method not supported`, so every
// chatgpt-web request fails with `502 ChatGPT sentinel failed: Digest method not
// supported` and the provider is unusable on the desktop app (#5531).
//
// This module prefers the native digest (fast path on servers / OpenSSL) and
// transparently falls back to a dependency-free pure-JS Keccak-f[1600] when the
// runtime's crypto lacks SHA-3. The pure-JS path is validated bit-for-bit
// against the native digest and the published FIPS-202 vectors in the unit test.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
// ─── Keccak-f[1600] (BigInt lanes — correctness-first; only the fallback runs it) ──
const MASK = (1n << 64n) - 1n;
// Round constants RC[0..23].
const RC = [
    0x0000000000000001n,
    0x0000000000008082n,
    0x800000000000808an,
    0x8000000080008000n,
    0x000000000000808bn,
    0x0000000080000001n,
    0x8000000080008081n,
    0x8000000000008009n,
    0x000000000000008an,
    0x0000000000000088n,
    0x0000000080008009n,
    0x000000008000000an,
    0x000000008000808bn,
    0x800000000000008bn,
    0x8000000000008089n,
    0x8000000000008003n,
    0x8000000000008002n,
    0x8000000000000080n,
    0x000000000000800an,
    0x800000008000000an,
    0x8000000080008081n,
    0x8000000000008080n,
    0x0000000080000001n,
    0x8000000080008008n
];
// Rotation offsets r[x+5y] (rho step).
const ROT = [
    0,
    1,
    62,
    28,
    27,
    36,
    44,
    6,
    55,
    20,
    3,
    10,
    43,
    25,
    39,
    41,
    45,
    15,
    21,
    8,
    18,
    2,
    61,
    56,
    14
];
function rotl64(x, n) {
    if (n === 0) return x;
    const bn = BigInt(n);
    return (x << bn | x >> 64n - bn) & MASK;
}
function keccakF1600(s) {
    const C = new Array(5);
    const D = new Array(5);
    const B = new Array(25);
    for(let round = 0; round < 24; round++){
        // θ
        for(let x = 0; x < 5; x++)C[x] = s[x] ^ s[x + 5] ^ s[x + 10] ^ s[x + 15] ^ s[x + 20];
        for(let x = 0; x < 5; x++)D[x] = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
        for(let x = 0; x < 5; x++)for(let y = 0; y < 5; y++)s[x + 5 * y] ^= D[x];
        // ρ + π
        for(let x = 0; x < 5; x++){
            for(let y = 0; y < 5; y++){
                B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl64(s[x + 5 * y], ROT[x + 5 * y]);
            }
        }
        // χ
        for(let x = 0; x < 5; x++){
            for(let y = 0; y < 5; y++){
                s[x + 5 * y] = B[x + 5 * y] ^ ~B[(x + 1) % 5 + 5 * y] & MASK & B[(x + 2) % 5 + 5 * y];
            }
        }
        // ι
        s[0] ^= RC[round];
    }
}
// SHA3-512: rate r = 576 bits (72 bytes / 9 lanes), capacity 1024, output 64 bytes.
const RATE_BYTES = 72;
function sha3_512Bytes(msg) {
    const s = new Array(25).fill(0n);
    // FIPS-202 pad10*1 with SHA-3 domain separation (first pad byte 0x06, last |= 0x80).
    const padLen = RATE_BYTES - msg.length % RATE_BYTES;
    const padded = new Uint8Array(msg.length + padLen);
    padded.set(msg);
    padded[msg.length] = 0x06;
    padded[padded.length - 1] |= 0x80;
    // Absorb (little-endian lanes).
    for(let off = 0; off < padded.length; off += RATE_BYTES){
        for(let i = 0; i < RATE_BYTES / 8; i++){
            let lane = 0n;
            for(let b = 0; b < 8; b++)lane |= BigInt(padded[off + i * 8 + b]) << BigInt(8 * b);
            s[i] ^= lane;
        }
        keccakF1600(s);
    }
    // Squeeze 64 bytes (8 lanes — fits in one rate block).
    const out = new Uint8Array(64);
    for(let i = 0; i < 8; i++){
        const lane = s[i];
        for(let b = 0; b < 8; b++)out[i * 8 + b] = Number(lane >> BigInt(8 * b) & 0xffn);
    }
    return out;
}
function toBytes(input) {
    return typeof input === "string" ? new Uint8Array(Buffer.from(input, "utf8")) : input;
}
function sha3_512HexJs(input) {
    return Buffer.from(sha3_512Bytes(toBytes(input))).toString("hex");
}
// undefined = not yet probed; null = native SHA-3 unavailable (BoringSSL/Electron).
let nativeHasher;
function detectNative() {
    try {
        // Construct + digest once — Electron/BoringSSL throws here, not lazily.
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha3-512").update(Buffer.alloc(0)).digest("hex");
        return (data)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha3-512").update(data).digest("hex");
    } catch  {
        return null;
    }
}
function sha3_512Hex(input) {
    const data = toBytes(input);
    if (nativeHasher === undefined) nativeHasher = detectNative();
    if (nativeHasher) {
        try {
            return nativeHasher(data);
        } catch  {
            nativeHasher = null; // became unavailable mid-flight — defensive
        }
    }
    return sha3_512HexJs(data);
}
function __setSha3NativeForTesting(state) {
    nativeHasher = state;
}
}),
"[project]/open-sse/utils/responsesEndpoint.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isResponsesEndpointPath",
    ()=>isResponsesEndpointPath
]);
function isResponsesEndpointPath(endpointPath) {
    let normalizedEndpoint = String(endpointPath || "");
    while(normalizedEndpoint.endsWith("/"))normalizedEndpoint = normalizedEndpoint.slice(0, -1);
    return normalizedEndpoint.split("/").includes("responses");
}
}),
"[project]/open-sse/utils/sleep.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared sleep utility to pause execution for a given number of milliseconds.
 *
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */ __turbopack_context__.s([
    "sleep",
    ()=>sleep
]);
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
}),
"[project]/open-sse/utils/kieTask.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKieCallbackUrl",
    ()=>getKieCallbackUrl,
    "getKieErrorMessage",
    ()=>getKieErrorMessage,
    "getKieErrorStatus",
    ()=>getKieErrorStatus,
    "getKieTaskId",
    ()=>getKieTaskId,
    "isJsonObject",
    ()=>isJsonObject,
    "normalizeKieTaskState",
    ()=>normalizeKieTaskState,
    "parseKieResultJson",
    ()=>parseKieResultJson
]);
const FALLBACK_KIE_CALLBACK_URL = "https://omniroute.local/api/kie/callback";
function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function callbackUrlFromBaseUrl(baseUrl) {
    if (!baseUrl || baseUrl.trim().length === 0) return null;
    try {
        const url = new URL(baseUrl);
        url.pathname = "/api/kie/callback";
        url.search = "";
        url.hash = "";
        return url.toString();
    } catch  {
        return null;
    }
}
function getConfiguredKieCallbackUrl() {
    const explicit = process.env.KIE_CALLBACK_URL?.trim() || process.env.OMNIROUTE_KIE_CALLBACK_URL?.trim();
    if (explicit) return explicit;
    return callbackUrlFromBaseUrl(process.env.OMNIROUTE_PUBLIC_URL) || callbackUrlFromBaseUrl(process.env.NEXT_PUBLIC_APP_URL) || callbackUrlFromBaseUrl(process.env.APP_URL) || callbackUrlFromBaseUrl(process.env.PUBLIC_URL) || FALLBACK_KIE_CALLBACK_URL;
}
function getKieCallbackUrl(body = {}) {
    const record = isJsonObject(body) ? body : {};
    const callbackUrl = record.callBackUrl ?? record.callback_url ?? record.callbackUrl;
    return typeof callbackUrl === "string" && callbackUrl.trim().length > 0 ? callbackUrl : getConfiguredKieCallbackUrl();
}
function parseKieResultJson(recordData) {
    const data = isJsonObject(recordData) && isJsonObject(recordData.data) ? recordData.data : {};
    const resultJson = data.resultJson;
    if (typeof resultJson === "string") {
        try {
            const parsed = JSON.parse(resultJson);
            return isJsonObject(parsed) ? parsed : {};
        } catch  {
            return {};
        }
    }
    return isJsonObject(resultJson) ? resultJson : {};
}
function getKieTaskId(createData) {
    const record = isJsonObject(createData) ? createData : {};
    const data = isJsonObject(record.data) ? record.data : {};
    const taskId = data.taskId || record.taskId;
    return taskId ? String(taskId) : null;
}
function normalizeKieTaskState(recordData) {
    const record = isJsonObject(recordData) ? recordData : {};
    const data = isJsonObject(record.data) ? record.data : {};
    const state = String(data.status ?? data.state ?? data.successFlag ?? record.msg ?? "PENDING").toUpperCase();
    if (state === "SUCCESS" || state === "1" || state === "FINISHED" || state === "COMPLETE" || state === "COMPLETED" || state === "FIRST_SUCCESS" || state === "ALL_SUCCESS" || state.includes("SUCCESS")) {
        return "success";
    }
    if (state === "FAIL" || state === "FAILED" || state === "ERROR" || state === "2" || state === "3" || state.includes("FAIL") || state.includes("ERROR") || state === "CREATE_TASK_FAILED" || state === "GENERATE_FAILED" || state === "GENERATE_AUDIO_FAILED") {
        return "failed";
    }
    return "pending";
}
function getKieErrorStatus(error, fallback = 502) {
    if (isJsonObject(error)) {
        const status = Number(error.status);
        if (Number.isFinite(status) && status > 0) {
            return status;
        }
    }
    return fallback;
}
function getKieErrorMessage(error, fallback) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (isJsonObject(error) && typeof error.message === "string" && error.message.length > 0) {
        return error.message;
    }
    return typeof error === "string" && error.length > 0 ? error : fallback;
}
}),
];

//# sourceMappingURL=open-sse_utils_1_e1dhy._.js.map