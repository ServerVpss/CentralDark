module.exports = [
"[project]/open-sse/utils/clinepassEnvelope.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ClinePass upstream wraps non-streaming JSON responses in a {success, data}
// envelope (errors use {success: false, error}). Detect and unwrap; pass the
// payload through untouched for every other provider / shape.
__turbopack_context__.s([
    "unwrapClinepassEnvelope",
    ()=>unwrapClinepassEnvelope
]);
function unwrapClinepassEnvelope(body, provider) {
    if (provider !== "clinepass") return {
        body,
        error: null
    };
    if (!body || typeof body !== "object" || Array.isArray(body)) return {
        body,
        error: null
    };
    const record = body;
    if (!("success" in record)) return {
        body,
        error: null
    };
    if (record.success === false) {
        const rawError = record.error;
        const message = typeof rawError === "string" ? rawError : (rawError && typeof rawError === "object" ? rawError.message : undefined) || (typeof record.message === "string" ? record.message : undefined) || "Upstream error";
        const statusCode = typeof record.statusCode === "number" ? record.statusCode : null;
        return {
            body: null,
            error: {
                message,
                status: statusCode
            }
        };
    }
    if (record.success === true && "data" in record && record.data !== null && typeof record.data === "object") {
        return {
            body: record.data,
            error: null
        };
    }
    return {
        body,
        error: null
    };
}
}),
"[project]/open-sse/config/errorConfig.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BACKOFF_CONFIG",
    ()=>BACKOFF_CONFIG,
    "COOLDOWN_MS",
    ()=>COOLDOWN_MS,
    "DEFAULT_ERROR_MESSAGES",
    ()=>DEFAULT_ERROR_MESSAGES,
    "ERROR_RULES",
    ()=>ERROR_RULES,
    "ERROR_TYPES",
    ()=>ERROR_TYPES,
    "TRANSIENT_COOLDOWN_MS",
    ()=>TRANSIENT_COOLDOWN_MS,
    "calculateBackoffCooldown",
    ()=>calculateBackoffCooldown,
    "findMatchingErrorRule",
    ()=>findMatchingErrorRule,
    "getDefaultErrorMessage",
    ()=>getDefaultErrorMessage,
    "getErrorInfo",
    ()=>getErrorInfo,
    "isNimFunctionDegraded",
    ()=>isNimFunctionDegraded,
    "matchErrorRuleByStatus",
    ()=>matchErrorRuleByStatus,
    "matchErrorRuleByText",
    ()=>matchErrorRuleByText,
    "serviceSupervisorCooldown",
    ()=>serviceSupervisorCooldown
]);
const ERROR_TYPES = {
    400: {
        type: "invalid_request_error",
        code: "bad_request"
    },
    401: {
        type: "authentication_error",
        code: "invalid_api_key"
    },
    402: {
        type: "billing_error",
        code: "payment_required"
    },
    403: {
        type: "permission_error",
        code: "insufficient_quota"
    },
    404: {
        type: "invalid_request_error",
        code: "model_not_found"
    },
    406: {
        type: "invalid_request_error",
        code: "model_not_supported"
    },
    429: {
        type: "rate_limit_error",
        code: "rate_limit_exceeded"
    },
    499: {
        type: "client_disconnected",
        code: "client_disconnected"
    },
    500: {
        type: "server_error",
        code: "internal_server_error"
    },
    502: {
        type: "server_error",
        code: "bad_gateway"
    },
    503: {
        type: "server_error",
        code: "service_unavailable"
    },
    504: {
        type: "server_error",
        code: "gateway_timeout"
    }
};
const DEFAULT_ERROR_MESSAGES = {
    400: "Bad request",
    401: "Invalid API key provided",
    402: "Payment required",
    403: "You exceeded your current quota",
    404: "Model not found",
    406: "Model not supported",
    429: "Rate limit exceeded",
    499: "Client disconnected",
    500: "Internal server error",
    502: "Bad gateway - upstream provider error",
    503: "Service temporarily unavailable",
    504: "Gateway timeout"
};
const BACKOFF_CONFIG = {
    base: 1000,
    max: 2 * 60 * 1000,
    maxLevel: 15
};
const TRANSIENT_COOLDOWN_MS = 5 * 1000;
const COOLDOWN_MS = {
    unauthorized: 2 * 60 * 1000,
    paymentRequired: 2 * 60 * 1000,
    notFound: 2 * 60 * 1000,
    notFoundLocal: 5 * 1000,
    transientInitial: TRANSIENT_COOLDOWN_MS,
    transientMax: 60 * 1000,
    transient: TRANSIENT_COOLDOWN_MS,
    requestNotAllowed: 5 * 1000,
    rateLimit: 2 * 60 * 1000,
    serviceUnavailable: 2 * 1000,
    authExpired: 2 * 60 * 1000
};
const ERROR_RULES = [
    {
        id: "no_credentials",
        text: "no credentials",
        cooldownMs: COOLDOWN_MS.notFound,
        reason: "auth_error"
    },
    {
        id: "request_not_allowed",
        text: "request not allowed",
        cooldownMs: COOLDOWN_MS.requestNotAllowed,
        reason: "rate_limit_exceeded"
    },
    {
        id: "improperly_formed_request",
        text: "improperly formed request",
        cooldownMs: 0,
        reason: "model_capacity"
    },
    {
        id: "rate_limit",
        text: "rate limit",
        backoff: true,
        reason: "rate_limit_exceeded"
    },
    {
        id: "too_many_requests",
        text: "too many requests",
        backoff: true,
        reason: "rate_limit_exceeded"
    },
    {
        id: "hour_quota_exceeded",
        text: "hour quota",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "quota_has_been_exceeded",
        text: "quota has been exceeded",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "quota_exceeded",
        text: "quota exceeded",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "quota_will_reset",
        text: "quota will reset",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "capacity_exhausted",
        text: "exhausted your capacity",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "quota_exhausted",
        text: "quota exhausted",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "free_tier_exhausted",
        text: "free tier of the model has been exhausted",
        backoff: true,
        reason: "quota_exhausted"
    },
    {
        id: "capacity",
        text: "capacity",
        backoff: true,
        reason: "model_capacity"
    },
    {
        id: "overloaded",
        text: "overloaded",
        backoff: true,
        reason: "model_capacity"
    },
    {
        id: "high_demand",
        text: "high demand",
        backoff: true,
        reason: "model_capacity"
    },
    {
        id: "status_401",
        status: 401,
        cooldownMs: 0,
        reason: "auth_error"
    },
    {
        id: "status_402",
        status: 402,
        cooldownMs: 0,
        reason: "quota_exhausted"
    },
    {
        id: "status_403",
        status: 403,
        cooldownMs: 0,
        reason: "quota_exhausted"
    },
    {
        id: "status_404",
        status: 404,
        cooldownMs: COOLDOWN_MS.notFound,
        reason: "unknown"
    },
    {
        id: "status_406",
        status: 406,
        backoff: true,
        reason: "server_error"
    },
    {
        id: "status_408",
        status: 408,
        backoff: true,
        reason: "server_error"
    },
    {
        id: "status_429",
        status: 429,
        backoff: true,
        reason: "rate_limit_exceeded"
    },
    {
        id: "status_500",
        status: 500,
        backoff: true,
        reason: "server_error"
    },
    {
        id: "status_502",
        status: 502,
        backoff: true,
        reason: "server_error"
    },
    {
        id: "status_503",
        status: 503,
        backoff: true,
        reason: "server_error"
    },
    {
        id: "status_504",
        status: 504,
        backoff: true,
        reason: "server_error"
    }
];
function normalizeErrorMessage(message) {
    return String(message || "").toLowerCase();
}
function getErrorInfo(statusCode) {
    return ERROR_TYPES[statusCode] || (statusCode >= 500 ? {
        type: "server_error",
        code: "internal_server_error"
    } : {
        type: "invalid_request_error",
        code: ""
    });
}
function getDefaultErrorMessage(statusCode) {
    return DEFAULT_ERROR_MESSAGES[statusCode] || "An error occurred";
}
function calculateBackoffCooldown(level = 0) {
    const safeLevel = Math.max(0, Math.floor(level));
    const cooldown = BACKOFF_CONFIG.base * Math.pow(2, safeLevel);
    return Math.min(cooldown, BACKOFF_CONFIG.max);
}
function matchErrorRuleByText(message) {
    const lower = normalizeErrorMessage(message);
    if (!lower) return null;
    return ERROR_RULES.find((rule)=>rule.text && lower.includes(rule.text)) || null;
}
function matchErrorRuleByStatus(statusCode) {
    return ERROR_RULES.find((rule)=>rule.status === statusCode) || null;
}
function findMatchingErrorRule(statusCode, message) {
    return matchErrorRuleByText(message) || matchErrorRuleByStatus(statusCode);
}
// #8248: NVIDIA NIM function-state DEGRADED — some NIM deployments signal a non-standard
// HTTP 400 whose body reports the backing "function" is DEGRADED (e.g. `Function id "<uuid>"
// submitted for inference is DEGRADED`) instead of a clean model-not-found/5xx. Bounded
// lookahead ({0,80}) — ReDoS-safe, no nested quantifiers.
const NIM_FUNCTION_DEGRADED_PATTERNS = [
    /\bfunction\b[\s\S]{0,80}?\bDEGRADED\b/i,
    /\bDEGRADED\b[\s\S]{0,80}?\bfunction\b/i
];
function isNimFunctionDegraded(errorText) {
    return NIM_FUNCTION_DEGRADED_PATTERNS.some((p)=>p.test(errorText));
}
function serviceSupervisorCooldown(status, headers) {
    if (status !== 503 || !headers) return null;
    const hintValue = typeof headers.get === "function" ? headers.get("x-omni-fallback-hint") : headers["x-omni-fallback-hint"] || headers["X-Omni-Fallback-Hint"];
    if (typeof hintValue !== "string" || hintValue.toLowerCase() !== "connection_cooldown") {
        return null;
    }
    return {
        shouldFallback: true,
        cooldownMs: 5_000,
        baseCooldownMs: 5_000,
        newBackoffLevel: 0,
        reason: "service_not_running",
        skipProviderBreaker: true
    };
}
}),
"[project]/open-sse/utils/upstreamErrorPassthrough.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildPassthroughErrorResponse",
    ()=>buildPassthroughErrorResponse,
    "shouldPassthroughUpstreamError",
    ()=>shouldPassthroughUpstreamError
]);
/**
 * Selective upstream 4xx error passthrough (Claude Code auto-recover contract).
 *
 * Claude Code matches the upstream error WORDING to auto-disable capabilities
 * (thinking / output_config) for the rest of the conversation. Wrapping the body
 * via buildErrorBody() truncates the message and breaks that recovery. For
 * upstream-originated 4xx errors the body is the provider's public API message —
 * not our internals — so it is safe and required to relay it verbatim.
 * OmniRoute-generated errors MUST keep using buildErrorBody() (Hard Rule #12).
 */ const PASSTHROUGH_MIN = 400;
