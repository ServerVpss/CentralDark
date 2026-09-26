module.exports = [
"[project]/open-sse/executors/claudeIdentity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_CODE_STAINLESS_VERSION",
    ()=>CLAUDE_CODE_STAINLESS_VERSION,
    "CLAUDE_CODE_VERSION",
    ()=>CLAUDE_CODE_VERSION,
    "buildUserIdJson",
    ()=>buildUserIdJson,
    "fetchClaudeBootstrap",
    ()=>fetchClaudeBootstrap,
    "generateCliUserID",
    ()=>generateCliUserID,
    "getSessionId",
    ()=>getSessionId,
    "parseUpstreamMetadataUserId",
    ()=>parseUpstreamMetadataUserId,
    "passthroughUpstreamSessionId",
    ()=>passthroughUpstreamSessionId,
    "resolveAccountUUID",
    ()=>resolveAccountUUID,
    "resolveCliUserID",
    ()=>resolveCliUserID,
    "selectBetaFlags",
    ()=>selectBetaFlags,
    "shouldUseMidConversationSystem",
    ()=>shouldUseMidConversationSystem,
    "stainlessArch",
    ()=>stainlessArch,
    "stainlessOS",
    ()=>stainlessOS,
    "stainlessRuntimeVersion",
    ()=>stainlessRuntimeVersion,
    "stripProxyToolPrefix",
    ()=>stripProxyToolPrefix,
    "uuidV4FromHash",
    ()=>uuidV4FromHash
]);
/**
 * Claude Code identity helpers used by the native `claude` provider when
 * authenticating with an OAuth token. Anthropic's user:sessions:claude_code
 * scope expects request shape that matches a real claude-cli session;
 * everything in this module exists to produce that shape.
 *
 * Pinned to a captured claude-cli release. Bump in lockstep when a newer
 * release is captured.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [app-route] (ecmascript)");
;
;
const CLAUDE_CODE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_CODE_STAINLESS_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_SDK_PACKAGE_VERSION"];
function stainlessOS() {
    switch(process.platform){
        case "win32":
            return "Windows";
        case "darwin":
            return "MacOS";
        case "linux":
            return "Linux";
        case "freebsd":
            return "FreeBSD";
        default:
            return "Unknown";
    }
}
function stainlessArch() {
    switch(process.arch){
        case "x64":
            return "x64";
        case "arm64":
            return "arm64";
        case "ia32":
            return "x32";
        default:
            return process.arch;
    }
}
function stainlessRuntimeVersion() {
    return process.version;
}
// ---------- Bounded-map helper -------------------------------------------
const IDENTITY_CACHE_LIMIT = 10_000;
const BOOTSTRAP_FETCH_TIMEOUT_MS = 10_000;
/** Insert with FIFO eviction once a Map reaches `max`. JS Maps preserve insertion order. */ function setBounded(m, key, value, max) {
    if (!m.has(key) && m.size >= max) {
        const oldest = m.keys().next().value;
        if (oldest !== undefined) m.delete(oldest);
    }
    m.set(key, value);
}
// ---------- Upstream session-id passthrough ------------------------------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function passthroughUpstreamSessionId(clientHeaders) {
    if (!clientHeaders) return null;
    const raw = clientHeaders["x-claude-code-session-id"] ?? clientHeaders["X-Claude-Code-Session-Id"];
    if (typeof raw !== "string") return null;
    const v = raw.trim();
    return UUID_RE.test(v) ? v : null;
}
// ---------- Session ID (per OAuth account, process lifetime) -------------
const sessionCache = new Map();
function getSessionId(seed) {
    let id = sessionCache.get(seed);
    if (id) return id;
    id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    setBounded(sessionCache, seed, id, IDENTITY_CACHE_LIMIT);
    return id;
}
function generateCliUserID() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("hex");
}
const lazyCliUserIDCache = new Map();
const HEX64_RE = /^[a-f0-9]{64}$/i;
function resolveCliUserID(providerSpecificData, seed) {
    const cli = providerSpecificData?.cliUserID;
    if (typeof cli === "string" && HEX64_RE.test(cli)) return cli;
    const alt = providerSpecificData?.userID;
    if (typeof alt === "string" && HEX64_RE.test(alt)) return alt;
    let cached = lazyCliUserIDCache.get(seed);
    if (cached) return cached;
    cached = generateCliUserID();
    setBounded(lazyCliUserIDCache, seed, cached, IDENTITY_CACHE_LIMIT);
    return cached;
}
// ---------- Account UUID -------------------------------------------------
const ACCOUNT_FETCH_RETRY_MS = 5 * 60 * 1000;
const accountUuidCache = new Map();
const inflightFetches = new Set();
async function fetchClaudeBootstrap(accessToken) {
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), BOOTSTRAP_FETCH_TIMEOUT_MS);
    try {
        const res = await fetch("https://api.anthropic.com/api/claude_cli/bootstrap", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                "User-Agent": `claude-cli/${CLAUDE_CODE_VERSION} (external, cli)`,
                "anthropic-beta": "oauth-2025-04-20"
            },
            signal: ctrl.signal
        });
        if (!res.ok) return null;
        const data = await res.json().catch(()=>null);
        const acct = data && typeof data === "object" ? data.oauth_account : null;
        if (!acct || typeof acct !== "object") return null;
        const account = acct;
        const stringOrNull = (value)=>typeof value === "string" ? value : null;
        return {
            account_uuid: stringOrNull(account.account_uuid),
            account_email: stringOrNull(account.account_email),
            organization_uuid: stringOrNull(account.organization_uuid),
            organization_name: stringOrNull(account.organization_name),
            organization_type: stringOrNull(account.organization_type),
            organization_rate_limit_tier: stringOrNull(account.organization_rate_limit_tier)
        };
    } catch  {
        return null;
    } finally{
        clearTimeout(timer);
    }
}
async function backgroundFetchAccountUUID(accessToken, seed) {
    if (inflightFetches.has(seed)) return;
    const cached = accountUuidCache.get(seed);
    if (cached?.uuid) return;
    if (cached && Date.now() - cached.fetchedAt < ACCOUNT_FETCH_RETRY_MS) return;
    inflightFetches.add(seed);
    try {
        const bootstrap = await fetchClaudeBootstrap(accessToken);
        setBounded(accountUuidCache, seed, {
            uuid: bootstrap?.account_uuid ?? null,
            fetchedAt: Date.now()
        }, IDENTITY_CACHE_LIMIT);
    } finally{
        inflightFetches.delete(seed);
    }
}
function uuidV4FromHash(hex64) {
    return [
        hex64.slice(0, 8),
        hex64.slice(8, 12),
        "4" + hex64.slice(13, 16),
        (parseInt(hex64.charAt(16), 16) & 0x3 | 0x8).toString(16) + hex64.slice(17, 20),
        hex64.slice(20, 32)
    ].join("-");
}
function resolveAccountUUID(providerSpecificData, seed, accessToken) {
    const camel = providerSpecificData?.accountUUID;
    if (typeof camel === "string" && camel.length >= 32) return camel;
    const snake = providerSpecificData?.account_uuid;
    if (typeof snake === "string" && snake.length >= 32) return snake;
    const cached = accountUuidCache.get(seed);
    if (cached?.uuid) return cached.uuid;
    if (accessToken) void backgroundFetchAccountUUID(accessToken, seed);
    // CodeQL: This is intentionally SHA-256 for deterministic UUID generation from
    // a seed string — NOT password hashing. The output is a format-correct UUIDv4
    // used as a fallback account identifier; no secrets are being protected.
    // lgtm[js/insufficient-password-hash]
    return uuidV4FromHash((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update("account:" + seed).digest("hex") // nosemgrep: insufficient-password-hash
    );
}
function buildUserIdJson(opts) {
    return JSON.stringify({
        device_id: opts.deviceId,
        account_uuid: opts.accountUUID,
        session_id: opts.sessionId
    });
}
function parseUpstreamMetadataUserId(body) {
    if (!body) return null;
    const md = body.metadata;
    const raw = md?.user_id;
    if (typeof raw !== "string" || raw.length === 0) return null;
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch  {
        return null;
    }
    if (!parsed || typeof parsed !== "object") return null;
    const { device_id, account_uuid, session_id } = parsed;
    if (typeof device_id !== "string" || !HEX64_RE.test(device_id) || typeof account_uuid !== "string" || !UUID_RE.test(account_uuid) || typeof session_id !== "string" || !UUID_RE.test(session_id)) {
        return null;
    }
    return {
        device_id,
        account_uuid,
        session_id
    };
}
// ---------- anthropic-beta selector --------------------------------------
/**
 * Models that support the heavy-agent beta tier (effort, advanced-tool-use).
 * Only Opus/Sonnet are eligible — Haiku with OAuth authentication rejects
 * heavy agent flags (issue #2454). Matches real Claude Code captures.
 */ const HEAVY_AGENT_BETA_MODEL_PREFIXES = [
    "claude-opus",
    "claude-sonnet"
];
/**
 * Models that support the context-1m beta tier. Only Opus is eligible;
 * Sonnet trips long-context credit gates under OAuth full-agent traffic.
 * Opus 5 is excluded because its 1M context window is native.
 */ const CONTEXT_1M_BETA_MODEL_PREFIXES = [
    "claude-opus"
];
const CONTEXT_1M_NATIVE_MODEL_PREFIXES = [
    "claude-opus-5"
];
function matchesModelPrefix(model, prefixes) {
    if (typeof model !== "string") return false;
    const normalized = model.toLowerCase();
    return prefixes.some((prefix)=>normalized.includes(prefix));
}
function isHeavyAgentModel(model) {
    return matchesModelPrefix(model, HEAVY_AGENT_BETA_MODEL_PREFIXES);
}
function isContext1mModel(model) {
    return matchesModelPrefix(model, CONTEXT_1M_BETA_MODEL_PREFIXES) && !matchesModelPrefix(model, CONTEXT_1M_NATIVE_MODEL_PREFIXES);
}
function shouldUseMidConversationSystem(body, model) {
    const payload = body || {};
    const hasSystem = !!payload.system && (typeof payload.system === "string" || Array.isArray(payload.system) && payload.system.length > 0);
    const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0;
    const effectiveModel = model ?? (typeof payload.model === "string" ? payload.model : "");
    return hasSystem && hasTools && matchesModelPrefix(effectiveModel, CONTEXT_1M_BETA_MODEL_PREFIXES);
}
function selectBetaFlags(body, model, // The client's inbound `anthropic-beta` header, when present. Real Claude Code
// clients negotiate their own beta set; forcing thinking/effort betas they never
// requested produced malformed opus tool_use streams (#3415). When this is a
// non-empty string we respect it and do NOT force those betas. For opaque clients
// (no header — the OAuth identity cloak) the full set is retained unchanged.
clientBeta) {
    const b = body || {};
    const clientBetaSet = typeof clientBeta === "string" && clientBeta.trim().length > 0 ? new Set(clientBeta.split(",").map((f)=>f.trim()).filter(Boolean)) : null;
    // When the client negotiated its own anthropic-beta, only emit the thinking / heavy
    // betas it actually asked for. Opaque clients (clientBetaSet === null) keep them all.
    const allowThinking = clientBetaSet === null || clientBetaSet.has("interleaved-thinking-2025-05-14");
    // effort-2025-11-24 must NOT imply advanced-tool-use-2025-11-20 (#9505): Claude
    // Code sends effort on every request and never sends ATU, so treating effort as
    // a proxy for ATU force-injects the heavy-agent pair the client never negotiated —
    // the same class of mutation #3415 closed. Opaque clients keep the full set.
    const allowHeavy = clientBetaSet === null || clientBetaSet.has("advanced-tool-use-2025-11-20");
    const hasSystem = !!b.system && (typeof b.system === "string" || Array.isArray(b.system) && b.system.length > 0);
    const tools = b.tools;
    const hasTools = Array.isArray(tools) && tools.length > 0;
    const outputCfg = b.output_config;
    const hasStructuredOutput = !!(outputCfg && outputCfg.format?.type === "json_schema") || !!b.response_format?.type;
    const isFullAgent = hasTools && hasSystem;
    const effectiveModel = model ?? (typeof b.model === "string" ? b.model : "");
    const isHeavyAgent = isFullAgent && isHeavyAgentModel(effectiveModel);
    const isOpusAgent = shouldUseMidConversationSystem(b, effectiveModel);
    const isContext1m = isFullAgent && isContext1mModel(effectiveModel);
    const flags = [];
    if (isFullAgent) flags.push("claude-code-20250219");
    flags.push("oauth-2025-04-20");
    if (isContext1m) flags.push("context-1m-2025-08-07");
    if (isOpusAgent) flags.push("mid-conversation-system-2026-04-07");
    // Thinking betas: gated on the client header (#3415). interleaved-thinking forces
    // interleaved-thinking semantics that conflict with a tool_choice-forced turn,
    // producing malformed opus tool_use streams when the client never asked for it.
    if (allowThinking) {
        flags.push("interleaved-thinking-2025-05-14", "redact-thinking-2026-02-12", "thinking-token-count-2026-05-13");
    }
    flags.push("context-management-2025-06-27", "prompt-caching-scope-2026-01-05");
    if (hasStructuredOutput || isFullAgent) flags.push("advisor-tool-2026-03-01");
    if (hasStructuredOutput && !isFullAgent) flags.push("structured-outputs-2025-12-15");
    // extended-cache-ttl is sent for all full-agent shapes (incl. Haiku); the
    // heavier afk-mode / advanced-tool-use / effort flags are Opus/Sonnet-only.
    if (isFullAgent) {
        flags.push("extended-cache-ttl-2025-04-11", "cache-diagnosis-2026-04-07");
    }
    if (isHeavyAgent && allowHeavy) {
        flags.push("advanced-tool-use-2025-11-20", "effort-2025-11-24");
    }
    return flags.join(",");
}
// ---------- Tool-name normalisation --------------------------------------
const TOOL_PREFIX = "proxy_";
function stripProxyToolPrefix(body) {
    const stripName = (n)=>{
        if (typeof n !== "string") return undefined;
        return n.startsWith(TOOL_PREFIX) ? n.slice(TOOL_PREFIX.length) : n;
    };
    const tools = body.tools;
    if (Array.isArray(tools)) {
        for (const t of tools){
            const stripped = stripName(t.name);
            if (stripped !== undefined) t.name = stripped;
        }
    }
    const tc = body.tool_choice;
    if (tc && typeof tc.name === "string") {
        const stripped = stripName(tc.name);
        if (stripped !== undefined) tc.name = stripped;
    }
    const messages = body.messages;
    if (Array.isArray(messages)) {
        for (const m of messages){
            const content = m.content;
            if (!Array.isArray(content)) continue;
            for (const block of content){
                if (block?.type === "tool_use") {
                    const stripped = stripName(block.name);
                    if (stripped !== undefined) block.name = stripped;
                }
            }
        }
    }
}
}),
"[project]/open-sse/executors/forceResponsesUpstream.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shouldForceResponsesUpstream",
    ()=>shouldForceResponsesUpstream,
    "withForcedResponsesUpstream",
    ()=>withForcedResponsesUpstream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [app-route] (ecmascript)");
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function shouldForceResponsesUpstream(provider, body, credentials) {
    if (!provider.startsWith("openai-compatible-")) return false;
    if (!isRecord(body)) return false;
    const providerSpecificData = credentials?.providerSpecificData ?? null;
    if (providerSpecificData?._omnirouteForceResponsesUpstream === true) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenAICompatibleType"])(provider, providerSpecificData) === "responses") return false;
    const hasResponsesShape = body.input !== undefined || body.previous_response_id !== undefined || body.max_output_tokens !== undefined || body.reasoning !== undefined;
    if (!hasResponsesShape) return false;
    const tools = Array.isArray(body.tools) ? body.tools : [];
    return tools.some((toolValue)=>{
        if (!isRecord(toolValue)) return false;
        const toolType = typeof toolValue.type === "string" ? toolValue.type : "";
        return toolType === "namespace" || /^tool_search/.test(toolType);
    });
}
function withForcedResponsesUpstream(provider, body, credentials) {
    if (!shouldForceResponsesUpstream(provider, body, credentials)) return credentials;
    return {
        ...credentials,
        providerSpecificData: {
            ...credentials.providerSpecificData,
            _omnirouteForceResponsesUpstream: true
        }
    };
}
}),
"[project]/open-sse/executors/base/headers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure upstream header helpers (User-Agent, extra headers, OpenAI-compat stripping).
// Extracted verbatim from base.ts. Module-private JsonRecord kept local to avoid a cycle.
__turbopack_context__.s([
    "applyConfiguredUserAgent",
    ()=>applyConfiguredUserAgent,
    "getCustomUserAgent",
    ()=>getCustomUserAgent,
    "isOpenAICompatibleEndpoint",
    ()=>isOpenAICompatibleEndpoint,
    "mergeUpstreamExtraHeaders",
    ()=>mergeUpstreamExtraHeaders,
    "setUserAgentHeader",
    ()=>setUserAgentHeader,
    "stripStainlessHeadersForOpenAICompat",
    ()=>stripStainlessHeadersForOpenAICompat
]);
function mergeUpstreamExtraHeaders(headers, extra) {
    if (!extra) return;
    for (const [k, v] of Object.entries(extra)){
        if (typeof k === "string" && k.length > 0 && typeof v === "string") {
            if (k.toLowerCase() === "user-agent") {
                setUserAgentHeader(headers, v);
                continue;
            }
            headers[k] = v;
        }
    }
}
function getCustomUserAgent(providerSpecificData) {
    const customUserAgent = typeof providerSpecificData?.customUserAgent === "string" ? providerSpecificData.customUserAgent.trim() : "";
    return customUserAgent || null;
}
function setUserAgentHeader(headers, userAgent) {
    headers["User-Agent"] = userAgent;
    if ("user-agent" in headers) {
        headers["user-agent"] = userAgent;
    }
}
function applyConfiguredUserAgent(headers, providerSpecificData) {
    const customUserAgent = getCustomUserAgent(providerSpecificData);
    if (customUserAgent) {
        setUserAgentHeader(headers, customUserAgent);
    }
}
function isOpenAICompatibleEndpoint(provider, url) {
    if (provider?.startsWith?.("openai-compatible-")) return true;
    return url.includes("/v1/chat/completions") || url.includes("/v1/responses");
}
function stripStainlessHeadersForOpenAICompat(headers, provider, url) {
    if (!isOpenAICompatibleEndpoint(provider, url)) return [];
    const strippedKeys = [];
    for (const key of Object.keys(headers)){
        if (key.toLowerCase().startsWith("x-stainless-")) {
            delete headers[key];
            strippedKeys.push(key);
        }
    }
    // Normalize User-Agent: SDK-based clients send verbose product strings that some
    // upstreams block. Replace with a clean browser-like UA only when it looks SDK-derived.
    const ua = (headers["User-Agent"] || headers["user-agent"] || "").toLowerCase();
    if (ua.includes("openai") && (ua.includes("node") || ua.includes("axios") || ua.includes("undici"))) {
        setUserAgentHeader(headers, "Mozilla/5.0 (compatible; OpenAI Compatible)");
    }
    return strippedKeys;
}
}),
"[project]/open-sse/executors/base/reasoningEffort.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITHUB_NO_REASONING_EFFORT_PATTERN",
    ()=>GITHUB_NO_REASONING_EFFORT_PATTERN,
    "GITHUB_REASONING_EFFORT_OPT_IN_PATTERN",
    ()=>GITHUB_REASONING_EFFORT_OPT_IN_PATTERN,
    "MISTRAL_NO_REASONING_EFFORT_PATTERN",
    ()=>MISTRAL_NO_REASONING_EFFORT_PATTERN,
    "mapNvidiaGlm52ReasoningParams",
    ()=>mapNvidiaGlm52ReasoningParams,
    "sanitizeReasoningEffortForProvider",
    ()=>sanitizeReasoningEffortForProvider,
    "supportsMaxEffortForProvider",
    ()=>supportsMaxEffortForProvider
]);
// Provider-aware reasoning_effort sanitation (xhigh/max normalization + reject strip).
// Extracted verbatim from base.ts. Deps are config/services only (no host import → no cycle).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
;
;
;
const MISTRAL_NO_REASONING_EFFORT_PATTERN = /devstral/i;
const GITHUB_REASONING_EFFORT_OPT_IN_PATTERN = /claude[-_.]?(?:opus|sonnet)[-_.]?4[-_.]6/i;
const GITHUB_NO_REASONING_EFFORT_PATTERN = /(claude|haiku|oswe)/i;
const NVIDIA_GLM_52_PATTERN = /z-ai\/glm-5\.2\b/i;
function isNvidiaGlm52(provider, model) {
    return provider === "nvidia" && NVIDIA_GLM_52_PATTERN.test(model || "");
}
/** Pulls a normalized (lowercased) effort string out of top-level or nested `reasoning.effort`. */ function extractNvidiaGlm52Effort(b) {
    const reasoning = b.reasoning && typeof b.reasoning === "object" && !Array.isArray(b.reasoning) ? b.reasoning : null;
    const effort = b.reasoning_effort ?? reasoning?.effort;
    if (effort === undefined) return null;
    const effortStr = typeof effort === "string" ? effort.toLowerCase() : "";
    if (!effortStr) return null;
    return {
        reasoning,
        effortStr
    };
}
/** Builds `chat_template_kwargs.enable_thinking`, or null when the existing kwargs shape is unusable. */ function buildNvidiaGlm52TemplateKwargs(rawTemplateKwargs, effortStr) {
    if (rawTemplateKwargs !== undefined && (!rawTemplateKwargs || typeof rawTemplateKwargs !== "object" || Array.isArray(rawTemplateKwargs))) {
        return null;
    }
    const templateKwargs = {
        ...rawTemplateKwargs ?? {}
    };
    if (!Object.prototype.hasOwnProperty.call(templateKwargs, "enable_thinking")) {
        templateKwargs.enable_thinking = effortStr !== "none";
    }
    return templateKwargs;
}
/** Returns a copy of `b` with `reasoning_effort`/`reasoning.effort` replaced by `templateKwargs`. */ function withNvidiaGlm52TemplateKwargs(b, templateKwargs, reasoning) {
    const next = {
        ...b,
        chat_template_kwargs: templateKwargs
    };
    delete next.reasoning_effort;
    if (reasoning) {
        const nextReasoning = {
            ...reasoning
        };
        delete nextReasoning.effort;
        if (Object.keys(nextReasoning).length === 0) delete next.reasoning;
        else next.reasoning = nextReasoning;
    }
    return next;
}
function mapNvidiaGlm52ReasoningParams(body, provider, model, log) {
    if (!isNvidiaGlm52(provider, model)) return body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const b = body;
    const info = extractNvidiaGlm52Effort(b);
    if (!info) return body;
    const templateKwargs = buildNvidiaGlm52TemplateKwargs(b.chat_template_kwargs, info.effortStr);
    if (!templateKwargs) return body;
    const next = withNvidiaGlm52TemplateKwargs(b, templateKwargs, info.reasoning);
    log?.info?.("REASONING_SANITIZE", `nvidia/${model || ""}: mapped reasoning effort to enable_thinking`);
    return next;
}
function supportsMaxEffortForProvider(provider, model) {
    const isClaude = (provider === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(provider)) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supportsClaudeMaxEffort"])(model);
    // opencode-go proxies DeepSeek with the native DeepSeek API contract, which
    // accepts {high, max} literally. Without this opt-in, max would be
    // normalized to xhigh (the OmniRoute-internal top tier) and rejected by the
    // upstream. Scoped to opencode-go deliberately: OpenRouter's DeepSeek path
    // (pi#4055) is the documented inverse and expects xhigh, not max.
    // Ollama Cloud also accepts literal max (for example GLM 5.2 supports
    // low|medium|high|max|none) and rejects xhigh.
    const isOpencodeGoDeepSeek = provider === "opencode-go" && model.toLowerCase().includes("deepseek");
    const isOllamaCloud = provider === "ollama-cloud";
    const isMoonshotK3 = (provider === "moonshot" || provider === "kimi") && /^kimi-k3(?:$|-)/i.test(model);
    return isClaude || isOpencodeGoDeepSeek || isOllamaCloud || isMoonshotK3;
}
function readEffortCarriers(b) {
    const reasoning = b.reasoning && typeof b.reasoning === "object" && !Array.isArray(b.reasoning) ? b.reasoning : null;
    const outputConfig = b.output_config && typeof b.output_config === "object" && !Array.isArray(b.output_config) ? b.output_config : null;
    const hasTopLevelReasoningEffort = Object.prototype.hasOwnProperty.call(b, "reasoning_effort");
    const hasReasoningEffort = !!(reasoning && Object.prototype.hasOwnProperty.call(reasoning, "effort"));
    const hasOutputConfigEffort = !!(outputConfig && Object.prototype.hasOwnProperty.call(outputConfig, "effort"));
    const effort = b.reasoning_effort ?? reasoning?.effort ?? outputConfig?.effort;
    return {
        reasoning,
        outputConfig,
        hasTopLevelReasoningEffort,
        hasReasoningEffort,
        hasOutputConfigEffort,
        effort
    };
}
/** Write a normalized effort value back to every carrier that was present. */ function writeEffortValue(b, value, c) {
    const next = {
        ...b
    };
    if (c.hasTopLevelReasoningEffort) next.reasoning_effort = value;
    if (c.hasReasoningEffort && c.reasoning) next.reasoning = {
        ...c.reasoning,
        effort: value
    };
    if (c.hasOutputConfigEffort && c.outputConfig) next.output_config = {
        ...c.outputConfig,
        effort: value
    };
    return next;
}
/** Strip the effort field from every carrier that was present. */ function stripEffortValue(b, c) {
    const next = {
        ...b
    };
    if (c.hasTopLevelReasoningEffort) delete next.reasoning_effort;
    if (c.hasReasoningEffort && c.reasoning) {
        const r = {
            ...c.reasoning
        };
        delete r.effort;
        if (Object.keys(r).length === 0) delete next.reasoning;
        else next.reasoning = r;
    }
    if (c.hasOutputConfigEffort && c.outputConfig) {
        const oc = {
            ...c.outputConfig
        };
        delete oc.effort;
        if (Object.keys(oc).length === 0) delete next.output_config;
        else next.output_config = oc;
    }
    return next;
}
function sanitizeReasoningEffortForProvider(body, provider, model, log) {
    if (isNvidiaGlm52(provider, model)) {
        return mapNvidiaGlm52ReasoningParams(body, provider, model, log);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const b = body;
    const c = readEffortCarriers(b);
    if (c.effort === undefined) return body;
    const effortStr = typeof c.effort === "string" ? c.effort.toLowerCase() : "";
    const modelStr = model || "";
    // Oh My Pi exposes `minimal`, while Codex's Responses API starts at `low`.
    // Normalize every carrier before the Codex executor sends the upstream request.
    if (provider === "codex" && effortStr === "minimal") {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: normalized reasoning_effort minimal → low`);
        return writeEffortValue(b, "low", c);
    }
    const githubOptIn = provider === "github" && GITHUB_REASONING_EFFORT_OPT_IN_PATTERN.test(modelStr);
    const rejecting = provider === "mistral" && MISTRAL_NO_REASONING_EFFORT_PATTERN.test(modelStr) || provider === "github" && !githubOptIn && GITHUB_NO_REASONING_EFFORT_PATTERN.test(modelStr);
    if (rejecting) {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: removed unsupported reasoning_effort`);
        return stripEffortValue(b, c);
    }
    // Native DeepSeek (api.deepseek.com) — V4 thinking mode accepts reasoning_effort
    // ONLY as {high, max} (its own top tier is literally "max"). OmniRoute's internal
    // scale is low|medium|high|xhigh where xhigh is the top, so map onto DeepSeek's
    // vocabulary: xhigh → max (top→top), low|medium → high (below the enum floor).
    // high/max pass through unchanged. Without this, the claude→openai translator's
    // xhigh (and max-normalized-to-xhigh below) reaches DeepSeek as an unknown value,
    // silently dropping the client's requested effort. This is the INVERSE of the
    // OpenRouter-DeepSeek path, whose normalized API expects xhigh, not max (pi#4055).
    if (provider === "deepseek") {
        const mapped = effortStr === "xhigh" ? "max" : effortStr === "low" || effortStr === "medium" ? "high" : null;
        if (mapped && mapped !== effortStr) {
            log?.info?.("REASONING_SANITIZE", `deepseek/${modelStr}: normalized reasoning_effort ${effortStr} → ${mapped}`);
            return writeEffortValue(b, mapped, c);
        }
        return body;
    }
    const supportsXHigh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supportsXHighEffort"])(provider, modelStr);
    const shouldDowngradeXHigh = effortStr === "xhigh" && !supportsXHigh;
    const supportsXHighForMax = supportsXHigh;
    const supportsMax = supportsMaxEffortForProvider(provider, modelStr);
    const shouldNormalizeMaxToXHigh = effortStr === "max" && !supportsMax && supportsXHighForMax;
    const shouldDowngradeMax = effortStr === "max" && !supportsMax && !supportsXHighForMax;
    if (shouldNormalizeMaxToXHigh) {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: normalized reasoning_effort max → xhigh`);
        return writeEffortValue(b, "xhigh", c);
    }
    if (shouldDowngradeXHigh || shouldDowngradeMax) {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: downgraded reasoning_effort ${effortStr} → high`);
        return writeEffortValue(b, "high", c);
    }
    return body;
}
}),
"[project]/open-sse/executors/base.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "BaseExecutor",
    ()=>BaseExecutor,
    "default",
    ()=>__TURBOPACK__default__export__,
    "mergeAbortSignals",
    ()=>mergeAbortSignals,
    "stripVersionedToolModelPrefix",
    ()=>stripVersionedToolModelPrefix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/alternateFormats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$contextEditing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/contextEditing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerFieldStrips.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/cliFingerprints.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/thinkingBudget.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterFreeWindow.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wafRateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wafRateLimit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/sessionPool.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/poolRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCCH.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeConstraints.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/claudeCodeCompatibleIdentity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeObfuscation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/responsesInputSanitizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/providerRequestLogging.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/claudeIdentity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$forceResponsesUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/forceResponsesUpstream.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/resilience/peerRouting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clineAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$reasoningEffort$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/reasoningEffort.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
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
 * Sanitizes a custom API path to prevent path traversal attacks.
 * Valid paths must start with '/', contain no '..' segments,
 * no null bytes, and be reasonable in length.
 */ function sanitizePath(path) {
    if (typeof path !== "string") return false;
    if (!path.startsWith("/")) return false;
    if (path.includes("\0")) return false; // null byte
    if (path.includes("..")) return false; // path traversal
    if (path.length > 512) return false; // sanity limit
    return true;
}
function mergeAbortSignals(primary, secondary) {
    const controller = new AbortController();
    const abortFrom = (source)=>{
        if (!controller.signal.aborted) {
            controller.abort(source.reason);
        }
    };
    if (primary.aborted) {
        abortFrom(primary);
        return controller.signal;
    }
    if (secondary.aborted) {
        abortFrom(secondary);
        return controller.signal;
    }
    primary.addEventListener("abort", ()=>abortFrom(primary), {
        once: true
    });
    secondary.addEventListener("abort", ()=>abortFrom(secondary), {
        once: true
    });
    return controller.signal;
}
function hasActiveClaudeThinking(body) {
    const thinking = body.thinking;
    return thinking?.type === "enabled" || thinking?.type === "adaptive";
}
/**
 * Collect every `thinkingConfig` object in a transformed request body that holds
 * a thinking budget, wherever the provider's envelope nests it:
 *   - body.generationConfig.thinkingConfig            (native Gemini / openai→gemini)
 *   - body.request.generationConfig.thinkingConfig    (Antigravity Cloud Code envelope)
 * Returns only objects that actually carry a `thinkingBudget`/`thinking_budget`
 * field — a request without thinking config is never mutated.
 */ function collectThinkingConfigs(body) {
    if (!body || typeof body !== "object") return [];
    const root = body;
    const configs = [];
    const envelopes = [
        root.generationConfig,
        root.request?.generationConfig
    ];
    for (const env of envelopes){
        if (!env || typeof env !== "object") continue;
        const tc = env.thinkingConfig;
        if (tc && typeof tc === "object") {
            const tcr = tc;
            if ("thinkingBudget" in tcr || "thinking_budget" in tcr) configs.push(tcr);
        }
    }
    return configs;
}
/**
 * Read the first thinking budget found in the body (any supported nest / naming).
 * Returns null when the body carries no readable numeric budget.
 */ function readNestedThinkingBudget(body) {
    for (const tc of collectThinkingConfigs(body)){
        const raw = tc.thinkingBudget ?? tc.thinking_budget;
        const n = Number(raw);
        if (Number.isFinite(n)) return n;
    }
    return null;
}
/**
 * Clamp every thinking budget in the body down to `max` (only lowers; never
 * raises a budget already below max). Mutates in place. Returns true when at
 * least one budget was actually lowered (i.e. a retry would send a different
 * body) — false means the 400 was not caused by an over-max budget we hold, so
 * retrying would resend an identical body and loop.
 */ function clampNestedThinkingBudget(body, max) {
    let changed = false;
    for (const tc of collectThinkingConfigs(body)){
        for (const key of [
            "thinkingBudget",
            "thinking_budget"
        ]){
            const n = Number(tc[key]);
            if (Number.isFinite(n) && n > max) {
                tc[key] = max;
                changed = true;
            }
        }
    }
    return changed;
}
/**
 * Strip the OmniRoute provider prefix from tool model fields (e.g.
 * `cc/claude-opus-4-8` → `claude-opus-4-8`). Versioned built-in tool types carry
 * an 8-digit date suffix (`advisor_20260301`, `bash_20250124`); non-versioned
 * server tools (Task/subagent, web_search) carry the same prefixed model. The
 * real Claude CLI sends a bare model id there, never a prefixed one, so a leaked
 * OmniRoute prefix makes Anthropic reject the request.
 *
 * Two mechanisms, applied to any tool with a string `model`:
 * 1. Versioned built-in types (`type` matches `_\d{8}$`): strip the last path
 *    segment (`model.split("/").pop()`), matching legacy behavior for kiro/ etc.
 * 2. Any tool whose model starts with a 9router Claude provider prefix
 *    (`cc/`, `claude/`): strip exactly that prefix (`slice`), preserving foreign
 *    providers such as `openrouter/anthropic/...` — mirrors upstream
 *    normalizeClaudeServerToolModels (9router#2649).
 * Mutates in place.
 */ const CLAUDE_TOOL_MODEL_PREFIXES = [
    "cc/",
    "claude/"
];
function stripVersionedToolModelPrefix(tools) {
    if (!Array.isArray(tools)) return;
    for (const t of tools){
        if (typeof t.model !== "string") continue;
        const model = t.model;
        if (typeof t.type === "string" && /^[a-z][a-z0-9_]*_\d{8}$/.test(t.type) && model.includes("/")) {
            t.model = model.split("/").pop();
        } else {
            const prefix = CLAUDE_TOOL_MODEL_PREFIXES.find((candidate)=>model.startsWith(candidate));
            if (prefix) t.model = model.slice(prefix.length);
        }
    }
}
class BaseExecutor {
    provider;
    config;
    // Session pool support — subclasses can set poolConfig to opt in
    poolConfig;
    _pool = null;
    constructor(provider, config){
        this.provider = provider;
        this.config = config;
    }
    getProvider() {
        return this.provider;
    }
    getPool() {
        if (!this.poolConfig) return null;
        if (!this._pool) {
            const pool = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SessionPool"](this.provider, this.poolConfig);
            pool.warmUp(this.poolConfig.minSessions).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PoolRegistry"].register(this.provider, pool);
            this._pool = pool;
        }
        return this._pool;
    }
    buildPoolHeaders(session) {
        if (!session) return {};
        return session.buildHeaders();
    }
    getBaseUrls() {
        return this.config.baseUrls || (this.config.baseUrl ? [
            this.config.baseUrl
        ] : []);
    }
    getFallbackCount() {
        return this.getBaseUrls().length || 1;
    }
    getTimeoutMs() {
        const configured = this.config?.timeoutMs;
        if (typeof configured !== "number" || !Number.isFinite(configured)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        }
        return Math.max(1, Math.floor(configured));
    }
    getCountTokensTimeoutMs() {
        return this.getTimeoutMs();
    }
    buildUrl(model, stream, urlIndex = 0, credentials = null) {
        void model;
        void stream;
        if (this.provider?.startsWith?.("openai-compatible-")) {
            const psd = credentials?.providerSpecificData;
            const baseUrl = typeof psd?.baseUrl === "string" ? psd.baseUrl : "https://api.openai.com/v1";
            const normalized = baseUrl.replace(/\/$/, "");
            // Sanitize custom path: must start with '/', no path traversal, no null bytes
            const rawPath = typeof psd?.chatPath === "string" && psd.chatPath ? psd.chatPath : null;
            const customPath = rawPath && sanitizePath(rawPath) ? rawPath : null;
            if (customPath) return `${normalized}${customPath}`;
            const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenAICompatibleType"])(this.provider, psd) === "responses" ? "/responses" : "/chat/completions";
            return `${normalized}${path}`;
        }
        const baseUrls = this.getBaseUrls();
        return baseUrls[urlIndex] || baseUrls[0] || this.config.baseUrl || "";
    }
    /**
   * Resolve the effective base URL for a request, preferring per-connection
   * providerSpecificData.baseUrl over the static provider config baseUrl.
   */ resolveBaseUrl(credentials, fallback) {
        const psdBaseUrl = credentials?.providerSpecificData?.baseUrl;
        // Operator's manual override always wins (#6147).
        if (typeof psdBaseUrl === "string" && psdBaseUrl) return psdBaseUrl;
        // An alternate protocol selected on the connection carries its own URL.
        const alternate = this.resolveAlternate(credentials);
        if (alternate?.baseUrl) return alternate.baseUrl;
        return fallback || this.config.baseUrl || "";
    }
    /**
   * Alternate protocol selected on this connection, if the provider declares one
   * that matches. Centralizes the registry lookup so every call-site resolves the
   * same way.
   */ resolveAlternate(credentials) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAlternateFormat"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(this.provider), credentials?.providerSpecificData);
    }
    usesClaudeCodeProtocol(credentials) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(this.provider)) return false;
        const format = this.resolveAlternate(credentials)?.format;
        return format !== "openai" && format !== "openai-responses";
    }
    /**
   * Resolve the effective API key via extra-keys round-robin rotation.
   * Mutates `credentials.providerSpecificData.selectedKeyId` on rotation.
   */ resolveEffectiveKey(credentials) {
        const extraKeys = credentials.providerSpecificData?.extraApiKeys ?? [];
        const selectedKeyId = credentials.providerSpecificData?.selectedKeyId;
        const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
        let effectiveKey = credentials.apiKey;
        // Rotate whenever extras exist — including empty primary + populated extras (#8467).
        // getValidApiKey already skips a blank primary and round-robins the extras alone.
        if (validExtras.length > 0 && credentials.connectionId) {
            const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveKeyForRequest"])(credentials.connectionId, credentials.apiKey || "", validExtras, selectedKeyId ?? null);
            effectiveKey = resolved?.key ?? credentials.apiKey;
            if (resolved && credentials.providerSpecificData) {
                credentials.providerSpecificData.selectedKeyId = resolved.keyId;
            }
        }
        return effectiveKey;
    }
    /**
   * Build the common header preamble shared by BaseExecutor and DefaultExecutor:
   * Content-Type, config.headers, per-provider User-Agent env override, and
   * resolved effective key (via extra-keys round-robin).
   */ buildHeadersPreamble(credentials, stream) {
        const alternate = this.resolveAlternate(credentials);
        const headers = {
            "Content-Type": "application/json",
            ...this.config.headers,
            ...alternate?.headers || {}
        };
        // Allow per-provider User-Agent override via environment variable.
        // Example: CLAUDE_USER_AGENT="my-agent/2.0" overrides the default for the Claude provider.
        const providerId = this.config?.id || this.provider;
        if (providerId) {
            const envKey = `${providerId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_USER_AGENT`;
            const envUA = process.env[envKey]?.trim();
            if (envUA) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setUserAgentHeader"])(headers, envUA);
            }
        }
        const effectiveKey = this.resolveEffectiveKey(credentials);
        void stream;
        return {
            headers,
            effectiveKey
        };
    }
    buildHeaders(credentials, stream = true, clientHeaders, model, health) {
        void clientHeaders;
        void model;
        const { headers, effectiveKey } = this.buildHeadersPreamble(credentials, stream);
        if (credentials.accessToken) {
            headers["Authorization"] = `Bearer ${credentials.accessToken}`;
        } else if (effectiveKey) {
            headers["Authorization"] = `Bearer ${effectiveKey}`;
        }
        headers["Accept"] = stream ? "text/event-stream" : "application/json";
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeAnthropicHeaderVariants"])(headers);
        return headers;
    }
    // Override in subclass for provider-specific transformations
    transformRequest(model, body, stream, credentials) {
        void model;
        void stream;
        void credentials;
        // Fix #1674: Remove empty string values from optional parameters
        // like tool descriptions to avoid upstream validation failures.
        if (body && typeof body === "object" && !Array.isArray(body)) {
            const cloned = {
                ...body
            };
            if (Array.isArray(cloned.input)) {
                cloned.input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeResponsesInputItems"])(cloned.input, false);
            }
            if (Array.isArray(cloned.tools)) {
                cloned.tools = cloned.tools.map((tool)=>{
                    if (tool && typeof tool === "object" && !Array.isArray(tool)) {
                        const toolRecord = tool;
                        const toolFunction = toolRecord.function;
                        if (toolFunction && typeof toolFunction === "object" && !Array.isArray(toolFunction)) {
                            const func = {
                                ...toolFunction
                            };
                            if (func.description === "") delete func.description;
                            if (typeof func.name !== "string" || func.name.trim() === "") {
                                func.name = "unnamed_tool";
                            }
                            return {
                                ...toolRecord,
                                function: func
                            };
                        }
                    }
                    return tool;
                });
            }
            // Fix #1884: Cursor sends prompt_cache_retention which breaks strict upstream endpoints
            delete cloned.prompt_cache_retention;
            // Also clean up top level optional fields that commonly cause issues when empty
            const optionalKeys = [
                "user",
                "stop",
                "seed",
                "response_format"
            ];
            for (const key of optionalKeys){
                if (cloned[key] === "") delete cloned[key];
            }
            return cloned;
        }
        return body;
    }
    shouldRetry(status, urlIndex) {
        return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && urlIndex + 1 < this.getFallbackCount();
    }
    // Intra-URL retry config: retry same URL before falling back to next node
    static RETRY_CONFIG = {
        maxAttempts: 2,
        delayMs: 2000
    };
    // WAF (400 content-blocked) retry config: agentrouter.org's WAF is burst-sensitive
    // and recovers after a short cooldown. Use exponential backoff with a higher
    // starting delay than the generic 429 retry (which is 2s) because the WAF
    // needs more time to clear its per-IP suspicion bucket.
    static WAF_RETRY_CONFIG = {
        maxAttempts: 2,
        delayMs: 1500,
        backoffMultiplier: 2
    };
    // Timeout for receiving the initial upstream response headers. Once the response
    // starts streaming, STREAM_IDLE_TIMEOUT_MS / Undici bodyTimeout handle stalls.
    static FETCH_START_TIMEOUT_MS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    // Override in subclass for provider-specific refresh
    async refreshCredentials(credentials, log) {
        void credentials;
        void log;
        return null;
    }
    needsRefresh(credentials) {
        if (!credentials?.expiresAt) return false;
        const expiresAtMs = new Date(credentials.expiresAt).getTime();
        // Use the provider-specific lead time (REFRESH_LEAD_MS) so rotating-token
        // providers like Codex refresh proactively far ahead of expiry. Keeping the
        // refresh_token "warm" prevents Auth0 from marking it as stale and revoking
        // the token family on first use after long idle.
        const lead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRefreshLeadMs"])(this.provider);
        return expiresAtMs - Date.now() < lead;
    }
    parseError(response, bodyText) {
        return {
            status: response.status,
            message: bodyText || `HTTP ${response.status}`
        };
    }
    buildCountTokensUrl(model, credentials = null) {
        void model;
        void credentials;
        const baseUrl = this.buildUrl(model, false, 0, credentials);
        if (typeof baseUrl !== "string" || baseUrl.length === 0) return null;
        if (this.config?.format !== "claude" || !baseUrl.includes("/messages")) return null;
        const [path, query = ""] = baseUrl.split("?");
        const normalizedPath = path.endsWith("/messages") ? `${path}/count_tokens` : `${path}/count_tokens`;
        return query ? `${normalizedPath}?${query}` : normalizedPath;
    }
    async countTokens({ model, body, credentials, signal, log }) {
        const url = this.buildCountTokensUrl(model, credentials);
        if (!url) return null;
        const headers = this.buildHeaders(credentials, false);
        const requestBody = body && typeof body === "object" ? {
            ...body,
            model
        } : {
            model
        };
        let timeoutId = null;
        let activeSignal = signal || null;
        let controller = null;
        const timeoutMs = this.getCountTokensTimeoutMs();
        if (timeoutMs > 0) {
            controller = new AbortController();
            timeoutId = setTimeout(()=>controller?.abort(), timeoutMs);
            activeSignal = signal ? mergeAbortSignals(signal, controller.signal) : controller.signal;
        }
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(requestBody),
                signal: activeSignal || undefined
            });
            const text = await response.text();
            if (!response.ok) {
                const parsedError = this.parseError(response, text);
                throw new Error(parsedError.message);
            }
            const parsed = text ? JSON.parse(text) : {};
            const inputTokens = Number(parsed?.input_tokens);
            if (!Number.isFinite(inputTokens)) {
                throw new Error("Provider count_tokens response missing input_tokens");
            }
            return {
                input_tokens: inputTokens,
                provider: this.provider,
                source: "provider"
            };
        } catch (error) {
            log?.debug?.("COUNT_TOKENS", `${this.provider}/${model} real count unavailable: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        } finally{
            if (timeoutId) clearTimeout(timeoutId);
        }
    }
    async execute(input) {
        const { model, body, stream, credentials, signal, log, extendedContext, upstreamExtraHeaders, clientHeaders, skipUpstreamRetry = false, onCredentialsRefreshed, contextEditing } = input;
        const fallbackCount = this.getFallbackCount();
        let lastError = null;
        let lastStatus = 0;
        let activeCredentials = credentials;
        // Track per-URL intra-retry attempts to avoid infinite loops
        const retryAttemptsByUrl = {};
        if (this.needsRefresh(credentials)) {
            try {
                // Fix A: wire onCredentialsRefreshed through runWithOnPersist so it runs
                // INSIDE the per-connection mutex inside getAccessToken. Not every
                // executor routes through getAccessToken (e.g. github.ts), so use a flag
                // to detect whether the persist callback actually fired and fall back to
                // post-refresh mutation when it didn't.
                let proactivePersistRan = false;
                const proactiveOnPersist = onCredentialsRefreshed ? async (refreshResult)=>{
                    proactivePersistRan = true;
                    activeCredentials = {
                        ...credentials,
                        ...refreshResult
                    };
                    await onCredentialsRefreshed(refreshResult);
                } : null;
                const refreshed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["runWithOnPersist"])(proactiveOnPersist, ()=>this.refreshCredentials(credentials, log || null));
                if (refreshed && !proactivePersistRan) {
                    // ─────────────────────────────────────────────────────────────────────
                    // ⚠️ SOURCE OF TRUTH — do not flip the proactive path back to
                    //    "persist expired+inactive". Ask the operator first.
                    //
                    // History (do not repeat past regressions):
                    //   - ad3d4b696 (#2718, 2026-05-25): per-connection mutex + onPersist
                    //     wiring so multi-account Codex (rotating refresh tokens) stops
                    //     hitting refresh_token_reused under concurrent load.
                    //   - 0c94c397d (#2743, 2026-05-26): a multi-agent review added a
                    //     `await onCredentialsRefreshed({ testStatus: "expired",
                    //     isActive: false })` here. That BROKE multi-account Codex —
                    //     transient sentinels (refresh_token_reused recoverable via
                    //     rotation map; generic invalid_request blips) were treated as
                    //     terminal, so the proactive path sequentially disabled
                    //     working accounts in the DB before any upstream call confirmed
                    //     the failure. Reverted intentionally.
                    //
                    // Contract for the PROACTIVE refresh path:
                    //   - Classify the sentinel ONLY to avoid spreading it into
                    //     activeCredentials (which would send a non-token upstream).
                    //   - DO NOT persist `{ testStatus: "expired", isActive: false }`
                    //     from here. That decision belongs to the REACTIVE path in
                    //     open-sse/handlers/chatCore.ts:~3912, which runs AFTER the
                    //     upstream confirmed the auth failure. By then the rotation
                    //     map (tokenRefresh.ts:~1541) and the DB-staleness check have
                    //     already had their chance to recover the request.
                    //
                    // If a future review/agent thinks the expired-flip is "missing"
                    // here, STOP — flipping it here re-introduces the multi-account
                    // Codex regression. Discuss with the operator before touching.
                    // ─────────────────────────────────────────────────────────────────────
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(refreshed)) {
                        const refreshCode = refreshed.code;
                        log?.warn?.("TOKEN", `${this.provider.toUpperCase()} | proactive refresh returned unrecoverable sentinel (code=${String(refreshCode ?? "unknown")}); keeping stale credentials, deferring to reactive path.`);
                    // Intentionally NOT spreading the sentinel and NOT persisting
                    // expired status. The next upstream call either succeeds (rotation
                    // map / DB-staleness saved us) or fails — chatCore.ts then marks
                    // the account expired with confidence.
                    } else {
                        activeCredentials = {
                            ...credentials,
                            ...refreshed
                        };
                        if (onCredentialsRefreshed) {
                            await onCredentialsRefreshed(refreshed);
                        }
                    }
                }
            } catch (error) {
                // tokenRefresh.ts:1352 documents that onPersist throws are re-thrown so
                // the caller is aware of the persistence failure. Honor that contract:
                // log at error level (not warn), with sanitized message — and let the
                // request continue with stale credentials so the user-visible error
                // surfaces upstream rather than being silently absorbed here.
                log?.error?.("TOKEN", `Credential refresh failed for ${this.provider}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        // Set by the Context Editing 400-fallback below: once an upstream rejects the
        // `context_management` param, suppress its re-injection on every later
        // retry/fallback URL (each iteration rebuilds a fresh `transformedBody`).
        let contextEditingDisabled = false;
        // Tracks which request fields have already been stripped via the generic 400
        // field-downgrade below, so each known field is stripped at most once across
        // all fallback URLs (bounded retry loop).
        const strippedFields = new Set();
        // Set by the thinking_budget 400 clamp-and-retry below: the upstream's
        // advertised max (parsed from the error) is applied to every later
        // retry/fallback URL so they don't re-hit the same 400. The clamp itself
        // fires at most once per URL (guarded inline) so a persistent 400 cannot
        // loop. The learned cap is also recorded process-wide via
        // recordLearnedThinkingCap so future requests skip the 400 entirely.
        let thinkingBudgetClampedMax = null;
        for(let urlIndex = 0; urlIndex < fallbackCount; urlIndex++){
            const requestCredentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$forceResponsesUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withForcedResponsesUpstream"])(this.provider, body, activeCredentials);
            const url = this.buildUrl(model, stream, urlIndex, requestCredentials);
            const headers = this.buildHeaders(requestCredentials, stream, clientHeaders, model);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyConfiguredUserAgent"])(headers, requestCredentials?.providerSpecificData);
            // Strip OpenAI SDK (X-Stainless-*) metadata + normalize SDK-derived User-Agent
            // on OpenAI-compatible passthrough requests — some upstream gateways 403 on them.
            const strippedStainless = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripStainlessHeadersForOpenAICompat"])(headers, this.provider, url);
            if (strippedStainless.length > 0) {
                log?.debug?.("HEADERS", `Stripped X-Stainless-* from OpenAI-compatible request: ${strippedStainless.join(", ")}`);
            }
            const usesClaudeCodeProtocol = this.usesClaudeCodeProtocol(requestCredentials);
            const fingerprintProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usesCcWireImage"])(this.provider) && !usesClaudeCodeProtocol ? "codex" : this.provider;
            const ccRequestDefaults = usesClaudeCodeProtocol ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClaudeCodeCompatibleRequestDefaults"])(requestCredentials?.providerSpecificData) : {};
            const shouldForwardExtendedContext = extendedContext && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["modelSupportsContext1mBeta"])(model) && !usesClaudeCodeProtocol;
            const shouldForwardCcCompatibleContext1m = usesClaudeCodeProtocol && ccRequestDefaults.context1m === true && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["modelHasNativeContext1m"])(model);
            if (shouldForwardExtendedContext || shouldForwardCcCompatibleContext1m) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendAnthropicBetaHeader"])(headers, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CONTEXT_1M_BETA_HEADER"]);
            }
            const rawTransformedBody = await this.transformRequest(model, body, stream, requestCredentials);
            let transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$reasoningEffort$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeReasoningEffortForProvider"])(rawTransformedBody, this.provider, model, log);
            if (this.provider === "groq") {
                transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripGroqUnsupportedFields"])(transformedBody);
            }
            // A previous URL in this execute() already hit a thinking_budget 400 and
            // recorded the upstream's max. Pre-clamp this URL's fresh transformedBody
            // so it doesn't re-hit the same 400 (avoids one wasted round-trip per
            // fallback URL). No-op when nothing has been learned this execute().
            if (thinkingBudgetClampedMax !== null) {
                clampNestedThinkingBudget(transformedBody, thinkingBudgetClampedMax);
            }
            try {
                // Timeout only covers response start; stream stalls are handled downstream.
                const fetchStartTimeoutMs = this.getTimeoutMs();
                const fetchWithStartTimeout = async (requestUrl, requestOptions)=>{
                    const timeoutController = fetchStartTimeoutMs > 0 ? new AbortController() : null;
                    let timeoutId = null;
                    if (timeoutController) {
                        timeoutId = setTimeout(()=>{
                            const timeoutError = new Error(`Fetch timeout after ${fetchStartTimeoutMs}ms on ${requestUrl}`);
                            timeoutError.name = "TimeoutError";
                            timeoutController.abort(timeoutError);
                        }, fetchStartTimeoutMs);
                    }
                    const timeoutSignal = timeoutController?.signal ?? null;
                    const combinedSignal = signal && timeoutSignal ? mergeAbortSignals(signal, timeoutSignal) : signal || timeoutSignal;
                    const optionsWithSignal = combinedSignal ? {
                        ...requestOptions,
                        signal: combinedSignal
                    } : requestOptions;
                    try {
                        return await fetch(requestUrl, optionsWithSignal);
                    } finally{
                        if (timeoutId) clearTimeout(timeoutId);
                    }
                };
                const isClaudeCodeClient = clientHeaders?.["x-app"] === "cli" || clientHeaders?.["user-agent"] && clientHeaders["user-agent"].toLowerCase().includes("claude-code") || clientHeaders?.["user-agent"] && clientHeaders["user-agent"].toLowerCase().includes("claude-cli");
                // Anthropic's user:sessions:claude_code OAuth scope expects CLI-shaped
                // traffic. Apply the cloak whenever we have an OAuth token, regardless
                // of upstream client.
                const hasClaudeOAuthToken = typeof activeCredentials?.accessToken === "string" && activeCredentials.accessToken.startsWith("sk-ant-oat") && !activeCredentials?.apiKey;
                if ((this.provider === "claude" && (isClaudeCodeClient || hasClaudeOAuthToken) || usesClaudeCodeProtocol) && typeof transformedBody === "object" && transformedBody !== null) {
                    const tb = transformedBody;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripProxyToolPrefix"])(tb);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["remapToolNamesInRequest"])(tb);
                    // Cloak third-party tool names + sanitize invalid tool schemas so
                    // Anthropic does not refuse native Claude OAuth traffic with a
                    // misleading "out of extra usage" placeholder. See Spec E.
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloakThirdPartyToolNames"])(tb);
                    if (Array.isArray(tb.tools)) {
                        tb.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeClaudeToolSchemas"])(tb.tools);
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obfuscateInBody"])(tb);
                    // NOTE (issue #2260): This is the native `claude` provider OAuth path.
                    // It is intentionally NOT routed through applyCcBridgeTransformPipeline.
                    // The native OAuth path already prepends its own billing line + sentinel
                    // (see lines ~744-773 below, dayStamp-based, cc_entrypoint=cli, cch=00000
                    // placeholder, signed at body level). The CC bridge transforms DSL is
                    // wired into buildAndSignClaudeCodeRequest (claudeCodeCompatible.ts step 5b)
                    // which is the anthropic-compatible-cc-* relay path — a different,
                    // separately classified surface. Do not double-prepend here.
                    // Real CLI never sets cache_control on tools.
                    if (Array.isArray(tb.tools)) {
                        for (const t of tb.tools){
                            delete t.cache_control;
                        }
                        // Also strip OmniRoute provider prefix from versioned built-in tool
                        // model fields (e.g. cc/claude-opus-4-8 → claude-opus-4-8).
                        stripVersionedToolModelPrefix(tb.tools);
                    }
                    // Per-request behavior overrides via custom client headers.
                    //   x-omniroute-effort:   low | medium | high | xhigh | max | off
                    //   x-omniroute-thinking: adaptive | off
                    // A header value applies only when the corresponding body field is
                    // not already set; "off" force-strips the field.
                    const headerEffort = (clientHeaders?.["x-omniroute-effort"] ?? clientHeaders?.["X-OmniRoute-Effort"])?.trim().toLowerCase();
                    const headerThinking = (clientHeaders?.["x-omniroute-thinking"] ?? clientHeaders?.["X-OmniRoute-Thinking"])?.trim().toLowerCase();
                    let appliedEffort = null;
                    let appliedThinking = null;
                    if (headerEffort === "off") {
                        if (tb.output_config && typeof tb.output_config === "object") {
                            delete tb.output_config.effort;
                        }
                        appliedEffort = "off";
                    } else if (headerEffort && [
                        "low",
                        "medium",
                        "high",
                        "xhigh",
                        "max"
                    ].includes(headerEffort)) {
                        const oc = tb.output_config && typeof tb.output_config === "object" ? tb.output_config : {};
                        if (oc.effort === undefined) {
                            oc.effort = headerEffort;
                            tb.output_config = oc;
                            appliedEffort = headerEffort;
                        }
                    }
                    // Anthropic rejects `thinking` (enabled/adaptive) when tool_choice forces a
                    // specific tool ({type:"any"|"tool"}): "Thinking may not be enabled when
                    // tool_choice forces tool use". Treat forced tool_choice as an implicit
                    // `thinking: off` so neither the explicit-adaptive branch nor the default CC
                    // injection below produces the invalid combination (incl. client-sent thinking).
                    const toolChoiceForced = tb.tool_choice === "any" || typeof tb.tool_choice === "object" && tb.tool_choice !== null && (tb.tool_choice.type === "any" || tb.tool_choice.type === "tool");
                    const effThinking = toolChoiceForced ? "off" : headerThinking;
                    if (effThinking === "adaptive") {
                        if (tb.thinking === undefined) {
                            tb.thinking = {
                                type: "adaptive"
                            };
                            appliedThinking = "adaptive";
                        }
                        if (tb.context_management === undefined) {
                            tb.context_management = {
                                edits: [
                                    {
                                        type: "clear_thinking_20251015",
                                        keep: "all"
                                    }
                                ]
                            };
                        }
                    } else if (effThinking === "off") {
                        delete tb.thinking;
                        delete tb.context_management;
                        appliedThinking = "off";
                    } else if (!effThinking && !headerEffort && isClaudeCodeClient) {
                        // Default Claude Code logic when no override headers are present.
                        // Generic OpenAI-compatible clients that route through native Claude OAuth
                        // must opt in with x-omniroute-thinking; force-injecting adaptive thinking
                        // leaks non-standard reasoning replay fields back into those clients.
                        const isHaiku = typeof tb.model === "string" && tb.model.includes("haiku");
                        // #5312 RC-B: honor the operator's proxy-level Thinking-Budget mode.
                        // `auto` means "strip — let the provider decide", so suppress the default
                        // adaptive injection. Passthrough/no-config keeps the native Claude Code
                        // behavior (adaptive) so #4633 does not regress (request-side only).
                        const tbMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getThinkingBudgetConfig"])().mode;
                        if (isHaiku) {
                            // Keep tb.thinking — real Claude Desktop keeps thinking enabled for Haiku
                            // (issue #2454). Only strip output_config (effort) which Haiku rejects;
                            // context_management is re-paired with the preserved thinking below.
                            delete tb.output_config;
                            delete tb.context_management;
                        } else if (tbMode === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ThinkingMode"].AUTO) {
                            delete tb.thinking;
                            delete tb.context_management;
                            delete tb.output_config;
                        } else if (tb.thinking === undefined && tb.output_config === undefined) {
                            tb.thinking = {
                                type: "adaptive"
                            };
                            tb.context_management = {
                                edits: [
                                    {
                                        type: "clear_thinking_20251015",
                                        keep: "all"
                                    }
                                ]
                            };
                            tb.output_config = {
                                effort: "high"
                            };
                        }
                        // #5312: Opus 4.7/4.8 accept only thinking.type="adaptive" ("enabled" → 400).
                        // When an operator budget (custom/adaptive mode) produced an enabled block
                        // upstream, remap it to adaptive + output_config.effort here.
                        const th = tb.thinking;
                        if (th?.type === "enabled" && tbMode !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ThinkingMode"].PASSTHROUGH) {
                            const b = typeof th.budget_tokens === "number" ? th.budget_tokens : 0;
                            tb.thinking = {
                                type: "adaptive"
                            };
                            tb.output_config = {
                                effort: b <= 1024 ? "low" : b <= 10240 ? "medium" : b >= 131072 ? "max" : "high"
                            };
                            tb.context_management = {
                                edits: [
                                    {
                                        type: "clear_thinking_20251015",
                                        keep: "all"
                                    }
                                ]
                            };
                        }
                    }
                    // Real CLI always pairs context_management with thinking. Mirror
                    // that invariant so long sessions don't accumulate thinking blocks
                    // toward the context cap.
                    if (hasActiveClaudeThinking(tb) && !tb.context_management) {
                        tb.context_management = {
                            edits: [
                                {
                                    type: "clear_thinking_20251015",
                                    keep: "all"
                                }
                            ]
                        };
                    }
                    const seed = activeCredentials?.accessToken || activeCredentials?.apiKey || "anon";
                    const psd = activeCredentials?.providerSpecificData;
                    let identitySource = "synthesized";
                    let sessionId;
                    let deviceId;
                    let accountUUID;
                    // For any Claude OAuth request, ignore client-supplied metadata.user_id /
                    // X-Claude-Code-Session-Id and synthesize per-account: the CC device_id from
                    // ~/.claude.json is shared across every account on one machine, which lets
                    // Anthropic correlate accounts behind one OmniRoute.
                    const cloakIdentity = isClaudeCodeClient || hasClaudeOAuthToken;
                    const upstreamUserId = cloakIdentity ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUpstreamMetadataUserId"])(tb);
                    if (upstreamUserId) {
                        sessionId = upstreamUserId.session_id;
                        deviceId = upstreamUserId.device_id;
                        accountUUID = upstreamUserId.account_uuid;
                        identitySource = "upstream-metadata";
                    } else {
                        const headerSid = cloakIdentity ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["passthroughUpstreamSessionId"])(clientHeaders);
                        sessionId = headerSid ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionId"])(seed);
                        deviceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCliUserID"])(psd, seed);
                        accountUUID = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAccountUUID"])(psd, seed, activeCredentials?.accessToken);
                        identitySource = headerSid ? "upstream-header" : cloakIdentity ? "synthesized-cloaked" : "synthesized";
                    }
                    // system[0] (billing) and system[1] (sentinel) must not carry
                    // cache_control — that belongs on upstream prompt blocks at [2..].
                    const billingLine = `x-anthropic-billing-header: cc_version=${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CLI_BILLING_VERSION"]}; cc_entrypoint=cli; cch=00000;`;
                    const SENTINEL = "You are Claude Code, Anthropic's official CLI for Claude.";
                    const sysBlocks = Array.isArray(tb.system) ? tb.system : typeof tb.system === "string" ? [
                        {
                            type: "text",
                            text: tb.system
                        }
                    ] : [];
                    // Strip any pre-existing billing/sentinel before re-prepending — keeps
                    // retries idempotent and avoids stacking that breaks prompt-cache prefix
                    // matching (see issue #1712).
                    for(let i = sysBlocks.length - 1; i >= 0; i--){
                        const t = sysBlocks[i]?.text;
                        if (typeof t === "string" && t.startsWith("x-anthropic-billing-header:")) {
                            sysBlocks.splice(i, 1);
                        }
                    }
                    for(let i = sysBlocks.length - 1; i >= 0; i--){
                        const t = sysBlocks[i]?.text;
                        if (typeof t === "string" && t.startsWith(SENTINEL)) {
                            sysBlocks.splice(i, 1);
                        }
                    }
                    sysBlocks.unshift({
                        type: "text",
                        text: billingLine
                    }, {
                        type: "text",
                        text: SENTINEL
                    });
                    tb.system = sysBlocks;
                    // Run the configurable system-transforms pipeline for the native
                    // `claude` provider (issue #2260 / comment 4459544580). The default
                    // claude pipeline runs cosmetic ops only (Open WebUI paragraph
                    // anchors, identity-prefix paragraph drop, ZWJ obfuscation of
                    // sensitive words). It deliberately does NOT include
                    // `inject_billing_header` — billing + sentinel are already
                    // prepended above. Users can extend the pipeline via Settings UI.
                    {
                        const transformResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applySystemTransformPipeline"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"], tb);
                        if (transformResult.appliedOpKinds.length > 0) {
                            console.log(`[SystemTransforms] claude-native: ${transformResult.appliedOpKinds.join(", ")}`);
                        }
                    }
                    if (!tb.metadata || typeof tb.metadata !== "object") tb.metadata = {};
                    tb.metadata.user_id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUserIdJson"])({
                        deviceId,
                        accountUUID,
                        sessionId
                    });
                    // Headers. Accept stays application/json even on streams (Stainless
                    // convention; SSE decoding is gated on body.stream). anthropic-beta
                    // is selected per request shape; the full set on a quota probe is
                    // itself a fingerprint.
                    // Respect the client's negotiated anthropic-beta (real Claude Code) instead
                    // of force-injecting thinking/effort betas it never requested (#3415).
                    const clientAnthropicBeta = clientHeaders?.["anthropic-beta"] ?? clientHeaders?.["Anthropic-Beta"] ?? null;
                    const ccHeaders = {
                        Accept: "application/json",
                        "anthropic-version": "2023-06-01",
                        // #3974: merge the client's allowlisted betas (e.g. tool-search-tool)
                        // on top of the shape-derived set so deferred-tool requests are not
                        // rejected; selectBetaFlags still gates thinking/effort per #3415.
                        "anthropic-beta": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeClientAnthropicBeta"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectBetaFlags"])(tb, null, clientAnthropicBeta), clientAnthropicBeta),
                        "anthropic-dangerous-direct-browser-access": "true",
                        "x-app": "cli",
                        "User-Agent": `claude-cli/${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_VERSION"]} (external, cli)`,
                        "X-Stainless-Package-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_STAINLESS_VERSION"],
                        "X-Stainless-Timeout": "600",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        connection: "keep-alive",
                        "x-client-request-id": (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                        "X-Claude-Code-Session-Id": sessionId
                    };
                    // Drop case variants of the same header name before merging — undici
                    // would otherwise concatenate them (issue #1454).
                    const ccKeysLower = new Set(Object.keys(ccHeaders).map((k)=>k.toLowerCase()));
                    for (const key of Object.keys(headers)){
                        if (ccKeysLower.has(key.toLowerCase())) delete headers[key];
                    }
                    Object.assign(headers, ccHeaders);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usesCcWireImage"])(this.provider) && usesClaudeCodeProtocol) {
                        delete headers["Authorization"];
                        headers["x-api-key"] = activeCredentials?.apiKey || activeCredentials?.accessToken || "";
                    }
                    delete headers["X-Stainless-Helper-Method"];
                    // OS/arch follow the host running the signed binary. Runtime version
                    // is pinned to the captured CLI wire image, not OmniRoute's Node.
                    headers["X-Stainless-Arch"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stainlessArch"])();
                    headers["X-Stainless-Lang"] = "js";
                    headers["X-Stainless-OS"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stainlessOS"])();
                    headers["X-Stainless-Runtime"] = "node";
                    headers["X-Stainless-Runtime-Version"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CLI_STAINLESS_RUNTIME_VERSION"];
                    headers["X-Stainless-Retry-Count"] = "0";
                    delete headers["X-Stainless-Os"];
                    const overrideTag = appliedEffort || appliedThinking ? ` overrides=effort:${appliedEffort ?? "-"},thinking:${appliedThinking ?? "-"}` : "";
                    log?.debug?.("CLAUDE", `identity=${identitySource} sid=${sessionId.slice(0, 8)} dev=${deviceId.slice(0, 8)} acct=${accountUUID.slice(0, 8)}${overrideTag}`);
                }
                // CLI fingerprint ordering — always-on for native Claude OAuth, opt-in
                // for other providers. Header + body field order is itself a fingerprint.
                let finalHeaders = headers;
                // Strip internal sentinel fields set by remapToolNamesInRequest before
                // serializing — Anthropic rejects unknown top-level fields (issue #2260).
                delete transformedBody["_claudeCodeRequiresLowercaseToolNames"];
                // Guard against orphan tool_use / tool_result pairs. Clients can ship
                // truncated histories mid-tool-call which Anthropic rejects with
                // `messages.N: tool_use ids were found without tool_result blocks
                // immediately after: toolu_...`. fixToolPairs strips orphans, then
                // stripTrailingAssistantOrphanToolUse catches the case where the
                // request body itself ends on an unmatched assistant(tool_use) —
                // invalid for an upstream-send turn since the body must end on a
                // user message. Both are idempotent on clean histories.
                {
                    const tb = transformedBody;
                    if (Array.isArray(tb?.messages)) {
                        const fixed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixToolPairs"])(tb.messages);
                        // fixToolAdjacency enforces Claude's strict adjacency rule
                        // (tool_result must be in immediately next message).
                        // Only apply for Claude/Claude-compatible — OpenAI allows results
                        // spread across multiple subsequent messages.
                        const isClaude = this.provider === "claude" || usesClaudeCodeProtocol;
                        // For Claude, fixToolAdjacency may strip tool_use blocks whose
                        // tool_result isn't in the next message; re-run fixToolPairs to
                        // drop any tool_result orphaned by that strip (discussion #2410).
                        const adjacent = isClaude ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixToolPairs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixToolAdjacency"])(fixed)) : fixed;
                        const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripTrailingAssistantOrphanToolUse"])(adjacent);
                        // Some providers (e.g. Mistral) require the last message to be user
                        // or tool and reject trailing assistant text messages with 400 (#3396).
                        tb.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripTrailingAssistantForProvider"])(stripped, this.provider);
                    }
                }
                // Anthropic's extended-thinking contract forbids non-default sampling
                // params: temperature must be 1 and top_p >= 0.95 (or unset) whenever
                // thinking is enabled/adaptive. Thinking can be injected by per-model
                // requestDefaults *after* the translator/constraint passes, so normalize
                // at this final dispatch point — the single chokepoint every Claude
                // routing mode (grouped/raw/combo) and the native passthrough share,
                // before fingerprinting and CCH signing serialize the body.
                if (this.provider === "claude" || usesClaudeCodeProtocol) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enforceThinkingTemperature"])(transformedBody);
                }
                // Delegated Context Editing (opt-in): attach the clear_tool_uses strategy so
                // the provider clears stale tool-use blocks server-side. Runs at this same
                // chokepoint, composing with the clear_thinking edit the fingerprint path may
                // have already set. Scoped to genuine `claude` (real Anthropic key/OAuth) and
                // `anthropic-compatible-cc-*` relays — the latter advertise Claude Code
                // compatibility, so they are the relays most likely to accept the beta. A
                // rejecting upstream is caught by the 400-fallback below. Deliberately
                // EXCLUDED: `claude-web` (a browser relay with a `create_conversation_params`
                // request shape that never sees `context_management`) and generic
                // `anthropic-compatible-*` (third-party endpoints with uncertain beta support).
                // `contextEditingDisabled` (set by the 400-fallback) suppresses re-injection
                // when a fresh `transformedBody` is built for a retry/fallback URL.
                if ((this.provider === "claude" || usesClaudeCodeProtocol) && contextEditing?.enabled && !contextEditingDisabled) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$contextEditing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyContextEditingToBody"])(transformedBody, {
                        enabled: true
                    });
                    log?.debug?.("CONTEXT_EDITING", "Delegated context editing on — attached clear_tool_uses to the Claude request");
                }
                let bodyString = JSON.stringify(transformedBody);
                const shouldFingerprint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCliCompatEnabled"])(fingerprintProvider) || this.provider === "claude" && (isClaudeCodeClient || hasClaudeOAuthToken);
                if (shouldFingerprint) {
                    const fingerprinted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyFingerprint"])(fingerprintProvider, headers, transformedBody);
                    finalHeaders = fingerprinted.headers;
                    bodyString = fingerprinted.bodyString;
                }
                // CCH signing — replaces the cch=00000 placeholder in the billing
                // header with an xxHash64 integrity token over the serialized body.
                if (usesClaudeCodeProtocol || this.provider === "claude") {
                    bodyString = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signRequestBody"])(bodyString);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeUpstreamExtraHeaders"])(finalHeaders, upstreamExtraHeaders);
                if (this.provider === "cline" || this.provider === "clinepass") {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyClineProtocolHeaders"])(finalHeaders, {
                        taskId: headers["X-Task-ID"]
                    });
                }
                // Enforce peer tracing after all configurable headers have been merged so
                // operator/provider metadata cannot accidentally erase the loop guard.
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyPeerTraceHeader"])(finalHeaders, clientHeaders, url);
                const serializedBody = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBody"](bodyString);
                // #4307 — Preserve the non-enumerable tool-name cloak/remap reverse map
                // (`_toolNameMap`, set on the live `transformedBody` by
                // remapToolNamesInRequest / cloakThirdPartyToolNames) that the JSON
                // round-trip above drops. chatCore's response-side un-cloak reads it off
                // `result.transformedBody` to restore the client's original tool-name
                // casing (e.g. `read`, not the cloaked `Read`). Without this re-attach the
                // map is lost and the client receives the cloaked casing — a regression
                // from #3941's serialized-body capture. Mirrors antigravity.ts's
                // `attachToolNameMap`; non-enumerable so it never re-serializes upstream.
                if (transformedBody && typeof transformedBody === "object" && serializedBody && typeof serializedBody === "object") {
                    const liveToolNameMap = transformedBody._toolNameMap;
                    if (liveToolNameMap instanceof Map && liveToolNameMap.size > 0 && !(serializedBody._toolNameMap instanceof Map)) {
                        Object.defineProperty(serializedBody, "_toolNameMap", {
                            value: liveToolNameMap,
                            enumerable: false,
                            configurable: true,
                            writable: true
                        });
                    }
                }
                const fetchOptions = {
                    method: "POST",
                    headers: finalHeaders,
                    body: bodyString
                };
                // OpenRouter `:free`-variant local window (#6842): record every real
                // dispatch attempt (failed attempts still consume a request slot per
                // OpenRouter's own accounting) and self-correct the local counters
                // from the upstream `X-RateLimit-*` headers on the response. Scoped
                // to `:free` models only — no-op (and no extra work) for every other
                // OpenRouter request or provider.
                const openrouterFreeWindowAccountKey = this.provider === "openrouter" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFreeVariantModel"])(model) && activeCredentials.connectionId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAccountKey"])(activeCredentials.connectionId, activeCredentials) : null;
                if (openrouterFreeWindowAccountKey) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordFreeWindowAttempt"])(openrouterFreeWindowAccountKey);
                }
                // WAF burst guard: agentrouter.org's content filter becomes more
                // aggressive after rapid requests. Enforce a small inter-request gap
                // to avoid tripping it. See open-sse/services/wafRateLimit.ts.
                if (this.provider === "agentrouter") {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wafRateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gateOutboundRequest"])(`agentrouter:${url}`);
                }
                let response = await fetchWithStartTimeout(url, fetchOptions);
                if (openrouterFreeWindowAccountKey) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["correctFromRateLimitHeaders"])(openrouterFreeWindowAccountKey, response.headers);
                }
                // Context Editing 400-fallback for Claude-compatible relays.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && contextEditing?.enabled && !contextEditingDisabled && transformedBody && typeof transformedBody === "object" && transformedBody.context_management !== undefined) {
                    const errText = await response.clone().text().catch(()=>"");
                    if (/context[_-]management|context editing/i.test(errText)) {
                        contextEditingDisabled = true;
                        delete transformedBody.context_management;
                        let retryBody = JSON.stringify(transformedBody);
                        if (usesClaudeCodeProtocol || this.provider === "claude") {
                            retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                        }
                        log?.debug?.("CONTEXT_EDITING", `Upstream 400 rejected context_management on ${url} — retrying without it`);
                        response = await fetchWithStartTimeout(url, {
                            ...fetchOptions,
                            body: retryBody
                        });
                    }
                }
                // Thinking-budget 400 clamp-and-retry (Gemini-family, any provider).
                // The proactive capThinkingBudget clamp misses models outside MODEL_SPECS,
                // so an xhigh budget (131072) can reach the upstream and bounce with
                // "thinking_budget must be in the range [-1, N]". When that happens: parse
                // the advertised max, record it process-wide (so FUTURE requests clamp
                // proactively via capThinkingBudget → getLearnedThinkingCap), clamp the
                // nested budget in the live transformedBody, and retry the same URL once.
                // Subsequent requests never pay this 400→retry round-trip.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && thinkingBudgetClampedMax === null && transformedBody && typeof transformedBody === "object") {
                    const errText = await response.clone().text().catch(()=>"");
                    const upstreamMax = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseThinkingBudgetMax"])(errText);
                    if (upstreamMax !== null) {
                        const currentBudget = readNestedThinkingBudget(transformedBody);
                        // Record under the budget that actually failed so the learned step
                        // ladder advances correctly; fall back to upstreamMax when the body
                        // carries no readable budget (still record so we stop re-hitting).
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordLearnedThinkingCap"])(this.provider, model, currentBudget ?? upstreamMax + 1);
                        thinkingBudgetClampedMax = upstreamMax;
                        if (clampNestedThinkingBudget(transformedBody, upstreamMax)) {
                            let retryBody = JSON.stringify(transformedBody);
                            if (usesClaudeCodeProtocol || this.provider === "claude") {
                                retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                            }
                            log?.info?.("THINKING_BUDGET", `Upstream 400 rejected thinking_budget on ${url} — clamped to ${upstreamMax} and retrying (learned for ${this.provider}/${model})`);
                            response = await fetchWithStartTimeout(url, {
                                ...fetchOptions,
                                body: retryBody
                            });
                        }
                    }
                }
                // Generic reactive 400 field-downgrade; each field is stripped at most once.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && transformedBody && typeof transformedBody === "object") {
                    const errText = await response.clone().text().catch(()=>"");
                    const offending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findOffendingField"])(errText);
                    if (offending && !strippedFields.has(offending) && transformedBody[offending] !== undefined) {
                        strippedFields.add(offending);
                        delete transformedBody[offending];
                        let retryBody = JSON.stringify(transformedBody);
                        if (usesClaudeCodeProtocol || this.provider === "claude") {
                            retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                        }
                        log?.debug?.("FIELD_400", `Upstream 400 rejected ${offending} on ${url} — retrying without it`);
                        response = await fetchWithStartTimeout(url, {
                            ...fetchOptions,
                            body: retryBody
                        });
                    } else {
                        // Auto-learn: detect "Unsupported parameter" errors and persist to DB
                        // when the provider config has autoLearn enabled (#6625).
                        const autoLearned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectUnsupportedParam"])(errText);
                        if (autoLearned && !strippedFields.has(autoLearned) && transformedBody[autoLearned] !== undefined) {
                            try {
                                const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getParamFilterConfig"])(this.provider);
                                const shouldAutoLearn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutoLearnGloballyEnabled"])() || config?.autoLearn === true;
                                if (shouldAutoLearn) {
                                    strippedFields.add(autoLearned);
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addParamToBlocklist"])(this.provider, autoLearned, model);
                                    delete transformedBody[autoLearned];
                                    let retryBody = JSON.stringify(transformedBody);
                                    if (usesClaudeCodeProtocol || this.provider === "claude") {
                                        retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                                    }
                                    log?.info?.("AUTO_LEARN", `Auto-learned "${autoLearned}" for provider ${this.provider} (model: ${model}) from 400 on ${url} — retrying`);
                                    response = await fetchWithStartTimeout(url, {
                                        ...fetchOptions,
                                        body: retryBody
                                    });
                                }
                            } catch (learnError) {
                                log?.warn?.("AUTO_LEARN", `Failed to persist auto-learned param "${autoLearned}" for ${this.provider}: ${String(learnError)}`);
                            }
                        }
                    }
                }
                // Intra-URL retry: agentrouter.org WAF returns 400 content-blocked
                // intermittently (burst-sensitive, recovers after cooldown). Retry the
                // same URL with exponential backoff before falling through to the
                // 429/401/fallback chain. See docs/security/AGENTROUTER_WAF.md.
                if (!skipUpstreamRetry && response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && (retryAttemptsByUrl[urlIndex] ?? 0) < BaseExecutor.WAF_RETRY_CONFIG.maxAttempts) {
                    const wafErrText = await response.clone().text().catch(()=>"");
                    if (/content[_-]blocked/i.test(wafErrText)) {
                        retryAttemptsByUrl[urlIndex] = (retryAttemptsByUrl[urlIndex] ?? 0) + 1;
                        const wafAttempt = retryAttemptsByUrl[urlIndex];
                        const wafBackoff = BaseExecutor.WAF_RETRY_CONFIG.delayMs * Math.pow(BaseExecutor.WAF_RETRY_CONFIG.backoffMultiplier, wafAttempt - 1);
                        log?.debug?.("WAF_RETRY", `400 content-blocked intra-retry ${wafAttempt}/${BaseExecutor.WAF_RETRY_CONFIG.maxAttempts} on ${url} — waiting ${wafBackoff}ms`);
                        await new Promise((resolve)=>setTimeout(resolve, wafBackoff));
                        urlIndex--; // re-run this urlIndex on the next loop iteration
                        continue;
                    }
                }
                // Intra-URL retry: if 429 and we haven't exhausted per-URL retries, wait and retry the same URL
                if (!skipUpstreamRetry && response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && (retryAttemptsByUrl[urlIndex] ?? 0) < BaseExecutor.RETRY_CONFIG.maxAttempts) {
                    retryAttemptsByUrl[urlIndex] = (retryAttemptsByUrl[urlIndex] ?? 0) + 1;
                    const attempt = retryAttemptsByUrl[urlIndex];
                    log?.debug?.("RETRY", `429 intra-retry ${attempt}/${BaseExecutor.RETRY_CONFIG.maxAttempts} on ${url} — waiting ${BaseExecutor.RETRY_CONFIG.delayMs}ms`);
                    await new Promise((resolve)=>setTimeout(resolve, BaseExecutor.RETRY_CONFIG.delayMs));
                    urlIndex--; // re-run this urlIndex on the next loop iteration
                    continue;
                }
                // T07: Handle 401 authentication errors — log and continue to fallback
                if (response.status === 401 && credentials.connectionId && credentials.apiKey) {
                    log?.warn?.("AUTH", `401 on ${url} - API key may be invalid`);
                }
                if (!skipUpstreamRetry && this.shouldRetry(response.status, urlIndex)) {
                    log?.debug?.("RETRY", `${response.status} on ${url}, trying fallback ${urlIndex + 1}`);
                    lastStatus = response.status;
                    continue;
                }
                return {
                    response,
                    url,
                    headers: finalHeaders,
                    transformedBody: serializedBody
                };
            } catch (error) {
                // Distinguish timeout errors from other abort errors
                const err = error instanceof Error ? error : new Error(String(error));
                if (err.name === "TimeoutError") {
                    log?.warn?.("TIMEOUT", `Fetch timeout after ${this.getTimeoutMs()}ms on ${url}`);
                }
                lastError = err;
                if (!skipUpstreamRetry && urlIndex + 1 < fallbackCount) {
                    log?.debug?.("RETRY", `Error on ${url}, trying fallback ${urlIndex + 1}`);
                    continue;
                }
                throw err;
            }
        }
        throw lastError || new Error(`All ${fallbackCount} URLs failed with status ${lastStatus}`);
    }
}
const __TURBOPACK__default__export__ = BaseExecutor;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/executors/cliproxyapi.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CliproxyapiExecutor",
    ()=>CliproxyapiExecutor,
    "clearCliproxyapiUrlCache",
    ()=>clearCliproxyapiUrlCache,
    "default",
    ()=>__TURBOPACK__default__export__,
    "isCliproxyapiDeepModeEnabled",
    ()=>isCliproxyapiDeepModeEnabled,
    "resolveCliproxyapiBaseUrl",
    ()=>resolveCliproxyapiBaseUrl
]);
/**
 * CLIProxyAPI Executor — routes requests to a local CLIProxyAPI instance.
 *
 * Always uses the OpenAI-compatible /v1/chat/completions endpoint. CLIProxyAPI
 * internally detects Claude models and routes them through its Claude executor
 * with full emulation (CCH signing, billing header, system prompt, uTLS,
 * multi-account rotation, device profile learning, etc.).
 *
 * The UI toggle (cliproxyapiMode in providerSpecificData) controls WHETHER
 * to use CLIProxyAPI as the backend, not the wire format. Response format
 * is always OpenAI-compatible, so chatCore's SSE parsing works unchanged.
 *
 * Activation:
 *   1. Per-provider upstream_proxy_config (mode=cliproxyapi or fallback)
 *   2. Per-connection cliproxyapiMode toggle in providerSpecificData (UI)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerPluginManifestUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerPluginManifestUrl.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const DEFAULT_PORT = 8317;
const DEFAULT_HOST = "127.0.0.1";
const HEALTH_CHECK_TIMEOUT_MS = 5000;
// Anthropic's reserved tool-name namespace: ^mcp_[^_].* triggers their
// server-side MCP connector billing gate, returning a misleading
// "out of extra usage" 400. Two-underscore (mcp__X) and capitalized
// (Mcp_X) variants pass cleanly.
const MCP_RESERVED_PREFIX_RE = /^mcp_(?=[^_])/;
function rewriteMcpToolName(name) {
    if (typeof name !== "string" || !MCP_RESERVED_PREFIX_RE.test(name)) return null;
    return "M" + name.slice(1); // mcp_call → Mcp_call
}
/**
 * Rewrite ^mcp_[^_] tool names on a body destined for Anthropic's
 * /v1/messages. Returns a reverse map (rewritten → original) that the SSE
 * response stream uses to restore the client's original names on tool_use
 * blocks coming back.
 *
 * Non-mutating: replaces nested array elements with cloned objects rather
 * than mutating in place, so the caller's input body is not affected. The
 * outer `body` reference itself is the cloned `transformed` object from
 * `transformRequest` — we mutate its top-level `tools`, `messages`, and
 * `tool_choice` properties to point at the new clones.
 */ function applyMcpToolNameRewrite(body) {
    const reverseMap = new Map();
    const remember = (original, rewritten)=>{
        reverseMap.set(rewritten, original);
    };
    const tools = body.tools;
    if (Array.isArray(tools)) {
        body.tools = tools.map((tool)=>{
            if (!tool || typeof tool !== "object") return tool;
            const t = tool;
            const original = typeof t.name === "string" ? t.name : "";
            const rewritten = rewriteMcpToolName(original);
            if (rewritten) {
                remember(original, rewritten);
                return {
                    ...t,
                    name: rewritten
                };
            }
            return tool;
        });
    }
    const messages = body.messages;
    if (Array.isArray(messages)) {
        body.messages = messages.map((msg)=>{
            if (!msg || typeof msg !== "object") return msg;
            const m = msg;
            const content = m.content;
            if (!Array.isArray(content)) return msg;
            let mutated = false;
            const newContent = content.map((block)=>{
                if (!block || typeof block !== "object") return block;
                const b = block;
                if (b.type !== "tool_use") return block;
                const original = typeof b.name === "string" ? b.name : "";
                const rewritten = rewriteMcpToolName(original);
                if (rewritten) {
                    mutated = true;
                    remember(original, rewritten);
                    return {
                        ...b,
                        name: rewritten
                    };
                }
                return block;
            });
            return mutated ? {
                ...m,
                content: newContent
            } : msg;
        });
    }
    const toolChoice = body.tool_choice;
    if (toolChoice && typeof toolChoice === "object") {
        const tc = toolChoice;
        if (tc.type === "tool" && typeof tc.name === "string") {
            const rewritten = rewriteMcpToolName(tc.name);
            if (rewritten) {
                const original = tc.name;
                body.tool_choice = {
                    ...tc,
                    name: rewritten
                };
                remember(original, rewritten);
            }
        }
    }
    return reverseMap;
}
// Cached URL from settings (loaded once, invalidated on settings change via clearCliproxyapiUrlCache)
let _cachedSettingsUrl = null;
const URL_CACHE_TTL_MS = 60_000;
function clearCliproxyapiUrlCache() {
    _cachedSettingsUrl = null;
}
// Pre-load settings URL at module init so the sync path has a cache hit.
// This runs once when the executor module is first imported.
(async ()=>{
    try {
        const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
        const settings = await getSettings();
        if (typeof settings.cliproxyapi_url === "string" && settings.cliproxyapi_url.trim()) {
            _cachedSettingsUrl = {
                url: settings.cliproxyapi_url.trim(),
                ts: Date.now()
            };
        }
    } catch  {}
})();
/**
 * Resolve CLIProxyAPI base URL. Priority:
 *   1. Settings table `cliproxyapi_url` (set via UI)
 *   2. Environment variables CLIPROXYAPI_HOST / CLIPROXYAPI_PORT
 *   3. Defaults (127.0.0.1:8317)
 */ async function resolveCliproxyapiBaseUrl() {
    // Check settings cache first
    if (_cachedSettingsUrl && Date.now() - _cachedSettingsUrl.ts < URL_CACHE_TTL_MS) {
        return _cachedSettingsUrl.url;
    }
    try {
        const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
        const settings = await getSettings();
        if (typeof settings.cliproxyapi_url === "string" && settings.cliproxyapi_url.trim()) {
            const url = settings.cliproxyapi_url.trim();
            _cachedSettingsUrl = {
                url,
                ts: Date.now()
            };
            return url;
        }
    } catch  {}
    const host = process.env.CLIPROXYAPI_HOST || DEFAULT_HOST;
    const port = parseInt(process.env.CLIPROXYAPI_PORT || String(DEFAULT_PORT), 10);
    const url = `http://${host}:${port}`;
    _cachedSettingsUrl = {
        url,
        ts: Date.now()
    };
    return url;
}
// Sync wrapper for backward compatibility (health checks, tests)
function resolveCliproxyapiBaseUrlSync() {
    if (_cachedSettingsUrl && Date.now() - _cachedSettingsUrl.ts < URL_CACHE_TTL_MS) {
        return _cachedSettingsUrl.url;
    }
    const host = process.env.CLIPROXYAPI_HOST || DEFAULT_HOST;
    const port = parseInt(process.env.CLIPROXYAPI_PORT || String(DEFAULT_PORT), 10);
    return `http://${host}:${port}`;
}
;
function isCliproxyapiDeepModeEnabled(providerSpecificData) {
    return providerSpecificData?.cliproxyapiMode === "claude-native";
}
class CliproxyapiExecutor extends __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseExecutor"] {
    upstreamBaseUrl;
    constructor(baseUrl){
        const effectiveBase = baseUrl ?? resolveCliproxyapiBaseUrlSync();
        super("cliproxyapi", {
            id: "cliproxyapi",
            baseUrl: effectiveBase + "/v1/chat/completions",
            headers: {
                "Content-Type": "application/json"
            }
        });
        this.upstreamBaseUrl = effectiveBase;
    }
    buildUrl(_model, _stream, _urlIndex = 0, _credentials = null) {
        // Default endpoint when called without body context (kept for back-compat).
        // execute() picks the right endpoint from the body shape; see selectEndpoint().
        return `${this.upstreamBaseUrl}/v1/chat/completions`;
    }
    /**
   * Returns true when the body matches the Anthropic Messages wire shape.
   *
   * chatCore detects target=claude when the request comes from a Claude-source
   * client (`/v1/messages`, Anthropic-version header, claude/* model). In that
   * case no openai translation is applied and the executor sees the original
   * Anthropic body: top-level `system` as an array of content blocks, and
   * `messages[].content` as arrays. Routing those bodies to CPA's
   * /v1/chat/completions causes CPA to emit OpenAI-style SSE chunks, which
   * Anthropic SDK clients (Capy, claude-cli, etc.) cannot parse — the result
   * looks like a 200 server-side with "0 chunks received" client-side.
   *
   * CPA exposes /v1/messages natively (claude executor with uTLS spoof,
   * billing header, CCH signing, etc.) and emits proper Anthropic SSE:
   * `event: message_start`, `content_block_delta`, etc.
   */ isAnthropicShape(body) {
        if (!body || typeof body !== "object") return false;
        const b = body;
        // Strong signal: top-level `system` field is unique to the Anthropic
        // Messages API. OpenAI Chat Completions encodes system as a role:"system"
        // entry inside messages[], not at body level. Accept both string and
        // array-of-content-blocks forms (Anthropic supports both per the docs).
        if (b.system !== undefined) return true;
        // Strong signal: top-level `thinking` field is Anthropic-only. OpenAI
        // uses `reasoning` / `reasoning_effort`. Even adaptive/raw Capy shapes
        // emit thinking, so this catches minimal Capy bodies (string content,
        // no system block) that would otherwise miss the messages[0].content
        // array check below.
        if (b.thinking !== undefined) return true;
        // Strong signal: top-level `metadata.user_id` is the CC wire-image
        // identifier; OpenAI request bodies don't carry it.
        if (b.metadata && typeof b.metadata === "object" && b.metadata.user_id !== undefined) return true;
        // Strong signal: messages[0].content is an array of Anthropic content blocks
        const msgs = b.messages;
        if (Array.isArray(msgs) && msgs.length > 0) {
            const first = msgs[0];
            if (Array.isArray(first?.content)) return true;
        }
        return false;
    }
    selectEndpoint(body) {
        return this.isAnthropicShape(body) ? "/v1/messages" : "/v1/chat/completions";
    }
    buildHeaders(credentials, stream = true) {
        const key = credentials?.apiKey || credentials?.accessToken;
        const headers = {
            "Content-Type": "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerPluginManifestUrl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderPluginManifestHeader"])()
        };
        if (key) {
            headers["Authorization"] = `Bearer ${key}`;
        }
        if (stream) {
            headers["Accept"] = "text/event-stream";
        }
        return headers;
    }
    transformRequest(model, body, _stream, _credentials) {
        if (!body || typeof body !== "object") return body;
        const transformed = {
            ...body
        };
        if (transformed.model !== model) {
            transformed.model = model;
        }
        // For Anthropic-shape bodies routed to CPA's /v1/messages, strip the
        // Capy/Anthropic-SDK premium extras that Anthropic gates with
        // "Extra usage is required" / "out of extra usage" (400). CPA does its
        // own Claude Code wire-image cloak (CCH, billing header, uTLS, metadata
        // user_id, system sentinel) downstream — but it forwards client extras
        // like output_config.effort=xhigh which trigger the extras-billing gate.
        //
        // Mirrors the runtime "Patch I2/I4" effect previously applied via patch.mjs.
        // Strips are no-op when fields are absent (OpenAI-shape passthrough).
        if (this.isAnthropicShape(transformed)) {
            delete transformed.output_config;
            delete transformed.context_management;
            delete transformed.client_info;
            delete transformed.prompt_cache_key;
            delete transformed.safety_identifier;
            delete transformed.metadata;
            // Conditional thinking strip: preserve Anthropic-valid shapes
            // ({type:"enabled"|"disabled", budget_tokens:N}) that applyThinkingBudget
            // already normalized. Strip non-Anthropic shapes (e.g. Capy's
            // {type:"adaptive", display:"summarized"}) which trigger Anthropic 400
            // "Extra usage required" / "out of extra usage". The `display` field is
            // a Capy-specific hint Anthropic doesn't accept.
            const thinking = transformed.thinking;
            if (thinking && typeof thinking === "object") {
                const t = thinking;
                const validType = t.type === "enabled" || t.type === "disabled";
                const hasValidBudget = typeof t.budget_tokens === "number" && t.budget_tokens >= 0;
                const hasInvalidExtras = "display" in t;
                if (!validType || !hasValidBudget || hasInvalidExtras) {
                    delete transformed.thinking;
                }
            }
            // Rewrite tool names matching Anthropic's reserved ^mcp_[^_] namespace.
            // Anthropic returns "out of extra usage" / "Extra usage required" 400
            // when a client-declared tool name collides with their server-side MCP
            // connector tools. Bisected character-by-character against the real
            // Anthropic API via CPA (uTLS spoof, Claude OAuth):
            //   mcp_call, mcp_query, mcp_x, mcp_test  → 400 (gate hit)
            //   Mcp_call, _mcp_call, mcp__call, mcp-call, mcpcall, my_mcp_call → 200
            // The "Mcp_" capitalization is the smallest stable rewrite that
            // preserves readability. The reverse map below is propagated to
            // chatCore via body._toolNameMap, which the SSE passthrough stream
            // uses (utils/stream.ts:restoreClaudePassthroughToolUseName) to
            // rewrite tool_use.name back to the client's original namespace on
            // the response side. Capy sees mcp_call back in tool_use blocks.
            // Sanitize invalid tool input_schemas (truncation placeholders such as
            // `enum: "[MaxDepth]"`, or index-keyed objects where arrays are required)
            // that Anthropic rejects with `tools.N.custom.input_schema: JSON schema is
            // invalid` — surfaced as the same misleading "out of extra usage" 400.
            if (Array.isArray(transformed.tools)) {
                transformed.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeClaudeToolSchemas"])(transformed.tools);
            }
            // Cloak third-party / blacklisted tool names (e.g. `mixture_of_agents`, or
            // a large enough set of recognizable snake_case agent tools) that Anthropic
            // fingerprints and refuses with the same placeholder. The `mcp_*` reserved
            // namespace is deferred to applyMcpToolNameRewrite below (its bisected
            // `Mcp_X` form) so the two reverse maps stay disjoint and single-hop.
            const cloakMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloakThirdPartyToolNames"])(transformed, {
                skip: (name)=>MCP_RESERVED_PREFIX_RE.test(name)
            });
            const mcpMap = applyMcpToolNameRewrite(transformed);
            const toolNameMap = new Map(cloakMap);
            for (const [alias, original] of mcpMap){
                toolNameMap.set(alias, original);
            }
            if (toolNameMap.size > 0) {
                // Non-enumerable: chatCore reads this for response-side tool-name
                // restoration; the wire body must never carry it (also stripped in execute()).
                Object.defineProperty(transformed, "_toolNameMap", {
                    value: toolNameMap,
                    enumerable: false,
                    configurable: true,
                    writable: true
                });
            }
        }
        return transformed;
    }
    async execute(input) {
        // Resolve URL dynamically so settings table cliproxyapi_url is respected.
        // Uses 60s cache to avoid DB reads on every request.
        const baseUrl = await resolveCliproxyapiBaseUrl();
        const endpoint = this.selectEndpoint(input.body);
        const url = `${baseUrl}${endpoint}`;
        const shape = endpoint === "/v1/messages" ? "anthropic" : "openai";
        const headers = this.buildHeaders(input.credentials, input.stream);
        const transformedBody = this.transformRequest(input.model, input.body, input.stream, input.credentials);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeUpstreamExtraHeaders"])(headers, input.upstreamExtraHeaders);
        const timeoutSignal = AbortSignal.timeout(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"]);
        const combinedSignal = input.signal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mergeAbortSignals"])(input.signal, timeoutSignal) : timeoutSignal;
        input.log?.info?.("CPA", `CLIProxyAPI → ${url} (model: ${input.model}, shape: ${shape})`);
        // _toolNameMap is an in-memory channel to chatCore for response-side
        // tool name restoration; never send it over the wire.
        const wireBody = transformedBody && typeof transformedBody === "object" ? JSON.stringify(transformedBody, (key, value)=>key === "_toolNameMap" ? undefined : value) : JSON.stringify(transformedBody);
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: wireBody,
            signal: combinedSignal
        });
        if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) {
            input.log?.warn?.("CPA", `CLIProxyAPI rate limited: ${response.status}`);
        }
        return {
            response,
            url,
            headers,
            transformedBody,
            transport: "cliproxyapi"
        };
    }
    /**
   * Health check — verifies CLIProxyAPI is reachable.
   *
   * CPA 6.x doesn't expose a /health endpoint; previously we hit /health
   * and got 404, which made the dashboard report "CLIProxyAPI not
   * detected" even when the service was up and successfully serving
   * /v1/messages. Probe /v1/models instead (returns 200 with the
   * advertised model list), which is the closest thing CPA has to a
   * liveness probe and works on every CPA version we've tested.
   */ async healthCheck() {
        const start = Date.now();
        try {
            const baseUrl = await resolveCliproxyapiBaseUrl();
            const res = await fetch(`${baseUrl}/v1/models`, {
                signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS)
            });
            return {
                ok: res.ok,
                latencyMs: Date.now() - start,
                ...!res.ok ? {
                    error: `HTTP ${res.status}`
                } : {}
            };
        } catch (err) {
            return {
                ok: false,
                latencyMs: Date.now() - start,
                error: err instanceof Error ? err.message : String(err)
            };
        }
    }
}
const __TURBOPACK__default__export__ = CliproxyapiExecutor;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/executors/antigravity/sseCollect.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addAntigravityTextualToolCall",
    ()=>addAntigravityTextualToolCall,
    "flushAntigravitySSEText",
    ()=>flushAntigravitySSEText,
    "parseAntigravityTextualToolCall",
    ()=>parseAntigravityTextualToolCall,
    "processAntigravitySSEPayload",
    ()=>processAntigravitySSEPayload,
    "processAntigravitySSEText",
    ()=>processAntigravitySSEText,
    "stripZeroWidth",
    ()=>stripZeroWidth
]);
// Pure SSE-payload -> collected-stream parsing for the Antigravity executor.
// Extracted verbatim from antigravity.ts (no host state, no fetch/auth).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [app-route] (ecmascript)");
;
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
function parseAntigravityTextualToolCall(text) {
    if (typeof text !== "string") return null;
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
function addAntigravityTextualToolCall(collected, parsed) {
    collected.toolCalls.push({
        id: `${parsed.name}-${Date.now()}-${collected.toolCalls.length}`,
        index: collected.toolCalls.length,
        type: "function",
        function: {
            name: parsed.name,
            arguments: JSON.stringify(parsed.args || {})
        }
    });
    collected.finishReason = "tool_calls";
}
function processAntigravitySSEPayload(payload, collected, log) {
    if (!payload || payload === "[DONE]") return;
    try {
        const parsed = JSON.parse(payload);
        const markdown = typeof parsed?.markdown === "string" ? parsed.markdown : typeof parsed?.response?.markdown === "string" ? parsed.response.markdown : null;
        if (markdown) {
            collected.textContent += markdown;
        }
        const candidate = parsed?.response?.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts){
                // Native function calls: Gemini 3.x responds to functionDeclarations with a
                // native functionCall part (usually carrying a thoughtSignature), NOT the
                // legacy "[Tool call: ...]" textual format. Dropping these left the collected
                // stream empty on every tools request → synthetic 502 "Provider returned
                // empty content" (Chatwit Captain Copilot / reply suggestion outage).
                if (part.functionCall && typeof part.functionCall.name === "string") {
                    const fc = part.functionCall;
                    collected.toolCalls.push({
                        id: typeof fc.id === "string" && fc.id.length > 0 ? fc.id : `${fc.name}-${Date.now()}-${collected.toolCalls.length}`,
                        index: collected.toolCalls.length,
                        type: "function",
                        function: {
                            name: fc.name,
                            arguments: JSON.stringify(stripZeroWidth(fc.args ?? {}))
                        }
                    });
                    collected.finishReason = "tool_calls";
                    continue;
                }
                if (typeof part.text === "string" && !part.thought && !part.thoughtSignature) {
                    const textualToolCall = parseAntigravityTextualToolCall(part.text);
                    if (textualToolCall) {
                        addAntigravityTextualToolCall(collected, textualToolCall);
                    } else {
                        collected.textContent += part.text;
                    }
                }
                // Native Gemini function calls. Non-streaming responses (and some
                // streaming ones) carry the tool call as `part.functionCall` rather than
                // the textual `[Tool call: ...]` markdown. Without this, a tool-only
                // response produced empty content and a 502 Provider error (#7037).
                if (part.functionCall && typeof part.functionCall.name === "string") {
                    addAntigravityTextualToolCall(collected, {
                        name: part.functionCall.name,
                        args: part.functionCall.args ?? {}
                    });
                }
            }
        }
        // Preserve a tool-call finish reason: once a native `part.functionCall`
        // (or textual tool call) has populated `toolCalls`, the candidate's own
        // finish reason (often STOP) must not clobber it (#7037 — a tool-only
        // response would otherwise report STOP and lose its tool-call signal).
        if (candidate?.finishReason && collected.toolCalls.length === 0) {
            collected.finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReasonString"])(String(candidate.finishReason).toLowerCase());
        }
        if (parsed?.response?.usageMetadata) {
            const um = parsed.response.usageMetadata;
            collected.usage = {
                prompt_tokens: um.promptTokenCount || 0,
                completion_tokens: um.candidatesTokenCount || 0,
                total_tokens: um.totalTokenCount || 0
            };
        }
        if (Array.isArray(parsed?.remainingCredits)) {
            collected.remainingCredits = parsed.remainingCredits;
        }
    } catch  {
        log?.debug?.("SSE_PARSE", `Skipping malformed SSE line: ${payload.slice(0, 80)}`);
    }
}
function processAntigravitySSEText(text, partialLine, collected, log) {
    partialLine.value += text;
    const lines = partialLine.value.split("\n");
    partialLine.value = lines.pop() || "";
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        processAntigravitySSEPayload(trimmed.slice(5).trim(), collected, log);
    }
}
function flushAntigravitySSEText(partialLine, collected, log) {
    const trimmed = partialLine.value.trim();
    partialLine.value = "";
    if (!trimmed.startsWith("data:")) return;
    processAntigravitySSEPayload(trimmed.slice(5).trim(), collected, log);
}
}),
"[project]/open-sse/executors/antigravity/streamingPassthrough.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure streaming pass-through helpers for the Antigravity executor (#7408):
// tap an upstream Gemini SSE Response through a credits-extraction
// TransformStream instead of buffering the whole body in the executor, so
// long-thinking models aren't killed by an artificial collection timeout.
// Extracted from antigravity.ts (no host state, no fetch/auth) -- the
// credit-balance cache itself stays in antigravity.ts; callers inject the
// update function below so the two modules don't import each other.
/** Shape of one entry in a Gemini `remainingCredits` SSE payload array. */ __turbopack_context__.s([
    "buildSsePassthroughResult",
    ()=>buildSsePassthroughResult,
    "createCreditsExtractionTransform",
    ()=>createCreditsExtractionTransform
]);
function asCreditRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function createCreditsExtractionTransform(accountId, onCreditsUpdate, bufferSize = 0) {
    let buffer = "";
    const decoder = new TextDecoder();
    return new TransformStream({
        transform (chunk, controller) {
            controller.enqueue(chunk);
            try {
                buffer += decoder.decode(chunk, {
                    stream: true
                });
                // Sliding-window cap: truncate after the last complete newline
                // in the discard region so SSE lines are never split mid-payload.
                if (bufferSize > 0 && buffer.length > bufferSize) {
                    const lastNewline = buffer.lastIndexOf("\n", buffer.length - bufferSize);
                    if (lastNewline !== -1) {
                        buffer = buffer.slice(lastNewline + 1);
                    } else {
                        // No newline in the discard region -- incomplete line, discard entirely.
                        buffer = "";
                    }
                }
            } catch  {
            /* decoding best-effort */ }
        },
        flush () {
            try {
                buffer += decoder.decode();
            } catch  {
            /* decoding best-effort */ }
            try {
                const lines = buffer.split("\n");
                for (const line of lines){
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const payload = trimmed.slice(5).trim();
                    if (!payload || payload === "[DONE]") continue;
                    try {
                        const parsed = JSON.parse(payload);
                        if (Array.isArray(parsed?.remainingCredits)) {
                            const googleCredit = parsed.remainingCredits.find((c)=>{
                                const credit = asCreditRecord(c);
                                return credit?.creditType === "GOOGLE_ONE_AI";
                            });
                            if (googleCredit) {
                                const balance = parseInt(String(googleCredit.creditAmount ?? ""), 10);
                                if (!isNaN(balance)) onCreditsUpdate(accountId, balance);
                            }
                        }
                    } catch  {
                    /* skip malformed lines */ }
                }
            } catch  {
            /* credits extraction is best-effort */ }
            buffer = "";
        }
    }, {
        highWaterMark: 16384
    }, {
        highWaterMark: 16384
    });
}
/** Cancel `body` when `signal` aborts, releasing the upstream connection. */ function cancelBodyOnAbort(body, signal) {
    signal.addEventListener("abort", ()=>{
        body.cancel().catch(()=>{});
    }, {
        once: true
    });
}
function buildSsePassthroughResult(body, upstream, accountId, onCreditsUpdate, url, outHeaders, transformedBody, signal) {
    // Client already disconnected — skip pipe
    if (signal?.aborted) {
        body.cancel().catch(()=>{});
        return {
            response: new Response(null, {
                status: 499
            }),
            url,
            headers: outHeaders,
            transformedBody: null
        };
    }
    // Cancel upstream body on client disconnect
    if (signal) cancelBodyOnAbort(body, signal);
    const tapped = body.pipeThrough(createCreditsExtractionTransform(accountId, onCreditsUpdate, 16 * 1024));
    return {
        response: new Response(tapped, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: upstream.headers
        }),
        url,
        headers: outHeaders,
        transformedBody
    };
}
}),
"[project]/open-sse/executors/antigravityUpstreamError.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAntigravityUpstreamError",
    ()=>buildAntigravityUpstreamError
]);
/**
 * Build a sanitized OpenAI-style error body for a non-ok Antigravity/agy upstream
 * response (#3229).
 *
 * The non-streaming executor path previously fed 4xx/5xx responses into the SSE
 * collector, which produced a synthetic `{"object":"chat.completion","content":""}`
 * success envelope — masking the real error. Route non-ok responses through
 * `buildErrorBody` instead so the client sees a proper error (hard rule #12).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
;
function buildAntigravityUpstreamError(status, statusText, rawBody) {
    let upstreamDetails;
    try {
        upstreamDetails = JSON.parse(rawBody);
    } catch  {
    // upstream body is not JSON (e.g. HTML error page) — omit structured details
    }
    const suffix = statusText ? `: ${statusText}` : "";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(status, `Antigravity upstream error (${status})${suffix}`, upstreamDetails);
}
}),
"[project]/open-sse/executors/antigravity/executeAttempt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildAntigravity429ErrorMessage",
    ()=>buildAntigravity429ErrorMessage,
    "buildFinalAntigravityResult",
    ()=>buildFinalAntigravityResult,
    "fetchAntigravityWithReadinessTimeout",
    ()=>fetchAntigravityWithReadinessTimeout,
    "finalizeAntigravityRequestBody",
    ()=>finalizeAntigravityRequestBody,
    "isAbortError",
    ()=>isAbortError,
    "isCreditsExhausted",
    ()=>isCreditsExhausted,
    "markCreditsExhausted",
    ()=>markCreditsExhausted,
    "sendAntigravityRequest",
    ()=>sendAntigravityRequest,
    "toSafeAntigravityLog",
    ()=>toSafeAntigravityLog,
    "tryCreditsRetry",
    ()=>tryCreditsRetry,
    "tryEmbedLongRetryAfter",
    ()=>tryEmbedLongRetryAfter
]);
// Pure-ish per-attempt request/result helpers for the Antigravity executor (#7408
// complexity-gate decomposition): building + sending one upstream request, and
// building the final non-streaming/streaming result. No host state of their own —
// callers inject `provider` and `onCreditsUpdate` so this module doesn't need to
// import the executor's credit-balance cache. Extracted from antigravity.ts
// (file-size cap), mirroring the existing antigravity/streamingPassthrough.ts and
// antigravity/sseCollect.ts submodule pattern.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/cliFingerprints.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravityUpstreamError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravityUpstreamError.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityCredits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$toolCloaking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/toolCloaking.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityClientProfile.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/providerRequestLogging.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$streamingPassthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravity/streamingPassthrough.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
const LONG_RETRY_THRESHOLD_MS = 60_000;
const CREDITS_EXHAUSTED_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours
/**
 * Per-account GOOGLE_ONE_AI credits-exhausted tracker.
 * Key: accountId (OAuth subject / email). Value: expiry timestamp.
 * When credits hit 0 we skip the credit retry for CREDITS_EXHAUSTED_TTL_MS.
 * Lives here (not antigravity.ts) so both this module's tryCreditsRetry and
 * antigravity.ts's tryResolveRetryFromErrorBody can share it via a single import
 * direction (antigravity.ts -> executeAttempt.ts), avoiding a circular import.
 */ const MAX_CREDITS_EXHAUSTED_ENTRIES = 50;
