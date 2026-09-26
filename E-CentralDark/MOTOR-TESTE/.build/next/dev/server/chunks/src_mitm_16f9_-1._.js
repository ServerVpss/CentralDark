module.exports = [
"[project]/src/mitm/maskSecrets.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maskSecret",
    ()=>maskSecret
]);
/**
 * Secret masking utilities for MITM traffic inspection.
 * Applied to all headers/bodies before any log or broadcast.
 * Regex patterns are pre-compiled (order matters: BEARER first).
 *
 * Pattern sources: plano 11 §4.8 (origin: llm-interceptor proxy.py:310)
 */ // Pre-compiled regex patterns — ORDER IS SIGNIFICANT (BEARER must run first).
// BEARER matches the token after a standalone "Bearer " — NOT only after a
// literal "authorization:" prefix. sanitizeHeaders() masks header *values*
// ("Bearer <token>") with the key already stripped, so a prefix-anchored regex
// never fired there and short/opaque-but-<40 tokens leaked into the inspector
// (found by the AgentBridge live capture). The char class is bounded + linear
// (no nested quantifiers) to stay ReDoS-safe.
const BEARER = /(\bBearer\s+)[A-Za-z0-9._~+/-]+=*/gi;
const SK_KEY = /\b(sk|ak|pk)-[A-Za-z0-9_-]{16,}\b/g;
const LONG_TOKEN = /\b[A-Za-z0-9_-]{40,}\b/g;
function maskSecret(value) {
    return value.replace(BEARER, "$1***").replace(SK_KEY, (m)=>`${m.slice(0, 6)}…${m.slice(-2)}`).replace(LONG_TOKEN, (m)=>`${m.slice(0, 4)}…${m.slice(-2)}`);
}
}),
"[project]/src/mitm/sanitizeHeaders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeHeaders",
    ()=>sanitizeHeaders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/maskSecrets.ts [app-route] (ecmascript)");
