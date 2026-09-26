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
];

//# sourceMappingURL=open-sse_02qzgz1._.js.map