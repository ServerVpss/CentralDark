module.exports = [
"[project]/src/lib/memory/injection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Memory Injection — prepend retrieved memories into the request message list.
 *
 * Injection strategy:
 *   1. If the provider supports system messages (most providers), inject as a
 *      leading system message so it takes effect without disrupting user turns.
 *   2. Otherwise (fallback for providers that reject system role), inject as the
 *      first user message prefixed with the memory context label.
 *
 * Format: "Memory context: <content>"
 */ __turbopack_context__.s([
    "formatMemoryContext",
    ()=>formatMemoryContext,
    "injectMemory",
    ()=>injectMemory,
    "providerSupportsSystemMessage",
    ()=>providerSupportsSystemMessage,
    "shouldInjectMemory",
    ()=>shouldInjectMemory,
    "systemMessageMustBeFirst",
    ()=>systemMessageMustBeFirst
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("MEMORY_INJECTION");
/**
 * Providers known NOT to support a top-level system-role message.
 * These receive memories injected as the first user message instead.
 */ const PROVIDERS_WITHOUT_SYSTEM_MESSAGE = new Set([
    "o1",
    "o1-mini",
    "o1-preview",
    "glm",
    "glmt",
    "glm-cn",
    "zai",
    "qianfan"
]);
function providerSupportsSystemMessage(provider) {
    if (!provider) return true;
    const normalized = provider.toLowerCase().trim();
    return !PROVIDERS_WITHOUT_SYSTEM_MESSAGE.has(normalized);
}
/**
 * Providers that accept a system-role message ONLY at index 0 (a `system`
 * message at any later position is rejected with HTTP 400). For these, the
 * cache-safe mid-array splice (which inserts memory just before the last user
 * turn) is unsafe in multi-turn conversations, so memory must be merged into /
 * prepended as the leading system message instead. See #6135.
 *
 * Populated with the Xiaomi MiMo endpoint (provider id `xiaomi-mimo`, registry
 * alias `mimo`, serving mimo-v2.5) confirmed live to 400 on a non-first system
 * message. Add other providers here only when they are documented as strict.
 */ const PROVIDERS_SYSTEM_MUST_BE_FIRST = new Set([
    "xiaomi-mimo",
    "mimo"
]);
function systemMessageMustBeFirst(provider) {
    if (!provider) return false;
    const normalized = provider.toLowerCase().trim();
    return PROVIDERS_SYSTEM_MUST_BE_FIRST.has(normalized);
}
function formatMemoryContext(memories) {
    if (!memories || memories.length === 0) return "";
    const content = memories.map((m)=>m.content.trim()).filter(Boolean).join("\n");
    return content ? `Memory context: ${content}` : "";
}
/**
 * #6135: place the memory as a leading system message for providers that reject
 * a non-first system role — merging into an existing index-0 system message when
 * present, else prepending. Split out of injectMemory to keep it flat.
 */ function injectSystemFirst(request, messages, memoryText, count) {
    log.info("memory.injection.injected", {
        count,
        strategy: "system-first",
        model: request.model
    });
    const first = messages[0];
    if (first && first.role === "system") {
        const merged = {
            ...first,
            content: `${memoryText}\n${first.content}`
        };
        return {
            ...request,
            messages: [
                merged,
                ...messages.slice(1)
            ]
        };
    }
    const memorySystemMessage = {
        role: "system",
        content: memoryText
    };
    return {
        ...request,
        messages: [
            memorySystemMessage,
            ...messages
        ]
    };
}
/**
 * Place a memory message at the #3890 cache-safe anchor (just before the last
 * user turn) when one exists, else prepend it. Shared by the system and user
 * injection strategies to keep injectMemory flat.
 */ function placeMessage(request, messages, msg, cacheSafeIndex) {
    if (cacheSafeIndex >= 0) {
        const next = [
            ...messages
        ];
        next.splice(cacheSafeIndex, 0, msg);
        return {
            ...request,
            messages: next
        };
    }
    return {
        ...request,
        messages: [
            msg,
            ...messages
        ]
    };
}
function injectMemory(request, memories, provider, options = {}) {
    if (!memories || memories.length === 0) {
        log.info("memory.injection.skipped", {
            reason: "no_memories",
            model: request.model
        });
        return request;
    }
    const memoryText = formatMemoryContext(memories);
    if (!memoryText) {
        log.info("memory.injection.skipped", {
            reason: "empty_context",
            model: request.model
        });
        return request;
    }
    const messages = Array.isArray(request.messages) ? [
        ...request.messages
    ] : [];
    // #3890: in a caching context, anchor the injection just before the LAST user message so
    // the cacheable prefix (system prompt + prior turns) is preserved byte-for-byte. Falls
    // back to a leading message when caching is off or there is no user turn to anchor on.
    const cacheSafeIndex = options.cacheSafe ? messages.findLastIndex((m)=>m.role === "user") : -1;
    const supportsSystem = providerSupportsSystemMessage(provider);
    // #6135: strict providers reject a system message at a non-zero index. Never
    // apply the cache-safe mid-array splice for these — keep the system message
    // first (extracted to injectSystemFirst to keep this function flat).
    if (supportsSystem && systemMessageMustBeFirst(provider)) {
        return injectSystemFirst(request, messages, memoryText, memories.length);
    }
    // Strategy 1 (system): prepend before existing system messages, preserving the
    // caller's own instructions. Strategy 2 (user, e.g. o1-mini): inject as a user
    // message. Both honor the #3890 cache-safe anchor via placeMessage.
    const role = supportsSystem ? "system" : "user";
    const memoryMessage = {
        role,
        content: memoryText
    };
    const base = supportsSystem ? "system" : "user";
    log.info("memory.injection.injected", {
        count: memories.length,
        strategy: cacheSafeIndex >= 0 ? `${base}-cache-safe` : base,
        model: request.model
    });
    return placeMessage(request, messages, memoryMessage, cacheSafeIndex);
}
function shouldInjectMemory(request, config) {
    if (config?.enabled === false) return false;
    return Array.isArray(request.messages) && request.messages.length > 0;
}
}),
"[project]/src/lib/memory/types.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Memory system type definitions for OmniRoute
// These types support the memory management system for AI agents
/**
 * Memory types for AI agent memory management system
 */ __turbopack_context__.s([
    "MemoryType",
    ()=>MemoryType
]);
var MemoryType = /*#__PURE__*/ function(MemoryType) {
    MemoryType["FACTUAL"] = "factual";
    MemoryType["EPISODIC"] = "episodic";
    MemoryType["PROCEDURAL"] = "procedural";
    MemoryType["SEMANTIC"] = "semantic";
    return MemoryType;
}({});
}),
"[project]/src/lib/memory/schemas.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MemoryConfigSchema",
    ()=>MemoryConfigSchema,
    "MemoryCreateInputSchema",
    ()=>MemoryCreateInputSchema,
    "MemoryUpdateInputSchema",
    ()=>MemoryUpdateInputSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/types.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const MemoryConfigSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    maxTokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    retrievalStrategy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "exact",
        "semantic",
        "hybrid"
    ]).optional(),
    autoSummarize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    persistAcrossModels: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    retentionDays: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive(),
    scope: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "session",
        "apiKey",
        "global"
    ]).optional()
});
const MemoryCreateInputSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MemoryType"]),
    key: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    metadata: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional()
}).strict();
const MemoryUpdateInputSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MemoryType"]).optional(),
    key: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    metadata: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional()
}).strict();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/embedding/remote.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "embedRemote",
    ()=>embedRemote
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/embeddings/service.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function embedRemote(text, model) {
    const t0 = Date.now();
    let resp;
    try {
        resp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createEmbeddingResponse"])({
            model,
            input: text
        });
    } catch (err) {
        // Network-level errors (ECONNREFUSED, AbortError, etc.)
        const isTimeout = err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("timeout"));
        return {
            source: "remote",
            model,
            reason: isTimeout ? "timeout" : "request_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
        };
    }
    if (!resp.ok) {
        const status = resp.status;
        if (status === 401 || status === 403) {
            return {
                source: "remote",
                model,
                reason: "no_key",
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Embedding provider returned ${status}`)
            };
        }
        if (status === 429) {
            return {
                source: "remote",
                model,
                reason: "rate_limited",
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Embedding provider returned 429 (rate limited)`)
            };
        }
        return {
            source: "remote",
            model,
            reason: "request_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Embedding provider returned HTTP ${status}`)
        };
    }
    let json;
    try {
        json = await resp.json();
    } catch (err) {
        return {
            source: "remote",
            model,
            reason: "request_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : "Failed to parse embedding response")
        };
    }
    try {
        const data = json.data;
        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0].embedding)) {
            return {
                source: "remote",
                model,
                reason: "request_failed",
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])("Unexpected embedding response shape: missing data[0].embedding")
            };
        }
        const rawVec = data[0].embedding;
        const vector = new Float32Array(rawVec);
        return {
            vector,
            source: "remote",
            model,
            dimensions: vector.length,
            latencyMs: Date.now() - t0,
            cached: false
        };
    } catch (err) {
        return {
            source: "remote",
            model,
            reason: "request_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : "Embedding parse error")
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/embedding/staticPotion.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_injectModel",
    ()=>_injectModel,
    "embedStatic",
    ()=>embedStatic,
    "getOrLoadModel",
    ()=>getOrLoadModel,
    "meanPool",
    ()=>meanPool,
    "tokenizeWordPiece",
    ()=>tokenizeWordPiece
]);
/**
 * Static Potion embedding (D7) — potion-base-8M via lookup + WordPiece minimal.
 *
 * Downloads model files once to <DATA_DIR>/embeddings/potion-base-8M/.
 * No WASM, no @huggingface/tokenizers dependency.
 * Singleton: matrix + vocab cached in module memory after first load.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
;
;
;
;
const MODEL_ID = "minishlab/potion-base-8M";
const MODEL_NAME = "potion-base-8M";
const HF_BASE = process.env.HF_HUB_ENDPOINT || "https://huggingface.co";
function getModelDir() {
    const staticCacheDir = process.env.MEMORY_STATIC_CACHE_DIR;
    if (staticCacheDir) return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(staticCacheDir, MODEL_NAME);
    const dataDir = process.env.DATA_DIR ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDir, "embeddings", MODEL_NAME);
}
// Singleton state
let _model = null;
let _loading = null;
function _injectModel(model) {
    _model = model;
    _loading = null;
}
async function downloadFile(url, dest) {
    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Failed to download ${url}: HTTP ${resp.status}`);
    }
    const buf = await resp.arrayBuffer();
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(dest, Buffer.from(buf));
}
async function ensureFile(filePath, url) {
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].access(filePath);
    } catch  {
        await downloadFile(url, filePath);
    }
}
/**
 * Parse safetensors format to extract the first float32 tensor.
 * Header format: 8-byte little-endian uint64 = header_len, then JSON header,
 * then raw tensor bytes.
 */ function parseSafetensors(buf) {
    // Read 8-byte header size (little-endian)
    const headerLen = Number(buf.readBigUInt64LE(0));
    const headerJson = buf.slice(8, 8 + headerLen).toString("utf8");
    const header = JSON.parse(headerJson);
    // Find the first float32 tensor (ignore __metadata__)
    for (const [key, meta] of Object.entries(header)){
        if (key === "__metadata__") continue;
        if (!meta.dtype || !meta.shape || !meta.data_offsets) continue;
        const dtype = meta.dtype.toLowerCase();
        if (dtype !== "f32" && dtype !== "float32") continue;
        const [startOffset, endOffset] = meta.data_offsets;
        const dataStart = 8 + headerLen + startOffset;
        const dataEnd = 8 + headerLen + endOffset;
        const dataSlice = buf.slice(dataStart, dataEnd);
        const floatCount = (dataEnd - dataStart) / 4;
        const arr = new Float32Array(floatCount);
        for(let i = 0; i < floatCount; i++){
            arr[i] = dataSlice.readFloatLE(i * 4);
        }
        return {
            matrix: arr,
            shape: meta.shape
        };
    }
    throw new Error("No float32 tensor found in safetensors file");
}
async function loadModel() {
    const modelDir = getModelDir();
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(modelDir, {
        recursive: true
    });
    const hfBase = `${HF_BASE}/${MODEL_ID}/resolve/main`;
    const vocabPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(modelDir, "vocab.json");
    const modelPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(modelDir, "model.safetensors");
    const tokenizerPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(modelDir, "tokenizer.json");
    await Promise.all([
        ensureFile(vocabPath, `${hfBase}/vocab.json`),
        ensureFile(modelPath, `${hfBase}/model.safetensors`),
        ensureFile(tokenizerPath, `${hfBase}/tokenizer.json`)
    ]);
    // Load vocab
    const vocabRaw = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(vocabPath, "utf8");
    const vocab = JSON.parse(vocabRaw);
    // Load matrix from safetensors
    const modelBuf = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(modelPath);
    const { matrix, shape } = parseSafetensors(modelBuf);
    if (shape.length < 2) {
        throw new Error(`Unexpected safetensors shape: ${JSON.stringify(shape)}`);
    }
    const vocabSize = shape[0];
    const dim = shape[1];
    const unkIdx = vocab["[UNK]"] ?? 0;
    return {
        vocab,
        matrix,
        dim,
        vocabSize,
        unkIdx
    };
}
function getOrLoadModel() {
    if (_model) return Promise.resolve(_model);
    if (_loading) return _loading;
    _loading = loadModel().then((m)=>{
        _model = m;
        _loading = null;
        return m;
    });
    return _loading;
}
function tokenizeWordPiece(text, vocab) {
    const words = text.trim().toLowerCase().split(/\s+/);
    const tokenIds = [];
    const unkId = vocab["[UNK]"] ?? 0;
    for (const word of words){
        if (!word) continue;
        if (vocab[word] !== undefined) {
            tokenIds.push(vocab[word]);
            continue;
        }
        // WordPiece greedy sub-tokenization
        const subTokens = [];
        let remaining = word;
        let failed = false;
        while(remaining.length > 0){
            let found = false;
            for(let end = remaining.length; end > 0; end--){
                const candidate = subTokens.length === 0 ? remaining.slice(0, end) : `##${remaining.slice(0, end)}`;
                if (vocab[candidate] !== undefined) {
                    subTokens.push(vocab[candidate]);
                    remaining = remaining.slice(end);
                    found = true;
                    break;
                }
            }
            if (!found) {
                failed = true;
                break;
            }
        }
        if (failed || subTokens.length === 0) {
            tokenIds.push(unkId);
        } else {
            for (const id of subTokens)tokenIds.push(id);
        }
    }
    return tokenIds;
}
function meanPool(tokenIds, matrix, dim, vocabSize, unkIdx) {
    const result = new Float32Array(dim);
    let validCount = 0;
    for (const id of tokenIds){
        const safeId = id >= 0 && id < vocabSize ? id : unkIdx;
        const offset = safeId * dim;
        for(let d = 0; d < dim; d++){
            result[d] += matrix[offset + d];
        }
        validCount++;
    }
    if (validCount > 0) {
        for(let d = 0; d < dim; d++){
            result[d] /= validCount;
        }
    }
    return result;
}
async function embedStatic(text) {
    const t0 = Date.now();
    let model;
    try {
        model = await getOrLoadModel();
    } catch (err) {
        return {
            source: "static",
            model: MODEL_NAME,
            reason: "model_load_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
        };
    }
    try {
        const tokenIds = tokenizeWordPiece(text, model.vocab);
        const vector = meanPool(tokenIds, model.matrix, model.dim, model.vocabSize, model.unkIdx);
        return {
            vector,
            source: "static",
            model: MODEL_NAME,
            dimensions: model.dim,
            latencyMs: Date.now() - t0,
            cached: false
        };
    } catch (err) {
        return {
            source: "static",
            model: MODEL_NAME,
            reason: "request_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
        };
    }
}
}),
"[project]/src/lib/memory/embedding/transformersLocal.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_injectPipeline",
    ()=>_injectPipeline,
    "embedTransformers",
    ()=>embedTransformers
]);
/**
 * Transformers.js local embedding (D8) — Xenova/all-MiniLM-L6-v2.
 *
 * IMPORTANT: @huggingface/transformers is imported lazily (await import())
 * ONLY when this function is called. Never imported at module level.
 * This satisfies D8 + D25 (serverExternalPackages + no bundle impact).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
;
const TRANSFORMERS_MODEL = process.env.MEMORY_TRANSFORMERS_MODEL || "Xenova/all-MiniLM-L6-v2";
let _pipeline = null;
let _pipelineLoading = null;
function _injectPipeline(fn) {
    _pipeline = fn;
    _pipelineLoading = null;
}
async function getOrLoadPipeline() {
    if (_pipeline) return _pipeline;
    if (_pipelineLoading) return _pipelineLoading;
    _pipelineLoading = (async ()=>{
        // Lazy import — never at module level (D8, D25)
        const transformers = await __turbopack_context__.A("[externals]/@huggingface/transformers [external] (@huggingface/transformers, esm_import, [project]/node_modules/@huggingface/transformers, async loader)");
        const { pipeline } = transformers;
        const pipe = await pipeline("feature-extraction", TRANSFORMERS_MODEL, {
            dtype: "q8"
        });
        _pipeline = pipe;
        _pipelineLoading = null;
        return pipe;
    })();
    return _pipelineLoading;
}
/**
 * Convert Tensor-like output from transformers pipeline to Float32Array.
 * Transformers.js pipelines return a Tensor with `.data` (Float32Array or similar)
 * and `.dims` [batch, seq, hidden_size]. We flatten to hidden_size via mean pooling.
 */ function tensorToFloat32Array(output) {
    // Handle Tensor objects from @huggingface/transformers
    const tensor = output;
    if (tensor && tensor.data && tensor.dims) {
        const data = tensor.data instanceof Float32Array ? tensor.data : new Float32Array(tensor.data);
        const dims = tensor.dims;
        // Typical dims: [1, seq_len, hidden_size] or [seq_len, hidden_size]
        let seqLen;
        let hiddenSize;
        if (dims.length === 3) {
            // [batch=1, seq_len, hidden_size]
            seqLen = dims[1];
            hiddenSize = dims[2];
        } else if (dims.length === 2) {
            // [seq_len, hidden_size]
            seqLen = dims[0];
            hiddenSize = dims[1];
        } else {
            // Already flat — return as-is
            return data instanceof Float32Array ? data : new Float32Array(data);
        }
        // Mean pool over sequence dimension
        const result = new Float32Array(hiddenSize);
        for(let s = 0; s < seqLen; s++){
            for(let h = 0; h < hiddenSize; h++){
                result[h] += data[s * hiddenSize + h];
            }
        }
        for(let h = 0; h < hiddenSize; h++){
            result[h] /= seqLen;
        }
        return result;
    }
    // Fallback: try tolist()
    if (tensor && typeof tensor.tolist === "function") {
        const list = tensor.tolist();
        if (Array.isArray(list) && Array.isArray(list[0])) {
            // [batch=1][seq_len][hidden]
            const inner = list[0];
            const hiddenSize2 = inner[0].length;
            const result2 = new Float32Array(hiddenSize2);
            for (const row of inner){
                for(let h = 0; h < hiddenSize2; h++){
                    result2[h] += row[h];
                }
            }
            for(let h = 0; h < hiddenSize2; h++){
                result2[h] /= inner.length;
            }
            return result2;
        }
    }
    throw new Error("Cannot convert transformers output to Float32Array");
}
async function embedTransformers(text) {
    const t0 = Date.now();
    let pipe;
    try {
        pipe = await getOrLoadPipeline();
    } catch (err) {
        const isTimeout = err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("timeout"));
        return {
            source: "transformers",
            model: TRANSFORMERS_MODEL,
            reason: isTimeout ? "timeout" : "model_load_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
        };
    }
    try {
        const output = await pipe(text, {
            pooling: "mean",
            normalize: true
        });
        const vector = tensorToFloat32Array(output);
        return {
            vector,
            source: "transformers",
            model: TRANSFORMERS_MODEL,
            dimensions: vector.length,
            latencyMs: Date.now() - t0,
            cached: false
        };
    } catch (err) {
        const isTimeout = err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("timeout"));
        return {
            source: "transformers",
            model: TRANSFORMERS_MODEL,
            reason: isTimeout ? "timeout" : "request_failed",
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
        };
    }
}
}),
"[project]/src/lib/memory/embedding/cache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCacheKey",
    ()=>buildCacheKey,
    "get",
    ()=>get,
    "hashText",
    ()=>hashText,
    "invalidate",
    ()=>invalidate,
    "set",
    ()=>set,
    "stats",
    ()=>stats
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function getEnv(name, defaultValue) {
    const val = process.env[name];
    if (!val) return defaultValue;
    const num = parseInt(val, 10);
    return isNaN(num) ? defaultValue : num;
}
let hitCount = 0;
let missCount = 0;
const store = new Map();
function getTtl() {
    return getEnv("MEMORY_EMBEDDING_CACHE_TTL_MS", 300_000);
}
function getMax() {
    return getEnv("MEMORY_EMBEDDING_CACHE_MAX", 1000);
}
function hashText(text) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(text).digest("hex");
}
function buildCacheKey(source, model, dim, text) {
    const safeModel = model ?? "unknown";
    const safeDim = dim != null ? String(dim) : "0";
    return `${source}:${safeModel}:${safeDim}:${hashText(text)}`;
}
function get(key) {
    const entry = store.get(key);
    if (!entry) {
        missCount++;
        return undefined;
    }
    if (Date.now() - entry.ts > getTtl()) {
        store.delete(key);
        missCount++;
        return undefined;
    }
    hitCount++;
    return entry.vector;
}
function set(key, vector) {
    const max = getMax();
    // LRU eviction: if at capacity, remove oldest entry
    if (store.size >= max && !store.has(key)) {
        const oldestKey = store.keys().next().value;
        if (oldestKey !== undefined) {
            store.delete(oldestKey);
        }
    }
    store.set(key, {
        vector,
        ts: Date.now()
    });
}
function invalidate() {
    store.clear();
    hitCount = 0;
    missCount = 0;
}
function stats() {
    return {
        hits: hitCount,
        misses: missCount,
        size: store.size
    };
}
}),
"[project]/src/lib/memory/embedding/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "embed",
    ()=>embed,
    "listEmbeddingProviders",
    ()=>listEmbeddingProviders,
    "resolveEmbeddingSource",
    ()=>resolveEmbeddingSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$remote$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/remote.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$staticPotion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/staticPotion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$transformersLocal$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/transformersLocal.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/cache.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$remote$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$remote$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const STATIC_MODEL = process.env.MEMORY_STATIC_MODEL || "minishlab/potion-base-8M";
