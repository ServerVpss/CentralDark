module.exports = [
"[project]/open-sse/handlers/chatCore/ccDiscoveryAliasStrip.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stripCcDiscoveryAlias",
    ()=>stripCcDiscoveryAlias
]);
/**
 * chatCore cc-discovery alias strip (request-path counterpart of
 * open-sse/utils/ccDiscoveryAliases.ts, which only synthesizes the `claude/…`
 * mirror entries on the /v1/models catalog).
 *
 * Claude Code's gateway model discovery only lists ids starting with `claude`/
 * `anthropic`, so the catalog mirrors every eligible model under `claude/<id>`
 * (and `claude/combo/<name>` for combos). When a client actually sends one of
 * those mirror ids back on a chat request, this module strips the `claude/`
 * wrapper back to the real id BEFORE provider resolution — desambiguating the
 * synthetic alias from the legitimate Claude OAuth provider namespace, whose
 * real ids (`claude/claude-fable-5`, etc.) must never be touched.
 *
 * Pure function, no I/O: every lookup the decision depends on (is `rest` a
 * real Claude-provider model? is the first path segment a known provider
 * prefix? does the combo exist? is the alias gate on for this real id?) is
 * injected via `deps`, mirroring the `applyClaudeEffortVariant` /
 * `stripNoThinkingAlias` precedent so the branch logic here stays testable
 * without touching the DB or the provider registry directly.
 */ const CC_DISCOVERY_PREFIX = "claude/";
const CC_DISCOVERY_COMBO_PREFIX = "combo/";
function stripCcDiscoveryAlias(model, deps) {
    if (typeof model !== "string" || !model.startsWith(CC_DISCOVERY_PREFIX)) {
        return {
            model,
            stripped: false
        };
    }
    const rest = model.slice(CC_DISCOVERY_PREFIX.length);
    // Legitimate Claude OAuth provider model (e.g. "claude/claude-fable-5") — never re-target.
    if (deps.isClaudeProviderModel(rest)) {
        return {
            model,
            stripped: false
        };
    }
    if (rest.startsWith(CC_DISCOVERY_COMBO_PREFIX)) {
        const comboName = rest.slice(CC_DISCOVERY_COMBO_PREFIX.length);
        if (deps.hasCombo(comboName) && deps.aliasEnabledFor(rest)) {
            return {
                model: comboName,
                stripped: true
            };
        }
        return {
            model,
            stripped: false
        };
    }
    const slashIndex = rest.indexOf("/");
    if (slashIndex > 0 && deps.isKnownProviderPrefix(rest.slice(0, slashIndex)) && deps.aliasEnabledFor(rest)) {
        return {
            model: rest,
            stripped: true
        };
    }
    return {
        model,
        stripped: false
    };
}
}),
"[project]/open-sse/handlers/chatCore/cooldownClassification.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSelfInflictedUpstreamTimeout",
    ()=>isSelfInflictedUpstreamTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
;
function isSelfInflictedUpstreamTimeout(status, errorType, provider) {
    return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT && errorType === "upstream_timeout" && provider !== "antigravity";
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
"[project]/open-sse/handlers/chatCore/memorySkillsInjection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getSkillsProviderForFormat",
    ()=>getSkillsProviderForFormat,
    "injectMemoryAndSkills",
    ()=>injectMemoryAndSkills
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/memory/retrieval.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/injection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/injection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cachingAware.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function getSkillsProviderForFormat(format) {
    switch(format){
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE:
            return "anthropic";
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI:
            return "google";
        default:
            return "openai";
    }
}
async function injectMemoryAndSkills({ body, memoryOwnerId, provider, effectiveModel, sourceFormat, targetFormat, backgroundReason, log }) {
    const memorySettings = memoryOwnerId ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMemorySettings"])().catch(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_MEMORY_SETTINGS"]) : null;
    if (memoryOwnerId && memorySettings && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldInjectMemory"])(body, {
        enabled: memorySettings.enabled && memorySettings.maxTokens > 0
    })) {
        try {
            const lastUserQuery = (()=>{
                const NON_USER_TYPES = new Set([
                    "function_call",
                    "function_call_output",
                    "tool_call",
                    "tool_call_output",
                    "reasoning",
                    "computer_call",
                    "computer_call_output",
                    "web_search_call",
                    "file_search_call"
                ]);
                function pickFrom(arr) {
                    for(let i = arr.length - 1; i >= 0; i--){
                        const item = arr[i];
                        if (!item) continue;
                        if (item.role !== undefined && item.role !== "user") continue;
                        if (item.role === undefined && typeof item.type === "string") {
                            if (NON_USER_TYPES.has(item.type)) continue;
                        }
                        const content = item.content ?? item.text;
                        if (typeof content === "string" && content.trim().length > 0) {
                            return content;
                        }
                        if (Array.isArray(content)) {
                            const parts = [];
                            for (const p of content){
                                if (typeof p === "string") {
                                    parts.push(p);
                                } else if (p && typeof p === "object") {
                                    const pp = p;
                                    const ptype = typeof pp.type === "string" ? pp.type : "";
                                    if (ptype && ptype !== "text" && ptype !== "input_text" && ptype !== "output_text") {
                                        continue;
                                    }
                                    const t = pp.text ?? pp.input_text;
                                    if (typeof t === "string") parts.push(t);
                                }
                            }
                            if (parts.length > 0) return parts.join(" ").trim();
                        }
                    }
                    return "";
                }
                if (Array.isArray(body.messages)) {
                    const r = pickFrom(body.messages);
                    if (r) return r;
                }
                if (Array.isArray(body.input)) {
                    const r = pickFrom(body.input);
                    if (r) return r;
                }
                return "";
            })();
            const memories = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$retrieval$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["retrieveMemories"])(memoryOwnerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toMemoryRetrievalConfig"])(memorySettings, {
                query: lastUserQuery
            }));
            if (memories.length > 0) {
                // #3890: when the client uses prompt caching (cache_control breakpoints), inject
                // memory cache-safely (before the last user message) so the per-query memory text
                // does not poison the cacheable prefix and force a cache miss on every turn.
                const cacheSafe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectCachingContext"])(body, {
                    provider,
                    targetFormat
                }).hasCacheControl;
                const injected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectMemory"])(body, memories, provider, {
                    cacheSafe
                });
                body = injected;
                log?.debug?.("MEMORY", `Injected ${memories.length} memories for key=${memoryOwnerId}`);
            }
        } catch (memErr) {
            log?.debug?.("MEMORY", `Memory injection skipped: ${memErr instanceof Error ? memErr.message : String(memErr)}`);
        }
    }
    if (memoryOwnerId && memorySettings?.skillsEnabled) {
        const existingTools = Array.isArray(body.tools) ? body.tools : [];
        const mergedTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectSkills"])({
            provider: getSkillsProviderForFormat(sourceFormat),
            existingTools,
            apiKeyId: memoryOwnerId,
            model: typeof effectiveModel === "string" ? effectiveModel : undefined,
            sourceFormat,
            targetFormat,
            backgroundReason,
            messages: Array.isArray(body.messages) ? body.messages : Array.isArray(body.input) ? body.input : undefined
        });
        if (mergedTools.length > existingTools.length) {
            body = {
                ...body,
                tools: mergedTools
            };
            log?.debug?.("SKILLS", `Injected ${mergedTools.length - existingTools.length} skills`);
        }
    }
    return {
        body,
        memorySettings
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/requestSetup.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore request-setup resolvers (Quality Gate v2 / Fase 9 — chatCore god-file decomposition).
 *
 * The first pure slice of handleChatCore's request-setup phase: the per-request model-routing
 * metadata resolved at the very top of the handler. Side-effect-free; future increments grow this
 * into the full ChatCoreContext carrier (setup / dispatch / streaming phases).
 */ __turbopack_context__.s([
    "resolveChatCoreRequestSetup",
    ()=>resolveChatCoreRequestSetup
]);
function resolveChatCoreRequestSetup(modelInfo, body, model) {
    const apiFormat = modelInfo && typeof modelInfo === "object" && "apiFormat" in modelInfo ? typeof modelInfo.apiFormat === "string" ? modelInfo.apiFormat : undefined : undefined;
    const customModelTargetFormat = modelInfo && typeof modelInfo === "object" && "targetFormat" in modelInfo ? typeof modelInfo.targetFormat === "string" ? modelInfo.targetFormat : undefined : undefined;
    const requestedModel = typeof body?.model === "string" && body.model.trim().length > 0 ? body.model : model;
    return {
        apiFormat,
        customModelTargetFormat,
        requestedModel
    };
}
}),
"[project]/open-sse/handlers/chatCore/failureUsage.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore failed-request usage record builder (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure core of handleChatCore's persistFailureUsage closure: builds the usage-history entry for a
 * failed request (zeroed tokens/timing, success:false, the unknown/undefined fallbacks, and the
 * combo-strategy gate). The handler keeps the impure parts byte-identically: it computes
 * `latencyMs` (Date.now() - startTime) and fires the fire-and-forget saveRequestUsage(...).catch().
 */ __turbopack_context__.s([
    "buildFailureUsageRecord",
    ()=>buildFailureUsageRecord
]);
function buildFailureUsageRecord(opts) {
    return {
        provider: opts.provider || "unknown",
        model: opts.model || "unknown",
        tokens: {
            input: 0,
            output: 0,
            cacheRead: 0,
            cacheCreation: 0,
            reasoning: 0
        },
        status: String(opts.statusCode),
        success: false,
        latencyMs: opts.latencyMs,
        timeToFirstTokenMs: 0,
        errorCode: opts.errorCode || String(opts.statusCode),
        timestamp: new Date().toISOString(),
        connectionId: opts.connectionId || undefined,
        apiKeyId: opts.apiKeyInfo?.id || undefined,
        apiKeyName: opts.apiKeyInfo?.name || undefined,
        serviceTier: opts.effectiveServiceTier,
        comboStrategy: opts.isCombo ? opts.comboStrategy || undefined : undefined,
        endpoint: opts.endpoint || undefined
    };
}
}),
"[project]/open-sse/handlers/chatCore/contextEstimation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "estimateFinalInputTokens",
    ()=>estimateFinalInputTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/bodyAdapter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
;
;
function asJsonRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function estimateFinalInputTokens(requestBody) {
    const adapted = requestBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(requestBody).body : null;
    const nestedRequest = asJsonRecord(requestBody?.request);
    const messages = adapted?.messages || requestBody?.contents || nestedRequest?.contents || (Array.isArray(requestBody?.input) ? requestBody.input : requestBody?.input && typeof requestBody.input === "object" ? requestBody.input : []);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(messages) + (Array.isArray(requestBody?.tools) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(requestBody.tools) : 0) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(requestBody?.system) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(requestBody?.instructions);
}
}),
"[project]/open-sse/handlers/chatCore/claudeSystemRole.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore Claude system-role lifter (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure helper extracted from chatCore.ts: lifts any `system`/`developer` role messages out of the
 * messages[] array into the top-level `system` field. Anthropic's Messages API rejects either as a
 * chat role, so they must be hoisted. `developer` is OpenAI's Responses-API rename of `system` and
 * is treated identically. Mutates the payload in place; behaviour is byte-identical to the previous
 * top-level definition (still re-exported from chatCore.ts for existing importers/tests).
 */ __turbopack_context__.s([
    "extractSystemRoleMessages",
    ()=>extractSystemRoleMessages
]);
function extractSystemRoleMessages(payload) {
    if (!Array.isArray(payload.messages)) return;
    const messages = payload.messages;
    // Treat both `system` and `developer` as system-equivalent (OpenAI's Responses
    // API renamed system → developer). Anthropic rejects either as a chat role, so
    // both must be lifted into the top-level `system` field — parity with the
    // normal-path extractSystemMessagesToBody closure.
    const isSystemRole = (role)=>typeof role === "string" && (role.toLowerCase() === "system" || role.toLowerCase() === "developer");
    const systemMessages = messages.filter((m)=>isSystemRole(m.role));
    if (systemMessages.length === 0) return;
    const extraBlocks = [];
    for (const sm of systemMessages){
        if (typeof sm.content === "string" && sm.content.length > 0) {
            extraBlocks.push({
                type: "text",
                text: sm.content
            });
        } else if (Array.isArray(sm.content)) {
            for (const block of sm.content){
                if (block?.type === "text" && typeof block.text === "string" && block.text.length > 0) {
                    extraBlocks.push({
                        ...block
                    });
                }
            }
        }
    }
    if (extraBlocks.length > 0) {
        const existingSystem = payload.system;
        if (typeof existingSystem === "string" && existingSystem.length > 0) {
            payload.system = [
                {
                    type: "text",
                    text: existingSystem
                },
                ...extraBlocks
            ];
        } else if (Array.isArray(existingSystem)) {
            payload.system = [
                ...existingSystem,
                ...extraBlocks
            ];
        } else {
            payload.system = extraBlocks;
        }
    }
    payload.messages = messages.filter((m)=>!isSystemRole(m.role));
}
}),
"[project]/open-sse/handlers/chatCore/idempotency.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "checkIdempotencyCache",
    ()=>checkIdempotencyCache,
    "composeIdempotencyKey",
    ()=>composeIdempotencyKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/idempotencyLayer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function composeIdempotencyKey({ rawKey, provider, model, messages }) {
    if (!rawKey) return null;
    let digest = "";
    try {
        digest = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(messages ?? "")).digest("hex").slice(0, 16);
    } catch  {
        digest = "nodigest";
    }
    return `${rawKey}|${provider}|${model}|${digest}`;
}
async function checkIdempotencyCache({ clientRawRequest, provider, model, body, effectiveServiceTier, startTime, log }) {
    // NEXA fusion-idempotency fix: namespace the raw header key (see composeIdempotencyKey).
    const rawIdempotencyKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getIdempotencyKey"])(clientRawRequest?.headers);
    const idempotencyKey = composeIdempotencyKey({
        rawKey: rawIdempotencyKey,
        provider,
        model,
        messages: body?.messages
    });
    const cachedIdemp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkIdempotency"])(idempotencyKey);
    if (cachedIdemp) {
        log?.debug?.("IDEMPOTENCY", `Hit for key=${idempotencyKey?.slice(0, 12)}...`);
        const idempotentUsage = cachedIdemp.response && typeof cachedIdemp.response === "object" ? cachedIdemp.response.usage : undefined;
        const idempotentCost = idempotentUsage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, idempotentUsage, {
            serviceTier: effectiveServiceTier
        }) : 0;
        const headers = {
            "Content-Type": "application/json",
            "X-OmniRoute-Idempotent": "true"
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(headers, {
            provider,
            model,
            cacheHit: false,
            latencyMs: Date.now() - startTime,
            usage: idempotentUsage,
            costUsd: idempotentCost
        });
        return {
            idempotencyKey,
            hit: {
                success: true,
                response: new Response(JSON.stringify(cachedIdemp.response), {
                    status: cachedIdemp.status,
                    headers
                })
            }
        };
    }
    return {
        hit: null,
        idempotencyKey
    };
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
"[project]/open-sse/handlers/chatCore/semanticCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "checkSemanticCache",
    ()=>checkSemanticCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/semanticCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/jsonToSse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$usageExtractor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/usageExtractor.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
async function checkSemanticCache({ semanticCacheEnabled, body, clientRawRequest, model, provider, stream, reqLogger, effectiveServiceTier, connectionId, startTime, log, persistAttemptLogs, apiKeyId }) {
    if (semanticCacheEnabled && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCacheableForRead"])(body, clientRawRequest?.headers)) {
        const signature = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateSignature"])(model, body.messages ?? body.input, body.temperature, body.top_p, apiKeyId ?? undefined);
        const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedResponse"])(signature);
        if (cached) {
            log?.debug?.("CACHE", `Semantic cache HIT for ${model} (stream=${stream})`);
            reqLogger.logConvertedResponse(cached);
            const cachedUsage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$usageExtractor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractUsageFromResponse"])(cached, provider) || cached?.usage;
            const cachedCost = cachedUsage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, cachedUsage, {
                serviceTier: effectiveServiceTier
            }) : 0;
            persistAttemptLogs({
                status: 200,
                tokens: cached?.usage,
                responseBody: cached,
                providerRequest: null,
                providerResponse: null,
                clientResponse: cached,
                cacheSource: "semantic"
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
            const cachedSse = stream ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["synthesizeOpenAiSseFromJson"])(JSON.stringify(cached)) : "";
            const headers = {
                "Content-Type": cachedSse ? "text/event-stream" : "application/json",
                [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].cache]: "HIT"
            };
            // A cache HIT serves WITHOUT an upstream call, so the incremental cost billed to
            // the client is 0 (consumers that sum X-OmniRoute-Response-Cost must not charge for
            // hits). The original/would-have-been cost is surfaced via X-OmniRoute-Cost-Saved.
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(headers, {
                provider,
                model,
                cacheHit: true,
                latencyMs: Date.now() - startTime,
                usage: cachedUsage,
                costUsd: 0,
                costSavedUsd: cachedCost
            });
            return {
                success: true,
                response: new Response(cachedSse || JSON.stringify(cached), {
                    headers
                })
            };
        }
    }
    return null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/claudeClassifierCompat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildDefaultAllowClaudeMessage",
    ()=>buildDefaultAllowClaudeMessage,
    "shouldDefaultAllowClassifier",
    ()=>shouldDefaultAllowClassifier
]);
/**
 * Claude Code auto-mode classifier compat mode (opt-in, default "off").
 *
 * Claude Code's `--permission-mode auto` sends an internal `/v1/messages`
 * security-classifier request and requires the response to START with the literal
 * token `<block>no</block>` (ALLOW) or `<block>yes</block>` (BLOCK) — anything else
 * is unparseable and Claude Code fails closed with "Auto mode could not evaluate
 * this action and is blocking it for safety".
 *
 * When a combo/fallback route sends the classifier call to a cheap model that
 * returns 200 with empty content, the well-formed-but-empty Claude message
 * OmniRoute would normally produce still fails that parser — every gated action
 * (WebFetch, Bash, Edit, …) ends up fail-closed. With `claudeClassifierCompat` set
 * to "auto" or "always", handleChatCore detects the classifier request up front
 * and short-circuits with a synthetic ALLOW response, WITHOUT ever calling the
 * upstream provider. Default is "off": nothing changes unless an operator
 * explicitly opts in (never mutates legitimate traffic by default).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
/** The literal system-prompt marker Claude Code's classifier request carries. */ const SECURITY_MONITOR_MARKER = "You are a security monitor for autonomous AI coding agents";
function extractSystemTexts(body) {
    const system = body?.system;
    if (typeof system === "string") return [
        system
    ];
    if (Array.isArray(system)) {
        return system.map((part)=>part && typeof part.text === "string" ? part.text : "").filter(Boolean);
    }
    return [];
}
function shouldDefaultAllowClassifier(sourceFormat, body, mode) {
    if (mode !== "auto" && mode !== "always") return false;
    if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) return false;
    return extractSystemTexts(body).some((text)=>text.includes(SECURITY_MONITOR_MARKER));
}
function buildDefaultAllowClaudeMessage(model) {
    const message = {
        id: `msg_${globalThis.crypto.randomUUID()}`,
        type: "message",
        role: "assistant",
        model: model || "claude-3-5-sonnet-20241022",
        content: [
            {
                type: "text",
                text: "<block>no</block>"
            }
        ],
        stop_reason: "end_turn",
        stop_sequence: null,
        usage: {
            input_tokens: 1,
            output_tokens: 1
        }
    };
    return {
        success: true,
        response: new Response(JSON.stringify(message), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            }
        })
    };
}
}),
"[project]/open-sse/handlers/chatCore/clientUsageBuffer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyClientUsageBuffer",
    ()=>applyClientUsageBuffer
]);
/**
 * chatCore client usage buffer/estimate (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's non-streaming success path: add a buffer to the response usage
 * and filter it for the client format (to prevent CLI context errors); if the provider returned no
 * usage block, fall back to estimating from the serialized content length. Mutates
 * `translatedResponse.usage` in place — byte-identical to the previous inline block, including the
 * `?.usage` guard, the `JSON.stringify(... || "")` content-length, and the `> 0` estimate gate.
 *
 * #8331 scoping: `addBufferToUsage()` now keeps the safety margin OUT of the client-visible
 * metering fields (prompt_tokens/input_tokens/total_tokens) for normal API clients, so billing
 * reflects real upstream usage. Claude-Code-compatible providers are the one exception — the
 * buffer's original purpose (see `usageTracking.ts` module docstring) is CLI context-window
 * headroom, and Claude Code's own context accounting reads the buffered number straight out of
 * the response `usage` block. `preserveContextBudgetInVisibleUsage` re-folds the computed
 * `context_budget_*` fields back into the visible fields for that one path only, before
 * `filterUsageForFormat()` strips the internal fields — every other caller keeps the real,
 * unbuffered #8331 numbers.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/usageTracking.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const DEFAULT_DEPS = {
    addBufferToUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addBufferToUsage"],
    filterUsageForFormat: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterUsageForFormat"],
    estimateUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateUsage"]
};
/** True when a usage object is present but every token field is zero/absent.
 * Web/unofficial providers often emit `{prompt_tokens:0,completion_tokens:0,total_tokens:0}`
 * because the upstream has no metering. Treating that as "has usage" makes
 * `addBufferToUsage` turn zeros into a constant `USAGE_TOKEN_BUFFER` (default 2000),
 * so every request shows exactly 2000 tokens. Prefer estimating instead. */ function isEmptyUsage(usage) {
    if (!usage || typeof usage !== "object" || Array.isArray(usage)) return true;
    const u = usage;
    const fields = [
        "prompt_tokens",
        "completion_tokens",
        "total_tokens",
        "input_tokens",
        "output_tokens",
        "promptTokenCount",
        "candidatesTokenCount",
        "totalTokenCount"
    ];
    let sawNumber = false;
    for (const key of fields){
        const v = u[key];
        if (typeof v !== "number" || !Number.isFinite(v)) continue;
        sawNumber = true;
        if (v > 0) return false;
    }
    // No positive counts (or no numeric fields at all) → treat as empty.
    return true;
}
/** context_budget_* → visible-field mapping folded back in for Claude-Code-compatible
 * responses only (see module docstring above). */ const CONTEXT_BUDGET_TO_VISIBLE_FIELD = {
    context_budget_prompt_tokens: "prompt_tokens",
    context_budget_input_tokens: "input_tokens",
    context_budget_total_tokens: "total_tokens"
};
function foldContextBudgetIntoVisibleUsage(usage) {
    for (const [budgetField, visibleField] of Object.entries(CONTEXT_BUDGET_TO_VISIBLE_FIELD)){
        const value = usage[budgetField];
        if (typeof value === "number") {
            usage[visibleField] = value;
        }
    }
}
function applyClientUsageBuffer(translatedResponse, body, clientResponseFormat, options = {}, deps = DEFAULT_DEPS) {
    const { preserveContextBudgetInVisibleUsage = false } = options;
    // Add buffer and filter usage for client (to prevent CLI context errors)
    if (translatedResponse?.usage && !isEmptyUsage(translatedResponse.usage)) {
        const buffered = deps.addBufferToUsage(translatedResponse.usage);
        if (preserveContextBudgetInVisibleUsage) {
            foldContextBudgetIntoVisibleUsage(buffered);
        }
        translatedResponse.usage = deps.filterUsageForFormat(buffered, clientResponseFormat);
    } else {
        // Fallback: estimate usage when provider returned no usage block
        // (or an all-zero stub — common for cookie/web reverse-engineered providers).
        const contentLength = JSON.stringify(translatedResponse?.choices?.[0]?.message?.content || "").length;
        if (contentLength > 0) {
            const estimated = deps.estimateUsage(body, contentLength, clientResponseFormat);
            translatedResponse.usage = deps.filterUsageForFormat(estimated, clientResponseFormat);
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/postCallGuardrailContext.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildPostCallGuardrailContext",
    ()=>buildPostCallGuardrailContext
]);
/**
 * chatCore post-call guardrail context builder (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's non-streaming success path: assemble the context object passed to
 * `guardrailRegistry.runPostCallHooks`. Pure value builder — no side effects, no early-returns. The
 * `disabledGuardrails` field is resolved via `resolveDisabledGuardrails` (injectable for tests).
 * Behaviour is byte-identical to the previous inline literal, including the `method: "POST"` /
 * `stream: false` constants and the headers/endpoint null-coalescing.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/guardrails/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/registry.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function buildPostCallGuardrailContext(args, resolveDisabledGuardrails = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDisabledGuardrails"]) {
    const headers = args.clientRawRequest?.headers ?? null;
    return {
        apiKeyInfo: args.apiKeyInfo,
        disabledGuardrails: resolveDisabledGuardrails({
            apiKeyInfo: args.apiKeyInfo ?? null,
            body: args.body,
            headers
        }),
        endpoint: args.clientRawRequest?.endpoint || null,
        headers,
        log: args.log,
        method: "POST",
        model: args.model,
        provider: args.provider,
        sourceFormat: args.responsePayloadFormat,
        stream: false,
        targetFormat: args.clientResponseFormat
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/semanticCacheStore.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "storeSemanticCacheResponse",
    ()=>storeSemanticCacheResponse
]);
/**
 * chatCore semantic-cache store (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Extracted from handleChatCore's non-streaming success path (Phase 9.1): when semantic caching is
 * enabled and the request/response are cacheable, store the translated response under its signature
 * so a later temp=0 request can be served from cache. Side-effect only (cache write + debug log);
 * no early-return, no outer-variable reassignment. Behaviour is byte-identical to the previous
 * inline block, including the `prompt + completion || 0` token-saved precedence.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/semanticCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/estimateSize.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_DEPS = {
    isCacheableForWrite: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCacheableForWrite"],
    isSmallEnoughForSemanticCache: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSmallEnoughForSemanticCache"],
    generateSignature: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateSignature"],
    setCachedResponse: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCachedResponse"]
};
function storeSemanticCacheResponse(args, deps = DEFAULT_DEPS) {
    if (!args.enabled || !deps.isCacheableForWrite(args.body, args.headers) || !deps.isSmallEnoughForSemanticCache(args.translatedResponse)) {
        return;
    }
    const signature = deps.generateSignature(args.model, args.body.messages ?? args.body.input, args.body.temperature, args.body.top_p, args.apiKeyId ?? undefined);
    const tokensSaved = args.usage?.prompt_tokens + args.usage?.completion_tokens || 0;
    deps.setCachedResponse(signature, args.model, args.translatedResponse, tokensSaved);
    args.log?.debug?.("CACHE", `Stored response for ${args.model} (${tokensSaved} tokens)`);
}
}),
"[project]/open-sse/handlers/chatCore/nonStreamingResponseHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildNonStreamingResponseHeaders",
    ()=>buildNonStreamingResponseHeaders
]);
/**
 * chatCore non-streaming success response headers (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's non-streaming success path: build the response header map for a
 * cache-MISS JSON response — the static Content-Type + cache marker, the OmniRoute meta headers
 * (provider/model/latency/usage/cost/request-id), and the optional compression header. Pure builder
 * (returns a fresh map; only mutates the map it owns). Behaviour is byte-identical to the previous
 * inline block, including `latencyMs: now - startTime`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function buildNonStreamingResponseHeaders(args, deps = {
    attachOmniRouteMetaHeaders: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"],
    now: Date.now
}) {
    const responseHeaders = {
        "Content-Type": "application/json",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].cache]: "MISS"
    };
    deps.attachOmniRouteMetaHeaders(responseHeaders, {
        provider: args.provider,
        model: args.model,
        cacheHit: false,
        latencyMs: deps.now() - args.startTime,
        usage: args.responseUsage,
        costUsd: args.estimatedCost,
        requestId: args.requestId,
        strategy: args.comboStrategy ?? "single"
    });
    if (args.compressionResponseMeta) {
        responseHeaders[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].compression] = args.compressionResponseMeta;
    }
    return responseHeaders;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/nonStreamingJsonResponse.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Build the final non-streaming JSON response body once and publish an accurate
 * Content-Length for downstream HTTP clients and buffering proxies.
 */ __turbopack_context__.s([
    "buildNonStreamingJsonResponse",
    ()=>buildNonStreamingJsonResponse
]);
function buildNonStreamingJsonResponse(body, headers) {
    const payload = JSON.stringify(body);
    return new Response(payload, {
        headers: {
            ...headers,
            "Content-Length": String(Buffer.byteLength(payload))
        }
    });
}
}),
"[project]/open-sse/handlers/chatCore/outputTokenBudget.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OUTPUT_TOKEN_FIELDS",
    ()=>OUTPUT_TOKEN_FIELDS,
    "enforceOutputTokenBudget",
    ()=>enforceOutputTokenBudget
]);
const OUTPUT_TOKEN_FIELDS = [
    "max_tokens",
    "max_completion_tokens",
    "max_output_tokens"
];
function getOutputTokenAdjustment(field, value, effectiveCap) {
    if (typeof value !== "number") return null;
    if (!Number.isFinite(value) || value <= 0) return {
        field,
        remove: true
    };
    const capped = Math.min(Math.floor(value), effectiveCap);
    return capped === value ? null : {
        field,
        value: capped
    };
}
function hasTranslatorOutputTokenLimit(body) {
    return [
        "max_tokens",
        "max_completion_tokens"
    ].some((field)=>{
        const value = body[field];
        return typeof value === "number" && Number.isFinite(value) && value > 0;
    });
}
function adjustOutputTokenFields(body, effectiveCap) {
    const adjustments = OUTPUT_TOKEN_FIELDS.map((field)=>getOutputTokenAdjustment(field, body[field], effectiveCap)).filter((adjustment)=>adjustment !== null);
    if (adjustments.length === 0) return {
        body,
        adjustedFields: []
    };
    const nextBody = {
        ...body
    };
    for (const adjustment of adjustments){
        if (adjustment.remove) delete nextBody[adjustment.field];
        else nextBody[adjustment.field] = adjustment.value;
    }
    return {
        body: nextBody,
        adjustedFields: adjustments.map(({ field })=>field)
    };
}
function enforceOutputTokenBudget(body, estimatedInputTokens, contextLimit, defaultOutputTokens = 0, maxOutputTokenCap, maxInputTokenCap) {
    const normalizedInputTokens = Math.max(0, Math.ceil(estimatedInputTokens));
    const normalizedContextLimit = Math.max(1, Math.floor(contextLimit));
    const normalizedDefaultOutputTokens = Math.max(0, Math.floor(defaultOutputTokens));
    const availableOutputTokens = normalizedContextLimit - normalizedInputTokens;
    // Independent input-only ceiling: reject when the prompt alone exceeds the
    // model's declared max input, regardless of remaining output room.
    const normalizedInputCap = maxInputTokenCap == null ? null : Math.floor(maxInputTokenCap);
    if (normalizedInputCap !== null && normalizedInputCap > 0 && normalizedInputTokens > normalizedInputCap) {
        return {
            ok: false,
            estimatedInputTokens: normalizedInputTokens,
            contextLimit: normalizedContextLimit,
            maxInputTokens: normalizedInputCap
        };
    }
    if (availableOutputTokens < 1) {
        return {
            ok: false,
            estimatedInputTokens: normalizedInputTokens,
            contextLimit: normalizedContextLimit
        };
    }
    // Floor before the positivity test: a fractional cap below 1 would otherwise
    // survive the `> 0` guard and floor to an effective cap of 0, clamping every
    // field to zero. Sub-token caps are meaningless — treat them as absent.
    const normalizedOutputCap = maxOutputTokenCap == null ? null : Math.floor(maxOutputTokenCap);
    const effectiveCap = normalizedOutputCap !== null && normalizedOutputCap > 0 ? Math.min(availableOutputTokens, normalizedOutputCap) : availableOutputTokens;
    if (!body) {
        if (normalizedDefaultOutputTokens > availableOutputTokens) {
            return {
                ok: false,
                estimatedInputTokens: normalizedInputTokens,
                contextLimit: normalizedContextLimit
            };
        }
        return {
            ok: true,
            body: {},
            availableOutputTokens,
            adjustedFields: []
        };
    }
    if (normalizedDefaultOutputTokens > availableOutputTokens && !hasTranslatorOutputTokenLimit(body)) {
        return {
            ok: false,
            estimatedInputTokens: normalizedInputTokens,
            contextLimit: normalizedContextLimit
        };
    }
    const adjusted = adjustOutputTokenFields(body, effectiveCap);
    return {
        ok: true,
        ...adjusted,
        availableOutputTokens
    };
}
}),
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
"[project]/open-sse/handlers/chatCore/jsonBodyToSse.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "maybeConvertJsonBodyToSse",
    ()=>maybeConvertJsonBodyToSse
]);
/**
 * chatCore non-SSE JSON → SSE conversion (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's streaming entry (#3089): some "reasoning" openai-compatible
 * upstreams ignore `stream:true` and return a complete application/json chat-completion body
 * instead of an SSE stream. The readiness check only recognizes SSE `data:` frames, so that body
 * produced a spurious STREAM_EARLY_EOF / HTTP 502. Detect a JSON (non-SSE) upstream body and
 * synthesize an equivalent OpenAI SSE stream so the streaming pipeline gets a valid stream.
 *
 * Returns the (possibly rebuilt) provider response — unchanged when the body is not a non-SSE JSON
 * body, an SSE stream when convertible, or a rebuilt-with-consumed-body response otherwise (so the
 * existing readiness/error path still runs unchanged). Behaviour is byte-identical to the previous
 * inline block.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/stream.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/jsonToSse.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const DEFAULT_DEPS = {
    withBodyTimeout: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["withBodyTimeout"],
    synthesizeOpenAiSseFromJson: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["synthesizeOpenAiSseFromJson"]
};
function prependBufferedChunks(chunks, reader) {
    let index = 0;
    return new ReadableStream({
        async pull (controller) {
            if (index < chunks.length) {
                controller.enqueue(chunks[index++]);
                return;
            }
            try {
                const { done, value } = await reader.read();
                if (done) {
                    controller.close();
                } else {
                    controller.enqueue(value);
                }
            } catch (error) {
                controller.error(error);
            }
        },
        async cancel (reason) {
            try {
                await reader.cancel(reason);
            } catch  {}
        }
    });
}
function classifyBodyPrefix(text) {
    const trimmed = text.replace(/^\uFEFF/, "").trimStart();
    if (!trimmed) return "unknown";
    if (trimmed.startsWith(":")) return "sse";
    if (/^(?:data|event|id|retry)\s*:/i.test(trimmed)) return "sse";
    const lower = trimmed.toLowerCase();
    for (const field of [
        "data",
        "event",
        "id",
        "retry"
    ]){
        if (field.startsWith(lower)) return "unknown";
        if (lower.startsWith(field)) {
            const rest = lower.slice(field.length);
            if (/^\s*$/.test(rest)) return "unknown";
            if (/^\s*:/.test(rest)) return "sse";
        }
    }
    return "non-sse";
}
async function sniffJsonBodyForSse(providerResponse, ctx, deps) {
    const reader = providerResponse.body.getReader();
    const bufferedChunks = [];
    const decoder = new TextDecoder();
    let sniffed = "";
    let sniffedBytes = 0;
    const maxSniffBytes = 4096;
    while(sniffedBytes < maxSniffBytes){
        const chunk = await deps.withBodyTimeout(reader.read());
        if (chunk.done || !chunk.value) break;
        bufferedChunks.push(chunk.value);
        sniffedBytes += chunk.value.byteLength;
        sniffed += decoder.decode(chunk.value, {
            stream: true
        });
        if (classifyBodyPrefix(sniffed) === "sse") {
            const rebuiltHeaders = new Headers(providerResponse.headers);
            rebuiltHeaders.delete("content-length");
            rebuiltHeaders.set("content-type", "text/event-stream");
            ctx.log?.debug?.("STREAM", `Upstream returned SSE bytes with application/json content-type — preserving streaming body (${ctx.provider}/${ctx.model})`);
            return {
                sseResponse: new Response(prependBufferedChunks(bufferedChunks, reader), {
                    status: providerResponse.status,
                    statusText: providerResponse.statusText,
                    headers: rebuiltHeaders
                }),
                jsonBody: new Response(null)
            };
        }
    }
    return {
        jsonBody: new Response(prependBufferedChunks(bufferedChunks, reader))
    };
}
async function maybeConvertJsonBodyToSse(providerResponse, ctx, deps = DEFAULT_DEPS) {
    const upstreamContentType = (providerResponse.headers.get("content-type") || "").toLowerCase();
    const isNonSseJsonBody = !!providerResponse.body && upstreamContentType.includes("application/json") && !upstreamContentType.includes("text/event-stream") && !upstreamContentType.includes("application/x-ndjson");
    if (!isNonSseJsonBody) {
        return providerResponse;
    }
    const { sseResponse, jsonBody } = await sniffJsonBodyForSse(providerResponse, ctx, deps);
    if (sseResponse) return sseResponse;
    const jsonText = await deps.withBodyTimeout(jsonBody.text());
    const synthesizedSse = deps.synthesizeOpenAiSseFromJson(jsonText);
    const rebuiltHeaders = new Headers(providerResponse.headers);
    rebuiltHeaders.delete("content-length");
    if (synthesizedSse) {
        ctx.log?.debug?.("STREAM", `Upstream returned application/json on a streaming request — converting to SSE (${ctx.provider}/${ctx.model})`);
        rebuiltHeaders.set("content-type", "text/event-stream");
        return new Response(synthesizedSse, {
            status: providerResponse.status,
            statusText: providerResponse.statusText,
            headers: rebuiltHeaders
        });
    }
    // Not a convertible chat-completion JSON — rebuild the consumed body so the existing
    // readiness/error path still runs unchanged.
    return new Response(jsonText, {
        status: providerResponse.status,
        statusText: providerResponse.statusText,
        headers: rebuiltHeaders
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/responseHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MAX_FORWARDED_UPSTREAM_RESPONSE_HEADER_BYTES",
    ()=>MAX_FORWARDED_UPSTREAM_RESPONSE_HEADER_BYTES,
    "buildStreamingResponseHeaders",
    ()=>buildStreamingResponseHeaders,
    "isNextMiddlewareControlHeader",
    ()=>isNextMiddlewareControlHeader,
    "materializeDeduplicatedExecutionResult",
    ()=>materializeDeduplicatedExecutionResult,
    "resolveForwardedHeaderBudget",
    ()=>resolveForwardedHeaderBudget,
    "stripNextMiddlewareControlHeaders",
    ()=>stripNextMiddlewareControlHeaders,
    "stripStaleForwardingHeaders",
    ()=>stripStaleForwardingHeaders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const STREAMING_RESPONSE_HEADER_DENYLIST = new Set([
    "content-type",
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "cache-control",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "upgrade",
    "authorization",
    "authentication-info",
    "cookie",
    "set-cookie",
    "set-cookie2",
    "www-authenticate",
    "x-api-key",
    "x-amz-security-token",
    "x-auth-token",
    "x-accel-buffering"
]);
const DEFAULT_FORWARDED_HEADER_BUDGET_BYTES = 768;
function resolveForwardedHeaderBudget(env) {
    const parsed = Number.parseInt(String(env ?? process.env.OMNIROUTE_FORWARDING_HEADER_BUDGET_BYTES), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FORWARDED_HEADER_BUDGET_BYTES;
}
const MAX_FORWARDED_UPSTREAM_RESPONSE_HEADER_BYTES = resolveForwardedHeaderBudget();
const MAX_LOGGED_DROPPED_RESPONSE_HEADERS = 20;
const responseHeaderEncoder = new TextEncoder();
function responseHeaderWireBytes(name, value) {
    return responseHeaderEncoder.encode(`${name}: ${value}\r\n`).byteLength;
}
function isOmniRouteInternalHeader(headerName) {
    return headerName.toLowerCase().startsWith("x-omniroute-");
}
function getForwardingPriority(headerName) {
    const normalized = headerName.toLowerCase();
    if (normalized === "x-request-id" || normalized === "request-id" || normalized === "x-correlation-id" || normalized === "traceparent" || normalized === "traceresponse") {
        return 0;
    }
    if (normalized === "retry-after") return 1;
    if (normalized.includes("ratelimit") || normalized.includes("rate-limit")) return 2;
    return 3;
}
/**
 * Prefix of Next.js internal middleware control headers.
 *
 * When an upstream provider is itself hosted behind a Next.js middleware
 * (e.g. synthetic.new), a perfectly successful `200 OK` response can still
 * carry Next's own control headers such as `x-middleware-rewrite`,
 * `x-middleware-next`, `x-middleware-override-headers`,
 * `x-middleware-set-cookie`, and the `x-middleware-request-*` family.
 *
 * If OmniRoute re-emits those headers from an App Router route handler, Next
 * 16's `app-route` runtime
 * interprets `x-middleware-rewrite` as a `NextResponse.rewrite()` call and
 * throws `NextResponse.rewrite() was used in a app route handler` — turning a
 * successful upstream call into a 500. This is provider-agnostic proxy
 * hygiene: any upstream behind Next middleware can leak these headers.
 *
 * See issue #5849.
 */ const NEXTJS_MIDDLEWARE_HEADER_PREFIX = "x-middleware-";
function isNextMiddlewareControlHeader(headerName) {
    return headerName.toLowerCase().startsWith(NEXTJS_MIDDLEWARE_HEADER_PREFIX);
}
function stripNextMiddlewareControlHeaders(headers) {
    const toDelete = [];
    headers.forEach((_value, key)=>{
        if (isNextMiddlewareControlHeader(key)) {
            toDelete.push(key);
        }
    });
    for (const key of toDelete){
        headers.delete(key);
    }
}
function buildStreamingResponseHeaders(providerHeaders, meta, log = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultLogger"]) {
    const connectionScopedHeaders = new Set((providerHeaders.get("connection") || "").split(",").map((name)=>name.trim().toLowerCase()).filter(Boolean));
    const candidates = [];
    let position = 0;
    providerHeaders.forEach((value, key)=>{
        const normalized = key.toLowerCase();
        if (STREAMING_RESPONSE_HEADER_DENYLIST.has(normalized) || connectionScopedHeaders.has(normalized) || isNextMiddlewareControlHeader(normalized) || isOmniRouteInternalHeader(normalized)) {
            return;
        }
        candidates.push({
            key,
            value,
            bytes: responseHeaderWireBytes(key, value),
            priority: getForwardingPriority(key),
            position: position++
        });
    });
    candidates.sort((a, b)=>a.priority - b.priority || a.position - b.position);
    const forwardedHeaders = [];
    const droppedHeaders = [];
    let forwardedBytes = 0;
    for (const candidate of candidates){
        if (forwardedBytes + candidate.bytes <= MAX_FORWARDED_UPSTREAM_RESPONSE_HEADER_BYTES) {
            forwardedHeaders.push([
                candidate.key,
                candidate.value
            ]);
            forwardedBytes += candidate.bytes;
        } else {
            droppedHeaders.push({
                name: candidate.key,
                bytes: candidate.bytes
            });
        }
    }
    if (droppedHeaders.length > 0) {
        log?.warn?.("HTTP", "Dropped upstream response headers that exceeded forwarding budget", {
            budgetBytes: MAX_FORWARDED_UPSTREAM_RESPONSE_HEADER_BYTES,
            forwardedBytes,
            droppedCount: droppedHeaders.length,
            droppedHeaders: droppedHeaders.slice(0, MAX_LOGGED_DROPPED_RESPONSE_HEADERS)
        });
    }
    const responseHeaders = {
        ...Object.fromEntries(forwardedHeaders),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].cache]: "MISS"
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(responseHeaders, meta);
    return responseHeaders;
}
function materializeDeduplicatedExecutionResult(result) {
    const snapshot = result && typeof result === "object" ? result._dedupSnapshot : undefined;
    if (!snapshot) return result;
    return {
        ...result,
        response: new Response(snapshot.payload, {
            status: snapshot.status,
            statusText: snapshot.statusText,
            headers: snapshot.headers
        })
    };
}
function stripStaleForwardingHeaders(headers) {
    headers.delete("content-encoding");
    headers.delete("content-length");
    headers.delete("transfer-encoding");
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/streamingResponseHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "assembleStreamingResponseHeaders",
    ()=>assembleStreamingResponseHeaders
]);
/**
 * chatCore streaming response headers (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Extracted from handleChatCore's streaming success path: assemble the streaming response header map
 * — the upstream-derived streaming headers (via buildStreamingResponseHeaders, with zeroed
 * latency/usage/cost since those are not yet known at stream start), the per-request id, and the
 * optional compression header. Pure builder (returns a fresh map). Behaviour is byte-identical to
 * the previous inline block.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/responseHeaders.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function assembleStreamingResponseHeaders(args, buildStreamingResponseHeaders = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildStreamingResponseHeaders"]) {
    const responseHeaders = {
        ...buildStreamingResponseHeaders(args.providerHeaders, {
            provider: args.provider,
            model: args.model,
            cacheHit: false,
            latencyMs: 0,
            usage: null,
            costUsd: 0,
            strategy: args.comboStrategy ?? "single"
        }),
        "x-omniroute-request-id": args.pendingRequestId
    };
    if (args.compressionResponseMeta) {
        responseHeaders[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].compression] = args.compressionResponseMeta;
    }
    return responseHeaders;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/streamingSemanticCacheStore.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "storeStreamingSemanticCacheResponse",
    ()=>storeStreamingSemanticCacheResponse
]);
/**
 * chatCore streaming semantic-cache store (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's onStreamComplete callback: after a 200 streaming response is
 * assembled, store it under its signature so a future temp=0 request can be served from cache.
 * Side-effect only (cache write + debug log), wrapped in fail-open try/catch. Behaviour is
 * byte-identical to the previous inline block — including the `_streamed` strip, the early
 * skip-on-too-large, and the `Number(...) || 0` token accounting. The early return was the last
 * statement of the callback, so returning from this helper is equivalent.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/semanticCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/estimateSize.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_DEPS = {
    isCacheableForWrite: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCacheableForWrite"],
    isSmallEnoughForSemanticCache: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSmallEnoughForSemanticCache"],
    generateSignature: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateSignature"],
    setCachedResponse: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCachedResponse"]
};
function streamTokensSaved(streamUsage) {
    const u = streamUsage;
    return (Number(u?.prompt_tokens ?? 0) || 0) + (Number(u?.completion_tokens ?? 0) || 0);
}
function writeStreamingCacheEntry(args, deps) {
    try {
        const cleanBody = {
            ...args.streamResponseBody
        };
        delete cleanBody._streamed;
        if (!deps.isSmallEnoughForSemanticCache(cleanBody)) return;
        const sig = deps.generateSignature(args.model, args.body.messages ?? args.body.input, args.body.temperature, args.body.top_p, args.apiKeyId ?? undefined);
        const tokensSaved = streamTokensSaved(args.streamUsage);
        deps.setCachedResponse(sig, args.model, cleanBody, tokensSaved);
        args.log?.debug?.("CACHE", `Stored streaming response for ${args.model} (${tokensSaved} tokens)`);
    } catch  {
    // Cache write failed — non-critical
    }
}
function storeStreamingSemanticCacheResponse(args, deps = DEFAULT_DEPS) {
    if (!args.enabled || args.streamStatus !== 200 || !args.streamResponseBody || !deps.isCacheableForWrite(args.body, args.headers)) {
        return;
    }
    writeStreamingCacheEntry(args, deps);
}
}),
"[project]/open-sse/handlers/chatCore/streamingPipeline.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "assembleStreamingPipeline",
    ()=>assembleStreamingPipeline
]);
/**
 * chatCore streaming response pipeline assembly (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's streaming success path: chain the response transforms onto the
 * provider stream — disconnect-aware pipe → PII sanitization (explicit transform or feature-flagged
 * SSE transform) → optional progress tracking (Phase 9.3) → SSE heartbeat → optional model-echo
 * (#1311). Returns the assembled `finalStream`; mutates the passed `responseHeaders` to add the
 * progress marker when progress is enabled. Behaviour is byte-identical to the previous inline
 * block, including the exact transform order and branch conditions.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sseHeartbeat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/sseHeartbeat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responseModelEcho$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/responseModelEcho.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$progressTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/progressTracker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$streamingPiiTransform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/streamingPiiTransform.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
/**
 * Pipeline assembly instrumentation — performance.mark() along the SSE hot path.
 * Marks are visible to Node.js perf_hooks consumers and DevTools' Performance
 * panel when NODE_OPTIONS=--enable-node-performance-clinician or similar.
 *
 * Each call to assembleStreamingPipeline creates one measure record:
 *   "omni-pipeline" — wall-clock duration of the full transform chain assembly.
 */ const PIPELINE_START = "omni-pipeline-start";
const PIPELINE_END = "omni-pipeline-end";
const PIPELINE_MEASURE = "omni-pipeline";
const DEFAULT_DEPS = {
    wantsProgress: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$progressTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wantsProgress"],
    pipeWithDisconnect: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pipeWithDisconnect"],
    isFeatureFlagEnabled: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"],
    createPiiSseTransform: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$streamingPiiTransform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createPiiSseTransform"],
    createProgressTransform: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$progressTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createProgressTransform"],
    createSseHeartbeatTransform: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sseHeartbeat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createSseHeartbeatTransform"],
    shapeForClientFormat: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sseHeartbeat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shapeForClientFormat"],
    createModelEchoTransform: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responseModelEcho$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createModelEchoTransform"]
};
function assembleStreamingPipeline(args, deps = DEFAULT_DEPS) {
    performance.clearMarks(PIPELINE_START);
    performance.clearMarks(PIPELINE_END);
    performance.clearMeasures(PIPELINE_MEASURE);
    performance.mark(PIPELINE_START);
    // ── Phase 9.3: Progress tracking (opt-in) ──
    const progressEnabled = deps.wantsProgress(args.clientRawRequestHeaders);
    let finalStream;
    let piiStream = deps.pipeWithDisconnect(args.providerResponse, args.transformStream, args.streamController);
    if (typeof args.createPiiTransform === "function") {
        piiStream = piiStream.pipeThrough(args.createPiiTransform());
    } else if (deps.isFeatureFlagEnabled("PII_RESPONSE_SANITIZATION")) {
        piiStream = piiStream.pipeThrough(deps.createPiiSseTransform());
    }
    if (progressEnabled) {
        const progressTransform = deps.createProgressTransform({
            signal: args.streamController.signal
        });
        // Chain: provider → transform → progress → client
        finalStream = piiStream.pipeThrough(progressTransform);
        args.responseHeaders[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].progress] = "enabled";
    } else {
        finalStream = piiStream;
    }
    finalStream = finalStream.pipeThrough(deps.createSseHeartbeatTransform({
        signal: args.streamController.signal,
        intervalMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSE_HEARTBEAT_INTERVAL_MS"],
        shape: deps.shapeForClientFormat(args.clientResponseFormat)
    }));
    // #1311: echo the requested alias/combo name in each streamed SSE chunk's model field.
    if (args.echoModel) {
        finalStream = finalStream.pipeThrough(deps.createModelEchoTransform(args.echoModel));
    }
    performance.mark(PIPELINE_END);
    performance.measure(PIPELINE_MEASURE, PIPELINE_START, PIPELINE_END);
    return finalStream;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/sanitization.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeChatRequestBody",
    ()=>sanitizeChatRequestBody
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolSchemaSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/toolSchemaSanitizer.ts [instrumentation] (ecmascript)");
;
;
function sanitizeChatRequestBody(body, sourceFormat, targetFormat) {
    const prefersResponsesTokenField = sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
    if (prefersResponsesTokenField) {
        if (body.max_output_tokens === undefined) {
            if (body.max_completion_tokens !== undefined) {
                body.max_output_tokens = body.max_completion_tokens;
                delete body.max_completion_tokens;
            } else if (body.max_tokens !== undefined) {
                body.max_output_tokens = body.max_tokens;
                delete body.max_tokens;
            }
        }
    } else if (body.max_output_tokens !== undefined) {
        if (body.max_tokens === undefined) {
            body.max_tokens = body.max_output_tokens;
        }
        delete body.max_output_tokens;
    }
    if (Array.isArray(body.messages)) {
        body.messages = body.messages.map((msg)=>{
            if (msg.name === "") {
                const { name: _n, ...rest } = msg;
                return rest;
            }
            return msg;
        });
    }
    if (Array.isArray(body.input)) {
        body.input = body.input.map((item)=>{
            if (item.name === "") {
                const { name: _n, ...rest } = item;
                return rest;
            }
            return item;
        });
    }
    if (Array.isArray(body.tools)) {
        body.tools = body.tools.filter((tool)=>{
            const toolType = typeof tool.type === "string" ? tool.type : "";
            if (toolType && toolType !== "function" && !tool.function && tool.name === undefined) {
                return true;
            }
            const fn = tool.function;
            const name = fn?.name ?? tool.name;
            return name && String(name).trim().length > 0;
        });
        body.tools = body.tools.map((tool)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolSchemaSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeOpenAITool"])(tool));
    }
    return body;
}
}),
"[project]/open-sse/handlers/chatCore/headers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getHeaderValueCaseInsensitive",
    ()=>getHeaderValueCaseInsensitive,
    "isNoMemoryRequested",
    ()=>isNoMemoryRequested,
    "isStripReasoningRequested",
    ()=>isStripReasoningRequested,
    "resolveCompressionHeader",
    ()=>resolveCompressionHeader
]);
function getHeaderValueCaseInsensitive(headers, targetName) {
    if (!headers || typeof headers !== "object") return null;
    if (headers instanceof Headers) {
        return headers.get(targetName);
    }
    const lowered = targetName.toLowerCase();
    for (const [key, value] of Object.entries(headers)){
        if (key.toLowerCase() === lowered && typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return null;
}
function isNoMemoryRequested(headers) {
    const value = (getHeaderValueCaseInsensitive(headers, "x-omniroute-no-memory") || "").trim().toLowerCase();
    return value === "true" || value === "1" || value === "yes";
}
function resolveCompressionHeader(headers) {
    const value = (getHeaderValueCaseInsensitive(headers, "x-omniroute-compression") || "").trim();
    return value || null;
}
function isStripReasoningRequested(headers) {
    const value = (getHeaderValueCaseInsensitive(headers, "x-omniroute-strip-reasoning") || "").trim().toLowerCase();
    return value === "true" || value === "1" || value === "yes";
}
}),
"[project]/open-sse/handlers/chatCore/codexFailover.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "markCodexScopeRateLimited",
    ()=>markCodexScopeRateLimited
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function asProviderData(value) {
    return value && typeof value === "object" ? value : {};
}
async function markCodexScopeRateLimited(params) {
    const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(params.failedConnectionId).catch(()=>null);
    const existingProviderData = connection ? asProviderData(connection.providerSpecificData) : asProviderData(params.credentials?.providerSpecificData);
    const existingScopeMap = asProviderData(existingProviderData.codexScopeRateLimitedUntil);
    const nextProviderData = {
        ...existingProviderData,
        codexScopeRateLimitedUntil: {
            ...existingScopeMap,
            [(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(params.model || "")]: params.rateLimitedUntil
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(params.failedConnectionId, {
        ...connection ? {
            providerSpecificData: nextProviderData
        } : {},
        lastError: "429 rate limited — codex account rotation",
        errorCode: 429
    }).catch(()=>{});
    if (params.credentials && String(params.credentials.connectionId) === params.failedConnectionId) {
        params.credentials.providerSpecificData = nextProviderData;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/comboContextCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearCombosCache",
    ()=>clearCombosCache,
    "clearUpstreamProxyConfigCache",
    ()=>clearUpstreamProxyConfigCache,
    "getCombosCached",
    ()=>getCombosCached,
    "getUpstreamProxyConfigCached",
    ()=>getUpstreamProxyConfigCached
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$upstreamProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/upstreamProxy.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const _proxyConfigCache = new Map();
const PROXY_CONFIG_CACHE_TTL = 10_000;
/**
 * Module-level cache for all combos data (shared across all requests).
 * Uses cached promises to prevent thundering herd — all concurrent callers
 * wait for the same underlying DB query while it's in flight.
 */ let _combosPromise = null;
let _combosCacheTs = 0;
let _combosCacheVersionSnapshot = -1;
const COMBOS_CACHE_TTL = 10_000;
async function getCombosCached() {
    const now = Date.now();
    const { getCombos, getCombosCacheVersion } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
    const version = getCombosCacheVersion();
    // A combo write (create/update/delete/reorder) bumps the shared version via
    // invalidateDbCache("combos"); when it no longer matches our snapshot we drop
    // the cached promise so the nested-combo expansion stops serving removed
    // targets/models within the 10s TTL window (#3147).
    if (version !== _combosCacheVersionSnapshot) {
        clearCombosCache();
    }
    if (_combosPromise && now - _combosCacheTs < COMBOS_CACHE_TTL) {
        return _combosPromise;
    }
    _combosCacheTs = now;
    _combosCacheVersionSnapshot = version;
    _combosPromise = getCombos();
    return _combosPromise;
}
function clearCombosCache() {
    _combosPromise = null;
    _combosCacheTs = 0;
    _combosCacheVersionSnapshot = -1;
}
function clearUpstreamProxyConfigCache(providerId) {
    if (providerId) {
        _proxyConfigCache.delete(providerId);
        return;
    }
    _proxyConfigCache.clear();
}
async function getUpstreamProxyConfigCached(providerId) {
    const cached = _proxyConfigCache.get(providerId);
    if (cached && Date.now() - cached.ts < PROXY_CONFIG_CACHE_TTL) return cached;
    const cfg = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$upstreamProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUpstreamProxyConfig"])(providerId).catch(()=>null);
    const result = cfg ? {
        mode: cfg.mode,
        enabled: cfg.enabled,
        cliproxyapiModelMapping: cfg.cliproxyapiModelMapping ?? null,
        fallbackBackend: cfg.fallbackBackend,
        ts: Date.now()
    } : {
        mode: "native",
        enabled: false,
        cliproxyapiModelMapping: null,
        fallbackBackend: "cliproxyapi",
        ts: Date.now()
    };
    _proxyConfigCache.set(providerId, result);
    return result;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/executorHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildClaudePromptCacheLogMeta",
    ()=>buildClaudePromptCacheLogMeta,
    "resolveAccountSemaphoreAccountKey",
    ()=>resolveAccountSemaphoreAccountKey,
    "resolveAccountSemaphoreKey",
    ()=>resolveAccountSemaphoreKey,
    "resolveAccountSemaphoreMaxConcurrency",
    ()=>resolveAccountSemaphoreMaxConcurrency
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountSemaphore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/headers.ts [instrumentation] (ecmascript)");
;
;
;
function toFiniteNumberOrNull(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
function resolveAccountSemaphoreAccountKey(connectionId, credentials) {
    if (typeof connectionId === "string" && connectionId.trim().length > 0) {
        return connectionId;
    }
    const candidateKeys = [
        credentials?.connectionId,
        credentials?.id,
        credentials?.email,
        credentials?.name,
        credentials?.displayName
    ];
    for (const candidate of candidateKeys){
        if (typeof candidate === "string" && candidate.trim().length > 0) {
            return candidate.trim();
        }
    }
    return null;
}
function resolveAccountSemaphoreMaxConcurrency(credentials) {
    return toFiniteNumberOrNull(credentials?.maxConcurrent);
}
function resolveAccountSemaphoreKey({ provider, model, connectionId, credentials }) {
    const accountKey = resolveAccountSemaphoreAccountKey(connectionId, credentials);
    if (!accountKey || !provider) return null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAccountSemaphoreKey"])({
        provider,
        accountKey
    });
}
function buildClaudePromptCacheLogMeta(targetFormat, finalBody, providerHeaders, clientHeaders) {
    if (targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE || !finalBody || typeof finalBody !== "object") return null;
    const describeCacheControl = (cacheControl, extra = {})=>({
            type: cacheControl && typeof cacheControl.type === "string" && cacheControl.type.trim() ? cacheControl.type.trim() : "ephemeral",
            ttl: cacheControl && typeof cacheControl.ttl === "string" && cacheControl.ttl.trim() ? cacheControl.ttl.trim() : null,
            ...extra
        });
    const systemBreakpoints = Array.isArray(finalBody.system) ? finalBody.system.flatMap((block, index)=>{
        if (!block || typeof block !== "object") return [];
        const text = typeof block.text === "string" && block.text.trim().length > 0 ? block.text.trim() : "";
        if (text.startsWith("x-anthropic-billing-header:")) {
            return [];
        }
        const cacheControl = block.cache_control && typeof block.cache_control === "object" ? block.cache_control : null;
        return cacheControl ? [
            describeCacheControl(cacheControl, {
                index
            })
        ] : [];
    }) : [];
    const toolBreakpoints = Array.isArray(finalBody.tools) ? finalBody.tools.flatMap((tool, index)=>{
        if (!tool || typeof tool !== "object") return [];
        const cacheControl = tool.cache_control && typeof tool.cache_control === "object" ? tool.cache_control : null;
        const name = typeof tool.name === "string" && tool.name.trim() ? tool.name.trim() : null;
        return cacheControl ? [
            describeCacheControl(cacheControl, {
                index,
                name
            })
        ] : [];
    }) : [];
    const messageBreakpoints = Array.isArray(finalBody.messages) ? finalBody.messages.flatMap((message, messageIndex)=>{
        if (!message || typeof message !== "object" || !Array.isArray(message.content)) return [];
        const role = typeof message.role === "string" && message.role.trim() ? message.role.trim() : "unknown";
        return message.content.flatMap((block, contentIndex)=>{
            if (!block || typeof block !== "object") return [];
            const cacheControl = block.cache_control && typeof block.cache_control === "object" ? block.cache_control : null;
            if (!cacheControl) return [];
            return [
                describeCacheControl(cacheControl, {
                    messageIndex,
                    contentIndex,
                    role,
                    blockType: typeof block.type === "string" && block.type.trim() ? block.type.trim() : "unknown"
                })
            ];
        });
    }) : [];
    const totalBreakpoints = systemBreakpoints.length + toolBreakpoints.length + messageBreakpoints.length;
    let anthropicBeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(providerHeaders, "Anthropic-Beta");
    if (!anthropicBeta) {
        anthropicBeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(clientHeaders, "Anthropic-Beta");
    }
    if (totalBreakpoints === 0 && !anthropicBeta) return null;
    return {
        applied: totalBreakpoints > 0,
        totalBreakpoints,
        anthropicBeta,
        systemBreakpoints,
        toolBreakpoints,
        messageBreakpoints
    };
}
}),
"[project]/open-sse/handlers/chatCore/passthroughHelpers.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XAI_API_PROVIDERS",
    ()=>XAI_API_PROVIDERS,
    "executeWithAnthropicThinkingSignatureRecovery",
    ()=>executeWithAnthropicThinkingSignatureRecovery,
    "isAnthropicThinkingSignatureError",
    ()=>isAnthropicThinkingSignatureError,
    "isClaudeCodeSemanticPassthroughRequest",
    ()=>isClaudeCodeSemanticPassthroughRequest,
    "redactPassthroughThinkingSignatures",
    ()=>redactPassthroughThinkingSignatures,
    "shouldUseNativeCodexPassthrough",
    ()=>shouldUseNativeCodexPassthrough,
    "shouldUseNativeXaiResponsesPassthrough",
    ()=>shouldUseNativeXaiResponsesPassthrough,
    "stampNativeResponsesPassthroughBody",
    ()=>stampNativeResponsesPassthroughBody,
    "stripHistoricalThinkingForSignatureRecovery",
    ()=>stripHistoricalThinkingForSignatureRecovery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesEndpoint$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesEndpoint.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/headers.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const XAI_API_PROVIDERS = new Set([
    "xai",
    "xai-oauth",
    "xao"
]);
function shouldUseNativeCodexPassthrough({ provider, sourceFormat, endpointPath }) {
    if (provider !== "codex") return false;
    if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesEndpoint$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isResponsesEndpointPath"])(endpointPath);
}
function shouldUseNativeXaiResponsesPassthrough({ provider, sourceFormat, endpointPath }) {
    if (!provider || !XAI_API_PROVIDERS.has(provider)) return false;
    if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesEndpoint$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isResponsesEndpointPath"])(endpointPath);
}
function stampNativeResponsesPassthroughBody(body, mode) {
    if (mode === "codex") return {
        ...body,
        _nativeCodexPassthrough: true
    };
    return {
        ...body,
        _nativeXaiResponsesPassthrough: true
    };
}
function redactPassthroughThinkingSignatures(messages, _signature) {
    return messages;
}
function isThinkingBlock(block) {
    if (!block || typeof block !== "object") return false;
    const type = block.type;
    return type === "thinking" || type === "redacted_thinking";
}
function hasBlock(message, type) {
    return !!message && Array.isArray(message.content) && message.content.some((block)=>!!block && typeof block === "object" && block.type === type);
}
function isAnthropicThinkingSignatureError({ provider, status, message }) {
    const isAnthropicTarget = provider === "claude" || typeof provider === "string" && provider.startsWith("anthropic-compatible-");
    if (!isAnthropicTarget || status !== 400 || typeof message !== "string") return false;
    return /invalid\s+[`'\"]?signature[`'\"]?\s+in\s+[`'\"]?thinking[`'\"]?\s+block/i.test(message);
}
function stripHistoricalThinkingForSignatureRecovery(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const record = body;
    if (!Array.isArray(record.messages)) return body;
    const messages = record.messages;
    const protectedAssistantIndexes = new Set();
    let cursor = messages.length - 1;
    // Some internal callers can resume from an unresolved assistant tool_use.
    if (cursor >= 0 && messages[cursor]?.role === "assistant" && hasBlock(messages[cursor], "tool_use")) {
        protectedAssistantIndexes.add(cursor);
        cursor -= 1;
    }
    // Walk the complete trailing tool-result chain. Interleaved thinking can span
    // several assistant/tool_result pairs, so protecting only the latest assistant
    // message is insufficient.
    while(cursor >= 0 && messages[cursor]?.role === "user" && hasBlock(messages[cursor], "tool_result")){
        cursor -= 1;
        while(cursor >= 0 && messages[cursor]?.role !== "assistant")cursor -= 1;
        if (cursor < 0 || !hasBlock(messages[cursor], "tool_use")) break;
        protectedAssistantIndexes.add(cursor);
        cursor -= 1;
    }
    let changed = false;
    const recoveredMessages = messages.map((message, index)=>{
        if (!message || message.role !== "assistant" || !Array.isArray(message.content) || protectedAssistantIndexes.has(index)) {
            return message;
        }
        const content = message.content.filter((block)=>!isThinkingBlock(block));
        if (content.length === message.content.length) return message;
        changed = true;
        return {
            ...message,
            content
        };
    });
    if (!changed) return body;
    return {
        ...record,
        messages: recoveredMessages
    };
}
async function executeWithAnthropicThinkingSignatureRecovery(args) {
    const first = await args.execute(args.body);
    const failure = await args.getError(first);
    if (!failure || !isAnthropicThinkingSignatureError({
        provider: args.provider,
        status: failure.status,
        message: failure.message
    })) {
        return {
            result: first,
            retried: false,
            recoveryBody: null
        };
    }
    const recoveryBody = stripHistoricalThinkingForSignatureRecovery(args.body);
    if (recoveryBody === args.body) {
        return {
            result: first,
            retried: false,
            recoveryBody: null
        };
    }
    return {
        result: await args.execute(recoveryBody),
        retried: true,
        recoveryBody
    };
}
function isClaudeCodeSemanticPassthroughRequest({ provider, sourceFormat, targetFormat, headers, userAgent }) {
    const isDirectClaudeCodeProvider = provider === "claude" || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(provider);
    if (!isDirectClaudeCodeProvider) return false;
    if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) return false;
    if (targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) return false;
    const headerUserAgent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(headers, "user-agent");
    const ua = `${userAgent || ""} ${headerUserAgent || ""}`.toLowerCase();
    if (ua.includes("claude-code") || ua.includes("claude-cli")) return true;
    const appHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(headers, "x-app");
    if (typeof appHeader === "string" && appHeader.trim().toLowerCase() === "cli") return true;
    const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(headers, "x-claude-code-session-id");
    return typeof sessionId === "string" && sessionId.trim().length > 0;
}
}),
"[project]/open-sse/handlers/chatCore/thinkingSignatureRecovery.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recoverAnthropicThinkingSignature",
    ()=>recoverAnthropicThinkingSignature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/passthroughHelpers.ts [instrumentation] (ecmascript) <locals>");
;
async function recoverAnthropicThinkingSignature(args) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicThinkingSignatureError"])({
        provider: args.provider,
        status: args.statusCode,
        message: args.message
    })) {
        return {
            attempted: false,
            succeeded: false,
            execution: null,
            error: null,
            recoveryBody: null
        };
    }
    const firstFailure = {
        response: new Response(null, {
            status: args.statusCode
        }),
        status: args.statusCode,
        message: args.message
    };
    const recovery = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["executeWithAnthropicThinkingSignatureRecovery"])({
        provider: args.provider,
        body: args.body,
        execute: async (requestBody)=>{
            if (requestBody === args.body) return firstFailure;
            return args.execute(requestBody);
        },
        getError: async (result)=>{
            if (result === firstFailure) {
                return {
                    status: firstFailure.status,
                    message: firstFailure.message
                };
            }
            if (result.response.ok) return null;
            const details = await args.parseError(result.response.clone());
            return {
                status: details.statusCode,
                message: details.message
            };
        }
    });
    if (!recovery.retried) {
        return {
            attempted: false,
            succeeded: false,
            execution: null,
            error: null,
            recoveryBody: null
        };
    }
    const execution = recovery.result;
    return {
        attempted: true,
        succeeded: execution.response.ok,
        execution,
        error: execution.response.ok ? null : await args.parseError(execution.response),
        recoveryBody: recovery.recoveryBody
    };
}
}),
"[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeBillableTokens",
    ()=>computeBillableTokens,
    "createAbortError",
    ()=>createAbortError,
    "createBodyTimeoutError",
    ()=>createBodyTimeoutError,
    "createUpstreamStartTimeoutError",
    ()=>createUpstreamStartTimeoutError,
    "executeWithUpstreamStartTimeout",
    ()=>executeWithUpstreamStartTimeout,
    "getExecutorTimeoutMs",
    ()=>getExecutorTimeoutMs,
    "normalizeExecutorResult",
    ()=>normalizeExecutorResult,
    "readStreamChunkWithTimeout",
    ()=>readStreamChunkWithTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)");
;
;
;
function createBodyTimeoutError(timeoutMs) {
    const err = new Error(`Response body read timeout after ${timeoutMs}ms`);
    err.name = "BodyTimeoutError";
    return err;
}
function readStreamChunkWithTimeout(reader, timeoutMs) {
    if (timeoutMs <= 0) return reader.read();
    return new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>reject(createBodyTimeoutError(timeoutMs)), timeoutMs);
        reader.read().then((value)=>{
            clearTimeout(timeout);
            resolve(value);
        }, (error)=>{
            clearTimeout(timeout);
            reject(error);
        });
    });
}
function createUpstreamStartTimeoutError(timeoutMs, provider, model) {
    const err = new Error(`Upstream request did not return response headers after ${timeoutMs}ms (${provider}/${model})`);
    err.name = "TimeoutError";
    return err;
}
function createAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function computeBillableTokens(usage) {
    // Cache read/creation tokens are a BREAKDOWN already contained inside
    // getLoggedInputTokens (prompt_tokens / input_tokens). Adding them here would
    // double-count. Canonical billable total = input + output + reasoning, matching
    // the columns persisted by saveRequestUsage and seedWindowUsageFromHistory.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningTokens"])(usage);
}
/** Resolves the model-level `timeoutMs` registry override, when both
 *  `provider` and `model` are known and the model registers one (#6354). */ function resolveModelTimeoutOverride(provider, model) {
    if (!provider || !model) return undefined;
    const override = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelTimeoutMs"])(provider, model);
    if (typeof override !== "number" || !Number.isFinite(override)) return undefined;
    return Math.max(0, Math.floor(override));
}
function resolveProviderTimeoutMs(executor) {
    const getTimeoutMs = executor?.getTimeoutMs;
    if (typeof getTimeoutMs !== "function") return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    try {
        const timeoutMs = getTimeoutMs.call(executor);
        if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        return Math.max(0, Math.floor(timeoutMs));
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    }
}
function getExecutorTimeoutMs(executor, provider, model) {
    const modelOverride = resolveModelTimeoutOverride(provider, model);
    if (modelOverride !== undefined) return modelOverride;
    return resolveProviderTimeoutMs(executor);
}
function normalizeExecutorResult(result) {
    if (result instanceof Response) {
        return {
            response: result,
            url: "",
            headers: {},
            transformedBody: null
        };
    }
    return {
        response: result.response,
        url: result.url || "",
        headers: result.headers || {},
        transformedBody: result.transformedBody ?? null,
        transport: result.transport
    };
}
async function executeWithUpstreamStartTimeout({ executor, provider, model, signal, log, execute }) {
    const timeoutMs = getExecutorTimeoutMs(executor, provider, model);
    if (timeoutMs <= 0) return execute(signal);
    if (signal.aborted) throw createAbortError(signal);
    const timeoutController = new AbortController();
    const combinedController = new AbortController();
    const timeoutError = createUpstreamStartTimeoutError(timeoutMs, provider, model);
    let timeoutId = null;
    let abortListener = null;
    let timeoutAbortListener = null;
    const abortCombined = (source)=>{
        if (combinedController.signal.aborted) return;
        const reason = source.reason instanceof Error ? source.reason : createAbortError(source);
        combinedController.abort(reason);
    };
    abortListener = ()=>abortCombined(signal);
    timeoutAbortListener = ()=>abortCombined(timeoutController.signal);
    signal.addEventListener("abort", abortListener, {
        once: true
    });
    timeoutController.signal.addEventListener("abort", timeoutAbortListener, {
        once: true
    });
    const timeoutPromise = new Promise((_, reject)=>{
        timeoutId = setTimeout(()=>{
            log?.warn?.("TIMEOUT", timeoutError.message);
            timeoutController.abort(timeoutError);
            reject(timeoutError);
        }, timeoutMs);
    });
    const abortPromise = new Promise((_, reject)=>{
        signal.addEventListener("abort", ()=>reject(createAbortError(signal)), {
            once: true
        });
    });
    try {
        return await Promise.race([
            execute(combinedController.signal),
            timeoutPromise,
            abortPromise
        ]);
    } finally{
        if (timeoutId) clearTimeout(timeoutId);
        if (abortListener) signal.removeEventListener("abort", abortListener);
        if (timeoutAbortListener) {
            timeoutController.signal.removeEventListener("abort", timeoutAbortListener);
        }
    }
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
"[project]/open-sse/handlers/chatCore/telemetryHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__resetLiveWsForwardingState",
    ()=>__resetLiveWsForwardingState,
    "forwardDashboardEventToLiveWs",
    ()=>forwardDashboardEventToLiveWs,
    "maybeSyncClaudeExtraUsageState",
    ()=>maybeSyncClaudeExtraUsageState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/providerLimits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeExtraUsage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/claudeExtraUsage.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// #4604 — Lazy backoff for the best-effort live-WS sidecar bridge. In single-port
// deployments the sidecar (port 20132) is not running, so every compression event
// POST failed with ECONNREFUSED; because the global fetch is proxyFetch, each
// failure logged a "[ProxyFetch] Undici dispatcher failed" warning (272× in 42min).
// After a few consecutive failures we stop attempting for a cooldown window (then
// probe once), mirroring the project's lazy circuit-breaker recovery. A success
// clears the backoff so a sidecar that comes up later is picked back up.
const LIVE_WS_MAX_CONSECUTIVE_FAILURES = 3;
const LIVE_WS_DISABLE_MS = 60_000;
let liveWsConsecutiveFailures = 0;
let liveWsDisabledUntil = 0;
function __resetLiveWsForwardingState() {
    liveWsConsecutiveFailures = 0;
    liveWsDisabledUntil = 0;
}
async function forwardDashboardEventToLiveWs(event, payload, fetchImpl = fetch, now = Date.now) {
    // Skip while the bridge is in a cooldown window after repeated failures.
    if (liveWsDisabledUntil > now()) return;
    const port = process.env.LIVE_WS_PORT || "20132";
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 1_500);
    try {
        await fetchImpl(`http://127.0.0.1:${port}/__omniroute_event`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                event,
                payload,
                timestamp: now()
            }),
            signal: controller.signal
        });
        // Success → the sidecar is reachable; clear any accumulated backoff.
        liveWsConsecutiveFailures = 0;
        liveWsDisabledUntil = 0;
    } catch  {
        // Best-effort sidecar bridge; do not affect the chat hot path. Trip the
        // cooldown once failures pile up so a missing sidecar stops spamming logs.
        liveWsConsecutiveFailures += 1;
        if (liveWsConsecutiveFailures >= LIVE_WS_MAX_CONSECUTIVE_FAILURES) {
            liveWsDisabledUntil = now() + LIVE_WS_DISABLE_MS;
            liveWsConsecutiveFailures = 0;
        }
    } finally{
        clearTimeout(timeout);
    }
}
async function maybeSyncClaudeExtraUsageState({ provider, connectionId, providerSpecificData, log }) {
    if (!connectionId || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeExtraUsage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isClaudeExtraUsageBlockEnabled"])(provider, providerSpecificData)) {
        return;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchLiveProviderLimits"])(connectionId);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log?.debug?.("CLAUDE_USAGE", `Failed to sync Claude extra-usage state: ${message}`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/logTruncation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MEMORY_EXTRACTION_TEXT_LIMIT",
    ()=>MEMORY_EXTRACTION_TEXT_LIMIT,
    "capMemoryExtractionText",
    ()=>capMemoryExtractionText,
    "cloneBoundedChatLogPayload",
    ()=>cloneBoundedChatLogPayload,
    "truncateChatLogText",
    ()=>truncateChatLogText,
    "truncateForLog",
    ()=>truncateForLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/estimateSize.ts [instrumentation] (ecmascript)");
;
;
const MEMORY_EXTRACTION_TEXT_LIMIT = 64 * 1024;
const MAX_LOG_BODY_CHARS = 8 * 1024; // 8KB cap for logged request/response bodies
function capMemoryExtractionText(value) {
    if (value.length <= MEMORY_EXTRACTION_TEXT_LIMIT) return value;
    return value.slice(-MEMORY_EXTRACTION_TEXT_LIMIT);
}
function truncateChatLogText(value) {
    const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatLogTextLimit"])();
    if (value.length <= limit) return value;
    const head = value.slice(0, Math.floor(limit / 2));
    const tail = value.slice(-Math.ceil(limit / 2));
    return `${head}\n[...truncated ${value.length - limit} chars...]\n${tail}`;
}
function cloneBoundedChatLogPayload(value, depth = 0) {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") return truncateChatLogText(value);
    if (typeof value !== "object") return value;
    if (depth >= (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatLogMaxDepth"])()) return "[MaxDepth]";
    const maxTailItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatLogArrayTailItems"])();
    if (Array.isArray(value)) {
        const retained = value.length > maxTailItems ? value.slice(-maxTailItems) : value;
        const cloned = retained.map((item)=>cloneBoundedChatLogPayload(item, depth + 1));
        if (value.length > maxTailItems) {
            return [
                {
                    _omniroute_truncated_array: true,
                    originalLength: value.length,
                    retainedTailItems: maxTailItems
                },
                ...cloned
            ];
        }
        return cloned;
    }
    const result = {};
    const entries = Object.entries(value);
    const maxKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatLogMaxObjectKeys"])();
    for (const [key, item] of maxKeys > 0 ? entries.slice(0, maxKeys) : entries){
        result[key] = cloneBoundedChatLogPayload(item, depth + 1);
    }
    if (maxKeys > 0 && entries.length > maxKeys) {
        result._omniroute_truncated_keys = entries.length - maxKeys;
    }
    return result;
}
function truncateForLog(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== "object") return value;
    const estimatedSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateSizeFast"])(value);
    if (estimatedSize <= MAX_LOG_BODY_CHARS) return value;
    // Object is too large — return a summary instead of a deep clone
    const obj = value;
    const summary = {
        _truncated: true,
        _originalBytes: estimatedSize
    };
    if (typeof obj.model === "string") summary.model = obj.model;
    if (typeof obj.provider === "string") summary.provider = obj.provider;
    if (Array.isArray(obj.messages)) summary.messageCount = obj.messages.length;
    if (Array.isArray(obj.contents)) summary.contentCount = obj.contents.length;
    if (typeof obj.stream === "boolean") summary.stream = obj.stream;
    if (Array.isArray(obj.tools)) summary.tools = cloneBoundedChatLogPayload(obj.tools);
    return summary;
}
}),
"[project]/open-sse/handlers/chatCore/memoryExtraction.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractMemoryTextFromRequestBody",
    ()=>extractMemoryTextFromRequestBody,
    "extractMemoryTextFromResponse",
    ()=>extractMemoryTextFromResponse,
    "resolveMemoryOwnerId",
    ()=>resolveMemoryOwnerId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/logTruncation.ts [instrumentation] (ecmascript)");
;
function extractMemoryTextFromResponse(response) {
    if (!response || typeof response !== "object") return "";
    const openAIText = response?.choices?.[0]?.message?.content;
    if (typeof openAIText === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(openAIText.trim());
    }
    if (Array.isArray(response?.content)) {
        const contentText = response.content.filter((part)=>part?.type === "text" && typeof part?.text === "string").map((part)=>String(part.text).trim()).filter(Boolean).join("\n");
        if (contentText) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(contentText);
    }
    if (typeof response?.output_text === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(response.output_text.trim());
    }
    return "";
}
function extractMemoryTextFromRequestBody(body) {
    if (!body || typeof body !== "object") return "";
    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (messages && messages.length > 0) {
        for(let i = messages.length - 1; i >= 0; i -= 1){
            const msg = messages[i];
            if (msg?.role !== "user") continue;
            if (typeof msg.content === "string" && msg.content.trim().length > 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(msg.content.trim());
            }
            if (Array.isArray(msg.content)) {
                const text = msg.content.map((part)=>{
                    if (typeof part?.text === "string") return part.text.trim();
                    if (part?.type === "input_text" && typeof part?.text === "string") return part.text.trim();
                    return "";
                }).filter(Boolean).join("\n").trim();
                if (text) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(text);
            }
        }
    }
    const input = Array.isArray(body.input) ? body.input : null;
    if (input && input.length > 0) {
        for(let i = input.length - 1; i >= 0; i -= 1){
            const item = input[i];
            const role = typeof item?.role === "string" ? item.role.trim().toLowerCase() : "";
            const itemType = typeof item?.type === "string" ? item.type.trim().toLowerCase() : "";
            if (role && role !== "user") continue;
            if (itemType && itemType !== "message") continue;
            if (typeof item?.content === "string" && item.content.trim()) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(item.content.trim());
            }
            if (Array.isArray(item?.content)) {
                const text = item.content.map((part)=>{
                    if (typeof part?.text === "string") return part.text.trim();
                    if (part?.type === "input_text" && typeof part?.text === "string") return part.text.trim();
                    return "";
                }).filter(Boolean).join("\n").trim();
                if (text) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(text);
            }
        }
        const tailChunks = [];
        let tailLength = 0;
        for(let i = input.length - 1; i >= 0 && tailLength < __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MEMORY_EXTRACTION_TEXT_LIMIT"]; i -= 1){
            const item = input[i];
            const text = (()=>{
                const role = typeof item?.role === "string" ? item.role.trim().toLowerCase() : "";
                const itemType = typeof item?.type === "string" ? item.type.trim().toLowerCase() : "";
                if (role && role !== "user") return "";
                if (itemType && itemType !== "message") return "";
                if (typeof item?.content === "string") return item.content.trim();
                if (Array.isArray(item?.content)) {
                    return item.content.map((part)=>{
                        if (typeof part?.text === "string") return part.text.trim();
                        if (part?.type === "input_text" && typeof part?.text === "string") return part.text.trim();
                        return "";
                    }).filter(Boolean).join("\n").trim();
                }
                return "";
            })();
            if (!text) continue;
            tailChunks.unshift(text);
            tailLength += text.length + 1;
        }
        const chunks = tailChunks.join("\n").trim();
        if (chunks) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMemoryExtractionText"])(chunks);
    }
    return "";
}
function resolveMemoryOwnerId(apiKeyInfo) {
    const rawId = apiKeyInfo?.id;
    if (typeof rawId === "string" && rawId.trim().length > 0) {
        return rawId;
    }
    return null;
}
}),
"[project]/open-sse/handlers/chatCore/requestFormat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveChatCoreRequestFormat",
    ()=>resolveChatCoreRequestFormat
]);
/**
 * chatCore request endpoint/format resolvers (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure slice of handleChatCore's request-setup phase: derives the wire-format facts of an inbound
 * request from its endpoint, body, provider, and user-agent — the source format, whether it targets
 * the Responses endpoint, native-Codex passthrough eligibility, Droid CLI / Copilot detection, and
 * the effective client response format (an OpenAI Responses shape off a non-/responses, non-Droid
 * endpoint collapses back to plain OpenAI). Side-effect-free; behaviour is byte-identical to the
 * previous inline block. Sits alongside resolveChatCoreRequestSetup as the request-setup phase grows.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/passthroughHelpers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
;
/** True when the request originates from a Copilot client (matched by user-agent or any header). */ function isCopilotClient(headers, userAgent) {
    const isMatch = (value)=>typeof value === "string" && value.toLowerCase().includes("copilot");
    if (isMatch(userAgent)) return true;
    if (headers instanceof Headers) {
        for (const [key, value] of headers){
            if (isMatch(key) || isMatch(value)) return true;
        }
    } else if (headers && typeof headers === "object") {
        for (const [key, value] of Object.entries(headers)){
            if (isMatch(key) || isMatch(value)) return true;
        }
    }
    return false;
}
function isOpencodeClient(headers, userAgent) {
    const matchesUserAgent = (value)=>typeof value === "string" && value.toLowerCase().includes("opencode");
    const matchesHeaderKey = (key)=>key.toLowerCase().startsWith("x-opencode-");
    if (matchesUserAgent(userAgent)) return true;
    if (headers instanceof Headers) {
        for (const [key, value] of headers){
            if (matchesHeaderKey(key) || key.toLowerCase() === "user-agent" && matchesUserAgent(value)) {
                return true;
            }
        }
    } else if (headers && typeof headers === "object") {
        for (const [key, value] of Object.entries(headers)){
            if (matchesHeaderKey(key) || key.toLowerCase() === "user-agent" && matchesUserAgent(value)) {
                return true;
            }
        }
    }
    return false;
}
function resolveChatCoreRequestFormat(opts) {
    const { clientRawRequest, body, provider, userAgent } = opts;
    const endpointPath = String(clientRawRequest?.endpoint || "");
    const sourceFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectFormatFromEndpoint"])(body, endpointPath);
    const isResponsesEndpoint = /\/responses(?=\/|$)/i.test(endpointPath) || /^responses(?=\/|$)/i.test(endpointPath);
    const nativeCodexPassthrough = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shouldUseNativeCodexPassthrough"])({
        provider,
        sourceFormat,
        endpointPath
    });
    const nativeXaiResponsesPassthrough = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shouldUseNativeXaiResponsesPassthrough"])({
        provider,
        sourceFormat,
        endpointPath
    });
    const isDroidCLI = userAgent?.toLowerCase().includes("droid") || userAgent?.toLowerCase().includes("codex-cli");
    const copilotCompatibleReasoning = isCopilotClient(clientRawRequest?.headers, userAgent);
    const isOpencodeClientRequest = isOpencodeClient(clientRawRequest?.headers, userAgent);
    const clientResponseFormat = sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && !isResponsesEndpoint && !isDroidCLI ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI : sourceFormat;
    return {
        endpointPath,
        sourceFormat,
        isResponsesEndpoint,
        nativeCodexPassthrough,
        nativeXaiResponsesPassthrough,
        isDroidCLI,
        copilotCompatibleReasoning,
        isOpencodeClient: isOpencodeClientRequest,
        clientResponseFormat
    };
}
}),
"[project]/open-sse/handlers/chatCore/targetFormat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveChatCoreTargetFormat",
    ()=>resolveChatCoreTargetFormat
]);
/**
 * chatCore wire target-format resolver (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure resolution of the provider alias + the upstream target format used to translate the request:
 * apiFormat==="responses" forces OpenAI Responses; otherwise the model's registry target format, then
 * the per-model custom override (#2905), then AgentRouter's matching inbound protocol when the
 * connection has no explicit override, then the provider default. Returns both `alias` (reused by
 * the handler when stripping the `alias/` prefix off the upstream model id) and `targetFormat`.
 * Side-effect-free; sits alongside the other request-setup resolvers
 * (resolveChatCoreRequestSetup / resolveChatCoreRequestFormat).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
;
function resolveChatCoreTargetFormat(opts) {
    const { provider, resolvedModel, apiFormat, sourceFormat, customModelTargetFormat, providerSpecificData, nativeXaiResponsesPassthrough = false } = opts;
    const alias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
    const modelTargetFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelTargetFormat"])(alias, resolvedModel);
    const explicitConnectionTargetFormat = providerSpecificData?.targetFormat;
    const inferredAgentRouterTargetFormat = provider === "agentrouter" && !(typeof explicitConnectionTargetFormat === "string" && explicitConnectionTargetFormat) && (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES || sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI || sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) ? sourceFormat : undefined;
    let targetFormat = apiFormat === "responses" ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES : modelTargetFormat || customModelTargetFormat || inferredAgentRouterTargetFormat || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTargetFormat"])(provider, providerSpecificData);
    if (nativeXaiResponsesPassthrough) targetFormat = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
    return {
        alias,
        targetFormat
    };
}
}),
"[project]/open-sse/handlers/chatCore/agentRouterProtocol.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stripStore",
    ()=>stripStore,
    "usesClaudeBridge",
    ()=>usesClaudeBridge
]);
/**
 * Per-request AgentRouter protocol decisions kept outside the chatCore orchestration god-file.
 * AgentRouter exposes Claude Messages, OpenAI Chat, and OpenAI Responses as distinct upstream
 * protocols, so its dynamic target format must override the connection's default Claude wire image.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
function usesClaudeBridge(provider, targetFormat, credentials) {
    const configuredTargetFormat = credentials?.providerSpecificData?.targetFormat;
    const effectiveFormat = provider === "agentrouter" ? targetFormat : configuredTargetFormat;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(provider) && effectiveFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && effectiveFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
}
function stripStore(body, provider, targetFormat) {
    const supportsStore = provider === "openai" || provider === "agentrouter" && targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
    if (!supportsStore && "store" in body) delete body.store;
}
}),
"[project]/open-sse/handlers/chatCore/claudeToolDefaults.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Claude (Anthropic Messages) tool-definition normalization for outbound requests.
__turbopack_context__.s([
    "defaultClaudeToolType",
    ()=>defaultClaudeToolType
]);
function defaultClaudeToolType(tools) {
    if (!Array.isArray(tools)) return tools;
    return tools.map((tool)=>{
        if (tool && typeof tool === "object" && !Array.isArray(tool)) {
            return tool.type ? tool : {
                type: "custom",
                ...tool
            };
        }
        return tool;
    });
}
}),
"[project]/open-sse/handlers/chatCore/claudeEffortVariant.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyClaudeEffortVariant",
    ()=>applyClaudeEffortVariant
]);
/**
 * chatCore Claude effort-variant normalizer (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * The Claude / Claude-Code model picker (e.g. VS Code's "Effort" slider) advertises
 * claude-...-{low,medium,high,xhigh,max}. Anthropic has no such model, so the suffixed id 404s
 * upstream. This strips it back to the real base id and surfaces the level as reasoning_effort so
 * the OpenAI→Claude translator / Claude-Code bridge can turn it into Claude thinking/effort config.
 * An explicit client-supplied effort always wins; native Claude passthrough (sourceFormat === claude)
 * is left untouched (it carries its own `thinking`). The body is mutated in place (model +
 * reasoning_effort), byte-identical to the previous inline block; the new effectiveModel and an
 * optional log line are returned for the handler to apply.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
;
/**
 * True when the client already supplied an explicit reasoning effort (top-level reasoning_effort,
 * reasoning.effort, or output_config.effort) — in which case the stripped suffix must not overwrite
 * it. A blank string counts as "not supplied".
 */ function hasExplicitClaudeEffort(claudeBody) {
    const explicitEffort = claudeBody.reasoning_effort ?? claudeBody.reasoning?.effort ?? claudeBody.output_config?.effort;
    return !(explicitEffort === undefined || explicitEffort === null || explicitEffort === "");
}
function applyClaudeEffortVariant(opts) {
    const { provider, body, sourceFormat } = opts;
    let effectiveModel = opts.effectiveModel;
    let log = null;
    if ((provider === "claude" || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(provider)) && typeof effectiveModel === "string") {
        const { baseModel, effort } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["splitClaudeEffortSuffix"])(effectiveModel);
        if (effort) {
            effectiveModel = baseModel;
            if (body && typeof body === "object" && !Array.isArray(body)) {
                const claudeBody = body;
                claudeBody.model = baseModel;
                if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && !hasExplicitClaudeEffort(claudeBody)) {
                    claudeBody.reasoning_effort = effort;
                }
            }
            log = `Claude effort variant: stripped "-${effort}" → ${baseModel} (reasoning_effort=${effort})`;
        }
    }
    return {
        effectiveModel,
        log
    };
}
}),
"[project]/open-sse/handlers/chatCore/unsupportedParamsStrip.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stripUnsupportedParams",
    ()=>stripUnsupportedParams
]);
// open-sse/handlers/chatCore/unsupportedParamsStrip.ts
// Extracted from handleChatCore (chatCore god-file decomposition) so the
// unsupported-params strip + tool-history flattening can be unit tested
// directly instead of only through the full handleChatCore pipeline.
//
// Live incident: AI Horde (registry unsupportedParams: ["tools", ...]) 500'd
// on real combo traffic even after `tools`/`tool_choice` were correctly
// stripped from the live request, because the conversation HISTORY still
// carried a prior turn's role:"assistant" tool_calls and role:"tool" result
// messages (left over from before the combo failed over from a tool-capable
// model). AI Horde's raw completion backend doesn't understand those message
// shapes at all, regardless of whether live `tools` is present. flattenToolHistory
// already existed, fully unit-tested, for exactly this — it just had zero call
// sites anywhere in the request pipeline.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$flattenToolHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/flattenToolHistory.ts [instrumentation] (ecmascript)");
;
function stripUnsupportedParams(body, unsupported) {
    const strippedParams = [];
    for (const param of unsupported){
        if (Object.hasOwn(body, param)) {
            strippedParams.push(param);
            delete body[param];
        }
    }
    if (unsupported.includes("tools") && Array.isArray(body.messages)) {
        body.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$flattenToolHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["flattenToolHistory"])(body.messages);
    }
    return {
        strippedParams
    };
}
}),
"[project]/open-sse/handlers/chatCore/toolCallingRequiredCheck.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// open-sse/handlers/chatCore/toolCallingRequiredCheck.ts
// Extracted from handleChatCore (chatCore god-file decomposition).
//
// Combo requests are protected from ever reaching a tool-incapable target in
// the first place by filterTargetsByRequestCompatibility (comboStructure.ts,
// backed by getResolvedModelCapabilities' toolCalling resolution). But a
// direct/pinned request (isCombo: false) has no other target to fail over
// to — silently stripping `tools` and flattening history there produces a
// 200 response that can never actually call anything (the model narrates a
// fake action instead, live incident: AI Horde/Behemoth-X-123B). A clear,
// explicit error is better than a response that looks successful but
// silently drops the client's intended action.
__turbopack_context__.s([
    "checkToolCallingRequiredButUnsupported",
    ()=>checkToolCallingRequiredButUnsupported
]);
function checkToolCallingRequiredButUnsupported(body, unsupported, isCombo, model) {
    if (isCombo) return {
        blocked: false
    };
    if (!unsupported.includes("tools")) return {
        blocked: false
    };
    if (!Array.isArray(body.tools) || body.tools.length === 0) return {
        blocked: false
    };
    return {
        blocked: true,
        message: `Model "${model}" does not support tool calling. Remove "tools" from the request or choose a different model.`
    };
}
}),
"[project]/open-sse/handlers/chatCore/keyHealth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "recordKeyHealthStatus",
    ()=>recordKeyHealthStatus
]);
/**
 * chatCore per-request API-key health updater (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Byte-identical extraction of the `recordKeyHealthStatus` closure that lived at the top of
 * handleChatCore. Translates an upstream HTTP status into the in-memory key-health state
 * (apiKeyRotator) for the connection's currently-selected key, and persists the change to the
 * provider connection so it survives process restarts:
 *   - 401 → record a failure (warning, then invalid at the threshold), always persisted.
 *   - 402 → terminal (insufficient balance); mark the current key invalid immediately (#5239),
 *           persisted on the active→invalid transition.
 *   - 2xx → record a success, persisted only when recovering from a warning/invalid state.
 * Any other status only refreshes the tracked extra-key set. The handler binds its `log` once and
 * delegates here, keeping the existing call sites unchanged.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function recordKeyHealthStatus(status, creds, log, transport) {
    // CLIProxyAPI owns a shared external credential pool. Its auth failures cannot be
    // attributed to the native OmniRoute connection selected before proxy dispatch.
    if (transport === "cliproxyapi") return;
    const connId = creds?.connectionId;
    if (!connId) return;
    const psd = creds.providerSpecificData;
    const extraKeys = psd?.extraApiKeys ?? [];
    const health = psd?.apiKeyHealth;
    const currentKeyId = psd?.selectedKeyId ?? "primary";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["trackConnectionExtraKeys"])(connId, extraKeys);
    if (status === 401) {
        const updatedHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordKeyFailure"])(connId, currentKeyId);
        log?.warn?.("AUTH", `401 on connection ${connId.slice(0, 8)} - key marked as failed (failure #${updatedHealth.failures})`);
        // Persist health status to DB on every failure (not just invalid transitions)
        // This ensures in-memory state survives process restarts
        const prevStatus = health?.[currentKeyId]?.status;
        const prevFailures = health?.[currentKeyId]?.failures ?? 0;
        if (updatedHealth.status !== prevStatus || updatedHealth.failures !== prevFailures) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connId, {
                providerSpecificData: {
                    ...psd,
                    apiKeyHealth: {
                        ...health,
                        [currentKeyId]: updatedHealth
                    }
                }
            }).catch((err)=>{
                log?.error?.("DB", `Failed to persist apiKeyHealth: ${err instanceof Error ? err.message : String(err)}`);
            });
        }
    } else if (status === 402) {
        // 402 "Insufficient account balance" is terminal for this key — the balance
        // won't recover mid-session, so mark the current key invalid immediately
        // (don't wait for FAILURE_THRESHOLD) so the rotator stops returning it.
        // The per-connection path already terminalizes 402 via credits_exhausted;
        // this closes the per-KEY gap (#5239) for API Key Round-Robin connections.
        const updatedHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordKeyTerminal"])(connId, currentKeyId);
        log?.error?.("AUTH", `402 on connection ${connId.slice(0, 8)} - key ${currentKeyId} marked invalid (insufficient balance)`);
        const prevStatus = health?.[currentKeyId]?.status;
        if (updatedHealth.status !== prevStatus) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connId, {
                providerSpecificData: {
                    ...psd,
                    apiKeyHealth: {
                        ...health,
                        [currentKeyId]: updatedHealth
                    }
                }
            }).catch((err)=>{
                log?.error?.("DB", `Failed to persist apiKeyHealth: ${err instanceof Error ? err.message : String(err)}`);
            });
        }
    } else if (status >= 200 && status < 300) {
        const updatedHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordKeySuccess"])(connId, currentKeyId);
        const prevStatus = health?.[currentKeyId]?.status;
        if (prevStatus === "warning" || prevStatus === "invalid") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connId, {
                providerSpecificData: {
                    ...psd,
                    apiKeyHealth: {
                        ...health,
                        [currentKeyId]: updatedHealth
                    }
                }
            }).catch((err)=>{
                log?.error?.("DB", `Failed to persist apiKeyHealth: ${err instanceof Error ? err.message : String(err)}`);
            });
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/skillsFormat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSkillsModelIdForFormat",
    ()=>getSkillsModelIdForFormat,
    "getSkillsProviderForFormat",
    ()=>getSkillsProviderForFormat
]);
/**
 * chatCore skills-format mappers (Quality Gate v2 / Fase 9 — chatCore god-file decomposition, #3501).
 *
 * Pure mappers extracted from chatCore: translate the request wire format into the skills provider
 * bucket and the skills model id used when injecting skill context. Side-effect-free; behaviour is
 * byte-identical to the previous module-level functions.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
function getSkillsProviderForFormat(format) {
    switch(format){
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE:
            return "anthropic";
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI:
            return "google";
        default:
            return "openai";
    }
}
function getSkillsModelIdForFormat(format) {
    switch(format){
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE:
            return "claude";
        case __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI:
            return "gemini";
        default:
            return "openai";
    }
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
"[project]/open-sse/handlers/chatCore/nonStreamingSse.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appendNonStreamingSseTerminalSignal",
    ()=>appendNonStreamingSseTerminalSignal,
    "convertNDJSONToSSE",
    ()=>convertNDJSONToSSE,
    "isEventStreamAccepted",
    ()=>isEventStreamAccepted,
    "isTruthyStreamBody",
    ()=>isTruthyStreamBody,
    "normalizeNonStreamingEventPayload",
    ()=>normalizeNonStreamingEventPayload,
    "parseNonStreamingSSEPayload",
    ()=>parseNonStreamingSSEPayload,
    "shouldTreatBufferedEventResponseAsExpected",
    ()=>shouldTreatBufferedEventResponseAsExpected
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/sseParser.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2f$geminiResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/sseParser/geminiResponse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/headers.ts [instrumentation] (ecmascript)");
;
;
;
;
function parseNonStreamingSSEPayload(rawBody, preferredFormat, fallbackModel) {
    const formatsToTry = [];
    const seen = new Set();
    const queueFormat = (format)=>{
        if (!format || seen.has(format)) return;
        seen.add(format);
        formatsToTry.push(format);
    };
    queueFormat(preferredFormat);
    queueFormat(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI);
    queueFormat(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES);
    queueFormat(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE);
    queueFormat(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
    for (const format of formatsToTry){
        const parsed = format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseSSEToResponsesOutput"])(rawBody, fallbackModel) : format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseSSEToClaudeResponse"])(rawBody, fallbackModel) : format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || format === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2f$geminiResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseSSEToGeminiResponse"])(rawBody, fallbackModel) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseSSEToOpenAIResponse"])(rawBody, fallbackModel);
        if (parsed && typeof parsed === "object") {
            return {
                body: parsed,
                format
            };
        }
    }
    return null;
}
function convertNDJSONToSSE(rawBody) {
    const chunks = String(rawBody || "").split(/\r?\n/).map((line)=>line.trim()).filter((line)=>line.length > 0);
    if (chunks.length === 0) return rawBody;
    return `${chunks.map((chunk)=>`data: ${chunk}\n`).join("\n")}\n`;
}
function normalizeNonStreamingEventPayload(rawBody, contentType) {
    if (contentType.includes("application/x-ndjson")) {
        return convertNDJSONToSSE(rawBody);
    }
    return rawBody;
}
function isTruthyStreamBody(body) {
    return !!body && typeof body === "object" && body.stream === true;
}
function isEventStreamAccepted(headers) {
    return ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(headers, "accept") || "").toLowerCase().includes("text/event-stream");
}
function shouldTreatBufferedEventResponseAsExpected(upstreamStream, providerHeaders, finalBody) {
    return upstreamStream || isEventStreamAccepted(providerHeaders) || isTruthyStreamBody(finalBody);
}
const NON_STREAMING_SSE_TERMINAL_TYPES = new Set([
    "message_stop",
    "response.completed",
    "response.done",
    "response.cancelled",
    "response.canceled",
    "response.failed",
    "response.incomplete"
]);
function isNonStreamingSseTerminalType(eventType) {
    return NON_STREAMING_SSE_TERMINAL_TYPES.has(eventType);
}
function hasClaudeTerminalMessageDelta(parsed, eventType) {
    if (eventType !== "message_delta" || !parsed || typeof parsed !== "object") return false;
    const delta = parsed.delta;
    if (!delta || typeof delta !== "object") return false;
    const stopReason = delta.stop_reason;
    return typeof stopReason === "string" ? stopReason.length > 0 : stopReason != null;
}
// Non-empty finishReason is terminal.  Gemini SSE payloads from
// streamGenerateContent have candidates at the top level (no
// "response" wrapper).  Any non-empty string signals stream end.
function hasGeminiTerminalFinishReason(parsed) {
    if (!parsed || typeof parsed !== "object") return false;
    // Top-level candidates (streamGenerateContent?alt=sse)
    const obj = parsed;
    const candidates = obj.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) return false;
    const candidate = candidates[0];
    if (!candidate || typeof candidate !== "object") return false;
    const finishReason = candidate.finishReason;
    return typeof finishReason === "string" && finishReason.length > 0;
}
function processNonStreamingSseTerminalLine(state, rawLine) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith(":")) {
        const terminalEventOnly = !trimmed && isNonStreamingSseTerminalType(state.currentEvent);
        if (!trimmed) state.currentEvent = "";
        return terminalEventOnly;
    }
    if (trimmed.startsWith("event:")) {
        state.currentEvent = trimmed.slice(6).trim();
        return false;
    }
    if (!trimmed.startsWith("data:")) return false;
    const data = trimmed.slice(5).trim();
    if (data === "[DONE]") return true;
    if (!data) return false;
    // Hot-path optimization: the terminal SSE events we look for (message_stop,
    // response.completed, …) all carry a top-level "type" field, OR are signalled by a
    // preceding `event:` line (Claude). Gemini signals completion via
    // "finishReason" inside response.candidates[0]. OpenAI chat.completion chunks
    // carry none of these and terminate with `[DONE]` (handled above), so parsing
    // every one of them here is pure waste that compounds into the CPU-runaway on
    // large buffered responses. Skip the JSON.parse unless the line could actually
    // be a typed terminal.
    if (!data.includes('"type"') && // NOTE: "finishReason" is a superset match -- it triggers JSON.parse on
    // every Gemini chunk that happens to contain the string (e.g. partial
    // candidate payloads), not just the terminal one.  This is intentional:
    // the extra parses are cheap compared to the CPU-runaway we'd get from
    // parsing ALL chunks unconditionally on large buffered responses, and
    // the superset is safe (false positives just parse a non-terminal chunk
    // and fall through to `return false`).
    !data.includes('"finishReason"') && !(state.currentEvent === "message_delta" && data.includes("stop_reason"))) {
        return isNonStreamingSseTerminalType(state.currentEvent);
    }
    try {
        const parsed = JSON.parse(data);
        const eventType = parsed && typeof parsed === "object" && typeof parsed.type === "string" ? parsed.type : state.currentEvent;
        return isNonStreamingSseTerminalType(eventType) || hasClaudeTerminalMessageDelta(parsed, eventType) || hasGeminiTerminalFinishReason(parsed);
    } catch  {
        // Keep reading malformed data so the parser can report a useful upstream error.
        return false;
    }
}
function appendNonStreamingSseTerminalSignal(state, chunk) {
    const lines = `${state.pendingLine}${chunk}`.split(/\r?\n/);
    state.pendingLine = lines.pop() ?? "";
    for (const rawLine of lines){
        if (processNonStreamingSseTerminalLine(state, rawLine)) return true;
    }
    return false;
}
}),
"[project]/open-sse/handlers/chatCore/nonStreamingResponseBody.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MAX_NONSTREAMING_RESPONSE_BYTES",
    ()=>MAX_NONSTREAMING_RESPONSE_BYTES,
    "NonStreamingResponseTooLargeError",
    ()=>NonStreamingResponseTooLargeError,
    "readNonStreamingResponseBody",
    ()=>readNonStreamingResponseBody
]);
/**
 * chatCore non-streaming response-body reader (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from chatCore: reads an upstream response body to a string. When the upstream is an SSE /
 * NDJSON stream consumed in non-streaming mode, it drains the reader chunk-by-chunk under the body
 * timeout and cancels early once a terminal SSE signal is observed; otherwise it falls back to a
 * timeout-bounded response.text(). Behaviour is byte-identical to the previous module-level function.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/stream.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingSse.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
class NonStreamingResponseTooLargeError extends Error {
    bytesSeen;
    maxBytes;
    constructor(bytesSeen, maxBytes){
        super(`Upstream non-streaming response exceeded the ${maxBytes}-byte cap (saw at least ${bytesSeen} bytes)`);
        this.name = "NonStreamingResponseTooLargeError";
        this.bytesSeen = bytesSeen;
        this.maxBytes = maxBytes;
    }
}
const DEFAULT_MAX_NONSTREAMING_RESPONSE_BYTES = 64 * 1024 * 1024; // 64 MB
const MAX_NONSTREAMING_RESPONSE_BYTES = (()=>{
    const parsed = Number.parseInt(String(process.env.OMNIROUTE_MAX_NONSTREAMING_RESPONSE_BYTES), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_NONSTREAMING_RESPONSE_BYTES;
})();
async function readNonStreamingResponseBody(response, contentType, upstreamStream, maxBytes = MAX_NONSTREAMING_RESPONSE_BYTES) {
    if (!upstreamStream || !response.body || !contentType.includes("text/event-stream") && !contentType.includes("application/x-ndjson")) {
        // Reject before buffering when the upstream declares an over-cap Content-Length.
        const declared = Number.parseInt(response.headers.get("content-length") ?? "", 10);
        if (Number.isFinite(declared) && declared > maxBytes) {
            throw new NonStreamingResponseTooLargeError(declared, maxBytes);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["withBodyTimeout"])(response.text());
    }
    return drainNonStreamingSseBody(response.body, maxBytes);
}
function cancelNonStreamingReader(reader, reason) {
    try {
        void reader.cancel(reason).catch(()=>{});
    } catch  {
    // The caller is already unwinding or returning a complete terminal response.
    }
}
/** Read the next chunk under the body-timeout deadline, normalizing end/empty cases. */ async function readNextNonStreamingChunk(reader, deadline) {
    const timeoutMs = deadline > 0 ? deadline - Date.now() : 0;
    if (deadline > 0 && timeoutMs <= 0) {
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createBodyTimeoutError"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_BODY_TIMEOUT_MS"]);
    }
    const { done, value } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readStreamChunkWithTimeout"])(reader, timeoutMs);
    if (done) return {
        kind: "done"
    };
    if (!value) return {
        kind: "skip"
    };
    return {
        kind: "chunk",
        value
    };
}
async function drainNonStreamingSseBody(body, maxBytes) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const terminalState = {
        currentEvent: "",
        pendingLine: ""
    };
    let rawBody = "";
    let bytesSeen = 0;
    const deadline = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_BODY_TIMEOUT_MS"] > 0 ? Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_BODY_TIMEOUT_MS"] : 0;
    let cancelRequested = false;
    const requestCancel = (reason)=>{
        if (cancelRequested) return;
        cancelRequested = true;
        cancelNonStreamingReader(reader, reason);
    };
    try {
        while(true){
            const next = await readNextNonStreamingChunk(reader, deadline);
            if (next.kind === "done") break;
            if (next.kind === "skip") continue;
            // Bound the buffer: cancel the upstream and fail fast past the cap rather than
            // growing `rawBody` until the V8 heap is exhausted.
            bytesSeen += next.value.byteLength;
            if (bytesSeen > maxBytes) {
                requestCancel("non-streaming response exceeded byte cap");
                throw new NonStreamingResponseTooLargeError(bytesSeen, maxBytes);
            }
            const decodedChunk = decoder.decode(next.value, {
                stream: true
            });
            rawBody += decodedChunk;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["appendNonStreamingSseTerminalSignal"])(terminalState, decodedChunk)) {
                requestCancel("non-streaming bridge consumed terminal SSE event");
                break;
            }
        }
    } catch (error) {
        requestCancel(error);
        throw error;
    } finally{
        rawBody += decoder.decode();
        reader.releaseLock();
    }
    return rawBody;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/streamErrorResult.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStreamingErrorResult",
    ()=>createStreamingErrorResult,
    "getUpstreamErrorIdentifier",
    ()=>getUpstreamErrorIdentifier,
    "isSemaphoreCapacityError",
    ()=>isSemaphoreCapacityError
]);
/**
 * chatCore streaming error-result helpers (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from chatCore: identify semaphore capacity errors, build a sanitized SSE error result
 * (an `data: {...}\n\ndata: [DONE]\n\n` body wrapped in an event-stream Response), and pull a string
 * error code off an unknown error. Side-effect-free; behaviour is byte-identical to the previous
 * module-level functions.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
;
function isSemaphoreCapacityError(error) {
    return !!error && typeof error === "object" && (error.code === "SEMAPHORE_TIMEOUT" || error.code === "SEMAPHORE_QUEUE_FULL");
}
function createStreamingErrorResult(statusCode, message, code, type) {
    const errorBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, message);
    if (code) {
        errorBody.error.code = code;
    }
    if (type) {
        errorBody.error.type = type;
    }
    const body = `data: ${JSON.stringify(errorBody)}\n\ndata: [DONE]\n\n`;
    return {
        success: false,
        status: statusCode,
        error: message,
        response: new Response(body, {
            status: statusCode,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no"
            }
        })
    };
}
function getUpstreamErrorIdentifier(error) {
    if (!error || typeof error !== "object") return undefined;
    const value = error.code;
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
}),
"[project]/open-sse/handlers/chatCore/streamFinalize.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore stream finalize wrapper (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Extracted from chatCore: wraps a ReadableStream so a `finalize` callback runs exactly once when the
 * stream is fully drained, errors, or is cancelled. Side-effect-free other than the wrapped stream's
 * own lifecycle; behaviour is byte-identical to the previous module-level function.
 */ __turbopack_context__.s([
    "wrapReadableStreamWithFinalize",
    ()=>wrapReadableStreamWithFinalize
]);
function wrapReadableStreamWithFinalize(readable, finalize) {
    const reader = readable.getReader();
    let finalized = false;
    const runFinalize = ()=>{
        if (finalized) return;
        finalized = true;
        finalize();
    };
    return new ReadableStream({
        async pull (controller) {
            try {
                const { done, value } = await reader.read();
                if (done) {
                    runFinalize();
                    controller.close();
                    return;
                }
                controller.enqueue(value);
            } catch (error) {
                runFinalize();
                controller.error(error);
            }
        },
        async cancel (reason) {
            runFinalize();
            try {
                await reader.cancel(reason);
            } catch (error) {
            // Ignored
            }
        }
    });
}
}),
"[project]/open-sse/handlers/chatCore/cacheUsageMeta.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore cache-usage log meta helpers (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Pure helpers extracted from chatCore: coerce an unknown to a positive number, derive cache
 * read/creation token counts from a usage object (handling both top-level and prompt_tokens_details
 * shapes), and attach an `_omniroute` meta blob to a log payload. Side-effect-free; behaviour is
 * byte-identical to the previous module-level functions.
 */ __turbopack_context__.s([
    "attachLogMeta",
    ()=>attachLogMeta,
    "buildCacheUsageLogMeta",
    ()=>buildCacheUsageLogMeta,
    "toPositiveNumber",
    ()=>toPositiveNumber
]);
function toPositiveNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}
function buildCacheUsageLogMeta(usage) {
    if (!usage || typeof usage !== "object") return null;
    const promptTokenDetails = usage.prompt_tokens_details && typeof usage.prompt_tokens_details === "object" ? usage.prompt_tokens_details : undefined;
    const hasCacheFields = "cache_read_input_tokens" in usage || "cached_tokens" in usage || "cache_creation_input_tokens" in usage || !!promptTokenDetails && ("cached_tokens" in promptTokenDetails || "cache_creation_tokens" in promptTokenDetails);
    const cacheReadTokens = toPositiveNumber(usage.cache_read_input_tokens ?? usage.cached_tokens ?? promptTokenDetails?.cached_tokens);
    const cacheCreationTokens = toPositiveNumber(usage.cache_creation_input_tokens ?? promptTokenDetails?.cache_creation_tokens);
    if (!hasCacheFields) return null;
    return {
        cacheReadTokens,
        cacheCreationTokens
    };
}
function attachLogMeta(payload, meta) {
    if (!meta || typeof meta !== "object") return payload;
    const compactMeta = Object.fromEntries(Object.entries(meta).filter(([, value])=>value !== null && value !== undefined));
    if (Object.keys(compactMeta).length === 0) return payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return {
            _omniroute: compactMeta,
            _payload: payload ?? null
        };
    }
    const existing = payload._omniroute && typeof payload._omniroute === "object" && !Array.isArray(payload._omniroute) ? payload._omniroute : {};
    return {
        ...payload,
        _omniroute: {
            ...existing,
            ...compactMeta
        }
    };
}
}),
"[project]/open-sse/handlers/chatCore/executorClientHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore executor client-header normalizer (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure helper extracted from chatCore: normalizes a Headers instance or a plain header object into a
 * lowercased-tolerant Record<string,string>, and backfills the client User-Agent (both casings) when
 * one is supplied and not already present. Returns null when nothing was collected. Side-effect-free;
 * behaviour is byte-identical to the previous module-level function.
 */ __turbopack_context__.s([
    "buildExecutorClientHeaders",
    ()=>buildExecutorClientHeaders
]);
function buildExecutorClientHeaders(headers, userAgent) {
    const normalized = {};
    if (headers instanceof Headers) {
        headers.forEach((value, key)=>{
            normalized[key] = value;
        });
    } else if (headers && typeof headers === "object") {
        for (const [key, value] of Object.entries(headers)){
            if (typeof value === "string") {
                normalized[key] = value;
            }
        }
    }
    const normalizedUserAgent = typeof userAgent === "string" ? userAgent.trim() : "";
    if (normalizedUserAgent && !normalized["user-agent"] && !normalized["User-Agent"]) {
        normalized["user-agent"] = normalizedUserAgent;
        normalized["User-Agent"] = normalizedUserAgent;
    }
    return Object.keys(normalized).length > 0 ? normalized : null;
}
}),
"[project]/open-sse/handlers/chatCore/executionCredentials.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveExecutionCredentials",
    ()=>resolveExecutionCredentials
]);
/**
 * chatCore execution-credentials resolver (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure builder extracted from handleChatCore: derives the per-execution credentials object from the
 * resolved request context. Applies the native-Codex passthrough endpoint override, forces
 * apiType=responses (and the responses-upstream marker) for Azure AI Foundry / OCI when the model
 * routes to the OpenAI Responses format, synchronizes AgentRouter's per-request alternate protocol,
 * and threads the Claude Code session id when present. Side-effect-free.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/runtime.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
function buildKimiThinkingMetadata(modelInfo, staticThinkingPolicy) {
    const { supportsThinking, supportedThinkingEfforts, defaultThinkingEffort } = resolveKimiThinkingPolicyValues(modelInfo, staticThinkingPolicy);
    const metadata = {};
    if (typeof supportsThinking === "boolean") metadata.supportsThinking = supportsThinking;
    if (modelInfo?.alwaysThinking === true || staticThinkingPolicy?.alwaysThinking === true) {
        metadata.alwaysThinking = true;
    }
    if (supportedThinkingEfforts) metadata.supportedThinkingEfforts = supportedThinkingEfforts;
    if (defaultThinkingEffort) metadata.defaultThinkingEffort = defaultThinkingEffort;
    return metadata;
}
function resolveKimiThinkingPolicyValues(modelInfo, staticThinkingPolicy) {
    const supportsThinking = typeof modelInfo?.supportsThinking === "boolean" ? modelInfo.supportsThinking : staticThinkingPolicy?.supportsThinking;
    const supportedThinkingEfforts = Array.isArray(modelInfo?.supportedThinkingEfforts) ? modelInfo.supportedThinkingEfforts : staticThinkingPolicy?.supportedThinkingEfforts;
    const defaultThinkingEffort = typeof modelInfo?.defaultThinkingEffort === "string" ? modelInfo.defaultThinkingEffort : staticThinkingPolicy?.defaultThinkingEffort;
    return {
        supportsThinking,
        supportedThinkingEfforts,
        defaultThinkingEffort
    };
}
function applyKimiExecutionMetadata(providerSpecificData, provider, targetFormat, modelInfo) {
    if (provider !== "kimi-coding" && provider !== "kimi-coding-apikey") return;
    const staticThinkingPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKimiCodeStaticThinkingPolicy"])(modelInfo?.model);
    providerSpecificData._omnirouteKimiTargetFormat = targetFormat;
    providerSpecificData._omnirouteKimiThinking = buildKimiThinkingMetadata(modelInfo, staticThinkingPolicy);
}
function resolveExecutionCredentials(opts) {
    const { credentials, nativeCodexPassthrough, endpointPath, targetFormat, provider, ccSessionId, modelInfo } = opts;
    const nextCredentials = nativeCodexPassthrough ? {
        ...credentials,
        requestEndpointPath: endpointPath
    } : credentials;
    const providerSpecificData = nextCredentials?.providerSpecificData && typeof nextCredentials.providerSpecificData === "object" ? {
        ...nextCredentials.providerSpecificData
    } : {};
    // Some providers (Azure AI Foundry, OCI OpenAI-compatible) choose upstream
    // endpoint path from providerSpecificData.apiType. When a model routes to
    // OpenAI Responses format, force apiType=responses unless explicitly set.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && (provider === "azure-ai" || provider === "oci") && providerSpecificData.apiType !== "responses") {
        providerSpecificData.apiType = "responses";
    }
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && (provider === "azure-ai" || provider === "oci")) {
        providerSpecificData._omnirouteForceResponsesUpstream = true;
    }
    // #8969: Poe's native /v1/responses surface — DefaultExecutor.buildUrl("poe")
    // reads this marker so Responses requests do not land on chat/completions.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && provider === "poe") {
        providerSpecificData._omnirouteForceResponsesUpstream = true;
    }
    // #8969: Claude-tagged Poe models speak Anthropic Messages wire format. Keep
    // DefaultExecutor from injecting OpenAI stream_options onto that body.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && provider === "poe") {
        providerSpecificData.disableStreamOptions = true;
    }
    // #7364: "zai"/"glm-coding-apikey" default to the Anthropic Messages wire format
    // (registry format:"claude"), but a per-model targetFormat override (custom-model
    // dropdown, #2905) can resolve targetFormat to "openai" — e.g. for a vision model
    // like glm-4.6v that the operator wants routed through the OpenAI-compatible
    // endpoint. DefaultExecutor.buildUrl()'s "zai" branch has no other way to see that
    // override, so surface it on providerSpecificData for buildUrl to read.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && (provider === "zai" || provider === "glm-coding-apikey")) {
        providerSpecificData.targetFormat = targetFormat;
    }
    // AgentRouter exposes Claude, OpenAI Chat, and OpenAI Responses on distinct URLs with distinct
    // auth schemes. Keep the executor's URL/header resolution synchronized with chatCore's resolved
    // per-request protocol without persisting the inferred selection back to the connection.
    if (provider === "agentrouter" && (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES)) {
        providerSpecificData.targetFormat = targetFormat;
    }
    applyKimiExecutionMetadata(providerSpecificData, provider, targetFormat, modelInfo);
    const withApiType = {
        ...nextCredentials,
        providerSpecificData
    };
    if (!ccSessionId) return withApiType;
    return {
        ...withApiType,
        providerSpecificData: {
            ...withApiType?.providerSpecificData || {},
            ccSessionId
        }
    };
}
}),
"[project]/open-sse/handlers/chatCore/cliproxyModelMapping.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CLIProxyAPI model-mapping application (#6876).
 *
 * The dashboard persists `cliproxyapiModelMapping` per provider
 * (`upstream_proxy_config.cliproxyapi_model_mapping`) but nothing at
 * request-dispatch time ever consulted it — the configured alias was
 * silently dropped and the original model was forwarded verbatim to
 * CLIProxyAPI. This module applies the mapping exactly once, at the
 * executor boundary, so it only affects requests that actually reach
 * CLIProxyAPI (the `cliproxyapi` passthrough leg and the CLIProxyAPI retry
 * leg of `fallback` mode) and never the native leg of `fallback` mode.
 */ __turbopack_context__.s([
    "applyCliproxyapiModelMapping",
    ()=>applyCliproxyapiModelMapping,
    "wrapExecutorWithCliproxyapiModelMapping",
    ()=>wrapExecutorWithCliproxyapiModelMapping
]);
function resolveMappedModel(model, mapping) {
    if (!mapping || typeof mapping !== "object") return null;
    const mapped = mapping[model];
    return typeof mapped === "string" && mapped.trim() ? mapped : null;
}
function applyCliproxyapiModelMapping(input, mapping) {
    const mappedModel = resolveMappedModel(input.model, mapping);
    if (!mappedModel) return input;
    const body = input.body && typeof input.body === "object" && !Array.isArray(input.body) ? {
        ...input.body,
        model: mappedModel
    } : input.body;
    return {
        ...input,
        model: mappedModel,
        body
    };
}
function wrapExecutorWithCliproxyapiModelMapping(executor, mapping) {
    if (!mapping || typeof mapping !== "object" || Object.keys(mapping).length === 0) {
        return executor;
    }
    const wrapped = Object.create(executor);
    wrapped.execute = (input)=>executor.execute(applyCliproxyapiModelMapping(input, mapping));
    return wrapped;
}
}),
"[project]/open-sse/handlers/chatCore/cliproxyapiCredentials.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CLIProxyAPI dedicated-credential resolution (#7645).
 *
 * CLIProxyAPI requires its own separately-configured `api-keys:` credential
 * and rejects any other token with 401. Before this fix, both the direct
 * `mode: "cliproxyapi"` passthrough leg and the `mode: "fallback"` retry leg
 * (`open-sse/handlers/chatCore/executorProxy.ts::resolveExecutorWithProxy`)
 * reused the resolved connection's own credentials — the native provider's
 * key — as the Authorization header sent to CLIProxyAPI, making the fallback
 * path a permanent no-op for every provider configured this way.
 *
 * This module resolves and applies the dedicated `cliproxyapi_api_key`
 * setting at the executor boundary, so `CliproxyapiExecutor` itself stays
 * credential-source-agnostic (it just uses whatever `credentials` it's
 * handed — see `buildHeaders()`).
 */ __turbopack_context__.s([
    "resolveCliproxyapiCredentials",
    ()=>resolveCliproxyapiCredentials,
    "resolveDedicatedCliproxyapiApiKey",
    ()=>resolveDedicatedCliproxyapiApiKey,
    "wrapExecutorWithCliproxyapiCredentials",
    ()=>wrapExecutorWithCliproxyapiCredentials
]);
function resolveDedicatedCliproxyapiApiKey(settings) {
    const raw = settings?.cliproxyapi_api_key;
    return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}
function resolveCliproxyapiCredentials(connectionCredentials, dedicatedApiKey) {
    if (!dedicatedApiKey) return connectionCredentials;
    return {
        ...connectionCredentials,
        apiKey: dedicatedApiKey,
        accessToken: undefined
    };
}
function wrapExecutorWithCliproxyapiCredentials(executor, dedicatedApiKey) {
    if (!dedicatedApiKey) return executor;
    const wrapped = Object.create(executor);
    wrapped.execute = (input)=>executor.execute({
            ...input,
            credentials: resolveCliproxyapiCredentials(input.credentials, dedicatedApiKey)
        });
    return wrapped;
}
}),
"[project]/open-sse/handlers/chatCore/executorProxy.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolveExecutorWithProxy",
    ()=>resolveExecutorWithProxy
]);
/**
 * chatCore upstream-proxy executor resolver (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore: resolves the executor for a provider honoring the configured
 * upstream proxy mode. `native` / disabled → the provider's own executor; `cliproxyapi` → the
 * CLIProxyAPI passthrough executor; `dario` → the Dario passthrough executor; `fallback` → a
 * wrapper that tries the native executor first and retries via the configured fallback backend
 * (CLIProxyAPI by default, or Dario) on configured failure codes (default 5xx + 429 + network)
 * or on a thrown error.
 *
 * Dario (@askalf/dario) is wired as a parallel, independent backend choice at both levels
 * (per-connection `darioMode` + provider `mode`/`fallbackBackend`) WITHOUT changing any existing
 * CLIProxyAPI behaviour. Dario needs neither the dedicated-credential substitution nor the
 * per-provider model-mapping wrappers CLIProxyAPI uses: it authenticates via its own OAuth
 * account pool (not a configured bearer key) and has its own server-side model-alias mechanism.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$cliproxyapi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/cliproxyapi.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$dario$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/dario.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/comboContextCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cliproxyModelMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/cliproxyModelMapping.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cliproxyapiCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/cliproxyapiCredentials.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$cliproxyapi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$dario$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$cliproxyapi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$dario$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const DEFAULT_FALLBACK_CODES = [
    429,
    500,
    502,
    503,
    504
];
function parseFallbackCodes(raw) {
    if (typeof raw !== "string" || !raw.trim()) return null;
    const parsed = raw.split(",").map((s)=>Number.parseInt(s.trim(), 10)).filter((n)=>!Number.isNaN(n));
    return parsed.length > 0 ? parsed : null;
}
/**
 * Reads the CLIProxyAPI-related settings shared by both the direct
 * `mode: "cliproxyapi"` passthrough leg and the `mode: "fallback"` retry leg:
 * the custom fallback status codes and the dedicated credential (#7645).
 * Falls back to defaults / no dedicated key on any read failure.
 */ async function loadCliproxyapiSettings() {
    try {
        const allSettings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
        return {
            fallbackCodes: parseFallbackCodes(allSettings.cliproxyapi_fallback_codes) ?? [
                ...DEFAULT_FALLBACK_CODES
            ],
            dedicatedApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cliproxyapiCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDedicatedCliproxyapiApiKey"])(allSettings)
        };
    } catch  {
        return {
            fallbackCodes: [
                ...DEFAULT_FALLBACK_CODES
            ],
            dedicatedApiKey: null
        };
    }
}
/**
 * Resolve the CLIProxyAPI passthrough executor with its model-mapping +
 * dedicated-credential wrappers applied. Used by the direct `cliproxyapi` leg
 * and the CLIProxyAPI branch of `fallback`.
 */ function resolveCliproxyapiExecutor(cliproxyapiModelMapping, dedicatedApiKey) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cliproxyapiCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wrapExecutorWithCliproxyapiCredentials"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cliproxyModelMapping$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wrapExecutorWithCliproxyapiModelMapping"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])("cliproxyapi"), cliproxyapiModelMapping), dedicatedApiKey);
}
async function resolveExecutorWithProxy(prov, log, providerSpecificData) {
    // Per-connection routing override (#6339): the resolved connection can opt itself
    // into the CLIProxyAPI passthrough executor via providerSpecificData.cliproxyapiMode
    // === "claude-native" (UI toggle). This takes precedence over the provider-level
    // upstream_proxy_config mode — one connection can deep-route while the provider's
    // default (and its other connections) stay native. Backward-compatible: connections
    // without the flag fall through to the existing per-provider behaviour untouched.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$cliproxyapi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCliproxyapiDeepModeEnabled"])(providerSpecificData)) {
        log?.info?.("UPSTREAM_PROXY", `${prov} routed through CLIProxyAPI (per-connection claude-native override)`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])("cliproxyapi");
    }
    // Sibling per-connection override for Dario (#dario). Checked AFTER the
    // CLIProxyAPI check above by deliberate design: if a connection somehow sets
    // BOTH cliproxyapiMode and darioMode to "claude-native", CLIProxyAPI's
    // existing behaviour keeps winning — the least-surprising precedence for
    // configs that predate this field, and the simplest to reason about.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$dario$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDarioDeepModeEnabled"])(providerSpecificData)) {
        log?.info?.("UPSTREAM_PROXY", `${prov} routed through Dario (per-connection claude-native override)`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])("dario");
    }
    const cfg = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUpstreamProxyConfigCached"])(prov);
    if (!cfg.enabled || cfg.mode === "native") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])(prov);
    if (cfg.mode === "cliproxyapi") {
        log?.info?.("UPSTREAM_PROXY", `${prov} routed through CLIProxyAPI (passthrough)`);
        const { dedicatedApiKey } = await loadCliproxyapiSettings();
        return resolveCliproxyapiExecutor(cfg.cliproxyapiModelMapping, dedicatedApiKey);
    }
    if (cfg.mode === "dario") {
        // Direct Dario passthrough. No credential/model-mapping wrappers: Dario
        // authenticates via its own OAuth pool and has its own model-alias layer.
        log?.info?.("UPSTREAM_PROXY", `${prov} routed through Dario (passthrough)`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])("dario");
    }
    // mode === "fallback": try native first, retry via the configured fallback
    // backend on specific failures. The backend defaults to CLIProxyAPI so every
    // pre-existing fallback config behaves exactly as before; fallbackBackend
    // === "dario" opts the retry leg over to Dario instead.
    const nativeExec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])(prov);
    const fallbackBackend = cfg.fallbackBackend;
    const { fallbackCodes, dedicatedApiKey } = await loadCliproxyapiSettings();
    // The model mapping applies only to the CLIProxyAPI retry leg (proxyExec) —
    // the native leg must keep seeing the original, unmapped model.
    const proxyExec = fallbackBackend === "dario" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])("dario") : resolveCliproxyapiExecutor(cfg.cliproxyapiModelMapping, dedicatedApiKey);
    const backendLabel = fallbackBackend === "dario" ? "Dario" : "CLIProxyAPI";
    const isRetryableStatus = (s)=>fallbackCodes.includes(s) || s === 0;
    const wrapper = Object.create(nativeExec);
    wrapper.execute = async (input)=>{
        let result;
        try {
            result = await nativeExec.execute(input);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            log?.info?.("UPSTREAM_PROXY", `${prov} native error (${errMsg}), retrying via ${backendLabel}`);
            try {
                return await proxyExec.execute(input);
            } catch (proxyErr) {
                const proxyMsg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
                log?.error?.("UPSTREAM_PROXY", `${prov} ${backendLabel} fallback also failed: ${proxyMsg}`);
                throw proxyErr;
            }
        }
        if (!isRetryableStatus(result.response.status)) {
            return result;
        }
        log?.info?.("UPSTREAM_PROXY", `${prov} native failed (${result.response.status}), retrying via ${backendLabel}`);
        try {
            return await proxyExec.execute(input);
        } catch (proxyErr) {
            const proxyMsg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
            log?.error?.("UPSTREAM_PROXY", `${prov} ${backendLabel} fallback also failed: ${proxyMsg}`);
            throw proxyErr;
        }
    };
    return wrapper;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/claudeUpstreamMessages.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore Claude upstream-message transforms (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore. `extractSystemMessagesToBody` lifts system/developer role messages
 * into the top-level `system` parameter (Anthropic rejects those roles inside messages[]).
 * `normalizeClaudeUpstreamMessages` prepares a native Claude Messages payload: lifts system roles,
 * drops empty text blocks, inlines unsupported file/document parts as text, collapses tool_result
 * blocks to text (unless preserved), drops unsupported parts, and moves stray tool_result blocks out
 * of assistant messages (#2815). Both mutate the payload in place; behaviour is byte-identical to the
 * previous inline closures (normalize captured only `log`).
 */ __turbopack_context__.s([
    "extractSystemMessagesToBody",
    ()=>extractSystemMessagesToBody,
    "normalizeClaudeUpstreamMessages",
    ()=>normalizeClaudeUpstreamMessages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeSystemRole$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/claudeSystemRole.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/claudeHelper.ts [instrumentation] (ecmascript) <locals>");
;
;
function extractSystemMessagesToBody(payload) {
    if (!Array.isArray(payload.messages)) return;
    const messages = payload.messages;
    const systemMessages = messages.filter((m)=>{
        const role = String(m.role || "").toLowerCase();
        return role === "system" || role === "developer";
    });
    if (systemMessages.length === 0) return;
    const extraBlocks = [];
    for (const sm of systemMessages){
        if (typeof sm.content === "string" && sm.content.length > 0) {
            extraBlocks.push({
                type: "text",
                text: sm.content
            });
        } else if (Array.isArray(sm.content)) {
            for (const block of sm.content){
                if (block?.type === "text" && typeof block.text === "string" && block.text.length > 0) {
                    extraBlocks.push(block);
                }
            }
        }
    }
    if (extraBlocks.length > 0) {
        const existingSystem = payload.system;
        if (typeof existingSystem === "string" && existingSystem.length > 0) {
            payload.system = [
                {
                    type: "text",
                    text: existingSystem
                },
                ...extraBlocks
            ];
        } else if (Array.isArray(existingSystem)) {
            payload.system = [
                ...existingSystem,
                ...extraBlocks
            ];
        } else {
            payload.system = extraBlocks;
        }
    }
    payload.messages = messages.filter((m)=>{
        const role = String(m.role || "").toLowerCase();
        return role !== "system" && role !== "developer";
    });
}
function normalizeClaudeUpstreamMessages(payload, options, log) {
    const preserveToolResultBlocks = options?.preserveToolResultBlocks === true;
    if (!Array.isArray(payload.messages)) return;
    let messages = payload.messages;
    // Extract system/developer role messages into top-level system parameter.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeSystemRole$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractSystemRoleMessages"])(payload);
    messages = payload.messages;
    // Anthropic rejects empty text blocks in native Messages payloads.
    for (const msg of messages){
        if (Array.isArray(msg.content)) {
            msg.content = msg.content.filter((block)=>block.type !== "text" || typeof block.text === "string" && block.text.length > 0);
        }
    }
    // Normalize unsupported content types without reintroducing the Claude -> OpenAI round-trip.
    for (const msg of messages){
        if (msg.role !== "user" || !Array.isArray(msg.content)) continue;
        msg.content = msg.content.flatMap((block)=>{
            if (block.type === "text" || block.type === "image_url" || block.type === "image" || block.type === "file_url" || block.type === "file" || block.type === "document") {
                const fileData = block.file_url ?? block.file ?? block.document;
                if ((block.type === "file" || block.type === "document") && !fileData?.url && !fileData?.data) {
                    const fileContent = block.file?.content ?? block.file?.text ?? block.content ?? block.text;
                    const fileName = block.file?.name ?? block.name ?? "attachment";
                    if (typeof fileContent === "string" && fileContent.length > 0) {
                        return [
                            {
                                type: "text",
                                text: `[${fileName}]\n${fileContent}`
                            }
                        ];
                    }
                }
                return [
                    block
                ];
            }
            if (block.type === "tool_result") {
                if (preserveToolResultBlocks) {
                    return [
                        block
                    ];
                }
                const toolId = block.tool_use_id ?? block.id ?? "unknown";
                const resultContent = block.content ?? block.text ?? block.output ?? "";
                const resultText = typeof resultContent === "string" ? resultContent : Array.isArray(resultContent) ? resultContent.filter((c)=>c.type === "text").map((c)=>c.text).join("\n") : JSON.stringify(resultContent);
                if (resultText.length > 0) {
                    return [
                        {
                            type: "text",
                            text: `[Tool Result: ${toolId}]\n${resultText}`
                        }
                    ];
                }
                return [];
            }
            log?.debug?.("CONTENT", `Dropped unsupported content part type="${block.type}"`);
            return [];
        });
    }
    // #2815: move stray tool_result blocks out of assistant messages.
    payload.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["splitMisplacedToolResults"])(payload.messages);
}
}),
"[project]/open-sse/handlers/chatCore/attemptLogging.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "persistAttemptLogs",
    ()=>persistAttemptLogs,
    "resolveRequestLifecycleEvent",
    ()=>resolveRequestLifecycleEvent
]);
/**
 * chatCore per-attempt logging persistence (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore: persists one attempt's call log. Emits a provider.warning audit
 * event when the provider response carries warnings, fills the detailed pipeline payloads (when
 * detailed logging is on), and writes the bounded/truncated call-log row (request/response bodies
 * with the Claude prompt-cache meta attached). Best-effort: the saveCallLog write swallows its own
 * errors. The per-request context (provider/model/ids/combo/etc.) is threaded via `ctx` so the 16
 * call sites in the handler stay byte-identical; behaviour is unchanged.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$providerAudit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/providerAudit.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/compliance/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/events/eventBus.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/logTruncation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cacheUsageMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/cacheUsageMeta.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function toConnectionId(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function buildAccountRotationMeta(provider, initialConnectionId, finalConnectionId) {
    if (provider !== "codex" || !initialConnectionId || !finalConnectionId) return null;
    if (initialConnectionId === finalConnectionId) return null;
    return {
        codexAccountRotation: {
            initialConnectionId,
            finalConnectionId
        }
    };
}
function resolveRequestLifecycleEvent(input) {
    const { traceId, status, error, model, provider, comboName, tokens, latencyMs } = input;
    const succeeded = typeof status === "number" && status >= 200 && status < 400 && !error;
    const resolvedComboName = typeof comboName === "string" && comboName ? comboName : undefined;
    if (succeeded) {
        const tokenBag = tokens && typeof tokens === "object" ? tokens : {};
        const num = (v)=>typeof v === "number" && Number.isFinite(v) ? v : 0;
        return {
            name: "request.completed",
            payload: {
                id: traceId,
                status: "success",
                model: model || "unknown",
                provider: provider || "unknown",
                tokensInput: num(tokenBag.input ?? tokenBag.prompt_tokens ?? tokenBag.inputTokens),
                tokensOutput: num(tokenBag.output ?? tokenBag.completion_tokens ?? tokenBag.outputTokens),
                latencyMs,
                comboName: resolvedComboName
            }
        };
    }
    return {
        name: "request.failed",
        payload: {
            id: traceId,
            error: error || `HTTP ${status}`,
            statusCode: typeof status === "number" ? status : undefined,
            latencyMs,
            model: model || undefined,
            provider: provider || undefined
        }
    };
}
function persistAttemptLogs(args, ctx) {
    const { status, tokens, responseBody, error, providerRequest, providerResponse, clientResponse, claudeCacheMeta, claudeCacheUsageMeta, cacheSource } = args;
    const { traceId, provider, connectionId, model, skillRequestId, detailedLoggingEnabled, reqLogger, pendingRequestId, clientRawRequest, requestedModel, credentials, startTime, body, sourceFormat, targetFormat, comboName, comboStepId, comboExecutionKey, tokensCompressed, apiKeyInfo, noLogEnabled, correlationId, modelPinned, sessionTag } = ctx;
    const initialConnectionId = toConnectionId(connectionId);
    const finalConnectionId = toConnectionId(credentials?.connectionId) || initialConnectionId;
    const accountRotationMeta = buildAccountRotationMeta(provider, initialConnectionId, finalConnectionId);
    const providerWarnings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$providerAudit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractProviderWarnings"])(providerResponse, clientResponse, responseBody);
    if (providerWarnings.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
            action: "provider.warning",
            actor: "system",
            target: [
                provider,
                finalConnectionId
            ].filter(Boolean).join(":") || provider || model,
            resourceType: "provider_warning",
            status: "warning",
            requestId: skillRequestId,
            details: {
                provider,
                model,
                connectionId: finalConnectionId,
                httpStatus: status,
                warnings: providerWarnings
            }
        });
    }
    const capturedPipeline = reqLogger?.getPipelinePayloads?.() ?? null;
    const pipelinePayloads = detailedLoggingEnabled ? capturedPipeline ?? {} : capturedPipeline?.routeDecision ? {
        routeDecision: capturedPipeline.routeDecision
    } : null;
    if (pipelinePayloads) {
        if (providerRequest !== undefined && !pipelinePayloads.providerRequest) {
            pipelinePayloads.providerRequest = providerRequest;
        }
        if (providerResponse !== undefined && !pipelinePayloads.providerResponse) {
            pipelinePayloads.providerResponse = providerResponse;
        }
        if (clientResponse !== undefined) {
            pipelinePayloads.clientResponse = clientResponse;
        }
        if (error) {
            pipelinePayloads.error = {
                ...typeof pipelinePayloads.error === "object" && pipelinePayloads.error ? pipelinePayloads.error : {},
                message: error
            };
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        id: pendingRequestId,
        method: "POST",
        path: clientRawRequest?.endpoint || "/v1/chat/completions",
        status,
        model,
        requestedModel,
        provider,
        connectionId: finalConnectionId || undefined,
        duration: Date.now() - startTime,
        tokens: tokens || {},
        requestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cloneBoundedChatLogPayload"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cacheUsageMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachLogMeta"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["truncateForLog"])(body), {
            ...accountRotationMeta,
            claudePromptCache: claudeCacheMeta
        })),
        responseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cloneBoundedChatLogPayload"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cacheUsageMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachLogMeta"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$logTruncation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["truncateForLog"])(responseBody), {
            ...accountRotationMeta,
            claudePromptCache: claudeCacheMeta ? {
                applied: claudeCacheMeta.applied,
                totalBreakpoints: claudeCacheMeta.totalBreakpoints,
                anthropicBeta: claudeCacheMeta.anthropicBeta
            } : null,
            claudePromptCacheUsage: claudeCacheUsageMeta
        })),
        error: error || null,
        sourceFormat,
        targetFormat,
        comboName,
        comboStepId,
        comboExecutionKey,
        tokensCompressed,
        cacheSource: cacheSource === "semantic" ? "semantic" : "upstream",
        apiKeyId: apiKeyInfo?.id || null,
        apiKeyName: apiKeyInfo?.name || null,
        noLog: noLogEnabled,
        pipelinePayloads,
        correlationId,
        modelPinned: modelPinned || false,
        sessionTag: sessionTag || null
    }).catch(()=>{});
    // Emit the terminal request-lifecycle event to the live dashboard bus. `request.started`
    // is emitted in chatCore with this same `traceId`; without a matching completed/failed the
    // client's active-request map never drains, so the topology node stays green forever (the
    // "stuck green" latch — request.completed/failed were declared + consumed but never emitted).
    // Deferred via setImmediate to keep it off the response hot path, mirroring request.started.
    setImmediate(()=>{
        const lifecycle = resolveRequestLifecycleEvent({
            traceId,
            status,
            error,
            model,
            provider,
            comboName,
            tokens,
            latencyMs: Date.now() - startTime
        });
        if (lifecycle.name === "request.completed") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("request.completed", lifecycle.payload);
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("request.failed", lifecycle.payload);
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/stageTrace.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore per-request stage trace (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Extracted from handleChatCore: emits a `[STAGE_TRACE]` checkpoint log (trace id + elapsed ms +
 * optional serialized extra) when tracing is enabled, so a hung request reveals which await it was
 * sitting on. Per-request inputs (enable flag, start time, trace id, logger) are threaded via `ctx`
 * so the call sites stay byte-identical; behaviour is unchanged.
 */ __turbopack_context__.s([
    "stageTrace",
    ()=>stageTrace
]);
function stageTrace(label, extra, ctx) {
    const { traceEnabled, startTime, traceId, log } = ctx;
    if (!traceEnabled) return;
    const elapsed = Date.now() - startTime;
    let suffix = "";
    if (extra) {
        try {
            suffix = ` ${JSON.stringify(extra)}`;
        } catch  {
            suffix = " [unserializable]";
        }
    }
    log?.info?.("STAGE_TRACE", `${traceId} ${label} t=${elapsed}ms${suffix}`);
}
}),
"[project]/open-sse/handlers/chatCore/compressionUsageReceipt.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore compression-usage receipt attachment (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore: best-effort, fire-and-forget attachment of a usage receipt to the
 * stored compression-analytics row, ordered after any in-flight analytics write (`pendingWrite`) so
 * the receipt lands on the persisted row. Errors are swallowed — analytics must never affect the
 * response. The per-request inputs are passed via `ctx`; behaviour is byte-identical to the previous
 * inline closure.
 */ __turbopack_context__.s([
    "attachCompressionUsageReceiptAfterAnalytics",
    ()=>attachCompressionUsageReceiptAfterAnalytics
]);
function attachCompressionUsageReceiptAfterAnalytics(usage, source, ctx) {
    const { pendingWrite, skillRequestId } = ctx;
    void (async ()=>{
        try {
            if (pendingWrite) await pendingWrite;
            const { attachCompressionUsageReceipt } = await __turbopack_context__.A("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript, async loader)");
            attachCompressionUsageReceipt(skillRequestId, usage, source);
        } catch  {
        // Compression analytics are best-effort and must never affect responses.
        }
    })();
}
}),
"[project]/open-sse/handlers/chatCore/upstreamBody.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareUpstreamBody",
    ()=>prepareUpstreamBody
]);
/**
 * chatCore upstream body preparation (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501 — first internal sub-slice of executeProviderRequest).
 *
 * Extracted from handleChatCore's execute() closure: prepares the body actually sent upstream for a
 * given target model. Pins the model id, applies the configured payload rules, truncates the tool
 * list to the provider's effective limit and injects an OpenAI `prompt_cache_key` for
 * caching-capable providers. Pure with respect to handler
 * state (returns a fresh body, only logs as a side effect); behaviour is byte-identical to the
 * previous inline block. Split into small private steps so each stays under the complexity cap.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$payloadRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/payloadRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolLimitDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/toolLimitDetector.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cacheControlPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$targetRequestSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/targetRequestSanitizer.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function buildAppliedRulesSummary(applied) {
    return applied.map((rule)=>{
        if (rule.type === "filter") return `${rule.type}:${rule.path}`;
        const serializedValue = JSON.stringify(rule.value);
        const safeValue = typeof serializedValue === "string" && serializedValue.length > 80 ? `${serializedValue.slice(0, 77)}...` : serializedValue;
        return `${rule.type}:${rule.path}=${safeValue}`;
    }).join(", ");
}
function truncateToolList(bodyToSend, provider, bypassDefaultToolLimit, log) {
    if (!Array.isArray(bodyToSend.tools)) return bodyToSend;
    const knownLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolLimitDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKnownToolLimit"])(provider);
    if (knownLimit !== null) {
        if (bodyToSend.tools.length > knownLimit) {
            const originalCount = bodyToSend.tools.length;
            const truncatedTools = bodyToSend.tools.slice(0, knownLimit);
            bodyToSend = {
                ...bodyToSend,
                tools: truncatedTools
            };
            log?.debug?.("TOOL_LIMIT", `Truncated ${originalCount} tools to ${knownLimit} for ${provider}`);
        }
        return bodyToSend;
    }
    if (bypassDefaultToolLimit === true) return bodyToSend;
    const effectiveToolLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$toolLimitDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEffectiveToolLimit"])(provider);
    if (bodyToSend.tools.length > effectiveToolLimit) {
        const originalCount = bodyToSend.tools.length;
        const truncatedTools = bodyToSend.tools.slice(0, effectiveToolLimit);
        bodyToSend = {
            ...bodyToSend,
            tools: truncatedTools
        };
        log?.debug?.("TOOL_LIMIT", `Truncated ${originalCount} tools to ${effectiveToolLimit} for ${provider}`);
    }
    return bodyToSend;
}
// Inject prompt_cache_key only for providers that support it.
async function injectPromptCacheKey(bodyToSend, provider, targetFormat, connectionCacheOverride) {
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerSupportsCaching"])(provider, undefined, connectionCacheOverride) && !bodyToSend.prompt_cache_key && Array.isArray(bodyToSend.messages) && ![
        "nvidia",
        "codex",
        "xai"
    ].includes(provider)) {
        const { generatePromptCacheKey } = await __turbopack_context__.A("[project]/src/lib/promptCache/index.ts [instrumentation] (ecmascript, async loader)");
        const cacheKey = generatePromptCacheKey(bodyToSend.messages);
        if (cacheKey) {
            bodyToSend = {
                ...bodyToSend,
                prompt_cache_key: cacheKey
            };
        }
    }
    return bodyToSend;
}
async function prepareUpstreamBody(opts) {
    const { translatedBody, modelToCall, provider, targetFormat, credentials, bypassDefaultToolLimit = false, log } = opts;
    let bodyToSend = translatedBody.model === modelToCall ? translatedBody : {
        ...translatedBody,
        model: modelToCall
    };
    const payloadRuleModel = typeof bodyToSend.model === "string" && bodyToSend.model.length > 0 ? bodyToSend.model : modelToCall;
    const payloadRuleProtocols = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$payloadRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePayloadRuleProtocols"])({
        provider,
        targetFormat
    });
    const payloadRuleResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$payloadRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyConfiguredPayloadRules"])(bodyToSend, payloadRuleModel, payloadRuleProtocols);
    bodyToSend = payloadRuleResult.payload;
    if (payloadRuleResult.applied.length > 0) {
        log?.debug?.("PAYLOAD_RULES", `Applied ${payloadRuleResult.applied.length} rule(s) for ${payloadRuleModel} (${payloadRuleProtocols.join(", ")}): ${buildAppliedRulesSummary(payloadRuleResult.applied)}`);
    }
    bodyToSend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$targetRequestSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeRequestForResolvedTarget"])(bodyToSend, {
        provider,
        model: payloadRuleModel,
        log
    });
    bodyToSend = truncateToolList(bodyToSend, provider, bypassDefaultToolLimit ?? false, log);
    const connectionCacheOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveConnectionCacheOverride"])(credentials?.providerSpecificData);
    bodyToSend = await injectPromptCacheKey(bodyToSend, provider, targetFormat, connectionCacheOverride);
    return bodyToSend;
}
}),
"[project]/open-sse/handlers/chatCore/passthroughToolNames.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildClaudePassthroughToolNameMap",
    ()=>buildClaudePassthroughToolNameMap,
    "mergeResponseToolNameMap",
    ()=>mergeResponseToolNameMap,
    "normalizeOpenAIToolFinishReasons",
    ()=>normalizeOpenAIToolFinishReasons,
    "restoreClaudePassthroughToolNames",
    ()=>restoreClaudePassthroughToolNames,
    "restoreNonStreamingToolNames",
    ()=>restoreNonStreamingToolNames
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-claude.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
;
;
function buildClaudePassthroughToolNameMap(body) {
    if (!body || !Array.isArray(body.tools)) return null;
    const toolNameMap = new Map();
    for (const tool of body.tools){
        const toolRecord = tool;
        const toolData = toolRecord?.type === "function" && toolRecord.function && typeof toolRecord.function === "object" ? toolRecord.function : toolRecord;
        const originalName = typeof toolData?.name === "string" ? toolData.name.trim() : "";
        if (!originalName) continue;
        toolNameMap.set(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_OAUTH_TOOL_PREFIX"]}${originalName}`, originalName);
    }
    return toolNameMap.size > 0 ? toolNameMap : null;
}
function restoreClaudePassthroughToolNames(responseBody, toolNameMap) {
    if (!toolNameMap || !Array.isArray(responseBody?.content)) return responseBody;
    let changed = false;
    const content = responseBody.content.map((block)=>{
        if (block?.type !== "tool_use" || typeof block?.name !== "string") return block;
        const restoredName = toolNameMap.get(block.name) ?? block.name;
        if (restoredName === block.name) return block;
        changed = true;
        return {
            ...block,
            name: restoredName
        };
    });
    if (!changed) return responseBody;
    return {
        ...responseBody,
        content
    };
}
function mergeResponseToolNameMap(baseToolNameMap, transformedBody) {
    const transformedRecord = transformedBody && typeof transformedBody === "object" && !Array.isArray(transformedBody) ? transformedBody : null;
    const executorToolNameMap = transformedRecord?._toolNameMap instanceof Map ? transformedRecord._toolNameMap : null;
    if (!executorToolNameMap?.size) return baseToolNameMap;
    if (!baseToolNameMap?.size) return executorToolNameMap;
    const merged = new Map(baseToolNameMap);
    for (const [toolName, originalName] of executorToolNameMap.entries()){
        merged.set(toolName, originalName);
    }
    return merged;
}
function restoreNonStreamingToolNames(responseBody, baseToolNameMap, transformedBody, restoreClaudeNames) {
    const responseToolNameMap = mergeResponseToolNameMap(baseToolNameMap, transformedBody);
    const restoredBody = restoreClaudeNames ? restoreClaudePassthroughToolNames(responseBody, responseToolNameMap) : responseBody;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(restoredBody, responseToolNameMap);
    return [
        restoredBody,
        responseToolNameMap
    ];
}
function normalizeOpenAIToolFinishReasons(responseBody) {
    const response = responseBody;
    if (!response?.choices) return;
    for (const choice of response.choices){
        if (choice.message?.tool_calls?.length > 0 && choice.finish_reason !== "tool_calls") {
            choice.finish_reason = "tool_calls";
        }
    }
}
}),
"[project]/open-sse/handlers/chatCore/compressionSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore compression settings resolution (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's Proactive Context Compression setup: read the canonical
 * compression settings and derive the prompt-compression and delegated context-editing flags.
 * Best-effort — on a lookup error it logs and falls back to disabled, exactly like the previous
 * inline try/catch. Behaviour is byte-identical.
 */ __turbopack_context__.s([
    "resolveCompressionSettings",
    ()=>resolveCompressionSettings
]);
async function resolveCompressionSettings(log) {
    try {
        const { getCompressionSettings } = await __turbopack_context__.A("[project]/src/lib/db/compression.ts [instrumentation] (ecmascript, async loader)");
        const settings = await getCompressionSettings();
        return {
            settings,
            enabled: settings.enabled,
            contextEditingEnabled: settings.contextEditing?.enabled === true
        };
    } catch (err) {
        log?.warn?.("COMPRESSION", "Compression settings lookup skipped: " + (err instanceof Error ? err.message : String(err)));
        return {
            settings: null,
            enabled: false,
            contextEditingEnabled: false
        };
    }
}
}),
"[project]/open-sse/handlers/chatCore/compressionComboPredicates.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore compression-combo predicates (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure predicates extracted from handleChatCore's compression setup: detect the built-in
 * RTK→caveman stacked pipeline and whether a runtime combo has at least one pipeline layer.
 * No handler state is captured; behaviour is byte-identical to the previous inline closures.
 */ __turbopack_context__.s([
    "isBuiltinStackedPipeline",
    ()=>isBuiltinStackedPipeline,
    "isStackedCompressionCombo",
    ()=>isStackedCompressionCombo
]);
function isBuiltinStackedPipeline(pipeline) {
    if (!Array.isArray(pipeline) || pipeline.length !== 2) return false;
    const [first, second] = pipeline;
    return first?.engine === "rtk" && (first.intensity === undefined || first.intensity === "standard") && !first.config && second?.engine === "caveman" && (second.intensity === undefined || second.intensity === "full") && !second.config;
}
function isStackedCompressionCombo(compressionCombo) {
    // >= 1: a single-engine default combo (user enabled exactly one layer via the per-engine config
    // page) must still apply. applyCompressionComboConfig already guards length === 0.
    return Boolean(compressionCombo && compressionCombo.pipeline.length >= 1);
}
}),
"[project]/open-sse/handlers/chatCore/outputStyleTelemetry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore output-style run-telemetry hook (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's request-setup compression path: when the unified output styles
 * ran, emit the per-run telemetry record so output-style usage surfaces in compression analytics.
 * Best-effort, fire-and-forget — an un-awaited IIFE that swallows its own errors and never affects
 * the request. Behaviour is byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "emitOutputStyleTelemetry",
    ()=>emitOutputStyleTelemetry
]);
function emitOutputStyleTelemetry(args) {
    const result = args.outputStyleResult;
    if (!result) return;
    void (async ()=>{
        try {
            const { buildOutputStyleTelemetry } = await __turbopack_context__.A("[project]/open-sse/services/compression/outputStyles/telemetry.ts [instrumentation] (ecmascript, async loader)");
            const { insertCompressionRunTelemetryRow } = await __turbopack_context__.A("[project]/src/lib/db/compressionRunTelemetry.ts [instrumentation] (ecmascript, async loader)");
            const record = buildOutputStyleTelemetry({
                requestId: args.skillRequestId ?? args.traceId ?? "",
                model: args.effectiveModel ?? "",
                provider: args.provider ?? "",
                source: args.compressionComboId ? "active-profile" : "default",
                tokensBefore: args.estimatedTokens,
                tokensAfter: args.estimatedTokens,
                applied: result.applied,
                appliedStyles: result.appliedStyles,
                skippedReason: result.skippedReason
            });
            insertCompressionRunTelemetryRow(record);
        } catch (err) {
            args.log?.debug?.("COMPRESSION", "Run-telemetry emit skipped: " + (err instanceof Error ? err.message : String(err)));
        }
    })();
}
}),
"[project]/open-sse/handlers/chatCore/compressionAnalyticsWrite.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore compression analytics write (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's request-setup compression path: persist the per-run compression
 * analytics row (cost saved, RTK raw-output pointers) plus the per-engine breakdown of a stacked
 * run. Returns the write promise so the caller can finish persistence before dispatching the
 * upstream request. Errors remain best-effort and never throw into a request, but they are logged
 * at warning level so a broken analytics path is observable. Split into small builders so each
 * stays under the complexity cap.
 */ __turbopack_context__.s([
    "writeCompressionAnalytics",
    ()=>writeCompressionAnalytics,
    "writeCompressionSkip",
    ()=>writeCompressionSkip
]);
function buildRtkPointerFields(rtkPointers) {
    return {
        rtk_raw_output_pointer: rtkPointers[0]?.id ?? null,
        rtk_raw_output_bytes: rtkPointers[0]?.bytes ?? null,
        rtk_raw_output_pointers: rtkPointers.length ? JSON.stringify(rtkPointers.map((pointer)=>pointer.id)) : null,
        rtk_raw_output_total_bytes: rtkPointers.length ? rtkPointers.reduce((total, pointer)=>total + (pointer.bytes ?? 0), 0) : null
    };
}
function buildAnalyticsRow(opts, tokensSaved, rtkPointers, estimatedUsdSaved) {
    const { stats } = opts;
    return {
        timestamp: new Date().toISOString(),
        combo_id: opts.comboName ?? null,
        provider: opts.provider ?? null,
        mode: opts.mode,
        engine: stats.engine ?? opts.mode,
        compression_combo_id: stats.compressionComboId ?? opts.compressionComboId ?? null,
        original_tokens: stats.originalTokens,
        compressed_tokens: stats.compressedTokens,
        tokens_saved: tokensSaved,
        duration_ms: stats.durationMs ?? null,
        request_id: opts.skillRequestId,
        estimated_usd_saved: estimatedUsdSaved || null,
        validation_fallback: stats.fallbackApplied ? 1 : 0,
        output_mode: opts.cavemanOutputModeApplied ? opts.cavemanOutputModeIntensity : null,
        ...buildRtkPointerFields(rtkPointers)
    };
}
function buildEngineBreakdownRows(stats, requestId) {
    const engineBreakdown = stats.engineBreakdown ?? [];
    return engineBreakdown.map((b)=>({
            timestamp: new Date().toISOString(),
            request_id: requestId,
            engine: b.engine,
            original_tokens: b.originalTokens,
            compressed_tokens: b.compressedTokens,
            tokens_saved: Math.max(0, b.originalTokens - b.compressedTokens),
            duration_ms: b.durationMs ?? null
        }));
}
function writeCompressionSkip(opts, skipReason) {
    return (async ()=>{
        try {
            const { insertCompressionAnalyticsRow } = await __turbopack_context__.A("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript, async loader)");
            const { stats } = opts;
            insertCompressionAnalyticsRow({
                timestamp: new Date().toISOString(),
                combo_id: opts.comboName ?? null,
                provider: opts.provider ?? null,
                mode: opts.mode,
                engine: stats.engine ?? opts.mode,
                compression_combo_id: stats.compressionComboId ?? opts.compressionComboId ?? null,
                original_tokens: stats.originalTokens,
                compressed_tokens: stats.compressedTokens,
                tokens_saved: 0,
                duration_ms: stats.durationMs ?? null,
                request_id: opts.skillRequestId,
                skip_reason: skipReason
            });
        } catch (err) {
            opts.log?.warn?.("COMPRESSION", "Compression skip-analytics write skipped: " + (err instanceof Error ? err.message : String(err)));
        }
    })();
}
function writeCompressionAnalytics(opts, dependencies = {}) {
    return (async ()=>{
        try {
            const { insertCompressionAnalyticsRow, insertCompressionEngineBreakdown } = await __turbopack_context__.A("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript, async loader)");
            const { stats } = opts;
            const tokensSaved = Math.max(0, stats.originalTokens - stats.compressedTokens);
            const rtkPointers = stats.rtkRawOutputPointers ?? [];
            let estimatedUsdSaved = 0;
            try {
                const calculateCost = dependencies.calculateCost ?? (await __turbopack_context__.A("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript, async loader)")).calculateCost;
                estimatedUsdSaved = await calculateCost(opts.provider ?? "", opts.effectiveModel ?? "", {
                    input: tokensSaved
                }, {
                    serviceTier: opts.effectiveServiceTier
                });
            } catch (err) {
                opts.log?.debug?.("COMPRESSION", "Compression cost estimate skipped: " + (err instanceof Error ? err.message : String(err)));
            }
            insertCompressionAnalyticsRow(buildAnalyticsRow(opts, tokensSaved, rtkPointers, estimatedUsdSaved));
            const breakdownRows = buildEngineBreakdownRows(stats, opts.skillRequestId);
            if (breakdownRows.length > 0) {
                insertCompressionEngineBreakdown(breakdownRows);
            }
        } catch (err) {
            opts.log?.warn?.("COMPRESSION", "Compression analytics write skipped: " + (err instanceof Error ? err.message : String(err)));
        }
    })();
}
}),
"[project]/open-sse/handlers/chatCore/pluginOnRequest.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore plugin onRequest hook (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Extracted from handleChatCore's request entry: run the registered plugin `onRequest` hooks. The
 * hook may block the request (→ the handler returns a 403), rewrite the body (→ the handler
 * reassigns `body`), or do nothing. Fail-open — a misbehaving plugin is logged and ignored. Returns
 * a discriminated result so the early-return + body reassignment stay in the handler; behaviour is
 * byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "runPluginOnRequestHook",
    ()=>runPluginOnRequestHook
]);
const JSON_HEADERS = {
    status: 403,
    headers: {
        "Content-Type": "application/json"
    }
};
async function runPluginOnRequestHook(args) {
    try {
        const { runOnRequest } = await __turbopack_context__.A("[project]/src/lib/plugins/hooks.ts [instrumentation] (ecmascript, async loader)");
        const pluginCtx = {
            requestId: args.requestId,
            body: args.body,
            model: args.model,
            provider: args.provider,
            apiKeyInfo: args.apiKeyInfo,
            metadata: {}
        };
        const pluginResult = await runOnRequest(pluginCtx);
        if (pluginResult?.blocked) {
            args.log?.info?.("PLUGIN", `Request blocked by plugin`);
            const response = pluginResult.response ? new Response(JSON.stringify(pluginResult.response), JSON_HEADERS) : new Response(JSON.stringify({
                error: {
                    message: "Request blocked by plugin",
                    type: "plugin_block"
                }
            }), JSON_HEADERS);
            return {
                blocked: true,
                response
            };
        }
        if (pluginResult?.metadata) {
            Object.assign(pluginCtx.metadata, pluginResult.metadata);
        }
        return {
            blocked: false,
            body: pluginResult?.body
        };
    } catch (pluginErr) {
        args.log?.debug?.("PLUGIN", `onRequest hook error (non-fatal): ${pluginErr instanceof Error ? pluginErr.message : String(pluginErr)}`);
        return {
            blocked: false
        };
    }
}
}),
"[project]/open-sse/handlers/chatCore/contextEditingTelemetry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore context-editing telemetry hook (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's non-streaming success path: when the delegated server-side
 * context-clear actually ran (Claude-only), record the provider's cleared-token receipt under the
 * "context-editing" engine so it surfaces in compression analytics. Best-effort, fire-and-forget,
 * and must never affect the response — the inner work is an un-awaited IIFE that swallows its own
 * errors. Behaviour is byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "recordContextEditingTelemetryHook",
    ()=>recordContextEditingTelemetryHook
]);
function recordContextEditingTelemetryHook(args) {
    const { contextEditingEnabled, provider, responseBody, skillRequestId, log } = args;
    if (!contextEditingEnabled || provider !== "claude") return;
    void (async ()=>{
        try {
            const { extractContextEditingTelemetry } = await __turbopack_context__.A("[project]/open-sse/config/contextEditing.ts [instrumentation] (ecmascript, async loader)");
            const tele = extractContextEditingTelemetry(responseBody);
            if (tele) {
                const { recordContextEditingTelemetry } = await __turbopack_context__.A("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript, async loader)");
                recordContextEditingTelemetry(skillRequestId, tele, provider);
                log?.debug?.("CONTEXT_EDITING", `cleared ${tele.clearedInputTokens} input tokens / ${tele.clearedToolUses} tool uses (${tele.editCount} edits)`);
            }
        } catch  {
        // Telemetry is best-effort and must never affect the response.
        }
    })();
}
}),
"[project]/open-sse/handlers/chatCore/compressionCacheStats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore compression cache-stats hook (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's request-setup compression path: when a prompt was compressed,
 * record the caching-context cache-stats receipt (estimated cache hit + tokens saved). Best-effort,
 * fire-and-forget — the inner work is an un-awaited IIFE that swallows its own errors and never
 * affects the request. Behaviour is byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "recordCompressionCacheStats",
    ()=>recordCompressionCacheStats
]);
function recordCompressionCacheStats(args) {
    void (async ()=>{
        try {
            const { detectCachingContext } = await __turbopack_context__.A("[project]/open-sse/services/compression/cachingAware.ts [instrumentation] (ecmascript, async loader)");
            const { recordCacheStats } = await __turbopack_context__.A("[project]/src/lib/db/compressionCacheStats.ts [instrumentation] (ecmascript, async loader)");
            const cacheContext = detectCachingContext(args.compressionInputBody, {
                provider: args.provider,
                targetFormat: args.targetFormat,
                model: args.effectiveModel,
                connectionCacheOverride: args.connectionCacheOverride ?? null
            });
            const tokensSavedCompression = Math.max(0, args.stats.originalTokens - args.stats.compressedTokens);
            recordCacheStats({
                provider: cacheContext.provider ?? args.provider ?? "unknown",
                model: args.effectiveModel ?? "",
                compressionMode: args.mode,
                cacheControlPresent: cacheContext.hasCacheControl,
                estimatedCacheHit: cacheContext.hasCacheControl && cacheContext.isCachingProvider,
                tokensSavedCompression,
                tokensSavedCaching: 0,
                netSavings: tokensSavedCompression
            });
        } catch (err) {
            args.log?.debug?.("COMPRESSION", "Compression cache stats write skipped: " + (err instanceof Error ? err.message : String(err)));
        }
    })();
}
}),
"[project]/open-sse/handlers/chatCore/cavemanOutputAnalytics.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore caveman-output compression analytics (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's request-setup compression path: when only the caveman output
 * mode was applied (no upstream compression run recorded a row), persist a single analytics row so
 * output-caveman runs still surface in compression analytics. Best-effort — returns the write
 * promise so the caller can finish persistence before dispatch; errors remain non-fatal but are
 * logged at warning level.
 */ __turbopack_context__.s([
    "writeCavemanOutputAnalytics",
    ()=>writeCavemanOutputAnalytics
]);
function writeCavemanOutputAnalytics(args) {
    return (async ()=>{
        try {
            const { insertCompressionAnalyticsRow } = await __turbopack_context__.A("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript, async loader)");
            insertCompressionAnalyticsRow({
                timestamp: new Date().toISOString(),
                combo_id: args.comboName ?? null,
                provider: args.provider ?? null,
                mode: "output-caveman",
                engine: "caveman-output",
                compression_combo_id: args.compressionComboId ?? null,
                original_tokens: args.estimatedTokens,
                compressed_tokens: args.estimatedTokens,
                tokens_saved: 0,
                request_id: args.skillRequestId,
                output_mode: args.cavemanOutputModeIntensity
            });
        } catch (err) {
            args.log?.warn?.("COMPRESSION", "Caveman output analytics write skipped: " + (err instanceof Error ? err.message : String(err)));
        }
    })();
}
}),
"[project]/open-sse/handlers/chatCore/quotaShareConsumption.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore quota-share consumption POST-hook (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's non-streaming success path (B/F7): schedules a shared-quota
 * consumption record for a completed non-streaming response. Fire-and-forget and fail-open — guards
 * on a missing api-key id / connection id and never throws to the caller. Behaviour is
 * byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "scheduleQuotaShareConsumption",
    ()=>scheduleQuotaShareConsumption
]);
async function scheduleQuotaShareConsumption(args) {
    if (!args.apiKeyId || !args.connectionId) return;
    try {
        const { scheduleRecordConsumption, buildConsumptionCost } = await __turbopack_context__.A("[project]/src/lib/quota/spendRecorder.ts [instrumentation] (ecmascript, async loader)");
        scheduleRecordConsumption({
            apiKeyId: args.apiKeyId,
            connectionId: args.connectionId,
            provider: args.provider ?? "unknown",
            // Per-(key,model) cap accounting — same resolved model id used at enforce time.
            model: args.model ?? undefined,
            cost: buildConsumptionCost(args.usage, args.estimatedCost)
        }, args.log);
    } catch (_) {
    // Outer fail-open — never throws to caller
    }
}
}),
"[project]/open-sse/handlers/chatCore/gamificationEvent.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore request gamification event (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore: emits the per-request "request" gamification event,
 * fire-and-forget and fail-open. Shared by the non-streaming and streaming success paths (the
 * inline block was duplicated verbatim in both). Guards on a missing api-key id and never throws
 * to the caller — the underlying emit is intentionally not awaited; behaviour is byte-identical to
 * the previous inline blocks.
 */ __turbopack_context__.s([
    "emitRequestGamificationEvent",
    ()=>emitRequestGamificationEvent
]);
async function emitRequestGamificationEvent(args) {
    if (!args.apiKeyId) return;
    try {
        const { emitGamificationEvent } = await __turbopack_context__.A("[project]/src/lib/gamification/events.ts [instrumentation] (ecmascript, async loader)");
        emitGamificationEvent({
            apiKeyId: args.apiKeyId,
            action: "request",
            metadata: {
                model: args.model,
                provider: args.provider
            }
        });
    } catch (_) {
    /* gamification optional */ }
}
}),
"[project]/open-sse/handlers/chatCore/pluginOnResponse.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore plugin onResponse hook (Quality Gate v2 / Fase 9 — chatCore god-file decomposition,
 * #3501).
 *
 * Extracted from handleChatCore's streaming finalization: runs the registered plugin `onResponse`
 * hooks for a completed response. Fire-and-forget and fail-open — the inner run is not awaited
 * and both the dynamic import and the run swallow their own errors, so a misbehaving plugin never
 * affects the response. Non-streaming callers pass the translated JSON body as `data`; streaming
 * callers pass `{ streamed: true }` because the SSE body is not materialized yet (#8711).
 */ /** Payload passed to plugin onResponse hooks from chatCore success paths. */ __turbopack_context__.s([
    "runPluginOnResponseHook",
    ()=>runPluginOnResponseHook
]);
async function runPluginOnResponseHook(args) {
    try {
        const { runOnResponse } = await __turbopack_context__.A("[project]/src/lib/plugins/hooks.ts [instrumentation] (ecmascript, async loader)");
        runOnResponse({
            requestId: args.requestId,
            body: args.body,
            model: args.model,
            provider: args.provider,
            apiKeyInfo: args.apiKeyInfo,
            metadata: {}
        }, args.response).catch(()=>{});
    } catch (_) {
    /* plugin onResponse optional */ }
}
}),
"[project]/open-sse/handlers/chatCore/streamingQuotaShare.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore streaming quota-share consumption POST-hook (Quality Gate v2 / Fase 9 — chatCore
 * god-file decomposition, #3501).
 *
 * Extracted from handleChatCore's onStreamComplete (B/F7): records shared-quota consumption for a
 * completed streaming response, resolving the real per-request cost via the injected calculateCost
 * so USD-unit pools accrue on streaming traffic too. onStreamComplete is synchronous, so this is a
 * sync fire-and-forget that drives the work through import().then().catch() and never throws to the
 * caller. Behaviour is byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "scheduleStreamingQuotaShareConsumption",
    ()=>scheduleStreamingQuotaShareConsumption
]);
function scheduleStreamingQuotaShareConsumption(args) {
    if (!args.apiKeyId || !args.connectionId || args.streamStatus !== 200) return;
    const quotaApiKeyId = args.apiKeyId;
    const quotaConnectionId = args.connectionId;
    // onStreamComplete is sync — use .then() (fire-and-forget, fail-open) instead of await
    __turbopack_context__.A("[project]/src/lib/quota/spendRecorder.ts [instrumentation] (ecmascript, async loader)").then(({ recordStreamingConsumption })=>recordStreamingConsumption({
            apiKeyId: quotaApiKeyId,
            connectionId: quotaConnectionId,
            provider: args.provider,
            model: args.model,
            streamUsage: args.streamUsage,
            streamStatus: args.streamStatus,
            serviceTier: args.serviceTier
        }, {
            calculateCost: args.calculateCost,
            log: args.log
        })).catch(()=>{
    // Outer fail-open — never throws to caller
    });
}
}),
"[project]/open-sse/handlers/chatCore/streamingUsageStats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "recordStreamingUsageStats",
    ()=>recordStreamingUsageStats
]);
/**
 * chatCore streaming usage-stats persistence (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's onStreamComplete: records per-request usage analytics for a
 * completed streaming response — the fire-and-forget `saveRequestUsage` row and the per-api-key
 * billable-token counter (only on a 200 stream). Side-effect only (no handler state is mutated,
 * nothing is returned); best-effort, every write swallows its own errors. The per-request context
 * is threaded via `ctx` so the call site stays byte-identical; behaviour is unchanged. The
 * compression usage-receipt attach stays in the handler (it is a handler-bound closure).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenLimitCounter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function persistStreamingUsageRow(usage, ctx) {
    const { provider, model, streamStatus, startTime, ttft, streamErrorCode } = ctx;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveRequestUsage"])({
        provider: provider || "unknown",
        model: model || "unknown",
        tokens: usage,
        status: String(streamStatus),
        success: streamStatus === 200,
        latencyMs: Date.now() - startTime,
        timeToFirstTokenMs: ttft,
        errorCode: streamStatus === 200 ? null : streamErrorCode || String(streamStatus),
        timestamp: new Date().toISOString(),
        connectionId: ctx.connectionId || undefined,
        apiKeyId: ctx.apiKeyInfo?.id || undefined,
        apiKeyName: ctx.apiKeyInfo?.name || undefined,
        serviceTier: ctx.effectiveServiceTier,
        comboStrategy: ctx.isCombo ? ctx.comboStrategy || undefined : undefined,
        endpoint: ctx.endpoint || undefined
    }).catch((err)=>{
        console.error("Failed to save usage stats:", err.message);
    });
}
function recordStreamingBillableTokens(usage, ctx) {
    if (!ctx.apiKeyInfo?.id || ctx.streamStatus !== 200) return;
    try {
        const billable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["computeBillableTokens"])(usage);
        if (billable > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordTokenUsage"])(ctx.apiKeyInfo.id, ctx.provider || "unknown", ctx.model || "unknown", billable);
    } catch  {
    // never block the stream on counter recording
    }
}
function recordStreamingUsageStats(usage, ctx) {
    if (!usage || typeof usage !== "object") return;
    persistStreamingUsageRow(usage, ctx);
    recordStreamingBillableTokens(usage, ctx);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/streamingCost.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * chatCore streaming per-request cost recording (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Extracted from handleChatCore's onStreamComplete: resolves the real per-request cost for a
 * completed streaming response and records it against the api key. onStreamComplete is synchronous,
 * so this is a sync fire-and-forget driven through calculateCost().then().catch() that never throws
 * to the caller. calculateCost and recordCost are injected so the hook stays decoupled. Behaviour
 * is byte-identical to the previous inline block.
 */ __turbopack_context__.s([
    "recordStreamingCost",
    ()=>recordStreamingCost
]);
function recordStreamingCost(args) {
    if (!args.apiKeyId || !args.streamUsage) return;
    const apiKeyId = args.apiKeyId;
    args.calculateCost(args.provider, args.model, args.streamUsage, {
        serviceTier: args.serviceTier
    }).then((estimatedCost)=>{
        if (estimatedCost > 0) args.recordCost(apiKeyId, estimatedCost);
    }).catch(()=>{});
}
}),
"[project]/open-sse/handlers/chatCore/nonStreamingResponseParse.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "parseNonStreamingResponseBody",
    ()=>parseNonStreamingResponseBody
]);
/**
 * chatCore non-streaming response parsing/classification (Quality Gate v2 / Fase 9 — chatCore
 * god-file decomposition, #3501 — response-handling slice of executeProviderRequest).
 *
 * Extracted from handleChatCore's `if (!stream)` block: reads the upstream non-streaming body,
 * detects whether it is an event stream (SSE / NDJSON) buffered for a non-streaming client, and
 * parses it into a JSON response body. Returns a discriminated union describing the outcome
 * (`ok` | `invalid_sse` | `invalid_json`) and leaves every persistence side-effect
 * (appendRequestLog / persistAttemptLogs / persistFailureUsage / trackPendingRequest /
 * createErrorResult) to the handler, so behaviour is observably identical to the previous inline
 * block. Pure with respect to handler state (only buffering debug/warn logs as a side effect).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/sseParser.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingResponseBody.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingSse.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function parseNonStreamingResponseBody(opts) {
    const { providerResponse, upstreamStream, providerHeaders, finalBody, targetFormat, model, log } = opts;
    const contentType = (providerResponse.headers.get("content-type") || "").toLowerCase();
    const rawBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readNonStreamingResponseBody"])(providerResponse, contentType, upstreamStream);
    const normalizedProviderPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizePayloadForLog"])(rawBody);
    const looksLikeSSE = contentType.includes("text/event-stream") || contentType.includes("application/x-ndjson") || /(^|\n)\s*(event|data):/m.test(rawBody);
    if (looksLikeSSE) {
        const streamPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeNonStreamingEventPayload"])(rawBody, contentType);
        const streamKind = contentType.includes("application/x-ndjson") ? "NDJSON" : "SSE";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldTreatBufferedEventResponseAsExpected"])(upstreamStream, providerHeaders, finalBody)) {
            log?.debug?.("STREAM", `Buffering upstream ${streamKind} response for non-streaming client request`);
        } else {
            log?.warn?.("STREAM", `Unexpected ${streamKind} response for non-streaming request — buffering`);
        }
        // Upstream returned an event stream for a non-streaming client; convert best-effort to JSON.
        const parsedFromSSE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNonStreamingSSEPayload"])(streamPayload, targetFormat, model);
        if (!parsedFromSSE) {
            // Some executors (e.g. the Devin/Windsurf CLI) always emit text/event-stream, signalling
            // failure with an error-only chunk (`data: {"error":{"message":"Devin CLI not found..."}}`)
            // that carries no `choices`. Surface that real, sanitized message instead of the generic 502
            // so the actionable error is not swallowed (#3324).
            const surfacedSseError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$sseParser$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractSSEErrorMessage"])(streamPayload);
            const invalidSseMessage = surfacedSseError || "Invalid SSE response for non-streaming request";
            return {
                kind: "invalid_sse",
                message: invalidSseMessage,
                looksLikeSSE: true,
                normalizedProviderPayload
            };
        }
        return {
            kind: "ok",
            responseBody: parsedFromSSE.body,
            responsePayloadFormat: parsedFromSSE.format,
            looksLikeSSE: true,
            normalizedProviderPayload
        };
    }
    try {
        const responseBody = rawBody ? JSON.parse(rawBody) : {};
        return {
            kind: "ok",
            responseBody,
            responsePayloadFormat: targetFormat,
            looksLikeSSE: false,
            normalizedProviderPayload
        };
    } catch (err) {
        const detailedError = `Invalid JSON response from provider (error: ${err instanceof Error ? err.message : String(err)}): ${rawBody.substring(0, 1000)}`;
        const invalidJsonMessage = "Invalid JSON response from provider";
        return {
            kind: "invalid_json",
            message: invalidJsonMessage,
            detailedError,
            looksLikeSSE: false,
            normalizedProviderPayload
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/nonStreamingUsageStats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "recordNonStreamingUsageStats",
    ()=>recordNonStreamingUsageStats
]);
/**
 * chatCore non-streaming usage-stats persistence (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501 — response-handling slice of executeProviderRequest).
 *
 * Extracted from handleChatCore's non-streaming success path: records per-request usage analytics
 * for a successful non-streaming response — an optional trace console line, the fire-and-forget
 * `saveRequestUsage` row, and the per-api-key billable-token counter. Side-effect only (no handler
 * state is mutated, nothing is returned); best-effort, every write swallows its own errors. The
 * per-request context is threaded via `ctx` so the call site stays byte-identical; behaviour is
 * unchanged.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/stream.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/usageTracking.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenLimitCounter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function logUsageTrace(usage, provider, connectionId) {
    const msg = `[${new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
    })}] 📊 [USAGE] ${provider?.toUpperCase()} | ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["formatUsageLog"])(usage)}${connectionId ? ` | account=${connectionId.slice(0, 8)}...` : ""}`;
    console.log(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COLORS"].green}${msg}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COLORS"].reset}`);
}
function persistUsageRow(usage, ctx) {
    const { provider, connectionId, model, startTime, apiKeyInfo, effectiveServiceTier } = ctx;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveRequestUsage"])({
        provider: provider || "unknown",
        model: model || "unknown",
        tokens: usage,
        status: "200",
        success: true,
        latencyMs: Date.now() - startTime,
        timeToFirstTokenMs: Date.now() - startTime,
        errorCode: null,
        timestamp: new Date().toISOString(),
        connectionId: connectionId || undefined,
        apiKeyId: apiKeyInfo?.id || undefined,
        apiKeyName: apiKeyInfo?.name || undefined,
        serviceTier: effectiveServiceTier,
        comboStrategy: ctx.isCombo ? ctx.comboStrategy || undefined : undefined,
        endpoint: ctx.endpoint || undefined
    }).catch((err)=>{
        console.error("Failed to save usage stats:", err.message);
    });
}
function recordBillableTokens(usage, apiKeyInfo, provider, model) {
    if (!apiKeyInfo?.id) return;
    try {
        const billable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["computeBillableTokens"])(usage);
        if (billable > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordTokenUsage"])(apiKeyInfo.id, provider || "unknown", model || "unknown", billable);
    } catch  {
    // never block the response on counter recording
    }
}
function recordNonStreamingUsageStats(usage, ctx) {
    if (!usage || typeof usage !== "object") return;
    if (ctx.traceEnabled) logUsageTrace(usage, ctx.provider, ctx.connectionId);
    persistUsageRow(usage, ctx);
    recordBillableTokens(usage, ctx.apiKeyInfo, ctx.provider, ctx.model);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/upstreamExecuteHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildUpstreamHeadersForExecute",
    ()=>buildUpstreamHeadersForExecute
]);
/**
 * chatCore per-model upstream extra-header builder (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure builder extracted from handleChatCore: assembles the per-model upstream extra headers for an
 * execute() call. Merges the configured per-model headers (for the resolved model and its alias),
 * applies a connection's custom User-Agent override, and opts into Claude Fast Mode (CPA bridge
 * header) when enabled in settings for the canonical `claude` provider and a supported model.
 * Side-effect-free; behaviour is byte-identical to the previous inline closure.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelDeprecation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/modelDeprecation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeFastMode$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/claudeFastMode.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function buildUpstreamHeadersForExecute(opts) {
    const { modelToCall, effectiveModel, provider, model, resolvedModel, sourceFormat, connectionCustomUserAgent, connectionCustomHeaders, settings } = opts;
    const upstreamHeaders = modelToCall === effectiveModel ? {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelUpstreamExtraHeaders"])(provider || "", model || "", sourceFormat),
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelUpstreamExtraHeaders"])(provider || "", resolvedModel || "", sourceFormat)
    } : (()=>{
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelDeprecation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelAlias"])(modelToCall);
        return {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelUpstreamExtraHeaders"])(provider || "", modelToCall || "", sourceFormat),
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelUpstreamExtraHeaders"])(provider || "", r || "", sourceFormat)
        };
    })();
    if (connectionCustomUserAgent) {
        upstreamHeaders["User-Agent"] = connectionCustomUserAgent;
        if ("user-agent" in upstreamHeaders) {
            upstreamHeaders["user-agent"] = connectionCustomUserAgent;
        }
    }
    // #8369: merge connection-level custom headers UNDER model-level so model-level wins on the
    // same case-insensitive header name. Forbidden header names (hop-by-hop, auth) are silently
    // skipped via isForbiddenCustomHeaderName().
    if (connectionCustomHeaders) {
        for (const [key, value] of Object.entries(connectionCustomHeaders)){
            const keyLower = key.trim().toLowerCase();
            if (!keyLower) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(key)) continue;
            const existingKey = Object.keys(upstreamHeaders).find((k)=>k.toLowerCase() === keyLower);
            if (!existingKey) {
                upstreamHeaders[key] = value;
            }
        }
    }
    // Claude Fast Mode opt-in. When enabled in Settings > AI AND the target provider is the canonical
    // Anthropic `claude` provider (Claude Code-compatible CPA bridges are excluded since they select
    // their own entrypoint) AND the model id matches the configured list, signal to a paired
    // CLIProxyAPI build to rewrite the cc_entrypoint so the request reaches Anthropic Fast Mode.
    if (provider === "claude" && typeof settings !== "undefined" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeFastMode$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldRequestClaudeFastMode"])(settings, modelToCall)) {
        upstreamHeaders[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeFastMode$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CPA_FORCE_FAST_MODE_HEADER"]] = "1";
    }
    return upstreamHeaders;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/serviceTier.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveEffectiveServiceTier",
    ()=>resolveEffectiveServiceTier,
    "resolveReportedServiceTier",
    ()=>resolveReportedServiceTier
]);
/**
 * chatCore Codex service-tier resolvers (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure, side-effect-free extraction of the two service-tier resolvers that used to be inline
 * closures at the top of handleChatCore. Both are no-ops for non-Codex providers; for Codex they
 * read the client-supplied `service_tier`, normalize it, and fall back to the per-connection
 * request defaults. Behaviour is byte-identical to the previous inline code — the handler now binds
 * `provider`/`providerSpecificData` once and delegates here.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
;
function resolveEffectiveServiceTier(provider, providerSpecificData, requestBody) {
    if (provider !== "codex") return "standard";
    const requestRecord = requestBody && typeof requestBody === "object" && !Array.isArray(requestBody) ? requestBody : {};
    const rawServiceTier = requestRecord.service_tier;
    if (typeof rawServiceTier === "string" && rawServiceTier.trim().length > 0) {
        const normalizedServiceTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeCodexServiceTier"])(rawServiceTier);
        if (normalizedServiceTier) return normalizedServiceTier;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexRequestDefaults"])(providerSpecificData).serviceTier ?? "standard";
}
function resolveReportedServiceTier(provider, payload, maxDepth = 3) {
    if (maxDepth <= 0 || provider !== "codex" || !payload || typeof payload !== "object" || Array.isArray(payload)) {
        return null;
    }
    const record = payload;
    const rawServiceTier = record.service_tier;
    if (typeof rawServiceTier === "string" && rawServiceTier.trim().length > 0) {
        const normalizedServiceTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeCodexServiceTier"])(rawServiceTier);
        if (normalizedServiceTier) return normalizedServiceTier;
    }
    return resolveReportedServiceTier(provider, record.response, maxDepth - 1);
}
}),
"[project]/open-sse/handlers/chatCore/codexQuota.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildCodexQuotaPersistence",
    ()=>buildCodexQuotaPersistence
]);
/**
 * chatCore Codex quota-persistence builder (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Pure core of handleChatCore's persistCodexQuotaState: turns the upstream Codex quota response
 * headers into the next `providerSpecificData` payload (the codexQuotaState snapshot, plus — on a
 * 429 whose dual-window usage is past the exhaustion threshold — the per-scope cooldown timestamp,
 * the exhausted window, and the debug-log message). The handler keeps the impure parts byte-
 * identically: the DB write (updateProviderConnection), the preflight-cache invalidation on every
 * 429, the credentials mutation, and emitting the returned log line.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/codex.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$quota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/codex/quota.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function buildCodexQuotaPersistence(opts) {
    const { headers, existingProviderData, modelForScope, status } = opts;
    const quota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$quota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseCodexQuotaHeaders"])(headers);
    if (!quota) return null;
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(modelForScope);
    const quotaState = {
        usage5h: quota.usage5h,
        limit5h: quota.limit5h,
        resetAt5h: quota.resetAt5h,
        usage7d: quota.usage7d,
        limit7d: quota.limit7d,
        resetAt7d: quota.resetAt7d,
        scope,
        updatedAt: new Date().toISOString()
    };
    const nextProviderData = {
        ...existingProviderData,
        codexQuotaState: quotaState
    };
    let exhaustionLog = null;
    // T03/T09: on 429, persist exact reset time per scope to avoid global over-blocking.
    // Use dual-window cooldown to distinguish short-term and weekly Codex exhaustion.
    if (status === 429) {
        const { cooldownMs, window: exhaustedWindow } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$quota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexDualWindowCooldownMs"])(quota);
        if (cooldownMs > 0) {
            const scopeUntil = new Date(Date.now() + cooldownMs).toISOString();
            const scopeMapRaw = existingProviderData && typeof existingProviderData === "object" && existingProviderData.codexScopeRateLimitedUntil && typeof existingProviderData.codexScopeRateLimitedUntil === "object" ? existingProviderData.codexScopeRateLimitedUntil : {};
            nextProviderData.codexScopeRateLimitedUntil = {
                ...scopeMapRaw,
                [scope]: scopeUntil
            };
            nextProviderData.codexExhaustedWindow = exhaustedWindow;
            exhaustionLog = `Quota exhaustion on ${exhaustedWindow} window, cooldown until ${scopeUntil}`;
        }
    }
    return {
        nextProviderData,
        exhaustionLog
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/clineResponseEnvelope.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unwrapClineNonStreamingEnvelope",
    ()=>unwrapClineNonStreamingEnvelope
]);
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function hasOpenAIChoices(value) {
    return isRecord(value) && Array.isArray(value.choices);
}
function unwrapClineNonStreamingEnvelope(provider, responseBody) {
    if (provider !== "cline" || !isRecord(responseBody)) {
        return responseBody;
    }
    const data = responseBody.data;
    if (!hasOpenAIChoices(data)) {
        return responseBody;
    }
    return {
        ...data,
        usage: isRecord(data) && data.usage !== undefined ? data.usage : responseBody.usage
    };
}
}),
"[project]/open-sse/handlers/chatCore/backgroundRedirect.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveBackgroundTaskRedirect",
    ()=>resolveBackgroundTaskRedirect
]);
/**
 * chatCore Background Task Redirection decision (T41) (Quality Gate v2 / Fase 9 — chatCore god-file
 * decomposition, #3501).
 *
 * Decides whether a request should be downgraded to a cheaper "degraded" model: only when the
 * feature is enabled, the request looks like a background/utility task, AND the model has a
 * degradation mapping. Returns the target model + the detection reason, or null for no redirect.
 * The handler keeps the side effects byte-identically (the BACKGROUND log, the model + body.model
 * mutation, and the audit event). Reads the live backgroundTaskDetector config, mirroring the
 * previous inline block.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$backgroundTaskDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/backgroundTaskDetector.ts [instrumentation] (ecmascript)");
;
function resolveBackgroundTaskRedirect(opts) {
    const bgConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$backgroundTaskDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getBackgroundDegradationConfig"])();
    const backgroundReason = bgConfig.enabled ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$backgroundTaskDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getBackgroundTaskReason"])(opts.body, opts.headers ?? null) : null;
    if (!backgroundReason) return {
        backgroundReason: null,
        redirect: null
    };
    const degradedModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$backgroundTaskDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDegradedModel"])(opts.model);
    if (degradedModel === opts.model) return {
        backgroundReason,
        redirect: null
    };
    return {
        backgroundReason,
        redirect: {
            degradedModel,
            reason: backgroundReason
        }
    };
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
"[project]/open-sse/handlers/chatCore.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleChatCore",
    ()=>handleChatCore,
    "isTokenExpiringSoon",
    ()=>isTokenExpiringSoon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memorySkillsInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/memorySkillsInjection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$requestSetup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/requestSetup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$failureUsage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/failureUsage.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$contextEstimation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/contextEstimation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeSystemRole$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/claudeSystemRole.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$idempotency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/idempotency.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/semanticCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeClassifierCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/claudeClassifierCompat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$clientUsageBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/clientUsageBuffer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$postCallGuardrailContext$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/postCallGuardrailContext.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$semanticCacheStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/semanticCacheStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingResponseHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingJsonResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingJsonResponse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$outputTokenBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/outputTokenBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$jsonBodyToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/jsonBodyToSse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamingResponseHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingSemanticCacheStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamingSemanticCacheStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingPipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamingPipeline.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$sanitization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/sanitization.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexFailover$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/codexFailover.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deviceTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/deviceTracker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/comboContextCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/executorHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/passthroughHelpers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$thinkingSignatureRecovery$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/thinkingSignatureRecovery.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/responseHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/telemetryHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memoryExtraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/memoryExtraction.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/resourcePressure.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$requestFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/requestFormat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$targetFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/targetFormat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$agentRouterProtocol$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/agentRouterProtocol.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeToolDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/claudeToolDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemPrompt$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/systemPrompt.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$additionalTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/additionalTools.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kiroSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kiroSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/claudeHelper.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeConstraints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/stream.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/usageTracking.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamReadiness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamReadiness.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkCloseMarker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/thinkCloseMarker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamReadinessPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamReadinessPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$agentGoalPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/agentGoalPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamFailureFinalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamFailureFinalization.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/casGuard.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/requestLogger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/providerRequestLogging.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolSources$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/toolSources.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStatePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesStatePolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeEffortVariant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/claudeEffortVariant.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/defaultThinkingSignature.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/modelStrip.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelDeprecation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/modelDeprecation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$mimoThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/mimoThinking.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeReasoningSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/opencodeReasoningSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeAdaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeAdaptiveThinking.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/claudeIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeHaikuConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeHaikuConstraints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$defaultReasoningEffort$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/defaultReasoningEffort.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responseModelEcho$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/responseModelEcho.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gpt5SamplingGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/gpt5SamplingGuard.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$unsupportedParamsStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/unsupportedParamsStrip.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$toolCallingRequiredCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/toolCallingRequiredCheck.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningTokenBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/reasoningTokenBuffer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$diagnostics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/diagnostics.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenLimitCounter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$streamRecovery$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/streamRecovery.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/errorClassifier.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$keyHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/keyHealth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$skillsFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/skillsFormat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingResponseBody.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamErrorResult$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamErrorResult.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamFinalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamFinalize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cacheUsageMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/cacheUsageMeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorClientHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/executorClientHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executionCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/executionCredentials.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/executorProxy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeUpstreamMessages$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/claudeUpstreamMessages.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$attemptLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/attemptLogging.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$stageTrace$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/stageTrace.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionUsageReceipt$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/compressionUsageReceipt.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamBody.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/compliance/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/events/eventBus.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/bodyAdapter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineBreakdown$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineBreakdown.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$bypassHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/bypassHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/pendingRequestScope.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$costRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/costRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughToolNames$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/passthroughToolNames.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/compressionSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$exclusions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/exclusions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionComboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/compressionComboPredicates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$outputStyleTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/outputStyleTelemetry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionAnalyticsWrite$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/compressionAnalyticsWrite.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$pluginOnRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/pluginOnRequest.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$contextEditingTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/contextEditingTelemetry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionCacheStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/compressionCacheStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cavemanOutputAnalytics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/cavemanOutputAnalytics.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$quotaShareConsumption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/quotaShareConsumption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$gamificationEvent$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/gamificationEvent.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$pluginOnResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/pluginOnResponse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingQuotaShare$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamingQuotaShare.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamingUsageStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingCost$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/streamingCost.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseParse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingResponseParse.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$clinepassEnvelope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/clinepassEnvelope.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/nonStreamingUsageStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cacheControlSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cacheControlSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/guardrails/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cacheControlPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$codexFastTier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/codexFastTier.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamExecuteHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamExecuteHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$serviceTier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/serviceTier.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/reasoningCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/codex.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexQuota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/codexQuota.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codexQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseTranslator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseTranslator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$clineResponseEnvelope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/clineResponseEnvelope.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$usageExtractor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/usageExtractor.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer/reasoning.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rateLimitManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountSemaphore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/idempotencyLayer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/modelFamilyFallback.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$requestDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/requestDedup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$backgroundRedirect$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/backgroundRedirect.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/webSearchFallback.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webFetchInterception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/webFetchInterception.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/interceptionRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$aiSdkCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/aiSdkCompat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/extraction.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$interception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/interception.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelscopePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/modelscopePolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiRateLimitTracker.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memorySkillsInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$idempotency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$clientUsageBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$postCallGuardrailContext$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$jsonBodyToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingPipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexFailover$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamFailureFinalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$keyHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$attemptLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$bypassHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseParse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cacheControlSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamExecuteHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexQuota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$interception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memorySkillsInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$idempotency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$clientUsageBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$postCallGuardrailContext$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$jsonBodyToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingPipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexFailover$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamFailureFinalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$keyHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$attemptLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$bypassHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseParse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cacheControlSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamExecuteHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexQuota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$interception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function handleChatCore({ body, modelInfo, credentials, log, onCredentialsRefreshed, onRequestSuccess, onStreamFailure, onDisconnect, clientRawRequest, connectionId, apiKeyInfo = null, userAgent, comboName, comboStrategy = null, isCombo = false, routingComboId = null, comboStepId = null, comboExecutionKey = null, cachedSettings = null, skipUpstreamRetry = false, createPiiTransform = null, correlationId = null, modelPinned = false, skipResourcePressureGuard = false }) {
    let { provider, model, extendedContext } = modelInfo;
    if (!skipResourcePressureGuard) {
        try {
            const pressureGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkResourcePressureGuard"])();
            if (pressureGuard) return pressureGuard;
        } catch  {
        /* fail open */ }
    }
    // Per-request model-routing metadata (first extracted slice of the request-setup phase).
    const { apiFormat, customModelTargetFormat, requestedModel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$requestSetup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveChatCoreRequestSetup"])(modelInfo, body, model);
    const isModelScope = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelscopePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelScopeProvider"])(provider, credentials?.providerSpecificData);
    const startTime = Date.now();
    // Per-request trace id + checkpoint helper. Lets us see exactly which await
    // a hung request was sitting on in `[STAGE_TRACE]` log lines. Uses crypto RNG
    // (not Math.random) purely to satisfy CodeQL js/insecure-randomness — this id
    // is a log-correlation token, not a security secret.
    const traceId = globalThis.crypto.randomUUID().slice(0, 6);
    // Emit request.started event for real-time dashboard
    setImmediate(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("request.started", {
            id: traceId,
            model: model || "unknown",
            provider: provider || "unknown",
            timestamp: startTime,
            comboName: comboName || undefined
        });
    });
    const traceEnabled = process.env.OMNIROUTE_TRACE === "true" || process.env.DEBUG === "true";
    // Stage trace extracted to chatCore/stageTrace.ts (#3501); bind the per-request inputs once so the
    // call sites stay byte-identical.
    const trace = (label, extra)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$stageTrace$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stageTrace"])(label, extra, {
            traceEnabled,
            startTime,
            traceId,
            log
        });
    const getCurrentConnectionId = ()=>{
        const credentialConnectionId = typeof credentials?.connectionId === "string" && credentials.connectionId.trim().length > 0 ? credentials.connectionId.trim() : null;
        return credentialConnectionId || connectionId || null;
    };
    let tokensCompressed = null;
    body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemPrompt$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectSystemPrompt"])(body);
    // ── Per-endpoint custom system prompt (port of upstream #2063) ──
    // Reads from cachedSettings if available (passed in from combo/chat layer)
    // to avoid an extra DB read on the hot path. Falls through to getCachedSettings()
    // only when this function is called outside the normal chat dispatch.
    {
        const _s = cachedSettings ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
        if (_s.customSystemPromptEnabled === true && typeof _s.customSystemPrompt === "string" && _s.customSystemPrompt) {
            body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemPrompt$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectCustomSystemPrompt"])(body, _s.customSystemPrompt);
            log?.debug?.("CUSTOMSP", "custom system prompt injected");
        }
    }
    // ── Plugin onRequest hook ──
    // Dynamic import cached by Node.js after first call — minimal overhead
    const pluginGate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$pluginOnRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runPluginOnRequestHook"])({
        requestId: traceId,
        body,
        model,
        provider,
        apiKeyInfo,
        log
    });
    if (pluginGate.blocked) {
        return {
            success: false,
            status: 403,
            // Label the source: this 403 is our own policy decision, not the provider
            // rejecting us. Unlabelled, it is indistinguishable from a real upstream 403
            // and gets the connection banned. Matches the type already sent to the client
            // in pluginOnRequest.ts.
            errorType: "plugin_block",
            errorCode: "plugin_block",
            error: "Request blocked by plugin",
            response: pluginGate.response
        };
    }
    if (pluginGate.body) {
        body = pluginGate.body;
    }
    // Per-API-key device/connection tracking (port of upstream 9router#931,
    // thanks @mugnimaestra). In-memory only, never blocks the request path.
    if (apiKeyInfo?.id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deviceTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["trackDevice"])(apiKeyInfo.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deviceTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractIpFromHeaders"])(clientRawRequest?.headers ?? null), userAgent ?? null);
    }
    const agentGoalPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$agentGoalPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAgentGoalPolicy"])(body, clientRawRequest?.headers ?? null);
    if (agentGoalPolicy.detected) {
        log?.debug?.("AGENT_GOAL", `long-running goal mode enabled: readinessMax=${agentGoalPolicy.readinessMaxTimeoutMs}ms streamRecovery=${agentGoalPolicy.streamRecoveryEnabled}`);
    }
    let effectiveServiceTier = "standard";
    // Codex service-tier resolvers extracted to chatCore/serviceTier.ts (#3501); bind the per-request
    // provider/credentials once and delegate so the existing call sites stay byte-identical.
    const resolveEffectiveServiceTier = (requestBody)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$serviceTier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveEffectiveServiceTier"])(provider, credentials?.providerSpecificData, requestBody);
    const resolveReportedServiceTier = (payload, maxDepth = 3)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$serviceTier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveReportedServiceTier"])(provider, payload, maxDepth);
    // Failure usage record building extracted to chatCore/failureUsage.ts (#3501); the handler keeps
    // the fire-and-forget save + computes latencyMs, so the call sites stay byte-identical.
    const persistFailureUsage = (statusCode, errorCode)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveRequestUsage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$failureUsage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFailureUsageRecord"])({
            provider,
            model,
            connectionId: getCurrentConnectionId(),
            apiKeyInfo,
            effectiveServiceTier,
            isCombo,
            comboStrategy,
            statusCode,
            errorCode,
            latencyMs: Date.now() - startTime,
            endpoint: endpointPath
        })).catch(()=>{});
    };
    // Key-health updater extracted to chatCore/keyHealth.ts (#3501); bind the per-request log once
    // and delegate so the existing call sites stay byte-identical.
    const recordKeyHealthStatus = (status, creds, transport)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$keyHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordKeyHealthStatus"])(status, creds, log, transport);
    const persistCodexQuotaState = async (headers, status = 0)=>{
        const currentConnectionId = getCurrentConnectionId();
        if (provider !== "codex" || !currentConnectionId || !headers) return;
        try {
            const existingProviderData = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" ? credentials.providerSpecificData : {};
            // Pure payload build extracted to chatCore/codexQuota.ts (#3501). Returns null when the
            // response carries no quota headers (nothing to persist).
            const built = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexQuota$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildCodexQuotaPersistence"])({
                headers,
                existingProviderData,
                modelForScope: model || requestedModel || "",
                status
            });
            if (!built) return;
            if (built.exhaustionLog) {
                log?.debug?.("CODEX", built.exhaustionLog);
            }
            // Invalidate the preflight cache for this connection so the next
            // isModelAvailable check fetches fresh quota data.
            if (status === 429) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateCodexQuotaCache"])(currentConnectionId);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(currentConnectionId, {
                providerSpecificData: built.nextProviderData
            });
            credentials.providerSpecificData = built.nextProviderData;
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : String(err);
            log?.debug?.("CODEX", `Failed to persist codex quota state: ${errMessage}`);
        }
    };
    // ── Phase 9.2: Idempotency check ──
    // Resolve the idempotency key once here and reuse it at the Phase 9.2 save site below,
    // rather than re-deriving it. (#3821-review LEDGER-6)
    const { hit: idempotencyHit, idempotencyKey } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$idempotency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkIdempotencyCache"])({
        clientRawRequest,
        provider,
        model,
        // NEXA fusion-idempotency fix: body.messages feeds the key digest so combo-internal
        // sub-requests (fusion panel + judge re-enter chatCore sharing the client's headers)
        // can never collide on the raw Idempotency-Key/x-request-id header key.
        body,
        effectiveServiceTier,
        startTime,
        log
    });
    if (idempotencyHit) {
        return idempotencyHit;
    }
    // T07: Inject connectionId into credentials so executors can rotate API keys
    // using providerSpecificData.extraApiKeys (API Key Round-Robin feature)
    if (connectionId && credentials && !credentials.connectionId) {
        credentials.connectionId = connectionId;
    }
    // Endpoint/format resolution extracted to chatCore/requestFormat.ts (#3501); pure derivation
    // from the inbound request, destructured so every downstream use stays byte-identical.
    const { endpointPath, sourceFormat, isResponsesEndpoint, nativeCodexPassthrough, nativeXaiResponsesPassthrough, isDroidCLI, isOpencodeClient, copilotCompatibleReasoning, clientResponseFormat } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$requestFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveChatCoreRequestFormat"])({
        clientRawRequest,
        body,
        provider,
        userAgent
    });
    const responsesInputItems = Array.isArray(body?.input) ? body.input : [];
    const customToolNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$additionalTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collectCustomToolNamesForSourceFormat"])(sourceFormat, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES, body?.tools, responsesInputItems);
    // Check for bypass patterns (warmup, skip) - return fake response
    const bypassResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$bypassHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleBypassRequest"])(body, model, userAgent);
    if (bypassResponse) {
        return bypassResponse;
    }
    // ── Claude Code auto-mode classifier compat (opt-in, default "off") ──
    // Claude Code's `--permission-mode auto` sends an internal classifier request that
    // requires the response to START with `<block>no</block>`/`<block>yes</block>`.
    // When a combo/fallback route sends that call to a cheap model returning 200 with
    // empty content, Claude Code fails closed on every gated action. Detect the
    // classifier request and short-circuit with a synthetic ALLOW response, WITHOUT
    // calling the upstream provider. See chatCore/claudeClassifierCompat.ts.
    {
        const classifierSettings = cachedSettings ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeClassifierCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldDefaultAllowClassifier"])(sourceFormat, body, classifierSettings.claudeClassifierCompat)) {
            log?.warn?.("CHAT", `classifier compat=${classifierSettings.claudeClassifierCompat} | short-circuit default-allow`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeClassifierCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildDefaultAllowClaudeMessage"])(requestedModel);
        }
    }
    // Detect source format and get target format
    // Model-specific targetFormat takes priority over provider default
    // ── Background Task Redirection (T41) — decision extracted to chatCore/backgroundRedirect.ts (#3501)
    // backgroundReason is the detection signal (threaded into memory/skills injection below); redirect
    // is the actual model downgrade to apply, if any.
    const { backgroundReason, redirect: bgRedirect } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$backgroundRedirect$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBackgroundTaskRedirect"])({
        body,
        headers: clientRawRequest?.headers,
        model
    });
    if (bgRedirect) {
        const originalModel = model;
        log?.info?.("BACKGROUND", `Background task redirect (${bgRedirect.reason}): ${originalModel} → ${bgRedirect.degradedModel}`);
        model = bgRedirect.degradedModel;
        if (body && typeof body === "object") {
            body.model = model;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
            action: "routing.background_task_redirect",
            actor: apiKeyInfo?.name || "system",
            target: connectionId || provider || "chat",
            details: {
                original_model: originalModel,
                redirected_to: bgRedirect.degradedModel,
                reason: bgRedirect.reason
            }
        });
    }
    // Apply custom model aliases (Settings → Model Aliases → Pattern→Target) before routing (#315, #472)
    // Custom aliases take priority over built-in and must be resolved here so the
    // downstream getModelTargetFormat() lookup AND the actual provider request use
    // the correct, aliased model ID. Without this, aliases only affect format detection.
    const resolvedModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelDeprecation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelAlias"])(model);
    // Use resolvedModel for all downstream operations (routing, provider requests, logging)
    let effectiveModel = resolvedModel === model ? model : resolvedModel;
    if (resolvedModel !== model) {
        log?.info?.("ALIAS", `Model alias applied: ${model} → ${resolvedModel}`);
    }
    // Effort-variant model ids: the Claude / Claude-Code model picker (e.g. VS Code's
    // "Effort" slider) advertises claude-...-{low,medium,high,xhigh,max}. Anthropic has
    // no such model, so the suffixed id 404s upstream. Strip it back to the real base id
    // (forwarded as the upstream model via finalModelToUpstream below) and surface the
    // level as reasoning_effort so the OpenAI→Claude translator / Claude-Code bridge turn
    // it into Claude thinking/effort config. An explicit client-supplied effort always
    // wins; native Claude passthrough is left untouched (it carries its own `thinking`),
    // and non-thinking base models are cleaned up later by normalizeThinkingForModel().
    // Extracted to chatCore/claudeEffortVariant.ts (#3501); mutates body in place and returns the
    // stripped model + an optional log line, keeping behaviour byte-identical.
    {
        const effortVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeEffortVariant$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyClaudeEffortVariant"])({
            provider,
            effectiveModel,
            body,
            sourceFormat
        });
        effectiveModel = effortVariant.effectiveModel;
        if (effortVariant.log) {
            log?.info?.("PARAMS", effortVariant.log);
        }
    }
    // Wire target-format resolution extracted to chatCore/targetFormat.ts (#3501); `alias` is reused
    // downstream when stripping the alias/ prefix off the upstream model id.
    const { alias, targetFormat } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$targetFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveChatCoreTargetFormat"])({
        provider,
        resolvedModel,
        apiFormat,
        sourceFormat,
        customModelTargetFormat,
        providerSpecificData: credentials?.providerSpecificData,
        nativeXaiResponsesPassthrough
    });
    const nativeResponsesPassthrough = nativeCodexPassthrough || nativeXaiResponsesPassthrough;
    const initialProviderRequest = body && typeof body === "object" && !Array.isArray(body) ? {
        ...body,
        model: typeof body.model === "string" ? body.model : effectiveModel
    } : body;
    // Track pending requests before slower optional enrichment (settings, logging,
    // compression) so internal usage/runtime counters stay accurate even when
    // upstream never returns response headers.
    // Use credentials.connectionId as a fallback so that requests without an
    // explicit session-level connectionId still register in the pendingRequests map.
    const pendingConnId = connectionId || credentials?.connectionId || null;
    const pendingRequestId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, pendingConnId, true, {
        clientEndpoint: clientRawRequest?.endpoint || "/v1/chat/completions",
        clientRequest: clientRawRequest?.body ?? body,
        providerRequest: initialProviderRequest,
        stage: "registered",
        correlationId
    }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])();
    // Initialize rate limit settings from persisted DB (once, lazy)
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["initializeRateLimits"])();
    // #3384: per-model interception rule (src/lib/db/interceptionRules.ts) overrides the
    // native-bypass defaults below when the operator explicitly configured it for this
    // provider/model pair; undefined falls through to the existing bypass logic.
    const interceptSearchOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveInterceptSearch"])(provider, effectiveModel);
    const { body: bodyWithWebSearchFallback, fallback: webSearchFallbackPlan } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareWebSearchFallbackBody"])(body, {
        provider,
        sourceFormat,
        targetFormat,
        nativeCodexPassthrough: nativeResponsesPassthrough,
        interceptSearchOverride
    });
    if (webSearchFallbackPlan.enabled) {
        body = bodyWithWebSearchFallback;
        log?.info?.("TOOLS", `Converted ${webSearchFallbackPlan.convertedToolCount} web_search tool(s) to OmniRoute fallback for ${provider}`);
    }
    // #7339: interceptFetch (Phase 3-4 of #3384) — same per-model rule + native-bypass
    // pattern as interceptSearch directly above.
    const interceptFetchOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveInterceptFetch"])(provider, effectiveModel);
    const { body: bodyWithWebFetchFallback, fallback: webFetchFallbackPlan } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webFetchInterception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareWebFetchFallbackBody"])(body, {
        provider,
        sourceFormat,
        targetFormat,
        nativeCodexPassthrough: nativeResponsesPassthrough,
        interceptFetchOverride
    });
    if (webFetchFallbackPlan.enabled) {
        body = bodyWithWebFetchFallback;
        log?.info?.("TOOLS", `Converted ${webFetchFallbackPlan.convertedToolCount} web_fetch tool(s) to OmniRoute fallback for ${provider}`);
    }
    const noLogEnabled = apiKeyInfo?.noLog === true;
    // Consolidate settings reads — fetch once, reuse throughout the request
    const settings = cachedSettings ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
    // Opt-in tool-source diagnostics (#1825): summarize the request's tool definitions
    // (count + MCP/hosted/client source breakdown + first names) as a single debug line.
    if (settings.logToolSources === true) {
        const toolSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolSources$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["summarizeToolSources"])(body.tools);
        if (toolSummary) log?.debug?.("TOOLS", toolSummary);
    }
    // #1311 (opt-in): echo the client-requested alias/combo name in the response `model`
    // field instead of the upstream model, so strict clients (Claude Desktop) that validate
    // response.model === request.model stop rejecting alias/combo requests with a 401.
    // #3697: always echo it for Codex CLI clients on the Responses API — regardless of the
    // opt-in setting — since the Codex CLI status line/model button reads `response.model`
    // to display the active model + reasoning effort (e.g. `gpt-5.5-xhigh`). Detection is by
    // request headers (originator/User-Agent), not by the routed provider, so it still fires
    // when `codex/gpt-5.5-xhigh` is routed through a combo to a non-codex upstream.
    const isCodexResponsesEcho = (isResponsesEndpoint || sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCodexOriginatedHeaders"])(clientRawRequest?.headers);
    const echoModel = (settings.echoRequestedModelName === true || isCodexResponsesEcho) && typeof requestedModel === "string" && requestedModel ? requestedModel : null;
    const detailedLoggingEnabled = !noLogEnabled && (settings.call_log_pipeline_enabled === true || settings.call_log_pipeline_enabled === "1" || settings.call_log_pipeline_enabled === "true");
    const capturePipelineStreamChunks = detailedLoggingEnabled && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogPipelineCaptureStreamChunks"])();
    const skillRequestId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])();
    let compressionAnalyticsWritePromise = null;
    // Compression usage-receipt attachment extracted to chatCore/compressionUsageReceipt.ts (#3501);
    // pass the in-flight analytics write + request id so behaviour stays byte-identical.
    const attachCompressionUsageReceiptAfterAnalytics = (usage, source)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionUsageReceipt$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachCompressionUsageReceiptAfterAnalytics"])(usage, source, {
            pendingWrite: compressionAnalyticsWritePromise,
            skillRequestId
        });
    // #8249: raw header value, kept separate from `pipelineSessionId`'s skillRequestId fallback
    // below so call_logs.session_tag is only ever set when the caller explicitly supplied the
    // header — never synthesized from the internal per-request skillRequestId.
    const explicitSessionIdHeader = (clientRawRequest?.headers && typeof clientRawRequest.headers.get === "function" ? clientRawRequest.headers.get("x-omniroute-session-id") : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(clientRawRequest?.headers ?? null, "x-omniroute-session-id")) || null;
    const pipelineSessionId = explicitSessionIdHeader || skillRequestId;
    // persistAttemptLogs extracted to chatCore/attemptLogging.ts (#3501); bind the per-request context
    // once so the 16 call sites keep passing only the per-attempt args (byte-identical).
    const persistAttemptLogs = (args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$attemptLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["persistAttemptLogs"])(args, {
            traceId,
            provider,
            connectionId,
            model,
            skillRequestId,
            detailedLoggingEnabled,
            reqLogger,
            pendingRequestId,
            clientRawRequest,
            requestedModel,
            credentials,
            startTime,
            body,
            sourceFormat,
            targetFormat,
            comboName,
            comboStepId,
            comboExecutionKey,
            tokensCompressed,
            apiKeyInfo,
            noLogEnabled,
            correlationId,
            modelPinned,
            sessionTag: explicitSessionIdHeader
        });
    // Primary path: merge client model id + alias target so config on either key applies; resolved
    // id wins on same header name. T5 family fallback uses only (nextModel, resolveModelAlias(next))
    // so A-model headers are not sent to B — see buildUpstreamHeadersForExecute.
    const connectionCustomUserAgent = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && typeof credentials.providerSpecificData.customUserAgent === "string" ? credentials.providerSpecificData.customUserAgent.trim() : "";
    // #8369: connection-level custom upstream headers from provider_specific_data.
    const connectionCustomHeaders = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && typeof credentials.providerSpecificData.customHeaders === "object" && !Array.isArray(credentials.providerSpecificData.customHeaders) ? credentials.providerSpecificData.customHeaders : undefined;
    // Upstream extra-header building extracted to chatCore/upstreamExecuteHeaders.ts (#3501); bind the
    // per-request inputs once and delegate so the existing call sites stay byte-identical.
    const buildUpstreamHeadersForExecute = (modelToCall)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamExecuteHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildUpstreamHeadersForExecute"])({
            modelToCall,
            effectiveModel,
            provider,
            model,
            resolvedModel,
            sourceFormat,
            connectionCustomUserAgent,
            connectionCustomHeaders,
            settings
        });
    // Default to false unless client explicitly sets stream: true (OpenAI spec compliant)
    const acceptHeader = clientRawRequest?.headers && typeof clientRawRequest.headers.get === "function" ? clientRawRequest.headers.get("accept") || clientRawRequest.headers.get("Accept") : clientRawRequest?.headers?.["accept"] || clientRawRequest?.headers?.["Accept"];
    const streamUserAgent = [
        typeof userAgent === "string" ? userAgent : "",
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(clientRawRequest?.headers ?? null, "user-agent") || ""
    ].filter(Boolean).join(" ");
    // Explicit per-request opt-in/out for the `</think>` close marker
    // (#5312 / #5245): `x-omniroute-thinking-marker: off` suppresses it for
    // reasoning_content-native clients (e.g. Cursor's OpenAI path) that the UA
    // allowlist does not cover; absent the header, the UA policy applies.
    const thinkingMarkerHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(clientRawRequest?.headers ?? null, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkCloseMarker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["THINKING_MARKER_HEADER"]);
    const explicitStreamAlias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$aiSdkCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveExplicitStreamAlias"])(body);
    // Remove non-standard non-stream aliases before provider translation/execution.
    // They are accepted for compatibility at the OmniRoute API boundary only.
    if (body && typeof body === "object") {
        const b = body;
        if (explicitStreamAlias !== undefined) {
            b.stream = explicitStreamAlias;
        }
        delete b.non_stream;
        delete b.disable_stream;
        delete b.disable_streaming;
        delete b.streaming;
    }
    // Codex /responses/compact is JSON-only: Codex CLI does not send stream=false,
    // so route shape must override the usual Accept/header fallback.
    // sourceFormat="claude" applies the Anthropic Messages spec default (stream=false
    // when body omits stream), preventing STREAM_EARLY_EOF on /v1/messages when
    // clients send Accept: */* without an explicit stream flag.
    // providerRequiresStreaming: providers with forceStream:true (cline/clinepass)
    // only implement upstream streaming — a non-streaming request returns
    // "generateText is not implemented" / an empty body. This flag forces the
    // UPSTREAM request to stream (see `upstreamStream` below), but it MUST NOT
    // force the client-facing `stream` flag: a stream:false client (e.g. the
    // model-test button, plain JSON API callers) still expects a JSON response.
    // The client-side `if (!stream)` branch drains the forced upstream SSE and
    // converts it back to JSON via readNonStreamingResponseBody. Passing this
    // flag into resolveStreamFlag would force `stream=true` and skip that
    // conversion, yielding STREAM_EARLY_EOF for JSON callers. (#2081, #6126)
    const providerRequiresStreaming = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"][provider]?.forceStream === true;
    const stream = nativeCodexPassthrough && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompactResponsesEndpoint"])(endpointPath) ? false : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$aiSdkCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStreamFlag"])(body?.stream, acceptHeader, sourceFormat, {
        userAgent: streamUserAgent,
        streamDefaultMode: apiKeyInfo?.streamDefaultMode
    });
    // `settings` is already consolidated once near the top of handleChatCore
    // (the "fetch once, reuse" const). A second `const settings` here was a
    // duplicate same-scope declaration that broke the esbuild/tsx transform
    // ("settings has already been declared") and the production build. Reuse it.
    credentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$codexFastTier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCodexGlobalFastServiceTier"])(provider, credentials, settings, {
        model: requestedModel,
        body: body && typeof body === "object" ? body : null
    });
    effectiveServiceTier = resolveEffectiveServiceTier(body);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setGeminiThoughtSignatureMode"])(settings.antigravitySignatureCacheMode);
    const semanticCacheEnabled = settings.semanticCacheEnabled !== false;
    const reqLogger = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createRequestLogger"])(sourceFormat, targetFormat, model, {
        enabled: detailedLoggingEnabled,
        captureStreamChunks: capturePipelineStreamChunks,
        maxStreamChunkBytes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogPipelineMaxSizeBytes"])(),
        requestId: pendingRequestId,
        model,
        provider: provider || undefined,
        connectionId: connectionId || credentials?.connectionId || undefined
    });
    const pendingScope = {
        id: pendingRequestId,
        model,
        provider,
        connectionId: pendingConnId
    };
    const providerRequestCapture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createPreparedRequestLogger"])(reqLogger, pendingScope);
    // 0. Log client raw request (before format conversion)
    if (clientRawRequest) {
        reqLogger.logClientRawRequest(clientRawRequest.endpoint, clientRawRequest.body, clientRawRequest.headers);
    }
    const reasoningRouteDecision = body && typeof body === "object" ? body._omnirouteReasoningRouteTrace : null;
    if (reasoningRouteDecision) {
        reqLogger.logRouteDecision(reasoningRouteDecision);
        body = {
            ...body
        };
        delete body._omnirouteReasoningRouteTrace;
    }
    log?.debug?.("FORMAT", `${sourceFormat} → ${targetFormat} | stream=${stream}`);
    // ── Phase 9.1: Semantic cache check (temp=0, any streaming mode) ──
    const cacheHit = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkSemanticCache"])({
        semanticCacheEnabled,
        body,
        clientRawRequest,
        model,
        provider,
        stream: !!stream,
        reqLogger,
        effectiveServiceTier,
        connectionId,
        startTime,
        log,
        persistAttemptLogs,
        apiKeyId: apiKeyInfo?.id ?? undefined
    });
    if (cacheHit) {
        return cacheHit;
    }
    body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$sanitization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeChatRequestBody"])(body, sourceFormat, targetFormat);
    // Per-request opt-out: clients that manage their own context send
    // `x-omniroute-no-memory: true` to skip memory+skills injection (a null owner
    // disables both branches in injectMemoryAndSkills). See PRD-2026-06-19-no-memory-header.
    const memoryOwnerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isNoMemoryRequested"])(clientRawRequest?.headers ?? null) ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memoryExtraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveMemoryOwnerId"])(apiKeyInfo);
    const injectionResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memorySkillsInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectMemoryAndSkills"])({
        body,
        memoryOwnerId,
        provider,
        effectiveModel,
        sourceFormat,
        targetFormat,
        backgroundReason,
        log
    });
    body = injectionResult.body;
    const memorySettings = injectionResult.memorySettings;
    // Translate request (pass reqLogger for intermediate logging)
    // ── Proactive Context Compression (Phase 4) ──
    // Check if context exceeds 70% of limit and compress proactively before sending to provider.
    // This prevents "prompt too long" errors for large-but-not-full contexts.
    const compressionBody = body ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body).body : null;
    const allMessages = compressionBody?.messages || body?.contents || body?.request?.contents || [];
    let cavemanOutputModeApplied = false;
    let cavemanOutputModeIntensity = null;
    let preCompressionBody = null;
    let compressionResponseMeta = null;
    // Delegated Context Editing (Claude only): captured at the canonical compression
    // settings read below, then threaded to executor.execute() further down. Lives at
    // function scope because the read happens inside the per-message compression block.
    let contextEditingEnabled = false;
    // The dashboard's global compression switch must also control the built-in
    // reactive and last-resort compaction passes. Otherwise an operator selecting
    // "off" still has large histories rewritten by trim_tools/purify_history.
    let reactiveContextCompactionEnabled = false;
    // Hoisted to function scope (not just the compression-block scope below) so the
    // combo-resolved override survives to the final enforceOutputTokenBudget() call
    // further down — see #8378 (context limit resolved by the combo was silently
    // discarded because it only existed inside this `if` block).
    let contextLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTokenLimit"])(provider, effectiveModel);
    if (body && Array.isArray(allMessages) && allMessages.length > 0) {
        let estimatedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(allMessages);
        const compressionSettingsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCompressionSettings"])(log);
        const compressionSettings = compressionSettingsResult.settings;
        // #8034 — operator-named model/endpoint exclusions bypass the whole pipeline, exactly
        // like compression being globally disabled, so the body is provably byte-identical.
        const compressionExcluded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$exclusions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCompressionExcluded"])({
            provider,
            model: effectiveModel
        }, compressionSettings?.exclusions);
        let promptCompressionEnabled = compressionSettingsResult.enabled && !compressionExcluded;
        reactiveContextCompactionEnabled = compressionSettingsResult.enabled && !compressionExcluded;
        contextEditingEnabled = compressionSettingsResult.contextEditingEnabled;
        if (compressionExcluded) {
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionAnalyticsWrite$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCompressionSkip"])({
                stats: {
                    originalTokens: estimatedTokens,
                    compressedTokens: estimatedTokens,
                    savingsPercent: 0,
                    techniquesUsed: [],
                    mode: "off",
                    timestamp: Date.now()
                },
                provider,
                effectiveModel,
                effectiveServiceTier,
                comboName,
                mode: "off",
                compressionComboId: null,
                skillRequestId,
                cavemanOutputModeApplied: false,
                cavemanOutputModeIntensity: null,
                log
            }, "excluded");
        }
        // --- Modular Compression Pipeline (Phase 1 Lite + Phase 2 Standard/Caveman + Phase 3 Aggressive) ---
        // Runs BEFORE the existing reactive compressContext() to proactively reduce tokens.
        try {
            const { selectCompressionStrategy, selectCompressionPlan, enginesMapDerivesStackedPipeline, activeComboResolves, applyCompressionAsync, resolveCacheAwareConfig, formatCompressionMeta, buildNamedComboLookup, formatCompressionAnnotation } = await __turbopack_context__.A("[project]/open-sse/services/compression/strategySelector.ts [instrumentation] (ecmascript, async loader)");
            const { trackCompressionStats } = await __turbopack_context__.A("[project]/open-sse/services/compression/stats.ts [instrumentation] (ecmascript, async loader)");
            let config = compressionSettings ?? {
                enabled: false,
                defaultMode: "off",
                autoTriggerTokens: 0,
                cacheMinutes: 5,
                preserveSystemPrompt: true,
                comboOverrides: {}
            };
            if (compressionExcluded) config = {
                ...config,
                enabled: false
            };
            if (!promptCompressionEnabled || !compressionSettings) {
                log?.debug?.("COMPRESSION", "Prompt compression disabled or unavailable");
            }
            let compressionComboKey = comboName ?? null;
            let compressionComboApplied = false;
            const applyCompressionComboConfig = (compressionCombo, routingOverrideIds = [])=>{
                if (!compressionCombo || compressionCombo.pipeline.length === 0) return false;
                const comboLanguagePacks = [
                    ...new Set(compressionCombo.languagePacks.map((pack)=>pack.trim()).filter((pack)=>pack.length > 0))
                ];
                const comboOutputIntensity = [
                    "lite",
                    "full",
                    "ultra"
                ].includes(compressionCombo.outputModeIntensity) ? compressionCombo.outputModeIntensity : config.cavemanOutputMode?.intensity ?? "full";
                const comboDefaultLanguage = comboLanguagePacks.find((pack)=>pack === config.languageConfig?.defaultLanguage) ?? comboLanguagePacks[0] ?? config.languageConfig?.defaultLanguage ?? "en";
                const comboOverrides = {
                    ...config.comboOverrides ?? {}
                };
                for (const id of routingOverrideIds){
                    if (id) comboOverrides[id] = "stacked";
                }
                config = {
                    ...config,
                    compressionComboId: compressionCombo.id,
                    stackedPipeline: compressionCombo.pipeline,
                    languageConfig: {
                        ...config.languageConfig ?? {
                            enabled: false,
                            defaultLanguage: "en",
                            autoDetect: true,
                            enabledPacks: [
                                "en"
                            ]
                        },
                        enabled: true,
                        defaultLanguage: comboDefaultLanguage,
                        enabledPacks: comboLanguagePacks.length > 0 ? comboLanguagePacks : config.languageConfig?.enabledPacks ?? [
                            "en"
                        ]
                    },
                    cavemanOutputMode: {
                        ...config.cavemanOutputMode ?? {
                            enabled: false,
                            intensity: "full",
                            autoClarity: true
                        },
                        enabled: compressionCombo.outputMode,
                        intensity: comboOutputIntensity
                    },
                    comboOverrides
                };
                compressionComboApplied = true;
                return true;
            };
            if (isCombo && comboName || routingComboId) {
                try {
                    const { getComboByName } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
                    let comboConfig = await getComboByName(comboName);
                    if (!comboConfig && comboName?.startsWith("combo/")) {
                        comboConfig = await getComboByName(comboName.substring(6));
                    }
                    const comboRuntimeConfig = comboConfig?.config && typeof comboConfig.config === "object" ? comboConfig.config : {};
                    const comboMode = typeof comboRuntimeConfig.compressionMode === "string" ? comboRuntimeConfig.compressionMode : typeof comboConfig?.compressionOverride === "string" ? comboConfig.compressionOverride : null;
                    if (comboMode === "off" || comboMode === "lite" || comboMode === "standard" || comboMode === "aggressive" || comboMode === "ultra" || comboMode === "rtk" || comboMode === "stacked") {
                        config = {
                            ...config,
                            comboOverrides: {
                                ...config.comboOverrides ?? {},
                                ...comboName ? {
                                    [comboName]: comboMode
                                } : {},
                                ...comboConfig?.id ? {
                                    [String(comboConfig.id)]: comboMode
                                } : {}
                            }
                        };
                        compressionComboKey = comboName;
                    }
                    const routingComboIds = [
                        comboConfig?.id,
                        comboName,
                        routingComboId,
                        comboName?.startsWith("combo/") ? comboName.substring(6) : null
                    ].filter((id)=>typeof id === "string" && id.length > 0);
                    if (routingComboIds.length > 0) {
                        const { getCompressionComboForRoutingCombo } = await __turbopack_context__.A("[project]/src/lib/db/compressionCombos.ts [instrumentation] (ecmascript, async loader)");
                        const assignedCompressionCombo = routingComboIds.map((id)=>getCompressionComboForRoutingCombo(id)).find((combo)=>combo !== null) ?? null;
                        if (applyCompressionComboConfig(assignedCompressionCombo, routingComboIds)) {
                            compressionComboKey = comboName;
                        }
                    }
                } catch (err) {
                    log?.debug?.("COMPRESSION", "Combo compression override lookup skipped: " + (err instanceof Error ? err.message : String(err)));
                }
            }
            let namedCombos = {};
            try {
                const { listCompressionCombos } = await __turbopack_context__.A("[project]/src/lib/db/compressionCombos.ts [instrumentation] (ecmascript, async loader)");
                namedCombos = buildNamedComboLookup(listCompressionCombos());
            } catch (err) {
                log?.debug?.("COMPRESSION", "Named combos load skipped: " + (err instanceof Error ? err.message : String(err)));
            }
            // Phase 3: per-request override. Unknown values fall through in the resolver (never error).
            const compressionHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCompressionHeader"])(clientRawRequest?.headers ?? null);
            if (compressionHeader) {
                log?.debug?.("COMPRESSION", `x-omniroute-compression header: ${compressionHeader}`);
            }
            const connectionCacheOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveConnectionCacheOverride"])(credentials?.providerSpecificData);
            const modeBeforeOutputTransform = selectCompressionStrategy(config, compressionComboKey, estimatedTokens, body, {
                provider,
                targetFormat,
                model: effectiveModel,
                connectionCacheOverride
            }, namedCombos, compressionHeader);
            if (modeBeforeOutputTransform === "stacked" && !compressionComboApplied && !config.compressionComboId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionComboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBuiltinStackedPipeline"])(config.stackedPipeline) && // Don't let the legacy default combo override a panel-configured engines map: when the
            // operator's explicit engines derive their own stacked pipeline, that pipeline (applied
            // below from compressionPlan.stackedPipeline) is authoritative. Legacy/backfilled
            // installs (enginesExplicit false) still fall through to the seeded default combo.
            !enginesMapDerivesStackedPipeline(config) && // Never let the legacy seeded default combo shadow the operator's active profile.
            !activeComboResolves(config, namedCombos)) {
                try {
                    const { getDefaultCompressionCombo } = await __turbopack_context__.A("[project]/src/lib/db/compressionCombos.ts [instrumentation] (ecmascript, async loader)");
                    const defaultCompressionCombo = getDefaultCompressionCombo();
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionComboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isStackedCompressionCombo"])(defaultCompressionCombo) && applyCompressionComboConfig(defaultCompressionCombo)) {
                        log?.debug?.("COMPRESSION", `Default compression combo applied: ${defaultCompressionCombo?.id}`);
                    }
                } catch (err) {
                    log?.debug?.("COMPRESSION", "Default compression combo lookup skipped: " + (err instanceof Error ? err.message : String(err)));
                }
            }
            // Phase 4A: unified output styles (supersedes cavemanOutputMode via the back-compat shim).
            let outputStyleResult = null;
            if (config.enabled && compressionHeader?.trim().toLowerCase() !== "off") {
                try {
                    const { resolveOutputStyleSelection } = await __turbopack_context__.A("[project]/open-sse/services/compression/outputStyles/backCompat.ts [instrumentation] (ecmascript, async loader)");
                    const selection = resolveOutputStyleSelection(config);
                    if (selection.length > 0) {
                        const { applyOutputStyles } = await __turbopack_context__.A("[project]/open-sse/services/compression/outputStyles/apply.ts [instrumentation] (ecmascript, async loader)");
                        const outputStyleLanguage = config.languageConfig?.enabled === true ? config.languageConfig.defaultLanguage : "en";
                        outputStyleResult = applyOutputStyles(body, selection, outputStyleLanguage);
                        if (outputStyleResult.applied) {
                            body = outputStyleResult.body;
                            cavemanOutputModeApplied = true;
                            cavemanOutputModeIntensity = outputStyleResult.appliedStyles?.map((s)=>`${s.id}:${s.level}`).join(",") ?? null;
                            estimatedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(body?.messages ?? body?.input ?? []);
                            log?.debug?.("COMPRESSION", "Output styles applied");
                        } else if (outputStyleResult.skippedReason && outputStyleResult.skippedReason !== "no_styles") {
                            log?.debug?.("COMPRESSION", `Output styles skipped: ${outputStyleResult.skippedReason}`);
                        }
                    }
                } catch (err) {
                    log?.debug?.("COMPRESSION", "Output styles skipped: " + (err instanceof Error ? err.message : String(err)));
                }
            }
            const compressionInputBody = body;
            // Adaptive context-budget (Sub-project C): model context window + request max_tokens drive
            // the budget target. getTokenLimit is already imported; provider/effectiveModel resolved above.
            const adaptiveModelContextLimit = provider && effectiveModel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTokenLimit"])(provider, effectiveModel) : null;
            const requestMaxTokens = typeof compressionInputBody?.max_tokens === "number" ? compressionInputBody.max_tokens : null;
            let adaptiveTelemetry = null;
            const compressionPlan = selectCompressionPlan(config, compressionComboKey, estimatedTokens, compressionInputBody, {
                provider,
                targetFormat,
                model: effectiveModel,
                connectionCacheOverride
            }, namedCombos, compressionHeader, {
                modelContextLimit: adaptiveModelContextLimit,
                requestMaxTokens: requestMaxTokens,
                onAdaptive: (t)=>{
                    adaptiveTelemetry = t;
                }
            });
            const mode = compressionPlan.mode;
            if (adaptiveTelemetry && adaptiveTelemetry.fit === false) {
                log?.warn?.("COMPRESSION", `adaptive budget-exceeded: target=${adaptiveTelemetry.target} headroomAfter=${adaptiveTelemetry.headroomAfter} stages=${adaptiveTelemetry.stagesApplied.join(",")} (best-effort plan sent, content preserved)`);
            }
            compressionResponseMeta = formatCompressionMeta(compressionPlan);
            // When the per-engine toggle map derives a stacked pipeline (and no named/routing
            // combo already set config.stackedPipeline), feed that derived pipeline through so
            // applyCompressionAsync (which reads config.stackedPipeline for stacked mode) runs the
            // engines the operator actually toggled on instead of the built-in rtk+caveman default.
            if (mode === "stacked" && compressionPlan.stackedPipeline.length > 0 && !compressionComboApplied && !config.compressionComboId) {
                config = {
                    ...config,
                    stackedPipeline: compressionPlan.stackedPipeline
                };
            }
            let compressionAnalyticsRecorded = false;
            if (mode !== "off") {
                // #3890: in a caching context, never compress the system prompt (cacheable prefix)
                // even if the operator disabled preserveSystemPrompt — honors the cache-aware flag
                // that selectCompressionStrategy can only partially apply via the mode string.
                const cacheCtx = {
                    provider,
                    targetFormat,
                    model: effectiveModel,
                    connectionCacheOverride
                };
                const compressionConfig = resolveCacheAwareConfig(config, compressionInputBody, cacheCtx);
                const compressionPrincipalId = apiKeyInfo?.id ? String(apiKeyInfo.id) : undefined;
                const compressionOptions = {
                    model: effectiveModel,
                    // #7237: feed the AUTHORITATIVE capability (model spec / models.dev sync / DB
                    // override, with the conservative model-id fragment heuristic only as its
                    // last-resort fallback) instead of calling the heuristic directly here. The
                    // heuristic alone wrongly returned false for e.g. gpt-5.5 (registered
                    // supportsVision:true in modelSpecs but absent from the deliberately-conservative
                    // fragment list), and lite.ts's gate (`supportsVision !== false`) treated that
                    // false as "strip every image_url block". Resolves to `null` for genuinely unknown
                    // models, which is intentionally NOT `false` so the gate still preserves images.
                    supportsVision: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])({
                        provider,
                        model: effectiveModel
                    }).supportsVision,
                    // Rotas diretas oficiais ('anthropic' API key e 'claude' OAuth) vs agregadores:
                    // o engine omniglyph exige 'direct' — agregadores redimensionam imagens
                    // (medido 2026-07-06). OAuth 'claude' é rota direta oficial (#7863).
                    providerTransport: provider === "anthropic" || provider === "claude" ? "direct" : "aggregator",
                    config: compressionConfig,
                    cachingContext: cacheCtx,
                    principalId: compressionPrincipalId,
                    // F3.3: stream per-engine progress live (best-effort) before compression.completed.
                    onEngineStep: (s)=>{
                        try {
                            const stepPayload = {
                                requestId: traceId,
                                comboId: null,
                                mode,
                                stepIndex: s.stepIndex,
                                totalSteps: s.totalSteps,
                                engine: s.engine,
                                state: s.state,
                                originalTokens: s.originalTokens,
                                compressedTokens: s.compressedTokens,
                                savingsPercent: s.savingsPercent,
                                ...s.durationMs !== undefined ? {
                                    durationMs: s.durationMs
                                } : {},
                                timestamp: Date.now()
                            };
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("compression.step", stepPayload);
                            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["forwardDashboardEventToLiveWs"])("compression.step", stepPayload);
                        } catch (_stepErr) {
                        // best-effort live event — never fail the request
                        }
                    }
                };
                const runCompression = (input)=>applyCompressionAsync(input, mode, compressionOptions);
                let result;
                if (compressionConfig.liveZone?.enabled === true) {
                    const { applyLiveZoneCompression } = await __turbopack_context__.A("[project]/open-sse/services/compression/liveZone.ts [instrumentation] (ecmascript, async loader)");
                    const explicitSessionId = clientRawRequest?.headers && typeof clientRawRequest.headers.get === "function" ? clientRawRequest.headers.get("x-omniroute-session-id") : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHeaderValueCaseInsensitive"])(clientRawRequest?.headers ?? null, "x-omniroute-session-id");
                    const liveZoneSessionId = explicitSessionId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateSessionId"])(compressionInputBody, {
                        provider,
                        connectionId: getCurrentConnectionId() ?? undefined
                    }) || undefined;
                    result = await applyLiveZoneCompression(compressionInputBody, {
                        principalId: compressionPrincipalId,
                        sessionId: liveZoneSessionId,
                        variant: {
                            mode,
                            provider,
                            model: effectiveModel,
                            config: compressionConfig,
                            cachePrefix: {
                                system: compressionInputBody.system,
                                systemInstruction: compressionInputBody.systemInstruction,
                                system_instruction: compressionInputBody.system_instruction,
                                instructions: compressionInputBody.instructions,
                                tools: compressionInputBody.tools,
                                toolChoice: compressionInputBody.tool_choice
                            }
                        },
                        ttlMinutes: compressionConfig.cacheMinutes
                    }, runCompression);
                } else {
                    result = await runCompression(compressionInputBody);
                }
                if (result.stats) {
                    const annotation = formatCompressionAnnotation(result.stats);
                    if (annotation) {
                        compressionResponseMeta = `${compressionResponseMeta}; ${annotation}`;
                    }
                    if (result.compressed) {
                        body = result.body;
                        estimatedTokens = result.stats.compressedTokens;
                        tokensCompressed = Math.max(0, result.stats.originalTokens - result.stats.compressedTokens);
                    }
                    // Fire-and-forget: emit live compression event for dashboard (U5).
                    // Guard: only emit when compression actually ran and produced stats.
                    if (result.compressed && result.stats) {
                        try {
                            const compressionCompletedPayload = {
                                requestId: traceId,
                                comboId: result.stats.compressionComboId ?? null,
                                mode,
                                originalTokens: result.stats.originalTokens,
                                compressedTokens: result.stats.compressedTokens,
                                savingsPercent: result.stats.savingsPercent,
                                // Single-engine modes leave engineBreakdown empty; synthesize a 1-entry
                                // breakdown so the studio shows a real engine node instead of an empty pipeline.
                                engineBreakdown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineBreakdown$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureEngineBreakdown"])(result.stats),
                                validationWarnings: result.stats.validationWarnings,
                                fallbackApplied: result.stats.fallbackApplied,
                                ...adaptiveTelemetry ? {
                                    adaptive: adaptiveTelemetry
                                } : {},
                                timestamp: Date.now()
                            };
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("compression.completed", compressionCompletedPayload);
                            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["forwardDashboardEventToLiveWs"])("compression.completed", compressionCompletedPayload);
                        } catch (_emitErr) {
                            // never propagate into the hot path — but log like the sibling
                            // fire-and-forget blocks so a throwing event bus isn't fully silent.
                            log?.debug?.("COMPRESSION", "compression.completed emit skipped: " + (_emitErr instanceof Error ? _emitErr.message : String(_emitErr)));
                        }
                    }
                    if (result.compressed || result.stats.fallbackApplied || cavemanOutputModeApplied) {
                        trackCompressionStats(result.stats);
                        compressionAnalyticsRecorded = true;
                        compressionAnalyticsWritePromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionAnalyticsWrite$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCompressionAnalytics"])({
                            stats: result.stats,
                            provider,
                            effectiveModel,
                            effectiveServiceTier,
                            comboName,
                            mode,
                            compressionComboId: config.compressionComboId,
                            skillRequestId,
                            cavemanOutputModeApplied,
                            cavemanOutputModeIntensity,
                            log
                        });
                        await compressionAnalyticsWritePromise;
                    } else {
                        // Compression was attempted (mode active, engines ran) but produced no
                        // recordable saving — e.g. a Stacked RTK→Caveman pipeline on already-compact
                        // context. Record a skip row so analytics can distinguish "ran but saved
                        // nothing" from "never ran" instead of dropping it silently (#4268).
                        compressionAnalyticsRecorded = true;
                        compressionAnalyticsWritePromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionAnalyticsWrite$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCompressionSkip"])({
                            stats: result.stats,
                            provider,
                            effectiveModel,
                            effectiveServiceTier,
                            comboName,
                            mode,
                            compressionComboId: config.compressionComboId,
                            skillRequestId,
                            cavemanOutputModeApplied,
                            cavemanOutputModeIntensity,
                            log
                        }, "no_savings");
                        await compressionAnalyticsWritePromise;
                    }
                    if (result.compressed) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$compressionCacheStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordCompressionCacheStats"])({
                            compressionInputBody,
                            provider,
                            targetFormat,
                            effectiveModel,
                            mode,
                            stats: result.stats,
                            connectionCacheOverride,
                            log
                        });
                        log?.info?.("COMPRESSION", `Prompt compressed (${mode}): ${result.stats.originalTokens} -> ${result.stats.compressedTokens} tokens (${result.stats.savingsPercent}% saved, techniques: ${result.stats.techniquesUsed.join(",")})`);
                    }
                }
            }
            if (cavemanOutputModeApplied && !compressionAnalyticsRecorded) {
                compressionAnalyticsWritePromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cavemanOutputAnalytics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCavemanOutputAnalytics"])({
                    comboName,
                    provider,
                    compressionComboId: config.compressionComboId,
                    estimatedTokens,
                    skillRequestId,
                    cavemanOutputModeIntensity,
                    log
                });
                await compressionAnalyticsWritePromise;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$outputStyleTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emitOutputStyleTelemetry"])({
                outputStyleResult,
                skillRequestId,
                traceId,
                effectiveModel,
                provider,
                compressionComboId: config.compressionComboId,
                estimatedTokens,
                log
            });
        } catch (err) {
            log?.warn?.("COMPRESSION", "Compression pipeline error (non-fatal): " + (err instanceof Error ? err.message : String(err)));
        }
        // --- End Modular Compression Pipeline ---
        if (!promptCompressionEnabled) {
            log?.debug?.("CONTEXT", "Prompt Compression engines disabled; reactive context compaction still applies when over threshold");
        }
        if (isCombo && comboName) {
            log?.info?.("CONTEXT", `Attempting to resolve combo limits for comboName=${comboName}`);
            try {
                const { getComboByName } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
                const { resolveComboTargets } = await __turbopack_context__.A("[project]/open-sse/services/combo.ts [instrumentation] (ecmascript, async loader)");
                let comboConfig = await getComboByName(comboName);
                if (!comboConfig && comboName.startsWith("combo/")) {
                    comboConfig = await getComboByName(comboName.substring(6));
                }
                let comboTargetLimits = [];
                if (comboConfig) {
                    const allCombosData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$comboContextCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombosCached"])();
                    const targets = resolveComboTargets(comboConfig, allCombosData);
                    // Fall back to ResolvedComboTarget.provider when modelStr lacks a
                    // provider/ prefix — parseModel alone returns provider:null (#8716).
                    comboTargetLimits = targets.map((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboTargetTokenLimit"])({
                            modelStr: t.modelStr,
                            provider: t.provider
                        })).filter((limit)=>typeof limit === "number" && Number.isFinite(limit) && limit > 0);
                }
                // chatCore executes per concrete target (handleSingleModel resolves
                // provider/effectiveModel before delegating). Compress against THIS
                // target's window; min(...allTargets) is only a defensive fallback —
                // the old unconditional min compressed a 1M-target request at the
                // smallest sibling's window ("agent keeps forgetting things").
                const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComboContextLimit"])({
                    provider,
                    model: effectiveModel,
                    comboTargetLimits
                });
                contextLimit = resolved.limit;
                log?.info?.("CONTEXT", `Combo context limit: ${resolved.limit} (source=${resolved.source})`);
            } catch (err) {
                log?.warn?.("CONTEXT", "Failed to resolve combo limits for compression: " + err);
            }
        }
        const COMPRESSION_THRESHOLD = 0.7;
        let reservedTokens = 0;
        if (Array.isArray(body.tools)) {
            reservedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(body.tools);
        }
        const threshold = Math.max(1, Math.floor((Math.max(1, contextLimit) - reservedTokens) * COMPRESSION_THRESHOLD));
        log?.debug?.("CONTEXT", `Checking compression: ${estimatedTokens} tokens vs ${threshold} threshold (${contextLimit} limit, ${reservedTokens} reserved)`);
        // Capture pre-compression body so translators can access original message
        // content even after compression alters it (e.g. stable Kiro conversationId).
        preCompressionBody = body;
        // Reactive context compaction is independent of optional prompt-compression
        // engines (Caveman/RTK). Codex Desktop / Responses clients need this path even
        // when those engines are off, otherwise multi-turn image sessions hard-reject
        // at the budget check below (#8560).
        if (reactiveContextCompactionEnabled && estimatedTokens > threshold) {
            log?.info?.("CONTEXT", `Proactive compression triggered: ${estimatedTokens} tokens > ${threshold} threshold (${contextLimit} limit)`);
            // Adapt Responses `input[]` → messages so compressContext can run, then restore.
            const ctxAdapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
            const compressionResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["compressContext"])(ctxAdapter.body, {
                provider,
                model: effectiveModel,
                maxTokens: threshold,
                reserveTokens: 0
            });
            if (compressionResult.compressed && compressionResult.body) {
                body = ctxAdapter.adapted ? ctxAdapter.restore(compressionResult.body, {
                    dropMissingMappedItems: true
                }) : compressionResult.body;
                const stats = compressionResult.stats;
                tokensCompressed = Math.max(0, (stats?.original ?? 0) - (stats?.final ?? 0));
                const layersInfo = stats && "layers" in stats && Array.isArray(stats.layers) ? ` (layers: ${stats.layers.map((l)=>l.name).join(", ")})` : "";
                log?.info?.("CONTEXT", `Context compressed: ${stats.original} → ${stats.final} tokens${layersInfo}`);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
                    action: "context.proactive_compression",
                    actor: apiKeyInfo?.name || "system",
                    target: connectionId || provider || "chat",
                    details: {
                        provider,
                        model: effectiveModel,
                        original_tokens: stats.original,
                        final_tokens: stats.final,
                        layers: "layers" in stats ? stats.layers : undefined
                    }
                });
            } else {
                log?.debug?.("CONTEXT", `Compression not applied: context already fits within target`);
            }
        }
    } else {
        log?.debug?.("CONTEXT", `Skipping compression check: body=${!!body}, hasMessages=${Array.isArray(allMessages)}`);
    }
    // Re-check the concrete target after all compression passes. Combo compatibility
    // filtering is advisory and may preserve an all-incompatible pool; this is the
    // hard boundary that prevents a too-large prompt (or a negative token budget)
    // from reaching an OpenAI-compatible upstream such as NVIDIA NIM.
    let finalEstimatedInputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$contextEstimation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFinalInputTokens"])(body);
    // Reuse the already-resolved `contextLimit` (may have been narrowed to the
    // per-target combo window above, resolveComboContextLimit) instead of a bare
    // getTokenLimit(provider, effectiveModel) re-fetch, which would silently
    // discard that combo-aware override and re-widen the last-resort budget.
    const finalContextLimit = contextLimit;
    const toolsReserve = Array.isArray(body?.tools) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateTokens"])(body.tools) : 0;
    // Last-resort compaction against the concrete input budget (not the 70% threshold).
    // Covers cases where the proactive pass was skipped or still left the request oversized (#8560).
    if (reactiveContextCompactionEnabled && finalEstimatedInputTokens >= finalContextLimit && body) {
        const lastResortTarget = Math.max(1, finalContextLimit - toolsReserve - 1);
        const lastResortAdapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
        const lastResortResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["compressContext"])(lastResortAdapter.body, {
            provider,
            model: effectiveModel,
            maxTokens: lastResortTarget,
            reserveTokens: 0
        });
        if (lastResortResult.compressed && lastResortResult.body) {
            body = lastResortAdapter.adapted ? lastResortAdapter.restore(lastResortResult.body, {
                dropMissingMappedItems: true
            }) : lastResortResult.body;
            finalEstimatedInputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$contextEstimation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["estimateFinalInputTokens"])(body);
            log?.info?.("CONTEXT", `Last-resort context compaction: ${lastResortResult.stats?.original} → ${lastResortResult.stats?.final} tokens ` + `(re-estimated input ${finalEstimatedInputTokens}, limit ${finalContextLimit})`);
        }
    }
    const modelOutputCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningTokenBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toPositiveInteger"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getExplicitModelOutputCap"])({
        provider,
        model: effectiveModel
    }));
    const outputBudget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$outputTokenBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceOutputTokenBudget"])(body, finalEstimatedInputTokens, finalContextLimit, targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_MAX_TOKENS"] : 0, modelOutputCap, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningTokenBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toPositiveInteger"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveInputTokenCapForGate"])({
        provider,
        model: effectiveModel
    }, {
        isCombo
    })));
    if (!outputBudget.ok) {
        const exceededInputCap = outputBudget.maxInputTokens !== undefined;
        const message = `Input exceeds ${exceededInputCap ? "maximum input tokens" : "context window"} for ${provider}/${effectiveModel}: ` + `estimated ${outputBudget.estimatedInputTokens} input tokens, ${exceededInputCap ? `max input ${outputBudget.maxInputTokens}` : `limit ${outputBudget.contextLimit}`}. ` + `Reduce the prompt or route to a model with a larger ${exceededInputCap ? "input limit" : "context window"}.`;
        log?.warn?.("CONTEXT", message);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, message, null, "context_length_exceeded", "invalid_request_error");
    }
    if (outputBudget.adjustedFields.length > 0) {
        // A field can also be adjusted by *removal* (invalid/non-positive value), which
        // the cap did not cause — so state the ceiling in effect rather than claiming
        // the cap drove this particular adjustment.
        const modelCapIsBinding = modelOutputCap != null && modelOutputCap < outputBudget.availableOutputTokens;
        log?.info?.("CONTEXT", `Adjusted invalid or oversized output token fields (${outputBudget.adjustedFields.join(", ")}); ` + `${outputBudget.availableOutputTokens} tokens remain for output` + (modelCapIsBinding ? ` (output ceiling in effect: ${modelOutputCap}, ${provider}/${effectiveModel}'s own cap)` : ""));
    }
    body = outputBudget.body;
    let translatedBody = body;
    const isClaudePassthrough = sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE;
    const isClaudeCodeCompatible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$agentRouterProtocol$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesClaudeBridge"])(provider, targetFormat, credentials);
    const isClaudeCodeSemanticPassthrough = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeSemanticPassthroughRequest"])({
        provider,
        sourceFormat,
        targetFormat,
        headers: clientRawRequest?.headers,
        userAgent
    });
    // `forceStream` providers (e.g. Cline / ClinePass) only implement upstream
    // streaming — a non-streaming request returns "generateText is not implemented"
    // / an empty body. Force the upstream request to stream even when the client
    // wants JSON; the non-streaming branch below accumulates the SSE and converts
    // it back to JSON (same mechanism already used for Claude-Code-compatible
    // providers via isClaudeCodeCompatible).
    const upstreamStream = stream || isClaudeCodeCompatible || providerRequiresStreaming;
    let ccSessionId = null;
    const stripTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getStripTypesForProviderModel"])(provider || "", model || "");
    if (Array.isArray(translatedBody?.messages) && stripTypes.length > 0) {
        const stripResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripIncompatibleMessageContent"])(translatedBody.messages, stripTypes);
        if (stripResult.removedParts > 0) {
            translatedBody = {
                ...translatedBody,
                messages: stripResult.messages
            };
            log?.warn?.("CONTENT", `Stripped ${stripResult.removedParts} incompatible content part(s) for ${provider}/${model}`);
        }
    }
    // Determine if we should preserve client-side cache_control headers
    // Fetch settings from DB to get user preference
    const cacheControlMode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cacheControlSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCacheControlSettings"])().catch(()=>"auto");
    const connectionCacheOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveConnectionCacheOverride"])(credentials?.providerSpecificData);
    const preserveCacheControl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPreserveCacheControl"])({
        userAgent,
        isCombo,
        comboStrategy,
        targetProvider: provider,
        targetFormat,
        settings: {
            alwaysPreserveClientCache: cacheControlMode
        },
        connectionCacheOverride
    });
    if (preserveCacheControl) {
        log?.debug?.("CACHE", `Preserving client cache_control (client=${userAgent?.substring(0, 20)}, combo=${isCombo}, strategy=${comboStrategy}, provider=${provider})`);
    }
    // extractSystemMessagesToBody + normalizeClaudeUpstreamMessages extracted to
    // chatCore/claudeUpstreamMessages.ts (#3501); bind `log` once so the call sites stay byte-identical.
    const normalizeClaudeUpstreamMessages = (payload, options)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeUpstreamMessages$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeClaudeUpstreamMessages"])(payload, options, log);
    try {
        if (nativeResponsesPassthrough) {
            translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stampNativeResponsesPassthroughBody"])(body, nativeCodexPassthrough ? "codex" : "xai");
            log?.debug?.("FORMAT", nativeCodexPassthrough ? "native codex passthrough enabled" : "native xAI Responses Agent Tools passthrough enabled");
        } else if (isClaudeCodeCompatible) {
            let normalizedForCc = {
                ...body
            };
            // Claude Code-compatible providers expect Anthropic Messages-shaped payloads,
            // but we extract only role/text/max_tokens/effort from an OpenAI-like view first.
            if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && isClaudeCodeSemanticPassthrough) {
                log?.debug?.("FORMAT", "claude-code semantic passthrough enabled for compatible bridge");
            } else if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
                const normalizeToolCallId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelNormalizeToolCallId"])(provider || "", model || "", sourceFormat);
                const preserveDeveloperRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelPreserveOpenAIDeveloperRole"])(provider || "", model || "", sourceFormat);
                normalizedForCc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["translateRequest"])(sourceFormat, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, model, {
                    ...body
                }, stream, credentials, provider, reqLogger, {
                    normalizeToolCallId,
                    preserveDeveloperRole,
                    preserveCacheControl,
                    copilotClient: copilotCompatibleReasoning
                });
            }
            ccSessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveClaudeCodeCompatibleSessionId"])(clientRawRequest?.headers);
            const ccRequestDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClaudeCodeCompatibleRequestDefaults"])(credentials?.providerSpecificData);
            translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleRequest"])({
                sourceBody: body,
                normalizedBody: normalizedForCc,
                claudeBody: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE ? body : null,
                model,
                stream: upstreamStream,
                sessionId: ccSessionId,
                cwd: process.cwd(),
                now: new Date(),
                preserveCacheControl,
                preserveClaudeMessages: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && isClaudeCodeSemanticPassthrough,
                summarizeThinking: ccRequestDefaults.summarizeThinking === true
            });
            log?.debug?.("FORMAT", "claude-code-compatible bridge enabled");
            if (isClaudeCodeSemanticPassthrough) {
                // Semantic passthrough: only lift system/developer role messages
                // without converting file/document blocks, tool history, etc.
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeSystemRole$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractSystemRoleMessages"])(translatedBody);
            } else {
                // Non-CC path: full normalization including content type conversion.
                normalizeClaudeUpstreamMessages(translatedBody, {
                    preserveToolResultBlocks: true
                });
            }
        } else if (isClaudePassthrough) {
            // Pure passthrough: forward the body as-is without OpenAI round-trip.
            // The Claude→OpenAI→Claude double translation was lossy and corrupted
            // payloads at high context (150+ msgs, 100+ tools). Fix: #1359.
            // Claude Code sends well-formed Messages API payloads — trust them
            // regardless of combo strategy or cache_control settings.
            translatedBody = {
                ...body
            };
            translatedBody._disableToolPrefix = true;
            // Sanitize historical thinking-block signatures for Anthropic-native Claude OAuth.
            // Only Anthropic's first-party API validates these signatures (token-bound); third-party
            // Claude-shape providers do not. See redactPassthroughThinkingSignatures + issue #2454.
            if (provider === "claude") {
                translatedBody.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["redactPassthroughThinkingSignatures"])(translatedBody.messages, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"]);
                // Anthropic API rejects requests with both temperature and top_p.
                // VS Code Claude extension and similar clients send both; strip top_p.
                if (translatedBody.temperature !== undefined && translatedBody.top_p !== undefined) {
                    delete translatedBody.top_p;
                }
            }
            // Legacy models reject role:"system" messages. Opus accepts them behind
            // its beta, and hoisting them breaks the prompt cache prefix.
            if (isClaudeCodeSemanticPassthrough) {
                if (provider !== "claude" || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldUseMidConversationSystem"])(translatedBody, effectiveModel)) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeSystemRole$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractSystemRoleMessages"])(translatedBody);
                }
                if (Array.isArray(translatedBody.messages)) {
                    translatedBody.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["splitMisplacedToolResults"])(translatedBody.messages);
                }
                if (provider === "claude") {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureCacheControlOnLastUserMessage"])(translatedBody);
                }
            } else {
                normalizeClaudeUpstreamMessages(translatedBody, {
                    preserveToolResultBlocks: true
                });
            }
            log?.debug?.("FORMAT", `claude passthrough (preserveCache=${preserveCacheControl})`);
            // Migrate deprecated top-level `output_format` → `output_config.format`.
            // Anthropic returns a 400 on the legacy field; some clients (e.g. ForgeCode)
            // still emit it. Preserves an existing output_config.format if present.
            if (translatedBody.output_format !== undefined) {
                const oc = translatedBody.output_config && typeof translatedBody.output_config === "object" ? translatedBody.output_config : {};
                if (oc.format === undefined) oc.format = translatedBody.output_format;
                translatedBody.output_config = oc;
                delete translatedBody.output_format;
            }
            // Fix #1719: Strip output_config.format for non-Anthropic Claude-compatible providers.
            // Third-party Claude endpoints (MiniMax, DeepSeek via aggregators) reject this field
            // with 400 errors since they don't support Anthropic's structured output / json_schema.
            if (provider !== "claude" && translatedBody.output_config && typeof translatedBody.output_config === "object") {
                const oc = translatedBody.output_config;
                delete oc.format;
                if (Object.keys(oc).length === 0) {
                    delete translatedBody.output_config;
                }
            }
        } else {
            translatedBody = {
                ...body
            };
            // Issue #199 + #618: Always disable tool name prefix in Claude passthrough.
            // The proxy_ prefix was designed for OpenAI→Claude translation to avoid
            // conflicts with Claude OAuth tools, but in the passthrough path the tools
            // are already in Claude format. Applying the prefix turns "Bash" into
            // "proxy_Bash", which Claude rejects ("No such tool available: proxy_Bash").
            if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
                translatedBody._disableToolPrefix = true;
                normalizeClaudeUpstreamMessages(translatedBody);
            }
            // OpenAI-compatible providers only support function tools.
            // Non-function tool types (computer, mcp, web_search, custom, etc.) are handled:
            //   - tools with a name → converted to function format in-place before translation
            //   - tools without a name AND without .function → dropped (unconvertible)
            // This must happen before translateRequest, which validates and throws on unknown types.
            if (provider?.startsWith("openai-compatible-") && Array.isArray(translatedBody.tools)) {
                const before = translatedBody.tools.length;
                translatedBody.tools = translatedBody.tools.filter((t)=>!t.type || t.type === "function" || !!t.function || !!t.name).map((t)=>{
                    if (!t.type || t.type === "function" || t.function) return t;
                    // Named non-function tool: normalise to function format so the translator
                    // does not throw on the unknown type.
                    return {
                        type: "function",
                        function: {
                            name: t.name,
                            ...t.description === undefined ? {} : {
                                description: t.description
                            },
                            ...t.parameters !== undefined || t.input_schema !== undefined ? {
                                parameters: t.parameters ?? t.input_schema ?? {}
                            } : {},
                            ...t.strict === undefined ? {} : {
                                strict: t.strict
                            }
                        }
                    };
                });
                const dropped = before - translatedBody.tools.length;
                if (dropped > 0) {
                    log?.debug?.("TOOLS", `Dropped ${dropped} unconvertible tool(s) for openai-compatible provider`);
                }
            }
            const normalizeToolCallId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelNormalizeToolCallId"])(provider || "", model || "", sourceFormat);
            const preserveDeveloperRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelPreserveOpenAIDeveloperRole"])(provider || "", model || "", sourceFormat);
            translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["translateRequest"])(sourceFormat, targetFormat, model, translatedBody, stream, credentials, provider, reqLogger, {
                normalizeToolCallId,
                preserveDeveloperRole,
                preserveCacheControl,
                signatureNamespace: connectionId,
                copilotClient: copilotCompatibleReasoning,
                ...preCompressionBody ? {
                    preCompressionBody
                } : {}
            });
        }
    } catch (error) {
        // ── Plugin onError hook ──
        try {
            const { runOnError } = await __turbopack_context__.A("[project]/src/lib/plugins/hooks.ts [instrumentation] (ecmascript, async loader)");
            await runOnError({
                requestId: traceId,
                body,
                model,
                provider,
                apiKeyInfo,
                metadata: {}
            }, error instanceof Error ? error : new Error(String(error)));
        } catch (pluginErr) {
            log?.debug?.("PLUGIN", `onError hook error (non-fatal): ${pluginErr instanceof Error ? pluginErr.message : String(pluginErr)}`);
        }
        const parsedStatus = Number(error?.statusCode);
        const statusCode = Number.isInteger(parsedStatus) && parsedStatus >= 400 && parsedStatus <= 599 ? parsedStatus : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVER_ERROR;
        const message = error?.message || "Invalid request";
        const errorType = typeof error?.errorType === "string" ? error.errorType : null;
        log?.warn?.("TRANSLATE", `Request translation failed: ${message}`);
        if (errorType) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
            return {
                success: false,
                status: statusCode,
                error: message,
                response: new Response(JSON.stringify({
                    error: {
                        message,
                        type: errorType,
                        code: errorType
                    }
                }), {
                    status: statusCode,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, message);
    }
    trace("post_translation");
    // Keep the request translator's namespace identities separate from toolNameMap:
    // the latter is a Kiro/Claude passthrough alias channel with string values,
    // while namespace identities carry `{namespace, name}` for the #7936 response
    // seam. Extract first because Kiro merge may reuse `_toolNameMap` below.
    const requestToolIdentityMap = translatedBody._toolNameMap instanceof Map ? translatedBody._toolNameMap : null;
    delete translatedBody._toolNameMap;
    // Kiro: sanitize tool schemas before dispatch. Kiro returns 400 "Improperly
    // formed request" for unsupported JSON-Schema keywords (anyOf/$ref/if-then,
    // etc.) and tool names >64 chars. Strip those keys and hash-truncate long
    // names; merge the truncated→original nameMap into the existing
    // `_toolNameMap` so kiro-to-openai maps streamed tool-call names back (#1375).
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].KIRO) {
        const kiroTools = translatedBody?.conversationState?.currentMessage?.userInputMessage?.userInputMessageContext?.tools;
        if (kiroTools) {
            const { tools: sanitizedKiroTools, nameMap: kiroNameMap } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kiroSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeKiroTools"])(kiroTools);
            translatedBody.conversationState.currentMessage.userInputMessage.userInputMessageContext.tools = sanitizedKiroTools;
            if (kiroNameMap.size > 0) {
                const existing = translatedBody._toolNameMap instanceof Map ? translatedBody._toolNameMap : new Map();
                kiroNameMap.forEach((original, truncated)=>existing.set(truncated, original));
                translatedBody._toolNameMap = existing;
            }
        }
    }
    // Claude: strict Anthropic-compatible gateways (e.g. MiniMax) reject tool
    // definitions that omit the required `type` discriminator with HTTP 400. Default
    // a missing `type` to "custom" before dispatch, mirroring Anthropic's own
    // inference, so legacy Claude-format tool payloads survive strict gateways (#2195).
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && Array.isArray(translatedBody.tools)) {
        translatedBody.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$claudeToolDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultClaudeToolType"])(translatedBody.tools);
    }
    // Extract toolNameMap for response translation (Claude OAuth)
    const translatedToolNameMap = translatedBody._toolNameMap;
    const nativeClaudeToolNameMap = isClaudePassthrough ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughToolNames$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClaudePassthroughToolNameMap"])(body) : null;
    let toolNameMap = translatedToolNameMap instanceof Map && translatedToolNameMap.size > 0 ? translatedToolNameMap : nativeClaudeToolNameMap;
    // For providers whose _toolNameMap was extracted as requestToolIdentityMap
    // before the Kiro merge block (Gemini/Antigravity), merge it into the
    // response toolNameMap so the response translator can restore tool names
    // from their lowercased form (#9568). Only merge string-valued entries
    // (tool name aliases), not object-valued namespace identities (#7936).
    if (!toolNameMap && requestToolIdentityMap instanceof Map && requestToolIdentityMap.size > 0) {
        const hasStringValues = [
            ...requestToolIdentityMap.values()
        ].every((v)=>typeof v === "string");
        if (hasStringValues) {
            toolNameMap = requestToolIdentityMap;
        }
    }
    delete translatedBody._toolNameMap;
    delete translatedBody._disableToolPrefix;
    // Update model in body — use resolved alias so the provider gets the correct model ID (#472)
    // Strip provider/alias prefix if it exactly matches the routing prefix so upstream receives the raw model name (#1261)
    let finalModelToUpstream = effectiveModel;
    // Defense-in-depth: only string-strip when effectiveModel is actually a string.
    // The API guards `model` via Zod (z.string()), but internal callers could pass a
    // non-string and a bare `.startsWith` would crash with `startsWith is not a
    // function` (same class as #2359 / #2463). Mirrors 9router's `?.startsWith?.()`.
    if (typeof finalModelToUpstream === "string") {
        if (finalModelToUpstream.startsWith(`${provider}/`)) {
            finalModelToUpstream = finalModelToUpstream.slice(provider.length + 1);
        } else if (alias && finalModelToUpstream.startsWith(`${alias}/`)) {
            finalModelToUpstream = finalModelToUpstream.slice(alias.length + 1);
        }
    }
    translatedBody.model = finalModelToUpstream;
    // #3554: a combo/route may substitute the upstream model AFTER the client chose its
    // `thinking` value. Claude Code sends `thinking:{type:"disabled"}` for internal calls,
    // which claude-fable-5 (adaptive-only) rejects with a 400. Drop the now-invalid value
    // when the resolved target model rejects it; models that accept `disabled` are untouched.
    if (typeof finalModelToUpstream === "string") {
        translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeThinkingForModel"])(translatedBody, finalModelToUpstream);
        // Claude Opus 4.7+/Fable 5 removed manual extended thinking: `thinking.type:"enabled"`
        // or any `thinking.budget_tokens` is a hard 400. Collapse any manual thinking that
        // reached this point (passthrough legacy shape, reasoning_effort buckets, per-model
        // defaults) to `{type:"adaptive"}` — effort stays on `output_config.effort`. Keyed on
        // the resolved upstream model, so it covers every routing mode. See claudeAdaptiveThinking.ts.
        translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeAdaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeClaudeAdaptiveThinking"])(translatedBody, finalModelToUpstream);
        // Opus 5 allows disabled thinking only through high effort on Anthropic's direct
        // Messages API. The helper scopes this constraint to `anthropic` and `claude`;
        // GitHub Copilot and Claude Web use separate upstream contracts.
        translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeAdaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeClaudeDisabledThinkingEffort"])(translatedBody, finalModelToUpstream, provider);
        // Claude Haiku rejects `thinking.type:"adaptive"` and `output_config.effort`
        // (both Sonnet 4.6 / Opus 4.5+ only). Several paths can still emit those
        // shapes on a Haiku target — native passthrough, reasoning_effort buckets,
        // per-model defaults — so collapse them to a Haiku-valid shape here, after
        // model substitution. Mirrors upstream 9router 401d93bd5. See
        // services/claudeHaikuConstraints.ts.
        translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeHaikuConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeClaudeHaikuConstraints"])(translatedBody, finalModelToUpstream);
        // #6879: per-model default reasoning_effort, injected only when the request
        // carries no reasoning field of any shape — an explicit client/combo-leg value
        // always wins. Scoped to the OpenAI Chat Completions dispatch shape (the shape
        // `reasoning_effort` is native to); unset ModelSpec.defaultReasoningEffort is a
        // no-op. #7694: `modelInfo.resolvedThinkingEffort` — set when the request's model
        // id carried a `<prefix>/<model>-{effort}` synced-model alias suffix
        // (`src/sse/services/model.ts`) — takes priority over the static per-model default.
        // See open-sse/services/defaultReasoningEffort.ts.
        if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
            translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$defaultReasoningEffort$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyDefaultReasoningEffort"])(translatedBody, finalModelToUpstream, modelInfo?.resolvedThinkingEffort);
        }
    }
    // Xiaomi MiMo controls reasoning ONLY via `thinking:{type:"enabled"|"disabled"}` and
    // rejects unknown/extra params with a strict "400 Param Incorrect". Map OmniRoute's
    // OpenAI reasoning signals onto that native shape: reduce any thinking object to
    // `{type}` and drop `reasoning_effort`/`reasoning`. See services/mimoThinking.ts.
    if (provider === "xiaomi-mimo") {
        translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$mimoThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeMimoThinking"])(translatedBody);
    }
    // opencode-go backed providers (ollama-cloud, opencode-go, opencode,
    // opencode-zen) use a Go ChatCompletionRequest struct where `reasoning`
    // is typed as openai.Reasoning (a structured type). A boolean
    // `reasoning: true/false` — valid per the OpenAI API — causes a 400
    // "json: cannot unmarshal bool into Go struct field" on the Go side.
    // Strip the boolean before forwarding. See opencodeReasoningSanitizer.ts.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeReasoningSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isOpencodeGoProvider"])(provider)) {
        translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeReasoningSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripBooleanReasoning"])(translatedBody);
    }
    const previousResponseIdPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesStatePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyResponsesPreviousResponseIdPolicy"])(translatedBody, {
        mode: settings.responsesPreviousResponseIdMode,
        sourceFormat,
        targetFormat,
        credentials
    });
    translatedBody = previousResponseIdPolicy.body;
    // #1789: Prevent output_config.effort from overriding effort encoded in model name (Codex)
    if (provider === "codex" || provider?.startsWith("codex")) {
        const hasEffortSuffix = finalModelToUpstream.match(/-(low|medium|high|xhigh)$/i);
        if (hasEffortSuffix && translatedBody.output_config && typeof translatedBody.output_config === "object") {
            const oc = translatedBody.output_config;
            if (oc.effort) {
                log?.warn?.("PARAMS", `Stripped output_config.effort="${oc.effort}" because model "${finalModelToUpstream}" already encodes effort`);
                delete oc.effort;
                if (Object.keys(oc).length === 0) {
                    delete translatedBody.output_config;
                }
            }
        }
    }
    // Strip unsupported parameters for reasoning models (o1, o3, etc.) and any
    // provider that can't accept them at all (e.g. AI Horde's raw completion
    // backends). When "tools" is among them, also flattens leftover
    // tool_calls/tool-result messages in history (from a combo failover away
    // from a tool-capable model) — those message shapes break non-tool-calling
    // backends just as much as a live `tools` param does.
    const unsupported = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnsupportedParams"])(provider, model);
    // Direct/pinned requests (isCombo: false) have no other target to fail
    // over to. Combo requests are already kept off a tool-incapable target by
    // filterTargetsByRequestCompatibility before ever reaching this point, so
    // this only fires for the case that filter can't protect: a client
    // explicitly asking for this exact model. A clear error beats a 200 that
    // silently can't do what was asked (the model narrates a fake tool call
    // instead — live incident: AI Horde/Behemoth-X-123B).
    const toolCallingCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$toolCallingRequiredCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkToolCallingRequiredButUnsupported"])(translatedBody, unsupported, isCombo, model);
    if (toolCallingCheck.blocked) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(400, toolCallingCheck.message, null, "tool_calling_not_supported");
    }
    if (unsupported.length > 0) {
        const { strippedParams } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$unsupportedParamsStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripUnsupportedParams"])(translatedBody, unsupported);
        if (strippedParams.length > 0) {
            log?.warn?.("PARAMS", `Stripped unsupported params for ${model}: ${strippedParams.join(", ")}`);
        }
    }
    // GPT-5 reasoning models (openai Chat Completions) reject temperature/top_p with a 400
    // whenever a reasoning effort is active, yet accept them under reasoning_effort=none (the
    // GPT-5.1+ default). A static unsupportedParams list can't express that, so strip sampling
    // conditionally here. The codex Responses path is already covered by the executor allowlist.
    translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gpt5SamplingGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripGpt5SamplingWhenReasoning"])(translatedBody, provider, finalModelToUpstream, log);
    // GPT-5.x reasoning models on the raw openai Chat Completions surface reject function
    // `tools` combined with an active `reasoning_effort`: HTTP 400 "Function tools with
    // reasoning_effort are not supported ... Please use /v1/responses instead." This used to
    // be true for every GPT-5.x model on the plain `openai` provider, but #7242 (targetFormat
    // "openai-responses" on GPT_5_6_API_CAPABILITIES) now routes the GPT-5.6 family to
    // /v1/responses instead, which accepts tools + reasoning natively — so the strip must not
    // fire there. Pass the already-resolved `targetFormat` so the guard gates on the actual
    // upstream surface for this request instead of a model-name list. Port of 9router#2540.
    translatedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gpt5SamplingGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripGpt5ReasoningWhenTools"])(translatedBody, provider, finalModelToUpstream, targetFormat, log);
    // Rename max_tokens to max_completion_tokens if not supported (#1961)
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsMaxTokens"])({
        provider,
        model
    })) {
        if (translatedBody.max_tokens !== undefined) {
            if (translatedBody.max_completion_tokens === undefined) {
                translatedBody.max_completion_tokens = translatedBody.max_tokens;
            }
            delete translatedBody.max_tokens;
            log?.debug?.("PARAMS", `Renamed max_tokens to max_completion_tokens for ${model}`);
        }
    } else if (translatedBody.max_completion_tokens !== undefined) {
        // Symmetric case (#6912): some providers/models (e.g. Volcengine Ark /
        // DeepSeek) only document the legacy `max_tokens` field and silently
        // ignore an unrecognized `max_completion_tokens`, so a client sending the
        // newer field alone would have it dropped upstream with no cap applied.
        if (translatedBody.max_tokens === undefined) {
            translatedBody.max_tokens = translatedBody.max_completion_tokens;
        }
        delete translatedBody.max_completion_tokens;
        log?.debug?.("PARAMS", `Renamed max_completion_tokens to max_tokens for ${model}`);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$agentRouterProtocol$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripStore"])(translatedBody, provider, targetFormat);
    // Chat clients may send stream_options.include_usage, but OpenAI Responses
    // upstreams (including Azure AI Foundry /responses) reject stream_options.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && "stream_options" in translatedBody) {
        delete translatedBody.stream_options;
    }
    // Provider-specific max_tokens caps (#711)
    // Some providers reject requests when max_tokens exceeds their API limit.
    // Cap before sending to avoid upstream HTTP 400 errors.
    const providerCap = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_MAX_TOKENS"][provider];
    if (providerCap) {
        for (const field of [
            "max_tokens",
            "max_completion_tokens"
        ]){
            if (typeof translatedBody[field] === "number" && translatedBody[field] > providerCap) {
                log?.debug?.("PARAMS", `Capping ${field} from ${translatedBody[field]} to ${providerCap} for ${provider}`);
                translatedBody[field] = providerCap;
            }
        }
    }
    // Resolve executor with optional upstream proxy (CLIProxyAPI) routing.
    // mode="native" (default): returns the native executor unchanged.
    // mode="cliproxyapi": returns the CLIProxyAPI executor instead.
    // mode="fallback": returns a wrapper that tries native first, falls back to CLIProxyAPI on 5xx/network errors.
    // #6339: pass the resolved connection's providerSpecificData so a per-connection
    // cliproxyapiMode="claude-native" override can deep-route this single connection
    // through CLIProxyAPI regardless of the provider-level upstream_proxy_config mode.
    const resolveExecutorWithProxy = (prov)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveExecutorWithProxy"])(prov, log, credentials?.providerSpecificData ?? null);
    // === Quota Share enforcement PRE-hook (B/F7) ===
    // Runs after provider/model/credentials/apiKeyInfo are fully resolved,
    // before dispatcher. Fail-open per B16: errors → allow.
    let quotaSoftDeprioritize = false;
    if (apiKeyInfo?.id && credentials?.connectionId) {
        try {
            const { enforceQuotaShare } = await __turbopack_context__.A("[project]/src/lib/quota/enforce.ts [instrumentation] (ecmascript, async loader)");
            const decision = await enforceQuotaShare({
                apiKeyId: apiKeyInfo.id,
                connectionId: credentials.connectionId,
                provider: provider ?? "unknown",
                // Resolved model id (post background-redirect / alias) — the same scope the
                // router/log use. Operators configure per-(key,model) caps against THIS id.
                model: model || undefined,
                estimatedCost: {}
            }).catch((err)=>{
                log?.warn?.("QUOTA_SHARE", `enforceQuotaShare failed; fail-open: ${err instanceof Error ? err.message : String(err)}`);
                return {
                    kind: "allow"
                };
            });
            if (decision.kind === "block") {
                const { buildErrorBody } = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript, async loader)");
                log?.warn?.("QUOTA_SHARE", `[quotaShare] blocked apiKeyId=${apiKeyInfo.id} provider=${provider ?? "unknown"}: ${decision.reason}`);
                // Finalize the pending-request slot registered at handler entry — this
                // return path never reaches the upstream, and without the decrement the
                // pending detail lingers as an orphaned status-0 call-log row until the
                // reaper sweeps it (mirrors the other pre-upstream error returns).
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId || credentials?.connectionId || null, false);
                const headers = {
                    "Content-Type": "application/json"
                };
                if (decision.retryAfterSeconds) {
                    headers["Retry-After"] = String(decision.retryAfterSeconds);
                }
                return new Response(JSON.stringify(buildErrorBody(429, decision.reason)), {
                    status: 429,
                    headers
                });
            }
            if (decision.kind === "allow" && decision.deprioritize) {
                quotaSoftDeprioritize = true;
                log?.info?.("QUOTA_SHARE", `[quotaShare] soft deprioritize active for apiKeyId=${apiKeyInfo.id} provider=${provider ?? "unknown"}`);
            }
        } catch (err) {
            // Outer fail-open guard — should not be reached (inner .catch covers it)
            log?.warn?.("QUOTA_SHARE", `[quotaShare] enforceQuotaShare unexpected error; fail-open: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    // G2: Propagate soft penalty to the current candidate so combo scoring can deprioritize.
    if (quotaSoftDeprioritize && isCombo && comboStepId) {
        try {
            const { setCandidateQuotaSoftPenalty } = await __turbopack_context__.A("[project]/open-sse/services/combo.ts [instrumentation] (ecmascript, async loader)");
            setCandidateQuotaSoftPenalty(comboExecutionKey, comboStepId, true);
        } catch (err) {
            log?.warn?.("QUOTA_SHARE", `[quotaShare] could not set soft penalty on candidate: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    // === /Quota Share enforcement PRE-hook ===
    // Get executor for this provider (with optional upstream proxy routing)
    const executor = await resolveExecutorWithProxy(provider);
    const getExecutionCredentials = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executionCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveExecutionCredentials"])({
            credentials,
            nativeCodexPassthrough: nativeResponsesPassthrough,
            endpointPath,
            targetFormat,
            provider,
            ccSessionId,
            modelInfo
        });
    let onPipelineStreamError = null;
    let onClientDisconnectFinalize = null;
    // Create stream controller for disconnect detection
    const streamController = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createStreamController"])({
        onDisconnect: (event)=>{
            let finalized = false;
            try {
                finalized = onClientDisconnectFinalize?.(event) === true;
            } catch  {}
            if (!finalized) {
                try {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["finalizePendingScope"])(pendingScope, {
                        status: 499,
                        error: `Client disconnected: ${event.reason}`,
                        errorCode: "client_disconnected"
                    });
                    finalized = true;
                } catch  {}
            }
            try {
                onDisconnect?.(event);
            } catch  {}
            return finalized;
        },
        onError: (event)=>onPipelineStreamError?.(event),
        provider,
        model,
        connectionId,
        clientResponseFormat,
        clientAbortSignal: clientRawRequest?.signal
    });
    const dedupRequestBody = {
        ...translatedBody,
        model: `${provider}/${model}`,
        stream
    };
    const dedupEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$requestDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldDeduplicate"])(dedupRequestBody);
    const dedupHash = dedupEnabled ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$requestDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["computeRequestHash"])(dedupRequestBody) : null;
    const executeProviderRequest = async (modelToCall = effectiveModel, allowDedup = false)=>{
        const execute = async ()=>{
            // Upstream body preparation extracted to chatCore/upstreamBody.ts (#3501 — first internal
            // sub-slice of executeProviderRequest); produces the body sent upstream (payload rules +
            // tool-limit truncation + prompt_cache_key injection).
            let bodyToSend = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prepareUpstreamBody"])({
                translatedBody,
                modelToCall,
                provider,
                targetFormat,
                credentials,
                log,
                bypassDefaultToolLimit: isOpencodeClient
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                providerRequest: bodyToSend,
                stage: "payload_prepared"
            });
            let releaseRawResultAccountSemaphore = ()=>{};
            try {
                const rawResult = await (async ()=>{
                    let attempts = 0;
                    const isModelScopeForRequest = isModelScope();
                    const maxAttempts = isModelScopeForRequest ? 3 : provider === "codex" ? 3 : 1;
                    // ── Codex 429 account-rotation state ─────────────────────────────────
                    // Track excluded connection IDs for codex failover across attempts.
                    const codexExcludedIds = [];
                    // Derive session affinity key once for codex failover (used to clear affinity on 429).
                    const codexSessionAffinityKey = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractSessionAffinityKey"])(body, clientRawRequest?.headers) ?? null : null;
                    while(attempts < maxAttempts){
                        trace("pre_executor", {
                            attempt: attempts
                        });
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                            stage: "sending_to_provider"
                        });
                        const execCreds = getExecutionCredentials();
                        const attemptConnectionId = execCreds?.connectionId || connectionId;
                        const accountSemaphoreMaxConcurrency = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountSemaphoreMaxConcurrency"])(execCreds);
                        const accountSemaphoreKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountSemaphoreKey"])({
                            provider,
                            model: modelToCall,
                            connectionId: attemptConnectionId,
                            credentials: execCreds
                        });
                        trace("pre_semaphore", {
                            semaphoreKey: accountSemaphoreKey,
                            max: accountSemaphoreMaxConcurrency
                        });
                        if (accountSemaphoreKey && accountSemaphoreMaxConcurrency != null) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                                stage: "waiting_account_slot"
                            });
                        }
                        const releaseAccountSemaphore = accountSemaphoreKey && accountSemaphoreMaxConcurrency != null ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["acquire"])(accountSemaphoreKey, {
                            maxConcurrency: accountSemaphoreMaxConcurrency,
                            signal: streamController.signal
                        }) : ()=>{};
                        trace("post_semaphore");
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                            stage: "waiting_rate_limit"
                        });
                        try {
                            trace("pre_rate_limit", {
                                connectionId: attemptConnectionId
                            });
                            const rawExecutorResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withRateLimit"])(provider, attemptConnectionId, modelToCall, async ()=>{
                                trace("inside_rate_limit", {
                                    connectionId: attemptConnectionId
                                });
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                                    stage: "rate_limit_slot_acquired"
                                });
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executeWithUpstreamStartTimeout"])({
                                    executor,
                                    provider,
                                    model: modelToCall,
                                    signal: streamController.signal,
                                    log,
                                    execute: (signal)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithCapture"])(providerRequestCapture, ()=>executor.execute({
                                                model: modelToCall,
                                                body: bodyToSend,
                                                stream: upstreamStream,
                                                credentials: execCreds,
                                                signal,
                                                log,
                                                extendedContext,
                                                upstreamExtraHeaders: buildUpstreamHeadersForExecute(modelToCall),
                                                clientHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorClientHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildExecutorClientHeaders"])(clientRawRequest?.headers, userAgent),
                                                clientResponseFormat,
                                                onCredentialsRefreshed,
                                                skipUpstreamRetry,
                                                contextEditing: {
                                                    enabled: contextEditingEnabled
                                                }
                                            }))
                                });
                            }, streamController.signal);
                            const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeExecutorResult"])(rawExecutorResult);
                            trace("post_executor", {
                                status: res?.response?.status
                            });
                            // Track Gemini RPM + RPD request counts for 429 classification
                            if (provider === "gemini") {
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["incrementRequestCount"])(modelToCall);
                            }
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                                stage: "provider_response_started"
                            });
                            if (res.response.status === 401 && execCreds?.connectionId) {
                                recordKeyHealthStatus(401, execCreds);
                            }
                            if (isModelScope() && res.response.status === 429 && attempts < maxAttempts - 1) {
                                const bodyPeek = await res.response.clone().text().catch(()=>"");
                                const normalizedHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHeaders"])(res.response.headers);
                                const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelscopePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyModelScope429"])(bodyPeek, normalizedHeaders);
                                if (decision.retryable) {
                                    const delay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelscopePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelScopeRetryDelayMs"])(normalizedHeaders, attempts);
                                    log?.warn?.("MODELSCOPE_RETRY", `429 ${decision.kind}; retrying in ${delay}ms (model remaining: ${decision.snapshot.modelRemaining ?? "unknown"})`);
                                    releaseAccountSemaphore();
                                    await new Promise((r)=>setTimeout(r, delay));
                                    attempts++;
                                    continue;
                                }
                            }
                            // Codex 429 account-rotation failover (disabled for context-relay so combo.ts can inject handoff)
                            if (provider === "codex" && comboStrategy !== "context-relay" && res.response.status === 429 && attempts < maxAttempts - 1) {
                                const failedConnectionId = execCreds?.connectionId || credentials?.connectionId || connectionId;
                                const normalizedHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHeaders"])(res.response.headers);
                                const retryAfterHeader = normalizedHeaders["retry-after"] ?? null;
                                const retryAfterMs = retryAfterHeader ? Number.parseFloat(retryAfterHeader) * 1000 : null;
                                log?.warn?.("CODEX_FAILOVER", `429 on connection ${String(failedConnectionId).slice(0, 8)} (attempt ${attempts + 1}/${maxAttempts}), rotating account`);
                                // Mark only the current Codex model scope as rate-limited.
                                if (failedConnectionId) {
                                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$codexFailover$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markCodexScopeRateLimited"])({
                                        failedConnectionId: String(failedConnectionId),
                                        model: modelToCall || model || requestedModel || null,
                                        rateLimitedUntil: new Date(Date.now() + (retryAfterMs || 60_000)).toISOString(),
                                        credentials
                                    });
                                    // Fix B: also persist the cooldown to
                                    // `provider_connections.rate_limited_until`. Without this,
                                    // the Codex 429 cascade survives the current request (via
                                    // `markCodexScopeRateLimited`'s in-memory Map) but is lost
                                    // on process restart — the same exhausted Codex key is
                                    // re-picked on the very next request. Mirrors
                                    // `open-sse/executors/antigravity.ts:343`.
                                    // Best-effort: never crash the chat path on DB write failure.
                                    try {
                                        const { setConnectionRateLimitUntil } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
                                        const untilMs = Date.now() + (retryAfterMs || 60_000);
                                        setConnectionRateLimitUntil(String(failedConnectionId), untilMs);
                                    } catch  {
                                    // ignore — best effort
                                    }
                                    if (!codexExcludedIds.includes(String(failedConnectionId))) {
                                        codexExcludedIds.push(String(failedConnectionId));
                                    }
                                }
                                // Clear session affinity so next request won't be pinned to the failing account
                                if (codexSessionAffinityKey) {
                                    try {
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteSessionAccountAffinity"])(codexSessionAffinityKey, "codex");
                                    } catch  {
                                    // best-effort
                                    }
                                }
                                // Fetch next available codex connection (excluding all previously failed ones)
                                const nextCreds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])("codex", null, null, modelToCall || model || requestedModel || null, {
                                    excludeConnectionIds: [
                                        ...codexExcludedIds
                                    ]
                                }).catch(()=>null);
                                if (!nextCreds || nextCreds.allRateLimited) {
                                    log?.warn?.("CODEX_FAILOVER", "No more codex accounts available — returning 429");
                                    if (stream) {
                                        releaseAccountSemaphore();
                                        return {
                                            ...res,
                                            _executionCredentials: execCreds
                                        };
                                    }
                                    return {
                                        ...res,
                                        _accountSemaphoreRelease: releaseAccountSemaphore,
                                        _executionCredentials: execCreds
                                    };
                                }
                                const newConnectionId = nextCreds.connectionId;
                                log?.info?.("CODEX_FAILOVER", `Rotating codex account: ${String(failedConnectionId).slice(0, 8)} → ${newConnectionId.slice(0, 8)} (attempt ${attempts + 2}/${maxAttempts})`);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
                                    action: "codex.account_rotation",
                                    actor: apiKeyInfo?.name || "system",
                                    target: newConnectionId,
                                    details: {
                                        failed_connection_id: failedConnectionId,
                                        new_connection_id: newConnectionId,
                                        attempt: attempts + 1,
                                        retry_after_ms: retryAfterMs
                                    }
                                });
                                // Update credentials in-place so getExecutionCredentials() picks up the new account
                                Object.assign(credentials, nextCreds);
                                releaseAccountSemaphore();
                                attempts++;
                                continue;
                            }
                            // For streaming: release the semaphore when the client drains or cancels the stream.
                            if (stream) {
                                const originalBody = res.response.body;
                                if (!originalBody) {
                                    releaseAccountSemaphore();
                                    return res;
                                }
                                // Opt-in transparent stream recovery (free-claude-code port, default OFF).
                                // Only engages for a successful (2xx) stream — an error body must never be
                                // held or replayed. Setting is read once here from the cached resolved
                                // resilience settings; the default path is byte-for-byte unchanged.
                                const okStatus = res.response.status >= 200 && res.response.status < 300;
                                let streamRecoveryEnabled = false;
                                let continueMidStreamEnabled = false;
                                if (okStatus) {
                                    try {
                                        // Reuse the request-consolidated settings read (see line ~2076) — no
                                        // second DB/cache hit. Default OFF when the setting is absent.
                                        const sr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings).streamRecovery;
                                        // Fail-closed: the agent-goal-policy heuristic may only ADD recovery
                                        // when the operator has no explicit configuration. If the operator
                                        // explicitly configured stream recovery (env var or DB/settings
                                        // override), that value always wins — the goal policy must never
                                        // re-enable recovery the operator explicitly turned off.
                                        const operatorExplicit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isStreamRecoveryExplicitlyConfigured"])(settings);
                                        const goalOverride = !operatorExplicit && agentGoalPolicy.streamRecoveryEnabled;
                                        streamRecoveryEnabled = sr.enabled || goalOverride;
                                        continueMidStreamEnabled = sr.continueMidStream === true;
                                        if (goalOverride && !sr.enabled) {
                                            log?.info?.("AGENT_GOAL", `agentGoalPolicy override: stream recovery enabled for goal request requestId=${traceId} model=${modelToCall || model || requestedModel || "unknown"}`);
                                        }
                                    } catch  {
                                        streamRecoveryEnabled = false;
                                        continueMidStreamEnabled = false;
                                    }
                                }
                                let clientBody;
                                if (streamRecoveryEnabled) {
                                    // Run the SAME upstream (same account/creds) with a given body and return
                                    // its 2xx stream, or null. Used both by the early-retry re-open (same body)
                                    // and the mid-stream continuation (assistant-prefilled body).
                                    const runUpstreamStream = async (body)=>{
                                        try {
                                            const retryRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executeWithUpstreamStartTimeout"])({
                                                executor,
                                                provider,
                                                model: modelToCall,
                                                signal: streamController.signal,
                                                log,
                                                execute: (signal)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithCapture"])(providerRequestCapture, ()=>executor.execute({
                                                            model: modelToCall,
                                                            body,
                                                            stream: upstreamStream,
                                                            credentials: execCreds,
                                                            signal,
                                                            log,
                                                            extendedContext,
                                                            upstreamExtraHeaders: buildUpstreamHeadersForExecute(modelToCall),
                                                            clientHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorClientHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildExecutorClientHeaders"])(clientRawRequest?.headers, userAgent),
                                                            clientResponseFormat,
                                                            onCredentialsRefreshed,
                                                            skipUpstreamRetry,
                                                            contextEditing: {
                                                                enabled: contextEditingEnabled
                                                            }
                                                        }))
                                            });
                                            const retryRes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeExecutorResult"])(retryRaw);
                                            const retryOk = retryRes.response.status >= 200 && retryRes.response.status < 300;
                                            if (retryOk && retryRes.response.body) {
                                                return retryRes.response.body;
                                            }
                                            await retryRes.response.body?.cancel().catch(()=>{});
                                            return null;
                                        } catch  {
                                            return null;
                                        }
                                    };
                                    // Mid-stream continuation (Fase 4.4): re-request with the partial text as an
                                    // assistant prefill. Gated by its own setting and only for OpenAI-compatible
                                    // bodies (makeContinuationBody returns null otherwise).
                                    const continueStream = continueMidStreamEnabled ? (assistantSoFar)=>{
                                        const continuationBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$streamRecovery$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["makeContinuationBody"])(bodyToSend, assistantSoFar);
                                        return continuationBody ? runUpstreamStream(continuationBody) : Promise.resolve(null);
                                    } : undefined;
                                    clientBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$streamRecovery$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createRecoverableStream"])(originalBody, ()=>runUpstreamStream(bodyToSend), {
                                        finalize: releaseAccountSemaphore,
                                        onRetry: (attempt, err)=>log?.warn?.("STREAM_RECOVERY", `transparent early-retry ${attempt}/${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_RECOVERY"].EARLY_RETRY_MAX} after ${err?.name || "truncation"}`),
                                        continueStream,
                                        onContinue: (attempt)=>log?.warn?.("STREAM_RECOVERY", `mid-stream continuation attempt ${attempt}/${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_RECOVERY"].EARLY_RETRY_MAX}`)
                                    });
                                } else {
                                    clientBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamFinalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wrapReadableStreamWithFinalize"])(originalBody, releaseAccountSemaphore);
                                }
                                return {
                                    ...res,
                                    _executionCredentials: execCreds,
                                    response: new Response(clientBody, {
                                        status: res.response.status,
                                        statusText: res.response.statusText,
                                        headers: new Headers((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHeaders"])(res.response.headers))
                                    })
                                };
                            }
                            return {
                                ...res,
                                _executionCredentials: execCreds,
                                _accountSemaphoreRelease: releaseAccountSemaphore
                            };
                        } catch (error) {
                            releaseAccountSemaphore();
                            throw error;
                        }
                    }
                })();
                if (stream) {
                    return rawResult;
                }
                // Non-stream: release semaphore immediately after reading full response body.
                const status = rawResult.response.status;
                // Use execution credentials captured during request processing
                if (rawResult._executionCredentials?.connectionId && rawResult._executionCredentials?.apiKey) {
                    recordKeyHealthStatus(status, rawResult._executionCredentials, rawResult.transport);
                }
                releaseRawResultAccountSemaphore = typeof rawResult._accountSemaphoreRelease === "function" ? rawResult._accountSemaphoreRelease : ()=>{};
                const statusText = rawResult.response.statusText;
                const headersObj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHeaders"])(rawResult.response.headers);
                const responseHeaders = new Headers(headersObj);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripStaleForwardingHeaders"])(responseHeaders);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripNextMiddlewareControlHeaders"])(responseHeaders);
                const contentType = (responseHeaders.get("content-type") || "").toLowerCase();
                const payload = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readNonStreamingResponseBody"])(rawResult.response, contentType, upstreamStream);
                releaseRawResultAccountSemaphore();
                releaseRawResultAccountSemaphore = ()=>{};
                return {
                    ...rawResult,
                    response: new Response(payload, {
                        status,
                        statusText,
                        headers: responseHeaders
                    }),
                    _dedupSnapshot: {
                        status,
                        statusText,
                        headers: (()=>{
                            const arr = [];
                            responseHeaders.forEach((v, k)=>arr.push([
                                    k,
                                    v
                                ]));
                            return arr;
                        })(),
                        payload
                    }
                };
            } catch (error) {
                releaseRawResultAccountSemaphore();
                throw error;
            }
        };
        if (allowDedup && dedupEnabled && dedupHash) {
            const dedupResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$requestDedup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deduplicate"])(dedupHash, execute);
            if (dedupResult.wasDeduplicated) {
                log?.debug?.("DEDUP", `Joined in-flight request hash=${dedupHash}`);
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$responseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["materializeDeduplicatedExecutionResult"])(dedupResult.result);
        }
        return execute();
    };
    const registeredProviderRequest = translatedBody && typeof translatedBody === "object" && !Array.isArray(translatedBody) ? {
        ...translatedBody,
        model: typeof translatedBody.model === "string" ? translatedBody.model : effectiveModel,
        ...!Array.isArray(translatedBody.messages) && Array.isArray(body.messages) ? {
            messages: body.messages
        } : {}
    } : translatedBody;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
        providerRequest: registeredProviderRequest
    });
    // T5: track which models we've tried for intra-family fallback
    const triedModels = new Set([
        effectiveModel
    ]);
    let currentModel = effectiveModel;
    // Log start
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
        model,
        provider,
        connectionId,
        status: "PENDING"
    }).catch(()=>{});
    const msgCount = translatedBody.messages?.length || translatedBody.contents?.length || translatedBody.request?.contents?.length || (translatedBody.conversationState?.history?.length ?? 0) + (translatedBody.conversationState?.currentMessage ? 1 : 0) || 0;
    log?.debug?.("REQUEST", `${provider?.toUpperCase()} | ${model} | ${msgCount} msgs`);
    // ── Tier 2: Authoritative per-model/provider token-limit check (provider now resolved) ──
    if (apiKeyInfo?.id) {
        try {
            const tokenBreach = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenLimitCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkTokenLimits"])(apiKeyInfo.id, provider || undefined, model || undefined);
            if (tokenBreach) {
                const scopeLabel = tokenBreach.scopeType === "global" ? "account" : `${tokenBreach.scopeType} "${tokenBreach.scopeValue}"`;
                // FIX 6: clear the pending request marker before the early return so we do
                // not leak a phantom pending request (start was tracked at line ~1847).
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                // FIX 5: tag this as a per-API-key token-limit breach (errorCode
                // TOKEN_LIMIT_EXCEEDED) so the combo loop can distinguish it from an
                // upstream 429 and NOT cool shared accounts / retry it transiently.
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, `Token limit exceeded for ${scopeLabel}: ${tokenBreach.tokensUsed}/${tokenBreach.limitValue} tokens used in the current window. Please try again later.`, null, "TOKEN_LIMIT_EXCEEDED");
            }
        } catch (err) {
            // Fail-open at Tier 2: Tier 1 already enforced the model/global limit pre-dispatch.
            // A transient counter read error here must not break an otherwise-valid request.
            log?.warn?.("TOKEN_LIMIT", "Tier 2 token-limit check failed; allowing request", {
                err
            });
        }
    }
    // ── Gemini pre-dispatch TPM / RPM guard ──────────────────────────────────
    // Avoids guaranteed upstream 429 by checking local sliding-window counters
    // before dispatch. Fail-open: counter errors → allow through.
    if (provider === "gemini") {
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTpmExhausted"])(effectiveModel)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, `Gemini TPM rate limit reached for ${effectiveModel}. Please try again later.`, null, "GEMINI_TPM_EXHAUSTED");
            }
        } catch (err) {
            log?.warn?.("GEMINI_RATE_LIMIT", "Pre-dispatch TPM check failed; allowing request", {
                err
            });
        }
    }
    // Execute request using executor (handles URL building, headers, fallback, transform)
    let providerResponse;
    let providerUrl;
    let providerHeaders;
    let finalBody;
    let claudePromptCacheLogMeta = null;
    try {
        const result = await executeProviderRequest(effectiveModel, true);
        providerResponse = result.response;
        providerUrl = result.url;
        providerHeaders = result.headers;
        finalBody = providerRequestCapture.body(result.transformedBody);
        const responseConnectionId = getCurrentConnectionId();
        effectiveServiceTier = resolveEffectiveServiceTier(finalBody);
        claudePromptCacheLogMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClaudePromptCacheLogMeta"])(targetFormat, finalBody, providerHeaders, clientRawRequest?.headers);
        // Log target request (final request to provider)
        reqLogger.logTargetRequest(providerUrl, providerHeaders, finalBody);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
            providerRequest: finalBody,
            providerUrl,
            stage: "provider_response_started"
        });
        // Update rate limiter from response headers (learn limits dynamically)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateFromHeaders"])(provider, responseConnectionId, providerResponse.headers, providerResponse.status, model);
        // Store rate-limit headers for quota saturation signals
        try {
            const { storeRateLimitHeaders } = await __turbopack_context__.A("[project]/src/lib/quota/saturationSignals.ts [instrumentation] (ecmascript, async loader)");
            storeRateLimitHeaders(responseConnectionId, provider, providerResponse.headers);
        } catch  {
        // fail-open: saturation signal is best-effort
        }
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamErrorResult$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSemaphoreCapacityError"])(error)) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                model,
                provider,
                connectionId,
                status: `FAILED ${error.code}`
            }).catch(()=>{});
            const failureMessage = error.message || "Semaphore timeout";
            persistAttemptLogs({
                status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED,
                error: failureMessage,
                providerRequest: finalBody || translatedBody,
                clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, failureMessage),
                claudeCacheMeta: claudePromptCacheLogMeta,
                cacheSource: "upstream"
            });
            persistFailureUsage(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, error.code);
            const result = stream ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamErrorResult$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createStreamingErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, failureMessage, error.code) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, failureMessage);
            return {
                ...result,
                errorType: "account_semaphore_capacity",
                errorCode: error.code
            };
        }
        // abort(reason) can reject the upstream fetch with a raw string reason
        // (e.g. "request_signal_aborted") that has no `name`/`status`; classify
        // via isLocalStreamLifecycleError so those map to 499 instead of falling
        // through to the 502 provider-failure default.
        const isRequestAborted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(error);
        // #8376: an unreachable upstream proxy (ECONNREFUSED/ECONNRESET/...) is tagged by
        // proxyFetch.ts (tagProxyUnreachable) with `.errorCode = "proxy_unreachable"` before
        // it reaches this catch. Classify it explicitly to 502 instead of falling through
        // the generic `error.status` branch (a raw connect-refused error has no `.status` at
        // all, so it used to collapse into an ordinary 502/504 the provider-breaker predicate
        // can't tell apart from a per-model 5xx).
        const isProxyUnreachableFailure = !isRequestAborted && error?.errorCode === "proxy_unreachable";
        const errorCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamErrorResult$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUpstreamErrorIdentifier"])(error);
        const isLocalQueueTimeout = errorCode === "RATE_LIMIT_QUEUE_TIMEOUT";
        const failureStatus = isRequestAborted ? 499 : isProxyUnreachableFailure ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY : isLocalQueueTimeout ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE : error.name === "TimeoutError" || error.name === "BodyTimeoutError" ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT : error.status && typeof error.status === "number" ? error.status : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY;
        const failureMessage = isRequestAborted ? "Request aborted" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["formatProviderError"])(error, provider, model, failureStatus);
        const upstreamErrorCode = isProxyUnreachableFailure ? "proxy_unreachable" : errorCode;
        // Tag our own deadline timeouts (fetch-start TimeoutError / body BodyTimeoutError,
        // both surfaced as a 504) as "upstream_timeout" so the cooldown layer can tell a
        // slow-but-not-failed request apart from a real provider 5xx. (Antigravity already
        // tags its pre-response timeout via the code below.)
        const isOwnDeadlineTimeout = failureStatus === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT && (error.name === "TimeoutError" || error.name === "BodyTimeoutError");
        const upstreamErrorType = upstreamErrorCode === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE"] || isOwnDeadlineTimeout ? "upstream_timeout" : failureStatus === 401 ? "authentication_error" : undefined;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
            model,
            provider,
            connectionId,
            status: `FAILED ${failureStatus}`
        }).catch(()=>{});
        persistAttemptLogs({
            status: failureStatus,
            error: failureMessage,
            providerRequest: finalBody || translatedBody,
            // On a client-abort (AbortError), the client already disconnected before
            // we ever got here — this body is what we WOULD have sent, not what was
            // actually delivered. Logging it as `clientResponse` is misleading (the
            // dashboard reads that field as "what the client received"), so omit it
            // for this case; `error` above already records the failure reason.
            clientResponse: error.name === "AbortError" ? undefined : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(failureStatus, failureMessage),
            claudeCacheMeta: claudePromptCacheLogMeta,
            cacheSource: "upstream"
        });
        if (isRequestAborted) {
            streamController.handleError(error);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(499, "Request aborted");
        }
        persistFailureUsage(failureStatus, upstreamErrorCode || (error instanceof Error && error.name ? error.name : "upstream_error"));
        console.log(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COLORS"].red}[ERROR] ${failureMessage}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COLORS"].reset}`);
        if (stream && upstreamErrorCode) {
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamErrorResult$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createStreamingErrorResult"])(failureStatus, failureMessage, upstreamErrorCode, upstreamErrorType);
            return {
                ...result,
                errorType: upstreamErrorType,
                errorCode: upstreamErrorCode
            };
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(failureStatus, failureMessage, null, upstreamErrorCode, upstreamErrorType);
    }
    let upstreamErrorParsed = false;
    let parsedStatusCode = providerResponse.status;
    let parsedMessage = "";
    let parsedRetryAfterMs = null;
    let upstreamErrorBody = null;
    // Track whether stream_options was present and stripped — if so, 401/403 after
    // that may be from the modification rather than a genuine auth failure, so we
    // skip the credential refresh attempt in that case.
    const hadStreamOptions = targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && "stream_options" in translatedBody;
    if (hadStreamOptions) {
        delete translatedBody.stream_options;
    }
    // Handle 401/403 - try token refresh using executor
    if ((providerResponse.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].UNAUTHORIZED || providerResponse.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN) && !hadStreamOptions // Skip refresh if failure may be from stream_options removal, not auth
    ) {
        // Fix A: wrap refreshCredentials in runWithOnPersist so the persist callback
        // executes INSIDE the per-connection mutex held by getAccessToken. This makes
        // [network refresh + DB write + outer-state mutation] one atomic step and
        // prevents concurrent requests from reading a stale refreshToken before the
        // DB has been updated (refresh_token_reused on Codex/OpenAI).
        //
        // Not every executor routes refresh through getAccessToken (e.g. github.ts
        // calls refreshCopilotToken directly). When the persistFn doesn't fire from
        // inside getAccessToken, we still need to do the credentials mutation + user
        // callback after refreshCredentials returns. The `persistFnRan` flag tracks
        // which path executed so we don't double-fire (race-prone) or skip (regression).
        // Front 3: remember the refresh_token we are about to present so that, if the
        // refresh fails as unrecoverable, we can tell a genuine death apart from a
        // stale-token reuse that a concurrent/sibling refresh already rotated past.
        const attemptedRefreshToken = typeof credentials?.refreshToken === "string" ? credentials.refreshToken : null;
        let persistFnRan = false;
        const persistFn = onCredentialsRefreshed ? async (refreshResult)=>{
            persistFnRan = true;
            // Mutate the shared credentials object so subsequent executor calls
            // in this request see the new tokens. Runs INSIDE the mutex.
            Object.assign(credentials, refreshResult);
            await onCredentialsRefreshed(refreshResult);
        } : undefined;
        // #4038: build a compare-and-swap reread so getAccessToken can skip the persist if a
        // concurrent writer (sibling request / HealthCheck / replica) already rotated this
        // connection's refresh_token past the one we presented — overwriting would revert it
        // and revoke the token family. No connectionId ⇒ no guard (behavior unchanged).
        const casConnectionId = typeof credentials?.connectionId === "string" ? credentials.connectionId.trim() : "";
        const casReread = casConnectionId ? async ()=>{
            const latest = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(casConnectionId);
            return typeof latest?.refreshToken === "string" ? latest.refreshToken : null;
        } : null;
        const newCredentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshWithRetry"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithCasGuard"])(casReread ? {
                expectedRefreshToken: attemptedRefreshToken,
                reread: casReread
            } : null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["runWithOnPersist"])(persistFn, ()=>executor.refreshCredentials(credentials, log))), 3, log, provider // Explicitly pass the provider to avoid universally tripping the "unknown" circuit breaker
        );
        if (newCredentials?.accessToken || newCredentials?.copilotToken) {
            log?.info?.("TOKEN", `${provider?.toUpperCase()} | refreshed`);
            // Fall back to post-mutex mutation only for executors that don't route
            // through getAccessToken (and therefore never fire onPersist). For
            // executors that DO route through it (Codex, Claude, Gemini, etc.) the
            // mutation already happened atomically inside the mutex.
            if (!persistFnRan) {
                Object.assign(credentials, newCredentials);
                if (onCredentialsRefreshed) {
                    await onCredentialsRefreshed(newCredentials);
                }
            }
            // Retry with new credentials — model + extra headers follow translatedBody.model so they
            // stay aligned if this block ever runs after a path that mutates body.model (e.g. fallback).
            try {
                const retryModelId = String(translatedBody.model || effectiveModel);
                const retryResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithCapture"])(providerRequestCapture, ()=>executor.execute({
                        model: retryModelId,
                        body: translatedBody,
                        stream: upstreamStream,
                        credentials: getExecutionCredentials(),
                        signal: streamController.signal,
                        log,
                        extendedContext,
                        upstreamExtraHeaders: buildUpstreamHeadersForExecute(retryModelId),
                        clientHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorClientHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildExecutorClientHeaders"])(clientRawRequest?.headers, userAgent),
                        clientResponseFormat,
                        onCredentialsRefreshed,
                        skipUpstreamRetry: isCombo,
                        contextEditing: {
                            enabled: contextEditingEnabled
                        }
                    }));
                if (retryResult.response.ok) {
                    providerResponse = retryResult.response;
                    providerUrl = retryResult.url;
                    providerHeaders = new Headers(retryResult.headers || {});
                    finalBody = providerRequestCapture.body(retryResult.transformedBody);
                    reqLogger.logTargetRequest(providerUrl, providerHeaders, finalBody);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                        providerRequest: finalBody,
                        providerUrl,
                        stage: "provider_response_started"
                    });
                    upstreamErrorParsed = false; // Reset since new response is OK
                } else {
                    providerResponse = retryResult.response;
                    upstreamErrorParsed = false; // Let it be parsed downstream
                }
            } catch (retryErr) {
                // Refresh succeeded but the retry leg failed (network blip, AbortError,
                // executor throw). Don't swallow — the operator-visible signal "the user
                // saw 401 even though auth was actually fixed" is much more confusing
                // than the original 401 alone. Surface at error level with sanitization.
                log?.error?.("TOKEN", `${provider?.toUpperCase()} | retry after refresh failed: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(retryErr)}`);
            }
        } else {
            log?.warn?.("TOKEN", `${provider?.toUpperCase()} | refresh failed`);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(newCredentials) && onCredentialsRefreshed) {
                // Front 3 (reuse-race tolerance): before deactivating, re-read the DB.
                // If a sibling/concurrent refresh already rotated this connection's
                // refresh_token (common for Codex/OpenAI under one shared Auth0 client),
                // the failure we saw was a stale-token reuse — the account is healthy
                // with the newer token, so keep it active instead of killing it.
                let alreadyRotated = false;
                if (typeof connectionId === "string" && connectionId && attemptedRefreshToken) {
                    try {
                        const latest = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(connectionId);
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wasRefreshTokenRotated"])(attemptedRefreshToken, latest?.refreshToken)) {
                            alreadyRotated = true;
                            log?.warn?.("TOKEN", `${provider.toUpperCase()} | refresh_token already rotated by a concurrent refresh — keeping connection active`);
                        }
                    } catch  {
                    // DB read failed — fall through to the safe default (deactivate).
                    }
                }
                if (!alreadyRotated) {
                    await onCredentialsRefreshed({
                        testStatus: "expired",
                        isActive: false
                    });
                }
            }
        }
    }
    await persistCodexQuotaState((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHeaders"])(providerResponse.headers), providerResponse.status);
    // Check provider response - return error info for fallback handling
    providerFailure: if (!providerResponse.ok) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
        let statusCode = providerResponse.status;
        let message = "";
        let retryAfterMs = null;
        let upstreamErrorCode;
        let upstreamErrorType;
        if ("TURBOPACK compile-time falsy", 0) {
            statusCode = parsedStatusCode;
            message = parsedMessage;
            retryAfterMs = parsedRetryAfterMs;
        } else {
            const details = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUpstreamError"])(providerResponse, provider);
            statusCode = details.statusCode;
            message = details.message;
            retryAfterMs = details.retryAfterMs;
            upstreamErrorBody = details.responseBody;
            upstreamErrorCode = details.errorCode;
            upstreamErrorType = details.errorType;
        }
        const signatureRecovery = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$thinkingSignatureRecovery$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recoverAnthropicThinkingSignature"])({
            provider,
            statusCode,
            message,
            body: translatedBody,
            execute: async (recoveryBody)=>{
                translatedBody = recoveryBody;
                return executeProviderRequest(currentModel, false);
            },
            parseError: (response)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUpstreamError"])(response, provider)
        });
        if (signatureRecovery.attempted && signatureRecovery.execution) {
            providerResponse = signatureRecovery.execution.response;
            if (signatureRecovery.succeeded) {
                providerUrl = signatureRecovery.execution.url;
                providerHeaders = signatureRecovery.execution.headers;
                finalBody = providerRequestCapture.body(signatureRecovery.execution.transformedBody);
                reqLogger.logTargetRequest(providerUrl, providerHeaders, finalBody);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                    providerRequest: finalBody,
                    providerUrl,
                    stage: "provider_response_started"
                });
                log?.info?.("THINKING_SIGNATURE", `Recovered ${provider}/${currentModel} after one historical-thinking retry`);
            } else if (signatureRecovery.error) {
                statusCode = signatureRecovery.error.statusCode;
                message = signatureRecovery.error.message;
                retryAfterMs = signatureRecovery.error.retryAfterMs;
                upstreamErrorBody = signatureRecovery.error.responseBody;
                upstreamErrorCode = signatureRecovery.error.errorCode;
                upstreamErrorType = signatureRecovery.error.errorType;
            }
        }
        if (signatureRecovery.succeeded) break providerFailure;
        // T06/T10/T36: classify provider errors and persist terminal account states.
        let errorType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyProviderError"])(statusCode, message, provider);
        if (statusCode === 429 && isModelScope()) {
            const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelscopePolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyModelScope429"])(message, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHeaders"])(providerResponse.headers));
            errorType = decision.kind === "quota_exhausted" ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].QUOTA_EXHAUSTED : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].RATE_LIMITED;
            log?.warn?.("MODELSCOPE_429", `${decision.kind} (model remaining: ${decision.snapshot.modelRemaining ?? "unknown"}, total remaining: ${decision.snapshot.totalRemaining ?? "unknown"})`);
        }
        const errorConnectionId = getCurrentConnectionId();
        if (errorConnectionId && errorType) {
            try {
                if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].FORBIDDEN) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                        isActive: false,
                        testStatus: "banned",
                        lastErrorType: errorType,
                        lastError: message,
                        errorCode: statusCode
                    });
                    console.warn(`[provider] Node ${errorConnectionId} banned (${statusCode}) — disabling permanently`);
                } else if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].ACCOUNT_DEACTIVATED) {
                    // Plan A: if connection has extra API keys, don't disable — only the failing key is affected.
                    // Single-key connections still get disabled as before.
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["connectionHasExtraKeys"])(errorConnectionId, credentials?.providerSpecificData?.extraApiKeys)) {
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                            lastErrorType: errorType,
                            lastError: message,
                            errorCode: statusCode
                        });
                        console.warn(`[provider] Node ${errorConnectionId} account deactivated (${statusCode}) — has extra keys, keeping connection active`);
                    } else {
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                            isActive: false,
                            testStatus: "deactivated",
                            lastErrorType: errorType,
                            lastError: message,
                            errorCode: statusCode
                        });
                        console.warn(`[provider] Node ${errorConnectionId} account deactivated (${statusCode}) — disabling permanently`);
                    }
                } else if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].QUOTA_EXHAUSTED) {
                    // Providers with per-model quotas — lock the model only, not the connection
                    const quotaCooldownMs = retryAfterMs || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].rateLimit;
                    const accountSemaphoreKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$executorHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountSemaphoreKey"])({
                        provider,
                        model: currentModel,
                        connectionId: errorConnectionId,
                        credentials
                    });
                    if (accountSemaphoreKey) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markBlocked"])(accountSemaphoreKey, quotaCooldownMs);
                    }
                    if (isModelScope() && errorConnectionId) {
                        const lockFn = provider === "antigravity" ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockExactModel"] : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"];
                        lockFn(provider, errorConnectionId, model, "quota_exhausted", quotaCooldownMs);
                        console.warn(`[provider] Node ${errorConnectionId} ModelScope model quota exhausted (${statusCode}) for ${model} - ${Math.ceil(quotaCooldownMs / 1000)}s (connection stays active)`);
                    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModelIfPerModelQuota"])(provider, errorConnectionId, model, "quota_exhausted", quotaCooldownMs)) {
                        const quotaScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaScopeLabelForProvider"])(provider, model);
                        console.warn(`[provider] Node ${errorConnectionId} ${quotaScope}-only quota exhausted (${statusCode}) for ${model} - ${Math.ceil(quotaCooldownMs / 1000)}s (cooldown_scope=${quotaScope}, ttl_source=${retryAfterMs ? "upstream" : "inferred"}, connection stays active)`);
                    } else {
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                            testStatus: "credits_exhausted",
                            lastErrorType: errorType,
                            lastError: message,
                            errorCode: statusCode
                        });
                        console.warn(`[provider] Node ${errorConnectionId} exhausted quota (${statusCode})`);
                    }
                } else if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].UNAUTHORIZED) {
                    // Normal 401 (token/session auth issue): keep account active for refresh/re-auth.
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                        lastErrorType: errorType,
                        lastError: message,
                        errorCode: statusCode
                    });
                } else if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].OAUTH_INVALID_TOKEN) {
                    // OAuth 401 with invalid credentials - token refresh can recover
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                        lastErrorType: errorType,
                        lastError: message,
                        errorCode: statusCode
                    });
                    console.warn(`[provider] Node ${errorConnectionId} OAuth token invalid (${statusCode}) — token refresh available`);
                } else if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].PROJECT_ROUTE_ERROR) {
                    // Cloud Code 403 with stale project: not a ban, keep account active.
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(errorConnectionId, {
                        lastErrorType: errorType,
                        lastError: message,
                        errorCode: statusCode
                    });
                    console.warn(`[provider] Node ${errorConnectionId} project routing error (${statusCode}) — not banning`);
                } else if (errorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].MODEL_NOT_FOUND) {
                    // 404 — model/endpoint does not exist upstream. Lock the model so the
                    // retry/backoff loop stops hammering the dead endpoint (which would
                    // otherwise degenerate into a 429 rate-limit storm). Connection stays
                    // active since only the specific model is unavailable. (#6827)
                    const notFoundCooldownMs = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFound;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"])(provider, errorConnectionId, currentModel, "model_not_found", notFoundCooldownMs);
                    console.warn(`[provider] Node ${errorConnectionId} model not found (${statusCode}) for ${currentModel} - locking model for ${Math.ceil(notFoundCooldownMs / 1000)}s (connection stays active)`);
                }
            } catch  {
            // Best-effort state update; request flow should continue with fallback handling.
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
            model,
            provider,
            connectionId: errorConnectionId,
            status: `FAILED ${statusCode}`
        }).catch(()=>{});
        const errMsg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["formatProviderError"])(new Error(message), provider, model, statusCode);
        console.log(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COLORS"].red}[ERROR] ${errMsg}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$usageTracking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COLORS"].reset}`);
        // Log Antigravity retry time if available
        if (retryAfterMs && provider === "antigravity") {
            const retrySeconds = Math.ceil(retryAfterMs / 1000);
            log?.debug?.("RETRY", `Antigravity quota reset in ${retrySeconds}s (${retryAfterMs}ms)`);
        }
        // Log error with full request body for debugging
        reqLogger.logError(new Error(message), finalBody || translatedBody);
        reqLogger.logProviderResponse(providerResponse.status, providerResponse.statusText, providerResponse.headers, upstreamErrorBody);
        // Update rate limiter from error response headers
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateFromHeaders"])(provider, errorConnectionId, providerResponse.headers, statusCode, model);
        if (errorConnectionId && upstreamErrorBody !== null && upstreamErrorBody !== undefined) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateFromResponseBody"])(provider, errorConnectionId, upstreamErrorBody, statusCode, model);
        }
        // ── T5: Intra-family model fallback ──────────────────────────────────────
        // Before returning a model-unavailable error upstream, try sibling models
        // from the same family. This keeps the request alive on the same account
        // instead of failing the entire combo.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelUnavailableError"])(statusCode, message)) {
            const nextModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNextFamilyFallback"])(currentModel, triedModels);
            if (nextModel) {
                triedModels.add(nextModel);
                currentModel = nextModel;
                translatedBody.model = nextModel;
                log?.info?.("MODEL_FALLBACK", `${model} unavailable (${statusCode}) → trying ${nextModel}`);
                // Re-execute with the fallback model
                try {
                    const fallbackResult = await executeProviderRequest(nextModel, false);
                    if (fallbackResult.response.ok) {
                        providerResponse = fallbackResult.response;
                        providerUrl = fallbackResult.url;
                        providerHeaders = fallbackResult.headers;
                        finalBody = providerRequestCapture.body(fallbackResult.transformedBody);
                        reqLogger.logTargetRequest(providerUrl, providerHeaders, finalBody);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                            providerRequest: finalBody,
                            providerUrl,
                            stage: "provider_response_started"
                        });
                        // Continue processing with the fallback response — skip error return
                        log?.info?.("MODEL_FALLBACK", `Serving ${nextModel} as fallback for ${model}`);
                    // Jump to streaming/non-streaming handling below
                    // We fall through by NOT returning here
                    } else {
                        // Fallback also failed — return original error
                        persistAttemptLogs({
                            status: statusCode,
                            error: errMsg,
                            providerRequest: finalBody || translatedBody,
                            providerResponse: upstreamErrorBody,
                            clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                            cacheSource: "upstream"
                        });
                        persistFailureUsage(statusCode, "model_unavailable");
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                            passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
                        });
                    }
                } catch  {
                    persistAttemptLogs({
                        status: statusCode,
                        error: errMsg,
                        providerRequest: finalBody || translatedBody,
                        providerResponse: upstreamErrorBody,
                        clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                        cacheSource: "upstream"
                    });
                    persistFailureUsage(statusCode, "model_unavailable");
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                        passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
                    });
                }
            } else {
                persistAttemptLogs({
                    status: statusCode,
                    error: errMsg,
                    providerRequest: finalBody || translatedBody,
                    providerResponse: upstreamErrorBody,
                    clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                    cacheSource: "upstream"
                });
                persistFailureUsage(statusCode, "model_unavailable");
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                    passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
                });
            }
        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isContextOverflowError"])(statusCode, message)) {
            const familyCandidates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelFamily"])(currentModel).filter((m)=>m !== currentModel && !triedModels.has(m));
            const nextModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findLargerContextModel"])(currentModel, familyCandidates) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNextFamilyFallback"])(currentModel, triedModels);
            if (nextModel) {
                triedModels.add(nextModel);
                currentModel = nextModel;
                translatedBody.model = nextModel;
                log?.info?.("CONTEXT_OVERFLOW_FALLBACK", `${model} context overflow → trying ${nextModel}`);
                try {
                    const fallbackResult = await executeProviderRequest(nextModel, false);
                    if (fallbackResult.response.ok) {
                        providerResponse = fallbackResult.response;
                        providerUrl = fallbackResult.url;
                        providerHeaders = fallbackResult.headers;
                        finalBody = providerRequestCapture.body(fallbackResult.transformedBody);
                        reqLogger.logTargetRequest(providerUrl, providerHeaders, finalBody);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updatePendingScope"])(pendingScope, {
                            providerRequest: finalBody,
                            providerUrl,
                            stage: "provider_response_started"
                        });
                        log?.info?.("CONTEXT_OVERFLOW_FALLBACK", `Serving ${nextModel} as fallback for ${model}`);
                    } else {
                        persistAttemptLogs({
                            status: statusCode,
                            error: errMsg,
                            providerRequest: finalBody || translatedBody,
                            providerResponse: upstreamErrorBody,
                            clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                            cacheSource: "upstream"
                        });
                        persistFailureUsage(statusCode, "context_overflow");
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                            passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
                        });
                    }
                } catch  {
                    persistAttemptLogs({
                        status: statusCode,
                        error: errMsg,
                        providerRequest: finalBody || translatedBody,
                        providerResponse: upstreamErrorBody,
                        clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                        cacheSource: "upstream"
                    });
                    persistFailureUsage(statusCode, "context_overflow");
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                        passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
                    });
                }
            } else {
                persistAttemptLogs({
                    status: statusCode,
                    error: errMsg,
                    providerRequest: finalBody || translatedBody,
                    providerResponse: upstreamErrorBody,
                    clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                    cacheSource: "upstream"
                });
                persistFailureUsage(statusCode, "context_overflow");
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                    passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
                });
            }
        } else {
            persistAttemptLogs({
                status: statusCode,
                error: errMsg,
                providerRequest: finalBody || translatedBody,
                providerResponse: upstreamErrorBody,
                clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(statusCode, errMsg),
                cacheSource: "upstream"
            });
            persistFailureUsage(statusCode, `upstream_${statusCode}`);
            // Emergency budget fallback is orchestrated exclusively by the routing layer
            // (src/sse/handlers/chat.ts), which resolves credentials FOR the emergency
            // provider through account selection. The executor-level hop that used to
            // live here re-sent the FAILING provider's credentials to the emergency
            // provider's endpoint (e.g. the OpenAI API key to integrate.api.nvidia.com)
            // — a cross-provider credential leak that also never succeeded upstream.
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(statusCode, errMsg, retryAfterMs, upstreamErrorCode, upstreamErrorType, upstreamErrorBody, {
                passthrough: sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE
            });
        }
    // ── End T5 ───────────────────────────────────────────────────────────────
    }
    // Non-streaming response
    if (!stream) {
        const parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseParse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNonStreamingResponseBody"])({
            providerResponse,
            upstreamStream,
            providerHeaders,
            finalBody,
            targetFormat,
            model,
            log
        });
        const normalizedProviderPayload = parsed.normalizedProviderPayload;
        const looksLikeSSE = parsed.looksLikeSSE;
        if (parsed.kind === "invalid_sse") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                model,
                provider,
                connectionId,
                status: `FAILED ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY}`
            }).catch(()=>{});
            const invalidSseMessage = parsed.message;
            persistAttemptLogs({
                status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
                error: invalidSseMessage,
                providerRequest: finalBody || translatedBody,
                providerResponse: normalizedProviderPayload,
                clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, invalidSseMessage),
                cacheSource: "upstream"
            });
            persistFailureUsage(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, "invalid_sse_payload");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, pendingConnId, false);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, invalidSseMessage);
        }
        if (parsed.kind === "invalid_json") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                model,
                provider,
                connectionId,
                status: `FAILED ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY}`
            }).catch(()=>{});
            const detailedError = parsed.detailedError;
            const invalidJsonMessage = parsed.message;
            persistAttemptLogs({
                status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
                error: detailedError,
                providerRequest: finalBody || translatedBody,
                providerResponse: normalizedProviderPayload,
                clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, invalidJsonMessage),
                cacheSource: "upstream"
            });
            persistFailureUsage(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, "invalid_json_payload");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, invalidJsonMessage);
        }
        let responseBody = parsed.responseBody;
        let responsePayloadFormat = parsed.responsePayloadFormat;
        // ── ClinePass {success,data} envelope unwrap (before translation) ──────────
        // ClinePass wraps non-streaming JSON in a {success, data} envelope; errors
        // use {success:false, error}. Transient {success:false, error:"empty..."}
        // responses get one 2s retry before surfacing. CLINEPASS-GATED — untouched
        // for every other provider. Envelope errors route through createErrorResult
        // (→ buildErrorBody/sanitizeErrorMessage, Rule #12).
        if (provider === "clinepass") {
            let { body: unwrapped, error: envError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$clinepassEnvelope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unwrapClinepassEnvelope"])(responseBody, provider);
            if (envError && /empty/i.test(envError.message || "")) {
                log?.warn?.("RETRY", "clinepass returned empty content, retrying once after 2s");
                await new Promise((r)=>setTimeout(r, 2000));
                try {
                    const retryResult = await executeProviderRequest(effectiveModel, false);
                    if (retryResult?.response?.ok) {
                        const retryParsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseParse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNonStreamingResponseBody"])({
                            providerResponse: retryResult.response,
                            upstreamStream: undefined,
                            providerHeaders: retryResult.headers,
                            finalBody: retryResult.transformedBody,
                            targetFormat,
                            model,
                            log
                        });
                        if (retryParsed.kind !== "invalid_sse" && retryParsed.kind !== "invalid_json") {
                            providerResponse = retryResult.response;
                            providerUrl = retryResult.url;
                            providerHeaders = retryResult.headers;
                            finalBody = providerRequestCapture.body(retryResult.transformedBody);
                            ({ body: unwrapped, error: envError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$clinepassEnvelope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unwrapClinepassEnvelope"])(retryParsed.responseBody, provider));
                        }
                    }
                } catch (retryErr) {
                    log?.warn?.("RETRY", `clinepass retry failed: ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`);
                }
            }
            if (envError) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                    model,
                    provider,
                    connectionId,
                    status: `FAILED ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY}`
                }).catch(()=>{});
                persistFailureUsage(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, "clinepass_envelope_error");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, envError.message);
            }
            responseBody = unwrapped;
        }
        responseBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$clineResponseEnvelope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unwrapClineNonStreamingEnvelope"])(provider, responseBody);
        // Check for empty content response (fake success) - trigger fallback
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isEmptyContentResponse"])(responseBody)) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                model,
                provider,
                connectionId,
                status: `FAILED ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY}`
            }).catch(()=>{});
            const emptyContentMessage = "Provider returned empty content";
            persistAttemptLogs({
                status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
                error: emptyContentMessage,
                providerRequest: finalBody || translatedBody,
                providerResponse: normalizedProviderPayload,
                clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, emptyContentMessage),
                cacheSource: "upstream"
            });
            persistFailureUsage(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, "empty_content");
            // Trigger non-recursive fallback for empty content
            const nextModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelFamilyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNextFamilyFallback"])(currentModel, triedModels);
            if (nextModel) {
                triedModels.add(nextModel);
                currentModel = nextModel;
                translatedBody.model = nextModel;
                log?.info?.("EMPTY_CONTENT_FALLBACK", `${model} returned empty content → trying ${nextModel}`);
                try {
                    const fallbackResult = await executeProviderRequest(nextModel, false);
                    if (fallbackResult.response.ok) {
                        const fallbackRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["withBodyTimeout"])(fallbackResult.response.text());
                        try {
                            responseBody = fallbackRaw ? JSON.parse(fallbackRaw) : {};
                            providerUrl = fallbackResult.url;
                            providerHeaders = fallbackResult.headers;
                            finalBody = providerRequestCapture.body(fallbackResult.transformedBody);
                            reqLogger.logTargetRequest(providerUrl, providerHeaders, finalBody);
                            log?.info?.("EMPTY_CONTENT_FALLBACK", `Serving ${nextModel} as fallback for ${model}`);
                        // Fall through — continue processing with the new responseBody
                        } catch  {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, emptyContentMessage);
                        }
                    } else {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, emptyContentMessage);
                    }
                } catch  {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, emptyContentMessage);
                }
            } else {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, emptyContentMessage);
            }
        }
        const restoreClaudeNames = sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE;
        let responseToolNameMap;
        [responseBody, responseToolNameMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughToolNames$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["restoreNonStreamingToolNames"])(responseBody, toolNameMap, finalBody, restoreClaudeNames);
        reqLogger.logProviderResponse(providerResponse.status, providerResponse.statusText, providerResponse.headers, looksLikeSSE ? {
            _streamed: true,
            _format: "sse-json",
            summary: responseBody
        } : responseBody);
        effectiveServiceTier = resolveReportedServiceTier(responseBody) ?? effectiveServiceTier;
        // Notify success - caller can clear error status if needed
        if (onRequestSuccess) {
            await onRequestSuccess();
        }
        const successConnectionId = getCurrentConnectionId();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["maybeSyncClaudeExtraUsageState"])({
            provider,
            connectionId: successConnectionId,
            providerSpecificData: credentials?.providerSpecificData,
            log
        });
        // Log usage for non-streaming responses
        const usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$usageExtractor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractUsageFromResponse"])(responseBody, provider);
        if (usage && typeof usage === "object") {
            attachCompressionUsageReceiptAfterAnalytics(usage, "provider");
            // Track Gemini token consumption for TPM rate-limit pre-check
            if (provider === "gemini") {
                const promptTokens = typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : 0;
                if (promptTokens > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["incrementTokenUsage"])(model, promptTokens);
            }
        }
        // Context Editing telemetry: when the delegated server-side clear actually ran,
        // record the provider's cleared-token receipt under engine "context-editing" so
        // it surfaces in compression analytics. Best-effort, Claude-only, non-streaming.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$contextEditingTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordContextEditingTelemetryHook"])({
            contextEditingEnabled,
            provider,
            responseBody,
            skillRequestId,
            log
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
            model,
            provider,
            connectionId: successConnectionId,
            tokens: usage,
            status: "200 OK"
        }).catch(()=>{});
        // Save structured call log with full payloads
        const cacheUsageLogMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cacheUsageMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildCacheUsageLogMeta"])(usage);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordNonStreamingUsageStats"])(usage, {
            traceEnabled,
            provider,
            connectionId: successConnectionId,
            model,
            startTime,
            apiKeyInfo,
            effectiveServiceTier,
            isCombo,
            comboStrategy,
            endpoint: endpointPath
        });
        // Translate response to client's expected format (usually OpenAI)
        // Pass toolNameMap so Claude OAuth proxy_ prefix is stripped in tool_use blocks (#605)
        let translatedResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["needsTranslation"])(responsePayloadFormat, clientResponseFormat) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseTranslator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["translateNonStreamingResponse"])(responseBody, responsePayloadFormat, clientResponseFormat, responseToolNameMap) : responseBody;
        const memoryExtractionResponse = translatedResponse;
        // T26: Strip markdown code blocks if provider format is Claude
        if (sourceFormat === "claude" && !stream) {
            if (typeof translatedResponse?.choices?.[0]?.message?.content === "string") {
                translatedResponse.choices[0].message.content = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$aiSdkCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripMarkdownCodeFence"])(translatedResponse.choices[0].message.content);
            }
        }
        // T18: Normalize finish_reason to 'tool_calls' if tool calls are present
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughToolNames$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAIToolFinishReasons"])(translatedResponse);
        // Reasoning Replay Cache (#1628): Capture reasoning_content from non-streaming responses
        // with tool_calls so it can be replayed on subsequent turns (DeepSeek V4, Kimi K2, etc.)
        try {
            const firstChoice = translatedResponse?.choices?.[0];
            const msg = firstChoice?.message;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cacheReasoningFromAssistantMessage"])(msg, provider, model, {
                requestId: skillRequestId,
                messageIndex: 0
            });
        } catch  {
        // Cache capture is non-critical — never block the response
        }
        // Sanitize response for OpenAI SDK compatibility
        // Strips non-standard fields (x_groq, usage_breakdown, service_tier, etc.)
        // Extracts <think> and <thinking> tags into reasoning_content
        // Source format determines output shape. If we are outputting OpenAI shape or pseudo-OpenAI shape, sanitize.
        if (clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
            translatedResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeResponsesApiResponse"])(translatedResponse);
            // Responses-API non-stream path: restore `{namespace, name}` on every
            // `function_call` item that was flattened from a namespace sub-tool on
            // the request side (#7936 round-trip closure).
            const responseOutput = translatedResponse?.output;
            if (requestToolIdentityMap && Array.isArray(responseOutput)) {
                for (const item of responseOutput){
                    if (item?.type !== "function_call") continue;
                    const identity = requestToolIdentityMap.get(item.name);
                    if (identity) {
                        item.namespace = identity.namespace;
                        item.name = identity.name;
                    }
                }
            }
        } else if (clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
            // Port of decolua/9router#517: opt-in `x-omniroute-strip-reasoning` header
            // unconditionally drops `reasoning_content` from the final non-streaming
            // JSON for clients (e.g. Firecrawl AI SDK) whose JSON parsers break on
            // that non-standard field. Reasoning replay cache is captured above this
            // sanitize step, so the cache feature is unaffected.
            const stripReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isStripReasoningRequested"])(clientRawRequest?.headers ?? null);
            translatedResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeOpenAIResponse"])(translatedResponse, {
                stripReasoning,
                parseTextualReasoningTags: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldParseTextualReasoningTags"])(provider, model)
            });
        }
        // #8331: keep the client-visible metering fields real everywhere except Claude-Code-compatible
        // providers, where Claude Code's own context accounting relies on the buffered number — see
        // clientUsageBuffer.ts module docstring.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$clientUsageBuffer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyClientUsageBuffer"])(translatedResponse, body, clientResponseFormat, {
            preserveContextBudgetInVisibleUsage: isClaudeCodeCompatible
        });
        if (memoryOwnerId && memorySettings?.enabled && memorySettings.maxTokens > 0) {
            const requestMemoryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memoryExtraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMemoryTextFromRequestBody"])(body);
            if (requestMemoryText) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractFacts"])(requestMemoryText, memoryOwnerId, pipelineSessionId);
            }
            const memoryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memoryExtraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMemoryTextFromResponse"])(memoryExtractionResponse);
            if (memoryText) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractFacts"])(memoryText, memoryOwnerId, pipelineSessionId);
            }
        }
        const customSkillExecutionEnabled = Boolean(memoryOwnerId) && memorySettings?.skillsEnabled === true;
        const builtinToolNames = [
            webSearchFallbackPlan.toolName,
            webFetchFallbackPlan.toolName
        ].filter((name)=>Boolean(name));
        if (customSkillExecutionEnabled || builtinToolNames.length > 0) {
            const skillSessionId = pipelineSessionId;
            translatedResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$interception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleToolCallExecution"])(translatedResponse, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$skillsFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSkillsModelIdForFormat"])(sourceFormat), {
                apiKeyId: memoryOwnerId || "local",
                sessionId: skillSessionId,
                requestId: skillRequestId,
                builtinToolNames,
                customSkillExecutionEnabled,
                provider,
                model: effectiveModel
            });
        }
        const guardrailContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$postCallGuardrailContext$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildPostCallGuardrailContext"])({
            apiKeyInfo,
            body,
            clientRawRequest,
            log,
            model,
            provider,
            responsePayloadFormat,
            clientResponseFormat
        });
        const postCallGuardrails = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["guardrailRegistry"].runPostCallHooks(translatedResponse, guardrailContext);
        translatedResponse = postCallGuardrails.response;
        const responseUsage = (usage && typeof usage === "object" ? usage : null) || (translatedResponse?.usage && typeof translatedResponse.usage === "object" ? translatedResponse.usage : null);
        const estimatedCost = responseUsage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, responseUsage, {
            serviceTier: effectiveServiceTier
        }) : 0;
        if (postCallGuardrails.blocked) {
            const guardrailMessage = postCallGuardrails.message || "Response blocked by guardrail";
            persistAttemptLogs({
                status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST,
                tokens: usage,
                responseBody,
                providerRequest: finalBody || translatedBody,
                providerResponse: looksLikeSSE ? {
                    _streamed: true,
                    _format: "sse-json",
                    summary: responseBody
                } : responseBody,
                clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, guardrailMessage),
                claudeCacheMeta: claudePromptCacheLogMeta,
                claudeCacheUsageMeta: cacheUsageLogMeta,
                cacheSource: "upstream"
            });
            if (apiKeyInfo?.id && estimatedCost > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$costRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordCost"])(apiKeyInfo.id, estimatedCost);
            }
            log?.warn?.("GUARDRAIL", `Response blocked by ${postCallGuardrails.guardrail || "guardrail"}: ${guardrailMessage}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["finalizePendingScope"])(pendingScope, {
                providerResponse: responseBody,
                clientResponse: translatedResponse
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, guardrailMessage);
        }
        // Validate the *translated* response actually carries client-usable output.
        // isEmptyContentResponse (above) runs on the raw responseBody before translation;
        // this check runs after translation + sanitization + tool-call execution to catch
        // cases where a provider returns a structurally valid raw body that translates into
        // choices:[] or output:[] with no usable content (Responses API shape included).
        const malformedTranslatedReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$diagnostics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectMalformedNonStream"])(translatedResponse);
        if (malformedTranslatedReason) {
            const totalLatency = Date.now() - startTime;
            const rawBytes = (()=>{
                try {
                    return JSON.stringify(responseBody || {}).length;
                } catch  {
                    return -1;
                }
            })();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$diagnostics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportMalformed200"])({
                mode: "nonstream",
                provider,
                model,
                connectionId,
                reason: malformedTranslatedReason,
                recvBytes: rawBytes,
                recvLines: -1,
                emitted: -1,
                events: {},
                ttftMs: totalLatency,
                elapsedMs: totalLatency
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
                model,
                provider,
                connectionId,
                status: `FAILED ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY}`
            }).catch(()=>{});
            const malformed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$diagnostics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["describeMalformedNonStream"])(translatedResponse, malformedTranslatedReason);
            const malformedMessage = `[${provider}/${model}] ${malformed.message}`;
            const malformedClientBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, malformedMessage);
            malformedClientBody.error.code = malformed.code;
            malformedClientBody.error.type = malformed.type;
            persistAttemptLogs({
                status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
                tokens: usage,
                responseBody,
                providerRequest: finalBody || translatedBody,
                providerResponse: looksLikeSSE ? {
                    _streamed: true,
                    _format: "sse-json",
                    summary: responseBody
                } : responseBody,
                clientResponse: malformedClientBody,
                claudeCacheMeta: claudePromptCacheLogMeta,
                claudeCacheUsageMeta: cacheUsageLogMeta,
                cacheSource: "upstream"
            });
            persistFailureUsage(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, "malformed_translated_response");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, pendingConnId, false);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createErrorResult"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, malformedMessage, null, malformed.code, malformed.type);
        }
        // ── Phase 9.1: Cache store (non-streaming, temp=0) ──
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$semanticCacheStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeSemanticCacheResponse"])({
            enabled: semanticCacheEnabled,
            body,
            headers: clientRawRequest?.headers,
            translatedResponse,
            model,
            apiKeyId: apiKeyInfo?.id ?? undefined,
            usage,
            log
        });
        // ── Phase 9.2: Save for idempotency ──
        // Reuse the key resolved by checkIdempotencyCache() above (single derivation per
        // request). (#3821-review LEDGER-6)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$idempotencyLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveIdempotency"])(idempotencyKey, translatedResponse, 200);
        reqLogger.logConvertedResponse(translatedResponse);
        persistAttemptLogs({
            status: 200,
            tokens: usage,
            responseBody,
            providerRequest: finalBody || translatedBody,
            providerResponse: looksLikeSSE ? {
                _streamed: true,
                _format: "sse-json",
                summary: responseBody
            } : responseBody,
            clientResponse: translatedResponse,
            claudeCacheMeta: claudePromptCacheLogMeta,
            claudeCacheUsageMeta: cacheUsageLogMeta,
            cacheSource: "upstream"
        });
        if (apiKeyInfo?.id && estimatedCost > 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$costRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordCost"])(apiKeyInfo.id, estimatedCost);
        }
        // === Quota Share POST-hook (B/F7) — fire-and-forget, fail-open ===
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$quotaShareConsumption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scheduleQuotaShareConsumption"])({
            apiKeyId: apiKeyInfo?.id,
            connectionId: credentials?.connectionId,
            provider,
            model,
            usage,
            estimatedCost,
            log
        });
        // === /Quota Share POST-hook ===
        // ── Gamification event (fire-and-forget) ──
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$gamificationEvent$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emitRequestGamificationEvent"])({
            apiKeyId: apiKeyInfo?.id,
            model,
            provider
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$pendingRequestScope$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["finalizePendingScope"])(pendingScope, {
            providerResponse: responseBody,
            clientResponse: translatedResponse
        });
        const responseHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNonStreamingResponseHeaders"])({
            provider,
            model,
            startTime,
            responseUsage,
            estimatedCost,
            requestId: skillRequestId,
            compressionResponseMeta,
            comboStrategy
        });
        // #6426: align response body `model` with the `X-OmniRoute-Model` header
        // (both must be the resolved backend model). Some upstreams (notably legacy
        // /v1/completions text-completion path) return a body `model` field that
        // differs from the resolved backend id we advertised in the header, leaving
        // strict clients unable to reconcile the two. Rewrite body.model to `model`
        // FIRST, then let #1311 echo override it when the opt-in setting is on.
        if (typeof model === "string" && model) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responseModelEcho$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["echoModelInObject"])(translatedResponse, model);
        // #1311: echo the requested alias/combo name in the non-streaming response model.
        if (echoModel) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responseModelEcho$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["echoModelInObject"])(translatedResponse, echoModel);
        // ── Plugin onResponse hook (fire-and-forget) ──
        // #8395: the streaming branch below already calls this; the non-streaming
        // (stream:false) branch returned without it, so onResponse never fired for
        // non-streaming requests at all.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$pluginOnResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runPluginOnResponseHook"])({
            requestId: traceId,
            body,
            model,
            provider,
            apiKeyInfo,
            response: {
                status: 200,
                data: translatedResponse
            }
        });
        return {
            success: true,
            response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$nonStreamingJsonResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNonStreamingJsonResponse"])(translatedResponse, responseHeaders)
        };
    }
    // Streaming response
    // #3089 — some "reasoning" openai-compatible upstreams ignore a stream:true
    // request and return a complete application/json chat-completion body instead
    // of an SSE stream. The readiness check below only recognizes SSE `data:`
    // frames, so that body produced a spurious STREAM_EARLY_EOF / HTTP 502 even
    // though it carried valid content/reasoning_content. Detect a JSON (non-SSE)
    // upstream body and synthesize an equivalent OpenAI SSE stream so the
    // streaming pipeline (and the client) get a valid stream.
    providerResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$jsonBodyToSse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["maybeConvertJsonBodyToSse"])(providerResponse, {
        log,
        provider,
        model
    });
    const streamReadinessPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamReadinessPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStreamReadinessTimeout"])({
        baseTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_READINESS_TIMEOUT_MS"],
        provider,
        model,
        body: finalBody || translatedBody,
        maxTimeoutMs: agentGoalPolicy.detected ? Math.max(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_READINESS_MAX_TIMEOUT_MS"], agentGoalPolicy.readinessMaxTimeoutMs) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_READINESS_MAX_TIMEOUT_MS"]
    });
    if (streamReadinessPolicy.timeoutMs !== streamReadinessPolicy.baseTimeoutMs) {
        log?.debug?.("STREAM", `adaptive readiness timeout=${streamReadinessPolicy.timeoutMs}ms base=${streamReadinessPolicy.baseTimeoutMs}ms reason=${streamReadinessPolicy.reasons.join(",")}`);
    }
    const streamReadiness = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamReadiness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureStreamReadiness"])(providerResponse, {
        timeoutMs: streamReadinessPolicy.timeoutMs,
        provider,
        model,
        log
    });
    if (streamReadiness.ok === false) {
        const { response: failureResponse, reason } = streamReadiness;
        const { classificationReason, upstreamDiagnostic } = streamReadiness;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["trackPendingRequest"])(model, provider, connectionId, false);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendRequestLog"])({
            model,
            provider,
            connectionId,
            status: `FAILED ${failureResponse.status}`
        }).catch(()=>{});
        persistAttemptLogs({
            status: failureResponse.status,
            error: reason,
            providerRequest: finalBody || translatedBody,
            clientResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(failureResponse.status, classificationReason, upstreamDiagnostic ? {
                error: {
                    message: upstreamDiagnostic
                }
            } : undefined),
            claudeCacheMeta: claudePromptCacheLogMeta,
            cacheSource: "upstream"
        });
        persistFailureUsage(failureResponse.status, streamReadiness.code);
        // Do NOT call onStreamFailure — a stream stall is an upstream issue,
        // not an account/quota failure. Marking the account unavailable here
        // would lock out legitimate accounts when the upstream hangs.
        return {
            success: false,
            status: failureResponse.status,
            error: reason,
            classificationError: classificationReason,
            errorType: streamReadiness.type,
            errorCode: streamReadiness.code,
            response: failureResponse
        };
    }
    providerResponse = streamReadiness.response;
    // Notify success - caller can clear error status if needed
    if (onRequestSuccess) {
        await onRequestSuccess();
    }
    const responseHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingResponseHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assembleStreamingResponseHeaders"])({
        providerHeaders: providerResponse.headers,
        provider,
        model,
        pendingRequestId,
        compressionResponseMeta,
        comboStrategy
    });
    // Create transform stream with logger for streaming response
    let transformStream;
    const responseToolNameMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$passthroughToolNames$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeResponseToolNameMap"])(toolNameMap, finalBody ?? null);
    let streamCompletionRecorded = false;
    let streamFailureCompletionRecorded = false;
    // Callback to save call log when stream completes (include responseBody when provided by stream)
    const onStreamComplete = ({ status: streamStatus, usage: streamUsage, responseBody: streamResponseBody, providerPayload, clientPayload, error: streamError, errorCode: streamErrorCode, ttft })=>{
        const normalizedStreamStatus = streamStatus || 200;
        if (streamCompletionRecorded) return;
        streamCompletionRecorded = true;
        if (normalizedStreamStatus !== 200) {
            if (streamFailureCompletionRecorded) return;
            streamFailureCompletionRecorded = true;
        }
        const cacheUsageLogMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cacheUsageMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildCacheUsageLogMeta"])(streamUsage);
        const streamConnectionId = getCurrentConnectionId();
        if (normalizedStreamStatus === 200) {
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$telemetryHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["maybeSyncClaudeExtraUsageState"])({
                provider,
                connectionId: streamConnectionId,
                providerSpecificData: credentials?.providerSpecificData,
                log
            });
        }
        // Reasoning Replay Cache (#1628): Capture reasoning_content from streaming responses
        // with tool_calls so it can be replayed on subsequent turns (DeepSeek V4, Kimi K2, etc.)
        if (normalizedStreamStatus === 200 && streamResponseBody) {
            try {
                const body = streamResponseBody;
                const choices = body.choices;
                const msg = choices?.[0]?.message;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cacheReasoningFromAssistantMessage"])(msg, provider, model, {
                    requestId: skillRequestId,
                    messageIndex: 0
                });
            } catch  {
            // Cache capture is non-critical — never block the stream
            }
        }
        effectiveServiceTier = resolveReportedServiceTier(streamResponseBody) ?? effectiveServiceTier;
        // Context Editing telemetry (streaming): the reconstructed stream body now carries
        // context_management.applied_edits from the final message_delta snapshot. Mirror the
        // non-streaming hook so streaming context-clear savings also surface under engine
        // "context-editing" in compression analytics. Best-effort, Claude-only.
        if (normalizedStreamStatus === 200) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$contextEditingTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordContextEditingTelemetryHook"])({
                contextEditingEnabled,
                provider,
                responseBody: streamResponseBody,
                skillRequestId,
                log
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamFailureFinalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["finalizeStreamRequestLog"]({
            pendingRequestId,
            model,
            provider,
            connectionId: streamConnectionId,
            providerResponse: providerPayload ?? streamResponseBody ?? undefined,
            clientResponse: clientPayload ?? streamResponseBody ?? undefined,
            status: normalizedStreamStatus,
            error: streamError,
            errorCode: streamErrorCode
        });
        // Track cache token metrics for streaming responses
        if (streamUsage && typeof streamUsage === "object") {
            attachCompressionUsageReceiptAfterAnalytics(streamUsage, "stream");
            // Track Gemini token consumption for TPM rate-limit pre-check
            if (provider === "gemini") {
                const promptTokens = typeof streamUsage.prompt_tokens === "number" ? streamUsage.prompt_tokens : 0;
                if (promptTokens > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["incrementTokenUsage"])(model, promptTokens);
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingUsageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordStreamingUsageStats"])(streamUsage, {
            provider,
            model,
            streamStatus: normalizedStreamStatus,
            startTime,
            ttft,
            streamErrorCode,
            connectionId: streamConnectionId,
            apiKeyInfo,
            effectiveServiceTier,
            isCombo,
            comboStrategy,
            endpoint: endpointPath
        });
        persistAttemptLogs({
            status: normalizedStreamStatus,
            error: streamError || undefined,
            tokens: streamUsage || {},
            responseBody: streamResponseBody ?? undefined,
            providerRequest: finalBody || translatedBody,
            providerResponse: providerPayload,
            clientResponse: clientPayload ?? streamResponseBody ?? undefined,
            claudeCacheMeta: claudePromptCacheLogMeta,
            claudeCacheUsageMeta: cacheUsageLogMeta,
            cacheSource: "upstream"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingCost$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordStreamingCost"])({
            apiKeyId: apiKeyInfo?.id,
            provider,
            model,
            streamUsage,
            serviceTier: effectiveServiceTier,
            calculateCost: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"],
            recordCost: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$costRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordCost"]
        });
        // === Quota Share POST-hook streaming (B/F7) — fire-and-forget, fail-open ===
        // Resolve the real per-request cost (calculateCost) so USD-unit pools accrue
        // on streaming traffic too; this previously recorded usd:0 hardcoded, which
        // meant DeepSeek-style `usd/monthly` shared pools never blocked on streams.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingQuotaShare$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scheduleStreamingQuotaShareConsumption"])({
            apiKeyId: apiKeyInfo?.id,
            connectionId: credentials?.connectionId,
            provider,
            model,
            streamUsage,
            streamStatus: normalizedStreamStatus,
            serviceTier: effectiveServiceTier,
            calculateCost: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"],
            log
        });
        // === /Quota Share POST-hook streaming ===
        if (memoryOwnerId && memorySettings?.enabled && memorySettings.maxTokens > 0 && streamStatus === 200) {
            const requestMemoryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memoryExtraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMemoryTextFromRequestBody"])(body);
            if (requestMemoryText) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractFacts"])(requestMemoryText, memoryOwnerId, pipelineSessionId);
            }
            const streamedMemoryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$memoryExtraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMemoryTextFromResponse"])(streamResponseBody ?? null);
            if (streamedMemoryText) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$extraction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractFacts"])(streamedMemoryText, memoryOwnerId, pipelineSessionId);
            }
        }
        // Semantic cache: store assembled streaming response for future cache hits
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingSemanticCacheStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeStreamingSemanticCacheResponse"])({
            enabled: semanticCacheEnabled,
            streamStatus,
            streamResponseBody,
            body,
            headers: clientRawRequest?.headers,
            model,
            apiKeyId: apiKeyInfo?.id ?? undefined,
            streamUsage,
            log
        });
    };
    const streamFailureFinalizers = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamFailureFinalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createStreamFailureFinalizers"]({
        isFailureCompletionRecorded: ()=>streamFailureCompletionRecorded,
        isStreamCompletionRecorded: ()=>streamCompletionRecorded,
        onStreamComplete,
        persistFailureUsage,
        onStreamFailure
    });
    const handleStreamFailure = streamFailureFinalizers.handleStreamFailure;
    onPipelineStreamError = streamFailureFinalizers.onPipelineStreamError;
    onClientDisconnectFinalize = (event)=>handleStreamFailure({
            status: 499,
            message: `Client disconnected: ${event.reason}`,
            code: "client_disconnected",
            type: "client_disconnected"
        });
    // For providers using Responses API format, translate stream back to openai (Chat Completions) format
    // UNLESS client is Droid CLI which expects openai-responses format back
    const needsResponsesTranslation = targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && clientResponseFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && !isResponsesEndpoint && !isDroidCLI;
    const streamStateBody = finalBody || body;
    if (needsResponsesTranslation) {
        // Provider returns openai-responses, translate to openai (Chat Completions) that clients expect
        log?.debug?.("STREAM", `Responses translation mode: openai-responses → openai`);
        transformStream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSSETransformStreamWithLogger"])("openai-responses", "openai", provider, reqLogger, responseToolNameMap, model, connectionId, streamStateBody, onStreamComplete, apiKeyInfo, handleStreamFailure, copilotCompatibleReasoning, // openai-responses → openai translation still wants the namespace identity
        // map for #7936-style round-trip closure when the client also speaks
        // Responses (Codex CLI).
        requestToolIdentityMap);
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["needsTranslation"])(targetFormat, clientResponseFormat)) {
        // Standard translation for other providers
        log?.debug?.("STREAM", `Translation mode: ${targetFormat} → ${clientResponseFormat}`);
        transformStream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSSETransformStreamWithLogger"])(targetFormat, clientResponseFormat, provider, reqLogger, responseToolNameMap, model, connectionId, streamStateBody, onStreamComplete, apiKeyInfo, handleStreamFailure, copilotCompatibleReasoning, // Suppress the `</think>` close marker for clients that render it verbatim
        // (e.g. OpenCode by UA; any client via `x-omniroute-thinking-marker: off`);
        // preserved for Claude Code / Cursor and unknown clients by default (#5245 /
        // #5312). Responses API clients always suppress it (structured reasoning
        // items make the marker meaningless); otherwise the header wins over the
        // UA allowlist.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$thinkCloseMarker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveSuppressThinkClose"])({
            userAgent: streamUserAgent,
            thinkingMarkerHeader,
            clientResponseFormat
        }), customToolNames, requestToolIdentityMap);
    } else {
        log?.debug?.("STREAM", `Standard passthrough mode`);
        transformStream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$stream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createPassthroughStreamWithLogger"])(provider, reqLogger, responseToolNameMap, model, connectionId, streamStateBody, onStreamComplete, apiKeyInfo, handleStreamFailure, clientResponseFormat, requestToolIdentityMap);
    }
    const finalStream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$streamingPipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assembleStreamingPipeline"])({
        providerResponse,
        transformStream,
        streamController,
        createPiiTransform,
        clientRawRequestHeaders: clientRawRequest?.headers,
        clientResponseFormat,
        echoModel,
        responseHeaders
    });
    // ── Gamification event (fire-and-forget) ──
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$gamificationEvent$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emitRequestGamificationEvent"])({
        apiKeyId: apiKeyInfo?.id,
        model,
        provider
    });
    // ── Plugin onResponse hook (fire-and-forget) ──
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$pluginOnResponse$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runPluginOnResponseHook"])({
        requestId: traceId,
        body,
        model,
        provider,
        apiKeyInfo,
        response: {
            status: 200,
            streamed: true
        }
    });
    return {
        success: true,
        response: new Response(finalStream, {
            headers: responseHeaders
        })
    };
}
function isTokenExpiringSoon(expiresAt, bufferMs = 5 * 60 * 1000) {
    if (!expiresAt) return false;
    const expiresAtMs = new Date(expiresAt).getTime();
    return expiresAtMs - Date.now() < bufferMs;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_handlers_0gi545e._.js.map