const PASSTHROUGH_MAX = 499;
// 401/403/407: auth-adjacent — our own credential context may leak via provider
// echoes; keep those sanitized. 400/404/408/413/422/429 carry the capability and
// quota wording the client needs.
const EXCLUDED_STATUSES = new Set([
    401,
    403,
    407
]);
const INTERNAL_LEAK_RE = /\sat\s\/|node_modules|omniroute\//i;
function shouldPassthroughUpstreamError(statusCode, upstreamBody) {
    if (statusCode < PASSTHROUGH_MIN || statusCode > PASSTHROUGH_MAX) return false;
    if (EXCLUDED_STATUSES.has(statusCode)) return false;
    if (!upstreamBody || typeof upstreamBody !== "object") return false;
    const text = JSON.stringify(upstreamBody);
    if (INTERNAL_LEAK_RE.test(text)) return false;
    return true;
}
function buildPassthroughErrorResponse(statusCode, upstreamBody, headers) {
    if (!shouldPassthroughUpstreamError(statusCode, upstreamBody)) return null;
    return new Response(JSON.stringify(upstreamBody), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json",
            ...headers || {}
        }
    });
}
}),
"[project]/open-sse/utils/error.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildErrorBody",
    ()=>buildErrorBody,
    "buildModelCooldownBody",
    ()=>buildModelCooldownBody,
    "createErrorResult",
    ()=>createErrorResult,
    "errorResponse",
    ()=>errorResponse,
    "errorResponseWithComboDiagnostics",
    ()=>errorResponseWithComboDiagnostics,
    "formatProviderError",
    ()=>formatProviderError,
    "makeExecutorErrorResult",
    ()=>makeExecutorErrorResult,
    "modelCooldownResponse",
    ()=>modelCooldownResponse,
    "normalizeCookie",
    ()=>normalizeCookie,
    "parseAntigravityRetryTime",
    ()=>parseAntigravityRetryTime,
    "parseUpstreamError",
    ()=>parseUpstreamError,
    "providerCircuitOpenResponse",
    ()=>providerCircuitOpenResponse,
    "sanitizeComboDiagnostics",
    ()=>sanitizeComboDiagnostics,
    "sanitizeErrorMessage",
    ()=>sanitizeErrorMessage,
    "sanitizeRecoveryHint",
    ()=>sanitizeRecoveryHint,
    "sanitizeUpstreamDetails",
    ()=>sanitizeUpstreamDetails,
    "unavailableResponse",
    ()=>unavailableResponse,
    "writeStreamError",
    ()=>writeStreamError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$clinepassEnvelope$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/clinepassEnvelope.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$upstreamErrorPassthrough$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/upstreamErrorPassthrough.ts [app-rsc] (ecmascript)");