const TRANSFORMERS_MODEL = process.env.MEMORY_TRANSFORMERS_MODEL || "Xenova/all-MiniLM-L6-v2";
/** Build an EmbeddingResolution for "no source available" cases. */ function noSource(reason) {
    return {
        source: null,
        model: null,
        dimensions: null,
        signature: "null:null:null",
        reason
    };
}
/** Build a signature string. */ function makeSignature(source, model, dim) {
    return `${source ?? "null"}:${model ?? "null"}:${dim ?? "null"}`;
}
/**
 * Look up a remote model's vector size from the embedding registry.
 * Returns null when the model is unknown / has no recorded dimensions so
 * callers can keep the lazy-probe path (#8074).
 */ function resolveRemoteDimensions(model) {
    const dim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEmbeddingDimension"])(model);
    return typeof dim === "number" ? dim : null;
}
/** Build the remote EmbeddingResolution used by both explicit + auto paths. */ function remoteResolution(model, reasonPrefix) {
    const dimensions = resolveRemoteDimensions(model);
    return {
        source: "remote",
        model,
        dimensions,
        signature: makeSignature("remote", model, dimensions),
        reason: dimensions !== null ? `${reasonPrefix}: ${model} (dim=${dimensions})` : `${reasonPrefix}: ${model} (dim=unknown, will probe at embed time)`
    };
}
function resolveEmbeddingSource(settings) {
    const source = settings.embeddingSource ?? "auto";
    if (source === "remote") {
        // Explicit remote — check if the configured model has a key
        const model = settings.embeddingProviderModel ?? null;
        if (!model) {
            return {
                source: null,
                model: null,
                dimensions: null,
                signature: makeSignature(null, null, null),
                reason: "no_key: embeddingProviderModel not configured"
            };
        }
        // We can't do async here, so we report it as potentially available
        // and the caller will attempt embed + get no_key error on failure.
        // Dimensions come from the embedding registry when known so sqlite-vec
        // can create `vec_memories` before the first embed (#8074).
        return remoteResolution(model, "remote provider configured");
    }
    if (source === "static") {
        if (settings.staticEnabled !== true) {
            return {
                source: null,
                model: null,
                dimensions: null,
                signature: makeSignature(null, null, null),
                reason: "static disabled in settings"
            };
        }
        return {
            source: "static",
            model: STATIC_MODEL,
            dimensions: 256,
            signature: makeSignature("static", STATIC_MODEL, 256),
            reason: "static (potion-base-8M) explicitly selected"
        };
    }
    if (source === "transformers") {
        if (settings.transformersEnabled !== true) {
            return {
                source: null,
                model: null,
                dimensions: null,
                signature: makeSignature(null, null, null),
                reason: "transformers disabled in settings"
            };
        }
        return {
            source: "transformers",
            model: TRANSFORMERS_MODEL,
            dimensions: 384,
            signature: makeSignature("transformers", TRANSFORMERS_MODEL, 384),
            reason: "transformers.js (MiniLM-L6-v2) explicitly selected"
        };
    }
    // auto: (1) remote if model configured and provider has key in registry
    // (2) static if staticEnabled
    // (3) transformers if transformersEnabled
    // (4) null
    if (source === "auto") {
        // Try remote first — check if embeddingProviderModel is set
        const providerModel = settings.embeddingProviderModel ?? null;
        if (providerModel) {
            const slashIdx = providerModel.indexOf("/");
            const providerId = slashIdx > 0 ? providerModel.slice(0, slashIdx) : null;
            if (providerId && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["EMBEDDING_PROVIDERS"][providerId]) {
                // We defer the actual hasKey check to listEmbeddingProviders (async).
                // For resolveEmbeddingSource (sync), we report "possibly remote" when model is set.
                // If no key, embed will return EmbeddingError{reason:"no_key"}.
                // Dimensions are resolved from the registry when known (#8074).
                return remoteResolution(providerModel, `auto: provider ${providerId} configured`);
            }
        }
        if (settings.staticEnabled === true) {
            return {
                source: "static",
                model: STATIC_MODEL,
                dimensions: 256,
                signature: makeSignature("static", STATIC_MODEL, 256),
                reason: "auto: potion-base-8M (static) available"
            };
        }
        if (settings.transformersEnabled === true) {
            return {
                source: "transformers",
                model: TRANSFORMERS_MODEL,
                dimensions: 384,
                signature: makeSignature("transformers", TRANSFORMERS_MODEL, 384),
                reason: "auto: transformers.js (MiniLM-L6-v2) available"
            };
        }
        return noSource("auto: no embedding source available");
    }
    return noSource("unknown embedding source");
}
async function embed(text, settings) {
    const resolution = resolveEmbeddingSource(settings);
    if (!resolution.source) {
        return {
            source: "remote",
            model: null,
            reason: "unknown",
            message: resolution.reason
        };
    }
    const cacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildCacheKey"])(resolution.source, resolution.model, resolution.dimensions, text);
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["get"])(cacheKey);
    if (cached) {
        return {
            vector: cached,
            source: resolution.source,
            model: resolution.model ?? "",
            dimensions: cached.length,
            latencyMs: 0,
            cached: true
        };
    }
    let result;
    if (resolution.source === "remote") {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$remote$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embedRemote"])(text, resolution.model ?? "");
    } else if (resolution.source === "static") {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$staticPotion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embedStatic"])(text);
    } else {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$transformersLocal$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embedTransformers"])(text);
    }
    if ("vector" in result) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["set"])(cacheKey, result.vector);
    }
    return result;
}
async function listEmbeddingProviders() {
    // Get dynamic local providers
    let dynamicProviders = [];
    try {
        const nodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
        dynamicProviders = (Array.isArray(nodes) ? nodes : []).filter((n)=>{
            const validTypes = [
                "chat",
                "responses",
                "embeddings"
            ];
            return validTypes.includes(n.apiType || "");
        }).map((n)=>{
            try {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildDynamicEmbeddingProvider"])(n);
            } catch  {
                return null;
            }
        }).filter((p)=>p !== null);
    } catch  {
    // Ignore failures — just return static providers
    }
    const result = [];
    // Process hardcoded EMBEDDING_PROVIDERS
    for (const [providerId, config] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["EMBEDDING_PROVIDERS"])){
        let hasKey = false;
        try {
            const creds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(providerId);
            hasKey = !!(creds && !("allRateLimited" in creds && creds.allRateLimited) && (("apiKey" in creds ? !!creds.apiKey : false) || ("accessToken" in creds ? !!creds.accessToken : false)));
        } catch  {
            hasKey = false;
        }
        result.push({
            provider: providerId,
            hasKey,
            models: config.models.map((m)=>({
                    id: `${providerId}/${m.id}`,
                    name: m.name,
                    dimensions: m.dimensions ?? null
                }))
        });
    }
    // Process dynamic providers (local nodes)
    for (const dp of dynamicProviders){
        // Dynamic local providers typically have authType="none"
        result.push({
            provider: dp.id,
            hasKey: true,
            models: dp.models.map((m)=>({
                    id: `${dp.id}/${m.id}`,
                    name: m.name,
                    dimensions: m.dimensions ?? null
                }))
        });
    }
    return result;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/vectorStore.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "_resetVectorStoreSingleton",
    ()=>_resetVectorStoreSingleton,
    "getVectorStore",
    ()=>getVectorStore
]);
// Raw SQL allowed: sqlite-vec virtual table DDL is dynamic (dim varies). See plan 21 §D5.
// Hard Rule #5 exception: sqlite-vec VIRTUAL TABLE cannot be created via src/lib/db/ domain modules
// because the table dimension (N in FLOAT[N]) depends on the active embedding model at runtime.
//
// NOTE on rowid: vec0 v0.1.9 requires BigInt when inserting explicit rowid values.
// The vec_memories table uses the *same* rowid space as the `memories` table to enable
// a simple JOIN (m.rowid = v.rowid). We do NOT use a named primary-key column because
// vec0 rejects numeric (non-BigInt) values for named PKs in this version.
var __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/module [external] (module, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/memoryVec.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/lib/memory/vectorStore.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
;
const _require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("VECTOR_STORE");
// ──────────────── Constants ────────────────
const RRF_K = Number(process.env["MEMORY_RRF_K"] ?? 60);
const TOP_K_DEFAULT = Number(process.env["MEMORY_VEC_TOP_K"] ?? 20);
// ──────────────── Helpers ────────────────
/**
 * Encode a Float32Array as a Buffer of little-endian bytes.
 * sqlite-vec accepts this format for FLOAT[] column values. For int8 tables the
 * SAME float32 blob is passed and quantized in SQL via vec_quantize_int8.
 */ function encodeVector(v) {
    return Buffer.from(v.buffer, v.byteOffset, v.byteLength);
}
/** Mode requested for a NEWLY (re)created vec table (env opt-in, default none). */ function requestedVecQuantization() {
    return process.env["MEMORY_VEC_QUANTIZATION"] === "int8" ? "int8" : "none";
}
/**
 * Mode actually in effect for the EXISTING table, derived from the stored
 * signature. Reads/writes use this (not the env) so they always match the
 * on-disk column type — an env change only takes effect on the next reset.
 */ function storedVecQuantization(signature) {
    return signature && signature.endsWith(":int8") ? "int8" : "none";
}
/** Append the int8 marker so switching modes is a signature change → reindex. */ function withQuantizationSignature(base, q) {
    return q === "int8" ? `${base}:int8` : base;
}
/** vec0 column type for the embedding column. */ function vecColumnType(dim, q) {
    return q === "int8" ? `int8[${dim}]` : `FLOAT[${dim}]`;
}
/**
 * SQL placeholder for a bound float32 blob. int8 tables quantize it in SQL via
 * `vec_quantize_int8(?, 'unit')` (embeddings are unit-normalized); float32 tables
 * bind the raw blob. The bound parameter is ALWAYS the float32 blob either way.
 */ function vecValueExpr(q) {
    return q === "int8" ? "vec_quantize_int8(?, 'unit')" : "?";
}
/** Quantization mode of the live table (from the persisted signature). */ function liveVecQuantization() {
    return storedVecQuantization((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemoryVecMeta"])().embeddingSignature);
}
/**
 * True for the specific SQLite error `ensureReady()`'s check-then-act race can
 * produce: a concurrent caller's `resetForSignature()` (DROP + CREATE) drops
 * the table between THIS caller's own `ensureReady()` and its subsequent
 * write/delete, so the table is briefly and unexpectedly gone even though
 * `memory_vec_meta` still says it's ready.
 */ function isMissingVecTableError(err) {
    const msg = err instanceof Error ? err.message : String(err);
    return /no such table:\s*vec_memories\b/.test(msg);
}
/**
 * Recreate `vec_memories` from the last-known-good `memory_vec_meta` row
 * (not a fresh `EmbeddingResolution` — the caller may not have one handy at
 * this point, e.g. inside a catch block). No-op (returns false) if there is
 * no recorded dimension to recreate from, in which case the original error
 * should be rethrown by the caller.
 */ function recreateFromMeta() {
    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemoryVecMeta"])();
    if (meta.activeDim == null) return false;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const q = storedVecQuantization(meta.embeddingSignature);
    db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories USING vec0(embedding ${vecColumnType(meta.activeDim, q)})`);
    return true;
}
// ──────────────── Implementation ────────────────
class VectorStoreImpl {
    async ensureReady(resolution) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemoryVecMeta"])();
        const requested = requestedVecQuantization();
        // The quantization mode is folded into the signature so flipping it (e.g.
        // none → int8) is detected as a signature change and triggers a reindex.
        if (resolution.dimensions !== null) {
            const effectiveSignature = withQuantizationSignature(resolution.signature, requested);
            if (effectiveSignature !== meta.embeddingSignature) {
                await this.resetForSignature(effectiveSignature, resolution.dimensions);
                return {
                    ready: true,
                    reason: `vec_memories recreated with dim=${resolution.dimensions} (${requested})`
                };
            }
        }
        // Already marked loaded → idempotent no-op.
        if (meta.vecLoaded) {
            return {
                ready: true,
                reason: "vec_memories already ready"
            };
        }
        // Not yet loaded but we have a dim — create the table now. Use the mode of the
        // EXISTING data (from the stored signature) so the column type matches on-disk.
        if (resolution.dimensions !== null) {
            const dim = meta.activeDim ?? resolution.dimensions;
            const q = storedVecQuantization(meta.embeddingSignature);
            try {
                db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories USING vec0(embedding ${vecColumnType(dim, q)})`);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setMemoryVecMeta"])({
                    vecLoaded: true,
                    activeDim: dim
                });
                return {
                    ready: true,
                    reason: `vec_memories created with dim=${dim} (${q})`
                };
            } catch (err) {
                const msg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
                return {
                    ready: false,
                    reason: `failed to create vec_memories: ${msg}`
                };
            }
        }
        return {
            ready: false,
            reason: "no dimensions available yet (lazy probe pending)"
        };
    }
    async upsertVector(memoryId, vector) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        // Map UUID memoryId → INTEGER rowid (the rowid is used as the FK into vec_memories).
        const row = db.prepare("SELECT rowid FROM memories WHERE id = ?").get(memoryId);
        if (!row) {
            throw new Error(`memory not found: ${memoryId}`);
        }
        // vec0 v0.1.9 requires BigInt for explicit rowid insertion — plain numbers are rejected.
        // INSERT OR REPLACE is not supported by vec0 — use DELETE + INSERT for upsert semantics.
        // int8 tables quantize the float32 blob in SQL (vec_quantize_int8); float32 bind raw.
        const q = liveVecQuantization();
        try {
            db.prepare("DELETE FROM vec_memories WHERE rowid = ?").run(BigInt(row.rowid));
            db.prepare(`INSERT INTO vec_memories(rowid, embedding) VALUES (?, ${vecValueExpr(q)})`).run(BigInt(row.rowid), encodeVector(vector));
        } catch (err) {
            // Self-heal: a concurrent ensureReady()'s reset raced ahead of us and
            // dropped the table after our own ensureReady() already ran. Recreate
            // from the last-known-good meta and retry once before giving up.
            if (!isMissingVecTableError(err) || !recreateFromMeta()) throw err;
            db.prepare("DELETE FROM vec_memories WHERE rowid = ?").run(BigInt(row.rowid));
            db.prepare(`INSERT INTO vec_memories(rowid, embedding) VALUES (?, ${vecValueExpr(q)})`).run(BigInt(row.rowid), encodeVector(vector));
        }
    }
    async deleteVector(memoryId) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        try {
            db.prepare("DELETE FROM vec_memories WHERE rowid = (SELECT rowid FROM memories WHERE id = ?)").run(memoryId);
        } catch (err) {
            if (!isMissingVecTableError(err)) throw err;
            // Table already gone (racing reset, or nothing to delete) — recreating it
            // empty is sufficient; there is nothing left to delete either way.
            recreateFromMeta();
        }
    }
    async searchVector(vector, topK, apiKeyId) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const k = topK > 0 ? topK : TOP_K_DEFAULT;
        const q = liveVecQuantization();
        const rows = db.prepare(`SELECT m.id AS memory_id, v.distance
         FROM vec_memories v
         JOIN memories m ON m.rowid = v.rowid
         WHERE v.embedding MATCH ${vecValueExpr(q)}
           AND ($apiKeyId IS NULL OR m.api_key_id = $apiKeyId)
           AND k = ?
         ORDER BY v.distance ASC`).all(encodeVector(vector), {
            apiKeyId: apiKeyId ?? null
        }, k);
        return rows.map((r)=>({
                memoryId: r.memory_id,
                distance: r.distance,
                score: 1 / (1 + r.distance)
            }));
    }
    async searchHybrid(vector, queryText, topK, apiKeyId) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const k = topK > 0 ? topK : TOP_K_DEFAULT;
        const rrfK = RRF_K;
        const q = liveVecQuantization();
        // SQLite does not support FULL OUTER JOIN — use UNION ALL + GROUP BY (RRF recipe).
        // Reference: https://alexgarcia.xyz/blog/2024/sqlite-vec-hybrid-search/
        const rows = db.prepare(`WITH vec_results AS (
           SELECT m.id AS memory_id,
                  ROW_NUMBER() OVER (ORDER BY v.distance ASC) AS vec_rank,
                  v.distance AS vec_distance
           FROM vec_memories v
           JOIN memories m ON m.rowid = v.rowid
           WHERE v.embedding MATCH ${vecValueExpr(q)}
             AND ($apiKeyId IS NULL OR m.api_key_id = $apiKeyId)
             AND k = ?
         ),
         fts_results AS (
           SELECT m.id AS memory_id,
                  ROW_NUMBER() OVER (ORDER BY fts.rank ASC) AS fts_rank,
                  fts.rank AS fts_score
           FROM memory_fts fts
           JOIN memories m ON m.memory_id = fts.rowid
           WHERE fts.memory_fts MATCH ?
             AND ($apiKeyId IS NULL OR m.api_key_id = $apiKeyId)
           LIMIT ?
         ),
         fused AS (
           SELECT
             memory_id,
             MAX(vec_rank)      AS vec_rank,
             MAX(fts_rank)      AS fts_rank,
             MAX(vec_distance)  AS vec_distance,
             MAX(fts_score)     AS fts_score,
             SUM(rrf_contrib)   AS rrf_score
           FROM (
             SELECT memory_id, vec_rank, NULL AS fts_rank, vec_distance,
                    NULL AS fts_score, 1.0 / (${rrfK} + vec_rank) AS rrf_contrib
             FROM vec_results
             UNION ALL
             SELECT memory_id, NULL, fts_rank, NULL, fts_score, 1.0 / (${rrfK} + fts_rank)
             FROM fts_results
           )
           GROUP BY memory_id
         )
         SELECT memory_id, vec_rank, fts_rank, vec_distance, fts_score, rrf_score
         FROM fused
         ORDER BY rrf_score DESC
         LIMIT ?`).all(encodeVector(vector), {
            apiKeyId: apiKeyId ?? null
        }, k, queryText, k, k);
        return rows.map((r)=>({
                memoryId: r.memory_id,
                vecRank: r.vec_rank,
                ftsRank: r.fts_rank,
                rrfScore: r.rrf_score,
                vecDistance: r.vec_distance,
                ftsScore: r.fts_score
            }));
    }
    async stats() {
        let rowCount = 0;
        try {
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
            const row = db.prepare("SELECT COUNT(*) AS cnt FROM vec_memories").get();
            rowCount = row?.cnt ?? 0;
        } catch  {
            // vec_memories may not exist yet — not an error, just 0 rows.
            rowCount = 0;
        }
        const needsReindex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["countMemoryReindexPending"])();
        const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemoryVecMeta"])();
        return {
            rowCount,
            needsReindex,
            activeDim: meta.activeDim,
            signature: meta.embeddingSignature
        };
    }
    async resetForSignature(signature, dim) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        // The column type follows the mode encoded in the (effective) signature.
        const q = storedVecQuantization(signature);
        // DROP + CREATE is intentionally destructive — triggers lazy backfill via F5.
        db.exec("DROP TABLE IF EXISTS vec_memories");
        db.exec(`CREATE VIRTUAL TABLE vec_memories USING vec0(embedding ${vecColumnType(dim, q)})`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markAllMemoriesNeedReindex"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setMemoryVecMeta"])({
            activeDim: dim,
            embeddingSignature: signature,
            lastResetAt: new Date().toISOString(),
            vecLoaded: true
        });
    }
}
// ──────────────── Singleton ────────────────
let _instance = undefined; // undefined = not yet attempted
function getVectorStore() {
    if (_instance !== undefined) {
        return _instance;
    }
    // Test seam: VECTOR_STORE_DISABLE_VEC=true forces null (simulates cloud/WASM environment).
    if (process.env["VECTOR_STORE_DISABLE_VEC"] === "true") {
        log.warn("VECTOR_STORE_DISABLE_VEC is set — sqlite-vec disabled. Degrading to FTS5 keyword search.");
        _instance = null;
        return null;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const raw = db.raw;
    // sqlite-vec must be loaded as a native extension on the better-sqlite3 raw handle.
    // The SqliteAdapter wrapper does not expose loadExtension directly.
    if (!raw || typeof raw.loadExtension !== "function") {
        log.warn("sqlite-vec not loaded: db driver does not support loadExtension (cloud/WASM backend). " + "Degrading to FTS5 keyword search.");
        _instance = null;
        return null;
    }
    try {
        const sqliteVec = __turbopack_context__.r("[externals]/sqlite-vec [external] (sqlite-vec, cjs, [project]/node_modules/sqlite-vec)");
        sqliteVec.load(raw);
        log.info("sqlite-vec loaded successfully");
        _instance = new VectorStoreImpl();
    } catch (err) {
        const safeMsg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        log.warn(`sqlite-vec failed to load: ${safeMsg}. Degrading to FTS5 keyword search.`);
        _instance = null;
    }
    return _instance;
}
function _resetVectorStoreSingleton() {
    _instance = undefined;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/settings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DEFAULT_MEMORY_SETTINGS",
    ()=>DEFAULT_MEMORY_SETTINGS,
    "getMemorySettings",
    ()=>getMemorySettings,
    "invalidateMemorySettingsCache",
    ()=>invalidateMemorySettingsCache,
    "normalizeMemorySettings",
    ()=>normalizeMemorySettings,
    "toMemoryRetrievalConfig",
    ()=>toMemoryRetrievalConfig,
    "toMemorySettingsUpdates",
    ()=>toMemorySettingsUpdates
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const DEFAULT_MEMORY_SETTINGS = {
    // Off by default: enabling memory injects up to `maxTokens` (~2k) of retrieved
    // context into every chat request, which is billed — a surprising cost for new
    // installs and for clients that manage their own context. Opt in explicitly via
    // Settings → Memory (the UI warns about the token cost). Per-request opt-out is
    // also available via the `x-omniroute-no-memory` header. See
    // _tasks/PRD-2026-06-19-no-memory-header.md.
    enabled: false,
    maxTokens: 2000,
    retentionDays: 30,
    strategy: "hybrid",
    skillsEnabled: true,
    // Plan 21 — D9 defaults
    embeddingSource: "auto",
    embeddingProviderModel: null,
    transformersEnabled: false,
    staticEnabled: false,
    rerankEnabled: false,
    rerankProviderModel: null,
    vectorStore: "auto",
    // Phase 1-2: MemoryBackend defaults
    primaryBackend: "sqlite",
    fallbackBackends: [],
    backendConfigs: {}
};
let cachedMemorySettings = null;
function toBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
function clampInteger(value, fallback, min, max) {
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.min(Math.max(Math.round(value), min), max);
}
function normalizeStrategy(value) {
    return value === "recent" || value === "semantic" || value === "hybrid" ? value : DEFAULT_MEMORY_SETTINGS.strategy;
}
function normalizeEmbeddingSource(value) {
    return value === "remote" || value === "static" || value === "transformers" || value === "auto" ? value : DEFAULT_MEMORY_SETTINGS.embeddingSource;
}
function normalizeVectorStore(value) {
    return value === "sqlite-vec" || value === "qdrant" || value === "auto" ? value : DEFAULT_MEMORY_SETTINGS.vectorStore;
}
function normalizeNullableString(value, fallback) {
    if (value === null || value === undefined) return fallback;
    return typeof value === "string" && value.length > 0 ? value : fallback;
}
function normalizeMemorySettings(rawSettings = {}) {
    return {
        enabled: toBoolean(rawSettings.memoryEnabled, DEFAULT_MEMORY_SETTINGS.enabled),
        maxTokens: clampInteger(rawSettings.memoryMaxTokens, DEFAULT_MEMORY_SETTINGS.maxTokens, 0, 16000),
        retentionDays: clampInteger(rawSettings.memoryRetentionDays, DEFAULT_MEMORY_SETTINGS.retentionDays, 1, 365),
        strategy: normalizeStrategy(rawSettings.memoryStrategy),
        skillsEnabled: toBoolean(rawSettings.skillsEnabled, DEFAULT_MEMORY_SETTINGS.skillsEnabled),
        // Plan 21 — D9 new fields
        embeddingSource: normalizeEmbeddingSource(rawSettings.memoryEmbeddingSource),
        embeddingProviderModel: normalizeNullableString(rawSettings.memoryEmbeddingProviderModel, DEFAULT_MEMORY_SETTINGS.embeddingProviderModel),
        transformersEnabled: toBoolean(rawSettings.memoryTransformersEnabled, DEFAULT_MEMORY_SETTINGS.transformersEnabled),
        staticEnabled: toBoolean(rawSettings.memoryStaticEnabled, DEFAULT_MEMORY_SETTINGS.staticEnabled),
        rerankEnabled: toBoolean(rawSettings.memoryRerankEnabled, DEFAULT_MEMORY_SETTINGS.rerankEnabled),
        rerankProviderModel: normalizeNullableString(rawSettings.memoryRerankProviderModel, DEFAULT_MEMORY_SETTINGS.rerankProviderModel),
        vectorStore: normalizeVectorStore(rawSettings.memoryVectorStore),
        // Phase 1-2: MemoryBackend fields
        primaryBackend: typeof rawSettings.memoryPrimaryBackend === "string" ? rawSettings.memoryPrimaryBackend : DEFAULT_MEMORY_SETTINGS.primaryBackend,
        fallbackBackends: Array.isArray(rawSettings.memoryFallbackBackends) ? rawSettings.memoryFallbackBackends.filter((v)=>typeof v === "string") : DEFAULT_MEMORY_SETTINGS.fallbackBackends,
        backendConfigs: typeof rawSettings.memoryBackendConfigs === "object" && rawSettings.memoryBackendConfigs !== null ? rawSettings.memoryBackendConfigs : DEFAULT_MEMORY_SETTINGS.backendConfigs
    };
}
function toMemorySettingsUpdates(settings) {
    const updates = {};
    if (settings.enabled !== undefined) updates.memoryEnabled = settings.enabled;
    if (settings.maxTokens !== undefined) updates.memoryMaxTokens = settings.maxTokens;
    if (settings.retentionDays !== undefined) updates.memoryRetentionDays = settings.retentionDays;
    if (settings.strategy !== undefined) updates.memoryStrategy = settings.strategy;
    if (settings.skillsEnabled !== undefined) updates.skillsEnabled = settings.skillsEnabled;
    // Plan 21 — D9 new fields
    if (settings.embeddingSource !== undefined) updates.memoryEmbeddingSource = settings.embeddingSource;
    if (settings.embeddingProviderModel !== undefined) updates.memoryEmbeddingProviderModel = settings.embeddingProviderModel;
    if (settings.transformersEnabled !== undefined) updates.memoryTransformersEnabled = settings.transformersEnabled;
    if (settings.staticEnabled !== undefined) updates.memoryStaticEnabled = settings.staticEnabled;
    if (settings.rerankEnabled !== undefined) updates.memoryRerankEnabled = settings.rerankEnabled;
    if (settings.rerankProviderModel !== undefined) updates.memoryRerankProviderModel = settings.rerankProviderModel;
    if (settings.vectorStore !== undefined) updates.memoryVectorStore = settings.vectorStore;
    // Phase 1-2: MemoryBackend fields
    if (settings.primaryBackend !== undefined) updates.memoryPrimaryBackend = settings.primaryBackend;
    if (settings.fallbackBackends !== undefined) updates.memoryFallbackBackends = settings.fallbackBackends;
    if (settings.backendConfigs !== undefined) updates.memoryBackendConfigs = settings.backendConfigs;
    return updates;
}
function toMemoryRetrievalConfig(settings, extra = {}) {
    const enabled = settings.enabled && settings.maxTokens > 0;
    const config = {
        enabled,
        maxTokens: enabled ? settings.maxTokens : 0,
        retrievalStrategy: settings.strategy === "recent" ? "exact" : settings.strategy,
        autoSummarize: false,
        persistAcrossModels: false,
        retentionDays: settings.retentionDays,
        scope: "apiKey"
    };
    // Plan 21 FAIL #1 fix: forward the last user message as `query` so that
    // semantic / hybrid strategies actually exercise the vector store in the
    // chat hot path (chatCore.ts), not only in the Playground.
    //
    // BUT only for query-driven strategies. The "recent" strategy (mapped to the
    // internal "exact" path) is recency-based: it must return the most recent
    // memories regardless of the current prompt. Forwarding a query there makes
    // retrieveMemories apply relevance filtering (score > 0), which silently
    // drops recent memories whose text doesn't overlap the prompt — breaking the
    // "recent" contract. So skip query forwarding when strategy === "recent".
    if (extra.query && extra.query.trim().length > 0 && settings.strategy !== "recent") {
        config.query = extra.query.trim();
    }
    return config;
}
async function getMemorySettings() {
    if (cachedMemorySettings !== null) {
        return cachedMemorySettings;
    }
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
    cachedMemorySettings = normalizeMemorySettings(settings);
    return cachedMemorySettings;
}
function invalidateMemorySettingsCache() {
    cachedMemorySettings = null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/qdrant.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildQuantizationConfig",
    ()=>buildQuantizationConfig,
    "checkQdrantHealth",
    ()=>checkQdrantHealth,
    "cleanupSemanticMemoryPoints",
    ()=>cleanupSemanticMemoryPoints,
    "deleteSemanticMemoryPoint",
    ()=>deleteSemanticMemoryPoint,
    "getQdrantConfig",
    ()=>getQdrantConfig,
    "normalizeQdrantConfig",
    ()=>normalizeQdrantConfig,
    "searchQuantizationParams",
    ()=>searchQuantizationParams,
    "searchSemanticMemory",
    ()=>searchSemanticMemory,
    "upsertSemanticMemoryPoint",
    ()=>upsertSemanticMemoryPoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/embeddings/service.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const QDRANT_QUANTIZATION_MODES = [
    "none",
    "int8",
    "binary"
];
function buildQuantizationConfig(quantization) {
    switch(quantization){
        case "int8":
            return {
                scalar: {
                    type: "int8",
                    always_ram: true,
                    quantile: 0.99
                }
            };
        case "binary":
            return {
                binary: {
                    always_ram: true
                }
            };
        case "none":
        default:
            return undefined;
    }
}
function searchQuantizationParams(quantization) {
    if (quantization === "none") return undefined;
    return {
        quantization: {
            rescore: true
        }
    };
}
function normalizeQdrantConfig(settings) {
    // Env-var fallbacks (cluster profile: docker compose --profile memory).
    // Settings-table values take precedence when present, so users who configure
    // Qdrant via the Settings UI are not overridden by the container hostname.
    const envHost = typeof process.env.QDRANT_HOST === "string" ? process.env.QDRANT_HOST.trim() : "";
    const envPortRaw = process.env.QDRANT_PORT;
    const envPort = typeof envPortRaw === "string" && envPortRaw.trim().length > 0 ? Math.round(Number(envPortRaw) || 6333) : undefined;
    const envApiKey = typeof process.env.QDRANT_API_KEY === "string" && process.env.QDRANT_API_KEY.trim().length > 0 ? process.env.QDRANT_API_KEY.trim() : undefined;
    const envCollection = typeof process.env.QDRANT_COLLECTION === "string" && process.env.QDRANT_COLLECTION.trim().length > 0 ? process.env.QDRANT_COLLECTION.trim() : undefined;
    const host = (typeof settings.qdrantHost === "string" ? settings.qdrantHost.trim() : "") || envHost || "";
    const portRaw = settings.qdrantPort;
    const port = typeof portRaw === "number" && Number.isFinite(portRaw) ? Math.round(portRaw) : typeof portRaw === "string" ? Math.round(Number(portRaw) || 6333) : envPort ?? 6333;
    const apiKey = (typeof settings.qdrantApiKey === "string" && settings.qdrantApiKey.trim().length > 0 ? settings.qdrantApiKey.trim() : null) ?? envApiKey ?? null;
    const collection = (typeof settings.qdrantCollection === "string" && settings.qdrantCollection.trim().length > 0 ? settings.qdrantCollection.trim() : null) ?? envCollection ?? "omniroute_memory";
    const embeddingModel = (typeof settings.qdrantEmbeddingModel === "string" && settings.qdrantEmbeddingModel.trim().length > 0 ? settings.qdrantEmbeddingModel.trim() : null) ?? (typeof process.env.QDRANT_EMBEDDING_MODEL === "string" && process.env.QDRANT_EMBEDDING_MODEL.trim().length > 0 ? process.env.QDRANT_EMBEDDING_MODEL.trim() : null) ?? "openai/text-embedding-3-small";
    const enabled = settings.qdrantEnabled === true;
    const quantizationRaw = settings.qdrantQuantization;
    const quantization = typeof quantizationRaw === "string" && QDRANT_QUANTIZATION_MODES.includes(quantizationRaw) ? quantizationRaw : "none";
    // Vector size + HNSW ef_construct are deployment-time constants. They are
    // read here so the env vars documented in .env.example (QDRANT_VECTOR_SIZE,
    // QDRANT_HNSW_EF_CONSTRUCT) have a single source of truth and don't get
    // flagged as DOC_ONLY by check-env-doc-sync.
    const vectorSizeRaw = typeof settings.qdrantVectorSize === "number" ? settings.qdrantVectorSize : typeof settings.qdrantVectorSize === "string" ? Number(settings.qdrantVectorSize) : Number(process.env.QDRANT_VECTOR_SIZE) || 1536;
    const vectorSize = Number.isFinite(vectorSizeRaw) && vectorSizeRaw > 0 ? vectorSizeRaw : 1536;
    const hnswEfRaw = typeof settings.qdrantHnswEfConstruct === "number" ? settings.qdrantHnswEfConstruct : typeof settings.qdrantHnswEfConstruct === "string" ? Number(settings.qdrantHnswEfConstruct) : Number(process.env.QDRANT_HNSW_EF_CONSTRUCT) || 128;
    const hnswEfConstruct = Number.isFinite(hnswEfRaw) && hnswEfRaw > 0 ? hnswEfRaw : 128;
    return {
        enabled,
        host,
        port,
        apiKey,
        collection,
        embeddingModel,
        quantization,
        vectorSize,
        hnswEfConstruct
    };
}
async function getQdrantConfig() {
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
    return normalizeQdrantConfig(settings);
}
function baseUrl(cfg) {
    const host = cfg.host.replace(/\/+$/, "");
    const withProto = host.startsWith("http://") || host.startsWith("https://") ? host : `http://${host}`;
    try {
        const url = new URL(withProto);
        if (!url.port) url.port = String(cfg.port);
        return url.toString().replace(/\/+$/, "");
    } catch  {
        return `${withProto}:${cfg.port}`;
    }
}
async function qdrantFetch(cfg, path, init) {
    const headers = {
        "content-type": "application/json",
        ...init?.headers
    };
    if (cfg.apiKey) headers["api-key"] = cfg.apiKey;
    return fetch(`${baseUrl(cfg)}${path}`, {
        ...init,
        headers
    });
}
async function checkQdrantHealth() {
    const cfg = await getQdrantConfig();
    const start = Date.now();
    if (!cfg.enabled || !cfg.host) {
        return {
            ok: false,
            latencyMs: 0,
            error: "not_configured"
        };
    }
    try {
        const res = await qdrantFetch(cfg, "/readyz", {
            method: "GET"
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) {
            const text = await res.text().catch(()=>"");
            return {
                ok: false,
                latencyMs,
                error: text.slice(0, 200) || `HTTP ${res.status}`
            };
        }
        return {
            ok: true,
            latencyMs
        };
    } catch (err) {
        return {
            ok: false,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err)
        };
    }
}
async function ensureCollection(cfg, vectorSize) {
    const getRes = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}`, {
        method: "GET"
    });
    if (getRes.ok) return;
    // Quantization only applies to NEW collections — an existing collection is left
    // untouched (the GET above returns early). Switching modes on a populated
    // collection is a destructive recreate+reindex that must be an explicit UI action.
    const quantizationConfig = buildQuantizationConfig(cfg.quantization);
    const createRes = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}`, {
        method: "PUT",
        body: JSON.stringify({
            vectors: {
                size: vectorSize,
                distance: "Cosine"
            },
            ...quantizationConfig ? {
                quantization_config: quantizationConfig
            } : {}
        })
    });
    if (!createRes.ok) {
        const text = await createRes.text().catch(()=>"");
        throw new Error(text.slice(0, 300) || `Failed to create collection (${createRes.status})`);
    }
}
async function getCollectionVectorName(cfg) {
    const res = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}`, {
        method: "GET"
    });
    if (!res.ok) return null;
    const data = await res.json().catch(()=>null);
    const vectors = data?.result?.config?.params?.vectors;
    if (!vectors || typeof vectors !== "object" || Array.isArray(vectors)) {
        return null;
    }
    // Unnamed/single-vector config: { size, distance, ... } (not a named map)
    if (Object.prototype.hasOwnProperty.call(vectors, "size") && (typeof vectors.size === "number" || typeof vectors.size === "string")) {
        return null;
    }
    const names = Object.keys(vectors);
    if (names.length === 0) return null;
    return names[0] || null;
}
async function embedText(cfg, text) {
    const modelStr = cfg.embeddingModel.trim();
    if (!modelStr.includes("/")) {
        throw new Error(`Invalid embedding model '${modelStr}'. Use provider/model format.`);
    }
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$service$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createEmbeddingResponse"])({
        model: modelStr,
        input: text
    });
    if (!res.ok) {
        const txt = await res.text().catch(()=>"");
        throw new Error(txt.slice(0, 300) || `Embeddings request failed (${res.status})`);
    }
    const data = await res.json().catch(()=>null);
    const vec = data?.data?.[0]?.embedding;
    if (!Array.isArray(vec) || vec.length === 0) {
        throw new Error("Embedding response missing vector");
    }
    return vec;
}
async function upsertSemanticMemoryPoint(input) {
    const cfg = await getQdrantConfig();
    if (!cfg.enabled || !cfg.host) return {
        ok: false,
        latencyMs: 0,
        error: "not_configured"
    };
    const start = Date.now();
    try {
        const vector = await embedText(cfg, `${input.key}\n\n${input.content}`);
        await ensureCollection(cfg, vector.length);
        const vectorName = await getCollectionVectorName(cfg);
        const createdAtUnix = Math.floor(new Date(input.createdAt).getTime() / 1000);
        const expiresAtUnix = input.expiresAt ? Math.floor(new Date(input.expiresAt).getTime() / 1000) : null;
        const payload = {
            kind: "omniroute_memory",
            memoryId: input.id,
            apiKeyId: input.apiKeyId || "",
            sessionId: input.sessionId || "",
            type: "semantic",
            key: input.key || "",
            content: input.content || "",
            metadata: input.metadata || {},
            createdAtUnix,
            expiresAtUnix
        };
        const res = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}/points?wait=true`, {
            method: "PUT",
            body: JSON.stringify({
                points: [
                    {
                        id: input.id,
                        vector: vectorName ? {
                            [vectorName]: vector
                        } : vector,
                        payload
                    }
                ]
            })
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) {
            const text = await res.text().catch(()=>"");
            return {
                ok: false,
                latencyMs,
                error: text.slice(0, 300) || `HTTP ${res.status}`
            };
        }
        return {
            ok: true,
            latencyMs
        };
    } catch (err) {
        return {
            ok: false,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err)
        };
    }
}
async function searchSemanticMemory(query, topK = 5, scope) {
    const cfg = await getQdrantConfig();
    if (!cfg.enabled || !cfg.host) return {
        ok: false,
        latencyMs: 0,
        error: "not_configured"
    };
    const start = Date.now();
    try {
        const vector = await embedText(cfg, query);
        await ensureCollection(cfg, vector.length);
        const vectorName = await getCollectionVectorName(cfg);
        const searchParams = searchQuantizationParams(cfg.quantization);
        const res = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}/points/search`, {
            method: "POST",
            body: JSON.stringify({
                vector: vectorName ? {
                    name: vectorName,
                    vector
                } : vector,
                limit: Math.max(1, Math.min(20, topK)),
                ...searchParams ? {
                    params: searchParams
                } : {},
                filter: {
                    must: [
                        {
                            key: "kind",
                            match: {
                                value: "omniroute_memory"
                            }
                        },
                        ...scope?.apiKeyId ? [
                            {
                                key: "apiKeyId",
                                match: {
                                    value: scope.apiKeyId
                                }
                            }
                        ] : [],
                        ...scope?.sessionId ? [
                            {
                                key: "sessionId",
                                match: {
                                    value: String(scope.sessionId)
                                }
                            }
                        ] : []
                    ]
                },
                with_payload: true
            })
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) {
            const text = await res.text().catch(()=>"");
            return {
                ok: false,
                latencyMs,
                error: text.slice(0, 300) || `HTTP ${res.status}`
            };
        }
        const data = await res.json().catch(()=>null);
        const result = Array.isArray(data?.result) ? data.result : [];
        return {
            ok: true,
            latencyMs,
            results: result.map((r)=>({
                    id: String(r.id),
                    score: typeof r.score === "number" ? r.score : 0,
                    payload: r.payload && typeof r.payload === "object" ? r.payload : undefined
                }))
        };
    } catch (err) {
        return {
            ok: false,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err)
        };
    }
}
async function deleteSemanticMemoryPoint(id) {
    const cfg = await getQdrantConfig();
    if (!cfg.enabled || !cfg.host) return {
        ok: false,
        latencyMs: 0,
        error: "not_configured"
    };
    const start = Date.now();
    try {
        const res = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}/points/delete?wait=true`, {
            method: "POST",
            body: JSON.stringify({
                points: [
                    id
                ]
            })
        });
        const latencyMs = Date.now() - start;
        if (!res.ok) {
            const text = await res.text().catch(()=>"");
            return {
                ok: false,
                latencyMs,
                error: text.slice(0, 300) || `HTTP ${res.status}`
            };
        }
        return {
            ok: true,
            latencyMs
        };
    } catch (err) {
        return {
            ok: false,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err)
        };
    }
}
async function cleanupSemanticMemoryPoints(input) {
    const cfg = await getQdrantConfig();
    if (!cfg.enabled || !cfg.host) return {
        ok: false,
        deletedCount: 0,
        latencyMs: 0,
        error: "not_configured"
    };
    const retentionDays = typeof input.retentionDays === "number" && Number.isFinite(input.retentionDays) ? Math.max(1, Math.min(3650, Math.round(input.retentionDays))) : 30;
    const start = Date.now();
    try {
        const nowUnix = Math.floor(Date.now() / 1000);
        const cutoffUnix = nowUnix - retentionDays * 24 * 60 * 60;
        const filter = {
            must: [
                {
                    key: "kind",
                    match: {
                        value: "omniroute_memory"
                    }
                }
            ],
            should: [
                {
                    key: "expiresAtUnix",
                    range: {
                        lt: nowUnix
                    }
                },
                {
                    key: "createdAtUnix",
                    range: {
                        lt: cutoffUnix
                    }
                }
            ]
        };
        // Count first (so we can show an actual number in the dashboard)
        const countRes = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}/points/count`, {
            method: "POST",
            body: JSON.stringify({
                filter,
                exact: true
            })
        });
        if (!countRes.ok) {
            const text = await countRes.text().catch(()=>"");
            return {
                ok: false,
                deletedCount: 0,
                latencyMs: Date.now() - start,
                error: text.slice(0, 300) || `HTTP ${countRes.status}`
            };
        }
        const countData = await countRes.json().catch(()=>null);
        const toDelete = typeof countData?.result?.count === "number" && Number.isFinite(countData.result.count) ? Math.max(0, Math.round(countData.result.count)) : 0;
        if (toDelete === 0) {
            return {
                ok: true,
                deletedCount: 0,
                latencyMs: Date.now() - start
            };
        }
        const delRes = await qdrantFetch(cfg, `/collections/${encodeURIComponent(cfg.collection)}/points/delete?wait=true`, {
            method: "POST",
            body: JSON.stringify({
                filter
            })
        });
        if (!delRes.ok) {
            const text = await delRes.text().catch(()=>"");
            return {
                ok: false,
                deletedCount: 0,
                latencyMs: Date.now() - start,
                error: text.slice(0, 300) || `HTTP ${delRes.status}`
            };
        }
        return {
            ok: true,
            deletedCount: toDelete,
            latencyMs: Date.now() - start
        };
    } catch (err) {
        return {
            ok: false,
            deletedCount: 0,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err)
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/store.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createMemory",
    ()=>createMemory,
    "deleteMemory",
    ()=>deleteMemory,
    "getMemory",
    ()=>getMemory,
    "getMemoryTokensUsed",
    ()=>getMemoryTokensUsed,
    "listMemories",
    ()=>listMemories,
    "listMemoriesForDecay",
    ()=>listMemoriesForDecay,
    "recordMemoryAccess",
    ()=>recordMemoryAccess,
    "updateMemory",
    ()=>updateMemory
]);
/**
 * Memory store - CRUD operations with prepared statements and caching
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/qdrant.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/vectorStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/memoryVec.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("MEMORY_STORE");
// Memory cache configuration
const MEMORY_CACHE_TTL = 60_000; // 1 minute
const MEMORY_MAX_CACHE_SIZE = 500;
// Cache for recently accessed memories
const _memoryCache = new Map();
// Helper function to safely parse JSON strings
function parseJSON(value) {
    if (!value || typeof value !== "string" || value.trim() === "") {
        return {};
    }
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch  {
        return {};
    }
}
function invalidateMemoryCache(key) {
    _memoryCache.delete(key);
}
function evictIfNeeded(cache) {
    if (cache.size > MEMORY_MAX_CACHE_SIZE) {
        // Remove oldest entries first
        const keysArray = Array.from(cache.keys());
        const entriesToRemove = Math.floor(cache.size * 0.2);
        for(let i = 0; i < entriesToRemove; i++){
            cache.delete(keysArray[i]);
        }
    }
}
function rowToMemory(row) {
    return {
        id: String(row.id),
        apiKeyId: String(row.api_key_id),
        sessionId: typeof row.session_id === "string" ? row.session_id : "",
        type: row.type,
        key: typeof row.key === "string" ? row.key : "",
        content: String(row.content),
        metadata: parseJSON(row.metadata),
        createdAt: new Date(String(row.created_at)),
        updatedAt: new Date(String(row.updated_at)),
        expiresAt: row.expires_at ? new Date(String(row.expires_at)) : null,
        accessCount: typeof row.access_count === "number" ? row.access_count : 0,
        lastAccessedAt: row.last_accessed_at ? new Date(String(row.last_accessed_at)) : null
    };
}
/**
 * Find existing memory by apiKeyId and key (for UPSERT logic)
 */ function findExistingMemory(db, apiKeyId, key) {
    if (!key) return undefined;
    const stmt = db.prepare("SELECT * FROM memories WHERE api_key_id = ? AND key = ? ORDER BY created_at DESC LIMIT 1");
    return stmt.get(apiKeyId, key);
}
/**
 * Fire-and-forget: generate embedding for a memory and upsert into sqlite-vec.
 * Errors are logged but never thrown — this must never block the SQLite write.
 */ /**
 * Best-effort: try to mark a memory needs_reindex. Swallows errors so that DB-closed
 * states (e.g. test teardown after the parent promise resolved) never escape as
 * unhandledRejection. Producing this side-effect is opportunistic by design.
 */ function safeMarkNeedsReindex(id, needs) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markMemoryNeedsReindex"])(id, needs);
    } catch  {
    // intentional swallow — DB may be closed (test teardown) or schema not yet ready
    }
}
function scheduleVectorUpsert(id, content) {
    setImmediate(async ()=>{
        try {
            const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemorySettings"])();
            const resolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEmbeddingSource"])(settings);
            if (!resolution.source) return;
            const embeddingResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embed"])(content, settings);
            if (!("vector" in embeddingResult)) {
                log.warn("memory.vec.embed.fail", {
                    id,
                    reason: embeddingResult.reason,
                    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(embeddingResult.message)
                });
                safeMarkNeedsReindex(id, true);
                return;
            }
            const vec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVectorStore"])();
            if (!vec) {
                safeMarkNeedsReindex(id, true);
                return;
            }
            await vec.ensureReady(resolution);
            await vec.upsertVector(id, embeddingResult.vector);
            safeMarkNeedsReindex(id, false);
        } catch (err) {
            log.warn("memory.vec.upsert.fail", {
                id,
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
            });
            safeMarkNeedsReindex(id, true);
        }
    });
}
async function createMemory(memory) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    // Check for existing memory with same apiKeyId + key (UPSERT logic)
    const existing = memory.key ? findExistingMemory(db, memory.apiKeyId, memory.key) : undefined;
    if (existing) {
        // UPDATE existing record
        const updatedMetadata = {
            ...parseJSON(existing.metadata),
            ...memory.metadata
        };
        const stmt = db.prepare("UPDATE memories SET content = ?, metadata = ?, updated_at = ?, session_id = ?, type = ?, expires_at = ? WHERE id = ?");
        stmt.run(memory.content, JSON.stringify(updatedMetadata), now, memory.sessionId, memory.type, memory.expiresAt ?? null, existing.id);
        const updatedMemory = {
            id: String(existing.id),
            apiKeyId: memory.apiKeyId,
            sessionId: memory.sessionId,
            type: memory.type,
            key: memory.key,
            content: memory.content,
            metadata: updatedMetadata,
            createdAt: new Date(String(existing.created_at)),
            updatedAt: new Date(now),
            expiresAt: memory.expiresAt ?? null,
            // Preserve the existing access telemetry on UPSERT (an update is not a fresh access).
            accessCount: typeof existing.access_count === "number" ? existing.access_count : 0,
            lastAccessedAt: existing.last_accessed_at ? new Date(String(existing.last_accessed_at)) : null
        };
        // Invalidate and update cache
        invalidateMemoryCache(existing.id);
        evictIfNeeded(_memoryCache);
        _memoryCache.set(existing.id, {
            value: updatedMemory,
            timestamp: Date.now()
        });
        log.info("memory.updated", {
            apiKeyId: memory.apiKeyId,
            type: memory.type,
            id: existing.id,
            key: memory.key
        });
        // Best-effort vector upsert (fire-and-forget — content changed so regenerate)
        scheduleVectorUpsert(String(existing.id), memory.content);
        // Best-effort re-sync to Qdrant after update
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upsertSemanticMemoryPoint"])({
            id: String(existing.id),
            apiKeyId: memory.apiKeyId || "",
            sessionId: memory.sessionId || "",
            key: memory.key || "",
            content: memory.content,
            metadata: updatedMetadata || {},
            createdAt: String(existing.created_at),
            expiresAt: memory.expiresAt ? memory.expiresAt.toISOString() : null
        }).then((r)=>{
            if (r.ok) log.debug?.("qdrant.upsert.ok", {
                id: existing.id,
                latencyMs: r.latencyMs
            });
            else if (r.error && r.error !== "not_configured") log.warn?.("qdrant.upsert.fail", {
                id: existing.id,
                error: r.error
            });
        }).catch((e)=>log.warn?.("qdrant.upsert.error", {
                id: existing.id,
                error: String(e)
            }));
        return updatedMemory;
    }
    // INSERT new record if not exists
    const id = crypto.randomUUID();
    const stmt = db.prepare("INSERT INTO memories (id, api_key_id, session_id, type, key, content, metadata, created_at, updated_at, expires_at) " + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(id, memory.apiKeyId, memory.sessionId, memory.type, memory.key, memory.content, JSON.stringify(memory.metadata ?? {}), now, now, memory.expiresAt?.toISOString() ?? null);
    const createdMemory = {
        id,
        apiKeyId: memory.apiKeyId,
        sessionId: memory.sessionId,
        type: memory.type,
        key: memory.key,
        content: memory.content,
        metadata: memory.metadata,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        expiresAt: memory.expiresAt ?? null,
        accessCount: 0,
        lastAccessedAt: null
    };
    // Cache the newly created memory
    invalidateMemoryCache(id);
    evictIfNeeded(_memoryCache);
    _memoryCache.set(id, {
        value: createdMemory,
        timestamp: Date.now()
    });
    log.info("memory.stored", {
        apiKeyId: memory.apiKeyId,
        type: memory.type,
        id
    });
    // Best-effort vector upsert (fire-and-forget)
    scheduleVectorUpsert(id, memory.content);
    // Best-effort sync to semantic memory store (Qdrant). Failures do not block the SQLite write.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upsertSemanticMemoryPoint"])({
        id,
        apiKeyId: memory.apiKeyId || "",
        sessionId: memory.sessionId || "",
        key: memory.key || "",
        content: memory.content,
        metadata: memory.metadata || {},
        createdAt: now,
        expiresAt: memory.expiresAt ? memory.expiresAt.toISOString() : null
    }).then((r)=>{
        if (r.ok) log.debug?.("qdrant.upsert.ok", {
            id,
            latencyMs: r.latencyMs
        });
        else if (r.error && r.error !== "not_configured") log.warn?.("qdrant.upsert.fail", {
            id,
            error: r.error
        });
    }).catch((e)=>log.warn?.("qdrant.upsert.error", {
            id,
            error: String(e)
        }));
    return createdMemory;
}
async function getMemory(id) {
    if (!id || typeof id !== "string") return null;
    // Check cache first
    const cached = _memoryCache.get(id);
    if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
        return cached.value;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = db.prepare("SELECT * FROM memories WHERE id = ?");
    const row = stmt.get(id);
    if (!row) {
        // Cache negative result briefly to prevent repeated DB hits
        evictIfNeeded(_memoryCache);
        _memoryCache.set(id, {
            value: null,
            timestamp: Date.now()
        });
        return null;
    }
    const memory = rowToMemory(row);
    // Cache the result
    evictIfNeeded(_memoryCache);
    _memoryCache.set(id, {
        value: memory,
        timestamp: Date.now()
    });
    return memory;
}
async function updateMemory(id, updates) {
    if (!id || typeof id !== "string") return false;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    // Fetch current state to detect content/key change (needed for vector re-gen)
    const currentRow = db.prepare("SELECT content, key FROM memories WHERE id = ?").get(id);
    // Build dynamic update query
    const fields = [];
    const values = [];
    if (updates.type !== undefined) {
        fields.push("type = ?");
        values.push(updates.type);
    }
    if (updates.key !== undefined) {
        fields.push("key = ?");
        values.push(updates.key);
    }
    if (updates.content !== undefined) {
        fields.push("content = ?");
        values.push(updates.content);
    }
    if (updates.metadata !== undefined) {
        fields.push("metadata = ?");
        values.push(JSON.stringify(updates.metadata));
    }
    if (updates.expiresAt !== undefined) {
        fields.push("expires_at = ?");
        values.push(updates.expiresAt?.toISOString() ?? null);
    }
    // Always update the updatedAt timestamp
    fields.push("updated_at = ?");
    values.push(now);
    values.push(id); // For WHERE clause
    const stmt = db.prepare(`UPDATE memories SET ${fields.join(", ")} WHERE id = ?`);
    const result = stmt.run(...values);
    if (result.changes === 0) {
        return false;
    }
    // Invalidate cache for this memory
    invalidateMemoryCache(id);
    // Regenerate vector if content or key changed (fire-and-forget)
    const contentChanged = updates.content !== undefined && updates.content !== currentRow?.content;
    const keyChanged = updates.key !== undefined && updates.key !== currentRow?.key;
    if (contentChanged || keyChanged) {
        const newContent = updates.content ?? currentRow?.content ?? "";
        scheduleVectorUpsert(id, newContent);
    }
    return true;
}
async function deleteMemory(id) {
    if (!id || typeof id !== "string") return false;
    // 1. Delete from sqlite-vec (best-effort — does not fail if vec not loaded)
    const vec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVectorStore"])();
    if (vec) {
        await vec.deleteVector(id).catch((e)=>log.warn("memory.vec.delete.fail", {
                id,
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(e instanceof Error ? e.message : String(e))
            }));
    }
    // 2. Delete from Qdrant (best-effort — already existed before plan 21)
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteSemanticMemoryPoint"])(id).catch((e)=>log.warn("memory.qdrant.delete.fail", {
            id,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(e instanceof Error ? e.message : String(e))
        }));
    // 3. Delete from SQLite
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = db.prepare("DELETE FROM memories WHERE id = ?");
    const result = stmt.run(id);
    if (result.changes === 0) {
        return false;
    }
    // Invalidate cache for this memory
    invalidateMemoryCache(id);
    log.info("memory.deleted", {
        id
    });
    return true;
}
async function listMemories(filters) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Build dynamic query conditions
    const whereClauses = [];
    const whereParams = [];
    if (filters.apiKeyId) {
        whereClauses.push("api_key_id = ?");
        whereParams.push(filters.apiKeyId);
    }
    if (filters.type) {
        whereClauses.push("type = ?");
        whereParams.push(filters.type);
    }
    if (filters.sessionId) {
        whereClauses.push("session_id = ?");
        whereParams.push(filters.sessionId);
    }
    if (typeof filters.query === "string" && filters.query.trim().length > 0) {
        const likeQuery = `%${filters.query.trim().toLowerCase()}%`;
        whereClauses.push("(LOWER(content) LIKE ? OR LOWER(key) LIKE ?)");
        whereParams.push(likeQuery, likeQuery);
    }
    // Run COUNT query + byType aggregation in a single query
    let countQuery = "SELECT COUNT(*) as total FROM memories";
    if (whereClauses.length > 0) {
        countQuery += " WHERE " + whereClauses.join(" AND ");
    }
    const countStmt = db.prepare(countQuery);
    const countRow = countStmt.get(...whereParams);
    const total = countRow.total;
    // Build byType aggregation (counts ALL matching rows, not just the page)
    let byTypeQuery = "SELECT type, COUNT(*) as count FROM memories";
    const byTypeParams = [
        ...whereParams
    ];
    if (whereClauses.length > 0) {
        byTypeQuery += " WHERE " + whereClauses.join(" AND ");
    }
    byTypeQuery += " GROUP BY type";
    const byTypeStmt = db.prepare(byTypeQuery);
    const byTypeRows = byTypeStmt.all(...byTypeParams);
    const byType = Object.fromEntries(byTypeRows.map((r)=>[
            r.type,
            r.count
        ]));
    // Calculate effective limit and offset
    const effectiveLimit = filters.limit ?? 50;
    const effectivePage = filters.page ?? 1;
    const effectiveOffset = filters.offset ?? (effectivePage - 1) * effectiveLimit;
    // Build SELECT query with pagination
    let query = "SELECT * FROM memories";
    if (whereClauses.length > 0) {
        query += " WHERE " + whereClauses.join(" AND ");
    }
    // Add ordering and pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    // Build params for SELECT query (WHERE params + pagination params)
    const params = [
        ...whereParams,
        effectiveLimit,
        effectiveOffset
    ];
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    return {
        data: rows.map(rowToMemory),
        total,
        byType
    };
}
function getMemoryTokensUsed(apiKeyId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const stmt = db.prepare("SELECT COALESCE(SUM((LENGTH(content) + 3) / 4), 0) as tokensUsed FROM memories" + (apiKeyId ? " WHERE api_key_id = ?" : ""));
    const row = stmt.get(...apiKeyId ? [
        apiKeyId
    ] : []);
    return row?.tokensUsed ?? 0;
}
function recordMemoryAccess(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    const unique = Array.from(new Set(ids.filter((id)=>typeof id === "string" && id)));
    if (unique.length === 0) return;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const placeholders = unique.map(()=>"?").join(", ");
        const stmt = db.prepare(`UPDATE memories SET access_count = access_count + 1, last_accessed_at = ? ` + `WHERE id IN (${placeholders})`);
        stmt.run(new Date().toISOString(), ...unique);
        for (const id of unique)invalidateMemoryCache(id);
    } catch  {
    // intentional swallow — access tracking is opportunistic telemetry, never load-bearing
    }
}
function listMemoriesForDecay(filters) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const where = filters.apiKeyId ? " WHERE api_key_id = ?" : "";
    const params = filters.apiKeyId ? [
        filters.apiKeyId
    ] : [];
    params.push(Math.max(1, Math.floor(filters.limit)));
    const stmt = db.prepare(`SELECT id, type, access_count, created_at, last_accessed_at FROM memories${where} ` + `ORDER BY created_at ASC LIMIT ?`);
    const rows = stmt.all(...params);
    return rows.map((r)=>({
            id: String(r.id),
            type: r.type,
            accessCount: typeof r.access_count === "number" ? r.access_count : 0,
            createdAt: new Date(String(r.created_at)),
            lastAccessedAt: r.last_accessed_at ? new Date(String(r.last_accessed_at)) : null
        }));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/retrieval/scoring.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateTokens",
    ()=>estimateTokens,
    "getRelevanceScore",
    ()=>getRelevanceScore,
    "parseMetadata",
    ()=>parseMetadata,
    "rowToMemory",
    ()=>rowToMemory
]);
function estimateTokens(text) {
    if (!text || typeof text !== "string") return 0;
    return Math.ceil(text.length / 4);
}
function parseMetadata(raw) {
    if (!raw || typeof raw !== "string") return {};
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch  {
        return {};
    }
}
function rowToMemory(row) {
    const createdAt = row.created_at || row.createdAt || new Date().toISOString();
    const updatedAt = row.updated_at || row.updatedAt || createdAt;
    const expiresAt = row.expires_at ?? row.expiresAt ?? null;
    return {
        id: String(row.id),
        apiKeyId: String(row.api_key_id || row.apiKeyId || ""),
        sessionId: String(row.session_id ?? row.sessionId ?? ""),
        type: row.type,
        key: String(row.key || ""),
        content: String(row.content || ""),
        metadata: parseMetadata(row.metadata),
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        expiresAt: expiresAt ? new Date(String(expiresAt)) : null,
        accessCount: typeof row.access_count === "number" ? row.access_count : 0,
        lastAccessedAt: row.last_accessed_at ? new Date(String(row.last_accessed_at)) : null
    };
}
function getRelevanceScore(memory, query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return 0;
    const haystacks = [
        memory.content.toLowerCase(),
        memory.key.toLowerCase(),
        JSON.stringify(memory.metadata).toLowerCase()
    ];
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    let score = 0;
    for (const haystack of haystacks){
        // Full phrase match (safe: literal string, not regex)
        if (haystack.includes(normalizedQuery)) {
            score += 20;
        }
        for (const token of tokens){
            if (!token) continue;
            // Token-level substring count using indexOf loop (no RegExp on user input)
            if (haystack === memory.key.toLowerCase() && haystack.includes(token)) {
                score += 6;
                continue;
            }
            // Count occurrences via indexOf loop — avoids new RegExp(token)
            let pos = 0;
            let matchCount = 0;
            while((pos = haystack.indexOf(token, pos)) !== -1){
                matchCount++;
                pos += token.length;
            }
            score += matchCount * 3;
        }
    }
    return score;
}
}),
"[project]/src/lib/memory/retrieval.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "engineStatus",
    ()=>engineStatus,
    "retrieveMemories",
    ()=>retrieveMemories,
    "retrievePreview",
    ()=>retrievePreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/schemas.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/vectorStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/embedding/cache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/qdrant.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/retrieval/scoring.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("MEMORY_RETRIEVAL");
;
// ──────────────── Helpers ────────────────
function hasTable(tableName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName);
    return row?.name === tableName;
}
/**
 * Fetch memories from SQLite by an array of IDs, preserving order.
 */ function fetchMemoriesByIds(ids) {
    if (ids.length === 0) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const placeholders = ids.map(()=>"?").join(", ");
    const rows = db.prepare(`SELECT * FROM memories WHERE id IN (${placeholders})`).all(...ids);
    const byId = new Map();
    for (const row of rows){
        byId.set(String(row.id), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToMemory"])(row));
    }
    return ids.map((id)=>byId.get(id)).filter((m)=>m !== undefined);
}
/**
 * Build the FTS5 rows for a given apiKeyId + config + query.
 * Returns MemoryRow array (or falls back to empty on error).
 */ function buildFtsRows(apiKeyId, config) {
    if (!config.query) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const { apiKeyCol, expiresCol, createdCol, sessionCol, tableName, query: q, scope, sessionId, retentionDays } = config;
    let ftsQueryStr = `SELECT m.* FROM ${tableName} m ` + `JOIN memory_fts f ON m.memory_id = f.rowid ` + `WHERE f.memory_fts MATCH ? AND m.${apiKeyCol} = ? ` + `AND (m.${expiresCol} IS NULL OR datetime(m.${expiresCol}) > datetime('now'))`;
    if (scope === "session" && sessionId) {
        ftsQueryStr += ` AND m.${sessionCol} = ?`;
    }
    if (retentionDays && retentionDays > 0) {
        ftsQueryStr += ` AND datetime(m.${createdCol}) >= datetime(?)`;
    }
    ftsQueryStr += ` ORDER BY f.rank LIMIT 100`;
    const ftsParams = [
        q,
        apiKeyId
    ];
    if (scope === "session" && sessionId) ftsParams.push(sessionId);
    if (retentionDays && retentionDays > 0) {
        const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
        ftsParams.push(cutoff);
    }
    try {
        return db.prepare(ftsQueryStr).all(...ftsParams);
    } catch  {
        return [];
    }
}
// Loopback rerank URL — localhost only, never routed over the network.
// nosemgrep: javascript.lang.security.audit.non-literal-regexp.non-literal-regexp
const RERANK_LOOPBACK_URL = "http://127.0.0.1:20128/v1/rerank";
/**
 * Apply reranking via /v1/rerank (loopback-only) if rerankEnabled + rerankProviderModel is set.
 * Returns reordered array (or original order on any error — rerank failure never fails retrieval).
 *
 * Security note: the URL is a hardcoded loopback address (127.0.0.1:20128) — it never
 * carries sensitive data over a network link. HTTP is safe for loopback-only IPC.
 * nosemgrep: javascript.lang.security.detect-non-literal-url
 */ async function applyRerank(items, query, rerankProviderModel) {
    if (items.length === 0) return items;
    try {
        const documents = items.map((item)=>item.memory.content);
        const body = {
            model: rerankProviderModel,
            query,
            documents,
            top_n: items.length
        };
        const res = await fetch(RERANK_LOOPBACK_URL, {
            // nosemgrep: typescript.react.security.react-insecure-request.react-insecure-request
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) {
            log.warn("memory.rerank.http_fail", {
                status: res.status,
                model: rerankProviderModel
            });
            return items;
        }
        const data = await res.json();
        if (!Array.isArray(data.results) || data.results.length === 0) {
            return items;
        }
        // Build reordered list using the index references from the rerank response
        const reordered = [];
        for (const r of data.results){
            const idx = r.index;
            if (typeof idx === "number" && idx >= 0 && idx < items.length) {
                const item = items[idx];
                if (item) reordered.push({
                    ...item,
                    score: r.relevance_score
                });
            }
        }
        // Append any items not mentioned in results (safety net)
        const mentionedIndices = new Set(data.results.map((r)=>r.index));
        for(let i = 0; i < items.length; i++){
            if (!mentionedIndices.has(i)) {
                const item = items[i];
                if (item) reordered.push(item);
            }
        }
        return reordered;
    } catch (err) {
        log.warn("memory.rerank.error", {
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err)),
            model: rerankProviderModel
        });
        return items;
    }
}
async function retrieveMemories(apiKeyId, config = {}) {
    const result = await retrieveMemoriesInternal(apiKeyId, config);
    if (result.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordMemoryAccess"])(result.map((m)=>m.id));
    }
    return result;
}
async function retrieveMemoriesInternal(apiKeyId, config = {}) {
    log.info("memory.retrieval.start", {
        apiKeyId,
        strategy: config.retrievalStrategy
    });
    // Validate and normalize config
    const normalizedConfig = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MemoryConfigSchema"].parse({
        enabled: true,
        maxTokens: 2000,
        retrievalStrategy: "exact",
        autoSummarize: false,
        persistAcrossModels: false,
        retentionDays: 30,
        scope: "apiKey",
        ...config
    });
    if (!normalizedConfig.enabled || normalizedConfig.maxTokens <= 0) {
        return [];
    }
    const maxTokens = Math.min(Math.max(normalizedConfig.maxTokens, 1), 8000);
    const strategy = normalizedConfig.retrievalStrategy;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Plan 21 FAIL #2 fix: include "qdrant" in the tier union so that the
    // Qdrant tier-2 branch in semantic/hybrid below can push hits with that tier.
    const memories = [];
    let totalTokens = 0;
    const useModernTable = hasTable("memories");
    const tableName = useModernTable ? "memories" : "memory";
    const columns = useModernTable ? {
        apiKeyId: "api_key_id",
        sessionId: "session_id",
        createdAt: "created_at",
        expiresAt: "expires_at"
    } : {
        apiKeyId: "apiKeyId",
        sessionId: "sessionId",
        createdAt: "createdAt",
        expiresAt: "expiresAt"
    };
    // Build base query
    let query = `SELECT * FROM ${tableName} WHERE ${columns.apiKeyId} = ? ` + `AND (${columns.expiresAt} IS NULL OR datetime(${columns.expiresAt}) > datetime('now'))`;
    const params = [
        apiKeyId
    ];
    if (normalizedConfig.scope === "session" && config.sessionId) {
        query += ` AND ${columns.sessionId} = ?`;
        params.push(config.sessionId);
    }
    if (normalizedConfig.retentionDays > 0) {
        const cutoff = new Date(Date.now() - normalizedConfig.retentionDays * 24 * 60 * 60 * 1000).toISOString();
        query += ` AND datetime(${columns.createdAt}) >= datetime(?)`;
        params.push(cutoff);
    }
    // Load extended settings for embedding/vector-store resolution
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemorySettings"])();
    // Execute query based on strategy
    let rows;
    const ftsAvailable = useModernTable && hasTable("memory_fts");
    const ftsColConfig = {
        apiKeyCol: columns.apiKeyId,
        expiresCol: columns.expiresAt,
        createdCol: columns.createdAt,
        sessionCol: columns.sessionId,
        tableName,
        query: config.query,
        scope: normalizedConfig.scope,
        sessionId: config.sessionId,
        retentionDays: normalizedConfig.retentionDays
    };
    switch(strategy){
        case "semantic":
            {
                // Attempt vector search if embedding + vector store are available
                if (config.query && useModernTable) {
                    const resolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEmbeddingSource"])(settings);
                    if (resolution.source !== null) {
                        // Plan 21 FAIL #2 fix (Bug #1): when the user opted into Qdrant
                        // (settings.vectorStore === "qdrant"), route the semantic search to
                        // Qdrant first. If Qdrant is unreachable or returns nothing, fall
                        // through to sqlite-vec — preserving the "degrades to sqlite-vec /
                        // FTS5" contract of §7.
                        if (settings.vectorStore === "qdrant") {
                            try {
                                const qres = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["searchSemanticMemory"])(config.query, 100, {
                                    apiKeyId
                                });
                                if (qres.ok && qres.results && qres.results.length > 0) {
                                    const hitIds = qres.results.map((r)=>r.id);
                                    const hitMemories = fetchMemoriesByIds(hitIds);
                                    const scoreMap = new Map(qres.results.map((r)=>[
                                            r.id,
                                            r.score
                                        ]));
                                    let qdrantItems = hitMemories.map((m)=>({
                                            memory: m,
                                            score: scoreMap.get(m.id) ?? 0,
                                            tier: "qdrant"
                                        }));
                                    if (settings.rerankEnabled && settings.rerankProviderModel && config.query) {
                                        qdrantItems = await applyRerank(qdrantItems, config.query, settings.rerankProviderModel);
                                    }
                                    for (const entry of qdrantItems){
                                        const memoryTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(entry.memory.content);
                                        if (totalTokens + memoryTokens > maxTokens) {
                                            if (memories.length === 0) {
                                                memories.push(entry);
                                                totalTokens += memoryTokens;
                                            }
                                            break;
                                        }
                                        memories.push(entry);
                                        totalTokens += memoryTokens;
                                    }
                                    log.info("memory.retrieval.complete", {
                                        apiKeyId,
                                        count: memories.length,
                                        tier: "qdrant"
                                    });
                                    return memories.map((e)=>e.memory);
                                }
                            } catch (err) {
                                log.warn("memory.retrieval.qdrant.fail", {
                                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
                                });
                            // fall through to sqlite-vec degradation
                            }
                        }
                        const embeddingResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embed"])(config.query, settings);
                        if ("vector" in embeddingResult) {
                            const vec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVectorStore"])();
                            if (vec) {
                                try {
                                    await vec.ensureReady(resolution);
                                    const hits = await vec.searchVector(embeddingResult.vector, 100, apiKeyId);
                                    const hitIds = hits.map((h)=>h.memoryId);
                                    const hitMemories = fetchMemoriesByIds(hitIds);
                                    const scoreMap = new Map(hits.map((h)=>[
                                            h.memoryId,
                                            h.score
                                        ]));
                                    let rankedItems = hitMemories.map((m)=>({
                                            memory: m,
                                            score: scoreMap.get(m.id) ?? 0,
                                            tier: "vector"
                                        }));
                                    // Apply rerank if enabled
                                    if (settings.rerankEnabled && settings.rerankProviderModel && config.query) {
                                        rankedItems = await applyRerank(rankedItems, config.query, settings.rerankProviderModel);
                                    }
                                    // Token budget enforcement
                                    for (const entry of rankedItems){
                                        const memoryTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(entry.memory.content);
                                        if (totalTokens + memoryTokens > maxTokens) {
                                            if (memories.length === 0) {
                                                memories.push(entry);
                                                totalTokens += memoryTokens;
                                            }
                                            break;
                                        }
                                        memories.push(entry);
                                        totalTokens += memoryTokens;
                                    }
                                    log.info("memory.retrieval.complete", {
                                        apiKeyId,
                                        count: memories.length,
                                        tier: "vector"
                                    });
                                    return memories.map((e)=>e.memory);
                                } catch (err) {
                                    log.warn("memory.retrieval.vector.fail", {
                                        error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
                                    });
                                // Fall through to FTS5 degradation
                                }
                            }
                        }
                    }
                }
                // Degraded path: FTS5 keyword
                if (config.query && ftsAvailable) {
                    rows = buildFtsRows(apiKeyId, ftsColConfig);
                    if (rows.length === 0) {
                        query += ` ORDER BY ${columns.createdAt} DESC LIMIT 100`;
                        rows = db.prepare(query).all(...params);
                    }
                } else {
                    query += ` ORDER BY ${columns.createdAt} DESC LIMIT 100`;
                    rows = db.prepare(query).all(...params);
                }
                break;
            }
        case "hybrid":
            {
                // Attempt hybrid vector+FTS5 search if embedding + vector store are available
                if (config.query && useModernTable) {
                    const resolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEmbeddingSource"])(settings);
                    if (resolution.source !== null) {
                        // Plan 21 FAIL #2 fix: tier-2 Qdrant route also covers hybrid strategy.
                        // Qdrant is vector-only (no FTS5 fusion), so this acts as the vector
                        // half of the hybrid contract. If Qdrant is down or empty, fall through
                        // to sqlite-vec's hybrid RRF (FTS5 + vector).
                        if (settings.vectorStore === "qdrant") {
                            try {
                                const qres = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["searchSemanticMemory"])(config.query, 100, {
                                    apiKeyId
                                });
                                if (qres.ok && qres.results && qres.results.length > 0) {
                                    const hitIds = qres.results.map((r)=>r.id);
                                    const hitMemories = fetchMemoriesByIds(hitIds);
                                    const scoreMap = new Map(qres.results.map((r)=>[
                                            r.id,
                                            r.score
                                        ]));
                                    let qdrantItems = hitMemories.map((m)=>({
                                            memory: m,
                                            score: scoreMap.get(m.id) ?? 0,
                                            tier: "qdrant"
                                        }));
                                    if (settings.rerankEnabled && settings.rerankProviderModel && config.query) {
                                        qdrantItems = await applyRerank(qdrantItems, config.query, settings.rerankProviderModel);
                                    }
                                    for (const entry of qdrantItems){
                                        const memoryTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(entry.memory.content);
                                        if (totalTokens + memoryTokens > maxTokens) {
                                            if (memories.length === 0) {
                                                memories.push(entry);
                                                totalTokens += memoryTokens;
                                            }
                                            break;
                                        }
                                        memories.push(entry);
                                        totalTokens += memoryTokens;
                                    }
                                    log.info("memory.retrieval.complete", {
                                        apiKeyId,
                                        count: memories.length,
                                        tier: "qdrant"
                                    });
                                    return memories.map((e)=>e.memory);
                                }
                            } catch (err) {
                                log.warn("memory.retrieval.qdrant.fail", {
                                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
                                });
                            // fall through to sqlite-vec hybrid RRF
                            }
                        }
                        const embeddingResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embed"])(config.query, settings);
                        if ("vector" in embeddingResult) {
                            const vec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVectorStore"])();
                            if (vec) {
                                try {
                                    await vec.ensureReady(resolution);
                                    const hybridHits = await vec.searchHybrid(embeddingResult.vector, config.query, 100, apiKeyId);
                                    const hitIds = hybridHits.map((h)=>h.memoryId);
                                    const hitMemories = fetchMemoriesByIds(hitIds);
                                    const scoreMap = new Map(hybridHits.map((h)=>[
                                            h.memoryId,
                                            {
                                                rrfScore: h.rrfScore,
                                                vecDistance: h.vecDistance,
                                                ftsScore: h.ftsScore
                                            }
                                        ]));
                                    let rankedHybridItems = hitMemories.map((m)=>{
                                        const sc = scoreMap.get(m.id);
                                        return {
                                            memory: m,
                                            score: sc?.rrfScore ?? 0,
                                            tier: "hybrid-rrf"
                                        };
                                    });
                                    // Apply rerank if enabled
                                    if (settings.rerankEnabled && settings.rerankProviderModel && config.query) {
                                        rankedHybridItems = await applyRerank(rankedHybridItems, config.query, settings.rerankProviderModel);
                                    }
                                    // Token budget enforcement
                                    for (const entry of rankedHybridItems){
                                        const memoryTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(entry.memory.content);
                                        if (totalTokens + memoryTokens > maxTokens) {
                                            if (memories.length === 0) {
                                                memories.push(entry);
                                                totalTokens += memoryTokens;
                                            }
                                            break;
                                        }
                                        memories.push(entry);
                                        totalTokens += memoryTokens;
                                    }
                                    log.info("memory.retrieval.complete", {
                                        apiKeyId,
                                        count: memories.length,
                                        tier: "hybrid-rrf"
                                    });
                                    return memories.map((e)=>e.memory);
                                } catch (err) {
                                    log.warn("memory.retrieval.hybrid.fail", {
                                        error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err))
                                    });
                                // Fall through to FTS5 degradation
                                }
                            }
                        }
                    }
                }
                // Degraded path: FTS5 + keyword union
                let ftsRows = [];
                if (config.query && ftsAvailable) {
                    ftsRows = buildFtsRows(apiKeyId, ftsColConfig);
                }
                // Get chronological results for keyword scoring
                query += ` ORDER BY ${columns.createdAt} DESC LIMIT 100`;
                const keywordRows = db.prepare(query).all(...params);
                // Union: FTS5 results first (higher relevance), then keyword results, dedup by id
                const seen = new Set();
                rows = [];
                for (const row of [
                    ...ftsRows,
                    ...keywordRows
                ]){
                    const rowId = String(row.id);
                    if (!seen.has(rowId)) {
                        seen.add(rowId);
                        rows.push(row);
                    }
                }
                break;
            }
        case "exact":
        default:
            {
                query += ` ORDER BY ${columns.createdAt} DESC LIMIT 100`;
                rows = db.prepare(query).all(...params);
            }
    }
    const rankedRows = rows.map((row)=>{
        const memory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToMemory"])(row);
        const score = config.query ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRelevanceScore"])(memory, config.query) : 0;
        return {
            memory,
            score,
            tier: "fts5"
        };
    }).filter((entry)=>!config.query || entry.score > 0).sort((a, b)=>{
        if (b.score !== a.score) return b.score - a.score;
        return b.memory.createdAt.getTime() - a.memory.createdAt.getTime();
    });
    // Process memories until budget exceeded
    for (const entry of rankedRows){
        const memory = entry.memory;
        const memoryTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(memory.content);
        if (totalTokens + memoryTokens > maxTokens) {
            if (memories.length === 0) {
                memories.push(entry);
                totalTokens += memoryTokens;
            }
            break;
        }
        memories.push(entry);
        totalTokens += memoryTokens;
    }
    const result = memories.map((entry)=>entry.memory);
    log.info("memory.retrieval.complete", {
        apiKeyId,
        count: result.length
    });
    log.debug("memory.retrieval.selected", {
        ids: result.map((m)=>m.id)
    });
    return result;
}
async function retrievePreview(apiKeyId, query, options) {
    const { strategy, maxTokens, limit } = options;
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemorySettings"])();
    const resolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEmbeddingSource"])(settings);
    let fallbackReason = null;
    let rerankApplied = false;
    const result = [];
    let totalTokens = 0;
    const useModernTable = hasTable("memories");
    const ftsAvailable = useModernTable && hasTable("memory_fts");
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const tableName = useModernTable ? "memories" : "memory";
    const apiKeyCol = useModernTable ? "api_key_id" : "apiKeyId";
    const expiresCol = useModernTable ? "expires_at" : "expiresAt";
    const createdCol = useModernTable ? "created_at" : "createdAt";
    // Determine vector store backend
    let vectorStoreBackend = "none";
    const vec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVectorStore"])();
    if (vec) vectorStoreBackend = "sqlite-vec";
    if (strategy === "semantic" || strategy === "hybrid") {
        if (resolution.source !== null && query) {
            // Plan 21 FAIL #2 fix: when settings.vectorStore === "qdrant",
            // the Playground must show what production retrieval would actually
            // see — Qdrant tier-2. Falls through to sqlite-vec on failure.
            if (settings.vectorStore === "qdrant") {
                try {
                    const qres = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["searchSemanticMemory"])(query, limit, apiKeyId ? {
                        apiKeyId
                    } : undefined);
                    if (qres.ok && qres.results && qres.results.length > 0) {
                        const hitIds = qres.results.map((r)=>r.id);
                        const hitMemories = fetchMemoriesByIds(hitIds).slice(0, limit);
                        const scoreMap = new Map(qres.results.map((r)=>[
                                r.id,
                                r.score
                            ]));
                        let items = hitMemories.map((m)=>({
                                memory: m,
                                score: scoreMap.get(m.id) ?? 0,
                                tier: "qdrant",
                                vecScore: scoreMap.get(m.id) ?? null,
                                ftsScore: null
                            }));
                        if (settings.rerankEnabled && settings.rerankProviderModel) {
                            items = await applyRerank(items, query, settings.rerankProviderModel);
                            rerankApplied = true;
                        }
                        for (const item of items){
                            if (result.length >= limit) break;
                            const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(item.memory.content);
                            if (totalTokens + tokens > maxTokens && result.length > 0) break;
                            result.push({
                                ...item,
                                tokens
                            });
                            totalTokens += tokens;
                        }
                        return {
                            items: result,
                            resolution: {
                                embeddingSource: resolution.source,
                                embeddingModel: resolution.model,
                                vectorStore: "qdrant",
                                strategyUsed: strategy,
                                rerankApplied,
                                fallbackReason: null
                            },
                            totalTokens,
                            budgetMaxTokens: maxTokens
                        };
                    }
                    // Qdrant returned nothing — fall through to sqlite-vec for parity
                    // with production (so the Playground reflects the same fallback).
                    fallbackReason = "Qdrant returned 0 results — falling back to sqlite-vec";
                } catch (err) {
                    fallbackReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
                    log.warn("memory.preview.qdrant.fail", {
                        error: fallbackReason
                    });
                }
            }
            const embeddingResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["embed"])(query, settings);
            if ("vector" in embeddingResult) {
                if (vec) {
                    try {
                        await vec.ensureReady(resolution);
                        if (strategy === "semantic") {
                            const hits = await vec.searchVector(embeddingResult.vector, limit, apiKeyId ?? undefined);
                            const hitIds = hits.map((h)=>h.memoryId);
                            const hitMemories = fetchMemoriesByIds(hitIds).slice(0, limit);
                            const scoreMap = new Map(hits.map((h)=>[
                                    h.memoryId,
                                    h.score
                                ]));
                            let items = hitMemories.map((m)=>({
                                    memory: m,
                                    score: scoreMap.get(m.id) ?? 0,
                                    tier: "vector",
                                    vecScore: scoreMap.get(m.id) ?? null,
                                    ftsScore: null
                                }));
                            if (settings.rerankEnabled && settings.rerankProviderModel) {
                                items = await applyRerank(items, query, settings.rerankProviderModel);
                                rerankApplied = true;
                            }
                            for (const item of items){
                                if (result.length >= limit) break;
                                const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(item.memory.content);
                                if (totalTokens + tokens > maxTokens && result.length > 0) break;
                                result.push({
                                    ...item,
                                    tokens
                                });
                                totalTokens += tokens;
                            }
                        } else {
                            // hybrid
                            const hybridHits = await vec.searchHybrid(embeddingResult.vector, query, limit, apiKeyId ?? undefined);
                            const hitIds = hybridHits.map((h)=>h.memoryId);
                            const hitMemories = fetchMemoriesByIds(hitIds);
                            const scoreMap = new Map(hybridHits.map((h)=>[
                                    h.memoryId,
                                    {
                                        rrfScore: h.rrfScore,
                                        vecDistance: h.vecDistance,
                                        ftsScore: h.ftsScore
                                    }
                                ]));
                            let items = hitMemories.slice(0, limit).map((m)=>{
                                const sc = scoreMap.get(m.id);
                                return {
                                    memory: m,
                                    score: sc?.rrfScore ?? 0,
                                    tier: "hybrid-rrf",
                                    vecScore: sc?.vecDistance != null ? 1 / (1 + sc.vecDistance) : null,
                                    ftsScore: sc?.ftsScore ?? null
                                };
                            });
                            if (settings.rerankEnabled && settings.rerankProviderModel) {
                                items = await applyRerank(items, query, settings.rerankProviderModel);
                                rerankApplied = true;
                            }
                            for (const item of items){
                                if (result.length >= limit) break;
                                const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(item.memory.content);
                                if (totalTokens + tokens > maxTokens && result.length > 0) break;
                                result.push({
                                    ...item,
                                    tokens
                                });
                                totalTokens += tokens;
                            }
                        }
                        return {
                            items: result,
                            resolution: {
                                embeddingSource: resolution.source,
                                embeddingModel: resolution.model,
                                vectorStore: vectorStoreBackend,
                                strategyUsed: strategy,
                                rerankApplied,
                                fallbackReason: null
                            },
                            totalTokens,
                            budgetMaxTokens: maxTokens
                        };
                    } catch (err) {
                        fallbackReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
                        log.warn("memory.preview.vector.fail", {
                            error: fallbackReason
                        });
                    }
                } else {
                    fallbackReason = "sqlite-vec not available (degraded to FTS5)";
                }
            } else {
                // EmbeddingError
                fallbackReason = "message" in embeddingResult ? embeddingResult.message : "embedding falhou";
            }
        } else if (!query) {
            fallbackReason = "query vazia — usando FTS5";
        } else {
            fallbackReason = resolution.reason;
        }
    }
    // FTS5 fallback path (or strategy=exact)
    let baseQuery = `SELECT * FROM ${tableName}`;
    const baseParams = [];
    if (apiKeyId) {
        baseQuery += ` WHERE ${apiKeyCol} = ?`;
        baseParams.push(apiKeyId);
        baseQuery += ` AND (${expiresCol} IS NULL OR datetime(${expiresCol}) > datetime('now'))`;
    } else {
        baseQuery += ` WHERE (${expiresCol} IS NULL OR datetime(${expiresCol}) > datetime('now'))`;
    }
    if (strategy === "exact") {
        baseQuery += ` ORDER BY ${createdCol} DESC LIMIT ?`;
        baseParams.push(limit);
        const rows = db.prepare(baseQuery).all(...baseParams);
        for (const row of rows){
            if (result.length >= limit) break;
            const memory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToMemory"])(row);
            const score = query ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRelevanceScore"])(memory, query) : 0;
            const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(memory.content);
            if (totalTokens + tokens > maxTokens && result.length > 0) break;
            result.push({
                memory,
                score,
                tokens,
                tier: "fts5",
                vecScore: null,
                ftsScore: null
            });
            totalTokens += tokens;
        }
    } else {
        // Semantic/hybrid degraded to FTS5
        let ftsRows = [];
        if (query && ftsAvailable) {
            const ftsQueryStr = apiKeyId ? `SELECT m.* FROM ${tableName} m JOIN memory_fts f ON m.memory_id = f.rowid WHERE f.memory_fts MATCH ? AND m.${apiKeyCol} = ? ORDER BY f.rank LIMIT ?` : `SELECT m.* FROM ${tableName} m JOIN memory_fts f ON m.memory_id = f.rowid WHERE f.memory_fts MATCH ? ORDER BY f.rank LIMIT ?`;
            const ftsP = apiKeyId ? [
                query,
                apiKeyId,
                limit
            ] : [
                query,
                limit
            ];
            try {
                ftsRows = db.prepare(ftsQueryStr).all(...ftsP);
            } catch  {
                ftsRows = [];
            }
        }
        if (ftsRows.length === 0) {
            baseQuery += ` ORDER BY ${createdCol} DESC LIMIT ?`;
            baseParams.push(limit);
            ftsRows = db.prepare(baseQuery).all(...baseParams);
        }
        for (const row of ftsRows){
            if (result.length >= limit) break;
            const memory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rowToMemory"])(row);
            const score = query ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRelevanceScore"])(memory, query) : 0;
            const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(memory.content);
            if (totalTokens + tokens > maxTokens && result.length > 0) break;
            result.push({
                memory,
                score,
                tokens,
                tier: "fts5",
                vecScore: null,
                ftsScore: null
            });
            totalTokens += tokens;
        }
    }
    return {
        items: result,
        resolution: {
            embeddingSource: resolution.source,
            embeddingModel: resolution.model,
            vectorStore: vectorStoreBackend,
            strategyUsed: strategy,
            rerankApplied,
            fallbackReason
        },
        totalTokens,
        budgetMaxTokens: maxTokens
    };
}
async function engineStatus() {
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemorySettings"])();
    const resolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEmbeddingSource"])(settings);
    const cacheStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$embedding$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stats"])();
    // Vector store
    const vec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$vectorStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVectorStore"])();
    let vecBackend = "none";
    let vecAvailable = false;
    let vecRowCount = 0;
    let vecNeedsReindex = 0;
    let vecReason = "sqlite-vec not available";
    if (vec) {
        vecBackend = "sqlite-vec";
        vecAvailable = true;
        try {
            const s = await vec.stats();
            vecRowCount = s.rowCount;
            vecNeedsReindex = s.needsReindex;
            vecReason = `sqlite-vec active, dim=${s.activeDim ?? "null"}`;
        } catch  {
            vecReason = "sqlite-vec active but stats failed";
        }
    } else {
        vecReason = "sqlite-vec not available — using FTS5 only";
    }
    // Qdrant
    let qdrantEnabled = false;
    let qdrantHealthy = null;
    let qdrantLatencyMs = null;
    let qdrantError = null;
    try {
        const qdrantCfg = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQdrantConfig"])();
        qdrantEnabled = qdrantCfg.enabled;
        if (qdrantEnabled) {
            const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$qdrant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkQdrantHealth"])();
            qdrantHealthy = health.ok;
            qdrantLatencyMs = health.latencyMs;
            qdrantError = health.error ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(health.error) : null;
            // Plan 21 FAIL #2 fix: only claim vectorStore=qdrant when the user
            // explicitly opted into it (settings.vectorStore === "qdrant"). Before,
            // the status reported "qdrant" whenever the cluster was healthy even
            // though the retrieval path always used sqlite-vec — engineStatus lied.
            if (qdrantHealthy && settings.vectorStore === "qdrant") {
                vecBackend = "qdrant";
                vecAvailable = true;
                vecReason = `Qdrant configured at ${qdrantCfg.host}:${qdrantCfg.port}`;
            }
        }
    } catch (err) {
        qdrantError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
    }
    // Rerank
    let rerankAvailable = false;
    let rerankReason = "rerank disabled";
    if (settings.rerankEnabled && settings.rerankProviderModel) {
        rerankAvailable = true;
        rerankReason = `rerank active: ${settings.rerankProviderModel}`;
    } else if (settings.rerankEnabled && !settings.rerankProviderModel) {
        rerankReason = "rerank enabled but provider not configured";
    }
    const rerankParts = settings.rerankProviderModel?.split("/") ?? [];
    const rerankProvider = rerankParts.length >= 2 ? rerankParts[0] ?? null : null;
    const rerankModel = rerankParts.length >= 2 ? rerankParts.slice(1).join("/") : settings.rerankProviderModel ?? null;
    return {
        keyword: {
            available: true,
            backend: "FTS5"
        },
        embedding: {
            source: resolution.source,
            model: resolution.model,
            dimensions: resolution.dimensions,
            available: resolution.source !== null,
            reason: resolution.reason,
            cacheStats
        },
        vectorStore: {
            backend: vecBackend,
            available: vecAvailable,
            rowCount: vecRowCount,
            needsReindex: vecNeedsReindex,
            reason: vecReason
        },
        qdrant: {
            enabled: qdrantEnabled,
            healthy: qdrantHealthy,
            latencyMs: qdrantLatencyMs,
            error: qdrantError
        },
        rerank: {
            enabled: settings.rerankEnabled,
            provider: rerankProvider,
            model: rerankModel,
            available: rerankAvailable,
            reason: rerankReason
        }
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/memory/extraction.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractFacts",
    ()=>extractFacts,
    "extractFactsFromText",
    ()=>extractFactsFromText
]);
/**
 * Fact extraction from LLM responses.
 * Parses text for user preferences, decisions, and patterns.
 * Stores extracted facts asynchronously (non-blocking).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/store.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/types.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("MEMORY_EXTRACTION");
// ─── Pattern Definitions ────────────────────────────────────────────────────
/** Patterns indicating user preferences */ const PREFERENCE_PATTERNS = [
    /\bI\s+(?:really\s+)?prefer\s+([^.,\n]+)/gi,
    /\bI\s+(?:really\s+)?like\s+([^.,\n]+)/gi,
    /\bmy\s+(?:favorite|favourite)\s+(?:is|are)\s+([^.,\n]+)/gi,
    /\bI\s+(?:don'?t|do\s+not)\s+like\s+([^.,\n]+)/gi,
    /\bI\s+(?:hate|dislike|avoid)\s+([^.,\n]+)/gi,
    /\bI\s+enjoy\s+([^.,\n]+)/gi,
    /\bI\s+love\s+([^.,\n]+)/gi
];
/** Patterns indicating user decisions */ const DECISION_PATTERNS = [
    /\bI'?(?:ll|will)\s+use\s+([^.,\n]+)/gi,
    /\bI\s+chose\s+([^.,\n]+)/gi,
    /\bI\s+(?:have\s+)?decided\s+(?:to\s+)?([^.,\n]+)/gi,
    /\bI'?m\s+going\s+(?:to\s+)?(?:use|with|adopt)\s+([^.,\n]+)/gi,
    /\bI\s+selected\s+([^.,\n]+)/gi,
    /\bI\s+picked\s+([^.,\n]+)/gi,
    /\bI\s+went\s+with\s+([^.,\n]+)/gi
];
/** Patterns indicating user behavioral patterns */ const PATTERN_PATTERNS = [
    /\bI\s+usually\s+([^.,\n]+)/gi,
    /\bI\s+always\s+([^.,\n]+)/gi,
    /\bI\s+never\s+([^.,\n]+)/gi,
    /\bI\s+typically\s+([^.,\n]+)/gi,
    /\bI\s+tend\s+to\s+([^.,\n]+)/gi,
    /\bI\s+(?:often|frequently|regularly)\s+([^.,\n]+)/gi
];
// Maximum length for extracted content
const MAX_FACT_LENGTH = 500;
// Minimum content length to avoid noise
const MIN_FACT_LENGTH = 3;
const MAX_EXTRACTION_TEXT_LENGTH = 64 * 1024;
// ─── Extraction Logic ────────────────────────────────────────────────────────
/**
 * Sanitize a matched string: trim, collapse whitespace, cap length
 */ function sanitizeMatch(raw) {
    return raw.trim().replace(/\s+/g, " ").slice(0, MAX_FACT_LENGTH);
}
function capExtractionText(text) {
    if (text.length <= MAX_EXTRACTION_TEXT_LENGTH) return text;
    return text.slice(-MAX_EXTRACTION_TEXT_LENGTH);
}
/**
 * Generate a stable key for a fact (category + first 40 chars of content)
 */ function factKey(category, content) {
    const slug = content.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40).replace(/_+$/, "");
    return `${category}:${slug}`;
}
/**
 * Run a set of patterns against text and collect extracted facts.
 * Deduplicates by key within the batch.
 */ function runPatterns(text, patterns, category, memoryType, seen) {
    const facts = [];
    for (const pattern of patterns){
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        let match;
        while((match = pattern.exec(text)) !== null){
            const raw = match[1];
            if (!raw) continue;
            const content = sanitizeMatch(raw);
            if (content.length < MIN_FACT_LENGTH) continue;
            const key = factKey(category, content);
            if (seen.has(key)) continue;
            seen.add(key);
            facts.push({
                key,
                content,
                type: memoryType,
                category
            });
        }
        // Reset again after use
        pattern.lastIndex = 0;
    }
    return facts;
}
function extractFactsFromText(text) {
    if (!text || typeof text !== "string") return [];
    text = capExtractionText(text);
    const seen = new Set();
    const facts = [];
    // Preferences → factual memory
    facts.push(...runPatterns(text, PREFERENCE_PATTERNS, "preference", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MemoryType"].FACTUAL, seen));
    // Decisions → episodic memory (tied to a moment in time)
    facts.push(...runPatterns(text, DECISION_PATTERNS, "decision", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MemoryType"].EPISODIC, seen));
    // Patterns → factual memory (persistent behavioral facts)
    facts.push(...runPatterns(text, PATTERN_PATTERNS, "pattern", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MemoryType"].FACTUAL, seen));
    return facts;
}
function extractFacts(response, apiKeyId, sessionId) {
    if (!response || !apiKeyId || !sessionId) return;
    const cappedResponse = capExtractionText(response);
    log.info("memory.extraction.start", {
        apiKeyId
    });
    // Non-blocking: schedule after current event loop tick
    setImmediate(()=>{
        const facts = extractFactsFromText(cappedResponse);
        if (facts.length === 0) return;
        for (const fact of facts){
            log.debug("memory.extraction.fact_found", {
                key: fact.key,
                category: fact.category
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$store$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createMemory"])({
                apiKeyId,
                sessionId,
                type: fact.type,
                key: fact.key,
                content: fact.content,
                metadata: {
                    category: fact.category,
                    extractedAt: new Date().toISOString(),
                    source: "llm_response"
                },
                expiresAt: null
            }).catch((err)=>{
                log.error("memory.extraction.background.failed", {
                    err: err?.message,
                    apiKeyId
                });
            });
        }
        log.info("memory.extraction.complete", {
            apiKeyId,
            factCount: facts.length
        });
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_memory_0phwu26._.js.map