const creditsExhaustedUntil = new Map();
const _creditsExhaustedSweep = setInterval(()=>{
    const now = Date.now();
    for (const [key, until] of creditsExhaustedUntil){
        if (now >= until) creditsExhaustedUntil.delete(key);
    }
}, 60_000);
if (typeof _creditsExhaustedSweep === "object" && "unref" in _creditsExhaustedSweep) {
    _creditsExhaustedSweep.unref?.();
}
function isCreditsExhausted(accountId) {
    const until = creditsExhaustedUntil.get(accountId);
    if (!until) return false;
    if (Date.now() >= until) {
        creditsExhaustedUntil.delete(accountId);
        return false;
    }
    return true;
}
function markCreditsExhausted(accountId) {
    if (creditsExhaustedUntil.size >= MAX_CREDITS_EXHAUSTED_ENTRIES && !creditsExhaustedUntil.has(accountId)) {
        const now = Date.now();
        for (const [key, until] of creditsExhaustedUntil){
            if (now >= until) {
                creditsExhaustedUntil.delete(key);
            }
        }
        if (creditsExhaustedUntil.size >= MAX_CREDITS_EXHAUSTED_ENTRIES) {
            const oldestKey = creditsExhaustedUntil.keys().next().value;
            if (oldestKey !== undefined) creditsExhaustedUntil.delete(oldestKey);
        }
    }
    creditsExhaustedUntil.set(accountId, Date.now() + CREDITS_EXHAUSTED_TTL_MS);
}
class AntigravityPreResponseTimeoutError extends Error {
    code = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE"];
    status = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT;
    constructor(timeoutMs, url){
        super(`Antigravity upstream did not return response headers within ${timeoutMs}ms: ${url}`);
        this.name = "TimeoutError";
    }
}
function getAbortErrorCode(error) {
    if (!error || typeof error !== "object") return null;
    const value = error.code;
    return typeof value === "string" ? value : null;
}
function isAntigravityPreResponseTimeout(error) {
    return getAbortErrorCode(error) === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE"];
}
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError" || error instanceof Error && error.name === "AbortError";
}
async function fetchAntigravityWithReadinessTimeout(url, init, timeoutMs = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STREAM_READINESS_TIMEOUT_MS"]) {
    const boundedTimeoutMs = Math.max(0, Math.floor(timeoutMs));
    if (boundedTimeoutMs <= 0) {
        return fetch(url, init);
    }
    const timeoutController = new AbortController();
    let timeoutId = setTimeout(()=>{
        timeoutController.abort(new AntigravityPreResponseTimeoutError(boundedTimeoutMs, url));
    }, boundedTimeoutMs);
    const existingSignal = init.signal instanceof AbortSignal ? init.signal : null;
    const combinedSignal = existingSignal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mergeAbortSignals"])(existingSignal, timeoutController.signal) : timeoutController.signal;
    try {
        return await fetch(url, {
            ...init,
            signal: combinedSignal
        });
    } catch (error) {
        if (timeoutController.signal.aborted && isAntigravityPreResponseTimeout(timeoutController.signal.reason)) {
            throw timeoutController.signal.reason;
        }
        throw error;
    } finally{
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }
}
function noopLogFn() {}
function toSafeAntigravityLog(log) {
    return {
        debug: log?.debug ? log.debug.bind(log) : noopLogFn,
        info: log?.info ? log.info.bind(log) : noopLogFn,
        warn: log?.warn ? log.warn.bind(log) : noopLogFn,
        error: log?.error ? log.error.bind(log) : noopLogFn
    };
}
function buildAntigravity429ErrorMessage(errorJson) {
    const obj = errorJson;
    let errorMessage = String(obj?.error?.message || obj?.message || "");
    const details = obj?.error?.details;
    if (Array.isArray(details)) {
        for (const detail of details){
            const reason = detail?.reason;
            if (reason) errorMessage += ` ${reason}`;
        }
    }
    return errorMessage;
}
function getChunkedOrFixedBody(bodyStr, stream) {
    if (stream) {
        return new ReadableStream({
            async start (controller) {
                controller.enqueue(new TextEncoder().encode(bodyStr));
                controller.close();
            }
        }, {
            highWaterMark: 16384
        });
    }
    return bodyStr;
}
function cloneAntigravityRequestBody(body) {
    if (!body || typeof body !== "object") {
        return body;
    }
    let clone;
    try {
        clone = structuredClone(body);
    } catch  {
        clone = JSON.parse(JSON.stringify(body));
    }
    if (clone && typeof clone === "object") {
        delete clone._toolNameMap;
    }
    return clone;
}
function getToolNameMap(body) {
    return body._toolNameMap instanceof Map ? body._toolNameMap : null;
}
function attachToolNameMap(body, toolNameMap) {
    if (toolNameMap) {
        Object.defineProperty(body, "_toolNameMap", {
            value: toolNameMap,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    return body;
}
function serializeAntigravityRequest(provider, headers, body) {
    const serializedBody = cloneAntigravityRequestBody(body);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCliCompatEnabled"])(provider)) {
        return {
            headers,
            bodyString: JSON.stringify(serializedBody)
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyFingerprint"])(provider, {
        ...headers
    }, serializedBody);
}
function getRequestTargetModel(body) {
    const target = body.model;
    return typeof target === "string" && target.length > 0 ? target : "unknown";
}
function finalizeAntigravityRequestBody(transformed, useCreditsFirst, log) {
    const toolNameMap = getToolNameMap(transformed);
    let transformedBody = attachToolNameMap((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$toolCloaking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeAntigravityToolPayload"])(transformed), toolNameMap);
    // Credits-first: inject GOOGLE_ONE_AI upfront so we never try the normal
    // quota path. If credits are exhausted / disabled shouldUseCreditsFirst()
    // returns false and we fall back to the legacy retry-on-429 flow.
    if (useCreditsFirst) {
        transformedBody = attachToolNameMap((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["injectCreditsField"])(transformedBody), toolNameMap);
        log.debug("AG_CREDITS", "Credits-first enabled (ANTIGRAVITY_CREDITS=always)");
    }
    return transformedBody;
}
/** Debug-only dump of outgoing headers (mask Authorization) and envelope shape. */ function dumpAntigravityRequestDebug(finalHeaders, transformedBody, clientProfile, log) {
    const safeHeaders = {
        ...finalHeaders
    };
    if (safeHeaders["Authorization"]) safeHeaders["Authorization"] = "Bearer ***";
    log.debug("AG_REQUEST_HEADERS", JSON.stringify(safeHeaders));
    const envelope = transformedBody;
    const requestInner = envelope.request;
    log.debug("AG_REQUEST_ENVELOPE", JSON.stringify({
        fieldOrder: Object.keys(envelope),
        project: envelope.project,
        requestId: envelope.requestId,
        model: envelope.model,
        userAgent: envelope.userAgent,
        requestType: envelope.requestType,
        enabledCreditTypes: envelope.enabledCreditTypes,
        clientProfile,
        sessionId: requestInner?.sessionId,
        generationConfig: requestInner?.generationConfig
    }));
}
async function sendAntigravityRequest(provider, url, model, headers, transformedBody, credentials, stream, signal, log, retryAttempt) {
    const serializedRequest = serializeAntigravityRequest(provider, headers, transformedBody);
    let finalHeaders = serializedRequest.headers;
    const clientProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyAntigravityClientProfileHeaders"])(finalHeaders, credentials, transformedBody);
    log.debug("TELEMETRY", `[Antigravity] Execute - URL: ${url}, Model: ${model}, Target: ${getRequestTargetModel(transformedBody)}, RetryAttempt: ${retryAttempt}`);
    // Dump outgoing headers (mask Authorization) and envelope shape for debugging.
    // Gated behind an explicit typeof check (not just calling log.debug() unconditionally)
    // so the JSON.stringify work below is skipped entirely when debug logging is off.
    if (typeof log.debug === "function") {
        dumpAntigravityRequestDebug(finalHeaders, transformedBody, clientProfile, log);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentProviderBody"](url, finalHeaders, serializedRequest.bodyString, log);
    let response = await fetchAntigravityWithReadinessTimeout(url, {
        method: "POST",
        headers: finalHeaders,
        body: getChunkedOrFixedBody(serializedRequest.bodyString, stream),
        ...stream ? {
            duplex: "half"
        } : {},
        signal
    });
    if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN && finalHeaders["x-goog-user-project"]) {
        const retryHeaders = {
            ...finalHeaders
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeHeaderCaseInsensitive"])(retryHeaders, "x-goog-user-project");
        log.debug("RETRY", "403 with x-goog-user-project, retrying once without it");
        await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentProviderBody"](url, retryHeaders, serializedRequest.bodyString, log);
        response = await fetchAntigravityWithReadinessTimeout(url, {
            method: "POST",
            headers: retryHeaders,
            body: getChunkedOrFixedBody(serializedRequest.bodyString, stream),
            ...stream ? {
                duplex: "half"
            } : {},
            signal
        });
        finalHeaders = retryHeaders;
    }
    if (!response.ok) {
        log.warn("TELEMETRY", `[Antigravity] Error Response - URL: ${url}, Status: ${response.status}, Model: ${model}`);
    }
    return {
        response,
        finalHeaders
    };
}
async function tryCreditsRetry(provider, url, headers, transformedBody, credentials, stream, signal, log, accountId, onCreditsUpdate) {
    log.info("AG_CREDITS", "Retrying with Google One AI credits");
    const creditsBody = attachToolNameMap((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["injectCreditsField"])(transformedBody), getToolNameMap(transformedBody));
    const serializedCreditsRequest = serializeAntigravityRequest(provider, headers, creditsBody);
    const finalCreditsHeaders = serializedCreditsRequest.headers;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyAntigravityClientProfileHeaders"])(finalCreditsHeaders, credentials, creditsBody);
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentProviderBody"](url, finalCreditsHeaders, serializedCreditsRequest.bodyString, log);
        const creditsResp = await fetchAntigravityWithReadinessTimeout(url, {
            method: "POST",
            headers: finalCreditsHeaders,
            body: getChunkedOrFixedBody(serializedCreditsRequest.bodyString, stream),
            ...stream ? {
                duplex: "half"
            } : {},
            signal
        });
        if (creditsResp.ok || creditsResp.status !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) {
            log.info("AG_CREDITS", `Credits retry succeeded: ${creditsResp.status}`);
            if (!stream && creditsResp.body) {
                // Raw SSE pass-through + credits extraction (see
                // streamingPassthrough.ts); 499s early if the client
                // already disconnected instead of piping a cancelled body.
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$streamingPassthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSsePassthroughResult"])(creditsResp.body, creditsResp, accountId, onCreditsUpdate, url, finalCreditsHeaders, creditsBody, signal);
            }
            return {
                response: creditsResp,
                url,
                headers: finalCreditsHeaders,
                transformedBody: creditsBody
            };
        }
        // Credit retry also 429'd
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCreditsFailure"])(credentials?.accessToken || "");
        log.warn("AG_CREDITS", "Credits retry also 429'd");
        // Also mark in our legacy exhaustion map to avoid retrying other routes
        markCreditsExhausted(accountId);
        return null;
    } catch (creditsErr) {
        if (signal?.aborted || isAbortError(creditsErr)) {
            throw signal?.reason ?? creditsErr;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCreditsFailure"])(credentials?.accessToken || "");
        log.warn("AG_CREDITS", `Credits retry failed: ${creditsErr}`);
        return null;
    }
}
async function tryEmbedLongRetryAfter(response, retryMs, url, finalHeaders, transformedBody, log) {
    if (response.status !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED || !retryMs || retryMs <= LONG_RETRY_THRESHOLD_MS) {
        return null;
    }
    try {
        const respBody = await response.clone().text();
        let obj;
        try {
            obj = JSON.parse(respBody);
        } catch  {
            obj = {};
        }
        obj.retryAfterMs = retryMs;
        const modifiedBody = JSON.stringify(obj);
        const modifiedResponse = new Response(modifiedBody, {
            status: response.status,
            headers: response.headers
        });
        return {
            response: modifiedResponse,
            url,
            headers: finalHeaders,
            transformedBody
        };
    } catch (err) {
        log?.warn?.("RETRY", `Failed to embed retryAfterMs: ${err}`);
        return null;
    }
}
/** Build the sanitized JSON error result shared by the non-streaming and streaming paths. */ async function buildUpstreamErrorResult(response, url, finalHeaders, transformedBody) {
    const rawBody = await response.clone().text().catch(()=>"");
    const errorBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravityUpstreamError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAntigravityUpstreamError"])(response.status, response.statusText, rawBody);
    return {
        response: new Response(JSON.stringify(errorBody), {
            status: response.status,
            headers: {
                "Content-Type": "application/json"
            }
        }),
        url,
        headers: finalHeaders,
        transformedBody
    };
}
/**
 * For non-streaming clients, return the raw SSE stream with a
 * credits-extraction TransformStream.  chatCore's non-streaming path
 * (readNonStreamingResponseBody + parseNonStreamingSSEPayload with
 * Gemini format support) handles draining and conversion to JSON.
 * This replaces the previous collectStreamToResponse() approach which
 * had an artificial timeout (now the standard FETCH_BODY_TIMEOUT_MS
 * of 10 min applies).
 */ async function buildNonStreamingExecuteOnceResult(response, url, finalHeaders, transformedBody, accountId, signal, onCreditsUpdate) {
    // #3229: surface a real upstream error instead of masking a 4xx/5xx as an
    // empty `chat.completion` envelope.
    if (!response.ok) {
        return buildUpstreamErrorResult(response, url, finalHeaders, transformedBody);
    }
    if (response.body) {
        // Raw SSE pass-through + credits extraction (see
        // streamingPassthrough.ts); 499s early if the client already
        // disconnected instead of piping a cancelled body.
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$streamingPassthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSsePassthroughResult"])(response.body, response, accountId, onCreditsUpdate, url, finalHeaders, transformedBody, signal);
    }
    // No body -- return as-is
    return {
        response,
        url,
        headers: finalHeaders,
        transformedBody
    };
}
/**
 * Streaming path: wrap the response body in a pass-through TransformStream
 * that extracts remainingCredits from the final SSE chunk(s) without
 * consuming the stream. The client receives the unmodified SSE data.
 *
 * #2461: a non-ok upstream response (e.g. 403) must never be piped through the
 * streaming pass-through below as if it were an SSE body. Google occasionally
 * returns non-UTF8/binary error bodies (observed: gzip-magic-byte payloads) for
 * 403s on this endpoint; reading/forwarding those raw bytes corrupts the
 * client-visible error message. Mirror the non-streaming branch above and build
 * a sanitized JSON error via buildAntigravityUpstreamError (hard rule #12)
 * instead of streaming unknown bytes straight through.
 */ async function buildStreamingExecuteOnceResult(response, url, finalHeaders, transformedBody, accountId, signal, onCreditsUpdate) {
    if (!response.ok) {
        return buildUpstreamErrorResult(response, url, finalHeaders, transformedBody);
    }
    if (response.body) {
        // If the downstream client aborts, cancel the upstream fetch body immediately
        // to release the socket back to the Undici agent pool and prevent memory leaks.
        if (signal) {
            const abortHandler = ()=>{
                try {
                    response.body?.cancel().catch(()=>{});
                } catch (_) {}
            };
            if (signal.aborted) {
                abortHandler();
            } else {
                signal.addEventListener("abort", abortHandler, {
                    once: true
                });
            }
        }
        const passThrough = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$streamingPassthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCreditsExtractionTransform"])(accountId, onCreditsUpdate, 16 * 1024 // 16KB sliding-window cap to prevent OOM
        );
        const tappedBody = response.body.pipeThrough(passThrough);
        const tappedResponse = new Response(tappedBody, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
        return {
            response: tappedResponse,
            url,
            headers: finalHeaders,
            transformedBody
        };
    }
    return {
        response,
        url,
        headers: finalHeaders,
        transformedBody
    };
}
async function buildFinalAntigravityResult(stream, response, url, finalHeaders, transformedBody, accountId, signal, onCreditsUpdate) {
    if (!stream) {
        return buildNonStreamingExecuteOnceResult(response, url, finalHeaders, transformedBody, accountId, signal, onCreditsUpdate);
    }
    return buildStreamingExecuteOnceResult(response, url, finalHeaders, transformedBody, accountId, signal, onCreditsUpdate);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/executors/antigravity/proFallbackChain.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure Pro-family fallback-chain decision helpers for the Antigravity executor (#7290):
// decide what execute()'s per-candidate loop does after executeOnce() throws or
// returns a 400, without depending on executor instance state (no `this`).
// Extracted from antigravity.ts (file-size cap) -- mirrors the existing
// antigravity/sseCollect.ts submodule pattern.
__turbopack_context__.s([
    "handleAntigravityFallback400",
    ()=>handleAntigravityFallback400,
    "handleAntigravityFallbackChainError",
    ()=>handleAntigravityFallbackChainError,
    "isAntigravityAbortError",
    ()=>isAntigravityAbortError
]);
function isAntigravityAbortError(input, error) {
    return Boolean(input.signal?.aborted || error instanceof DOMException && error.name === "AbortError" || error instanceof Error && error.name === "AbortError");
}
function handleAntigravityFallbackChainError(input, error, candidate, i, chain, firstResult, resolvedUpstreamId) {
    // Abort signal (user disconnect) — propagate immediately, do not retry.
    if (isAntigravityAbortError(input, error)) {
        return {
            action: "throw",
            error
        };
    }
    if (i < chain.length - 1) {
        input.log?.debug?.("AG_PRO_FALLBACK", `Exception on "${candidate}" (${error instanceof Error ? error.message : String(error)}) -- retrying with next Pro candidate "${chain[i + 1]}"`);
        return {
            action: "continue"
        };
    }
    // Last candidate also threw -- return original 400 if available, otherwise throw.
    if (firstResult) {
        input.log?.warn?.("AG_PRO_FALLBACK", `Pro fallback chain exhausted (last candidate threw, but first candidate returned 400) for "${resolvedUpstreamId}". Returning original 400.`);
        return {
            action: "return",
            result: firstResult
        };
    }
    return {
        action: "throw",
        error: new Error(`Pro fallback chain exhausted (all ${chain.length} candidates failed). Last error: ${error instanceof Error ? error.message : String(error)}`)
    };
}
function handleAntigravityFallback400(input, result, firstResult, candidate, i, chain, resolvedUpstreamId) {
    const isLast = i === chain.length - 1;
    if (!isLast) {
        input.log?.debug?.("AG_PRO_FALLBACK", `400 on "${candidate}" — retrying with next Pro candidate "${chain[i + 1]}"`);
        return {
            action: "continue"
        };
    }
    // Chain exhausted: surface the FIRST candidate's sanitized 400.
    input.log?.warn?.("AG_PRO_FALLBACK", `Pro fallback chain exhausted (all ${chain.length} candidates 400'd) for "${resolvedUpstreamId}"`);
    return {
        action: "return",
        result: firstResult ?? result
    };
}
}),
"[project]/open-sse/executors/antigravity.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AntigravityExecutor",
    ()=>AntigravityExecutor,
    "MAX_ANTIGRAVITY_OUTPUT_TOKENS",
    ()=>MAX_ANTIGRAVITY_OUTPUT_TOKENS,
    "__test_applyAntigravityGenerationDefaults",
    ()=>__test_applyAntigravityGenerationDefaults,
    "__test_stripTrailingAntigravityAssistantTurn",
    ()=>__test_stripTrailingAntigravityAssistantTurn,
    "createCreditsExtractionTransform",
    ()=>createCreditsExtractionTransform,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getAntigravityRemainingCredits",
    ()=>getAntigravityRemainingCredits,
    "markConnectionQuotaExhausted",
    ()=>markConnectionQuotaExhausted,
    "updateAntigravityRemainingCredits",
    ()=>updateAntigravityRemainingCredits
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaderScrub$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaderScrub.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravity429Engine.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityCredits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/creditBalance.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers/rateLimit.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$mitmAlias$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/mitmAlias.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityProjectBootstrap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityProjectPersist.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityModelAliases.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$cloudCodeThinking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/cloudCodeThinking.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/geminiToolsSanitizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$sseCollect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravity/sseCollect.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$streamingPassthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravity/streamingPassthrough.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravity/executeAttempt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$proFallbackChain$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravity/proFallbackChain.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityClientProfile.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityIdentity.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const MAX_RETRY_AFTER_MS = 60_000;
const LONG_RETRY_THRESHOLD_MS = 60_000;
// Cap for transient 5xx backoff — shorter than the 429 cap to avoid long stalls on
// infra hiccups ("Agent execution terminated", "high traffic", capacity errors).
const ANTIGRAVITY_TRANSIENT_RETRY_MAX_MS = 15_000;
// Bounded per-URL auto-retry count for both the Retry-After-driven short retry and
// the no-Retry-After transient/429 backoff loop in executeOnce().
const MAX_AUTO_RETRIES = 3;
const ANTIGRAVITY_TRANSIENT_ERROR_PATTERNS = [
    /high\s+traffic/i,
    /agent\s+(execution\s+)?terminated\s+due\s+to\s+error/i,
    /capacity/i,
    /temporarily\s+unavailable/i,
    /timeout/i,
    /stream\s+(ended|closed|terminated|interrupted)/i,
    /empty\s+response/i
];
const ANTIGRAVITY_TRANSIENT_STATUSES = new Set([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVER_ERROR,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT
]);
const ANTIGRAVITY_UNSUPPORTED_SAFETY_CATEGORIES = new Set([
    "HARM_CATEGORY_CIVIC_INTEGRITY"
]);
const MAX_CREDIT_BALANCE_ENTRIES = 50;
const CREDIT_BALANCE_TTL_MS = 5 * 60 * 1000;
const creditBalanceCache = new Map();
let creditCacheHydrated = false;
function hydrateCreditCacheFromDb() {
    if (creditCacheHydrated) return;
    creditCacheHydrated = true;
    try {
        const persisted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllPersistedCreditBalances"])();
        for (const [accountId, balance] of persisted){
            if (!creditBalanceCache.has(accountId)) {
                creditBalanceCache.set(accountId, {
                    balance,
                    updatedAt: Date.now()
                });
            }
        }
    } catch  {}
}
function evictStaleCreditBalanceEntries() {
    const now = Date.now();
    for (const [key, entry] of creditBalanceCache){
        if (now - entry.updatedAt > CREDIT_BALANCE_TTL_MS) {
            creditBalanceCache.delete(key);
        }
    }
    while(creditBalanceCache.size > MAX_CREDIT_BALANCE_ENTRIES){
        const oldestKey = creditBalanceCache.keys().next().value;
        if (oldestKey !== undefined) creditBalanceCache.delete(oldestKey);
        else break;
    }
}
const _creditBalanceSweep = setInterval(evictStaleCreditBalanceEntries, 60_000);
if (typeof _creditBalanceSweep === "object" && "unref" in _creditBalanceSweep) {
    _creditBalanceSweep.unref?.();
}
function getAntigravityRemainingCredits(accountId) {
    hydrateCreditCacheFromDb();
    const entry = creditBalanceCache.get(accountId);
    if (!entry) return null;
    if (Date.now() - entry.updatedAt > CREDIT_BALANCE_TTL_MS) {
        creditBalanceCache.delete(accountId);
        return null;
    }
    return entry.balance;
}
function updateAntigravityRemainingCredits(accountId, balance) {
    if (creditBalanceCache.size >= MAX_CREDIT_BALANCE_ENTRIES && !creditBalanceCache.has(accountId)) {
        const oldestKey = creditBalanceCache.keys().next().value;
        if (oldestKey !== undefined) creditBalanceCache.delete(oldestKey);
    }
    creditBalanceCache.set(accountId, {
        balance,
        updatedAt: Date.now()
    });
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistCreditBalance"])(accountId, balance);
    } catch  {}
}
function createCreditsExtractionTransform(accountId, bufferSize = 0) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$streamingPassthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCreditsExtractionTransform"])(accountId, updateAntigravityRemainingCredits, bufferSize);
}
function markConnectionQuotaExhausted(connectionId, retryAfterMs) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setConnectionRateLimitUntil"])(connectionId, Date.now() + retryAfterMs);
    } catch  {
    // DB write failure must never crash the request path
    }
}
/**
 * Accumulate one Antigravity SSE `data:` payload into `collected`. Exported for unit
 * tests (the markdown / candidate-parts extraction branches). @internal
 */ /**
 * Strip provider prefixes (e.g. "antigravity/model" → "model").
 * Ensures the model name sent to the upstream API never contains a routing prefix.
 *
 * `modelIdOverride` (#3786): when the per-request Pro-family fallback chain forces a
 * specific upstream id, pass it here. It is an ALREADY-RESOLVED upstream id, so it bypasses
 * the MITM/static alias resolution and is used verbatim (after prefix stripping).
 */ async function cleanModelName(model, modelIdOverride) {
    if (modelIdOverride) {
        return modelIdOverride.includes("/") ? modelIdOverride.split("/").pop() : modelIdOverride;
    }
    if (!model) return model;
    const stripped = model.includes("/") ? model.split("/").pop() : model;
    let clean = stripped;
    // 1. Check dynamic MITM aliases first (authoritative after first sync).
    //    Built during model sync — contains ONLY currently-available models.
    //    Obsolete/removed models are automatically excluded.
    try {
        const mitmAliases = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$mitmAlias$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMitmAlias"])("antigravity");
        if (mitmAliases && typeof mitmAliases === "object") {
            const aliases = mitmAliases;
            const raw = aliases[stripped];
            // Only honor string aliases; corrupted/non-string DB values fall through
            // to the static alias resolution below (never return undefined here).
            if (typeof raw === "string" && raw) {
                // Strip the "antigravity/" prefix if present; use the raw model ID otherwise.
                const PREFIX = "antigravity/";
                clean = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length) : raw;
            }
        }
    } catch  {
    // DB not available (build phase, transient error) — fall through to static aliases
    }
    // 2. Fall back to static aliases if MITM didn't resolve
    if (clean === stripped) {
        clean = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAntigravityModelId"])(clean);
    }
    return clean;
}
const MAX_ANTIGRAVITY_OUTPUT_TOKENS = 16384;
function applyAntigravityGenerationDefaults(request) {
    const generationConfig = request.generationConfig && typeof request.generationConfig === "object" ? request.generationConfig : {};
    if (generationConfig.topK === undefined) {
        generationConfig.topK = 40;
    }
    if (generationConfig.topP === undefined) {
        generationConfig.topP = 1.0;
    }
    const thinkingConfig = generationConfig.thinkingConfig && typeof generationConfig.thinkingConfig === "object" ? generationConfig.thinkingConfig : null;
    const thinkingBudget = Number(thinkingConfig?.thinkingBudget);
    const maxOutputTokens = Number(generationConfig.maxOutputTokens);
    if (Number.isFinite(thinkingBudget) && thinkingBudget > 0 && (!Number.isFinite(maxOutputTokens) || maxOutputTokens <= thinkingBudget)) {
        generationConfig.maxOutputTokens = Math.floor(thinkingBudget) + 1;
    }
    // Final cap (after the thinkingBudget bump may have raised the value):
    // GitHub Copilot Agent envelopes commonly carry oversized maxOutputTokens
    // (32K–65K) that trigger upstream 400 "Invalid Argument". Clamp silently
    // — the cap is provider-driven, not client-driven, and only matters when
    // the request would otherwise be rejected outright.
    const finalMax = Number(generationConfig.maxOutputTokens);
    if (Number.isFinite(finalMax) && finalMax > MAX_ANTIGRAVITY_OUTPUT_TOKENS) {
        generationConfig.maxOutputTokens = MAX_ANTIGRAVITY_OUTPUT_TOKENS;
    }
    request.generationConfig = generationConfig;
}
const __test_applyAntigravityGenerationDefaults = applyAntigravityGenerationDefaults;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function getAntigravitySafetySettings(safetySettings) {
    if (!Array.isArray(safetySettings)) return undefined;
    return safetySettings.filter((setting)=>{
        const category = asRecord(setting)?.category;
        return typeof category !== "string" || !ANTIGRAVITY_UNSUPPORTED_SAFETY_CATEGORIES.has(category);
    });
}
function sanitizeAntigravityGeminiRequest(request) {
    const clean = {};
    if (Array.isArray(request.contents)) {
        clean.contents = request.contents;
    }
    if (asRecord(request.systemInstruction)) {
        clean.systemInstruction = request.systemInstruction;
    }
    clean.generationConfig = asRecord(request.generationConfig) ? {
        ...request.generationConfig
    } : {};
    const geminiTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildGeminiTools"])(request.tools);
    if (geminiTools) {
        clean.tools = geminiTools;
        clean.toolConfig = {
            functionCallingConfig: {
                mode: "VALIDATED"
            }
        };
    } else if (asRecord(request.toolConfig)) {
        clean.toolConfig = request.toolConfig;
    }
    if (typeof request.sessionId === "string") {
        clean.sessionId = request.sessionId;
    }
    // Preserve only caller-supplied safetySettings through the Claude-path whitelist.
    // Missing settings stay absent so OmniRoute does not silently weaken upstream safety.
    if (Array.isArray(request.safetySettings)) {
        clean.safetySettings = request.safetySettings;
    }
    return clean;
}
/**
 * Ported from decolua/9router#2321 (anki1kr): Vertex AI (used by Antigravity for
 * Claude-branded models) rejects a conversation ending on an assistant turn —
 * "This model does not support assistant message prefill" — so the request must
 * always end on a user turn. Upstream patched `openaiToClaudeRequestForAntigravity`
 * (dead code here, zero callers — see `open-sse/translator/request/openai-to-claude.ts`);
 * this relocates the same strip to the LIVE Antigravity dispatch path, where Claude
 * requests are converted to Gemini `contents` (assistant role is `"model"`, not
 * `"assistant"`). Mirrors the trailing-strip pop-loop already used for Mistral
 * (#3396), Copilot (#5802), and the CC-bridge in `claudeCodeCompatible.ts`.
 *
 * Scoped strictly to the Claude path by the caller (`isClaude` branch only) — native
 * Gemini models via Antigravity must be unaffected, since Vertex-Claude is the only
 * documented rejection surface.
 *
 * Guard: never strip `contents` down to empty — an empty `contents` array is itself
 * an invalid request, so at least one entry (even a lone trailing "model" turn) is
 * always preserved.
 */ function stripTrailingAntigravityAssistantTurn(request) {
    const contents = request.contents;
    if (!Array.isArray(contents) || contents.length === 0) {
        return request;
    }
    while(contents.length > 1 && contents[contents.length - 1]?.role === "model"){
        contents.pop();
    }
    return request;
}
const __test_stripTrailingAntigravityAssistantTurn = stripTrailingAntigravityAssistantTurn;
class AntigravityExecutor extends __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseExecutor"] {
    constructor(){
        super("antigravity", __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].antigravity);
    }
    buildUrl(model, _stream, urlIndex = 0) {
        void model;
        const baseUrls = this.getBaseUrls();
        const baseUrl = baseUrls[urlIndex] || baseUrls[0];
        // Always use streaming endpoint — the non-streaming `generateContent` causes
        // upstream 400 errors for some models (e.g. gpt-oss-120b-medium) because the
        // Cloud Code API internally converts to OpenAI format and injects
        // stream_options without setting stream=true.  chatCore already handles
        // SSE→JSON conversion for non-streaming client requests.
        return `${baseUrl}/v1internal:streamGenerateContent?alt=sse`;
    }
    buildHeaders(credentials, _stream = true) {
        const clientProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])(credentials);
        const raw = {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, credentials.accessToken),
            Accept: "text/event-stream"
        };
        // Scrub proxy/fingerprint headers that reveal non-native traffic
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaderScrub$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scrubProxyAndFingerprintHeaders"])(raw);
    }
    async transformRequest(model, body, _stream, credentials, modelIdOverride, signal) {
        // Project ID resolution: prefer OAuth-stored projectId over incoming body.project
        // to avoid stale/wrong client-side values causing 404/403 from Cloud Code endpoints.
        // Opt-in escape hatch: set OMNIROUTER_ALLOW_BODY_PROJECT_OVERRIDE=1.
        const normalizeProjectId = (value)=>{
            if (typeof value !== "string") return null;
            const trimmedValue = value.trim();
            return trimmedValue ? trimmedValue : null;
        };
        const bodyRecord = asRecord(body) ?? {};
        const bodyProjectId = normalizeProjectId(bodyRecord.project);
        const credentialsProjectId = normalizeProjectId(credentials?.projectId);
        const providerSpecificProjectId = normalizeProjectId(credentials?.providerSpecificData?.projectId);
        const allowBodyProjectOverride = process.env.OMNIROUTE_ALLOW_BODY_PROJECT_OVERRIDE === "1";
        // Default: prefer OAuth-stored projectId over incoming body.project to avoid
        // stale/wrong client-side values causing 404/403 from Cloud Code endpoints.
        // Opt-in escape hatch: set OMNIROUTE_ALLOW_BODY_PROJECT_OVERRIDE=1.
        let projectId = allowBodyProjectOverride && bodyProjectId ? bodyProjectId : credentialsProjectId || providerSpecificProjectId || bodyProjectId;
        // Auto-discover a missing projectId via loadCodeAssist before failing (#2334/#2541).
        // A freshly re-added Antigravity account can have an empty stored projectId even when
        // its Google account already owns a Cloud Code project (the OAuth-time loadCodeAssist
        // returned empty/transiently failed). Mirror the Cloud Code bootstrap to recover it
        // here — the helper memoizes per access-token, so this is a one-time round-trip.
        if (!projectId && credentials?.accessToken) {
            const discovered = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureAntigravityProjectAssigned"])(credentials.accessToken, fetch, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])(credentials), signal);
            if (discovered) {
                projectId = discovered;
                // #8491: persist the recovered id so it survives the next token refresh
                // or process restart instead of being silently rediscovered every time.
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistDiscoveredAntigravityProjectId"])(credentials.connectionId, discovered, credentials.providerSpecificData);
            }
        }
        if (!projectId) {
            // (#489) Return a structured error instead of throwing — gives the client a clear signal
            // to show a "Reconnect OAuth" prompt rather than an opaque "Internal Server Error".
            const errorMsg = "Missing Google projectId for Antigravity account. Auto-discovery via loadCodeAssist " + "found no Cloud Code project. Please reconnect OAuth in Providers → Antigravity (and " + "ensure the Google account has completed Gemini Code Assist onboarding).";
            const errorBody = {
                error: {
                    message: errorMsg,
                    type: "oauth_missing_project_id",
                    code: "missing_project_id"
                }
            };
            const resp = new Response(JSON.stringify(errorBody), {
                status: 422,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            // Returning a Response object signals the executor to stop and forward it
            return resp;
        }
        // Validate projectId is non-empty and not just whitespace
        const trimmedProjectId = typeof projectId === "string" ? projectId.trim() : projectId;
        if (!trimmedProjectId) {
            const resp = new Response(JSON.stringify({
                error: {
                    message: "Invalid (empty) Google projectId for Antigravity account. " + "Please reconnect OAuth in Providers → Antigravity.",
                    type: "oauth_missing_project_id",
                    code: "missing_project_id"
                }
            }), {
                status: 422,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            return resp;
        }
        const upstreamModel = await cleanModelName(model, modelIdOverride);
        const isClaude = upstreamModel.toLowerCase().includes("claude");
        const baseBody = bodyRecord;
        const normalizedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$cloudCodeThinking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldStripCloudCodeThinking"])(this.provider, upstreamModel) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$cloudCodeThinking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripCloudCodeThinkingConfig"])(baseBody) : baseBody;
        const normalizedRequest = asRecord(normalizedBody.request);
        const rawContents = Array.isArray(normalizedRequest?.contents) ? normalizedRequest.contents : [];
        // Fix contents for Gemini-compatible Cloud Code requests via Antigravity.
        // Claude-branded Antigravity models use the same streamGenerateContent schema.
        const normalizedContents = rawContents.map((content)=>{
            const c = content;
            let role = typeof c.role === "string" ? c.role : "user";
            if (c.parts?.some((p)=>p.functionResponse)) {
                role = "user";
            }
            const hasFunctionCall = c.parts?.some((p)=>p.functionCall) || false;
            const parts = c.parts?.filter((p)=>{
                if (typeof p.text === "string" && p.text === "") return false;
                if (p.functionCall && !p.functionCall.name) return false;
                // Only strip if it's NOT our bypass sentinel.
                // Antigravity models (like Gemini) need this sentinel to bypass 400 errors.
                return !p.thought && (hasFunctionCall || !p.thoughtSignature || p.thoughtSignature === "skip_thought_signature_validator");
            }) || [];
            return {
                ...c,
                role,
                parts
            };
        }) || [];
        const contents = [];
        for (const c of normalizedContents){
            if (!Array.isArray(c.parts) || c.parts.length === 0) continue;
            if (contents.length > 0 && contents[contents.length - 1].role === c.role) {
                contents[contents.length - 1].parts.push(...c.parts);
            } else {
                contents.push(c);
            }
        }
        const safetySettings = getAntigravitySafetySettings(normalizedRequest?.safetySettings);
        const rawTransformedRequest = {
            ...normalizedRequest,
            ...contents.length > 0 && {
                contents
            },
            sessionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravitySessionId"])(credentials, typeof normalizedRequest?.sessionId === "string" ? normalizedRequest.sessionId : undefined),
            ...safetySettings !== undefined && {
                safetySettings
            },
            toolConfig: Array.isArray(normalizedRequest?.tools) && normalizedRequest.tools.length > 0 ? {
                functionCallingConfig: {
                    mode: "VALIDATED"
                }
            } : normalizedRequest?.toolConfig
        };
        const transformedRequest = isClaude ? stripTrailingAntigravityAssistantTurn(sanitizeAntigravityGeminiRequest(rawTransformedRequest)) : rawTransformedRequest;
        applyAntigravityGenerationDefaults(transformedRequest);
        const { project: _project, model: _model, userAgent: _userAgent, requestType: _requestType, requestId: _requestId, request: _request, // #1944: output_config (and the legacy output_format) are Anthropic/Claude-Code-only
        // fields. Google's Cloud Code envelope rejects unknown top-level fields with a 400
        // ("Invalid JSON payload received. Unknown name \"output_config\""), which broke every
        // Claude model served via Antigravity. Drop them so they never reach the envelope.
        output_config: _outputConfig, output_format: _outputFormat, // #1926: the unified thinking adapter can also set Claude/OpenAI-native thinking fields
        // at the body root. Google rejects them with `400 Bad input: oneOf at '/' not met`
        // (or `Unknown name "thinking"`), breaking every reasoning/thinking model served via
        // Antigravity (e.g. claude-opus-4-x-thinking). Strip the whole thinking family too.
        thinking: _thinking, reasoning_effort: _reasoningEffort, reasoning: _reasoning, enable_thinking: _enableThinking, thinking_budget: _thinkingBudget, enabledCreditTypes: _enabledCreditTypes, ...passthroughFields } = normalizedBody;
        const requestType = _requestType === "image_gen" ? "image_gen" : "agent";
        const envelope = {
            project: projectId,
            requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateAntigravityRequestId"])(),
            request: transformedRequest,
            model: upstreamModel,
            userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityEnvelopeUserAgent"])(credentials),
            requestType,
            ...passthroughFields
        };
        return envelope;
    }
    async refreshCredentials(credentials, log) {
        if (!credentials.refreshToken) return null;
        try {
            const bodyParams = {
                grant_type: "refresh_token",
                refresh_token: credentials.refreshToken
            };
            // Only include non-empty client_id/client_secret — Google OAuth rejects
            // empty params which raw URLSearchParams produces (buildFormParams semantics).
            if (this.config.clientId) bodyParams.client_id = this.config.clientId;
            if (this.config.clientSecret) bodyParams.client_secret = this.config.clientSecret;
            const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].google.token, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                    "User-Agent": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityOAuthUserAgent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])(credentials))
                },
                body: new URLSearchParams(bodyParams)
            });
            if (!response.ok) {
                // Detect unrecoverable token (invalid_grant = revoked / expired refresh token)
                try {
                    const errorBody = await response.json();
                    if (errorBody.error === "invalid_grant") {
                        log?.error?.("TOKEN", "Antigravity refresh token revoked. Re-authentication required.");
                        return {
                            error: "unrecoverable_refresh_error"
                        };
                    }
                } catch  {
                // not JSON — fall through
                }
                return null;
            }
            const tokens = await response.json();
            log?.info?.("TOKEN", "Antigravity refreshed");
            const newAccessToken = typeof tokens.access_token === "string" ? tokens.access_token : undefined;
            // Discover projectId if the stored value is empty. The initial OAuth exchange
            // may have failed to populate it (network timeout, account not yet onboarded to
            // Gemini Code Assist). The runtime transformRequest path already does this, but
            // a proactive discovery here prevents 422 errors on the next request when the
            // per-token memoization cache is invalidated by the new access token.
            let projectId = credentials.projectId?.trim() || "";
            if (!projectId && newAccessToken) {
                try {
                    const discovered = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureAntigravityProjectAssigned"])(newAccessToken, fetch, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])(credentials), AbortSignal.timeout(8_000));
                    if (discovered) {
                        projectId = discovered;
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistDiscoveredAntigravityProjectId"])(credentials.connectionId, discovered, credentials.providerSpecificData);
                        const okMsg = `Antigravity projectId discovered during refresh: ${discovered}`;
                        log?.info?.("TOKEN", okMsg);
                    }
                } catch (discoveryError) {
                    // Best-effort: if discovery fails, the runtime path will retry on next request.
                    const msg = discoveryError instanceof Error ? discoveryError.message : String(discoveryError);
                    log?.warn?.("TOKEN", `Antigravity projectId discovery during refresh failed: ${msg}`);
                }
            }
            return {
                accessToken: newAccessToken,
                refreshToken: typeof tokens.refresh_token === "string" && tokens.refresh_token ? tokens.refresh_token : credentials.refreshToken,
                expiresIn: typeof tokens.expires_in === "number" ? tokens.expires_in : undefined,
                projectId,
                // Preserve providerSpecificData so a projectId stored there survives the refresh
                // (the onCredentialsRefreshed DB write) instead of being dropped → 422 (#2480).
                providerSpecificData: credentials.providerSpecificData
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            log?.error?.("TOKEN", `Antigravity refresh error: ${message}`);
            return null;
        }
    }
    generateSessionId() {
        return `-${parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % 9_000_000_000_000_000_000}`;
    }
    parseRetryHeaders(headers) {
        if (!headers?.get) return null;
        const retryAfter = headers.get("retry-after");
        if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            if (!isNaN(seconds) && seconds > 0) return seconds * 1000;
            const date = new Date(retryAfter);
            if (!isNaN(date.getTime())) {
                const diff = date.getTime() - Date.now();
                return diff > 0 ? diff : null;
            }
        }
        const resetAfter = headers.get("x-ratelimit-reset-after");
        if (resetAfter) {
            const seconds = parseInt(resetAfter, 10);
            if (!isNaN(seconds) && seconds > 0) return seconds * 1000;
        }
        const resetTimestamp = headers.get("x-ratelimit-reset");
        if (resetTimestamp) {
            const ts = parseInt(resetTimestamp, 10) * 1000;
            const diff = ts - Date.now();
            return diff > 0 ? diff : null;
        }
        return null;
    }
    // Parse retry time from Antigravity error message body
    // Format: "Your quota will reset after 2h7m23s" or "Resets in 160h27m24s" or
    // "1h30m" or "45m" or "30s". The optional plural ("resets in") must match too (#1308).
    parseRetryFromErrorMessage(errorMessage) {
        if (!errorMessage || typeof errorMessage !== "string") return null;
        const match = errorMessage.match(/resets? (?:after|in) (\d+h)?(\d+m)?(\d+s)?/i);
        if (!match) return null;
        let totalMs = 0;
        if (match[1]) totalMs += parseInt(match[1]) * 3600 * 1000; // hours
        if (match[2]) totalMs += parseInt(match[2]) * 60 * 1000; // minutes
        if (match[3]) totalMs += parseInt(match[3]) * 1000; // seconds
        // "reset after 0s" = burst/RPM limit, not quota exhaustion.
        // Return a minimum backoff so the auto-retry loop handles it
        // instead of falling through to the 24h exhaustion classifier.
        if (totalMs === 0) return 2_000; // 2s minimum burst-limit backoff
        return totalMs;
    }
    /**
   * Flatten an Antigravity error JSON + raw body text into a single string so
   * isTransientAntigravityError can match against body patterns.
   */ extractErrorMessage(errorJson, bodyText = "") {
        const candidates = [];
        if (errorJson && typeof errorJson === "object") {
            const obj = errorJson;
            const errField = obj.error;
            if (errField && typeof errField === "object") {
                const msg = errField.message;
                if (typeof msg === "string") candidates.push(msg);
                else if (msg != null) candidates.push(JSON.stringify(msg));
            } else if (typeof errField === "string") {
                candidates.push(errField);
            }
            if (typeof obj.message === "string") candidates.push(obj.message);
        }
        if (bodyText) candidates.push(bodyText);
        return candidates.filter(Boolean).join("\n");
    }
    /**
   * Return true when a status + error message combination should be retried
   * with exponential backoff instead of immediately failing-over to the next URL.
   * 429 is always transient. Transient 5xx statuses (500/502/503/504) are also
   * retried when the body contains a known capacity/traffic/agent pattern.
   */ isTransientAntigravityError(status, message) {
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) return true;
        if (ANTIGRAVITY_TRANSIENT_STATUSES.has(status)) return true;
        return ANTIGRAVITY_TRANSIENT_ERROR_PATTERNS.some((p)=>p.test(message || ""));
    }
    /**
   * Collect an SSE streaming response into a single non-streaming JSON response.
   * Parses Gemini-format SSE chunks and assembles text content + usage into one
   * OpenAI-format chat.completion payload.
   *
   * @deprecated Use the non-streaming SSE path in chatCore instead, which calls
   * parseSSEToGeminiResponse() from sseParser/geminiResponse.ts.  This method is
   * retained only for backward compatibility and may be removed in a future release.
   */ collectStreamToResponse(response, model, url, headers, transformedBody, log, signal) {
        if (!response.body) {
            return Promise.resolve({
                response,
                url,
                headers,
                transformedBody
            });
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const logger = log || undefined;
        // Guard against indefinite hangs when the upstream sends headers but
        // stalls on the body.  Inherit the global FETCH_TIMEOUT_MS (default 600 s,
        // overridable via env) so reasoning-heavy models (gemini-3.1-pro-high on
        // large prompts) are not killed by a hardcoded 120 s ceiling.
        const SSE_COLLECT_TIMEOUT_MS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        const collect = async ()=>{
            const collected = {
                textContent: "",
                finishReason: "stop",
                toolCalls: [],
                usage: null,
                remainingCredits: null
            };
            const partialLine = {
                value: ""
            };
            let timedOut = false;
            const timeout = AbortSignal.timeout(SSE_COLLECT_TIMEOUT_MS);
            try {
                while(true){
                    if (signal?.aborted) throw new Error("Request aborted during SSE collection");
                    const { done, value } = await Promise.race([
                        reader.read(),
                        new Promise((_, reject)=>timeout.addEventListener("abort", ()=>reject(new Error("SSE collection timed out")), {
                                once: true
                            }))
                    ]);
                    if (done) break;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$sseCollect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processAntigravitySSEText"])(decoder.decode(value, {
                        stream: true
                    }), partialLine, collected, logger);
                }
            } catch (err) {
                const msg = err?.message || String(err);
                timedOut = msg.includes("timed out");
                log?.warn?.("SSE_COLLECT", `Error collecting SSE stream: ${msg}`);
                // Cancel the stream to prevent locking the socket in Undici pool
                try {
                    reader.releaseLock();
                } catch (_) {}
                try {
                    response.body?.cancel().catch(()=>{});
                } catch (_) {}
            } finally{
                try {
                    reader.releaseLock();
                } catch (_) {}
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$sseCollect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processAntigravitySSEText"])(decoder.decode(), partialLine, collected, logger);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$sseCollect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["flushAntigravitySSEText"])(partialLine, collected, logger);
            const result = {
                id: `chatcmpl-${Date.now()}-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID().slice(0, 8)}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [
                    {
                        index: 0,
                        message: collected.toolCalls.length > 0 ? {
                            role: "assistant",
                            content: collected.textContent || null,
                            tool_calls: collected.toolCalls
                        } : {
                            role: "assistant",
                            content: collected.textContent
                        },
                        finish_reason: timedOut ? "length" : collected.toolCalls.length > 0 ? "tool_calls" : collected.finishReason
                    }
                ],
                ...collected.usage && {
                    usage: collected.usage
                },
                // Expose credit balance for upstream consumers (usage service, dashboard)
                ...collected.remainingCredits && {
                    _remainingCredits: collected.remainingCredits
                }
            };
            const syntheticStatus = timedOut ? 504 : response.status;
            const syntheticResponse = new Response(JSON.stringify(result), {
                status: syntheticStatus,
                statusText: timedOut ? "Gateway Timeout" : response.statusText,
                headers: [
                    [
                        "Content-Type",
                        "application/json"
                    ]
                ]
            });
            return {
                response: syntheticResponse,
                url,
                headers,
                transformedBody
            };
        };
        return collect();
    }
    /**
   * #3786 — Drive the per-request Pro-family upstream-id FALLBACK CHAIN.
   *
   * The upstream silently renamed the Gemini 3.1 Pro-high id (HTTP 400 on the old id) and the
   * live id cannot be known from static analysis (competitor proxies disagree). When the
   * resolved upstream id has a fallback chain (see ANTIGRAVITY_PRO_FALLBACK_CHAINS) we try the
   * requested id first and, ONLY on a 400, retry the next candidate until one succeeds (2xx)
   * or the chain is exhausted — then the original 400 surfaces (sanitized, hard rule #12).
   *
   * Off the happy path entirely: a model with no chain, or whose first id is not a 400, makes
   * exactly the same single call as before (zero extra upstream requests).
   */ async execute(input) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveAntigravityClientVersion"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])(input.credentials));
        // Look up the chain by the NORMALLY-resolved upstream id (honours MITM/static aliases).
        // If a MITM alias remapped the id away from a known Pro tier, no chain applies → fast path.
        const resolvedUpstreamId = await cleanModelName(input.model);
        const chain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityModelFallbacks"])(resolvedUpstreamId);
        if (chain.length <= 1) {
            // No fallback chain (flash, claude, plain pro, unknown) → single attempt, unchanged.
            return this.executeOnce(input);
        }
        let firstResult = null;
        for(let i = 0; i < chain.length; i++){
            const candidate = chain[i];
            let result;
            try {
                result = await this.executeOnce(input, candidate);
            } catch (error) {
                const outcome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$proFallbackChain$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleAntigravityFallbackChainError"])(input, error, candidate, i, chain, firstResult, resolvedUpstreamId);
                switch(outcome.action){
                    case "throw":
                        throw outcome.error;
                    case "return":
                        return outcome.result;
                    default:
                        continue;
                }
            }
            // Success (or any non-400) on a candidate → return immediately.
            if (result.response.status !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST) {
                return result;
            }
            // Remember the FIRST 400 so the exhausted-chain case surfaces the original error.
            if (!firstResult) firstResult = result;
            const outcome400 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$proFallbackChain$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleAntigravityFallback400"])(input, result, firstResult, candidate, i, chain, resolvedUpstreamId);
            if (outcome400.action === "return") return outcome400.result;
        }
        // Unreachable (loop always returns), but keeps the type checker happy.
        return firstResult ?? this.executeOnce(input);
    }
    /**
   * #3786 — Run the request once for a SINGLE resolved upstream model id. The Pro-family
   * fallback chain in `execute()` calls this per candidate (`modelIdOverride`), retrying the
   * next id on a 400. `modelIdOverride === undefined` is the normal (non-chain) path and
   * preserves the prior behavior exactly. Returns the executor result plus the upstream
   * status of the first response so `execute()` can decide whether to fall through. @internal
   */ async executeOnce({ model, body, stream, credentials, signal, log, upstreamExtraHeaders }, modelIdOverride) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveAntigravityClientVersion"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])(credentials));
        const fallbackCount = this.getFallbackCount();
        const l = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toSafeAntigravityLog"])(log);
        let lastError = null;
        let lastStatus = 0;
        const retryAttemptsByUrl = {}; // Track retry attempts per URL
        // Always stream upstream — buildUrl always returns the streaming endpoint.
        // For non-streaming clients, we collect the SSE below and return a synthetic
        // non-streaming Response so chatCore's non-streaming path stays unchanged.
        const upstreamStream = true;
        // Account ID for credits tracking.
        // Use connectionId as the stable cache key — it's available in both the executor
        // (via credentials.connectionId) and the usage fetcher (via connection.id).
        // The email-based key was unreliable because email isn't always on the credentials object.
        const accountId = credentials?.connectionId || "unknown";
        // Resolve credits mode once per execute() call. "always" injects
        // enabledCreditTypes: ["GOOGLE_ONE_AI"] on the first request so the
        // preflight normal call is skipped entirely.
        const creditsMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCreditsMode"])();
        const useCreditsFirst = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldUseCreditsFirst"])(credentials?.accessToken || "", creditsMode);
        const creditsRetryState = {
            attempted: false
        };
        for(let urlIndex = 0; urlIndex < fallbackCount; urlIndex++){
            const url = this.buildUrl(model, upstreamStream, urlIndex);
            const headers = this.buildHeaders(credentials, upstreamStream);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeUpstreamExtraHeaders"])(headers, upstreamExtraHeaders);
            const transformed = await this.transformRequest(model, body, upstreamStream, credentials, modelIdOverride, signal ?? undefined);
            if (transformed instanceof Response) {
                return {
                    response: transformed,
                    url,
                    headers,
                    transformedBody: body
                };
            }
            const transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["finalizeAntigravityRequestBody"])(transformed, useCreditsFirst, l);
            // Initialize retry counter for this URL
            if (!retryAttemptsByUrl[urlIndex]) {
                retryAttemptsByUrl[urlIndex] = 0;
            }
            try {
                const outcome = await this.runAntigravityAttempt({
                    url,
                    model,
                    headers,
                    transformedBody,
                    credentials,
                    stream,
                    signal,
                    log: l,
                    accountId,
                    creditsMode,
                    creditsRetryState,
                    urlIndex,
                    retryAttemptsByUrl,
                    fallbackCount
                });
                if (outcome.action === "return") return outcome.result;
                if (outcome.lastStatus !== undefined) lastStatus = outcome.lastStatus;
                if (outcome.sameUrl) urlIndex--;
                continue;
            } catch (error) {
                if (signal?.aborted || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(error)) {
                    throw signal?.reason ?? error;
                }
                lastError = error;
                l.error("TELEMETRY", `[Antigravity] Network/Fetch Error - URL: ${url}, Model: ${model}, Error: ${error instanceof Error ? error.message : String(error)}`);
                if (urlIndex + 1 < fallbackCount) {
                    l.debug("RETRY", `Error on ${url}, trying fallback ${urlIndex + 1}`);
                    continue;
                }
                throw error;
            }
        }
        throw lastError || new Error(`All ${fallbackCount} URLs failed with status ${lastStatus}`);
    }
    /**
   * Run one full per-url-index attempt: send the request, handle a 429/503 (retry
   * same/next url, or a Google One AI credits retry), fall back on other retryable
   * statuses, optionally embed a long Retry-After, then build the final non-streaming
   * or streaming result. Returns a result to hand back from execute(), or a retry
   * instruction for executeOnce()'s loop to act on (continue, optionally urlIndex--).
   */ async runAntigravityAttempt(ctx) {
        const { url, model, headers, transformedBody, credentials, stream, signal, log, accountId, urlIndex, retryAttemptsByUrl, fallbackCount } = ctx;
        const { response, finalHeaders } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendAntigravityRequest"])(this.provider, url, model, headers, transformedBody, credentials, stream, signal, log, retryAttemptsByUrl[urlIndex]);
        let retryMs = null;
        if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED || response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE) {
            const rateLimitOutcome = await this.handleAntigravityRateLimit({
                ...ctx,
                response,
                finalHeaders
            });
            if (rateLimitOutcome.action === "return") {
                return {
                    action: "return",
                    result: rateLimitOutcome.result
                };
            }
            if (rateLimitOutcome.action === "retrySameUrl") return {
                action: "retry",
                sameUrl: true
            };
            if (rateLimitOutcome.action === "retryNextUrl") {
                return {
                    action: "retry",
                    sameUrl: false,
                    lastStatus: rateLimitOutcome.lastStatus
                };
            }
            // Only "fallthrough" remains: last url, no more retries — proceed below with
            // the resolved retryMs so a long Retry-After can still be embedded in the body.
            retryMs = rateLimitOutcome.retryMs;
        }
        if (this.shouldRetry(response.status, urlIndex)) {
            log.debug("RETRY", `${response.status} on ${url}, trying fallback ${urlIndex + 1}`);
            return {
                action: "retry",
                sameUrl: false,
                lastStatus: response.status
            };
        }
        // If we have a 429 with long retry time, embed it in response body
        const embedded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryEmbedLongRetryAfter"])(response, retryMs, url, finalHeaders, transformedBody, log);
        if (embedded) return {
            action: "return",
            result: embedded
        };
        const result = await this.buildAntigravityAttemptResult(model, stream, response, url, finalHeaders, transformedBody, accountId, signal, log);
        return {
            action: "return",
            result
        };
    }
    /**
   * #3786 — Non-streaming callers (stream: false) keep the buffered
   * collect-to-JSON contract: `execute()` (including the Pro-family
   * fallback-chain retry loop) inspects `result.response` directly and
   * expects a synthesized `chat.completion` JSON body, not a raw SSE
   * pass-through. Passthrough is reserved for actual streaming clients
   * (buildFinalAntigravityResult's stream:true branch), where the client
   * itself drains the SSE bytes — collectStreamToResponse already uses
   * FETCH_TIMEOUT_MS (no hardcoded 120s ceiling), so long-thinking models
   * are not penalized by buffering here.
   */ async buildAntigravityAttemptResult(model, stream, response, url, finalHeaders, transformedBody, accountId, signal, log) {
        if (!stream && response.ok && response.body) {
            return this.collectStreamToResponse(response, model, url, finalHeaders, transformedBody, log, signal);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFinalAntigravityResult"])(stream, response, url, finalHeaders, transformedBody, accountId, signal, updateAntigravityRemainingCredits);
    }
    /**
   * Handle a 429/503 response for one URL-index attempt: resolve the retry-after
   * time (headers, then error-body classification + Google-One-AI credits retry),
   * then decide whether to retry the SAME url, fall back to the NEXT url, or (on
   * the last url with no more retries left) fall through with the resolved retryMs
   * so the caller can still embed a long Retry-After in the final response body.
   */ async handleAntigravityRateLimit(ctx) {
        const { response, log, urlIndex, retryAttemptsByUrl, fallbackCount } = ctx;
        // Try to get retry time from headers first
        let retryMs = this.parseRetryHeaders(response.headers);
        // If no retry time in headers, try to parse from error message body
        if (!retryMs) {
            const resolved = await this.tryResolveRetryFromErrorBody(ctx);
            if (resolved.kind === "return") return {
                action: "return",
                result: resolved.result
            };
            retryMs = resolved.retryMs;
        }
        // Bounded short-retry: a non-null retryAfterMs ≤ 60s covers nearly every
        // 429 (decide429 returns 2s/5s/60s defaults), so this branch MUST share the
        // per-URL attempt counter. Without the bound a persistent 429 loops forever
        // on the same endpoint/account (urlIndex-- cancels the loop's urlIndex++) and
        // never returns the 429 to the account-fallback layer in chat.ts.
        if (retryMs && retryMs <= LONG_RETRY_THRESHOLD_MS && retryAttemptsByUrl[urlIndex] < MAX_AUTO_RETRIES) {
            retryAttemptsByUrl[urlIndex]++;
            const effectiveRetryMs = Math.min(retryMs, MAX_RETRY_AFTER_MS);
            log.debug("RETRY", `${response.status} retry ${retryAttemptsByUrl[urlIndex]}/${MAX_AUTO_RETRIES} with Retry-After: ${Math.ceil(effectiveRetryMs / 1000)}s, waiting...`);
            await new Promise((resolve)=>setTimeout(resolve, effectiveRetryMs));
            return {
                action: "retrySameUrl"
            };
        }
        // Auto retry for 429 (no Retry-After) or transient 5xx errors.
        // For 5xx we read the body to detect known transient patterns
        // ("Agent execution terminated due to error", "high traffic", "capacity").
        if ((!retryMs || retryMs === 0) && retryAttemptsByUrl[urlIndex] < MAX_AUTO_RETRIES) {
            const shouldAutoRetry = await this.shouldAutoRetryTransient(response);
            if (shouldAutoRetry) {
                retryAttemptsByUrl[urlIndex]++;
                // Exponential backoff: 2s, 4s, 8s… capped per-status
                const cap = response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED ? MAX_RETRY_AFTER_MS : ANTIGRAVITY_TRANSIENT_RETRY_MAX_MS;
                const backoffMs = Math.min(1000 * 2 ** retryAttemptsByUrl[urlIndex], cap);
                log.debug("RETRY", `${response.status} transient auto retry ${retryAttemptsByUrl[urlIndex]}/${MAX_AUTO_RETRIES} after ${backoffMs / 1000}s`);
                await new Promise((resolve)=>setTimeout(resolve, backoffMs));
                return {
                    action: "retrySameUrl"
                };
            }
        }
        log.debug("RETRY", `${response.status}, Retry-After ${retryMs ? `too long (${Math.ceil(retryMs / 1000)}s)` : "missing"}, trying fallback`);
        if (urlIndex + 1 < fallbackCount) {
            return {
                action: "retryNextUrl",
                lastStatus: response.status
            };
        }
        return {
            action: "fallthrough",
            retryMs,
            lastStatus: response.status
        };
    }
    /**
   * Parse the 429/503 response body to classify the failure and (for
   * quota_exhausted, non-full-exhaustion cases) attempt a Google One AI
   * credits retry. Returns the resolved retryMs, or an early "return" result
   * when the credits retry itself produced a response to hand back to the client.
   */ async tryResolveRetryFromErrorBody(ctx) {
        const { response, url, model, headers, transformedBody, credentials, stream, signal, log, accountId, creditsMode, creditsRetryState } = ctx;
        try {
            const errorBody = await response.clone().text();
            const errorJson = JSON.parse(errorBody);
            const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAntigravity429ErrorMessage"])(errorJson);
            // 1. Try to parse explicit retry time from message
            const parsedRetryMs = this.parseRetryFromErrorMessage(errorMessage);
            // 2. Classify 429, then decide the final retry time BEFORE the credits retry so
            //    full_quota_exhausted can skip the credits attempt entirely (avoids ~41s hold
            //    on an already-exhausted account) and locks only this exact model.
            const category = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classify429"])(errorMessage);
            const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decide429"])(category, parsedRetryMs);
            const retryMs = decision.retryAfterMs;
            log.debug("AG_429", `Category: ${category}, Decision: ${decision.kind} — ${decision.reason}`);
            const creditsAlreadyInjected = transformedBody.enabledCreditTypes != null;
            const creditsRetryEligible = category === "quota_exhausted" && !creditsAlreadyInjected && !creditsRetryState.attempted && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldRetryWithCredits"])(credentials?.accessToken || "", creditsMode);
            // Retry mode gets one credits attempt before the exact-model lock is persisted.
            if (decision.kind === "full_quota_exhausted" && retryMs && !creditsRetryEligible) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockExactModel"])(this.provider, accountId, model, "quota_exhausted", retryMs);
            }
            if (category === "quota_exhausted" && creditsAlreadyInjected) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCreditsFailure"])(credentials?.accessToken || "");
                log.warn("AG_CREDITS", "Credits-first request 429'd — credits likely exhausted");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markCreditsExhausted"])(accountId);
            }
            if (creditsRetryEligible) {
                creditsRetryState.attempted = true;
                const creditsResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryCreditsRetry"])(this.provider, url, headers, transformedBody, credentials, stream, signal, log, accountId, updateAntigravityRemainingCredits);
                if (creditsResult) return {
                    kind: "return",
                    result: creditsResult
                };
                if (retryMs) markConnectionQuotaExhausted(accountId, retryMs);
            }
            return {
                kind: "resolved",
                retryMs
            };
        } catch (error) {
            if (signal?.aborted || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2f$executeAttempt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAbortError"])(error)) {
                throw signal?.reason ?? error;
            }
            // Ignore parse errors, will fall back to exponential backoff
            return {
                kind: "resolved",
                retryMs: null
            };
        }
    }
    /**
   * True for 429 always; for transient 5xx (500/502/503/504) only when the body
   * matches a known capacity/traffic/agent-terminated pattern.
   */ async shouldAutoRetryTransient(response) {
        if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) return true;
        if (!ANTIGRAVITY_TRANSIENT_STATUSES.has(response.status)) return false;
        try {
            const errBody = await response.clone().text();
            let errJson = null;
            try {
                errJson = errBody ? JSON.parse(errBody) : null;
            } catch  {
            // non-JSON body — fall through to pattern match against raw text
            }
            const errMsg = this.extractErrorMessage(errJson, errBody);
            return this.isTransientAntigravityError(response.status, errMsg);
        } catch  {
            // ignore body read errors
            return false;
        }
    }
}
const __TURBOPACK__default__export__ = AntigravityExecutor;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_executors_0xf_ief._.js.map