;
;
;
;
// Length cap protects against pathological inputs even before tokenization.
const MAX_ERROR_LEN = 4096;
const SOURCE_EXT = [
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs"
];
function looksLikeAbsolutePath(tok) {
    // POSIX: "/<...>.ts" (optionally followed by :line[:col]).
    // Windows: "C:\<...>.ts" or "C:/<...>.ts".
    if (tok.length < 4 || tok.length > 2048) return false;
    const isPosix = tok.charCodeAt(0) === 0x2f; // '/'
    const isWindows = tok.length > 2 && tok.charCodeAt(1) === 0x3a && /[A-Za-z]/.test(tok[0]);
    if (!isPosix && !isWindows) return false;
    const dot = tok.lastIndexOf(".");
    if (dot <= 0 || dot === tok.length - 1) return false;
    const ext = tok.slice(dot + 1).split(":", 1)[0].toLowerCase();
    return SOURCE_EXT.includes(ext);
}
function redactSensitiveErrorText(value) {
    return value.replace(/data:[^,\s]+;base64,[A-Za-z0-9+/=_-]+/gi, "[REDACTED_DATA_URL]").replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]").replace(/(["']?(?:api[_-]?key|access[_-]?token|authorization|cookie|secret)["']?\s*[:=]\s*["'])[^"']*(["'])/gi, "$1[REDACTED]$2").replace(/(["']?(?:api[_-]?key|access[_-]?token|authorization|cookie|secret)["']?\s*[:=]\s*)[^"',\s}]+/gi, "$1[REDACTED]");
}
function sanitizeErrorMessage(message) {
    let str = typeof message === "string" ? message : String(message ?? "");
    if (str.length > MAX_ERROR_LEN) str = str.slice(0, MAX_ERROR_LEN);
    const nl = str.indexOf("\n");
    const firstLine = nl >= 0 ? str.slice(0, nl) : str;
    // Preserve original whitespace by splitting on captured separator.
    const parts = firstLine.split(/(\s+)/);
    for(let i = 0; i < parts.length; i++){
        if (looksLikeAbsolutePath(parts[i])) parts[i] = "<path>";
    }
    return redactSensitiveErrorText(parts.join(""));
}
const BLOCKED_KEYS = /stack|trace|path|file|cwd|dir|password|secret|token|key|authorization|cookie/i;
const MAX_DEPTH = 4;
function sanitizeUpstreamDetails(value, depth = 0) {
    if (depth > MAX_DEPTH) return "[truncated]";
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return sanitizeErrorMessage(value);
    if (typeof value === "number" || typeof value === "boolean") return value;
    if (Array.isArray(value)) {
        return value.slice(0, 32).map((v)=>sanitizeUpstreamDetails(v, depth + 1));
    }
    if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)){
            if (BLOCKED_KEYS.test(k)) continue;
            out[k] = sanitizeUpstreamDetails(v, depth + 1);
        }
        return out;
    }
    return null;
}
function buildErrorBody(statusCode, message, upstreamDetails, classification) {
    const errorInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getErrorInfo"])(statusCode);
    const safeMessage = sanitizeErrorMessage(message) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultErrorMessage"])(statusCode);
    const body = {
        error: {
            message: safeMessage,
            type: classification?.type ?? errorInfo.type,
            code: classification?.code ?? errorInfo.code
        }
    };
    if (upstreamDetails !== undefined && upstreamDetails !== null) {
        const sanitized = sanitizeUpstreamDetails(upstreamDetails);
        if (sanitized !== null && typeof sanitized === "object" && !Array.isArray(sanitized)) {
            body.upstream_details = sanitized;
        }
    }
    return body;
}
function clampDiagStr(v, max = 128) {
    return typeof v === "string" ? v.slice(0, max).replace(/[\r\n]+/g, " ") : "";
}
/**
 * HTTP header values must be Latin1/ByteString (undici throws a TypeError
 * otherwise — see #6612). Replace any codepoint outside the Latin1 range
 * (0-255) with "?" so header construction never throws. Only used for the
 * literal header value; the JSON body keeps the original, unsanitized
 * readable text via `sanitizeComboDiagnostics`.
 */ function toHeaderSafeAscii(v) {
    let out = "";
    for(let i = 0; i < v.length; i++){
        const code = v.charCodeAt(i);
        out += code > 255 ? "?" : v[i];
    }
    return out;
}
/**
 * Whitelist sanitizer for the recovery hint. The `action` enum is a closed set;
 * `retry_after_seconds` is clamped to a non-negative integer ≤ 3600; `next_step` is
 * capped and stripped of CR/LF (would break header parsing). Returns undefined when
 * no usable input was supplied so downstream code can branch cleanly on absence.
 */ const RECOVERY_ACTIONS = new Set([
    "try-auto",
    "wait",
    "retry",
    "switch-combo"
]);
function sanitizeRecoveryHint(r) {
    if (!r || typeof r !== "object") return undefined;
    const action = typeof r.action === "string" ? r.action : null;
    if (!action || !RECOVERY_ACTIONS.has(action)) return undefined;
    // Reject empty OR whitespace-only next_step — the value must render usefully as a
    // header and as a body field. A whitespace-only string would print as a blank hint.
    const next_step = clampDiagStr(r.next_step, 200).trim();
    if (!next_step) return undefined;
    const hint = {
        action,
        next_step
    };
    if (typeof r.retry_after_seconds === "number" && Number.isFinite(r.retry_after_seconds)) {
        hint.retry_after_seconds = Math.max(0, Math.min(3600, Math.floor(r.retry_after_seconds)));
    }
    return hint;
}
function sanitizeComboDiagnostics(d) {
    const recovery = sanitizeRecoveryHint(d?.recovery);
    const out = {
        poolSize: Number.isFinite(d?.poolSize) ? d.poolSize : 0,
        attempted: Number.isFinite(d?.attempted) ? d.attempted : 0,
        excluded: (d?.excluded ?? []).slice(0, 64).map((e)=>({
                provider: clampDiagStr(e?.provider, 64),
                ...e?.model ? {
                    model: clampDiagStr(e.model, 96)
                } : {},
                reason: clampDiagStr(e?.reason, 64)
            })),
        attemptOrder: (d?.attemptOrder ?? []).slice(0, 64).map((a)=>({
                provider: clampDiagStr(a?.provider, 64),
                model: clampDiagStr(a?.model, 96)
            })),
        terminalReason: clampDiagStr(d?.terminalReason, 200)
    };
    if (recovery) out.recovery = recovery;
    return out;
}
function errorResponseWithComboDiagnostics(statusCode, message, diagnostics, opts = {}) {
    const safe = sanitizeComboDiagnostics(diagnostics);
    const body = buildErrorBody(statusCode, message);
    if (opts.code) body.error.code = opts.code;
    if (opts.type) body.error.type = opts.type;
    body.diagnostics = safe;
    if (safe.recovery) body.recovery_hint = safe.recovery;
    const excludedHeader = toHeaderSafeAscii(safe.excluded.map((e)=>`${e.provider}${e.model ? `/${e.model}` : ""}:${e.reason}`).join(",").slice(0, 900));
    const headers = {
        "Content-Type": "application/json",
        "x-omniroute-combo-pool-size": String(safe.poolSize),
        "x-omniroute-combo-attempted": String(safe.attempted),
        "x-omniroute-combo-excluded": excludedHeader,
        "x-omniroute-combo-terminal-reason": toHeaderSafeAscii(safe.terminalReason.slice(0, 200))
    };
    if (safe.recovery) {
        headers["x-omniroute-recovery-action"] = safe.recovery.action;
        // Header limit of 128 chars — keep next_step compact for fast parsing.
        // The body field carries the full 200-char value for richer display.
        headers["x-omniroute-recovery-next-step"] = toHeaderSafeAscii(safe.recovery.next_step).slice(0, 128);
        if (typeof safe.recovery.retry_after_seconds === "number" && safe.recovery.retry_after_seconds > 0) {
            headers["x-omniroute-retry-after-seconds"] = String(safe.recovery.retry_after_seconds);
        }
    }
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers
    });
}
function errorResponse(statusCode, message) {
    return new Response(JSON.stringify(buildErrorBody(statusCode, sanitizeErrorMessage(message))), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
async function writeStreamError(writer, statusCode, message) {
    const errorBody = buildErrorBody(statusCode, sanitizeErrorMessage(message));
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(`data: ${JSON.stringify(errorBody)}\n\n`));
}
function normalizeRetryAfterSeconds(retryAfter) {
    if (typeof retryAfter === "number" && Number.isFinite(retryAfter)) {
        if (retryAfter > 0 && retryAfter < 1_000_000_000) {
            return Math.max(Math.ceil(retryAfter), 1);
        }
        const retryTimeMs = new Date(retryAfter).getTime();
        if (Number.isFinite(retryTimeMs)) {
            return Math.max(Math.ceil((retryTimeMs - Date.now()) / 1000), 1);
        }
    }
    if (retryAfter instanceof Date || typeof retryAfter === "string") {
        const retryTimeMs = new Date(retryAfter).getTime();
        if (Number.isFinite(retryTimeMs)) {
            return Math.max(Math.ceil((retryTimeMs - Date.now()) / 1000), 1);
        }
    }
    return 1;
}
function parseAntigravityRetryTime(message) {
    if (typeof message !== "string") return null;
    // Match patterns like: 2h7m23s, 5m30s, 45s, 1h20m, etc.
    const match = message.match(/reset after (\d+h)?(\d+m)?(\d+s)?/i);
    if (!match) return null;
    let totalMs = 0;
    // Extract hours
    if (match[1]) {
        const hours = parseInt(match[1]);
        totalMs += hours * 60 * 60 * 1000;
    }
    // Extract minutes
    if (match[2]) {
        const minutes = parseInt(match[2]);
        totalMs += minutes * 60 * 1000;
    }
    // Extract seconds
    if (match[3]) {
        const seconds = parseInt(match[3]);
        totalMs += seconds * 1000;
    }
    return totalMs > 0 ? totalMs : null;
}
async function parseUpstreamError(response, provider = null) {
    let message = "";
    let retryAfterMs = null;
    let responseBody = null;
    let errorCode = undefined;
    let errorType = undefined;
    try {
        const text = await response.text();
        responseBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayloadForLog"])(text);
        // Try parse as JSON
        try {
            const parsed = JSON.parse(text);
            // Handle array responses (e.g., from some Gemini APIs)
            const json = (Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed) || {};
            // ClinePass wraps upstream errors in a {success:false, error} envelope.
            // Extract the upstream error string (an upstream JSON field, not a local
            // stack) — still routed through sanitizeErrorMessage/buildErrorBody by
            // every consumer below (Rule #12).
            const { error: clinepassEnvError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$clinepassEnvelope$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unwrapClinepassEnvelope"])(json, provider);
            message = clinepassEnvError ? clinepassEnvError.message : json.error?.message || json.message || json.error || text;
            errorCode = json.error?.code || json.code;
            errorType = json.error?.type || json.type;
        } catch  {
            message = text;
        }
    } catch  {
        message = `Upstream error: ${response.status}`;
        responseBody = {
            _rawText: message
        };
    }
    const messageStr = typeof message === "string" ? message : JSON.stringify(message);
    const retryAfterHeader = response.headers?.get?.("retry-after");
    if (retryAfterHeader && !retryAfterMs) {
        const retryAfterSec = Number.parseInt(retryAfterHeader, 10);
        if (Number.isFinite(retryAfterSec) && retryAfterSec > 0) {
            retryAfterMs = retryAfterSec * 1000;
        } else {
            const retryAfterDate = new Date(retryAfterHeader).getTime();
            if (Number.isFinite(retryAfterDate) && retryAfterDate > Date.now()) {
                retryAfterMs = retryAfterDate - Date.now();
            }
        }
    }
    // Parse Antigravity-specific retry time from error message
    if (provider === "antigravity" && response.status === 429) {
        retryAfterMs = parseAntigravityRetryTime(messageStr);
    }
    // Also parse retry time for other providers (Qwen, etc.) with "quota will reset after XhYmZs" format
    if (response.status === 429 && !retryAfterMs) {
        retryAfterMs = parseAntigravityRetryTime(messageStr);
    }
    // Generic providers: "Please retry after 20s"
    if (response.status === 429 && !retryAfterMs) {
        const retryMatch = messageStr.match(/retry\s+after\s+(\d+)\s*s/i);
        if (retryMatch) {
            retryAfterMs = Number.parseInt(retryMatch[1], 10) * 1000;
        }
    }
    // Cap maximum retry time at 24 hours to prevent infinite wait
    const MAX_RETRY_MS = 24 * 60 * 60 * 1000;
    if (retryAfterMs && retryAfterMs > MAX_RETRY_MS) {
        retryAfterMs = MAX_RETRY_MS;
    }
    const responseHeaders = response.headers ? Object.fromEntries(response.headers.entries()) : null;
    return {
        statusCode: response.status,
        message: messageStr,
        errorCode,
        errorType,
        retryAfterMs,
        responseBody,
        responseHeaders
    };
}
function createErrorResult(statusCode, message, retryAfterMs = null, errorCode, errorType, upstreamDetails, opts) {
    const body = buildErrorBody(statusCode, message, upstreamDetails);
    if (errorCode) {
        body.error.code = errorCode;
    }
    if (errorType) {
        body.error.type = errorType;
    }
    const result = {
        success: false,
        status: statusCode,
        error: body.error.message,
        rawMessage: message,
        errorType,
        errorCode,
        response: new Response(JSON.stringify(body), {
            status: statusCode,
            headers: {
                "Content-Type": "application/json"
            }
        })
    };
    // Add retryAfterMs if available (for Antigravity quota errors)
    if (retryAfterMs) {
        result.retryAfterMs = retryAfterMs;
    }
    // Opt-in relay of the verbatim upstream error body (Claude Code auto-recover
    // contract — see upstreamErrorPassthrough.ts). Only swaps `result.response`;
    // `result.error`/`rawMessage`/`errorType`/`errorCode` stay untouched so
    // server-side classification (checkFallbackError, combo retry logic, etc.)
    // never sees a different value depending on this flag.
    if (opts?.passthrough) {
        const passthroughResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$upstreamErrorPassthrough$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildPassthroughErrorResponse"])(statusCode, upstreamDetails, retryAfterMs ? {
            "Retry-After": String(Math.ceil(retryAfterMs / 1000))
        } : undefined);
        if (passthroughResponse) {
            result.response = passthroughResponse;
        }
    }
    return result;
}
function unavailableResponse(statusCode, message, retryAfter, retryAfterHuman) {
    const retryAfterSec = normalizeRetryAfterSeconds(retryAfter);
    const msg = retryAfterHuman ? `${message} (${retryAfterHuman})` : message;
    return new Response(JSON.stringify({
        error: {
            message: msg
        }
    }), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSec)
        }
    });
}
function providerCircuitOpenResponse(provider, retryAfter) {
    const retryAfterSec = normalizeRetryAfterSeconds(retryAfter);
    return new Response(JSON.stringify({
        error: {
            message: `Provider ${provider} circuit breaker is open`,
            type: "server_error",
            code: "provider_circuit_open",
            provider,
            retry_after: retryAfterSec
        }
    }), {
        status: 503,
        headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSec),
            "X-OmniRoute-Provider-Breaker": "open"
        }
    });
}
function buildModelCooldownBody({ model, retryAfterSec, retryAfterAt, credentialsCoolingCount }) {
    const resolvedModel = typeof model === "string" && model.trim().length > 0 ? model.trim() : null;
    const resolvedRetryAfterAt = typeof retryAfterAt === "string" && retryAfterAt.length > 0 ? retryAfterAt : null;
    const resolvedCoolingCount = typeof credentialsCoolingCount === "number" && Number.isFinite(credentialsCoolingCount) && credentialsCoolingCount > 0 ? Math.floor(credentialsCoolingCount) : null;
    return {
        error: {
            message: resolvedModel ? `All credentials for model ${resolvedModel} are cooling down` : "All credentials for the requested model are cooling down",
            type: "rate_limit_error",
            code: "model_cooldown",
            ...resolvedModel ? {
                model: resolvedModel
            } : {},
            reset_seconds: Math.max(Math.ceil(retryAfterSec), 1),
            ...resolvedRetryAfterAt ? {
                retry_after: resolvedRetryAfterAt
            } : {},
            ...resolvedCoolingCount ? {
                credentials_cooling: resolvedCoolingCount
            } : {}
        }
    };
}
function modelCooldownResponse({ model, retryAfter, retryAfterAt, credentialsCoolingCount }) {
    const retryAfterSec = normalizeRetryAfterSeconds(retryAfter);
    const resolvedRetryAfterAt = typeof retryAfterAt === "string" && retryAfterAt.length > 0 ? retryAfterAt : typeof retryAfter === "string" && retryAfter.length > 0 ? retryAfter : null;
    return new Response(JSON.stringify(buildModelCooldownBody({
        model,
        retryAfterSec,
        retryAfterAt: resolvedRetryAfterAt,
        credentialsCoolingCount
    })), {
        status: 429,
        headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSec)
        }
    });
}
function makeExecutorErrorResult(status, message, body, url) {
    return {
        response: new Response(JSON.stringify({
            error: {
                message: sanitizeErrorMessage(message),
                type: "upstream_error",
                code: `HTTP_${status}`
            }
        }), {
            status,
            headers: {
                "Content-Type": "application/json"
            }
        }),
        url,
        headers: {},
        transformedBody: body
    };
}
function normalizeCookie(raw) {
    return raw?.startsWith("Cookie:") ? raw.slice(7).trim() : raw || "";
}
function formatProviderError(error, provider, model, statusCode) {
    const providerCode = "code" in error ? error.code : undefined;
    const code = statusCode || providerCode || "FETCH_FAILED";
    const message = error.message || "Unknown error";
    // Expose low-level cause (e.g. UND_ERR_SOCKET, ECONNRESET, ETIMEDOUT) for diagnosing fetch failures
    const cause = error.cause;
    const causeObj = cause && typeof cause === "object" ? cause : undefined;
    const causeCode = typeof causeObj?.code === "string" ? causeObj.code : undefined;
    const causeMsg = typeof causeObj?.message === "string" ? causeObj.message : undefined;
    const causeStr = causeCode || causeMsg ? ` (cause: ${[
        causeCode,
        causeMsg
    ].filter(Boolean).join(": ")})` : "";
    return `[${code}]: ${message}${causeStr}`;
}
}),
"[project]/src/mitm/maskSecrets.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/mitm/sanitizeHeaders.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeHeaders",
    ()=>sanitizeHeaders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/maskSecrets.ts [app-rsc] (ecmascript)");
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
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isForbiddenUpstreamHeaderName"])(lowerKey)) continue;
        // Normalize array values
        const strValue = Array.isArray(value) ? value.join(", ") : String(value);
        // Mask secret header values
        if (isSecretHeader(lowerKey)) {
            // `set-cookie` carries an entire session/CSRF cookie value that maskSecret's
            // format heuristics (Bearer / sk- / ≥40-char) do NOT catch, so it would leak
            // verbatim into inspector JSON — fully redact it (SECURITY_AUDIT M6).
            result[lowerKey] = lowerKey === "set-cookie" ? "[REDACTED]" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskSecret"])(strValue);
        } else {
            result[lowerKey] = strValue;
        }
    }
    return result;
}
}),
"[project]/src/mitm/inspector/contextKey.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/mitm/inspector/kindDetector.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/mitm/inspector/buffer.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$contextKey$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/contextKey.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$kindDetector$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/kindDetector.ts [app-rsc] (ecmascript)");
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
            req.detectedKind = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$kindDetector$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["detectKind"])(req);
        }
        if (!req.contextKey && req.detectedKind === "llm") {
            const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$contextKey$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["computeContextKey"])(req);
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
"[project]/src/lib/db/inspectorCustomHosts.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCustomHost",
    ()=>addCustomHost,
    "isCustomHost",
    ()=>isCustomHost,
    "listCustomHosts",
    ()=>listCustomHosts,
    "removeCustomHost",
    ()=>removeCustomHost,
    "toggleCustomHost",
    ()=>toggleCustomHost,
    "touchLastSeen",
    ()=>touchLastSeen
]);
/**
 * Database module: InspectorCustomHosts
 * CRUD operations for inspector_custom_hosts table.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
;
function mapRow(row) {
    return {
        host: row.host,
        enabled: row.enabled === 1,
        label: row.label,
        kind: row.kind,
        added_at: row.added_at,
        last_seen_at: row.last_seen_at
    };
}
function listCustomHosts(opts) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const enabledOnly = opts?.enabledOnly === true;
    const rows = enabledOnly ? db.prepare("SELECT * FROM inspector_custom_hosts WHERE enabled = 1 ORDER BY host ASC").all() : db.prepare("SELECT * FROM inspector_custom_hosts ORDER BY host ASC").all();
    return rows.map(mapRow);
}
function addCustomHost(host, kind = "custom", label) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    db.prepare(`INSERT OR IGNORE INTO inspector_custom_hosts (host, enabled, label, kind, added_at)
     VALUES (?, 1, ?, ?, ?)`).run(host, label ?? null, kind, now);
}
function removeCustomHost(host) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM inspector_custom_hosts WHERE host = ?").run(host);
}
function toggleCustomHost(host, enabled) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("UPDATE inspector_custom_hosts SET enabled = ? WHERE host = ?").run(enabled ? 1 : 0, host);
}
function touchLastSeen(host) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    db.prepare("UPDATE inspector_custom_hosts SET last_seen_at = ? WHERE host = ?").run(now, host);
}
function isCustomHost(host) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT 1 AS found FROM inspector_custom_hosts WHERE host = ? AND enabled = 1").get(host);
    return row !== undefined;
}
}),
"[project]/src/mitm/inspector/agentBridgeHook.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recordRequestComplete",
    ()=>recordRequestComplete,
    "recordRequestError",
    ()=>recordRequestError,
    "recordRequestStart",
    ()=>recordRequestStart
]);
/**
 * Inspector hook called from `MitmHandlerBase` (F3) on every intercepted
 * AgentBridge request. Centralises buffer push/update so handlers do not need
 * to know the inspector internals.
 *
 * Contract: see `_orchestration/master-plan-group-A.md` §3.11.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/maskSecrets.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/sanitizeHeaders.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$buffer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/inspector/buffer.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function recordRequestStart(opts) {
    const requestBody = opts.body.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskSecret"])(opts.body.toString("utf8")) : null;
    // Determine whether this request originates from a custom-host intercept
    // (Mode 2 / Custom Hosts) or a standard agent-bridge intercept (Mode 1).
    //
    // Both modes reach this hook via the same MITM server path: custom hosts are
    // added to inspector_custom_hosts by the Mode 2 UI and are spoofed to
    // 127.0.0.1 by /etc/hosts entries, so they arrive here just like agent
    // targets. The DB lookup below is the cheapest reliable way to distinguish
    // them without touching server.cjs — it costs one SQLite read per request.
    //
    // If the host resolves as a custom-host entry, source="custom-host" and
    // agent is left undefined so the "Custom" profile filter matches correctly.
    const host = opts.req.headers.host ?? "";
    const customHost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isCustomHost"])(host);
    const intercepted = {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        source: customHost ? "custom-host" : "agent-bridge",
        agent: customHost ? undefined : opts.agentId,
        timestamp: new Date().toISOString(),
        method: opts.req.method ?? "GET",
        host,
        path: opts.req.url ?? "/",
        requestHeaders: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeHeaders"])(opts.req.headers),
        requestBody,
        requestSize: opts.body.length,
        responseHeaders: {},
        responseBody: null,
        responseSize: 0,
        status: "in-flight",
        sourceModel: opts.sourceModel ?? null,
        mappedModel: opts.mappedModel
    };
    if (opts.sessionId) intercepted.sessionId = opts.sessionId;
    // Best-effort process attribution (Linux only; no-op elsewhere). The proxy's
    // inbound socket remotePort is the client process's local ephemeral port,
    // which is what appears in that process's /proc/net/tcp local_address. Never
    // blocks capture — any failure leaves pid/processName unset. (Gap 1.)
    try {
        const { attributeProcess } = await __turbopack_context__.A("[project]/src/mitm/inspector/processAttribution.ts [app-rsc] (ecmascript, async loader)");
        const remotePort = opts.req.socket?.remotePort;
        if (typeof remotePort === "number") {
            const info = attributeProcess(remotePort);
            if (info) {
                intercepted.pid = info.pid;
                intercepted.processName = info.processName;
            }
        }
    } catch  {
    // attribution is best-effort — never block capture
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$buffer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalTrafficBuffer"].push(intercepted);
    return intercepted;
}
function recordRequestComplete(intercepted, opts) {
    intercepted.status = opts.status;
    // SECURITY_AUDIT M6: mask secret-bearing upstream response headers (Set-Cookie,
    // Authorization, …) before they land in inspector JSON. The request side already
    // sanitizes (line ~69); the response side was storing headers verbatim.
    intercepted.responseHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sanitizeHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeHeaders"])(opts.responseHeaders);
    intercepted.responseBody = opts.responseBody != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$maskSecrets$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskSecret"])(opts.responseBody) : null;
    intercepted.responseSize = opts.responseSize;
    intercepted.proxyLatencyMs = opts.proxyLatencyMs;
    intercepted.upstreamLatencyMs = opts.upstreamLatencyMs;
    intercepted.totalLatencyMs = opts.proxyLatencyMs + opts.upstreamLatencyMs;
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$buffer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalTrafficBuffer"].update(intercepted.id, intercepted);
}
function recordRequestError(intercepted, err) {
    intercepted.status = "error";
    intercepted.error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$inspector$2f$buffer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["globalTrafficBuffer"].update(intercepted.id, intercepted);
}
}),
];

//# sourceMappingURL=_1phuleb._.js.map