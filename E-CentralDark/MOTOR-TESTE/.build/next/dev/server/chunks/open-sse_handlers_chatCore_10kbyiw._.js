module.exports = [
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
];

//# sourceMappingURL=open-sse_handlers_chatCore_10kbyiw._.js.map