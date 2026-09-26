module.exports = [
"[project]/src/mitm/inspector/contextKey.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeContextKey",
    ()=>computeContextKey,
    "extractSystemPrompt",
    ()=>extractSystemPrompt
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function extractSystemPrompt(req) {
    if (!req.requestBody) return null;
    let parsed;
    try {
        parsed = JSON.parse(req.requestBody);
    } catch  {
        return null;
    }
    if (!parsed || typeof parsed !== "object") return null;
    const body = parsed;
    // 1. Anthropic messages API — top-level `system` field (string or array)
    if (typeof body.system === "string" && body.system.length > 0) {
        return body.system;
    }
    if (Array.isArray(body.system)) {
        const parts = body.system.map((p)=>{
            if (typeof p === "object" && p !== null && "text" in p) {
                return String(p.text);
            }
            return null;
        }).filter(Boolean);
        if (parts.length > 0) return parts.join("\n");
    }
    // 2. OpenAI/Anthropic chat — messages[0] with role=system
    if (Array.isArray(body.messages)) {
        const first = body.messages[0];
        if (first && typeof first === "object" && "role" in first && first.role === "system") {
            const content = first.content;
            if (typeof content === "string") return content;
            if (Array.isArray(content)) {
                const texts = content.map((c)=>{
                    if (typeof c === "object" && c !== null && "text" in c) {
                        return String(c.text);
                    }
                    return null;
                }).filter(Boolean);
                if (texts.length > 0) return texts.join("\n");
            }
        }
    }
    // 3. Gemini — systemInstruction.parts[].text
    if (body.systemInstruction && typeof body.systemInstruction === "object" && "parts" in body.systemInstruction) {
        const parts = body.systemInstruction.parts;
        if (Array.isArray(parts)) {
            const texts = parts.map((p)=>{
                if (typeof p === "object" && p !== null && "text" in p) {
                    return String(p.text);
                }
                return null;
            }).filter(Boolean);
            if (texts.length > 0) return texts.join("\n");
        }
    }
    return null;
}
function computeContextKey(req) {
    const sys = extractSystemPrompt(req);
    if (!sys) return null;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(sys).digest("hex").slice(0, 12);
}
}),
"[project]/src/mitm/inspector/kindDetector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectKind",
    ()=>detectKind
]);
/**
 * LLM host patterns — 18+ known LLM API hostnames.
 */ const LLM_HOST_PATTERNS = [
    /^api\.openai\.com$/i,
    /^api\.anthropic\.com$/i,
    /^generativelanguage\.googleapis\.com$/i,
    /^.*\.openai\.azure\.com$/i,
    /^api\.mistral\.ai$/i,
    /^api\.deepseek\.com$/i,
    /^api\.groq\.com$/i,
    /^api\.together\.xyz$/i,
    /^api\.fireworks\.ai$/i,
    /^api\.cohere\.com$/i,
    /^api\.perplexity\.ai$/i,
    /^.*\.huggingface\.co$/i,
    /^openrouter\.ai$/i,
    /^api\.x\.ai$/i,
    /^api\.moonshot\.ai$/i,
    /^bigmodel\.cn$/i,
    /^.*\.bytedance\.com$/i,
    /^.*\.aliyun\.com$/i
];
const LLM_PATH_PATTERNS = [
    /\/(v1|v1beta)\/(chat\/)?completions/i,
    /\/messages/i,
    /\/embeddings/i,
    /\/responses/i,
    /\/models/i,
    /\/generateContent/i,
    /\/streamGenerateContent/i
];
const LLM_BODY_SHAPES = [
    {
        key: "messages",
        arrayItem: true
    },
    {
        key: "contents",
        arrayItem: true
    },
    {
        key: "prompt"
    },
    {
        key: "input"
    },
    {
        key: "model"
    }
];
function matchesShape(json, shape) {
    if (!(shape.key in json)) return false;
    if (shape.arrayItem) {
        return Array.isArray(json[shape.key]);
    }
    return true;
}
const LLM_UA_PATTERN = /codex|claude|gemini|antigravity|kiro|copilot|cursor/i;
function detectKind(req) {
    if (LLM_HOST_PATTERNS.some((re)=>re.test(req.host))) return "llm";
    if (LLM_PATH_PATTERNS.some((re)=>re.test(req.path))) return "llm";
    let bodySignalFired = false;
    if (req.requestBody) {
        try {
            const parsed = JSON.parse(req.requestBody);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                const body = parsed;
                if (LLM_BODY_SHAPES.some((shape)=>matchesShape(body, shape))) return "llm";
                // Body parsed as a JSON object but had no LLM shape — clear app signal.
                bodySignalFired = true;
            }
        } catch  {
        // Non-JSON body — cannot detect from body
        }
    }
    const ua = req.requestHeaders["user-agent"] ?? req.requestHeaders["User-Agent"] ?? "";
    if (LLM_UA_PATTERN.test(ua)) return "llm";
    // Return "app" only when at least one non-LLM signal fired (a parseable JSON body
    // with no LLM shape), indicating the request has recognisable app context.
    // Otherwise nothing was detectable — return "unknown".
    return bodySignalFired ? "app" : "unknown";
}
}),
"[project]/src/mitm/inspector/buffer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrafficBuffer",
    ()=>TrafficBuffer,
    "globalTrafficBuffer",
    ()=>globalTrafficBuffer
]);
/**
 * In-memory ring buffer for intercepted traffic.
 *
 * Stores up to `INSPECTOR_BUFFER_SIZE` (default 1000) entries; rotates
 * oldest-first when capacity is reached. Auto-applies kind detection and
 * context-key fingerprinting on push, and broadcasts mutations to all
 * subscribers (WebSocket consumers).
 *
 * Body sizes are clamped to `INSPECTOR_MAX_BODY_KB` (default 1024 KiB) and
 * marked with a truncation suffix so the UI does not have to guess.
 *
 * See `_orchestration/master-plan-group-A.md` §3.6 and
 * `12-traffic-inspector.plan.md` §4.1.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$contextKey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/contextKey.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$kindDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/kindDetector.ts [app-route] (ecmascript)");
;
;
const TRUNCATION_MARKER = "\n…(truncated for performance)";
function parseEnvNumber(value, fallback) {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
}
function getMaxBodyBytes() {
    const kb = parseEnvNumber(process.env.INSPECTOR_MAX_BODY_KB, 1024);
    return Math.max(1, Math.floor(kb)) * 1024;
}
function capBody(body, maxBytes) {
    if (body == null) return body;
    if (body.length <= maxBytes) return body;
    return body.slice(0, maxBytes) + TRUNCATION_MARKER;
}
function statusBucket(status) {
    if (status === "error") return "error";
    if (status === "in-flight") return "in-flight";
    if (typeof status !== "number") return "unknown";
    if (status >= 200 && status < 300) return "2xx";
    if (status >= 300 && status < 400) return "3xx";
    if (status >= 400 && status < 500) return "4xx";
    if (status >= 500 && status < 600) return "5xx";
    return "unknown";
}
function matchesFilters(req, filters) {
    if (!filters) return true;
    if (filters.profile && filters.profile !== "all") {
        if (filters.profile === "llm" && req.detectedKind !== "llm") return false;
        if (filters.profile === "custom" && req.source !== "custom-host") return false;
    }
    if (filters.host && req.host !== filters.host) return false;
    if (filters.agent && req.agent !== filters.agent) return false;
    if (filters.source && req.source !== filters.source) return false;
    if (filters.sessionId && req.sessionId !== filters.sessionId) return false;
    if (filters.status) {
        const bucket = statusBucket(req.status);
        if (bucket !== filters.status) return false;
    }
    return true;
}
class TrafficBuffer {
    buffer = [];
    subscribers = new Set();
    maxSize;
    maxBodyBytes;
    constructor(maxSize = parseEnvNumber(process.env.INSPECTOR_BUFFER_SIZE, 1000), maxBodyBytes = getMaxBodyBytes()){
        this.maxSize = Math.max(1, Math.floor(maxSize));
        this.maxBodyBytes = Math.max(1, Math.floor(maxBodyBytes));
    }
    /**
   * Append a new intercepted request. Applies kind detection and
   * context-key fingerprinting if missing, and clamps body sizes.
   * Broadcasts a `new` event to all subscribers.
   */ push(req) {
        if (!req.detectedKind) {
            req.detectedKind = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$kindDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectKind"])(req);
        }
        if (!req.contextKey && req.detectedKind === "llm") {
            const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$contextKey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeContextKey"])(req);
            if (key) req.contextKey = key;
        }
        req.requestBody = capBody(req.requestBody, this.maxBodyBytes);
        req.responseBody = capBody(req.responseBody, this.maxBodyBytes);
        this.buffer.push(req);
        while(this.buffer.length > this.maxSize){
            this.buffer.shift();
        }
        this.broadcast({
            type: "new",
            data: req
        });
    }
    /**
   * Update an existing entry in place by id. No-op if the id is unknown
   * (e.g. already rotated out). Broadcasts an `update` event on success.
   */ update(id, req) {
        const idx = this.buffer.findIndex((r)=>r.id === id);
        if (idx < 0) return;
        req.requestBody = capBody(req.requestBody, this.maxBodyBytes);
        req.responseBody = capBody(req.responseBody, this.maxBodyBytes);
        this.buffer[idx] = req;
        this.broadcast({
            type: "update",
            data: req
        });
    }
    /**
   * Lookup by id (linear scan — buffer is bounded to ~1000 entries).
   */ get(id) {
        return this.buffer.find((r)=>r.id === id) ?? null;
    }
    /**
   * Return a filtered snapshot of the buffer. Filtering is in-memory and
   * cheap (~O(maxSize)). A new array is returned each call.
   */ list(filters) {
        if (!filters) return [
            ...this.buffer
        ];
        return this.buffer.filter((r)=>matchesFilters(r, filters));
    }
    /**
   * Empty the buffer and notify subscribers. Subscriber count is preserved.
   */ clear() {
        this.buffer = [];
        this.broadcast({
            type: "clear"
        });
    }
    /**
   * Register a listener. Immediately receives a `snapshot` event with the
   * current buffer state. Returns an `unsubscribe` function.
   */ subscribe(fn) {
        this.subscribers.add(fn);
        try {
            fn({
                type: "snapshot",
                data: [
                    ...this.buffer
                ]
            });
        } catch  {
        // a subscriber's snapshot handler failure must not break subscription
        }
        return ()=>{
            this.subscribers.delete(fn);
        };
    }
    /**
   * Current subscriber count — exposed for tests / diagnostics.
   */ subscriberCount() {
        return this.subscribers.size;
    }
    /**
   * Current entry count — exposed for tests / diagnostics.
   */ size() {
        return this.buffer.length;
    }
    broadcast(ev) {
        for (const fn of this.subscribers){
            try {
                fn(ev);
            } catch  {
            // one subscriber's failure must not block others
            }
        }
    }
}
const globalTrafficBuffer = new TrafficBuffer();
}),
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
"[project]/src/app/api/tools/traffic-inspector/internal/ingest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "getIngestTokenForBootstrap",
    ()=>getIngestTokenForBootstrap
]);
/**
 * POST /api/tools/traffic-inspector/internal/ingest
 *
 * Internal endpoint consumed by `server.cjs` (D4 fallback) to push
 * intercepted request data into the traffic buffer when the request does
 * NOT pass through a TypeScript handler that already calls
 * `agentBridgeHook.ts`.
 *
 * Security model (double LOCAL_ONLY):
 *   1. `isLocalOnlyPath("/api/tools/traffic-inspector/")` blocks all non-
 *      loopback callers unconditionally — this is handled by the authz pipeline.
 *   2. The shared secret `INSPECTOR_INTERNAL_INGEST_TOKEN` (set in .env or
 *      auto-generated at process boot) must match the `Authorization: Bearer`
 *      header. This prevents any other loopback process from stuffing the buffer.
 *
 * Body: partial `InterceptedRequest` — only `id`, `timestamp`, `method`,
 * `host`, `path` are required; all other fields default.
 *
 * LOCAL_ONLY enforced by routeGuard + token gate below.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$buffer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/buffer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/maskSecrets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/sanitizeHeaders.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
// ── Token management ────────────────────────────────────────────────────────
let _cachedToken = null;
function getIngestToken() {
    if (_cachedToken) return _cachedToken;
    const env = process.env.INSPECTOR_INTERNAL_INGEST_TOKEN;
    if (env && env.length >= 16) {
        _cachedToken = env;
    } else {
        // Auto-generate on first call; persists for the lifetime of the process.
        _cachedToken = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "");
    }
    return _cachedToken;
}
function tokenMatches(received) {
    const expected = getIngestToken();
    if (!received || !expected) return false;
    try {
        const a = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(expected).digest();
        const b = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(received).digest();
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(a, b);
    } catch  {
        return false;
    }
}
// ── Partial schema (only required fields; rest optional) ───────────────────
const IngestBodySchema = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InterceptedRequestSchema"].partial().required({
    id: true,
    timestamp: true,
    method: true,
    host: true,
    path: true,
    source: true,
    requestHeaders: true,
    requestSize: true,
    responseHeaders: true,
    responseSize: true,
    status: true
});
async function POST(request) {
    // Token gate (second layer after LOCAL_ONLY IP check).
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!tokenMatches(token)) {
        return new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(403, "Invalid or missing ingest token")), {
            status: 403,
            headers: {
                "content-type": "application/json"
            }
        });
    }
    let body;
    try {
        body = await request.json();
    } catch  {
        return new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(400, "Invalid JSON body")), {
            status: 400,
            headers: {
                "content-type": "application/json"
            }
        });
    }
    const parsed = IngestBodySchema.safeParse(body);
    if (!parsed.success) {
        return new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(400, parsed.error.issues[0]?.message ?? "Validation error")), {
            status: 400,
            headers: {
                "content-type": "application/json"
            }
        });
    }
    try {
        // Fill in any missing optional fields with sensible defaults, then mask
        // secrets and strip hop-by-hop headers before the entry enters the buffer.
        // The proxy (server.cjs) sends bodies + headers raw over the token-gated
        // loopback ingest; sanitization is centralized here so the inspector never
        // stores bearer tokens / API keys (Hard Rule #12).
        const data = parsed.data;
        const req = {
            requestBody: null,
            responseBody: null,
            ...data,
            requestHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeHeaders"])(data.requestHeaders || {}),
            responseHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeHeaders"])(data.responseHeaders || {}),
            requestBody: data.requestBody != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskSecret"])(data.requestBody) : null,
            responseBody: data.responseBody != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskSecret"])(data.responseBody) : null
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$buffer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalTrafficBuffer"].push(req);
        return Response.json({
            ok: true,
            id: req.id
        }, {
            status: 200
        });
    } catch (err) {
        const msg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
        return new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(500, msg || "Ingest failed")), {
            status: 500,
            headers: {
                "content-type": "application/json"
            }
        });
    }
}
function getIngestTokenForBootstrap() {
    return getIngestToken();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_20vtja_._.js.map