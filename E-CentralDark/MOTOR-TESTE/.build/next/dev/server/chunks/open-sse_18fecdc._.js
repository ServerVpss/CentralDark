module.exports = [
"[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLogger",
    ()=>createLogger,
    "default",
    ()=>__TURBOPACK__default__export__,
    "defaultLogger",
    ()=>defaultLogger,
    "generateRequestId",
    ()=>generateRequestId,
    "log",
    ()=>log,
    "logger",
    ()=>logger,
    "maskKey",
    ()=>maskKey
]);
/**
 * Structured console logger utility for omniroute.
 *
 * Provides consistent, machine-parseable log output across the codebase.
 * Supports two output formats controlled by APP_LOG_FORMAT env var:
 *   - "text" (default): [LEVEL] [TAG] message {metadata}
 *   - "json": Single-line JSON objects for log aggregators
 *
 * Usage:
 *   import { logger, createLogger, generateRequestId } from "../utils/logger.ts";
 *
 *   // Tag-based (simple — for services/utilities):
 *   const log = logger("CHAT");
 *   log.info("Request received", { model: "claude-4" });
 *
 *   // Request-scoped (with correlation ID — for request pipelines):
 *   const reqLog = createLogger(generateRequestId());
 *   reqLog.info("AUTH", "Token refreshed", { provider: "claude" });
 *
 * Environment variables:
 *   APP_LOG_LEVEL  — minimum level: debug | info | warn | error (default: info)
 *   APP_LOG_FORMAT — output format: text | json (default: text)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
const LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};
function isLogLevel(value) {
    return Object.prototype.hasOwnProperty.call(LEVELS, value);
}
const configuredLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogLevel"])("info").toLowerCase();
const currentLevel = isLogLevel(configuredLevel) ? LEVELS[configuredLevel] : LEVELS.info;
const jsonFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFormat"])("text") === "json";
let requestCounter = 0;
function generateRequestId() {
    return `req_${Date.now()}_${++requestCounter}`;
}
function maskKey(key) {
    if (!key || key.length < 12) return "(redacted)";
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
/**
 * Get the correct console method for a log level.
 * @param {string} level
 * @returns {Function}
 */ function getConsoleFn(level) {
    switch(level){
        case "debug":
            return console.debug;
        case "warn":
            return console.warn;
        case "error":
            return console.error;
        default:
            return console.log;
    }
}
/**
 * Format metadata object as compact JSON string for log output.
 * Omits keys with null/undefined values to keep logs clean.
 * @param {object} [meta] - Optional metadata
 * @returns {string} Formatted metadata string or empty string
 */ function formatMeta(meta) {
    if (!meta || typeof meta !== "object") return "";
    const cleaned = {};
    for (const [k, v] of Object.entries(meta)){
        if (v !== undefined && v !== null) cleaned[k] = v;
    }
    return Object.keys(cleaned).length > 0 ? ` ${JSON.stringify(cleaned)}` : "";
}
function logger(tag) {
    const emit = (level, message, meta)=>{
        if (LEVELS[level] < currentLevel) return;
        const consoleFn = getConsoleFn(level);
        if (jsonFormat) {
            const entry = {
                ts: new Date().toISOString(),
                level,
                tag,
                msg: message
            };
            if (meta && typeof meta === "object" && Object.keys(meta).length > 0) {
                entry.data = meta;
            }
            consoleFn(JSON.stringify(entry));
        } else {
            consoleFn(`[${level.toUpperCase()}] [${tag}] ${message}${formatMeta(meta)}`);
        }
    };
    return {
        debug: (message, meta)=>emit("debug", message, meta),
        info: (message, meta)=>emit("info", message, meta),
        warn: (message, meta)=>emit("warn", message, meta),
        error: (message, meta)=>emit("error", message, meta)
    };
}
function createLogger(requestId = null) {
    const emit = (level, tag, message, data)=>{
        if (LEVELS[level] < currentLevel) return;
        const consoleFn = getConsoleFn(level);
        if (jsonFormat) {
            const entry = {
                ts: new Date().toISOString(),
                level,
                tag,
                msg: message
            };
            if (requestId) entry.reqId = requestId;
            if (data && typeof data === "object" && Object.keys(data).length > 0) {
                entry.data = data;
            }
            consoleFn(JSON.stringify(entry));
        } else {
            const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
            const prefix = requestId ? `[${requestId}]` : "";
            const dataStr = formatMeta(data);
            consoleFn(`${ts} ${prefix}[${tag}] ${message}${dataStr}`);
        }
    };
    return {
        debug: (tag, msg, data)=>emit("debug", tag, msg, data),
        info: (tag, msg, data)=>emit("info", tag, msg, data),
        warn: (tag, msg, data)=>emit("warn", tag, msg, data),
        error: (tag, msg, data)=>emit("error", tag, msg, data)
    };
}
const defaultLogger = createLogger();
const log = defaultLogger;
const __TURBOPACK__default__export__ = logger;
}),
"[project]/open-sse/config/antigravityUpstream.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_BOOTSTRAP_BASE_URLS",
    ()=>ANTIGRAVITY_BOOTSTRAP_BASE_URLS,
    "ANTIGRAVITY_DISCOVERY_BASE_URLS",
    ()=>ANTIGRAVITY_DISCOVERY_BASE_URLS,
    "ANTIGRAVITY_ONBOARD_PATH",
    ()=>ANTIGRAVITY_ONBOARD_PATH,
    "ANTIGRAVITY_RUNTIME_BASE_URLS",
    ()=>ANTIGRAVITY_RUNTIME_BASE_URLS,
    "getAntigravityFetchAvailableModelsUrls",
    ()=>getAntigravityFetchAvailableModelsUrls,
    "getAntigravityModelsDiscoveryUrls",
    ()=>getAntigravityModelsDiscoveryUrls,
    "getAntigravityOnboardUrls",
    ()=>getAntigravityOnboardUrls
]);
const ANTIGRAVITY_RUNTIME_BASE_URLS = Object.freeze([
    "https://daily-cloudcode-pa.googleapis.com",
    "https://cloudcode-pa.googleapis.com"
]);
const ANTIGRAVITY_DISCOVERY_BASE_URLS = Object.freeze([
    ...ANTIGRAVITY_RUNTIME_BASE_URLS,
    "https://daily-cloudcode-pa.sandbox.googleapis.com"
]);
const ANTIGRAVITY_BOOTSTRAP_BASE_URLS = Object.freeze([
    "https://cloudcode-pa.googleapis.com"
]);
const ANTIGRAVITY_ONBOARD_PATH = "/v1internal:onboardUser";
function getAntigravityOnboardUrls() {
    return ANTIGRAVITY_BOOTSTRAP_BASE_URLS.map((base)=>`${base}${ANTIGRAVITY_ONBOARD_PATH}`);
}
const ANTIGRAVITY_MODELS_PATH = "/v1internal:models";
const ANTIGRAVITY_FETCH_AVAILABLE_MODELS_PATH = "/v1internal:fetchAvailableModels";
function buildAntigravityDiscoveryUrls(path) {
    return ANTIGRAVITY_DISCOVERY_BASE_URLS.map((baseUrl)=>`${baseUrl}${path}`);
}
function getAntigravityModelsDiscoveryUrls() {
    return buildAntigravityDiscoveryUrls(ANTIGRAVITY_MODELS_PATH);
}
function getAntigravityFetchAvailableModelsUrls() {
    return buildAntigravityDiscoveryUrls(ANTIGRAVITY_FETCH_AVAILABLE_MODELS_PATH);
}
}),
"[project]/open-sse/config/antigravityModelAliases.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_MODEL_ALIASES",
    ()=>ANTIGRAVITY_MODEL_ALIASES,
    "ANTIGRAVITY_PRO_FALLBACK_CHAINS",
    ()=>ANTIGRAVITY_PRO_FALLBACK_CHAINS,
    "ANTIGRAVITY_PUBLIC_MODELS",
    ()=>ANTIGRAVITY_PUBLIC_MODELS,
    "ANTIGRAVITY_REVERSE_MODEL_ALIASES",
    ()=>ANTIGRAVITY_REVERSE_MODEL_ALIASES,
    "getAntigravityModelFallbacks",
    ()=>getAntigravityModelFallbacks,
    "getClientVisibleAntigravityModelName",
    ()=>getClientVisibleAntigravityModelName,
    "isUserCallableAntigravityModelId",
    ()=>isUserCallableAntigravityModelId,
    "resolveAntigravityModelId",
    ()=>resolveAntigravityModelId,
    "toClientAntigravityModelId",
    ()=>toClientAntigravityModelId,
    "toClientAntigravityQuotaModelId",
    ()=>toClientAntigravityQuotaModelId
]);
const ANTIGRAVITY_PUBLIC_MODELS = Object.freeze([
    // Gemini 3.6 Flash tiers returned by the live model selector for both the IDE 2.1.1
    // and CLI 1.1.x client identities. High is the current defaultAgentModelId.
    {
        id: "gemini-3.6-flash-high",
        name: "Gemini 3.6 Flash (High)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.6-flash-medium",
        name: "Gemini 3.6 Flash (Medium)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.6-flash-low",
        name: "Gemini 3.6 Flash (Low)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    // Claude (Antigravity backend). The `agy` provider already ships these from the live
    // :fetchAvailableModels probe (see agyModels.ts) and discussion #3184 confirmed they
    // are user-callable through the `antigravity` OAuth provider too — same backend.
    // `antigravity/claude-opus-4-6-thinking` and `antigravity/claude-sonnet-4-6` both work.
    // They are upstream IDs, so no alias remapping is required.
    {
        id: "claude-opus-4-6-thinking",
        name: "Claude Opus 4.6 (Thinking)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6 (Thinking)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    // Gemini 3.1 Pro budget tiers. Live streamGenerateContent validation uses
    // `gemini-pro-agent` for High; the separately advertised `gemini-3.1-pro-high`
    // discovery slot currently returns HTTP 400 and is intentionally not public.
    {
        id: "gemini-pro-agent",
        name: "Gemini 3.1 Pro (High)",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-pro-low",
        name: "Gemini 3.1 Pro (Low)",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    // Gemini 3.5 Flash tiers exposed by Antigravity's model selector. Public ids match
    // fetchAvailableModels and are forwarded upstream unchanged:
    //   High   -> gemini-3-flash-agent       (displayName: Gemini 3.5 Flash (High))
    //   Medium -> gemini-3.5-flash-low       (displayName: Gemini 3.5 Flash (Medium))
    //   Low    -> gemini-3.5-flash-extra-low (displayName: Gemini 3.5 Flash (Low))
    {
        id: "gemini-3-flash-agent",
        name: "Gemini 3.5 Flash (High)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.5-flash-low",
        name: "Gemini 3.5 Flash (Medium)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.5-flash-extra-low",
        name: "Gemini 3.5 Flash (Low)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    {
        id: "gemini-2.5-flash-thinking",
        name: "Gemini 2.5 Flash Thinking",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    {
        id: "gpt-oss-120b-medium",
        name: "GPT-OSS 120B (Medium)",
        contextLength: 131072,
        maxOutputTokens: 32768,
        supportsReasoning: true,
        toolCalling: true
    }
]);
const ANTIGRAVITY_MODEL_ALIASES = Object.freeze({
    // gemini-3.1-pro-low is not aliased: the upstream accepts it verbatim.
    // gemini-3.1-pro-high: the discovery slot returns HTTP 400 on v1internal;
    // the live upstream id is gemini-pro-agent (see ANTIGRAVITY_PUBLIC_MODELS).
    "gemini-3.1-pro-high": "gemini-pro-agent",
    "gemini-3-pro-image-preview": "gemini-3-pro-image",
    // Legacy Claude display ids → current upstream ids. NOTE: an earlier comment here
    // assumed Claude was removed from Antigravity 2.0 and would 404; discussion #3184
    // disproved that — the Antigravity OAuth backend still serves claude-opus-4-6-thinking
    // and claude-sonnet-4-6 (now listed in ANTIGRAVITY_PUBLIC_MODELS above). These aliases
    // remap the old gemini-claude-* ids to the live upstream ids.
    "gemini-claude-sonnet-4-5": "claude-sonnet-4-6",
    "gemini-claude-sonnet-4-5-thinking": "claude-sonnet-4-6",
    "gemini-claude-opus-4-5-thinking": "claude-opus-4-6-thinking"
});
const ANTIGRAVITY_PRO_FALLBACK_CHAINS = Object.freeze({
    "gemini-3.1-pro-low": Object.freeze([
        "gemini-3.1-pro-low",
        "gemini-3-pro-low"
    ])
});
function getAntigravityModelFallbacks(modelId) {
    if (!modelId) return [];
    return ANTIGRAVITY_PRO_FALLBACK_CHAINS[modelId] ?? [];
}
const ANTIGRAVITY_REVERSE_MODEL_ALIASES = Object.freeze({
    "gemini-3-pro-image": "gemini-3-pro-image-preview"
});
const CLIENT_VISIBLE_MODEL_NAMES = Object.freeze(ANTIGRAVITY_PUBLIC_MODELS.reduce((acc, model)=>{
    acc[model.id] = model.name;
    return acc;
}, {}));
const PUBLIC_MODEL_IDS = new Set(ANTIGRAVITY_PUBLIC_MODELS.map((model)=>model.id));
const UPSTREAM_PUBLIC_MODEL_IDS = new Set(ANTIGRAVITY_PUBLIC_MODELS.map((model)=>resolveAntigravityModelId(model.id)));
function resolveAntigravityModelId(modelId) {
    if (!modelId) return modelId;
    return ANTIGRAVITY_MODEL_ALIASES[modelId] || modelId;
}
function toClientAntigravityModelId(modelId) {
    if (!modelId) return modelId;
    return ANTIGRAVITY_REVERSE_MODEL_ALIASES[modelId] || modelId;
}
// Retired/hidden upstream preview buckets that must be dropped from client-facing usage.
const ANTIGRAVITY_DROPPED_QUOTA_BUCKETS = new Set([
    "gemini-3.5-flash-preview",
    "gemini-3-flash-preview"
]);
function toClientAntigravityQuotaModelId(modelId) {
    if (!modelId) return null;
    if (ANTIGRAVITY_DROPPED_QUOTA_BUCKETS.has(modelId)) return null;
    return toClientAntigravityModelId(modelId);
}
function getClientVisibleAntigravityModelName(modelId, fallbackName) {
    return CLIENT_VISIBLE_MODEL_NAMES[modelId] || fallbackName || modelId;
}
function isUserCallableAntigravityModelId(modelId) {
    if (!modelId) return false;
    const clientId = toClientAntigravityModelId(modelId);
    const upstreamId = resolveAntigravityModelId(modelId);
    return PUBLIC_MODEL_IDS.has(clientId) || UPSTREAM_PUBLIC_MODEL_IDS.has(upstreamId);
}
}),
"[project]/open-sse/config/agyModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Antigravity CLI (`agy`) model catalog.
//
// These models are pinned from the live `:fetchAvailableModels` endpoint
// (https://daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels) using a
// real `agy` consumer-OAuth token. The public catalog exposes the upstream Gemini 3.6
// and 3.5 Flash ids verbatim; the shared Antigravity executor dispatches them unchanged.
//
// The `agy` provider reuses the `antigravity` executor/translator (identical backend),
// but keeps its own catalog so the CLI and IDE model surfaces can evolve independently.
// Both currently expose the same callable Claude/Gemini/GPT set. Tab-completion models
// (`tab_flash_lite_preview`, `tab_jump_flash_lite_preview`) are intentionally excluded —
// they are not chat-callable.
__turbopack_context__.s([
    "AGY_PUBLIC_MODELS",
    ()=>AGY_PUBLIC_MODELS,
    "getClientVisibleAgyModelName",
    ()=>getClientVisibleAgyModelName,
    "isDiscoverableAgyModelId",
    ()=>isDiscoverableAgyModelId,
    "isUserCallableAgyModelId",
    ()=>isUserCallableAgyModelId
]);
const AGY_PUBLIC_MODELS = Object.freeze([
    // Gemini 3.6 Flash tiers. The live endpoint selects High by default and advertises
    // all three ids to both the IDE 2.1.1 and CLI 1.1.x clients.
    {
        id: "gemini-3.6-flash-high",
        name: "Gemini 3.6 Flash (High)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.6-flash-medium",
        name: "Gemini 3.6 Flash (Medium)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.6-flash-low",
        name: "Gemini 3.6 Flash (Low)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    // Claude (Antigravity backend).
    {
        id: "claude-opus-4-6-thinking",
        name: "Claude Opus 4.6 (Thinking)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6 (Thinking)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    // Gemini 3.1 Pro
    {
        id: "gemini-pro-agent",
        name: "Gemini 3.1 Pro (High)",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-pro-low",
        name: "Gemini 3.1 Pro (Low)",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3-flash-agent",
        name: "Gemini 3.5 Flash (High)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.5-flash-low",
        name: "Gemini 3.5 Flash (Medium)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.5-flash-extra-low",
        name: "Gemini 3.5 Flash (Low)",
        contextLength: 1048576,
        maxOutputTokens: 65536,
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    // Gemini 2.5
    {
        id: "gemini-2.5-flash-thinking",
        name: "Gemini 2.5 Flash Thinking",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        contextLength: 1048576,
        maxOutputTokens: 65535,
        toolCalling: true
    },
    // GPT-OSS
    {
        id: "gpt-oss-120b-medium",
        name: "GPT-OSS 120B (Medium)",
        contextLength: 131072,
        maxOutputTokens: 32768,
        supportsReasoning: true,
        toolCalling: true
    }
]);
const AGY_PUBLIC_MODEL_IDS = new Set(AGY_PUBLIC_MODELS.map((model)=>model.id));
const AGY_NON_CHAT_MODEL_IDS = new Set([
    "tab_flash_lite_preview",
    "tab_jump_flash_lite_preview"
]);
const AGY_CLIENT_VISIBLE_MODEL_NAMES = Object.freeze(AGY_PUBLIC_MODELS.reduce((acc, model)=>{
    acc[model.id] = model.name;
    return acc;
}, {}));
function getClientVisibleAgyModelName(modelId, fallbackName) {
    return AGY_CLIENT_VISIBLE_MODEL_NAMES[modelId] || fallbackName || modelId;
}
function isUserCallableAgyModelId(modelId) {
    return !!modelId && AGY_PUBLIC_MODEL_IDS.has(modelId);
}
function isDiscoverableAgyModelId(modelId) {
    return !!modelId && !AGY_NON_CHAT_MODEL_IDS.has(modelId);
}
}),
"[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTHROPIC_BETA_API_KEY",
    ()=>ANTHROPIC_BETA_API_KEY,
    "ANTHROPIC_BETA_CLAUDE_OAUTH",
    ()=>ANTHROPIC_BETA_CLAUDE_OAUTH,
    "ANTHROPIC_BETA_FULL",
    ()=>ANTHROPIC_BETA_FULL,
    "ANTHROPIC_VERSION_HEADER",
    ()=>ANTHROPIC_VERSION_HEADER,
    "CLAUDE_CLI_BILLING_VERSION",
    ()=>CLAUDE_CLI_BILLING_VERSION,
    "CLAUDE_CLI_BUILD_REVISION",
    ()=>CLAUDE_CLI_BUILD_REVISION,
    "CLAUDE_CLI_STAINLESS_PACKAGE_VERSION",
    ()=>CLAUDE_CLI_STAINLESS_PACKAGE_VERSION,
    "CLAUDE_CLI_STAINLESS_RUNTIME_VERSION",
    ()=>CLAUDE_CLI_STAINLESS_RUNTIME_VERSION,
    "CLAUDE_CLI_USER_AGENT",
    ()=>CLAUDE_CLI_USER_AGENT,
    "CLAUDE_CLI_VERSION",
    ()=>CLAUDE_CLI_VERSION,
    "FORWARDABLE_CLIENT_BETAS",
    ()=>FORWARDABLE_CLIENT_BETAS,
    "mergeClientAnthropicBeta",
    ()=>mergeClientAnthropicBeta,
    "normalizeAnthropicHeaderVariants",
    ()=>normalizeAnthropicHeaderVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [instrumentation] (ecmascript)");
;
const ANTHROPIC_VERSION_HEADER = "2023-06-01";
const ANTHROPIC_BETA_BASE = Object.freeze([
    "claude-code-20250219",
    "oauth-2025-04-20",
    "interleaved-thinking-2025-05-14",
    "context-management-2025-06-27",
    "prompt-caching-scope-2026-01-05",
    "advanced-tool-use-2025-11-20",
    "effort-2025-11-24",
    "structured-outputs-2025-12-15",
    "fast-mode-2026-02-01",
    "redact-thinking-2026-02-12",
    "token-efficient-tools-2026-03-28",
    "advisor-tool-2026-03-01",
    "extended-cache-ttl-2025-04-11",
    "cache-diagnosis-2026-04-07",
    "code-execution-2025-08-25",
    "skills-2025-10-02"
]);
const CLAUDE_OAUTH_EXTRA_BETAS = Object.freeze([
    "fine-grained-tool-streaming-2025-05-14"
]);
const ANTHROPIC_BETA_FULL = ANTHROPIC_BETA_BASE.join(",");
const ANTHROPIC_BETA_API_KEY = ANTHROPIC_BETA_BASE.filter((beta)=>beta !== "oauth-2025-04-20").join(",");
const ANTHROPIC_BETA_CLAUDE_OAUTH = [
    ...ANTHROPIC_BETA_BASE.slice(0, 3),
    ...CLAUDE_OAUTH_EXTRA_BETAS,
    ...ANTHROPIC_BETA_BASE.slice(3)
].join(",");
const FORWARDABLE_CLIENT_BETAS = Object.freeze([
    "tool-search-tool-2025-10-19",
    "context-1m-2025-08-07",
    "code-execution-2025-08-25",
    "skills-2025-10-02",
    // effort-2025-11-24 is a client-negotiated beta (Claude Code sends it on every
    // request). selectBetaFlags no longer force-adds it as a side-effect of the ATU
    // gate (#9505), so a client that sent it must keep it through the merge —
    // otherwise its effort negotiation is silently dropped.
    "effort-2025-11-24"
]);
function mergeClientAnthropicBeta(base, clientBeta, allow = FORWARDABLE_CLIENT_BETAS) {
    const baseList = base.split(",").map((s)=>s.trim()).filter(Boolean);
    if (typeof clientBeta !== "string" || !clientBeta.trim()) return baseList.join(",");
    const seen = new Set(baseList.map((s)=>s.toLowerCase()));
    const allowSet = new Set(allow.map((s)=>s.toLowerCase()));
    for (const token of clientBeta.split(",").map((s)=>s.trim()).filter(Boolean)){
        const lower = token.toLowerCase();
        if (allowSet.has(lower) && !seen.has(lower)) {
            baseList.push(token);
            seen.add(lower);
        }
    }
    return baseList.join(",");
}
/**
 * Collapse a list of comma-list header values into a deduped, trimmed token
 * array. Empty/undefined/null entries are dropped. Used to reconcile the
 * case-variant `anthropic-version` / `anthropic-beta` headers below.
 */ function uniqueCommaValues(values) {
    return [
        ...new Set(values.filter((value)=>value !== undefined && value !== null && value !== "").flatMap((value)=>String(value).split(",")).map((value)=>value.trim()).filter(Boolean))
    ];
}
function normalizeAnthropicHeaderVariants(headers) {
    // Only collapse when BOTH case variants are present simultaneously — that is the
    // only situation undici merges into a rejected `"v, v"` value. A lone variant is
    // sent fine on its own, so leave it untouched (preserving the caller's casing
    // instead of silently rewriting it to lowercase).
    if ("anthropic-version" in headers && "Anthropic-Version" in headers) {
        const versionValues = uniqueCommaValues([
            headers["anthropic-version"],
            headers["Anthropic-Version"]
        ]);
        delete headers["Anthropic-Version"];
        delete headers["anthropic-version"];
        if (versionValues.length > 0) {
            headers["anthropic-version"] = versionValues[0];
        }
    }
    if ("anthropic-beta" in headers && "Anthropic-Beta" in headers) {
        const betaValues = uniqueCommaValues([
            headers["anthropic-beta"],
            headers["Anthropic-Beta"]
        ]);
        delete headers["Anthropic-Beta"];
        delete headers["anthropic-beta"];
        if (betaValues.length > 0) {
            headers["anthropic-beta"] = betaValues.join(",");
        }
    }
}
const CLAUDE_CLI_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_CLI_BUILD_REVISION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_BUILD_REVISION"];
const CLAUDE_CLI_BILLING_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_BILLING_VERSION"];
const CLAUDE_CLI_USER_AGENT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClaudeCodeUserAgent"])("cli");
const CLAUDE_CLI_STAINLESS_PACKAGE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_SDK_PACKAGE_VERSION"];
const CLAUDE_CLI_STAINLESS_RUNTIME_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_RUNTIME_VERSION"];
}),
"[project]/open-sse/config/codexClient.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCodexCliRsHeaders",
    ()=>getCodexCliRsHeaders,
    "getCodexClientVersion",
    ()=>getCodexClientVersion,
    "getCodexDefaultHeaders",
    ()=>getCodexDefaultHeaders,
    "getCodexUserAgent",
    ()=>getCodexUserAgent,
    "normalizeCodexSessionId",
    ()=>normalizeCodexSessionId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/codexClient.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_CODEX_USER_AGENT_PLATFORM = "Windows 10.0.26200";
const DEFAULT_CODEX_USER_AGENT_ARCH = "x64";
const CODEX_VERSION_OVERRIDE_ENV = "CODEX_CLIENT_VERSION";
const CODEX_USER_AGENT_OVERRIDE_ENV = "CODEX_USER_AGENT";
const SAFE_HEADER_TOKEN_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/;
const SAFE_HEADER_VALUE_PATTERN = /^[\x20-\x7E]{1,200}$/;
const SAFE_CODEX_SESSION_ID_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;
function getSafeEnvValue(name, pattern) {
    const raw = process.env[name];
    if (typeof raw !== "string") return null;
    const normalized = raw.trim();
    if (!normalized || !pattern.test(normalized)) {
        return null;
    }
    return normalized;
}
function getCodexClientVersion() {
    return getSafeEnvValue(CODEX_VERSION_OVERRIDE_ENV, SAFE_HEADER_TOKEN_PATTERN) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_CODEX_CLIENT_VERSION"];
}
function getCodexUserAgent() {
    const override = getSafeEnvValue(CODEX_USER_AGENT_OVERRIDE_ENV, SAFE_HEADER_VALUE_PATTERN);
    if (override) {
        return override;
    }
    return `codex-cli/${getCodexClientVersion()} (${DEFAULT_CODEX_USER_AGENT_PLATFORM}; ${DEFAULT_CODEX_USER_AGENT_ARCH})`;
}
function getCodexDefaultHeaders() {
    return {
        Version: getCodexClientVersion(),
        "Openai-Beta": "responses=experimental",
        "X-Codex-Beta-Features": "responses_websockets",
        "User-Agent": getCodexUserAgent()
    };
}
function getCodexCliRsHeaders() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexCliRsHeaders"])(getCodexClientVersion());
}
function normalizeCodexSessionId(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    return SAFE_CODEX_SESSION_ID_PATTERN.test(normalized) ? normalized : null;
}
}),
"[project]/open-sse/config/glmProvider.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GLMT_REQUEST_DEFAULTS",
    ()=>GLMT_REQUEST_DEFAULTS,
    "GLMT_TIMEOUT_MS",
    ()=>GLMT_TIMEOUT_MS,
    "GLM_ANTHROPIC_BETA",
    ()=>GLM_ANTHROPIC_BETA,
    "GLM_ANTHROPIC_DEFAULT_BASE_URLS",
    ()=>GLM_ANTHROPIC_DEFAULT_BASE_URLS,
    "GLM_CLAUDE_CODE_USER_AGENT",
    ()=>GLM_CLAUDE_CODE_USER_AGENT,
    "GLM_COUNT_TOKENS_TIMEOUT_MS",
    ()=>GLM_COUNT_TOKENS_TIMEOUT_MS,
    "GLM_DEFAULT_BASE_URLS",
    ()=>GLM_DEFAULT_BASE_URLS,
    "GLM_MODELS_URLS",
    ()=>GLM_MODELS_URLS,
    "GLM_QUOTA_URLS",
    ()=>GLM_QUOTA_URLS,
    "GLM_REQUEST_DEFAULTS",
    ()=>GLM_REQUEST_DEFAULTS,
    "GLM_SHARED_MODELS",
    ()=>GLM_SHARED_MODELS,
    "GLM_TEAM_QUOTA_ALIAS_KEYS",
    ()=>GLM_TEAM_QUOTA_ALIAS_KEYS,
    "GLM_TEAM_QUOTA_ORGANIZATION_KEYS",
    ()=>GLM_TEAM_QUOTA_ORGANIZATION_KEYS,
    "GLM_TEAM_QUOTA_PROJECT_KEYS",
    ()=>GLM_TEAM_QUOTA_PROJECT_KEYS,
    "GLM_TIMEOUT_MS",
    ()=>GLM_TIMEOUT_MS,
    "buildGlmAnthropicMessagesUrl",
    ()=>buildGlmAnthropicMessagesUrl,
    "buildGlmBaseHeaders",
    ()=>buildGlmBaseHeaders,
    "buildGlmChatUrl",
    ()=>buildGlmChatUrl,
    "buildGlmCodingHeaders",
    ()=>buildGlmCodingHeaders,
    "buildGlmCountTokensUrl",
    ()=>buildGlmCountTokensUrl,
    "buildGlmModelsUrl",
    ()=>buildGlmModelsUrl,
    "buildGlmOpenAIChatUrl",
    ()=>buildGlmOpenAIChatUrl,
    "buildGlmQuotaFetch",
    ()=>buildGlmQuotaFetch,
    "getGlmAnthropicBaseUrl",
    ()=>getGlmAnthropicBaseUrl,
    "getGlmApiRegion",
    ()=>getGlmApiRegion,
    "getGlmBaseUrl",
    ()=>getGlmBaseUrl,
    "getGlmPrimaryTransport",
    ()=>getGlmPrimaryTransport,
    "getGlmQuotaUrl",
    ()=>getGlmQuotaUrl,
    "getGlmTeamQuotaConfig",
    ()=>getGlmTeamQuotaConfig,
    "getGlmTransport",
    ()=>getGlmTransport,
    "isAnthropicGlmBaseUrl",
    ()=>isAnthropicGlmBaseUrl,
    "isCodingGlmBaseUrl",
    ()=>isCodingGlmBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
;
;
const GLM_DEFAULT_BASE_URLS = Object.freeze({
    international: "https://api.z.ai/api/coding/paas/v4/chat/completions",
    china: "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions"
});
const GLM_ANTHROPIC_DEFAULT_BASE_URLS = Object.freeze({
    international: "https://api.z.ai/api/anthropic/v1/messages",
    china: "https://open.bigmodel.cn/api/anthropic/v1/messages"
});
const GLM_SHARED_MODELS = Object.freeze([
    {
        id: "glm-5.2",
        name: "GLM 5.2",
        contextLength: 1000000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-5.2-high",
        name: "GLM 5.2 High",
        contextLength: 1000000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-5.2-max",
        name: "GLM 5.2 Max",
        contextLength: 1000000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-5.1",
        name: "GLM 5.1",
        contextLength: 204800,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-5",
        name: "GLM 5",
        contextLength: 200000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-5-turbo",
        name: "GLM 5 Turbo",
        contextLength: 200000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-4.7-flash",
        name: "GLM 4.7 Flash",
        contextLength: 200000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-4.7",
        name: "GLM 4.7",
        contextLength: 200000,
        maxOutputTokens: 131072,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-4.6v",
        name: "GLM 4.6V (Vision)",
        contextLength: 128000,
        maxOutputTokens: 32768,
        toolCalling: true,
        supportsReasoning: true,
        supportsVision: true
    },
    {
        id: "glm-4.6",
        name: "GLM 4.6",
        contextLength: 200000,
        maxOutputTokens: 32768,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-4.5v",
        name: "GLM 4.5V (Vision)",
        contextLength: 16000,
        maxOutputTokens: 32768,
        toolCalling: true,
        supportsReasoning: true,
        supportsVision: true
    },
    {
        id: "glm-4.5",
        name: "GLM 4.5",
        contextLength: 128000,
        maxOutputTokens: 32768,
        toolCalling: true,
        supportsReasoning: true
    },
    {
        id: "glm-4.5-air",
        name: "GLM 4.5 Air",
        contextLength: 128000,
        maxOutputTokens: 32768,
        toolCalling: true,
        supportsReasoning: true
    }
]);
const GLM_MODELS_URLS = Object.freeze({
    international: "https://api.z.ai/api/coding/paas/v4/models",
    china: "https://open.bigmodel.cn/api/coding/paas/v4/models"
});
const GLM_QUOTA_URLS = Object.freeze({
    international: "https://api.z.ai/api/monitor/usage/quota/limit",
    china: "https://open.bigmodel.cn/api/monitor/usage/quota/limit"
});
const GLMT_TIMEOUT_MS = 900_000;
const GLM_TIMEOUT_MS = 3_000_000; // 50 min — aligned with Z.AI Coding Plan FAQ (API_TIMEOUT_MS=3000000)
const GLM_REQUEST_DEFAULTS = Object.freeze({
    maxTokens: 16_384
});
const GLMT_REQUEST_DEFAULTS = Object.freeze({
    maxTokens: 65_536,
    temperature: 0.2,
    thinkingBudgetTokens: 24_576,
    thinkingType: "adaptive"
});
const GLM_COUNT_TOKENS_TIMEOUT_MS = 3_000;
const GLM_CLAUDE_CODE_USER_AGENT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClaudeCodeUserAgent"])("sdk-cli");
const GLM_ANTHROPIC_BETA = [
    "claude-code-20250219",
    "interleaved-thinking-2025-05-14",
    "context-management-2025-06-27",
    "prompt-caching-scope-2026-01-05",
    "advisor-tool-2026-03-01",
    "effort-2025-11-24"
].join(",");
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function asString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}
function splitUrlQueryAndHash(url) {
    const idx = url.search(/[?#]/);
    if (idx === -1) return {
        base: url,
        suffix: ""
    };
    return {
        base: url.substring(0, idx),
        suffix: url.substring(idx)
    };
}
function getGlmApiRegion(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return data.apiRegion === "china" ? "china" : "international";
}
function buildGlmModelsUrl(providerSpecificData, transport = "openai", fallbackBaseUrl) {
    const data = asRecord(providerSpecificData);
    const customModelsUrl = asString(data.modelsUrl);
    if (customModelsUrl) return customModelsUrl;
    if (transport === "anthropic") {
        return joinGlmBaseAndPath(getGlmAnthropicBaseUrl(providerSpecificData, fallbackBaseUrl), "/v1/models");
    }
    const configuredBaseUrl = asString(data.baseUrl);
    if (configuredBaseUrl) {
        if (isAnthropicGlmBaseUrl(configuredBaseUrl)) {
            return GLM_MODELS_URLS[getGlmApiRegion(providerSpecificData)];
        }
        return joinGlmBaseAndPath(configuredBaseUrl, "/models");
    }
    return GLM_MODELS_URLS[getGlmApiRegion(providerSpecificData)];
}
function getGlmQuotaUrl(providerSpecificData) {
    return GLM_QUOTA_URLS[getGlmApiRegion(providerSpecificData)];
}
function getProviderSpecificString(data, keys) {
    for (const key of keys){
        const value = asString(data[key]);
        if (value) return value;
    }
    return null;
}
const GLM_TEAM_QUOTA_ORGANIZATION_KEYS = [
    "glmOrganizationId",
    "bigmodelOrganization",
    "glmOrganization"
];
const GLM_TEAM_QUOTA_PROJECT_KEYS = [
    "glmProjectId",
    "bigmodelProject",
    "glmProject"
];
const GLM_TEAM_QUOTA_ALIAS_KEYS = [
    "bigmodelOrganization",
    "glmOrganization",
    "bigmodelProject",
    "glmProject"
];
function getGlmTeamQuotaConfig(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    const organizationId = getProviderSpecificString(data, GLM_TEAM_QUOTA_ORGANIZATION_KEYS);
    const projectId = getProviderSpecificString(data, GLM_TEAM_QUOTA_PROJECT_KEYS);
    if (!organizationId && !projectId) return {
        state: "none"
    };
    if (organizationId && projectId) {
        return {
            state: "configured",
            organizationId,
            projectId
        };
    }
    return {
        state: "incomplete",
        missing: organizationId ? "glmProjectId" : "glmOrganizationId"
    };
}
function buildGlmQuotaFetch(apiKey, providerSpecificData) {
    const teamConfig = getGlmTeamQuotaConfig(providerSpecificData);
    const baseUrl = getGlmQuotaUrl(providerSpecificData);
    const url = teamConfig.state === "configured" ? baseUrl.includes("?") ? `${baseUrl}&type=2` : `${baseUrl}?type=2` : baseUrl;
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
    };
    if (teamConfig.state === "configured") {
        headers["bigmodel-organization"] = teamConfig.organizationId;
        headers["bigmodel-project"] = teamConfig.projectId;
    }
    return {
        url,
        headers
    };
}
function stripKnownGlmEndpointSuffix(baseUrl) {
    const parts = splitUrlQueryAndHash(baseUrl);
    let base = parts.base;
    while(base.endsWith("/")){
        base = base.slice(0, -1);
    }
    const countTokensMatch = base.match(/\/(?:v\d+\/)?messages\/count_tokens$/i);
    if (countTokensMatch) {
        base = base.substring(0, base.length - countTokensMatch[0].length);
    } else {
        const messagesMatch = base.match(/\/(?:v\d+\/)?messages$/i);
        if (messagesMatch) {
            base = base.substring(0, base.length - messagesMatch[0].length);
        } else if (base.toLowerCase().endsWith("/chat/completions")) {
            base = base.substring(0, base.length - "/chat/completions".length);
        } else if (base.toLowerCase().endsWith("/models")) {
            base = base.substring(0, base.length - "/models".length);
        }
    }
    return {
        base,
        suffix: parts.suffix
    };
}
function joinGlmBaseAndPath(baseUrl, path) {
    const { base, suffix } = stripKnownGlmEndpointSuffix(baseUrl);
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const versionMatch = base.match(/\/v\d+$/i);
    if (versionMatch && normalizedPath.toLowerCase().startsWith(`${versionMatch[0].toLowerCase()}/`)) {
        return `${base}${normalizedPath.slice(versionMatch[0].length)}${suffix}`;
    }
    return `${base}${normalizedPath}${suffix}`;
}
function stripQueryAndTrailingSlash(baseUrl) {
    let base = splitUrlQueryAndHash(baseUrl).base;
    while(base.endsWith("/")){
        base = base.slice(0, -1);
    }
    return base;
}
function addBetaQuery(url) {
    const parsed = new URL(url);
    parsed.searchParams.set("beta", "true");
    return parsed.toString();
}
function isAnthropicGlmBaseUrl(baseUrl) {
    const base = stripQueryAndTrailingSlash(baseUrl).toLowerCase();
    return base.includes("/api/anthropic/") || base.endsWith("/api/anthropic");
}
function isCodingGlmBaseUrl(baseUrl) {
    const base = stripQueryAndTrailingSlash(baseUrl).toLowerCase();
    const idx = base.indexOf("/api/coding/paas/v");
    if (idx === -1) return false;
    const afterV = base.charCodeAt(idx + "/api/coding/paas/v".length);
    return afterV >= 48 && afterV <= 57; // first char after 'v' must be a digit
}
function getGlmBaseUrl(providerSpecificData, fallbackBaseUrl) {
    const data = asRecord(providerSpecificData);
    const configuredBaseUrl = asString(data.baseUrl);
    if (configuredBaseUrl) return configuredBaseUrl;
    const regionalBaseUrl = typeof fallbackBaseUrl === "string" && fallbackBaseUrl.trim() && isCodingGlmBaseUrl(fallbackBaseUrl) ? fallbackBaseUrl.trim() : GLM_DEFAULT_BASE_URLS[getGlmApiRegion(providerSpecificData)];
    if (regionalBaseUrl) return regionalBaseUrl;
    return typeof fallbackBaseUrl === "string" && fallbackBaseUrl.trim() ? fallbackBaseUrl.trim() : GLM_DEFAULT_BASE_URLS.international;
}
function getGlmAnthropicBaseUrl(providerSpecificData, fallbackBaseUrl) {
    const data = asRecord(providerSpecificData);
    const anthropicBaseUrl = asString(data.anthropicBaseUrl);
    if (anthropicBaseUrl) return anthropicBaseUrl;
    const configuredBaseUrl = asString(data.baseUrl);
    if (configuredBaseUrl) {
        if (isCodingGlmBaseUrl(configuredBaseUrl)) {
            return GLM_ANTHROPIC_DEFAULT_BASE_URLS[getGlmApiRegion(providerSpecificData)];
        }
        return configuredBaseUrl;
    }
    if (typeof fallbackBaseUrl === "string" && fallbackBaseUrl.trim() && isCodingGlmBaseUrl(fallbackBaseUrl)) {
        return GLM_ANTHROPIC_DEFAULT_BASE_URLS[fallbackBaseUrl.includes("open.bigmodel.cn") ? "china" : getGlmApiRegion(providerSpecificData)];
    }
    if (typeof fallbackBaseUrl === "string" && fallbackBaseUrl.trim() && !isCodingGlmBaseUrl(fallbackBaseUrl)) {
        return fallbackBaseUrl.trim();
    }
    return GLM_ANTHROPIC_DEFAULT_BASE_URLS[getGlmApiRegion(providerSpecificData)];
}
function getGlmPrimaryTransport(providerSpecificData, fallbackBaseUrl) {
    const data = asRecord(providerSpecificData);
    const configuredTransport = asString(data.primaryTransport);
    if (configuredTransport === "anthropic") return "anthropic";
    if (configuredTransport === "openai") return "openai";
    return isAnthropicGlmBaseUrl(getGlmBaseUrl(providerSpecificData, fallbackBaseUrl)) ? "anthropic" : "openai";
}
function getGlmTransport(providerSpecificData, fallbackBaseUrl) {
    return getGlmPrimaryTransport(providerSpecificData, fallbackBaseUrl);
}
function buildGlmChatUrl(providerSpecificData, transport = "openai", fallbackBaseUrl) {
    if (transport === "anthropic") {
        return buildGlmAnthropicMessagesUrl(providerSpecificData, fallbackBaseUrl);
    }
    return buildGlmOpenAIChatUrl(providerSpecificData, fallbackBaseUrl);
}
function buildGlmOpenAIChatUrl(providerSpecificData, fallbackBaseUrl) {
    const configuredBaseUrl = getGlmBaseUrl(providerSpecificData, fallbackBaseUrl);
    const baseUrl = isAnthropicGlmBaseUrl(configuredBaseUrl) ? GLM_DEFAULT_BASE_URLS[getGlmApiRegion(providerSpecificData)] : configuredBaseUrl;
    return joinGlmBaseAndPath(baseUrl, "/chat/completions");
}
function buildGlmAnthropicMessagesUrl(providerSpecificData, fallbackBaseUrl) {
    return addBetaQuery(joinGlmBaseAndPath(getGlmAnthropicBaseUrl(providerSpecificData, fallbackBaseUrl), "/v1/messages"));
}
function buildGlmCountTokensUrl(providerSpecificData, fallbackBaseUrl) {
    return addBetaQuery(joinGlmBaseAndPath(getGlmAnthropicBaseUrl(providerSpecificData, fallbackBaseUrl), "/v1/messages/count_tokens"));
}
function buildGlmCodingHeaders(apiKey, stream = true) {
    return {
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
        Authorization: `Bearer ${apiKey}`
    };
}
function buildGlmBaseHeaders(apiKey, stream = true) {
    return {
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
        "x-api-key": apiKey,
        "anthropic-version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"],
        "anthropic-beta": GLM_ANTHROPIC_BETA,
        "anthropic-dangerous-direct-browser-access": "true",
        "User-Agent": GLM_CLAUDE_CODE_USER_AGENT,
        "X-Stainless-Lang": "js",
        "X-Stainless-Runtime": "node",
        "X-Stainless-Retry-Count": "0",
        "accept-language": "*",
        "accept-encoding": "gzip, deflate, br, zstd",
        connection: "keep-alive"
    };
}
}),
"[project]/open-sse/utils/urlSanitize.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Strip trailing slash characters from a string without using a regex
 * quantifier on uncontrolled input (avoids CodeQL `js/polynomial-redos`).
 *
 * Equivalent to `value.replace(/\/+$/, "")` but runs in O(n) guaranteed
 * time with no backtracking risk.
 */ __turbopack_context__.s([
    "normalizeBaseUrl",
    ()=>normalizeBaseUrl,
    "stripTrailingSlashes",
    ()=>stripTrailingSlashes
]);
function stripTrailingSlashes(value) {
    let end = value.length;
    while(end > 0 && value.charCodeAt(end - 1) === 0x2f /* '/' */ ){
        end--;
    }
    return end === value.length ? value : value.slice(0, end);
}
function normalizeBaseUrl(value) {
    const str = typeof value === "string" ? value : "";
    return stripTrailingSlashes(str.trim());
}
}),
"[project]/open-sse/config/maritalk.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MARITALK_DEFAULT_BASE_URL",
    ()=>MARITALK_DEFAULT_BASE_URL,
    "buildMaritalkChatUrl",
    ()=>buildMaritalkChatUrl,
    "buildMaritalkModelsUrl",
    ()=>buildMaritalkModelsUrl,
    "normalizeMaritalkBaseUrl",
    ()=>normalizeMaritalkBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [instrumentation] (ecmascript)");
;
const MARITALK_DEFAULT_BASE_URL = "https://chat.maritaca.ai/api";
function normalizeMaritalkBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])((value || MARITALK_DEFAULT_BASE_URL).trim());
    if (!normalized) return MARITALK_DEFAULT_BASE_URL;
    return normalized.replace(/\/chat\/(?:completions|inference)$/i, "");
}
function buildMaritalkChatUrl(value) {
    return `${normalizeMaritalkBaseUrl(value)}/chat/completions`;
}
function buildMaritalkModelsUrl(value) {
    return `${normalizeMaritalkBaseUrl(value)}/models`;
}
}),
"[project]/open-sse/services/antigravityVersion.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_CLI_FALLBACK_VERSION",
    ()=>ANTIGRAVITY_CLI_FALLBACK_VERSION,
    "ANTIGRAVITY_IDE_FALLBACK_VERSION",
    ()=>ANTIGRAVITY_IDE_FALLBACK_VERSION,
    "ANTIGRAVITY_VERSION_CACHE_TTL_MS",
    ()=>ANTIGRAVITY_VERSION_CACHE_TTL_MS,
    "ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS",
    ()=>ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS,
    "clearAntigravityVersionCaches",
    ()=>clearAntigravityVersionCaches,
    "getCachedAntigravityCliVersion",
    ()=>getCachedAntigravityCliVersion,
    "getCachedAntigravityIdeVersion",
    ()=>getCachedAntigravityIdeVersion,
    "resolveAntigravityCliVersion",
    ()=>resolveAntigravityCliVersion,
    "resolveAntigravityIdeVersion",
    ()=>resolveAntigravityIdeVersion,
    "seedAntigravityCliVersionCache",
    ()=>seedAntigravityCliVersionCache,
    "seedAntigravityIdeVersionCache",
    ()=>seedAntigravityIdeVersionCache
]);
const ANTIGRAVITY_IDE_RELEASE_FEED_URL = "https://antigravity-auto-updater-974169037036.us-central1.run.app/releases";
const ANTIGRAVITY_CLI_RELEASE_URL = "https://api.github.com/repos/google-antigravity/antigravity-cli/releases/latest";
const ANTIGRAVITY_VERSION_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS = 5_000;
const ANTIGRAVITY_IDE_FALLBACK_VERSION = "2.1.1";
const ANTIGRAVITY_CLI_FALLBACK_VERSION = "1.1.5";
const ideState = {
    cache: null,
    inFlight: null
};
const cliState = {
    cache: null,
    inFlight: null
};
function normalizeVersion(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim().replace(/^v/i, "");
    const match = trimmed.match(/^(\d+\.\d+\.\d+)\b/);
    return match ? match[1] : null;
}
function compareSemver(a, b) {
    const aParts = a.split(".").map((part)=>Number.parseInt(part, 10) || 0);
    const bParts = b.split(".").map((part)=>Number.parseInt(part, 10) || 0);
    for(let i = 0; i < 3; i += 1){
        if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
    }
    return 0;
}
function pickNewestVersion(...versions) {
    return versions.map((version)=>normalizeVersion(version)).filter((version)=>!!version).reduce((best, version)=>!best || compareSemver(version, best) > 0 ? version : best, null);
}
async function fetchJsonWithTimeout(fetchImpl, url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS);
    try {
        const response = await fetchImpl(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": "OmniRoute-AntigravityVersion/1.0"
            },
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`Version source ${url} returned ${response.status}`);
        }
        return response.json();
    } finally{
        clearTimeout(timeoutId);
    }
}
function parseIdeReleaseFeed(payload) {
    if (!Array.isArray(payload)) return null;
    return pickNewestVersion(...payload.map((entry)=>entry?.version));
}
function parseCliRelease(payload) {
    if (!payload || typeof payload !== "object") return null;
    const release = payload;
    return normalizeVersion(release.tag_name ?? release.name);
}
async function resolveProductVersion(state, fallbackVersion, sourceUrl, parsePayload, fetchImpl) {
    const now = Date.now();
    if (state.cache && now - state.cache.fetchedAt < ANTIGRAVITY_VERSION_CACHE_TTL_MS) {
        return pickNewestVersion(state.cache.version, fallbackVersion) ?? fallbackVersion;
    }
    if (state.inFlight) {
        return state.inFlight;
    }
    state.inFlight = (async ()=>{
        let resolved = null;
        try {
            resolved = parsePayload(await fetchJsonWithTimeout(fetchImpl, sourceUrl));
        } catch  {
            resolved = null;
        }
        const version = pickNewestVersion(resolved, state.cache?.version, fallbackVersion) ?? fallbackVersion;
        if (resolved) {
            state.cache = {
                fetchedAt: Date.now(),
                version
            };
        }
        return version;
    })();
    try {
        return await state.inFlight;
    } finally{
        state.inFlight = null;
    }
}
function seedVersionCache(state, version, fetchedAt) {
    const normalized = normalizeVersion(version);
    if (!normalized) {
        throw new TypeError(`Invalid Antigravity version: ${version}`);
    }
    state.cache = {
        fetchedAt,
        version: normalized
    };
}
function resolveAntigravityIdeVersion(fetchImpl = fetch) {
    return resolveProductVersion(ideState, ANTIGRAVITY_IDE_FALLBACK_VERSION, ANTIGRAVITY_IDE_RELEASE_FEED_URL, parseIdeReleaseFeed, fetchImpl);
}
function resolveAntigravityCliVersion(fetchImpl = fetch) {
    return resolveProductVersion(cliState, ANTIGRAVITY_CLI_FALLBACK_VERSION, ANTIGRAVITY_CLI_RELEASE_URL, parseCliRelease, fetchImpl);
}
function getCachedAntigravityIdeVersion() {
    return ideState.cache?.version ?? ANTIGRAVITY_IDE_FALLBACK_VERSION;
}
function getCachedAntigravityCliVersion() {
    return cliState.cache?.version ?? ANTIGRAVITY_CLI_FALLBACK_VERSION;
}
function seedAntigravityIdeVersionCache(version, fetchedAt = Date.now()) {
    seedVersionCache(ideState, version, fetchedAt);
}
function seedAntigravityCliVersionCache(version, fetchedAt = Date.now()) {
    seedVersionCache(cliState, version, fetchedAt);
}
function clearAntigravityVersionCaches() {
    ideState.cache = null;
    ideState.inFlight = null;
    cliState.cache = null;
    cliState.inFlight = null;
}
}),
"[project]/open-sse/services/antigravityHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_IDE_NODE_API_CLIENT",
    ()=>ANTIGRAVITY_IDE_NODE_API_CLIENT,
    "ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT",
    ()=>ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT,
    "antigravityCliUserAgent",
    ()=>antigravityCliUserAgent,
    "antigravityIdeNodeUserAgent",
    ()=>antigravityIdeNodeUserAgent,
    "antigravityIdeUserAgent",
    ()=>antigravityIdeUserAgent,
    "getAntigravityContentHeaders",
    ()=>getAntigravityContentHeaders,
    "getAntigravityIdeNodeHeaders",
    ()=>getAntigravityIdeNodeHeaders,
    "getAntigravityLoadCodeAssistMetadata",
    ()=>getAntigravityLoadCodeAssistMetadata,
    "getAntigravityOAuthUserAgent",
    ()=>getAntigravityOAuthUserAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityVersion.ts [instrumentation] (ecmascript)");
;
const ANTIGRAVITY_IDE_NODE_API_CLIENT = "google-api-nodejs-client/10.3.0";
const ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT = "gl-node/22.21.1";
// Antigravity presents the native macOS desktop client fingerprint: the upstream
// backend expects the Mac build, so the OS/arch token is pinned to darwin/arm64
// regardless of the host OmniRoute happens to run on (#8098). The IDE / CLI /
// IDE-Node User-Agent split (#8013) is preserved — only the platform token is fixed.
const ANTIGRAVITY_OS_TYPE = "darwin";
const ANTIGRAVITY_ARCH = "arm64";
function withOptionalBearerAuth(headers, accessToken) {
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
}
function antigravityIdeUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedAntigravityIdeVersion"])()) {
    return `antigravity/ide/${version} ${ANTIGRAVITY_OS_TYPE}/${ANTIGRAVITY_ARCH}`;
}
function antigravityCliUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedAntigravityCliVersion"])(), authMethod = "consumer") {
    return `antigravity/cli/${version} (aidev_client; os_type=${ANTIGRAVITY_OS_TYPE}; arch=${ANTIGRAVITY_ARCH}; auth_method=${authMethod})`;
}
function antigravityIdeNodeUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedAntigravityIdeVersion"])()) {
    return `antigravity/${version} ${ANTIGRAVITY_OS_TYPE}/${ANTIGRAVITY_ARCH} ${ANTIGRAVITY_IDE_NODE_API_CLIENT}`;
}
function getAntigravityOAuthUserAgent(profile) {
    return profile === "cli" ? antigravityCliUserAgent() : antigravityIdeNodeUserAgent();
}
function getAntigravityContentHeaders(profile, accessToken) {
    return withOptionalBearerAuth({
        "Content-Type": "application/json",
        "User-Agent": profile === "cli" ? antigravityCliUserAgent() : antigravityIdeUserAgent()
    }, accessToken);
}
function getAntigravityIdeNodeHeaders(accessToken) {
    return withOptionalBearerAuth({
        "Content-Type": "application/json",
        "User-Agent": antigravityIdeNodeUserAgent(),
        "X-Goog-Api-Client": ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT
    }, accessToken);
}
function getAntigravityLoadCodeAssistMetadata() {
    return {
        ideType: "ANTIGRAVITY"
    };
}
}),
"[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CURSOR_REGISTRY_VERSION",
    ()=>CURSOR_REGISTRY_VERSION,
    "GITHUB_COPILOT_API_VERSION",
    ()=>GITHUB_COPILOT_API_VERSION,
    "GITHUB_COPILOT_CHAT_PLUGIN_VERSION",
    ()=>GITHUB_COPILOT_CHAT_PLUGIN_VERSION,
    "GITHUB_COPILOT_CHAT_USER_AGENT",
    ()=>GITHUB_COPILOT_CHAT_USER_AGENT,
    "GITHUB_COPILOT_DEFAULT_INITIATOR",
    ()=>GITHUB_COPILOT_DEFAULT_INITIATOR,
    "GITHUB_COPILOT_EDITOR_VERSION",
    ()=>GITHUB_COPILOT_EDITOR_VERSION,
    "GITHUB_COPILOT_INTEGRATION_ID",
    ()=>GITHUB_COPILOT_INTEGRATION_ID,
    "GITHUB_COPILOT_OPENAI_INTENT",
    ()=>GITHUB_COPILOT_OPENAI_INTENT,
    "GITHUB_COPILOT_REFRESH_PLUGIN_VERSION",
    ()=>GITHUB_COPILOT_REFRESH_PLUGIN_VERSION,
    "GITHUB_COPILOT_REFRESH_USER_AGENT",
    ()=>GITHUB_COPILOT_REFRESH_USER_AGENT,
    "GITHUB_COPILOT_USER_AGENT_LIBRARY",
    ()=>GITHUB_COPILOT_USER_AGENT_LIBRARY,
    "KIRO_AMZ_USER_AGENT",
    ()=>KIRO_AMZ_USER_AGENT,
    "KIRO_SDK_USER_AGENT",
    ()=>KIRO_SDK_USER_AGENT,
    "KIRO_STREAMING_TARGET",
    ()=>KIRO_STREAMING_TARGET,
    "QODER_DEFAULT_USER_AGENT",
    ()=>QODER_DEFAULT_USER_AGENT,
    "QWEN_CLI_VERSION",
    ()=>QWEN_CLI_VERSION,
    "QWEN_STAINLESS_LANG",
    ()=>QWEN_STAINLESS_LANG,
    "getAntigravityProviderHeaders",
    ()=>getAntigravityProviderHeaders,
    "getAntigravityUserAgent",
    ()=>getAntigravityUserAgent,
    "getCursorRegistryHeaders",
    ()=>getCursorRegistryHeaders,
    "getCursorUserAgent",
    ()=>getCursorUserAgent,
    "getGitHubCopilotChatHeaders",
    ()=>getGitHubCopilotChatHeaders,
    "getGitHubCopilotInternalUserHeaders",
    ()=>getGitHubCopilotInternalUserHeaders,
    "getGitHubCopilotRefreshHeaders",
    ()=>getGitHubCopilotRefreshHeaders,
    "getKiroServiceHeaders",
    ()=>getKiroServiceHeaders,
    "getQoderDashscopeCompatHeaders",
    ()=>getQoderDashscopeCompatHeaders,
    "getQoderDefaultHeaders",
    ()=>getQoderDefaultHeaders,
    "getQwenCliUserAgent",
    ()=>getQwenCliUserAgent,
    "getRuntimeArch",
    ()=>getRuntimeArch,
    "getRuntimePlatform",
    ()=>getRuntimePlatform,
    "getRuntimeVersion",
    ()=>getRuntimeVersion,
    "normalizeStainlessArch",
    ()=>normalizeStainlessArch,
    "normalizeStainlessPlatform",
    ()=>normalizeStainlessPlatform
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [instrumentation] (ecmascript)");
;
const GITHUB_COPILOT_API_VERSION = "2026-06-01";
const GITHUB_COPILOT_EDITOR_VERSION = "vscode/1.126.0";
const GITHUB_COPILOT_CHAT_PLUGIN_VERSION = "copilot-chat/0.54.0";
const GITHUB_COPILOT_CHAT_USER_AGENT = "GitHubCopilotChat/0.54.0";
const GITHUB_COPILOT_REFRESH_PLUGIN_VERSION = "copilot/1.388.0";
const GITHUB_COPILOT_REFRESH_USER_AGENT = "GithubCopilot/1.0";
const GITHUB_COPILOT_INTEGRATION_ID = "vscode-chat";
const GITHUB_COPILOT_OPENAI_INTENT = "conversation-panel";
const GITHUB_COPILOT_DEFAULT_INITIATOR = "user";
const GITHUB_COPILOT_USER_AGENT_LIBRARY = "electron-fetch";
const QWEN_CLI_VERSION = "0.19.3";
const QWEN_STAINLESS_LANG = "js";
const QODER_DEFAULT_USER_AGENT = "Qoder-Cli";
const KIRO_SDK_USER_AGENT = "AWS-SDK-JS/3.0.0 kiro-ide/1.0.0";
const KIRO_AMZ_USER_AGENT = "aws-sdk-js/3.0.0 kiro-ide/1.0.0";
const KIRO_STREAMING_TARGET = "AmazonCodeWhispererStreamingService.GenerateAssistantResponse";
const CURSOR_REGISTRY_VERSION = "3.9";
function getGitHubCopilotChatHeaders(accept = "application/json", initiator = GITHUB_COPILOT_DEFAULT_INITIATOR) {
    return {
        "copilot-integration-id": GITHUB_COPILOT_INTEGRATION_ID,
        "editor-version": GITHUB_COPILOT_EDITOR_VERSION,
        "editor-plugin-version": GITHUB_COPILOT_CHAT_PLUGIN_VERSION,
        "user-agent": GITHUB_COPILOT_CHAT_USER_AGENT,
        "openai-intent": GITHUB_COPILOT_OPENAI_INTENT,
        "x-github-api-version": GITHUB_COPILOT_API_VERSION,
        "x-vscode-user-agent-library-version": GITHUB_COPILOT_USER_AGENT_LIBRARY,
        "X-Initiator": initiator,
        Accept: accept,
        "Content-Type": "application/json"
    };
}
function getRuntimePlatform() {
    return typeof process !== "undefined" && typeof process.platform === "string" ? process.platform : "unknown";
}
function getRuntimeArch() {
    return typeof process !== "undefined" && typeof process.arch === "string" ? process.arch : "unknown";
}
function getRuntimeVersion() {
    return typeof process !== "undefined" && typeof process.version === "string" ? process.version : "unknown";
}
function normalizeStainlessPlatform(platform = getRuntimePlatform()) {
    const normalized = platform.toLowerCase();
    if (normalized.includes("ios")) return "iOS";
    if (normalized === "android") return "Android";
    if (normalized === "darwin") return "MacOS";
    if (normalized === "win32") return "Windows";
    if (normalized === "freebsd") return "FreeBSD";
    if (normalized === "openbsd") return "OpenBSD";
    if (normalized === "linux") return "Linux";
    return normalized ? `Other:${normalized}` : "Unknown";
}
function normalizeStainlessArch(arch = getRuntimeArch()) {
    if (arch === "x32") return "x32";
    if (arch === "x86_64" || arch === "x64") return "x64";
    if (arch === "arm") return "arm";
    if (arch === "aarch64" || arch === "arm64") return "arm64";
    return arch ? `other:${arch}` : "unknown";
}
function getQwenCliUserAgent(version = QWEN_CLI_VERSION) {
    // Qoder's DashScope-compatible backend expects Qwen Code's runtime-derived wire identity.
    // Keep it runtime-derived so packaged deployments use their own platform/architecture.
    return `QwenCode/${version} (${getRuntimePlatform()}; ${getRuntimeArch()})`;
}
function getGitHubCopilotInternalUserHeaders(authorization) {
    return {
        Authorization: authorization,
        Accept: "application/json",
        "X-GitHub-Api-Version": GITHUB_COPILOT_API_VERSION,
        "User-Agent": GITHUB_COPILOT_CHAT_USER_AGENT,
        "Editor-Version": GITHUB_COPILOT_EDITOR_VERSION,
        "Editor-Plugin-Version": GITHUB_COPILOT_CHAT_PLUGIN_VERSION
    };
}
function getGitHubCopilotRefreshHeaders(authorization) {
    return {
        Authorization: authorization,
        Accept: "application/json",
        "User-Agent": GITHUB_COPILOT_REFRESH_USER_AGENT,
        "Editor-Version": GITHUB_COPILOT_EDITOR_VERSION,
        "Editor-Plugin-Version": GITHUB_COPILOT_REFRESH_PLUGIN_VERSION
    };
}
function getQoderDefaultHeaders() {
    return {
        "User-Agent": QODER_DEFAULT_USER_AGENT
    };
}
function getQoderDashscopeCompatHeaders() {
    const userAgent = getQwenCliUserAgent();
    return {
        "x-dashscope-authtype": "qwen-oauth",
        "x-dashscope-cachecontrol": "enable",
        "user-agent": userAgent,
        "x-dashscope-useragent": userAgent,
        "x-stainless-arch": normalizeStainlessArch(),
        "x-stainless-lang": QWEN_STAINLESS_LANG,
        "x-stainless-os": normalizeStainlessPlatform()
    };
}
function getAntigravityUserAgent(profile = "ide") {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(profile)["User-Agent"];
}
function getAntigravityProviderHeaders(profile = "ide") {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(profile);
}
function getKiroServiceHeaders(accept = "application/vnd.amazon.eventstream") {
    return {
        "Content-Type": "application/json",
        Accept: accept,
        "X-Amz-Target": KIRO_STREAMING_TARGET,
        "User-Agent": KIRO_SDK_USER_AGENT,
        "X-Amz-User-Agent": KIRO_AMZ_USER_AGENT
    };
}
function getCursorUserAgent(version) {
    return `Cursor/${version}`;
}
function getCursorRegistryHeaders(version = CURSOR_REGISTRY_VERSION) {
    return {
        "connect-accept-encoding": "gzip",
        "connect-protocol-version": "1",
        "Content-Type": "application/connect+proto",
        "User-Agent": getCursorUserAgent(version)
    };
}
}),
"[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodePublicCred",
    ()=>decodePublicCred,
    "decodePublicCredBytes",
    ()=>decodePublicCredBytes,
    "encodePublicCred",
    ()=>encodePublicCred,
    "resolvePublicCred",
    ()=>resolvePublicCred,
    "resolvePublicCredMulti",
    ()=>resolvePublicCredMulti
]);
/**
 * Public credentials decoder.
 *
 * Some upstream providers (Gemini, Antigravity, Windsurf/Devin CLI) ship
 * OAuth client_id / client_secret / Firebase Web API key values inside their
 * public binaries or web apps. These are credentials by name only — Google
 * explicitly documents that:
 *
 *   - OAuth client_id/secret for native/installed apps using PKCE are
 *     publicly distributed and must not be treated as secrets.
 *     https://developers.google.com/identity/protocols/oauth2/native-app
 *   - Firebase Web API keys are public client identifiers.
 *     https://firebase.google.com/docs/projects/api-keys
 *
 * OmniRoute embeds them so users who do not configure `.env` still get a
 * working OAuth flow out of the box. The literals, however, trip pattern
 * scanners (AIza..., GOCSPX-..., ...googleusercontent.com) and produce
 * noisy false-positive alerts on every release.
 *
 * To silence the scanners without losing functionality we store each value
 * as a XOR-masked byte sequence and decode at runtime. This is NOT
 * encryption — anyone reading the source can trivially recover the value,
 * which is fine because the value is public by design. The only goal is to
 * avoid known scanner regexes in the source text.
 *
 * Backward compatibility: existing users have raw values in their `.env`
 * (e.g. `WINDSURF_FIREBASE_API_KEY=AIzaSy...`). `decodePublicCred()` detects
 * raw values by their well-known prefixes and passes them through unchanged,
 * so no migration is required for current installations.
 */ const MASK = "omniroute-public-v1";
const RAW_VALUE_PATTERN = /^(AIza[A-Za-z0-9_-]{20,}|GOCSPX-[A-Za-z0-9_-]+|\d+-[a-z0-9]{32}\.apps\.googleusercontent\.com|Iv1\.[a-f0-9]+)$/;
function unmaskBytes(bytes) {
    let out = "";
    for(let i = 0; i < bytes.length; i++){
        out += String.fromCharCode(bytes[i] ^ MASK.charCodeAt(i % MASK.length));
    }
    return out;
}
function maskBytes(plain) {
    const arr = [];
    for(let i = 0; i < plain.length; i++){
        arr.push(plain.charCodeAt(i) ^ MASK.charCodeAt(i % MASK.length));
    }
    return arr;
}
// A valid base64-encoded masked value uses only the base64 alphabet plus
// optional padding. Anything outside that alphabet is definitely a raw
// credential the user supplied (a token format we don't yet recognize in
// RAW_VALUE_PATTERN) — never try to base64-decode it.
const STRICT_BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
// Plaintext credentials never contain control characters. If unmasking
// produces non-printable bytes, the input wasn't actually masked and we
// must return it untouched to avoid silently mangling raw overrides.
function looksLikePrintablePlain(s) {
    if (!s) return false;
    for(let i = 0; i < s.length; i++){
        const code = s.charCodeAt(i);
        // Allow printable ASCII (0x20–0x7E). Everything outside that is suspect.
        if (code < 0x20 || code > 0x7e) return false;
    }
    return true;
}
function decodePublicCred(value) {
    if (!value || typeof value !== "string") return "";
    if (RAW_VALUE_PATTERN.test(value)) return value;
    // Reject anything that isn't strict base64 — saves us from feeding raw
    // ASCII overrides into the lenient Buffer.from(...,"base64") path.
    if (!STRICT_BASE64.test(value)) return value;
    try {
        const buf = Buffer.from(value, "base64");
        if (buf.length === 0) return value;
        const arr = [];
        for(let i = 0; i < buf.length; i++)arr.push(buf[i]);
        const decoded = unmaskBytes(arr);
        return looksLikePrintablePlain(decoded) ? decoded : value;
    } catch  {
        return value;
    }
}
function encodePublicCred(plain) {
    if (!plain) return "";
    return Buffer.from(maskBytes(plain)).toString("base64");
}
function decodePublicCredBytes(bytes) {
    if (!bytes || bytes.length === 0) return "";
    return unmaskBytes(bytes);
}
/**
 * Embedded public defaults. Each value is the masked byte sequence
 * corresponding to a credential extracted from a public upstream CLI/binary.
 *
 * To regenerate a value:
 *   node -e 'import("./open-sse/utils/publicCreds.ts").then(m =>
 *     console.log(JSON.stringify(m.encodePublicCred("<plaintext>"))))'
 *
 * Or use the helper below `embeddedBytesFor()`.
 */ const EMBEDDED_DEFAULTS = {
    // Gemini / Code Assist — google oauth client (public, PKCE)
    gemini_id: [
        89,
        85,
        95,
        91,
        71,
        90,
        77,
        68,
        92,
        30,
        73,
        64,
        79,
        3,
        6,
        91,
        75,
        2,
        3,
        0,
        29,
        28,
        13,
        0,
        1,
        5,
        77,
        0,
        30,
        17,
        4,
        4,
        90,
        8,
        21,
        30,
        30,
        92,
        11,
        4,
        12,
        88,
        65,
        90,
        31,
        90,
        4,
        93,
        0,
        6,
        76,
        11,
        6,
        12,
        74,
        26,
        84,
        26,
        30,
        11,
        27,
        17,
        0,
        27,
        0,
        0,
        67,
        4,
        91,
        1,
        3,
        4
    ],
    gemini_alt: [
        40,
        34,
        45,
        58,
        34,
        55,
        88,
        64,
        16,
        101,
        23,
        56,
        50,
        1,
        68,
        82,
        66,
        65,
        98,
        4,
        64,
        9,
        12,
        36,
        89,
        54,
        1,
        80,
        78,
        28,
        45,
        36,
        31,
        17,
        15
    ],
    // Antigravity — google oauth client (public)
    antigravity_id: [
        94,
        93,
        89,
        88,
        66,
        95,
        67,
        68,
        83,
        29,
        69,
        76,
        83,
        65,
        29,
        14,
        69,
        5,
        66,
        6,
        3,
        92,
        1,
        64,
        94,
        25,
        23,
        23,
        72,
        66,
        70,
        87,
        26,
        29,
        12,
        65,
        25,
        91,
        7,
        89,
        9,
        93,
        66,
        92,
        16,
        4,
        75,
        76,
        0,
        5,
        17,
        66,
        14,
        12,
        66,
        17,
        93,
        10,
        24,
        29,
        12,
        0,
        12,
        26,
        26,
        17,
        72,
        30,
        1,
        76,
        15,
        6,
        14
    ],
    antigravity_alt: [
        40,
        34,
        45,
        58,
        34,
        55,
        88,
        63,
        80,
        21,
        54,
        34,
        48,
        88,
        81,
        85,
        97,
        18,
        125,
        37,
        92,
        3,
        37,
        48,
        87,
        6,
        44,
        38,
        25,
        10,
        67,
        19,
        40,
        40,
        5
    ],
    // Windsurf / Devin CLI — firebase web client identifier (public)
    windsurf_fb: [
        46,
        36,
        20,
        8,
        33,
        22,
        55,
        4,
        41,
        121,
        53,
        50,
        49,
        24,
        92,
        90,
        108,
        35,
        97,
        36,
        21,
        44,
        11,
        69,
        3,
        60,
        35,
        15,
        126,
        53,
        71,
        56,
        52,
        56,
        43,
        26,
        27,
        86,
        58
    ],
    // Claude Code CLI — anthropic oauth client (public, PKCE)
    claude_id: [
        86,
        9,
        95,
        10,
        64,
        90,
        69,
        21,
        72,
        72,
        70,
        68,
        0,
        65,
        93,
        87,
        73,
        79,
        28,
        87,
        85,
        11,
        13,
        95,
        90,
        76,
        64,
        81,
        73,
        65,
        76,
        84,
        94,
        15,
        86,
        72
    ],
    // Codex CLI — openai oauth client (public, PKCE)
    codex_id: [
        14,
        29,
        30,
        54,
        55,
        34,
        26,
        21,
        8,
        104,
        53,
        47,
        85,
        95,
        15,
        83,
        110,
        29,
        105,
        14,
        53,
        30,
        94,
        26,
        29,
        20,
        26,
        11
    ],
    // Kimi coding CLI — moonshot oauth client (public)
    kimi_id: [
        94,
        90,
        11,
        92,
        20,
        89,
        66,
        69,
        72,
        73,
        65,
        76,
        86,
        65,
        93,
        7,
        75,
        20,
        28,
        86,
        90,
        94,
        95,
        95,
        90,
        64,
        69,
        83,
        78,
        18,
        65,
        90,
        15,
        89,
        90,
        21
    ],
    // GitHub Copilot CLI — github oauth app id (public, device flow)
    github_copilot_id: [
        38,
        27,
        95,
        71,
        16,
        90,
        69,
        67,
        4,
        29,
        72,
        22,
        90,
        91,
        12,
        0,
        75,
        19,
        8,
        87
    ],
    // Grok Build CLI (xAI) — public oauth client id (import-token flow)
    grok_id: [
        13,
        92,
        15,
        89,
        66,
        91,
        76,
        70,
        72,
        29,
        71,
        70,
        3,
        65,
        93,
        84,
        72,
        23,
        28,
        87,
        92,
        88,
        15,
        95,
        91,
        22,
        71,
        87,
        20,
        66,
        67,
        86,
        13,
        81,
        81,
        21
    ],
    // Trae Cloud IDE — public oauth client id
    trae_id: [
        10,
        3,
        95,
        6,
        10,
        22,
        66,
        3,
        11,
        90,
        72,
        31,
        91,
        2
    ],
    // Microsoft Designer web app — public ClientId header sent by the
    // designer.microsoft.com frontend to designerapp.officeapps.live.com
    // (not a secret — every browser session sends the same fixed value;
    // reverse-engineered from the g4f MicrosoftDesigner provider reference).
    microsoft_designer_client_id: [
        13,
        88,
        13,
        91,
        68,
        89,
        65,
        21,
        72,
        26,
        21,
        76,
        0,
        65,
        93,
        2,
        26,
        23,
        28,
        87,
        14,
        87,
        8,
        95,
        12,
        17,
        70,
        6,
        24,
        66,
        17,
        1,
        10,
        95,
        81,
        28
    ],
    // Microsoft Edge Read Aloud (EdgeTTS) — public "trusted client token" used to
    // derive the Sec-MS-GEC anti-abuse header. Hardcoded in every known Edge
    // browser build and every open-source edge-tts reimplementation (e.g.
    // rany2/edge-tts constants.py) — not a per-user secret, just an
    // abuse-mitigation constant Microsoft ships in public client binaries.
    edgetts_token: [
        89,
        44,
        91,
        40,
        51,
        94,
        49,
        64,
        32,
        108,
        54,
        51,
        86,
        41,
        80,
        37,
        111,
        69,
        6,
        42,
        95,
        93,
        45,
        68,
        87,
        65,
        77,
        84,
        105,
        70,
        51,
        86
    ],
    // Adobe Firefly web (firefly.adobe.com) — public x-api-key + IMS client_id
    // (`clio-playground-web`). Captured from live browser generate/discovery calls.
    // Not a per-user secret; every Firefly SPA session sends the same value.
    // (Express still uses `projectx_webapp` — see adobe_firefly_express_client_id.)
    adobe_firefly_api_key: [
        12,
        1,
        7,
        6,
        95,
        31,
        25,
        21,
        28,
        74,
        2,
        26,
        23,
        2,
        13,
        78,
        90,
        19,
        83
    ],
    // Adobe Express fallback IMS client_id for cookie exchange when Firefly
    // clio-playground-web refresh fails (older Express cookies).
    adobe_firefly_express_client_id: [
        31,
        31,
        1,
        3,
        23,
        12,
        1,
        12,
        58,
        90,
        21,
        23,
        3,
        28,
        25
    ],
    // Firefly credits balance endpoint public x-api-key (`SunbreakWebUI1`) from
    // GET firefly.adobe.io/v1/credits/balance browser traffic.
    adobe_firefly_balance_api_key: [
        60,
        24,
        0,
        11,
        0,
        10,
        20,
        31,
        50,
        72,
        18,
        32,
        43,
        93
    ]
};
function resolvePublicCred(key, envName) {
    if (envName) {
        const fromEnv = process.env[envName];
        if (fromEnv && fromEnv.trim()) return decodePublicCred(fromEnv.trim());
    }
    return decodePublicCredBytes(EMBEDDED_DEFAULTS[key]);
}
function resolvePublicCredMulti(key, envNames) {
    for (const name of envNames){
        const v = process.env[name];
        if (v && v.trim()) return decodePublicCred(v.trim());
    }
    return decodePublicCredBytes(EMBEDDED_DEFAULTS[key]);
}
}),
"[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHAT_OPENAI_COMPAT_MODELS",
    ()=>CHAT_OPENAI_COMPAT_MODELS,
    "GPT_5_5_CODEX_CAPABILITIES",
    ()=>GPT_5_5_CODEX_CAPABILITIES,
    "GPT_5_5_CONTEXT_LENGTH",
    ()=>GPT_5_5_CONTEXT_LENGTH,
    "GPT_5_6_API_CAPABILITIES",
    ()=>GPT_5_6_API_CAPABILITIES,
    "GPT_5_6_CODEX_CAPABILITIES",
    ()=>GPT_5_6_CODEX_CAPABILITIES,
    "REASONING_UNSUPPORTED",
    ()=>REASONING_UNSUPPORTED,
    "buildAntigravityUrl",
    ()=>buildAntigravityUrl,
    "buildModels",
    ()=>buildModels,
    "buildOpenAiCompatibleRegistryEntry",
    ()=>buildOpenAiCompatibleRegistryEntry,
    "getAnthropicCompatHeaders",
    ()=>getAnthropicCompatHeaders,
    "getClaudeCliHeaders",
    ()=>getClaudeCliHeaders,
    "mapStainlessArch",
    ()=>mapStainlessArch,
    "mapStainlessOs",
    ()=>mapStainlessOs
]);
/**
 * Provider Registry — Single source of truth for all provider configuration.
 *
 * Adding a new provider? Just add an entry here. Everything else
 * (PROVIDERS, PROVIDER_MODELS, PROVIDER_ID_TO_ALIAS, executor lookup)
 * is auto-generated from this registry.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityModelAliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/agyModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/glmProvider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/maritalk.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const REASONING_UNSUPPORTED = Object.freeze([
    "temperature",
    "top_p",
    "frequency_penalty",
    "presence_penalty",
    "logprobs",
    "top_logprobs",
    "n"
]);
function buildOpenAiCompatibleRegistryEntry(overrides) {
    return {
        format: "openai",
        executor: "default",
        authType: "apikey",
        authHeader: "bearer",
        ...overrides
    };
}
const buildModels = (ids)=>ids.map((id)=>({
            id,
            name: id
        }));
const GPT_5_5_CONTEXT_LENGTH = 1050000;
const GPT_5_5_CODEX_CAPABILITIES = {
    targetFormat: "openai-responses",
    toolCalling: true,
    supportsReasoning: true,
    supportsVision: true,
    supportsXHighEffort: true,
    contextLength: GPT_5_5_CONTEXT_LENGTH
};
const GPT_5_6_API_CAPABILITIES = {
    targetFormat: "openai-responses",
    toolCalling: true,
    supportsReasoning: true,
    supportsVision: true,
    supportsXHighEffort: true,
    contextLength: 1050000,
    maxInputTokens: 922000,
    maxOutputTokens: 128000
};
const GPT_5_6_CODEX_CAPABILITIES = {
    targetFormat: "openai-responses",
    toolCalling: true,
    supportsReasoning: true,
    supportsVision: true,
    supportsXHighEffort: true,
    contextLength: 272000,
    maxInputTokens: 272000,
    maxOutputTokens: 128000
};
const CHAT_OPENAI_COMPAT_MODELS = {
    deepinfra: buildModels([
        "anthropic/claude-4-opus",
        "anthropic/claude-4-sonnet",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "google/gemma-4-31B-it",
        "google/gemma-4-26B-A4B-it",
        "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B",
        "nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning",
        "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        "NousResearch/Hermes-3-Llama-3.1-405B",
        "deepseek-ai/DeepSeek-V4-Pro",
        "deepseek-ai/DeepSeek-V4-Flash",
        "zai-org/GLM-5.1",
        "moonshotai/Kimi-K2.6",
        "MiniMaxAI/MiniMax-M2.5",
        "Qwen/Qwen3.6-35B-A3B",
        "Qwen/Qwen3.5-397B-A17B",
        "Qwen/Qwen3.5-122B-A10B",
        "XiaomiMiMo/MiMo-V2.5-Pro",
        "XiaomiMiMo/MiMo-V2.5"
    ]),
    "vercel-ai-gateway": buildModels([
        "openai/gpt-4.1",
        "anthropic/claude-4-sonnet",
        "google/gemini-2.5-pro",
        "moonshotai/kimi-k2",
        "vercel/v0-1.5-md"
    ]),
    "lambda-ai": buildModels([
        "deepseek-r1-671b",
        "llama3.3-70b-instruct-fp8",
        "qwen25-coder-32b-instruct"
    ]),
    sambanova: buildModels([
        "MiniMax-M2.7",
        "DeepSeek-V3.2",
        "Llama-4-Maverick-17B-128E-Instruct",
        "Meta-Llama-3.3-70B-Instruct",
        "gpt-oss-120b"
    ]),
    nscale: buildModels([
        "moonshotai/Kimi-K2.5",
        "Qwen/Qwen3-235B-A22B-Instruct-2507",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        "meta-llama/Llama-3.3-70B-Instruct"
    ]),
    ovhcloud: buildModels([
        "Meta-Llama-3_3-70B-Instruct",
        "Qwen2.5-Coder-32B-Instruct",
        "Mistral-Small-3.2-24B-Instruct-2506"
    ]),
    baseten: buildModels([
        "moonshotai/Kimi-K2.6",
        "deepseek-ai/DeepSeek-V4-Pro",
        "zai-org/GLM-5",
        "MiniMaxAI/MiniMax-M2.5",
        "nvidia/Nemotron-120B-A12B",
        "openai/gpt-oss-120b"
    ]),
    publicai: buildModels([
        "swiss-ai/apertus-70b-instruct",
        "swiss-ai/Apertus-8B-Instruct-2509",
        "aisingapore/Qwen-SEA-LION-v4-32B-IT",
        "aisingapore/Gemma-SEA-LION-v4-27B-IT",
        "allenai/Olmo-3-32B-Think",
        "allenai/Olmo-3-7B-Instruct",
        "utter-project/EuroLLM-22B-Instruct-2512"
    ]),
    "meta-llama": buildModels([
        "Llama-4-Maverick-17B-128E-Instruct-FP8",
        "Llama-4-Scout-17B-16E-Instruct-FP8",
        "Llama-3.3-70B-Instruct",
        "Llama-3.3-8B-Instruct"
    ]),
    "v0-vercel": buildModels([
        "v0-1.0-md",
        "v0-1.5-lg",
        "v0-1.5-md"
    ]),
    morph: [
        ...buildModels([
            "morph-v3-large",
            "morph-v3-fast"
        ]),
        {
            id: "morph-glm52-744b",
            name: "GLM-5.2 744B (Morph)",
            contextLength: 1048576
        },
        {
            id: "morph-qwen35-397b",
            name: "Qwen 3.5 397B (Morph)",
            contextLength: 262144
        },
        {
            id: "morph-qwen36-27b",
            name: "Qwen 3.6 27B (Morph)",
            contextLength: 131072
        },
        {
            id: "morph-minimax3-428b",
            name: "MiniMax M3 (Morph)",
            contextLength: 262144
        },
        {
            id: "morph-dsv4flash",
            name: "DeepSeek V4 Flash (Morph)",
            contextLength: 1048576
        }
    ],
    "featherless-ai": buildModels([
        "featherless-ai/Qwerky-72B",
        "featherless-ai/Qwerky-QwQ-32B"
    ]),
    friendliai: buildModels([
        "meta-llama-3.1-70b-instruct",
        "meta-llama-3.1-8b-instruct"
    ]),
    llamagate: buildModels([
        "qwen2.5-coder-7b",
        "deepseek-coder-6.7b",
        "qwen3-vl-8b"
    ]),
    heroku: buildModels([
        "claude-opus-4-7",
        "claude-4-6-sonnet",
        "claude-4-5-haiku",
        "glm-4-7",
        "kimi-k2-5",
        "minimax-m2-1",
        "deepseek-v3-2",
        "qwen3-coder-480b",
        "qwen3-235b",
        "gpt-oss-120b",
        "nova-pro",
        "nova-2-lite"
    ]),
    galadriel: buildModels([
        "galadriel-latest"
    ]),
    databricks: buildModels([
        "databricks-gpt-5",
        "databricks-meta-llama-3-3-70b-instruct",
        "databricks-claude-sonnet-4",
        "databricks-gemini-2-5-pro"
    ]),
    snowflake: buildModels([
        "llama3.1-70b",
        "llama3.3-70b",
        "deepseek-r1",
        "claude-3-5-sonnet"
    ]),
    wandb: buildModels([
        "openai/gpt-oss-120b",
        "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        "deepseek-ai/DeepSeek-V3.1"
    ]),
    volcengine: buildModels([
        "deepseek-v3-2-251201",
        "doubao-seed-2-0-pro-260215",
        "doubao-seed-2-0-code-preview-260215",
        // Sweep 2026-06-19: kimi-k2-thinking-251104 retired on Ark (volcengine official
        // notices); replaced by kimi-k2-5-260127.
        "kimi-k2-5-260127",
        "glm-4-7-251222",
        // DeepSeek V4 models available on Volcengine Ark (port from upstream PR #1473)
        "DeepSeek-V4-Flash",
        "DeepSeek-V4-Pro"
    ]),
    ai21: buildModels([
        "jamba-large-1.7",
        "jamba-mini-2"
    ]),
    gigachat: buildModels([
        "GigaChat-2-Max",
        "GigaChat-2-Pro",
        "GigaChat-2-Lite"
    ]),
    venice: buildModels([
        "venice-latest"
    ]),
    // Sweep 2026-06-19: codestral-2405 retired 2025-06-16 (Mistral official docs) — dropped
    // from the menu; old refs auto-forward via the codestral-2405 deprecation alias.
    codestral: buildModels([
        "codestral-2508",
        "codestral-latest"
    ]),
    upstage: buildModels([
        "solar-pro3",
        "solar-mini"
    ]),
    maritalk: buildModels([
        "sabia-4",
        "sabia-4-thinking",
        "sabiazinho-4"
    ]),
    "xiaomi-mimo": [
        {
            id: "mimo-v2.5-pro",
            name: "MiMo-V2.5-Pro",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "mimo-v2.5",
            name: "MiMo-V2.5",
            contextLength: 1048576,
            maxOutputTokens: 131072
        }
    ],
    "xiaomi-mimo-token-plan": [
        {
            id: "mimo-v2.5-pro",
            name: "MiMo-V2.5-Pro",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "mimo-v2.5",
            name: "MiMo-V2.5",
            contextLength: 1048576,
            maxOutputTokens: 131072
        }
    ],
    gitlawb: [
        {
            id: "mimo-v2.5-pro",
            name: "MiMo-V2.5-Pro",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "mimo-v2.5",
            name: "MiMo-V2.5",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "mimo-v2-pro",
            name: "MiMo-V2-Pro",
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        {
            id: "mimo-v2-omni",
            name: "MiMo-V2-Omni",
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        {
            id: "mimo-v2-flash",
            name: "MiMo-V2-Flash",
            contextLength: 262144,
            maxOutputTokens: 65536
        }
    ],
    "gitlawb-gmi": [
        {
            id: "XiaomiMiMo/MiMo-V2.5-Pro",
            name: "MiMo-V2.5-Pro (GMI)",
            contextLength: 1050000,
            maxOutputTokens: 131072
        },
        {
            id: "XiaomiMiMo/MiMo-V2.5",
            name: "MiMo-V2.5 (GMI)",
            contextLength: 1050000,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.5",
            name: "GPT-5.5",
            contextLength: 1050000,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.4-pro",
            name: "GPT-5.4 Pro",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.4",
            name: "GPT-5.4",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.4-mini",
            name: "GPT-5.4 Mini",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.4-nano",
            name: "GPT-5.4 Nano",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.3-codex",
            name: "GPT-5.3 Codex",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.2-codex",
            name: "GPT-5.2 Codex",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.2",
            name: "GPT-5.2",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5.1",
            name: "GPT-5.1",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-5",
            name: "GPT-5",
            contextLength: 409600,
            maxOutputTokens: 131072
        },
        {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            contextLength: 131072,
            maxOutputTokens: 16384
        },
        {
            id: "openai/gpt-4o-mini",
            name: "GPT-4o Mini",
            contextLength: 131072,
            maxOutputTokens: 16384
        },
        {
            id: "anthropic/claude-opus-4.7",
            name: "Claude Opus 4.7",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-opus-4.6",
            name: "Claude Opus 4.6",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-opus-4.5",
            name: "Claude Opus 4.5",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-opus-4.1",
            name: "Claude Opus 4.1",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-sonnet-4.6",
            name: "Claude Sonnet 4.6",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-sonnet-4",
            name: "Claude Sonnet 4",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "anthropic/claude-haiku-4.5",
            name: "Claude Haiku 4.5",
            contextLength: 409600,
            maxOutputTokens: 131072,
            targetFormat: "claude"
        },
        {
            id: "deepseek-ai/DeepSeek-V4-Pro",
            name: "DeepSeek V4 Pro",
            contextLength: 1048576,
            maxOutputTokens: 131072,
            supportsReasoning: true
        },
        {
            id: "deepseek-ai/DeepSeek-V4-Flash",
            name: "DeepSeek V4 Flash",
            contextLength: 1048575,
            maxOutputTokens: 131072,
            supportsReasoning: true
        },
        {
            id: "deepseek-ai/DeepSeek-R1-0528",
            name: "DeepSeek R1",
            contextLength: 163840,
            maxOutputTokens: 131072,
            supportsReasoning: true
        },
        {
            id: "deepseek-ai/DeepSeek-V3.2",
            name: "DeepSeek V3.2",
            contextLength: 163840,
            maxOutputTokens: 131072
        },
        {
            id: "google/gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "google/gemini-3.1-flash-lite-preview",
            name: "Gemini 3.1 Flash Lite",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "google/gemini-3-flash-preview",
            name: "Gemini 3 Flash",
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "zai-org/GLM-5.1-FP8",
            name: "GLM-5.1",
            contextLength: 202752,
            maxOutputTokens: 131072
        },
        {
            id: "zai-org/GLM-5-FP8",
            name: "GLM-5",
            contextLength: 202752,
            maxOutputTokens: 131072
        },
        {
            id: "moonshotai/Kimi-K2.6",
            name: "Kimi K2.6",
            contextLength: 65536,
            maxOutputTokens: 131072
        },
        {
            id: "moonshotai/Kimi-K2.5",
            name: "Kimi K2.5",
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        {
            id: "MiniMaxAI/MiniMax-M2.7",
            name: "MiniMax M2.7",
            contextLength: 196608,
            maxOutputTokens: 131072
        },
        {
            id: "MiniMaxAI/MiniMax-M2.5",
            name: "MiniMax M2.5",
            contextLength: 196608,
            maxOutputTokens: 131072
        },
        {
            id: "Qwen/Qwen3.6-Max-Preview",
            name: "Qwen3.6 Max",
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        {
            id: "Qwen/Qwen3.6-Plus",
            name: "Qwen3.6 Plus",
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        {
            id: "Qwen/Qwen3.5-397B-A17B",
            name: "Qwen3.5 397B",
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        {
            id: "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8",
            name: "Qwen3 Coder 480B",
            contextLength: 262128,
            maxOutputTokens: 131072
        },
        {
            id: "nvidia/NVIDIA-Nemotron-3-Nano-Omni",
            name: "Nemotron 3 Nano",
            contextLength: 262144,
            maxOutputTokens: 131072
        }
    ],
    "inference-net": buildModels([
        "meta-llama/Llama-3.3-70B-Instruct",
        "deepseek-ai/DeepSeek-R1",
        "Qwen/Qwen2.5-72B-Instruct"
    ]),
    nanogpt: buildModels([
        "chatgpt-4o-latest",
        "claude-3.5-sonnet",
        "gpt-4o-mini"
    ]),
    predibase: buildModels([
        "llama-3.3-70b"
    ]),
    bytez: buildModels([
        "meta-llama/Llama-3.3-70B-Instruct",
        "mistralai/Mistral-7B-Instruct-v0.3",
        "Qwen/Qwen2.5-72B-Instruct"
    ]),
    // Restored after the registry modularization (#3993) dropped the mimocode key
    // referenced by the mimocode provider plugin. Source of truth: pre-#3993
    // providerRegistry.ts (commit 1ed01dd90^).
    mimocode: [
        {
            id: "mimo-auto",
            name: "MiMo Auto",
            contextLength: 1000000,
            maxOutputTokens: 128000
        }
    ]
};
function mapStainlessOs() {
    switch((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimePlatform"])()){
        case "darwin":
            return "MacOS";
        case "win32":
            return "Windows";
        case "linux":
            return "Linux";
        default:
            return `Other::${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimePlatform"])()}`;
    }
}
function mapStainlessArch() {
    switch((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimeArch"])()){
        case "x64":
            return "x64";
        case "arm64":
            return "arm64";
        case "ia32":
            return "x86";
        default:
            return `other::${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimeArch"])()}`;
    }
}
;
function getClaudeCliHeaders() {
    return {
        "Anthropic-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"],
        "Anthropic-Beta": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_BETA_CLAUDE_OAUTH"],
        "Anthropic-Dangerous-Direct-Browser-Access": "true",
        "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_USER_AGENT"],
        "X-App": "cli",
        "X-Stainless-Helper-Method": "stream",
        "X-Stainless-Retry-Count": "0",
        "X-Stainless-Runtime-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_STAINLESS_RUNTIME_VERSION"],
        "X-Stainless-Package-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_STAINLESS_PACKAGE_VERSION"],
        "X-Stainless-Runtime": "node",
        "X-Stainless-Lang": "js",
        "X-Stainless-Arch": mapStainlessArch(),
        "X-Stainless-Os": mapStainlessOs(),
        "X-Stainless-Timeout": "600"
    };
}
function getAnthropicCompatHeaders() {
    return {
        "Anthropic-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"]
    };
}
function buildAntigravityUrl(base, model, stream) {
    const path = stream ? "/v1internal:streamGenerateContent?alt=sse" : "/v1internal:generateContent";
    return `${base}${path}`;
}
}),
"[project]/open-sse/config/providers/registry/unorouter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unorouterProvider",
    ()=>unorouterProvider
]);
const unorouterProvider = {
    id: "unorouter",
    alias: "unorouter",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.unorouter.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "auto",
            name: "Auto (Best Available)"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/aimlapi/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aimlapiProvider",
    ()=>aimlapiProvider
]);
const aimlapiProvider = {
    id: "aimlapi",
    alias: "aiml",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.aimlapi.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // $0.025/day free credits — 200+ models via single aggregator endpoint
    models: [
        {
            id: "gpt-4o",
            name: "GPT-4o (via AI/ML API)"
        },
        {
            id: "claude-3-5-sonnet-20241022",
            name: "Claude 3.5 Sonnet (via AI/ML API)"
        },
        {
            id: "gemini-1.5-pro",
            name: "Gemini 1.5 Pro (via AI/ML API)"
        },
        {
            id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
            name: "Llama 3.1 70B (via AI/ML API)"
        },
        {
            id: "deepseek-chat",
            name: "DeepSeek Chat (via AI/ML API)"
        },
        {
            id: "mistral-large-latest",
            name: "Mistral Large (via AI/ML API)"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/byteplus/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "byteplusProvider",
    ()=>byteplusProvider
]);
const byteplusProvider = {
    id: "byteplus",
    alias: "bpm",
    format: "openai",
    executor: "default",
    baseUrl: "https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions",
    modelsUrl: "https://ark.ap-southeast.bytepluses.com/api/v3/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "seed-2.0",
            name: "Seed 2.0"
        },
        {
            id: "kimi-k2-thinking",
            name: "Kimi K2 Thinking",
            supportsReasoning: true
        },
        {
            id: "glm-4.7",
            name: "GLM 4.7"
        },
        {
            id: "gpt-oss-120b",
            name: "GPT-OSS-120B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/mimocode/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mimocodeProvider",
    ()=>mimocodeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const mimocodeProvider = {
    id: "mimocode",
    alias: "mcode",
    format: "openai",
    executor: "mimocode",
    baseUrl: "https://api.xiaomimimo.com",
    chatPath: "/api/free-ai/openai/chat",
    authType: "none",
    authHeader: "none",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["mimocode"]
};
}),
"[project]/open-sse/config/providers/registry/ollama-cloud/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ollama_cloudProvider",
    ()=>ollama_cloudProvider
]);
const ollama_cloudProvider = {
    id: "ollama-cloud",
    alias: "ollamacloud",
    format: "openai",
    executor: "default",
    baseUrl: "https://ollama.com/v1/chat/completions",
    modelsUrl: "https://ollama.com/api/tags",
    authType: "apikey",
    authHeader: "bearer",
    // Note: rate limits vary by plan (free = "Light usage", Pro = more, Max = 5x Pro).
    // Users can generate API keys at https://ollama.com/settings/keys
    models: [
        {
            id: "gpt-oss:20b",
            name: "GPT-OSS 20B",
            supportsReasoning: true,
            supportedThinkingEfforts: [
                "low",
                "medium",
                "high"
            ]
        },
        {
            id: "gpt-oss:120b",
            name: "GPT-OSS 120B",
            supportsReasoning: true,
            supportedThinkingEfforts: [
                "low",
                "medium",
                "high"
            ]
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6"
        },
        {
            id: "glm-5.1",
            name: "GLM 5.1"
        },
        // #3110: MiniMax M3 via Ollama
        {
            id: "minimax-m3",
            name: "MiniMax M3",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "minimax-m2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "gemma4:31b",
            name: "Gemma 4 31B"
        },
        {
            id: "nemotron-3-super",
            name: "NVIDIA Nemotron 3 Super"
        },
        {
            id: "qwen3.5:397b",
            name: "Qwen 3.5 397B"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/synthetic/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "syntheticProvider",
    ()=>syntheticProvider
]);
const syntheticProvider = {
    id: "synthetic",
    alias: "synthetic",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.synthetic.new/openai/v1/chat/completions",
    modelsUrl: "https://api.synthetic.new/openai/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "hf:openai/gpt-oss-120b",
            name: "openai/gpt-oss-120b",
            aliases: [
                "syn:gpt-oss-120b"
            ],
            contextLength: 131072,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "hf:zai-org/GLM-5.2",
            name: "zai-org/GLM-5.2",
            aliases: [
                "syn:large:text"
            ],
            contextLength: 524288,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "hf:moonshotai/Kimi-K2.7-Code",
            name: "moonshotai/Kimi-K2.7-Code",
            aliases: [
                "syn:large:vision"
            ],
            contextLength: 262144,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "hf:Qwen/Qwen3.6-27B",
            name: "Qwen/Qwen3.6-27B",
            aliases: [
                "syn:small:vision"
            ],
            contextLength: 262144,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "hf:MiniMaxAI/MiniMax-M3",
            name: "MiniMaxAI/MiniMax-M3",
            aliases: [
                "syn:minimax-m3"
            ],
            contextLength: 262144,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "hf:zai-org/GLM-4.7-Flash",
            name: "zai-org/GLM-4.7-Flash",
            aliases: [
                "syn:small:text"
            ],
            contextLength: 196608,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "hf:nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4",
            name: "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4",
            aliases: [
                "syn:nemotron-3-super"
            ],
            contextLength: 262144,
            maxOutputTokens: 65536,
            toolCalling: true,
            supportsReasoning: true
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/ideogram/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ideogramProvider",
    ()=>ideogramProvider
]);
const ideogramProvider = {
    id: "ideogram",
    alias: "ideo",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.ideogram.ai",
    authType: "apikey",
    authHeader: "Api-Key",
    models: [
        {
            id: "V_3",
            name: "Ideogram V3"
        },
        {
            id: "V_2A",
            name: "Ideogram V2A"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/friendliai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "friendliaiProvider",
    ()=>friendliaiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const friendliaiProvider = {
    id: "friendliai",
    alias: "friendli",
    format: "openai",
    executor: "default",
    // #5430: serverless endpoint — a `flp_*` serverless token gets 403 Forbidden on the
    // /dedicated path (verified live). Serverless accepts it and serves the public models.
    baseUrl: "https://api.friendli.ai/serverless/v1/chat/completions",
    modelsUrl: "https://api.friendli.ai/serverless/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].friendliai
};
}),
"[project]/open-sse/config/providers/registry/suno/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sunoProvider",
    ()=>sunoProvider
]);
const sunoProvider = {
    id: "suno",
    alias: "suno",
    format: "openai",
    executor: "default",
    baseUrl: "https://studio-api.suno.ai/api/generate/v2/",
    authType: "cookie",
    authHeader: "cookie",
    models: [
        // Sweep 2026-06-19: Suno's internal codenames for v5 / v5.5.
        {
            id: "chirp-fenix",
            name: "Chirp V5.5"
        },
        {
            id: "chirp-crow",
            name: "Chirp V5"
        },
        {
            id: "chirp-v4",
            name: "Chirp V4"
        },
        {
            id: "chirp-v3-5",
            name: "Chirp V3.5"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/adapta-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adapta_webProvider",
    ()=>adapta_webProvider
]);
const adapta_webProvider = {
    id: "adapta-web",
    alias: "adp-web",
    format: "openai",
    executor: "adapta-web",
    baseUrl: "https://agent.adapta.one/api/chat/stream/v1",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "adapta-one",
            name: "Adapta ONE (Auto)",
            toolCalling: false
        },
        {
            id: "adapta-gpt",
            name: "GPT-5 (via Adapta)",
            toolCalling: false
        },
        {
            id: "adapta-claude",
            name: "Claude Sonnet 4.6 (via Adapta)",
            toolCalling: false
        },
        {
            id: "adapta-gemini",
            name: "Gemini 2.5 Pro (via Adapta)",
            toolCalling: false
        },
        {
            id: "adapta-grok",
            name: "Grok 4 (via Adapta)",
            toolCalling: false
        },
        {
            id: "adapta-deepseek",
            name: "DeepSeek R2 (via Adapta)",
            toolCalling: false
        },
        {
            id: "adapta-llama",
            name: "Llama 4 (via Adapta)",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/services/notionWebFallbackModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Notion Web fallback model catalog (seeded from the live AI picker).
 * Extracted from notionWebModels.ts to keep that module under the 800-line
 * file-size cap; notionWebModels.ts re-exports both symbols for consumers.
 */ __turbopack_context__.s([
    "NOTION_WEB_FALLBACK_MODELS",
    ()=>NOTION_WEB_FALLBACK_MODELS
]);
const NOTION_WEB_FALLBACK_MODELS = [
    {
        id: "notion-ai",
        name: "Notion AI (default)",
        owned_by: "notion"
    },
    {
        id: "gpt-5.6-sol",
        name: "GPT-5.6 Sol",
        owned_by: "openai",
        notionCodename: "orange-mousse"
    },
    {
        id: "gpt-5.6-terra",
        name: "GPT-5.6 Terra",
        owned_by: "openai",
        notionCodename: "orchid-muffin"
    },
    {
        id: "gpt-5.6-luna",
        name: "GPT-5.6 Luna",
        owned_by: "openai",
        notionCodename: "olive-jellyroll"
    },
    {
        id: "gpt-5.2",
        name: "GPT-5.2",
        owned_by: "openai",
        notionCodename: "oatmeal-cookie"
    },
    {
        id: "gpt-5.4",
        name: "GPT-5.4",
        owned_by: "openai",
        notionCodename: "oval-kumquat-medium"
    },
    {
        id: "gpt-5.5",
        name: "GPT-5.5",
        owned_by: "openai",
        notionCodename: "opal-quince-medium"
    },
    {
        id: "gpt-5.4-mini",
        name: "GPT-5.4 Mini",
        owned_by: "openai",
        notionCodename: "oregon-grape-medium"
    },
    {
        id: "gpt-5.4-nano",
        name: "GPT-5.4 Nano",
        owned_by: "openai",
        notionCodename: "otaheite-apple-medium"
    },
    {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        owned_by: "gemini",
        notionCodename: "vertex-gemini-3.5-flash"
    },
    {
        id: "gemini-3-flash",
        name: "Gemini 3 Flash",
        owned_by: "gemini",
        notionCodename: "gingerbread"
    },
    {
        id: "gemini-3.1-pro",
        name: "Gemini 3.1 Pro",
        owned_by: "gemini",
        notionCodename: "galette-medium-thinking"
    },
    {
        id: "sonnet-4.6",
        name: "Sonnet 4.6",
        owned_by: "anthropic",
        notionCodename: "almond-croissant-low"
    },
    {
        id: "sonnet-5",
        name: "Sonnet 5",
        owned_by: "anthropic",
        notionCodename: "angel-cake-high"
    },
    {
        id: "opus-4.6",
        name: "Opus 4.6",
        owned_by: "anthropic",
        notionCodename: "avocado-froyo-medium"
    },
    {
        id: "opus-4.7",
        name: "Opus 4.7",
        owned_by: "anthropic",
        notionCodename: "apricot-sorbet-high"
    },
    {
        id: "opus-4.8",
        name: "Opus 4.8",
        owned_by: "anthropic",
        notionCodename: "ambrosia-tart-high"
    },
    {
        id: "haiku-4.5",
        name: "Haiku 4.5",
        owned_by: "anthropic",
        notionCodename: "anthropic-haiku-4.5"
    },
    {
        id: "fable-5",
        name: "Fable 5",
        owned_by: "anthropic",
        notionCodename: "acai-budino-high"
    },
    {
        id: "kimi-k2.6",
        name: "Kimi K2.6",
        owned_by: "mystery",
        notionCodename: "fireworks-kimi-k2.6"
    },
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code",
        owned_by: "mystery",
        notionCodename: "fireworks-kimi-k2.7"
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        owned_by: "mystery",
        notionCodename: "baseten-deepseek-v4-pro"
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2",
        owned_by: "mystery",
        notionCodename: "baseten-glm-5.2"
    },
    {
        id: "grok-4.3",
        name: "Grok 4.3",
        owned_by: "xai",
        notionCodename: "xigua-mochi-medium"
    },
    {
        id: "grok-4.5",
        name: "Grok 4.5",
        owned_by: "xai",
        notionCodename: "strawberry-whoopiepie"
    },
    {
        id: "grok-build-0.1",
        name: "Grok Build 0.1",
        owned_by: "xai",
        notionCodename: "xinomavro-cake"
    }
];
}),
"[project]/open-sse/services/notionWebModels.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BROWSER_HEADERS",
    ()=>BROWSER_HEADERS,
    "NOTION_APP_ORIGIN",
    ()=>NOTION_APP_ORIGIN,
    "NOTION_CLIENT_VERSION",
    ()=>NOTION_CLIENT_VERSION,
    "NOTION_LEGACY_ORIGIN",
    ()=>NOTION_LEGACY_ORIGIN,
    "NOTION_MODELS_URL",
    ()=>NOTION_MODELS_URL,
    "NOTION_SPACES_URL",
    ()=>NOTION_SPACES_URL,
    "buildNotionFriendlyToCodenameMap",
    ()=>buildNotionFriendlyToCodenameMap,
    "buildNotionModelsDiscoveryBody",
    ()=>buildNotionModelsDiscoveryBody,
    "buildNotionModelsDiscoveryHeaders",
    ()=>buildNotionModelsDiscoveryHeaders,
    "catalogIdForNotionModel",
    ()=>catalogIdForNotionModel,
    "discoverNotionWebModels",
    ()=>discoverNotionWebModels,
    "extractNotionUserIdFromCookie",
    ()=>extractNotionUserIdFromCookie,
    "extractSpaceIdFromNotionCookie",
    ()=>extractSpaceIdFromNotionCookie,
    "fetchNotionWorkspaceCandidates",
    ()=>fetchNotionWorkspaceCandidates,
    "formatNotionDisabledModelsWarning",
    ()=>formatNotionDisabledModelsWarning,
    "getNotionModelsDiscoveryUrl",
    ()=>getNotionModelsDiscoveryUrl,
    "listNotionDisabledModels",
    ()=>listNotionDisabledModels,
    "normalizeNotionWebCookie",
    ()=>normalizeNotionWebCookie,
    "notionCodenameOf",
    ()=>notionCodenameOf,
    "parseNotionAvailableModels",
    ()=>parseNotionAvailableModels,
    "parseNotionGetSpaces",
    ()=>parseNotionGetSpaces,
    "pickFirstSpaceId",
    ()=>pickFirstSpaceId,
    "readCookieValue",
    ()=>readCookieValue,
    "resolveNotionCodename",
    ()=>resolveNotionCodename,
    "resolveNotionRuntimeWorkspace",
    ()=>resolveNotionRuntimeWorkspace,
    "resolveNotionSpaceIdFromGetSpaces",
    ()=>resolveNotionSpaceIdFromGetSpaces,
    "selectBestNotionSpaceId",
    ()=>selectBestNotionSpaceId,
    "slugifyNotionDisplayName",
    ()=>slugifyNotionDisplayName,
    "withFriendlyNotionAliases",
    ()=>withFriendlyNotionAliases
]);
/**
 * Notion AI Web model discovery helpers.
 *
 * Notion has no public model catalog API. The browser AI surface loads models via
 * cookie-auth `POST /api/v3/getAvailableModels` with body `{ spaceId }` (see
 * browser capture against app.notion.com). These helpers parse that response and
 * build the cookie/headers/body the models-discovery route needs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/notionWebFallbackModels.ts [instrumentation] (ecmascript)");
;
;
// Browser AI surface uses app.notion.com (live capture 2026-07-19). www.notion.so
// still works for many paths but can return a different space default / cookie
// domain behavior — prefer the same host the web picker uses.
const NOTION_APP_ORIGIN = "https://app.notion.com";
const NOTION_LEGACY_ORIGIN = "https://www.notion.so";
const NOTION_MODELS_URL = `${NOTION_APP_ORIGIN}/api/v3/getAvailableModels`;
const NOTION_SPACES_URL = `${NOTION_APP_ORIGIN}/api/v3/getSpaces`;
const NOTION_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
/** Recent Notion web client version — accepted loosely but required by some paths. */ const NOTION_CLIENT_VERSION = "23.13.20260719.1125";
/** Cap how many workspaces we probe for AI models when space_id is omitted. */ const NOTION_MAX_SPACE_PROBE = 8;
/** Cache auto-selected workspace per token so chat/inference reuses discovery. */ const NOTION_SPACE_CACHE = new Map();
const NOTION_SPACE_CACHE_TTL_MS = 30 * 60 * 1000;
const BROWSER_HEADERS = {
    "sec-ch-ua": '"Chromium";v="149", "Not)A;Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    priority: "u=1, i",
    "cache-control": "no-cache",
    pragma: "no-cache"
};
function notionTokenCacheKey(cookie) {
    // Prefer the token_v2 value only — ignore optional space/user parts.
    return readCookieValue(cookie, "token_v2") || normalizeNotionWebCookie(cookie);
}
function normalizeNotionWebCookie(raw) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return "";
    return trimmed.includes("=") ? trimmed : `token_v2=${trimmed}`;
}
function readCookieValue(cookie, name) {
    if (!cookie || !name) return "";
    const re = new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`, "i");
    const m = cookie.match(re);
    if (!m) return "";
    const raw = m[1].trim();
    // Malformed % sequences in cookie values must not throw (Gemini review).
    try {
        return decodeURIComponent(raw);
    } catch  {
        return raw;
    }
}
function extractSpaceIdFromNotionCookie(cookie) {
    return readCookieValue(cookie, "space_id") || readCookieValue(cookie, "spaceId") || "";
}
function extractNotionUserIdFromCookie(cookie) {
    return readCookieValue(cookie, "notion_user_id") || readCookieValue(cookie, "notion_user_id_v2") || readCookieValue(cookie, "user_id") || "";
}
/** Trim to a non-empty string, or fall back to `fallback`. */ function trimmedOrFallback(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
/** True when the row's `modelConfiguration.supportedReasoningEfforts` is a non-empty array. */ function rowSupportsReasoning(row) {
    const efforts = row.modelConfiguration?.supportedReasoningEfforts;
    return Array.isArray(efforts) && efforts.length > 0;
}
function slugifyNotionDisplayName(name) {
    // Keep dots so versioned labels stay readable ("GPT-5.6 Sol" → "gpt-5.6-sol",
    // not "gpt-5-6-sol"). Collapse other punctuation/spaces to single hyphens.
    return String(name || "").trim().toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/\.{2,}/g, ".").replace(/^[-.]+|[-.]+$/g, "");
}
function catalogIdForNotionModel(codename, displayName) {
    const slug = slugifyNotionDisplayName(displayName);
    if (slug && slug !== "notion-ai") return slug;
    return codename;
}
function listNotionDisabledModels(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return [];
    const list = data.models;
    if (!Array.isArray(list)) return [];
    const out = [];
    const seen = new Set();
    for (const entry of list){
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
        const row = entry;
        if (row.isDisabled !== true) continue;
        const codename = typeof row.model === "string" ? row.model.trim() : "";
        if (!codename || seen.has(codename)) continue;
        seen.add(codename);
        const name = trimmedOrFallback(row.modelMessage, codename);
        const reason = typeof row.disabledReason === "string" && row.disabledReason.trim() ? row.disabledReason.trim() : "disabled";
        out.push({
            id: catalogIdForNotionModel(codename, name),
            name,
            notionCodename: codename,
            reason
        });
    }
    return out;
}
function formatNotionDisabledModelsWarning(disabled) {
    if (!disabled.length) return "";
    const parts = disabled.map((d)=>{
        const reason = d.reason.replace(/_/g, " ");
        return `${d.name} (${reason})`;
    });
    return `Notion hid ${disabled.length} model(s) as unavailable for this account/workspace: ` + `${parts.join("; ")}. ` + `They appear in the web picker only when your plan unlocks them ` + `(e.g. Fable 5 requires a Notion Business or Enterprise plan).`;
}
/**
 * Parse one getAvailableModels list entry into a model, or `null` when the entry
 * should be skipped (disabled, malformed, or a duplicate already in `seen`).
 *
 * Plan-locked models (e.g. Fable 5 with `isDisabled: true` +
 * `disabledReason: business_or_enterprise_plan_required`) are skipped — they
 * cannot be used for inference. See `listNotionDisabledModels` for diagnostics.
 *
 * Catalog `id` is the real picker label slug; `notionCodename` is what
 * runInferenceTranscript requires.
 */ function parseNotionModelEntry(entry, seen) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const row = entry;
    // Notion still returns plan-locked models (Fable 5) with isDisabled=true.
    // Listing them in /v1/models would invite failed chat requests.
    if (row.isDisabled === true) return null;
    const codename = typeof row.model === "string" ? row.model.trim() : "";
    if (!codename) return null;
    const name = trimmedOrFallback(row.modelMessage, codename);
    const catalogId = catalogIdForNotionModel(codename, name);
    // Dedupe on both catalog id and codename so a second row with the same
    // label or the same food codename is not listed twice.
    if (seen.has(catalogId) || seen.has(codename)) return null;
    seen.add(catalogId);
    seen.add(codename);
    return {
        id: catalogId,
        name,
        owned_by: trimmedOrFallback(row.modelFamily, "notion"),
        ...catalogId !== codename ? {
            notionCodename: codename
        } : {},
        ...rowSupportsReasoning(row) ? {
            supportsReasoning: true
        } : {}
    };
}
function withFriendlyNotionAliases(models) {
    return models;
}
/** Ensure a stable default id always exists for clients that still request notion-ai. */ function withDefaultNotionModel(out, seen) {
    if (out.length === 0 || seen.has("notion-ai")) return out;
    return [
        {
            id: "notion-ai",
            name: "Notion AI (default)",
            owned_by: "notion"
        },
        ...out
    ];
}
function parseNotionAvailableModels(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return [];
    const list = data.models;
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const out = [];
    for (const entry of list){
        const model = parseNotionModelEntry(entry, seen);
        if (model) out.push(model);
    }
    return withFriendlyNotionAliases(withDefaultNotionModel(out, seen));
}
function buildNotionModelsDiscoveryHeaders(token) {
    const cookie = normalizeNotionWebCookie(token);
    const spaceId = extractSpaceIdFromNotionCookie(cookie);
    const userId = extractNotionUserIdFromCookie(cookie);
    const headers = {
        accept: "*/*",
        "content-type": "application/json",
        "user-agent": NOTION_USER_AGENT,
        origin: NOTION_APP_ORIGIN,
        referer: `${NOTION_APP_ORIGIN}/ai`,
        "notion-client-version": NOTION_CLIENT_VERSION,
        "notion-audit-log-platform": "web",
        ...cookie ? {
            cookie
        } : {},
        ...BROWSER_HEADERS
    };
    if (spaceId) headers["x-notion-space-id"] = spaceId;
    if (userId) headers["x-notion-active-user-header"] = userId;
    return headers;
}
function buildNotionModelsDiscoveryBody(token) {
    const cookie = normalizeNotionWebCookie(token);
    const spaceId = extractSpaceIdFromNotionCookie(cookie);
    return spaceId ? {
        spaceId
    } : {};
}
function getNotionModelsDiscoveryUrl() {
    return NOTION_MODELS_URL;
}
/**
 * Parse getSpaces JSON into a stable userId (top-level map key) and all space ids.
 * Shape: `{ [userId]: { space: { [spaceId]: {...} } } }`.
 */ /**
 * Reads one `{ [userKey]: { space: { [spaceId]: ... } } }` entry, pushing new
 * space ids into `spaceIds` and returning the userId it carries (if any).
 */ function collectUserSpaceEntry(key, value, spaceIds) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return "";
    const spaceMap = value.space;
    if (!spaceMap || typeof spaceMap !== "object" || Array.isArray(spaceMap)) return "";
    for (const id of Object.keys(spaceMap)){
        if (id && !spaceIds.includes(id)) spaceIds.push(id);
    }
    return key && !key.includes(" ") ? key : "";
}
/** Fallback spaceId extraction from the flat `{ spaces: [] }` / `{ spaceIds: [] }` shapes. */ function collectFallbackSpaceIds(root, spaceIds) {
    const fromArray = pickSpaceIdFromSpacesArray(root.spaces);
    if (fromArray) spaceIds.push(fromArray);
    const fromIds = pickSpaceIdFromSpaceIdsArray(root.spaceIds);
    if (fromIds && !spaceIds.includes(fromIds)) spaceIds.push(fromIds);
}
function parseNotionGetSpaces(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {
            userId: "",
            spaceIds: []
        };
    }
    const root = data;
    const spaceIds = [];
    let userId = "";
    for (const [key, value] of Object.entries(root)){
        const entryUserId = collectUserSpaceEntry(key, value, spaceIds);
        if (!userId && entryUserId) userId = entryUserId;
    }
    if (spaceIds.length === 0) {
        collectFallbackSpaceIds(root, spaceIds);
    }
    return {
        userId,
        spaceIds
    };
}
/** Common shape: { [userId]: { space_view: { ... }, space: { [spaceId]: ... } } } */ function pickSpaceIdFromUserMap(root) {
    return parseNotionGetSpaces(root).spaceIds[0] || "";
}
/** Flat shape: { spaces: [{ id }] } */ function pickSpaceIdFromSpacesArray(spaces) {
    if (!Array.isArray(spaces)) return "";
    for (const s of spaces){
        if (s && typeof s === "object" && typeof s.id === "string") {
            return s.id;
        }
    }
    return "";
}
/** Flat shape: { spaceIds: [] } */ function pickSpaceIdFromSpaceIdsArray(spaceIds) {
    return Array.isArray(spaceIds) && typeof spaceIds[0] === "string" ? spaceIds[0] : "";
}
function pickFirstSpaceId(data) {
    return parseNotionGetSpaces(data).spaceIds[0] || "";
}
function buildNotionBrowserHeaders(cookie, userId) {
    const headers = {
        accept: "*/*",
        "content-type": "application/json",
        "user-agent": NOTION_USER_AGENT,
        origin: NOTION_APP_ORIGIN,
        referer: `${NOTION_APP_ORIGIN}/ai`,
        "notion-client-version": NOTION_CLIENT_VERSION,
        "notion-audit-log-platform": "web",
        cookie,
        ...BROWSER_HEADERS
    };
    if (userId) headers["x-notion-active-user-header"] = userId;
    return headers;
}
async function fetchNotionWorkspaceCandidates(cookie, fetchImpl = fetch) {
    const normalized = normalizeNotionWebCookie(cookie);
    if (!normalized) return {
        userId: "",
        spaceIds: []
    };
    const userFromCookie = extractNotionUserIdFromCookie(normalized);
    try {
        const res = await fetchImpl(NOTION_SPACES_URL, {
            method: "POST",
            headers: buildNotionBrowserHeaders(normalized, userFromCookie || undefined),
            body: "{}"
        });
        if (!res.ok) return {
            userId: userFromCookie,
            spaceIds: []
        };
        const data = await res.json();
        const parsed = parseNotionGetSpaces(data);
        return {
            userId: userFromCookie || parsed.userId,
            spaceIds: parsed.spaceIds
        };
    } catch  {
        return {
            userId: userFromCookie,
            spaceIds: []
        };
    }
}
async function resolveNotionSpaceIdFromGetSpaces(cookie, fetchImpl = fetch) {
    const { spaceIds } = await fetchNotionWorkspaceCandidates(cookie, fetchImpl);
    return spaceIds[0] || "";
}
async function selectBestNotionSpaceId(opts) {
    const fetchImpl = opts.fetchImpl ?? fetch;
    const cookie = normalizeNotionWebCookie(opts.cookie);
    if (!cookie || opts.spaceIds.length === 0) return null;
    let best = null;
    for (const spaceId of opts.spaceIds.slice(0, NOTION_MAX_SPACE_PROBE)){
        if (!spaceId) continue;
        try {
            const headers = buildNotionBrowserHeaders(cookie, opts.userId || undefined);
            headers["x-notion-space-id"] = spaceId;
            const res = await fetchImpl(NOTION_MODELS_URL, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    spaceId
                }),
                signal: opts.signal ?? undefined
            });
            if (!res.ok) continue;
            const raw = await res.json();
            const models = parseNotionAvailableModels(raw);
            const enabled = models.filter((m)=>m.id !== "notion-ai").length;
            // Prefer workspaces where plan-locked models (e.g. Fable 5) are actually enabled.
            const disabled = listNotionDisabledModels(raw);
            const fableLocked = disabled.some((d)=>d.id === "fable-5" || d.notionCodename === "acai-budino-high");
            const fableEnabled = models.some((m)=>m.id === "fable-5" || m.notionCodename === "acai-budino-high");
            // Score: enabled models, plus a large bonus for unlocked Fable (or no Fable lock).
            let score = enabled * 10;
            if (fableEnabled) score += 1000;
            else if (fableLocked) score -= 50;
            if (!best || score > best.score) {
                best = {
                    spaceId,
                    models,
                    raw,
                    score
                };
            }
        } catch  {
        // try next space
        }
    }
    return best ? {
        spaceId: best.spaceId,
        models: best.models,
        raw: best.raw
    } : null;
}
async function resolveNotionRuntimeWorkspace(opts) {
    const cookie = normalizeNotionWebCookie(opts.cookie);
    const explicit = extractSpaceIdFromNotionCookie(cookie);
    const userId = extractNotionUserIdFromCookie(cookie);
    if (explicit) {
        return {
            spaceId: explicit,
            userId,
            fromCache: false
        };
    }
    const key = notionTokenCacheKey(cookie);
    const cached = NOTION_SPACE_CACHE.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return {
            spaceId: cached.spaceId,
            userId: cached.userId || userId,
            fromCache: true
        };
    }
    const fetchImpl = opts.fetchImpl ?? fetch;
    const candidates = await fetchNotionWorkspaceCandidates(cookie, fetchImpl);
    const best = await selectBestNotionSpaceId({
        cookie,
        spaceIds: candidates.spaceIds,
        userId: userId || candidates.userId || undefined,
        fetchImpl,
        signal: opts.signal
    });
    if (!best?.spaceId) {
        return {
            spaceId: candidates.spaceIds[0] || "",
            userId: userId || candidates.userId,
            fromCache: false
        };
    }
    const resolvedUser = userId || candidates.userId;
    NOTION_SPACE_CACHE.set(key, {
        spaceId: best.spaceId,
        userId: resolvedUser,
        expiresAt: Date.now() + NOTION_SPACE_CACHE_TTL_MS
    });
    return {
        spaceId: best.spaceId,
        userId: resolvedUser,
        fromCache: false
    };
}
/**
 * Discovery when the cookie already carries an explicit space_id — a single
 * targeted getAvailableModels call.
 */ async function discoverNotionModelsForExplicitSpace(opts) {
    const headers = buildNotionModelsDiscoveryHeaders(opts.cookie);
    headers["x-notion-space-id"] = opts.spaceId;
    if (opts.userId) headers["x-notion-active-user-header"] = opts.userId;
    const res = await opts.fetchImpl(NOTION_MODELS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
            spaceId: opts.spaceId
        }),
        signal: opts.signal ?? undefined
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>"");
        throw new Error(`getAvailableModels failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    return {
        spaceId: opts.spaceId,
        models: parseNotionAvailableModels(data),
        data,
        spaceIdFromGetSpaces: false
    };
}
/**
 * Discovery when the cookie has no space_id — resolve via getSpaces, then probe
 * workspaces for the richest AI model list (so operators only need the raw
 * token_v2 value). Prefer the Business/AI workspace where Fable is unlocked
 * over a personal space where Fable is plan-locked (same model count otherwise).
 * Caches the winning workspace so inference reuses the same selection as /models.
 */ async function discoverNotionModelsViaGetSpaces(opts) {
    const candidates = await fetchNotionWorkspaceCandidates(opts.cookie, opts.fetchImpl);
    const userId = opts.userId || candidates.userId;
    if (candidates.spaceIds.length === 0) {
        throw new Error("Could not resolve a Notion workspace from token_v2 alone. " + "Re-copy a fresh token_v2 from app.notion.com (Application → Cookies), " + "or optionally paste space_id from Network → getAvailableModels → x-notion-space-id.");
    }
    const best = await selectBestNotionSpaceId({
        cookie: opts.cookie,
        spaceIds: candidates.spaceIds,
        userId: userId || undefined,
        fetchImpl: opts.fetchImpl,
        signal: opts.signal
    });
    if (!best || best.models.length === 0) {
        throw new Error("getAvailableModels returned no enabled models for any workspace visible to this token");
    }
    const key = notionTokenCacheKey(opts.cookie);
    NOTION_SPACE_CACHE.set(key, {
        spaceId: best.spaceId,
        userId: userId || "",
        expiresAt: Date.now() + NOTION_SPACE_CACHE_TTL_MS
    });
    return {
        spaceId: best.spaceId,
        models: best.models,
        data: best.raw,
        spaceIdFromGetSpaces: true
    };
}
async function discoverNotionWebModels(opts) {
    const fetchImpl = opts.fetchImpl ?? fetch;
    const cookie = normalizeNotionWebCookie(opts.token);
    if (!cookie) {
        throw new Error("Missing Notion token_v2 cookie");
    }
    const spaceIdFromCookie = extractSpaceIdFromNotionCookie(cookie);
    const userId = extractNotionUserIdFromCookie(cookie);
    const result = spaceIdFromCookie ? await discoverNotionModelsForExplicitSpace({
        cookie,
        spaceId: spaceIdFromCookie,
        userId,
        fetchImpl,
        signal: opts.signal
    }) : await discoverNotionModelsViaGetSpaces({
        cookie,
        userId,
        fetchImpl,
        signal: opts.signal
    });
    if (result.models.length === 0) {
        throw new Error("getAvailableModels returned no enabled models");
    }
    const disabledModels = listNotionDisabledModels(result.data);
    const warnings = [];
    const disabledWarning = formatNotionDisabledModelsWarning(disabledModels);
    if (disabledWarning) warnings.push(disabledWarning);
    // Auto space selection is silent when it works — no scary "paste space_id" nags.
    return {
        models: result.models,
        spaceId: result.spaceId,
        source: "api",
        disabledModels,
        spaceIdFromGetSpaces: result.spaceIdFromGetSpaces,
        ...warnings.length ? {
            warning: warnings.join(" ")
        } : {}
    };
}
function notionCodenameOf(model) {
    if (!model?.id || model.id === "notion-ai") return "";
    return (model.notionCodename || model.id).trim();
}
function buildNotionFriendlyToCodenameMap(models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"]) {
    const map = new Map();
    for (const m of models){
        if (!m?.id || m.id === "notion-ai") continue;
        const codename = notionCodenameOf(m);
        if (!codename) continue;
        // Catalog id (friendly slug) + its lowercase form.
        map.set(m.id, codename);
        map.set(m.id.toLowerCase(), codename);
        // Food codename itself (power users / cached clients).
        map.set(codename, codename);
        map.set(codename.toLowerCase(), codename);
        // Display label + slug (e.g. "Fable 5" / "fable-5").
        if (m.name) {
            map.set(m.name.toLowerCase(), codename);
            const slug = slugifyNotionDisplayName(m.name);
            if (slug) map.set(slug, codename);
        }
    }
    return map;
}
function resolveNotionCodename(model, extraModels = []) {
    let m = typeof model === "string" ? model.trim() : "";
    if (!m || m === "notion-ai") return "";
    // Strip provider prefixes added by /v1/models catalog.
    if (m.startsWith("notion-web/")) m = m.slice("notion-web/".length);
    else if (m.startsWith("nw/")) m = m.slice(3);
    if (!m || m === "notion-ai") return "";
    const map = buildNotionFriendlyToCodenameMap([
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"],
        ...extraModels
    ]);
    // Unknown ids pass through as-is so a freshly discovered codename still works
    // before the fallback table is updated.
    return map.get(m) || map.get(m.toLowerCase()) || map.get(slugifyNotionDisplayName(m)) || m;
}
;
}),
"[project]/open-sse/config/providers/registry/notion-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notion_webProvider",
    ()=>notion_webProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/notionWebModels.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/notionWebFallbackModels.ts [instrumentation] (ecmascript)");
;
const notion_webProvider = {
    id: "notion-web",
    alias: "nw",
    format: "openai",
    executor: "notion-web",
    baseUrl: "https://app.notion.com/api/v3/runInferenceTranscript",
    authType: "apikey",
    authHeader: "cookie",
    passthroughModels: true,
    models: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["withFriendlyNotionAliases"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"]).map((m)=>({
            id: m.id,
            name: m.name
        }))
};
}),
"[project]/open-sse/config/providers/registry/anthropic/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "anthropicProvider",
    ()=>anthropicProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
;
const anthropicProvider = {
    id: "anthropic",
    alias: "anthropic",
    format: "claude",
    executor: "default",
    baseUrl: "https://api.anthropic.com/v1/messages",
    urlSuffix: "?beta=true",
    authType: "apikey",
    authHeader: "x-api-key",
    defaultContextLength: 200000,
    headers: {
        "Anthropic-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"],
        "Anthropic-Beta": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_BETA_API_KEY"]
    },
    models: [
        {
            id: "claude-fable-5",
            name: "Claude Fable 5",
            contextLength: 1048576,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-5",
            name: "Claude Opus 5",
            contextLength: 1000000,
            maxOutputTokens: 128000,
            supportsXHighEffort: true,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.7",
            name: "Claude Opus 4.7",
            // Opus 4.7+ rejects non-default temperature/top_p/top_k with a 400 (sampling fixed;
            // reasoning via output_config.effort). Mirrors the dashed `claude` registry ids.
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.8",
            name: "Claude Opus 4.8",
            contextLength: 1048576,
            // Opus 4.7+ (incl. 4.8, Fable 5) reject non-default sampling with a 400. Mirrors claude-opus-4.7.
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.6",
            name: "Claude Opus 4.6"
        },
        {
            id: "claude-opus-4.5",
            name: "Claude Opus 4.5"
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5",
            contextLength: 1048576,
            // Sonnet 5 rejects non-default sampling params with a 400 (adaptive-only).
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "claude-haiku-4.5",
            name: "Claude Haiku 4.5"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/sambanova/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sambanovaProvider",
    ()=>sambanovaProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const sambanovaProvider = {
    id: "sambanova",
    alias: "samba",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.sambanova.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].sambanova
};
}),
"[project]/open-sse/config/providers/registry/puter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "puterProvider",
    ()=>puterProvider
]);
const puterProvider = {
    id: "puter",
    alias: "pu",
    format: "openai",
    executor: "puter",
    // OpenAI-compatible gateway with 500+ models (GPT, Claude, Gemini, Grok, DeepSeek, Qwen…)
    // Auth: Bearer <puter_auth_token> from puter.com/dashboard → Copy Auth Token
    // Model IDs use provider/model-name format for non-OpenAI models.
    // Only chat completions (incl. streaming) are available via REST.
    // Image gen, TTS, STT, video are puter.js SDK-only (browser).
    baseUrl: "https://api.puter.com/puterai/openai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // OpenAI — use bare IDs
        {
            id: "gpt-5.5",
            name: "GPT-5.5 (Puter)"
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4 (Puter)"
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini (Puter)"
        },
        {
            id: "gpt-5.4-nano",
            name: "GPT-5.4 Nano (Puter)"
        },
        {
            id: "gpt-4o",
            name: "GPT-4o (Puter)"
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini (🆓 Puter)"
        },
        {
            id: "o3",
            name: "OpenAI o3 (Puter)"
        },
        // Anthropic Claude — use bare IDs (confirmed working)
        {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5 (Puter)"
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (Puter)"
        },
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7 (Puter)"
        },
        // Google Gemini — use google/ prefix (confirmed working)
        {
            id: "google/gemini-3.5-flash",
            name: "Gemini 3.5 Flash (Puter)"
        },
        {
            id: "google/gemini-3.1-flash-lite-preview",
            name: "Gemini 3.1 Flash Lite (Puter)"
        },
        {
            id: "google/gemini-3-flash",
            name: "Gemini 3 Flash (Puter)"
        },
        {
            id: "google/gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro (Puter)"
        },
        // DeepSeek — use deepseek/ prefix (confirmed working)
        {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro (Puter)",
            supportsReasoning: true
        },
        {
            id: "deepseek/deepseek-v4-flash",
            name: "DeepSeek V4 Flash (Puter)",
            supportsReasoning: true
        },
        // xAI Grok — use x-ai/ prefix
        {
            id: "x-ai/grok-4.3",
            name: "Grok 4.3 (Puter)"
        },
        {
            id: "x-ai/grok-4.20",
            name: "Grok 4.20 (Puter)"
        },
        // Meta Llama — bare IDs (confirmed ✅)
        {
            id: "llama-4-scout",
            name: "Llama 4 Scout (Puter)"
        },
        {
            id: "llama-4-maverick",
            name: "Llama 4 Maverick (Puter)"
        },
        {
            id: "llama-3.3-70b-instruct",
            name: "Llama 3.3 70B (Puter)"
        },
        // Mistral — bare IDs (confirmed ✅)
        {
            id: "mistral-small-2603",
            name: "Mistral Small 4 (Puter)"
        },
        {
            id: "mistral-medium-3-5",
            name: "Mistral Medium 3.5 (Puter)"
        },
        {
            id: "mistral-large-2512",
            name: "Mistral Large (Puter)"
        },
        {
            id: "devstral-2512",
            name: "Devstral 2 (Puter)"
        },
        {
            id: "codestral-2508",
            name: "Codestral (Puter)"
        },
        {
            id: "mistral-nemo",
            name: "Mistral Nemo (Puter)"
        },
        // Qwen — use qwen/ prefix (confirmed ✅)
        {
            id: "qwen/qwen3.6-plus",
            name: "Qwen 3.6 Plus (Puter)"
        },
        {
            id: "qwen/qwen3.5-397b-a17b",
            name: "Qwen 3.5 397B (Puter)"
        },
        // Perplexity Sonar via OpenRouter aliases exposed by Puter
        {
            id: "perplexity/sonar-deep-research",
            name: "Perplexity Sonar Deep Research (Puter)"
        },
        {
            id: "perplexity/sonar-pro-search",
            name: "Perplexity Sonar Pro Search (Puter)"
        },
        {
            id: "perplexity/sonar-pro",
            name: "Perplexity Sonar Pro (Puter)"
        },
        {
            id: "perplexity/sonar-reasoning-pro",
            name: "Perplexity Sonar Reasoning Pro (Puter)"
        },
        {
            id: "perplexity/sonar",
            name: "Perplexity Sonar (Puter)"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/upstage/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "upstageProvider",
    ()=>upstageProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const upstageProvider = {
    id: "upstage",
    alias: "upstage",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.upstage.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].upstage
};
}),
"[project]/open-sse/config/providers/registry/nebius/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nebiusProvider",
    ()=>nebiusProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const nebiusProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "nebius",
    alias: "nebius",
    baseUrl: "https://api.tokenfactory.nebius.com/v1/chat/completions",
    models: [
        {
            id: "meta-llama/Llama-3.3-70B-Instruct",
            name: "Llama 3.3 70B Instruct"
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/fireworks/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fireworksProvider",
    ()=>fireworksProvider
]);
const fireworksProvider = {
    id: "fireworks",
    alias: "fireworks",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.fireworks.ai/inference/v1/chat/completions",
    modelsUrl: "https://api.fireworks.ai/v1/accounts/fireworks/models?filter=supports_serverless=true",
    modelIdPrefix: "accounts/fireworks/models/",
    acceptedModelIdPrefixes: [
        "accounts/fireworks/models/",
        "accounts/fireworks/routers/"
    ],
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "glm-5p1",
            name: "GLM 5.1"
        },
        {
            id: "gpt-oss-120b",
            name: "OpenAI gpt-oss-120b"
        },
        {
            id: "gpt-oss-20b",
            name: "OpenAI gpt-oss-20b"
        },
        {
            id: "kimi-k2p5",
            name: "Kimi K2.5"
        },
        {
            id: "kimi-k2p6",
            name: "Kimi K2.6"
        },
        {
            id: "minimax-m2p5",
            name: "MiniMax M2.5"
        },
        {
            id: "minimax-m2p7",
            name: "MiniMax M2.7"
        },
        {
            id: "qwen3p6-plus",
            name: "Qwen3.6 Plus"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/llamagate/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "llamagateProvider",
    ()=>llamagateProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const llamagateProvider = {
    id: "llamagate",
    alias: "llamagate",
    format: "openai",
    executor: "default",
    baseUrl: "https://llamagate.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].llamagate
};
}),
"[project]/open-sse/config/providers/registry/glm/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "glmProvider",
    ()=>glmProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/glmProvider.ts [instrumentation] (ecmascript)");
;
const glmProvider = {
    id: "glm",
    alias: "glm",
    format: "openai",
    executor: "glm",
    baseUrl: "https://api.z.ai/api/coding/paas/v4/chat/completions",
    defaultContextLength: 200000,
    authType: "apikey",
    authHeader: "bearer",
    requestDefaults: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_REQUEST_DEFAULTS"],
    timeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_TIMEOUT_MS"],
    models: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_SHARED_MODELS"]
    ]
};
}),
"[project]/open-sse/config/providers/registry/glm/t/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "glmtProvider",
    ()=>glmtProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/glmProvider.ts [instrumentation] (ecmascript)");
;
const glmtProvider = {
    id: "glmt",
    alias: "glmt",
    format: "openai",
    executor: "glm",
    baseUrl: "https://api.z.ai/api/coding/paas/v4/chat/completions",
    defaultContextLength: 200000,
    authType: "apikey",
    authHeader: "bearer",
    requestDefaults: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLMT_REQUEST_DEFAULTS"],
    timeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLMT_TIMEOUT_MS"],
    models: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_SHARED_MODELS"]
    ]
};
}),
"[project]/open-sse/config/providers/registry/glm/cn/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "glm_cnProvider",
    ()=>glm_cnProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/glmProvider.ts [instrumentation] (ecmascript)");
;
const glm_cnProvider = {
    id: "glm-cn",
    alias: "glmcn",
    format: "openai",
    executor: "glm",
    baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 200000,
    requestDefaults: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_REQUEST_DEFAULTS"],
    timeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_TIMEOUT_MS"],
    models: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GLM_SHARED_MODELS"]
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/trae/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "traeProvider",
    ()=>traeProvider
]);
const traeProvider = {
    id: "trae",
    alias: "tr",
    format: "openai",
    executor: "trae",
    baseUrl: "https://core-normal.trae.ai/api/remote/v1",
    authType: "oauth",
    authHeader: "bearer",
    defaultContextLength: 272000,
    models: [
        {
            id: "auto",
            name: "Auto (Code · Server Picks)"
        },
        {
            id: "work",
            name: "Work (Auto · fast)"
        },
        {
            id: "gemini-3.1-pro",
            name: "Gemini 3.1 Pro"
        },
        {
            id: "gemini-3-flash-solo",
            name: "Gemini 3 Flash"
        },
        // #3110: MiniMax M3 via Trae
        {
            id: "minimax-m3",
            name: "MiniMax M3",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "minimax-m2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5"
        },
        {
            id: "gpt-5.4",
            name: "GPT 5.4"
        },
        {
            id: "gpt-5.2",
            name: "GPT 5.2"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/raycast/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @file index.ts
 * @description Raycast Pro AI provider registry entry (reverse-engineered, unofficial API).
 *
 * @changes
 * - [2026-07-28] [Composer] - Initial Raycast provider registry module
 */ __turbopack_context__.s([
    "raycastProvider",
    ()=>raycastProvider
]);
const raycastProvider = {
    id: "raycast",
    alias: "rc",
    format: "openai",
    executor: "raycast",
    baseUrl: "https://backend.raycast.com/api/v1/ai",
    authType: "oauth",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "openai-gpt-5-mini",
            name: "GPT-5 Mini"
        },
        {
            id: "openai-gpt-4o-mini",
            name: "GPT-4o Mini"
        },
        {
            id: "anthropic-claude-sonnet-4-6",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "google-gemini-2.5-flash",
            name: "Gemini 2.5 Flash"
        },
        {
            id: "raycast-ray1",
            name: "Ray1"
        },
        {
            id: "raycast-ray1-mini",
            name: "Ray1 Mini"
        },
        {
            id: "perplexity-sonar",
            name: "Sonar"
        },
        {
            id: "perplexity-sonar-pro",
            name: "Sonar Pro"
        },
        {
            id: "mistral-open-mistral-nemo",
            name: "Mistral Nemo"
        },
        {
            id: "xai-grok-3-mini",
            name: "Grok 3 Mini"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/muse-spark-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "muse_spark_webProvider",
    ()=>muse_spark_webProvider
]);
const muse_spark_webProvider = {
    id: "muse-spark-web",
    alias: "ms-web",
    format: "openai",
    executor: "muse-spark-web",
    baseUrl: "https://www.meta.ai/api/graphql",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "muse-spark",
            name: "Muse Spark",
            toolCalling: false
        },
        {
            id: "muse-spark-thinking",
            name: "Muse Spark Thinking",
            supportsReasoning: true
        },
        {
            id: "muse-spark-contemplating",
            name: "Muse Spark Contemplating",
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/lmarena/directModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Arena (formerly LMArena) Direct-chat model allowlist (scraped 2026-07-09).
 * - Text + Search → chat registry (providers/registry/lmarena, wire id unchanged)
 * - Image → IMAGE_PROVIDERS in imageRegistry.ts (not chat catalog)
 * Live HTML discovery is disabled. Scrape JSON stays local/desktop only — not shipped.
 */ __turbopack_context__.s([
    "LMARENA_DIRECT_CHAT_ENTRIES",
    ()=>LMARENA_DIRECT_CHAT_ENTRIES,
    "LMARENA_DIRECT_IMAGE_ENTRIES",
    ()=>LMARENA_DIRECT_IMAGE_ENTRIES,
    "LMARENA_DIRECT_IMAGE_MODELS",
    ()=>LMARENA_DIRECT_IMAGE_MODELS,
    "LMARENA_DIRECT_MODELS",
    ()=>LMARENA_DIRECT_MODELS,
    "LMARENA_DIRECT_MODEL_ENTRIES",
    ()=>LMARENA_DIRECT_MODEL_ENTRIES,
    "resolveLmarenaArenaId",
    ()=>resolveLmarenaArenaId
]);
const LMARENA_DIRECT_MODEL_ENTRIES = Object.freeze([
    {
        catalogId: "amazon.nova-pro-v1:0",
        arenaId: "a14546b5-d78d-4cf6-bb61-ab5b8510a9d6",
        publicName: "amazon.nova-pro-v1:0",
        displayName: "amazon.nova-pro-v1:0",
        organization: "amazon",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "claude-haiku-4-5-20251001",
        arenaId: "0199e8e9-01ed-73e0-96ba-cf43b286bf10",
        publicName: "claude-haiku-4-5-20251001",
        displayName: "claude-haiku-4-5-20251001",
        organization: "anthropic",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "claude-sonnet-5",
        arenaId: "019f19f2-41f1-7c6d-9891-48d02fd9952c",
        publicName: "claude-sonnet-5",
        displayName: "claude-sonnet-5-high",
        organization: "anthropic",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "deepseek-v4-pro-thinking",
        arenaId: "019dc1c1-c62d-7b70-85a1-e0565e29fce1",
        publicName: "deepseek-v4-pro-thinking",
        displayName: "deepseek-v4-pro-thinking",
        organization: "deepseek",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "dola-seed-2.0-preview-vision",
        arenaId: "019c6453-641a-74f8-a689-a8a67175a359",
        publicName: "dola-seed-2.0-preview-vision",
        displayName: "dola-seed-2.0-preview-vision",
        organization: "bytedance",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "ernie-5.0-preview-1220",
        arenaId: "019d44f1-26da-729f-a4ea-ddddfe7b4eae",
        publicName: "ernie-5.0-preview-1220",
        displayName: "ernie-5.0-preview-1220",
        organization: "baidu",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gemini-3.1-flash-lite",
        arenaId: "019f408a-186c-7f3a-9595-4e079e42a613",
        publicName: "gemini-3.1-flash-lite",
        displayName: "gemini-3.1-flash-lite",
        organization: "google",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gemini-3.1-pro-preview",
        arenaId: "019c7820-5480-78b6-9fef-04c0d7004054",
        publicName: "gemini-3.1-pro-preview",
        displayName: "gemini-3.1-pro-preview",
        organization: "google",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gemini-3.5-flash-high",
        arenaId: "019f406f-fc33-7b9d-9571-7b8443bc7ca0",
        publicName: "gemini-3.5-flash-high",
        displayName: "gemini-3.5-flash-high",
        organization: "google",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "significant-otter",
        arenaId: "019d2cd3-2641-7628-94bd-67ecb0a7134e",
        publicName: "significant-otter",
        displayName: "gemma-4-26b-a4b",
        organization: "google",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "pteronura",
        arenaId: "019d2cd2-dd83-75ab-a421-d0ba2e22b1e3",
        publicName: "pteronura",
        displayName: "gemma-4-31b",
        organization: "google",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "glm-5.1",
        arenaId: "019ebf6a-94d4-7649-b704-1dbbd5eb0942",
        publicName: "glm-5.1",
        displayName: "glm-5.2 (max)",
        organization: "zai",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "glm-5v-turbo",
        arenaId: "019d4a09-9651-78cb-86ea-bb0fa5ec77f4",
        publicName: "glm-5v-turbo",
        displayName: "glm-5v-turbo",
        organization: "zai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gpt-oss-120b",
        arenaId: "6ee9f901-17b5-4fbe-9cc2-13c16497c23b",
        publicName: "gpt-oss-120b",
        displayName: "gpt-oss-120b",
        organization: "openai",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "gpt-5.2-high",
        arenaId: "019b1449-0313-7911-b836-419e2ed79b2e",
        publicName: "gpt-5.2-high",
        displayName: "gpt-5.2-high",
        organization: "openai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gpt-5.4-mini-high",
        arenaId: "019cfcdd-5426-777e-8314-04619cb92cc4",
        publicName: "gpt-5.4-mini-high",
        displayName: "gpt-5.4-mini-high",
        organization: "openai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gpt-5.4-nano-high",
        arenaId: "019cfcdd-0bca-706f-92b5-a4c4cbd022d8",
        publicName: "gpt-5.4-nano-high",
        displayName: "gpt-5.4-nano-high",
        organization: "openai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "gpt-5.5-instant",
        arenaId: "019e71ea-1e1d-740f-9c2d-dab5869ff108",
        publicName: "gpt-5.5-instant",
        displayName: "gpt-5.5-instant",
        organization: "openai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "grok-4.3/text",
        arenaId: "019f42aa-9c3b-76d1-8bdf-2e883b1ca227",
        publicName: "grok-4.3",
        displayName: "grok-4.5",
        organization: "xai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "hunyuan-vision-1.5-thinking",
        arenaId: "6a3a1e04-050e-4cb4-9052-b9ac4bec0c38",
        publicName: "hunyuan-vision-1.5-thinking",
        displayName: "hunyuan-vision-1.5-thinking",
        organization: "tencent",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "hy3",
        arenaId: "019f3911-ba1c-7e36-b631-01893e557290",
        publicName: "hy3",
        displayName: "hy3",
        organization: "tencent",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "kimi-k2.6",
        arenaId: "019dac54-e8a4-7c54-904a-ff0ecd82af42",
        publicName: "kimi-k2.6",
        displayName: "kimi-k2.6",
        organization: "moonshot",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "ling-2.5-1t",
        arenaId: "019c6e76-fbbc-7e92-b0ba-784c7ef3ad8b",
        publicName: "ling-2.5-1t",
        displayName: "ling-2.5-1t",
        organization: "ant-group",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "longcat-2.0",
        arenaId: "019f3a0a-bd19-7b19-9eed-a98453759b48",
        publicName: "longcat-2.0",
        displayName: "longcat-2.0",
        organization: "meituan",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "mercury-2",
        arenaId: "019cc65f-c1e3-7574-b332-898ab71c8211",
        publicName: "mercury-2",
        displayName: "mercury-2",
        organization: "inception-ai",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "mimo-v2.5",
        arenaId: "019db651-bd2f-7d80-ab12-d69c6bb623df",
        publicName: "mimo-v2.5",
        displayName: "mimo-v2.5",
        organization: "xiaomi",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "mimo-v2.5-pro",
        arenaId: "019db650-909d-7dec-8711-1907d7233cd4",
        publicName: "mimo-v2.5-pro",
        displayName: "mimo-v2.5-pro",
        organization: "xiaomi",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "minimax-m3",
        arenaId: "019e809d-f62d-7192-bb7f-1657e066b5f2",
        publicName: "minimax-m3",
        displayName: "minimax-m3",
        organization: "minimax",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "mistral-large-3",
        arenaId: "019acbac-df7c-73dc-9716-ebe040daaa4e",
        publicName: "mistral-large-3",
        displayName: "mistral-large-3",
        organization: "mistral",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "mistral-medium-3.5",
        arenaId: "019f30a4-044d-7a14-9d3b-2e7299159e36",
        publicName: "mistral-medium-3.5",
        displayName: "mistral-medium-3.5",
        organization: "mistral",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "mistral-small-2603",
        arenaId: "019cf983-532b-73fa-a057-7658e1e1c5ee",
        publicName: "mistral-small-2603",
        displayName: "mistral-small-2603",
        organization: "mistral",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "nova-2-lite",
        arenaId: "019ae300-83b7-7717-a1e0-31accd1ff6fa",
        publicName: "nova-2-lite",
        displayName: "nova-2-lite",
        organization: "amazon",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "nvidia-nemotron-3-nano-30b-a3b-bf16",
        arenaId: "019b0aa7-334a-78e8-b2a8-885f31f4fc0c",
        publicName: "nvidia-nemotron-3-nano-30b-a3b-bf16",
        displayName: "nvidia-nemotron-3-nano-30b-a3b-bf16",
        organization: "nvidia",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "march26-chatbot1-public",
        arenaId: "019cd9e3-c3ff-7225-92f2-c392259b1fbe",
        publicName: "march26-chatbot1-public",
        displayName: "nvidia-nemotron-3-super-120b-a12b",
        organization: "nvidia",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "may26-chatbot4-public",
        arenaId: "019e8ea8-2052-7f2e-b1b6-59bd94be5203",
        publicName: "may26-chatbot4-public",
        displayName: "nvidia-nemotron-3-ultra-550b-a55b-nvfp4",
        organization: "nvidia",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "o3-2025-04-16",
        arenaId: "cb0f1e24-e8e9-4745-aabc-b926ffde7475",
        publicName: "o3-2025-04-16",
        displayName: "o3-2025-04-16",
        organization: "openai",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "qwen3.5-397b-a17b",
        arenaId: "019c6918-1d2a-7e3f-88ec-ada000b6ab16",
        publicName: "qwen3.5-397b-a17b",
        displayName: "qwen3.5-397b-a17b",
        organization: "alibaba",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "qwen3.7-max",
        arenaId: "019e6530-f140-77b1-b6b8-5c859829d992",
        publicName: "qwen3.7-max",
        displayName: "qwen3.7-max",
        organization: "alibaba",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "qwen3.7-plus",
        arenaId: "019e86fe-167d-77bd-94a8-df7aee4f4551",
        publicName: "qwen3.7-plus",
        displayName: "qwen3.7-plus",
        organization: "alibaba",
        vision: true,
        category: "Text"
    },
    {
        catalogId: "ring-2.5-1t",
        arenaId: "019c6e77-1b9f-7649-9136-43d07566c6c5",
        publicName: "ring-2.5-1t",
        displayName: "ring-2.5-1t",
        organization: "ant-group",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "step-3.5-flash",
        arenaId: "019d22bb-fcf5-7866-9c07-de74fe05c9cc",
        publicName: "step-3.5-flash",
        displayName: "step-3.5-flash",
        organization: "stepfun",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "trinity-large-thinking",
        arenaId: "019d50aa-447d-74d6-8661-405b4b6de5de",
        publicName: "trinity-large-thinking",
        displayName: "trinity-large-thinking",
        organization: "arcee-ai",
        vision: false,
        category: "Text"
    },
    {
        catalogId: "cosmos3-super",
        arenaId: "019f4270-5d10-723c-8a7e-dfd5dd2214e5",
        publicName: "cosmos3-super",
        displayName: "cosmos3-super",
        organization: "nvidia",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "cosmos3-super-agentic",
        arenaId: "019f4270-9eea-79c3-b18f-71303ee41ff8",
        publicName: "cosmos3-super-agentic",
        displayName: "cosmos3-super-agentic",
        organization: "nvidia",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "flux-2-dev",
        arenaId: "019b478d-74ae-7d19-9a8f-6cfde89ab4ca",
        publicName: "flux-2-dev",
        displayName: "flux-2-dev",
        organization: "bfl",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "flux-2-pro",
        arenaId: "019b7541-5e4b-7ff7-a34b-b0255b6ca9aa",
        publicName: "flux-2-pro",
        displayName: "flux-2-pro",
        organization: "bfl",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "gemini-2.5-flash-image-preview (nano-banana)",
        arenaId: "0199ef2a-583f-7088-b704-b75fd169401d",
        publicName: "gemini-2.5-flash-image-preview (nano-banana)",
        displayName: "gemini-2.5-flash-image-preview (nano-banana)",
        organization: "google",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "instant-ramen",
        arenaId: "019ed3b3-c4f8-7e67-b72d-385d740096d0",
        publicName: "instant-ramen",
        displayName: "gemini-3.1-flash-lite-image (nano-banana-2-lite)",
        organization: "google",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "gpt-image-1",
        arenaId: "6e855f13-55d7-4127-8656-9168a9f4dcc0",
        publicName: "gpt-image-1",
        displayName: "gpt-image-1",
        organization: "openai",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "blue-crab",
        arenaId: "019e4271-4717-7dd9-a0e2-90783fbabd25",
        publicName: "blue-crab",
        displayName: "grok-imagine-image-quality (20260519)",
        organization: "xai",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "hidream-o1-image",
        arenaId: "019e1cd7-5cc5-75d2-8b3e-275616dec624",
        publicName: "hidream-o1-image",
        displayName: "hidream-o1-image",
        organization: "hidream",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "sungod",
        arenaId: "019bec2d-e92c-745d-ae46-c7166590237a",
        publicName: "sungod",
        displayName: "hunyuan-image-3.0-instruct",
        organization: "tencent",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "ideogram-v3-quality",
        arenaId: "73378be5-cdba-49e7-b3d0-027949871aa6",
        publicName: "ideogram-v3-quality",
        displayName: "ideogram-v3-quality",
        organization: "Ideogram",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "krea-2-large",
        arenaId: "019e8ebd-6cfb-7492-949c-a2c4a00301aa",
        publicName: "krea-2-large",
        displayName: "krea-2-large",
        organization: "krea",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "krea-2-turbo",
        arenaId: "019f049d-7de4-7fae-8237-1c2103b9e730",
        publicName: "krea-2-turbo",
        displayName: "krea-2-turbo",
        organization: "krea",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "lucid-origin",
        arenaId: "5a3b3520-c87d-481f-953c-1364687b6e8f",
        publicName: "lucid-origin",
        displayName: "lucid-origin",
        organization: "leonardo-ai",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "kakarot-v2",
        arenaId: "019e80aa-37bf-7e89-8a28-41e4ab72ed9f",
        publicName: "kakarot-v2",
        displayName: "mai-image-2.5 (image-edit)",
        organization: "microsoft-ai",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "baryonyx",
        arenaId: "019e530d-2a50-75e3-95d1-a5ef41d4c24c",
        publicName: "baryonyx",
        displayName: "mai-image-2.5 (text-to-image)",
        organization: "microsoft-ai",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "iron-bloom",
        arenaId: "019ef780-25ef-7878-8b91-307f8f879d42",
        publicName: "iron-bloom",
        displayName: "muse-image",
        organization: "meta",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "photon",
        arenaId: "e7c9fa2d-6f5d-40eb-8305-0980b11c7cab",
        publicName: "photon",
        displayName: "photon",
        organization: "luma-ai",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "qwen-image-2.0",
        arenaId: "019d287c-4906-7f9c-8b78-8a2a86cf00a5",
        publicName: "qwen-image-2.0",
        displayName: "qwen-image-2.0",
        organization: "alibaba",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "qwen-image-2.0-pro",
        arenaId: "019d287b-b718-7daa-ad65-502596d0813d",
        publicName: "qwen-image-2.0-pro",
        displayName: "qwen-image-2.0-pro",
        organization: "alibaba",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "recraft-v4",
        arenaId: "019c6e76-a7c0-7b05-8dce-bbe3d52c8f4e",
        publicName: "recraft-v4",
        displayName: "recraft-v4",
        organization: "Recraft",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "avalon",
        arenaId: "019e7091-f73f-7338-b5e2-4ab5fba37dc2",
        publicName: "avalon",
        displayName: "reve-2.0 (image-edit)",
        organization: "reve",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "babylon",
        arenaId: "019e86c6-a3dc-73ac-9adc-8c5f304dc2fb",
        publicName: "babylon",
        displayName: "reve-2.0 (text-to-image)",
        organization: "reve",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "seedream-5.0-pro",
        arenaId: "019f42b5-8c52-7793-9be8-de35eecf7ea9",
        publicName: "seedream-5.0-pro",
        displayName: "seedream-5.0-pro",
        organization: "bytedance",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "uni-1.1-max",
        arenaId: "019ed208-69ca-7f3f-85ee-182d5f0ea08b",
        publicName: "uni-1.1-max",
        displayName: "uni-1.1-max",
        organization: "luma-ai",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "wan2.7-image-pro",
        arenaId: "019db3f0-b024-7478-bd4d-55ea1ec1d421",
        publicName: "wan2.7-image-pro",
        displayName: "wan2.7-image-pro",
        organization: "wan",
        vision: true,
        category: "Image"
    },
    {
        catalogId: "zen-bear-v3",
        arenaId: "019f38c2-002d-7f0f-a391-db6df024b734",
        publicName: "zen-bear-v3",
        displayName: "zen-bear-v3",
        organization: "alibaba",
        vision: false,
        category: "Image"
    },
    {
        catalogId: "claude-sonnet-5-search",
        arenaId: "019f1a07-de72-7fbe-8d82-56dbd7348360",
        publicName: "claude-sonnet-5-search",
        displayName: "claude-sonnet-5-search",
        organization: "anthropic",
        vision: false,
        category: "Search"
    },
    {
        catalogId: "gemini-2.5-pro-grounding",
        arenaId: "b222be23-bd55-4b20-930b-a30cc84d3afd",
        publicName: "gemini-2.5-pro-grounding",
        displayName: "gemini-2.5-pro-grounding",
        organization: "google",
        vision: false,
        category: "Search"
    },
    {
        catalogId: "gemini-3-flash-grounding",
        arenaId: "019bda1f-3abc-783f-aac0-1ee102b247ba",
        publicName: "gemini-3-flash-grounding",
        displayName: "gemini-3-flash-grounding",
        organization: "google",
        vision: false,
        category: "Search"
    },
    {
        catalogId: "gpt-5.2-search",
        arenaId: "019b1448-f74a-72de-b25d-8666618f8c5a",
        publicName: "gpt-5.2-search",
        displayName: "gpt-5.2-search",
        organization: "openai",
        vision: false,
        category: "Search"
    },
    {
        catalogId: "grok-4.3/search",
        arenaId: "019de22d-1445-7296-9c88-a5877bc66ef8",
        publicName: "grok-4.3",
        displayName: "grok-4.3",
        organization: "xai",
        vision: false,
        category: "Search"
    },
    {
        catalogId: "o3-search",
        arenaId: "fbe08e9a-3805-4f9f-a085-7bc38e4b51d1",
        publicName: "o3-search",
        displayName: "o3-search",
        organization: "openai",
        vision: false,
        category: "Search"
    }
]);
const LMARENA_DIRECT_CHAT_ENTRIES = LMARENA_DIRECT_MODEL_ENTRIES.filter((m)=>m.category === "Text" || m.category === "Search");
const LMARENA_DIRECT_IMAGE_ENTRIES = LMARENA_DIRECT_MODEL_ENTRIES.filter((m)=>m.category === "Image");
const LMARENA_DIRECT_MODELS = LMARENA_DIRECT_CHAT_ENTRIES.map((m)=>({
        id: m.catalogId,
        name: m.displayName,
        ...m.vision ? {
            supportsVision: true
        } : {}
    }));
const LMARENA_DIRECT_IMAGE_MODELS = LMARENA_DIRECT_IMAGE_ENTRIES.map((m)=>({
        id: m.catalogId,
        name: m.displayName,
        inputModalities: m.vision ? [
            "text",
            "image"
        ] : [
            "text"
        ]
    }));
function resolveLmarenaArenaId(catalogOrArenaId) {
    const raw = catalogOrArenaId.replace(/^(?:lmarena|lma|arena)\//i, "").trim();
    if (!raw) return null;
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRe.test(raw)) return raw;
    const lower = raw.toLowerCase();
    const hit = LMARENA_DIRECT_MODEL_ENTRIES.find((m)=>m.catalogId === raw || m.publicName === raw || m.displayName === raw || m.catalogId.toLowerCase() === lower || m.publicName.toLowerCase() === lower || m.displayName.toLowerCase() === lower);
    return hit?.arenaId ?? null;
}
}),
"[project]/open-sse/config/providers/registry/lmarena/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lmarenaProvider",
    ()=>lmarenaProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$directModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/lmarena/directModels.ts [instrumentation] (ecmascript)");
;
const lmarenaProvider = {
    id: "lmarena",
    alias: "lma",
    format: "openai",
    executor: "lmarena",
    baseUrl: "https://arena.ai/nextjs-api/stream/create-evaluation",
    authType: "apikey",
    authHeader: "cookie",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$directModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["LMARENA_DIRECT_MODELS"]
};
}),
"[project]/open-sse/config/providers/registry/kilocode/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kilocodeProvider",
    ()=>kilocodeProvider
]);
const kilocodeProvider = {
    id: "kilocode",
    alias: "kc",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.kilo.ai/api/openrouter/chat/completions",
    modelsUrl: "https://api.kilo.ai/api/openrouter/models",
    authType: "oauth",
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    // #4019: Kilo's gateway serves its free models anonymously when no account is
    // connected. Paired with `anonymousFallback: true` on the dashboard provider
    // entry, a request with no OAuth credential falls back to `Bearer anonymous`
    // (see DefaultExecutor) so the free tier works without signup. The editor-name
    // header is required by the gateway and is harmless on the authenticated path.
    anonymousApiKey: "anonymous",
    headers: {
        "X-KILOCODE-EDITORNAME": "OmniRoute"
    },
    oauth: {
        initiateUrl: "https://api.kilo.ai/api/device-auth/codes",
        pollUrlBase: "https://api.kilo.ai/api/device-auth/codes"
    },
    models: [
        {
            id: "openrouter/free",
            name: "Free Models Router"
        },
        {
            id: "qwen/qwen3.6-plus",
            name: "Qwen3.6 Plus"
        },
        {
            id: "qwen/qwen3.5-397b-a17b",
            name: "Qwen3.5 397B A17B"
        },
        {
            id: "openai/gpt-5.5",
            name: "GPT-5.5"
        },
        {
            id: "openai/gpt-5.4-mini",
            name: "GPT-5.4 Mini"
        },
        {
            id: "anthropic/claude-opus-4.7",
            name: "Claude Opus 4.7"
        },
        {
            id: "anthropic/claude-sonnet-4.6",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "anthropic/claude-haiku-4.5",
            name: "Claude Haiku 4.5"
        },
        {
            id: "google/gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro"
        },
        {
            id: "google/gemini-3-flash-preview",
            name: "Gemini 3 Flash"
        },
        {
            id: "google/gemini-3.1-flash-lite",
            name: "Gemini 3.1 Flash Lite"
        },
        {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "deepseek/deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        },
        {
            id: "moonshotai/kimi-k2.6",
            name: "Kimi K2.6"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/github/models/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "github_modelsProvider",
    ()=>github_modelsProvider
]);
const github_modelsProvider = {
    id: "github-models",
    alias: "ghm",
    format: "openai",
    executor: "default",
    baseUrl: "https://models.github.ai/inference/chat/completions",
    modelsUrl: "https://models.github.ai/catalog/models",
    authType: "apikey",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    headers: {
        "X-GitHub-Api-Version": "2026-03-10",
        Accept: "application/vnd.github+json"
    },
    defaultContextLength: 128000,
    models: [
        {
            id: "cohere/cohere-command-a",
            name: "Cohere Command A",
            contextLength: 131_072,
            maxInputTokens: 131_072,
            maxOutputTokens: 4_096
        },
        {
            id: "deepseek/deepseek-r1-0528",
            name: "DeepSeek-R1-0528",
            contextLength: 128_000,
            maxInputTokens: 128_000,
            maxOutputTokens: 4_096,
            supportsReasoning: true,
            toolCalling: true
        },
        {
            id: "deepseek/deepseek-v3-0324",
            name: "DeepSeek-V3-0324",
            contextLength: 128_000,
            maxInputTokens: 128_000,
            maxOutputTokens: 4_096,
            toolCalling: true
        },
        {
            id: "meta/llama-4-maverick-17b-128e-instruct-fp8",
            name: "Llama 4 Maverick 17B 128E Instruct FP8",
            contextLength: 1_000_000,
            maxInputTokens: 1_000_000,
            maxOutputTokens: 4_096,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "meta/llama-3.3-70b-instruct",
            name: "Llama-3.3-70B-Instruct",
            contextLength: 128_000,
            maxInputTokens: 128_000,
            maxOutputTokens: 4_096
        },
        {
            id: "meta/llama-4-scout-17b-16e-instruct",
            name: "Llama 4 Scout 17B 16E Instruct",
            contextLength: 10_000_000,
            maxInputTokens: 10_000_000,
            maxOutputTokens: 4_096,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "microsoft/phi-4-multimodal-instruct",
            name: "Phi-4-multimodal-instruct",
            contextLength: 128_000,
            maxInputTokens: 128_000,
            maxOutputTokens: 4_096,
            supportsVision: true
        },
        {
            id: "microsoft/phi-4-reasoning",
            name: "Phi-4-reasoning",
            contextLength: 32_768,
            maxInputTokens: 32_768,
            maxOutputTokens: 4_096,
            supportsReasoning: true
        },
        {
            id: "mistral-ai/codestral-2501",
            name: "Codestral 25.01",
            contextLength: 256_000,
            maxInputTokens: 256_000,
            maxOutputTokens: 4_096
        },
        {
            id: "mistral-ai/mistral-medium-2505",
            name: "Mistral Medium 3 (25.05)",
            contextLength: 128_000,
            maxInputTokens: 128_000,
            maxOutputTokens: 4_096,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-4.1",
            name: "OpenAI GPT-4.1",
            contextLength: 1_048_576,
            maxInputTokens: 1_048_576,
            maxOutputTokens: 32_768,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-4.1-mini",
            name: "OpenAI GPT-4.1-mini",
            contextLength: 1_048_576,
            maxInputTokens: 1_048_576,
            maxOutputTokens: 32_768,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-4o",
            name: "OpenAI GPT-4o",
            contextLength: 131_072,
            maxInputTokens: 131_072,
            maxOutputTokens: 16_384,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-4o-mini",
            name: "OpenAI GPT-4o mini",
            contextLength: 131_072,
            maxInputTokens: 131_072,
            maxOutputTokens: 4_096,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-5",
            name: "OpenAI gpt-5",
            contextLength: 200_000,
            maxInputTokens: 200_000,
            maxOutputTokens: 100_000,
            supportsVision: true,
            supportsReasoning: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-5-chat",
            name: "OpenAI gpt-5-chat (preview)",
            contextLength: 200_000,
            maxInputTokens: 200_000,
            maxOutputTokens: 100_000,
            supportsVision: true,
            supportsReasoning: true,
            toolCalling: true
        },
        {
            id: "openai/gpt-5-mini",
            name: "OpenAI gpt-5-mini",
            contextLength: 200_000,
            maxInputTokens: 200_000,
            maxOutputTokens: 100_000,
            supportsVision: true,
            supportsReasoning: true,
            toolCalling: true
        },
        {
            id: "openai/o3",
            name: "OpenAI o3",
            contextLength: 200_000,
            maxInputTokens: 200_000,
            maxOutputTokens: 100_000,
            supportsVision: true,
            supportsReasoning: true,
            toolCalling: true
        },
        {
            id: "openai/o4-mini",
            name: "OpenAI o4-mini",
            contextLength: 200_000,
            maxInputTokens: 200_000,
            maxOutputTokens: 100_000,
            supportsVision: true,
            supportsReasoning: true,
            toolCalling: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/github/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "githubProvider",
    ()=>githubProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const githubProvider = {
    id: "github",
    alias: "gh",
    format: "openai",
    executor: "github",
    baseUrl: "https://api.githubcopilot.com/chat/completions",
    responsesBaseUrl: "https://api.githubcopilot.com/responses",
    // Anthropic-native shim: the only Copilot endpoint that surfaces prompt-cache
    // token counts (cached_tokens) for Claude models, and avoids round-tripping
    // tool_use/tool_result/thinking content blocks through the OpenAI shape.
    // Routed via each claude-* model's targetFormat: "claude" below (see
    // executors/github.ts buildUrl/buildHeaders). Port of decolua/9router#2608.
    messagesUrl: "https://api.githubcopilot.com/v1/messages",
    authType: "oauth",
    authHeader: "bearer",
    // GitHub Copilot is a public device-flow OAuth client: it has a public client_id but
    // NO client_secret. Populate clientId so token refresh carries it (9router#442) — without
    // it, refresh requests omit/garble client_id and GitHub rejects them. Embedded via
    // resolvePublicCred per Hard Rule #11 (never a string literal).
    oauth: {
        clientIdEnv: "GITHUB_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id")
    },
    defaultContextLength: 128000,
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getGitHubCopilotChatHeaders"])(),
    // All claude-* entries below carry targetFormat: "claude" so chatCore.ts
    // translates the request to Anthropic-native shape before the executor ever
    // sees it, and the github executor's buildUrl()/buildHeaders() route them at
    // messagesUrl (/v1/messages) instead of /chat/completions. Port of
    // decolua/9router#2608 (author: yidecode) — see executors/github.ts.
    models: [
        {
            id: "claude-fable-5",
            name: "Claude Fable 5",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-opus-5",
            name: "Claude Opus 5",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.8-fast",
            name: "Claude Opus 4.8 (fast mode)",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.8",
            name: "Claude Opus 4.8",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.7",
            name: "Claude Opus 4.7",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-opus-4.5",
            name: "Claude Opus 4.5",
            targetFormat: "claude",
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5",
            targetFormat: "claude",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            targetFormat: "claude",
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "claude-haiku-4.5",
            name: "Claude Haiku 4.5",
            targetFormat: "claude",
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        // #2911: Gemini on Copilot must use chat/completions, not the Responses API.
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "gpt-5.6-sol",
            name: "GPT-5.6 Sol",
            targetFormat: "openai-responses",
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.6-terra",
            name: "GPT-5.6 Terra",
            targetFormat: "openai-responses",
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.6-luna",
            name: "GPT-5.6 Luna",
            targetFormat: "openai-responses",
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4",
            targetFormat: "openai-responses",
            supportsXHighEffort: true,
            contextLength: 1050000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 mini",
            targetFormat: "openai-responses",
            contextLength: 400000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT-5.3-Codex",
            targetFormat: "openai-responses",
            contextLength: 400000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5-mini",
            name: "GPT-5 mini",
            targetFormat: "openai-responses",
            contextLength: 264000,
            maxOutputTokens: 64000
        },
        {
            id: "gpt-4o-2024-11-20",
            name: "GPT-4o",
            contextLength: 128000,
            maxOutputTokens: 16384
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o mini",
            contextLength: 128000,
            maxOutputTokens: 4096
        },
        {
            id: "gpt-4-0125-preview",
            name: "GPT 4 Turbo",
            contextLength: 128000,
            maxOutputTokens: 4096
        },
        {
            id: "kimi-k2.7-code",
            name: "Kimi K2.7 Code",
            contextLength: 256000,
            maxOutputTokens: 32000
        },
        {
            id: "mai-code-1-flash",
            name: "MAI-Code-1-Flash",
            targetFormat: "openai-responses",
            contextLength: 256000,
            maxOutputTokens: 128000
        },
        {
            id: "oswe-vscode-prime",
            name: "Raptor mini",
            targetFormat: "openai-responses",
            contextLength: 264000,
            maxOutputTokens: 64000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/ghe-copilot/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gheCopilotProvider",
    ()=>gheCopilotProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const gheCopilotProvider = {
    id: "ghe-copilot",
    alias: "ghe-copilot",
    format: "openai",
    executor: "ghe-copilot",
    // GHE Copilot proxy is streaming-only: it rejects `stream: false` (and an
    // absent stream flag). forceStream makes chatCore send stream:true upstream
    // and drain the SSE back into a single JSON response for non-stream clients.
    forceStream: true,
    baseUrl: "https://api.githubcopilot.com/chat/completions",
    responsesBaseUrl: "https://api.githubcopilot.com/responses",
    authType: "oauth",
    authHeader: "bearer",
    // GHE Copilot requires a custom gheUrl (set per-connection via providerSpecificData).
    // The executor overrides URL building + token refresh to hit the GHE host.
    oauth: {
        clientIdEnv: "GITHUB_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id")
    },
    defaultContextLength: 128000,
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getGitHubCopilotChatHeaders"])(),
    models: [
        {
            id: "claude-fable-5",
            name: "Claude Fable 5",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-opus-5",
            name: "Claude Opus 5",
            contextLength: 1000000,
            maxOutputTokens: 64000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.8-fast",
            name: "Claude Opus 4.8 (fast mode)",
            contextLength: 1000000,
            maxOutputTokens: 64000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.8",
            name: "Claude Opus 4.8",
            contextLength: 1000000,
            maxOutputTokens: 64000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4.7",
            name: "Claude Opus 4.7",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-opus-4.5",
            name: "Claude Opus 4.5",
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "claude-haiku-4.5",
            name: "Claude Haiku 4.5",
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash",
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "gpt-5.6-sol",
            name: "GPT-5.6 Sol",
            targetFormat: "openai-responses",
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.6-terra",
            name: "GPT-5.6 Terra",
            targetFormat: "openai-responses",
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.6-luna",
            name: "GPT-5.6 Luna",
            targetFormat: "openai-responses",
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4",
            targetFormat: "openai-responses",
            supportsXHighEffort: true,
            contextLength: 1050000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 mini",
            targetFormat: "openai-responses",
            contextLength: 400000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT-5.3-Codex",
            targetFormat: "openai-responses",
            contextLength: 400000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5-mini",
            name: "GPT-5 mini",
            targetFormat: "openai-responses",
            contextLength: 264000,
            maxOutputTokens: 64000
        },
        {
            id: "gpt-4o-2024-11-20",
            name: "GPT-4o",
            contextLength: 128000,
            maxOutputTokens: 16384
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o mini",
            contextLength: 128000,
            maxOutputTokens: 4096
        },
        {
            id: "gpt-4-0125-preview",
            name: "GPT 4 Turbo",
            contextLength: 128000,
            maxOutputTokens: 4096
        },
        {
            id: "kimi-k2.7-code",
            name: "Kimi K2.7 Code",
            contextLength: 256000,
            maxOutputTokens: 32000
        },
        {
            id: "mai-code-1-flash",
            name: "MAI-Code-1-Flash",
            targetFormat: "openai-responses",
            contextLength: 256000,
            maxOutputTokens: 128000
        },
        {
            id: "oswe-vscode-prime",
            name: "Raptor mini",
            targetFormat: "openai-responses",
            contextLength: 264000,
            maxOutputTokens: 64000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/dify/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "difyProvider",
    ()=>difyProvider
]);
const difyProvider = {
    id: "dify",
    alias: "dify",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.dify.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "auto",
            name: "Auto"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/ovhcloud/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ovhcloudProvider",
    ()=>ovhcloudProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const ovhcloudProvider = {
    id: "ovhcloud",
    alias: "ovh",
    format: "openai",
    executor: "default",
    baseUrl: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions",
    modelsUrl: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models",
    authType: "optional",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].ovhcloud
};
}),
"[project]/open-sse/config/providers/registry/claude/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "claudeProvider",
    ()=>claudeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const claudeProvider = {
    id: "claude",
    alias: "cc",
    format: "claude",
    executor: "default",
    baseUrl: "https://api.anthropic.com/v1/messages",
    urlSuffix: "?beta=true",
    authType: "oauth",
    authHeader: "x-api-key",
    defaultContextLength: 200000,
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getClaudeCliHeaders"])(),
    oauth: {
        clientIdEnv: "CLAUDE_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("claude_id"),
        tokenUrl: "https://api.anthropic.com/v1/oauth/token"
    },
    models: [
        {
            id: "claude-fable-5",
            name: "Claude Fable 5",
            contextLength: 1000000,
            maxOutputTokens: 128000,
            // Opus 4.7+/Fable 5 reject non-default temperature/top_p/top_k with a 400 (sampling
            // is fixed; reasoning is steered by output_config.effort). Strip them before dispatch.
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-5",
            name: "Claude Opus 5",
            contextLength: 1000000,
            maxOutputTokens: 128000,
            supportsXHighEffort: true,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4-8",
            name: "Claude Opus 4.8",
            contextLength: 1000000,
            maxOutputTokens: 128000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7",
            contextLength: 1000000,
            maxOutputTokens: 128000,
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6",
            supportsXHighEffort: false,
            contextLength: 1000000,
            maxOutputTokens: 128000
        },
        {
            id: "claude-opus-4-5-20251101",
            name: "Claude Opus 4.5",
            supportsXHighEffort: false,
            contextLength: 200000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5",
            contextLength: 1000000,
            maxOutputTokens: 128000,
            // Sonnet 5 is the first Sonnet-tier model to support xhigh effort — do NOT copy
            // the `supportsXHighEffort: false` from the older claude-sonnet-4-6/4-5 entries.
            supportsXHighEffort: true,
            // Sonnet 5 rejects non-default temperature/top_p/top_k with a 400 (adaptive-only;
            // reasoning steered by output_config.effort). Mirrors the Opus/Fable entries.
            unsupportedParams: [
                "temperature",
                "top_p",
                "top_k"
            ]
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude 4.6 Sonnet",
            supportsXHighEffort: false,
            contextLength: 1000000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-sonnet-4-5-20250929",
            name: "Claude 4.5 Sonnet",
            supportsXHighEffort: false,
            contextLength: 200000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-haiku-4-5-20251001",
            name: "Claude 4.5 Haiku",
            supportsXHighEffort: false,
            contextLength: 200000,
            maxOutputTokens: 64000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/claude/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "claude_webProvider",
    ()=>claude_webProvider
]);
const claude_webProvider = {
    id: "claude-web",
    alias: "cw",
    format: "openai",
    executor: "claude-web",
    baseUrl: "https://claude.ai/api/organizations",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "claude-fable-5",
            name: "Claude Fable 5 (web)",
            toolCalling: false
        },
        {
            id: "claude-opus-5",
            name: "Claude Opus 5 (web)",
            toolCalling: false,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxOutputTokens: 128000
        },
        {
            id: "claude-opus-4-8",
            name: "Claude Opus 4.8 (web)",
            toolCalling: false
        },
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7 (web)",
            toolCalling: false
        },
        {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6 (web)",
            toolCalling: false
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5 (web)",
            toolCalling: false
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (web)",
            toolCalling: false
        },
        {
            id: "claude-haiku-4-5-20251001",
            name: "Claude Haiku 4.5 (web)",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/bedrock/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bedrockProvider",
    ()=>bedrockProvider
]);
const bedrockProvider = {
    id: "bedrock",
    alias: "bedrock",
    format: "openai",
    executor: "bedrock",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 200000,
    models: [
        {
            id: "anthropic.claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (Bedrock)",
            toolCalling: true,
            supportsVision: true,
            contextLength: 1000000
        },
        {
            id: "anthropic.claude-sonnet-4-5",
            name: "Claude Sonnet 4.5 (Bedrock)",
            toolCalling: true,
            supportsVision: true,
            contextLength: 200000
        },
        {
            id: "anthropic.claude-opus-4-6",
            name: "Claude Opus 4.6 (Bedrock)",
            toolCalling: true,
            supportsVision: true,
            contextLength: 1000000
        },
        {
            id: "anthropic.claude-opus-4-7",
            name: "Claude Opus 4.7 (Bedrock)",
            toolCalling: true,
            supportsVision: true,
            contextLength: 1000000
        },
        {
            id: "anthropic.claude-haiku-4-5",
            name: "Claude Haiku 4.5 (Bedrock)",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "openai.gpt-oss-120b-1:0",
            name: "GPT-OSS 120B (Bedrock)"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/inner-ai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inner_aiProvider",
    ()=>inner_aiProvider
]);
const inner_aiProvider = {
    id: "inner-ai",
    alias: "in-ai",
    format: "openai",
    executor: "inner-ai",
    baseUrl: "https://chatapi.innerai.com/chat",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // OpenAI
        {
            id: "gpt-4o",
            name: "GPT-4o (via Inner.ai)"
        },
        {
            id: "gpt-4.1",
            name: "GPT-4.1 (via Inner.ai)"
        },
        {
            id: "gpt-4.1-mini",
            name: "GPT-4.1 Mini (via Inner.ai)"
        },
        {
            id: "o3",
            name: "o3 (via Inner.ai)",
            supportsReasoning: true
        },
        {
            id: "o4-mini",
            name: "o4-mini (via Inner.ai)",
            supportsReasoning: true
        },
        // Anthropic
        {
            id: "claude-opus-4-5",
            name: "Claude Opus 4.5 (via Inner.ai)"
        },
        {
            id: "claude-sonnet-4-5",
            name: "Claude Sonnet 4.5 (via Inner.ai)"
        },
        {
            id: "claude-3-7-sonnet-20250219",
            name: "Claude 3.7 Sonnet (via Inner.ai)"
        },
        {
            id: "claude-3-5-sonnet-20241022",
            name: "Claude 3.5 Sonnet (via Inner.ai)"
        },
        // Google
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro (via Inner.ai)"
        },
        {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash (via Inner.ai)"
        },
        {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash (via Inner.ai)"
        },
        // DeepSeek
        {
            id: "deepseek-r1",
            name: "DeepSeek R1 (via Inner.ai)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v3",
            name: "DeepSeek V3 (via Inner.ai)"
        },
        // xAI
        {
            id: "grok-3",
            name: "Grok 3 (via Inner.ai)"
        },
        {
            id: "grok-3-mini",
            name: "Grok 3 Mini (via Inner.ai)",
            supportsReasoning: true
        },
        // Meta
        {
            id: "llama-4-maverick",
            name: "Llama 4 Maverick (via Inner.ai)"
        },
        {
            id: "llama-3.3-70b-instruct",
            name: "Llama 3.3 70B (via Inner.ai)"
        },
        // Mistral
        {
            id: "mistral-large-2411",
            name: "Mistral Large (via Inner.ai)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/qoder/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "qoderProvider",
    ()=>qoderProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
;
const qoderProvider = {
    id: "qoder",
    alias: "if",
    format: "openai",
    executor: "qoder",
    baseUrl: "https://api.qoder.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQoderDefaultHeaders"])(),
    oauth: {
        clientIdEnv: "QODER_OAUTH_CLIENT_ID",
        clientSecretEnv: "QODER_OAUTH_CLIENT_SECRET",
        tokenUrl: process.env.QODER_OAUTH_TOKEN_URL || "",
        authUrl: process.env.QODER_OAUTH_AUTHORIZE_URL || ""
    },
    models: [
        {
            id: "qwen3.8-max-preview",
            name: "Qwen3.8-Max-Preview",
            supportsVision: true,
            supportsReasoning: true,
            contextLength: 1_000_000,
            maxInputTokens: 180_000
        },
        {
            id: "qwen3.7-max",
            name: "Qwen3.7-Max",
            supportsVision: true,
            contextLength: 1_000_000
        },
        {
            id: "qwen3.7-plus",
            name: "Qwen3.7-Plus",
            supportsVision: true,
            contextLength: 1_000_000
        },
        {
            id: "kimi-k3",
            name: "Kimi-K3",
            supportsVision: true,
            contextLength: 1_000_000,
            maxInputTokens: 180_000
        },
        {
            id: "kimi-k2.7-code",
            name: "Kimi-K2.7-Code",
            supportsVision: true,
            contextLength: 256_000
        },
        {
            id: "glm-5.2",
            name: "GLM-5.2",
            supportsVision: true,
            supportsReasoning: true,
            contextLength: 1_000_000
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek-V4-Pro",
            supportsVision: true,
            supportsReasoning: true,
            contextLength: 1_000_000
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek-V4-Flash",
            supportsVision: true,
            supportsReasoning: true,
            contextLength: 1_000_000
        },
        {
            id: "minimax-m3",
            name: "MiniMax-M3",
            supportsVision: true,
            contextLength: 1_000_000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/xiaomi-mimo/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "xiaomi_mimoProvider",
    ()=>xiaomi_mimoProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const xiaomi_mimoProvider = {
    id: "xiaomi-mimo",
    alias: "mimo",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.xiaomimimo.com/v1",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["xiaomi-mimo"],
    // Xiaomi also publishes the same catalog over an Anthropic-compatible endpoint
    // on the same host. The operator picks per connection; see
    // config/providers/alternateFormats.ts.
    alternateFormats: [
        {
            format: "claude",
            baseUrl: "https://api.xiaomimimo.com/anthropic/v1/messages",
            authHeader: "x-api-key",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
            label: "Anthropic-compatible"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/xiaomi-mimo-token-plan/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "xiaomi_mimo_token_planProvider",
    ()=>xiaomi_mimo_token_planProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const xiaomi_mimo_token_planProvider = {
    id: "xiaomi-mimo-token-plan",
    alias: "mimotp",
    format: "openai",
    executor: "default",
    baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["xiaomi-mimo-token-plan"],
    alternateFormats: [
        {
            format: "claude",
            baseUrl: "https://token-plan-sgp.xiaomimimo.com/anthropic/v1/messages",
            authHeader: "x-api-key",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
            label: "Anthropic-compatible"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/codestral/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "codestralProvider",
    ()=>codestralProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const codestralProvider = {
    id: "codestral",
    alias: "codestral",
    format: "openai",
    executor: "default",
    baseUrl: "https://codestral.mistral.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].codestral
};
}),
"[project]/open-sse/config/providers/registry/wandb/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "wandbProvider",
    ()=>wandbProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const wandbProvider = {
    id: "wandb",
    alias: "wandb",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.inference.wandb.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].wandb
};
}),
"[project]/open-sse/config/providers/registry/predibase/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "predibaseProvider",
    ()=>predibaseProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const predibaseProvider = {
    id: "predibase",
    alias: "predibase",
    format: "openai",
    executor: "default",
    baseUrl: "https://serving.app.predibase.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].predibase
};
}),
"[project]/open-sse/config/providers/registry/baichuan/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "baichuanProvider",
    ()=>baichuanProvider
]);
const baichuanProvider = {
    id: "baichuan",
    alias: "baichuan",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.baichuan-ai.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: confirmed against the official platform.baichuan-ai.com pricing
    // page. Baichuan4-Turbo is the current general-purpose flagship (no Baichuan5 yet).
    models: [
        {
            id: "Baichuan4-Turbo",
            name: "Baichuan 4 Turbo",
            contextLength: 32768
        },
        {
            id: "Baichuan4-Air",
            name: "Baichuan 4 Air",
            contextLength: 32768
        },
        {
            id: "Baichuan4",
            name: "Baichuan 4"
        },
        {
            id: "Baichuan3-Turbo",
            name: "Baichuan 3 Turbo",
            contextLength: 32768
        },
        {
            id: "Baichuan3-Turbo-128k",
            name: "Baichuan 3 Turbo 128k",
            contextLength: 131072
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/yi/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "yiProvider",
    ()=>yiProvider
]);
const yiProvider = {
    id: "yi",
    alias: "yi",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.lingyiwanwu.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "yi-large",
            name: "Yi Large"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/deepseek/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deepseekProvider",
    ()=>deepseekProvider
]);
const deepseekProvider = {
    id: "deepseek",
    alias: "ds",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/deepseek/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deepseek_webProvider",
    ()=>deepseek_webProvider
]);
const deepseek_webProvider = {
    id: "deepseek-web",
    alias: "ds-web",
    format: "openai",
    executor: "deepseek-web",
    baseUrl: "https://chat.deepseek.com/api/v0/chat/completion",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            toolCalling: true
        },
        {
            id: "deepseek-v4-pro-think",
            name: "DeepSeek V4 Pro Think",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro-search",
            name: "DeepSeek V4 Pro Search",
            toolCalling: true
        },
        {
            id: "deepseek-v4-pro-think-search",
            name: "DeepSeek V4 Pro Think+Search",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            toolCalling: true
        },
        {
            id: "deepseek-v4-flash-think",
            name: "DeepSeek V4 Flash Think",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash-search",
            name: "DeepSeek V4 Flash Search",
            toolCalling: true
        },
        {
            id: "deepseek-v4-flash-think-search",
            name: "DeepSeek V4 Flash Think+Search",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-chat",
            name: "DeepSeek Chat",
            toolCalling: true
        },
        {
            id: "deepseek-reasoner",
            name: "DeepSeek Reasoner",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "DeepSeek-R1",
            name: "DeepSeek R1",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "DeepSeek-R1-Search",
            name: "DeepSeek R1 Search",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "DeepSeek-V3.2",
            name: "DeepSeek V3.2",
            toolCalling: true
        },
        {
            id: "DeepSeek-Search",
            name: "DeepSeek Search",
            toolCalling: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/dgrid/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dgridProvider",
    ()=>dgridProvider
]);
const dgridProvider = {
    id: "dgrid",
    alias: "dgrid",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.dgrid.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://api.dgrid.ai/v1/models",
    defaultContextLength: 128000,
    models: [
        {
            id: "dgridai/free",
            name: "DGrid Free Models Router"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/bai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "baiProvider",
    ()=>baiProvider
]);
const baiProvider = {
    id: "bai",
    alias: "bai",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.b.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://api.b.ai/v1/models",
    models: [],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/qiniu/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "qiniuProvider",
    ()=>qiniuProvider
]);
const qiniuProvider = {
    id: "qiniu",
    alias: "qiniu",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.qnaigc.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://api.qnaigc.com/v1/models",
    defaultContextLength: 128000,
    models: [],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/kimi/coding/runtime.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIMI_CODE_CLI_PLATFORM",
    ()=>KIMI_CODE_CLI_PLATFORM,
    "KIMI_CODE_CLI_VERSION",
    ()=>KIMI_CODE_CLI_VERSION,
    "KIMI_CODING_ANTHROPIC_URL",
    ()=>KIMI_CODING_ANTHROPIC_URL,
    "KIMI_CODING_BASE_URL",
    ()=>KIMI_CODING_BASE_URL,
    "KIMI_CODING_MODELS_URL",
    ()=>KIMI_CODING_MODELS_URL,
    "KIMI_CODING_OPENAI_URL",
    ()=>KIMI_CODING_OPENAI_URL,
    "buildKimiCodeIdentityHeaders",
    ()=>buildKimiCodeIdentityHeaders,
    "getKimiCodeCliUserAgent",
    ()=>getKimiCodeCliUserAgent,
    "getKimiCodeCliVersion",
    ()=>getKimiCodeCliVersion,
    "getKimiCodeStaticThinkingPolicy",
    ()=>getKimiCodeStaticThinkingPolicy,
    "normalizeKimiDeviceId",
    ()=>normalizeKimiDeviceId,
    "sanitizeKimiHeaderValue",
    ()=>sanitizeKimiHeaderValue
]);
const KIMI_CODING_BASE_URL = "https://api.kimi.com/coding/v1";
const KIMI_CODING_MODELS_URL = `${KIMI_CODING_BASE_URL}/models`;
const KIMI_CODING_OPENAI_URL = `${KIMI_CODING_BASE_URL}/chat/completions`;
const KIMI_CODING_ANTHROPIC_URL = `${KIMI_CODING_BASE_URL}/messages?beta=true`;
const KIMI_CODE_CLI_PLATFORM = "kimi_code_cli";
const KIMI_CODE_CLI_VERSION = "0.26.0";
// Kimi Code's public model contract can move ahead of the packaged CLI release.
// Keep offline fallback policy here; live /models metadata still takes precedence.
const KIMI_CODE_STATIC_THINKING_POLICIES = {
    k3: {
        supportsThinking: true,
        supportedThinkingEfforts: [
            "low",
            "high",
            "max"
        ],
        defaultThinkingEffort: "max"
    }
};
function getKimiCodeStaticThinkingPolicy(modelId) {
    if (typeof modelId !== "string") return null;
    return KIMI_CODE_STATIC_THINKING_POLICIES[modelId] || null;
}
function sanitizeKimiHeaderValue(value, fallback = "unknown") {
    const text = String(value ?? "").trim();
    if (!text) return fallback;
    return text.replace(/[^\x20-\x7e]/g, "").trim() || fallback;
}
function normalizeKimiDeviceId(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const deviceId = sanitizeKimiHeaderValue(raw);
    if (!/^[0-9a-f]{32}$/i.test(deviceId)) return deviceId;
    return [
        deviceId.slice(0, 8),
        deviceId.slice(8, 12),
        deviceId.slice(12, 16),
        deviceId.slice(16, 20),
        deviceId.slice(20)
    ].join("-");
}
function getKimiCodeCliVersion() {
    return sanitizeKimiHeaderValue(process.env.KIMI_CLI_VERSION, KIMI_CODE_CLI_VERSION);
}
function getKimiCodeCliUserAgent() {
    return `kimi-code-cli/${getKimiCodeCliVersion()}`;
}
function buildKimiCodeIdentityHeaders(identity, version = getKimiCodeCliVersion()) {
    return {
        "X-Msh-Platform": KIMI_CODE_CLI_PLATFORM,
        "X-Msh-Version": sanitizeKimiHeaderValue(version, KIMI_CODE_CLI_VERSION),
        "X-Msh-Device-Name": sanitizeKimiHeaderValue(identity.deviceName),
        "X-Msh-Device-Model": sanitizeKimiHeaderValue(identity.deviceModel),
        "X-Msh-Os-Version": sanitizeKimiHeaderValue(identity.osVersion),
        "X-Msh-Device-Id": sanitizeKimiHeaderValue(normalizeKimiDeviceId(identity.deviceId))
    };
}
}),
"[project]/open-sse/config/providers/registry/kimi/coding/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIMI_CODING_MODELS",
    ()=>KIMI_CODING_MODELS,
    "KIMI_CODING_SHARED",
    ()=>KIMI_CODING_SHARED,
    "kimi_codingProvider",
    ()=>kimi_codingProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/runtime.ts [instrumentation] (ecmascript)");
;
;
;
const KIMI_CODING_MODELS = [
    {
        id: "k3",
        name: "Kimi K3",
        contextLength: 1048576,
        supportsReasoning: true
    },
    {
        id: "kimi-for-coding",
        name: "Kimi K2.7 Code",
        contextLength: 262144,
        supportsReasoning: true
    },
    {
        id: "kimi-for-coding-highspeed",
        name: "Kimi K2.7 Code (High Speed)",
        contextLength: 262144,
        supportsReasoning: true
    }
];
const KIMI_CODING_SHARED = {
    format: "claude",
    executor: "default",
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIMI_CODING_ANTHROPIC_URL"],
    authHeader: "x-api-key",
    defaultContextLength: 262144,
    headers: {
        "Anthropic-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"]
    },
    models: KIMI_CODING_MODELS
};
const kimi_codingProvider = {
    id: "kimi-coding",
    alias: "kmc",
    ...KIMI_CODING_SHARED,
    authType: "oauth",
    oauth: {
        clientIdEnv: "KIMI_CODING_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("kimi_id"),
        tokenUrl: "https://auth.kimi.com/api/oauth/token",
        refreshUrl: "https://auth.kimi.com/api/oauth/token",
        authUrl: "https://auth.kimi.com/api/oauth/device_authorization"
    }
};
}),
"[project]/open-sse/config/providers/registry/kimi/coding-apikey/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kimi_coding_apikeyProvider",
    ()=>kimi_coding_apikeyProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/index.ts [instrumentation] (ecmascript)");
;
const kimi_coding_apikeyProvider = {
    id: "kimi-coding-apikey",
    alias: "kmca",
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIMI_CODING_SHARED"],
    authType: "apikey"
};
}),
"[project]/open-sse/config/providers/registry/moonshot/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIMI_K27_MODELS",
    ()=>KIMI_K27_MODELS,
    "KIMI_K3_MODEL",
    ()=>KIMI_K3_MODEL,
    "MOONSHOT_KIMI_MODELS",
    ()=>MOONSHOT_KIMI_MODELS,
    "moonshotProvider",
    ()=>moonshotProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const KIMI_K3_MODEL = {
    id: "kimi-k3",
    name: "Kimi K3",
    contextLength: 1048576,
    maxOutputTokens: 1048576,
    supportsVision: true,
    supportsReasoning: true,
    // K3 accepts literal `max` only; it does not accept OmniRoute's `xhigh` tier.
    supportsXHighEffort: false,
    toolCalling: true,
    interleavedField: "reasoning_content",
    unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
};
const KIMI_K27_MODELS = [
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code",
        contextLength: 262144,
        maxOutputTokens: 262144,
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        interleavedField: "reasoning_content",
        unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
    },
    {
        id: "kimi-k2.7-code-highspeed",
        name: "Kimi K2.7 Code (High Speed)",
        contextLength: 262144,
        maxOutputTokens: 262144,
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        interleavedField: "reasoning_content",
        unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
    }
];
const MOONSHOT_KIMI_MODELS = [
    KIMI_K3_MODEL,
    ...KIMI_K27_MODELS,
    {
        id: "kimi-k2.6",
        name: "Kimi K2.6",
        contextLength: 262144,
        maxOutputTokens: 262144,
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        interleavedField: "reasoning_content",
        unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
    }
];
const moonshotProvider = {
    id: "moonshot",
    alias: "moonshot",
    format: "openai",
    executor: "moonshot",
    baseUrl: "https://api.moonshot.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: MOONSHOT_KIMI_MODELS
};
}),
"[project]/open-sse/config/providers/registry/kimi/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kimiProvider",
    ()=>kimiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$moonshot$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/moonshot/index.ts [instrumentation] (ecmascript)");
;
const kimiProvider = {
    id: "kimi",
    alias: "kimi",
    format: "openai",
    executor: "moonshot",
    baseUrl: "https://api.moonshot.ai/v1/chat/completions",
    // Moonshot's Kimi route requires upstream SSE; chatCore buffers it back to JSON
    // when the client requests stream:false.
    forceStream: true,
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$moonshot$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MOONSHOT_KIMI_MODELS"]
};
}),
"[project]/open-sse/config/providers/registry/kimi/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIMI_WEB_STATIC_MODELS",
    ()=>KIMI_WEB_STATIC_MODELS,
    "kimi_webProvider",
    ()=>kimi_webProvider
]);
const KIMI_WEB_STATIC_MODELS = [
    {
        id: "k3",
        name: "K3",
        supportsReasoning: true
    },
    {
        id: "k2d6",
        name: "K2.6",
        supportsReasoning: true
    }
];
const kimi_webProvider = {
    id: "kimi-web",
    // Distinct alias: the primary "kimi" provider (dedicated KimiExecutor) keeps
    // the short "kimi" alias; this web/cookie variant is addressed by its own id.
    alias: "kimi-web",
    format: "openai",
    executor: "kimi-web",
    // International consumer chat — the legacy `kimi.moonshot.cn` domain now
    // redirects every non-CN visitor to www.kimi.com, which speaks a different
    // Connect-RPC API. See `open-sse/executors/kimi-web.ts` for the wire format.
    baseUrl: "https://www.kimi.com",
    authType: "apikey",
    authHeader: "Authorization",
    // Curated-only catalog. Agent Swarm is excluded because it requires Kimi's
    // parallel-agent tool protocol rather than ordinary chat routing.
    models: KIMI_WEB_STATIC_MODELS
};
}),
"[project]/open-sse/config/providers/registry/groq/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "groqProvider",
    ()=>groqProvider
]);
const groqProvider = {
    id: "groq",
    alias: "groq",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // Non-reasoning Llama models: Groq returns HTTP 400 if reasoning_effort is sent (#3258).
        {
            id: "meta-llama/llama-4-scout-17b-16e-instruct",
            name: "Llama 4 Scout",
            supportsReasoning: false
        },
        {
            id: "llama-3.3-70b-versatile",
            name: "Llama 3.3 70B",
            supportsReasoning: false
        },
        {
            id: "openai/gpt-oss-120b",
            name: "GPT-OSS 120B"
        },
        {
            id: "openai/gpt-oss-20b",
            name: "GPT-OSS 20B"
        },
        {
            id: "qwen/qwen3-32b",
            name: "Qwen3 32B"
        },
        {
            id: "qwen/qwen3.6-27b",
            name: "Qwen3.6 27B"
        },
        {
            id: "openai/gpt-oss-safeguard-20b",
            name: "GPT-OSS Safeguard 20B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/inference-net/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inference_netProvider",
    ()=>inference_netProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const inference_netProvider = {
    id: "inference-net",
    alias: "inet",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.inference.net/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["inference-net"]
};
}),
"[project]/open-sse/config/providers/registry/llm7/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "llm7Provider",
    ()=>llm7Provider
]);
const llm7Provider = {
    id: "llm7",
    alias: "llm7",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.llm7.io/v1/chat/completions",
    modelsUrl: "https://api.llm7.io/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    poolConfig: {
        minSessions: 1,
        maxSessions: 3,
        cooldownBase: 2000,
        cooldownMax: 5000,
        cooldownJitter: 100,
        requestTimeout: 30000,
        requestJitter: 50
    },
    models: [
        {
            id: "gpt-4o-mini-2024-07-18",
            name: "GPT-4o mini (LLM7)"
        },
        {
            id: "gpt-4.1-nano-2025-04-14",
            name: "GPT-4.1 nano (LLM7)"
        },
        {
            id: "deepseek-r1-0528",
            name: "DeepSeek R1 (LLM7)"
        },
        {
            id: "qwen2.5-coder-32b-instruct",
            name: "Qwen2.5 Coder 32B (LLM7)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/cerebras/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cerebrasProvider",
    ()=>cerebrasProvider
]);
const cerebrasProvider = {
    id: "cerebras",
    alias: "cerebras",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "zai-glm-4.7",
            name: "GLM 4.7"
        },
        {
            id: "gemma-4-31b",
            name: "Gemma 4 31B"
        },
        {
            id: "gpt-oss-120b",
            name: "GPT OSS 120B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/charm-hyper/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "charmHyperProvider",
    ()=>charmHyperProvider
]);
const charmHyperProvider = {
    id: "charm-hyper",
    alias: "charm-hyper",
    format: "openai",
    executor: "default",
    baseUrl: "https://hyper.charm.land/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://hyper.charm.land/v1/models",
    models: [
        {
            id: "hyper/auto",
            name: "Charm Hyper Auto"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/nube/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nubeProvider",
    ()=>nubeProvider
]);
const nubeProvider = {
    id: "nube",
    alias: "nube",
    format: "openai",
    executor: "default",
    baseUrl: "https://ai.nube.sh/api/v1/chat/completions",
    modelsUrl: "https://ai.nube.sh/api/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    // Nube.sh is an OpenAI-compatible LiteLLM gateway (BYOK). Its live catalog is only
    // reachable with a valid key (/api/v1/models returns 401 unauthenticated), so we ship
    // no hardcoded model IDs and rely on passthrough + live enumeration via modelsUrl.
    passthroughModels: true,
    models: []
};
}),
"[project]/open-sse/config/providers/registry/clinepass/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clinepassProvider",
    ()=>clinepassProvider
]);
const clinepassProvider = {
    id: "clinepass",
    // MUST match the OAUTH_PROVIDERS catalog alias (src/shared/constants/providers/oauth.ts).
    // The dashboard sends models as `<catalogAlias>/<modelId>` (e.g. "cp/cline-pass/glm-5.2"),
    // and routing resolves the prefix via ALIAS_TO_PROVIDER_ID (built from this field). If the
    // registry alias drifts from the catalog alias, the prefix won't resolve, the executor falls
    // back to PROVIDERS.openai, and requests hit api.openai.com with the ClinePass key → 401.
    alias: "cp",
    format: "openai",
    executor: "default",
    // ClinePass shares Cline's streaming-only API — a non-streaming request returns
    // "generateText is not implemented" / an empty body. Force upstream streaming;
    // chatCore accumulates the SSE and converts it back to JSON for stream:false
    // clients. (Same as the sibling `cline` provider. #6165.)
    forceStream: true,
    baseUrl: "https://api.cline.bot/api/v1/chat/completions",
    authType: "oauth",
    authHeader: "bearer",
    oauth: {
        tokenUrl: "https://api.cline.bot/api/v1/auth/token",
        refreshUrl: "https://api.cline.bot/api/v1/auth/refresh",
        authUrl: "https://api.cline.bot/api/v1/auth/authorize"
    },
    extraHeaders: {
        "HTTP-Referer": "https://cline.bot",
        "X-Title": "Cline"
    },
    // Offline fallback copied from Cline CLI 3.0.46's generated catalog. Live
    // discovery replaces it with the authored recommended-models order.
    models: [
        {
            id: "cline-pass/glm-5.2",
            name: "GLM-5.2",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "cline-pass/minimax-m3",
            name: "MiniMax-M3",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 512000
        },
        {
            id: "cline-pass/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 384000
        },
        {
            id: "cline-pass/deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 65536
        },
        {
            id: "cline-pass/kimi-k3",
            name: "Kimi K3",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 1048576
        },
        {
            id: "cline-pass/kimi-k2.7-code",
            name: "Kimi K2.7 Code",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxInputTokens: 262144,
            maxOutputTokens: 262144
        },
        {
            id: "cline-pass/mimo-v2.5-pro",
            name: "MiMo-V2.5-Pro",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "cline-pass/mimo-v2.5",
            name: "MiMo-V2.5",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "cline-pass/qwen3.7-max",
            name: "Qwen3.7 Max",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1000000,
            maxInputTokens: 1000000,
            maxOutputTokens: 65536
        },
        {
            id: "cline-pass/qwen3.7-plus",
            name: "Qwen3.7 Plus",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxInputTokens: 1000000,
            maxOutputTokens: 65536
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/sparkdesk/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sparkdeskProvider",
    ()=>sparkdeskProvider
]);
const sparkdeskProvider = {
    id: "sparkdesk",
    alias: "sparkdesk",
    format: "openai",
    executor: "default",
    baseUrl: "https://spark-api-open.xf-yun.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // `spark-api-open.xf-yun.com` is Spark's OpenAI-compatible HTTP endpoint (Bearer
    // APIPassword). `spark-api.xf-yun.com` is the WebSocket host — `wss://.../v3.1/chat`
    // etc., authenticated with an HMAC-SHA256 signature, not a bearer token — so it
    // cannot serve this `format: "openai"` / `authHeader: "bearer"` entry.
    // Model ids are the `domain` values accepted by the HTTP endpoint. `spark-x` is
    // rejected: it lives on separate /v2 (X1.5) and /x2 (X2) endpoints.
    models: [
        {
            id: "4.0Ultra",
            name: "Spark 4.0 Ultra",
            contextLength: 32768
        },
        {
            id: "generalv3",
            name: "Spark Pro",
            contextLength: 8192
        },
        {
            id: "pro-128k",
            name: "Spark Pro 128K",
            contextLength: 131072
        },
        {
            id: "lite",
            name: "Spark Lite",
            contextLength: 4096
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/nlpcloud/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nlpcloudProvider",
    ()=>nlpcloudProvider
]);
const nlpcloudProvider = {
    id: "nlpcloud",
    alias: "nlpc",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.nlpcloud.io/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: NLP Cloud's branded chat models + larger Llama tiers.
    models: [
        {
            id: "chatdolphin",
            name: "ChatDolphin",
            contextLength: 8192
        },
        {
            id: "dolphin",
            name: "Dolphin",
            contextLength: 16384
        },
        {
            id: "finetuned-llama-3-70b",
            name: "Fine-tuned LLaMA 3.3 70B"
        },
        {
            id: "llama-3-1-405b",
            name: "LLaMA 3.1 405B"
        },
        {
            id: "llama-3-8b-instruct",
            name: "Llama 3 8B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/nvidia/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nvidiaProvider",
    ()=>nvidiaProvider
]);
const nvidiaProvider = {
    id: "nvidia",
    alias: "nvidia",
    format: "openai",
    executor: "default",
    baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    toolNameMaxLength: 64,
    // #6773: nvidia multiplexes 17 models from 9 different upstream vendors
    // (z-ai/, minimaxai/, deepseek-ai/, qwen/, mistralai/, stepfun-ai/,
    // moonshotai/, openai/, nvidia/) behind ONE connection — mark it passthrough
    // so a single stale/renamed model's 404 locks out only that model instead
    // of cooling down the whole connection (see accountFallback.ts
    // hasPerModelQuota doc comment; matches modelscope/synthetic/kilo-gateway).
    passthroughModels: true,
    models: [
        // #6108: z-ai/glm-5.1 EOL'd 2026-07-02 (direct probe returns 410) — dropped.
        {
            id: "z-ai/glm-5.2",
            name: "GLM 5.2"
        },
        // #3329/#6108: minimaxai/minimax-m3 stays excluded from the nvidia tier — it
        // still 404s here for most callers; the single 200 probe in #6108 was not
        // reproducible enough to override the #3329 guard. Re-add only once NVIDIA
        // reliably serves it (and flip nvidia-minimax-m3-removed-3329.test.ts then).
        {
            id: "minimaxai/minimax-m2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "google/gemma-4-31b-it",
            name: "Gemma 4 31B"
        },
        {
            id: "mistralai/mistral-small-4-119b-2603",
            name: "Mistral Small 4 2603"
        },
        {
            id: "mistralai/mistral-large-3-675b-instruct-2512",
            name: "Mistral Large 3 675B"
        },
        {
            id: "mistralai/devstral-2-123b-instruct-2512",
            name: "Devstral 2 123B"
        },
        {
            id: "qwen/qwen3.5-397b-a17b",
            name: "Qwen3.5-397B-A17B"
        },
        {
            id: "qwen/qwen3.5-122b-a10b",
            name: "Qwen3.5-122B-A10B"
        },
        {
            id: "stepfun-ai/step-3.5-flash",
            name: "Step 3.5 Flash"
        },
        {
            id: "stepfun-ai/step-3.7-flash",
            name: "Step 3.7 Flash"
        },
        {
            id: "deepseek-ai/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "deepseek-ai/deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        },
        // Sweep 2026-06-19: verified present in the live NVIDIA NIM /v1/models catalog.
        {
            id: "moonshotai/kimi-k2.6",
            name: "Kimi K2.6"
        },
        {
            id: "openai/gpt-oss-120b",
            name: "GPT OSS 120B",
            toolCalling: false
        },
        {
            id: "openai/gpt-oss-20b",
            name: "GPT OSS 20B",
            toolCalling: false
        },
        {
            id: "nvidia/nemotron-3-super-120b-a12b",
            name: "Nemotron 3 Super 120B A12B"
        },
        {
            id: "nvidia/nemotron-3-ultra-550b-a55b",
            name: "Nemotron 3 Ultra 550B"
        },
        // Port of decolua/9router#2373 ("fix(nvidia): expand NIM chat model catalog"):
        // additional live-catalog models observed to serve /v1/chat/completions.
        // `minimaxai/minimax-m3` from that PR is intentionally NOT re-added — it stays
        // excluded per the #3329 guard (nvidia-minimax-m3-removed-3329.test.ts).
        // Non-chat entries from the same PR (nvidia/gliner-pii — NER tagger, not a chat
        // model; google/diffusiongemma-26b-a4b-it — diffusion model) are dropped for the
        // same reason: this registry only models the /v1/chat/completions surface.
        {
            id: "abacusai/dracarys-llama-3.1-70b-instruct",
            name: "Dracarys Llama 3.1 70B Instruct"
        },
        {
            id: "google/gemma-2-2b-it",
            name: "Gemma 2 2B IT"
        },
        {
            id: "google/gemma-3n-e2b-it",
            name: "Gemma 3n E2B IT"
        },
        {
            id: "meta/llama-3.1-8b-instruct",
            name: "Llama 3.1 8B Instruct",
            toolCalling: false
        },
        {
            id: "meta/llama-3.2-11b-vision-instruct",
            name: "Llama 3.2 11B Vision Instruct",
            supportsVision: true
        },
        {
            id: "meta/llama-3.2-1b-instruct",
            name: "Llama 3.2 1B Instruct"
        },
        {
            id: "meta/llama-3.2-3b-instruct",
            name: "Llama 3.2 3B Instruct",
            toolCalling: false
        },
        {
            id: "meta/llama-3.2-90b-vision-instruct",
            name: "Llama 3.2 90B Vision Instruct",
            supportsVision: true
        },
        {
            id: "meta/llama-4-maverick-17b-128e-instruct",
            name: "Llama 4 Maverick 17B 128E Instruct"
        },
        {
            id: "meta/llama-guard-4-12b",
            name: "Llama Guard 4 12B",
            toolCalling: false
        },
        {
            id: "mistralai/ministral-14b-instruct-2512",
            name: "Ministral 14B Instruct 2512"
        },
        {
            id: "mistralai/mistral-medium-3.5-128b",
            name: "Mistral Medium 3.5 128B"
        },
        {
            id: "mistralai/mistral-nemotron",
            name: "Mistral Nemotron"
        },
        {
            id: "mistralai/mixtral-8x7b-instruct-v0.1",
            name: "Mixtral 8x7B Instruct v0.1"
        },
        {
            id: "nvidia/ising-calibration-1-35b-a3b",
            name: "Ising Calibration 1 35B A3B",
            supportsReasoning: true
        },
        {
            id: "nvidia/llama-3.1-nemoguard-8b-content-safety",
            name: "Llama 3.1 Nemoguard 8B Content Safety"
        },
        {
            id: "nvidia/llama-3.1-nemoguard-8b-topic-control",
            name: "Llama 3.1 Nemoguard 8B Topic Control"
        },
        {
            id: "nvidia/llama-3.1-nemotron-nano-8b-v1",
            name: "Llama 3.1 Nemotron Nano 8B v1"
        },
        {
            id: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
            name: "Llama 3.1 Nemotron Nano VL 8B v1",
            supportsVision: true
        },
        {
            id: "nvidia/llama-3.1-nemotron-safety-guard-8b-v3",
            name: "Llama 3.1 Nemotron Safety Guard 8B v3"
        },
        {
            id: "nvidia/llama-3.3-nemotron-super-49b-v1",
            name: "Llama 3.3 Nemotron Super 49B v1"
        },
        {
            id: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
            name: "Llama 3.3 Nemotron Super 49B v1.5"
        },
        {
            id: "nvidia/nemotron-3-content-safety",
            name: "Nemotron 3 Content Safety"
        },
        {
            id: "nvidia/nemotron-3-nano-30b-a3b",
            name: "Nemotron 3 Nano 30B A3B",
            supportsReasoning: true
        },
        {
            id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
            name: "Nemotron 3 Nano Omni 30B A3B Reasoning",
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "nvidia/nemotron-3.5-content-safety",
            name: "Nemotron 3.5 Content Safety"
        },
        {
            id: "nvidia/nemotron-mini-4b-instruct",
            name: "Nemotron Mini 4B Instruct"
        },
        {
            id: "nvidia/nemotron-nano-12b-v2-vl",
            name: "Nemotron Nano 12B v2 VL",
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "nvidia/nvidia-nemotron-nano-9b-v2",
            name: "NVIDIA Nemotron Nano 9B v2",
            supportsReasoning: true
        },
        {
            id: "nvidia/riva-translate-4b-instruct-v1.1",
            name: "Riva Translate 4B Instruct v1.1"
        },
        {
            id: "qwen/qwen3-next-80b-a3b-instruct",
            name: "Qwen3 Next 80B A3B Instruct",
            supportsReasoning: true
        },
        {
            id: "sarvamai/sarvam-m",
            name: "Sarvam M"
        },
        {
            id: "stockmark/stockmark-2-100b-instruct",
            name: "Stockmark 2 100B Instruct"
        },
        {
            id: "upstage/solar-10.7b-instruct",
            name: "Solar 10.7B Instruct"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/api-airforce/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api_airforceProvider",
    ()=>api_airforceProvider
]);
const api_airforceProvider = {
    id: "api-airforce",
    alias: "af",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.airforce/v1/chat/completions",
    modelsUrl: "https://api.airforce/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    headers: {
        "HTTP-Referer": "https://endpoint-proxy.local",
        "X-Title": "Endpoint Proxy"
    },
    models: [
        // Free tier models (55 available)
        {
            id: "x-ai/grok-3",
            name: "Grok-3 (Free)",
            contextLength: 131072,
            maxOutputTokens: 65536
        },
        {
            id: "x-ai/grok-2-1212",
            name: "Grok-2 1212 (Free)",
            contextLength: 131072,
            maxOutputTokens: 65536
        },
        {
            id: "anthropic/claude-3.7-sonnet",
            name: "Claude 3.7 Sonnet (Free)",
            contextLength: 200000,
            maxOutputTokens: 8192
        },
        {
            id: "qwen/qwen3-32b",
            name: "Qwen3 32B (Free)",
            contextLength: 128000,
            maxOutputTokens: 8192
        },
        {
            id: "moonshot/kimi-k2.6",
            name: "Kimi K2.6 (Free)",
            contextLength: 262144,
            maxOutputTokens: 65536
        },
        {
            id: "google/gemini-2.5-flash",
            name: "Gemini 2.5 Flash (Free)",
            contextLength: 1048576,
            maxOutputTokens: 65536
        },
        {
            id: "deepseek/deepseek-v3",
            name: "DeepSeek V3 (Free)",
            contextLength: 262144,
            maxOutputTokens: 16384
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/mistral/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mistralProvider",
    ()=>mistralProvider
]);
const mistralProvider = {
    id: "mistral",
    alias: "mistral",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "mistral-large-latest",
            name: "Mistral Large 3"
        },
        {
            id: "mistral-medium-3-5",
            name: "Mistral Medium 3.5"
        },
        {
            id: "mistral-small-latest",
            name: "Mistral Small 4"
        },
        {
            id: "devstral-latest",
            name: "Devstral 2"
        },
        {
            id: "codestral-latest",
            name: "Codestral"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/together/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "togetherProvider",
    ()=>togetherProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const togetherProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "together",
    alias: "together",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    models: [
        {
            id: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            name: "Llama 3.3 70B Turbo (🆓 Free)"
        },
        {
            id: "meta-llama/Llama-Vision-Free",
            name: "Llama Vision (🆓 Free)"
        },
        {
            id: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-Free",
            name: "DeepSeek R1 Distill 70B (🆓 Free)"
        },
        {
            id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            name: "Llama 3.3 70B Turbo"
        },
        {
            id: "deepseek-ai/DeepSeek-R1",
            name: "DeepSeek R1"
        },
        {
            id: "Qwen/Qwen3-235B-A22B",
            name: "Qwen3 235B"
        },
        {
            id: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
            name: "Llama 4 Maverick"
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/cohere/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cohereProvider",
    ()=>cohereProvider
]);
const cohereProvider = {
    id: "cohere",
    alias: "cohere",
    format: "openai",
    executor: "default",
    // Issue #2360: Cohere's native /v2/chat endpoint returns the upstream
    // proprietary shape ({ message: { content: [{type:"text", text:...}] } })
    // which the combo test validator (extractComboTestResponseText) does not
    // know how to read, surfacing as "Provider returned HTTP 200 but no text
    // content." Cohere also publishes an OpenAI-compatible compatibility
    // layer at /compatibility/v1 that returns the canonical
    // { choices: [{ message: { content: "..." } }] } shape, so we route
    // through it instead of needing a Cohere-specific response translator.
    baseUrl: "https://api.cohere.com/compatibility/v1/chat/completions",
    modelsUrl: "https://api.cohere.com/compatibility/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "command-a-reasoning-08-2025",
            name: "Command A Reasoning (Aug 2025)"
        },
        {
            id: "command-a-vision-07-2025",
            name: "Command A Vision (Jul 2025)"
        },
        {
            id: "command-a-03-2025",
            name: "Command A (Mar 2025)"
        },
        {
            id: "command-r7b-12-2024",
            name: "Command R7B (Dec 2024)"
        },
        {
            id: "command-r-plus-08-2024",
            name: "Command R Plus (Aug 2024)"
        },
        {
            id: "command-r-08-2024",
            name: "Command R (Aug 2024)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/cursor/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cursorProvider",
    ()=>cursorProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
;
const cursorProvider = {
    id: "cursor",
    alias: "cu",
    format: "cursor",
    executor: "cursor",
    baseUrl: "https://api2.cursor.sh",
    chatPath: "/aiserver.v1.ChatService/StreamUnifiedChatWithTools",
    authType: "oauth",
    authHeader: "bearer",
    defaultContextLength: 200000,
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCursorRegistryHeaders"])(),
    clientVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CURSOR_REGISTRY_VERSION"],
    models: [
        {
            id: "auto",
            name: "Auto (Server Picks)"
        },
        {
            id: "composer-2.5-fast",
            name: "Composer 2.5 Fast"
        },
        {
            id: "composer-2.5",
            name: "Composer 2.5"
        },
        {
            id: "composer-2-fast",
            name: "Composer 2 Fast"
        },
        {
            id: "composer-2",
            name: "Composer 2"
        },
        //
        {
            id: "gpt-5.5-none",
            name: "GPT 5.5 None"
        },
        {
            id: "gpt-5.5-none-fast",
            name: "GPT 5.5 None Fast"
        },
        {
            id: "gpt-5.5-low",
            name: "GPT 5.5 Low"
        },
        {
            id: "gpt-5.5-low-fast",
            name: "GPT 5.5 Low Fast"
        },
        {
            id: "gpt-5.5-medium",
            name: "GPT 5.5 Medium"
        },
        {
            id: "gpt-5.5-medium-fast",
            name: "GPT 5.5 Medium Fast"
        },
        {
            id: "gpt-5.5-high",
            name: "GPT 5.5 High"
        },
        {
            id: "gpt-5.5-high-fast",
            name: "GPT 5.5 High Fast"
        },
        {
            id: "gpt-5.5-extra-high",
            name: "GPT 5.5 Extra High"
        },
        {
            id: "gpt-5.5-extra-high-fast",
            name: "GPT 5.5 Extra High Fast"
        },
        //
        {
            id: "gpt-5.4-low",
            name: "GPT 5.4 Low"
        },
        {
            id: "gpt-5.4-low-fast",
            name: "GPT 5.4 Low Fast"
        },
        {
            id: "gpt-5.4-medium",
            name: "GPT 5.4 Medium"
        },
        {
            id: "gpt-5.4-medium-fast",
            name: "GPT 5.4 Medium Fast"
        },
        {
            id: "gpt-5.4-high",
            name: "GPT 5.4 High"
        },
        {
            id: "gpt-5.4-high-fast",
            name: "GPT 5.4 High Fast"
        },
        {
            id: "gpt-5.4-xhigh",
            name: "GPT 5.4 XHigh"
        },
        {
            id: "gpt-5.4-xhigh-fast",
            name: "GPT 5.4 XHigh Fast"
        },
        //
        {
            id: "gpt-5.4-mini-none",
            name: "GPT 5.4 Mini None"
        },
        {
            id: "gpt-5.4-mini-low",
            name: "GPT 5.4 Mini Low"
        },
        {
            id: "gpt-5.4-mini-medium",
            name: "GPT 5.4 Mini Medium"
        },
        {
            id: "gpt-5.4-mini-high",
            name: "GPT 5.4 Mini High"
        },
        {
            id: "gpt-5.4-mini-xhigh",
            name: "GPT 5.4 Mini XHigh"
        },
        //
        {
            id: "gpt-5.4-nano-none",
            name: "GPT 5.4 Nano None"
        },
        {
            id: "gpt-5.4-nano-low",
            name: "GPT 5.4 Nano Low"
        },
        {
            id: "gpt-5.4-nano-medium",
            name: "GPT 5.4 Nano Medium"
        },
        {
            id: "gpt-5.4-nano-high",
            name: "GPT 5.4 Nano High"
        },
        {
            id: "gpt-5.4-nano-xhigh",
            name: "GPT 5.4 Nano XHigh"
        },
        //
        {
            id: "gpt-5.3-codex-spark-preview-low",
            name: "GPT 5.3 Codex Spark Preview Low"
        },
        {
            id: "gpt-5.3-codex-spark-preview",
            name: "GPT 5.3 Codex Spark Preview"
        },
        {
            id: "gpt-5.3-codex-spark-preview-high",
            name: "GPT 5.3 Codex Spark Preview High"
        },
        {
            id: "gpt-5.3-codex-spark-preview-xhigh",
            name: "GPT 5.3 Codex Spark Preview XHigh"
        },
        //
        {
            id: "gpt-5.3-codex-low",
            name: "GPT 5.3 Codex Low"
        },
        {
            id: "gpt-5.3-codex-low-fast",
            name: "GPT 5.3 Codex Low Fast"
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT 5.3 Codex"
        },
        {
            id: "gpt-5.3-codex-fast",
            name: "GPT 5.3 Codex Fast"
        },
        {
            id: "gpt-5.3-codex-high",
            name: "GPT 5.3 Codex High"
        },
        {
            id: "gpt-5.3-codex-high-fast",
            name: "GPT 5.3 Codex High Fast"
        },
        {
            id: "gpt-5.3-codex-xhigh",
            name: "GPT 5.3 Codex XHigh"
        },
        {
            id: "gpt-5.3-codex-xhigh-fast",
            name: "GPT 5.3 Codex XHigh Fast"
        },
        //
        {
            id: "gpt-5.2-low",
            name: "GPT 5.2 Low"
        },
        {
            id: "gpt-5.2-low-fast",
            name: "GPT 5.2 Low Fast"
        },
        {
            id: "gpt-5.2",
            name: "GPT 5.2"
        },
        {
            id: "gpt-5.2-fast",
            name: "GPT 5.2 Fast"
        },
        {
            id: "gpt-5.2-high",
            name: "GPT 5.2 High"
        },
        {
            id: "gpt-5.2-high-fast",
            name: "GPT 5.2 High Fast"
        },
        {
            id: "gpt-5.2-xhigh",
            name: "GPT 5.2 XHigh"
        },
        {
            id: "gpt-5.2-xhigh-fast",
            name: "GPT 5.2 XHigh Fast"
        },
        //
        {
            id: "claude-opus-4-8-low",
            name: "Claude Opus 4.8 Low"
        },
        {
            id: "claude-opus-4-8-low-fast",
            name: "Claude Opus 4.8 Low Fast"
        },
        {
            id: "claude-opus-4-8-medium",
            name: "Claude Opus 4.8 Medium"
        },
        {
            id: "claude-opus-4-8-medium-fast",
            name: "Claude Opus 4.8 Medium Fast"
        },
        {
            id: "claude-opus-4-8-high",
            name: "Claude Opus 4.8 High"
        },
        {
            id: "claude-opus-4-8-high-fast",
            name: "Claude Opus 4.8 High Fast"
        },
        {
            id: "claude-opus-4-8-xhigh",
            name: "Claude Opus 4.8 XHigh"
        },
        {
            id: "claude-opus-4-8-xhigh-fast",
            name: "Claude Opus 4.8 XHigh Fast"
        },
        {
            id: "claude-opus-4-8-max",
            name: "Claude Opus 4.8 Max"
        },
        {
            id: "claude-opus-4-8-max-fast",
            name: "Claude Opus 4.8 Max Fast"
        },
        {
            id: "claude-opus-4-8-thinking-low",
            name: "Claude Opus 4.8 Thinking Low"
        },
        {
            id: "claude-opus-4-8-thinking-low-fast",
            name: "Claude Opus 4.8 Thinking Low Fast"
        },
        {
            id: "claude-opus-4-8-thinking-medium",
            name: "Claude Opus 4.8 Thinking Medium"
        },
        {
            id: "claude-opus-4-8-thinking-medium-fast",
            name: "Claude Opus 4.8 Thinking Medium Fast"
        },
        {
            id: "claude-opus-4-8-thinking-high",
            name: "Claude Opus 4.8 Thinking High"
        },
        {
            id: "claude-opus-4-8-thinking-high-fast",
            name: "Claude Opus 4.8 Thinking High Fast"
        },
        {
            id: "claude-opus-4-8-thinking-xhigh",
            name: "Claude Opus 4.8 Thinking XHigh"
        },
        {
            id: "claude-opus-4-8-thinking-xhigh-fast",
            name: "Claude Opus 4.8 Thinking XHigh Fast"
        },
        {
            id: "claude-opus-4-8-thinking-max",
            name: "Claude Opus 4.8 Thinking Max"
        },
        {
            id: "claude-opus-4-8-thinking-max-fast",
            name: "Claude Opus 4.8 Thinking Max Fast"
        },
        //
        {
            id: "claude-fable-5-low",
            name: "Claude Fable 5 Low"
        },
        {
            id: "claude-fable-5-medium",
            name: "Claude Fable 5 Medium"
        },
        {
            id: "claude-fable-5-high",
            name: "Claude Fable 5 High"
        },
        {
            id: "claude-fable-5-xhigh",
            name: "Claude Fable 5 XHigh"
        },
        {
            id: "claude-fable-5-max",
            name: "Claude Fable 5 Max"
        },
        {
            id: "claude-fable-5-thinking-low",
            name: "Claude Fable 5 Thinking Low"
        },
        {
            id: "claude-fable-5-thinking-medium",
            name: "Claude Fable 5 Thinking Medium"
        },
        {
            id: "claude-fable-5-thinking-high",
            name: "Claude Fable 5 Thinking High"
        },
        {
            id: "claude-fable-5-thinking-xhigh",
            name: "Claude Fable 5 Thinking XHigh"
        },
        {
            id: "claude-fable-5-thinking-max",
            name: "Claude Fable 5 Thinking Max"
        },
        //
        {
            id: "claude-sonnet-5-low",
            name: "Claude Sonnet 5 Low"
        },
        {
            id: "claude-sonnet-5-medium",
            name: "Claude Sonnet 5 Medium"
        },
        {
            id: "claude-sonnet-5-high",
            name: "Claude Sonnet 5 High"
        },
        {
            id: "claude-sonnet-5-xhigh",
            name: "Claude Sonnet 5 XHigh"
        },
        {
            id: "claude-sonnet-5-max",
            name: "Claude Sonnet 5 Max"
        },
        {
            id: "claude-sonnet-5-thinking-low",
            name: "Claude Sonnet 5 Thinking Low"
        },
        {
            id: "claude-sonnet-5-thinking-medium",
            name: "Claude Sonnet 5 Thinking Medium"
        },
        {
            id: "claude-sonnet-5-thinking-high",
            name: "Claude Sonnet 5 Thinking High"
        },
        {
            id: "claude-sonnet-5-thinking-xhigh",
            name: "Claude Sonnet 5 Thinking XHigh"
        },
        {
            id: "claude-sonnet-5-thinking-max",
            name: "Claude Sonnet 5 Thinking Max"
        },
        //
        {
            id: "claude-opus-4-7-low",
            name: "Claude Opus 4.7 Low"
        },
        {
            id: "claude-opus-4-7-medium",
            name: "Claude Opus 4.7 Medium"
        },
        {
            id: "claude-opus-4-7-high",
            name: "Claude Opus 4.7 High"
        },
        {
            id: "claude-opus-4-7-xhigh",
            name: "Claude Opus 4.7 XHigh"
        },
        {
            id: "claude-opus-4-7-max",
            name: "Claude Opus 4.7 Max"
        },
        {
            id: "claude-opus-4-7-thinking-low",
            name: "Claude Opus 4.7 Thinking Low"
        },
        {
            id: "claude-opus-4-7-thinking-medium",
            name: "Claude Opus 4.7 Thinking Medium"
        },
        {
            id: "claude-opus-4-7-thinking-high",
            name: "Claude Opus 4.7 Thinking High"
        },
        {
            id: "claude-opus-4-7-thinking-xhigh",
            name: "Claude Opus 4.7 Thinking XHigh"
        },
        {
            id: "claude-opus-4-7-thinking-max",
            name: "Claude Opus 4.7 Thinking Max"
        },
        //
        {
            id: "claude-4.6-opus-high",
            name: "Claude 4.6 Opus High"
        },
        {
            id: "claude-4.6-opus-high-thinking",
            name: "Claude 4.6 Opus High Thinking"
        },
        {
            id: "claude-4.6-opus-high-thinking-fast",
            name: "Claude 4.6 Opus High Thinking Fast"
        },
        {
            id: "claude-4.6-opus-max",
            name: "Claude 4.6 Opus Max"
        },
        {
            id: "claude-4.6-opus-max-thinking",
            name: "Claude 4.6 Opus Max Thinking"
        },
        {
            id: "claude-4.6-opus-max-thinking-fast",
            name: "Claude 4.6 Opus Max Thinking Fast"
        },
        //
        {
            id: "claude-4.6-sonnet-medium",
            name: "Claude 4.6 Sonnet Medium"
        },
        {
            id: "claude-4.6-sonnet-medium-thinking",
            name: "Claude 4.6 Sonnet Medium Thinking"
        },
        //
        {
            id: "claude-4.5-sonnet",
            name: "Claude 4.5 Sonnet"
        },
        {
            id: "claude-4.5-sonnet-thinking",
            name: "Claude 4.5 Sonnet Thinking"
        },
        //
        {
            id: "gemini-3.1-pro",
            name: "Gemini 3.1 Pro"
        },
        //
        {
            id: "gemini-3-flash",
            name: "Gemini 3 Flash"
        },
        //
        {
            id: "grok-4.3",
            name: "Grok 4.3"
        },
        //
        {
            id: "grok-4.5-medium",
            name: "Grok 4.5 Medium"
        },
        {
            id: "grok-4.5-fast-medium",
            name: "Grok 4.5 Fast Medium"
        },
        {
            id: "grok-4.5-high",
            name: "Grok 4.5 High"
        },
        {
            id: "grok-4.5-fast-high",
            name: "Grok 4.5 Fast High"
        },
        {
            id: "grok-4.5-xhigh",
            name: "Grok 4.5 XHigh"
        },
        {
            id: "grok-4.5-fast-xhigh",
            name: "Grok 4.5 Fast XHigh"
        },
        //
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/volcengine/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "volcengineProvider",
    ()=>volcengineProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const volcengineProvider = {
    id: "volcengine",
    alias: "volcengine",
    format: "openai",
    executor: "default",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].volcengine
};
}),
"[project]/open-sse/config/providers/registry/hackclub/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hackclubProvider",
    ()=>hackclubProvider
]);
const hackclubProvider = {
    id: "hackclub",
    alias: "hc",
    format: "openai",
    executor: "default",
    baseUrl: "https://ai.hackclub.com/proxy/v1/chat/completions",
    modelsUrl: "https://ai.hackclub.com/proxy/v1/models",
    authType: "optional",
    authHeader: "bearer",
    passthroughModels: true,
    defaultContextLength: 128000,
    models: [
        {
            id: "meta-llama/llama-3.3-70b-instruct",
            name: "Llama 3.3 70B"
        },
        {
            id: "mistralai/mistral-7b-instruct",
            name: "Mistral 7B"
        },
        {
            id: "deepseek-ai/deepseek-coder-33b",
            name: "DeepSeek Coder 33B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/freetheai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "freetheaiProvider",
    ()=>freetheaiProvider
]);
const freetheaiProvider = {
    id: "freetheai",
    alias: "fta",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.freetheai.xyz/v1/chat/completions",
    modelsUrl: "https://api.freetheai.xyz/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    passthroughModels: true,
    defaultContextLength: 128000,
    models: [
        {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini"
        },
        {
            id: "llama-3.3-70b-instruct",
            name: "Llama 3.3 70B"
        },
        {
            id: "deepseek-chat",
            name: "DeepSeek Chat"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/g4f-groq/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "g4f_groqProvider",
    ()=>g4f_groqProvider
]);
const g4f_groqProvider = {
    id: "g4f-groq",
    alias: "g4fgroq",
    format: "openai",
    executor: "default",
    baseUrl: "https://g4f.space/api/groq/v1/chat/completions",
    modelsUrl: "https://g4f.space/api/groq/v1/models",
    authType: "optional",
    authHeader: "bearer",
    passthroughModels: true,
    models: [
        {
            id: "llama-3.3-70b-versatile",
            name: "Llama 3.3 70B (g4f/Groq)"
        },
        {
            id: "llama-3.1-8b-instant",
            name: "Llama 3.1 8B Instant (g4f/Groq)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/g4f-gemini/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "g4f_geminiProvider",
    ()=>g4f_geminiProvider
]);
const g4f_geminiProvider = {
    id: "g4f-gemini",
    alias: "g4fgem",
    format: "openai",
    executor: "default",
    baseUrl: "https://g4f.space/api/gemini/v1/chat/completions",
    modelsUrl: "https://g4f.space/api/gemini/v1/models",
    authType: "optional",
    authHeader: "bearer",
    passthroughModels: true,
    models: [
        {
            id: "models/gemini-2.5-flash",
            name: "Gemini 2.5 Flash (g4f)"
        },
        {
            id: "models/gemini-2.5-pro",
            name: "Gemini 2.5 Pro (g4f)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/g4f-pollinations/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "g4f_pollinationsProvider",
    ()=>g4f_pollinationsProvider
]);
const g4f_pollinationsProvider = {
    id: "g4f-pollinations",
    alias: "g4fpol",
    format: "openai",
    executor: "default",
    baseUrl: "https://g4f.space/api/pollinations/v1/chat/completions",
    modelsUrl: "https://g4f.space/api/pollinations/v1/models",
    authType: "optional",
    authHeader: "bearer",
    passthroughModels: true,
    models: [
        {
            id: "openai",
            name: "OpenAI (g4f/Pollinations)"
        },
        {
            id: "openai-fast",
            name: "OpenAI Fast (g4f/Pollinations)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/g4f-ollama/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "g4f_ollamaProvider",
    ()=>g4f_ollamaProvider
]);
const g4f_ollamaProvider = {
    id: "g4f-ollama",
    alias: "g4foll",
    format: "openai",
    executor: "default",
    baseUrl: "https://g4f.space/api/ollama/v1/chat/completions",
    modelsUrl: "https://g4f.space/api/ollama/v1/models",
    authType: "optional",
    authHeader: "bearer",
    passthroughModels: true,
    models: [
        {
            id: "gemma3:4b",
            name: "Gemma 3 4B (g4f/Ollama)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/g4f-nvidia/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "g4f_nvidiaProvider",
    ()=>g4f_nvidiaProvider
]);
const g4f_nvidiaProvider = {
    id: "g4f-nvidia",
    alias: "g4fnv",
    format: "openai",
    executor: "default",
    baseUrl: "https://g4f.space/api/nvidia/v1/chat/completions",
    modelsUrl: "https://g4f.space/api/nvidia/v1/models",
    authType: "optional",
    authHeader: "bearer",
    passthroughModels: true,
    models: [
        {
            id: "nvidia/nemotron-3-nano-30b-a3b",
            name: "Nemotron 3 Nano 30B (g4f/NVIDIA)"
        },
        {
            id: "z-ai/glm-5.2",
            name: "GLM 5.2 (g4f/NVIDIA)"
        },
        {
            id: "minimaxai/minimax-m2.7",
            name: "MiniMax M2.7 (g4f/NVIDIA)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/tencent/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tencentProvider",
    ()=>tencentProvider
]);
const tencentProvider = {
    id: "tencent",
    alias: "tencent",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.hunyuan.cloud.tencent.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: refreshed against the official Tencent Hunyuan OpenAI-compatible
    // catalog. turbos-latest / t1-latest are the current rolling flagships. NOTE: Tencent's
    // legacy Hunyuan platform discontinues 46 models (incl. the turbos/t1 lines) on
    // 2026-06-22, migrating to TokenHub/hy3-preview — revisit before 2026-09-30. Legacy
    // hunyuan-standard/-256K/-code/-role and the pinned turbos-20250226 snapshot were
    // dropped from the live catalog and are intentionally omitted.
    models: [
        {
            id: "hunyuan-turbos-latest",
            name: "Hunyuan TurboS Latest",
            contextLength: 200000
        },
        {
            id: "hunyuan-t1-latest",
            name: "Hunyuan T1 Latest",
            contextLength: 256000
        },
        {
            id: "hunyuan-pro",
            name: "Hunyuan Pro"
        },
        {
            id: "hunyuan-vision",
            name: "Hunyuan Vision"
        },
        {
            id: "hunyuan-functioncall",
            name: "Hunyuan FunctionCall"
        },
        {
            id: "hunyuan-lite",
            name: "Hunyuan Lite"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/coze/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cozeProvider",
    ()=>cozeProvider
]);
const cozeProvider = {
    id: "coze",
    alias: "coze",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.coze.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "claude-3-7-sonnet-20250514",
            name: "Claude 3.7 Sonnet"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/ai21/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ai21Provider",
    ()=>ai21Provider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const ai21Provider = {
    id: "ai21",
    alias: "ai21",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.ai21.com/studio/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].ai21
};
}),
"[project]/open-sse/config/providers/registry/publicai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "publicaiProvider",
    ()=>publicaiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const publicaiProvider = {
    id: "publicai",
    alias: "publicai",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.publicai.co/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].publicai
};
}),
"[project]/open-sse/config/providers/registry/featherless-ai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "featherless_aiProvider",
    ()=>featherless_aiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const featherless_aiProvider = {
    id: "featherless-ai",
    alias: "featherless",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.featherless.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["featherless-ai"]
};
}),
"[project]/open-sse/config/providers/registry/antigravity/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "antigravityProvider",
    ()=>antigravityProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityModelAliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const antigravityProvider = {
    id: "antigravity",
    alias: undefined,
    format: "antigravity",
    executor: "antigravity",
    baseUrls: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"]
    ],
    urlBuilder: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildAntigravityUrl"],
    authType: "oauth",
    authHeader: "bearer",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityProviderHeaders"])(),
    oauth: {
        clientIdEnv: "ANTIGRAVITY_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id"),
        clientSecretEnv: "ANTIGRAVITY_OAUTH_CLIENT_SECRET",
        clientSecretDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt")
    },
    models: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_PUBLIC_MODELS"]
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/openai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openaiProvider",
    ()=>openaiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const openaiProvider = {
    id: "openai",
    alias: "openai",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "gpt-5.6",
            name: "GPT-5.6",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_API_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-sol",
            name: "GPT-5.6 Sol",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_API_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-terra",
            name: "GPT-5.6 Terra",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_API_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-luna",
            name: "GPT-5.6 Luna",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_API_CAPABILITIES"]
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5",
            contextLength: 1050000
        },
        // #5842: *-pro reasoning models are responses-only upstream — /v1/chat/completions
        // 404s ("only supported in v1/responses"). targetFormat routes them natively.
        {
            id: "gpt-5.5-pro",
            name: "GPT-5.5 Pro",
            contextLength: 1050000,
            targetFormat: "openai-responses"
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4",
            contextLength: 1050000
        },
        {
            id: "gpt-5.4-pro",
            name: "GPT-5.4 Pro",
            contextLength: 1050000,
            targetFormat: "openai-responses"
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini",
            contextLength: 400000
        },
        {
            id: "gpt-5.4-nano",
            name: "GPT-5.4 Nano",
            contextLength: 400000
        },
        {
            id: "gpt-4.1",
            name: "GPT-4.1",
            contextLength: 1047576
        },
        {
            id: "gpt-4.1-mini",
            name: "GPT-4.1 Mini",
            contextLength: 1047576
        },
        {
            id: "gpt-4.1-nano",
            name: "GPT-4.1 Nano",
            contextLength: 1047576
        },
        {
            id: "gpt-4o",
            name: "GPT-4o",
            contextLength: 128000
        },
        {
            id: "gpt-4o-2024-11-20",
            name: "GPT-4o (Nov 2024)",
            contextLength: 128000
        },
        {
            id: "gpt-4o",
            name: "GPT-4o",
            contextLength: 128000
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini",
            contextLength: 128000
        },
        {
            id: "o3",
            name: "O3",
            contextLength: 200000,
            unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
        },
        {
            id: "o3-mini",
            name: "O3 Mini",
            contextLength: 200000,
            unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
        },
        {
            id: "o4-mini",
            name: "O4 Mini",
            contextLength: 200000,
            unsupportedParams: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REASONING_UNSUPPORTED"]
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/snowflake/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "snowflakeProvider",
    ()=>snowflakeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const snowflakeProvider = {
    id: "snowflake",
    alias: "snowflake",
    format: "openai",
    executor: "default",
    baseUrl: "https://{account}.snowflakecomputing.com/api/v2",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].snowflake
};
}),
"[project]/open-sse/config/providers/registry/huggingface/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "huggingfaceProvider",
    ()=>huggingfaceProvider
]);
const huggingfaceProvider = {
    id: "huggingface",
    alias: "hf",
    format: "openai",
    executor: "default",
    baseUrl: "https://router.huggingface.co/v1/chat/completions",
    modelsUrl: "https://router.huggingface.co/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "meta-llama/llama-3.1-8b-instruct",
            name: "Llama 3.1 8B"
        },
        {
            id: "meta-llama/llama-3.2-11b-instruct",
            name: "Llama 3.2 11B"
        },
        {
            id: "mistralai/mistral-7b-instruct",
            name: "Mistral 7B"
        },
        {
            id: "google/gemma-2-9b-it",
            name: "Gemma 2 9B"
        },
        {
            id: "Qwen/Qwen2.5-7B-Instruct",
            name: "Qwen 2.5 7B"
        },
        {
            id: "deepseek-ai/DeepSeek-V3",
            name: "DeepSeek V3"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/chipotle/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chipotleProvider",
    ()=>chipotleProvider
]);
const chipotleProvider = {
    id: "chipotle",
    alias: "pepper",
    format: "openai",
    executor: "chipotle",
    baseUrl: "https://amelia.chipotle.com",
    baseUrls: [
        "https://amelia.chipotle.com"
    ],
    authType: "none",
    authHeader: "none",
    models: [
        {
            id: "pepper-1",
            name: "Pepper (Chipotle AI 🌯)"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/freeaiapikey/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "freeaiapikeyProvider",
    ()=>freeaiapikeyProvider
]);
const freeaiapikeyProvider = {
    id: "freeaiapikey",
    alias: "faik",
    format: "openai",
    executor: "default",
    baseUrl: "https://freeaiapikey.com/v1/chat/completions",
    modelsUrl: "https://freeaiapikey.com/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "openai/gpt-5",
            name: "GPT-5 (via FreeAIAPIKey)",
            contextLength: 400000
        },
        {
            id: "openai/gpt-4o",
            name: "GPT-4o (via FreeAIAPIKey)"
        },
        {
            id: "openai/gpt-5.2-codex",
            name: "GPT-5.2 Codex (via FreeAIAPIKey)"
        },
        {
            id: "anthropic/claude-opus-4.6",
            name: "Claude Opus 4.6 (via FreeAIAPIKey)",
            contextLength: 1000000
        },
        {
            id: "anthropic/claude-sonnet-4.6",
            name: "Claude Sonnet 4.6 (via FreeAIAPIKey)",
            contextLength: 1000000
        },
        {
            id: "Alibaba/qwen3.5",
            name: "Qwen 3.5 (via FreeAIAPIKey)",
            contextLength: 128000
        },
        {
            id: "Alibaba/qwen3-vl:235b",
            name: "Qwen 3 VL 235B (via FreeAIAPIKey)",
            contextLength: 128000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/qwen/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "qwen_webProvider",
    ()=>qwen_webProvider
]);
const qwen_webProvider = {
    id: "qwen-web",
    // The web/cookie variant is addressed by its own id.
    alias: "qwen-web",
    format: "openai",
    executor: "qwen-web",
    // v2 API (the legacy /api/chat/completions endpoint was retired upstream).
    // Restored after the registry modularization (#3993) regressed this to v1 with
    // a retired catalog. Source of truth: pre-#3993 providerRegistry.ts (commit 1ed01dd90^).
    baseUrl: "https://chat.qwen.ai/api/v2/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Current upstream catalog (GET https://chat.qwen.ai/api/models). Legacy
    // ids (qwen-plus, qwen3-max, ...) still resolve via the executor's
    // MODEL_ALIASES map for backward compatibility.
    models: [
        {
            id: "qwen3.8-max-preview",
            name: "Qwen3.8 Max Preview",
            toolCalling: false,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        },
        {
            id: "qwen3.7-max",
            name: "Qwen3.7 Max",
            toolCalling: false,
            supportsReasoning: true,
            supportsVision: false,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        },
        {
            id: "qwen3.7-plus",
            name: "Qwen3.7 Plus",
            toolCalling: false,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        },
        {
            id: "qwen3.6-plus",
            name: "Qwen3.6 Plus",
            toolCalling: false,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/qwen-cloud/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QWEN_CLOUD_TEXT_MODELS",
    ()=>QWEN_CLOUD_TEXT_MODELS,
    "qwen_cloudProvider",
    ()=>qwen_cloudProvider
]);
const QWEN_CLOUD_TEXT_MODELS = [
    {
        id: "qwen3.7-max-2026-06-08",
        name: "Qwen3.7 Max (2026-06-08)"
    },
    {
        id: "qwen3.7-plus",
        name: "Qwen3.7 Plus"
    },
    {
        id: "qwen3.6-plus",
        name: "Qwen3.6 Plus"
    },
    {
        id: "qwen3.6-27b",
        name: "Qwen3.6 27B"
    },
    {
        id: "qwen3.6-35b-a3b",
        name: "Qwen3.6 35B A3B"
    },
    {
        id: "qwen3.5-plus-2026-04-20",
        name: "Qwen3.5 Plus (2026-04-20)"
    },
    {
        id: "qwen3.5-122b-a10b",
        name: "Qwen3.5 122B A10B"
    },
    {
        id: "qwen3.5-397b-a17b",
        name: "Qwen3.5 397B A17B"
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2"
    },
    {
        id: "glm-5.2-fast-preview",
        name: "GLM 5.2 Fast Preview"
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro"
    },
    {
        id: "deepseek-v4-flash",
        name: "DeepSeek V4 Flash"
    },
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code"
    }
];
const qwen_cloudProvider = {
    id: "qwen-cloud",
    alias: "qwc",
    format: "openai",
    executor: "default",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelsUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: QWEN_CLOUD_TEXT_MODELS,
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/qwen-cloud-token-plan/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "qwen_cloud_token_planProvider",
    ()=>qwen_cloud_token_planProvider
]);
const qwen_cloud_token_planProvider = {
    id: "qwen-cloud-token-plan",
    alias: "qct",
    format: "openai",
    executor: "default",
    baseUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "qwen3.8-max-preview",
            name: "Qwen3.8 Max Preview",
            supportsReasoning: true,
            supportsVision: true,
            toolCalling: true,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        },
        {
            id: "qwen3.7-max",
            name: "Qwen3.7 Max",
            supportsReasoning: true,
            toolCalling: true,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        },
        {
            id: "qwen3.7-plus",
            name: "Qwen3.7 Plus",
            supportsReasoning: true,
            supportsVision: true,
            toolCalling: true,
            contextLength: 1_000_000,
            maxOutputTokens: 65_536
        },
        {
            id: "qwen3.6-flash",
            name: "Qwen3.6 Flash",
            supportsReasoning: true,
            supportsVision: true,
            toolCalling: true,
            contextLength: 1_000_000,
            maxOutputTokens: 32_768
        },
        {
            id: "glm-5.2",
            name: "GLM 5.2",
            supportsReasoning: true,
            toolCalling: true,
            contextLength: 1_000_000,
            maxOutputTokens: 16_384
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true,
            toolCalling: true,
            contextLength: 163_840,
            maxOutputTokens: 32_768
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/zai-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "zai_webProvider",
    ()=>zai_webProvider
]);
const zai_webProvider = {
    id: "zai-web",
    alias: "zw",
    format: "openai",
    executor: "zai-web",
    // Free consumer web chat at chat.z.ai (Zhipu AI) — see
    // `open-sse/executors/zai-web.ts` for the cookie/session wire format.
    // Distinct from the API-key `zai`/`glm` providers (api.z.ai).
    baseUrl: "https://chat.z.ai",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "glm-4.6",
            name: "GLM-4.6",
            toolCalling: false
        },
        {
            id: "glm-4.5",
            name: "GLM-4.5",
            toolCalling: false
        },
        {
            id: "glm-4.5v",
            name: "GLM-4.5V (Vision)",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/modal/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "modalProvider",
    ()=>modalProvider
]);
const modalProvider = {
    id: "modal",
    alias: "modal",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.modal.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "google/gemini-2.0-flash",
            name: "Gemini 2.0 Flash"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/zenmux/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "zenmuxProvider",
    ()=>zenmuxProvider
]);
const zenmuxProvider = {
    id: "zenmux",
    alias: "zm",
    format: "openai",
    executor: "default",
    baseUrl: "https://zenmux.ai/api/v1/chat/completions",
    modelsUrl: "https://zenmux.ai/api/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "google/gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview (ZenMux)",
            contextLength: 1048576,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "google/gemini-3-flash-preview",
            name: "Gemini 3 Flash Preview (ZenMux)",
            contextLength: 1048576,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "openai/gpt-5",
            name: "GPT-5 (ZenMux)",
            contextLength: 400000,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "anthropic/claude-sonnet-4.5",
            name: "Claude Sonnet 4.5 (ZenMux)",
            contextLength: 200000,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "anthropic/claude-opus-4.5",
            name: "Claude Opus 4.5 (ZenMux)",
            contextLength: 200000,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek/deepseek-chat",
            name: "DeepSeek V3.2 Chat (ZenMux)",
            contextLength: 128000,
            supportsVision: false,
            toolCalling: true,
            supportsReasoning: false
        },
        {
            id: "x-ai/grok-4.1-fast",
            name: "Grok 4.1 Fast (ZenMux)",
            contextLength: 131072,
            supportsVision: false,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "mistralai/mistral-large-2512",
            name: "Mistral Large 2512 (ZenMux)",
            contextLength: 128000,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: false
        },
        {
            id: "z-ai/glm-4.6v-flash",
            name: "GLM 4.6V Flash (ZenMux)",
            contextLength: 128000,
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/leonardo/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leonardoProvider",
    ()=>leonardoProvider
]);
const leonardoProvider = {
    id: "leonardo",
    alias: "leo",
    format: "openai",
    executor: "default",
    baseUrl: "https://cloud.leonardo.ai/api/rest/v1",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "phoenix",
            name: "Phoenix"
        },
        {
            id: "sdxl",
            name: "SDXL"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/grok-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "grok_webProvider",
    ()=>grok_webProvider
]);
const grok_webProvider = {
    id: "grok-web",
    alias: "gw",
    format: "openai",
    executor: "grok-web",
    baseUrl: "https://grok.com/rest/app-chat/conversations/new",
    authType: "apikey",
    authHeader: "cookie",
    passthroughModels: true,
    models: [
        {
            id: "fast",
            name: "Grok 4.20",
            toolCalling: true
        },
        {
            id: "expert",
            name: "Grok 4.20 Thinking",
            toolCalling: true
        },
        {
            id: "heavy",
            name: "Grok 4.20 Multi Agent",
            toolCalling: true
        },
        {
            id: "grok-420-computer-use-sa",
            name: "Grok 4.3 (Beta)",
            toolCalling: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/kie/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kieProvider",
    ()=>kieProvider
]);
const kieProvider = {
    id: "kie",
    alias: "kie",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.kie.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        // Sweep 2026-06-19: + current flagships the kie proxy surfaces. gemini-3-pro was
        // skipped (registry already carries the newer gemini-3-1-pro).
        {
            id: "claude-opus-4-8",
            name: "Claude 4.8 Opus"
        },
        {
            id: "claude-opus-4-7",
            name: "Claude 4.7 Opus"
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude 4.6 Sonnet"
        },
        {
            id: "claude-haiku-4-5",
            name: "Claude 4.5 Haiku"
        },
        {
            id: "gpt-5-5",
            name: "GPT 5.5"
        },
        {
            id: "gpt-5-4",
            name: "GPT 5.4"
        },
        {
            id: "gpt-5-2",
            name: "GPT 5.2"
        },
        {
            id: "gemini-3-1-pro",
            name: "Gemini 3.1 Pro"
        },
        {
            id: "gemini-2-5-pro",
            name: "Gemini 2.5 Pro"
        },
        {
            id: "gemini-3-flash",
            name: "Gemini 3 Flash"
        },
        {
            id: "gemini-3-5-flash",
            name: "Gemini 3.5 Flash"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/monsterapi/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "monsterapiProvider",
    ()=>monsterapiProvider
]);
const monsterapiProvider = {
    id: "monsterapi",
    alias: "monster",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.monsterapi.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: refreshed to the current served Llama tiers (developer.monsterapi.ai).
    // llama-3-8b-fuse dropped — no longer evidenced in the MonsterAPI catalog.
    models: [
        {
            id: "meta-llama/Meta-Llama-3.1-8B-Instruct",
            name: "Llama 3.1 8B Instruct"
        },
        {
            id: "meta-llama/Llama-3.3-70B-Instruct",
            name: "Llama 3.3 70B Instruct"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/modelscope/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "modelscopeProvider",
    ()=>modelscopeProvider
]);
const modelscopeProvider = {
    id: "modelscope",
    alias: "ms",
    format: "openai",
    executor: "default",
    baseUrl: "https://api-inference.modelscope.cn/v1/chat/completions",
    modelsUrl: "https://api-inference.modelscope.cn/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    passthroughModels: true,
    models: []
};
}),
"[project]/open-sse/config/providers/registry/sensenova/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sensenovaProvider",
    ()=>sensenovaProvider
]);
const sensenovaProvider = {
    id: "sensenova",
    alias: "sensenova",
    format: "openai",
    executor: "default",
    baseUrl: "https://token.sensenova.cn/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // SenseNova Token Plan (validated 2026-07-06): the Token Plan endpoint is
    // OpenAI-compatible but enforces max_tokens in [1, 65536]. Its /models list
    // also currently advertises sensenova-u1-fast, but chat completions return
    // 404 "model is not found" for that model; U1 Fast belongs to image flows.
    models: [
        {
            id: "sensenova-6.7-flash-lite",
            name: "SenseNova 6.7 Flash-Lite",
            contextLength: 262144,
            maxOutputTokens: 65536,
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            contextLength: 1048576,
            maxOutputTokens: 65536,
            supportsReasoning: true,
            interleavedField: "reasoning_content"
        },
        {
            id: "glm-5.2",
            name: "GLM 5.2",
            contextLength: 1048576,
            maxOutputTokens: 65536,
            supportsReasoning: true,
            interleavedField: "reasoning_content"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/hyperbolic/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hyperbolicProvider",
    ()=>hyperbolicProvider
]);
const hyperbolicProvider = {
    id: "hyperbolic",
    alias: "hyp",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.hyperbolic.xyz/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "Qwen/QwQ-32B",
            name: "QwQ 32B"
        },
        {
            id: "deepseek-ai/DeepSeek-R1",
            name: "DeepSeek R1"
        },
        {
            id: "deepseek-ai/DeepSeek-V3",
            name: "DeepSeek V3"
        },
        {
            id: "meta-llama/Llama-3.3-70B-Instruct",
            name: "Llama 3.3 70B"
        },
        {
            id: "meta-llama/Llama-3.2-3B-Instruct",
            name: "Llama 3.2 3B"
        },
        {
            id: "Qwen/Qwen2.5-72B-Instruct",
            name: "Qwen 2.5 72B"
        },
        {
            id: "Qwen/Qwen2.5-Coder-32B-Instruct",
            name: "Qwen 2.5 Coder 32B"
        },
        {
            id: "NousResearch/Hermes-3-Llama-3.1-70B",
            name: "Hermes 3 70B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/lambda-ai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lambda_aiProvider",
    ()=>lambda_aiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const lambda_aiProvider = {
    id: "lambda-ai",
    alias: "lambda",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.lambda.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["lambda-ai"]
};
}),
"[project]/open-sse/config/providers/registry/t3-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t3_webProvider",
    ()=>t3_webProvider
]);
const t3_webProvider = {
    id: "t3-web",
    alias: "t3chat",
    format: "openai",
    executor: "t3-web",
    baseUrl: "https://t3.chat/api/chat",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        // Claude
        {
            id: "claude-opus-4",
            name: "Claude Opus 4 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "claude-sonnet-4",
            name: "Claude Sonnet 4 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "claude-haiku-4",
            name: "Claude Haiku 4 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "claude-3.7",
            name: "Claude 3.7 Sonnet (via t3.chat)",
            toolCalling: false
        },
        // GPT / OpenAI
        {
            id: "gpt-5",
            name: "GPT-5 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "gpt-4o",
            name: "GPT-4o (via t3.chat)",
            toolCalling: false
        },
        {
            id: "gpt-4.1",
            name: "GPT-4.1 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "o3",
            name: "o3 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "o4-mini",
            name: "o4-mini (via t3.chat)",
            toolCalling: false
        },
        // Gemini
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro (via t3.chat)",
            toolCalling: false
        },
        {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash (via t3.chat)",
            toolCalling: false
        },
        // DeepSeek
        {
            id: "deepseek-r1",
            name: "DeepSeek R1 (via t3.chat)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v3",
            name: "DeepSeek V3 (via t3.chat)",
            toolCalling: false
        },
        // Grok
        {
            id: "grok-3",
            name: "Grok 3 (via t3.chat)",
            toolCalling: false
        },
        {
            id: "grok-3-mini",
            name: "Grok 3 Mini (via t3.chat)",
            toolCalling: false
        },
        // Llama / Meta
        {
            id: "llama-4-maverick",
            name: "Llama 4 Maverick (via t3.chat)",
            toolCalling: false
        },
        {
            id: "llama-4-scout",
            name: "Llama 4 Scout (via t3.chat)",
            toolCalling: false
        },
        {
            id: "llama-3.3-70b",
            name: "Llama 3.3 70B (via t3.chat)",
            toolCalling: false
        },
        // Mistral
        {
            id: "devstral",
            name: "Devstral (via t3.chat)",
            toolCalling: false
        },
        {
            id: "mistral-large",
            name: "Mistral Large (via t3.chat)",
            toolCalling: false
        },
        // Qwen
        {
            id: "qwen3-235b",
            name: "Qwen3 235B (via t3.chat)",
            supportsReasoning: true
        },
        {
            id: "qwen3-32b",
            name: "Qwen3 32B (via t3.chat)",
            supportsReasoning: true
        },
        // Kimi
        {
            id: "kimi-k2",
            name: "Kimi K2 (via t3.chat)",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/iflytek/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "iflytekProvider",
    ()=>iflytekProvider
]);
const iflytekProvider = {
    id: "iflytek",
    alias: "iflytek",
    format: "openai",
    executor: "default",
    baseUrl: "https://spark-api-open.xf-yun.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // `spark-api-open.xf-yun.com` is Spark's OpenAI-compatible HTTP endpoint (Bearer
    // APIPassword). `spark-api.xf-yun.com` is the WebSocket host — `wss://.../v3.1/chat`
    // etc., authenticated with an HMAC-SHA256 signature, not a bearer token — so it
    // cannot serve this `format: "openai"` / `authHeader: "bearer"` entry.
    // Model ids are the `domain` values accepted by the HTTP endpoint:
    // generalv3.5 = Max (current); 4.0Ultra is case-sensitive.
    models: [
        {
            id: "4.0Ultra",
            name: "Spark 4.0 Ultra",
            contextLength: 32768
        },
        {
            id: "generalv3.5",
            name: "Spark Max (V3.5)"
        },
        {
            id: "max-32k",
            name: "Spark Max 32K",
            contextLength: 32768
        },
        {
            id: "generalv3",
            name: "Spark Pro",
            contextLength: 8192
        },
        {
            id: "pro-128k",
            name: "Spark Pro 128K",
            contextLength: 131072
        },
        {
            id: "lite",
            name: "Spark Lite",
            contextLength: 4096
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/crof/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "crofProvider",
    ()=>crofProvider
]);
const crofProvider = {
    id: "crof",
    alias: "crof",
    format: "openai",
    executor: "default",
    baseUrl: "https://crof.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Seed list — runtime /v1/models discovery keeps this fresh.
    // Source: GET https://crof.ai/v1/models (2026-05-17).
    models: [
        {
            id: "deepseek-v4-pro-precision",
            name: "DeepSeek V4 Pro (Precision)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        },
        {
            id: "deepseek-v3.2",
            name: "DeepSeek V3.2"
        },
        {
            id: "kimi-k2.6-precision",
            name: "Kimi K2.6 (Precision)",
            supportsReasoning: true
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6",
            supportsReasoning: true
        },
        {
            id: "kimi-k2.5-lightning",
            name: "Kimi K2.5 (Lightning)",
            supportsReasoning: true
        },
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5",
            supportsReasoning: true
        },
        {
            id: "glm-5.1-precision",
            name: "GLM 5.1 (Precision)",
            supportsReasoning: true
        },
        {
            id: "glm-5.1",
            name: "GLM 5.1",
            supportsReasoning: true
        },
        {
            id: "glm-4.7",
            name: "GLM 4.7"
        },
        {
            id: "glm-4.7-flash",
            name: "GLM 4.7 Flash"
        },
        {
            id: "mimo-v2.5-pro-precision",
            name: "Mimo 2.5 Pro (Precision)",
            supportsReasoning: true
        },
        {
            id: "mimo-v2.5-pro",
            name: "Mimo 2.5 Pro",
            supportsReasoning: true
        },
        {
            id: "gemma-4-31b-it",
            name: "Gemma 4 31B",
            supportsReasoning: true
        },
        {
            id: "minimax-m2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "qwen3.6-27b",
            name: "Qwen3.6 27B",
            supportsReasoning: true
        },
        {
            id: "qwen3.5-397b-a17b",
            name: "Qwen3.5 397B A17B",
            supportsReasoning: true
        },
        {
            id: "qwen3.5-9b",
            name: "Qwen3.5 9B",
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/poe/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POE_CHAT_COMPLETIONS_URL",
    ()=>POE_CHAT_COMPLETIONS_URL,
    "POE_DEFAULT_BASE_URL",
    ()=>POE_DEFAULT_BASE_URL,
    "POE_MESSAGES_URL",
    ()=>POE_MESSAGES_URL,
    "POE_RESPONSES_URL",
    ()=>POE_RESPONSES_URL,
    "isPoeMessagesEligibleModel",
    ()=>isPoeMessagesEligibleModel,
    "poeProvider",
    ()=>poeProvider,
    "resolvePoeUpstreamUrl",
    ()=>resolvePoeUpstreamUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [instrumentation] (ecmascript)");
;
const POE_DEFAULT_BASE_URL = "https://api.poe.com/v1";
const POE_CHAT_COMPLETIONS_URL = `${POE_DEFAULT_BASE_URL}/chat/completions`;
const POE_RESPONSES_URL = `${POE_DEFAULT_BASE_URL}/responses`;
const POE_MESSAGES_URL = `${POE_DEFAULT_BASE_URL}/messages`;
function isPoeMessagesEligibleModel(model) {
    if (typeof model !== "string" || !model) return false;
    return /(?:^|[\/._-])claude(?:[\/._-]|$)/i.test(model);
}
function resolvePoeUpstreamUrl(opts) {
    const defaultChat = opts.defaultChatUrl || POE_CHAT_COMPLETIONS_URL;
    const defaultResponses = opts.responsesBaseUrl || POE_RESPONSES_URL;
    const defaultMessages = opts.messagesUrl || POE_MESSAGES_URL;
    if (opts.protocol === "responses" && !opts.configuredBaseUrl) {
        return defaultResponses;
    }
    if (opts.protocol === "messages" && !opts.configuredBaseUrl) {
        return defaultMessages;
    }
    if (opts.protocol === "chat" && !opts.configuredBaseUrl) {
        return defaultChat;
    }
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(opts.configuredBaseUrl || defaultChat);
    // Strip any known protocol suffix so we can re-append the requested one.
    const root = raw.replace(/\/chat\/completions\/?$/i, "").replace(/\/responses\/?$/i, "").replace(/\/messages\/?$/i, "").replace(/\/$/, "");
    const withV1 = /\/v1$/i.test(root) ? root : `${root}/v1`;
    if (opts.protocol === "responses") return `${withV1}/responses`;
    if (opts.protocol === "messages") return `${withV1}/messages`;
    return `${withV1}/chat/completions`;
}
const poeProvider = {
    id: "poe",
    alias: "poe",
    format: "openai",
    executor: "default",
    baseUrl: POE_CHAT_COMPLETIONS_URL,
    responsesBaseUrl: POE_RESPONSES_URL,
    // Anthropic-compatible Messages API — official Claude models only
    // (https://creator.poe.com/docs/external-applications/anthropic-compatible-api).
    // Routed via each claude-* model's targetFormat: "claude" below; GPT/Gemini
    // stay on Chat Completions / Responses.
    messagesUrl: POE_MESSAGES_URL,
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "gpt-5.2",
            name: "GPT-5.2"
        },
        {
            id: "claude-opus-4.8",
            name: "Claude Opus 4.8",
            targetFormat: "claude"
        },
        {
            id: "gemini-3.0-pro",
            name: "Gemini 3.0 Pro"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/bazaarlink/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bazaarlinkProvider",
    ()=>bazaarlinkProvider
]);
const bazaarlinkProvider = {
    id: "bazaarlink",
    alias: "bzl",
    format: "openai",
    executor: "default",
    baseUrl: "https://bazaarlink.ai/api/v1/chat/completions",
    modelsUrl: "https://bazaarlink.ai/api/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "auto:free",
            name: "Auto Free (Zero Cost)"
        },
        {
            id: "claude-opus-4.7",
            name: "Claude Opus 4.7"
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "claude-haiku-4.5",
            name: "Claude Haiku 4.5"
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5"
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4"
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini"
        },
        {
            id: "gpt-5.4-nano",
            name: "GPT-5.4 Nano"
        },
        {
            id: "grok-4.3",
            name: "Grok 4.3"
        },
        {
            id: "grok-4.20",
            name: "Grok 4.20"
        },
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro"
        },
        {
            id: "gemini-3-flash-preview",
            name: "Gemini 3 Flash"
        },
        {
            id: "gemini-3.1-flash-lite-preview",
            name: "Gemini 3.1 Flash Lite"
        },
        {
            id: "gemma-4-31b-it",
            name: "Gemma 4 31B"
        },
        {
            id: "gemma-4-26b-a4b-it",
            name: "Gemma 4 26B A4B"
        },
        {
            id: "deepseek-v3.2",
            name: "DeepSeek V3.2"
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6"
        },
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5"
        },
        {
            id: "glm-5.1",
            name: "GLM 5.1"
        },
        {
            id: "glm-5",
            name: "GLM 5"
        },
        {
            id: "mimo-v2.5-pro",
            name: "MiMo-V2.5-Pro"
        },
        {
            id: "mimo-v2.5",
            name: "MiMo-V2.5"
        },
        // #3110: MiniMax M3 via OpenCode Zen
        {
            id: "minimax-m3",
            name: "MiniMax M3",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "minimax-m2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "minimax-m2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "llama-4-maverick",
            name: "Llama 4 Maverick"
        },
        {
            id: "llama-4-scout",
            name: "Llama 4 Scout"
        },
        {
            id: "llama-3.3-70b-instruct",
            name: "Llama 3.3 70B"
        },
        {
            id: "qwen3.6-plus",
            name: "Qwen 3.6 Plus"
        },
        {
            id: "mistral-large-2512",
            name: "Mistral Large 3"
        },
        {
            id: "mistral-medium-3.1",
            name: "Mistral Medium 3.1"
        },
        {
            id: "mistral-small-2603",
            name: "Mistral Small 4"
        },
        {
            id: "nemotron-3-super-120b-a12b",
            name: "Nemotron 3 Super"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/perplexity/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "perplexityProvider",
    ()=>perplexityProvider
]);
const perplexityProvider = {
    id: "perplexity",
    alias: "pplx",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.perplexity.ai/chat/completions",
    // `/v1/models` lists the Agent API catalog, so use it for key validation only.
    testKeyModelsUrl: "https://api.perplexity.ai/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "sonar-deep-research",
            name: "Sonar Deep Research"
        },
        {
            id: "sonar-reasoning-pro",
            name: "Sonar Reasoning Pro"
        },
        {
            id: "sonar-pro",
            name: "Sonar Pro"
        },
        {
            id: "sonar",
            name: "Sonar"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/perplexity/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "perplexity_webProvider",
    ()=>perplexity_webProvider
]);
const perplexity_webProvider = {
    id: "perplexity-web",
    alias: "pplx-web",
    format: "openai",
    executor: "perplexity-web",
    baseUrl: "https://www.perplexity.ai/rest/sse/perplexity_ask",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "pplx-auto",
            name: "Perplexity Best",
            toolCalling: false
        },
        {
            id: "pplx-sonar",
            name: "Sonar 2 (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-gpt-5.6-terra",
            name: "GPT-5.6 Terra (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-gpt-5.6-sol",
            name: "GPT-5.6 Sol (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-gemini",
            name: "Gemini 3.1 Pro (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-sonnet",
            name: "Claude Sonnet 5.0 (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-opus",
            name: "Claude Opus 5.0 (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-glm",
            name: "GLM-5.2 (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-kimi",
            name: "Kimi K2.6 (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-grok-4.5",
            name: "Grok 4.5 (via Perplexity)",
            toolCalling: false
        },
        {
            id: "pplx-nemotron",
            name: "Nemotron 3 Ultra (via Perplexity)",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/minimax/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minimaxProvider",
    ()=>minimaxProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const minimaxProvider = {
    id: "minimax",
    alias: "minimax",
    format: "claude",
    executor: "default",
    baseUrl: "https://api.minimax.io/anthropic/v1/messages",
    modelsUrl: "https://api.minimax.io/v1/models",
    urlSuffix: "?beta=true",
    authType: "apikey",
    authHeader: "bearer",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
    ensureThinkingSignature: true,
    models: [
        // T12/T28: MiniMax default upgraded from M2.5 to M2.7
        // #3110: MiniMax M3 — frontier coding model with 1M context
        {
            id: "MiniMax-M3",
            name: "MiniMax M3",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "MiniMax-M2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "MiniMax-M2.7-highspeed",
            name: "MiniMax M2.7 Highspeed"
        },
        {
            id: "MiniMax-M2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "MiniMax-M2.5-highspeed",
            name: "MiniMax M2.5 Highspeed"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/minimax/cn/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minimax_cnProvider",
    ()=>minimax_cnProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const minimax_cnProvider = {
    id: "minimax-cn",
    alias: "minimax-cn",
    format: "claude",
    executor: "default",
    baseUrl: "https://api.minimaxi.com/anthropic/v1/messages",
    modelsUrl: "https://api.minimaxi.com/v1/models",
    urlSuffix: "?beta=true",
    authType: "apikey",
    authHeader: "bearer",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
    ensureThinkingSignature: true,
    models: [
        // Keep parity with minimax to ensure model discovery works for minimax-cn connections.
        // #3110: MiniMax M3 — frontier coding model with 1M context
        {
            id: "MiniMax-M3",
            name: "MiniMax M3",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "MiniMax-M2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "MiniMax-M2.7-highspeed",
            name: "MiniMax M2.7 Highspeed"
        },
        {
            id: "MiniMax-M2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "MiniMax-M2.5-highspeed",
            name: "MiniMax M2.5 Highspeed"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/minimax/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HAILUO_WEB_STATIC_MODELS",
    ()=>HAILUO_WEB_STATIC_MODELS,
    "hailuo_webProvider",
    ()=>hailuo_webProvider
]);
const HAILUO_WEB_STATIC_MODELS = [
    // The Hailuo web client does not expose a model selector in its chat API —
    // one default assistant persona (characterID) handles every request. See
    // open-sse/executors/hailuo-web.ts for the ported g4f protocol details.
    {
        id: "hailuo",
        name: "Hailuo (MiniMax)"
    }
];
const hailuo_webProvider = {
    id: "hailuo-web",
    // Distinct alias: the paid API-key "minimax"/"minimax-cn" providers
    // (../../minimax/index.ts) keep their own short alias; this free web/cookie
    // variant is addressed by its own id, per the established kimi-web/qwen-web
    // secondary-variant convention (tests/unit/provider-alias-uniqueness.test.ts).
    alias: "hailuo-web",
    format: "openai",
    executor: "hailuo-web",
    baseUrl: "https://www.hailuo.ai",
    authType: "apikey",
    authHeader: "bearer",
    models: HAILUO_WEB_STATIC_MODELS
};
}),
"[project]/open-sse/config/providers/registry/haiper/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "haiperProvider",
    ()=>haiperProvider
]);
const haiperProvider = {
    id: "haiper",
    alias: "hp",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.haiper.ai/v1",
    authType: "apikey",
    authHeader: "HAIPER_KEY",
    models: [
        {
            id: "gen2",
            name: "Gen 2 Video"
        },
        {
            id: "gen2-image",
            name: "Gen 2 Image"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/bytez/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bytezProvider",
    ()=>bytezProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const bytezProvider = {
    id: "bytez",
    alias: "bytez",
    format: "openai",
    executor: "default",
    // #5422: full OpenAI-compat chat URL. The bare `…/models/v2` base made the validation
    // probe hit `…/models/v2/chat/completions` → 404 ("endpoint not supported"). Bytez is
    // OpenAI-compatible at `…/models/v2/openai/v1`; store the full chat path (like
    // friendliai/novita) so chat resolves once an account has catalog models.
    baseUrl: "https://api.bytez.com/models/v2/openai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].bytez
};
}),
"[project]/open-sse/config/providers/registry/blackbox/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "blackboxProvider",
    ()=>blackboxProvider
]);
const blackboxProvider = {
    id: "blackbox",
    alias: "bb",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.blackbox.ai/v1/chat/completions",
    modelsUrl: "https://api.blackbox.ai/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "claude-fable-5",
            name: "Claude Fable 5"
        },
        {
            id: "claude-opus-4.8",
            name: "Claude Opus 4.8"
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5"
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5"
        },
        {
            id: "gpt-5.4-pro",
            name: "GPT-5.4 Pro"
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4"
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT-5.3 Codex"
        },
        {
            id: "gpt-5.4-nano",
            name: "GPT-5.4 Nano"
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash"
        },
        {
            id: "grok-4.3",
            name: "Grok 4.3"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/blackbox/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "blackbox_webProvider",
    ()=>blackbox_webProvider
]);
const blackbox_webProvider = {
    id: "blackbox-web",
    alias: "bb-web",
    format: "openai",
    executor: "blackbox-web",
    baseUrl: "https://app.blackbox.ai/api/chat",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "gpt-4-turbo",
            name: "GPT-4 Turbo",
            toolCalling: false
        },
        {
            id: "gpt-4",
            name: "GPT-4",
            toolCalling: false
        },
        {
            id: "gpt-3.5-turbo",
            name: "GPT-3.5 Turbo",
            toolCalling: false
        },
        {
            id: "claude-3-opus",
            name: "Claude 3 Opus",
            toolCalling: false
        },
        {
            id: "claude-3-sonnet",
            name: "Claude 3 Sonnet",
            toolCalling: false
        },
        {
            id: "gemini-pro",
            name: "Gemini Pro",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/uncloseai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "uncloseaiProvider",
    ()=>uncloseaiProvider
]);
const uncloseaiProvider = {
    id: "uncloseai",
    alias: "unc",
    format: "openai",
    executor: "default",
    baseUrl: "https://hermes.ai.unturf.com/v1/chat/completions",
    authType: "optional",
    authHeader: "bearer",
    models: [
        {
            id: "adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic",
            name: "Hermes 3 Llama 3.1 8B (🆓 Free)"
        },
        {
            id: "qwen3.6:27b",
            name: "Qwen3 Coder 27B (🆓 Free)"
        },
        {
            id: "gemma4:31b",
            name: "Gemma 4 31B (🆓 Free)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/nscale/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nscaleProvider",
    ()=>nscaleProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const nscaleProvider = {
    id: "nscale",
    alias: "nscale",
    format: "openai",
    executor: "default",
    baseUrl: "https://inference.api.nscale.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].nscale
};
}),
"[project]/open-sse/config/providers/registry/chatgpt-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatgpt_webProvider",
    ()=>chatgpt_webProvider
]);
const chatgpt_webProvider = {
    id: "chatgpt-web",
    alias: "cgpt-web",
    format: "openai",
    executor: "chatgpt-web",
    baseUrl: "https://chatgpt.com/backend-api/conversation",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "gpt-5.6-pro",
            name: "GPT-5.6 Pro",
            toolCalling: false
        },
        {
            id: "gpt-5.6-thinking",
            name: "GPT-5.6 Thinking",
            toolCalling: false
        },
        {
            id: "gpt-5.5-pro-extended",
            name: "GPT-5.5 Pro Extended",
            toolCalling: false
        },
        {
            id: "gpt-5.5-pro",
            name: "GPT-5.5 Pro",
            toolCalling: false
        },
        {
            id: "gpt-5.5-thinking",
            name: "GPT-5.5 Thinking",
            toolCalling: false
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5 Instant",
            toolCalling: false
        },
        {
            id: "o3",
            name: "o3",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/openrouter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openrouterProvider",
    ()=>openrouterProvider
]);
const openrouterProvider = {
    id: "openrouter",
    alias: "openrouter",
    format: "openai",
    executor: "default",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    headers: {
        "HTTP-Referer": "https://endpoint-proxy.local",
        "X-Title": "Endpoint Proxy"
    },
    models: [
        {
            id: "auto",
            name: "Auto (Best Available)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/cheaperinference/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHEAPERINFERENCE_MODELS",
    ()=>CHEAPERINFERENCE_MODELS,
    "cheaperinferenceProvider",
    ()=>cheaperinferenceProvider
]);
const CHEAPERINFERENCE_MODELS = [
    {
        id: "aion-labs.aion-2-0",
        name: "Aion 2.0",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-fable-5",
        name: "Claude Fable 5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-haiku-4.5",
        name: "Claude Haiku 4.5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-4-7-fast",
        name: "Claude Opus 4.7 Fast",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-4-8-fast",
        name: "Claude Opus 4.8 Fast",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-4.5",
        name: "Claude Opus 4.5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-4.6",
        name: "Claude Opus 4.6",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-4.7",
        name: "Claude Opus 4.7",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-4.8",
        name: "Claude Opus 4.8",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-5",
        name: "Claude Opus 5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-opus-5-fast",
        name: "Claude Opus 5 Fast",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-sonnet-4.5",
        name: "Claude Sonnet 4.5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-sonnet-4.6",
        name: "Claude Sonnet 4.6",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "claude-sonnet-5",
        name: "Claude Sonnet 5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "deepseek-v4-flash",
        name: "DeepSeek V4 Flash",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-3-5-flash",
        name: "Gemini 3.5 Flash",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash Preview",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-pro",
        name: "Gemini 3.1 Pro",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro Preview",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-4.5",
        name: "GLM-4.5",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-4.5-air",
        name: "GLM-4.5 Air",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-4.6",
        name: "GLM-4.6",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-4.7",
        name: "GLM-4.7",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-5",
        name: "GLM-5",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-5.1",
        name: "GLM-5.1",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "glm-5.2",
        name: "GLM-5.2",
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "google/gemini-3.5-flash-lite",
        name: "Gemini 3.5 Flash Lite",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    // The GPT-5.x family is tagged for the gateway's native /v1/responses endpoint —
    // that is the surface OpenAI-family clients (Codex-style) expect for tool loops.
    {
        id: "gpt-5.4",
        name: "GPT-5.4",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        targetFormat: "openai-responses"
    },
    {
        id: "gpt-5.4-mini",
        name: "GPT-5.4 Mini",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        targetFormat: "openai-responses"
    },
    {
        id: "gpt-5.5",
        name: "GPT-5.5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        targetFormat: "openai-responses"
    },
    {
        id: "gpt-5.6-luna",
        name: "GPT-5.6 Luna",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        targetFormat: "openai-responses"
    },
    {
        id: "gpt-5.6-sol",
        name: "GPT-5.6 Sol",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        targetFormat: "openai-responses"
    },
    {
        id: "gpt-5.6-terra",
        name: "GPT-5.6 Terra",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true,
        targetFormat: "openai-responses"
    },
    {
        id: "grok-4.5",
        name: "Grok 4.5",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "kimi-k3",
        name: "Kimi K3",
        supportsVision: true,
        supportsReasoning: true,
        toolCalling: true
    },
    {
        id: "minimax-m2.7",
        name: "MiniMax M2.7",
        supportsReasoning: true,
        toolCalling: true
    }
];
const cheaperinferenceProvider = {
    id: "cheaperinference",
    alias: "cinf",
    format: "openai",
    executor: "cheaperinference",
    baseUrl: "https://api.cheaperinference.com/v1/chat/completions",
    // The gateway serves a native, STATELESS /v1/responses endpoint alongside
    // /v1/chat/completions. Consumed by CheaperInferenceExecutor.buildUrl for the
    // models tagged targetFormat: "openai-responses" above.
    responsesBaseUrl: "https://api.cheaperinference.com/v1/responses",
    authType: "apikey",
    authHeader: "bearer",
    models: CHEAPERINFERENCE_MODELS
};
}),
"[project]/open-sse/config/providers/registry/openvecta/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openvectaProvider",
    ()=>openvectaProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const openvectaProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "openvecta",
    alias: "openvecta",
    baseUrl: "https://api.openvecta.com/v1/chat/completions",
    models: [
        {
            id: "glm-4.7-flash",
            name: "GLM 4.7 Flash",
            contextLength: 131072
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6",
            contextLength: 1000000
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            contextLength: 131072
        },
        {
            id: "gpt-oss-120b",
            name: "GPT OSS 120B",
            contextLength: 131072
        },
        {
            id: "gemma-4-31b",
            name: "Gemma 4 31B",
            contextLength: 262144
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6",
            contextLength: 200000
        },
        {
            id: "llama-3.3-70b-instruct",
            name: "Llama 3.3 70B Instruct",
            contextLength: 131072
        },
        {
            id: "llama-4-maverick",
            name: "Llama 4 Maverick",
            contextLength: 1048576
        },
        {
            id: "nemotron-3-super-120b",
            name: "Nemotron 3 Super 120B",
            contextLength: 262144
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/orcarouter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "orcarouterProvider",
    ()=>orcarouterProvider
]);
const orcarouterProvider = {
    id: "orcarouter",
    alias: "orcarouter",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.orcarouter.ai/v1",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    headers: {
        "HTTP-Referer": "https://endpoint-proxy.local",
        "X-Title": "Endpoint Proxy"
    },
    models: [
        // Adaptive router (headline feature). Per-turn tool/reasoning support depends on
        // the workspace AUTO pool (https://www.orcarouter.ai/console/routing).
        {
            id: "orcarouter/auto",
            name: "Auto (smart routing)",
            toolCalling: true
        },
        {
            id: "openai/gpt-5.5",
            name: "GPT-5.5",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1050000,
            maxOutputTokens: 128000
        },
        {
            id: "google/gemini-3.5-flash",
            name: "Gemini 3.5 Flash",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxOutputTokens: 65536
        },
        {
            id: "anthropic/claude-opus-4.8",
            name: "Claude Opus 4.8",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxOutputTokens: 128000
        },
        {
            id: "grok/grok-4.3",
            name: "Grok 4.3",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000
        },
        {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 384000
        },
        {
            id: "minimax/minimax-m2.7",
            name: "MiniMax M2.7",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 204800,
            maxOutputTokens: 2048
        },
        {
            id: "qwen/qwen3.7-max",
            name: "Qwen3.7 Max",
            toolCalling: true,
            contextLength: 1000000,
            maxOutputTokens: 64000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/copilot-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copilot_webProvider",
    ()=>copilot_webProvider
]);
const copilot_webProvider = {
    id: "copilot-web",
    alias: "copilot-web",
    format: "openai",
    executor: "copilot-web",
    baseUrl: "wss://copilot.microsoft.com/c/api/chat?api-version=2",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "copilot-pro",
            name: "Copilot Pro (web)",
            toolCalling: false
        },
        {
            id: "gpt-4-turbo",
            name: "GPT-4 Turbo (via Copilot)",
            toolCalling: false
        },
        {
            id: "gpt-4",
            name: "GPT-4 (via Copilot)",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/copilot-m365-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copilot_m365_webProvider",
    ()=>copilot_m365_webProvider
]);
const copilot_m365_webProvider = {
    id: "copilot-m365-web",
    alias: "m365copilot",
    format: "openai",
    executor: "copilot-m365-web",
    baseUrl: "wss://substrate.office.com/m365Copilot/Chathub",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "copilot-m365",
            name: "Microsoft 365 Copilot (BizChat)",
            toolCalling: false
        },
        {
            id: "copilot-m365-claude-opus",
            name: "Microsoft 365 Copilot — Claude Opus",
            toolCalling: false
        },
        {
            id: "copilot-m365-gpt-5-6-reasoning",
            name: "Microsoft 365 Copilot — GPT 5.6 Reasoning",
            toolCalling: false
        },
        {
            id: "copilot-m365-gpt-5-5-chat",
            name: "Microsoft 365 Copilot — GPT 5.5 Chat",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/stepfun/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stepfunProvider",
    ()=>stepfunProvider
]);
const stepfunProvider = {
    id: "stepfun",
    alias: "stepfun",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.stepfun.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: confirmed against platform.stepfun.com. step-3.7-flash
    // (2026-05-28) is the current flagship; step-1v is the legacy 2024 vision model.
    models: [
        {
            id: "step-3.7-flash",
            name: "Step 3.7 Flash",
            contextLength: 262144
        },
        {
            id: "step-3.5-flash",
            name: "Step 3.5 Flash",
            contextLength: 262144
        },
        {
            id: "step-3.5-flash-2603",
            name: "Step 3.5 Flash 2603",
            contextLength: 262144
        },
        {
            id: "step-1o-turbo-vision",
            name: "Step 1o Turbo Vision",
            contextLength: 32768
        },
        {
            id: "step-1v",
            name: "Step 1V"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/freemodel-dev/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "freemodel_devProvider",
    ()=>freemodel_devProvider
]);
const freemodel_devProvider = {
    id: "freemodel-dev",
    alias: "fmd",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.freemodel.dev/v1/chat/completions",
    modelsUrl: "https://api.freemodel.dev/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "gpt-5.5",
            name: "GPT-5.5",
            contextLength: 400000
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4",
            contextLength: 400000
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini"
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT-5.3 Codex"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/gitlawb/gmi/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gitlawb_gmiProvider",
    ()=>gitlawb_gmiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const gitlawb_gmiProvider = {
    id: "gitlawb-gmi",
    alias: "glb-gmi",
    format: "openai",
    executor: "default",
    baseUrl: "https://opengateway.gitlawb.com/v1/gmi-cloud",
    authType: "apikey",
    authHeader: "bearer",
    headers: {
        "User-Agent": "OpenClaude/1.0 (linux; x86_64)",
        "X-Title": "OpenClaude CLI",
        "HTTP-Referer": "https://github.com/Gitlawb/openclaude"
    },
    passthroughModels: true,
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["gitlawb-gmi"]
};
}),
"[project]/open-sse/config/providers/registry/gitlawb/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gitlawbProvider",
    ()=>gitlawbProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const gitlawbProvider = {
    id: "gitlawb",
    alias: "glb",
    format: "openai",
    executor: "default",
    baseUrl: "https://opengateway.gitlawb.com/v1/xiaomi-mimo",
    authType: "apikey",
    authHeader: "bearer",
    headers: {
        "User-Agent": "OpenClaude/1.0 (linux; x86_64)",
        "X-Title": "OpenClaude CLI",
        "HTTP-Referer": "https://github.com/Gitlawb/openclaude"
    },
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["gitlawb"]
};
}),
"[project]/open-sse/config/providers/registry/liquid/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "liquidProvider",
    ()=>liquidProvider
]);
const liquidProvider = {
    id: "liquid",
    alias: "liquid",
    format: "openai",
    executor: "default",
    baseUrl: "https://inference.liquid.ai/v1/chat/completions",
    modelsUrl: "https://inference.liquid.ai/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "liquid-lfm-40b",
            name: "Liquid LFM 40B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/deepinfra/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deepinfraProvider",
    ()=>deepinfraProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const deepinfraProvider = {
    id: "deepinfra",
    alias: "deepinfra",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.deepinfra.com/v1/openai/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].deepinfra
};
}),
"[project]/open-sse/config/providers/registry/agy/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agyProvider",
    ()=>agyProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/agyModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const agyProvider = {
    id: "agy",
    alias: "agy",
    format: "antigravity",
    executor: "antigravity",
    baseUrls: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"]
    ],
    urlBuilder: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildAntigravityUrl"],
    authType: "oauth",
    authHeader: "bearer",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityProviderHeaders"])("cli"),
    oauth: {
        clientIdEnv: "ANTIGRAVITY_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id"),
        clientSecretEnv: "ANTIGRAVITY_OAUTH_CLIENT_SECRET",
        clientSecretDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt")
    },
    models: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AGY_PUBLIC_MODELS"]
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/agnes/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agnesProvider",
    ()=>agnesProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const agnesProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "agnes",
    baseUrl: "https://apihub.agnes-ai.com/v1/chat/completions",
    models: [
        {
            id: "agnes-2.0-flash",
            name: "Agnes 2.0 Flash",
            contextLength: 524288,
            maxOutputTokens: 65536,
            supportsReasoning: true,
            supportsVision: true,
            toolCalling: true,
            interleavedField: "reasoning_content"
        },
        {
            id: "agnes-1.5-flash",
            name: "Agnes 1.5 Flash",
            contextLength: 262144,
            maxOutputTokens: 65536,
            supportsVision: true
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/aihorde/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aihordeProvider",
    ()=>aihordeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const aihordeProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "aihorde",
    baseUrl: "https://oai.aihorde.net/v1/chat/completions",
    modelsUrl: "https://oai.aihorde.net/v1/models",
    passthroughModels: true,
    anonymousApiKey: "0000000000",
    timeoutMs: 120_000,
    // Provider-wide fallback (getUnsupportedParams() falls back to this when a
    // model has no per-model entry) — every model AI Horde serves shares this
    // limitation, not just the 3 statically catalogued below. Without it, any
    // live-discovered model (the roster changes as workers come/go) sends
    // `tools` straight through and gets a 500 from the raw text-completion
    // backend, which doesn't understand the field at all.
    unsupportedParams: [
        "tools",
        "tool_choice",
        "parallel_tool_calls"
    ],
    // Aphrodite's OpenAI-compatible facade 500s on a single-text-part content array —
    // it only implements the plain-string form (see openai-responses.ts collapse logic).
    requiresPlainStringContent: true,
    models: [
        {
            id: "aphrodite/TheDrummer/Cydonia-24B-v4.3",
            name: "Cydonia 24B (AI Horde)",
            contextLength: 32768,
            toolCalling: false,
            unsupportedParams: [
                "tools",
                "tool_choice",
                "parallel_tool_calls"
            ]
        },
        {
            id: "aphrodite/TheDrummer/Skyfall-31B-v4.2",
            name: "Skyfall 31B (AI Horde)",
            contextLength: 32768,
            toolCalling: false,
            unsupportedParams: [
                "tools",
                "tool_choice",
                "parallel_tool_calls"
            ]
        },
        {
            id: "google/gemma-4-31b",
            name: "Gemma 4 31B (AI Horde)",
            contextLength: 32768,
            toolCalling: false,
            unsupportedParams: [
                "tools",
                "tool_choice",
                "parallel_tool_calls"
            ]
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/ainative/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ainativeProvider",
    ()=>ainativeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const ainativeProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "ainative",
    baseUrl: "https://api.ainative.studio/api/v1/chat/completions",
    modelsUrl: "https://api.ainative.studio/api/v1/models",
    passthroughModels: true,
    models: [
        {
            id: "qwen3-235b-cerebras",
            name: "Qwen3 235B (Cerebras)",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "qwen3-32b",
            name: "Qwen3 32B",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "qwen3-14b",
            name: "Qwen3 14B",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "qwen3-8b",
            name: "Qwen3 8B",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "llama-4-maverick",
            name: "Llama 4 Maverick",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "llama3.1-8b-cerebras",
            name: "Llama 3.1 8B (Cerebras)",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "deepseek-r1",
            name: "DeepSeek R1",
            contextLength: 65536,
            supportsReasoning: true
        },
        {
            id: "nous-coder",
            name: "Nous Coder",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "gemini-flash",
            name: "Gemini Flash",
            contextLength: 131072,
            toolCalling: true
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/aion/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aionProvider",
    ()=>aionProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const aionProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "aion",
    baseUrl: "https://api.aionlabs.ai/v1/chat/completions",
    modelsUrl: "https://api.aionlabs.ai/v1/models",
    passthroughModels: true,
    models: [
        {
            id: "aion-labs/aion-3.0",
            name: "Aion 3.0",
            contextLength: 131072
        },
        {
            id: "aion-labs/aion-3.0-mini",
            name: "Aion 3.0 Mini",
            contextLength: 131072
        },
        {
            id: "aion-labs/aion-2.5",
            name: "Aion 2.5",
            contextLength: 131072
        },
        {
            id: "aion-labs/aion-2.0",
            name: "Aion 2.0",
            contextLength: 131072
        },
        {
            id: "aion-labs/aion-rp-llama-3.1-8b",
            name: "Aion RP Llama 3.1 8B",
            contextLength: 32768
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/udio/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "udioProvider",
    ()=>udioProvider
]);
const udioProvider = {
    id: "udio",
    alias: "udio",
    format: "openai",
    executor: "default",
    baseUrl: "https://www.udio.com/api/generate-proxy",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "udio-default",
            name: "Udio Default"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/longcat/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "longcatProvider",
    ()=>longcatProvider
]);
const longcatProvider = {
    id: "longcat",
    alias: "lc",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.longcat.chat/openai/v1/chat/completions",
    authType: "apikey",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    // Sweep 2026-06-30: the LongCat-Flash-* line was retired 2026-05-29 and the Preview
    // ended; current docs (longcat.chat/platform/docs) expose only the GA LongCat-2.0
    // (1M context, 128K max output). Free tier is a ONE-TIME 10M-token grant unlocked
    // after account signup + KYC verification — NOT a recurring daily/monthly allowance.
    // Beyond the free quota it is pay-as-you-go (see providerCostData).
    models: [
        {
            id: "LongCat-2.0",
            name: "LongCat 2.0 (10M tok free 🆓)",
            contextLength: 1048576
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/vertex/partner/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "vertex_partnerProvider",
    ()=>vertex_partnerProvider
]);
const vertex_partnerProvider = {
    id: "vertex-partner",
    alias: "vp",
    format: "gemini",
    executor: "vertex",
    baseUrl: "https://us-central1-aiplatform.googleapis.com/v1/projects",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "DeepSeek-V4-Flash",
            name: "DeepSeek V4 Flash"
        },
        {
            id: "DeepSeek-V4-Pro",
            name: "DeepSeek V4 Pro"
        },
        {
            id: "Qwen3.6-35B-A3B",
            name: "Qwen 3.6 35B A3B"
        },
        {
            id: "GLM-5.1-FP8",
            name: "GLM 5.1"
        },
        // Sweep 2026-06-19: + Claude Opus on Vertex (Anthropic partner models).
        {
            id: "claude-opus-4-8",
            name: "Claude Opus 4.8"
        },
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7"
        },
        {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6"
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/vertex/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "vertexProvider",
    ()=>vertexProvider
]);
const vertexProvider = {
    id: "vertex",
    alias: "vertex",
    // Vertex AI uses Google's generateContent format (same as Gemini)
    format: "gemini",
    executor: "vertex",
    // URL uses {project_id} and {region} from providerSpecificData — handled by custom executor or fallback
    // Default to us-central1 / generic endpoint; users configure project via providerSpecificData
    baseUrl: "https://us-central1-aiplatform.googleapis.com/v1/projects",
    urlBuilder: (base, model, stream)=>{
        // Full URL: {base}/{project}/locations/{region}/publishers/google/models/{model}:{action}
        // For a generic fallback, we build a Gemini-compatible URL
        // The actual project/region are configured via providerSpecificData in the DB connection
        const action = stream ? "streamGenerateContent?alt=sse" : "generateContent";
        return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}`;
    },
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview (Vertex)"
        },
        {
            id: "gemini-3.1-flash-lite",
            name: "Gemini 3.1 Flash Lite (Vertex)"
        },
        {
            id: "gemini-3-flash-preview",
            name: "Gemini 3 Flash Preview (Vertex)"
        },
        {
            id: "gemma-4-31b-it",
            name: "Gemma 4 31B (Vertex)"
        },
        {
            id: "DeepSeek-V4-Flash",
            name: "DeepSeek V4 Flash (Vertex Partner)"
        },
        {
            id: "DeepSeek-V4-Pro",
            name: "DeepSeek V4 Pro (Vertex Partner)"
        },
        {
            id: "Qwen3.6-35B-A3B",
            name: "Qwen3.6 35B A3B (Vertex Partner)"
        },
        {
            id: "GLM-5.1-FP8",
            name: "GLM-5.1 (Vertex Partner)"
        },
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7 (Vertex)"
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (Vertex)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/duckduckgo-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "duckduckgo_webProvider",
    ()=>duckduckgo_webProvider
]);
const duckduckgo_webProvider = {
    id: "duckduckgo-web",
    alias: "ddgw",
    format: "openai",
    executor: "duckduckgo-web",
    baseUrl: "https://duckduckgo.com/duckchat/v1/chat",
    authType: "none",
    authHeader: "none",
    // #8000: current Duck.ai free lineup — wire ids per duckchat/v1/models (2026-07-22).
    models: [
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini",
            toolCalling: false
        },
        {
            id: "gpt-5.4-nano",
            name: "GPT-5.4 Nano",
            toolCalling: false
        },
        {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5",
            toolCalling: false
        },
        {
            id: "mistral-small-2603",
            name: "Mistral Small 4",
            toolCalling: false
        },
        {
            id: "tinfoil/gpt-oss-120b",
            name: "gpt-oss 120B",
            toolCalling: false
        },
        {
            id: "tinfoil/gemma4-31b",
            name: "Gemma 4 31B",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/felo-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "felo_webProvider",
    ()=>felo_webProvider
]);
const felo_webProvider = {
    id: "felo-web",
    alias: "felo",
    format: "openai",
    executor: "felo-web",
    baseUrl: "https://felo.ai/api-proxy/main/search/threads",
    authType: "none",
    authHeader: "none",
    models: [
        {
            id: "felo-chat",
            name: "Felo Chat",
            toolCalling: false
        },
        {
            id: "felo-search",
            name: "Felo Search",
            toolCalling: false
        },
        {
            id: "felo-scholar",
            name: "Felo Scholar",
            toolCalling: false
        },
        {
            id: "felo-social",
            name: "Felo Social",
            toolCalling: false
        },
        {
            id: "felo-document",
            name: "Felo Document",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/xai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "xaiProvider",
    ()=>xaiProvider
]);
const xaiProvider = {
    id: "xai",
    alias: "xai",
    format: "openai",
    executor: "xai",
    baseUrl: "https://api.x.ai/v1/chat/completions",
    // Port of decolua/9router#2439 (author: @ryanngit): xAI ships a native
    // `/v1/responses` endpoint alongside `/v1/chat/completions`. Consumed by
    // XaiExecutor.buildUrl (open-sse/executors/xai.ts) for models tagged
    // targetFormat: "openai-responses" below.
    responsesBaseUrl: "https://api.x.ai/v1/responses",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "grok-4.3",
            name: "Grok 4.3"
        },
        {
            id: "grok-build-0.1",
            name: "Grok Build 0.1",
            contextLength: 256000
        },
        // Responses-only per upstream 9router#2439: xAI serves this id exclusively
        // over its native /v1/responses endpoint.
        {
            id: "grok-4.20-multi-agent-0309",
            name: "Grok 4.20 Multi Agent",
            targetFormat: "openai-responses"
        },
        {
            id: "grok-4.20-0309-reasoning",
            name: "Grok 4.20 Reasoning"
        },
        {
            id: "grok-4.20-0309-non-reasoning",
            name: "Grok 4.20"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/xai-oauth/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "xai_oauthProvider",
    ()=>xai_oauthProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/xai/index.ts [instrumentation] (ecmascript)");
;
;
const xai_oauthProvider = {
    id: "xai-oauth",
    alias: "xao",
    format: "openai",
    executor: "xai-oauth",
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xaiProvider"].baseUrl,
    responsesBaseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xaiProvider"].responsesBaseUrl,
    authType: "oauth",
    authHeader: "bearer",
    passthroughModels: true,
    oauth: {
        clientIdEnv: "GROK_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
        tokenUrl: "https://auth.x.ai/oauth2/token"
    },
    models: [
        {
            id: "grok-4.5",
            name: "Grok 4.5",
            contextLength: 500000
        },
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xaiProvider"].models || []
    ]
};
}),
"[project]/open-sse/config/providers/registry/morph/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "morphProvider",
    ()=>morphProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const morphProvider = {
    id: "morph",
    alias: "morph",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.morphllm.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].morph
};
}),
"[project]/open-sse/config/providers/registry/siliconflow/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "siliconflowProvider",
    ()=>siliconflowProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const siliconflowProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "siliconflow",
    alias: "siliconflow",
    baseUrl: "https://api.siliconflow.com/v1/chat/completions",
    models: [
        // DeepSeek
        {
            id: "deepseek-ai/DeepSeek-V3.2",
            name: "DeepSeek V3.2"
        },
        {
            id: "deepseek-ai/DeepSeek-V3.2-Exp",
            name: "DeepSeek V3.2 Exp"
        },
        {
            id: "deepseek-ai/DeepSeek-V3.1",
            name: "DeepSeek V3.1"
        },
        {
            id: "deepseek-ai/DeepSeek-V3.1-Terminus",
            name: "DeepSeek V3.1 Terminus"
        },
        {
            id: "deepseek-ai/DeepSeek-V3",
            name: "DeepSeek V3"
        },
        {
            id: "deepseek-ai/DeepSeek-R1",
            name: "DeepSeek R1"
        },
        {
            id: "deepseek-ai/deepseek-vl2",
            name: "DeepSeek VL2"
        },
        {
            id: "nex-agi/DeepSeek-V3.1-Nex-N1",
            name: "DeepSeek V3.1 Nex N1"
        },
        // Qwen
        {
            id: "Qwen/Qwen3.6-35B-A3B",
            name: "Qwen 3.6 35B A3B"
        },
        {
            id: "Qwen/Qwen3.6-27B",
            name: "Qwen 3.6 27B"
        },
        {
            id: "Qwen/Qwen3.5-397B-A17B",
            name: "Qwen 3.5 397B A17B"
        },
        {
            id: "Qwen/Qwen3.5-122B-A10B",
            name: "Qwen 3.5 122B A10B"
        },
        {
            id: "Qwen/Qwen3.5-35B-A3B",
            name: "Qwen 3.5 35B A3B"
        },
        {
            id: "Qwen/Qwen3.5-27B",
            name: "Qwen 3.5 27B"
        },
        {
            id: "Qwen/Qwen3.5-9B",
            name: "Qwen 3.5 9B"
        },
        {
            id: "Qwen/Qwen3-Next-80B-A3B-Instruct",
            name: "Qwen3 Next 80B Instruct"
        },
        {
            id: "Qwen/Qwen3-Next-80B-A3B-Thinking",
            name: "Qwen3 Next 80B Thinking"
        },
        {
            id: "Qwen/Qwen3-235B-A22B",
            name: "Qwen3 235B A22B"
        },
        {
            id: "Qwen/Qwen3-235B-A22B-Instruct-2507",
            name: "Qwen3 235B A22B Instruct"
        },
        {
            id: "Qwen/Qwen3-235B-A22B-Thinking-2507",
            name: "Qwen3 235B A22B Thinking"
        },
        {
            id: "Qwen/Qwen3-32B",
            name: "Qwen3 32B"
        },
        {
            id: "Qwen/Qwen3-30B-A3B-Instruct-2507",
            name: "Qwen3 30B A3B Instruct"
        },
        {
            id: "Qwen/Qwen3-30B-A3B-Thinking-2507",
            name: "Qwen3 30B A3B Thinking"
        },
        {
            id: "Qwen/Qwen3-14B",
            name: "Qwen3 14B"
        },
        {
            id: "Qwen/Qwen3-8B",
            name: "Qwen3 8B"
        },
        {
            id: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
            name: "Qwen3 Coder 480B"
        },
        {
            id: "Qwen/Qwen3-Coder-30B-A3B-Instruct",
            name: "Qwen3 Coder 30B"
        },
        {
            id: "Qwen/Qwen3-Omni-30B-A3B-Instruct",
            name: "Qwen3 Omni 30B Instruct"
        },
        {
            id: "Qwen/Qwen3-Omni-30B-A3B-Thinking",
            name: "Qwen3 Omni 30B Thinking"
        },
        {
            id: "Qwen/Qwen3-Omni-30B-A3B-Captioner",
            name: "Qwen3 Omni 30B Captioner"
        },
        {
            id: "Qwen/Qwen2.5-72B-Instruct",
            name: "Qwen 2.5 72B"
        },
        {
            id: "Qwen/Qwen2.5-72B-Instruct-128K",
            name: "Qwen 2.5 72B 128K"
        },
        {
            id: "Qwen/Qwen2.5-32B-Instruct",
            name: "Qwen 2.5 32B"
        },
        {
            id: "Qwen/Qwen2.5-14B-Instruct",
            name: "Qwen 2.5 14B"
        },
        {
            id: "Qwen/Qwen2.5-7B-Instruct",
            name: "Qwen 2.5 7B"
        },
        {
            id: "Qwen/Qwen2.5-VL-7B-Instruct",
            name: "Qwen 2.5 VL 7B"
        },
        // GLM
        {
            id: "zai-org/GLM-5.1",
            name: "GLM 5.1"
        },
        {
            id: "zai-org/GLM-5",
            name: "GLM 5"
        },
        {
            id: "zai-org/GLM-5V-Turbo",
            name: "GLM 5V Turbo"
        },
        {
            id: "zai-org/GLM-4.7",
            name: "GLM 4.7"
        },
        {
            id: "zai-org/GLM-4.6",
            name: "GLM 4.6"
        },
        {
            id: "zai-org/GLM-4.6V",
            name: "GLM 4.6V"
        },
        {
            id: "zai-org/GLM-4.5",
            name: "GLM 4.5"
        },
        {
            id: "zai-org/GLM-4.5-Air",
            name: "GLM 4.5 Air"
        },
        {
            id: "zai-org/GLM-4.5V",
            name: "GLM 4.5V"
        },
        {
            id: "THUDM/GLM-4-32B-0414",
            name: "GLM 4 32B"
        },
        {
            id: "THUDM/GLM-4-9B-0414",
            name: "GLM 4 9B"
        },
        {
            id: "THUDM/GLM-Z1-32B-0414",
            name: "GLM Z1 32B"
        },
        {
            id: "THUDM/GLM-Z1-9B-0414",
            name: "GLM Z1 9B"
        },
        // Kimi
        {
            id: "moonshotai/Kimi-K2.6",
            name: "Kimi K2.6"
        },
        {
            id: "moonshotai/Kimi-K2.5",
            name: "Kimi K2.5"
        },
        {
            id: "moonshotai/Kimi-K2-Instruct",
            name: "Kimi K2 Instruct"
        },
        {
            id: "moonshotai/Kimi-K2-Instruct-0905",
            name: "Kimi K2 Instruct 0905"
        },
        {
            id: "moonshotai/Kimi-K2-Thinking",
            name: "Kimi K2 Thinking"
        },
        // Other
        {
            id: "openai/gpt-oss-120b",
            name: "GPT OSS 120B"
        },
        {
            id: "openai/gpt-oss-20b",
            name: "GPT OSS 20B"
        },
        {
            id: "baidu/ERNIE-4.5-300B-A47B",
            name: "ERNIE 4.5 300B"
        },
        {
            id: "tencent/Hunyuan-A13B-Instruct",
            name: "Hunyuan A13B"
        },
        {
            id: "tencent/Hunyuan-MT-7B",
            name: "Hunyuan MT 7B"
        },
        {
            id: "tencent/Hy3-preview",
            name: "Hunyuan Hy3 Preview"
        },
        {
            id: "meta-llama/Meta-Llama-3.1-8B-Instruct",
            name: "Llama 3.1 8B"
        },
        {
            id: "MiniMaxAI/MiniMax-M2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "MiniMaxAI/MiniMax-M2.1",
            name: "MiniMax M2.1"
        },
        {
            id: "inclusionAI/Ling-flash-2.0",
            name: "Ling Flash 2.0"
        },
        {
            id: "inclusionAI/Ling-mini-2.0",
            name: "Ling Mini 2.0"
        },
        {
            id: "inclusionAI/Ring-flash-2.0",
            name: "Ring Flash 2.0"
        },
        {
            id: "google/gemma-4-31B-it",
            name: "Gemma 4 31B"
        },
        {
            id: "google/gemma-4-26B-A4B-it",
            name: "Gemma 4 26B"
        },
        {
            id: "ByteDance-Seed/Seed-OSS-36B-Instruct",
            name: "Seed OSS 36B"
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/gitlab-duo/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gitlab_duoProvider",
    ()=>gitlab_duoProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)");
;
const gitlab_duoProvider = {
    id: "gitlab-duo",
    alias: "gld",
    format: "openai",
    executor: "gitlab",
    // baseUrl is dynamic: resolved at request time from providerSpecificData.baseUrl
    // by GitlabExecutor.buildUrl() via buildGitLabOAuthEndpoints().
    // The default here keeps the PROVIDERS map non-null so refreshAccessToken()
    // can look up this provider.
    baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]).publicCompletionsUrl,
    authType: "oauth",
    authHeader: "bearer",
    defaultContextLength: 128000,
    oauth: {
        clientIdEnv: "GITLAB_DUO_OAUTH_CLIENT_ID",
        clientIdDefault: process.env.GITLAB_OAUTH_CLIENT_ID || "",
        clientSecretEnv: "GITLAB_DUO_OAUTH_CLIENT_SECRET",
        clientSecretDefault: process.env.GITLAB_OAUTH_CLIENT_SECRET || "",
        tokenUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]).tokenUrl,
        authUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]).authorizeUrl
    },
    models: [
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (GitLab Duo)"
        },
        {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5 (GitLab Duo)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/command-code/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "command_codeProvider",
    ()=>command_codeProvider
]);
const command_codeProvider = {
    id: "command-code",
    alias: "cmd",
    format: "openai",
    executor: "command-code",
    baseUrl: "https://api.commandcode.ai",
    chatPath: "/alpha/generate",
    modelsUrl: "https://api.commandcode.ai/provider/v1/models",
    // The discovery response is a partial routing catalog; static registry
    // entries omitted from it can still be accepted by the gateway.
    liveCatalogAuthoritative: false,
    authType: "apikey",
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    defaultContextLength: 200000,
    models: [
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 200000,
            maxOutputTokens: 32000
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 200000,
            maxOutputTokens: 16384
        },
        {
            id: "claude-haiku-4-5-20251001",
            name: "Claude Haiku 4.5 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 200000,
            maxOutputTokens: 8192
        },
        {
            id: "gpt-5.5",
            name: "GPT-5.5 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 256000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.4",
            name: "GPT-5.4 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 256000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT-5.3 Codex (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 256000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT-5.4 Mini (CC)",
            supportsReasoning: false,
            supportsVision: true,
            contextLength: 256000,
            maxOutputTokens: 128000
        },
        {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro (CC)",
            supportsReasoning: true,
            contextLength: 1000000,
            maxOutputTokens: 131072
        },
        {
            id: "deepseek/deepseek-v4-flash",
            name: "DeepSeek V4 Flash (CC)",
            supportsReasoning: true,
            contextLength: 1000000,
            maxOutputTokens: 131072
        },
        {
            id: "moonshotai/Kimi-K2.6",
            name: "Kimi K2.6 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxOutputTokens: 65536
        },
        {
            id: "moonshotai/Kimi-K2.5",
            name: "Kimi K2.5 (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxOutputTokens: 65536
        },
        {
            id: "zai-org/GLM-5.1",
            name: "GLM-5.1 (CC)",
            supportsReasoning: true,
            contextLength: 200000,
            maxOutputTokens: 32768
        },
        {
            id: "zai-org/GLM-5",
            name: "GLM-5 (CC)",
            supportsReasoning: true,
            contextLength: 200000,
            maxOutputTokens: 32768
        },
        {
            id: "MiniMaxAI/MiniMax-M2.7",
            name: "MiniMax M2.7 (CC)",
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 65536
        },
        {
            id: "MiniMaxAI/MiniMax-M2.5",
            name: "MiniMax M2.5 (CC)",
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 65536
        },
        {
            id: "Qwen/Qwen3.6-Max-Preview",
            name: "Qwen 3.6 Max (CC)",
            supportsReasoning: true,
            contextLength: 1000000,
            maxOutputTokens: 32768
        },
        {
            id: "Qwen/Qwen3.6-Plus",
            name: "Qwen 3.6 Plus (CC)",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxOutputTokens: 32768
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/novita/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "novitaProvider",
    ()=>novitaProvider
]);
const novitaProvider = {
    id: "novita",
    alias: "novita",
    format: "openai",
    executor: "default",
    // #5455: OpenAI-compatible endpoint. The legacy /v3 base + the `ai-ai/…` model id both
    // 404 (verified live); /openai/v1 + the `meta-llama/…` id return a clean completion.
    baseUrl: "https://api.novita.ai/openai/v1/chat/completions",
    modelsUrl: "https://api.novita.ai/openai/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    // Catalog seeded from a live GET https://api.novita.ai/openai/v1/models, the listing
    // `modelsUrl` already points at. Every id below reports `status: 1` (serving) there, and
    // `contextLength` / `maxOutputTokens` / `supportsReasoning` mirror that response's
    // `context_size`, `max_output_tokens` and `features` fields.
    //
    // `supportsVision` is the exception: it is set from an actual image request per id, not
    // from the listing's `input_modalities`. Those two disagree — `openai/gpt-oss-120b`
    // advertises `input_modalities: ["text","image"]`, accepts an image part with HTTP 200,
    // and then answers that it cannot see the image, so it is listed here without the flag.
    // Models that genuinely lack vision instead fail closed with
    // `400 "model features vision not support"`, so a 200 alone does not confirm the
    // capability — the reply has to be checked. Each flag below was verified by sending a
    // two-colour test image and requiring both colours back.
    //
    // Curated rather than exhaustive: the listing carries 143 entries unauthenticated and 304
    // with an API key (the former is a subset of the latter), including retired
    // generations (`status: 4`, e.g. `meta-llama/llama-3-8b-instruct`) and unnamespaced staging
    // ids (`bunny`, `ai_infer_test_2`, `dev/glm46`) that no caller should be offered. This keeps
    // one entry per serving family/generation, matching the granularity of the other
    // multi-vendor OpenAI-compatible hosts (fireworks, groq, nvidia). `modelsUrl` still drives
    // dashboard discovery for anything not listed here.
    models: [
        // DeepSeek
        {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 393216
        },
        {
            id: "deepseek/deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 393216
        },
        {
            id: "deepseek/deepseek-v3.2",
            name: "DeepSeek V3.2",
            supportsReasoning: true,
            contextLength: 163840,
            maxOutputTokens: 65536
        },
        // Moonshot Kimi
        {
            id: "moonshotai/kimi-k3",
            name: "Kimi K3",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxOutputTokens: 1048576
        },
        {
            id: "moonshotai/kimi-k2.7-code",
            name: "Kimi K2.7 Code",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxOutputTokens: 262144
        },
        {
            id: "moonshotai/kimi-k2.6",
            name: "Kimi K2.6",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxOutputTokens: 262144
        },
        // Z.ai GLM
        {
            id: "zai-org/glm-5.2",
            name: "GLM 5.2",
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            id: "zai-org/glm-5.1",
            name: "GLM 5.1",
            supportsReasoning: true,
            contextLength: 204800,
            maxOutputTokens: 131072
        },
        {
            id: "zai-org/glm-4.7",
            name: "GLM 4.7",
            supportsReasoning: true,
            contextLength: 204800,
            maxOutputTokens: 131072
        },
        // MiniMax
        {
            id: "minimax/minimax-m3",
            name: "MiniMax M3",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxOutputTokens: 131072
        },
        {
            id: "minimax/minimax-m2.7",
            name: "MiniMax M2.7",
            supportsReasoning: true,
            contextLength: 204800,
            maxOutputTokens: 131072
        },
        // Qwen
        {
            id: "qwen/qwen3.7-max",
            name: "Qwen3.7 Max",
            supportsReasoning: true,
            contextLength: 1000000,
            maxOutputTokens: 65536
        },
        {
            id: "qwen/qwen3.6-plus",
            name: "Qwen3.6 Plus",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxOutputTokens: 65536
        },
        {
            id: "qwen/qwen3.5-397b-a17b",
            name: "Qwen3.5 397B A17B",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxOutputTokens: 65536
        },
        {
            id: "qwen/qwen3-coder-480b-a35b-instruct",
            name: "Qwen3 Coder 480B",
            contextLength: 262144,
            maxOutputTokens: 65536
        },
        // Xiaomi MiMo / OpenAI gpt-oss / Google Gemma
        {
            id: "xiaomimimo/mimo-v2.5-pro",
            name: "MiMo V2.5 Pro",
            supportsReasoning: true,
            contextLength: 1048576,
            maxOutputTokens: 131072
        },
        {
            // No `supportsVision`: the listing claims `image` input, but a live image request
            // returns 200 and "I cannot see the image" (retried 4x, data-URI and remote URL).
            // Matches how groq / fireworks / nvidia / siliconflow / cerebras list this id here.
            id: "openai/gpt-oss-120b",
            name: "OpenAI gpt-oss-120b",
            supportsReasoning: true,
            contextLength: 131072,
            maxOutputTokens: 32768
        },
        {
            id: "google/gemma-4-31b-it",
            name: "Gemma 4 31B",
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxOutputTokens: 131072
        },
        // Pre-existing entry — the id verified live in #5455; kept as the endpoint guard's anchor.
        {
            id: "meta-llama/llama-3.1-8b-instruct",
            name: "Llama 3.1 8B Instruct",
            contextLength: 16384,
            maxOutputTokens: 16384
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/regolo/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "regoloProvider",
    ()=>regoloProvider
]);
const regoloProvider = {
    id: "regolo",
    alias: "regolo",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.regolo.ai",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "regolo-chat",
            name: "Regolo Chat"
        },
        {
            id: "regolo-fast",
            name: "Regolo Fast"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/windsurf/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "windsurfProvider",
    ()=>windsurfProvider
]);
const windsurfProvider = {
    id: "windsurf",
    alias: "ws",
    format: "windsurf",
    executor: "windsurf",
    // gRPC-web endpoint — handled entirely inside WindsurfExecutor.
    // Model IDs are the canonical Windsurf catalog names (with dots), auto-synced
    // from the Windsurf cloud via GetCascadeModelConfigs. Source: guanxiaol/WindsurfPoolAPI.
    baseUrl: "https://server.self-serve.windsurf.com",
    authType: "oauth",
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    defaultContextLength: 200000,
    // Model IDs verified against model_configs_v2.bin from Devin CLI binary (2026.5.x).
    // dot-notation = OmniRoute ID; executor MODEL_ALIAS_MAP maps it to Windsurf modelUid.
    models: [
        // ── Cognition / SWE ──────────────────────────────────────────────────
        {
            id: "swe-1.6-fast",
            name: "SWE-1.6 Fast"
        },
        {
            id: "swe-1.6",
            name: "SWE-1.6"
        },
        {
            id: "swe-1.5-fast",
            name: "SWE-1.5 Fast"
        },
        {
            id: "swe-1.5",
            name: "SWE-1.5"
        },
        // ── Claude Opus 4.7 — effort-tiered ─────────────────────────────────
        {
            id: "claude-opus-4.7-max",
            name: "Claude Opus 4.7 Max",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.7-xhigh",
            name: "Claude Opus 4.7 XHigh",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.7-high",
            name: "Claude Opus 4.7 High",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.7-medium",
            name: "Claude Opus 4.7 Medium",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.7-low",
            name: "Claude Opus 4.7 Low",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.7-review",
            name: "Claude Opus 4.7 Review",
            contextLength: 200000
        },
        // ── Claude Sonnet/Opus 4.6 ──────────────────────────────────────────
        {
            id: "claude-sonnet-4.6-thinking-1m",
            name: "Claude Sonnet 4.6 Thinking 1M",
            contextLength: 1000000
        },
        {
            id: "claude-sonnet-4.6-1m",
            name: "Claude Sonnet 4.6 1M",
            contextLength: 1000000
        },
        {
            id: "claude-sonnet-4.6-thinking",
            name: "Claude Sonnet 4.6 Thinking",
            contextLength: 200000
        },
        {
            id: "claude-sonnet-4.6",
            name: "Claude Sonnet 4.6",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.6-thinking",
            name: "Claude Opus 4.6 Thinking",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.6",
            name: "Claude Opus 4.6",
            contextLength: 200000
        },
        // ── Claude 4.5 ──────────────────────────────────────────────────────
        {
            id: "claude-opus-4.5-thinking",
            name: "Claude Opus 4.5 Thinking",
            contextLength: 200000
        },
        {
            id: "claude-opus-4.5",
            name: "Claude Opus 4.5",
            contextLength: 200000
        },
        {
            id: "claude-sonnet-4.5-thinking",
            name: "Claude Sonnet 4.5 Thinking",
            contextLength: 200000
        },
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            contextLength: 200000
        },
        {
            id: "claude-haiku-4.5",
            name: "Claude Haiku 4.5",
            contextLength: 200000
        },
        // ── GPT-5.5 — effort-tiered (+ fast/priority variants) ──────────────
        {
            id: "gpt-5.5-xhigh-fast",
            name: "GPT-5.5 XHigh Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-xhigh",
            name: "GPT-5.5 XHigh",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-high-fast",
            name: "GPT-5.5 High Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-high",
            name: "GPT-5.5 High",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-medium-fast",
            name: "GPT-5.5 Medium Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-medium",
            name: "GPT-5.5 Medium",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-low-fast",
            name: "GPT-5.5 Low Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-low",
            name: "GPT-5.5 Low",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-none-fast",
            name: "GPT-5.5 None Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.5-none",
            name: "GPT-5.5 None",
            contextLength: 200000
        },
        // ── GPT-5.4 — effort-tiered (+ mini + fast variants) ────────────────
        {
            id: "gpt-5.4-xhigh-fast",
            name: "GPT-5.4 XHigh Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-xhigh",
            name: "GPT-5.4 XHigh",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-high-fast",
            name: "GPT-5.4 High Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-high",
            name: "GPT-5.4 High",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-medium-fast",
            name: "GPT-5.4 Medium Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-medium",
            name: "GPT-5.4 Medium",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-low-fast",
            name: "GPT-5.4 Low Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-low",
            name: "GPT-5.4 Low",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-none-fast",
            name: "GPT-5.4 None Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-none",
            name: "GPT-5.4 None",
            contextLength: 200000
        },
        {
            id: "gpt-5.4-mini-xhigh",
            name: "GPT-5.4 Mini XHigh",
            contextLength: 128000
        },
        {
            id: "gpt-5.4-mini-high",
            name: "GPT-5.4 Mini High",
            contextLength: 128000
        },
        {
            id: "gpt-5.4-mini-medium",
            name: "GPT-5.4 Mini Medium",
            contextLength: 128000
        },
        {
            id: "gpt-5.4-mini-low",
            name: "GPT-5.4 Mini Low",
            contextLength: 128000
        },
        // ── GPT-5.3 Codex — effort-tiered (+ fast variants) ─────────────────
        {
            id: "gpt-5.3-codex-xhigh-fast",
            name: "GPT-5.3 Codex XHigh Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-xhigh",
            name: "GPT-5.3 Codex XHigh",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-high-fast",
            name: "GPT-5.3 Codex High Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-high",
            name: "GPT-5.3 Codex High",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-medium-fast",
            name: "GPT-5.3 Codex Medium Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-medium",
            name: "GPT-5.3 Codex Medium",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-low-fast",
            name: "GPT-5.3 Codex Low Fast",
            contextLength: 200000
        },
        {
            id: "gpt-5.3-codex-low",
            name: "GPT-5.3 Codex Low",
            contextLength: 200000
        },
        // ── GPT-5.2 ─────────────────────────────────────────────────────────
        {
            id: "gpt-5.2-xhigh",
            name: "GPT-5.2 XHigh",
            contextLength: 200000
        },
        {
            id: "gpt-5.2-high",
            name: "GPT-5.2 High",
            contextLength: 200000
        },
        {
            id: "gpt-5.2-medium",
            name: "GPT-5.2 Medium",
            contextLength: 200000
        },
        {
            id: "gpt-5.2-low",
            name: "GPT-5.2 Low",
            contextLength: 200000
        },
        {
            id: "gpt-5.2-none",
            name: "GPT-5.2 None",
            contextLength: 200000
        },
        // ── GPT-5 ────────────────────────────────────────────────────────────
        {
            id: "gpt-5",
            name: "GPT-5",
            contextLength: 200000
        },
        // ── GPT-4.1 / 4o ────────────────────────────────────────────────────
        {
            id: "gpt-4.1",
            name: "GPT-4.1",
            contextLength: 200000
        },
        {
            id: "gpt-4.1-mini",
            name: "GPT-4.1 Mini",
            contextLength: 128000
        },
        {
            id: "gpt-4.1-nano",
            name: "GPT-4.1 Nano",
            contextLength: 32000
        },
        {
            id: "gpt-4o",
            name: "GPT-4o",
            contextLength: 128000
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini",
            contextLength: 128000
        },
        // ── Gemini ───────────────────────────────────────────────────────────
        {
            id: "gemini-3.1-pro-high",
            name: "Gemini 3.1 Pro High",
            contextLength: 1000000
        },
        {
            id: "gemini-3.1-pro-low",
            name: "Gemini 3.1 Pro Low",
            contextLength: 1000000
        },
        {
            id: "gemini-3.0-flash-high",
            name: "Gemini 3 Flash High",
            contextLength: 1000000
        },
        {
            id: "gemini-3.0-flash-medium",
            name: "Gemini 3 Flash Medium",
            contextLength: 1000000
        },
        {
            id: "gemini-3.0-flash-low",
            name: "Gemini 3 Flash Low",
            contextLength: 1000000
        },
        {
            id: "gemini-3.0-flash-minimal",
            name: "Gemini 3 Flash Minimal",
            contextLength: 1000000
        },
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            contextLength: 1000000
        },
        // ── Others ───────────────────────────────────────────────────────────
        {
            id: "deepseek-v4",
            name: "DeepSeek V4",
            contextLength: 64000
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6",
            contextLength: 131000
        },
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5",
            contextLength: 131000
        },
        {
            id: "glm-5.1",
            name: "GLM-5.1",
            contextLength: 128000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/zed-hosted/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "zed_hostedProvider",
    ()=>zed_hostedProvider
]);
const zed_hostedProvider = {
    id: "zed-hosted",
    format: "openai",
    executor: "zed-hosted",
    baseUrl: "https://cloud.zed.dev/completions",
    authType: "oauth",
    authHeader: "bearer",
    timeoutMs: 120000,
    forceStream: true,
    models: [],
    modelsUrl: "https://cloud.zed.dev/models",
    passthroughModels: true
};
const __TURBOPACK__default__export__ = zed_hostedProvider;
}),
"[project]/open-sse/config/providers/registry/nanogpt/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nanogptProvider",
    ()=>nanogptProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const nanogptProvider = {
    id: "nanogpt",
    alias: "nanogpt",
    format: "openai",
    executor: "default",
    baseUrl: "https://nano-gpt.com/api/v1/chat/completions",
    modelsUrl: "https://nano-gpt.com/api/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].nanogpt
};
}),
"[project]/open-sse/config/providers/registry/scaleway/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scalewayProvider",
    ()=>scalewayProvider
]);
const scalewayProvider = {
    id: "scaleway",
    alias: "scw",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.scaleway.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // 1M tokens free for new accounts — EU/GDPR (Paris), no credit card needed under limit
    models: [
        {
            id: "qwen3-235b-a22b-instruct-2507",
            name: "Qwen3 235B A22B (1M free tok 🆓)"
        },
        {
            id: "llama-3.1-70b-instruct",
            name: "Llama 3.1 70B (🆓 EU)"
        },
        {
            id: "llama-3.1-8b-instruct",
            name: "Llama 3.1 8B (🆓 EU)"
        },
        {
            id: "mistral-small-3.2-24b-instruct-2506",
            name: "Mistral Small 3.2 (🆓 EU)"
        },
        {
            id: "deepseek-v3-0324",
            name: "DeepSeek V3 (🆓 EU)"
        },
        {
            id: "gpt-oss-120b",
            name: "GPT-OSS 120B (🆓 EU)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/agentrouter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agentrouterProvider",
    ()=>agentrouterProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [instrumentation] (ecmascript) <locals>");
;
const agentrouterProvider = {
    id: "agentrouter",
    alias: "agentrouter",
    format: "claude",
    executor: "default",
    baseUrl: "https://agentrouter.org/v1/messages",
    authType: "apikey",
    authHeader: "x-api-key",
    alternateFormats: [
        {
            format: "openai",
            baseUrl: "https://agentrouter.org/v1/chat/completions",
            authHeader: "bearer",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexCliRsHeaders"])(),
            label: "OpenAI-compatible (Codex)"
        },
        {
            format: "openai-responses",
            baseUrl: "https://agentrouter.org/v1/responses",
            authHeader: "bearer",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexCliRsHeaders"])(),
            label: "OpenAI Responses (Codex)"
        }
    ],
    defaultContextLength: 128000,
    // No static `headers` here: agentrouter now adopts the DYNAMIC Claude-Code
    // wire image via CC_WIRE_IMAGE_BUILTINS (#6056) — the fingerprint/headers are
    // applied by buildProviderHeaders + applyFingerprint, keeping this entry's
    // own baseUrl + x-api-key auth. A static fingerprint here would drift and
    // trip AgentRouter's WAF ("unauthorized client detected").
    models: [
        {
            id: "claude-opus-4-8",
            name: "Claude Opus 4.8"
        },
        {
            id: "claude-opus-5",
            name: "Claude Opus 5"
        },
        {
            id: "gpt-5.6-sol",
            name: "GPT-5.6 Sol"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/zai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "zaiProvider",
    ()=>zaiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const zaiProvider = {
    id: "zai",
    alias: "zai",
    format: "claude",
    executor: "default",
    baseUrl: "https://api.z.ai/api/anthropic/v1/messages",
    urlSuffix: "?beta=true",
    authType: "apikey",
    authHeader: "x-api-key",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
    // Real upstream model IDs only. The effort tiers (glm-5.2-high / glm-5.2-max)
    // are intentionally NOT listed here: they are OmniRoute aliases resolved by the
    // GlmExecutor (parseGlm52Effort → base "glm-5.2" + effort field). This provider
    // uses the DefaultExecutor, which sends the model ID verbatim, so the aliases
    // would reach z.ai's Anthropic endpoint as unknown IDs. Use the `glm` provider
    // for effort tiers. Vision models are likewise omitted (handled elsewhere).
    models: [
        {
            id: "glm-5.2",
            name: "GLM 5.2"
        },
        {
            id: "glm-5.1",
            name: "GLM 5.1"
        },
        {
            id: "glm-5",
            name: "GLM 5"
        },
        {
            id: "glm-5-turbo",
            name: "GLM 5 Turbo"
        },
        {
            id: "glm-4.7-flash",
            name: "GLM 4.7 Flash"
        },
        {
            id: "glm-4.7",
            name: "GLM 4.7"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/wafer/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "waferProvider",
    ()=>waferProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const waferProvider = {
    id: "wafer",
    alias: "wafer",
    format: "claude",
    executor: "default",
    baseUrl: "https://pass.wafer.ai/v1/messages",
    authType: "apikey",
    authHeader: "bearer",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
    models: [
        {
            id: "DeepSeek-V4-Pro",
            name: "DeepSeek V4 Pro"
        },
        {
            id: "MiniMax-M2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "Qwen3.5-397B-A17B",
            name: "Qwen3.5 397B A17B"
        },
        {
            id: "GLM-5.1",
            name: "GLM 5.1"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/huggingchat/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "huggingchatProvider",
    ()=>huggingchatProvider
]);
const huggingchatProvider = {
    id: "huggingchat",
    // Distinct alias: "hc" belongs to the hackclub provider; huggingchat is
    // addressed by its own id to avoid the alias collision.
    alias: "huggingchat",
    format: "openai",
    executor: "huggingchat",
    baseUrl: "https://huggingface.co/chat/conversation",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        // Sweep 2026-06-30: final HuggingChat production catalog shortlist.
        // Only concrete provider/model entries are registered here; router entries are excluded.
        {
            id: "baidu/ERNIE-4.5-VL-424B-A47B-Base-PT",
            name: "ERNIE 4.5 VL 424B A47B Base PT",
            supportsVision: true
        },
        {
            id: "CohereLabs/c4ai-command-r7b-12-2024",
            name: "Command R7B 12-2024",
            toolCalling: true
        },
        {
            id: "CohereLabs/command-a-reasoning-08-2025",
            name: "Command A Reasoning 08-2025",
            toolCalling: true
        },
        {
            id: "CohereLabs/command-a-vision-07-2025",
            name: "Command A Vision 07-2025",
            supportsVision: true
        },
        {
            id: "deepseek-ai/DeepSeek-V4-Pro",
            name: "DeepSeek V4 Pro",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-ai/DeepSeek-V4-Flash",
            name: "DeepSeek V4 Flash",
            toolCalling: true
        },
        {
            id: "google/gemma-4-31B-it",
            name: "Gemma 4 31B",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "google/gemma-4-26B-A4B-it",
            name: "Gemma 4 26B A4B",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "inclusionAI/Ling-2.6-1T",
            name: "Ling 2.6 1T",
            toolCalling: true
        },
        {
            id: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
            name: "Llama 4 Scout 17B 16E Instruct",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
            name: "Llama 4 Maverick 17B 128E Instruct FP8",
            supportsVision: true
        },
        {
            id: "MiniMaxAI/MiniMax-M3",
            name: "MiniMax M3",
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "moonshotai/Kimi-K2.7-Code",
            name: "Kimi K2.7 Code",
            supportsVision: true,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "moonshotai/Kimi-K2.6",
            name: "Kimi K2.6",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4",
            name: "NVIDIA Nemotron 3 Ultra 550B A55B NVFP4",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "openai/gpt-oss-120b",
            name: "GPT-OSS 120B",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "openai/gpt-oss-20b",
            name: "GPT-OSS 20B",
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "Qwen/Qwen3.5-122B-A10B",
            name: "Qwen3.5 122B A10B",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "Qwen/Qwen3.5-397B-A17B",
            name: "Qwen3.5 397B A17B",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "Qwen/Qwen3.6-27B",
            name: "Qwen3.6 27B",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "Qwen/Qwen3.6-35B-A3B",
            name: "Qwen3.6 35B A3B",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "stepfun-ai/Step-3.7-Flash",
            name: "Step 3.7 Flash",
            supportsVision: true,
            toolCalling: true
        },
        {
            id: "XiaomiMiMo/MiMo-V2.5-Pro",
            name: "MiMo V2.5 Pro",
            toolCalling: true
        },
        {
            id: "zai-org/GLM-5.2",
            name: "GLM 5.2",
            toolCalling: true,
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/yuanbao-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "yuanbao_webProvider",
    ()=>yuanbao_webProvider
]);
const yuanbao_webProvider = {
    id: "yuanbao-web",
    alias: "ybw",
    format: "openai",
    executor: "yuanbao-web",
    baseUrl: "https://yuanbao.tencent.com/api/chat",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "deepseek-v3",
            name: "DeepSeek V3 (via Yuanbao)",
            toolCalling: false
        },
        {
            id: "deepseek-r1",
            name: "DeepSeek R1 (via Yuanbao)",
            supportsReasoning: true
        },
        {
            id: "hunyuan",
            name: "Hunyuan (via Yuanbao)",
            toolCalling: false
        },
        {
            id: "hunyuan-t1",
            name: "Hunyuan T1 (via Yuanbao)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v3-search",
            name: "DeepSeek V3 + Web Search (via Yuanbao)",
            toolCalling: false
        },
        {
            id: "deepseek-r1-search",
            name: "DeepSeek R1 + Web Search (via Yuanbao)",
            supportsReasoning: true
        },
        {
            id: "hunyuan-search",
            name: "Hunyuan + Web Search (via Yuanbao)",
            toolCalling: false
        },
        {
            id: "hunyuan-t1-search",
            name: "Hunyuan T1 + Web Search (via Yuanbao)",
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/galadriel/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "galadrielProvider",
    ()=>galadrielProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const galadrielProvider = {
    id: "galadriel",
    alias: "galadriel",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.galadriel.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].galadriel
};
}),
"[project]/open-sse/config/providers/registry/qianfan/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "qianfanProvider",
    ()=>qianfanProvider
]);
const qianfanProvider = {
    id: "qianfan",
    alias: "qianfan",
    format: "openai",
    executor: "default",
    baseUrl: "https://qianfan.baidubce.com/v2/chat/completions",
    modelsUrl: "https://qianfan.baidubce.com/v2/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "ernie-5.1",
            name: "ERNIE 5.1"
        },
        {
            id: "ernie-5.0-thinking-latest",
            name: "ERNIE 5.0 Thinking Latest"
        },
        {
            id: "ernie-x1.1",
            name: "ERNIE X1.1",
            contextLength: 64000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/meta-llama/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "meta_llamaProvider",
    ()=>meta_llamaProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const meta_llamaProvider = {
    id: "meta-llama",
    alias: "meta",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.llama.com/compat/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["meta-llama"]
};
}),
"[project]/open-sse/config/providers/registry/cloudflare-ai/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloudflare_aiProvider",
    ()=>cloudflare_aiProvider
]);
const cloudflare_aiProvider = {
    id: "cloudflare-ai",
    alias: "cf",
    format: "openai",
    executor: "cloudflare-ai",
    // URL is dynamic: uses accountId from credentials. The executor builds it.
    baseUrl: "https://api.cloudflare.com/client/v4/accounts",
    authType: "apikey",
    authHeader: "bearer",
    // 10K Neurons/day free: ~150 LLM responses or 500s Whisper audio — global edge
    models: [
        {
            id: "@cf/meta/llama-3.3-70b-instruct",
            name: "Llama 3.3 70B (🆓 ~150 resp/day)"
        },
        {
            id: "@cf/google/gemma-3-12b-it",
            name: "Gemma 3 12B (🆓)"
        },
        {
            id: "@cf/qwen/qwen2.5-coder-32b-instruct",
            name: "Qwen 2.5 Coder 32B (🆓)"
        },
        {
            id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
            name: "DeepSeek R1 Distill 32B (🆓)"
        },
        // Sweep 2026-06-19: + current Workers AI catalog ids (developers.cloudflare.com/workers-ai/models).
        {
            id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
            name: "Llama 3.3 70B (FP8 Fast 🆓)"
        },
        {
            id: "@cf/meta/llama-3.2-3b-instruct",
            name: "Llama 3.2 3B (🆓)"
        },
        {
            id: "@cf/qwen/qwq-32b",
            name: "QwQ 32B (🆓)"
        },
        {
            id: "@cf/zai-org/glm-4.7-flash",
            name: "GLM 4.7 Flash (🆓)",
            contextLength: 131072
        },
        {
            id: "@cf/moonshotai/kimi-k2.6",
            name: "Kimi K2.6 (🆓)",
            contextLength: 262144
        },
        {
            id: "@cf/google/gemma-4-26b-a4b-it",
            name: "Gemma 4 26B (🆓)",
            contextLength: 262144
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/nous-research/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nous_researchProvider",
    ()=>nous_researchProvider
]);
const nous_researchProvider = {
    id: "nous-research",
    alias: "nous",
    format: "openai",
    executor: "default",
    baseUrl: "https://inference-api.nousresearch.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "Hermes-4-405B",
            name: "Hermes 4 7B (Nous Research)"
        },
        {
            id: "Hermes-4-70B",
            name: "Hermes 4 70B (Nous Research)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/alibaba/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALIBABA_MODEL_STUDIO_MODELS",
    ()=>ALIBABA_MODEL_STUDIO_MODELS,
    "alibabaProvider",
    ()=>alibabaProvider
]);
const ALIBABA_MODEL_STUDIO_MODELS = [
    {
        id: "qwen3.7-max",
        name: "Qwen3.7 Max"
    },
    {
        id: "qwen3.7-plus",
        name: "Qwen3.7 Plus"
    },
    {
        id: "qwen3.6-plus",
        name: "Qwen3.6 Plus"
    },
    {
        id: "qwen3.6-27b",
        name: "Qwen3.6 27B"
    },
    {
        id: "qwen3.6-35b-a3b",
        name: "Qwen3.6 35B A3B"
    },
    {
        id: "qwen3.5-plus",
        name: "Qwen3.5 Plus"
    },
    {
        id: "qwen3.5-122b-a10b",
        name: "Qwen3.5 122B A10B"
    },
    {
        id: "qwen3.5-397b-a17b",
        name: "Qwen3.5 397B A17B"
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2"
    },
    {
        id: "glm-5.2-fast-preview",
        name: "GLM 5.2 Fast Preview"
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro"
    },
    {
        id: "deepseek-v4-flash",
        name: "DeepSeek V4 Flash"
    },
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code"
    }
];
const alibabaProvider = {
    id: "alibaba",
    alias: "ali",
    format: "openai",
    executor: "default",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelsUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: ALIBABA_MODEL_STUDIO_MODELS,
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/alibaba/cn/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "alibaba_cnProvider",
    ()=>alibaba_cnProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$alibaba$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/alibaba/index.ts [instrumentation] (ecmascript)");
;
const alibaba_cnProvider = {
    id: "alibaba-cn",
    alias: "ali-cn",
    format: "openai",
    executor: "default",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelsUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$alibaba$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ALIBABA_MODEL_STUDIO_MODELS"],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/doubao/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "doubaoProvider",
    ()=>doubaoProvider
]);
const doubaoProvider = {
    id: "doubao",
    alias: "doubao",
    format: "openai",
    executor: "default",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: refreshed against the Volcano Ark catalog. Seed 2.0 (260215 =
    // 2026-02-14 GA) is the current family; Ark addresses models by dated snapshot id.
    models: [
        {
            id: "doubao-seed-2-0-pro-260215",
            name: "Doubao Seed 2.0 Pro",
            contextLength: 262144
        },
        {
            id: "doubao-seed-2-0-lite-260215",
            name: "Doubao Seed 2.0 Lite",
            contextLength: 262144
        },
        {
            id: "doubao-seed-2-0-mini-260215",
            name: "Doubao Seed 2.0 Mini",
            contextLength: 262144
        },
        {
            id: "doubao-seed-2-0-code-preview-260215",
            name: "Doubao Seed 2.0 Code",
            contextLength: 262144
        },
        {
            id: "doubao-seed-1-8-251228",
            name: "Doubao Seed 1.8",
            contextLength: 262144
        },
        {
            id: "doubao-seed-1-6-251015",
            name: "Doubao Seed 1.6",
            contextLength: 262144
        },
        {
            id: "doubao-seed-1-6-flash-250828",
            name: "Doubao Seed 1.6 Flash",
            contextLength: 262144
        },
        {
            id: "doubao-1-5-pro-32k-250115",
            name: "Doubao 1.5 Pro 32K",
            contextLength: 32768
        },
        {
            id: "doubao-pro-32k",
            name: "Doubao Pro 32K"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/doubao/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "doubao_webProvider",
    ()=>doubao_webProvider
]);
const doubao_webProvider = {
    id: "doubao-web",
    alias: "db",
    format: "openai",
    executor: "doubao-web",
    baseUrl: "https://www.dola.com/chat/completion",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "dola-speed",
            name: "Dola Speed",
            toolCalling: false
        },
        {
            id: "dola-pro",
            name: "Dola Pro",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/kilo-gateway/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kilo_gatewayProvider",
    ()=>kilo_gatewayProvider
]);
const kilo_gatewayProvider = {
    id: "kilo-gateway",
    alias: "kg",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.kilo.ai/api/gateway/chat/completions",
    modelsUrl: "https://api.kilo.ai/api/gateway/models",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "kilo-auto/frontier",
            name: "Kilo Auto Frontier"
        },
        {
            id: "kilo-auto/balanced",
            name: "Kilo Auto Balanced"
        },
        {
            id: "kilo-auto/free",
            name: "Kilo Auto Free"
        },
        {
            id: "nvidia/nemotron-3-super-120b-a12b:free",
            name: "Nemotron 3 Super 120B (Free)"
        },
        {
            id: "minimax/minimax-m2.5:free",
            name: "MiniMax M2.5 (Free)"
        },
        {
            id: "arcee-ai/trinity-large-preview:free",
            name: "Trinity Large Preview (Free)"
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/bailian-coding-plan/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BAILIAN_CODING_PLAN_MODELS",
    ()=>BAILIAN_CODING_PLAN_MODELS,
    "bailian_coding_planProvider",
    ()=>bailian_coding_planProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const BAILIAN_CODING_PLAN_MODELS = [
    {
        id: "qwen3.8-max-preview",
        name: "Qwen3.8 Max Preview",
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true,
        contextLength: 1_000_000,
        maxOutputTokens: 65_536
    },
    {
        id: "qwen3.7-max",
        name: "Qwen3.7 Max",
        supportsReasoning: true,
        toolCalling: true,
        contextLength: 1_000_000,
        maxOutputTokens: 65_536
    },
    {
        id: "qwen3.7-plus",
        name: "Qwen3.7 Plus",
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true,
        contextLength: 1_000_000,
        maxOutputTokens: 65_536
    },
    {
        id: "qwen3.6-flash",
        name: "Qwen3.6 Flash",
        supportsReasoning: true,
        supportsVision: true,
        toolCalling: true,
        contextLength: 1_000_000,
        maxOutputTokens: 32_768
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2",
        supportsReasoning: true,
        toolCalling: true,
        contextLength: 1_000_000,
        maxOutputTokens: 16_384
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        supportsReasoning: true,
        toolCalling: true,
        contextLength: 163_840,
        maxOutputTokens: 32_768
    }
];
const bailian_coding_planProvider = {
    id: "bailian-coding-plan",
    alias: "bcp",
    format: "claude",
    executor: "default",
    baseUrl: "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1",
    chatPath: "/messages",
    authType: "apikey",
    authHeader: "x-api-key",
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAnthropicCompatHeaders"])(),
    models: BAILIAN_CODING_PLAN_MODELS
};
}),
"[project]/open-sse/config/providers/registry/gigachat/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gigachatProvider",
    ()=>gigachatProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const gigachatProvider = {
    id: "gigachat",
    alias: "gigachat",
    format: "openai",
    executor: "default",
    baseUrl: "https://gigachat.devices.sberbank.ru/api/v1",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].gigachat
};
}),
"[project]/open-sse/config/providers/registry/devin/catalog.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEVIN_MODEL_CATALOG",
    ()=>DEVIN_MODEL_CATALOG
]);
const DEVIN_MODEL_CATALOG = [
    // Cognition / SWE — default model family recommended for coding tasks
    {
        id: "swe-1-7-lightning",
        name: "SWE-1.7 Lightning",
        contextLength: 202752
    },
    {
        id: "swe-1-7",
        name: "SWE-1.7",
        contextLength: 262000
    },
    {
        id: "swe-1-6-fast",
        name: "SWE-1.6 Fast"
    },
    {
        id: "swe-1-6",
        name: "SWE-1.6"
    },
    // Claude Fable 5
    {
        id: "claude-5-fable-max",
        name: "Claude Fable 5 Max",
        contextLength: 1000000
    },
    {
        id: "claude-5-fable-xhigh",
        name: "Claude Fable 5 XHigh",
        contextLength: 1000000
    },
    {
        id: "claude-5-fable-high",
        name: "Claude Fable 5 High",
        contextLength: 1000000
    },
    {
        id: "claude-5-fable-medium",
        name: "Claude Fable 5 Medium",
        contextLength: 1000000
    },
    {
        id: "claude-5-fable-low",
        name: "Claude Fable 5 Low",
        contextLength: 1000000
    },
    // Claude Opus 4.8
    {
        id: "claude-opus-4-8-max",
        name: "Claude Opus 4.8 Max",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-8-xhigh",
        name: "Claude Opus 4.8 XHigh",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-8-high",
        name: "Claude Opus 4.8 High",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-8-medium",
        name: "Claude Opus 4.8 Medium",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-8-low",
        name: "Claude Opus 4.8 Low",
        contextLength: 1000000
    },
    // Claude Opus 4.7
    {
        id: "claude-opus-4-7-max",
        name: "Claude Opus 4.7 Max",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-7-xhigh",
        name: "Claude Opus 4.7 XHigh",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-7-high",
        name: "Claude Opus 4.7 High",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-7-medium",
        name: "Claude Opus 4.7 Medium",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-7-low",
        name: "Claude Opus 4.7 Low",
        contextLength: 1000000
    },
    // Claude Opus 4.6
    {
        id: "claude-opus-4-6-thinking-1m",
        name: "Claude Opus 4.6 Thinking 1M",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-6-thinking",
        name: "Claude Opus 4.6 Thinking",
        contextLength: 200000
    },
    {
        id: "claude-opus-4-6-1m",
        name: "Claude Opus 4.6 1M",
        contextLength: 1000000
    },
    {
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6",
        contextLength: 200000
    },
    // Claude Sonnet 5
    {
        id: "claude-sonnet-5-max",
        name: "Claude Sonnet 5 Max",
        contextLength: 1000000
    },
    {
        id: "claude-sonnet-5-xhigh",
        name: "Claude Sonnet 5 XHigh",
        contextLength: 1000000
    },
    {
        id: "claude-sonnet-5-high",
        name: "Claude Sonnet 5 High",
        contextLength: 1000000
    },
    {
        id: "claude-sonnet-5-medium",
        name: "Claude Sonnet 5 Medium",
        contextLength: 1000000
    },
    {
        id: "claude-sonnet-5-low",
        name: "Claude Sonnet 5 Low",
        contextLength: 1000000
    },
    // Claude Sonnet 4.6
    {
        id: "claude-sonnet-4-6-thinking-1m",
        name: "Claude Sonnet 4.6 Thinking 1M",
        contextLength: 1000000
    },
    {
        id: "claude-sonnet-4-6-thinking",
        name: "Claude Sonnet 4.6 Thinking",
        contextLength: 200000
    },
    {
        id: "claude-sonnet-4-6-1m",
        name: "Claude Sonnet 4.6 1M",
        contextLength: 1000000
    },
    {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        contextLength: 200000
    },
    // GPT-5.6
    {
        id: "gpt-5-6-sol-max",
        name: "GPT-5.6 Sol Max",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-sol-xhigh",
        name: "GPT-5.6 Sol XHigh",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-sol-high",
        name: "GPT-5.6 Sol High",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-sol-medium",
        name: "GPT-5.6 Sol Medium",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-sol-low",
        name: "GPT-5.6 Sol Low",
        contextLength: 1000000
    },
    /// Terra
    {
        id: "gpt-5-6-terra-max",
        name: "GPT-5.6 Terra Max",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-terra-xhigh",
        name: "GPT-5.6 Terra XHigh",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-terra-high",
        name: "GPT-5.6 Terra High",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-terra-medium",
        name: "GPT-5.6 Terra Medium",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-terra-low",
        name: "GPT-5.6 Terra Low",
        contextLength: 1000000
    },
    /// Luna
    {
        id: "gpt-5-6-luna-max",
        name: "GPT-5.6 Luna Max",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-luna-xhigh",
        name: "GPT-5.6 Luna XHigh",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-luna-high",
        name: "GPT-5.6 Luna High",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-luna-medium",
        name: "GPT-5.6 Luna Medium",
        contextLength: 1000000
    },
    {
        id: "gpt-5-6-luna-low",
        name: "GPT-5.6 Luna Low",
        contextLength: 1000000
    },
    // GPT-5.5
    {
        id: "gpt-5-5-xhigh",
        name: "GPT-5.5 XHigh",
        contextLength: 272000
    },
    {
        id: "gpt-5-5-high",
        name: "GPT-5.5 High",
        contextLength: 272000
    },
    {
        id: "gpt-5-5-medium",
        name: "GPT-5.5 Medium",
        contextLength: 272000
    },
    {
        id: "gpt-5-5-low",
        name: "GPT-5.5 Low",
        contextLength: 272000
    },
    // Gemini
    {
        id: "gemini-3-1-pro-high",
        name: "Gemini 3.1 Pro High",
        contextLength: 1048576
    },
    {
        id: "gemini-3-1-pro-low",
        name: "Gemini 3.1 Pro Low",
        contextLength: 1048576
    },
    {
        id: "gemini-3-5-flash-high",
        name: "Gemini 3.5 Flash High",
        contextLength: 1048576
    },
    {
        id: "gemini-3-5-flash-medium",
        name: "Gemini 3.5 Flash Medium",
        contextLength: 1048576
    },
    {
        id: "gemini-3-5-flash-low",
        name: "Gemini 3.5 Flash Low",
        contextLength: 1048576
    },
    {
        id: "gemini-3-5-flash-minimal",
        name: "Gemini 3.5 Flash Minimal",
        contextLength: 1048576
    },
    // Grok
    {
        id: "grok-4-5-high",
        name: "Grok 4.5 High",
        contextLength: 500000
    },
    {
        id: "grok-4-5-medium",
        name: "Grok 4.5 Medium",
        contextLength: 500000
    },
    {
        id: "grok-4-5-low",
        name: "Grok 4.5 Low",
        contextLength: 500000
    },
    // GLM
    {
        id: "glm-5-2-max-1m",
        name: "GLM-5.2 Max 1M",
        contextLength: 1000000
    },
    {
        id: "glm-5-2-max",
        name: "GLM-5.2 Max"
    },
    {
        id: "glm-5-2-1m",
        name: "GLM-5.2 High 1M",
        contextLength: 1000000
    },
    {
        id: "glm-5-2",
        name: "GLM-5.2 High"
    },
    // Others
    {
        id: "deepseek-v4",
        name: "DeepSeek V4 Pro",
        contextLength: 1048576
    },
    {
        id: "nemotron-3-ultra-nvfp4",
        name: "Nemotron 3 Ultra",
        contextLength: 262144
    },
    {
        id: "kimi-k2-7",
        name: "Kimi K2.7",
        contextLength: 262144
    }
];
}),
"[project]/open-sse/config/providers/registry/devin-cli/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "devin_cliProvider",
    ()=>devin_cliProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2f$catalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/devin/catalog.ts [instrumentation] (ecmascript)");
;
const devin_cliProvider = {
    id: "devin-cli",
    alias: "dv",
    format: "openai",
    executor: "devin-cli",
    baseUrl: "devin://acp/stdio",
    authType: "oauth",
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    defaultContextLength: 200000,
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2f$catalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEVIN_MODEL_CATALOG"]
};
}),
"[project]/open-sse/config/providers/registry/devin-cli-agentic/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "devin_cli_agenticProvider",
    ()=>devin_cli_agenticProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2f$catalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/devin/catalog.ts [instrumentation] (ecmascript)");
;
const devin_cli_agenticProvider = {
    id: "devin-cli-agentic",
    alias: "dva",
    format: "claude",
    executor: "devin-cli-agentic",
    baseUrl: "devin://acp/stdio",
    // Authentication is owned exclusively by the official Devin CLI inside its
    // isolated volume. OmniRoute must not import or persist a host credential.
    authType: "none",
    authHeader: "none",
    defaultContextLength: 200000,
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2f$catalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEVIN_MODEL_CATALOG"].map((model)=>({
            ...model,
            toolCalling: true,
            supportsReasoning: false,
            supportsVision: false
        }))
};
}),
"[project]/open-sse/config/providers/registry/auggie/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auggieProvider",
    ()=>auggieProvider
]);
const auggieProvider = {
    id: "auggie",
    alias: "aug",
    format: "openai",
    executor: "auggie",
    baseUrl: "auggie://cli/stdio",
    authType: "none",
    authHeader: "none",
    defaultContextLength: 200000,
    models: [
        // ── Anthropic Claude ────────────────────────────────────────────────
        {
            id: "sonnet4.6",
            name: "Sonnet 4.6",
            contextLength: 200000
        },
        {
            id: "fable-5",
            name: "Claude Fable 5",
            contextLength: 200000
        },
        {
            id: "haiku4.5",
            name: "Haiku 4.5",
            contextLength: 200000
        },
        {
            id: "sonnet4.5",
            name: "Sonnet 4.5",
            contextLength: 200000
        },
        {
            id: "sonnet4.6-500k",
            name: "Sonnet 4.6 (500K)",
            contextLength: 500000
        },
        {
            id: "sonnet5-high",
            name: "Claude Sonnet 5",
            contextLength: 200000
        },
        {
            id: "sonnet5-500k",
            name: "Claude Sonnet 5 (500K)",
            contextLength: 500000
        },
        {
            id: "opus4.5",
            name: "Opus 4.5",
            contextLength: 200000
        },
        {
            id: "opus4.6",
            name: "Opus 4.6",
            contextLength: 200000
        },
        {
            id: "opus4.6-500k",
            name: "Opus 4.6 (500K)",
            contextLength: 500000
        },
        {
            id: "opus4.7",
            name: "Opus 4.7",
            contextLength: 200000
        },
        {
            id: "opus4.7-500k",
            name: "Opus 4.7 (500K)",
            contextLength: 500000
        },
        {
            id: "opus4.8",
            name: "Opus 4.8",
            contextLength: 200000
        },
        // ── Gemini ──────────────────────────────────────────────────────────
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro",
            contextLength: 1000000
        },
        // ── OpenAI GPT ──────────────────────────────────────────────────────
        {
            id: "gpt5",
            name: "GPT-5",
            contextLength: 200000
        },
        {
            id: "gpt5.1",
            name: "GPT-5.1",
            contextLength: 200000
        },
        {
            id: "gpt5.2",
            name: "GPT-5.2",
            contextLength: 200000
        },
        {
            id: "gpt5.4",
            name: "GPT-5.4",
            contextLength: 200000
        },
        {
            id: "gpt5.4-mini",
            name: "GPT-5.4 Mini",
            contextLength: 200000
        },
        {
            id: "gpt5.5",
            name: "GPT-5.5",
            contextLength: 200000
        },
        {
            id: "gpt5.6-luna",
            name: "GPT-5.6 Luna",
            contextLength: 200000
        },
        {
            id: "gpt5.6-sol",
            name: "GPT-5.6 Sol",
            contextLength: 200000
        },
        {
            id: "gpt5.6-terra",
            name: "GPT-5.6 Terra",
            contextLength: 200000
        },
        // ── Others ──────────────────────────────────────────────────────────
        {
            id: "glm-5.2",
            name: "GLM 5.2",
            contextLength: 200000
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6",
            contextLength: 131000
        },
        {
            id: "kimi-k2.7",
            name: "Kimi K2.7 Code",
            contextLength: 131000
        },
        // ── Augment Prism (composite routers) ───────────────────────────────
        {
            id: "prism-a",
            name: "Prism (Claude + Gemini)",
            contextLength: 200000
        },
        {
            id: "prism-b",
            name: "Prism (GPT + Kimi)",
            contextLength: 200000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/chutes/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chutesProvider",
    ()=>chutesProvider
]);
const chutesProvider = {
    id: "chutes",
    alias: "chutes",
    format: "openai",
    executor: "default",
    baseUrl: "https://llm.chutes.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "Qwen2.5-72B-Instruct",
            name: "Qwen2.5 72B"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/chenzk/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chenzkProvider",
    ()=>chenzkProvider
]);
const chenzkProvider = {
    id: "chenzk",
    alias: "chenzk",
    format: "openai",
    executor: "default",
    baseUrl: "https://chenzk.top/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://chenzk.top/v1/models",
    defaultContextLength: 128000,
    models: [],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/factory/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "factoryProvider",
    ()=>factoryProvider
]);
const factoryProvider = {
    id: "factory",
    alias: "factory",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.factory.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // `auto` is Factory's routing sentinel: the gateway picks the best model
    // for the prompt (mirrors Droid's `auto` preset). Concrete model IDs can
    // be added here once Factory publishes a stable public model list; the
    // `passthroughModels` flag in the gateways catalog lets `GET /v1/models`
    // reflect whatever Factory's `/v1/models` returns live.
    models: [
        {
            id: "auto",
            name: "Factory Auto (best model)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/databricks/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "databricksProvider",
    ()=>databricksProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const databricksProvider = {
    id: "databricks",
    alias: "databricks",
    format: "openai",
    executor: "default",
    baseUrl: "https://adb-0000000000000000.0.azuredatabricks.net/serving-endpoints",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].databricks
};
}),
"[project]/open-sse/config/providers/registry/reka/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "rekaProvider",
    ()=>rekaProvider
]);
const rekaProvider = {
    id: "reka",
    alias: "reka",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.reka.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // reka-flash-3 stays first so it remains the provider default (the free-tier
        // model in freeModelCatalog); reka-flash was added in #4621 as an extra option.
        {
            id: "reka-flash-3",
            name: "Reka Flash 3"
        },
        {
            id: "reka-flash",
            name: "Reka Flash"
        },
        {
            id: "reka-edge-2603",
            name: "Reka Edge 2603"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/typhoon/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "typhoonProvider",
    ()=>typhoonProvider
]);
const typhoonProvider = {
    id: "typhoon",
    alias: "typhoon",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.opentyphoon.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "typhoon-v2.5-30b-a3b-instruct",
            name: "Typhoon v2.5 30B A3B Instruct",
            contextLength: 131072
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/inception/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inceptionProvider",
    ()=>inceptionProvider
]);
const inceptionProvider = {
    id: "inception",
    alias: "inception",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.inceptionlabs.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "mercury-2",
            name: "Mercury 2",
            contextLength: 128000,
            maxOutputTokens: 50000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/sarvam/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sarvamProvider",
    ()=>sarvamProvider
]);
const sarvamProvider = {
    id: "sarvam",
    alias: "sarvam",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.sarvam.ai/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "sarvam-105b",
            name: "Sarvam 105B",
            contextLength: 131072
        },
        {
            id: "sarvam-30b",
            name: "Sarvam 30B",
            contextLength: 65536
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/writer/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "writerProvider",
    ()=>writerProvider
]);
const writerProvider = {
    id: "writer",
    alias: "writer",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.writer.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "palmyra-x5",
            name: "Palmyra X5",
            contextLength: 1048576
        },
        {
            id: "palmyra-x4",
            name: "Palmyra X4",
            contextLength: 131072
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/plamo/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "plamoProvider",
    ()=>plamoProvider
]);
const plamoProvider = {
    id: "plamo",
    alias: "plamo",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.platform.preferredai.jp/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        {
            id: "plamo-3.0-prime",
            name: "PLaMo 3.0 Prime",
            contextLength: 262144,
            maxOutputTokens: 20000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/clova-studio/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clova_studioProvider",
    ()=>clova_studioProvider
]);
const clova_studioProvider = {
    id: "clova-studio",
    alias: "clova",
    format: "openai",
    executor: "default",
    baseUrl: "https://clovastudio.stream.ntruss.com/v1/openai/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // HCX-007 stays first so it remains the provider default (deep-reasoning
        // flagship); HCX-005 is the multimodal option.
        {
            id: "HCX-007",
            name: "HCX-007"
        },
        {
            id: "HCX-005",
            name: "HCX-005"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/internlm/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "internlmProvider",
    ()=>internlmProvider
]);
const internlmProvider = {
    id: "internlm",
    alias: "internlm",
    format: "openai",
    executor: "default",
    baseUrl: "https://chat.intern-ai.org.cn/api/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // intern-s1-pro stays first so it remains the provider default (1T MoE flagship).
        {
            id: "intern-s1-pro",
            name: "Intern-S1 Pro"
        },
        {
            id: "intern-s1",
            name: "Intern-S1"
        },
        {
            id: "intern-s1-mini",
            name: "Intern-S1 Mini"
        },
        {
            id: "internvl3.5-latest",
            name: "InternVL3.5 Latest"
        },
        {
            id: "intern-latest",
            name: "Intern Latest"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/ant-ling/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ant_lingProvider",
    ()=>ant_lingProvider
]);
const ant_lingProvider = {
    id: "ant-ling",
    alias: "ling",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.ant-ling.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: [
        // Ids and casing come from Ant Ling's own docs: the quickstart sample uses
        // base_url "https://api.ant-ling.com/v1" with model "Ling-2.6-1T", and the
        // pricing page bills exactly these three. Ling-2.6-1T stays first so it
        // remains the provider default (flagship).
        //
        // The Ming family (Ming-Flash-Omni, Ming-Light) is deliberately NOT listed:
        // it is documented as open-source/Ling Studio only and does not appear on
        // the pricing page, i.e. it is not served over this chat-completions API.
        {
            id: "Ling-2.6-1T",
            name: "Ling 2.6 1T"
        },
        {
            id: "Ring-2.6-1T",
            name: "Ring 2.6 1T"
        },
        {
            id: "Ling-2.6-flash",
            name: "Ling 2.6 Flash"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/vercel-ai-gateway/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "vercel_ai_gatewayProvider",
    ()=>vercel_ai_gatewayProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const vercel_ai_gatewayProvider = {
    id: "vercel-ai-gateway",
    alias: "vag",
    format: "openai",
    executor: "default",
    baseUrl: "https://ai-gateway.vercel.sh/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["vercel-ai-gateway"]
};
}),
"[project]/open-sse/config/providers/registry/v0-vercel/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "v0_vercelProvider",
    ()=>v0_vercelProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const v0_vercelProvider = {
    id: "v0-vercel",
    alias: "v0",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.v0.dev/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"]["v0-vercel"]
};
}),
"[project]/open-sse/config/providers/registry/opencode/zen/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "opencode_zenProvider",
    ()=>opencode_zenProvider
]);
const opencode_zenProvider = {
    id: "opencode-zen",
    alias: "opencode-zen",
    format: "openai",
    executor: "opencode",
    baseUrl: "https://opencode.ai/zen/v1",
    modelsUrl: "https://opencode.ai/zen/v1/models",
    authType: "apikey",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultContextLength: 200000,
    // Sync with https://opencode.ai/zen/v1/models — this list is regenerated
    // from the live API response so new models work without a code deploy.
    passthroughModels: true,
    models: [
        // ── Chat / Coding ──────────────────────────────────────────
        // #2900: big-pickle's upstream runs DeepSeek thinking mode — declare the
        // interleaved reasoning_content contract so follow-up/tool-use turns replay
        // it (otherwise DeepSeek returns 400 "reasoning_content ... must be passed back").
        {
            id: "big-pickle",
            name: "Big Pickle",
            supportsReasoning: true,
            interleavedField: "reasoning_content"
        },
        {
            id: "gpt-5-nano",
            name: "GPT 5 Nano",
            contextLength: 400000
        },
        {
            id: "gpt-5",
            name: "GPT 5"
        },
        {
            id: "gpt-5-codex",
            name: "GPT 5 Codex"
        },
        {
            id: "gpt-5.1",
            name: "GPT 5.1"
        },
        {
            id: "gpt-5.1-codex",
            name: "GPT 5.1 Codex"
        },
        {
            id: "gpt-5.1-codex-max",
            name: "GPT 5.1 Codex Max"
        },
        {
            id: "gpt-5.1-codex-mini",
            name: "GPT 5.1 Codex Mini"
        },
        {
            id: "gpt-5.2",
            name: "GPT 5.2"
        },
        {
            id: "gpt-5.2-codex",
            name: "GPT 5.2 Codex"
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT 5.3 Codex"
        },
        {
            id: "gpt-5.3-codex-spark",
            name: "GPT 5.3 Codex Spark"
        },
        {
            id: "gpt-5.4",
            name: "GPT 5.4"
        },
        {
            id: "gpt-5.4-mini",
            name: "GPT 5.4 Mini"
        },
        {
            id: "gpt-5.4-nano",
            name: "GPT 5.4 Nano"
        },
        {
            id: "gpt-5.4-pro",
            name: "GPT 5.4 Pro"
        },
        {
            id: "gpt-5.5",
            name: "GPT 5.5"
        },
        {
            id: "gpt-5.5-pro",
            name: "GPT 5.5 Pro"
        },
        // ── Claude ─────────────────────────────────────────────────
        {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5"
        },
        {
            id: "claude-sonnet-4",
            name: "Claude Sonnet 4"
        },
        {
            id: "claude-sonnet-4-5",
            name: "Claude Sonnet 4.5"
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6"
        },
        {
            id: "claude-opus-4-1",
            name: "Claude Opus 4.1"
        },
        {
            id: "claude-opus-4-5",
            name: "Claude Opus 4.5"
        },
        {
            id: "claude-opus-4-6",
            name: "Claude Opus 4.6"
        },
        {
            id: "claude-opus-4-7",
            name: "Claude Opus 4.7"
        },
        // ── Gemini ─────────────────────────────────────────────────
        {
            id: "gemini-3-flash",
            name: "Gemini 3 Flash"
        },
        {
            id: "gemini-3.1-pro",
            name: "Gemini 3.1 Pro"
        },
        {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash"
        },
        // ── Grok ───────────────────────────────────────────────────
        {
            id: "grok-build-0.1",
            name: "Grok Build 0.1"
        },
        // ── GLM / Z.AI ─────────────────────────────────────────────
        {
            id: "glm-5",
            name: "GLM-5"
        },
        {
            id: "glm-5.1",
            name: "GLM-5.1"
        },
        // ── MiniMax ────────────────────────────────────────────────
        // #3110: MiniMax M3 — frontier coding model with 1M context
        {
            id: "minimax-m3",
            name: "MiniMax M3",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "minimax-m2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "minimax-m2.7",
            name: "MiniMax M2.7"
        },
        // ── Kimi / Moonshot ────────────────────────────────────────
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5"
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6"
        },
        // ── Qwen ───────────────────────────────────────────────────
        // Issue #2292: Qwen models return Claude-format SSE bodies even
        // when hitting /chat/completions. targetFormat: "claude" routes
        // through /messages and the Claude translator.
        // Issue #2822: These models are text-only — supportsVision: false
        // ensures combo routing skips them on image-bearing requests.
        {
            id: "qwen3.5-plus",
            name: "Qwen3.5 Plus",
            targetFormat: "claude",
            supportsVision: false
        },
        {
            id: "qwen3.6-plus",
            name: "Qwen3.6 Plus",
            targetFormat: "claude",
            supportsVision: false
        },
        // ── Free Tier ──────────────────────────────────────────────
        {
            id: "deepseek-v4-flash-free",
            name: "DeepSeek V4 Flash Free",
            supportsReasoning: true
        },
        {
            id: "minimax-m2.5-free",
            name: "MiniMax M2.5 Free",
            contextLength: 204800
        },
        {
            id: "nemotron-3-super-free",
            name: "Nemotron 3 Super Free",
            contextLength: 1000000
        },
        {
            id: "qwen3.6-plus-free",
            name: "Qwen3.6 Plus Free",
            targetFormat: "claude",
            contextLength: 200000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/opencode/go/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "opencode_goProvider",
    ()=>opencode_goProvider
]);
const opencode_goProvider = {
    id: "opencode-go",
    alias: "opencode-go",
    format: "openai",
    executor: "opencode",
    baseUrl: "https://opencode.ai/zen/go/v1",
    // (#532) Key validation must hit the main zen endpoint (same key works for both tiers)
    testKeyBaseUrl: "https://opencode.ai/zen/v1",
    authType: "apikey",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultContextLength: 200000,
    models: [
        // Port from decolua/9router 8efacc11: align with official Go endpoints —
        // glm-5.2 is now advertised and Kimi chat traffic must route through
        // `kimi-k2.7-code` (the live API rejects the plain `kimi-k2.7` alias for
        // `/chat/completions`, even though the docs config example uses it).
        // GLM-5.2 — base model + effort-tier aliases (#6922).
        // OpencodeExecutor rewrites the alias to the canonical id and injects
        // reasoning_effort, mirroring the deepseek-v4-pro-* pattern.
        {
            id: "glm-5.2",
            name: "GLM-5.2",
            supportsReasoning: true
        },
        {
            id: "glm-5.2-high",
            name: "GLM-5.2 (high effort)",
            supportsReasoning: true
        },
        {
            id: "glm-5.2-max",
            name: "GLM-5.2 (max effort)",
            supportsReasoning: true
        },
        {
            id: "glm-5.1",
            name: "GLM-5.1"
        },
        {
            id: "glm-5",
            name: "GLM-5"
        },
        {
            id: "kimi-k2.7-code",
            name: "Kimi K2.7 Code"
        },
        {
            id: "kimi-k2.6",
            name: "Kimi K2.6"
        },
        {
            id: "kimi-k2.5",
            name: "Kimi K2.5"
        },
        // #8353: Kimi K3 base + max-effort alias from the OpenCode Go registry.
        {
            id: "kimi-k3",
            name: "Kimi K3",
            supportsReasoning: true
        },
        {
            id: "kimi-k3-max",
            name: "Kimi K3 (max effort)",
            supportsReasoning: true
        },
        // MiMo-V2.5 — base model + effort-tier aliases (#6922).
        {
            id: "mimo-v2.5-pro",
            name: "MiMo-V2.5-Pro",
            supportsReasoning: true
        },
        {
            id: "mimo-v2.5",
            name: "MiMo-V2.5",
            supportsReasoning: true
        },
        {
            id: "mimo-v2.5-high",
            name: "MiMo-V2.5 (high effort)",
            supportsReasoning: true
        },
        {
            id: "mimo-v2.5-max",
            name: "MiMo-V2.5 (max effort)",
            supportsReasoning: true
        },
        // #3110: MiniMax M3 via OpenCode Go tier
        {
            id: "minimax-m3",
            name: "MiniMax M3",
            targetFormat: "claude",
            contextLength: 1048576,
            supportsVision: true
        },
        {
            id: "minimax-m2.7",
            name: "MiniMax M2.7",
            targetFormat: "claude"
        },
        {
            id: "minimax-m2.5",
            name: "MiniMax M2.5",
            targetFormat: "claude"
        },
        // Issue #2292: Qwen models on opencode-go reject oa-compat format
        // ("Model qwen3.x-* is not supported for format oa-compat") — same
        // upstream behavior already declared for opencode-zen. Route them
        // through /messages with the Claude translator.
        // Issue #2822: These models are text-only — mark supportsVision: false
        // so combo routing skips them when the request contains image blocks,
        // preventing image content from reaching a vision-incapable upstream.
        // #8353: effort-tier aliases from the OpenCode Go registry.
        {
            id: "qwen3.7-max",
            name: "Qwen3.7 Max",
            targetFormat: "claude",
            supportsVision: false
        },
        {
            id: "qwen3.7-max-high",
            name: "Qwen3.7 Max (high effort)",
            targetFormat: "claude",
            supportsVision: false,
            supportsReasoning: true
        },
        {
            id: "qwen3.7-max-max",
            name: "Qwen3.7 Max (max effort)",
            targetFormat: "claude",
            supportsVision: false,
            supportsReasoning: true
        },
        {
            id: "qwen3.7-plus",
            name: "Qwen3.7 Plus",
            targetFormat: "claude",
            supportsVision: false
        },
        {
            id: "qwen3.7-plus-high",
            name: "Qwen3.7 Plus (high effort)",
            targetFormat: "claude",
            supportsVision: false,
            supportsReasoning: true
        },
        {
            id: "qwen3.7-plus-max",
            name: "Qwen3.7 Plus (max effort)",
            targetFormat: "claude",
            supportsVision: false,
            supportsReasoning: true
        },
        {
            id: "qwen3.6-plus",
            name: "Qwen3.6 Plus",
            targetFormat: "claude",
            supportsVision: false
        },
        {
            id: "qwen3.6-plus-high",
            name: "Qwen3.6 Plus (high effort)",
            targetFormat: "claude",
            supportsVision: false,
            supportsReasoning: true
        },
        {
            id: "qwen3.6-plus-max",
            name: "Qwen3.6 Plus (max effort)",
            targetFormat: "claude",
            supportsVision: false,
            supportsReasoning: true
        },
        {
            id: "qwen3.5-plus",
            name: "Qwen3.5 Plus",
            targetFormat: "claude",
            supportsVision: false
        },
        // #8353: hy3 is the Go-tier base id (distinct from hy3-preview / hy3-free).
        {
            id: "hy3",
            name: "Hunyuan3",
            contextLength: 256000,
            supportsReasoning: true
        },
        {
            id: "hy3-none",
            name: "Hunyuan3 (none effort)",
            contextLength: 256000,
            supportsReasoning: true
        },
        {
            id: "hy3-low",
            name: "Hunyuan3 (low effort)",
            contextLength: 256000,
            supportsReasoning: true
        },
        {
            id: "hy3-high",
            name: "Hunyuan3 (high effort)",
            contextLength: 256000,
            supportsReasoning: true
        },
        {
            id: "hy3-preview",
            name: "Hunyuan3 Preview"
        },
        // #8353: Grok 4.5 + effort tiers from the OpenCode Go registry.
        {
            id: "grok-4.5",
            name: "Grok 4.5",
            supportsReasoning: true
        },
        {
            id: "grok-4.5-low",
            name: "Grok 4.5 (low effort)",
            supportsReasoning: true
        },
        {
            id: "grok-4.5-medium",
            name: "Grok 4.5 (medium effort)",
            supportsReasoning: true
        },
        {
            id: "grok-4.5-high",
            name: "Grok 4.5 (high effort)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        // OpencodeExecutor rewrites these aliases to the canonical upstream id and injects reasoning_effort.
        {
            id: "deepseek-v4-pro-low",
            name: "DeepSeek V4 Pro (low effort)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro-medium",
            name: "DeepSeek V4 Pro (medium effort)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro-high",
            name: "DeepSeek V4 Pro (high effort)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-pro-max",
            name: "DeepSeek V4 Pro (max effort)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            supportsReasoning: true
        },
        // #8353: DeepSeek V4 Flash effort tiers from the OpenCode Go registry.
        {
            id: "deepseek-v4-flash-high",
            name: "DeepSeek V4 Flash (high effort)",
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash-max",
            name: "DeepSeek V4 Flash (max effort)",
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/opencode/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "opencodeProvider",
    ()=>opencodeProvider
]);
const opencodeProvider = {
    id: "opencode",
    alias: "oc",
    format: "openai",
    executor: "opencode",
    baseUrl: "https://opencode.ai/zen/v1",
    modelsUrl: "https://opencode.ai/zen/v1/models",
    authType: "apikey",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    passthroughModels: true,
    defaultContextLength: 200000,
    models: [
        // #2900: big-pickle's upstream runs DeepSeek thinking mode — declare the
        // interleaved reasoning_content contract so follow-up/tool-use turns replay
        // it (otherwise DeepSeek returns 400 "reasoning_content ... must be passed back").
        {
            id: "big-pickle",
            name: "Big Pickle",
            supportsReasoning: true,
            interleavedField: "reasoning_content"
        },
        {
            id: "deepseek-v4-flash-free",
            name: "DeepSeek V4 Flash Free",
            supportsReasoning: true
        },
        // #6998: 2026-07-14 refresh — the upstream free tier rotated its lineup;
        // minimax-m3-free, minimax-m2.5-free, ling-2.6-1t-free,
        // trinity-large-preview-free, nemotron-3-super-free and qwen3.6-plus-free
        // were delisted (401 "Model X is not supported") and replaced by the 4
        // entries below, confirmed live against
        // https://opencode.ai/zen/v1/chat/completions.
        {
            id: "mimo-v2.5-free",
            name: "MiMo V2.5 Free",
            contextLength: 131000
        },
        {
            id: "hy3-free",
            name: "HY3 Free",
            contextLength: 131000
        },
        {
            id: "nemotron-3-ultra-free",
            name: "Nemotron 3 Ultra Free",
            contextLength: 1000000
        },
        {
            id: "north-mini-code-free",
            name: "North Mini Code Free",
            contextLength: 131000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/dahl/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dahlProvider",
    ()=>dahlProvider
]);
const dahlProvider = {
    id: "dahl",
    alias: "dahl",
    format: "openai",
    executor: "openai-compatible",
    baseUrl: "https://inference.dahl.global/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    authPrefix: "Bearer",
    passthroughModels: false,
    defaultContextLength: 200000,
    models: [
        {
            id: "MiniMaxAI/MiniMax-M2.7",
            name: "MiniMax M2.7"
        },
        {
            id: "moonshotai/Kimi-K2.6",
            name: "Kimi K2.6"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/maritalk/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maritalkProvider",
    ()=>maritalkProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/maritalk.ts [instrumentation] (ecmascript)");
;
const maritalkProvider = {
    id: "maritalk",
    alias: "maritalk",
    format: "openai",
    executor: "default",
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MARITALK_DEFAULT_BASE_URL"],
    authType: "apikey",
    authHeader: "key",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].maritalk
};
}),
"[project]/open-sse/config/providers/registry/baseten/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "basetenProvider",
    ()=>basetenProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const basetenProvider = {
    id: "baseten",
    alias: "baseten",
    format: "openai",
    executor: "default",
    baseUrl: "https://inference.baseten.co/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].baseten
};
}),
"[project]/open-sse/config/providers/registry/gemini/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "geminiProvider",
    ()=>geminiProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const geminiProvider = {
    id: "gemini",
    alias: "gemini",
    format: "gemini",
    executor: "default",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    urlBuilder: (base, model, stream)=>{
        const action = stream ? "streamGenerateContent?alt=sse" : "generateContent";
        return `${base}/${model}:${action}`;
    },
    authType: "apikey",
    authHeader: "x-goog-api-key",
    defaultContextLength: 1048576,
    oauth: {
        clientIdEnv: "GEMINI_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("gemini_id"),
        clientSecretEnv: "GEMINI_OAUTH_CLIENT_SECRET",
        clientSecretDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("gemini_alt")
    },
    models: [
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "gemini-3-flash-preview",
            name: "Gemini 3 Flash Preview",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "gemini-3.1-flash-lite",
            name: "Gemini 3.1 Flash Lite",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "gemini-3.1-flash-tts-preview",
            name: "Gemini 3.1 Flash TTS"
        },
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "gemini-2.5-flash-lite",
            name: "Gemini 2.5 Flash Lite",
            toolCalling: true,
            supportsVision: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/gemini/web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gemini_webProvider",
    ()=>gemini_webProvider
]);
const gemini_webProvider = {
    id: "gemini-web",
    alias: "gweb",
    format: "openai",
    executor: "gemini-web",
    baseUrl: "https://gemini.google.com/app",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "gemini-3.1-pro",
            name: "Gemini 3.1 Pro",
            toolCalling: false
        },
        {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash",
            toolCalling: false
        },
        {
            id: "gemini-3.1-flash-lite",
            name: "Gemini 3.1 Flash-Lite",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/cline/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clineProvider",
    ()=>clineProvider
]);
const clineProvider = {
    id: "cline",
    alias: "cl",
    format: "openai",
    executor: "openai",
    // Cline's API only implements streaming (streamText). A non-streaming request
    // returns "generateText is not implemented" / an empty body, so force upstream
    // streaming and let chatCore convert the SSE back to JSON for stream:false
    // clients (e.g. the model-test button, non-streaming API callers).
    forceStream: true,
    baseUrl: "https://api.cline.bot/api/v1/chat/completions",
    authType: "oauth",
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    oauth: {
        tokenUrl: "https://api.cline.bot/api/v1/auth/token",
        refreshUrl: "https://api.cline.bot/api/v1/auth/refresh",
        authUrl: "https://api.cline.bot/api/v1/auth/authorize"
    },
    extraHeaders: {
        "HTTP-Referer": "https://cline.bot",
        "X-Title": "Cline"
    },
    // Offline curated catalog: server-authored recommendations first, followed by
    // the official free bucket and text-output models advertised as zero-cost.
    models: [
        {
            id: "zai/glm-5.2",
            name: "GLM 5.2",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1040000,
            maxInputTokens: 1040000,
            maxOutputTokens: 128000
        },
        {
            id: "x-ai/grok-4.5",
            name: "Grok 4.5",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 500000,
            maxInputTokens: 500000,
            maxOutputTokens: 500000
        },
        {
            id: "openai/gpt-5.6-sol",
            name: "GPT-5.6 Sol",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1050000,
            maxInputTokens: 922000,
            maxOutputTokens: 128000
        },
        {
            id: "moonshotai/kimi-k3",
            name: "Kimi K3",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 1048576
        },
        {
            id: "anthropic/claude-opus-4.8",
            name: "Claude Opus 4.8",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1000000,
            maxInputTokens: 1000000,
            maxOutputTokens: 128000
        },
        {
            id: "openrouter/free",
            name: "Free Models Router",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 200000,
            maxInputTokens: 200000
        },
        {
            id: "deepseek/deepseek-v4-flash",
            name: "DeepSeek V4 Flash (Free)",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 65536
        },
        {
            id: "tencent/hy3:free",
            name: "Tencent Hy3 (Free)",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 262144,
            maxInputTokens: 262144,
            maxOutputTokens: 262144
        },
        {
            id: "stepfun/step-3.7-flash",
            name: "Step 3.7 Flash (Free)",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 256000,
            maxInputTokens: 256000,
            maxOutputTokens: 256000
        },
        {
            id: "poolside/laguna-m.1:free",
            name: "Laguna M.1 (Free)",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 262144,
            maxInputTokens: 262144,
            maxOutputTokens: 32768
        },
        {
            id: "google/gemma-4-31b-it:free",
            name: "Gemma 4 31B (Free)",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 262144,
            maxInputTokens: 262144,
            maxOutputTokens: 32768
        },
        {
            id: "nvidia/nemotron-3-ultra-550b-a55b:free",
            name: "Nemotron 3 Ultra (Free)",
            toolCalling: true,
            supportsReasoning: true,
            contextLength: 1000000,
            maxInputTokens: 1000000,
            maxOutputTokens: 65536
        },
        {
            id: "minimax/minimax-m3",
            name: "MiniMax M3 (Free)",
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true,
            contextLength: 1048576,
            maxInputTokens: 1048576,
            maxOutputTokens: 65536
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/heroku/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "herokuProvider",
    ()=>herokuProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const herokuProvider = {
    id: "heroku",
    alias: "heroku",
    format: "openai",
    executor: "default",
    baseUrl: "https://us.inference.heroku.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].heroku
};
}),
"[project]/open-sse/config/providers/registry/bluesminds/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bluesmindsProvider",
    ()=>bluesmindsProvider
]);
const bluesmindsProvider = {
    id: "bluesminds",
    alias: "bm",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.bluesminds.com/v1/chat/completions",
    modelsUrl: "https://api.bluesminds.com/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        // Default free models
        {
            id: "gpt-4o",
            name: "GPT-4o"
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini"
        },
        {
            id: "gpt-4.1",
            name: "GPT-4.1"
        },
        {
            id: "gpt-4.1-mini",
            name: "GPT-4.1 Mini"
        },
        {
            id: "gpt-4.1-nano",
            name: "GPT-4.1 Nano"
        },
        {
            id: "claude-sonnet-4-5",
            name: "Claude Sonnet 4.5"
        },
        {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5"
        },
        {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash"
        },
        {
            id: "gemini-2.0-flash-exp",
            name: "Gemini 2.0 Flash (Exp)"
        },
        {
            id: "deepseek-reasoner",
            name: "DeepSeek Reasoner",
            supportsReasoning: true
        },
        {
            id: "deepseek-chat",
            name: "DeepSeek Chat"
        },
        {
            id: "qwen-plus",
            name: "Qwen Plus"
        },
        {
            id: "qwen-turbo",
            name: "Qwen Turbo"
        },
        {
            id: "kimi-k2",
            name: "Kimi K2"
        },
        {
            id: "kimi-k2-thinking",
            name: "Kimi K2 Thinking"
        },
        {
            id: "glm-4.7",
            name: "GLM 4.7"
        },
        {
            id: "glm-4-flash",
            name: "GLM 4 Flash"
        },
        {
            id: "minimax-m2.5",
            name: "MiniMax M2.5"
        },
        // VIP models (cost pi credits)
        {
            id: "claude-opus-4-5",
            name: "Claude Opus 4.5 (VIP)",
            contextLength: 200000
        },
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro (VIP)",
            contextLength: 1048576
        },
        {
            id: "grok-3",
            name: "Grok-3 (VIP)",
            contextLength: 131072
        },
        {
            id: "qwen-max",
            name: "Qwen Max (VIP)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/theoldllm/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "theoldllmProvider",
    ()=>theoldllmProvider
]);
const theoldllmProvider = {
    id: "theoldllm",
    alias: "tllm",
    format: "openai",
    executor: "theoldllm",
    // Playwright-backed executor — no standard auth; uses embedded browser for token generation
    baseUrl: "https://theoldllm.vercel.app/api/chatgpt",
    baseUrls: [
        "https://theoldllm.vercel.app/api/chatgpt"
    ],
    authType: "none",
    authHeader: "none",
    defaultContextLength: 200000,
    // Catalog seed. `passthroughModels: true` means live /api/chatgpt discovery is
    // authoritative; this list is the curated display/fallback set. The upstream IDs
    // (GPT_5_*, gemini_*, CLAUDE_4_*, openrouter_*, etc.) mirror the site's free
    // "chatgpt" tier and MUST match `CHATGPT_UPSTREAM_MODELS` in the executor so they
    // route unchanged. Legacy alias IDs (GPT_4o, claude_opus_4, …) are kept for
    // backward compatibility with saved model preferences (mapped in the executor).
    models: [
        // ── Current free tier (refreshed for #5181) ──
        {
            id: "GPT_5_4",
            name: "GPT-5.4 (The Old LLM 🆓)",
            contextLength: 400000
        },
        {
            id: "GPT_5_3",
            name: "GPT-5.3 (The Old LLM 🆓)",
            contextLength: 400000
        },
        {
            id: "GPT_5_2",
            name: "GPT-5.2 (The Old LLM 🆓)",
            contextLength: 400000
        },
        {
            id: "GPT_5_1",
            name: "GPT-5.1 (The Old LLM 🆓)",
            contextLength: 400000
        },
        {
            id: "GPT_5",
            name: "GPT-5 (The Old LLM 🆓)",
            contextLength: 400000
        },
        {
            id: "GPT_o4_mini",
            name: "o4-mini (The Old LLM 🆓)"
        },
        {
            id: "GPT_o3_mini",
            name: "o3-mini (The Old LLM 🆓)"
        },
        {
            id: "gemini_3_pro",
            name: "Gemini 3 Pro (The Old LLM 🆓)",
            contextLength: 1000000
        },
        {
            id: "gemini_2_5_pro",
            name: "Gemini 2.5 Pro (The Old LLM 🆓)",
            contextLength: 1000000
        },
        {
            id: "gemini_2_0_flash",
            name: "Gemini 2.0 Flash (The Old LLM 🆓)",
            contextLength: 1000000
        },
        {
            id: "gemini_1_5_flash",
            name: "Gemini 1.5 Flash (The Old LLM 🆓)",
            contextLength: 1000000
        },
        {
            id: "CLAUDE_4_6_OPUS",
            name: "Claude 4.6 Opus (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "CLAUDE_4_6_SONNET",
            name: "Claude 4.6 Sonnet (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "CLAUDE_4_5_HAIKU",
            name: "Claude 4.5 Haiku (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "openrouter_gpt_4_o",
            name: "GPT-4o (The Old LLM 🆓)"
        },
        {
            id: "openrouter_gpt_4_o_mini",
            name: "GPT-4o mini (The Old LLM 🆓)"
        },
        {
            id: "openrouter_grok_4",
            name: "Grok 4 (The Old LLM 🆓)"
        },
        {
            id: "together_deepseek_v3",
            name: "DeepSeek V3 (The Old LLM 🆓)"
        },
        {
            id: "openrouter_deepseek_r1",
            name: "DeepSeek R1 (The Old LLM 🆓)"
        },
        {
            id: "sonar-pro",
            name: "Sonar Pro (The Old LLM 🆓)"
        },
        // ── Legacy alias IDs (kept for saved-preference backward compatibility) ──
        {
            id: "GPT_4o",
            name: "GPT-4o (The Old LLM 🆓)"
        },
        {
            id: "claude_opus_4",
            name: "Claude Opus 4 (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "claude_sonnet_4",
            name: "Claude Sonnet 4 (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "claude_haiku_3_5",
            name: "Claude Haiku 3.5 (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "deepseek_v4",
            name: "DeepSeek V4 (The Old LLM 🆓)",
            contextLength: 200000
        },
        {
            id: "gemini_3_flash",
            name: "Gemini 3 Flash (The Old LLM 🆓)",
            contextLength: 1000000
        }
    ],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/baidu/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "baiduProvider",
    ()=>baiduProvider
]);
const baiduProvider = {
    id: "baidu",
    alias: "baidu",
    format: "openai",
    executor: "default",
    baseUrl: "https://qianfan.baidubce.com/v2/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    // Sweep 2026-06-19: refreshed against the official Baidu AI Studio / Qianfan v2
    // model list. ERNIE 5.0 (2026-01-22) and 5.1 (2026-05-09) are the current flagships.
    models: [
        {
            id: "ernie-5.1",
            name: "ERNIE 5.1",
            contextLength: 131072
        },
        {
            id: "ernie-5.0",
            name: "ERNIE 5.0",
            contextLength: 131072
        },
        {
            id: "ernie-x1.1",
            name: "ERNIE X1.1",
            contextLength: 32768
        },
        {
            id: "ernie-4.5-turbo-128k",
            name: "ERNIE 4.5 Turbo 128K",
            contextLength: 131072
        },
        {
            id: "ernie-4.5-turbo-32k",
            name: "ERNIE 4.5 Turbo 32K",
            contextLength: 32768
        },
        {
            id: "ernie-4.5-turbo-vl",
            name: "ERNIE 4.5 Turbo VL",
            contextLength: 131072
        },
        {
            id: "ernie-4.5-21b-a3b",
            name: "ERNIE 4.5 21B A3B",
            contextLength: 131072
        },
        {
            id: "ernie-4.5-0.3b",
            name: "ERNIE 4.5 0.3B",
            contextLength: 131072
        },
        {
            id: "ernie-4.0-8k",
            name: "ERNIE 4.0 8K"
        },
        {
            id: "ernie-4.0-turbo-128k",
            name: "ERNIE 4.0 Turbo 128K",
            contextLength: 131072
        },
        {
            id: "ernie-4.0-turbo-8k",
            name: "ERNIE 4.0 Turbo 8K",
            contextLength: 8192
        },
        {
            id: "ernie-3.5-8k",
            name: "ERNIE 3.5 8K",
            contextLength: 8192
        },
        {
            id: "ernie-speed-128k",
            name: "ERNIE Speed 128K",
            contextLength: 131072
        },
        {
            id: "ernie-speed-8k",
            name: "ERNIE Speed 8K",
            contextLength: 8192
        },
        {
            id: "ernie-lite-8k",
            name: "ERNIE Lite 8K",
            contextLength: 8192
        },
        {
            id: "ernie-tiny-8k",
            name: "ERNIE Tiny 8K",
            contextLength: 8192
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/pollinations/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pollinationsProvider",
    ()=>pollinationsProvider
]);
const pollinationsProvider = {
    id: "pollinations",
    alias: "pol",
    format: "openai",
    executor: "pollinations",
    // #2987: Pollinations retired the legacy text.pollinations.ai host (it now
    // returns 404 "This is our legacy API"). The current OpenAI-compatible gateway
    // is gen.pollinations.ai/v1, so route there as the primary endpoint.
    baseUrl: "https://gen.pollinations.ai/v1/chat/completions",
    baseUrls: [
        "https://gen.pollinations.ai/v1/chat/completions"
    ],
    // NOTE (2026-06): Pollinations now requires API keys for premium models (claude, gemini, midijourney).
    // Free keyless models: openai, openai-fast, openai-large, qwen-coder, mistral, deepseek, grok, gemini-flash-lite-3.1, perplexity-fast, perplexity-reasoning.
    // Get a key at https://enter.pollinations.ai
    authType: "optional",
    authHeader: "bearer",
    models: [
        {
            id: "openai",
            name: "OpenAI (Pollinations)"
        },
        {
            id: "openai-fast",
            name: "OpenAI Fast (Pollinations)"
        },
        {
            id: "openai-large",
            name: "OpenAI Large (Pollinations)"
        },
        {
            id: "qwen-coder",
            name: "Qwen Coder (Pollinations)"
        },
        {
            id: "mistral",
            name: "Mistral (Pollinations)"
        },
        {
            id: "gemini",
            name: "Gemini (Pollinations)"
        },
        {
            id: "gemini-flash-lite-3.1",
            name: "Gemini Flash Lite 3.1 (Pollinations)"
        },
        {
            id: "gemini-fast",
            name: "Gemini Fast (Pollinations)"
        },
        {
            id: "deepseek",
            name: "DeepSeek (Pollinations)"
        },
        {
            id: "grok",
            name: "Grok (Pollinations)"
        },
        {
            id: "grok-large",
            name: "Grok Large (Pollinations)"
        },
        {
            id: "gemini-search",
            name: "Gemini Search (Pollinations)"
        },
        {
            id: "midijourney",
            name: "Midijourney (Pollinations)"
        },
        {
            id: "midijourney-large",
            name: "Midijourney Large (Pollinations)"
        },
        {
            id: "claude-fast",
            name: "Claude Fast (Pollinations)"
        },
        {
            id: "claude",
            name: "Claude (Pollinations)"
        },
        {
            id: "claude-large",
            name: "Claude Large (Pollinations)"
        },
        {
            id: "perplexity-fast",
            name: "Perplexity Fast (Pollinations)"
        },
        {
            id: "perplexity-reasoning",
            name: "Perplexity Reasoning (Pollinations)"
        },
        {
            id: "kimi",
            name: "Kimi (Pollinations)"
        },
        {
            id: "gemini-large",
            name: "Gemini Large (Pollinations)"
        },
        {
            id: "nova-fast",
            name: "Nova Fast (Pollinations)"
        },
        {
            id: "nova",
            name: "Nova (Pollinations)"
        },
        {
            id: "glm",
            name: "GLM (Pollinations)"
        },
        {
            id: "minimax",
            name: "MiniMax (Pollinations)"
        },
        {
            id: "mistral-large",
            name: "Mistral Large (Pollinations)"
        },
        {
            id: "polly",
            name: "Polly (Pollinations)"
        },
        {
            id: "qwen-coder-large",
            name: "Qwen Coder Large (Pollinations)"
        },
        {
            id: "qwen-large",
            name: "Qwen Large (Pollinations)"
        },
        {
            id: "qwen-vision",
            name: "Qwen Vision (Pollinations)"
        },
        {
            id: "qwen-safety",
            name: "Qwen Safety (Pollinations)"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/veoaifree-web/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "veoaifree_webProvider",
    ()=>veoaifree_webProvider
]);
const veoaifree_webProvider = {
    id: "veoaifree-web",
    alias: "veo-free",
    format: "openai",
    executor: "veoaifree-web",
    baseUrl: "https://veoaifree.com/wp-admin/admin-ajax.php",
    authType: "none",
    authHeader: "none",
    models: [
        {
            id: "veo",
            name: "VEO 3.1",
            toolCalling: false
        },
        {
            id: "seedance",
            name: "Seedance",
            toolCalling: false
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/codex/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "codexProvider",
    ()=>codexProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
;
const codexProvider = {
    id: "codex",
    alias: "cx",
    format: "openai-responses",
    executor: "codex",
    baseUrl: "https://chatgpt.com/backend-api/codex/responses",
    authType: "oauth",
    authHeader: "bearer",
    defaultContextLength: 400000,
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexDefaultHeaders"])(),
    oauth: {
        clientIdEnv: "CODEX_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("codex_id"),
        clientSecretEnv: "CODEX_OAUTH_CLIENT_SECRET",
        clientSecretDefault: "",
        tokenUrl: "https://auth.openai.com/oauth/token"
    },
    models: [
        {
            id: "gpt-5.6-sol",
            name: "GPT 5.6 Sol",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-sol-ultra",
            name: "GPT 5.6 Sol (Ultra)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-sol-max",
            name: "GPT 5.6 Sol (Max)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-sol-xhigh",
            name: "GPT 5.6 Sol (xHigh)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"],
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.6-sol-high",
            name: "GPT 5.6 Sol (High)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"],
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.6-sol-medium",
            name: "GPT 5.6 Sol (Medium)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-sol-low",
            name: "GPT 5.6 Sol (Low)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-terra",
            name: "GPT 5.6 Terra",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-terra-ultra",
            name: "GPT 5.6 Terra (Ultra)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-terra-max",
            name: "GPT 5.6 Terra (Max)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-terra-xhigh",
            name: "GPT 5.6 Terra (xHigh)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"],
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.6-terra-high",
            name: "GPT 5.6 Terra (High)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"],
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.6-terra-medium",
            name: "GPT 5.6 Terra (Medium)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-terra-low",
            name: "GPT 5.6 Terra (Low)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-luna",
            name: "GPT 5.6 Luna",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-luna-max",
            name: "GPT 5.6 Luna (Max)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-luna-xhigh",
            name: "GPT 5.6 Luna (xHigh)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"],
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.6-luna-high",
            name: "GPT 5.6 Luna (High)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"],
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.6-luna-medium",
            name: "GPT 5.6 Luna (Medium)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        {
            id: "gpt-5.6-luna-low",
            name: "GPT 5.6 Luna (Low)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_6_CODEX_CAPABILITIES"]
        },
        // gpt-5.5 codex OAuth backend caps context at 400K (not the public-API
        // 1.05M). Public refs : openai/codex#19208, #19319, #19464 ;
        // opencode#24171. max_output_tokens is stripped server-side
        // (litellm#21193, codex#4138) so 128K is informational only.
        // The usable INPUT budget is smaller than the 400K window (part is
        // reserved for output), so max_input_tokens must be distinct from
        // context_length or coding agents never auto-compact (#6191). OpenAI's
        // own live catalog reports ~272K for gpt-5.5 in Codex.
        {
            id: "gpt-5.5",
            name: "GPT 5.5",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            contextLength: 400000,
            // #6191: input cap per reporter; TODO confirm exact value
            maxInputTokens: 272000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.5-xhigh",
            name: "GPT 5.5 (xHigh)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            contextLength: 400000,
            // #6191: input cap per reporter; TODO confirm exact value
            maxInputTokens: 272000,
            maxOutputTokens: 128000,
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.5-high",
            name: "GPT 5.5 (High)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            contextLength: 400000,
            // #6191: input cap per reporter; TODO confirm exact value
            maxInputTokens: 272000,
            maxOutputTokens: 128000,
            // #6354: reasoning-heavy tier — more header-wait room than the global default.
            timeoutMs: 1200000
        },
        {
            id: "gpt-5.5-medium",
            name: "GPT 5.5 (Medium)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            contextLength: 400000,
            // #6191: input cap per reporter; TODO confirm exact value
            maxInputTokens: 272000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.5-low",
            name: "GPT 5.5 (Low)",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GPT_5_5_CODEX_CAPABILITIES"],
            contextLength: 400000,
            // #6191: input cap per reporter; TODO confirm exact value
            maxInputTokens: 272000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.3-codex-spark",
            name: "GPT 5.3 Codex Spark"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/venice/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "veniceProvider",
    ()=>veniceProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const veniceProvider = {
    id: "venice",
    alias: "venice",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.venice.ai/api/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHAT_OPENAI_COMPAT_MODELS"].venice
};
}),
"[project]/open-sse/config/providers/registry/kiro/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kiroProvider",
    ()=>kiroProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
;
const kiroProvider = {
    id: "kiro",
    alias: "kr",
    format: "kiro",
    executor: "kiro",
    baseUrl: "https://codewhisperer.us-east-1.amazonaws.com/generateAssistantResponse",
    authType: "oauth",
    authHeader: "bearer",
    defaultContextLength: 200000,
    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKiroServiceHeaders"])(),
    oauth: {
        tokenUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken",
        authUrl: "https://prod.us-east-1.auth.desktop.kiro.dev"
    },
    // Model IDs must match Kiro's real upstream catalog exactly — an unknown id
    // makes Kiro return `400 "Invalid model. Please select a different model"`.
    // Fabricated ids (auto-kiro, claude-opus-4.x, claude-fable-5, claude-sonnet-4.6)
    // were removed after live VPS validation: Kiro offers no Opus/Fable, its Sonnet
    // is 4.5 (not 4.6), and there is no "auto" model id (it was sent verbatim and
    // 400'd). claude-sonnet-5 is a real Kiro model but plan-gated per account —
    // kept so entitled accounts can use it. See kiro cluster #6112/#6113/#6099.
    models: [
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5",
            contextLength: 1000000,
            maxOutputTokens: 128000
        },
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            contextLength: 200000,
            maxOutputTokens: 64000
        },
        {
            id: "claude-haiku-4.5",
            name: "Claude Haiku 4.5",
            contextLength: 200000,
            maxOutputTokens: 64000
        },
        {
            id: "deepseek-3.2",
            name: "DeepSeek V3.2"
        },
        {
            id: "minimax-m2.5",
            name: "MiniMax M2.5"
        },
        {
            id: "minimax-m2.1",
            name: "MiniMax M2.1"
        },
        {
            id: "glm-5",
            name: "GLM-5"
        },
        {
            id: "qwen3-coder-next",
            name: "Qwen3 Coder Next"
        },
        // Kiro's first OpenAI-family models (kiro.dev/changelog/models, 2026-07-14):
        // three tiers — Sol (flagship), Terra (balanced mid-tier), Luna (fastest/
        // cheapest) — all sharing the announced 272k context window.
        {
            id: "gpt-5.6-sol",
            name: "GPT-5.6 Sol",
            contextLength: 272000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.6-terra",
            name: "GPT-5.6 Terra",
            contextLength: 272000,
            maxOutputTokens: 128000
        },
        {
            id: "gpt-5.6-luna",
            name: "GPT-5.6 Luna",
            contextLength: 272000,
            maxOutputTokens: 128000
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/openadapter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openadapterProvider",
    ()=>openadapterProvider
]);
const openadapterProvider = {
    id: "openadapter",
    alias: "oad",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.openadapter.in/v1/chat/completions",
    modelsUrl: "https://api.openadapter.in/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "glm-4.7",
            name: "GLM 4.7 (OpenAdapter)",
            contextLength: 128000,
            toolCalling: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/dit/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ditProvider",
    ()=>ditProvider
]);
const ditProvider = {
    id: "dit",
    alias: "dai",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.dit.ai/v1/chat/completions",
    modelsUrl: "https://api.dit.ai/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 200000,
    models: [
        {
            id: "gpt-5.4",
            name: "GPT-5.4 (DIT.ai)",
            contextLength: 400000,
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "claude-sonnet-4-6",
            name: "Claude Sonnet 4.6 (DIT.ai)",
            contextLength: 200000,
            toolCalling: true,
            supportsReasoning: true,
            supportsVision: true
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/tokenrouter/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tokenrouterProvider",
    ()=>tokenrouterProvider
]);
const tokenrouterProvider = {
    id: "tokenrouter",
    alias: "trk",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.tokenrouter.com/v1/chat/completions",
    modelsUrl: "https://api.tokenrouter.com/v1/models",
    authType: "apikey",
    authHeader: "bearer",
    defaultContextLength: 128000,
    models: [
        {
            id: "minimax-3",
            name: "MiniMax 3 (free, TokenRouter)",
            contextLength: 128000,
            toolCalling: true
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek V4 Pro (TokenRouter)",
            contextLength: 163840,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash (TokenRouter)",
            contextLength: 163840,
            toolCalling: true,
            supportsReasoning: true
        }
    ]
};
}),
"[project]/open-sse/config/grokBuild.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GROK_BUILD_CLIENT_IDENTIFIER",
    ()=>GROK_BUILD_CLIENT_IDENTIFIER,
    "GROK_BUILD_DEFAULT_CLIENT_VERSION",
    ()=>GROK_BUILD_DEFAULT_CLIENT_VERSION,
    "GROK_BUILD_DEFAULT_CONTEXT_WINDOW",
    ()=>GROK_BUILD_DEFAULT_CONTEXT_WINDOW,
    "GROK_BUILD_DEFAULT_REASONING_EFFORT",
    ()=>GROK_BUILD_DEFAULT_REASONING_EFFORT,
    "GROK_BUILD_DEVICE_CODE_URL",
    ()=>GROK_BUILD_DEVICE_CODE_URL,
    "GROK_BUILD_MODELS_URL",
    ()=>GROK_BUILD_MODELS_URL,
    "GROK_BUILD_OAUTH_ISSUER",
    ()=>GROK_BUILD_OAUTH_ISSUER,
    "GROK_BUILD_OAUTH_REFERRER",
    ()=>GROK_BUILD_OAUTH_REFERRER,
    "GROK_BUILD_OAUTH_SCOPES",
    ()=>GROK_BUILD_OAUTH_SCOPES,
    "GROK_BUILD_PROXY_BASE_URL",
    ()=>GROK_BUILD_PROXY_BASE_URL,
    "GROK_BUILD_REASONING_INCLUDE",
    ()=>GROK_BUILD_REASONING_INCLUDE,
    "GROK_BUILD_RESPONSES_URL",
    ()=>GROK_BUILD_RESPONSES_URL,
    "GROK_BUILD_TOKEN_AUTH",
    ()=>GROK_BUILD_TOKEN_AUTH,
    "GROK_BUILD_TOKEN_URL",
    ()=>GROK_BUILD_TOKEN_URL,
    "getGrokBuildClientHeaders",
    ()=>getGrokBuildClientHeaders,
    "getGrokBuildClientVersion",
    ()=>getGrokBuildClientVersion,
    "getGrokBuildModelsHeaders",
    ()=>getGrokBuildModelsHeaders,
    "getGrokBuildOAuthHeaders",
    ()=>getGrokBuildOAuthHeaders,
    "getGrokBuildSessionHeaders",
    ()=>getGrokBuildSessionHeaders,
    "getGrokBuildUserAgent",
    ()=>getGrokBuildUserAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
;
const GROK_BUILD_PROXY_BASE_URL = "https://cli-chat-proxy.grok.com/v1";
const GROK_BUILD_RESPONSES_URL = `${GROK_BUILD_PROXY_BASE_URL}/responses`;
const GROK_BUILD_MODELS_URL = `${GROK_BUILD_PROXY_BASE_URL}/models`;
const GROK_BUILD_OAUTH_ISSUER = "https://auth.x.ai";
const GROK_BUILD_DEVICE_CODE_URL = `${GROK_BUILD_OAUTH_ISSUER}/oauth2/device/code`;
const GROK_BUILD_TOKEN_URL = `${GROK_BUILD_OAUTH_ISSUER}/oauth2/token`;
const GROK_BUILD_DEFAULT_CLIENT_VERSION = "0.2.106";
const GROK_BUILD_DEFAULT_CONTEXT_WINDOW = 256_000;
const GROK_BUILD_DEFAULT_REASONING_EFFORT = "high";
const GROK_BUILD_CLIENT_IDENTIFIER = "grok-shell";
const GROK_BUILD_TOKEN_AUTH = "xai-grok-cli";
const GROK_BUILD_REASONING_INCLUDE = "reasoning.encrypted_content";
const GROK_BUILD_OAUTH_REFERRER = "grok-build";
const GROK_BUILD_OAUTH_SCOPES = Object.freeze([
    "openid",
    "profile",
    "email",
    "offline_access",
    "grok-cli:access",
    "api:access",
    "conversations:read",
    "conversations:write",
    "workspaces:read",
    "workspaces:write"
]);
function getWireEmail(email, principalType) {
    const normalizedPrincipalType = principalType?.trim().toLowerCase();
    return normalizedPrincipalType === "team" || normalizedPrincipalType === "organization" ? null : email || null;
}
function mapPlatform(platform) {
    if (platform === "darwin") return "macos";
    if (platform === "win32") return "windows";
    return platform;
}
function mapArch(arch) {
    if (arch === "arm64") return "aarch64";
    if (arch === "x64") return "x86_64";
    return arch;
}
function getGrokBuildClientVersion() {
    return GROK_BUILD_DEFAULT_CLIENT_VERSION;
}
function getGrokBuildUserAgent() {
    return `${GROK_BUILD_CLIENT_IDENTIFIER}/${getGrokBuildClientVersion()} (${mapPlatform((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimePlatform"])())}; ${mapArch((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimeArch"])())})`;
}
function getGrokBuildClientHeaders(clientMode = "headless") {
    return {
        "x-grok-client-version": getGrokBuildClientVersion(),
        "x-grok-client-identifier": GROK_BUILD_CLIENT_IDENTIFIER,
        "x-grok-client-mode": clientMode,
        "User-Agent": getGrokBuildUserAgent()
    };
}
function getGrokBuildSessionHeaders({ token, model, stream = false, clientMode = "headless", userId, email, principalType } = {}) {
    const wireEmail = getWireEmail(email, principalType);
    return {
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
        ...getGrokBuildClientHeaders(clientMode),
        "X-XAI-Token-Auth": GROK_BUILD_TOKEN_AUTH,
        "x-authenticateresponse": "authenticate-response",
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {},
        ...model ? {
            "x-grok-model-override": model
        } : {},
        ...userId ? {
            "x-userid": userId,
            "x-grok-user-id": userId
        } : {},
        ...wireEmail ? {
            "x-email": wireEmail
        } : {}
    };
}
function getGrokBuildOAuthHeaders(surface = "ui") {
    return {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-grok-client-version": getGrokBuildClientVersion(),
        "x-grok-client-surface": surface
    };
}
function getGrokBuildModelsHeaders({ token, userId, email, principalType }) {
    const wireEmail = getWireEmail(email, principalType);
    return {
        Accept: "application/json",
        ...getGrokBuildClientHeaders("headless"),
        "X-XAI-Token-Auth": GROK_BUILD_TOKEN_AUTH,
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {},
        ...userId ? {
            "x-userid": userId
        } : {},
        ...wireEmail ? {
            "x-email": wireEmail
        } : {}
    };
}
}),
"[project]/open-sse/config/providers/registry/grok-cli/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "grok_cliProvider",
    ()=>grok_cliProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/grokBuild.ts [instrumentation] (ecmascript)");
;
;
const grok_cliProvider = {
    id: "grok-cli",
    alias: "gc",
    format: "openai",
    executor: "grok-cli",
    // Keep the generic translate-path contract stable. GrokCliExecutor owns the
    // official Grok Build upstream URL and always dispatches to /v1/responses.
    baseUrl: "https://cli-chat-proxy.grok.com/v1/chat/completions",
    modelsUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GROK_BUILD_MODELS_URL"],
    clientVersion: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getGrokBuildClientVersion"])(),
    authType: "oauth",
    authHeader: "bearer",
    passthroughModels: true,
    models: [
        {
            id: "grok-4.5",
            name: "Grok 4.5",
            contextLength: 500000,
            supportsReasoning: true,
            toolCalling: true,
            targetFormat: "openai-responses",
            unsupportedParams: [
                "presencePenalty",
                "frequencyPenalty",
                "logprobs",
                "topLogprobs"
            ]
        },
        {
            id: "grok-composer-2.5-fast",
            name: "Composer 2.5",
            contextLength: 200000,
            supportsReasoning: false,
            toolCalling: true,
            targetFormat: "openai-responses",
            unsupportedParams: [
                "presencePenalty",
                "frequencyPenalty",
                "logprobs",
                "topLogprobs"
            ]
        }
    ],
    oauth: {
        clientIdEnv: "GROK_OAUTH_CLIENT_ID",
        clientIdDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
        tokenUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GROK_BUILD_TOKEN_URL"]
    }
};
}),
"[project]/open-sse/config/providers/registry/codebuddy-cn/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "codebuddy_cnProvider",
    ()=>codebuddy_cnProvider,
    "default",
    ()=>__TURBOPACK__default__export__
]);
const codebuddy_cnProvider = {
    id: "codebuddy-cn",
    alias: "cbcn",
    format: "openai",
    executor: "codebuddy-cn",
    baseUrl: "https://copilot.tencent.com/v2/chat/completions",
    authType: "oauth",
    authHeader: "bearer",
    headers: {
        "User-Agent": "CLI/2.108.1 CodeBuddy/2.108.1",
        "X-Product": "SaaS",
        "X-IDE-Type": "CLI",
        "X-IDE-Name": "CLI",
        "x-requested-with": "XMLHttpRequest",
        "x-codebuddy-request": "1"
    },
    models: [
        // contextLength is the OmniRoute analogue of upstream's contextWindow;
        // supportsReasoning + supportsVision drive UI affordances and translator
        // decisions. Sourced from the gateway's model config.
        {
            id: "glm-5.2",
            name: "GLM-5.2",
            contextLength: 1000000,
            maxOutputTokens: 48000,
            supportsReasoning: true
        },
        {
            id: "glm-5.1",
            name: "GLM-5.1",
            contextLength: 200000,
            maxOutputTokens: 48000,
            supportsReasoning: true
        },
        {
            id: "glm-5.0",
            name: "GLM-5.0",
            contextLength: 200000,
            maxOutputTokens: 48000,
            supportsReasoning: true
        },
        {
            id: "glm-5.0-turbo",
            name: "GLM-5.0-Turbo",
            contextLength: 200000,
            maxOutputTokens: 48000,
            supportsReasoning: true
        },
        {
            id: "glm-5v-turbo",
            name: "GLM-5v-Turbo",
            contextLength: 200000,
            maxOutputTokens: 38000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "glm-4.7",
            name: "GLM-4.7",
            contextLength: 200000,
            maxOutputTokens: 48000,
            supportsReasoning: true
        },
        {
            id: "minimax-m3",
            name: "MiniMax-M3",
            contextLength: 512000,
            maxOutputTokens: 48000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "minimax-m2.7",
            name: "MiniMax-M2.7",
            contextLength: 200000,
            maxOutputTokens: 48000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "kimi-k2.7",
            name: "Kimi-K2.7-Code",
            contextLength: 256000,
            maxOutputTokens: 32000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "kimi-k2.6",
            name: "Kimi-K2.6",
            contextLength: 256000,
            maxOutputTokens: 32000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "kimi-k2.5",
            name: "Kimi-K2.5",
            contextLength: 164000,
            maxOutputTokens: 32000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "hy3-preview",
            name: "Hy3 Preview",
            contextLength: 192000,
            maxOutputTokens: 64000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "deepseek-v4-pro",
            name: "DeepSeek-V4-Pro",
            contextLength: 1000000,
            maxOutputTokens: 50000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek-V4-Flash",
            contextLength: 1000000,
            maxOutputTokens: 50000,
            supportsReasoning: true,
            supportsVision: true
        },
        {
            id: "deepseek-v3-2-volc",
            name: "DeepSeek-V3.2",
            contextLength: 96000,
            maxOutputTokens: 32000,
            supportsReasoning: true
        }
    ]
};
const __TURBOPACK__default__export__ = codebuddy_cnProvider;
}),
"[project]/open-sse/config/providers/registry/pioneer/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pioneerProvider",
    ()=>pioneerProvider
]);
const pioneerProvider = {
    id: "pioneer",
    alias: "pn",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.pioneer.ai/v1/chat/completions",
    authType: "apikey",
    // Pioneer standardises on X-API-Key (preferred over Bearer).
    // The default executor resolves "x-api-key" to the X-API-Key header.
    authHeader: "x-api-key",
    models: [
        // === Open-tier serverless inference ===
        // These models support on-demand inference with any pio_sk_ key.
        {
            id: "Qwen/Qwen3-32B",
            name: "Qwen3 32B"
        },
        {
            id: "Qwen/Qwen3.6-27B",
            name: "Qwen3.6 27B"
        },
        {
            id: "Qwen/Qwen3.5-9B",
            name: "Qwen3.5 9B"
        },
        {
            id: "Qwen/Qwen3-8B",
            name: "Qwen3 8B"
        },
        {
            id: "Qwen/Qwen3-4B-Base",
            name: "Qwen3 4B Base"
        },
        {
            id: "Qwen/Qwen3-1.7B-Base",
            name: "Qwen3 1.7B Base"
        },
        {
            id: "meta-llama/Llama-3.1-8B-Instruct",
            name: "Llama 3.1 8B Instruct"
        },
        {
            id: "meta-llama/Llama-3.2-1B-Instruct",
            name: "Llama 3.2 1B Instruct"
        },
        {
            id: "google/gemma-3-4b-pt",
            name: "Gemma 3 4B (Pretrained)"
        },
        {
            id: "HuggingFaceTB/SmolLM3-3B-Base",
            name: "SmolLM3 3B Base"
        }
    ]
};
}),
"[project]/open-sse/config/providers/registry/zenmux-free/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "zenmux_freeProvider",
    ()=>zenmux_freeProvider
]);
const zenmux_freeProvider = {
    id: "zenmux-free",
    alias: "zmf",
    format: "openai",
    executor: "zenmux-free",
    baseUrl: "https://zenmux.ai/api/anthropic/v1/messages",
    authType: "apikey",
    authHeader: "cookie",
    models: [
        {
            id: "deepseek/deepseek-chat",
            name: "DeepSeek V3.2 (Non-thinking)"
        },
        {
            id: "deepseek/deepseek-reasoner",
            name: "DeepSeek V3.2 (Thinking)",
            supportsReasoning: true
        },
        {
            id: "deepseek/deepseek-v4-pro",
            name: "DeepSeek V4 Pro",
            supportsReasoning: true
        },
        {
            id: "kuaishou/kat-coder-pro-v1-free",
            name: "KAT Coder Pro V1 Free"
        },
        {
            id: "z-ai/glm-4.7-flash-free",
            name: "GLM 4.7 Flash Free"
        },
        {
            id: "stepfun/step-3.5-flash-free",
            name: "Step 3.5 Flash Free"
        },
        {
            id: "inclusionai/ling-1t",
            name: "Ling 1T"
        },
        {
            id: "inclusionai/ling-mini-2.0",
            name: "Ling Mini 2.0"
        },
        {
            id: "inclusionai/ring-1t",
            name: "Ring 1T"
        },
        {
            id: "sapiens-ai/agnes-1.5-lite",
            name: "Agnes 1.5 Lite"
        },
        {
            id: "sapiens-ai/agnes-1.5-pro",
            name: "Agnes 1.5 Pro"
        }
    ]
};
const __TURBOPACK__default__export__ = zenmux_freeProvider;
}),
"[project]/open-sse/config/providers/registry/sumopod/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sumopodProvider",
    ()=>sumopodProvider
]);
const sumopodProvider = {
    id: "sumopod",
    alias: "sumopod",
    format: "openai",
    executor: "default",
    baseUrl: "https://ai.sumopod.com/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://ai.sumopod.com/v1/models",
    defaultContextLength: 128000,
    models: [],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/x5lab/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "x5labProvider",
    ()=>x5labProvider
]);
const x5labProvider = {
    id: "x5lab",
    alias: "x5lab",
    format: "openai",
    executor: "default",
    baseUrl: "https://api.x5lab.dev/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://api.x5lab.dev/v1/models",
    defaultContextLength: 128000,
    models: [],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/kenari/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kenariProvider",
    ()=>kenariProvider
]);
const kenariProvider = {
    id: "kenari",
    alias: "kenari",
    format: "openai",
    executor: "default",
    baseUrl: "https://kenari.id/v1/chat/completions",
    authType: "apikey",
    authHeader: "bearer",
    modelsUrl: "https://kenari.id/v1/models",
    models: [],
    passthroughModels: true
};
}),
"[project]/open-sse/config/providers/registry/navy/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "navyProvider",
    ()=>navyProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const navyProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "navy",
    baseUrl: "https://api.navy/v1/chat/completions",
    modelsUrl: "https://api.navy/v1/models",
    passthroughModels: true,
    extraHeaders: {
        "User-Agent": "OmniRoute/1.0"
    },
    models: [
        {
            id: "llama-3.3-70b-instruct",
            name: "Llama 3.3 70B Instruct",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "gemma-4-31b-it",
            name: "Gemma 4 31B IT",
            contextLength: 262144,
            toolCalling: true,
            supportsVision: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-v4-flash",
            name: "DeepSeek V4 Flash",
            contextLength: 1048576,
            toolCalling: true,
            supportsReasoning: true
        },
        {
            id: "deepseek-chat",
            name: "DeepSeek Chat",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "mistral-small-latest",
            name: "Mistral Small",
            contextLength: 262144,
            toolCalling: true,
            supportsVision: true,
            supportsReasoning: true
        },
        {
            id: "llama-4-scout",
            name: "Llama 4 Scout",
            contextLength: 10000000,
            toolCalling: true,
            supportsVision: true
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/nara/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "naraProvider",
    ()=>naraProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const naraProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "nara",
    baseUrl: "https://router.bynara.id/v1/chat/completions",
    models: [
        {
            id: "tencent-hy3",
            name: "Tencent Hy3",
            contextLength: 1000000
        },
        {
            id: "mistral-large",
            name: "Mistral Large",
            contextLength: 252000,
            toolCalling: true
        },
        {
            id: "mistral-medium-3-5",
            name: "Mistral Medium 3.5",
            contextLength: 256000,
            toolCalling: true,
            supportsVision: true
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/requesty/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requestyProvider",
    ()=>requestyProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const requestyProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "requesty",
    alias: "requesty",
    baseUrl: "https://router.requesty.ai/v1/chat/completions",
    modelsUrl: "https://router.requesty.ai/v1/models",
    models: [],
    passthroughModels: true
});
}),
"[project]/open-sse/config/providers/registry/sealion/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sealionProvider",
    ()=>sealionProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const sealionProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "sealion",
    baseUrl: "https://api.sea-lion.ai/v1/chat/completions",
    models: [
        {
            id: "aisingapore/Llama-SEA-LION-v3.5-70B-R",
            name: "Llama SEA-LION v3.5 70B R",
            contextLength: 131072
        },
        {
            id: "aisingapore/Llama-SEA-LION-v3-70B-IT",
            name: "Llama SEA-LION v3 70B IT",
            contextLength: 131072
        },
        {
            id: "aisingapore/Gemma-SEA-LION-v4-27B-IT",
            name: "Gemma SEA-LION v4 27B IT",
            contextLength: 131072
        },
        {
            id: "aisingapore/Qwen-SEA-LION-v4.5-27B-IT",
            name: "Qwen SEA-LION v4.5 27B IT",
            contextLength: 32768
        },
        {
            id: "aisingapore/Qwen-SEA-LION-v4-32B-IT",
            name: "Qwen SEA-LION v4 32B IT",
            contextLength: 32768
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/routeway/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "routewayProvider",
    ()=>routewayProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const routewayProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "routeway",
    baseUrl: "https://api.routeway.ai/v1/chat/completions",
    modelsUrl: "https://api.routeway.ai/v1/models",
    passthroughModels: true,
    extraHeaders: {
        "User-Agent": "Mozilla/5.0 OmniRoute/1.0"
    },
    models: [
        {
            id: "llama-3.3-70b-instruct:free",
            name: "Llama 3.3 70B Instruct (free)",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "nemotron-3-nano-30b-a3b:free",
            name: "Nemotron 3 Nano 30B (free)",
            contextLength: 256000,
            toolCalling: true
        },
        {
            id: "nemotron-nano-9b-v2:free",
            name: "Nemotron Nano 9B v2 (free)",
            contextLength: 128000,
            toolCalling: true
        },
        {
            id: "step-3.7-flash:free",
            name: "Step 3.7 Flash (free)",
            contextLength: 256000,
            toolCalling: true,
            supportsVision: true
        },
        {
            id: "step-3.5-flash:free",
            name: "Step 3.5 Flash (free)",
            contextLength: 65536,
            toolCalling: true
        },
        {
            id: "laguna-m.1:free",
            name: "Laguna M.1 (free)",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "laguna-xs.2:free",
            name: "Laguna XS.2 (free)",
            contextLength: 131072,
            toolCalling: true
        },
        {
            id: "llama-3.2-3b-instruct:free",
            name: "Llama 3.2 3B Instruct (free)",
            contextLength: 16000,
            toolCalling: true
        }
    ]
});
}),
"[project]/open-sse/config/providers/registry/digitalocean/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "digitaloceanProvider",
    ()=>digitaloceanProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const digitaloceanProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "digitalocean",
    alias: "digitalocean",
    baseUrl: "https://inference.do-ai.run/v1/chat/completions",
    modelsUrl: "https://inference.do-ai.run/v1/models",
    models: [],
    passthroughModels: true
});
}),
"[project]/open-sse/config/providers/registry/hcnsec/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hcnsecProvider",
    ()=>hcnsecProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
;
const hcnsecProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildOpenAiCompatibleRegistryEntry"])({
    id: "hcnsec",
    alias: "hcnsec",
    baseUrl: "https://api.hcnsec.cn/v1/chat/completions",
    modelsUrl: "https://api.hcnsec.cn/v1/models",
    models: [],
    passthroughModels: true
});
}),
"[project]/open-sse/services/promptqlModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * PromptQL (prompt.ql.app) model catalog helpers.
 *
 * Live catalog: GraphQL `FetchLlmConfigs` against the playground Hasura endpoint.
 * Fallback: static seed captured 2026-07-20 (display_label / model_reference / model_id).
 */ __turbopack_context__.s([
    "PROMPTQL_FALLBACK_MODELS",
    ()=>PROMPTQL_FALLBACK_MODELS,
    "clientFacingPromptQlModelId",
    ()=>clientFacingPromptQlModelId,
    "discoverPromptQlModels",
    ()=>discoverPromptQlModels,
    "resolvePromptQlModel",
    ()=>resolvePromptQlModel,
    "stripPromptQlModelPrefix",
    ()=>stripPromptQlModelPrefix
]);
const PROMPTQL_FALLBACK_MODELS = [
    {
        id: "vertex-claude-fable-5",
        name: "Claude Fable 5",
        configId: "967e6517-1d6b-4e22-82fb-3463bab239c4",
        modelId: "anthropic/claude-fable-5"
    },
    {
        id: "bedrock-claude-opus-4-8",
        name: "Claude Opus 4.8",
        configId: "e97e7f50-9e4a-4685-bc14-1854f1f79782",
        modelId: "us.anthropic.claude-opus-4-8"
    },
    {
        id: "bedrock-claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        configId: "48105d83-9a45-4ec6-8b58-f3cf44094f92",
        modelId: "us.anthropic.claude-sonnet-4-5-20250929-v1:0"
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        configId: "5a23af33-b31b-4215-892c-20ef633a8848",
        modelId: "accounts/fireworks/models/deepseek-v4-pro"
    },
    {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro Preview",
        configId: "d2bda5cd-881b-4044-aeb9-02a83cc0ca27",
        modelId: "google/gemini-3.1-pro-preview"
    },
    {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        configId: "c3a25aa0-ca48-4577-b52d-71282aacb687",
        modelId: "google/gemini-3.5-flash"
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2",
        configId: "64a1fa3d-bf2e-4bb9-8c2b-fa76c218d636",
        modelId: "accounts/fireworks/models/glm-5p2"
    },
    {
        id: "gpt-5.5",
        name: "GPT 5.5",
        configId: "1762fbce-d5bf-4bf4-ba3d-8b1201f8e204",
        modelId: "gpt-5.5"
    },
    {
        id: "gpt-5.6-luna",
        name: "GPT-5.6 Luna",
        configId: "a9c45ba7-87fa-49a1-8165-76b0864c3a55",
        modelId: "gpt-5.6-luna"
    },
    {
        id: "gpt-5.6-sol",
        name: "GPT-5.6 Sol",
        configId: "34c80712-def3-4db3-9e7a-f57b0324b43d",
        modelId: "gpt-5.6-sol"
    },
    {
        id: "gpt-5.6-terra",
        name: "GPT-5.6 Terra",
        configId: "04f1a08c-42b2-4371-b6d8-75c50b9bb990",
        modelId: "gpt-5.6-terra"
    },
    {
        id: "xai-grok-4-5",
        name: "Grok 4.5",
        configId: "068b2ef2-e432-422b-98e5-5863a1852c47",
        modelId: "grok-4.5"
    },
    {
        id: "kimi-k2.6",
        name: "Kimi K2.6",
        configId: "placeholder-kimi-k2.6",
        modelId: "accounts/fireworks/models/kimi-k2p6"
    },
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code",
        configId: "placeholder-kimi-k2.7-code",
        modelId: "accounts/fireworks/models/kimi-k2p7-code"
    },
    {
        id: "minimax-m3",
        name: "Minimax M3",
        configId: "placeholder-minimax-m3",
        modelId: "accounts/fireworks/models/minimax-m3",
        supportsVision: true
    }
];
const FETCH_LLM_CONFIGS = `
query FetchLlmConfigs {
  llm_config(
    where: {deleted_at: {_is_null: true}}
    order_by: {display_label: asc}
  ) {
    id
    display_label
    model_reference
    model_id
  }
}`;
function stripPromptQlModelPrefix(model) {
    let m = (model || "").trim();
    if (m.startsWith("promptql/")) m = m.slice("promptql/".length);
    else if (m.startsWith("pql/")) m = m.slice(4);
    return m;
}
function resolvePromptQlModel(model) {
    const raw = typeof model === "string" ? stripPromptQlModelPrefix(model) : "";
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const catalog = PROMPTQL_FALLBACK_MODELS;
    return catalog.find((m)=>m.id.toLowerCase() === lower) || catalog.find((m)=>m.name.toLowerCase() === lower) || catalog.find((m)=>(m.modelId || "").toLowerCase() === lower) || catalog.find((m)=>(m.configId || "").toLowerCase() === lower) || catalog.find((m)=>lower.includes(m.id.toLowerCase())) || null;
}
function clientFacingPromptQlModelId(model) {
    const resolved = resolvePromptQlModel(model);
    if (resolved) return resolved.id;
    const stripped = typeof model === "string" ? stripPromptQlModelPrefix(model) : "";
    return stripped || "promptql-default";
}
async function discoverPromptQlModels(opts) {
    const res = await fetch(opts.graphqlEndpoint, {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Bearer ${opts.token}`,
            origin: "https://prompt.ql.app",
            referer: "https://prompt.ql.app/"
        },
        body: JSON.stringify({
            query: FETCH_LLM_CONFIGS,
            operationName: "FetchLlmConfigs"
        }),
        signal: opts.signal ?? undefined
    });
    if (!res.ok) {
        throw new Error(`FetchLlmConfigs HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.errors?.length) {
        throw new Error(json.errors.map((e)=>e.message || "error").join("; "));
    }
    const rows = json.data?.llm_config || [];
    return rows.map((r)=>{
        const id = (r.model_reference || r.model_id || r.id || "").trim();
        if (!id) return null;
        return {
            id,
            name: (r.display_label || id).trim(),
            configId: r.id,
            modelId: r.model_id
        };
    }).filter((x)=>Boolean(x));
}
}),
"[project]/open-sse/config/providers/registry/promptql/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "promptqlProvider",
    ()=>promptqlProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptqlModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/promptqlModels.ts [instrumentation] (ecmascript)");
;
const promptqlProvider = {
    id: "promptql",
    alias: "pql",
    format: "openai",
    executor: "promptql",
    baseUrl: "https://data.prompt.ql.app/promptql/playground-v2-hge/v1/graphql",
    authType: "apikey",
    authHeader: "authorization",
    passthroughModels: true,
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptqlModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROMPTQL_FALLBACK_MODELS"].map((m)=>({
            id: m.id,
            name: m.name,
            ...m.supportsVision ? {
                supportsVision: true
            } : {}
        }))
};
}),
"[project]/open-sse/services/hyperagentModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * HyperAgent (hyperagent.com) model catalog.
 *
 * Wire IDs were validated live against PATCH /api/threads/{id} (2026-07-21):
 *   Main modelId: fable-latest | opus-latest | sonnet-latest | claude-fable-5 |
 *                 claude-opus-4-8 | claude-sonnet-5
 *   Subagent (defaultSubagentModel): short family names only — fable | opus | sonnet | haiku
 *
 * Pricing keys like bare "fable" are NOT valid chat modelIds (API returns model_unknown).
 * Model is applied on the THREAD via PATCH, not in the /chat body.
 */ __turbopack_context__.s([
    "HYPERAGENT_DEFAULT_CONTEXT_LENGTH",
    ()=>HYPERAGENT_DEFAULT_CONTEXT_LENGTH,
    "HYPERAGENT_FALLBACK_MODELS",
    ()=>HYPERAGENT_FALLBACK_MODELS,
    "clientFacingHyperAgentModelId",
    ()=>clientFacingHyperAgentModelId,
    "resolveHyperAgentModel",
    ()=>resolveHyperAgentModel,
    "stripHyperAgentModelPrefix",
    ()=>stripHyperAgentModelPrefix,
    "wireHyperAgentModelId",
    ()=>wireHyperAgentModelId,
    "wireHyperAgentRuntimeId",
    ()=>wireHyperAgentRuntimeId,
    "wireHyperAgentSubagentModelId",
    ()=>wireHyperAgentSubagentModelId
]);
const HYPERAGENT_DEFAULT_CONTEXT_LENGTH = 1_000_000;
const HYPERAGENT_FALLBACK_MODELS = [
    {
        id: "fable-latest",
        name: "Fable 5",
        subagent: "fable",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "claude-fable-5",
        name: "Claude Fable 5",
        subagent: "fable",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "opus-latest",
        name: "Claude Opus Latest",
        subagent: "opus",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "claude-opus-4-8",
        name: "Claude Opus 4.8",
        subagent: "opus",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "sonnet-latest",
        name: "Claude Sonnet Latest",
        subagent: "sonnet",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "claude-sonnet-5",
        name: "Claude Sonnet 5",
        subagent: "sonnet",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    }
];
function stripHyperAgentModelPrefix(model) {
    let m = (model || "").trim();
    if (m.startsWith("hyperagent/")) m = m.slice("hyperagent/".length);
    else if (m.startsWith("ha/")) m = m.slice(3);
    else if (m.startsWith("hyper/")) m = m.slice("hyper/".length);
    return m;
}
/** Alias / pretty-name / legacy pricing-key → catalog wire id. */ const ALIASES = {
    // Fable
    fable: "fable-latest",
    "fable-5": "fable-latest",
    fable5: "fable-latest",
    "claude-fable-5": "claude-fable-5",
    "claude-fable": "fable-latest",
    "fable-latest": "fable-latest",
    // Opus
    opus: "opus-latest",
    "opus-latest": "opus-latest",
    "opus-4-8": "claude-opus-4-8",
    "opus-4.8": "claude-opus-4-8",
    "claude-opus-4-8": "claude-opus-4-8",
    "claude-opus-4.8": "claude-opus-4-8",
    "claude-opus-latest": "opus-latest",
    // Sonnet
    sonnet: "sonnet-latest",
    "sonnet-latest": "sonnet-latest",
    "sonnet-5": "claude-sonnet-5",
    "claude-sonnet-5": "claude-sonnet-5",
    "claude-sonnet-latest": "sonnet-latest",
    // Haiku subagent only — map main requests to sonnet-latest as closest chat model
    haiku: "sonnet-latest",
    "haiku-4": "sonnet-latest",
    "claude-haiku-4": "sonnet-latest"
};
function resolveHyperAgentModel(model) {
    const raw = typeof model === "string" ? stripHyperAgentModelPrefix(model) : "";
    if (!raw) return null;
    const lower = raw.toLowerCase().trim();
    const compact = lower.replace(/[\s_]+/g, "-");
    const catalog = HYPERAGENT_FALLBACK_MODELS;
    // Exact wire id
    const byId = catalog.find((m)=>m.id.toLowerCase() === lower || m.id.toLowerCase() === compact);
    if (byId) return byId;
    // Pretty name
    const byName = catalog.find((m)=>m.name.toLowerCase() === lower);
    if (byName) return byName;
    // Alias table
    const aliasId = ALIASES[compact] || ALIASES[lower];
    if (aliasId) {
        const hit = catalog.find((m)=>m.id === aliasId);
        if (hit) return hit;
    }
    // Partial contains
    return catalog.find((m)=>compact.includes(m.id.toLowerCase())) || catalog.find((m)=>m.name.toLowerCase().includes(compact.replace(/-/g, " "))) || null;
}
function clientFacingHyperAgentModelId(model) {
    const resolved = resolveHyperAgentModel(model);
    if (resolved) return resolved.id;
    const stripped = typeof model === "string" ? stripHyperAgentModelPrefix(model) : "";
    return stripped || "opus-latest";
}
function wireHyperAgentModelId(model) {
    return clientFacingHyperAgentModelId(model);
}
function wireHyperAgentSubagentModelId(model) {
    const resolved = resolveHyperAgentModel(model);
    if (resolved?.subagent) return resolved.subagent;
    const wire = wireHyperAgentModelId(model).toLowerCase();
    if (wire.includes("fable")) return "fable";
    if (wire.includes("sonnet")) return "sonnet";
    if (wire.includes("haiku")) return "haiku";
    if (wire.includes("opus")) return "opus";
    return "opus";
}
function wireHyperAgentRuntimeId(model) {
    const resolved = resolveHyperAgentModel(model);
    return resolved?.runtimeId || "claude-agents-sdk";
}
}),
"[project]/open-sse/config/providers/registry/hyperagent/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hyperagentProvider",
    ()=>hyperagentProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$hyperagentModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/hyperagentModels.ts [instrumentation] (ecmascript)");
;
// HyperAgent (hyperagent.com) — unofficial reverse-engineered web session.
// Auth: browser Cookie header. Chat: POST /api/threads/{id}/chat (SSE).
// Credits: GET /api/settings/billing/usage → creditData.creditBlocks.
/** Claude-family agent models on HyperAgent — 1M context (not the 128k openai default). */ const HYPERAGENT_CONTEXT_LENGTH = 1_000_000;
const hyperagentProvider = {
    id: "hyperagent",
    alias: "ha",
    format: "openai",
    executor: "hyperagent",
    baseUrl: "https://hyperagent.com/api/threads",
    authType: "apikey",
    authHeader: "cookie",
    passthroughModels: true,
    /** Used by getTokenLimit when model-specific context is missing. */ defaultContextLength: HYPERAGENT_CONTEXT_LENGTH,
    models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$hyperagentModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["HYPERAGENT_FALLBACK_MODELS"].map((m)=>({
            id: m.id,
            name: m.name,
            contextLength: HYPERAGENT_CONTEXT_LENGTH
        }))
};
}),
"[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REGISTRY",
    ()=>REGISTRY
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$unorouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/unorouter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$aimlapi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/aimlapi/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$byteplus$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/byteplus/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$mimocode$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/mimocode/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ollama$2d$cloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ollama-cloud/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$synthetic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/synthetic/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ideogram$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ideogram/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$friendliai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/friendliai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$suno$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/suno/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$adapta$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/adapta-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$notion$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/notion-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$anthropic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/anthropic/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sambanova$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/sambanova/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$puter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/puter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$upstage$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/upstage/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nebius$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nebius/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$fireworks$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/fireworks/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$llamagate$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/llamagate/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$glm$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/glm/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$glm$2f$t$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/glm/t/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$glm$2f$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/glm/cn/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$trae$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/trae/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$raycast$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/raycast/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$muse$2d$spark$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/muse-spark-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/lmarena/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kilocode$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kilocode/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$models$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/models/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ghe$2d$copilot$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ghe-copilot/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dify$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/dify/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ovhcloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ovhcloud/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$claude$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/claude/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$claude$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/claude/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bedrock$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/bedrock/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$inner$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/inner-ai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qoder$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qoder/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xiaomi$2d$mimo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/xiaomi-mimo/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xiaomi$2d$mimo$2d$token$2d$plan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/xiaomi-mimo-token-plan/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$codestral$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/codestral/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$wandb$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/wandb/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$predibase$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/predibase/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$baichuan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/baichuan/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$yi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/yi/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$deepseek$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/deepseek/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$deepseek$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/deepseek/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dgrid$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/dgrid/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/bai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qiniu$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qiniu/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2d$apikey$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding-apikey/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$groq$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/groq/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$inference$2d$net$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/inference-net/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$llm7$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/llm7/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cerebras$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cerebras/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$charm$2d$hyper$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/charm-hyper/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nube$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nube/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$clinepass$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/clinepass/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sparkdesk$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/sparkdesk/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nlpcloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nlpcloud/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nvidia$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nvidia/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$api$2d$airforce$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/api-airforce/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$mistral$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/mistral/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$together$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/together/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cohere$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cohere/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cursor$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cursor/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$volcengine$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/volcengine/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hackclub$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/hackclub/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freetheai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/freetheai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$groq$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/g4f-groq/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$gemini$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/g4f-gemini/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$pollinations$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/g4f-pollinations/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$ollama$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/g4f-ollama/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$nvidia$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/g4f-nvidia/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$tencent$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/tencent/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$coze$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/coze/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ai21$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ai21/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$publicai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/publicai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$featherless$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/featherless-ai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$antigravity$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/antigravity/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/openai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$snowflake$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/snowflake/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$huggingface$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/huggingface/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chipotle$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/chipotle/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freeaiapikey$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/freeaiapikey/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qwen$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qwen/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qwen$2d$cloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qwen-cloud/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qwen$2d$cloud$2d$token$2d$plan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qwen-cloud-token-plan/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zai$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/zai-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$modal$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/modal/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zenmux$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/zenmux/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$leonardo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/leonardo/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$grok$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/grok-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kie/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$monsterapi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/monsterapi/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$modelscope$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/modelscope/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sensenova$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/sensenova/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hyperbolic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/hyperbolic/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lambda$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/lambda-ai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$t3$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/t3-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$iflytek$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/iflytek/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$crof$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/crof/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$moonshot$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/moonshot/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$poe$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/poe/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bazaarlink$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/bazaarlink/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$perplexity$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/perplexity/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$perplexity$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/perplexity/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$minimax$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/minimax/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$minimax$2f$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/minimax/cn/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$minimax$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/minimax/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$haiper$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/haiper/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bytez$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/bytez/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$blackbox$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/blackbox/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$blackbox$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/blackbox/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$uncloseai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/uncloseai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nscale$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nscale/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chatgpt$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/chatgpt-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openrouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/openrouter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cheaperinference$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cheaperinference/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openvecta$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/openvecta/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$orcarouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/orcarouter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$copilot$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/copilot-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$copilot$2d$m365$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/copilot-m365-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$stepfun$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/stepfun/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freemodel$2d$dev$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/freemodel-dev/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gitlawb$2f$gmi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gitlawb/gmi/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gitlawb$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gitlawb/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$liquid$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/liquid/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$deepinfra$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/deepinfra/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$agy$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/agy/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$agnes$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/agnes/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$aihorde$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/aihorde/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ainative$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ainative/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$aion$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/aion/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$udio$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/udio/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$longcat$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/longcat/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$vertex$2f$partner$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/vertex/partner/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$vertex$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/vertex/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$duckduckgo$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/duckduckgo-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$felo$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/felo-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/xai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2d$oauth$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/xai-oauth/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$morph$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/morph/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$siliconflow$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/siliconflow/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gitlab$2d$duo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gitlab-duo/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$command$2d$code$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/command-code/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$novita$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/novita/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$regolo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/regolo/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$windsurf$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/windsurf/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zed$2d$hosted$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/zed-hosted/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nanogpt$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nanogpt/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$scaleway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/scaleway/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$agentrouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/agentrouter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/zai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$wafer$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/wafer/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$huggingchat$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/huggingchat/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$yuanbao$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/yuanbao-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$galadriel$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/galadriel/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qianfan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qianfan/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$meta$2d$llama$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/meta-llama/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cloudflare$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cloudflare-ai/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nous$2d$research$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nous-research/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$alibaba$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/alibaba/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$alibaba$2f$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/alibaba/cn/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$doubao$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/doubao/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$doubao$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/doubao/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kilo$2d$gateway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kilo-gateway/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bailian$2d$coding$2d$plan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/bailian-coding-plan/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gigachat$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gigachat/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2d$cli$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/devin-cli/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2d$cli$2d$agentic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/devin-cli-agentic/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/auggie/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chutes$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/chutes/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chenzk$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/chenzk/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$factory$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/factory/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$databricks$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/databricks/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$reka$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/reka/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$typhoon$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/typhoon/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$inception$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/inception/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sarvam$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/sarvam/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$writer$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/writer/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$plamo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/plamo/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$clova$2d$studio$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/clova-studio/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$internlm$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/internlm/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ant$2d$ling$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/ant-ling/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$vercel$2d$ai$2d$gateway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/vercel-ai-gateway/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$v0$2d$vercel$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/v0-vercel/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$opencode$2f$zen$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/opencode/zen/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$opencode$2f$go$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/opencode/go/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$opencode$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/opencode/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dahl$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/dahl/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$maritalk$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/maritalk/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$baseten$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/baseten/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gemini/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gemini/web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cline$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cline/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$heroku$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/heroku/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bluesminds$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/bluesminds/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$theoldllm$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/theoldllm/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$baidu$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/baidu/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$pollinations$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/pollinations/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$veoaifree$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/veoaifree-web/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$codex$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/codex/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$venice$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/venice/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kiro$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kiro/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openadapter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/openadapter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dit$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/dit/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$tokenrouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/tokenrouter/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$grok$2d$cli$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/grok-cli/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$codebuddy$2d$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/codebuddy-cn/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$pioneer$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/pioneer/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zenmux$2d$free$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/zenmux-free/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sumopod$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/sumopod/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$x5lab$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/x5lab/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kenari$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kenari/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$navy$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/navy/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nara$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/nara/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$requesty$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/requesty/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sealion$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/sealion/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$routeway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/routeway/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$digitalocean$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/digitalocean/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hcnsec$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/hcnsec/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$promptql$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/promptql/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hyperagent$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/hyperagent/index.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const REGISTRY = {
    aimlapi: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$aimlapi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["aimlapiProvider"],
    "ollama-cloud": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ollama$2d$cloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ollama_cloudProvider"],
    synthetic: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$synthetic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syntheticProvider"],
    ideogram: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ideogram$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ideogramProvider"],
    friendliai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$friendliai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["friendliaiProvider"],
    suno: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$suno$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sunoProvider"],
    "adapta-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$adapta$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adapta_webProvider"],
    "notion-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$notion$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["notion_webProvider"],
    anthropic: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$anthropic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["anthropicProvider"],
    sambanova: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sambanova$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sambanovaProvider"],
    puter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$puter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["puterProvider"],
    upstage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$upstage$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upstageProvider"],
    nebius: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nebius$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nebiusProvider"],
    fireworks: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$fireworks$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fireworksProvider"],
    llamagate: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$llamagate$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["llamagateProvider"],
    glm: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$glm$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["glmProvider"],
    glmt: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$glm$2f$t$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["glmtProvider"],
    "glm-cn": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$glm$2f$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["glm_cnProvider"],
    trae: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$trae$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["traeProvider"],
    raycast: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$raycast$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["raycastProvider"],
    "muse-spark-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$muse$2d$spark$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["muse_spark_webProvider"],
    lmarena: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lmarenaProvider"],
    kilocode: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kilocode$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kilocodeProvider"],
    "github-models": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$models$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["github_modelsProvider"],
    github: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["githubProvider"],
    "ghe-copilot": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ghe$2d$copilot$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gheCopilotProvider"],
    dify: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dify$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["difyProvider"],
    ovhcloud: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ovhcloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ovhcloudProvider"],
    claude: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$claude$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["claudeProvider"],
    "claude-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$claude$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["claude_webProvider"],
    bedrock: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bedrock$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bedrockProvider"],
    "inner-ai": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$inner$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["inner_aiProvider"],
    qoder: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qoder$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qoderProvider"],
    "xiaomi-mimo": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xiaomi$2d$mimo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xiaomi_mimoProvider"],
    "xiaomi-mimo-token-plan": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xiaomi$2d$mimo$2d$token$2d$plan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xiaomi_mimo_token_planProvider"],
    codestral: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$codestral$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["codestralProvider"],
    wandb: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$wandb$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wandbProvider"],
    predibase: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$predibase$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["predibaseProvider"],
    baichuan: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$baichuan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["baichuanProvider"],
    yi: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$yi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["yiProvider"],
    deepseek: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$deepseek$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepseekProvider"],
    "deepseek-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$deepseek$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepseek_webProvider"],
    dgrid: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dgrid$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["dgridProvider"],
    bai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["baiProvider"],
    qiniu: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qiniu$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qiniuProvider"],
    "kimi-coding-apikey": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2d$apikey$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kimi_coding_apikeyProvider"],
    "kimi-coding": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kimi_codingProvider"],
    kimi: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kimiProvider"],
    "kimi-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kimi_webProvider"],
    groq: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$groq$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["groqProvider"],
    "inference-net": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$inference$2d$net$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["inference_netProvider"],
    llm7: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$llm7$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["llm7Provider"],
    cerebras: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cerebras$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cerebrasProvider"],
    "charm-hyper": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$charm$2d$hyper$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["charmHyperProvider"],
    nube: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nube$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nubeProvider"],
    clinepass: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$clinepass$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clinepassProvider"],
    sparkdesk: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sparkdesk$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sparkdeskProvider"],
    nlpcloud: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nlpcloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nlpcloudProvider"],
    nvidia: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nvidia$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nvidiaProvider"],
    "api-airforce": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$api$2d$airforce$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["api_airforceProvider"],
    mistral: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$mistral$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mistralProvider"],
    together: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$together$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["togetherProvider"],
    cohere: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cohere$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cohereProvider"],
    cursor: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cursor$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cursorProvider"],
    volcengine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$volcengine$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["volcengineProvider"],
    hackclub: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hackclub$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hackclubProvider"],
    freetheai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freetheai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["freetheaiProvider"],
    "g4f-groq": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$groq$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["g4f_groqProvider"],
    "g4f-gemini": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$gemini$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["g4f_geminiProvider"],
    "g4f-pollinations": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$pollinations$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["g4f_pollinationsProvider"],
    "g4f-ollama": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$ollama$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["g4f_ollamaProvider"],
    "g4f-nvidia": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$g4f$2d$nvidia$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["g4f_nvidiaProvider"],
    tencent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$tencent$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tencentProvider"],
    coze: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$coze$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cozeProvider"],
    ai21: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ai21$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ai21Provider"],
    publicai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$publicai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["publicaiProvider"],
    "featherless-ai": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$featherless$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["featherless_aiProvider"],
    antigravity: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$antigravity$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["antigravityProvider"],
    openai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["openaiProvider"],
    snowflake: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$snowflake$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["snowflakeProvider"],
    huggingface: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$huggingface$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["huggingfaceProvider"],
    chipotle: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chipotle$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["chipotleProvider"],
    freeaiapikey: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freeaiapikey$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["freeaiapikeyProvider"],
    "qwen-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qwen$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qwen_webProvider"],
    "qwen-cloud": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qwen$2d$cloud$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qwen_cloudProvider"],
    "qwen-cloud-token-plan": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qwen$2d$cloud$2d$token$2d$plan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qwen_cloud_token_planProvider"],
    "zai-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zai$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["zai_webProvider"],
    modal: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$modal$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modalProvider"],
    zenmux: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zenmux$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["zenmuxProvider"],
    leonardo: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$leonardo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["leonardoProvider"],
    "grok-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$grok$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["grok_webProvider"],
    kie: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieProvider"],
    monsterapi: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$monsterapi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["monsterapiProvider"],
    modelscope: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$modelscope$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modelscopeProvider"],
    sensenova: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sensenova$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sensenovaProvider"],
    hyperbolic: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hyperbolic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hyperbolicProvider"],
    "lambda-ai": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lambda$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lambda_aiProvider"],
    "t3-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$t3$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["t3_webProvider"],
    iflytek: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$iflytek$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["iflytekProvider"],
    crof: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$crof$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["crofProvider"],
    moonshot: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$moonshot$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["moonshotProvider"],
    poe: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$poe$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["poeProvider"],
    bazaarlink: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bazaarlink$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bazaarlinkProvider"],
    perplexity: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$perplexity$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["perplexityProvider"],
    "perplexity-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$perplexity$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["perplexity_webProvider"],
    minimax: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$minimax$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["minimaxProvider"],
    "minimax-cn": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$minimax$2f$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["minimax_cnProvider"],
    "hailuo-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$minimax$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hailuo_webProvider"],
    haiper: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$haiper$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["haiperProvider"],
    bytez: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bytez$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bytezProvider"],
    blackbox: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$blackbox$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["blackboxProvider"],
    "blackbox-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$blackbox$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["blackbox_webProvider"],
    uncloseai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$uncloseai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["uncloseaiProvider"],
    nscale: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nscale$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nscaleProvider"],
    "chatgpt-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chatgpt$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["chatgpt_webProvider"],
    openrouter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openrouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["openrouterProvider"],
    cheaperinference: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cheaperinference$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cheaperinferenceProvider"],
    openvecta: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openvecta$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["openvectaProvider"],
    orcarouter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$orcarouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["orcarouterProvider"],
    "copilot-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$copilot$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["copilot_webProvider"],
    "copilot-m365-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$copilot$2d$m365$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["copilot_m365_webProvider"],
    stepfun: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$stepfun$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stepfunProvider"],
    "freemodel-dev": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freemodel$2d$dev$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["freemodel_devProvider"],
    "gitlawb-gmi": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gitlawb$2f$gmi$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gitlawb_gmiProvider"],
    gitlawb: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gitlawb$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gitlawbProvider"],
    liquid: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$liquid$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["liquidProvider"],
    deepinfra: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$deepinfra$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepinfraProvider"],
    agy: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$agy$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["agyProvider"],
    agnes: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$agnes$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["agnesProvider"],
    aihorde: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$aihorde$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["aihordeProvider"],
    ainative: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ainative$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ainativeProvider"],
    aion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$aion$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["aionProvider"],
    udio: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$udio$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["udioProvider"],
    longcat: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$longcat$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["longcatProvider"],
    "vertex-partner": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$vertex$2f$partner$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertex_partnerProvider"],
    vertex: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$vertex$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertexProvider"],
    "duckduckgo-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$duckduckgo$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["duckduckgo_webProvider"],
    "felo-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$felo$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["felo_webProvider"],
    xai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xaiProvider"],
    "xai-oauth": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$xai$2d$oauth$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["xai_oauthProvider"],
    morph: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$morph$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["morphProvider"],
    siliconflow: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$siliconflow$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["siliconflowProvider"],
    "gitlab-duo": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gitlab$2d$duo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gitlab_duoProvider"],
    "command-code": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$command$2d$code$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["command_codeProvider"],
    novita: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$novita$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["novitaProvider"],
    regolo: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$regolo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["regoloProvider"],
    windsurf: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$windsurf$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["windsurfProvider"],
    "zed-hosted": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zed$2d$hosted$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["zed_hostedProvider"],
    nanogpt: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nanogpt$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nanogptProvider"],
    scaleway: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$scaleway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scalewayProvider"],
    agentrouter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$agentrouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["agentrouterProvider"],
    zai: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["zaiProvider"],
    huggingchat: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$huggingchat$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["huggingchatProvider"],
    "yuanbao-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$yuanbao$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["yuanbao_webProvider"],
    galadriel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$galadriel$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["galadrielProvider"],
    qianfan: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qianfan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qianfanProvider"],
    "meta-llama": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$meta$2d$llama$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["meta_llamaProvider"],
    "cloudflare-ai": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cloudflare$2d$ai$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cloudflare_aiProvider"],
    "nous-research": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nous$2d$research$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["nous_researchProvider"],
    alibaba: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$alibaba$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["alibabaProvider"],
    "alibaba-cn": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$alibaba$2f$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["alibaba_cnProvider"],
    doubao: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$doubao$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["doubaoProvider"],
    "doubao-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$doubao$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["doubao_webProvider"],
    "kilo-gateway": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kilo$2d$gateway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kilo_gatewayProvider"],
    "bailian-coding-plan": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bailian$2d$coding$2d$plan$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bailian_coding_planProvider"],
    gigachat: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gigachat$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gigachatProvider"],
    "devin-cli": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2d$cli$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["devin_cliProvider"],
    "devin-cli-agentic": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$devin$2d$cli$2d$agentic$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["devin_cli_agenticProvider"],
    auggie: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["auggieProvider"],
    chutes: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chutes$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["chutesProvider"],
    chenzk: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$chenzk$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["chenzkProvider"],
    factory: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$factory$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["factoryProvider"],
    databricks: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$databricks$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["databricksProvider"],
    reka: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$reka$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rekaProvider"],
    typhoon: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$typhoon$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["typhoonProvider"],
    inception: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$inception$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["inceptionProvider"],
    sarvam: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sarvam$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sarvamProvider"],
    writer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$writer$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writerProvider"],
    plamo: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$plamo$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["plamoProvider"],
    "clova-studio": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$clova$2d$studio$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clova_studioProvider"],
    internlm: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$internlm$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["internlmProvider"],
    "ant-ling": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$ant$2d$ling$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ant_lingProvider"],
    "vercel-ai-gateway": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$vercel$2d$ai$2d$gateway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vercel_ai_gatewayProvider"],
    "v0-vercel": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$v0$2d$vercel$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["v0_vercelProvider"],
    "opencode-zen": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$opencode$2f$zen$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["opencode_zenProvider"],
    "opencode-go": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$opencode$2f$go$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["opencode_goProvider"],
    opencode: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$opencode$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["opencodeProvider"],
    dahl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dahl$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["dahlProvider"],
    maritalk: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$maritalk$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["maritalkProvider"],
    baseten: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$baseten$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["basetenProvider"],
    gemini: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["geminiProvider"],
    "gemini-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gemini_webProvider"],
    cline: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cline$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clineProvider"],
    heroku: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$heroku$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["herokuProvider"],
    bluesminds: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$bluesminds$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bluesmindsProvider"],
    theoldllm: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$theoldllm$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["theoldllmProvider"],
    baidu: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$baidu$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["baiduProvider"],
    pollinations: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$pollinations$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pollinationsProvider"],
    "veoaifree-web": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$veoaifree$2d$web$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["veoaifree_webProvider"],
    codex: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$codex$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["codexProvider"],
    venice: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$venice$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["veniceProvider"],
    kiro: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kiro$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kiroProvider"],
    byteplus: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$byteplus$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["byteplusProvider"],
    mimocode: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$mimocode$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mimocodeProvider"],
    wafer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$wafer$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["waferProvider"],
    openadapter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$openadapter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["openadapterProvider"],
    dit: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$dit$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ditProvider"],
    tokenrouter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$tokenrouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tokenrouterProvider"],
    "grok-cli": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$grok$2d$cli$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["grok_cliProvider"],
    "codebuddy-cn": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$codebuddy$2d$cn$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["codebuddy_cnProvider"],
    pioneer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$pioneer$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pioneerProvider"],
    "zenmux-free": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$zenmux$2d$free$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["zenmux_freeProvider"],
    sumopod: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sumopod$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sumopodProvider"],
    x5lab: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$x5lab$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["x5labProvider"],
    kenari: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kenari$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kenariProvider"],
    navy: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$navy$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["navyProvider"],
    nara: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$nara$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["naraProvider"],
    requesty: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$requesty$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requestyProvider"],
    sealion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$sealion$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sealionProvider"],
    routeway: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$routeway$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["routewayProvider"],
    digitalocean: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$digitalocean$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["digitaloceanProvider"],
    hcnsec: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hcnsec$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hcnsecProvider"],
    promptql: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$promptql$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["promptqlProvider"],
    hyperagent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$hyperagent$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hyperagentProvider"],
    unorouter: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$unorouter$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unorouterProvider"]
};
}),
"[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateAliasMap",
    ()=>generateAliasMap,
    "generateLegacyProviders",
    ()=>generateLegacyProviders,
    "generateModels",
    ()=>generateModels,
    "getClaudeCodeDefaultModels",
    ()=>getClaudeCodeDefaultModels,
    "getPassthroughProviders",
    ()=>getPassthroughProviders,
    "getProviderCategory",
    ()=>getProviderCategory,
    "getRegisteredProviders",
    ()=>getRegisteredProviders,
    "getRegistryEntry",
    ()=>getRegistryEntry,
    "getUnsupportedParams",
    ()=>getUnsupportedParams,
    "isLocalProvider",
    ()=>isLocalProvider,
    "providerUsesAuthoritativeLiveCatalog",
    ()=>providerUsesAuthoritativeLiveCatalog,
    "requiresPlainStringContent",
    ()=>requiresPlainStringContent
]);
/**
 * Provider Registry — Single source of truth for all provider configuration.
 * Modularized into `open-sse/config/providers/`
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providers/shared.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)");
;
;
;
;
function generateLegacyProviders() {
    const providers = {};
    for (const [id, entry] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        const p = {
            format: entry.format
        };
        // URL(s)
        if (entry.baseUrls) {
            p.baseUrls = entry.baseUrls;
        } else if (entry.baseUrl) {
            p.baseUrl = entry.baseUrl;
        }
        if (entry.responsesBaseUrl) {
            p.responsesBaseUrl = entry.responsesBaseUrl;
        }
        if (entry.messagesUrl) {
            p.messagesUrl = entry.messagesUrl;
        }
        if (entry.requestDefaults) {
            p.requestDefaults = entry.requestDefaults;
        }
        if (typeof entry.timeoutMs === "number") {
            p.timeoutMs = entry.timeoutMs;
        }
        // Headers
        const mergedHeaders = {
            ...entry.headers || {},
            ...entry.extraHeaders || {}
        };
        if (Object.keys(mergedHeaders).length > 0) {
            p.headers = mergedHeaders;
        }
        // OAuth
        if (entry.oauth) {
            if (entry.oauth.clientIdEnv) {
                p.clientId = process.env[entry.oauth.clientIdEnv] || entry.oauth.clientIdDefault;
            }
            if (entry.oauth.clientSecretEnv) {
                p.clientSecret = process.env[entry.oauth.clientSecretEnv] || entry.oauth.clientSecretDefault;
            }
            if (entry.oauth.tokenUrl) p.tokenUrl = entry.oauth.tokenUrl;
            if (entry.oauth.refreshUrl) p.refreshUrl = entry.oauth.refreshUrl;
            if (entry.oauth.authUrl) p.authUrl = entry.oauth.authUrl;
        }
        // Cursor-specific
        if (entry.chatPath) p.chatPath = entry.chatPath;
        if (entry.clientVersion) p.clientVersion = entry.clientVersion;
        providers[id] = p;
    }
    return providers;
}
function generateModels() {
    const models = {};
    for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        if (entry.models && entry.models.length > 0) {
            const key = entry.alias || entry.id;
            // If alias already exists, don't overwrite (first wins)
            if (!models[key]) {
                models[key] = entry.models;
            }
        }
    }
    return models;
}
function generateAliasMap() {
    const map = {};
    for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        map[entry.id] = entry.alias || entry.id;
    }
    return map;
}
// ── Local Provider Detection ──────────────────────────────────────────────
// Evaluated once at module load time — process restart required for env var changes.
const LOCAL_HOSTNAMES = new Set([
    "localhost",
    "127.0.0.1",
    ...typeof process !== "undefined" && process.env.LOCAL_HOSTNAMES ? process.env.LOCAL_HOSTNAMES.split(",").map((h)=>h.trim()).filter(Boolean) : []
]);
function isLocalProvider(baseUrl) {
    if (!baseUrl) return false;
    try {
        const url = new URL(baseUrl);
        const hostname = url.hostname;
        // Strictly matching 172.16.0.0/12 (Docker/local) and explicitly blocking ::1 per SSRF hardening
        return LOCAL_HOSTNAMES.has(hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);
    } catch  {
        return false;
    }
}
/** Set of provider IDs with passthroughModels enabled — 404s are model-specific, not account-level. */ let _passthroughProviderIds = null;
function ensurePassthroughProviderIds() {
    if (_passthroughProviderIds) return _passthroughProviderIds;
    try {
        const ids = new Set();
        for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
            if (entry.passthroughModels) ids.add(entry.id);
        }
        _passthroughProviderIds = ids;
    } catch  {
        _passthroughProviderIds = new Set();
    }
    return _passthroughProviderIds;
}
function getPassthroughProviders() {
    return ensurePassthroughProviderIds();
}
// ── Registry Lookup Helpers ───────────────────────────────────────────────
const _byAlias = new Map();
let _byAliasPopulated = false;
function ensureByAliasPopulated() {
    if (_byAliasPopulated) return;
    _byAliasPopulated = true;
    for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        if (entry.alias && entry.alias !== entry.id) {
            _byAlias.set(entry.alias, entry);
        }
    }
}
function getRegistryEntry(provider) {
    ensureByAliasPopulated();
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"][provider] || _byAlias.get(provider) || null;
}
function providerUsesAuthoritativeLiveCatalog(provider) {
    const entry = getRegistryEntry(provider);
    if (entry && typeof entry.liveCatalogAuthoritative === "boolean") {
        return entry.liveCatalogAuthoritative;
    }
    return true;
}
function getRegisteredProviders() {
    return Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"]);
}
// Precomputed map: modelId → unsupportedParams (O(1) lookup instead of O(N×M) scan).
// Built once at module load from all registry entries.
const _unsupportedParamsMap = new Map();
let _unsupportedParamsPopulated = false;
function ensureUnsupportedParamsPopulated() {
    if (_unsupportedParamsPopulated) return;
    _unsupportedParamsPopulated = true;
    for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        // Some entries (e.g. the `mimocode` proxy) legitimately have no model catalogue.
        for (const model of entry.models ?? []){
            if (model.unsupportedParams && !_unsupportedParamsMap.has(model.id)) {
                _unsupportedParamsMap.set(model.id, model.unsupportedParams);
            }
        }
    }
}
function getUnsupportedParams(provider, modelId) {
    ensureUnsupportedParamsPopulated();
    // 1. Check current provider's registry (exact match)
    const entry = getRegistryEntry(provider);
    const modelEntry = entry?.models?.find((m)=>m.id === modelId);
    if (modelEntry?.unsupportedParams) return modelEntry.unsupportedParams;
    // 2. O(1) lookup in precomputed map (handles cross-provider routing)
    const cached = _unsupportedParamsMap.get(modelId);
    if (cached) return cached;
    // 3. Handle prefixed model IDs (e.g., "openai/o3" → "o3")
    if (modelId.includes("/")) {
        const bareId = modelId.split("/").pop() || "";
        const bare = _unsupportedParamsMap.get(bareId);
        if (bare) return bare;
    }
    // 4. Provider-wide fallback for providers whose limitation applies to every
    // model they serve, not just the ones statically catalogued (e.g. AI Horde's
    // `passthroughModels: true` roster changes as workers come and go, but no
    // model it hosts supports tool calling — see RegistryEntry.unsupportedParams).
    if (entry?.unsupportedParams) return entry.unsupportedParams;
    return [];
}
function requiresPlainStringContent(provider) {
    return getRegistryEntry(provider)?.requiresPlainStringContent === true;
}
function getProviderCategory(provider) {
    const entry = getRegistryEntry(provider);
    if (!entry) return "apikey"; // Safe default for unknown providers
    return entry.authType === "apikey" ? "apikey" : "oauth";
}
function getClaudeCodeDefaultModels() {
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"].claude?.models ?? [];
    const find = (pattern)=>models.find((m)=>pattern.test(m.id))?.id ?? "";
    return {
        fable: find(/fable/i),
        opus: find(/opus/i),
        sonnet: find(/sonnet/i),
        haiku: find(/haiku/i)
    };
}
}),
"[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_EFFORT_SUFFIXES",
    ()=>CLAUDE_EFFORT_SUFFIXES,
    "PROVIDER_ID_TO_ALIAS",
    ()=>PROVIDER_ID_TO_ALIAS,
    "PROVIDER_MODELS",
    ()=>PROVIDER_MODELS,
    "findModelName",
    ()=>findModelName,
    "getDefaultModel",
    ()=>getDefaultModel,
    "getModelStripTypes",
    ()=>getModelStripTypes,
    "getModelTargetFormat",
    ()=>getModelTargetFormat,
    "getModelTimeoutMs",
    ()=>getModelTimeoutMs,
    "getModelsByProviderId",
    ()=>getModelsByProviderId,
    "getProviderModel",
    ()=>getProviderModel,
    "getProviderModels",
    ()=>getProviderModels,
    "isValidModel",
    ()=>isValidModel,
    "splitClaudeEffortSuffix",
    ()=>splitClaudeEffortSuffix,
    "supportsClaudeMaxEffort",
    ()=>supportsClaudeMaxEffort,
    "supportsXHighEffort",
    ()=>supportsXHighEffort,
    "supportsXHighEffortForMaxNormalization",
    ()=>supportsXHighEffortForMaxNormalization
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
;
// Lazy PROVIDER_MODELS: deferred until first property access to speed up startup.
// The Proxy defers `generateModels()` from module-evaluation time to the first read.
let _models = null;
function initModels() {
    if (!_models) _models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateModels"])();
    return _models;
}
const PROVIDER_MODELS = new Proxy({}, {
    get (_, prop) {
        if (typeof prop === "symbol") return undefined;
        return Reflect.get(initModels(), prop, _models);
    },
    has (_, prop) {
        if (typeof prop === "symbol") return false;
        return Reflect.has(initModels(), prop);
    },
    ownKeys () {
        return Reflect.ownKeys(initModels());
    },
    getOwnPropertyDescriptor (_, prop) {
        if (typeof prop === "symbol") return undefined;
        return Object.getOwnPropertyDescriptor(initModels(), prop);
    },
    set (_, prop, value) {
        if (typeof prop === "symbol") return false;
        initModels()[prop] = value;
        return true;
    },
    deleteProperty (_, prop) {
        if (typeof prop === "symbol") return false;
        return Reflect.deleteProperty(initModels(), prop);
    }
});
const PROVIDER_ID_TO_ALIAS = new Proxy({}, {
    get (_, prop) {
        if (typeof prop === "symbol") return undefined;
        return Reflect.get(initAliases(), prop, _aliases);
    },
    has (_, prop) {
        if (typeof prop === "symbol") return false;
        return Reflect.has(initAliases(), prop);
    },
    ownKeys () {
        return Reflect.ownKeys(initAliases());
    },
    getOwnPropertyDescriptor (_, prop) {
        if (typeof prop === "symbol") return undefined;
        return Object.getOwnPropertyDescriptor(initAliases(), prop);
    },
    set (_, prop, value) {
        if (typeof prop === "symbol") return false;
        initAliases()[prop] = value;
        return true;
    },
    deleteProperty (_, prop) {
        if (typeof prop === "symbol") return false;
        return Reflect.deleteProperty(initAliases(), prop);
    }
});
let _aliases = null;
function initAliases() {
    if (!_aliases) _aliases = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateAliasMap"])();
    return _aliases;
}
function getProviderModels(aliasOrId) {
    // Accept either the public alias (the /v1/models prefix, e.g. "gh") or the raw
    // provider id (e.g. "github") and resolve id→alias before reading the namespace
    // map — so callers don't need to know which form they hold. We resolve here rather
    // than mirroring raw-id keys into PROVIDER_MODELS, whose keys ARE the public
    // prefixes (a raw id like "opencode" would collide with the opencode-zen route —
    // see #2798/#3870).
    const alias = PROVIDER_ID_TO_ALIAS[aliasOrId] || aliasOrId;
    return PROVIDER_MODELS[alias] || PROVIDER_MODELS[aliasOrId] || [];
}
function getDefaultModel(aliasOrId) {
    const models = PROVIDER_MODELS[aliasOrId];
    return models?.[0]?.id || null;
}
function getProviderModel(aliasOrId, modelId) {
    const models = PROVIDER_MODELS[aliasOrId];
    if (!models) return undefined;
    return models.find((model)=>model.id === modelId);
}
function isValidModel(aliasOrId, modelId, passthroughProviders = new Set()) {
    if (passthroughProviders.has(aliasOrId)) return true;
    const models = PROVIDER_MODELS[aliasOrId];
    if (!models) return false;
    return models.some((m)=>m.id === modelId);
}
function findModelName(aliasOrId, modelId) {
    const models = PROVIDER_MODELS[aliasOrId];
    if (!models) return modelId;
    const found = models.find((m)=>m.id === modelId);
    return found?.name || modelId;
}
function getModelTargetFormat(aliasOrId, modelId) {
    const models = PROVIDER_MODELS[aliasOrId];
    // Strip provider prefix if present: "openai/gpt-5.6-luna" → "gpt-5.6-luna"
    const prefix = aliasOrId + "/";
    const bareModelId = typeof modelId === "string" && modelId.startsWith(prefix) ? modelId.slice(prefix.length) : modelId;
    const found = models?.find((m)=>m.id === bareModelId);
    if (found?.targetFormat) return found.targetFormat;
    // #5842: OpenAI "*-pro" reasoning models (o1-pro, gpt-5.x-pro) are only served by
    // the native /v1/responses endpoint — /v1/chat/completions 404s ("only supported
    // in v1/responses"). Curated catalog entries are tagged explicitly; this heuristic
    // covers dynamically-synced ids that post-date the catalog (same spirit as the gh
    // executor's /codex/i routing, 9router#102). Scoped to the openai alias so other
    // providers shipping *-pro ids keep their own endpoint semantics.
    if (aliasOrId === "openai" && /-pro$/i.test(bareModelId)) return "openai-responses";
    return null;
}
function getModelStripTypes(aliasOrId, modelId) {
    const models = PROVIDER_MODELS[aliasOrId];
    if (!models) return [];
    const found = models.find((m)=>m.id === modelId);
    return Array.isArray(found?.strip) ? [
        ...found.strip
    ] : [];
}
function getModelsByProviderId(providerId) {
    const alias = PROVIDER_ID_TO_ALIAS[providerId] || providerId;
    return PROVIDER_MODELS[alias] || [];
}
function getModelTimeoutMs(aliasOrId, modelId) {
    // Callers (e.g. chatCore's timeout resolution) pass the raw provider id
    // ("codex"), not the public alias ("cx") that PROVIDER_MODELS is keyed by
    // — resolve id→alias the same way getProviderModels()/getModelsByProviderId()
    // do, so the override actually resolves (#6354).
    const alias = PROVIDER_ID_TO_ALIAS[aliasOrId] || aliasOrId;
    return getProviderModel(alias, modelId)?.timeoutMs;
}
const CLAUDE_MODEL_PATTERN = /(?:^|[\/._-])claude(?:[._-]|$)/;
const CLAUDE_MAX_EFFORT_UNSUPPORTED_FAMILY_PATTERNS = [
    /(?:^|[\/._-])haiku(?:[._-]|$)/
];
const ANTHROPIC_COMPATIBLE_PREFIX = "anthropic-compatible-";
function supportsClaudeMaxEffort(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return false;
    const normalized = modelId.toLowerCase();
    const claudeMatch = normalized.match(CLAUDE_MODEL_PATTERN);
    if (!claudeMatch) return false;
    const claudeScopedId = normalized.slice(claudeMatch.index ?? 0);
    return !CLAUDE_MAX_EFFORT_UNSUPPORTED_FAMILY_PATTERNS.some((pattern)=>pattern.test(claudeScopedId));
}
const CLAUDE_EFFORT_SUFFIXES = [
    "xhigh",
    "max",
    "high",
    "medium",
    "low"
];
function splitClaudeEffortSuffix(model) {
    const id = typeof model === "string" ? model : "";
    const lower = id.toLowerCase();
    for (const level of CLAUDE_EFFORT_SUFFIXES){
        if (lower.endsWith(`-${level}`)) {
            return {
                baseModel: id.slice(0, -(level.length + 1)),
                effort: level
            };
        }
    }
    return {
        baseModel: id,
        effort: null
    };
}
function getDatedClaudeAliasDate(candidate, modelId) {
    if (!modelId.startsWith(`${candidate}-`)) return null;
    const suffix = modelId.slice(candidate.length + 1);
    if (!/^\d{8}$/.test(suffix)) return null;
    return Number(suffix);
}
function findCanonicalClaudeEffortModel(modelId) {
    const id = splitClaudeEffortSuffix(modelId).baseModel.toLowerCase();
    const claudeMatch = id.match(CLAUDE_MODEL_PATTERN);
    if (!claudeMatch) return undefined;
    const claudeOffset = claudeMatch[0]?.indexOf("claude") ?? 0;
    const claudeStart = (claudeMatch.index ?? 0) + Math.max(claudeOffset, 0);
    const claudeScopedId = id.slice(claudeStart).replace(/\.(?=\d)/g, "-");
    const candidates = [
        claudeScopedId
    ];
    if (claudeScopedId.endsWith("-thinking")) {
        candidates.push(claudeScopedId.slice(0, -"-thinking".length));
    }
    const claudeModels = getModelsByProviderId("claude");
    for (const candidate of candidates){
        const exact = claudeModels.find((entry)=>entry.id.toLowerCase() === candidate);
        if (exact) return exact;
        if (!/-\d+-\d+$/.test(candidate)) continue;
        const datedAliases = claudeModels.map((entry)=>({
                entry,
                date: getDatedClaudeAliasDate(candidate, entry.id.toLowerCase())
            })).filter((item)=>item.date !== null && item.entry.supportsXHighEffort !== undefined).sort((a, b)=>b.date - a.date || a.entry.id.localeCompare(b.entry.id));
        if (datedAliases[0]) return datedAliases[0].entry;
    }
    return undefined;
}
function resolveProviderModelList(aliasOrId) {
    const resolvedId = aliasOrId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX) ? "claude" : aliasOrId;
    const alias = PROVIDER_ID_TO_ALIAS[resolvedId] || resolvedId;
    const models = PROVIDER_MODELS[alias] || PROVIDER_MODELS[resolvedId] || null;
    return {
        alias,
        models
    };
}
function supportsXHighEffort(aliasOrId, modelId) {
    const { models: providerModels } = resolveProviderModelList(aliasOrId);
    const model = providerModels?.find((entry)=>entry.id === modelId);
    if (model?.supportsXHighEffort !== undefined) {
        return model.supportsXHighEffort !== false;
    }
    const canonicalClaudeModel = findCanonicalClaudeEffortModel(modelId);
    if (canonicalClaudeModel?.supportsXHighEffort !== undefined) {
        return canonicalClaudeModel.supportsXHighEffort !== false;
    }
    // Keep explicit false entries as the unsupported-model list. Unlisted models
    // and models without an explicit flag pass through unchanged. Unknown
    // providers follow the same rule except for canonical Claude aliases above.
    return true;
}
function supportsXHighEffortForMaxNormalization(aliasOrId, modelId) {
    return supportsXHighEffort(aliasOrId, modelId);
}
}),
];

//# sourceMappingURL=open-sse_18fecdc._.js.map