;
;
/**
 * Header names whose values must be masked (case-insensitive).
 * These carry credentials/tokens that must not appear in logs or broadcasts.
 */ const SECRET_HEADER_NAMES = new Set([
    "authorization",
    "cookie",
    // `set-cookie` is the RESPONSE-side credential header — upstream session/CSRF
    // cookies must be masked too, else they leak verbatim into inspector JSON.
    "set-cookie",
    "x-api-key",
    "api-key",
    "bearer",
    "proxy-authorization"
]);
function isSecretHeader(name) {
    return SECRET_HEADER_NAMES.has(name.toLowerCase());
}
function sanitizeHeaders(headers) {
    const result = {};
    for (const [key, value] of Object.entries(headers)){
        if (value === undefined || value === null) continue;
        const lowerKey = key.toLowerCase();
        // Remove denylist headers (hop-by-hop, framing)
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isForbiddenUpstreamHeaderName"])(lowerKey)) continue;
        // Normalize array values
        const strValue = Array.isArray(value) ? value.join(", ") : String(value);
        // Mask secret header values
        if (isSecretHeader(lowerKey)) {
            // `set-cookie` carries an entire session/CSRF cookie value that maskSecret's
            // format heuristics (Bearer / sk- / ≥40-char) do NOT catch, so it would leak
            // verbatim into inspector JSON — fully redact it (SECURITY_AUDIT M6).
            result[lowerKey] = lowerKey === "set-cookie" ? "[REDACTED]" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskSecret"])(strValue);
        } else {
            result[lowerKey] = strValue;
        }
    }
    return result;
}
}),
"[project]/src/mitm/handlers/base.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * MitmHandlerBase — abstract base class for all AgentBridge MITM handlers.
 *
 * Contract: `_tasks/features-v3.8.6/refactorpages/_orchestration/master-plan-group-A.md` §3.5.
 *
 * The base handles the cross-cutting concerns shared by every IDE-agent handler:
 *   - request body capture + secret masking
 *   - source model extraction
 *   - forwarding to the OmniRoute router (Next.js API)
 *   - SSE piping
 *   - optional Traffic Inspector hook (F4 — loaded via dynamic import; no-op when
 *     `agentBridgeHook.ts` is not yet present in the build)
 *
 * Concrete handlers live in `src/mitm/handlers/<agentId>.ts`.
 */ __turbopack_context__.s([
    "MitmHandlerBase",
    ()=>MitmHandlerBase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$perf_hooks__$5b$external$5d$__$28$node$3a$perf_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/maskSecrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/sanitizeHeaders.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * Best-effort error sanitizer.
 * Routes through `@omniroute/open-sse/utils/error.sanitizeErrorMessage` (Hard Rule #12)
 * when available; falls back to a safe `String(err)` if the module is not present
 * (e.g. unit tests that don't load the full open-sse barrel).
 */ async function safeErrorMessage(err) {
    try {
        const mod = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [app-route] (ecmascript, async loader)");
        if (typeof mod.sanitizeErrorMessage === "function") {
            return mod.sanitizeErrorMessage(err);
        }
    } catch  {
    // Module not available — fall back to plain coercion.
    }
    if (err instanceof Error) return err.message || err.name;
    return String(err);
}
/**
 * Dynamic-import hook into the Traffic Inspector buffer (F4).
 * Returns `null` if the inspector module has not been merged yet — handlers
 * remain fully functional standalone.
 */ async function loadAgentBridgeHook() {
    try {
        const mod = await __turbopack_context__.A("[project]/src/mitm/inspector/agentBridgeHook.ts [app-route] (ecmascript, async loader)");
        return mod;
    } catch  {
        return null;
    }
}
class MitmHandlerBase {
    /**
   * Whether to capture the request body for the Traffic Inspector.
   * Override to return `false` for endpoints that never need body capture
   * (e.g. health probes).
   */ shouldCaptureBody() {
        return true;
    }
    /**
   * Extract the requested model from the upstream-bound body.
   * Default: parses JSON and reads the `model` property. Override for non-JSON
   * payloads or providers that nest the model elsewhere (e.g. Gemini uses
   * the URL path, but those handlers can override).
   */ extractSourceModel(body) {
        try {
            const json = JSON.parse(body.toString());
            if (json && typeof json === "object" && typeof json.model === "string") {
                return json.model;
            }
        } catch  {
        // Non-JSON body — caller may have a custom extractor.
        }
        return null;
    }
    /**
   * Forward the prepared body to the OmniRoute router (Next.js API).
   * Adds AgentBridge correlation headers (`x-omniroute-source`, `x-omniroute-agent`)
   * and forwards a sanitized copy of the original request headers (secrets masked,
   * hop-by-hop stripped).
   */ async fetchRouter(body, path, headers) {
        const base = process.env.OMNIROUTE_BASE_URL ?? "http://127.0.0.1:20128";
        const url = `${base.replace(/\/+$/, "")}${path}`;
        const apiKey = process.env.ROUTER_API_KEY ?? "";
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...apiKey ? {
                    Authorization: `Bearer ${apiKey}`
                } : {},
                "x-omniroute-source": "agent-bridge",
                "x-omniroute-agent": this.agentId,
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeHeaders"])(headers)
            },
            body: typeof body === "string" ? body : JSON.stringify(body)
        });
    }
    /**
   * Pipe an SSE (or any chunked) upstream Response straight to the downstream
   * ServerResponse, optionally invoking `onChunk` for each received Buffer.
   *
   * Writes SSE-friendly headers before the first chunk (only if `res.headersSent`
   * is still false — handlers MAY have set custom headers first).
   */ async pipeSSE(upstream, res, onChunk) {
        if (!upstream.body) {
            if (!res.headersSent) res.writeHead(upstream.status, {
                "Content-Type": "application/json"
            });
            res.end();
            return;
        }
        if (!res.headersSent) {
            res.writeHead(upstream.status, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no"
            });
        }
        const reader = upstream.body.getReader();
        try {
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                const buf = Buffer.from(value);
                if (onChunk) {
                    try {
                        onChunk(buf);
                    } catch  {
                    // Inspector hook must never break the upstream pipe.
                    }
                }
                res.write(buf);
            }
        } finally{
            try {
                res.end();
            } catch  {
            // Response may already be closed by client disconnect.
            }
        }
    }
    /**
   * Start a Traffic Inspector entry for this request. Always succeeds — if the
   * inspector module is not present (F4 not yet merged), this returns a local
   * stub entry without publishing to the buffer.
   */ async hookBufferStart(req, body, mappedModel) {
        const hook = await loadAgentBridgeHook();
        if (hook?.recordRequestStart) {
            try {
                return await hook.recordRequestStart({
                    req,
                    body,
                    agentId: this.agentId,
                    mappedModel,
                    sourceModel: this.extractSourceModel(body)
                });
            } catch  {
            // Hook should never break interception — fall through to local stub.
            }
        }
        // Local stub when F4 hook is unavailable.
        return {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            source: "agent-bridge",
            agent: this.agentId,
            timestamp: new Date().toISOString(),
            method: req.method ?? "POST",
            host: typeof req.headers.host === "string" ? req.headers.host : "",
            path: req.url ?? "/",
            requestHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeHeaders"])(req.headers),
            requestBody: this.shouldCaptureBody() ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskSecret"])(body.toString()) : null,
            requestSize: body.length,
            responseHeaders: {},
            responseBody: null,
            responseSize: 0,
            sourceModel: this.extractSourceModel(body),
            mappedModel,
            status: "in-flight"
        };
    }
    /**
   * Update a previously published Traffic Inspector entry with completion data.
   * No-op when the inspector module is not present.
   *
   * Per master-plan §3.5: the canonical no-arg form `hookBufferUpdate(intercepted)`
   * must update the buffer using completion fields already present on `intercepted`
   * (status, responseBody, responseHeaders, responseSize, *LatencyMs). When the
   * extended `opts` form is used (legacy internal callers), it overrides those
   * fields explicitly. Both forms route through `recordRequestComplete` so the
   * inspector receives a consistent shape.
   */ hookBufferUpdate(intercepted, opts) {
        const finalOpts = opts ?? {
            status: typeof intercepted.status === "number" ? intercepted.status : 0,
            responseHeaders: intercepted.responseHeaders,
            responseBody: intercepted.responseBody,
            responseSize: intercepted.responseSize,
            proxyLatencyMs: intercepted.proxyLatencyMs ?? 0,
            upstreamLatencyMs: intercepted.upstreamLatencyMs ?? 0
        };
        void loadAgentBridgeHook().then((hook)=>{
            if (hook?.recordRequestComplete) {
                try {
                    hook.recordRequestComplete(intercepted, finalOpts);
                } catch  {
                // Hook should never break interception.
                }
            }
        });
    }
    /**
   * Report a failed request to the Traffic Inspector.
   * No-op when the inspector module is not present.
   */ async hookBufferError(intercepted, err) {
        const hook = await loadAgentBridgeHook();
        if (hook?.recordRequestError) {
            try {
                hook.recordRequestError(intercepted, err);
            } catch  {
            // Hook should never break interception.
            }
        }
    }
    /**
   * Render a Hard-Rule-#12-compliant error JSON body and send via `res`.
   * Returns the sanitized error string so callers may also log it.
   */ async writeError(res, err, statusCode = 500) {
        const safe = await safeErrorMessage(err);
        if (!res.headersSent) {
            res.writeHead(statusCode, {
                "Content-Type": "application/json"
            });
        }
        res.end(JSON.stringify({
            error: {
                message: safe,
                type: "mitm_error"
            }
        }));
        return safe;
    }
    /**
   * Convenience helper for handlers that want a single performance.now() reading.
   */ now() {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$perf_hooks__$5b$external$5d$__$28$node$3a$perf_hooks$2c$__cjs$29$__["performance"].now();
    }
}
}),
"[project]/src/mitm/handlers/antigravity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Antigravity IDE handler.
 *
 * Antigravity (the Gemini-based IDE) sends requests in native Gemini
 * GenerateContent format (`contents`, `systemInstruction`, `generationConfig`,
 * `thinkingConfig`, …). The OmniRoute router endpoint `/v1/chat/completions`
 * expects OpenAI Chat Completions format, so the raw Gemini body must be
 * converted before forwarding — otherwise the unknown fields are either
 * ignored or cause upstream providers to return a 400 "invalid argument"
 * error (especially with thinking-capable models such as
 * `ag/claude-opus-4-6-thinking`).
 *
 * Pipeline:
 *   - parse the incoming Gemini JSON body,
 *   - convert it to an OpenAI chat.completions body (model = mapped model),
 *   - forward to `/v1/chat/completions` on the OmniRoute router,
 *   - pipe the SSE response back to the IDE.
 *
 * Non-regressive: any change here must keep the Antigravity flow working as
 * before (see `tests/unit/mitm-handler-antigravity.test.ts`).
 */ __turbopack_context__.s([
    "AntigravityHandler",
    ()=>AntigravityHandler,
    "convertGeminiToOpenAI",
    ()=>convertGeminiToOpenAI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$handlers$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/handlers/base.ts [app-route] (ecmascript)");
;
/**
 * Return the object that actually holds the Gemini conversation fields. Antigravity's
 * cloudcode-pa envelope wraps them under `.request`; the legacy `/v1beta` path puts them at
 * the top level. Without this unwrap, a real Antigravity request yields zero messages, so
 * the upstream gets an empty conversation and the IDE prompt hangs (#4294).
 */ function resolveGeminiSource(body) {
    const inner = body.request;
    if (inner && typeof inner === "object" && ("contents" in inner || "systemInstruction" in inner || "generationConfig" in inner)) {
        return inner;
    }
    return body;
}
function joinPartsText(parts) {
    return (parts || []).map((p)=>p.text).filter((t)=>Boolean(t)).join("\n");
}
function convertGeminiToOpenAI(geminiBody, model, stream) {
    // Unwrap the cloudcode-pa envelope (`.request`) used by the real Antigravity IDE; fall
    // back to the top level for the legacy `/v1beta` shape. (#4294)
    const src = resolveGeminiSource(geminiBody);
    const messages = [];
    // System instruction
    if (src.systemInstruction) {
        const systemText = joinPartsText(src.systemInstruction.parts);
        if (systemText) messages.push({
            role: "system",
            content: systemText
        });
    }
    // Chat turns
    for (const content of src.contents || []){
        const role = content.role === "model" ? "assistant" : "user";
        messages.push({
            role,
            content: joinPartsText(content.parts)
        });
    }
    const openaiBody = {
        model,
        messages,
        stream: !!stream
    };
    const cfg = src.generationConfig || {};
    if (cfg.maxOutputTokens != null) openaiBody.max_tokens = cfg.maxOutputTokens;
    if (cfg.temperature != null) openaiBody.temperature = cfg.temperature;
    if (cfg.topP != null) openaiBody.top_p = cfg.topP;
    if (cfg.stopSequences?.length) openaiBody.stop = cfg.stopSequences;
    return openaiBody;
}
class AntigravityHandler extends __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$handlers$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MitmHandlerBase"] {
    agentId = "antigravity";
    async intercept(req, res, body, mappedModel) {
        const startedAt = this.now();
        const intercepted = await this.hookBufferStart(req, body, mappedModel);
        try {
            const geminiBody = JSON.parse(body.toString());
            // Streaming intent: Antigravity uses :streamGenerateContent for streaming.
            const isStream = (req.url || "").includes(":streamGenerateContent");
            const payload = convertGeminiToOpenAI(geminiBody, mappedModel, isStream);
            const upstreamStart = this.now();
            const upstream = await this.fetchRouter(payload, "/v1/chat/completions", req.headers);
            if (!upstream.ok) {
                const errText = await upstream.text().catch(()=>"");
                throw new Error(`OmniRoute ${upstream.status}: ${errText}`);
            }
            let collected = "";
            await this.pipeSSE(upstream, res, (chunk)=>{
                collected += chunk.toString();
            });
            const total = this.now() - startedAt;
            this.hookBufferUpdate(intercepted, {
                status: upstream.status,
                responseHeaders: Object.fromEntries(upstream.headers.entries()),
                responseBody: collected,
                responseSize: Buffer.byteLength(collected),
                proxyLatencyMs: upstreamStart - startedAt,
                upstreamLatencyMs: total - (upstreamStart - startedAt)
            });
        } catch (err) {
            await this.hookBufferError(intercepted, err);
            await this.writeError(res, err);
        }
    }
}
}),
];

//# sourceMappingURL=src_mitm_16f9_-1._.js.map