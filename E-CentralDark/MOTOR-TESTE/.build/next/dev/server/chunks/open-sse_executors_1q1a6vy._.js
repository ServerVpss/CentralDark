module.exports = [
"[project]/open-sse/executors/claudeIdentity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [instrumentation] (ecmascript)");
;
;
const CLAUDE_CODE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_CODE_STAINLESS_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_SDK_PACKAGE_VERSION"];
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
"[project]/open-sse/executors/forceResponsesUpstream.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shouldForceResponsesUpstream",
    ()=>shouldForceResponsesUpstream,
    "withForcedResponsesUpstream",
    ()=>withForcedResponsesUpstream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function shouldForceResponsesUpstream(provider, body, credentials) {
    if (!provider.startsWith("openai-compatible-")) return false;
    if (!isRecord(body)) return false;
    const providerSpecificData = credentials?.providerSpecificData ?? null;
    if (providerSpecificData?._omnirouteForceResponsesUpstream === true) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getOpenAICompatibleType"])(provider, providerSpecificData) === "responses") return false;
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
"[project]/open-sse/executors/base/headers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/executors/base/reasoningEffort.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
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
    const isClaude = (provider === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(provider)) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsClaudeMaxEffort"])(model);
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
    const supportsXHigh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsXHighEffort"])(provider, modelStr);
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
"[project]/open-sse/executors/base.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/alternateFormats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$contextEditing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/contextEditing.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerFieldStrips.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/cliFingerprints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/thinkingBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterFreeWindow.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wafRateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wafRateLimit.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/sessionPool.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/poolRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCCH.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeConstraints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/claudeCodeCompatibleIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeObfuscation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/responsesInputSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/providerRequestLogging.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/claudeIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$forceResponsesUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/forceResponsesUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/resilience/peerRouting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clineAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$reasoningEffort$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/reasoningEffort.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
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
            const pool = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SessionPool"](this.provider, this.poolConfig);
            pool.warmUp(this.poolConfig.minSessions).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PoolRegistry"].register(this.provider, pool);
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
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
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
            const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getOpenAICompatibleType"])(this.provider, psd) === "responses" ? "/responses" : "/chat/completions";
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlternateFormat"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(this.provider), credentials?.providerSpecificData);
    }
    usesClaudeCodeProtocol(credentials) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(this.provider)) return false;
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
            const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveKeyForRequest"])(credentials.connectionId, credentials.apiKey || "", validExtras, selectedKeyId ?? null);
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
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setUserAgentHeader"])(headers, envUA);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAnthropicHeaderVariants"])(headers);
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
                cloned.input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeResponsesInputItems"])(cloned.input, false);
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
        return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && urlIndex + 1 < this.getFallbackCount();
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
    static FETCH_START_TIMEOUT_MS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
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
        const lead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRefreshLeadMs"])(this.provider);
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
                const refreshed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["runWithOnPersist"])(proactiveOnPersist, ()=>this.refreshCredentials(credentials, log || null));
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
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(refreshed)) {
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
            const requestCredentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$forceResponsesUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withForcedResponsesUpstream"])(this.provider, body, activeCredentials);
            const url = this.buildUrl(model, stream, urlIndex, requestCredentials);
            const headers = this.buildHeaders(requestCredentials, stream, clientHeaders, model);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyConfiguredUserAgent"])(headers, requestCredentials?.providerSpecificData);
            // Strip OpenAI SDK (X-Stainless-*) metadata + normalize SDK-derived User-Agent
            // on OpenAI-compatible passthrough requests — some upstream gateways 403 on them.
            const strippedStainless = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripStainlessHeadersForOpenAICompat"])(headers, this.provider, url);
            if (strippedStainless.length > 0) {
                log?.debug?.("HEADERS", `Stripped X-Stainless-* from OpenAI-compatible request: ${strippedStainless.join(", ")}`);
            }
            const usesClaudeCodeProtocol = this.usesClaudeCodeProtocol(requestCredentials);
            const fingerprintProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(this.provider) && !usesClaudeCodeProtocol ? "codex" : this.provider;
            const ccRequestDefaults = usesClaudeCodeProtocol ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClaudeCodeCompatibleRequestDefaults"])(requestCredentials?.providerSpecificData) : {};
            const shouldForwardExtendedContext = extendedContext && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["modelSupportsContext1mBeta"])(model) && !usesClaudeCodeProtocol;
            const shouldForwardCcCompatibleContext1m = usesClaudeCodeProtocol && ccRequestDefaults.context1m === true && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modelHasNativeContext1m"])(model);
            if (shouldForwardExtendedContext || shouldForwardCcCompatibleContext1m) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendAnthropicBetaHeader"])(headers, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CONTEXT_1M_BETA_HEADER"]);
            }
            const rawTransformedBody = await this.transformRequest(model, body, stream, requestCredentials);
            let transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$reasoningEffort$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeReasoningEffortForProvider"])(rawTransformedBody, this.provider, model, log);
            if (this.provider === "groq") {
                transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripGroqUnsupportedFields"])(transformedBody);
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
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripProxyToolPrefix"])(tb);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["remapToolNamesInRequest"])(tb);
                    // Cloak third-party tool names + sanitize invalid tool schemas so
                    // Anthropic does not refuse native Claude OAuth traffic with a
                    // misleading "out of extra usage" placeholder. See Spec E.
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cloakThirdPartyToolNames"])(tb);
                    if (Array.isArray(tb.tools)) {
                        tb.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeClaudeToolSchemas"])(tb.tools);
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["obfuscateInBody"])(tb);
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
                        const tbMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getThinkingBudgetConfig"])().mode;
                        if (isHaiku) {
                            // Keep tb.thinking — real Claude Desktop keeps thinking enabled for Haiku
                            // (issue #2454). Only strip output_config (effort) which Haiku rejects;
                            // context_management is re-paired with the preserved thinking below.
                            delete tb.output_config;
                            delete tb.context_management;
                        } else if (tbMode === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ThinkingMode"].AUTO) {
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
                        if (th?.type === "enabled" && tbMode !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ThinkingMode"].PASSTHROUGH) {
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
                    const upstreamUserId = cloakIdentity ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUpstreamMetadataUserId"])(tb);
                    if (upstreamUserId) {
                        sessionId = upstreamUserId.session_id;
                        deviceId = upstreamUserId.device_id;
                        accountUUID = upstreamUserId.account_uuid;
                        identitySource = "upstream-metadata";
                    } else {
                        const headerSid = cloakIdentity ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["passthroughUpstreamSessionId"])(clientHeaders);
                        sessionId = headerSid ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionId"])(seed);
                        deviceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCliUserID"])(psd, seed);
                        accountUUID = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountUUID"])(psd, seed, activeCredentials?.accessToken);
                        identitySource = headerSid ? "upstream-header" : cloakIdentity ? "synthesized-cloaked" : "synthesized";
                    }
                    // system[0] (billing) and system[1] (sentinel) must not carry
                    // cache_control — that belongs on upstream prompt blocks at [2..].
                    const billingLine = `x-anthropic-billing-header: cc_version=${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_BILLING_VERSION"]}; cc_entrypoint=cli; cch=00000;`;
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
                        const transformResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applySystemTransformPipeline"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"], tb);
                        if (transformResult.appliedOpKinds.length > 0) {
                            console.log(`[SystemTransforms] claude-native: ${transformResult.appliedOpKinds.join(", ")}`);
                        }
                    }
                    if (!tb.metadata || typeof tb.metadata !== "object") tb.metadata = {};
                    tb.metadata.user_id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildUserIdJson"])({
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
                        "anthropic-beta": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeClientAnthropicBeta"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectBetaFlags"])(tb, null, clientAnthropicBeta), clientAnthropicBeta),
                        "anthropic-dangerous-direct-browser-access": "true",
                        "x-app": "cli",
                        "User-Agent": `claude-cli/${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_VERSION"]} (external, cli)`,
                        "X-Stainless-Package-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_STAINLESS_VERSION"],
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
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(this.provider) && usesClaudeCodeProtocol) {
                        delete headers["Authorization"];
                        headers["x-api-key"] = activeCredentials?.apiKey || activeCredentials?.accessToken || "";
                    }
                    delete headers["X-Stainless-Helper-Method"];
                    // OS/arch follow the host running the signed binary. Runtime version
                    // is pinned to the captured CLI wire image, not OmniRoute's Node.
                    headers["X-Stainless-Arch"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stainlessArch"])();
                    headers["X-Stainless-Lang"] = "js";
                    headers["X-Stainless-OS"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stainlessOS"])();
                    headers["X-Stainless-Runtime"] = "node";
                    headers["X-Stainless-Runtime-Version"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_STAINLESS_RUNTIME_VERSION"];
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
                        const fixed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])(tb.messages);
                        // fixToolAdjacency enforces Claude's strict adjacency rule
                        // (tool_result must be in immediately next message).
                        // Only apply for Claude/Claude-compatible — OpenAI allows results
                        // spread across multiple subsequent messages.
                        const isClaude = this.provider === "claude" || usesClaudeCodeProtocol;
                        // For Claude, fixToolAdjacency may strip tool_use blocks whose
                        // tool_result isn't in the next message; re-run fixToolPairs to
                        // drop any tool_result orphaned by that strip (discussion #2410).
                        const adjacent = isClaude ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolAdjacency"])(fixed)) : fixed;
                        const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingAssistantOrphanToolUse"])(adjacent);
                        // Some providers (e.g. Mistral) require the last message to be user
                        // or tool and reject trailing assistant text messages with 400 (#3396).
                        tb.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingAssistantForProvider"])(stripped, this.provider);
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
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceThinkingTemperature"])(transformedBody);
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
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$contextEditing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyContextEditingToBody"])(transformedBody, {
                        enabled: true
                    });
                    log?.debug?.("CONTEXT_EDITING", "Delegated context editing on — attached clear_tool_uses to the Claude request");
                }
                let bodyString = JSON.stringify(transformedBody);
                const shouldFingerprint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCliCompatEnabled"])(fingerprintProvider) || this.provider === "claude" && (isClaudeCodeClient || hasClaudeOAuthToken);
                if (shouldFingerprint) {
                    const fingerprinted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyFingerprint"])(fingerprintProvider, headers, transformedBody);
                    finalHeaders = fingerprinted.headers;
                    bodyString = fingerprinted.bodyString;
                }
                // CCH signing — replaces the cch=00000 placeholder in the billing
                // header with an xxHash64 integrity token over the serialized body.
                if (usesClaudeCodeProtocol || this.provider === "claude") {
                    bodyString = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(bodyString);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeUpstreamExtraHeaders"])(finalHeaders, upstreamExtraHeaders);
                if (this.provider === "cline" || this.provider === "clinepass") {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyClineProtocolHeaders"])(finalHeaders, {
                        taskId: headers["X-Task-ID"]
                    });
                }
                // Enforce peer tracing after all configurable headers have been merged so
                // operator/provider metadata cannot accidentally erase the loop guard.
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyPeerTraceHeader"])(finalHeaders, clientHeaders, url);
                const serializedBody = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseBody"](bodyString);
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
                const openrouterFreeWindowAccountKey = this.provider === "openrouter" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFreeVariantModel"])(model) && activeCredentials.connectionId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountKey"])(activeCredentials.connectionId, activeCredentials) : null;
                if (openrouterFreeWindowAccountKey) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordFreeWindowAttempt"])(openrouterFreeWindowAccountKey);
                }
                // WAF burst guard: agentrouter.org's content filter becomes more
                // aggressive after rapid requests. Enforce a small inter-request gap
                // to avoid tripping it. See open-sse/services/wafRateLimit.ts.
                if (this.provider === "agentrouter") {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wafRateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gateOutboundRequest"])(`agentrouter:${url}`);
                }
                let response = await fetchWithStartTimeout(url, fetchOptions);
                if (openrouterFreeWindowAccountKey) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["correctFromRateLimitHeaders"])(openrouterFreeWindowAccountKey, response.headers);
                }
                // Context Editing 400-fallback for Claude-compatible relays.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && contextEditing?.enabled && !contextEditingDisabled && transformedBody && typeof transformedBody === "object" && transformedBody.context_management !== undefined) {
                    const errText = await response.clone().text().catch(()=>"");
                    if (/context[_-]management|context editing/i.test(errText)) {
                        contextEditingDisabled = true;
                        delete transformedBody.context_management;
                        let retryBody = JSON.stringify(transformedBody);
                        if (usesClaudeCodeProtocol || this.provider === "claude") {
                            retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
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
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && thinkingBudgetClampedMax === null && transformedBody && typeof transformedBody === "object") {
                    const errText = await response.clone().text().catch(()=>"");
                    const upstreamMax = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseThinkingBudgetMax"])(errText);
                    if (upstreamMax !== null) {
                        const currentBudget = readNestedThinkingBudget(transformedBody);
                        // Record under the budget that actually failed so the learned step
                        // ladder advances correctly; fall back to upstreamMax when the body
                        // carries no readable budget (still record so we stop re-hitting).
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordLearnedThinkingCap"])(this.provider, model, currentBudget ?? upstreamMax + 1);
                        thinkingBudgetClampedMax = upstreamMax;
                        if (clampNestedThinkingBudget(transformedBody, upstreamMax)) {
                            let retryBody = JSON.stringify(transformedBody);
                            if (usesClaudeCodeProtocol || this.provider === "claude") {
                                retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
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
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && transformedBody && typeof transformedBody === "object") {
                    const errText = await response.clone().text().catch(()=>"");
                    const offending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findOffendingField"])(errText);
                    if (offending && !strippedFields.has(offending) && transformedBody[offending] !== undefined) {
                        strippedFields.add(offending);
                        delete transformedBody[offending];
                        let retryBody = JSON.stringify(transformedBody);
                        if (usesClaudeCodeProtocol || this.provider === "claude") {
                            retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                        }
                        log?.debug?.("FIELD_400", `Upstream 400 rejected ${offending} on ${url} — retrying without it`);
                        response = await fetchWithStartTimeout(url, {
                            ...fetchOptions,
                            body: retryBody
                        });
                    } else {
                        // Auto-learn: detect "Unsupported parameter" errors and persist to DB
                        // when the provider config has autoLearn enabled (#6625).
                        const autoLearned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectUnsupportedParam"])(errText);
                        if (autoLearned && !strippedFields.has(autoLearned) && transformedBody[autoLearned] !== undefined) {
                            try {
                                const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getParamFilterConfig"])(this.provider);
                                const shouldAutoLearn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutoLearnGloballyEnabled"])() || config?.autoLearn === true;
                                if (shouldAutoLearn) {
                                    strippedFields.add(autoLearned);
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addParamToBlocklist"])(this.provider, autoLearned, model);
                                    delete transformedBody[autoLearned];
                                    let retryBody = JSON.stringify(transformedBody);
                                    if (usesClaudeCodeProtocol || this.provider === "claude") {
                                        retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
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
                if (!skipUpstreamRetry && response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && (retryAttemptsByUrl[urlIndex] ?? 0) < BaseExecutor.WAF_RETRY_CONFIG.maxAttempts) {
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
                if (!skipUpstreamRetry && response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && (retryAttemptsByUrl[urlIndex] ?? 0) < BaseExecutor.RETRY_CONFIG.maxAttempts) {
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
"[project]/open-sse/executors/auggie.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AuggieExecutor",
    ()=>AuggieExecutor,
    "__resetAuggieModels",
    ()=>__resetAuggieModels,
    "buildAuggiePrompt",
    ()=>buildAuggiePrompt,
    "buildAuggieSpawnOptions",
    ()=>buildAuggieSpawnOptions,
    "checkAuggieCliVersion",
    ()=>checkAuggieCliVersion,
    "initAuggieModels",
    ()=>initAuggieModels,
    "resolveAuggieBin",
    ()=>resolveAuggieBin,
    "resolveAuggieModel",
    ()=>resolveAuggieModel
]);
/**
 * AuggieExecutor — routes completions through the local Augment CLI ("auggie")
 * binary via a one-shot stdin/stdout text pipe (no JSON-RPC / ACP protocol).
 *
 * Flow:
 *   1. Flatten the OpenAI-shaped `messages[]` into a single prompt string.
 *   2. Spawn `auggie --print --quiet --model <model>` and pipe the prompt on stdin.
 *   3. Relay stdout chunks as OpenAI-compatible SSE deltas (stream=true) or
 *      buffer them into a single chat.completion JSON body (stream=false).
 *   4. Kill the subprocess on abort / stream close.
 *
 * Authentication:
 *   None. Auggie delegates auth entirely to the user's local `auggie login`
 *   session — OmniRoute never sees or stores credentials for this provider.
 *   The connection is registered `noAuth: true` and `refreshCredentials()` is
 *   a no-op (nothing to refresh).
 *
 * Binary discovery:
 *   1. AUGGIE_BIN / CLI_AUGGIE_BIN env var (absolute path override)
 *   2. PATH lookup ("auggie" / "auggie.cmd")
 *   3. %LOCALAPPDATA%\auggie\bin\auggie.exe  (Windows installer)
 *   4. ~/.local/share/auggie/bin/auggie      (Linux installer)
 *   5. ~/.auggie/bin/auggie                  (alternate installer layout)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/auggie/index.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const AUGGIE_URL = "auggie://cli/stdio";
// ─── Model allowlist (argument-injection defense) ─────────────────────────────
// The `model` value is forwarded straight into the `auggie` argv, so it is an
// untrusted-input sink. We only ever pass a model that is declared in the
// registry entry — this closes flag-smuggling (a `model` starting with "-" would
// otherwise be parsed by auggie as an option) and unknown-model passthrough.
//
// The static registry (shipped with the code) is checked first.  On first use
// the executor also spawns `auggie model list` at runtime and merges any IDs it
// finds — this lets the allowlist stay current when auggie adds or renames
// models without a code update.
const AUGGIE_MODEL_ALLOWLIST = new Set(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["auggieProvider"].models.map((m)=>m.id));
const DEFAULT_AUGGIE_MODEL = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["auggieProvider"].models[0]?.id ?? "claude-sonnet-4.6";
// ─── Model alias map (backward compat for saved combos) ─────────────────────
// Old model IDs from before the v0.32.0 registry update; each maps to the
// equivalent v0.32.0 ID so existing combos continue to work after the rename.
const AUGGIE_MODEL_ALIASES = new Map([
    // Claude
    [
        "claude-sonnet-4.6",
        "sonnet4.6"
    ],
    [
        "claude-sonnet-4.6-thinking",
        "sonnet4.6"
    ],
    [
        "claude-opus-4.6",
        "opus4.6"
    ],
    [
        "claude-haiku-4.5",
        "haiku4.5"
    ],
    // Gemini
    [
        "gemini-3.1-pro",
        "gemini-3.1-pro-preview"
    ],
    [
        "gemini-3.0-flash",
        "gemini-3.1-pro-preview"
    ],
    // GPT-5.x (high/medium split was synthetic — v0.32.0 has a single ID per version)
    [
        "gpt-5.5-high",
        "gpt5.5"
    ],
    [
        "gpt-5.5-medium",
        "gpt5.5"
    ],
    [
        "gpt-5.4-high",
        "gpt5.4"
    ],
    [
        "gpt-5.4-medium",
        "gpt5.4"
    ]
]);
/**
 * Live model cache populated by `initAuggieModels()`.
 * - `null`  = not yet attempted
 * - `Set`   = successfully fetched IDs (possibly empty)
 */ let liveModelSet = null;
async function initAuggieModels(signal, timeoutMs = 8000) {
    if (liveModelSet !== null) return;
    let bin;
    try {
        bin = resolveAuggieBin();
    } catch  {
        liveModelSet = new Set();
        return;
    }
    const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(bin, [
        "model",
        "list"
    ], {
        env: process.env,
        stdio: [
            "ignore",
            "pipe",
            "pipe"
        ],
        shell: false,
        windowsHide: true
    });
    const fragments = [];
    child.stdout.on("data", (d)=>fragments.push(d.toString("utf8")));
    let settled = false;
    const settle = (result)=>{
        if (settled) return;
        settled = true;
        liveModelSet = result;
    };
    const timer = setTimeout(()=>{
        if (!child.killed) child.kill("SIGKILL");
        settle(new Set());
    }, timeoutMs);
    const onAbort = ()=>{
        if (!child.killed) child.kill("SIGKILL");
        clearTimeout(timer);
        settle(new Set());
    };
    if (signal) {
        if (signal.aborted) {
            clearTimeout(timer);
            settle(new Set());
            return;
        }
        signal.addEventListener("abort", onAbort, {
            once: true
        });
    }
    try {
        const code = await new Promise((resolve, reject)=>{
            child.on("close", resolve);
            child.on("error", (e)=>reject(e));
        });
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        if (code !== 0) {
            settle(new Set());
            return;
        }
        const ids = new Set();
        for (const line of fragments.join("").split("\n")){
            const m = line.match(/\[([^\]]+)\]/);
            if (m) ids.add(m[1]);
        }
        settle(ids.size > 0 ? ids : new Set());
    } catch  {
        clearTimeout(timer);
        settle(new Set());
        signal?.removeEventListener("abort", onAbort);
    }
}
/**
 * This workspace compiles with `strictNullChecks: false`, where a boolean-literal
 * discriminant narrows the positive branch but not the negative one — so `!r.ok` alone
 * leaves `r` as the full union and reading `.error` fails. An explicit type predicate
 * narrows under those settings without retagging the union (which is public API here:
 * `resolveAuggieModel` is exported and its tests deep-equal the `{ ok: true, ... }` shape).
 */ function isAuggieModelFailure(resolution) {
    return !resolution.ok;
}
function resolveAuggieModel(model) {
    const requested = typeof model === "string" ? model.trim() : "";
    if (!requested) return {
        ok: true,
        model: DEFAULT_AUGGIE_MODEL
    };
    if (requested.startsWith("-")) {
        return {
            ok: false,
            error: `Invalid Auggie model "${requested}": model must not start with "-".`
        };
    }
    // Backward-compat alias: resolve old model IDs → v0.32.0 equivalents.
    // This lets saved combos referencing the old names keep working.
    const requestedAlias = AUGGIE_MODEL_ALIASES.get(requested);
    if (requestedAlias) return {
        ok: true,
        model: requestedAlias
    };
    // Static registry — always authoritative for the shipped set.
    if (AUGGIE_MODEL_ALLOWLIST.has(requested)) return {
        ok: true,
        model: requested
    };
    // Live-discovered models (if loaded) extend the static list.
    if (liveModelSet?.has(requested)) return {
        ok: true,
        model: requested
    };
    const known = [
        ...AUGGIE_MODEL_ALLOWLIST
    ];
    if (liveModelSet) known.push(...liveModelSet);
    return {
        ok: false,
        error: `Unknown Auggie model "${requested}". Supported models: ${known.join(", ")}.`
    };
}
/**
 * Build the auggie argv. `model` MUST already be allowlist-validated via
 * resolveAuggieModel(). The trailing `--` marks the end of options so no
 * later positional value can be reinterpreted as a flag.
 */ function buildAuggieArgs(model) {
    return [
        "--print",
        "--quiet",
        "--model",
        model,
        "--"
    ];
}
function buildAuggieSpawnOptions(stdio) {
    return {
        env: process.env,
        stdio,
        shell: process.platform === "win32"
    };
}
function resolveAuggieBin() {
    // 1. Explicit override
    const envBin = (process.env.AUGGIE_BIN || process.env.CLI_AUGGIE_BIN || "").trim();
    if (envBin) return envBin;
    const isWin = process.platform === "win32";
    // 2. Windows installer default: %LOCALAPPDATA%\auggie\bin\auggie.exe
    if ("TURBOPACK compile-time truthy", 1) {
        const localAppData = process.env.LOCALAPPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), "AppData", "Local");
        const winPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(localAppData, "auggie", "bin", "auggie.exe");
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(winPath)) return winPath;
    }
    // 3. Linux/macOS installer paths
    const home = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
    for (const candidate of [
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(home, ".local", "share", "auggie", "bin", "auggie"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(home, ".auggie", "bin", "auggie")
    ]){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidate)) return candidate;
    }
    // Fallback — rely on PATH
    return ("TURBOPACK compile-time truthy", 1) ? "auggie.cmd" : "TURBOPACK unreachable";
}
function buildAuggiePrompt(messages) {
    const lines = [];
    for (const m of messages){
        const role = String(m.role || "user");
        let text = "";
        if (typeof m.content === "string") {
            text = m.content;
        } else if (Array.isArray(m.content)) {
            for (const p of m.content){
                if (p && typeof p === "object" && p.type === "text") {
                    text += String(p.text || "");
                }
            }
        }
        if (!text.trim()) continue;
        if (role === "system") {
            lines.push(`[System]\n${text}`);
        } else if (role === "assistant") {
            lines.push(`[Assistant]\n${text}`);
        } else {
            lines.push(`[User]\n${text}`);
        }
    }
    return lines.join("\n\n") || "(empty)";
}
function isEnoentLike(message) {
    return message.includes("ENOENT") || message.includes("not found");
}
function checkAuggieCliVersion(timeoutMs = 5000) {
    const bin = resolveAuggieBin();
    return new Promise((resolve)=>{
        let settled = false;
        const settle = (result)=>{
            if (settled) return;
            settled = true;
            resolve(result);
        };
        let child;
        try {
            // No `shell` option — fixed argv, no cmd.exe interpretation.
            child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(bin, [
                "--version"
            ], {
                env: process.env,
                stdio: [
                    "ignore",
                    "pipe",
                    "pipe"
                ]
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            settle({
                ok: false,
                error: isEnoentLike(message) ? cliNotFoundMessage(bin) : message
            });
            return;
        }
        const timer = setTimeout(()=>{
            if (!child.killed) child.kill("SIGKILL");
            settle({
                ok: false,
                error: "Auggie CLI version check timed out"
            });
        }, timeoutMs);
        let stdout = "";
        child.stdout?.on("data", (chunk)=>{
            stdout += chunk.toString("utf8");
        });
        child.on("error", (err)=>{
            clearTimeout(timer);
            const message = err?.message || String(err);
            settle({
                ok: false,
                error: isEnoentLike(message) ? cliNotFoundMessage(bin) : message
            });
        });
        child.on("close", (code)=>{
            clearTimeout(timer);
            if (code === 0 && stdout.trim()) {
                settle({
                    ok: true,
                    version: stdout.trim().slice(0, 200)
                });
            } else {
                settle({
                    ok: false,
                    error: `Auggie CLI exited with code ${code}`
                });
            }
        });
    });
}
function cliNotFoundMessage(bin) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Auggie CLI not found: ${bin}. Install it and run "auggie login", or set AUGGIE_BIN to an absolute path.`);
}
class AuggieExecutor extends __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseExecutor"] {
    constructor(){
        super("auggie", {
            id: "auggie",
            baseUrl: ""
        });
    }
    buildUrl() {
        return AUGGIE_URL;
    }
    buildHeaders() {
        return {};
    }
    transformRequest() {
        return null;
    }
    /** No-op — auggie has no OmniRoute-managed credentials to refresh. */ async refreshCredentials(_credentials) {
        return null;
    }
    async execute({ model, body, stream, signal, log }) {
        const b = body ?? {};
        const messages = Array.isArray(b.messages) ? b.messages : [];
        const promptText = buildAuggiePrompt(messages);
        const auggieBin = resolveAuggieBin();
        const wantsStream = stream !== false;
        // On first execution, try to discover model IDs the local auggie recognises.
        // Best-effort: missing/inactive CLI falls through to the static list.
        await initAuggieModels(signal);
        // Argument-injection defense: never forward an unvalidated model into the argv.
        const modelResolution = resolveAuggieModel(model);
        if (isAuggieModelFailure(modelResolution)) {
            const response = wantsStream ? buildAuggieSseError(modelResolution.error) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, modelResolution.error);
            return {
                response,
                url: AUGGIE_URL,
                headers: {},
                transformedBody: {
                    error: true
                }
            };
        }
        const safeModel = modelResolution.model;
        log?.info?.("AUGGIE", `auggie --print → model=${safeModel}, bin=${auggieBin}, stream=${wantsStream}`);
        const response = wantsStream ? this.runStreaming(auggieBin, safeModel, promptText, signal, log) : await this.runNonStreaming(auggieBin, safeModel, promptText, signal, log);
        return {
            response,
            url: AUGGIE_URL,
            headers: {},
            transformedBody: {
                model: safeModel,
                promptLength: promptText.length
            }
        };
    }
    spawnAuggie(auggieBin, model, promptText) {
        // `shell: true` on win32 only (see buildAuggieSpawnOptions() for why) — argv
        // stays a fixed literal array; `model` is already allowlist-validated by
        // resolveAuggieModel() before reaching here, so no argument-injection surface
        // is reopened by shell interpretation.
        const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(auggieBin, buildAuggieArgs(model), buildAuggieSpawnOptions([
            "pipe",
            "pipe",
            "pipe"
        ]));
        // EPIPE from a fast-exiting CLI arrives ASYNCHRONOUSLY as an 'error' event on
        // stdin (not a sync throw), so the try/catch below cannot swallow it — without
        // this handler the unhandled stream error crashes the process instead of
        // letting the child's own 'error'/'close' handlers surface the failure.
        child.stdin.on("error", ()=>{});
        try {
            child.stdin.write(promptText);
            child.stdin.end();
        } catch  {
        /* ignore write errors — 'error'/'close' handlers surface the failure */ }
        return child;
    }
    runStreaming(auggieBin, model, promptText, signal, log) {
        const responseId = `chatcmpl-auggie-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);
        const sseStream = new ReadableStream({
            start (controller) {
                const enc = new TextEncoder();
                const emit = (data)=>controller.enqueue(enc.encode(data));
                let closed = false;
                let roleEmitted = false;
                let finished = false;
                const finish = ()=>{
                    if (finished) return;
                    finished = true;
                    if (!closed) {
                        closed = true;
                        try {
                            controller.close();
                        } catch  {
                        /* already closed */ }
                    }
                };
                const emitDelta = (delta)=>{
                    if (!delta) return;
                    if (!roleEmitted) {
                        emit(`data: ${JSON.stringify({
                            id: responseId,
                            object: "chat.completion.chunk",
                            created,
                            model,
                            choices: [
                                {
                                    index: 0,
                                    delta: {
                                        role: "assistant",
                                        content: ""
                                    },
                                    finish_reason: null
                                }
                            ]
                        })}\n\n`);
                        roleEmitted = true;
                    }
                    emit(`data: ${JSON.stringify({
                        id: responseId,
                        object: "chat.completion.chunk",
                        created,
                        model,
                        choices: [
                            {
                                index: 0,
                                delta: {
                                    content: delta
                                },
                                finish_reason: null
                            }
                        ]
                    })}\n\n`);
                };
                const emitError = (message)=>{
                    emit(`data: ${JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(502, message))}\n\n`);
                    emit("data: [DONE]\n\n");
                    finish();
                };
                const emitStop = ()=>{
                    emit(`data: ${JSON.stringify({
                        id: responseId,
                        object: "chat.completion.chunk",
                        created,
                        model,
                        choices: [
                            {
                                index: 0,
                                delta: {},
                                finish_reason: "stop"
                            }
                        ]
                    })}\n\n`);
                    emit("data: [DONE]\n\n");
                    finish();
                };
                let child;
                try {
                    // `shell: true` on win32 only (see buildAuggieSpawnOptions() for why).
                    // `model` is already allowlist-validated upstream, so shell interpretation
                    // does not reopen argument-injection.
                    child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(auggieBin, buildAuggieArgs(model), buildAuggieSpawnOptions([
                        "pipe",
                        "pipe",
                        "pipe"
                    ]));
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    emitError(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message));
                    return;
                }
                // Async EPIPE lands as an 'error' event on stdin, not a sync throw (see
                // spawnAuggie) — handle it so a fast-exiting CLI can't crash the stream.
                child.stdin.on("error", ()=>{});
                try {
                    child.stdin.write(promptText);
                    child.stdin.end();
                } catch  {
                /* ignore — error/close handlers below surface failures */ }
                if (signal) {
                    signal.addEventListener("abort", ()=>{
                        if (!child.killed) child.kill("SIGTERM");
                        finish();
                    });
                }
                child.on("error", (err)=>{
                    const message = err?.message || String(err);
                    emitError(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message));
                });
                let stderrTail = "";
                child.stdout?.on("data", (chunk)=>{
                    emitDelta(chunk.toString("utf8"));
                });
                child.stderr?.on("data", (chunk)=>{
                    stderrTail = (stderrTail + chunk.toString("utf8")).slice(-2000);
                    log?.debug?.("AUGGIE", `stderr: ${chunk.toString("utf8").slice(0, 200)}`);
                });
                child.on("close", (code)=>{
                    if (finished) return;
                    if (code !== 0) {
                        emitError((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Auggie CLI exited with code ${code}${stderrTail ? `: ${stderrTail}` : ""}`));
                        return;
                    }
                    emitStop();
                });
            },
            cancel () {
            // Stream cancelled by the consumer — nothing extra to clean up here;
            // the abort-signal listener above (if provided) handles process kill.
            }
        });
        return new Response(sseStream, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
            }
        });
    }
    runNonStreaming(auggieBin, model, promptText, signal, log) {
        return new Promise((resolve)=>{
            let child;
            try {
                child = this.spawnAuggie(auggieBin, model, promptText);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                resolve(buildAuggieErrorResponse(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message)));
                return;
            }
            let stdout = "";
            let stderrTail = "";
            let settled = false;
            const settle = (response)=>{
                if (settled) return;
                settled = true;
                resolve(response);
            };
            if (signal) {
                signal.addEventListener("abort", ()=>{
                    if (!child.killed) child.kill("SIGTERM");
                    settle(buildAuggieErrorResponse((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])("Auggie CLI request aborted")));
                });
            }
            child.stdout?.on("data", (chunk)=>{
                stdout += chunk.toString("utf8");
            });
            child.stderr?.on("data", (chunk)=>{
                stderrTail = (stderrTail + chunk.toString("utf8")).slice(-2000);
                log?.debug?.("AUGGIE", `stderr: ${chunk.toString("utf8").slice(0, 200)}`);
            });
            child.on("error", (err)=>{
                const message = err?.message || String(err);
                settle(buildAuggieErrorResponse(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message)));
            });
            child.on("close", (code)=>{
                if (code !== 0) {
                    settle(buildAuggieErrorResponse((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Auggie CLI exited with code ${code}${stderrTail ? `: ${stderrTail}` : ""}`)));
                    return;
                }
                settle(buildChatCompletionResponse(model, promptText, stdout));
            });
        });
    }
}
function buildChatCompletionResponse(model, promptText, content) {
    const trimmed = content.trim();
    const body = {
        id: `chatcmpl-auggie-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: trimmed
                },
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: Math.ceil(promptText.length / 4),
            completion_tokens: Math.ceil(trimmed.length / 4),
            total_tokens: Math.ceil((promptText.length + trimmed.length) / 4),
            estimated: true
        }
    };
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
function buildAuggieErrorResponse(message) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(502, message);
}
/**
 * Build a one-shot SSE error Response (single sanitized error event + [DONE]).
 * Used for pre-spawn rejections on the streaming path (e.g. an invalid model)
 * where no subprocess is ever started.
 */ function buildAuggieSseError(message) {
    const enc = new TextEncoder();
    const sseStream = new ReadableStream({
        start (controller) {
            controller.enqueue(enc.encode(`data: ${JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildErrorBody"])(400, message))}\n\n`));
            controller.enqueue(enc.encode("data: [DONE]\n\n"));
            controller.close();
        }
    });
    return new Response(sseStream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        }
    });
}
function __resetAuggieModels() {
    liveModelSet = null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_executors_1q1a6vy._.js.map