module.exports = [
"[project]/src/sse/handlers/requestBody.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Request-body resolution helpers for the chat handler.
 *
 * Kept dependency-free (no DB / executor imports) so it can be unit-tested in
 * isolation without pulling the full chat pipeline.
 */ /**
 * Resolve the chat request body, preferring a body already parsed upstream (#4380).
 *
 * The /v1/chat/completions route parses the body once for the prompt-injection guard,
 * then hands it here via `preParsedBody` so a large coding-agent payload (270-550 KB) is
 * not JSON-parsed a second time on the hot path — the double parse materialized the body
 * twice in heap and fed the OOM crash-loop under concurrent load. Callers that don't
 * pre-parse (most routes) pass `null`/`undefined` and the body is parsed from the request
 * as before.
 */ __turbopack_context__.s([
    "resolveChatRequestBody",
    ()=>resolveChatRequestBody
]);
async function resolveChatRequestBody(request, preParsedBody = null) {
    if (preParsedBody != null) return preParsedBody;
    return await request.json();
}
}),
"[project]/src/sse/handlers/chatAdmission.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANONYMOUS_ADMISSION_TENANT_KEY",
    ()=>ANONYMOUS_ADMISSION_TENANT_KEY,
    "captureDeferredClientRawBody",
    ()=>captureDeferredClientRawBody,
    "classifyHandlerFailure",
    ()=>classifyHandlerFailure,
    "createChatAdmissionContext",
    ()=>createChatAdmissionContext,
    "resolveAdmissionTenantKey",
    ()=>resolveAdmissionTenantKey,
    "resolveClientRawAfterAdmission",
    ()=>resolveClientRawAfterAdmission,
    "withChatAdmission",
    ()=>withChatAdmission
]);
/**
 * Shared handleChat adaptive-admission lifecycle wrapper.
 *
 * Owns a per-call context that acquires exactly once after API-key policy and
 * attaches/releases the admitted lease around the handler response or throw.
 * No AsyncLocalStorage, no route registry — one higher-order wrapper only.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/admission/runtime.ts [instrumentation] (ecmascript) <locals>");
;
const ANONYMOUS_ADMISSION_TENANT_KEY = "anonymous";
function resolveAdmissionTenantKey(apiKeyId) {
    return typeof apiKeyId === "string" && apiKeyId.length > 0 ? apiKeyId : ANONYMOUS_ADMISSION_TENANT_KEY;
}
const CANCEL_NAMES = new Set([
    "AbortError"
]);
const CANCEL_CODES = new Set([
    "ABORT_ERR",
    "ERR_CANCELED"
]);
const TIMEOUT_NAMES = new Set([
    "TimeoutError"
]);
const TIMEOUT_CODES = new Set([
    "ETIMEDOUT",
    "ESOCKETTIMEDOUT",
    "TIMEOUT",
    "ERR_TIMEOUT"
]);
function asStringField(err, key) {
    const value = err[key];
    return typeof value === "string" ? value : "";
}
function asStatus(err) {
    const status = err.status;
    if (typeof status === "number") return status;
    const statusCode = err.statusCode;
    return typeof statusCode === "number" ? statusCode : null;
}
function classifyHandlerFailure(err, signal) {
    if (signal?.aborted) return "cancelled";
    if (!err || typeof err !== "object") return "upstream_error";
    const name = asStringField(err, "name");
    const code = asStringField(err, "code");
    if (CANCEL_NAMES.has(name) || CANCEL_CODES.has(code)) return "cancelled";
    if (TIMEOUT_NAMES.has(name) || TIMEOUT_CODES.has(code)) return "timeout";
    const status = asStatus(err);
    if (status === 408 || status === 504) return "timeout";
    if (status !== null && status >= 400 && status < 500) return "local_reject";
    return "upstream_error";
}
const CLIENT_RAW_MUTABLE_FIELDS = [
    "model",
    "reasoning",
    "reasoning_effort",
    "thinking"
];
function captureClientRawFields(body) {
    return CLIENT_RAW_MUTABLE_FIELDS.map((key)=>{
        const present = Object.hasOwn(body, key);
        return {
            key,
            present,
            value: present ? body[key] : undefined
        };
    });
}
function clientRawFieldsEqual(a, b) {
    return a.every((field, index)=>field.key === b[index]?.key && field.present === b[index]?.present && Object.is(field.value, b[index]?.value));
}
function applyClientRawFields(body, fields) {
    for (const field of fields){
        if (field.present) body[field.key] = field.value;
        else delete body[field.key];
    }
}
function captureDeferredClientRawBody(body) {
    const target = body !== null && typeof body === "object" ? body : null;
    const originalFields = target ? captureClientRawFields(target) : null;
    return {
        withClientBody (build) {
            if (!target || !originalFields) return build(body);
            const workingFields = captureClientRawFields(target);
            if (clientRawFieldsEqual(originalFields, workingFields)) return build(target);
            applyClientRawFields(target, originalFields);
            try {
                return build(target);
            } finally{
                applyClientRawFields(target, workingFields);
            }
        }
    };
}
function resolveClientRawAfterAdmission(clientRawRequest, build) {
    if (typeof clientRawRequest === "function") {
        return clientRawRequest();
    }
    if (clientRawRequest) return clientRawRequest;
    return build();
}
function createChatAdmissionContext(getRuntime = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAdaptiveAdmissionRuntime"]) {
    let state = null;
    let acquireStarted = false;
    return {
        getAdmittedState: ()=>state,
        async acquire (apiKeyId, request, body) {
            // Exactly once per logical request — never re-enter the runtime.
            if (state || acquireStarted) return null;
            acquireStarted = true;
            const runtime = getRuntime();
            const streaming = body !== null && typeof body === "object" && body.stream === true;
            const result = await runtime.acquire({
                tenantKey: resolveAdmissionTenantKey(apiKeyId),
                body,
                signal: request?.signal ?? undefined,
                streaming
            });
            if (result.status === "rejected") {
                return result.response;
            }
            state = {
                runtime,
                admitted: result
            };
            return null;
        }
    };
}
function withChatAdmission(implementation, options = {}) {
    return async function handleChat(request, clientRawRequest = null, preParsedBody = null, correlationId) {
        const admissionContext = createChatAdmissionContext(options.getRuntime ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAdaptiveAdmissionRuntime"]);
        try {
            const response = await implementation(request, clientRawRequest, preParsedBody, correlationId, admissionContext);
            const admittedState = admissionContext.getAdmittedState();
            if (!admittedState) return response;
            const { runtime, admitted } = admittedState;
            return runtime.attachResponseLifecycle(response, admitted.lease, {
                admittedAtMs: admitted.admittedAtMs,
                signal: request?.signal ?? undefined
            });
        } catch (err) {
            const admittedState = admissionContext.getAdmittedState();
            if (admittedState) {
                const { runtime, admitted } = admittedState;
                runtime.releaseHandlerFailure(admitted.lease, classifyHandlerFailure(err, request?.signal), {
                    admittedAtMs: admitted.admittedAtMs
                });
            }
            throw err;
        }
    };
}
}),
"[project]/src/sse/handlers/chat/clientRawRequest.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildClientRawRequest",
    ()=>buildClientRawRequest,
    "resolveDispatchClientRawRequest",
    ()=>resolveDispatchClientRawRequest
]);
/**
 * The clientRawRequest envelope — the observability snapshot of a chat request.
 *
 * Extracted from chat.ts (#7847). Both helpers are about the same object: one builds it, the
 * other merges a per-target abort signal into it before dispatch. Neither belongs in the
 * request handler proper, and chat.ts sits against a frozen file-size ratchet.
 *
 * chat.ts re-exports both, so the public surface and tests/unit/chat-build-client-raw-request
 * are unchanged.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/requestLogger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function buildClientRawRequest(request, body) {
    const url = new URL(request.url);
    return {
        endpoint: url.pathname,
        // #7847: bounded, not a full deep clone. Every consumer of clientRawRequest.body is
        // observability — reqLogger.logClientRawRequest (which re-bounds it anyway, or drops it
        // entirely when the logger is disabled), trackPendingRequest's `clientRequest`, and
        // recordRejectedRequestUsage's `requestBody`. None feeds dispatch, translation or the
        // upstream call, so cloning the whole payload retained ~41x more than anything kept:
        // 3.19 MiB vs 0.08 MiB on the incident's 3.05 MiB / 729-message request.
        // Still a clone, not an alias — `body` is rewritten downstream (plugin onRequest hook,
        // compression), and this has to stay a snapshot of what the client actually sent.
        body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$requestLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cloneBoundedForLog"])(body),
        headers: Object.fromEntries(request.headers.entries()),
        signal: request.signal ?? null
    };
}
function resolveDispatchClientRawRequest(clientRawRequest, modelAbortSignal) {
    if (!modelAbortSignal) return clientRawRequest;
    return {
        ...clientRawRequest,
        signal: clientRawRequest?.signal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mergeAbortSignals"])(clientRawRequest.signal, modelAbortSignal) : modelAbortSignal
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/handlers/resolveRoutingModel.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Resolve the model used for routing. The `X-Route-Model` header, when present,
// overrides `body.model` — letting a caller/proxy force a specific combo/alias/model
// regardless of what the client CLI sent. This is useful when a CLI hardcodes
// `body.model` to a fixed provider/model (bypassing combo routing): an upstream
// proxy can send `X-Route-Model` to restore routing control without mutating the
// request body. The resolved value still flows through `enforceApiKeyPolicy`, so
// it cannot bypass per-key model/combo allowlists. See PR #4863.
//
// IMPORTANT: callers MUST then align `body.model` with the resolved value via
// `alignBodyModelWithRouting` (or equivalent). Otherwise the post-guardrail
// "body.model !== modelStr → adopt body.model" path silently undoes the header
// override and routes to the original body model (e.g. opencode-zen 401 while
// logs still show the X-Route-Model target like zai/glm-5.2).
__turbopack_context__.s([
    "RoutingModelOps",
    ()=>RoutingModelOps,
    "alignBodyModelWithRouting",
    ()=>alignBodyModelWithRouting,
    "applyRoutingModelAlignment",
    ()=>applyRoutingModelAlignment,
    "reconcileGuardrailReroute",
    ()=>reconcileGuardrailReroute,
    "reconcileModelOverride",
    ()=>reconcileModelOverride,
    "resolveRoutingModel",
    ()=>resolveRoutingModel
]);
function resolveRoutingModel(request, body) {
    const headerModel = request.headers.get("x-route-model")?.trim();
    return headerModel || body.model;
}
function alignBodyModelWithRouting(body, modelStr) {
    const previousModel = typeof body?.model === "string" ? body.model : null;
    if (!modelStr || typeof modelStr !== "string" || modelStr.length === 0) {
        return {
            body,
            aligned: false,
            previousModel
        };
    }
    if (previousModel === modelStr) {
        return {
            body,
            aligned: false,
            previousModel
        };
    }
    return {
        body: {
            ...body,
            model: modelStr
        },
        aligned: true,
        previousModel
    };
}
function applyRoutingModelAlignment(body, modelStr, log) {
    const aligned = alignBodyModelWithRouting(body, modelStr);
    if (aligned.aligned) {
        log.info("ROUTING", `Aligned body.model to routing model: ${aligned.previousModel || "(none)"} → ${modelStr}`);
    }
    return aligned.body;
}
function reconcileModelOverride(params) {
    const { body, overrideModel, logTag, log } = params;
    let { modelStr } = params;
    if (overrideModel && overrideModel !== modelStr) {
        log.info("ROUTING", `${logTag}: ${modelStr} → ${overrideModel}`);
        modelStr = overrideModel;
        if (typeof body?.model !== "string" || body.model !== modelStr) {
            return {
                body: {
                    ...body,
                    model: modelStr
                },
                modelStr
            };
        }
        return {
            body,
            modelStr
        };
    }
    if (modelStr && typeof body?.model === "string" && body.model !== modelStr) {
        // The stage rewrote body without updating model — restore the routing model.
        return {
            body: {
                ...body,
                model: modelStr
            },
            modelStr
        };
    }
    return {
        body,
        modelStr
    };
}
async function reconcileGuardrailReroute(params) {
    const { body, modelBeforeGuardrails, apiKey, apiKeyId, isModelAllowedForKey, log } = params;
    let { modelStr } = params;
    if (body?.model && typeof body.model === "string" && body.model !== modelBeforeGuardrails) {
        const rerouteModel = body.model;
        const rerouteAllowed = await isModelAllowedForKey(apiKey, rerouteModel);
        if (!rerouteAllowed) {
            log.warn("POLICY", `Guardrail reroute to "${rerouteModel}" rejected by API key policy (key=${apiKeyId || "unknown"}); keeping original model "${modelStr}"`);
            return {
                body: {
                    ...body,
                    model: modelStr
                },
                modelStr
            };
        }
        log.info("ROUTING", `Guardrail model reroute: ${modelBeforeGuardrails} → ${rerouteModel}`);
        return {
            body,
            modelStr: rerouteModel
        };
    }
    // Guardrails returned a payload whose model drifted from modelStr without
    // changing from the pre-guardrail value (should not happen after align), or
    // stripped model — keep body.model glued to modelStr.
    if (modelStr && typeof body?.model === "string" && body.model !== modelStr) {
        return {
            body: {
                ...body,
                model: modelStr
            },
            modelStr
        };
    }
    return {
        body,
        modelStr
    };
}
const RoutingModelOps = {
    align: applyRoutingModelAlignment,
    reconcileGuardrailReroute,
    reconcileModelOverride
};
}),
"[project]/src/sse/services/headerReader.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readHeaderValue",
    ()=>readHeaderValue
]);
function readHeaderValue(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") {
        const value = headers.get(name) || headers.get(name.toLowerCase());
        return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    }
    const recordHeaders = headers;
    const value = recordHeaders[name] || recordHeaders[name.toLowerCase()] || recordHeaders[name.toUpperCase()];
    if (Array.isArray(value)) {
        return typeof value[0] === "string" && value[0].trim().length > 0 ? value[0].trim() : null;
    }
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
}),
"[project]/src/sse/services/googApiKeyAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractGoogApiKeyHeader",
    ()=>extractGoogApiKeyHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/headerReader.ts [instrumentation] (ecmascript)");
;
function extractGoogApiKeyHeader(headers) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-goog-api-key") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "X-Goog-Api-Key");
}
}),
"[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "debug",
    ()=>debug,
    "error",
    ()=>error,
    "info",
    ()=>info,
    "request",
    ()=>request,
    "warn",
    ()=>warn
]);
/**
 * SSE Logger — Thin wrapper around the shared Pino logger
 * for backward compatibility with existing SSE code.
 *
 * Migrated from direct console logging to structured Pino logging.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [instrumentation] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLogger"])("sse");
function debug(tag, message, data) {
    log.debug({
        tag,
        ...spreadData(data)
    }, message);
}
function info(tag, message, data) {
    log.info({
        tag,
        ...spreadData(data)
    }, message);
}
function warn(tag, message, data) {
    log.warn({
        tag,
        ...spreadData(data)
    }, message);
}
function error(tag, message, data) {
    log.error({
        tag,
        ...spreadData(data)
    }, message);
}
function request(method, path, extra) {
    log.info({
        tag: "HTTP",
        method,
        path,
        ...spreadData(extra)
    }, `📥 ${method} ${path}`);
}
// Helper to spread data into structured fields
function spreadData(data) {
    if (!data) return {};
    if (typeof data === "string") return {
        detail: data
    };
    if (typeof data === "object") return data;
    return {
        detail: String(data)
    };
}
}),
"[project]/src/sse/services/sessionAffinityPin.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applySessionAffinityPin",
    ()=>applySessionAffinityPin,
    "formatSessionKeyForLog",
    ()=>formatSessionKeyForLog,
    "resolveSessionAffinityTtlMs",
    ()=>resolveSessionAffinityTtlMs,
    "selectSessionAffinityConnection",
    ()=>selectSessionAffinityConnection
]);
/**
 * #5903 — session-affinity-pin resolution + TTL, extracted from auth.ts as a
 * pure leaf so the frozen god-file `auth.ts` does not grow.
 *
 * Problem: reset-aware (and other quota-scoring) combo strategies recompute a
 * "winner" connection on every request and hand it to getProviderCredentials
 * as `forcedConnectionId`. That id narrows the connection pool to exactly one
 * connection BEFORE session affinity is consulted, so an existing pin pointing
 * at a previously-selected account is never found and gets silently
 * deleted/re-pinned to the fresh winner — breaking "same session -> reuse
 * pinned account".
 *
 * Fix: when an active, non-expired affinity pin already exists for this
 * (session, provider) AND the pinned connection is still eligible, the pin wins
 * over the freshly recomputed `forcedConnectionId`. If the pin is ineligible
 * (rate-limited / exhausted / model-locked / etc.) the caller keeps its forced
 * connection, so the existing 429-driven `deleteSessionAccountAffinity`
 * failover still owns rotating away from a pin that stops working.
 *
 * This module stays decoupled from auth.ts internals: the three predicates that
 * live in (or would cause a cycle back into) auth.ts —
 * `isTerminalConnectionStatus`, `isCodexScopeUnavailable`, and the quota-policy
 * check wrapping `evaluateQuotaLimitPolicy` — are injected as callbacks.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function formatSessionKeyForLog(sessionKey) {
    return `${sessionKey.slice(0, 18)}...`;
}
function compareLruConnections(a, b) {
    if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
    if (!a.lastUsedAt) return -1;
    if (!b.lastUsedAt) return 1;
    const recencyDelta = new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
    if (recencyDelta !== 0) return recencyDelta;
    if ((a.consecutiveUseCount || 0) !== (b.consecutiveUseCount || 0)) {
        return (a.consecutiveUseCount || 0) - (b.consecutiveUseCount || 0);
    }
    return (a.priority || 999) - (b.priority || 999);
}
async function selectSessionAffinityConnection(provider, sessionKey, connections, ttlMs = 0) {
    if (!sessionKey || connections.length === 0 || ttlMs <= 0) return null;
    const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionAccountAffinity"])(sessionKey, provider, ttlMs);
    if (existing) {
        const connection = connections.find((candidate)=>candidate.id === existing.connectionId);
        if (connection) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["touchSessionAccountAffinity"])(sessionKey, provider, Date.now(), ttlMs);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
                lastUsedAt: new Date().toISOString(),
                consecutiveUseCount: (connection.consecutiveUseCount || 0) + 1
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `session_key=${formatSessionKeyForLog(sessionKey)} -> connection ${connection.id.slice(0, 8)} (affinity)`);
            return connection;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteSessionAccountAffinity"])(sessionKey, provider);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `affinity cleared for session_key=${formatSessionKeyForLog(sessionKey)} provider=${provider}`);
    }
    const connection = [
        ...connections
    ].sort(compareLruConnections)[0] ?? null;
    if (!connection) return null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upsertSessionAccountAffinity"])(sessionKey, provider, connection.id, Date.now(), ttlMs);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
        lastUsedAt: new Date().toISOString(),
        consecutiveUseCount: 1
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `new affinity created for session_key=${formatSessionKeyForLog(sessionKey)} -> connection ${connection.id.slice(0, 8)}`);
    return connection;
}
function resolveSessionAffinityTtlMs(_provider, options, settings) {
    const override = Number(options.sessionAffinityTtlMs);
    if (Number.isFinite(override) && override > 0) return override;
    const configured = Number(settings.sessionAffinityTtlMs ?? settings.codexSessionAffinityTtlMs);
    if (Number.isFinite(configured) && configured > 0) return configured;
    return 0;
}
/**
 * Mirrors the eligibility predicates applied later in getProviderCredentials
 * (availableConnections filter + quota policy + quota exhaustion) but scoped to
 * a single candidate connection. Pure/read-only.
 */ function isConnectionEligibleForAffinityPin(connection, params) {
    const { provider, requestedModel, options } = params;
    const allowSuppressed = options.allowSuppressedConnections === true;
    const allowRateLimited = allowSuppressed || options.allowRateLimitedConnections === true;
    if (params.excludedConnectionIds.has(connection.id)) return false;
    if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(requestedModel, connection.providerSpecificData)) {
        return false;
    }
    if (!allowSuppressed) {
        if (!allowRateLimited && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(connection.rateLimitedUntil)) return false;
        if (params.isTerminalConnectionStatus(connection)) return false;
        if (provider === "codex" && params.isCodexScopeUnavailable(connection, requestedModel)) {
            return false;
        }
        if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(provider, connection.id, requestedModel)) return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAccountQuotaExhausted"])(connection.id)) return false;
    if (options.bypassQuotaPolicy !== true && params.isQuotaPolicyBlocked(connection)) return false;
    return true;
}
function applySessionAffinityPin(params) {
    const { forcedConnectionId, options, sessionAffinityTtlMs, connections, provider } = params;
    const sessionKey = options.sessionKey;
    if (!forcedConnectionId || !sessionKey || sessionAffinityTtlMs <= 0) return null;
    const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionAccountAffinity"])(sessionKey, provider, sessionAffinityTtlMs);
    if (!pinned || pinned.connectionId === forcedConnectionId) return null;
    const pinnedConnection = connections.find((conn)=>conn.id === pinned.connectionId);
    if (!pinnedConnection || !isConnectionEligibleForAffinityPin(pinnedConnection, params)) {
        return null;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `session affinity pin ${pinned.connectionId.slice(0, 8)}... overrides forcedConnectionId ${forcedConnectionId.slice(0, 8)}... (#5903)`);
    return pinned.connectionId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/noAuthProviderSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isNoAuthProviderBlockedBySettings",
    ()=>isNoAuthProviderBlockedBySettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/noAuthProviders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function isNoAuthProviderBlockedBySettings(providerId) {
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isProviderBlockedByIdOrAlias"])(providerId, settings.blockedProviders);
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("AUTH", `Could not read blocked provider settings for ${providerId}: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/noAuthProxyResolution.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveAccountProxies",
    ()=>resolveAccountProxies,
    "resolveAccountProxiesFromRegistry",
    ()=>resolveAccountProxiesFromRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/mappers.ts [instrumentation] (ecmascript)");
;
;
function normalizeRecord(rec) {
    const host = typeof rec.host === "string" ? rec.host.trim() : "";
    if (!host) return null;
    const username = typeof rec.username === "string" ? rec.username : "";
    const password = typeof rec.password === "string" ? rec.password : "";
    const type = typeof rec.type === "string" && rec.type ? rec.type : "socks5";
    const relayAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRelayProxyType"])(type) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractRelayAuth"])(rec.notes) : undefined;
    const resolved = {
        type,
        host,
        port: Number(rec.port) || 0,
        ...username ? {
            username
        } : {},
        ...password ? {
            password
        } : {},
        ...relayAuth ? {
            relayAuth
        } : {}
    };
    return resolved;
}
async function resolveAccountProxies(entries, lookup) {
    if (!Array.isArray(entries)) return [];
    const out = [];
    for (const raw of entries){
        if (!raw || typeof raw !== "object") continue;
        const entry = raw;
        if (typeof entry.fingerprint !== "string") continue;
        // By-id reference (Proxy Pool): resolve to the live record so a pool edit
        // propagates to every referencing account. Unknown/deleted id → direct.
        if (typeof entry.proxyId === "string" && entry.proxyId) {
            let record = null;
            try {
                record = await lookup(entry.proxyId);
            } catch  {
                record = null;
            }
            out.push({
                fingerprint: entry.fingerprint,
                proxy: record ? normalizeRecord(record) : null
            });
            continue;
        }
        // Custom escape hatch / legacy inline proxy: pass through unchanged.
        if (entry.proxy && typeof entry.proxy === "object") {
            out.push({
                fingerprint: entry.fingerprint,
                proxy: normalizeRecord(entry.proxy)
            });
            continue;
        }
        out.push({
            fingerprint: entry.fingerprint,
            proxy: null
        });
    }
    return out;
}
async function resolveAccountProxiesFromRegistry(entries) {
    return resolveAccountProxies(entries, (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProxyById"])(id, {
            includeSecrets: true
        }));
}
}),
"[project]/src/sse/services/noAuthProviderSiblings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNoAuthHydrationProviderIds",
    ()=>getNoAuthHydrationProviderIds
]);
/**
 * #7993 — "OpenCode Free" is served by TWO distinct provider identities that
 * are never unified: the no-auth "opencode" provider (NOAUTH_PROVIDERS,
 * alias "oc" — the id the NoAuthAccountCard UI writes fingerprints +
 * accountProxies onto via a `provider_connections` row) and the
 * "opencode-zen" / "opencode-go" APIKEY_PROVIDERS gateways (which carry
 * `anonymousFallback: true` for the same public endpoint).
 *
 * A model string resolved to the canonical/full prefix ("opencode/<model>")
 * routes to "opencode-zen", not "opencode" (see the #2901 guard in
 * open-sse/services/model.ts). When that happens, credential hydration for
 * "opencode-zen" must still be able to find the user's proxy/fingerprint
 * config, which physically lives on the "opencode" connection row — this
 * sibling map lets `loadNoAuthProviderSpecificData()` look there too.
 */ const NOAUTH_SIBLING_PROVIDER_IDS = {
    "opencode-zen": [
        "opencode"
    ],
    "opencode-go": [
        "opencode"
    ]
};
function getNoAuthHydrationProviderIds(providerId) {
    return [
        providerId,
        ...NOAUTH_SIBLING_PROVIDER_IDS[providerId] || []
    ];
}
}),
"[project]/src/sse/services/requestResourceHealth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getResource404Bypass",
    ()=>getResource404Bypass
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/errorClassifier.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function getResource404Bypass(status, errorText, connectionId, logger) {
    if (status !== 404 || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isResourceNotFoundResponse"])(errorText)) return null;
    logger.info("AUTH", `${connectionId.slice(0, 8)} request-resource 404; skipping model/account cooldown`);
    return {
        shouldFallback: false,
        cooldownMs: 0
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearAccountError",
    ()=>clearAccountError,
    "clearRecoveredProviderState",
    ()=>clearRecoveredProviderState,
    "evaluateQuotaLimitPolicy",
    ()=>evaluateQuotaLimitPolicy,
    "extractApiKey",
    ()=>extractApiKey,
    "extractSessionAffinityKey",
    ()=>extractSessionAffinityKey,
    "getProviderCredentials",
    ()=>getProviderCredentials,
    "getProviderCredentialsWithQuotaPreflight",
    ()=>getProviderCredentialsWithQuotaPreflight,
    "isValidApiKey",
    ()=>isValidApiKey,
    "markAccountUnavailable",
    ()=>markAccountUnavailable,
    "resolveQuotaLimitPolicy",
    ()=>resolveQuotaLimitPolicy
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$googApiKeyAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/googApiKeyAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/lazyConnectionView.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityCredits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/modelLockoutSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/errorClassifier.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/sessionAffinityPin.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/noAuthProviderSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProxyResolution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/noAuthProxyResolution.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSiblings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/noAuthProviderSiblings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/requestResourceHealth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/shuffleDeck.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/headerReader.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const MIN_QUOTA_THRESHOLD_PERCENT = 1;
const MAX_QUOTA_THRESHOLD_PERCENT = 100;
const NON_RETRYABLE_MODEL_LOCKOUT_REASONS = new Set([
    "not_found",
    "not_found_local"
]);
// Antigravity Gemini family 429 with no parseable upstream hint: seed the backoff at
// this base. Real upstream Retry-After hints still win — they flow through
// `exactCooldownMs` (usedUpstreamRetryHint), not this base. (#5222)
const ANTIGRAVITY_FAMILY_INFERRED_BASE_COOLDOWN_MS = 30_000;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toNullableNumber(value) {
    if (value === null || value === undefined) return null;
    const parsed = toNumber(value, Number.NaN);
    return Number.isFinite(parsed) ? parsed : null;
}
function toBooleanOrDefault(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
function normalizeSessionKey(value, prefix) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    const trimmed = value.trim();
    if (trimmed.length <= 180 && /^[A-Za-z0-9._:-]+$/.test(trimmed)) {
        return `${prefix}:${trimmed}`;
    }
    return `${prefix}:sha256:${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(trimmed).digest("hex")}`;
}
function extractTextForSessionHash(value) {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        const parts = value.map((item)=>{
            if (typeof item === "string") return item;
            const record = asRecord(item);
            if (typeof record.text === "string") return record.text;
            if (typeof record.content === "string") return record.content;
            return null;
        }).filter(Boolean);
        return parts.length > 0 ? parts.join("\n") : JSON.stringify(value);
    }
    if (value && typeof value === "object") return JSON.stringify(value);
    return null;
}
function getFirstInputText(body) {
    const record = asRecord(body);
    if (record.input !== undefined) {
        if (typeof record.input === "string") return record.input;
        if (Array.isArray(record.input)) {
            for (const item of record.input){
                const itemRecord = asRecord(item);
                const text = extractTextForSessionHash(itemRecord.content ?? item);
                if (text && text.trim().length > 0) return text;
            }
        }
        const text = extractTextForSessionHash(record.input);
        if (text && text.trim().length > 0) return text;
    }
    if (Array.isArray(record.messages)) {
        const userMessage = record.messages.find((message)=>asRecord(message).role === "user");
        const firstMessage = userMessage ?? record.messages[0];
        const text = extractTextForSessionHash(asRecord(firstMessage).content ?? firstMessage);
        if (text && text.trim().length > 0) return text;
    }
    return null;
}
function extractSessionAffinityKey(body, headers) {
    const headerKey = normalizeSessionKey((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-codex-session-id") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-session-id") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-omniroute-session"), "header");
    if (headerKey) return headerKey;
    const record = asRecord(body);
    const metadata = asRecord(record.metadata);
    const explicitKey = normalizeSessionKey(metadata.session_id, "metadata") ?? normalizeSessionKey(metadata.sessionId, "metadata") ?? normalizeSessionKey(record.conversation_id, "conversation") ?? normalizeSessionKey(record.session_id, "session") ?? normalizeSessionKey(record.prompt_cache_key, "prompt-cache");
    if (explicitKey) return explicitKey;
    const inputText = getFirstInputText(body);
    if (!inputText || inputText.trim().length === 0) return null;
    return `input:sha256:${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(inputText.slice(0, 4096)).digest("hex")}`;
}
function getCodexLimitPolicy(providerSpecificData) {
    const policy = asRecord(providerSpecificData.codexLimitPolicy);
    return {
        use5h: toBooleanOrDefault(policy.use5h, true),
        useWeekly: toBooleanOrDefault(policy.useWeekly, true)
    };
}
function normalizeQuotaThreshold(value, fallback = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_QUOTA_THRESHOLD_PERCENT"]) {
    const parsed = toNumber(value, fallback);
    return Math.min(MAX_QUOTA_THRESHOLD_PERCENT, Math.max(MIN_QUOTA_THRESHOLD_PERCENT, parsed));
}
function normalizeWindowName(windowName) {
    if (typeof windowName !== "string") return null;
    const normalized = windowName.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function uniqueWindows(windows) {
    return [
        ...new Set(windows)
    ];
}
function normalizeCodexWindowName(windowName) {
    if (typeof windowName !== "string") return null;
    const normalized = windowName.trim().toLowerCase();
    if (normalized === "session (5h)" || normalized === "5h" || normalized === "five_hour") {
        return "session";
    }
    if (normalized === "weekly (7d)" || normalized === "7d" || normalized === "seven_day") {
        return "weekly";
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexBaseQuotaWindowName"])(normalized);
}
function applyCodexWindowPolicy(rawWindows, providerSpecificData) {
    const codexPolicy = getCodexLimitPolicy(providerSpecificData);
    const normalizedRaw = rawWindows.map(normalizeCodexWindowName).filter(Boolean);
    // Preserve explicitly configured custom windows, but enforce canonical Codex windows
    // from toggles so weekly exhaustion is never skipped when useWeekly=true.
    let windows = [
        ...normalizedRaw
    ];
    windows = windows.filter((windowName)=>{
        if (windowName === "session") return codexPolicy.use5h;
        if (windowName === "weekly") return codexPolicy.useWeekly;
        return true;
    });
    if (codexPolicy.use5h) windows.push("session");
    if (codexPolicy.useWeekly) windows.push("weekly");
    return uniqueWindows(windows);
}
function getCodexScopeRateLimitedUntil(providerSpecificData, model) {
    if (!model) return null;
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model);
    const scopeMap = asRecord(providerSpecificData.codexScopeRateLimitedUntil);
    const value = scopeMap[scope];
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function isCodexScopeUnavailable(connection, model) {
    const until = getCodexScopeRateLimitedUntil(connection.providerSpecificData, model);
    if (!until) return false;
    return new Date(until).getTime() > Date.now();
}
function getEarliestCodexScopeRateLimitedUntil(connections, model) {
    let earliest = null;
    let earliestMs = Infinity;
    for (const conn of connections){
        const until = getCodexScopeRateLimitedUntil(conn.providerSpecificData, model);
        if (!until) continue;
        const ms = new Date(until).getTime();
        if (!Number.isFinite(ms) || ms <= Date.now()) continue;
        if (ms < earliestMs) {
            earliest = until;
            earliestMs = ms;
        }
    }
    return earliest;
}
function normalizeStatus(value) {
    return (value || "").trim().toLowerCase();
}
function isTerminalConnectionStatus(connection) {
    const status = normalizeStatus(connection.testStatus);
    return status === "credits_exhausted" || status === "banned" || status === "expired";
}
// #8200: cookie-auth providers (perplexity-web, grok-web, ...) use a rotating browser
// session, not a static API key — a 401 means "session needs a refresh", not "dead".
function isRecoverableCookieAuth401(provider, providerErrorType) {
    return providerErrorType !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].ACCOUNT_DEACTIVATED && provider != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider) in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"];
}
function resolveTerminalConnectionStatus(status, result, providerErrorType = null, provider = null) {
    if (result.creditsExhausted || status === 402) return "credits_exhausted";
    if (providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].PROJECT_ROUTE_ERROR || providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].OAUTH_INVALID_TOKEN) {
        return null;
    }
    if (result.permanent || providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].FORBIDDEN) {
        return "banned";
    }
    if ((providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].ACCOUNT_DEACTIVATED || providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].UNAUTHORIZED || status === 401) && !isRecoverableCookieAuth401(provider, providerErrorType)) {
        return "expired";
    }
    return null;
}
function resolveQuotaLimitPolicy(provider, providerSpecificData) {
    const rawPolicy = asRecord(providerSpecificData.limitPolicy);
    const rawWindows = Array.isArray(rawPolicy.windows) ? rawPolicy.windows : [];
    const windows = rawWindows.map(normalizeWindowName).filter(Boolean);
    if (provider === "codex") {
        const defaultWindows = applyCodexWindowPolicy(windows, providerSpecificData);
        const enabled = toBooleanOrDefault(rawPolicy.enabled, defaultWindows.length > 0);
        return {
            enabled,
            thresholdPercent: normalizeQuotaThreshold(rawPolicy.thresholdPercent),
            windows: defaultWindows
        };
    }
    return {
        enabled: toBooleanOrDefault(rawPolicy.enabled, false),
        thresholdPercent: normalizeQuotaThreshold(rawPolicy.thresholdPercent),
        windows
    };
}
function evaluateQuotaLimitPolicy(provider, connection, requestedModel = null) {
    const policy = resolveQuotaLimitPolicy(provider, connection.providerSpecificData);
    if (!policy.enabled || policy.windows.length === 0) {
        return {
            blocked: false,
            reasons: [],
            resetAt: null
        };
    }
    const reasons = [];
    const resetCandidates = [];
    for (const windowName of policy.windows){
        const effectiveWindowName = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexScopedQuotaWindowName"])(windowName, requestedModel) : windowName;
        const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaWindowStatus"])(connection.id, effectiveWindowName, policy.thresholdPercent);
        if (!status?.reachedThreshold) continue;
        reasons.push(`${effectiveWindowName} usage ${Math.round(status.usedPercentage)}%`);
        resetCandidates.push(status.resetAt);
    }
    return {
        blocked: reasons.length > 0,
        reasons,
        resetAt: getEarliestFutureDate(resetCandidates)
    };
}
function parseFutureDateMs(value) {
    if (!value) return null;
    // Tolerate numeric-epoch strings (e.g. "1781696905131.0") as well as ISO
    // strings — the rate_limited_until TEXT column can hold either (#3954).
    const ms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cooldownUntilMs"])(value);
    if (!Number.isFinite(ms) || ms <= Date.now()) return null;
    return ms;
}
function getEarliestFutureDate(candidates) {
    return candidates.map((candidate)=>({
            raw: candidate,
            ms: parseFutureDateMs(candidate)
        })).filter((entry)=>entry.ms !== null).sort((a, b)=>a.ms - b.ms)[0]?.raw || null;
}
function getCachedQuotaResetAt(connectionId) {
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaCache"])(connectionId);
    if (!entry?.quotas) return null;
    return getEarliestFutureDate(Object.values(entry.quotas).map((quota)=>quota.resetAt));
}
function isRetryableModelLockoutReason(reason) {
    return typeof reason === "string" && reason.length > 0 ? !NON_RETRYABLE_MODEL_LOCKOUT_REASONS.has(reason) : false;
}
function pushClampedPercentage(percentages, value) {
    if (Number.isFinite(value)) {
        percentages.push(Math.max(0, Math.min(100, value)));
    }
}
function isResetAtInPast(resetAt) {
    if (!resetAt) return false;
    const resetMs = new Date(resetAt).getTime();
    return Number.isFinite(resetMs) && resetMs <= Date.now();
}
function collectPolicyQuotaHeadroomPercentages(provider, connection, policy, requestedModel) {
    const percentages = [];
    const seenWindows = new Set();
    for (const windowName of policy.windows){
        const scopedWindow = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexScopedQuotaWindowName"])(windowName, requestedModel) : windowName;
        const normalizedWindow = normalizeWindowName(scopedWindow);
        if (!normalizedWindow || seenWindows.has(normalizedWindow)) continue;
        seenWindows.add(normalizedWindow);
        const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaWindowStatus"])(connection.id, normalizedWindow, policy.thresholdPercent);
        if (status) pushClampedPercentage(percentages, status.remainingPercentage);
    }
    return percentages;
}
function collectCachedQuotaHeadroomPercentages(provider, connection, requestedModel) {
    const quotaEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaCache"])(connection.id);
    const rawQuotas = quotaEntry?.quotas || {};
    const codexWindowFilter = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexQuotaWindowFilterForModel"])(requestedModel) : undefined;
    const percentages = [];
    for (const [quotaName, quota] of Object.entries(rawQuotas)){
        if (codexWindowFilter && !codexWindowFilter(quotaName)) continue;
        if (!quota || isResetAtInPast(toStringOrNull(quota.resetAt))) continue;
        pushClampedPercentage(percentages, toNumber(quota.remainingPercentage, Number.NaN));
    }
    return percentages;
}
function getConnectionQuotaHeadroomPercent(provider, connection, requestedModel = null) {
    const policy = resolveQuotaLimitPolicy(provider, connection.providerSpecificData);
    const policyPercentages = collectPolicyQuotaHeadroomPercentages(provider, connection, policy, requestedModel);
    const percentages = policyPercentages.length > 0 ? policyPercentages : collectCachedQuotaHeadroomPercentages(provider, connection, requestedModel);
    return percentages.length > 0 ? Math.min(...percentages) : null;
}
function getConnectionErrorPenalty(connection) {
    const errorType = normalizeStatus(connection.lastErrorType);
    const errorSource = normalizeStatus(connection.lastErrorSource);
    const numericErrorCode = toNumber(connection.errorCode, 0);
    let penalty = 0;
    if (connection.lastError) penalty += 6;
    if (errorType === "rate_limited" || errorType === "quota_exhausted" || errorType === "quota" || numericErrorCode === 429) {
        penalty += 24;
    } else if (numericErrorCode === 401 || numericErrorCode === 403 || errorSource === "oauth") {
        penalty += 18;
    } else if (numericErrorCode >= 500) {
        penalty += 10;
    }
    return penalty;
}
function getConnectionRecencyPenalty(connection) {
    if (!connection.lastUsedAt) return 0;
    const ageMs = Date.now() - new Date(connection.lastUsedAt).getTime();
    if (!Number.isFinite(ageMs)) return 0;
    if (ageMs < 15_000) return 3;
    if (ageMs < 60_000) return 2;
    if (ageMs < 5 * 60_000) return 1;
    return 0;
}
function getP2CConnectionScore(provider, connection, requestedModel = null, quotaResults) {
    let quotaBlocked;
    let quotaExhausted;
    if (connection.id && quotaResults?.has(connection.id)) {
        const cached = quotaResults.get(connection.id);
        quotaBlocked = cached.blocked;
        quotaExhausted = cached.exhausted;
    } else {
        quotaBlocked = evaluateQuotaLimitPolicy(provider, connection, requestedModel).blocked;
        quotaExhausted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isQuotaExhaustedForRequest"])(connection.id, provider, requestedModel);
    }
    const quotaHeadroomPercent = getConnectionQuotaHeadroomPercent(provider, connection, requestedModel);
    let quotaPenalty = 0;
    if (quotaHeadroomPercent !== null) {
        quotaPenalty += Math.round((100 - quotaHeadroomPercent) / 8);
        if (quotaHeadroomPercent <= 10) quotaPenalty += 10;
        else if (quotaHeadroomPercent <= 25) quotaPenalty += 4;
    } else if (!quotaBlocked && !quotaExhausted) {
        quotaPenalty += 4;
    }
    const score = (quotaExhausted ? 200 : 0) + (quotaBlocked ? 80 : 0) + getConnectionErrorPenalty(connection) + Math.min(40, (connection.backoffLevel || 0) * 8) + quotaPenalty + Math.min(12, (connection.consecutiveUseCount || 0) * 2) + getConnectionRecencyPenalty(connection) + Math.min(6, Math.max(0, connection.priority || 0) - 1);
    return {
        score,
        quotaHeadroomPercent
    };
}
function compareP2CConnections(provider, a, b, requestedModel = null, quotaResults) {
    const aScore = getP2CConnectionScore(provider, a, requestedModel, quotaResults);
    const bScore = getP2CConnectionScore(provider, b, requestedModel, quotaResults);
    if (aScore.score !== bScore.score) {
        return aScore.score - bScore.score;
    }
    const aHeadroom = aScore.quotaHeadroomPercent ?? -1;
    const bHeadroom = bScore.quotaHeadroomPercent ?? -1;
    if (aHeadroom !== bHeadroom) {
        return bHeadroom - aHeadroom;
    }
    if ((a.priority || 999) !== (b.priority || 999)) {
        return (a.priority || 999) - (b.priority || 999);
    }
    return a.id.localeCompare(b.id);
}
/**
 * Sentinel connection id used for the synthetic credentials of no-auth /
 * keyless providers. It is NOT a real DB row, so it
 * cannot carry cooldown state — the account-fallback loop must be able to
 * exclude it (#3061), otherwise it gets re-selected forever.
 */ const SYNTHETIC_NOAUTH_CONNECTION_ID = "noauth";
function buildSyntheticNoAuthCredentials(providerSpecificData = {}) {
    return {
        apiKey: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        projectId: null,
        defaultModel: null,
        copilotToken: null,
        providerSpecificData,
        connectionId: SYNTHETIC_NOAUTH_CONNECTION_ID,
        testStatus: "active",
        lastError: null,
        lastErrorType: null,
        lastErrorSource: null,
        errorCode: null,
        rateLimitedUntil: null,
        maxConcurrent: null
    };
}
/** Merge one connection's fingerprints/accountProxies into `hydrated`, first-wins. */ function mergeNoAuthProviderSpecificData(hydrated, conn) {
    const psd = conn.providerSpecificData;
    if (!psd || typeof psd !== "object") return;
    const record = psd;
    if (Array.isArray(record.fingerprints) && !Array.isArray(hydrated.fingerprints)) {
        hydrated.fingerprints = record.fingerprints;
    }
    if (Array.isArray(record.accountProxies) && !Array.isArray(hydrated.accountProxies)) {
        hydrated.accountProxies = record.accountProxies;
    }
}
/**
 * #4954 / #5217 (Gap 1) — no-auth providers persist a connection row whose
 * `providerSpecificData` carries `fingerprints` + `accountProxies`. Hydrate those
 * and resolve by-id Proxy Pool references to live records (./noAuthProxyResolution)
 * so the executor gets a resolved inline `proxy`. Best-effort: failures → empty.
 *
 * #7993: also checks sibling ids (e.g. "opencode-zen" -> "opencode") so a
 * proxy/fingerprint row saved under the no-auth id is still found when
 * credentials are hydrated for the apikey-gateway id that shares its public
 * endpoint.
 */ async function loadNoAuthProviderSpecificData(providerId) {
    try {
        const providerIdsToQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSiblings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNoAuthHydrationProviderIds"])(providerId);
        const hydrated = {};
        for (const pid of providerIdsToQuery){
            const connectionsRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
                provider: pid
            });
            const connections = (Array.isArray(connectionsRaw) ? connectionsRaw : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderConnection"]);
            for (const conn of connections)mergeNoAuthProviderSpecificData(hydrated, conn);
        }
        if (Array.isArray(hydrated.accountProxies)) {
            hydrated.accountProxies = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProxyResolution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountProxiesFromRegistry"])(hydrated.accountProxies);
        }
        return hydrated;
    } catch  {
        return {};
    }
}
function providerCanUseSyntheticNoAuthFallback(providerId) {
    const providerDef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(providerId);
    const noAuthProviderDef = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"][providerId];
    const webCookieProviderDef = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][providerId];
    return providerDef?.anonymousFallback === true || noAuthProviderDef?.noAuth === true || webCookieProviderDef?.noAuth === true;
}
async function maybeSyntheticNoAuthFallback(providerId, excludedConnectionIds) {
    if (!providerCanUseSyntheticNoAuthFallback(providerId)) return null;
    if (excludedConnectionIds.has(SYNTHETIC_NOAUTH_CONNECTION_ID)) return null;
    // #4954: hydrate per-account proxy/rotation config off the connection row so
    // no-auth executors (opencode, mimocode) actually honor configured proxies.
    const providerSpecificData = await loadNoAuthProviderSpecificData(providerId);
    return buildSyntheticNoAuthCredentials(providerSpecificData);
}
function normalizeExcludedConnectionIds(excludeConnectionId, extraExcludedConnectionIds) {
    const normalized = new Set();
    if (typeof excludeConnectionId === "string" && excludeConnectionId.trim().length > 0) {
        normalized.add(excludeConnectionId.trim());
    }
    if (Array.isArray(extraExcludedConnectionIds)) {
        for (const connectionId of extraExcludedConnectionIds){
            if (typeof connectionId === "string" && connectionId.trim().length > 0) {
                normalized.add(connectionId.trim());
            }
        }
    }
    return normalized;
}
function formatConnectionPrefixesForLog(ids, max = 6) {
    const prefixes = Array.from(ids).filter((id)=>typeof id === "string" && id.length > 0).slice(0, max).map((id)=>`${id.slice(0, 8)}...`);
    return prefixes.length > 0 ? prefixes.join(",") : "none";
}
function buildQuotaPreflightRateLimitedResult(provider, blockedByPreflight) {
    const retryAfter = getEarliestFutureDate(blockedByPreflight.map((entry)=>entry.resetAt ?? null)) || new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const blockedSummary = blockedByPreflight.map((entry)=>{
        const percent = Number.isFinite(entry.quotaPercent) ? `${Math.round(entry.quotaPercent * 100)}%` : "quota exhausted";
        return `${entry.id.slice(0, 8)}(${percent})`;
    }).join("; ");
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | quota preflight filtered account(s): ${blockedSummary}`);
    return {
        allRateLimited: true,
        retryAfter,
        retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(retryAfter),
        lastError: `All ${provider} accounts blocked by quota preflight`,
        lastErrorCode: 429
    };
}
function quotaPreflightUnavailableUntil(resetAt) {
    const resetMs = parseFutureDateMs(resetAt ?? null);
    return new Date(resetMs ?? Date.now() + 5 * 60 * 1000).toISOString();
}
async function markQuotaPreflightAccountUnavailable(provider, connectionId, preflight, requestedModel) {
    const unavailableUntil = quotaPreflightUnavailableUntil(preflight.resetAt ?? null);
    const percentLabel = Number.isFinite(preflight.quotaPercent) ? `${Math.round(preflight.quotaPercent * 100)}%` : "exhausted";
    const modelLabel = requestedModel ? ` for ${requestedModel}` : "";
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
        rateLimitedUntil: unavailableUntil,
        testStatus: "unavailable",
        lastError: `Quota preflight blocked${modelLabel}: ${percentLabel}`,
        lastErrorType: "quota_exhausted",
        lastErrorSource: "quota_preflight",
        errorCode: 429,
        lastErrorAt: new Date().toISOString()
    });
    return unavailableUntil;
}
// Provider-scoped mutexes prevent race conditions during account selection without
// serializing unrelated providers behind a single global lock.
const selectionMutexes = new Map();
function getSelectionMutexKey(provider, options) {
    return [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider) || provider,
        options.forcedConnectionId ? `forced:${options.forcedConnectionId}` : "pool"
    ].join(":");
}
function createSelectionLock(key) {
    const currentMutex = selectionMutexes.get(key) ?? Promise.resolve();
    let resolveMutex;
    const nextMutex = new Promise((resolve)=>{
        resolveMutex = resolve;
    });
    selectionMutexes.set(key, nextMutex);
    return {
        wait: currentMutex,
        release: ()=>{
            resolveMutex?.();
            if (selectionMutexes.get(key) === nextMutex) {
                selectionMutexes.delete(key);
            }
        }
    };
}
// ─── Anti-Thundering Herd: per-connection mutex for markAccountUnavailable ───
// Prevents multiple concurrent requests from marking the same connection
// unavailable in parallel, which was the root cause of cascading 502 lockouts.
const markMutexes = new Map();
;
;
const PROVIDER_SEARCH_PAIRS = [
    [
        "nvidia",
        "nvidia_nim"
    ],
    [
        "kimi-coding",
        "kimi-coding-apikey"
    ],
    [
        "antigravity",
        "agy"
    ]
];
/**
 * Resolve provider aliases (e.g., nvidia -> nvidia_nim) for DB lookup
 */ async function getProviderSearchPool(provider) {
    const canonicalProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider);
    const canonicalAlias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(canonicalProvider);
    const pair = PROVIDER_SEARCH_PAIRS.find((aliases)=>aliases.includes(provider));
    if (pair) return pair[0] === provider ? pair : [
        pair[1],
        pair[0]
    ];
    const searchPool = new Set([
        provider,
        canonicalProvider,
        canonicalAlias
    ].filter(Boolean));
    // Built-in providers already resolve through static ids/aliases. Only
    // compatible/custom providers need provider_nodes expansion back to the
    // generated internal connection ids. (#3058)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(canonicalProvider)) {
        return Array.from(searchPool);
    }
    // Custom provider nodes are referenced by user-facing prefixes in combos
    // (for example "78code/gpt-5.4"), but live credentials are stored under
    // internal provider ids like openai-compatible-responses-<uuid>.
    try {
        const providerNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
        for (const node of Array.isArray(providerNodes) ? providerNodes : []){
            const nodeRecord = asRecord(node);
            const nodePrefix = typeof nodeRecord.prefix === "string" ? nodeRecord.prefix.trim() : "";
            const nodeId = typeof nodeRecord.id === "string" ? nodeRecord.id.trim() : "";
            if (!nodePrefix || !nodeId) continue;
            if (nodePrefix === provider || nodePrefix === canonicalProvider || nodePrefix === canonicalAlias) {
                searchPool.add(nodeId);
            }
        }
    } catch  {
    // Best-effort alias expansion only.
    }
    return Array.from(searchPool);
}
async function getProviderCredentials(provider, excludeConnectionId = null, allowedConnections = null, requestedModel = null, options = {}) {
    const selectionLock = createSelectionLock(getSelectionMutexKey(provider, options));
    try {
        await selectionLock.wait;
        // No-auth providers (e.g. opencode) need no DB connection — return synthetic credentials
        // so the executor receives a valid credentials object without auth headers being added.
        const resolvedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider);
        const providerMaps = [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"]
        ];
        if (providerMaps.some((map)=>map[resolvedId]?.noAuth)) {
            if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isNoAuthProviderBlockedBySettings"])(resolvedId)) return null;
            // #3061: there is only one synthetic "noauth" connection for a no-auth
            // provider. If the caller already tried and excluded it (account-fallback
            // after a persistent upstream error), do NOT hand it back — that would let
            // the chat fallback loop re-select "noauth" forever (no real DB row → no
            // cooldown to brake it), writing logs every iteration until the disk fills.
            // Returning null here lets the handler stop after a single attempt.
            const excludedForNoAuth = normalizeExcludedConnectionIds(excludeConnectionId, options.excludeConnectionIds);
            return await maybeSyntheticNoAuthFallback(resolvedId, excludedForNoAuth);
        }
        const allowSuppressedConnections = options.allowSuppressedConnections === true;
        const allowRateLimitedConnections = allowSuppressedConnections || options.allowRateLimitedConnections === true;
        const bypassQuotaPolicy = options.bypassQuotaPolicy === true;
        let forcedConnectionId = typeof options.forcedConnectionId === "string" && options.forcedConnectionId.trim().length > 0 ? options.forcedConnectionId.trim() : null;
        const excludedConnectionIds = normalizeExcludedConnectionIds(excludeConnectionId, options.excludeConnectionIds);
        // Fetched early so the session-affinity-pin override (#5903) can consult
        // the TTL before forcedConnectionId narrows the connection pool.
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const sessionAffinityTtlMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveSessionAffinityTtlMs"])(provider, options, settings);
        // Fix #922: Check for aliases (nvidia/nvidia_nim) to ensure credentials are found
        const providersToSearch = await getProviderSearchPool(provider);
        const connectionResults = await Promise.all(providersToSearch.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedRawProviderConnections"])({
                provider: p,
                isActive: true
            })));
        const connectionsRaw = connectionResults.filter(Array.isArray).flat();
        let connections = (Array.isArray(connectionsRaw) ? connectionsRaw : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLazyConnectionView"]).filter((conn)=>conn.id.length > 0);
        // allowedConnections: restrict to specific connection IDs (from API key policy, #363)
        if (allowedConnections && allowedConnections.length > 0) {
            connections = connections.filter((conn)=>allowedConnections.includes(conn.id));
        }
        // #5903: an active session-affinity pin outranks a per-request reset-aware
        // forcedConnectionId (see sessionAffinityPin leaf for the full rationale).
        forcedConnectionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applySessionAffinityPin"])({
            forcedConnectionId,
            options,
            sessionAffinityTtlMs,
            connections,
            provider,
            requestedModel,
            excludedConnectionIds,
            isTerminalConnectionStatus,
            isCodexScopeUnavailable,
            isQuotaPolicyBlocked: (c)=>evaluateQuotaLimitPolicy(provider, c, requestedModel).blocked
        }) ?? forcedConnectionId;
        if (forcedConnectionId) {
            connections = connections.filter((conn)=>conn.id === forcedConnectionId);
        }
        const activeConnectionsCount = connections.length;
        const rawConnectionsCount = connectionsRaw.length;
        const blockedByForcedConnection = forcedConnectionId ? rawConnectionsCount - connections.length : 0;
        const blockedByAllowedConnections = allowedConnections && allowedConnections.length > 0 ? Math.max(0, rawConnectionsCount - connections.length - blockedByForcedConnection) : 0;
        const forcedIdForLog = forcedConnectionId ? `${forcedConnectionId.slice(0, 8)}...` : "none";
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | active=${activeConnectionsCount}, excluded=${excludedConnectionIds.size} (${formatConnectionPrefixesForLog(excludedConnectionIds)}), forcedId=${forcedIdForLog}, blocked_forced=${blockedByForcedConnection}, blocked_allowed=${blockedByAllowedConnections}`);
        if (provider === "antigravity" && (forcedConnectionId || allowedConnections?.length)) {
            const reasons = [];
            if (forcedConnectionId) reasons.push(`forcedConnectionId kept ${connections.length}`);
            if (allowedConnections?.length) {
                reasons.push(`allowedConnections=${allowedConnections.length}`);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} selection constrained: ${reasons.join(", ")}`);
        }
        if (connections.length === 0) {
            // Check all connections (including inactive) to see if rate limited
            // Fix #922: Also search aliases here
            const allConnectionsResults = await Promise.all(providersToSearch.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
                    provider: p
                })));
            let allConnections = allConnectionsResults.filter(Array.isArray).flat().map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderConnection"]).filter((conn)=>conn.id.length > 0);
            if (allowedConnections && allowedConnections.length > 0) {
                allConnections = allConnections.filter((conn)=>allowedConnections.includes(conn.id));
            }
            if (forcedConnectionId) {
                allConnections = allConnections.filter((conn)=>conn.id === forcedConnectionId);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | all connections (incl inactive): ${allConnections.length}`);
            if (allConnections.length > 0) {
                const earliest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEarliestRateLimitedUntil"])(allConnections);
                if (earliest) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `${provider} | all ${allConnections.length} accounts rate limited (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)})`);
                    return {
                        allRateLimited: true,
                        retryAfter: earliest,
                        retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)
                    };
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `${provider} | ${allConnections.length} accounts found but none active`);
                allConnections.forEach((c)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `  → ${c.id?.slice(0, 8)} | isActive=${c.isActive} | rateLimitedUntil=${c.rateLimitedUntil || "none"} | testStatus=${c.testStatus}`);
                });
                // If every existing connection is in a terminal state (expired/banned/
                // credits_exhausted), surface that as a re-auth signal instead of the
                // generic "No credentials" 400. The classic case is AWS SSO/Kiro
                // refresh tokens hitting their 90-day TTL: all connections flip to
                // is_active=0 with testStatus=banned|expired, and without this branch
                // the dashboard sees a misleading "bad_request" code.
                const terminalConnections = allConnections.filter(isTerminalConnectionStatus);
                if (terminalConnections.length === allConnections.length) {
                    const syntheticFallback = await maybeSyntheticNoAuthFallback(resolvedId, excludedConnectionIds);
                    if (syntheticFallback) return syntheticFallback;
                    const statusCounts = new Map();
                    for (const c of terminalConnections){
                        const key = normalizeStatus(c.testStatus) || "expired";
                        statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
                    }
                    const dominantStatus = [
                        ...statusCounts.entries()
                    ].sort((a, b)=>b[1] - a[1])[0]?.[0] || "expired";
                    return {
                        allExpired: true,
                        expiredCount: terminalConnections.length,
                        expiredStatus: dominantStatus
                    };
                }
            }
            const syntheticFallback = await maybeSyntheticNoAuthFallback(resolvedId, excludedConnectionIds);
            if (syntheticFallback) return syntheticFallback;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `No credentials for ${provider}`);
            return null;
        }
        // Auto-decay backoffLevel for accounts whose rateLimitedUntil has passed.
        // Without this, high backoffLevel permanently deprioritizes accounts even
        // after the rate limit window expires, creating a deadlock where the account
        // needs a successful request to reset but never gets selected.
        for (const c of connections){
            if (c.backoffLevel > 0 && !isTerminalConnectionStatus(c) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(c.rateLimitedUntil)) {
                c.backoffLevel = 0;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetConnectionBackoff"])(c.id).catch(()=>{});
            }
        }
        let modelLockedCount = 0;
        let familyLockedCount = 0;
        const connectionFilterStatus = new Map();
        // Filter out unavailable accounts and excluded connection
        const availableConnections = connections.filter((c)=>{
            if (excludedConnectionIds.has(c.id)) {
                connectionFilterStatus.set(c.id, "excluded");
                return false;
            }
            if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(requestedModel, c.providerSpecificData)) {
                connectionFilterStatus.set(c.id, "modelExcluded");
                return false;
            }
            if (!allowSuppressedConnections) {
                if (!allowRateLimitedConnections && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(c.rateLimitedUntil)) {
                    connectionFilterStatus.set(c.id, "rateLimited");
                    return false;
                }
                if (isTerminalConnectionStatus(c)) {
                    connectionFilterStatus.set(c.id, "terminalStatus");
                    return false;
                }
                if (provider === "codex" && isCodexScopeUnavailable(c, requestedModel)) {
                    connectionFilterStatus.set(c.id, "codexScopeLimited");
                    return false;
                }
                // Per-model lockout: if this specific model/family is locked on this connection, skip it
                if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(provider, c.id, requestedModel)) {
                    connectionFilterStatus.set(c.id, "modelLocked");
                    if (provider === "antigravity" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaScopeLabelForProvider"])(provider, requestedModel) === "family") {
                        familyLockedCount += 1;
                    } else {
                        modelLockedCount += 1;
                    }
                    return false;
                }
            }
            connectionFilterStatus.set(c.id, "available");
            return true;
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | available: ${availableConnections.length}/${connections.length}`);
        if (provider === "antigravity") {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} selection candidates model=${requestedModel || "none"}: active=${activeConnectionsCount}, excluded=${excludedConnectionIds.size}, modelLocked=${modelLockedCount}, familyLocked=${familyLockedCount}, eligible=${availableConnections.length}`);
        }
        connections.forEach((c)=>{
            const status = connectionFilterStatus.get(c.id);
            const excluded = status === "excluded";
            const rateLimited = status === "rateLimited";
            const terminalStatus = status === "terminalStatus";
            const codexScopeLimited = status === "codexScopeLimited";
            const modelLocked = status === "modelLocked";
            const modelExcluded = status === "modelExcluded";
            if (excluded || rateLimited) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `  → ${c.id?.slice(0, 8)} | ${excluded ? "excluded" : ""} ${rateLimited ? `rateLimited until ${c.rateLimitedUntil}` : ""}${allowSuppressedConnections && rateLimited ? " (retained for combo live test)" : ""}`);
            } else if (modelExcluded) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `  → ${c.id?.slice(0, 8)} | excluded by per-account model rule for ${requestedModel}`);
            } else if (terminalStatus) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", allowSuppressedConnections ? `  → ${c.id?.slice(0, 8)} | retained terminal status=${c.testStatus} for combo live test` : `  → ${c.id?.slice(0, 8)} | skipped terminal status=${c.testStatus}`);
            } else if (codexScopeLimited) {
                const scopeUntil = getCodexScopeRateLimitedUntil(c.providerSpecificData, requestedModel);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", allowSuppressedConnections ? `  → ${c.id?.slice(0, 8)} | retained codex scope-limited account until ${scopeUntil} for combo live test` : `  → ${c.id?.slice(0, 8)} | codex scope-limited until ${scopeUntil}`);
            } else if (modelLocked) {
                const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelLockoutInfo"])(provider, c.id, requestedModel);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", allowSuppressedConnections ? `  → ${c.id?.slice(0, 8)} | retained model lockout for ${requestedModel} (${lockout?.remainingMs || 0}ms remaining) for combo live test` : `  → ${c.id?.slice(0, 8)} | model-locked for ${requestedModel} (${lockout?.remainingMs || 0}ms remaining)`);
            }
        });
        if (availableConnections.length === 0) {
            const cooldownStates = connections.map((connection)=>{
                const connectionCooldownMs = parseFutureDateMs(connection.rateLimitedUntil);
                const codexScopeCooldownMs = provider === "codex" ? parseFutureDateMs(getCodexScopeRateLimitedUntil(connection.providerSpecificData, requestedModel)) : null;
                const modelLockout = requestedModel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelLockoutInfo"])(provider, connection.id, requestedModel) : null;
                const retryableModelCooldownMs = modelLockout && modelLockout.remainingMs > 0 && isRetryableModelLockoutReason(modelLockout.reason) ? Date.now() + modelLockout.remainingMs : null;
                return {
                    connection,
                    connectionCooldownMs,
                    codexScopeCooldownMs,
                    retryableModelCooldownMs
                };
            });
            const cooldownCandidates = cooldownStates.flatMap((state)=>{
                const candidates = [];
                if (state.connectionCooldownMs !== null) {
                    candidates.push({
                        ms: state.connectionCooldownMs,
                        connection: state.connection
                    });
                }
                if (state.codexScopeCooldownMs !== null) {
                    candidates.push({
                        ms: state.codexScopeCooldownMs,
                        connection: state.connection
                    });
                }
                if (state.retryableModelCooldownMs !== null) {
                    candidates.push({
                        ms: state.retryableModelCooldownMs,
                        connection: state.connection
                    });
                }
                return candidates;
            }).sort((a, b)=>a.ms - b.ms);
            const allBlockedByModelCooldown = Boolean(requestedModel) && cooldownStates.length > 0 && cooldownStates.every((state)=>{
                const hasModelSpecificCooldown = state.codexScopeCooldownMs !== null || state.retryableModelCooldownMs !== null;
                return hasModelSpecificCooldown && state.connectionCooldownMs === null;
            });
            const earliestCandidate = cooldownCandidates[0];
            const earliest = earliestCandidate?.ms && Number.isFinite(earliestCandidate.ms) ? new Date(earliestCandidate.ms).toISOString() : null;
            if (earliest) {
                const earliestConn = earliestCandidate?.connection;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", allBlockedByModelCooldown ? `${provider} | all ${connections.length} active accounts cooling down for model ${requestedModel} (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)}) | lastErrorCode=${earliestConn?.errorCode}, lastError=${earliestConn?.lastError?.slice(0, 50)}` : `${provider} | all ${connections.length} active accounts rate limited (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)}) | lastErrorCode=${earliestConn?.errorCode}, lastError=${earliestConn?.lastError?.slice(0, 50)}`);
                return {
                    allRateLimited: true,
                    retryAfter: earliest,
                    retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest),
                    lastError: earliestConn?.lastError || null,
                    lastErrorCode: allBlockedByModelCooldown ? 429 : earliestConn?.errorCode || null,
                    cooldownScope: allBlockedByModelCooldown ? "model" : "connection",
                    cooldownModel: allBlockedByModelCooldown ? requestedModel : null,
                    connectionsCount: connections.length
                };
            }
            const syntheticFallback = await maybeSyntheticNoAuthFallback(resolvedId, excludedConnectionIds);
            if (syntheticFallback) return syntheticFallback;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `${provider} | all ${connections.length} accounts unavailable`);
            return null;
        }
        let policyEligibleConnections = availableConnections;
        const blockedByPolicy = [];
        const quotaResults = new Map();
        if (!bypassQuotaPolicy) {
            policyEligibleConnections = availableConnections.filter((connection)=>{
                const evaluation = evaluateQuotaLimitPolicy(provider, connection, requestedModel);
                quotaResults.set(connection.id, {
                    blocked: evaluation.blocked,
                    exhausted: false
                });
                if (!evaluation.blocked) return true;
                blockedByPolicy.push({
                    id: connection.id,
                    reasons: evaluation.reasons,
                    resetAt: evaluation.resetAt
                });
                return false;
            });
        } else if (availableConnections.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | bypassing cached quota policy for this request`);
        }
        if (blockedByPolicy.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | quota policy filtered ${blockedByPolicy.length} account(s): ${blockedByPolicy.map((entry)=>`${entry.id.slice(0, 8)}(${entry.reasons.join(", ")})`).join("; ")}`);
        }
        if (policyEligibleConnections.length === 0 && availableConnections.length > 0) {
            const earliestResetAt = getEarliestFutureDate(blockedByPolicy.map((entry)=>entry.resetAt));
            const earliestResetMs = parseFutureDateMs(earliestResetAt);
            const retryAfter = earliestResetMs ? new Date(earliestResetMs).toISOString() : new Date(Date.now() + 5 * 60 * 1000).toISOString();
            return {
                allRateLimited: true,
                retryAfter,
                retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(retryAfter),
                lastError: `All ${provider} accounts reached configured quota threshold`,
                lastErrorCode: 429
            };
        }
        // Quota-aware: partition accounts with and without quota for the requested scope.
        const withQuota = [];
        const exhaustedQuota = [];
        for (const c of policyEligibleConnections){
            const exhausted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isQuotaExhaustedForRequest"])(c.id, provider, requestedModel);
            const existing = quotaResults.get(c.id);
            if (existing) existing.exhausted = exhausted;
            if (!exhausted) {
                withQuota.push(c);
            } else {
                exhaustedQuota.push(c);
            }
        }
        if (exhaustedQuota.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | quota-aware: ${withQuota.length} with quota, skipping ${exhaustedQuota.length} exhausted`);
        }
        if (withQuota.length === 0 && exhaustedQuota.length > 0) {
            // All remaining eligible accounts are exhausted
            const earliestResetAt = getEarliestFutureDate(exhaustedQuota.map((c)=>{
                const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaCache"])(c.id);
                return entry?.nextResetAt || null;
            }));
            const earliestResetMs = parseFutureDateMs(earliestResetAt);
            const retryAfter = earliestResetMs ? new Date(earliestResetMs).toISOString() : new Date(Date.now() + 5 * 60 * 1000).toISOString();
            return {
                allRateLimited: true,
                retryAfter,
                retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(retryAfter),
                lastError: `All ${provider} accounts have exhausted their quota`,
                lastErrorCode: 429
            };
        }
        const orderedConnections = withQuota;
        const providerStrategyOverrides = settings.providerStrategies || {};
        const providerOverride = providerStrategyOverrides[resolvedId] || {};
        const strategy = providerOverride.fallbackStrategy || settings.fallbackStrategy || "fill-first";
        let connection;
        const affinityConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectSessionAffinityConnection"])(provider, options.sessionKey, orderedConnections, sessionAffinityTtlMs);
        if (affinityConnection) {
            connection = affinityConnection;
        } else if (options.sessionKey) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `session_key=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["formatSessionKeyForLog"])(options.sessionKey)} has no available affinity target`);
        }
        if (connection) {
        // Session affinity selected a connection before global sticky routing.
        } else if (strategy === "round-robin") {
            const stickyLimit = toNumber(providerOverride.stickyRoundRobinLimit ?? settings.stickyRoundRobinLimit, 3);
            // If excluding account(s) (fallback scenario), skip sticky logic and go straight to LRU.
            // This prevents same-model retries from getting stuck on a failed account.
            const isFallbackScenario = excludeConnectionId !== null || excludedConnectionIds.size > 0;
            if (!isFallbackScenario) {
                // Sort by lastUsed (most recent first) to find current candidate
                const byRecency = [
                    ...orderedConnections
                ].sort((a, b)=>{
                    if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                    if (!a.lastUsedAt) return 1;
                    if (!b.lastUsedAt) return -1;
                    return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
                });
                const current = byRecency[0];
                const currentCount = current?.consecutiveUseCount || 0;
                if (current && current.lastUsedAt && currentCount < stickyLimit) {
                    // Stay with current account
                    connection = current;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} round-robin: staying with ${current.id?.slice(0, 8)}... (count=${currentCount}/${stickyLimit})`);
                    // Update lastUsedAt and increment count (await to ensure persistence)
                    const nextCount = (connection.consecutiveUseCount || 0) + 1;
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["touchConnectionLastUsed"])(connection.id, nextCount);
                    // Sync raw cache row so subsequent calls within TTL see fresh stats
                    for (const r of connectionsRaw){
                        if (r.id === connection.id) {
                            r.lastUsedAt = new Date().toISOString();
                            r.consecutiveUseCount = nextCount;
                            break;
                        }
                    }
                } else {
                    // Pick the least recently used (excluding current if possible)
                    // Also penalize accounts with high backoffLevel (previously rate-limited)
                    // so they don't get immediately re-selected after cooldown (#340)
                    const sortedByOldest = [
                        ...orderedConnections
                    ].sort((a, b)=>{
                        // Penalize previously rate-limited accounts (backoffLevel > 0)
                        const aBackoff = a.backoffLevel || 0;
                        const bBackoff = b.backoffLevel || 0;
                        if (aBackoff !== bBackoff) return aBackoff - bBackoff; // lower backoff first
                        if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                        if (!a.lastUsedAt) return -1;
                        if (!b.lastUsedAt) return 1;
                        return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
                    });
                    connection = sortedByOldest[0];
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} round-robin: switching to LRU ${connection.id?.slice(0, 8)}... (current count=${currentCount} >= limit=${stickyLimit} or no lastUsedAt)`);
                    // Update lastUsedAt and reset count to 1 (await to ensure persistence)
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["touchConnectionLastUsed"])(connection.id, 1);
                    // Sync raw cache row so subsequent calls within TTL see fresh LRU stats
                    for (const r of connectionsRaw){
                        if (r.id === connection.id) {
                            r.lastUsedAt = new Date().toISOString();
                            r.consecutiveUseCount = 1;
                            break;
                        }
                    }
                }
            } else {
                // Fallback scenario: excluded an account due to failure
                // Always pick the least recently used to ensure proper cycling
                // Also penalize accounts with high backoffLevel (#340)
                const sortedByOldest = [
                    ...orderedConnections
                ].sort((a, b)=>{
                    const aBackoff = a.backoffLevel || 0;
                    const bBackoff = b.backoffLevel || 0;
                    if (aBackoff !== bBackoff) return aBackoff - bBackoff;
                    if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                    if (!a.lastUsedAt) return -1;
                    if (!b.lastUsedAt) return 1;
                    return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
                });
                connection = sortedByOldest[0];
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} round-robin: FALLBACK MODE - excluded_count=${excludedConnectionIds.size} excluded=${formatConnectionPrefixesForLog(excludedConnectionIds)} picked_lru=${connection.id?.slice(0, 8)}...`);
                // Update lastUsedAt and reset count to 1 (await to ensure persistence)
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["touchConnectionLastUsed"])(connection.id, 1);
                // Sync raw cache row so subsequent calls within TTL see fresh stats
                for (const r of connectionsRaw){
                    if (r.id === connection.id) {
                        r.lastUsedAt = new Date().toISOString();
                        r.consecutiveUseCount = 1;
                        break;
                    }
                }
            }
        } else if (strategy === "p2c") {
            const candidatePool = withQuota.length > 0 ? withQuota : orderedConnections;
            // Power of Two Choices: sample from the quota-eligible pool and compare
            // health instead of defaulting to random-first selection.
            if (candidatePool.length <= 2) {
                connection = [
                    ...candidatePool
                ].sort((a, b)=>compareP2CConnections(provider, a, b, requestedModel, quotaResults))[0];
            } else {
                const i = parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % candidatePool.length;
                let j = parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % (candidatePool.length - 1);
                if (j >= i) j++;
                const a = candidatePool[i];
                const b = candidatePool[j];
                connection = compareP2CConnections(provider, a, b, requestedModel, quotaResults) <= 0 ? a : b;
            }
        } else if (strategy === "random") {
            // Random: Fisher-Yates-inspired random pick
            const idx = parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % orderedConnections.length;
            connection = orderedConnections[idx];
        } else if (strategy === "least-used") {
            // Least Used: pick the one with oldest lastUsedAt
            const sorted = [
                ...orderedConnections
            ].sort((a, b)=>{
                if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                if (!a.lastUsedAt) return -1;
                if (!b.lastUsedAt) return 1;
                return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
            });
            connection = sorted[0];
        } else if (strategy === "cost-optimized") {
            // Cost Optimized: sort by priority ascending (lower = cheaper/preferred)
            // Future: can be enhanced with actual cost data per provider
            const sorted = [
                ...orderedConnections
            ].sort((a, b)=>(a.priority || 999) - (b.priority || 999));
            connection = sorted[0];
        } else if (strategy === "strict-random") {
            // Strict Random: shuffle deck — uses each account once before reshuffling
            const ids = orderedConnections.map((c)=>c.id);
            const selectedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNextFromDeckSync"])(`conn:${provider}`, ids);
            connection = orderedConnections.find((c)=>c.id === selectedId) || orderedConnections[0];
        } else {
            // Default: fill-first (already sorted by priority in getProviderConnections)
            connection = orderedConnections[0];
        }
        if (provider === "antigravity" && connection) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} selected account=${connection.id?.slice(0, 8)}... eligible=${orderedConnections.length} excluded=${excludedConnectionIds.size}`);
        }
        const apiKeyHealth = connection.providerSpecificData?.apiKeyHealth;
        if (apiKeyHealth) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syncHealthFromDB"])(connection.id, apiKeyHealth);
        }
        return {
            apiKey: connection.apiKey,
            accessToken: connection.accessToken,
            refreshToken: connection.refreshToken,
            expiresAt: connection.tokenExpiresAt || connection.expiresAt || null,
            projectId: connection.projectId,
            // #474: surface the connection's configured defaultModel so the chat /
            // embeddings handlers can resolve a bare model name (e.g. an alias that
            // resolved to "auto") to a real provider model ID before the upstream call.
            defaultModel: connection.defaultModel || null,
            copilotToken: typeof connection.providerSpecificData.copilotToken === "string" ? connection.providerSpecificData.copilotToken : null,
            providerSpecificData: connection.providerSpecificData,
            // Fields the generic quota fetcher (open-sse/services/genericQuotaFetcher.ts)
            // needs to delegate to getUsageForProvider for any provider — kept aliased
            // (`id` + `connectionId`) for back-compat with callers that already use the
            // connectionId name.
            id: connection.id,
            provider: connection.provider,
            email: connection.email,
            connectionId: connection.id,
            // Include current status for optimization check
            testStatus: connection.testStatus,
            lastError: connection.lastError,
            lastErrorType: connection.lastErrorType,
            lastErrorSource: connection.lastErrorSource,
            errorCode: connection.errorCode,
            rateLimitedUntil: connection.rateLimitedUntil,
            maxConcurrent: connection.maxConcurrent,
            // Surface per-window quota overrides so the preflight latency gate in
            // getProviderCredentialsWithQuotaPreflight can see them. Without this,
            // user-set cutoffs would silently never enforce.
            quotaWindowThresholds: connection.quotaWindowThresholds ?? null
        };
    } finally{
        selectionLock.release();
    }
}
async function getProviderCredentialsWithQuotaPreflight(provider, excludeConnectionId = null, allowedConnections = null, requestedModel = null, options = {}) {
    // Credits-first requests intentionally skip both cached quota cutoffs and live
    // usage preflight. The user inference itself is the one credit-bearing request;
    // probing normal quota first would spend up to two extra credit calls.
    const bypassQuotaPolicy = options.bypassQuotaPolicy === true || provider === "antigravity" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCreditsMode"])() === "always";
    if (bypassQuotaPolicy) {
        return getProviderCredentials(provider, excludeConnectionId, allowedConnections, requestedModel, {
            ...options,
            bypassQuotaPolicy: true
        });
    }
    const blockedByPreflight = [];
    const excludedConnectionIds = normalizeExcludedConnectionIds(excludeConnectionId, options.excludeConnectionIds);
    const resilience = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])());
    const { defaultThresholdPercent, warnThresholdPercent, providerWindowDefaults } = resilience.quotaPreflight;
    const providerWindowMap = providerWindowDefaults[provider] || {};
    const providerHasDefaults = Object.keys(providerWindowMap).length > 0;
    // The factory default is "block at 2% remaining" — effectively "right
    // before 429." Skipping preflight at that level is a clean no-op. If an
    // operator has raised the global to anything stricter (e.g. 20% remaining
    // = stop at 80% used), preflight needs to run for every connection so the
    // tighter floor is honored.
    const FACTORY_NO_OP_REMAINING_PERCENT = 2;
    const globalDefaultIsRestrictive = defaultThresholdPercent > FACTORY_NO_OP_REMAINING_PERCENT;
    while(true){
        const credentials = await getProviderCredentials(provider, null, allowedConnections, requestedModel, {
            ...options,
            excludeConnectionIds: Array.from(excludedConnectionIds)
        });
        if (!credentials) {
            if (blockedByPreflight.length > 0) {
                return buildQuotaPreflightRateLimitedResult(provider, blockedByPreflight);
            }
            return null;
        }
        if ("allRateLimited" in credentials && credentials.allRateLimited || "allExpired" in credentials && credentials.allExpired) {
            if ("allRateLimited" in credentials && credentials.allRateLimited && blockedByPreflight.length > 0) {
                return buildQuotaPreflightRateLimitedResult(provider, blockedByPreflight);
            }
            return credentials;
        }
        const connectionId = credentials.connectionId;
        if (!connectionId) {
            return credentials;
        }
        // Cascading resolver: per-connection override → per-(provider, window)
        // default → global default. Used per-window when the fetcher exposes
        // multiple windows, and once (with window=null) for single-signal
        // fetchers. The warn fallback is uniform — windows don't need their own
        // warn levels in v1.
        const perConnectionWindowOverrides = credentials.quotaWindowThresholds || {};
        // Latency gate: skip the upstream usage fetch entirely when there's
        // nothing to enforce. Preflight is only worth its cost when at least
        // one of the following is true:
        //   • a per-connection override on this row
        //   • a per-(provider, window) default in resilience settings
        //   • the legacy `quotaPreflightEnabled` flag in providerSpecificData
        //   • the global default is stricter than the factory no-op level
        //     (factory = 2% remaining, basically "right before 429" — anything
        //     stricter means the operator wants enforcement everywhere)
        // Otherwise the resolver would return the factory default for every
        // window, and a near-exhausted account would still be caught by the
        // normal 429 → cooldown path.
        // Explicit per-connection opt-out always wins over global/provider defaults.
        // isQuotaPreflightEnabled is strict-=== true (back-compat), so it returns
        // false for both "not set" and "explicit false" — we need an explicit check
        // here to distinguish them.
        const legacyForceDisable = credentials.providerSpecificData?.quotaPreflightEnabled === false;
        if (legacyForceDisable) return credentials;
        const hasConnectionOverrides = Object.keys(perConnectionWindowOverrides).length > 0;
        const legacyForceEnable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isQuotaPreflightEnabled"])(credentials);
        if (!hasConnectionOverrides && !providerHasDefaults && !legacyForceEnable && !globalDefaultIsRestrictive) {
            return credentials;
        }
        // Returns the minimum-remaining cutoff for a window — matches the
        // dashboard's quota bars so the number the user types in the modal
        // means the same thing as the percentage rendered on the bar.
        const resolveMinRemainingPercent = (windowName)=>{
            if (windowName !== null) {
                const lookupWindowNames = provider === "codex" ? uniqueWindows([
                    windowName,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexBaseQuotaWindowName"])(windowName)
                ].filter(Boolean)) : [
                    windowName
                ];
                for (const lookupWindowName of lookupWindowNames){
                    const override = perConnectionWindowOverrides[lookupWindowName];
                    if (typeof override === "number") return override;
                    const providerDefault = providerWindowMap[lookupWindowName];
                    if (typeof providerDefault === "number") return providerDefault;
                }
            }
            return defaultThresholdPercent;
        };
        // #6842: openrouter also needs requestedModel, for the :free-window check.
        const modelAwarePreflight = provider === "codex" || provider === "openrouter";
        const preflightCredentials = requestedModel && modelAwarePreflight ? {
            ...credentials,
            requestedModel
        } : credentials;
        const preflight = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["preflightQuota"])(provider, connectionId, preflightCredentials, {
            resolveMinRemainingPercent,
            resolveWarnRemainingPercent: ()=>warnThresholdPercent
        });
        if (preflight.proceed) {
            return credentials;
        }
        const unavailableUntil = await markQuotaPreflightAccountUnavailable(provider, connectionId, preflight, requestedModel);
        blockedByPreflight.push({
            id: connectionId,
            quotaPercent: preflight.quotaPercent,
            resetAt: unavailableUntil
        });
        excludedConnectionIds.add(connectionId);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | preflight blocked ${connectionId.slice(0, 8)}${Number.isFinite(preflight.quotaPercent) ? ` at ${Math.round(preflight.quotaPercent * 100)}%` : ""} until ${unavailableUntil}`);
    }
}
async function markAccountUnavailable(connectionId, status, errorText, provider = null, model = null, providerProfile = null, options = {}) {
    const currentMutex = markMutexes.get(connectionId) || Promise.resolve();
    let resolveMutex;
    markMutexes.set(connectionId, new Promise((resolve)=>{
        resolveMutex = resolve;
    }));
    try {
        await currentMutex;
        const resourceBypass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResource404Bypass"])(status, errorText, connectionId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__);
        if (resourceBypass) return resourceBypass;
        // Read current connection to get backoffLevel
        const connectionsRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            provider
        });
        const connections = (Array.isArray(connectionsRaw) ? connectionsRaw : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderConnection"]).filter((connection)=>connection.id.length > 0);
        const conn = connections.find((connection)=>connection.id === connectionId);
        const backoffLevel = conn?.backoffLevel || 0;
        // T06/T10/T36: terminal statuses should not be overwritten by transient cooldown state.
        if (conn && isTerminalConnectionStatus(conn)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${connectionId.slice(0, 8)} terminal status=${conn.testStatus}, skipping cooldown overwrite`);
            return {
                shouldFallback: true,
                cooldownMs: 0
            };
        }
        // ─── Anti-Thundering Herd Guard ─────────────────────────────────
        // If this connection was ALREADY marked unavailable by a prior concurrent
        // request (within the mutex window), skip re-marking to avoid resetting
        // the cooldown timer or double-incrementing the backoff level.
        // Uses cooldownUntilMs (not a raw `new Date()`) because `rate_limited_until`
        // can hold a numeric-epoch string (e.g. the Antigravity full-quota path) —
        // see #3954.
        const existingCooldownMs = conn?.rateLimitedUntil ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cooldownUntilMs"])(conn.rateLimitedUntil) : NaN;
        if (Number.isFinite(existingCooldownMs) && existingCooldownMs > Date.now()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${connectionId.slice(0, 8)} already marked unavailable (until ${conn?.rateLimitedUntil}), skipping duplicate mark`);
            return {
                shouldFallback: true,
                cooldownMs: existingCooldownMs - Date.now()
            };
        }
        // T09: Codex scope-aware lockout guard (codex vs spark independent pools).
        if (provider === "codex" && model) {
            const scopeRateLimitedUntil = getCodexScopeRateLimitedUntil(conn?.providerSpecificData || {}, model);
            if (scopeRateLimitedUntil && new Date(scopeRateLimitedUntil).getTime() > Date.now()) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${connectionId.slice(0, 8)} already scope-limited for ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model)} (until ${scopeRateLimitedUntil}), skipping duplicate mark`);
                return {
                    shouldFallback: true,
                    cooldownMs: new Date(scopeRateLimitedUntil).getTime() - Date.now()
                };
            }
        }
        const effectiveProviderProfile = providerProfile || (provider ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRuntimeProviderProfile"])(provider) : null);
        // #4530 follow-up: the combo.ts lockout sites forward the admin-configured
        // maxCooldownMs cap to recordModelLockoutFailure, but the markAccountUnavailable
        // lockout sites (per-model quota, grok-web 403, local 404) never did, so the cap
        // fell back to BACKOFF_CONFIG.max here. Resolve it once and pass it at every site.
        const mlSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelLockoutSettings"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])());
        const fallbackResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkFallbackError"])(status, errorText, backoffLevel, model, provider, null, effectiveProviderProfile);
        // Read passthroughModels from connection config (user-configured per-model quota)
        const connProviderSpecificData = conn?.providerSpecificData || {};
        const connectionPassthroughModels = connProviderSpecificData.passthroughModels;
        // #2997: per-connection opt-out of the TRANSIENT connection cooldown. When set,
        // a recoverable failure records lastError/backoff but does NOT cool the
        // connection, so getProviderCredentials keeps selecting it. Terminal states
        // (banned/expired/credits_exhausted) are unaffected — they are resolved below
        // via resolveTerminalConnectionStatus() and still take the connection out.
        // NOTE: this first cut scopes the opt-out to the CONNECTION-level cooldown only;
        // per-model lockout branches (per-model quota 403/404, codex scope) are left
        // as-is — extending disableCooling to model lockout is a follow-up.
        const disableCooling = connProviderSpecificData.disableCooling === true;
        const isPerModelQuotaProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasPerModelQuota"])(provider, model, connectionPassthroughModels);
        const modelLockoutOptions = {
            maxCooldownMs: effectiveProviderProfile?.maxCooldownMs
        };
        if (isPerModelQuotaProvider && provider && provider !== "codex" && model && (status === 404 || status === 429 || status >= 500)) {
            const reason = status === 404 ? "not_found" : status === 429 && fallbackResult.reason === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED ? "quota_exhausted" : status === 429 ? "rate_limited" : "server_error";
            // #5976: a bare 500 is intermittent and NOT model-specific — skip
            // lockout/cooldown ONLY for the exact 500 (the contract its own tests pin:
            // combo-provider-cooldown-sibling.test.ts — "Gemini 503 should NOT skip
            // cooldown"). 502/503/504 keep the pre-#6216 model-lockout path: cooldownMs
            // 0 hot-loops the failing upstream (broke resilience-http-e2e on the PR).
            if (status === 500) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                    lastErrorType: reason,
                    lastError: `Model ${model} ${reason}`,
                    lastErrorAt: new Date().toISOString(),
                    errorCode: status
                }).catch(()=>{});
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Server error for ${provider}:${model} — ${status} ${reason} (no model lockout, connection stays active for sibling models)`);
                return {
                    shouldFallback: true,
                    cooldownMs: 0
                };
            }
            const usesExactAntigravityLock = provider === "antigravity";
            const quotaScope = usesExactAntigravityLock ? "model" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaScopeLabelForProvider"])(provider, model);
            const antigravityFamilyInferredBaseCooldownMs = !usesExactAntigravityLock && provider === "antigravity" && quotaScope === "family" && status === 429 ? ANTIGRAVITY_FAMILY_INFERRED_BASE_COOLDOWN_MS : null;
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, reason, status, status === 404 ? effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFoundLocal : antigravityFamilyInferredBaseCooldownMs ?? fallbackResult.baseCooldownMs ?? effectiveProviderProfile?.baseCooldownMs ?? 0, effectiveProviderProfile, {
                ...modelLockoutOptions,
                exactCooldownMs: fallbackResult.usedUpstreamRetryHint === true ? fallbackResult.cooldownMs : fallbackResult.quotaResetHintMs ?? null,
                maxCooldownMs: mlSettings.maxCooldownMs,
                scope: usesExactAntigravityLock ? "exact" : undefined,
                // #6863 vs #7940: exactCooldownMs above is only ever set from a genuine
                // upstream signal (Retry-After/reset header or a parsed quotaResetHintMs) —
                // never a synthetic estimate — so it must bypass maxCooldownMs instead of
                // being clamped down to a window the upstream already told us is wrong.
                exactCooldownIsUpstreamReset: fallbackResult.usedUpstreamRetryHint === true || typeof fallbackResult.quotaResetHintMs === "number"
            });
            // Update last error for observability (without changing terminal status)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: reason,
                lastError: `Model ${model} ${reason}`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Model-only lockout for ${provider}:${model} — ${status} ${reason} ${Math.ceil(lockout.cooldownMs / 1000)}s (failureCount=${lockout.failureCount}, connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        const result = fallbackResult;
        const { shouldFallback, cooldownMs: rawCooldownMs, newBackoffLevel, reason } = result;
        if (!shouldFallback) return {
            shouldFallback: false,
            cooldownMs: 0
        };
        const providerErrorType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyProviderError"])(status, errorText, provider);
        if (provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider) === "grok-web" && status === 403 && model) {
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, "forbidden", status, effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].serviceUnavailable, effectiveProviderProfile, {
                maxCooldownMs: mlSettings.maxCooldownMs
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: "forbidden",
                lastError: `Mode ${model} forbidden for this Grok account`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Mode-only lockout for ${provider}:${model} — 403 forbidden ${Math.ceil(lockout.cooldownMs / 1000)}s (connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        const terminalStatus = resolveTerminalConnectionStatus(status, result, providerErrorType, provider);
        const cachedQuotaResetAt = providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].QUOTA_EXHAUSTED || reason === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED ? getCachedQuotaResetAt(connectionId) : null;
        const cachedQuotaResetMs = parseFutureDateMs(cachedQuotaResetAt);
        const cooldownMs = terminalStatus ? 0 : cachedQuotaResetMs ? cachedQuotaResetMs - Date.now() : rawCooldownMs;
        // ── #3027: per-model subscription/permission 403 → model-only lockout ──
        if (isPerModelQuotaProvider && status === 403 && provider && model && !terminalStatus) {
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, "forbidden", status, fallbackResult.baseCooldownMs ?? effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].serviceUnavailable, effectiveProviderProfile, {
                ...modelLockoutOptions,
                exactCooldownMs: fallbackResult.usedUpstreamRetryHint === true ? fallbackResult.cooldownMs : null,
                maxCooldownMs: mlSettings.maxCooldownMs
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: "forbidden",
                lastError: `Model ${model} forbidden (per-model access/subscription)`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Model-only lockout for ${provider}:${model} — 403 forbidden ${Math.ceil(lockout.cooldownMs / 1000)}s (per-model quota provider, connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        // ── 404 model-only lockout: connection stays active ──
        // For local providers (detected by URL), a 404 means the specific model
        // doesn't exist or isn't available for this account — it should NOT lock
        // out the entire connection.
        const connBaseUrl = conn?.providerSpecificData?.baseUrl;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(connBaseUrl) && status === 404 && provider && model) {
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, "not_found", status, status === 404 ? effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFoundLocal : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFoundLocal, effectiveProviderProfile, {
                maxCooldownMs: mlSettings.maxCooldownMs
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: "not_found",
                lastError: `Model ${model} not_found`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Model-only lockout for ${provider}:${model} — 404 not_found ${Math.ceil(lockout.cooldownMs / 1000)}s (failureCount=${lockout.failureCount}, connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        const errorMsg = typeof errorText === "string" ? errorText.slice(0, 100) : "Provider error";
        // T09: Codex per-scope lockout (do not block the whole account globally).
        if (provider === "codex" && status === 429 && model && conn) {
            const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model);
            const existingScopeMap = asRecord(conn.providerSpecificData.codexScopeRateLimitedUntil);
            const persistedScopeUntil = getCodexScopeRateLimitedUntil(conn.providerSpecificData, model);
            const scopeRateLimitedUntil = persistedScopeUntil || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnavailableUntil"])(cooldownMs);
            const scopeCooldownMs = Math.max(new Date(scopeRateLimitedUntil).getTime() - Date.now(), 0);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                testStatus: "unavailable",
                lastError: errorMsg,
                errorCode: status,
                lastErrorAt: new Date().toISOString(),
                backoffLevel: newBackoffLevel ?? backoffLevel,
                providerSpecificData: {
                    ...conn.providerSpecificData,
                    codexScopeRateLimitedUntil: {
                        ...existingScopeMap,
                        [scope]: scopeRateLimitedUntil
                    }
                }
            });
            if (scopeCooldownMs > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"])(provider, connectionId, model, reason || "unknown", scopeCooldownMs);
            }
            if (status && errorMsg) {
                console.error(`❌ ${provider} [${status}] (${scope}): ${errorMsg}`);
            }
            return {
                shouldFallback: true,
                cooldownMs: scopeCooldownMs
            };
        }
        const baseUpdate = {
            lastError: errorMsg,
            lastErrorType: providerErrorType,
            errorCode: status,
            lastErrorAt: new Date().toISOString(),
            backoffLevel: newBackoffLevel ?? backoffLevel
        };
        const persistUnavailableState = options.persistUnavailableState !== false;
        if (!persistUnavailableState) {
            // Combo-managed transient failure (e.g. 429): keep the connection clean in
            // the DB, but record an in-memory model lockout so credential selection
            // skips this exact provider+connection+model while it cools down — other
            // models on the same connection stay usable.
            if (provider && model && cooldownMs > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"])(provider, connectionId, model, reason || "unknown", cooldownMs);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                ...baseUpdate
            });
        } else if (cooldownMs > 0 && !disableCooling) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                ...baseUpdate,
                rateLimitedUntil: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnavailableUntil"])(cooldownMs),
                testStatus: "unavailable"
            });
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                ...baseUpdate,
                rateLimitedUntil: null,
                ...terminalStatus ? {
                    testStatus: terminalStatus
                } : {}
            });
        }
        // T-AUTODISABLE: If auto-disable setting is enabled and error is permanent/terminal,
        // mark account as inactive so it is never retried again.
        // Uses getCachedSettings() to avoid DB overhead on hot error path.
        // NOTE: For permanent bans we disable immediately — no threshold needed,
        // because a permanent ban (403 "Verify your account" / ToS violation) will
        // NEVER recover, so retrying is pointless regardless of attempt count.
        if (result.permanent) {
            try {
                const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
                const autoDisableEnabled = settings.autoDisableBannedAccounts ?? false;
                if (autoDisableEnabled) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                        isActive: false
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Auto-disabled ${connectionId.slice(0, 8)} — permanent ban detected (autoDisableBannedAccounts=true)`);
                }
            } catch (e) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Auto-disable check failed (non-fatal): ${e}`);
            }
        }
        if (provider && status && errorMsg) {
            console.error(`❌ ${provider} [${status}]: ${errorMsg}`);
        }
        return {
            shouldFallback: true,
            cooldownMs
        };
    } finally{
        if (resolveMutex) resolveMutex();
        // Cleanup stale mutex entries (avoid memory leak)
        markMutexes.delete(connectionId);
    }
}
async function clearAccountError(connectionId, currentConnection) {
    // Only update if currently has error status
    const hasError = currentConnection.testStatus && currentConnection.testStatus !== "active" || currentConnection.lastError || currentConnection.rateLimitedUntil || currentConnection.errorCode || currentConnection.lastErrorType || currentConnection.lastErrorSource;
    if (!hasError) return; // Skip if already clean
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
        testStatus: "active",
        lastError: null,
        lastErrorAt: null,
        lastErrorType: null,
        lastErrorSource: null,
        errorCode: null,
        rateLimitedUntil: null,
        backoffLevel: 0
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Account ${connectionId.slice(0, 8)} error cleared`);
}
async function clearRecoveredProviderState(credentials, expectedState) {
    if (!credentials?.connectionId) return {
        applied: false
    };
    if (expectedState) {
        const applied = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearConnectionErrorIfUnchanged"])(credentials.connectionId, expectedState);
        if (!applied) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Skipped recovery clear for ${credentials.connectionId.slice(0, 8)} — state changed concurrently (CAS miss)`);
            return {
                applied: false
            };
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Account ${credentials.connectionId.slice(0, 8)} error cleared (CAS)`);
        return {
            applied: true
        };
    }
    await clearAccountError(credentials.connectionId, credentials);
    return {
        applied: true
    };
}
function readNonEmptyUrlToken(request) {
    if (typeof request?.url !== "string" || request.url.trim().length === 0) return null;
    try {
        const url = new URL(request.url, "http://localhost");
        const segments = url.pathname.split("/").map((segment)=>segment.trim()).filter(Boolean);
        if (segments[0] === "vscode" && segments[1]) {
            const decodedSegment = decodeURIComponent(segments[1]).trim();
            if (decodedSegment.length > 0) return decodedSegment;
        }
        if (segments[0] === "api" && segments[1] === "v1" && segments[2] === "vscode") {
            if (segments[3] && segments[3] !== "raw" && segments[3] !== "combos") {
                const decodedSegment = decodeURIComponent(segments[3]).trim();
                if (decodedSegment.length > 0) return decodedSegment;
            }
            if ((segments[3] === "raw" || segments[3] === "combos") && segments[4]) {
                const decodedSegment = decodeURIComponent(segments[4]).trim();
                if (decodedSegment.length > 0) return decodedSegment;
            }
        }
    // NOTE: query-string token fallbacks (`?token=`/`?key=`/`?apiKey=`/`?api_key=`)
    // were intentionally REMOVED. They are a broad credential-in-URL surface that
    // leaks into access logs, Referer headers and proxy logs, and — because this
    // extractor also feeds management auth — would let `?token=<mgmt-key>`
    // authenticate management routes. The VS Code integration only needs the
    // path-scoped `/vscode/<token>/…` form above. (security review, #3300 follow-up)
    } catch  {
        return null;
    }
    return null;
}
function extractApiKey(request, opts) {
    const authHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "Authorization") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "authorization");
    if (typeof authHeader === "string") {
        const trimmedHeader = authHeader.trim();
        if (trimmedHeader.toLowerCase().startsWith("bearer ")) {
            return trimmedHeader.slice(7).trim() || null;
        }
    }
    // Issue #2225: Anthropic Messages API clients authenticate via x-api-key.
    // Gate the fallback on anthropic-version OR a claude-code/anthropic user-agent so we
    // don't trip up local-mode requests from non-Anthropic clients that send placeholder
    // x-api-key values (which would otherwise be rejected as Invalid API key).
    const anthropicVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "anthropic-version") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "Anthropic-Version");
    const userAgent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "user-agent") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "User-Agent");
    if (anthropicVersion || userAgent && /claude-code|claude-cli|anthropic/i.test(userAgent)) {
        const xApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "x-api-key") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "X-Api-Key");
        if (typeof xApiKey === "string") {
            const trimmed = xApiKey.trim();
            if (trimmed.length > 0) return trimmed;
        }
    }
    const xGoogApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$googApiKeyAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractGoogApiKeyHeader"])(request?.headers); // Issue #7034
    if (xGoogApiKey) return xGoogApiKey;
    if (opts?.allowUrl === false) return null;
    return readNonEmptyUrlToken(request);
}
async function isValidApiKey(apiKey) {
    if (!apiKey) return false;
    // Persistent env-var key — always valid regardless of DB state (#1350)
    const envKey = process.env.OMNIROUTE_API_KEY || process.env.ROUTER_API_KEY;
    if (envKey && apiKey === envKey) return true;
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateApiKey"])(apiKey);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/model.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getCombo",
    ()=>getCombo,
    "getComboForModel",
    ()=>getComboForModel,
    "getModelInfo",
    ()=>getModelInfo
]);
// Re-export from open-sse with localDb integration
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/activeSyncedCatalog.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/registeredEffortVariants.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
/**
 * Reserved provider prefixes — built-in provider ids + aliases. User-defined
 * compatible-node prefixes must not be allowed to shadow these, otherwise a
 * node with prefix="cf" would hijack cloudflare-ai requests (and similar for
 * every built-in provider). Ported from upstream 9router 047fdc89.
 *
 * Built lazily so the registry is only walked once per process.
 */ let _reservedProviderPrefixes = null;
function getReservedProviderPrefixes() {
    if (_reservedProviderPrefixes) return _reservedProviderPrefixes;
    const reserved = new Set();
    for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        if (entry?.id) reserved.add(entry.id);
        if (entry?.alias) reserved.add(entry.alias);
    }
    _reservedProviderPrefixes = reserved;
    return reserved;
}
/**
 * Fold `settings.wildcardAliases` ({pattern,target}[]) — the store the Settings
 * UI's "Wildcard Pattern" mode writes to (ModelAliasesUnified.tsx::addWildcardAlias
 * -> PATCH /api/settings) — into `pattern -> target` map entries so the T13
 * wildcard step in getModelInfoCore() (which treats every key of the merged alias
 * map as a candidate glob pattern) can see them (#7693). Without this the
 * feature persists but is never consulted at request time.
 */ function buildWildcardAliasMap(settings) {
    const wildcardEntries = Array.isArray(settings.wildcardAliases) ? settings.wildcardAliases : [];
    const wildcardMap = {};
    for (const entry of wildcardEntries){
        if (entry && typeof entry.pattern === "string" && typeof entry.target === "string") {
            wildcardMap[entry.pattern] = entry.target;
        }
    }
    return wildcardMap;
}
/**
 * Build a combined model alias map that merges all alias stores:
 * 1. DB-namespace aliases (key_value WHERE namespace='modelAliases') — set via
 *    /api/models/alias/ and seeded at startup.
 * 2. Settings-based exact aliases (settings.modelAliases) — set via the Settings UI and
 *    /api/settings/model-aliases/ (stored as a JSON blob in namespace='settings').
 * 3. Settings-based wildcard aliases (settings.wildcardAliases) — set via the Settings
 *    UI's "Wildcard Pattern" mode, PATCH /api/settings (#7693).
 *
 * Settings-based exact aliases take priority over DB-namespace aliases so that UI
 * configuration always wins. Without this merge, aliases configured via the Settings
 * UI were never consulted during provider routing, causing provider inference (e.g.
 * /^gpt-/ → openai) to silently override them (issue #2618 / #2208). Wildcard entries
 * are folded in last: they are keyed by pattern string (containing `*`/`?`), which
 * cannot collide with a real model id, so ordering never affects exact-alias lookups.
 */ async function getCombinedModelAliases() {
    const [dbAliases, settings] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelAliases"])().catch(()=>({})),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])().catch(()=>({}))
    ]);
    const settingsAliases = settings.modelAliases && typeof settings.modelAliases === "object" && !Array.isArray(settings.modelAliases) ? settings.modelAliases : {};
    const wildcardMap = buildWildcardAliasMap(settings);
    return {
        ...dbAliases,
        ...settingsAliases,
        ...wildcardMap
    };
}
// Providers that already own a native `-{effort}` suffix mechanism — never
// double-resolve the generic synced suffix on top of theirs (#7694, mirrors the
// catalog-side skip list in `open-sse/utils/syncedEffortVariants.ts`).
const SYNCED_EFFORT_SKIP_PROVIDER_PREFIXES = [
    "codex",
    "kimi"
];
function isSyncedEffortSkippedProvider(providerId) {
    return SYNCED_EFFORT_SKIP_PROVIDER_PREFIXES.some((prefix)=>providerId.startsWith(prefix));
}
/**
 * #7694: when `modelId` has no direct synced-model match, try stripping a trailing
 * `-{effort}` token by testing it against each candidate synced model's OWN declared
 * `supportedThinkingEfforts` (`splitSyncedEffortSuffix`) — never a blind/global effort
 * list, so a model id that legitimately ends in an effort-like token is left untouched
 * unless some synced model's real tier list says otherwise. Returns the original
 * `modelId` with `effort: null` when nothing matches or the provider already owns its
 * own suffix mechanism.
 */ function resolveSyncedModelIdAndEffort(providerId, modelId, syncedModels) {
    if (isSyncedEffortSkippedProvider(providerId) || !Array.isArray(syncedModels)) {
        return {
            modelId,
            effort: null
        };
    }
    if (findSyncedModelMeta(syncedModels, modelId)) return {
        modelId,
        effort: null
    };
    for (const candidate of syncedModels){
        if (typeof candidate?.id !== "string" || !Array.isArray(candidate.supportedThinkingEfforts)) {
            continue;
        }
        const attempt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["splitSyncedEffortSuffix"])(modelId, candidate.supportedThinkingEfforts);
        if (attempt.effort && attempt.baseModel === candidate.id) {
            return {
                modelId: attempt.baseModel,
                effort: attempt.effort
            };
        }
    }
    return {
        modelId,
        effort: null
    };
}
function findCustomModelMeta(models, modelId) {
    if (!Array.isArray(models)) return undefined;
    return models.find((model)=>model.id === modelId) ?? models.find((model)=>typeof model.id === "string" && model.id.toLowerCase() === modelId.toLowerCase());
}
function findSyncedModelMeta(models, modelId) {
    return Array.isArray(models) ? models.find((model)=>model.id === modelId) : undefined;
}
function resolveRuntimeFormats(customMatch, syncedMatch) {
    const apiFormat = customMatch?.apiFormat === "responses" || syncedMatch?.apiFormat === "responses" ? "responses" : undefined;
    const targetFormat = typeof customMatch?.targetFormat === "string" ? customMatch.targetFormat : typeof syncedMatch?.targetFormat === "string" ? syncedMatch.targetFormat : undefined;
    return {
        ...apiFormat ? {
            apiFormat
        } : {},
        ...targetFormat ? {
            targetFormat
        } : {}
    };
}
function copySyncedThinkingMetadata(metadata, syncedMatch) {
    if (typeof syncedMatch?.supportsThinking === "boolean") {
        metadata.supportsThinking = syncedMatch.supportsThinking;
    }
    if (syncedMatch?.alwaysThinking === true) metadata.alwaysThinking = true;
    if (Array.isArray(syncedMatch?.supportedThinkingEfforts)) {
        metadata.supportedThinkingEfforts = syncedMatch.supportedThinkingEfforts;
    }
    if (typeof syncedMatch?.defaultThinkingEffort === "string") {
        metadata.defaultThinkingEffort = syncedMatch.defaultThinkingEffort;
    }
}
function buildRuntimeModelMeta(customMatch, syncedMatch) {
    const metadata = resolveRuntimeFormats(customMatch, syncedMatch);
    copySyncedThinkingMetadata(metadata, syncedMatch);
    return metadata;
}
async function lookupModelMeta(providerId, modelId) {
    try {
        const [customModels, liveCatalog] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomModels"])(providerId),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getActiveSyncedCatalog"])(providerId)
        ]);
        const syncedModels = liveCatalog.models;
        // #7694: no direct match on the raw modelId? try a synced-declared `-{effort}`
        // suffix before falling back to the literal id, so `<prefix>/<model>-<tier>`
        // resolves to the real base model + a resolved effort.
        const { modelId: resolvedModelId, effort } = resolveSyncedModelIdAndEffort(providerId, modelId, syncedModels);
        // Custom models remain explicit operator overrides even when live discovery
        // is authoritative for the provider.
        const customMatch = findCustomModelMeta(customModels, resolvedModelId);
        const syncedMatch = findSyncedModelMeta(syncedModels, resolvedModelId);
        const effortBaseModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRegisteredProviderEffortBaseModelId"])(providerId, modelId);
        const liveBackedEffortVariant = effortBaseModelId !== null && syncedModels.some((model)=>model.id === effortBaseModelId);
        const available = !liveCatalog.authoritative || Boolean(customMatch || syncedMatch || liveBackedEffortVariant);
        const metadata = buildRuntimeModelMeta(customMatch, syncedMatch);
        if (effort) metadata.resolvedThinkingEffort = effort;
        return {
            modelId: resolvedModelId,
            metadata,
            available
        };
    } catch  {
        return {
            modelId,
            metadata: {},
            available: true
        };
    }
}
/**
 * When a custom provider node is matched by its raw internal `node.id` (e.g. a combo
 * step addressing `<connId>/...` — see #2778), `parsed.model` was never split on the
 * node's own `prefix`, unlike the alias-addressing path where `parseModel` already
 * strips it. If the caller naively concatenates `owned_by` (the node's prefix, as
 * listed by /api/models) with the raw model id, the resulting model string carries a
 * redundant leading `${node.prefix}/` segment that the upstream provider does not
 * recognize, causing a 400. Strip it so `<connId>/<prefix>/<rawModelId>` normalizes to
 * the same `<rawModelId>` the bare alias form resolves to (#6772).
 */ function stripRedundantNodePrefix(model, nodePrefix) {
    if (typeof nodePrefix !== "string" || !nodePrefix) return model;
    const redundant = `${nodePrefix}/`;
    return model.startsWith(redundant) ? model.slice(redundant.length) : model;
}
async function getModelInfo(modelStr) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseModel"])(modelStr);
    const { extendedContext } = parsed;
    const attachRuntimeModelMeta = async (info)=>{
        if (!info?.provider || !info?.model) return info;
        const providerId = String(info.provider);
        const requestedModelId = String(info.model);
        const { modelId, metadata, available } = await lookupModelMeta(providerId, requestedModelId);
        if (!available) {
            return {
                provider: null,
                model: requestedModelId,
                extendedContext: info.extendedContext,
                errorType: "model_not_found",
                errorMessage: `Model '${requestedModelId}' is not available in the active live catalog for provider '${providerId}'.`
            };
        }
        const resolvedInfo = modelId !== info.model ? {
            ...info,
            model: modelId
        } : info;
        return Object.keys(metadata).length > 0 ? {
            ...resolvedInfo,
            ...metadata
        } : resolvedInfo;
    };
    // Check custom provider nodes first (for both alias and non-alias formats)
    if (parsed.providerAlias || parsed.provider) {
        // Ensure prefixToCheck is always a concise identifier, not a full model string
        const prefixToCheck = parsed.providerAlias || parsed.provider;
        // Compatible-node prefixes are user-defined. They must not be allowed to
        // shadow built-in provider ids/aliases (e.g. `cf` → cloudflare-ai). When
        // prefixToCheck matches a built-in registry id/alias, skip the compatible-
        // node prefix lookup so the request still routes to the built-in provider.
        // Internal UUID-prefixed node ids (e.g. "openai-compatible-responses-...")
        // are never in the reserved set, so the #2778 combo path still works.
        // Ported from upstream 9router 047fdc89.
        const reserved = getReservedProviderPrefixes();
        const isReservedPrefix = typeof prefixToCheck === "string" && reserved.has(prefixToCheck);
        if (!isReservedPrefix) {
            // Check OpenAI Compatible nodes
            // Match by node.prefix (user-defined alias) OR node.id (internal UUID id stored by
            // combo steps), so that combo targets using the internal node id still resolve
            // correctly (#2778).
            const openaiNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])({
                type: "openai-compatible"
            });
            const matchedOpenAI = openaiNodes.find((node)=>node.prefix === prefixToCheck || node.id === prefixToCheck);
            if (matchedOpenAI) {
                const normalizedModel = stripRedundantNodePrefix(parsed.model, matchedOpenAI.prefix);
                const { modelId, metadata } = await lookupModelMeta(matchedOpenAI.id, normalizedModel);
                return {
                    provider: matchedOpenAI.id,
                    model: modelId,
                    extendedContext,
                    ...metadata
                };
            }
            // Check Anthropic Compatible nodes
            const anthropicNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])({
                type: "anthropic-compatible"
            });
            const matchedAnthropic = anthropicNodes.find((node)=>node.prefix === prefixToCheck || node.id === prefixToCheck);
            if (matchedAnthropic) {
                const normalizedModel = stripRedundantNodePrefix(parsed.model, matchedAnthropic.prefix);
                const { modelId, metadata } = await lookupModelMeta(matchedAnthropic.id, normalizedModel);
                return {
                    provider: matchedAnthropic.id,
                    model: modelId,
                    extendedContext,
                    ...metadata
                };
            }
        }
        // stripModelPrefix: if enabled, strip provider prefix and re-resolve
        // the bare model name using existing heuristics (claude-* → anthropic, etc.)
        try {
            const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
            if (settings.stripModelPrefix === true) {
                const strippedResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelInfoCore"])(parsed.model, getCombinedModelAliases);
                return {
                    ...strippedResult,
                    extendedContext
                };
            }
        } catch  {
        // If settings read fails, fall through to normal resolution
        }
    }
    if (!parsed.isAlias) {
        return await attachRuntimeModelMeta(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelInfoCore"])(modelStr, null));
    }
    return await attachRuntimeModelMeta(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelInfoCore"])(modelStr, getCombinedModelAliases));
}
async function getCombo(modelStr) {
    // Try exact match first (supports combos actually named "combo/ANY")
    let combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByName"])(modelStr);
    if (combo && combo.models && combo.models.length > 0) {
        return combo;
    }
    // Fallback: Strip combo/ prefix if present
    if (modelStr.startsWith("combo/")) {
        const nameToSearch = modelStr.substring(6);
        combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByName"])(nameToSearch);
        if (combo && combo.models && combo.models.length > 0) {
            return combo;
        }
    }
    // #4446: the opencode-plugin publishes combos as ModelV2 `id: combo.id`, and
    // the OpenCode `--model` dispatch path forwards a lowercased bare slug. The
    // exact, case-sensitive name match above misses both a combo addressed by its
    // stored id (UUID/slug) and a lowercased display name (e.g. "master-light" for
    // a combo named "MASTER-LIGHT"). These two fallbacks only run after the exact
    // match fails, so they never re-route a combo that already resolves today.
    combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboById"])(modelStr);
    if (combo && combo.models && combo.models.length > 0) {
        return combo;
    }
    combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByNameInsensitive"])(modelStr);
    if (combo && combo.models && combo.models.length > 0) {
        return combo;
    }
    return null;
}
async function getComboForModel(modelStr) {
    // 1. Existing behavior — exact combo name match
    let combo = await getCombo(modelStr);
    if (combo) return combo;
    // Client context tags are ignored only after exact lookup, preserving literal
    // combo names such as "Claude [1m]" while allowing "Claude[500k]" to use "Claude".
    const baseModelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripContextWindowSuffix"])(modelStr);
    if (baseModelStr && baseModelStr !== modelStr) {
        combo = await getCombo(baseModelStr);
        if (combo) return combo;
    }
    // 2. NEW — check model-combo mappings table (pattern match)
    try {
        const { resolveComboForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const mapped = await resolveComboForModel(baseModelStr || modelStr);
        if (mapped && mapped.models?.length > 0) {
            return mapped;
        }
    } catch  {
    // If the mappings table doesn't exist yet (pre-migration), continue gracefully
    }
    return null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/cooldownAwareRetry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "computeClosestRetryAfter",
    ()=>computeClosestRetryAfter,
    "disableCooldownAwareRetry",
    ()=>disableCooldownAwareRetry,
    "getCooldownAwareRetryDecision",
    ()=>getCooldownAwareRetryDecision,
    "resolveCooldownAwareRetrySettings",
    ()=>resolveCooldownAwareRetrySettings,
    "waitForCooldownAwareRetry",
    ()=>waitForCooldownAwareRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const MAX_REQUEST_RETRY = 10;
const MAX_RETRY_INTERVAL_SEC = 300;
const MAX_BUDGET_MS = 5 * 60 * 1000;
function normalizeInteger(value, fallback, options) {
    const min = options.min ?? 0;
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.min(options.max, Math.max(min, Math.trunc(value)));
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return Math.min(options.max, Math.max(min, Math.trunc(parsed)));
        }
    }
    return fallback;
}
function resolveCooldownAwareRetrySettings(settings) {
    const waitForCooldown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings).waitForCooldown;
    const maxRetries = normalizeInteger(waitForCooldown.maxRetries, waitForCooldown.maxRetries, {
        min: 0,
        max: MAX_REQUEST_RETRY
    });
    const maxRetryWaitSec = normalizeInteger(waitForCooldown.maxRetryWaitSec, waitForCooldown.maxRetryWaitSec, {
        min: 0,
        max: MAX_RETRY_INTERVAL_SEC
    });
    const maxRetryWaitMs = maxRetryWaitSec * 1000;
    const budgetMs = normalizeInteger(waitForCooldown.budgetMs, waitForCooldown.budgetMs, {
        min: maxRetryWaitMs,
        max: MAX_BUDGET_MS
    });
    const enabled = Boolean(waitForCooldown.enabled) && maxRetries > 0 && maxRetryWaitSec > 0;
    return {
        enabled,
        maxRetries,
        maxRetryWaitSec,
        maxRetryWaitMs,
        budgetMs
    };
}
function disableCooldownAwareRetry(settings, disabled) {
    if (!disabled) return settings;
    return {
        ...settings,
        enabled: false,
        maxRetries: 0,
        maxRetryWaitSec: 0,
        maxRetryWaitMs: 0,
        budgetMs: 0
    };
}
function computeClosestRetryAfter(retryAfter) {
    if (!retryAfter) {
        return {
            retryAfter: null,
            retryAfterHuman: "",
            waitMs: null
        };
    }
    const retryTimeMs = new Date(retryAfter).getTime();
    if (!Number.isFinite(retryTimeMs)) {
        return {
            retryAfter: null,
            retryAfterHuman: "",
            waitMs: null
        };
    }
    const normalizedRetryAfter = new Date(retryTimeMs).toISOString();
    return {
        retryAfter: normalizedRetryAfter,
        retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(normalizedRetryAfter),
        waitMs: Math.max(retryTimeMs - Date.now(), 0)
    };
}
function getCooldownAwareRetryDecision({ retryAfter, settings, attempt, budgetLeftMs }) {
    const closest = computeClosestRetryAfter(retryAfter);
    const effectiveBudgetLeftMs = budgetLeftMs ?? settings.budgetMs;
    if (!settings.enabled || settings.maxRetries <= 0 || settings.maxRetryWaitMs <= 0 || attempt >= settings.maxRetries || closest.waitMs === null) {
        return {
            shouldRetry: false,
            retryAfter: closest.retryAfter,
            retryAfterHuman: closest.retryAfterHuman,
            waitMs: 0
        };
    }
    if (closest.waitMs > settings.maxRetryWaitMs || closest.waitMs > effectiveBudgetLeftMs) {
        return {
            shouldRetry: false,
            retryAfter: closest.retryAfter,
            retryAfterHuman: closest.retryAfterHuman,
            waitMs: closest.waitMs
        };
    }
    return {
        shouldRetry: true,
        retryAfter: closest.retryAfter,
        retryAfterHuman: closest.retryAfterHuman,
        waitMs: closest.waitMs
    };
}
async function waitForCooldownAwareRetry(waitMs, signal) {
    if (signal?.aborted) return false;
    if (!Number.isFinite(waitMs) || waitMs <= 0) return signal?.aborted !== true;
    return await new Promise((resolve)=>{
        let settled = false;
        let timeoutId = setTimeout(()=>{
            if (settled) return;
            settled = true;
            if (signal) {
                signal.removeEventListener("abort", onAbort);
            }
            timeoutId = null;
            resolve(true);
        }, waitMs);
        const onAbort = ()=>{
            if (settled) return;
            settled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            signal?.removeEventListener("abort", onAbort);
            resolve(false);
        };
        signal?.addEventListener("abort", onAbort, {
            once: true
        });
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/tokenRefresh.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TOKEN_EXPIRY_BUFFER_MS",
    ()=>TOKEN_EXPIRY_BUFFER_MS,
    "checkAndRefreshToken",
    ()=>checkAndRefreshToken,
    "formatProviderCredentials",
    ()=>formatProviderCredentials,
    "getAccessToken",
    ()=>getAccessToken,
    "getAllAccessTokens",
    ()=>getAllAccessTokens,
    "refreshAccessToken",
    ()=>refreshAccessToken,
    "refreshClaudeOAuthToken",
    ()=>refreshClaudeOAuthToken,
    "refreshCodexToken",
    ()=>refreshCodexToken,
    "refreshCopilotToken",
    ()=>refreshCopilotToken,
    "refreshGitHubAndCopilotTokens",
    ()=>refreshGitHubAndCopilotTokens,
    "refreshGitHubToken",
    ()=>refreshGitHubToken,
    "refreshGoogleToken",
    ()=>refreshGoogleToken,
    "refreshQoderToken",
    ()=>refreshQoderToken,
    "refreshTokenByProvider",
    ()=>refreshTokenByProvider,
    "resolveCopilotTokenBaseUrl",
    ()=>resolveCopilotTokenBaseUrl,
    "updateProviderCredentials",
    ()=>updateProviderCredentials
]);
// Re-export from open-sse with local logger
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/claudeOAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/google.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/codex.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/qoder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/github.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const TOKEN_EXPIRY_BUFFER_MS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["TOKEN_EXPIRY_BUFFER_MS"];
async function resolveProxyForCredentials(provider, credentials) {
    if (credentials?.connectionId) {
        const resolved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(credentials.connectionId);
        if (resolved?.proxy) {
            return resolved.proxy;
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForProvider"])(provider);
}
const refreshAccessToken = async (provider, refreshToken, credentials)=>{
    const proxy = await resolveProxyForCredentials(provider, credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["refreshAccessToken"])(provider, refreshToken, credentials, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const refreshClaudeOAuthToken = async (refreshToken, credentials)=>{
    const proxy = await resolveProxyForCredentials("claude", credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshClaudeOAuthToken"])(refreshToken, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const refreshGoogleToken = async (refreshToken, clientId, clientSecret, provider = "gemini", credentials)=>{
    const proxy = await resolveProxyForCredentials(provider, credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshGoogleToken"])(refreshToken, clientId, clientSecret, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const refreshCodexToken = async (refreshToken, credentials)=>{
    const proxy = await resolveProxyForCredentials("codex", credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCodexToken"])(refreshToken, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const refreshQoderToken = async (refreshToken, credentials)=>{
    const proxy = await resolveProxyForCredentials("qoder", credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshQoderToken"])(refreshToken, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const refreshGitHubToken = async (refreshToken, credentials)=>{
    const proxy = await resolveProxyForCredentials("github", credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshGitHubToken"])(refreshToken, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const refreshCopilotToken = async (githubAccessToken, credentials, baseUrl)=>{
    const proxy = await resolveProxyForCredentials("github", credentials);
    return baseUrl ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(githubAccessToken, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy, baseUrl) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(githubAccessToken, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
function resolveCopilotTokenBaseUrl(provider, credentials) {
    if (provider !== "ghe-copilot") return undefined;
    const gheUrl = credentials?.providerSpecificData?.gheUrl;
    if (typeof gheUrl === "string" && gheUrl.trim().length > 0) {
        return `${gheUrl.trim().replace(/\/+$/, "")}/api/v3`;
    }
    return undefined;
}
const getAccessToken = async (provider, credentials, onPersist)=>{
    const proxy = await resolveProxyForCredentials(provider, credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccessToken"])(provider, credentials, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy, onPersist);
};
const refreshTokenByProvider = async (provider, credentials)=>{
    const proxy = await resolveProxyForCredentials(provider, credentials);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["refreshTokenByProvider"])(provider, credentials, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, proxy);
};
const formatProviderCredentials = (provider, credentials)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatProviderCredentials"])(provider, credentials, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__);
const getAllAccessTokens = (userInfo)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAllAccessTokens"])(userInfo, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__);
async function updateProviderCredentials(connectionId, newCredentials) {
    try {
        const updates = {};
        if (newCredentials.accessToken) {
            updates.accessToken = newCredentials.accessToken;
            // #6352: a successful refresh proves the connection is reachable and its
            // refresh_token is valid again — clear any stale auth-failure state
            // (testStatus/lastError*) left over from a prior expired/invalid refresh
            // token or an upstream 401/403. Without this, a genuinely successful
            // rotating-refresh (e.g. Codex/OpenAI) persisted the new access/refresh
            // token while leaving the dashboard showing "Auth Failed" forever,
            // because the error metadata was never reset here — only the health-check
            // sweep (tokenHealthCheck.ts::checkConnection) did this clearing, so any
            // OTHER caller of updateProviderCredentials (the manual refresh route,
            // the reactive per-request refresh in chat.ts) looked like it "didn't
            // pick up" the refreshed token. Explicit `newCredentials.testStatus`
            // below still wins for callers that need a specific terminal state.
            updates.testStatus = "active";
            updates.lastError = null;
            updates.lastErrorAt = null;
            updates.lastErrorType = null;
            updates.lastErrorSource = null;
            updates.errorCode = null;
        }
        if (newCredentials.refreshToken) {
            updates.refreshToken = newCredentials.refreshToken;
        }
        if (newCredentials.expiresIn) {
            const expiresAt = new Date(Date.now() + newCredentials.expiresIn * 1000).toISOString();
            updates.expiresAt = expiresAt;
            updates.tokenExpiresAt = expiresAt;
            updates.expiresIn = newCredentials.expiresIn;
        } else if (newCredentials.expiresAt) {
            updates.expiresAt = newCredentials.expiresAt;
            updates.tokenExpiresAt = newCredentials.expiresAt;
        }
        if (newCredentials.providerSpecificData) {
            updates.providerSpecificData = newCredentials.providerSpecificData;
        }
        // Cookie/session providers (chatgpt-web, ...) refresh by rotating the
        // stored apiKey blob — propagate that here too so DB credentials don't
        // go stale after Set-Cookie rotation.
        if (newCredentials.apiKey) {
            updates.apiKey = newCredentials.apiKey;
        }
        if (newCredentials.testStatus) {
            updates.testStatus = newCredentials.testStatus;
        }
        if (newCredentials.isActive !== undefined) {
            updates.isActive = newCredentials.isActive;
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, updates);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("TOKEN_REFRESH", "Credentials updated in localDb", {
            connectionId,
            success: !!result
        });
        return !!result;
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.error("TOKEN_REFRESH", "Error updating credentials in localDb", {
            connectionId,
            error: error.message
        });
        return false;
    }
}
async function checkAndRefreshToken(provider, credentials) {
    let updatedCredentials = {
        ...credentials
    };
    // Check regular token expiry. Use the provider-specific lead time so rotating-
    // token providers (Codex/OpenAI) refresh FAR ahead of access_token expiry. This
    // keeps the refresh_token "warm" — refreshed regularly enough that Auth0 doesn't
    // mark it as stale and revoke the token family on first use after long idle.
    if (updatedCredentials.expiresAt) {
        const expiresAt = new Date(updatedCredentials.expiresAt).getTime();
        const now = Date.now();
        const refreshLead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRefreshLeadMs"])(provider, updatedCredentials.providerSpecificData);
        if (expiresAt - now < refreshLead) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("TOKEN_REFRESH", "Token expiring soon, refreshing proactively", {
                provider,
                expiresIn: Math.round((expiresAt - now) / 1000),
                refreshLeadMs: refreshLead
            });
            const connectionId = updatedCredentials.connectionId;
            // Pass onPersist so the DB write happens INSIDE the open-sse per-connection
            // mutex, making [network call + DB write] one atomic step. This eliminates the
            // race where a concurrent request reads stale DB credentials before the write
            // and re-uses a rotated refresh token (refresh_token_reused on Codex/OpenAI).
            // The separate withConnectionRefreshMutex wrapper is no longer needed here.
            const persistCallback = connectionId ? async (result)=>{
                await updateProviderCredentials(connectionId, result);
            } : undefined;
            const newCredentials = await getAccessToken(provider, updatedCredentials, persistCallback);
            if (newCredentials && newCredentials.accessToken) {
                // For the no-connectionId path (no mutex, no onPersist), persist here as before.
                if (!connectionId) {
                    await updateProviderCredentials(updatedCredentials.connectionId, newCredentials);
                }
                updatedCredentials = {
                    ...updatedCredentials,
                    accessToken: newCredentials.accessToken,
                    refreshToken: newCredentials.refreshToken || updatedCredentials.refreshToken,
                    expiresAt: newCredentials.expiresAt ? newCredentials.expiresAt : newCredentials.expiresIn ? new Date(Date.now() + newCredentials.expiresIn * 1000).toISOString() : updatedCredentials.expiresAt
                };
            }
        }
    }
    // Check GitHub/GHE Copilot token expiry. Both github.com Copilot and GHE
    // Copilot (device-code flow against an enterprise host) issue a short-lived
    // sub-token separate from the OAuth access token, stored the same way in
    // providerSpecificData.copilotTokenExpiresAt — only the token endpoint host
    // differs (resolveCopilotTokenBaseUrl picks it via providerSpecificData.gheUrl).
    if ((provider === "github" || provider === "ghe-copilot") && updatedCredentials.providerSpecificData?.copilotTokenExpiresAt) {
        const copilotExpiresAt = updatedCredentials.providerSpecificData.copilotTokenExpiresAt * 1000;
        const now = Date.now();
        if (copilotExpiresAt - now < TOKEN_EXPIRY_BUFFER_MS) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("TOKEN_REFRESH", "Copilot token expiring soon, refreshing proactively", {
                provider,
                expiresIn: Math.round((copilotExpiresAt - now) / 1000)
            });
            const copilotToken = await refreshCopilotToken(updatedCredentials.accessToken, updatedCredentials, resolveCopilotTokenBaseUrl(provider, updatedCredentials));
            if (copilotToken) {
                await updateProviderCredentials(updatedCredentials.connectionId, {
                    providerSpecificData: {
                        ...updatedCredentials.providerSpecificData,
                        copilotToken: copilotToken.token,
                        copilotTokenExpiresAt: copilotToken.expiresAt
                    }
                });
                updatedCredentials.providerSpecificData = {
                    ...updatedCredentials.providerSpecificData,
                    copilotToken: copilotToken.token,
                    copilotTokenExpiresAt: copilotToken.expiresAt
                };
                // Sync to top-level so buildHeaders() picks up the fresh token
                updatedCredentials.copilotToken = copilotToken.token;
            }
        }
    }
    return updatedCredentials;
}
async function refreshGitHubAndCopilotTokens(credentials) {
    const newGitHubCredentials = await refreshGitHubToken(credentials.refreshToken, credentials);
    if (newGitHubCredentials?.accessToken) {
        const copilotToken = await refreshCopilotToken(newGitHubCredentials.accessToken, credentials);
        if (copilotToken) {
            return {
                ...newGitHubCredentials,
                providerSpecificData: {
                    copilotToken: copilotToken.token,
                    copilotTokenExpiresAt: copilotToken.expiresAt
                }
            };
        }
    }
    return newGitHubCredentials;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/handlers/chatHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "STREAM_EARLY_EOF_MAX_RETRIES",
    ()=>STREAM_EARLY_EOF_MAX_RETRIES,
    "applyExecutorProxyToInfo",
    ()=>applyExecutorProxyToInfo,
    "checkPipelineGates",
    ()=>checkPipelineGates,
    "checkResourcePressureBeforeProviderWork",
    ()=>checkResourcePressureBeforeProviderWork,
    "decideProxyResolutionFailure",
    ()=>decideProxyResolutionFailure,
    "executeChatWithBreaker",
    ()=>executeChatWithBreaker,
    "handleNoCredentials",
    ()=>handleNoCredentials,
    "resolveModelOrError",
    ()=>resolveModelOrError,
    "safeLogEvents",
    ()=>safeLogEvents,
    "safeResolveProxy",
    ()=>safeResolveProxy,
    "shouldRetryStreamEarlyEof",
    ()=>shouldRetryStreamEarlyEof,
    "withCorrelationId",
    ()=>withCorrelationId,
    "withSelectedConnectionHeader",
    ()=>withSelectedConnectionHeader,
    "withSessionHeader",
    ()=>withSessionHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/model.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/builtinCatalog.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/tokenRefresh.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/resourcePressure.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$guards$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/guards.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/classify429.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerHints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/proxyLogger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translatorEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/translatorEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Models that explicitly cannot run on the codex/ChatGPT-Pro OAuth pool — when
// a caller writes `codex/deepseek-v4-pro` we transparently reroute to the
// canonical provider whose API key is configured. Saves callers from having
// to know about the OAuth-vs-API-key split.
const NON_OAUTH_MODEL_PREFIX = /^(deepseek|qwen|kimi|glm|minimax|mimo)/i;
const PREFERRED_BY_FAMILY = {
    deepseek: "deepseek",
    qwen: "bailian",
    kimi: "moonshot",
    glm: "zhipu",
    minimax: "minimax",
    mimo: "moonshot"
};
const CODEX_NATIVE_RESPONSES_MODELS = new Set([
    "gpt-5.5"
]);
function getHeaderValue(headers, name) {
    if (!headers || typeof headers !== "object") return "";
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)){
        if (key.toLowerCase() !== lowerName) continue;
        return Array.isArray(value) ? value.join(",") : String(value ?? "");
    }
    return "";
}
function isCodexNativeResponsesRequest(body, endpointPath, headers) {
    const normalizedEndpoint = String(endpointPath || "").replace(/\/+$/, "");
    if (!/(^|\/)responses(?=\/|$)/i.test(normalizedEndpoint)) return false;
    if (/\/responses\/compact$/i.test(normalizedEndpoint)) return true;
    const userAgent = getHeaderValue(headers, "user-agent").toLowerCase();
    if (userAgent.includes("codex")) return true;
    if (getHeaderValue(headers, "x-codex-session-id")) return true;
    if (getHeaderValue(headers, "x-codex-window-id")) return true;
    if (getHeaderValue(headers, "x-codex-turn-metadata")) return true;
    const metadataSource = body && typeof body === "object" && body.metadata && typeof body.metadata === "object" ? String(body.metadata.source || "") : "";
    return metadataSource.toLowerCase().includes("codex");
}
async function hasOnlyActiveCodexAccount() {
    try {
        const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
        const connections = await getProviderConnections({
            isActive: true
        });
        const providers = new Set(connections.map((connection)=>String(connection?.provider || "").trim()).filter(Boolean));
        return providers.size === 1 && providers.has("codex");
    } catch  {
        return false;
    }
}
async function resolveModelOrError(modelStr, body, endpointPath = "", requestHeaders = null) {
    const modelInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelInfo"])(modelStr);
    const sourceFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectFormatFromEndpoint"])(body, endpointPath);
    if (modelInfo.provider === "openai" && typeof modelInfo.model === "string" && CODEX_NATIVE_RESPONSES_MODELS.has(modelInfo.model) && sourceFormat === "openai-responses" && isCodexNativeResponsesRequest(body, endpointPath, requestHeaders)) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `${modelStr} → codex/${modelInfo.model} (Codex native responses)`);
        modelInfo.provider = "codex";
    }
    if (modelInfo.provider === "openai" && modelInfo.model === "gpt-5.5" && sourceFormat === "openai-responses" && !isCodexNativeResponsesRequest(body, endpointPath, requestHeaders) && await hasOnlyActiveCodexAccount()) {
        // #2877: keep the bare model id (do NOT bake a `-medium` suffix). The Codex
        // executor reads a model-name suffix as an explicit `modelEffort` that (per
        // #2331) overrides the client's `reasoning.effort`, so injecting `-medium`
        // here silently demoted a genuine `reasoning.effort=xhigh`. The default
        // effort still comes from the connection fallback when the client sends none.
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `${modelStr} → codex/gpt-5.5 (Codex-only active account)`);
        modelInfo.provider = "codex";
        modelInfo.model = "gpt-5.5";
    }
    // Forced-rewrite: codex provider doesn't serve DeepSeek/Qwen/Kimi/etc. Reroute
    // these to their canonical native provider so the request lands on the right
    // upstream API key instead of failing with a 400 on the OAuth account.
    // Ambiguous candidates (e.g. deepseek-v4-pro lives on both ds + opencode-go)
    // resolve to the model-family's native provider via NON_OAUTH_PROVIDER_BY_FAMILY.
    if (modelInfo.provider === "codex" && typeof modelInfo.model === "string" && NON_OAUTH_MODEL_PREFIX.test(modelInfo.model)) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `codex/${modelInfo.model} → re-resolving via native provider (codex OAuth does not serve this model)`);
        const rerouted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelInfo"])(modelInfo.model);
        if (rerouted.provider && rerouted.provider !== "codex") {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `codex/${modelInfo.model} → ${rerouted.provider}/${rerouted.model}`);
            Object.assign(modelInfo, rerouted);
        } else if (rerouted.errorType === "ambiguous_model") {
            const candidates = rerouted.candidateProviders || [];
            const family = modelInfo.model.match(NON_OAUTH_MODEL_PREFIX)?.[1]?.toLowerCase();
            const pick = family && PREFERRED_BY_FAMILY[family];
            if (pick && candidates.includes(pick)) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `codex/${modelInfo.model} → ${pick}/${modelInfo.model} (ambiguity resolved by family)`);
                modelInfo.provider = pick;
                modelInfo.model = rerouted.model;
            }
        }
    }
    // "auto" is a built-in virtual combo prefix, not a provider. parseModel("auto/fast")
    // splits it into provider="auto" model="fast", so resolve it before credential lookup.
    if (modelInfo.provider === "auto") {
        const suffix = modelInfo.model || "";
        const fuzzyCandidates = [
            `auto/best-${suffix}`,
            `auto/${suffix}`
        ];
        const exactCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboForModel"])(modelStr);
        if (exactCombo) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `"auto" provider → combo "${modelStr}"`);
            return {
                combo: exactCombo,
                provider: "auto",
                model: suffix
            };
        }
        // Preserve persisted fuzzy combo behavior before falling back to built-in virtual catalog ids.
        for (const candidate of fuzzyCandidates){
            const fuzzyCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboForModel"])(candidate);
            if (fuzzyCombo) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `"auto/${suffix}" → combo "${candidate}" (fuzzy)`);
                return {
                    combo: fuzzyCombo,
                    provider: "auto",
                    model: suffix
                };
            }
        }
        try {
            const virtualCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createBuiltinAutoCombo"])(modelStr, suffix);
            const poolSize = virtualCombo.candidatePool?.length || 0;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTO", `"auto" provider → built-in virtual combo "${modelStr}" (${poolSize} candidates)`);
            // #6458: fail fast instead of leaking a silent 15s upstream timeout when
            // the category/tier filter (e.g. auto/coding:pro, auto/reasoning) matches
            // zero connected candidates. An empty virtual combo has no targets to
            // dispatch to, so downstream combo routing stalls on an empty set.
            if (poolSize === 0) {
                const msg = `No connected providers match '${modelStr}'. Connect a provider whose models satisfy this category/tier, or use a different auto combo.`;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("AUTO", msg, {
                    model: modelStr
                });
                return {
                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE, msg)
                };
            }
            return {
                combo: virtualCombo,
                provider: "auto",
                model: suffix
            };
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", `Failed to create built-in auto combo "${modelStr}"`, {
                err
            });
        }
        // Fuzzy: "fast" → "auto/best-fast", "chat" → "auto/best-chat"
        for (const candidate of fuzzyCandidates){
            try {
                const virtualCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createBuiltinAutoCombo"])(candidate, candidate.replace(/^auto\/?/, ""));
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTO", `"auto/${suffix}" → built-in virtual combo "${candidate}" (fuzzy, ${virtualCombo.candidatePool?.length || 0} candidates)`);
                return {
                    combo: virtualCombo,
                    provider: "auto",
                    model: suffix
                };
            } catch  {
            /* Try next fuzzy candidate */ }
        }
        const message = `Model '${modelStr}' is not a valid combo or provider. Unknown built-in auto combo.`;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", message, {
            model: modelStr
        });
        return {
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, message)
        };
    }
    if (!modelInfo.provider) {
        // model_not_found: raised by resolveModelByProviderInference when no
        // provider could be inferred — return a clear error instead of the
        // misleading "openai" default that the old code silently fell back to.
        if (modelInfo.errorType === "model_not_found") {
            const message = modelInfo.errorMessage || `Model '${modelStr}' could not be resolved to a known provider.`;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", message, {
                model: modelStr
            });
            return {
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, message)
            };
        }
        if (modelInfo.errorType === "ambiguous_model") {
            // Family disambiguation: if the model name begins with a known
            // non-OAuth family prefix, auto-pick the family-native provider
            // from the candidate set instead of returning a 400. Saves callers
            // (codex CLI, hermes, etc.) from having to guess the right alias.
            const candidates = modelInfo.candidateProviders || [];
            const modelLower = (modelInfo.model || modelStr).toLowerCase();
            const family = modelLower.match(NON_OAUTH_MODEL_PREFIX)?.[1];
            const pick = family && PREFERRED_BY_FAMILY[family];
            if (pick && candidates.includes(pick)) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `${modelStr} → ${pick}/${modelInfo.model} (ambiguity auto-resolved by family)`);
                modelInfo.provider = pick;
            } else {
                const message = modelInfo.errorMessage || `Ambiguous model '${modelStr}'. Use provider/model prefix (ex: gh/${modelStr} or cc/${modelStr}).`;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", message, {
                    model: modelStr,
                    candidates: modelInfo.candidateAliases || modelInfo.candidateProviders || []
                });
                return {
                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, message)
                };
            }
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", "Invalid model format", {
                model: modelStr
            });
            return {
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "Invalid model format")
            };
        }
    }
    const { provider, model, extendedContext } = modelInfo;
    // apiFormat: optional custom-model marker — see chatCore.ts for shape narrowing rationale.
    const apiFormat = modelInfo && typeof modelInfo === "object" && "apiFormat" in modelInfo ? typeof modelInfo.apiFormat === "string" ? modelInfo.apiFormat : undefined : undefined;
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
    let targetFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelTargetFormat"])(providerAlias, model) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTargetFormat"])(provider);
    if (apiFormat === "responses") {
        targetFormat = "openai-responses";
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `Custom model apiFormat=responses → targetFormat=openai-responses`);
    }
    const ctxTag = extendedContext && providerAlias === "claude" ? " [1m]" : "";
    if (modelStr !== `${provider}/${model}`) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `${modelStr} → ${provider}/${model}${ctxTag}`);
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("ROUTING", `Provider: ${provider}, Model: ${model}${ctxTag}`);
    }
    return {
        provider,
        model,
        sourceFormat,
        targetFormat,
        extendedContext,
        apiFormat
    };
}
async function checkPipelineGates(provider, model, options = {}) {
    const bypassReason = options.bypassReason || "pipeline override";
    const providerProfile = options.providerProfile ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRuntimeProviderProfile"])(provider);
    // Issue #2100 follow-up: opt-in upstream 429 hint trust per provider.
    const useHints429 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUseUpstream429BreakerHints"])(provider, providerProfile.useUpstream429BreakerHints);
    const breaker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider, {
        failureThreshold: providerProfile.failureThreshold ?? providerProfile.circuitBreakerThreshold,
        degradationThreshold: providerProfile.degradationThreshold,
        resetTimeout: providerProfile.resetTimeoutMs ?? providerProfile.circuitBreakerReset,
        // #4602: a local WS-bridge "Controller is already closed" throw is not an
        // upstream outage — keep it from tripping the whole-provider breaker.
        isFailure: (e)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(e),
        onStateChange: (name, from, to)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("CIRCUIT", `${name}: ${from} → ${to}`),
        ...useHints429 ? {
            cooldownByKind: {
                rate_limit: 60_000,
                quota_exhausted: 3_600_000
            },
            classifyError: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classify429FromError"]
        } : {}
    });
    if (options.ignoreCircuitBreaker && !breaker.canExecute()) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("CIRCUIT", `Bypassing OPEN circuit breaker for ${provider} (${bypassReason})`);
    } else if (!breaker.canExecute()) {
        const retryAfterMs = breaker.getRetryAfterMs();
        const retryAfterSec = Math.max(Math.ceil(retryAfterMs / 1000), 1);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CIRCUIT", `Circuit breaker OPEN for ${provider}, rejecting request`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerCircuitOpenResponse"])(provider, retryAfterSec);
    }
    return null;
}
function checkResourcePressureBeforeProviderWork() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkResourcePressureGuard"])();
    } catch  {
        return null;
    }
}
async function executeChatWithBreaker({ bypassCircuitBreaker, breaker, body, provider, model, refreshedCredentials, proxyInfo, appliedProxySink, log: handlerLog, clientRawRequest, credentials, apiKeyInfo, userAgent, comboName, comboStrategy, isCombo, comboStepId, comboExecutionKey, extendedContext, modelApiFormat, providerProfile, cachedSettings, skipUpstreamRetry = false, trafficType = "production", correlationId = null, modelPinned = false, routingComboId = null }) {
    let tlsFingerprintUsed = false;
    const normalizedTrafficType = typeof trafficType === "string" && trafficType.trim().toLowerCase() === "shadow" ? "shadow" : "production";
    const isShadowTraffic = normalizedTrafficType === "shadow";
    // #5217: capture the proxy actually applied during execution so the caller can
    // merge it into proxyInfo before the egress log (executors pinning a per-account
    // proxy internally otherwise leave the egress log reading "direct").
    const capture = (fn)=>appliedProxySink ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithAppliedProxyCapture"])(appliedProxySink, fn) : fn();
    const pressureGuard = checkResourcePressureBeforeProviderWork();
    if (pressureGuard) {
        return {
            localResourcePressureResult: pressureGuard,
            tlsFingerprintUsed: false
        };
    }
    try {
        const chatFn = ()=>capture(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["handleChatCore"]({
                        body: {
                            ...body,
                            model: `${provider}/${model}`
                        },
                        modelInfo: {
                            provider,
                            model,
                            extendedContext,
                            apiFormat: modelApiFormat
                        },
                        credentials: refreshedCredentials,
                        log: handlerLog,
                        clientRawRequest,
                        connectionId: credentials.connectionId,
                        apiKeyInfo,
                        userAgent,
                        comboName,
                        comboStrategy,
                        isCombo,
                        comboStepId,
                        comboExecutionKey,
                        cachedSettings,
                        skipUpstreamRetry,
                        trafficType: normalizedTrafficType,
                        correlationId,
                        modelPinned,
                        routingComboId,
                        skipResourcePressureGuard: true,
                        onCredentialsRefreshed: async (newCreds)=>{
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateProviderCredentials"])(credentials.connectionId, {
                                accessToken: newCreds.accessToken,
                                refreshToken: newCreds.refreshToken,
                                expiresIn: newCreds.expiresIn,
                                expiresAt: newCreds.expiresAt,
                                providerSpecificData: newCreds.providerSpecificData,
                                // Cookie/session providers (chatgpt-web) rotate the stored
                                // apiKey blob mid-request — forward it so the DB credential
                                // doesn't go stale after Set-Cookie rotation.
                                apiKey: newCreds.apiKey,
                                testStatus: newCreds.testStatus ?? "active",
                                isActive: newCreds.isActive
                            });
                        },
                        onRequestSuccess: async ()=>{
                            if (isShadowTraffic) return;
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearAccountError"])(credentials.connectionId, credentials);
                        },
                        onStreamFailure: async (failure)=>{
                            if (isShadowTraffic) return;
                            if (!credentials.connectionId) return;
                            if (Number(failure?.status) === 499 || failure?.code === "client_disconnected" || failure?.type === "client_disconnected" || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(failure?.message ?? failure) // client abort, #4602
                            ) {
                                return;
                            }
                            // A3 guard: if 401 and connection has extra keys, skip connection-level disable
                            // (key-level failure already recorded in chatCore.ts via T07)
                            // Check extra keys directly from credentials for reliability across restarts
                            const extraKeys = credentials.providerSpecificData?.extraApiKeys ?? [];
                            const hasExtraKeys = extraKeys.length > 0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["connectionHasExtraKeys"])(credentials.connectionId);
                            const is401 = Number(failure?.status) === 401;
                            if (is401 && hasExtraKeys) {
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["debug"]("AUTH", `A3 guard: skipping markAccountUnavailable for 401 with extra keys on ${credentials.connectionId.slice(0, 8)}`);
                                return;
                            }
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["markAccountUnavailable"])(credentials.connectionId, Number(failure?.status || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY), String(failure?.message || failure?.code || "stream failure"), provider, model, providerProfile, {
                                isCombo
                            });
                        }
                    })));
        if (isShadowTraffic) {
            if (!bypassCircuitBreaker && breaker && !breaker.canExecute()) {
                const retryAfterMs = breaker.getRetryAfterMs();
                return {
                    result: {
                        success: false,
                        response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerCircuitOpenResponse"])(provider, Math.ceil(retryAfterMs / 1000)),
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE
                    },
                    tlsFingerprintUsed: false
                };
            }
            if (!proxyInfo?.proxy && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTlsFingerprintActive"])()) {
                const tracked = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithTlsTracking"])(chatFn);
                return {
                    result: tracked.result,
                    tlsFingerprintUsed: tracked.tlsFingerprintUsed
                };
            }
            const result = await chatFn();
            return {
                result,
                tlsFingerprintUsed: false
            };
        }
        if (bypassCircuitBreaker) {
            if (!proxyInfo?.proxy && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTlsFingerprintActive"])()) {
                const tracked = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithTlsTracking"])(chatFn);
                return {
                    result: tracked.result,
                    tlsFingerprintUsed: tracked.tlsFingerprintUsed
                };
            }
            const result = await chatFn();
            return {
                result,
                tlsFingerprintUsed: false
            };
        }
        if (!proxyInfo?.proxy && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTlsFingerprintActive"])()) {
            const tracked = await breaker.execute(async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithTlsTracking"])(chatFn));
            return {
                result: tracked.result,
                tlsFingerprintUsed: tracked.tlsFingerprintUsed
            };
        }
        const result = await breaker.execute(chatFn);
        return {
            result,
            tlsFingerprintUsed: false
        };
    } catch (cbErr) {
        if (cbErr instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CircuitBreakerOpenError"]) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CIRCUIT", `${provider} circuit open during retry: ${cbErr.message}`);
            return {
                result: {
                    success: false,
                    response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerCircuitOpenResponse"])(provider, Math.ceil(cbErr.retryAfterMs / 1000)),
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE
                },
                tlsFingerprintUsed: false
            };
        }
        if (cbErr?.code === "PROXY_UNREACHABLE" || /proxy unreachable/i.test(cbErr?.message || "")) {
            const detail = cbErr?.message || "Proxy unreachable";
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("PROXY", detail);
            return {
                result: {
                    success: false,
                    response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unavailableResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE, detail, 2),
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE,
                    error: detail
                },
                tlsFingerprintUsed: false
            };
        }
        throw cbErr;
    }
}
function handleNoCredentials(credentials, excludeConnectionId, provider, model, lastError, lastStatus, candidateAliases) {
    if (credentials?.allRateLimited) {
        const errorMsg = lastError || credentials.lastError || "Unavailable";
        const status = lastStatus || Number(credentials.lastErrorCode) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE;
        const cooldownModel = typeof credentials.cooldownModel === "string" && credentials.cooldownModel.trim().length > 0 ? credentials.cooldownModel.trim() : model;
        if (credentials.cooldownScope === "model" && Number(status) === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", `[${provider}/${cooldownModel}] all credentials cooling down${credentials.retryAfterHuman ? ` (${credentials.retryAfterHuman})` : ""}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modelCooldownResponse"])({
                model: cooldownModel,
                retryAfter: credentials.retryAfter,
                retryAfterAt: typeof credentials.retryAfter === "string" ? credentials.retryAfter : null,
                credentialsCoolingCount: typeof credentials.connectionsCount === "number" ? credentials.connectionsCount : null
            });
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", `[${provider}/${model}] ${errorMsg} (${credentials.retryAfterHuman})`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unavailableResponse"])(status, `[${provider}/${model}] ${errorMsg}`, credentials.retryAfter, credentials.retryAfterHuman);
    }
    if (credentials?.allExpired) {
        // Every connection for this provider is in a terminal state (expired,
        // banned, or credits_exhausted). Surface as 401 with a re-auth hint
        // instead of the generic 400 "No credentials", so dashboards/CLIs can
        // distinguish "never configured" from "needs to reconnect".
        const status = credentials.expiredStatus || "expired";
        const count = credentials.expiredCount || 1;
        const reason = status === "credits_exhausted" ? "credits exhausted" : status === "banned" ? "banned by upstream" : "authentication expired";
        const message = `[${provider}] All ${count} connection(s) ${reason} — please reconnect in the dashboard`;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", message);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].UNAUTHORIZED, message);
    }
    if (lastError && lastStatus) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", "Preserving last upstream error after credential exhaustion", {
            provider,
            model,
            lastStatus
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(lastStatus, lastError);
    }
    if (!excludeConnectionId) {
        // Ported from upstream decolua/9router#336 (Ibrahim Ryan): surface as 404
        // NOT_FOUND instead of 400 BAD_REQUEST so combo routing can fall through to
        // the next target. The combo target loop (open-sse/services/combo.ts) treats
        // 400 as a hard stop to break body-specific infinite fallback loops
        // (PR #4316 / issue #4279). 404 flows through checkFallbackError as
        // `shouldFallback: true` (generic-error catch-all path in
        // open-sse/services/accountFallback.ts), letting a combo like
        // `antigravity/opus → github/opus` skip a provider whose credentials are
        // all disabled. log level is `warn` rather than `error` because zero active
        // credentials is an expected operator-driven state, not a server fault.
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("AUTH", `No active credentials for provider: ${provider}`);
        // #FIX: surface the candidate aliases (from resolveModelOrError) so the
        // operator can pick a working provider/model prefix instead of guessing.
        // Without this, "No active credentials for provider: kiro" leaves the
        // user staring at a wall — most bugs in this area are actually "wrong
        // provider was picked", not "the provider is broken".
        const hint = Array.isArray(candidateAliases) && candidateAliases.length > 0 ? ` Try one of: ${candidateAliases.slice(0, 3).map((a)=>`${a}/${model}`).join(", ")}.` : "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].NOT_FOUND, `No active credentials for provider: ${provider}.${hint}`);
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("CHAT", "No more accounts available", {
        provider
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(lastStatus || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE, lastError || "All accounts unavailable");
}
const STREAM_EARLY_EOF_MAX_RETRIES = 1;
function shouldRetryStreamEarlyEof(errorCode, attempt) {
    return errorCode === "STREAM_EARLY_EOF" && attempt < STREAM_EARLY_EOF_MAX_RETRIES;
}
function decideProxyResolutionFailure(err, env = process.env) {
    if ((env.PROXY_FAIL_OPEN ?? "").trim().toLowerCase() === "true") {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("PROXY", `Proxy resolution failed — PROXY_FAIL_OPEN=true, falling back to DIRECT: ${err instanceof Error ? err.message : String(err)}`);
        return null;
    }
    throw err instanceof Error ? err : new Error(String(err));
}
async function safeResolveProxy(connectionId, apiKeyId, providerId) {
    try {
        const resolved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionId, apiKeyId, providerId);
        // #6246: a connection that resolves to DIRECT only because its assigned proxy
        // is dead/inactive must fail closed — egressing on the real IP leaks it. Reuse
        // the existing proxy-resolution-failure policy (blocks by default; PROXY_FAIL_OPEN
        // opts back into direct). Explicit "proxy off" is not a leak (see the guard).
        if (!resolved?.proxy && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$guards$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasBlockingProxyAssignment"])(connectionId, providerId)) {
            return decideProxyResolutionFailure(Object.assign(new Error("PROXY_ASSIGNED_UNAVAILABLE: assigned proxy is inactive/unreachable; refusing to egress on a direct connection"), {
                code: "PROXY_ASSIGNED_UNAVAILABLE"
            }));
        }
        return resolved;
    } catch (proxyErr) {
        return decideProxyResolutionFailure(proxyErr);
    }
}
function applyExecutorProxyToInfo(proxyInfo, appliedProxy) {
    if (!appliedProxy) return proxyInfo;
    const priorLevel = proxyInfo?.level;
    return {
        ...proxyInfo || {},
        proxy: appliedProxy,
        level: priorLevel && priorLevel !== "direct" ? priorLevel : "account"
    };
}
async function safeLogEvents({ result, proxyInfo, proxyLatency, provider, model, sourceFormat, targetFormat, credentials, comboName, clientRawRequest, tlsFingerprintUsed = false }) {
    try {
        const rawIp = clientRawRequest?.headers?.["x-forwarded-for"] || clientRawRequest?.headers?.["x-real-ip"] || clientRawRequest?.headers?.["cf-connecting-ip"] || null;
        const rawIpValue = Array.isArray(rawIp) ? rawIp[0] : rawIp;
        const clientIp = typeof rawIpValue === "string" ? rawIpValue.split(",")[0].trim() : null;
        // Resolve the egress IP (the IP the upstream actually saw) from cache — never
        // blocking the request. Warm it in the background for next time. null until
        // the first warm completes; direct (no proxy) is also tracked.
        let egressIp = null;
        try {
            const { getCachedEgressIp, warmEgressIp } = await __turbopack_context__.A("[project]/src/lib/proxyEgress.ts [instrumentation] (ecmascript, async loader)");
            const { proxyConfigToUrl } = await __turbopack_context__.A("[project]/open-sse/utils/proxyDispatcher.ts [instrumentation] (ecmascript, async loader)");
            const proxyUrl = proxyInfo?.proxy ? proxyConfigToUrl(proxyInfo.proxy) : null;
            egressIp = getCachedEgressIp(proxyUrl);
            warmEgressIp(proxyUrl);
        } catch  {
        // egress visibility is best-effort; never break the request path
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logProxyEvent"])({
            status: result.success ? "success" : result.status === 408 || result.status === 504 ? "timeout" : "error",
            proxy: proxyInfo?.proxy || null,
            level: proxyInfo?.level || "direct",
            levelId: proxyInfo?.levelId || null,
            provider,
            targetUrl: `${provider}/${model}`,
            clientIp,
            egressIp,
            latencyMs: proxyLatency,
            error: result.success ? null : result.error || null,
            connectionId: credentials.connectionId,
            comboId: comboName || null,
            account: credentials.connectionId?.slice(0, 8) || null,
            tlsFingerprint: tlsFingerprintUsed
        });
    } catch  {}
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translatorEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logTranslationEvent"])({
            provider,
            model,
            sourceFormat,
            targetFormat,
            status: result.success ? "success" : "error",
            statusCode: result.success ? 200 : result.status || 500,
            latency: proxyLatency,
            endpoint: clientRawRequest?.endpoint || "/v1/chat/completions",
            connectionId: credentials.connectionId || null,
            comboName: comboName || null
        });
    } catch  {}
}
function withSessionHeader(response, sessionId) {
    if (!response || !sessionId) return response;
    try {
        response.headers.set("X-OmniRoute-Session-Id", sessionId);
        return response;
    } catch  {
        const cloned = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
        cloned.headers.set("X-OmniRoute-Session-Id", sessionId);
        return cloned;
    }
}
function withCorrelationId(response, correlationId) {
    if (!response || !correlationId) return response;
    try {
        response.headers.set("X-Correlation-Id", correlationId);
        return response;
    } catch  {
        const cloned = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
        cloned.headers.set("X-Correlation-Id", correlationId);
        return cloned;
    }
}
function withSelectedConnectionHeader(response, connectionId) {
    if (!response || !connectionId) return response;
    try {
        response.headers.set("X-OmniRoute-Selected-Connection-Id", connectionId);
        return response;
    } catch  {
        const cloned = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
        cloned.headers.set("X-OmniRoute-Selected-Connection-Id", connectionId);
        return cloned;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/handlers/comboFailureLogging.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getComboFailureLogError",
    ()=>getComboFailureLogError
]);
// Re-exported here (rather than a separate import line in chat.ts, a frozen
// file-size chokepoint — see config/quality/file-size-baseline.json) so both
// combo-failure-handling helpers chat.ts needs share a single import line.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function getComboFailureLogError(response, comboName) {
    const fallback = `[${response.status}] Combo "${comboName}" failed`;
    try {
        const body = await response.clone().json();
        const message = body?.error?.message;
        return typeof message === "string" && message.trim() ? `[${response.status}] ${message.trim()}` : fallback;
    } catch  {
        return fallback;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/handlers/chatPredicates.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PROVIDER_BREAKER_FAILURE_STATUSES",
    ()=>PROVIDER_BREAKER_FAILURE_STATUSES,
    "isAntigravityMissingProjectError",
    ()=>isAntigravityMissingProjectError,
    "resolveStreamReadinessClassificationError",
    ()=>resolveStreamReadinessClassificationError,
    "shouldTripProviderBreakerForResult",
    ()=>shouldTripProviderBreakerForResult
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/handlers/comboFailureLogging.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const PROVIDER_BREAKER_FAILURE_STATUSES = new Set([
    408,
    500,
    502,
    503,
    504
]);
function shouldTripProviderBreakerForResult(result, isCombo, forceLiveComboTest) {
    return !forceLiveComboTest && !isCombo && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRequestScopedUpstreamFailure"])({
        code: result.errorCode,
        type: result.errorType
    }) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(result.error) && PROVIDER_BREAKER_FAILURE_STATUSES.has(Number(result.status));
}
function isAntigravityMissingProjectError(provider, result) {
    return provider === "antigravity" && result.status === 422 && result.errorCode === "missing_project_id" && result.errorType === "oauth_missing_project_id";
}
function resolveStreamReadinessClassificationError(result, fallback = "Antigravity stream ended before useful content") {
    for (const value of [
        result.classificationError,
        result.error,
        result.errorCode
    ]){
        if (typeof value === "string" && value.trim()) return value;
    }
    return fallback;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/handlers/reasoningRouting.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyConnectionReasoningRule",
    ()=>applyConnectionReasoningRule,
    "applyReasoningRouting",
    ()=>applyReasoningRouting,
    "filterReasoningCombo",
    ()=>filterReasoningCombo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/model.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/apiKeyPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoningRouting/policy.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
async function resolveDecision(input) {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveReasoningRoutingRule"])(input);
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("REASONING_ROUTE", "Failed to resolve reasoning routing policy", {
            error
        });
        return {
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "Reasoning routing policy could not be resolved")
        };
    }
}
function applyDecision(request, body, policy, apiKeyInfo, decision) {
    if (decision.capability === "unsupported" && !decision.targetCombo) {
        return {
            response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Reasoning effort '${decision.targetEffort}' is not supported by the configured target`)
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateApiKeyRoutingTarget"])(request, policy.apiKey, apiKeyInfo, decision.targetModel).then((rejection)=>{
        if (rejection) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("REASONING_ROUTE", `Rule ${decision.rule.id} target rejected by API key policy`);
            return {
                response: rejection
            };
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("REASONING_ROUTE", `Rule ${decision.rule.id}: ${decision.sourceModel}/${decision.sourceEffort} → ${decision.targetModel}/${decision.targetEffort || "inherit"}`);
        for (const warning of decision.warnings){
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("REASONING_ROUTE", `Rule ${decision.rule.id}: ${warning}`);
        }
        return {
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachReasoningRuleDirective"])(body, decision),
            modelStr: decision.targetModel,
            response: null
        };
    });
}
async function applyReasoningRouting({ request, body, modelStr, policy, apiKeyInfo, reasoningIntent }) {
    const stableReasoningIntent = reasoningIntent || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractReasoningIntent"])(modelStr, body);
    const requestedCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboForModel"])(stableReasoningIntent.model);
    let sourceAliases = [];
    if (!requestedCombo) {
        const sourceModels = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveReasoningSourceModels"])(stableReasoningIntent.model, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelInfo"]);
        stableReasoningIntent.model = sourceModels.normalized;
        sourceAliases = sourceModels.aliases;
    }
    const requestRoutingTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestRoutingTags"])(body);
    const decision = await resolveDecision({
        sourceModel: stableReasoningIntent.model,
        sourceModelAliases: sourceAliases,
        sourceEffort: stableReasoningIntent.sourceEffort,
        hasReasoningSignal: stableReasoningIntent.hasReasoningSignal,
        hasThinkingBudget: stableReasoningIntent.hasThinkingBudget,
        apiKeyId: apiKeyInfo?.id ?? null,
        comboId: typeof requestedCombo?.id === "string" ? requestedCombo.id : null,
        requestTags: requestRoutingTags.tags
    });
    // Guards are split rather than combined: `decision && "error" in decision`
    // only narrows its *true* branch, so the union kept the `{ error }` arm all
    // the way down and every later use of `decision` saw it.
    if (!decision) {
        return {
            body,
            modelStr,
            reasoningIntent: stableReasoningIntent,
            reasoningDecision: null,
            requestRoutingTags,
            response: null
        };
    }
    if ("error" in decision) {
        return {
            body,
            modelStr,
            reasoningIntent: stableReasoningIntent,
            reasoningDecision: null,
            requestRoutingTags,
            response: decision.error
        };
    }
    const applied = await applyDecision(request, body, policy, apiKeyInfo, decision);
    if (applied.response) {
        return {
            body,
            modelStr,
            reasoningIntent: stableReasoningIntent,
            reasoningDecision: decision,
            requestRoutingTags,
            response: applied.response
        };
    }
    return {
        body: applied.body,
        modelStr: applied.modelStr,
        reasoningIntent: stableReasoningIntent,
        reasoningDecision: decision,
        requestRoutingTags,
        response: null
    };
}
function filterReasoningCombo(combo, decision) {
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterComboForReasoningDecision"])(combo, decision);
    if (!filtered.combo) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "Reasoning routing policy leaves no compatible combo target");
    }
    if (filtered.removed.length > 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("REASONING_ROUTE", `Rule ${decision.rule.id} skipped ${filtered.removed.length} incompatible combo target(s)`);
    }
    return filtered.combo;
}
async function applyConnectionReasoningRule({ requestBody, provider, effectiveModel, credentials, apiKeyInfo, reasoningIntent, reasoningDecision, requestRoutingTags }) {
    if (reasoningDecision || !reasoningIntent) return {
        body: requestBody,
        response: null
    };
    const decision = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveReasoningRoutingRule"])({
        sourceModel: reasoningIntent.model,
        sourceEffort: reasoningIntent.sourceEffort,
        hasReasoningSignal: reasoningIntent.hasReasoningSignal,
        hasThinkingBudget: reasoningIntent.hasThinkingBudget,
        apiKeyId: apiKeyInfo?.id ?? null,
        connectionId: credentials.connectionId,
        requestTags: requestRoutingTags ?? [],
        connectionOnly: true,
        capabilityModel: `${provider}/${effectiveModel}`
    });
    if (!decision) return {
        body: requestBody,
        response: null
    };
    if (decision.capability === "unsupported") {
        return {
            body: requestBody,
            response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Reasoning effort '${decision.targetEffort}' is not supported by the selected connection model`)
        };
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("REASONING_ROUTE", `Connection rule ${decision.rule.id} applied to ${credentials.connectionId}`);
    return {
        body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachReasoningRuleDirective"])(requestBody, decision),
        response: null
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/handlers/autoRouting.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createVirtualAutoCombo",
    ()=>createVirtualAutoCombo,
    "resolveAutoRoutingState",
    ()=>resolveAutoRoutingState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/builtinCatalog.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/suffixComposition.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modelFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
function classifyAutoModel(model) {
    const recognizedBuiltInAuto = model === "auto" || Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AUTO_TEMPLATE_VARIANTS"], model);
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AUTO_TEMPLATE_VARIANTS"], model)) {
        return {
            variant: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AUTO_TEMPLATE_VARIANTS"][model],
            recognizedBuiltInAuto: true
        };
    }
    if (!model.startsWith("auto/")) return {
        recognizedBuiltInAuto
    };
    const suffix = model.slice(5);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["VALID_AUTO_VARIANTS"].has(suffix)) {
        return {
            recognizedBuiltInAuto: true
        };
    }
    const parsedSuffix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoSuffix"])(suffix);
    if (parsedSuffix.valid) {
        return {
            recognizedBuiltInAuto: true,
            spec: {
                category: parsedSuffix.category,
                tier: parsedSuffix.tier
            }
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isValidModelFamily"])(suffix)) {
        return {
            recognizedBuiltInAuto: true,
            spec: {
                family: suffix
            }
        };
    }
    return {
        recognizedBuiltInAuto
    };
}
async function applyAutoPrefix(model, state, settings) {
    try {
        const { parseAutoPrefix } = await __turbopack_context__.A("[project]/open-sse/services/autoCombo/autoPrefix.ts [instrumentation] (ecmascript, async loader)");
        const parsed = parseAutoPrefix(model);
        if (!parsed.valid) {
            if (!state.spec) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("AUTO", `Invalid auto prefix format: ${model}`);
            return state;
        }
        const variant = Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AUTO_TEMPLATE_VARIANTS"], model) ? state.variant : parsed.variant;
        const defaultVariant = model === "auto" && variant === undefined ? settings.autoRoutingDefaultVariant : undefined;
        const resolvedVariant = variant ?? defaultVariant;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTO", `Zero-config routing variant: ${resolvedVariant || "default"} (model=${model})`);
        return {
            variant: resolvedVariant,
            spec: state.spec
        };
    } catch (err) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("AUTO", "Failed to load auto-prefix parser", {
            err
        });
        return state;
    }
}
async function resolveAutoRoutingState(model) {
    const isAutoRouting = model === "auto" || model.startsWith("auto/");
    const classified = classifyAutoModel(model);
    if (!isAutoRouting) {
        return {
            model,
            ...classified,
            isAutoRouting,
            response: null
        };
    }
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])().catch(()=>({}));
    if (settings?.autoRoutingEnabled === false) {
        return {
            model,
            ...classified,
            isAutoRouting,
            response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "Auto routing is disabled. Enable it in Settings > Routing.")
        };
    }
    const resolved = await applyAutoPrefix(model, classified, settings);
    return {
        model,
        ...classified,
        ...resolved,
        isAutoRouting,
        response: null
    };
}
async function createVirtualAutoCombo(state, combo, apiKeyId) {
    if (!state.isAutoRouting || combo !== null) return combo;
    if (!state.recognizedBuiltInAuto) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Model '${state.model}' is not a valid combo or provider. Unknown built-in auto combo.`);
    }
    try {
        const { createVirtualAutoCombo: createVirtual } = await __turbopack_context__.A("[project]/open-sse/services/autoCombo/virtualFactory.ts [instrumentation] (ecmascript, async loader)");
        // #7819 (Level 2): scope candidate exclusions to this API key + the
        // requested auto channel (e.g. "auto/best-coding"). Omitted for any
        // caller that doesn't pass apiKeyId — routing stays unfiltered.
        const virtualCombo = await createVirtual(state.variant, state.spec, apiKeyId, state.model);
        virtualCombo.name = state.model;
        virtualCombo.id = state.model;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTO", `Virtual auto-combo created: ${virtualCombo.name} (${virtualCombo.candidatePool?.length || 0} candidates)`);
        return virtualCombo;
    } catch (err) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("AUTO", "Failed to create virtual auto-combo", {
            err
        });
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/utils/backpressure.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkConnectionCapacity",
    ()=>checkConnectionCapacity,
    "evalCapacity",
    ()=>evalCapacity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionManager.ts [instrumentation] (ecmascript)");
;
function evalCapacity(active, cap) {
    if (cap <= 0 || active < cap) {
        return {
            shouldReject: false
        };
    }
    const retryAfter = Math.max(1, Math.ceil(active / cap * 30));
    return {
        shouldReject: true,
        response: new Response(JSON.stringify({
            error: {
                message: `Server busy — ${active} active connections (limit ${cap}). Retry after ${retryAfter}s.`,
                type: "rate_limit",
                retry_after: retryAfter
            }
        }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfter),
                "X-RateLimit-Limit": String(cap),
                "X-RateLimit-Remaining": "0"
            }
        })
    };
}
/** Read cap from env on every call so tests can mutate process.env freely. */ function readCap() {
    const raw = parseInt(process.env.OMNI_MAX_CONCURRENT_CONNECTIONS ?? "0", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
}
function checkConnectionCapacity() {
    return evalCapacity((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getActiveSessionCount"])(), readCap());
}
}),
"[project]/src/sse/handlers/chat.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleChat",
    ()=>handleChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$requestBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/requestBody.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatAdmission$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/chatAdmission.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chat$2f$clientRawRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/chat/clientRawRequest.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/reasoning/effortStandardization.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$resolveRoutingModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/resolveRoutingModel.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/model.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$aiSdkCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/aiSdkCompat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$noThinkingAlias$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/noThinkingAlias.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ccDiscoveryAliasResolve$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ccDiscoveryAliasResolve.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/combo.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$requestControls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/requestControls.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextHandoff$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextHandoff.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/tokenRefresh.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/middleware/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/resilience/peerRouting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$autoPromote$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/autoPromote.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/modelLockoutSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/guardrails/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/chatHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/chatPredicates.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoningRouting/policy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$reasoningRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/reasoningRouting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$autoRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/handlers/autoRouting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/handlers/comboFailureLogging.ts [instrumentation] (ecmascript) <locals>");
// Pipeline integration — wired modules
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/classify429.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaTextCooldowns.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerHints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestTelemetry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/apiKeyPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/apiKeyPolicyScopes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$internalUsageCommand$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/internalUsageCommand.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/taskAwareRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/webSearchRouting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$emergencyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/emergencyFallback.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codexQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/bailianQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$crofUsageFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/crofUsageFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/deepseekQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/opencodeQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/grokQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$genericQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/genericQuotaFetcher.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTrackersBatch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaTrackersBatch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/cooldownAwareRetry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaKey.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$backpressure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/backpressure.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chat$2f$clientRawRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$reasoningRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$autoRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$crofUsageFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$genericQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTrackersBatch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chat$2f$clientRawRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$reasoningRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$autoRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$crofUsageFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$genericQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTrackersBatch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerCodexQuotaFetcher"])();
// Register Bailian Coding Plan quota fetcher at module load (once per server start).
// This hooks into the quotaPreflight + quotaMonitor systems so that combos
// can proactively switch accounts before quota is exhausted.
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerBailianCodingPlanQuotaFetcher"])();
// Register CrofAI usage fetcher (subscription requests + credits balance).
// Surfaces usable_requests + credits in the monitor and only blocks (preflight
// opt-in) when the active bucket reaches zero.
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$crofUsageFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerCrofUsageFetcher"])();
// Register DeepSeek balance quota fetcher.
// Hooks into quotaPreflight + quotaMonitor so combos can switch accounts before balance is exhausted.
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerDeepseekQuotaFetcher"])();
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerOpenrouterQuotaFetcher"])();
// Register OpenCode quota fetcher (opencode-go / opencode / opencode-zen).
// Surfaces the $12/5h, $30/wk, $60/mo windows in the limits page and enables
// quota-aware preflight switching between connections. (#2852)
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerOpencodeQuotaFetcher"])();
// Register Grok Web quota fetcher.
// Reads account-level OIDC tokens from ~/.grok/auth.json (the local Grok CLI
// login) to surface the weekly credit-usage percentage in the dashboard.
// This runs before registerGenericQuotaFetchers so the bespoke fetcher takes
// precedence over the generic path (which can't resolve grok OIDC auth from
// cookie-based connections).
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerGrokWebQuotaFetcher"])();
// Register the generic quota fetcher for every other provider that has a
// usage implementation in usage.ts but no bespoke preflight fetcher. This is
// what lets the per-window cutoff modal in Dashboard › Limits actually
// enforce thresholds for Claude / GLM / Cursor / etc., not just Codex.
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$genericQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerGenericQuotaFetchers"])();
let combosCachePromise = null;
let combosCacheTs = 0;
let combosCacheVersionSnapshot = -1;
const COMBOS_CACHE_TTL_MS = 10_000;
async function getCombosCachedForChat() {
    const now = Date.now();
    // Explicit non-null check: we intentionally cache and return the Promise
    // itself (to dedupe concurrent callers), so this is not a forgotten await.
    // The version check makes combo edits (create/update/delete/reorder) take
    // effect immediately instead of after the 10s TTL — otherwise a removed
    // target/model could keep being served as a "phantom" for up to 10s (#3147).
    if (combosCachePromise !== null && now - combosCacheTs < COMBOS_CACHE_TTL_MS && combosCacheVersionSnapshot === (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombosCacheVersion"])()) {
        return combosCachePromise;
    }
    combosCacheTs = now;
    combosCacheVersionSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombosCacheVersion"])();
    combosCachePromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombos"])().catch(()=>[]);
    return combosCachePromise;
}
function normalizeAllowedConnectionIds(value) {
    if (!Array.isArray(value)) return null;
    const ids = value.filter((entry)=>typeof entry === "string" && entry.trim().length > 0);
    return ids.length > 0 ? ids : null;
}
function intersectAllowedConnectionIds(primary, secondary) {
    const first = normalizeAllowedConnectionIds(primary);
    const second = normalizeAllowedConnectionIds(secondary);
    if (first && second) {
        return first.filter((id)=>second.includes(id));
    }
    return first || second || null;
}
const comboPromoteDeps = {
    updateCombo: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateCombo"],
    info: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info,
    warn: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn
};
;
async function handleChatImplementation(request, clientRawRequest = null, preParsedBody = null, correlationId, admissionContext) {
    const peerRejection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rejectPeerRequest"])(request?.headers, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"]);
    if (peerRejection) return peerRejection;
    // Pipeline: Start request telemetry
    const reqId = correlationId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])();
    const telemetry = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RequestTelemetry"](reqId);
    const backpressure = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$backpressure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkConnectionCapacity"])();
    if (backpressure.shouldReject) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("BACKPRESSURE", "Rejecting request: at connection limit");
        return backpressure.response;
    }
    let body;
    try {
        telemetry.startPhase("parse");
        body = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$requestBody$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveChatRequestBody"])(request, preParsedBody);
        telemetry.endPhase();
    } catch  {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", "Invalid JSON body");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "Invalid JSON body");
    }
    // Feature #6241: fold the canonical `effort` / `thinking` request params onto the
    // per-provider reasoning fields (reasoning_effort / reasoning.effort / thinking) that the
    // existing translators already consume. Done here — right after the body is first
    // resolved, before any reasoning field is read below — so it flows uniformly into every
    // downstream mapper (Anthropic / Gemini / xAI / Responses). An explicit client
    // reasoning_effort / reasoning / object-shaped thinking always wins (backward compatible).
    body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeReasoningRequest"])(body);
    const sourceFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectFormatFromUrl"])(body, request.url);
    // Early guard: an invalid `messages` field is rejected here with a clear
    // OmniRoute-level 400 before any routing or upstream call (#5110, #6402).
    // Without this guard, schema-invalid bodies fell through to model resolution
    // and surfaced as a misleading 404 `model_not_found` from chatHelpers.ts (#6402).
    // Cases covered:
    //   - present-but-non-array (null, number, string, object) → 400 (#6402)
    //   - empty array → 400 ("at least one message is required") (#5110)
    //   - missing entirely, when the Responses-API `input` discriminator is also
    //     absent → 400 (#6402). Responses-API requests use `input` (not `messages`),
    //     and Antigravity requests use a cloudcode `request` envelope.
    const msgBody = body;
    if ("messages" in msgBody && !Array.isArray(msgBody.messages)) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", "Rejecting request with non-array messages");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "messages: Expected array");
    }
    if (Array.isArray(msgBody.messages) && msgBody.messages.length === 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", "Rejecting request with empty messages array");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "messages: at least one message is required");
    }
    if (!("messages" in msgBody) && !("input" in msgBody) && sourceFormat !== "antigravity") {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", "Rejecting request with missing messages");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "messages: Expected array, received undefined");
    }
    // Reject non-string `model` before it reaches downstream code that calls
    // `.toLowerCase()` / `.split()` / `.startsWith()` on it (crash-then-500 with an
    // empty body, escaping the error sanitizer — #6407). An explicit `null`/`undefined`
    // stays permitted here because the existing `Missing model` guard below returns a
    // clean 400 for those; anything else that is not a string is a client type error.
    const rawModel = body.model;
    if (rawModel !== undefined && rawModel !== null && typeof rawModel !== "string") {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", `Rejecting non-string model (typeof=${typeof rawModel})`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `model: Expected string, received ${Array.isArray(rawModel) ? "array" : typeof rawModel}`);
    }
    // Early schema validation for scalar params BEFORE provider/model resolution (#6412).
    // Previously, a bad `temperature: "not-a-number"` on an unknown provider returned
    // 404 "model_not_found" — hiding the real schema error. Validate the param shape
    // first so the client gets a 400 with the field name. Kept narrow to widely-supported
    // OpenAI-spec params (temperature 0..2, top_p 0..1, max_tokens int >=1) so we don't
    // reject legitimate provider-specific fields.
    {
        const b = body;
        const badParam = (name, msg)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `${name}: ${msg}`);
        if (b.temperature !== undefined) {
            if (typeof b.temperature !== "number" || Number.isNaN(b.temperature)) {
                return badParam("temperature", "must be a number");
            }
            if (b.temperature < 0 || b.temperature > 2) {
                return badParam("temperature", "must be between 0 and 2");
            }
        }
        if (b.top_p !== undefined) {
            if (typeof b.top_p !== "number" || Number.isNaN(b.top_p)) {
                return badParam("top_p", "must be a number");
            }
            if (b.top_p < 0 || b.top_p > 1) {
                return badParam("top_p", "must be between 0 and 1");
            }
        }
        if (b.max_tokens !== undefined) {
            if (typeof b.max_tokens !== "number" || !Number.isInteger(b.max_tokens) || b.max_tokens < 1) {
                return badParam("max_tokens", "must be a positive integer");
            }
        }
        if (b.n !== undefined) {
            if (typeof b.n !== "number" || !Number.isInteger(b.n) || b.n < 1) {
                return badParam("n", "must be a positive integer");
            }
        }
    }
    const deferredClientRawBody = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatAdmission$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["captureDeferredClientRawBody"](body);
    // T01 — Accept-header streaming opt-in (#302 / #5305). A bare `Accept:
    // text/event-stream` with `stream` omitted opts a curl/httpx-style client into
    // SSE; a client that ALSO lists application/json (OpenAI / Vercel AI SDK
    // non-stream signature) does NOT — it expects a JSON object. An explicit body
    // `stream` value (true or false) always wins. See acceptHeaderForcesStream.
    const acceptHeader = request.headers.get("accept") || "";
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$aiSdkCompat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["acceptHeaderForcesStream"])(acceptHeader, body.stream)) {
        body = {
            ...body,
            stream: true
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("STREAM", "Accept: text/event-stream header → overriding stream=true (body had no stream field)");
    }
    // Log request endpoint and model
    const url = new URL(request.url);
    // No-thinking gateway alias (Fase 8.1): `no-think/<provider>/<model>`
    // resolves back to the real model with reasoning suppressed in place, before any
    // model resolution / combo routing sees it. Claude/Messages path forces
    // `thinking:{type:"disabled"}`; OpenAI path drops the reasoning fields.
    const noThinking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$noThinkingAlias$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyNoThinkingAlias"])(body, {
        claudeFormat: url.pathname.includes("/messages")
    });
    if (noThinking.applied) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("NO_THINKING", `Resolved no-thinking alias → ${noThinking.realModel}`);
    }
    // X-Route-Model header overrides body.model for routing purposes (see
    // resolveRoutingModel). The resolved model still passes through
    // enforceApiKeyPolicy below, so it cannot bypass per-key allowlists.
    let modelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$resolveRoutingModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRoutingModel"])(request, body);
    if (typeof modelStr === "string") {
        // Preserve literal combo names such as "Claude [1m]". Context tags are
        // stripped only when the exact request does not identify a combo.
        const exactCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCombo"])(modelStr);
        if (!exactCombo) {
            modelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripContextWindowSuffix"])(modelStr) || modelStr;
            if (body?.model !== modelStr) {
                body = {
                    ...body,
                    model: modelStr
                };
            }
        }
    }
    // cc discovery alias (`claude/<provider>/<model>`, `claude/combo/<name>`):
    // resolve back to the real id before any combo lookup / resolveModelOrError()
    // sees it — see resolveCcDiscoveryAliasStrip. A genuine claude/ model id (the
    // real Claude OAuth provider namespace) is always left untouched.
    const ccAliasStrip = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ccDiscoveryAliasResolve$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCcDiscoveryAliasStrip"])(modelStr);
    if (ccAliasStrip.stripped) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("CC_DISCOVERY", `Resolved cc discovery alias: ${modelStr} → ${ccAliasStrip.model}`);
        modelStr = ccAliasStrip.model;
    }
    // Freeze the client-facing model and reasoning intent before automatic routers
    // mutate the working request. Reasoning policies always match this stable input.
    const reasoningIntent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractReasoningIntent"])(modelStr, body);
    // Align body.model with the routing model immediately (see applyRoutingModelAlignment).
    body = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$resolveRoutingModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RoutingModelOps"].align(body, modelStr, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__);
    // Count messages (support both messages[] and input[] formats)
    const msgCount = body.messages?.length || body.input?.length || 0;
    const toolCount = body.tools?.length || 0;
    const effort = body.reasoning_effort || body.reasoning?.effort || null;
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.request("POST", `${url.pathname} | ${modelStr} | ${msgCount} msgs${toolCount ? ` | ${toolCount} tools` : ""}${effort ? ` | effort=${effort}` : ""}`);
    // Log only that an API key was provided — never the key itself, not even a
    // masked prefix/last4. These debug lines get copied verbatim into bug reports
    // and support tickets, so any key fragment is sensitive.
    const authHeader = request.headers.get("Authorization");
    const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request);
    if (authHeader && apiKey) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", "API key provided");
    } else {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", "No API key provided (local mode)");
    }
    const internalUsageCommandResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$internalUsageCommand$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleInternalUsageCommand"])(request, body);
    if (internalUsageCommandResponse) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordTelemetry"])(telemetry);
        return internalUsageCommandResponse;
    }
    const isComboLiveTest = request.headers?.get?.("x-internal-test") === "combo-health-check";
    if (!modelStr) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", "Missing model");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, "Missing model");
    }
    // Reject image-generation models routed to /v1/chat/completions (#6457).
    // Image-only models live in IMAGE_PROVIDERS (open-sse/config/imageRegistry.ts)
    // and are served by /v1/images/generations. Forwarding them to a chat upstream
    // yielded confusing raw provider 400s (e.g. HuggingFace: "not a chat model").
    // Models such as Codex GPT-5.5 support both chat and image generation, so an
    // image-registry match is only image-only when the same provider/model pair is
    // absent from the chat catalog.
    const imageModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getImageModelEntry"])(modelStr);
    const isChatCatalogModel = imageModel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelsByProviderId"])(imageModel.provider).some((model)=>model.id === imageModel.model) : false;
    if (imageModel && !isChatCatalogModel) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("CHAT", `Rejecting image-generation model on chat endpoint: ${modelStr}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Model '${modelStr}' is an image-generation model and cannot be used on /v1/chat/completions. Use POST /v1/images/generations instead.`);
    }
    // T04: client-provided external session header has priority over generated fingerprint.
    const externalSessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractExternalSessionId"])(request.headers);
    const sessionId = externalSessionId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateSessionId"])(body);
    const sessionAffinityKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractSessionAffinityKey"])(body, request.headers) || sessionId;
    const requestedConnectionId = request.headers.get("x-omniroute-connection")?.trim() || null;
    if (sessionId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["touchSession"])(sessionId);
    }
    // Pipeline: API key policy enforcement (model restrictions + budget limits)
    telemetry.startPhase("policy");
    const policy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiKeyPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceApiKeyPolicy"])(request, modelStr);
    if (policy.rejection) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("POLICY", `API key policy rejected: ${modelStr} (key=${policy.apiKeyInfo?.id || "unknown"})`);
        return policy.rejection;
    }
    const apiKeyInfo = policy.apiKeyInfo;
    const bypassProviderQuotaPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasProviderQuotaBypassScope"])(apiKeyInfo?.scopes);
    telemetry.endPhase();
    const admissionRejection = await admissionContext.acquire(apiKeyInfo?.id, request, body);
    if (admissionRejection) return admissionRejection;
    clientRawRequest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatAdmission$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveClientRawAfterAdmission"](clientRawRequest, ()=>deferredClientRawBody.withClientBody((clientBody)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chat$2f$clientRawRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClientRawRequest"])(request, clientBody)));
    // Guardrail pre-call pipeline — prompt injection, PII masking, and future custom rules.
    telemetry.startPhase("validate");
    const preCallGuardrails = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["guardrailRegistry"].runPreCallHooks(body, {
        apiKeyInfo: apiKeyInfo,
        disabledGuardrails: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDisabledGuardrails"])({
            apiKeyInfo: apiKeyInfo ?? null,
            body,
            headers: request.headers
        }),
        endpoint: new URL(request.url).pathname,
        headers: request.headers,
        log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
        method: request.method,
        model: modelStr,
        stream: body?.stream === true
    });
    if (preCallGuardrails.blocked) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("GUARDRAIL", "Request blocked during pre-call guardrails", {
            guardrail: preCallGuardrails.guardrail,
            message: preCallGuardrails.message
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, preCallGuardrails.message || "Request rejected: suspicious content detected");
    }
    // Snapshot model BEFORE the guardrail payload (see reconcileGuardrailReroute).
    const modelBeforeGuardrails = typeof body?.model === "string" && body.model.length > 0 ? body.model : modelStr;
    body = preCallGuardrails.payload;
    ({ body, modelStr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$resolveRoutingModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RoutingModelOps"].reconcileGuardrailReroute({
        body,
        modelBeforeGuardrails,
        modelStr,
        apiKey,
        apiKeyId: apiKeyInfo?.id,
        isModelAllowedForKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelAllowedForKey"],
        log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
    }));
    telemetry.endPhase();
    // T08: per-key active session limit (0 = unlimited).
    if (apiKeyInfo?.id && sessionId) {
        const maxSessions = typeof apiKeyInfo.maxSessions === "number" && apiKeyInfo.maxSessions > 0 ? apiKeyInfo.maxSessions : 0;
        if (maxSessions > 0 && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSessionRegisteredForKey"])(apiKeyInfo.id, sessionId)) {
            const sessionViolation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkSessionLimit"])(apiKeyInfo.id, maxSessions);
            if (sessionViolation) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSessionHeader"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, sessionViolation.message), sessionId);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerKeySession"])(apiKeyInfo.id, sessionId);
        }
    }
    // T09 — Pre-request Middleware Hooks
    // Execute user-defined hooks BEFORE task-aware routing and combo selection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["initPreRequestRegistry"])();
    const hookContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createHookContext"])({
        body: body,
        headers: Object.fromEntries(request?.headers?.entries() || []),
        model: modelStr,
        combo: undefined,
        apiKeyInfo: apiKeyInfo,
        log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
    });
    const { context: hookCtx, response: hookResponse } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runHooks"])(hookContext);
    // Apply hook mutations
    body = hookCtx.body;
    ({ body, modelStr } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$resolveRoutingModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RoutingModelOps"].reconcileModelOverride({
        body,
        modelStr,
        overrideModel: hookCtx.model,
        logTag: "Hook model override",
        log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
    }));
    // Short-circuit if a hook returned a direct response
    if (hookResponse) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(hookResponse.status, hookResponse.body);
    }
    // T05 — Task-Aware Smart Routing
    // Detect the semantic task type and optionally route to the optimal model
    let resolvedModelStr = modelStr;
    let taskRouteInfo = null;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTaskRoutingConfig"])().enabled) {
        telemetry.startPhase("task-route");
        const tr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyTaskAwareRouting"])(modelStr, body);
        if (tr.wasRouted) {
            resolvedModelStr = tr.model;
            body = {
                ...body,
                model: tr.model
            };
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("T05", `Task-Aware: detected="${tr.taskType}" → model override: ${modelStr} → ${tr.model}`);
        } else if (tr.taskType !== "chat") {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("T05", `Task-Aware: detected="${tr.taskType}" (no override configured)`);
        }
        taskRouteInfo = {
            taskType: tr.taskType,
            wasRouted: tr.wasRouted
        };
        telemetry.endPhase();
    }
    // #4481 layer 2 — Web-Search Routing (CCR-style Router.webSearch): a native web_search
    // server tool + a configured `webSearchRouteModel` routes the whole request to that
    // model (some providers don't implement Anthropic's web_search_20250305 server tool).
    // Settings are read only when a web-search tool is present; the override lands before
    // auto/combo resolution and the layer-1 fallback so the target's own handling applies.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasNativeWebSearchTool"])(body)) {
        const wsSettings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])().catch(()=>({}));
        const wsRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveWebSearchRouteOverride"])(resolvedModelStr, body, wsSettings);
        if (wsRoute.wasRouted) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("WEBSEARCH-ROUTE", `web_search tool → model override: ${resolvedModelStr} → ${wsRoute.model}`);
            resolvedModelStr = wsRoute.model;
            body = {
                ...body,
                model: wsRoute.model
            };
        }
    }
    // Explicit reasoning-routing policies are the final model-routing layer before
    // combo/provider resolution. Existing behavior is untouched when no rule matches.
    let reasoningDecision = null;
    let requestRoutingTags = {
        tags: []
    };
    const reasoningRouting = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$reasoningRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyReasoningRouting"])({
        request,
        body,
        modelStr: resolvedModelStr,
        policy,
        apiKeyInfo,
        reasoningIntent
    });
    if (reasoningRouting.response) return reasoningRouting.response;
    body = reasoningRouting.body;
    resolvedModelStr = reasoningRouting.modelStr;
    reasoningDecision = reasoningRouting.reasoningDecision;
    requestRoutingTags = reasoningRouting.requestRoutingTags;
    const autoRouting = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$autoRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAutoRoutingState"])(resolvedModelStr);
    if (autoRouting.response) return autoRouting.response;
    // Check if model is a combo (has multiple models with fallback)
    telemetry.startPhase("resolve");
    let combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboForModel"])(resolvedModelStr);
    if (reasoningDecision?.targetCombo) combo = reasoningDecision.targetCombo;
    // "auto" prefix fuzzy matching: "auto/fast" → "auto/best-fast", etc.
    // parseModel splits "auto/fast" into provider="auto" which isn't a real provider.
    if (!combo && resolvedModelStr.startsWith("auto/")) {
        const suffix = resolvedModelStr.slice(5);
        for (const candidate of [
            `auto/best-${suffix}`,
            `auto/${suffix}`
        ]){
            combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboForModel"])(candidate);
            if (combo) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("ROUTING", `"${resolvedModelStr}" → combo "${candidate}" (auto fuzzy)`);
                break;
            }
        }
    }
    const virtualCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$autoRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createVirtualAutoCombo"])(autoRouting, combo, apiKeyInfo?.id);
    if (virtualCombo instanceof Response) return virtualCombo;
    combo = virtualCombo;
    if (combo) {
        if (reasoningDecision) {
            const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$reasoningRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterReasoningCombo"])(combo, reasoningDecision);
            if (filtered instanceof Response) return filtered;
            combo = filtered;
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("CHAT", `Combo "${modelStr}" [${combo.strategy || "priority"}] with ${combo.models.length} models`);
        // Pre-check function used by combo routing. For explicit combo live tests,
        // avoid pre-skipping so each model gets a real execution attempt.
        const comboPreselectedCredentials = new Map();
        const getComboCredentialCacheKey = (modelString, target)=>`${target?.executionKey || target?.connectionId || ""}:${modelString}`;
        const checkModelAvailable = async (modelString, target)=>{
            if (isComboLiveTest) return true;
            // Use getModelInfo to resolve custom prefixes, but prefer the combo
            // target's providerId when available — the model string's provider
            // prefix may differ from the credential provider ID (e.g. model
            // "xiaomi/mimo-v2-flash" resolves to provider "xiaomi" but the combo
            // target specifies providerId: "opengate" for credential lookup).
            const modelInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelInfo"])(modelString);
            // Apply the same prefix-override guard as handleSingleModelChat:
            // if providerId is just the prefix already in the model string, use
            // the fully-resolved modelInfo.provider for a precise credential check.
            const provider = (()=>{
                if (!target?.providerId) return modelInfo.provider;
                if (target.providerId === modelInfo.provider) return modelInfo.provider;
                if (modelString.startsWith(target.providerId + "/")) return modelInfo.provider;
                return target.providerId;
            })();
            if (!provider) return true; // can't determine provider, let it try
            const resolvedModel = modelInfo.model || modelString;
            const hasForcedConnection = typeof target?.connectionId === "string" && target.connectionId.trim().length > 0;
            let allowedConnections = intersectAllowedConnectionIds(apiKeyInfo?.allowedConnections ?? null, target?.allowedConnectionIds ?? null);
            // A4: quota-exclusive keys must only use the pool's connection(s).
            if (apiKeyInfo?.allowedQuotas && apiKeyInfo.allowedQuotas.length > 0) {
                const quotaScope = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveQuotaKeyScope"])(apiKeyInfo.allowedQuotas);
                allowedConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["constrainConnectionsToQuota"])(allowedConnections ?? [], quotaScope.connectionIds);
            }
            if (Array.isArray(allowedConnections) && allowedConnections.length === 0) {
                return false;
            }
            const creds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentialsWithQuotaPreflight"])(provider, null, allowedConnections, resolvedModel, {
                sessionKey: sessionAffinityKey,
                ...target?.allowRateLimitedConnection ? {
                    allowRateLimitedConnections: true
                } : {},
                ...target?.connectionId ? {
                    forcedConnectionId: target.connectionId
                } : {},
                ...bypassProviderQuotaPolicy ? {
                    bypassQuotaPolicy: true
                } : {}
            });
            if (!creds || creds.allRateLimited) return false;
            comboPreselectedCredentials.set(getComboCredentialCacheKey(modelString, target), creds);
            return true;
        };
        // Fetch settings and all combos for config cascade and nested resolution
        const [settings, allCombos] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])().catch(()=>({})),
            getCombosCachedForChat()
        ]);
        const relayConfig = combo.strategy === "context-relay" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComboConfig"])(combo, settings) : null;
        // Per-request Auto-Combo controls (#6023 / #6024 / #6025 / #3470): steer an
        // `auto` combo on this single request without mutating its stored config.
        const perRequestAutoControls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$requestControls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestAutoControls"])(request.headers);
        const relayOptions = combo.strategy === "context-relay" || bypassProviderQuotaPolicy || Object.keys(perRequestAutoControls).length > 0 ? {
            ...combo.strategy === "context-relay" ? {
                sessionId,
                config: relayConfig
            } : {},
            ...bypassProviderQuotaPolicy ? {
                bypassProviderQuotaPolicy: true
            } : {},
            ...perRequestAutoControls
        } : undefined;
        telemetry.endPhase();
        // Context-relay keeps generation in combo.ts, but handoff injection lives here
        // because only this layer knows which connectionId was actually selected.
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["handleComboChat"]({
            body,
            combo,
            handleSingleModel: (b, m, target)=>handleSingleModelChat(b, m, clientRawRequest, request, combo.name, apiKeyInfo, telemetry, {
                    sessionId,
                    sessionAffinityKey,
                    forceLiveComboTest: isComboLiveTest,
                    forcedConnectionId: target?.connectionId ?? null,
                    allowedConnectionIds: target?.allowedConnectionIds ?? null,
                    comboStepId: target?.stepId || null,
                    comboExecutionKey: target?.executionKey || target?.stepId || null,
                    skipUpstreamRetry: target?.failoverBeforeRetry ?? false,
                    allowRateLimitedConnection: target?.allowRateLimitedConnection === true,
                    preselectedCredentials: comboPreselectedCredentials.get(getComboCredentialCacheKey(m, target)),
                    cachedSettings: settings,
                    providerId: target?.providerId ?? null,
                    correlationId: reqId,
                    modelPinned: target?.modelPinned ?? false,
                    reasoningDecision,
                    reasoningIntent,
                    reasoningRequestTags: requestRoutingTags.tags,
                    // #7360 follow-up: without this, a target dispatch abandoned by
                    // targetTimeoutRunner.ts's per-target timeout (comboTargetTimeoutMs)
                    // never learns it was abandoned — it only watches the ORIGINAL
                    // client's request.signal (see clientRawRequest below), which stays
                    // open for as long as the overall combo keeps retrying elsewhere.
                    // The abandoned dispatch then hangs forever inside withRateLimit/
                    // acquireAccountSemaphore, leaking a permanent "pending" dashboard
                    // entry (trackPendingRequest(false) never runs) — live incident,
                    // log id 1784418258231-14961a.
                    modelAbortSignal: target?.modelAbortSignal ?? null
                }, target?.effectiveComboStrategy ?? combo.strategy, true).then(async (res)=>{
                    // Auto-promote the winning combo model to position #1 (opt-in flag).
                    if (res?.ok) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$autoPromote$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["promoteSuccessfulComboModel"])(combo, m, settings, comboPromoteDeps);
                    return res;
                }),
            isModelAvailable: checkModelAvailable,
            log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
            settings,
            allCombos,
            apiKeyAllowedConnections: apiKeyInfo?.allowedConnections ?? null,
            relayOptions,
            signal: request?.signal ?? null,
            correlationId: reqId
        });
        // ── Global Fallback Provider (#689) ────────────────────────────────────
        // If combo exhausted all models, try the global fallback before giving up.
        if (!response.ok && [
            502,
            503
        ].includes(response.status) && typeof settings?.globalFallbackModel === "string" && settings.globalFallbackModel.trim()) {
            const fallbackModel = settings.globalFallbackModel.trim();
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("GLOBAL_FALLBACK", `Combo "${combo.name}" exhausted — attempting global fallback: ${fallbackModel}`);
            try {
                const fallbackResponse = await handleSingleModelChat(body, fallbackModel, clientRawRequest, request, combo.name, apiKeyInfo, telemetry, {
                    sessionId,
                    sessionAffinityKey,
                    emergencyFallbackTried: true,
                    forceLiveComboTest: isComboLiveTest
                }, combo.strategy, true);
                if (fallbackResponse.ok) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("GLOBAL_FALLBACK", `Global fallback ${fallbackModel} succeeded`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordTelemetry"])(telemetry);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSessionHeader"])(fallbackResponse, sessionId);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("GLOBAL_FALLBACK", `Global fallback ${fallbackModel} also failed (${fallbackResponse.status})`);
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("GLOBAL_FALLBACK", `Global fallback error: ${err?.message || "unknown"}`);
            }
        }
        // ─────────────────────────────────────────────────────────────────────────
        // Record telemetry
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordTelemetry"])(telemetry);
        // Log combo failures that bypassed handleChatCore (e.g. all targets skipped by circuit breaker).
        // Records BOTH a call_logs row (dashboard/logs) AND a usage_history row attributed to the api key
        // (success:false) so gate/breaker-rejected traffic is counted per key — support-mesh 2026-07-08.
        if (!response.ok) {
            try {
                const { recordRejectedRequestUsage, resolveRejectedComboProvider } = await __turbopack_context__.A("[project]/src/sse/handlers/rejectedRequestUsage.ts [instrumentation] (ecmascript, async loader)");
                await recordRejectedRequestUsage({
                    status: response.status,
                    model: body?.model || resolvedModelStr,
                    requestedModel: body?.model || resolvedModelStr,
                    provider: resolveRejectedComboProvider(body?.model || resolvedModelStr, combo.name),
                    endpoint: clientRawRequest?.endpoint,
                    error: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$comboFailureLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getComboFailureLogError"])(response, combo.name),
                    comboName: combo.name,
                    apiKeyId: apiKeyInfo?.id ?? null,
                    apiKeyName: apiKeyInfo?.name ?? null,
                    correlationId: reqId,
                    startTime: telemetry?.startTime,
                    requestBody: clientRawRequest?.body ?? null
                });
            } catch  {}
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withCorrelationId"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSessionHeader"])(response, sessionId), reqId);
    }
    telemetry.endPhase();
    // Single model request
    // Try to resolve routing combo from model prefix for compression combo lookup
    let routingComboId = null;
    if (!combo) {
        const providerPrefix = resolvedModelStr.split("/")[0];
        if (providerPrefix) {
            try {
                const { getComboByName } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
                const routingCombo = await getComboByName(providerPrefix);
                if (routingCombo?.id) {
                    routingComboId = routingCombo.id;
                }
            } catch  {}
        }
    }
    const response = await handleSingleModelChat(body, resolvedModelStr, clientRawRequest, request, null, apiKeyInfo, telemetry, {
        sessionId,
        sessionAffinityKey,
        forceLiveComboTest: isComboLiveTest,
        forcedConnectionId: requestedConnectionId,
        correlationId: reqId,
        routingComboId,
        reasoningDecision,
        reasoningIntent,
        reasoningRequestTags: requestRoutingTags.tags
    }, null, false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordTelemetry"])(telemetry);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withCorrelationId"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSessionHeader"])(response, sessionId), reqId);
}
const handleChat = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatAdmission$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withChatAdmission"](handleChatImplementation);
/** Handle one resolved model through gates, credentials, and retry/fallback. */ async function handleSingleModelChat(body, modelStr, clientRawRequest = null, request = null, comboName = null, apiKeyInfo = null, telemetry = null, runtimeOptions = {}, comboStrategy = null, isCombo = false) {
    // 1. Resolve model → provider/model
    const resolved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelOrError"])(modelStr, body, clientRawRequest?.endpoint, clientRawRequest?.headers);
    if (resolved.error) return resolved.error;
    // Safety net: if auto-combo resolution returned a combo object, redirect
    // to combo flow. This handles the case where the auto-fuzzy match in
    // resolveModelOrError found a combo but the main handler's combo lookup missed it.
    if (resolved.combo) {
        const redirectCombo = resolved.combo;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("ROUTING", `Safety-net combo redirect for "${modelStr}" → combo="${redirectCombo.name}"`);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("ROUTING", `Auto-combo redirect from handleSingleModelChat for "${modelStr}"`);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("ROUTING", `Auto-combo redirect to combo flow for "${modelStr}"`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["handleComboChat"])({
            body,
            combo: redirectCombo,
            handleSingleModel: (b, m, target)=>handleSingleModelChat(b, m, clientRawRequest, request, redirectCombo.name ?? modelStr, apiKeyInfo, telemetry, {
                    sessionId: "",
                    forceLiveComboTest: false,
                    forcedConnectionId: null,
                    allowedConnectionIds: null,
                    comboStepId: null,
                    comboExecutionKey: null,
                    skipUpstreamRetry: target?.failoverBeforeRetry ?? false,
                    allowRateLimitedConnection: target?.allowRateLimitedConnection === true,
                    providerId: target?.providerId ?? null,
                    correlationId: runtimeOptions?.correlationId ?? null,
                    // #7360 follow-up — see the primary handleSingleModel closure above.
                    modelAbortSignal: target?.modelAbortSignal ?? null
                }, target?.effectiveComboStrategy ?? redirectCombo.strategy ?? "priority", false),
            isModelAvailable: async ()=>true,
            log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
            settings: {},
            allCombos: [],
            relayOptions: undefined,
            signal: request?.signal ?? null,
            correlationId: runtimeOptions?.correlationId ?? null
        });
    }
    const { provider: resolvedProvider, model, sourceFormat, targetFormat, extendedContext, apiFormat } = resolved;
    // Prefer the combo target's providerId when available — the model string's
    // provider prefix may differ from the credential provider ID (e.g. model
    // "xiaomi/mimo-v2-flash" resolves to provider "xiaomi" but the combo target
    // may specify providerId: "opengate" for credential lookup).
    // Guard: if runtimeOptions.providerId is merely the prefix already encoded in
    // the model string (e.g. "p2" from "p2/test-model"), and resolveModelOrError
    // expanded it to a full custom-node ID (e.g. "openai-compatible-chat-e2e-p2"),
    // trust resolvedProvider so the executor receives the full node ID and can
    // correctly resolve the custom baseUrl. (#3058 follow-up)
    const provider = (()=>{
        if (!runtimeOptions.providerId) return resolvedProvider;
        // If the override is identical to resolvedProvider, no-op.
        if (runtimeOptions.providerId === resolvedProvider) return resolvedProvider;
        // If the model string already encodes runtimeOptions.providerId as its prefix,
        // the override is implicit (not an intentional redirect) — use resolvedProvider.
        if (modelStr.startsWith(runtimeOptions.providerId + "/")) return resolvedProvider;
        // Intentional override (e.g. providerId points to a different credential pool).
        return runtimeOptions.providerId;
    })();
    const forceLiveComboTest = runtimeOptions.forceLiveComboTest === true;
    const bypassProviderQuotaPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasProviderQuotaBypassScope"])(apiKeyInfo?.scopes);
    const hasForcedConnection = typeof runtimeOptions.forcedConnectionId === "string" && runtimeOptions.forcedConnectionId.trim().length > 0;
    let effectiveAllowedConnections = intersectAllowedConnectionIds(apiKeyInfo?.allowedConnections ?? null, runtimeOptions.allowedConnectionIds ?? null);
    // A4: quota-exclusive keys must only use the pool's connection(s).
    if (apiKeyInfo?.allowedQuotas && apiKeyInfo.allowedQuotas.length > 0) {
        const quotaScope = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveQuotaKeyScope"])(apiKeyInfo.allowedQuotas);
        effectiveAllowedConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaKey$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["constrainConnectionsToQuota"])(effectiveAllowedConnections ?? [], quotaScope.connectionIds);
    }
    const bypassReason = forceLiveComboTest ? "combo live test" : hasForcedConnection ? "fixed combo step connection" : undefined;
    // 2. Local pressure precedes availability/breaker gates and account selection.
    const pressureGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkResourcePressureBeforeProviderWork"])();
    if (pressureGuard) return pressureGuard.response;
    const providerProfile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRuntimeProviderProfile"])(provider);
    const gate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkPipelineGates"])(provider, model, {
        ignoreCircuitBreaker: forceLiveComboTest || hasForcedConnection,
        ignoreModelCooldown: forceLiveComboTest || hasForcedConnection,
        providerProfile,
        ...bypassReason ? {
            bypassReason
        } : {}
    });
    if (gate) {
        // Log the rejected request so it appears in /dashboard/logs AND is counted in the
        // per-api-key usage analytics (usage_history, success:false) — otherwise a key whose
        // traffic is entirely gate/breaker-rejected shows "zero requests" (support-mesh 2026-07-08).
        try {
            const { recordRejectedRequestUsage } = await __turbopack_context__.A("[project]/src/sse/handlers/rejectedRequestUsage.ts [instrumentation] (ecmascript, async loader)");
            await recordRejectedRequestUsage({
                status: gate.status,
                model,
                requestedModel: body?.model || modelStr,
                provider,
                endpoint: clientRawRequest?.endpoint,
                error: `[${gate.status}] Pipeline gate rejected`,
                comboName: isCombo ? comboName : null,
                comboStepId: isCombo ? runtimeOptions?.comboStepId ?? null : null,
                comboExecutionKey: isCombo ? runtimeOptions?.comboExecutionKey ?? null : null,
                apiKeyId: apiKeyInfo?.id ?? null,
                apiKeyName: apiKeyInfo?.name ?? null,
                correlationId: runtimeOptions?.correlationId ?? null,
                startTime: telemetry?.startTime
            });
        } catch  {}
        return gate;
    }
    // Issue #2100 follow-up: opt-in upstream 429 hint trust per provider.
    const useHints429 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUseUpstream429BreakerHints"])(provider, providerProfile.useUpstream429BreakerHints);
    const breaker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider, {
        failureThreshold: providerProfile.failureThreshold,
        resetTimeout: providerProfile.resetTimeoutMs,
        // #4602: a local WS-bridge "Controller is already closed" throw is not an
        // upstream outage — keep it from tripping the whole-provider breaker.
        isFailure: (e)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(e),
        onStateChange: (name, from, to)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("CIRCUIT", `${name}: ${from} → ${to}`),
        ...useHints429 ? {
            cooldownByKind: {
                rate_limit: 60_000,
                quota_exhausted: 3_600_000
            },
            classifyError: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classify429FromError"]
        } : {}
    });
    const userAgent = request?.headers?.get("user-agent") || "";
    const baseRetrySettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCooldownAwareRetrySettings"])(runtimeOptions.cachedSettings ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])().catch(()=>({})));
    const retrySettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["disableCooldownAwareRetry"])(baseRetrySettings, provider === "claude-web" || isCombo || forceLiveComboTest || runtimeOptions.emergencyFallbackTried === true);
    const requestSignal = request?.signal ?? null;
    // Cumulative cap across all waits for this request (#7360 follow-up) — mirrors
    // combo.ts's comboCooldownBudgetLeftMs. Declared outside requestAttemptLoop so
    // it persists (and only decreases) across `continue requestAttemptLoop` retries.
    let requestRetryBudgetLeftMs = retrySettings.budgetMs;
    if (Array.isArray(effectiveAllowedConnections) && effectiveAllowedConnections.length === 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider}/${model} filtered out by connection-level routing constraints`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE, "No eligible connections matched the requested routing constraints");
    }
    // 3. Credential retry loop
    let requestRetryAttempt = 0;
    let requestRetryLastError = null;
    let requestRetryLastStatus = null;
    let requestRetryLastCooldownMs = 0;
    // Bug #3758: per-request counter bounding the early-close (STREAM_EARLY_EOF)
    // re-attempt to exactly one for the whole request. Declared outside both retry
    // loops so it can never reset and loop.
    let streamEarlyEofRetries = 0;
    requestAttemptLoop: while(true){
        const excludedConnectionIds = new Set();
        let lastError = requestRetryLastError;
        let lastStatus = requestRetryLastStatus;
        let lastCooldownMs = requestRetryLastCooldownMs;
        let preselectedCredentials = runtimeOptions.preselectedCredentials;
        while(true){
            const credentials = preselectedCredentials && excludedConnectionIds.size === 0 ? preselectedCredentials : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentialsWithQuotaPreflight"])(provider, null, effectiveAllowedConnections, model, {
                sessionKey: runtimeOptions.sessionAffinityKey ?? runtimeOptions.sessionId ?? null,
                excludeConnectionIds: Array.from(excludedConnectionIds),
                ...runtimeOptions.allowRateLimitedConnection ? {
                    allowRateLimitedConnections: true
                } : {},
                ...forceLiveComboTest ? {
                    allowSuppressedConnections: true,
                    bypassQuotaPolicy: true
                } : {},
                ...!forceLiveComboTest && bypassProviderQuotaPolicy ? {
                    bypassQuotaPolicy: true
                } : {},
                ...runtimeOptions.forcedConnectionId ? {
                    forcedConnectionId: runtimeOptions.forcedConnectionId
                } : {}
            });
            preselectedCredentials = null;
            if (!credentials || "allRateLimited" in credentials || !credentials.connectionId) {
                if (credentials?.allRateLimited) {
                    const retryDecision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCooldownAwareRetryDecision"])({
                        retryAfter: credentials.retryAfter,
                        settings: retrySettings,
                        attempt: requestRetryAttempt,
                        budgetLeftMs: requestRetryBudgetLeftMs
                    });
                    if (retryDecision.shouldRetry) {
                        const waitSec = Math.max(Math.ceil(retryDecision.waitMs / 1000), 0);
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("COOLDOWN_RETRY", `${provider}/${model} all connections cooling down (${retryDecision.retryAfterHuman || `retry in ${waitSec}s`}) — waiting ${waitSec}s before retry ${requestRetryAttempt + 1}/${retrySettings.maxRetries}`);
                        const completed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$cooldownAwareRetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["waitForCooldownAwareRetry"])(retryDecision.waitMs, requestSignal);
                        if (!completed) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("COOLDOWN_RETRY", `${provider}/${model} retry wait aborted by client disconnect`);
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(499, "Request aborted");
                        }
                        requestRetryAttempt += 1;
                        requestRetryBudgetLeftMs = Math.max(0, requestRetryBudgetLeftMs - retryDecision.waitMs);
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("COOLDOWN_RETRY", `${provider}/${model} cooldown elapsed — restarting request attempt ${requestRetryAttempt}/${retrySettings.maxRetries}`);
                        continue requestAttemptLoop;
                    }
                }
                const breakerFailureStatus = Number(lastStatus ?? credentials?.lastErrorCode);
                if (!forceLiveComboTest && credentials?.allRateLimited && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_BREAKER_FAILURE_STATUSES"].has(breakerFailureStatus)) {
                    breaker._onFailure();
                }
                const noCredsRes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleNoCredentials"])(credentials, excludedConnectionIds.size > 0 ? Array.from(excludedConnectionIds)[0] : null, provider, model, lastError, lastStatus, resolved.candidateAliases);
                const lastFailedConnectionId = excludedConnectionIds.size > 0 ? Array.from(excludedConnectionIds)[excludedConnectionIds.size - 1] : null;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(noCredsRes, lastFailedConnectionId);
            }
            const accountId = credentials.connectionId.slice(0, 8);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Using ${provider} account: ${accountId}...`);
            // #474: when the request used a bare model name (no "/" — e.g. an alias
            // that resolved to "auto") and the selected connection declares a
            // defaultModel, resolve the bare name to that real model ID before the
            // upstream call so the provider receives a concrete model rather than the
            // placeholder. A "/"-qualified model name is always left untouched.
            const effectiveModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBareModelToConnectionDefault"])(modelStr, model, credentials.defaultModel) ?? model;
            let requestBody = effectiveModel !== model ? {
                ...body,
                model: `${provider}/${effectiveModel}`
            } : body;
            if (!runtimeOptions.reasoningDecision && runtimeOptions.reasoningIntent) {
                const connectionRouting = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$reasoningRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyConnectionReasoningRule"])({
                    requestBody,
                    provider,
                    effectiveModel,
                    credentials,
                    apiKeyInfo,
                    reasoningIntent: runtimeOptions.reasoningIntent,
                    reasoningDecision: runtimeOptions.reasoningDecision,
                    requestRoutingTags: runtimeOptions.reasoningRequestTags
                });
                if (connectionRouting.response) return connectionRouting.response;
                requestBody = connectionRouting.body;
            }
            let injectedHandoff = null;
            if (comboStrategy === "context-relay" && comboName && runtimeOptions.sessionId && body?._omnirouteSkipContextRelay !== true) {
                const handoff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHandoff"])(runtimeOptions.sessionId, comboName);
                if (handoff && handoff.fromAccount !== credentials.connectionId) {
                    // Inject only after a real account switch. The combo loop itself cannot
                    // reliably detect this because account selection happens inside auth.
                    requestBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextHandoff$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectHandoffIntoBody"])(requestBody, handoff);
                    injectedHandoff = handoff;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("CONTEXT_RELAY", `Injecting handoff for session ${runtimeOptions.sessionId}: ${handoff.fromAccount.slice(0, 8)} -> ${credentials.connectionId.slice(0, 8)}`);
                }
            }
            const refreshedCredentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkAndRefreshToken"])(provider, credentials);
            const storeEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isOpenAIResponsesStoreEnabled"])(refreshedCredentials?.providerSpecificData ?? credentials?.providerSpecificData);
            if (provider === "codex" && storeEnabled && runtimeOptions.sessionId) {
                requestBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureOpenAIStoreSessionFallback"])(requestBody, runtimeOptions.sessionId);
            }
            if (provider === "codex" && refreshedCredentials?.accessToken && credentials.connectionId) {
                const workspaceId = typeof refreshedCredentials?.providerSpecificData?.workspaceId === "string" && refreshedCredentials.providerSpecificData.workspaceId.trim().length > 0 ? refreshedCredentials.providerSpecificData.workspaceId : typeof credentials?.providerSpecificData?.workspaceId === "string" && credentials.providerSpecificData.workspaceId.trim().length > 0 ? credentials.providerSpecificData.workspaceId : undefined;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexQuotaFetcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["registerCodexConnection"])(credentials.connectionId, {
                    accessToken: refreshedCredentials.accessToken,
                    ...workspaceId ? {
                        workspaceId
                    } : {}
                });
            }
            if (runtimeOptions.sessionId && body?._omnirouteInternalRequest !== "context-handoff") {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["touchSession"])(runtimeOptions.sessionId, credentials.connectionId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["startQuotaMonitor"])(runtimeOptions.sessionId, provider, credentials.connectionId, refreshedCredentials);
            }
            const proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeResolveProxy"])(credentials.connectionId, apiKeyInfo?.id, provider);
            // #5217: sink for the proxy the executor pins internally (e.g. OpencodeExecutor
            // rotation) so the egress log below reflects the real egress, not "direct".
            const appliedProxySink = {
                proxy: null
            };
            const proxyStartTime = Date.now();
            // 4. Execute chat via core after breaker gate checks (with optional TLS tracking)
            if (telemetry) telemetry.startPhase("connect");
            const dispatchClientRawRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chat$2f$clientRawRequest$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDispatchClientRawRequest"])(clientRawRequest, runtimeOptions.modelAbortSignal);
            const execution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executeChatWithBreaker"])({
                bypassCircuitBreaker: forceLiveComboTest || hasForcedConnection,
                breaker,
                body: requestBody,
                provider,
                model: effectiveModel,
                refreshedCredentials,
                proxyInfo,
                appliedProxySink,
                log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
                clientRawRequest: dispatchClientRawRequest,
                credentials,
                apiKeyInfo,
                userAgent,
                comboName,
                comboStrategy,
                isCombo,
                comboStepId: runtimeOptions.comboStepId ?? null,
                comboExecutionKey: runtimeOptions.comboExecutionKey ?? runtimeOptions.comboStepId ?? null,
                extendedContext,
                modelApiFormat: apiFormat,
                providerProfile,
                cachedSettings: runtimeOptions.cachedSettings,
                skipUpstreamRetry: runtimeOptions.skipUpstreamRetry ?? false,
                correlationId: runtimeOptions?.correlationId ?? null,
                modelPinned: runtimeOptions?.modelPinned ?? false,
                routingComboId: runtimeOptions?.routingComboId ?? null
            });
            if (telemetry) telemetry.endPhase();
            if ("localResourcePressureResult" in execution) {
                return execution.localResourcePressureResult.response;
            }
            const { result, tlsFingerprintUsed } = execution;
            const proxyLatency = Date.now() - proxyStartTime;
            const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
            const effectiveTargetFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelTargetFormat"])(providerAlias, model) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTargetFormat"])(provider, credentials.providerSpecificData) || targetFormat;
            // 5. Log proxy + translation events (fire-and-forget; never blocks the response)
            // #5217: reflect the proxy the executor actually applied (per-account rotation).
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeLogEvents"])({
                result,
                proxyInfo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyExecutorProxyToInfo"])(proxyInfo, appliedProxySink.proxy),
                proxyLatency,
                provider,
                model,
                sourceFormat,
                targetFormat: effectiveTargetFormat,
                credentials,
                comboName,
                clientRawRequest,
                tlsFingerprintUsed
            });
            if (result.success) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearModelLock"])(provider, credentials.connectionId, model);
                if (!forceLiveComboTest) {
                    breaker._onSuccess();
                }
                if (injectedHandoff && runtimeOptions.sessionId && comboName) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteHandoff"])(runtimeOptions.sessionId, comboName);
                }
                if (telemetry) telemetry.startPhase("finalize");
                if (telemetry) telemetry.endPhase();
                return result.response;
            }
            // Missing Cloud Code project assignment is configuration, not a transient failure.
            // Preserve the typed fail-closed 422; marking it unavailable would trigger cooldown
            // redispatch and repeat bootstrap within the same logical request.
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAntigravityMissingProjectError"])(provider, result)) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(result.response, credentials.connectionId);
            }
            const isAntigravityStreamReadinessFailure = provider === "antigravity" && (result.errorCode === "STREAM_READINESS_TIMEOUT" || result.errorCode === "STREAM_EARLY_EOF" || result.errorType === "stream_timeout" || result.errorType === "stream_early_eof");
            if ((result.errorType === "stream_timeout" || result.errorType === "stream_early_eof") && !isAntigravityStreamReadinessFailure) {
                // Bug #3758: flaky OpenAI-compatible upstreams (e.g. NVIDIA NIM) sometimes
                // send HTTP 200 then close the SSE early with zero useful frames
                // (STREAM_EARLY_EOF). That is a transient upstream glitch, not a bad key — so
                // allow exactly ONE bounded same-connection re-attempt before surfacing the
                // 502. Do NOT retry STREAM_READINESS_TIMEOUT (a slow-but-alive upstream;
                // retrying would only double latency) and do NOT mark the account unavailable
                // for the early close.
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldRetryStreamEarlyEof"])(result.errorCode, streamEarlyEofRetries) && !hasForcedConnection) {
                    streamEarlyEofRetries += 1;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("STREAM", `${provider}/${model} closed the stream early before useful content — retrying once (attempt ${streamEarlyEofRetries})`);
                    continue;
                }
                // #8928: once the bounded same-connection retry is unavailable or exhausted,
                // remove only the affinity pin that still points at this failed connection. This lets
                // the next client retry select another eligible account without deleting a
                // pin that may already have moved to a healthy connection.
                const isTerminalStreamEarlyEof = result.errorCode === "STREAM_EARLY_EOF" || result.errorType === "stream_early_eof";
                if (isTerminalStreamEarlyEof && runtimeOptions.sessionAffinityKey) {
                    try {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["evictSessionAccountAffinityForConnection"])(runtimeOptions.sessionAffinityKey, provider, credentials.connectionId);
                    } catch  {
                    // Best-effort: the current response still surfaces the original 502.
                    }
                }
                // Stream readiness timeout is an upstream stall after an HTTP response was received,
                // not an account/quota failure. Do NOT mark the account unavailable here.
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(result.response, credentials?.connectionId);
            }
            if (isAntigravityStreamReadinessFailure) {
                const classificationError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStreamReadinessClassificationError"])(result);
                const { shouldFallback, cooldownMs } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["markAccountUnavailable"])(credentials.connectionId, result.status || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY, classificationError, provider, model, providerProfile, {
                    isCombo
                });
                if (shouldFallback && !hasForcedConnection) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `Antigravity connection ${accountId}... produced no useful stream content, trying fallback connection`);
                    if (Number.isFinite(cooldownMs) && cooldownMs > 0) {
                        lastCooldownMs = cooldownMs;
                        requestRetryLastCooldownMs = cooldownMs;
                    }
                    if (runtimeOptions.sessionAffinityKey) {
                        try {
                            const affinity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionAccountAffinity"])(runtimeOptions.sessionAffinityKey, provider);
                            if (affinity?.connectionId === credentials.connectionId) {
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteSessionAccountAffinity"])(runtimeOptions.sessionAffinityKey, provider);
                            }
                        } catch  {
                        // best-effort: selection also excludes this connection for the current retry.
                        }
                    }
                    excludedConnectionIds.add(credentials.connectionId);
                    lastError = classificationError;
                    lastStatus = result.status;
                    requestRetryLastError = classificationError;
                    requestRetryLastStatus = result.status;
                    continue;
                }
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(result.response, credentials?.connectionId);
            }
            const isAntigravityPreResponseTimeout = provider === "antigravity" && result.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT && (result.errorType === "upstream_timeout" || result.errorCode === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE"]);
            if (isAntigravityPreResponseTimeout) {
                const { shouldFallback, cooldownMs } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["markAccountUnavailable"])(credentials.connectionId, result.status, result.error || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE"], provider, model, providerProfile, {
                    isCombo
                });
                if (shouldFallback && !hasForcedConnection) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `Antigravity connection ${accountId}... timed out before response headers, trying fallback connection`);
                    if (Number.isFinite(cooldownMs) && cooldownMs > 0) {
                        lastCooldownMs = cooldownMs;
                        requestRetryLastCooldownMs = cooldownMs;
                    }
                    if (runtimeOptions.sessionAffinityKey) {
                        try {
                            const affinity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionAccountAffinity"])(runtimeOptions.sessionAffinityKey, provider);
                            if (affinity?.connectionId === credentials.connectionId) {
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteSessionAccountAffinity"])(runtimeOptions.sessionAffinityKey, provider);
                            }
                        } catch  {
                        // best-effort: selection also excludes this connection for the current retry.
                        }
                    }
                    excludedConnectionIds.add(credentials.connectionId);
                    lastError = result.error;
                    lastStatus = result.status;
                    requestRetryLastError = result.error;
                    requestRetryLastStatus = result.status;
                    continue;
                }
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(result.response, credentials?.connectionId);
            }
            if (result.errorType === "account_semaphore_capacity") {
                // Local concurrency pressure is not an upstream quota failure. Prefer another
                // account when possible; pinned combo steps fall through to combo orchestration.
                if (hasForcedConnection) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(result.response, credentials?.connectionId);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `Account ${accountId}... at local concurrency cap, trying fallback account`);
                excludedConnectionIds.add(credentials.connectionId);
                lastError = result.error;
                lastStatus = result.status;
                requestRetryLastError = result.error;
                requestRetryLastStatus = result.status;
                continue;
            }
            // Emergency fallback for budget exhaustion (402 / billing / quota keywords):
            // reroute to a free model (default provider/model: nvidia + openai/gpt-oss-120b) exactly once.
            // Combo targets never emergency-hop: the combo is the operator's fallback policy
            // (target-level orchestration plus the global fallback #689 after it), and a
            // per-target hop burns extra upstream calls against exhausted providers (#1731).
            if (!runtimeOptions.emergencyFallbackTried && !comboName) {
                const fallbackDecision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$emergencyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldUseFallback"])(Number(result.status || 0), String(result.error || ""), Array.isArray(body?.tools) && body.tools.length > 0);
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$emergencyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFallbackDecision"])(fallbackDecision)) {
                    const fallbackModelStr = `${fallbackDecision.provider}/${fallbackDecision.model}`;
                    const currentModelStr = `${provider}/${model}`;
                    if (fallbackModelStr !== currentModelStr) {
                        const fallbackBody = {
                            ...body,
                            model: fallbackModelStr
                        };
                        // Cap output on emergency fallback to avoid unexpected long responses.
                        const maxTokens = Math.min(Number(fallbackBody.max_tokens ?? fallbackBody.max_completion_tokens ?? fallbackDecision.maxOutputTokens) || fallbackDecision.maxOutputTokens, fallbackDecision.maxOutputTokens);
                        fallbackBody.max_tokens = maxTokens;
                        fallbackBody.max_completion_tokens = maxTokens;
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("EMERGENCY_FALLBACK", `${currentModelStr} -> ${fallbackModelStr} | reason=${fallbackDecision.reason}`);
                        const fallbackResponse = await handleSingleModelChat(fallbackBody, fallbackModelStr, clientRawRequest, request, comboName, apiKeyInfo, telemetry, {
                            ...runtimeOptions,
                            emergencyFallbackTried: true,
                            forcedConnectionId: null,
                            comboStepId: null,
                            comboExecutionKey: null
                        }, null, Boolean(comboName) // isCombo if comboName exists
                        );
                        if (fallbackResponse.ok) {
                            return fallbackResponse;
                        }
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("EMERGENCY_FALLBACK", `Emergency fallback to ${fallbackModelStr} failed with status ${fallbackResponse.status}. Resuming original provider account fallback.`);
                    }
                }
            }
            // 6. Daily quota error check - must be executed before markAccountUnavailable
            // Check if it's a daily quota exhausted error (e.g., ModelScope/Kimi "today's quota for model")
            // Daily quota lockout overrides subsequent rate_limited lockout, ensuring lockout until tomorrow 0:00
            let dailyQuotaExhausted = false;
            // #7360: prefer the full un-sanitized upstream text over result.error
            // (truncated to its first line for the client response body) — Gemini's
            // TPM/RPD metric name and retry hint live on lines 2-3, after the
            // generic "quota exceeded" preamble on line 1.
            const errorStr = String(result.rawMessage ?? result.error ?? "");
            const failureKind = result.status === 429 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSubscriptionQuotaText"])(errorStr.toLowerCase(), provider) ? "quota_exhausted" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classify429FromError"])({
                status: result.status,
                message: errorStr
            }) : undefined;
            if (result.status === 429 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isDailyQuotaExhausted"])(errorStr)) {
                // Parse which model is quota-limited
                const match = errorStr.match(/today's quota for model ([^,]+)/);
                const limitedModel = match ? match[1].trim() : model;
                const mlSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelLockoutSettings"])(runtimeOptions.cachedSettings);
                if (mlSettings.enabled && mlSettings.errorCodes.includes(result.status)) {
                    // Lock until tomorrow 00:00. Antigravity meters per exact model (#8630).
                    const lockScope = provider === "antigravity" ? "exact" : undefined;
                    const lockResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, credentials.connectionId, limitedModel, "quota_exhausted", result.status, 0, providerProfile, {
                        maxCooldownMs: mlSettings.maxCooldownMs,
                        scope: lockScope
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("MODEL_DAILY_QUOTA", JSON.stringify({
                        connection: credentials.connectionId.slice(0, 8),
                        model: limitedModel,
                        cooldownMs: lockResult.cooldownMs,
                        failureCount: lockResult.failureCount
                    }));
                }
                dailyQuotaExhausted = true;
            }
            // 7. Mark account as quota-exhausted only for explicit long-window quota signals.
            // A plain 429/high-traffic response should trigger fallback/cooldown, not poison
            // quotaCache as exhausted for 5 minutes while usage quota may still be available.
            if (!dailyQuotaExhausted) {
                const passthroughModels = credentials.providerSpecificData?.passthroughModels;
                if (result.status === 429 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shouldMarkAccountExhaustedFrom429"])(provider, model, passthroughModels, failureKind)) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markAccountExhaustedFrom429"])(credentials.connectionId, provider);
                }
            }
            // 8. Fallback to next account
            // A3 guard: if 401 and connection has extra keys, skip connection-level disable
            // (key-level failure already recorded in chatCore.ts via T07)
            // Check extra keys directly from credentials for reliability across restarts
            const hasExtraKeys = (credentials.providerSpecificData?.extraApiKeys ?? []).length > 0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["connectionHasExtraKeys"])(credentials.connectionId);
            const is401 = result.status === 401;
            const skipConnectionDisable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldSkipConnDisable"])(result, is401, hasExtraKeys, provider);
            const { shouldFallback, cooldownMs } = skipConnectionDisable ? {
                shouldFallback: false,
                cooldownMs: 0
            } : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["markAccountUnavailable"])(credentials.connectionId, result.status, errorStr, provider, model, providerProfile, {
                persistUnavailableState: !(isCombo && result.status === 429 && (failureKind === "rate_limit" || failureKind === "transient")),
                isCombo
            });
            if (shouldFallback) {
                if (Number.isFinite(cooldownMs) && cooldownMs > 0) {
                    lastCooldownMs = cooldownMs;
                    requestRetryLastCooldownMs = cooldownMs;
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `Account ${accountId}... unavailable (${result.status}), trying fallback`);
                // #6219: evict the sticky session pin when the pinned account fails over,
                // otherwise the next request re-pins the same throttled account until
                // restart. Guarded by connection match so a pin for a different (healthy)
                // account is left intact.
                if (runtimeOptions.sessionAffinityKey) {
                    try {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["evictSessionAccountAffinityForConnection"])(runtimeOptions.sessionAffinityKey, provider, credentials.connectionId);
                    } catch  {
                    // best-effort: selection also excludes this connection for the current retry.
                    }
                }
                excludedConnectionIds.add(credentials.connectionId);
                lastError = result.error;
                lastStatus = result.status;
                requestRetryLastError = result.error;
                requestRetryLastStatus = result.status;
                continue;
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatPredicates$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldTripProviderBreakerForResult"])(result, isCombo, forceLiveComboTest)) {
                breaker._onFailure();
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$handlers$2f$chatHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withSelectedConnectionHeader"])(result.response, credentials?.connectionId);
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_sse_0xgavsk._.js.map