module.exports = [
"[project]/src/shared/constants/claudeCodeClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Wire-version data captured from the signed Claude Code binary.
 *
 * Keep this leaf dependency-free so server executors, compatibility bridges,
 * and client-facing identity presets can share one source of truth.
 */ __turbopack_context__.s([
    "CLAUDE_CODE_CLIENT_BILLING_VERSION",
    ()=>CLAUDE_CODE_CLIENT_BILLING_VERSION,
    "CLAUDE_CODE_CLIENT_BUILD_REVISION",
    ()=>CLAUDE_CODE_CLIENT_BUILD_REVISION,
    "CLAUDE_CODE_CLIENT_VERSION",
    ()=>CLAUDE_CODE_CLIENT_VERSION,
    "CLAUDE_CODE_RUNTIME_VERSION",
    ()=>CLAUDE_CODE_RUNTIME_VERSION,
    "CLAUDE_CODE_SDK_PACKAGE_VERSION",
    ()=>CLAUDE_CODE_SDK_PACKAGE_VERSION,
    "getClaudeCodeUserAgent",
    ()=>getClaudeCodeUserAgent
]);
const CLAUDE_CODE_CLIENT_VERSION = "2.1.220";
const CLAUDE_CODE_CLIENT_BUILD_REVISION = "1f2";
const CLAUDE_CODE_CLIENT_BILLING_VERSION = `${CLAUDE_CODE_CLIENT_VERSION}.${CLAUDE_CODE_CLIENT_BUILD_REVISION}`;
const CLAUDE_CODE_SDK_PACKAGE_VERSION = "0.94.0";
const CLAUDE_CODE_RUNTIME_VERSION = "v26.3.0";
function getClaudeCodeUserAgent(entrypoint) {
    return `claude-cli/${CLAUDE_CODE_CLIENT_VERSION} (external, ${entrypoint})`;
}
}),
"[project]/src/shared/constants/codexClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_CLI_RS_ORIGINATOR",
    ()=>CODEX_CLI_RS_ORIGINATOR,
    "DEFAULT_CODEX_CLIENT_VERSION",
    ()=>DEFAULT_CODEX_CLIENT_VERSION,
    "getCodexCliRsHeaders",
    ()=>getCodexCliRsHeaders
]);
const DEFAULT_CODEX_CLIENT_VERSION = "0.146.0";
const CODEX_CLI_RS_ORIGINATOR = "codex_cli_rs";
function getCodexCliRsHeaders(version = DEFAULT_CODEX_CLIENT_VERSION) {
    return {
        "User-Agent": `${CODEX_CLI_RS_ORIGINATOR}/${version}`,
        originator: CODEX_CLI_RS_ORIGINATOR
    };
}
}),
"[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITLAB_DUO_DEFAULT_BASE_URL",
    ()=>GITLAB_DUO_DEFAULT_BASE_URL,
    "buildGitLabDirectGatewayUrl",
    ()=>buildGitLabDirectGatewayUrl,
    "buildGitLabOAuthEndpoints",
    ()=>buildGitLabOAuthEndpoints,
    "getCachedGitLabDirectAccess",
    ()=>getCachedGitLabDirectAccess,
    "isGitLabDirectAccessDisabled",
    ()=>isGitLabDirectAccessDisabled,
    "normalizeGitLabBaseUrl",
    ()=>normalizeGitLabBaseUrl,
    "parseGitLabDirectAccessDetails",
    ()=>parseGitLabDirectAccessDetails,
    "resolveGitLabOAuthBaseUrl",
    ()=>resolveGitLabOAuthBaseUrl
]);
const GITLAB_DUO_DEFAULT_BASE_URL = process.env.GITLAB_DUO_BASE_URL || process.env.GITLAB_BASE_URL || "https://gitlab.com";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeGitLabBaseUrl(baseUrl) {
    const raw = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (raw || GITLAB_DUO_DEFAULT_BASE_URL).replace(/\/$/, "");
}
function resolveGitLabOAuthBaseUrl(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeGitLabBaseUrl(data.baseUrl);
}
function buildGitLabOAuthEndpoints(baseUrl) {
    const root = normalizeGitLabBaseUrl(baseUrl);
    return {
        root,
        authorizeUrl: `${root}/oauth/authorize`,
        tokenUrl: `${root}/oauth/token`,
        userUrl: `${root}/api/v4/user`,
        directAccessUrl: `${root}/api/v4/code_suggestions/direct_access`,
        publicCompletionsUrl: `${root}/api/v4/code_suggestions/completions`
    };
}
function buildGitLabDirectGatewayUrl(baseUrl) {
    const normalized = normalizeGitLabBaseUrl(baseUrl);
    if (normalized.endsWith("/ai/v2/completions")) {
        return normalized;
    }
    if (normalized.endsWith("/ai/v2")) {
        return `${normalized}/completions`;
    }
    return `${normalized}/ai/v2/completions`;
}
function parseGitLabDirectAccessDetails(payload) {
    const data = asRecord(payload);
    const token = typeof data.token === "string" ? data.token.trim() : "";
    const baseUrl = typeof data.base_url === "string" ? data.base_url.trim() : "";
    if (!token || !baseUrl) {
        return null;
    }
    const rawHeaders = asRecord(data.headers);
    const headers = Object.fromEntries(Object.entries(rawHeaders).filter((entry)=>typeof entry[0] === "string" && typeof entry[1] === "string"));
    const expiresAt = typeof data.expires_at === "number" && Number.isFinite(data.expires_at) ? new Date(data.expires_at * 1000).toISOString() : null;
    return {
        token,
        baseUrl: normalizeGitLabBaseUrl(baseUrl),
        expiresAt,
        headers
    };
}
function getCachedGitLabDirectAccess(providerSpecificData, minValidityMs = 60_000) {
    const data = asRecord(providerSpecificData);
    const cache = data.gitlabDirectAccess ?? data.directAccessCache;
    const parsed = parseGitLabDirectAccessDetails(cache);
    if (!parsed) {
        return null;
    }
    if (!parsed.expiresAt) {
        return parsed;
    }
    const expiresAtMs = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now() + minValidityMs) {
        return null;
    }
    return parsed;
}
function isGitLabDirectAccessDisabled(status, bodyText) {
    return status === 403 && bodyText.toLowerCase().includes("direct connections are disabled");
}
}),
"[project]/src/lib/db/reasoningCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupExpiredReasoning",
    ()=>cleanupExpiredReasoning,
    "clearAllReasoningCache",
    ()=>clearAllReasoningCache,
    "deleteReasoningCache",
    ()=>deleteReasoningCache,
    "getReasoningCache",
    ()=>getReasoningCache,
    "getReasoningCacheEntries",
    ()=>getReasoningCacheEntries,
    "getReasoningCacheStats",
    ()=>getReasoningCacheStats,
    "setReasoningCache",
    ()=>setReasoningCache
]);
/**
 * reasoningCache.ts — DB domain module for the Reasoning Replay Cache.
 *
 * Persists reasoning_content from thinking-mode models (DeepSeek V4, Kimi K2,
 * Qwen-Thinking, etc.) keyed by tool_call_id. Used for crash recovery and
 * dashboard visibility. The hot path uses the in-memory cache in
 * open-sse/services/reasoningCache.ts; this module is the persistence layer.
 *
 * @see Issue #1628
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
// ──────────────── Constants ────────────────
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
function toUnixEpochSeconds(dateMs) {
    return Math.floor(dateMs / 1000);
}
const EXPIRES_AT_EPOCH_SQL = `COALESCE(
  CASE
    WHEN typeof(expires_at) IN ('integer', 'real') THEN CAST(expires_at AS INTEGER)
    WHEN typeof(expires_at) = 'text' AND expires_at <> '' AND expires_at NOT GLOB '*[^0-9]*'
      THEN CAST(expires_at AS INTEGER)
    ELSE unixepoch(expires_at)
  END,
  0
)`;
function epochSecondsToIso(value) {
    const text = String(value);
    const seconds = typeof value === "number" || text !== "" && !/[^0-9]/.test(text) ? Number.parseInt(text, 10) : NaN;
    if (Number.isFinite(seconds) && seconds > 0) {
        return new Date(seconds * 1000).toISOString();
    }
    const parsedMs = Date.parse(text);
    if (Number.isFinite(parsedMs)) {
        return new Date(parsedMs).toISOString();
    }
    return String(value);
}
const MAX_ENTRY_BYTES = 10000;
function setReasoningCache(toolCallId, provider, model, reasoning, ttlMs = DEFAULT_TTL_MS) {
    if (reasoning.length > MAX_ENTRY_BYTES) {
        reasoning = reasoning.slice(0, MAX_ENTRY_BYTES);
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const expiresAt = toUnixEpochSeconds(Date.now() + ttlMs);
    const charCount = reasoning.length;
    db.prepare(`INSERT OR REPLACE INTO reasoning_cache
       (tool_call_id, provider, model, reasoning, char_count, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`).run(toolCallId, provider, model, reasoning, charCount, expiresAt);
}
function getReasoningCache(toolCallId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT reasoning, provider, model FROM reasoning_cache
       WHERE tool_call_id = ? AND ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`).get(toolCallId);
    return row ?? null;
}
function deleteReasoningCache(toolCallId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`DELETE FROM reasoning_cache WHERE tool_call_id = ?`).run(toolCallId);
    return result.changes;
}
function cleanupExpiredReasoning() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`DELETE FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} <= unixepoch('now')`).run();
    return result.changes;
}
function clearAllReasoningCache(provider) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (provider) {
        const result = db.prepare(`DELETE FROM reasoning_cache WHERE provider = ?`).run(provider);
        return result.changes;
    }
    const result = db.prepare(`DELETE FROM reasoning_cache`).run();
    return result.changes;
}
function getReasoningCacheStats() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Total counts
    const totals = db.prepare(`SELECT COUNT(*) as total_entries, COALESCE(SUM(char_count), 0) as total_chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`).get();
    // By provider
    const providerRows = db.prepare(`SELECT provider, COUNT(*) as entries, COALESCE(SUM(char_count), 0) as chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')
       GROUP BY provider ORDER BY entries DESC`).all();
    const byProvider = {};
    for (const row of providerRows){
        byProvider[row.provider] = {
            entries: row.entries,
            chars: row.chars
        };
    }
    // By model
    const modelRows = db.prepare(`SELECT model, COUNT(*) as entries, COALESCE(SUM(char_count), 0) as chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')
       GROUP BY model ORDER BY entries DESC`).all();
    const byModel = {};
    for (const row of modelRows){
        byModel[row.model] = {
            entries: row.entries,
            chars: row.chars
        };
    }
    // Oldest/newest
    const oldest = db.prepare(`SELECT created_at FROM reasoning_cache
       WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now') ORDER BY created_at ASC LIMIT 1`).get();
    const newest = db.prepare(`SELECT created_at FROM reasoning_cache
       WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now') ORDER BY created_at DESC LIMIT 1`).get();
    return {
        totalEntries: totals.total_entries,
        totalChars: totals.total_chars,
        byProvider,
        byModel,
        oldestEntry: oldest?.created_at ?? null,
        newestEntry: newest?.created_at ?? null
    };
}
function getReasoningCacheEntries(opts = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = opts.offset ?? 0;
    const conditions = [
        `${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`
    ];
    const params = [];
    if (opts.provider) {
        conditions.push("provider = ?");
        params.push(opts.provider);
    }
    if (opts.model) {
        conditions.push("model = ?");
        params.push(opts.model);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db.prepare(`SELECT tool_call_id, provider, model, reasoning, char_count, created_at, expires_at
       FROM reasoning_cache ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`).all(...params, limit, offset);
    return rows.map((row)=>({
            toolCallId: row.tool_call_id,
            provider: row.provider,
            model: row.model,
            reasoning: row.reasoning,
            charCount: row.char_count,
            createdAt: row.created_at,
            expiresAt: epochSecondsToIso(row.expires_at)
        }));
}
}),
"[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized specifications for AI Models.
 * Contains maximum token caps and thinking budgets to prevent API errors
 * when clients request more than the model supports.
 */ __turbopack_context__.s([
    "MODEL_SPECS",
    ()=>MODEL_SPECS,
    "capMaxOutputTokens",
    ()=>capMaxOutputTokens,
    "capThinkingBudget",
    ()=>capThinkingBudget,
    "findModelSpecIdByExactOrAlias",
    ()=>findModelSpecIdByExactOrAlias,
    "getAuthoritativeContextWindow",
    ()=>getAuthoritativeContextWindow,
    "getAuthoritativeProviderContextWindow",
    ()=>getAuthoritativeProviderContextWindow,
    "getCanonicalModelSpecId",
    ()=>getCanonicalModelSpecId,
    "getDefaultThinkingBudget",
    ()=>getDefaultThinkingBudget,
    "getMaxEffortWhenThinkingDisabled",
    ()=>getMaxEffortWhenThinkingDisabled,
    "getModelSpec",
    ()=>getModelSpec,
    "isAdaptiveThinkingOnly",
    ()=>isAdaptiveThinkingOnly,
    "normalizeThinkingForModel",
    ()=>normalizeThinkingForModel,
    "resolveModelAlias",
    ()=>resolveModelAlias
]);
const BEDROCK_CLAUDE_ALIASES = (...modelIds)=>[
        ...new Set(modelIds.flatMap((modelId)=>[
                modelId,
                `anthropic.${modelId}`,
                `eu.anthropic.${modelId}`,
                `us.anthropic.${modelId}`,
                `global.anthropic.${modelId}`,
                `bedrock/anthropic.${modelId}`,
                `bedrock/eu.anthropic.${modelId}`,
                `bedrock/us.anthropic.${modelId}`,
                `bedrock/global.anthropic.${modelId}`
            ]))
    ];
// Provider discovery/sync sources can under-report GLM-5.2 IDs as 128K.
// Keep native/bare Z.AI GLM-5.2 context authoritative, but do not blindly apply
// it to every provider-wrapped alias: hosted providers can and do cap lower.
const AUTHORITATIVE_CONTEXT_WINDOW_MODEL_IDS = new Set([
    "glm-5.2",
    "glm-5.2-high",
    "glm-5.2-max"
]);
const AUTHORITATIVE_PROVIDER_CONTEXT_WINDOWS = new Map([
    [
        "cloudflare-ai/@cf/zai-org/glm-5.2",
        262144
    ],
    // Hugging Face Router has 1M-capable backends, but bare routing can select
    // lower-context providers (notably Together at 262K), so advertise a safe floor
    // unless the caller can pin a 1M-capable backend.
    [
        "huggingface/zai-org/glm-5.2",
        262144
    ],
    [
        "opencode/glm-5.2",
        1000000
    ],
    [
        "opencode-zen/glm-5.2",
        1000000
    ],
    [
        "opencode-go/glm-5.2",
        1000000
    ],
    [
        "zenmux/z-ai/glm-5.2",
        1000000
    ],
    [
        "zenmux/z-ai/glm-5.2-free",
        1000000
    ]
]);
const GPT_5_6_MODEL_SPEC = {
    maxOutputTokens: 128000,
    contextWindow: 1050000,
    // Reserve 32K for visible response: thinking + response must both fit
    // under maxOutputTokens. A cap equal to maxOutputTokens leaves zero room
    // for the actual response when thinking consumes the full budget.
    thinkingBudgetCap: 96000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true
};
const GEMINI_35_FLASH_MODEL_SPEC = {
    maxOutputTokens: 65536,
    contextWindow: 1048576,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true
};
const MODEL_SPECS = {
    "gpt-5.6": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6"
        ]
    },
    "gpt-5.6-sol": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-sol"
        ]
    },
    "gpt-5.6-terra": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-terra"
        ]
    },
    "gpt-5.6-luna": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-luna"
        ]
    },
    "gpt-5.5": {
        maxOutputTokens: 128000,
        contextWindow: 1050000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "gpt-5.4": {
        maxOutputTokens: 131072,
        contextWindow: 409600,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-5.4"
        ]
    },
    // ── GPT-4o family ──────────────────────────────────────────────
    "gpt-4o-mini": {
        maxOutputTokens: 16384,
        contextWindow: 128000,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-4o-mini"
        ]
    },
    "gpt-4o": {
        maxOutputTokens: 16384,
        contextWindow: 128000,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-4o"
        ]
    },
    // ── Gemini 2.5 and 3.5 Flash series ──────────────────────────────
    "gemini-2.5-flash": {
        maxOutputTokens: 65536,
        contextWindow: 1048576,
        // #3842: real Google max thinking budget for 2.5-flash is 24576; declaring the
        // cap makes capThinkingBudget() actually clamp instead of passing values through.
        thinkingBudgetCap: 24576,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true
    },
    "gemini-3.5-flash-extra-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        thinkingBudgetCap: 0
    },
    "gemini-3.5-flash-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3-flash-agent": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        thinkingBudgetCap: 0
    },
    // ── Gemini 3.6 Flash (Antigravity live tiers) ───────────────────
    // The model id itself selects the upstream 10k/4k/1k reasoning tier. Antigravity
    // still rejects client-supplied thinking parameters, so keep the explicit-parameter
    // capability aligned with the existing Gemini 3.5 tier ids.
    "gemini-3.6-flash-high": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3.6-flash-medium": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3.6-flash-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    // ── Gemini 3 Flash series ───────────────────────────────────────
    "gemini-3-flash": {
        maxOutputTokens: 65536,
        contextWindow: 1048576,
        defaultThinkingBudget: 0,
        thinkingBudgetCap: 0,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite-preview"
        ]
    },
    // ── Gemini 3.1 Pro ───────────────────────────────────────────────
    "gemini-3.1-pro": {
        maxOutputTokens: 65535,
        contextWindow: 1048576,
        defaultThinkingBudget: 24576,
        thinkingBudgetCap: 32768,
        thinkingOverhead: 1000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-pro-agent",
            "gemini-3.1-pro-high",
            "gemini-3-pro-high",
            "gemini-3-pro-preview",
            "gemini-3.1-pro-preview",
            "gemini-3.1-pro-preview-customtools"
        ]
    },
    // ── Gemini 3.1 Pro Low (deprecated, kept for back-compat) ────────
    "gemini-3.1-pro-low": {
        maxOutputTokens: 65535,
        contextWindow: 1048576,
        defaultThinkingBudget: 8192,
        thinkingBudgetCap: 16000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-3-pro-low"
        ]
    },
    // ── Gemini 3.5 Flash ─────────────────────────────────────────────
    "gemini-3.5-flash": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        aliases: [
            "gemini-3.5-flash-high"
        ]
    },
    // ── Claude Opus 4.5 ─────────────────────────────────────────────
    "claude-opus-4-5": {
        maxOutputTokens: 32768,
        contextWindow: 200000,
        defaultThinkingBudget: 10000,
        thinkingBudgetCap: 32000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Claude Sonnet 4.5 ───────────────────────────────────────────
    "claude-sonnet-4-5": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-4-5", "claude-sonnet-4-5-20250929")
    },
    // ── Claude Opus 4.5 (full ID — overrides prefix match on claude-opus-4-5) ──
    "claude-opus-4-5-20251101": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        defaultThinkingBudget: 10000,
        thinkingBudgetCap: 32000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Claude Sonnet 4.6 ───────────────────────────────────────────
    "claude-sonnet-4-6": {
        maxOutputTokens: 64000,
        contextWindow: 1000000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-4-6", "claude-sonnet-4.6")
    },
    // ── Claude Sonnet 5 ─────────────────────────────────────────────
    "claude-sonnet-5": {
        // 1M context, 128K max output. Adaptive-thinking-only (manual
        // budget_tokens / thinking.type:"enabled" return 400; effort-steered);
        // unlike Fable 5 it still accepts thinking.type:"disabled".
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-5")
    },
    // ── Claude Opus 4.6 ─────────────────────────────────────────────
    "claude-opus-4-6": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Anthropic accepts thinking.budget_tokens in [1024, 128000]; cap
        // a bit below to leave headroom for the visible response within
        // max_tokens (thinking + response must both fit under max_tokens).
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-6", "claude-opus-4.6")
    },
    // ── Claude Opus 4.7 ─────────────────────────────────────────────
    "claude-opus-4-7": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Opus 4.7 removed manual extended thinking: a fixed `thinking.budget_tokens`
        // (or `thinking.type:"enabled"`) returns 400. Reasoning is adaptive-only and
        // steered by `output_config.effort`. defaultThinkingBudget/thinkingBudgetCap
        // are retained only as caps for any legacy budget path; the request flow
        // collapses manual thinking to adaptive before dispatch (see adaptiveThinkingOnly).
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-7", "claude-opus-4.7")
    },
    // ── Claude Fable 5 ──────────────────────────────────────────────
    "claude-fable-5": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        // Fable 5 defaults to adaptive thinking and rejects `thinking.type:"disabled"` (#3554).
        rejectsThinkingDisabled: true,
        // …and, like Opus 4.7+, rejects manual budgets/`type:"enabled"` (adaptive-only).
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-fable-5")
    },
    // ── Claude Opus 5 ───────────────────────────────────────────────
    "claude-opus-5": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        maxEffortWhenThinkingDisabled: "high",
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-5")
    },
    // ── Claude Opus 4.8 ─────────────────────────────────────────────
    "claude-opus-4-8": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Opus 4.8 inherits Opus 4.7's adaptive thinking constraints: no fixed
        // thinking budget requests, with effort controlled by output_config.
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-8", "claude-opus-4.8", "claude-opus-4.8-fast")
    },
    // ── Claude Sonnet 4.5 ───────────────────────────────────────────
    "claude-sonnet-4-5-20250929": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "claude-sonnet-4.5"
        ]
    },
    // ── Claude Haiku 4.5 ────────────────────────────────────────────
    "claude-haiku-4-5-20251001": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "claude-haiku-4.5"
        ]
    },
    // ── Kimi K3 (Moonshot API — 1M context/output, native vision) ────
    // `k3` is the Kimi Coding / kimi-coding-apikey wire id (#8250).
    "kimi-k3": {
        maxOutputTokens: 1048576,
        contextWindow: 1048576,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "k3"
        ]
    },
    // ── Kimi K2.6 (Moonshot API — 262K native) ──────────────────────
    "kimi-k2.6": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.6-thinking"
        ]
    },
    // ── Kimi K2.7 Code (Moonshot — 262K native, parity with K2.6) ───
    // #3761: importing this via Ollama Cloud's sparse /v1/models gave it no caps, so it
    // fell back to the 128K/8K defaults and lost vision/thinking. Pin the real values.
    "kimi-k2.7-code": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.7",
            "kimi-k2.7-code-thinking",
            "kimi-k2.7-code-highspeed"
        ]
    },
    // ── Kimi K2.5 (Moonshot — 262K native, parity with K2.6) ────────
    "kimi-k2.5": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.5-thinking"
        ]
    },
    // ── Qwen3.x Plus / Max (Bailian — multimodal text/image/video, 1M context) ─
    "qwen3-max": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "qwen3.7-max",
            "qwen3-max-2026-01-23"
        ]
    },
    "qwen3.8-max-preview": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "qwen3.6-plus": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "qwen3.5-plus": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Xiaomi MiMo V2.5 (1M context, consensus across 7+ sync sources) ──
    // Vision: ONLY mimo-v2.5 and mimo-v2-omni accept images per Xiaomi's docs
    // (mimo.mi.com .../image-understanding). The *-pro chat models are TEXT-ONLY;
    // models.dev mislabels them (hermes-agent#18884) — a hard override in
    // src/lib/modelCapabilities.ts also beats that wrong synced attachment.
    "mimo-v2.5-pro": {
        maxOutputTokens: 131072,
        contextWindow: 1048576,
        supportsTools: true,
        supportsVision: false
    },
    "mimo-v2.5": {
        maxOutputTokens: 131072,
        contextWindow: 1048576,
        supportsTools: true,
        supportsVision: true
    },
    "mimo-v2-pro": {
        maxOutputTokens: 131072,
        contextWindow: 262144,
        supportsTools: true,
        supportsVision: false
    },
    "mimo-v2-omni": {
        maxOutputTokens: 131072,
        contextWindow: 262144,
        supportsTools: true,
        supportsVision: true
    },
    "mimo-v2-flash": {
        maxOutputTokens: 65536,
        contextWindow: 262144,
        supportsTools: true
    },
    // ── Z.AI GLM-5.2 (1M context, 128K max output, effort tiers) ────
    "glm-5.2": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5.2-high": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5.2-max": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    // ── Z.AI GLM-5.x (200K context, 128K max output) ─────────────────
    "glm-5.1": {
        maxOutputTokens: 128000,
        contextWindow: 200000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5": {
        maxOutputTokens: 128000,
        contextWindow: 200000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    // ── MiniMax M3 (1M context, 512K max output) ─────────────────────
    // max output verified against MiniMax docs / OpenRouter / Artificial
    // Analysis (Nov 2025 launch): 1,048,576-token context, up to 512K output.
    "minimax-m3": {
        maxOutputTokens: 512000,
        contextWindow: 1048576,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M3",
            "MiniMaxAI/MiniMax-M3"
        ]
    },
    // ── MiniMax M2.x (200K context family) ───────────────────────────
    "minimax-m2.7": {
        maxOutputTokens: 131072,
        contextWindow: 204800,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M2.7",
            "MiniMaxAI/MiniMax-M2.7"
        ]
    },
    "minimax-m2.5": {
        maxOutputTokens: 131072,
        contextWindow: 200000,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M2.5"
        ]
    },
    // ── DeepSeek V4 (1M context, 384K max output) ────────────────────
    "deepseek-v4-pro": {
        maxOutputTokens: 384000,
        contextWindow: 1000000,
        // Reserve 4K for visible response: thinking + response must both fit
        // under maxOutputTokens. A cap equal to maxOutputTokens leaves zero room
        // for the actual response when thinking consumes the full budget.
        thinkingBudgetCap: 380000,
        supportsThinking: true,
        supportsTools: true
    },
    "deepseek-v4-flash": {
        maxOutputTokens: 384000,
        contextWindow: 1000000,
        thinkingBudgetCap: 380000,
        supportsThinking: true,
        supportsTools: true
    },
    // ── Tencent Hunyuan 3 Preview ────────────────────────────────────
    "hy3-preview": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true
    },
    // Defaults
    __default__: {}
};
// #8697-adjacent: getCanonicalModelSpecId() re-scanned Object.keys/entries(MODEL_SPECS)
// up to 3 times per call (exact ci, alias ci, prefix) — the top hotspot in a full
// catalog-rebuild profile once the pricing-path bottlenecks were fixed. MODEL_SPECS is
// a static module constant (never mutated at runtime), so the lowercase index below is
// built once, lazily, on first use and never invalidated. Iteration order for the
// prefix-match candidates is preserved exactly (same Object.keys() insertion order) so
// resolution outcomes for ambiguous prefixes are unchanged.
let modelSpecIndex = null;
function getModelSpecIndex() {
    if (modelSpecIndex) return modelSpecIndex;
    const exactCi = new Map();
    const aliasCi = new Map();
    const aliasExact = new Map();
    const prefixCandidates = [];
    for (const [canonical, spec] of Object.entries(MODEL_SPECS)){
        const lowerCanonical = canonical.toLowerCase();
        if (!exactCi.has(lowerCanonical)) exactCi.set(lowerCanonical, canonical);
        for (const alias of spec.aliases || []){
            const lowerAlias = alias.toLowerCase();
            if (!aliasCi.has(lowerAlias)) aliasCi.set(lowerAlias, canonical);
            if (!aliasExact.has(alias)) aliasExact.set(alias, canonical);
        }
        if (canonical !== "__default__") prefixCandidates.push([
            lowerCanonical,
            canonical
        ]);
    }
    modelSpecIndex = {
        exactCi,
        aliasCi,
        aliasExact,
        prefixCandidates
    };
    return modelSpecIndex;
}
function findModelSpecIdByExactOrAlias(modelId) {
    const lower = modelId.toLowerCase();
    const index = getModelSpecIndex();
    const exactHit = index.exactCi.get(lower);
    if (exactHit && exactHit !== "__default__") return exactHit;
    const aliasHit = index.aliasCi.get(lower);
    if (aliasHit && aliasHit !== "__default__") return aliasHit;
    return null;
}
function getCanonicalModelSpecId(modelId) {
    if (MODEL_SPECS[modelId]) return modelId;
    // Case-insensitive lookups: upstream model ids are often capitalized
    // (e.g. "MiniMax-M2.7") while specs/aliases use lowercase ids (#3141).
    const lower = modelId.toLowerCase();
    const index = getModelSpecIndex();
    // Exact match (case-insensitive)
    const exactHit = index.exactCi.get(lower);
    if (exactHit) return exactHit;
    // Buscas por alias (case-insensitive)
    const aliasHit = index.aliasCi.get(lower);
    if (aliasHit) return aliasHit;
    // Prefix matching (case-insensitive) — same insertion-order iteration as before,
    // first match wins.
    for (const [lowerKey, canonical] of index.prefixCandidates){
        if (lower.startsWith(lowerKey)) return canonical;
    }
    return null;
}
function getModelSpec(modelId) {
    const canonical = getCanonicalModelSpecId(modelId);
    return canonical ? MODEL_SPECS[canonical] : undefined;
}
function getAuthoritativeContextWindow(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return null;
    const normalized = modelId.toLowerCase();
    for (const canonical of AUTHORITATIVE_CONTEXT_WINDOW_MODEL_IDS){
        if (canonical.toLowerCase() === normalized) return MODEL_SPECS[canonical]?.contextWindow ?? null;
    }
    return null;
}
function getAuthoritativeProviderContextWindow(provider, modelId) {
    if (typeof provider !== "string" || typeof modelId !== "string") return null;
    const key = `${provider}/${modelId}`.toLowerCase();
    return AUTHORITATIVE_PROVIDER_CONTEXT_WINDOWS.get(key) ?? null;
}
function normalizeThinkingForModel(body, modelId) {
    const thinking = body?.thinking;
    if (thinking && typeof thinking === "object" && thinking.type === "disabled" && getModelSpec(modelId)?.rejectsThinkingDisabled) {
        const { thinking: _omitted, ...rest } = body;
        return rest;
    }
    return body;
}
function capMaxOutputTokens(modelId, requested) {
    const spec = getModelSpec(modelId);
    const cap = spec?.maxOutputTokens;
    const hasRequested = typeof requested === "number" && Number.isFinite(requested);
    if (typeof cap !== "number") return hasRequested ? requested : undefined;
    return hasRequested ? Math.min(requested, cap) : cap;
}
function getDefaultThinkingBudget(modelId) {
    return getModelSpec(modelId)?.defaultThinkingBudget ?? 0;
}
function isAdaptiveThinkingOnly(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return false;
    return getModelSpec(modelId)?.adaptiveThinkingOnly === true;
}
function getMaxEffortWhenThinkingDisabled(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return null;
    return getModelSpec(modelId)?.maxEffortWhenThinkingDisabled ?? null;
}
function capThinkingBudget(modelId, budget) {
    const cap = getModelSpec(modelId)?.thinkingBudgetCap ?? budget;
    return Math.min(budget, cap);
}
function resolveModelAlias(modelId) {
    const hit = getModelSpecIndex().aliasExact.get(modelId);
    return hit ?? modelId;
}
}),
"[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * modelsDevSync/transform — pure data model + transform layer.
 *
 * Extracted verbatim from modelsDevSync.ts. Holds the models.dev data-model
 * types, the provider-id mapping table, and the raw→OmniRoute transform
 * functions. Zero imports, no DB access, no module state — pure functions and
 * static data. The host (modelsDevSync.ts) imports these for its sync
 * orchestration and re-exports the originally-public symbols.
 *
 * @module lib/modelsDevSync/transform
 */ __turbopack_context__.s([
    "MODELS_DEV_PROVIDER_MAP",
    ()=>MODELS_DEV_PROVIDER_MAP,
    "mapProviderId",
    ()=>mapProviderId,
    "transformModelsDevToCapabilities",
    ()=>transformModelsDevToCapabilities,
    "transformModelsDevToPricing",
    ()=>transformModelsDevToPricing
]);
const MODELS_DEV_PROVIDER_MAP = {
    // Major providers
    openai: [
        "openai",
        "cx"
    ],
    anthropic: [
        "anthropic",
        "cc"
    ],
    google: [
        "gemini"
    ],
    "google-vertex": [
        "gemini",
        "vertex"
    ],
    "google-vertex-anthropic": [
        "anthropic",
        "cc",
        "vertex"
    ],
    vertex_ai: [
        "gemini",
        "vertex"
    ],
    deepseek: [
        "deepseek",
        "if"
    ],
    groq: [
        "groq"
    ],
    xai: [
        "xai"
    ],
    mistral: [
        "mistral"
    ],
    togetherai: [
        "together",
        "openrouter"
    ],
    together_ai: [
        "together",
        "openrouter"
    ],
    "fireworks-ai": [
        "fireworks"
    ],
    fireworks: [
        "fireworks"
    ],
    cerebras: [
        "cerebras"
    ],
    cohere: [
        "cohere"
    ],
    nvidia: [
        "nvidia"
    ],
    nebius: [
        "nebius"
    ],
    siliconflow: [
        "siliconflow"
    ],
    hyperbolic: [
        "hyperbolic"
    ],
    huggingface: [
        "hf",
        "huggingface"
    ],
    openrouter: [
        "openrouter"
    ],
    perplexity: [
        "pplx",
        "perplexity"
    ],
    // OAuth / special providers
    bedrock: [
        "kiro",
        "kr"
    ],
    "github-copilot": [
        "github",
        "gh"
    ],
    "github-models": [
        "github",
        "gh"
    ],
    kilo: [
        "kilocode",
        "kc",
        "kilo-gateway"
    ],
    kilocode: [
        "kilocode",
        "kc",
        "kilo-gateway"
    ],
    "kimi-for-coding": [
        "kimi-coding",
        "kmc",
        "kimi-coding-apikey",
        "kmca"
    ],
    // The `opencode` models.dev entry used to map only to "opencode-zen" because
    // that is the historical alias pair. But OmniRoute's catalog & combo targets
    // reference models under BOTH provider IDs:
    //   - `opencode-zen/big-pickle` (alias form)
    //   - `opencode/big-pickle`    (canonical id form, used by live API catalog
    //                               and by combos like "Opencode FREE Omni")
    // If we only store synced capabilities under "opencode-zen", the canonical
    // `opencode/<model>` lookup in getCanonicalModelMetadata returns null and
    // any combo that targets `opencode/...` ends up with no computed context.
    // Symmetric mapping keeps both lookup paths populated.
    opencode: [
        "opencode",
        "opencode-zen"
    ],
    "opencode-go": [
        "opencode-go",
        "opencode-zen"
    ],
    // Additional providers that may overlap with OmniRoute
    alibaba: [
        "ali",
        "alibaba"
    ],
    "alibaba-cn": [
        "ali-cn",
        "alibaba-cn",
        "alibaba-china"
    ],
    "alibaba-coding-plan": [
        "bcp",
        "bailian-coding-plan"
    ],
    zai: [
        "zai",
        "glm"
    ],
    "zai-coding-plan": [
        "zai",
        "glm"
    ],
    moonshotai: [
        "moonshot",
        "kimi"
    ],
    "moonshotai-cn": [
        "moonshot",
        "kimi"
    ],
    moonshot: [
        "moonshot",
        "kimi",
        "kimi-coding",
        "kmc",
        "kmca"
    ],
    minimax: [
        "minimax",
        "minimax-cn"
    ],
    "minimax-cn": [
        "minimax-cn"
    ],
    longcat: [
        "lc",
        "longcat"
    ],
    pollinations: [
        "pol",
        "pollinations"
    ],
    puter: [
        "pu",
        "puter"
    ],
    cloudflare: [
        "cf"
    ],
    scaleway: [
        "scw"
    ],
    ollama: [
        "ollamacloud",
        "ollama-cloud"
    ],
    blackbox: [
        "bb",
        "blackbox"
    ],
    cline: [
        "cl",
        "cline"
    ],
    cursor: [
        "cu",
        "cursor"
    ],
    github: [
        "gh",
        "github"
    ]
};
function mapProviderId(modelsDevProviderId) {
    return MODELS_DEV_PROVIDER_MAP[modelsDevProviderId] || [
        modelsDevProviderId
    ];
}
function transformModelsDevToPricing(raw) {
    const result = {};
    for (const [providerId, providerData] of Object.entries(raw)){
        const omniRouteProviders = mapProviderId(providerId);
        for (const [modelId, model] of Object.entries(providerData.models || {})){
            if (!model.cost) continue;
            // Must have at least input pricing
            if (model.cost.input == null) continue;
            const entry = {
                input: model.cost.input,
                output: model.cost.output ?? 0
            };
            if (model.cost.cache_read != null) {
                entry.cached = model.cost.cache_read;
            }
            if (model.cost.cache_write != null) {
                entry.cache_creation = model.cost.cache_write;
            }
            if (model.cost.reasoning != null) {
                entry.reasoning = model.cost.reasoning;
            }
            // Write to ALL mapped OmniRoute providers
            for (const omniProvider of omniRouteProviders){
                if (!result[omniProvider]) result[omniProvider] = {};
                result[omniProvider][modelId] = entry;
            }
        }
    }
    return result;
}
function transformModelsDevToCapabilities(raw) {
    const result = {};
    for (const [providerId, providerData] of Object.entries(raw)){
        const omniRouteProviders = mapProviderId(providerId);
        for (const [modelId, model] of Object.entries(providerData.models || {})){
            const modalitiesInput = model.modalities?.input ?? [];
            const modalitiesOutput = model.modalities?.output ?? [];
            // #8250: models.dev can ship attachment=false while modalities.input still
            // lists image/video (Kimi K3). Normalize at sync so persisted rows stay
            // internally consistent before resolve-time reconciliation.
            let attachment = model.attachment ?? null;
            if (attachment === false && [
                ...modalitiesInput,
                ...modalitiesOutput
            ].some((entry)=>{
                const lower = String(entry).toLowerCase();
                return lower.includes("image") || lower.includes("video");
            })) {
                attachment = true;
            }
            const cap = {
                tool_call: model.tool_call ?? null,
                reasoning: model.reasoning ?? null,
                attachment,
                structured_output: model.structured_output ?? null,
                temperature: model.temperature ?? null,
                modalities_input: JSON.stringify(modalitiesInput),
                modalities_output: JSON.stringify(modalitiesOutput),
                knowledge_cutoff: model.knowledge ?? null,
                release_date: model.release_date ?? null,
                last_updated: model.last_updated ?? null,
                status: model.status ?? null,
                family: model.family ?? null,
                open_weights: model.open_weights ?? null,
                limit_context: model.limit?.context ?? null,
                limit_input: model.limit?.input ?? null,
                limit_output: model.limit?.output ?? null,
                interleaved_field: typeof model.interleaved === "object" && model.interleaved?.field ? model.interleaved.field : model.interleaved === true ? "reasoning_content" : null
            };
            for (const omniProvider of omniRouteProviders){
                if (!result[omniProvider]) result[omniProvider] = {};
                result[omniProvider][modelId] = cap;
            }
        }
    }
    return result;
}
}),
"[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearModelsDevCapabilities",
    ()=>clearModelsDevCapabilities,
    "clearModelsDevPricing",
    ()=>clearModelsDevPricing,
    "ensureCapabilitiesTable",
    ()=>ensureCapabilitiesTable,
    "fetchModelsDev",
    ()=>fetchModelsDev,
    "getModelsDevPricing",
    ()=>getModelsDevPricing,
    "getSyncStatus",
    ()=>getSyncStatus,
    "getSyncedCapabilities",
    ()=>getSyncedCapabilities,
    "getSyncedCapability",
    ()=>getSyncedCapability,
    "initModelsDevSync",
    ()=>initModelsDevSync,
    "saveModelsDevCapabilities",
    ()=>saveModelsDevCapabilities,
    "saveModelsDevPricing",
    ()=>saveModelsDevPricing,
    "startPeriodicSync",
    ()=>startPeriodicSync,
    "stopPeriodicSync",
    ()=>stopPeriodicSync,
    "syncModelsDev",
    ()=>syncModelsDev
]);
/**
 * modelsDevSync.ts — Fetch model specs, pricing, and capabilities from models.dev
 *
 * models.dev (https://github.com/anomalyco/models.dev) is an open-source database
 * of AI model specifications maintained by the SST/OpenCode team (MIT license).
 *
 * API: https://models.dev/api.json
 * - 109 providers, 4,146+ models
 * - Data: pricing, capabilities, limits, modalities, metadata
 *
 * Resolution order (highest → lowest):
 *   1. User overrides (`pricing` namespace)
 *   2. models.dev sync (`models_dev_pricing` namespace)
 *   3. LiteLLM sync (`pricing_synced` namespace)
 *   4. Hardcoded defaults (`pricing.ts`)
 *
 * Opt-in via MODELS_DEV_SYNC_ENABLED=true (default: false).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)");
;
;
;
;
;
// ─── Configuration ───────────────────────────────────────
const MODELS_DEV_API_URL = "https://models.dev/api.json";
const parsedInterval = parseInt(process.env.MODELS_DEV_SYNC_INTERVAL || "86400", 10);
const SYNC_INTERVAL_MS = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval * 1000 : 86400 * 1000;
// ─── Periodic sync state ─────────────────────────────────
let syncTimer = null;
let activeSyncAbortController = null;
let activeSyncPromise = null;
let activePeriodicSyncToken = null;
let lastSyncTime = null;
let lastSyncModelCount = 0;
let lastSyncCapabilityCount = 0;
let activeSyncIntervalMs = SYNC_INTERVAL_MS;
let cachedData = null;
let cacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let cachedCapabilities = null;
let cachedCapabilitiesLoadedAll = false;
const MODELS_DEV_ABORT_ERROR = "AbortError";
function createAbortError() {
    const error = new Error("models.dev sync aborted");
    error.name = MODELS_DEV_ABORT_ERROR;
    return error;
}
function isAbortError(error) {
    return error instanceof Error && error.name === MODELS_DEV_ABORT_ERROR;
}
function createAbortedSyncResult(dryRun) {
    return {
        success: false,
        modelCount: 0,
        providerCount: 0,
        capabilityCount: 0,
        dryRun,
        error: "aborted"
    };
}
async function sleepWithAbort(ms, signal) {
    if (signal?.aborted) {
        throw createAbortError();
    }
    await new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>{
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = ()=>{
            clearTimeout(timeout);
            reject(createAbortError());
        };
        signal?.addEventListener("abort", onAbort, {
            once: true
        });
    });
}
async function fetchModelsDev(signal) {
    // Return cached data if still fresh
    if (cachedData && Date.now() - cacheTime < CACHE_TTL_MS) {
        return cachedData;
    }
    const response = await fetch(MODELS_DEV_API_URL, {
        signal: signal ?? AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`models.dev fetch failed [${response.status}]: ${response.statusText}`);
    }
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        cachedData = data;
        cacheTime = Date.now();
        return data;
    } catch  {
        throw new Error(`models.dev returned invalid JSON (${text.slice(0, 100)}...)`);
    }
}
// ─── DB: models.dev pricing namespace ────────────────────
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function mapCapabilityRecord(record) {
    return {
        tool_call: record.tool_call === 1 ? true : record.tool_call === 0 ? false : null,
        reasoning: record.reasoning === 1 ? true : record.reasoning === 0 ? false : null,
        attachment: record.attachment === 1 ? true : record.attachment === 0 ? false : null,
        structured_output: record.structured_output === 1 ? true : record.structured_output === 0 ? false : null,
        temperature: record.temperature === 1 ? true : record.temperature === 0 ? false : null,
        modalities_input: typeof record.modalities_input === "string" ? record.modalities_input : "[]",
        modalities_output: typeof record.modalities_output === "string" ? record.modalities_output : "[]",
        knowledge_cutoff: typeof record.knowledge_cutoff === "string" ? record.knowledge_cutoff : null,
        release_date: typeof record.release_date === "string" ? record.release_date : null,
        last_updated: typeof record.last_updated === "string" ? record.last_updated : null,
        status: typeof record.status === "string" ? record.status : null,
        family: typeof record.family === "string" ? record.family : null,
        open_weights: record.open_weights === 1 ? true : record.open_weights === 0 ? false : null,
        limit_context: typeof record.limit_context === "number" ? record.limit_context : null,
        limit_input: typeof record.limit_input === "number" ? record.limit_input : null,
        limit_output: typeof record.limit_output === "number" ? record.limit_output : null,
        interleaved_field: typeof record.interleaved_field === "string" ? record.interleaved_field : null
    };
}
// #8697: getModelsDevPricing() re-ran the SELECT + JSON.parse of ~180 blobs on
// every call — called once per catalog model (up to ~6091x) instead of once per
// request, freezing the whole server 41-54s on a cold /v1/models rebuild.
// Memoized here, invalidated via the same modelCatalogCacheVersion signal
// save/clearModelsDevPricing already bump through invalidateDbCache("pricing") —
// reusing the existing pattern (getCachedRawProviderConnections et al. in
// db/readCache.ts) instead of introducing a new invalidation mechanism.
let pricingMemo = null;
let pricingMemoVersion = -1; // -1: never equals a real cacheVersion (starts at 0), guarantees a miss on the first call
function getModelsDevPricing() {
    const currentVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    if (pricingMemo !== null && pricingMemoVersion === currentVersion) {
        return pricingMemo;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'models_dev_pricing'").all();
    const synced = {};
    for (const row of rows){
        const record = toRecord(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            synced[key] = JSON.parse(rawValue);
        } catch  {
            console.warn(`[MODELS_DEV] Corrupted pricing data for provider "${key}", skipping`);
        }
    }
    pricingMemo = synced;
    pricingMemoVersion = currentVersion;
    return synced;
}
function saveModelsDevPricing(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('models_dev_pricing', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearModelsDevPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function ensureCapabilitiesTable() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.exec(`
    CREATE TABLE IF NOT EXISTS model_capabilities (
      provider TEXT NOT NULL,
      model_id TEXT NOT NULL,
      tool_call BOOLEAN,
      reasoning BOOLEAN,
      attachment BOOLEAN,
      structured_output BOOLEAN,
      temperature BOOLEAN,
      modalities_input TEXT,
      modalities_output TEXT,
      knowledge_cutoff TEXT,
      release_date TEXT,
      last_updated TEXT,
      status TEXT,
      family TEXT,
      open_weights BOOLEAN,
      limit_context INTEGER,
      limit_input INTEGER,
      limit_output INTEGER,
      interleaved_field TEXT,
      last_synced TEXT,
      PRIMARY KEY (provider, model_id)
    )
  `);
}
function getSyncedCapabilities(provider, modelId) {
    if (cachedCapabilitiesLoadedAll) {
        if (!provider) {
            return cachedCapabilities || {};
        }
        if (!modelId) {
            return cachedCapabilities?.[provider] ? {
                [provider]: cachedCapabilities[provider]
            } : {};
        }
        const providerCaps = cachedCapabilities?.[provider];
        return providerCaps?.[modelId] ? {
            [provider]: {
                [modelId]: providerCaps[modelId]
            }
        } : {};
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    let query = "SELECT * FROM model_capabilities";
    const params = [];
    if (provider) {
        query += " WHERE provider = ?";
        params.push(provider);
        if (modelId) {
            query += " AND model_id = ?";
            params.push(modelId);
        }
    }
    const rows = db.prepare(query).all(...params);
    const result = {};
    for (const row of rows){
        const record = toRecord(row);
        const prov = typeof record.provider === "string" ? record.provider : null;
        const mid = typeof record.model_id === "string" ? record.model_id : null;
        if (!prov || !mid) continue;
        if (!result[prov]) result[prov] = {};
        result[prov][mid] = mapCapabilityRecord(record);
    }
    if (!provider && !modelId) {
        cachedCapabilities = result;
        cachedCapabilitiesLoadedAll = true;
    }
    return result;
}
/**
 * Resolved providers/aliases to also try when looking up a synced capability.
 * Required because models.dev has historically stored capability rows under the
 * alias side of an alias pair (e.g. "opencode-zen") while the catalog & combo
 * targets reference the canonical id (e.g. "opencode"). Without this fallback,
 * combos whose targets use the canonical id (e.g. "Opencode FREE Omni" → all
 * `opencode/...` models) end up with `context_length: null` in the catalog.
 */ const SYNCED_CAPABILITY_FALLBACK_ALIASES = {
    opencode: [
        "opencode-zen"
    ],
    "opencode-zen": [
        "opencode"
    ],
    "opencode-go": [
        "opencode-zen"
    ]
};
function getSyncedCapability(provider, modelId) {
    if (!provider || !modelId) return null;
    // #8697-adjacent: this used to hit SQLite with a per-model SELECT on every cold
    // call, relying on some other caller (getSyncedCapabilities() with no args) to have
    // already warmed the whole-table cache first — no such caller sits in the /v1/models
    // catalog build path, so a cold rebuild ran one SQLite round-trip per model per call
    // site instead of one bulk read for the whole rebuild. Self-warm here instead of
    // depending on an external caller.
    if (!cachedCapabilitiesLoadedAll) {
        getSyncedCapabilities();
    }
    const lookupCached = (p)=>cachedCapabilities?.[p]?.[modelId] ?? null;
    const directCached = lookupCached(provider);
    if (directCached) return directCached;
    const fallbacks = SYNCED_CAPABILITY_FALLBACK_ALIASES[provider];
    if (fallbacks) {
        for (const alt of fallbacks){
            const found = lookupCached(alt);
            if (found) return found;
        }
    }
    return null;
}
function saveModelsDevCapabilities(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    const del = db.prepare("DELETE FROM model_capabilities");
    const insert = db.prepare(`
    INSERT INTO model_capabilities (
      provider, model_id, tool_call, reasoning, attachment, structured_output,
      temperature, modalities_input, modalities_output, knowledge_cutoff,
      release_date, last_updated, status, family, open_weights,
      limit_context, limit_input, limit_output, interleaved_field, last_synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const now = new Date().toISOString();
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            for (const [modelId, cap] of Object.entries(models)){
                insert.run(provider, modelId, cap.tool_call === null ? null : cap.tool_call ? 1 : 0, cap.reasoning === null ? null : cap.reasoning ? 1 : 0, cap.attachment === null ? null : cap.attachment ? 1 : 0, cap.structured_output === null ? null : cap.structured_output ? 1 : 0, cap.temperature === null ? null : cap.temperature ? 1 : 0, cap.modalities_input, cap.modalities_output, cap.knowledge_cutoff, cap.release_date, cap.last_updated, cap.status, cap.family, cap.open_weights === null ? null : cap.open_weights ? 1 : 0, cap.limit_context, cap.limit_input, cap.limit_output, cap.interleaved_field, now);
            }
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = data;
    cachedCapabilitiesLoadedAll = true;
}
function clearModelsDevCapabilities() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    db.prepare("DELETE FROM model_capabilities").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = {};
    cachedCapabilitiesLoadedAll = true;
}
async function syncModelsDev(opts) {
    const dryRun = opts?.dryRun ?? false;
    const syncCapabilities = opts?.syncCapabilities ?? true;
    const maxRetries = opts?.maxRetries ?? 3;
    const signal = opts?.signal;
    let lastError = null;
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        if (signal?.aborted) {
            return createAbortedSyncResult(dryRun);
        }
        try {
            const raw = await fetchModelsDev(signal);
            const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformModelsDevToPricing"])(raw);
            const capabilities = syncCapabilities ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformModelsDevToCapabilities"])(raw) : {};
            const modelCount = Object.values(pricing).reduce((sum, models)=>sum + Object.keys(models).length, 0);
            const providerCount = Object.keys(pricing).length;
            const capabilityCount = syncCapabilities ? Object.values(capabilities).reduce((sum, models)=>sum + Object.keys(models).length, 0) : 0;
            if (signal?.aborted) {
                return createAbortedSyncResult(dryRun);
            }
            if (!dryRun) {
                saveModelsDevPricing(pricing);
                if (syncCapabilities) {
                    ensureCapabilitiesTable();
                    saveModelsDevCapabilities(capabilities);
                }
                lastSyncTime = new Date().toISOString();
                lastSyncModelCount = modelCount;
                lastSyncCapabilityCount = capabilityCount;
            }
            return {
                success: true,
                modelCount,
                providerCount,
                capabilityCount,
                dryRun,
                ...dryRun ? {
                    data: {
                        pricing,
                        capabilities
                    }
                } : {}
            };
        } catch (err) {
            if (signal?.aborted || isAbortError(err)) {
                return createAbortedSyncResult(dryRun);
            }
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < maxRetries) {
                const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.warn(`[MODELS_DEV] Sync attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, lastError.message);
                try {
                    await sleepWithAbort(delayMs, signal);
                } catch (sleepError) {
                    if (signal?.aborted || isAbortError(sleepError)) {
                        return createAbortedSyncResult(dryRun);
                    }
                    throw sleepError;
                }
            }
        }
    }
    const message = lastError?.message || "Unknown error";
    console.warn(`[MODELS_DEV] Sync failed after ${maxRetries + 1} attempts:`, message);
    return {
        success: false,
        modelCount: 0,
        providerCount: 0,
        capabilityCount: 0,
        dryRun,
        error: message
    };
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? SYNC_INTERVAL_MS;
    activeSyncIntervalMs = interval;
    const syncToken = {
        stopped: false
    };
    activePeriodicSyncToken = syncToken;
    console.log(`[MODELS_DEV] Starting periodic sync every ${interval / 1000}s`);
    const launchSync = ()=>{
        if (syncToken.stopped) {
            return Promise.resolve(createAbortedSyncResult(false));
        }
        if (activeSyncPromise) return activeSyncPromise;
        const controller = new AbortController();
        activeSyncAbortController = controller;
        const promise = syncModelsDev({
            signal: controller.signal
        }).finally(()=>{
            if (activeSyncAbortController === controller) {
                activeSyncAbortController = null;
            }
            if (activeSyncPromise === promise) {
                activeSyncPromise = null;
            }
        });
        activeSyncPromise = promise;
        return promise;
    };
    // Initial sync (non-blocking)
    launchSync().then((result)=>{
        if (result.success) {
            console.log(`[MODELS_DEV] Initial sync complete: ${result.modelCount} pricing entries, ${result.capabilityCount} capabilities from ${result.providerCount} providers`);
        }
    }).catch((err)=>{
        console.warn("[MODELS_DEV] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        launchSync().then((result)=>{
            if (result.success) {
                console.log(`[MODELS_DEV] Periodic sync complete: ${result.modelCount} pricing entries`);
            }
        }).catch((err)=>{
            console.warn("[MODELS_DEV] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    if (syncTimer && typeof syncTimer === "object" && "unref" in syncTimer) {
        syncTimer.unref?.();
    }
}
function stopPeriodicSync() {
    if (activePeriodicSyncToken) {
        activePeriodicSyncToken.stopped = true;
        activePeriodicSyncToken = null;
    }
    if (activeSyncAbortController) {
        activeSyncAbortController.abort();
        activeSyncAbortController = null;
    }
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log("[MODELS_DEV] Periodic sync stopped");
    }
}
function getSyncStatus() {
    // If the sync timer is active, it's enabled.
    const enabled = syncTimer !== null;
    return {
        enabled,
        lastSync: lastSyncTime,
        lastSyncModelCount,
        lastSyncCapabilityCount,
        nextSync: syncTimer && lastSyncTime ? new Date(new Date(lastSyncTime).getTime() + activeSyncIntervalMs).toISOString() : null,
        intervalMs: activeSyncIntervalMs
    };
}
async function initModelsDevSync() {
    const { getSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
    const settings = await getSettings();
    if (settings.modelsDevSyncEnabled !== true) {
        console.log("[MODELS_DEV] Disabled (enable via Settings > AI)");
        return;
    }
    const interval = settings.modelsDevSyncInterval;
    startPeriodicSync(interval);
}
}),
"[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelContextOverride",
    ()=>getModelContextOverride,
    "getModelContextOverrideRecord",
    ()=>getModelContextOverrideRecord,
    "listModelContextOverrides",
    ()=>listModelContextOverrides,
    "removeModelContextOverride",
    ()=>removeModelContextOverride,
    "setModelContextOverride",
    ()=>setModelContextOverride
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
;
;
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function normalizeKey(provider, modelId) {
    const p = typeof provider === "string" ? provider.trim() : "";
    const m = typeof modelId === "string" ? modelId.trim() : "";
    if (!p || !m) return null;
    return {
        provider: p,
        modelId: m
    };
}
function toOverride(row) {
    return {
        provider: row.provider,
        modelId: row.model_id,
        realContext: row.real_context,
        source: row.source === "auto:discovery" ? "auto:discovery" : "manual",
        refreshedAt: row.refreshed_at
    };
}
function getModelContextOverrideRecord(provider, modelId) {
    const key = normalizeKey(provider, modelId);
    if (!key) return null;
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, real_context, source, refreshed_at " + "FROM model_context_overrides WHERE provider = ? AND model_id = ?").get(key.provider, key.modelId);
        return row ? toOverride(row) : null;
    } catch  {
        // Table may not exist yet (pre-migration) — fall through to the catalog.
        return null;
    }
}
function getModelContextOverride(provider, modelId) {
    const record = getModelContextOverrideRecord(provider, modelId);
    return record ? record.realContext : null;
}
function setModelContextOverride(provider, modelId, realContext, source = "manual") {
    const key = normalizeKey(provider, modelId);
    if (!key || !isPositiveInteger(realContext)) return false;
    const normalizedSource = source === "auto:discovery" ? "auto:discovery" : "manual";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("INSERT OR REPLACE INTO model_context_overrides " + "(provider, model_id, real_context, source, refreshed_at) " + "VALUES (?, ?, ?, ?, datetime('now'))").run(key.provider, key.modelId, realContext, normalizedSource);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return true;
}
function removeModelContextOverride(provider, modelId) {
    const key = normalizeKey(provider, modelId);
    if (!key) return false;
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM model_context_overrides WHERE provider = ? AND model_id = ?").run(key.provider, key.modelId);
    if (info.changes > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return info.changes > 0;
}
function listModelContextOverrides() {
    try {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, real_context, source, refreshed_at " + "FROM model_context_overrides ORDER BY refreshed_at DESC").all();
        return rows.map(toOverride);
    } catch  {
        return [];
    }
}
}),
"[project]/src/lib/db/modelCapabilityOverrides.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelCapabilityOverride",
    ()=>getModelCapabilityOverride,
    "listModelCapabilityOverrides",
    ()=>listModelCapabilityOverrides,
    "parseModelOverrideTarget",
    ()=>parseModelOverrideTarget,
    "removeModelCapabilityOverride",
    ()=>removeModelCapabilityOverride,
    "setModelCapabilityOverride",
    ()=>setModelCapabilityOverride
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
;
;
function isSupportedKey(value) {
    return value === "max_input_tokens" || value === "max_output_tokens";
}
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function parseModelOverrideTarget(target) {
    const raw = typeof target === "string" ? target.trim() : "";
    const slashIndex = raw.indexOf("/");
    if (slashIndex <= 0 || slashIndex === raw.length - 1) return null;
    const provider = raw.slice(0, slashIndex).trim();
    const modelId = raw.slice(slashIndex + 1).trim();
    if (!provider || !modelId) return null;
    return {
        provider,
        modelId
    };
}
function toOverride(row) {
    if (!isSupportedKey(row.override_key)) return null;
    let parsedValue;
    try {
        parsedValue = JSON.parse(row.override_value);
    } catch  {
        return null;
    }
    if (!isPositiveInteger(parsedValue)) return null;
    return {
        provider: row.provider,
        modelId: row.model_id,
        target: `${row.provider}/${row.model_id}`,
        key: row.override_key,
        value: parsedValue,
        refreshedAt: row.refreshed_at
    };
}
function getModelCapabilityOverride(provider, modelId, key) {
    const target = parseModelOverrideTarget(`${provider || ""}/${modelId || ""}`);
    if (!target || !isSupportedKey(key)) return null;
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, override_key, override_value, refreshed_at " + "FROM model_capability_overrides WHERE provider = ? AND model_id = ? AND override_key = ?").get(target.provider, target.modelId, key);
        const override = row ? toOverride(row) : null;
        return override?.value ?? null;
    } catch  {
        return null;
    }
}
function setModelCapabilityOverride(target, key, value) {
    const parsedTarget = parseModelOverrideTarget(target);
    if (!parsedTarget || !isSupportedKey(key) || !isPositiveInteger(value)) return false;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("INSERT OR REPLACE INTO model_capability_overrides " + "(provider, model_id, override_key, override_value, refreshed_at) " + "VALUES (?, ?, ?, ?, datetime('now'))").run(parsedTarget.provider, parsedTarget.modelId, key, JSON.stringify(value));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return true;
}
function removeModelCapabilityOverride(target, key) {
    const parsedTarget = parseModelOverrideTarget(target);
    if (!parsedTarget || !isSupportedKey(key)) return false;
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM model_capability_overrides " + "WHERE provider = ? AND model_id = ? AND override_key = ?").run(parsedTarget.provider, parsedTarget.modelId, key);
    if (info.changes > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return info.changes > 0;
}
function listModelCapabilityOverrides() {
    try {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, override_key, override_value, refreshed_at " + "FROM model_capability_overrides ORDER BY refreshed_at DESC").all();
        return rows.map(toOverride).filter((entry)=>entry !== null);
    } catch  {
        return [];
    }
}
}),
"[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Single source of truth for the model-id vision heuristic (#4072).
 *
 * Three code paths used to keep their own drifting lists, so the same model id
 * could get up to three different vision verdicts:
 *   - `src/lib/modelCapabilities.ts` — last-resort fallback in `resolveVisionCapability` (#4071)
 *   - `src/app/api/v1/models/catalog.ts` — `/v1/models` listing capability
 *   - `open-sse/services/compression/lite.ts` — gate that decides whether lite
 *     compression strips images
 *
 * Concrete bugs that caused:
 *   - `lite.ts` was missing pixtral / llava / qwen-vl / glm-4v / kimi-vl /
 *     mistral-medium-3, so lite compression stripped images for those real vision
 *     models and blinded them (same class as #4071 / #4012).
 *   - `catalog.ts` was too broad: bare `gemma` (text) and bare `kimi` (e.g.
 *     `kimi-k2`, text) produced false-positive `vision: true` in `/v1/models`.
 *
 * Keep this list CONSERVATIVE: a false positive in routing or compression
 * re-creates #4071 (an image routed to / kept for a model that cannot see it).
 * The zero-touch path for newly released vision models is the models.dev sync
 * (`modalities` / `attachment`), not this fallback — this list only needs the
 * stable, well-known vision families.
 */ __turbopack_context__.s([
    "VISION_MODEL_ID_FRAGMENTS",
    ()=>VISION_MODEL_ID_FRAGMENTS,
    "isVisionModelId",
    ()=>isVisionModelId
]);
const VISION_MODEL_ID_FRAGMENTS = [
    "pixtral",
    "llava",
    "bakllava",
    "qwen-vl",
    "qwen2-vl",
    "qwen2.5-vl",
    "qwen3-vl",
    "qvq",
    "internvl",
    "minicpm-v",
    "moondream",
    "mimo-vl",
    "kimi-vl",
    "glm-4v",
    "glm-4.5v",
    "glm-4.6v",
    "gpt-4o",
    "gpt-4.1",
    "gpt-4-turbo",
    "gpt-4-vision",
    "gpt-5",
    "gemini-1.5",
    "gemini-2",
    "gemini-3",
    "gemini-exp",
    "claude-3",
    "claude-fable",
    "claude-opus-4",
    "claude-sonnet-4",
    "claude-haiku-4",
    "claude-fable",
    "mistral-medium-3",
    "minimax-m3",
    "kimi-k2.",
    "-vision",
    "multimodal"
];
function isVisionModelId(modelId) {
    if (!modelId) return false;
    const normalized = String(modelId).toLowerCase();
    return VISION_MODEL_ID_FRAGMENTS.some((fragment)=>normalized.includes(fragment));
}
}),
"[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capMaxOutputTokens",
    ()=>capMaxOutputTokens,
    "capThinkingBudget",
    ()=>capThinkingBudget,
    "getDefaultThinkingBudget",
    ()=>getDefaultThinkingBudget,
    "getExplicitModelOutputCap",
    ()=>getExplicitModelOutputCap,
    "getModelContextLimit",
    ()=>getModelContextLimit,
    "getResolvedModelCapabilities",
    ()=>getResolvedModelCapabilities,
    "getResolvedModelContextOverride",
    ()=>getResolvedModelContextOverride,
    "isNonChatCatalogSurface",
    ()=>isNonChatCatalogSurface,
    "modelIdLikelyVision",
    ()=>modelIdLikelyVision,
    "resolveInputTokenCapForGate",
    ()=>resolveInputTokenCapForGate,
    "supportsMaxTokens",
    ()=>supportsMaxTokens,
    "supportsReasoning",
    ()=>supportsReasoning,
    "supportsToolCalling",
    ()=>supportsToolCalling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelCapabilityOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const TOOL_CALLING_UNSUPPORTED_PATTERNS = [
    // Specialty / non-chat surfaces must never inherit optimistic tool defaults (#8016)
    "whisper",
    "tts-1",
    "gpt-4o-mini-tts",
    "omni-moderation",
    "moderation",
    "eleven_multilingual",
    "eleven_turbo",
    "seedance",
    "/veo",
    "veo-",
    "rerank",
    "embedding",
    "dall-e",
    "flux-",
    "stable-diffusion"
];
const REASONING_UNSUPPORTED_PATTERNS = [
    "antigravity/claude-sonnet-4-6",
    "antigravity/claude-sonnet-4-5",
    "antigravity/claude-sonnet-4",
    // Non-Claude antigravity models don't support thinking params (#1361)
    "antigravity/gemini-",
    "antigravity/gpt-oss-",
    "antigravity/gemini-3",
    "antigravity/tab_",
    // Specialty / non-chat surfaces (#8016)
    "whisper",
    "tts-1",
    "gpt-4o-mini-tts",
    "omni-moderation",
    "moderation",
    "eleven_multilingual",
    "eleven_turbo",
    "seedance",
    "/veo",
    "veo-",
    "rerank",
    "embedding",
    "dall-e",
    "flux-",
    "stable-diffusion"
];
/** Catalog/API surface types that are not chat completions. */ const NON_CHAT_SURFACE_TYPES = new Set([
    "audio",
    "video",
    "image",
    "moderation",
    "rerank",
    "embedding",
    "music"
]);
function isNonChatCatalogSurface(type) {
    return typeof type === "string" && NON_CHAT_SURFACE_TYPES.has(type);
}
const MAX_TOKENS_UNSUPPORTED_PATTERNS = [
    "o1-preview",
    "o1-mini",
    "o1",
    "o3-mini",
    "o3",
    "gpt-5.4",
    "gpt-5.5"
];
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function parseModalities(value) {
    if (typeof value !== "string" || value.trim().length === 0) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string" && entry.length > 0) : [];
    } catch  {
        return [];
    }
}
function getRegistryModel(providerIdOrAlias, modelId) {
    if (!providerIdOrAlias || !modelId) return null;
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerIdOrAlias] || providerIdOrAlias;
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerAlias];
    if (!Array.isArray(models)) return null;
    return models.find((model)=>model?.id === modelId) || null;
}
function resolveCapabilityInput(input) {
    if (typeof input === "string") {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(input);
        const rawModel = toNonEmptyString(parsed.model);
        if (parsed.provider) {
            const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(parsed.provider, rawModel);
            return {
                provider: canonical.provider,
                model: toNonEmptyString(canonical.model),
                rawModel,
                lookupKey: input
            };
        }
        return {
            provider: null,
            model: rawModel,
            rawModel,
            lookupKey: input
        };
    }
    const rawProvider = toNonEmptyString(input.provider);
    const rawModel = toNonEmptyString(input.model);
    if (rawProvider) {
        const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(rawProvider, rawModel);
        return {
            provider: canonical.provider,
            model: toNonEmptyString(canonical.model),
            rawModel,
            lookupKey: rawModel ? `${canonical.provider}/${rawModel}` : canonical.provider
        };
    }
    return {
        provider: null,
        model: rawModel,
        rawModel,
        lookupKey: rawModel || ""
    };
}
function heuristicToolCalling(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return false;
    const blocked = TOOL_CALLING_UNSUPPORTED_PATTERNS.some((pattern)=>{
        if (normalized === pattern) return true;
        if (normalized.endsWith(`/${pattern}`)) return true;
        return normalized.includes(pattern);
    });
    return !blocked;
}
function heuristicReasoning(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return true;
    const blocked = REASONING_UNSUPPORTED_PATTERNS.some((pattern)=>normalized === pattern || normalized.endsWith(`/${pattern}`) || normalized.includes(pattern));
    return !blocked;
}
function heuristicMaxTokens(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return true;
    const blocked = MAX_TOKENS_UNSUPPORTED_PATTERNS.some((pattern)=>normalized === pattern || normalized.endsWith(`/${pattern}`) || normalized.includes(pattern));
    return !blocked;
}
/** Last path segment of a path-shaped model id (`cline-pass/kimi-k3` → `kimi-k3`). */ function leafModelId(modelId) {
    if (!modelId || !modelId.includes("/")) return null;
    const leaf = modelId.split("/").filter(Boolean).pop() ?? null;
    return leaf && leaf !== modelId ? leaf : null;
}
function getStaticSpec(modelId, rawModel) {
    if (modelId) {
        const byCanonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(modelId);
        if (byCanonical) return byCanonical;
    }
    if (rawModel && rawModel !== modelId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(rawModel);
    }
    return undefined;
}
/**
 * #8032: vision-only leaf fallback for path-shaped routed ids.
 *
 * Must NOT live in getStaticSpec() — that helper also feeds supportsTools /
 * supportsThinking / contextWindow / maxOutputTokens. A shared leaf lookup
 * incorrectly promotes e.g. aihorde/deepseek/deepseek-v4-flash to the real
 * DeepSeek V4 Flash tool-calling spec (#8212 regression).
 */ function getVisionStaticSpec(modelId, rawModel) {
    const direct = getStaticSpec(modelId, rawModel);
    if (direct) return direct;
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const leaf = leafModelId(candidate);
        if (!leaf) continue;
        const byLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(leaf);
        if (byLeaf) return byLeaf;
    }
    return undefined;
}
function getAuthoritativeStaticContextWindow(provider, modelId, rawModel) {
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const providerContextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthoritativeProviderContextWindow"])(provider, candidate);
        if (typeof providerContextWindow === "number") return providerContextWindow;
    }
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const contextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthoritativeContextWindow"])(candidate);
        if (typeof contextWindow === "number") return contextWindow;
    }
    return null;
}
// #8697-adjacent: this used to rescan Object.entries(MODEL_SPECS) per candidate per
// call — the top hotspot in a full catalog-rebuild profile once the pricing-path and
// getCanonicalModelSpecId() bottlenecks were fixed. Reuses the lazy index already built
// for getCanonicalModelSpecId() (@/shared/constants/modelSpecs) instead of duplicating a
// second cache over the same static table.
function getStaticSpecCanonicalModelId(modelId, rawModel) {
    const candidates = [
        modelId,
        rawModel
    ].filter((candidate)=>typeof candidate === "string" && candidate.length > 0);
    for (const candidate of candidates){
        const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findModelSpecIdByExactOrAlias"])(candidate);
        if (hit) return hit;
    }
    return null;
}
/**
 * Strip a trailing `-latest` alias suffix from a model id (#4073). Returns the
 * short id (`pixtral-12b-latest` → `pixtral-12b`) or `null` when there is no
 * `-latest` suffix to drop. Used only as a last-resort synced-lookup fallback.
 */ function stripLatestAlias(modelId) {
    if (!modelId) return null;
    const stripped = modelId.replace(/-latest$/i, "");
    return stripped && stripped !== modelId ? stripped : null;
}
// #8697-adjacent: MODELS_DEV_PROVIDER_MAP is a static module constant, so the result
// of reverseModelsDevProviders() never changes for a given provider — memoized by
// provider key instead of rescanning Object.entries(MODELS_DEV_PROVIDER_MAP) on every
// call (called once per model in a catalog rebuild). Never evicted — bounded by the
// number of distinct providers ever queried (~50-100 in practice), negligible memory.
const reverseModelsDevProvidersCache = new Map();
function reverseModelsDevProviders(provider) {
    // models.dev may store capabilities under a different OmniRoute provider id
    // that also maps from the same upstream models.dev provider. Build reverse
    // candidates from MODELS_DEV_PROVIDER_MAP (e.g. openai ↔ cx).
    //
    // MODELS_DEV_PROVIDER_MAP's RHS is inconsistent: most providers list their
    // canonical id directly, but the OAuth CLI providers (codex/claude) only
    // list their alias (cx/cc), never the canonical id. Also probe the
    // provider's alias so a canonical id like "codex"/"claude" still matches
    // the map entries keyed only by "cx"/"cc" (#8429).
    const cached = reverseModelsDevProvidersCache.get(provider);
    if (cached) return cached;
    const out = new Set();
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
    for (const [modelsDevId, omniIds] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODELS_DEV_PROVIDER_MAP"])){
        if (omniIds.includes(provider) || omniIds.includes(providerAlias) || modelsDevId === provider || modelsDevId === providerAlias) {
            out.add(modelsDevId);
            for (const id of omniIds)out.add(id);
        }
    }
    // Frozen: the result is now shared across every future call for this provider (via
    // the cache above) instead of a fresh array per call — freeze prevents an accidental
    // caller mutation (e.g. .push()) from corrupting the cache for everyone else.
    const result = Object.freeze([
        ...out
    ]);
    reverseModelsDevProvidersCache.set(provider, result);
    return result;
}
function getSyncedCapabilityForResolved(provider, model, rawModel) {
    if (!provider || !model) return null;
    const modelCandidates = Array.from(new Set([
        model,
        rawModel,
        getStaticSpecCanonicalModelId(model, rawModel)
    ].filter((value)=>typeof value === "string" && value.length > 0).flatMap((candidate)=>{
        const values = [
            candidate
        ];
        const stripped = stripLatestAlias(candidate);
        if (stripped) values.push(stripped);
        const leaf = leafModelId(candidate);
        if (leaf) values.push(leaf);
        // models.dev often stores OpenAI-family specialty models as qualified
        // ids under another mapped provider, e.g. vercel + "openai/whisper-1".
        if (!candidate.includes("/")) {
            values.push(`${provider}/${candidate}`);
        }
        return values;
    })));
    // Include common host providers that re-publish OpenAI specialty models under
    // qualified ids (observed: vercel/openai/whisper-1, vercel/openai/tts-1).
    const providerCandidates = Array.from(new Set([
        provider,
        ...reverseModelsDevProviders(provider),
        "vercel"
    ]));
    for (const prov of providerCandidates){
        for (const mid of modelCandidates){
            const found = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedCapability"])(prov, mid);
            if (found) return found;
        }
    }
    return null;
}
function modelIdLikelyVision(modelId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isVisionModelId"])(modelId);
}
/**
 * Models that upstream catalogs (notably models.dev) mislabel as vision-capable but
 * are TEXT-ONLY per the vendor's own docs. Listed here so a wrong synced
 * `attachment:true` cannot route an image request to a blind model (the #4071 failure
 * mode). Keep this list tiny and doc-backed.
 *
 * Xiaomi MiMo: only `mimo-v2.5` and `mimo-v2-omni` accept images; the `*-pro` chat
 * models are text-only (mimo.mi.com .../image-understanding; hermes-agent#18884).
 * Anchored to the full id (`$`) and tolerant of a `provider/` prefix so `mimo-v2.5-pro`
 * never matches the multimodal `mimo-v2.5`, and `mimo-v2-pro` never matches `mimo-v2-omni`.
 */ const KNOWN_TEXT_ONLY_DESPITE_SYNC = [
    /(?:^|\/)mimo-v2\.5-pro$/i,
    /(?:^|\/)mimo-v2-pro$/i
];
function isKnownTextOnlyDespiteSync(modelId) {
    if (!modelId) return false;
    const id = String(modelId);
    return KNOWN_TEXT_ONLY_DESPITE_SYNC.some((pattern)=>pattern.test(id));
}
/** True when a modality list declares image and/or video input/output. */ function modalitiesDeclareVision(modalities) {
    return modalities.some((entry)=>{
        const lower = String(entry).toLowerCase();
        return lower.includes("image") || lower.includes("video");
    });
}
function resolveVisionCapability(spec, registryModel, synced, modalitiesInput, modalitiesOutput, modelId) {
    const allModalities = [
        ...modalitiesInput,
        ...modalitiesOutput
    ].map((entry)=>String(entry).toLowerCase());
    // Hard override FIRST: a wrong synced `attachment:true` (or image modality) must not
    // win for models the vendor documents as text-only. Beats every branch below so an
    // image request can never be routed to a blind model (#4071).
    if (isKnownTextOnlyDespiteSync(modelId)) return false;
    if (typeof synced?.attachment === "boolean") {
        // #8250: models.dev sometimes ships attachment=false alongside image/video
        // modalities (observed for Kimi K3). Prefer the richer modality signal over
        // the contradictory false flag so supportsVision / attachment / modalities
        // can be reconciled to a single vision-capable verdict.
        if (synced.attachment === false && modalitiesDeclareVision(allModalities)) {
            return true;
        }
        // #8032: attachment=false without modalities must not beat authoritative
        // registry/spec vision for path-shaped custom/routed ids (e.g. Cline Pass
        // `cp/cline-pass/kimi-k3` → MODEL_SPECS["kimi-k3"].supportsVision).
        if (synced.attachment === false) {
            if (registryModel?.supportsVision === true) return true;
            if (spec?.supportsVision === true) return true;
            return false;
        }
        return synced.attachment;
    }
    if (allModalities.some((entry)=>entry.includes("image"))) {
        return true;
    }
    if (allModalities.length > 0) {
        return false;
    }
    if (typeof registryModel?.supportsVision === "boolean") return registryModel.supportsVision;
    if (typeof spec?.supportsVision === "boolean") return spec.supportsVision;
    // Last resort: no capability data at all. Positively confirm known multimodal
    // families by model id so image requests can be routed to them; everything
    // else stays `null` (unknown).
    if (modelIdLikelyVision(modelId)) return true;
    return null;
}
/**
 * Issue #6524: an operator-set `max_output_tokens` capability override (see
 * `src/lib/db/modelCapabilityOverrides.ts`) is the manual escape hatch for a
 * wrong/stale synced `limit_output` value (e.g. a provider's models.dev catalog
 * row reporting `limit_output` equal to `limit_context`). It already won over the
 * synced value in `getResolvedModelCapabilities().maxOutputTokens` — this helper
 * makes `getExplicitModelOutputCap()` (used by the reasoning-token-buffer clamp)
 * consult the same override so both read paths agree.
 */ /**
 * Exact-match capability override lookup with intentional raw-alias fallback.
 *
 * An override may be stored under either the canonical model id or the exact
 * provider-scoped raw alias the operator used (e.g. `github/claude-opus-4.5`
 * resolving to canonical `claude-opus-4-5-20251101`). We consult the canonical
 * id first, then the raw alias — both are exact provider/model matches. There is
 * deliberately NO suffix/effort/family inheritance: an override for
 * `codex/gpt-5.6` never applies to `codex/gpt-5.6-high`.
 */ function getCapabilityOverride(resolved, key) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.model, key);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.rawModel, key) : null;
}
function getContextOverride(resolved) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.model);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.rawModel) : null;
}
function getResolvedModelContextOverride(input) {
    return getContextOverride(resolveCapabilityInput(input));
}
function getInputTokenCapabilityOverride(resolved) {
    return getCapabilityOverride(resolved, "max_input_tokens");
}
function getOutputTokenCapabilityOverride(resolved) {
    return getCapabilityOverride(resolved, "max_output_tokens");
}
function getExplicitModelOutputCap(input) {
    const resolved = resolveCapabilityInput(input);
    const maxTokenOverride = getOutputTokenCapabilityOverride(resolved);
    if (maxTokenOverride !== null) return maxTokenOverride;
    const synced = getSyncedCapabilityForResolved(resolved.provider, resolved.model, resolved.rawModel);
    if (synced && typeof synced.limit_output === "number") return synced.limit_output;
    const registryModel = getRegistryModel(resolved.provider, resolved.model);
    if (typeof registryModel?.maxOutputTokens === "number") return registryModel.maxOutputTokens;
    const spec = getStaticSpec(resolved.model, resolved.rawModel);
    return spec?.maxOutputTokens ?? null;
}
function getResolvedModelCapabilities(input, options) {
    // Reconciliation / auto-discovery needs the override-free catalog view so a
    // persisted override never feeds back into the comparison that (re)writes it.
    const usePersistedOverrides = options?.persistedOverrides !== false;
    const resolved = resolveCapabilityInput(input);
    const spec = getStaticSpec(resolved.model, resolved.rawModel);
    const registryModel = getRegistryModel(resolved.provider, resolved.model);
    const synced = getSyncedCapabilityForResolved(resolved.provider, resolved.model, resolved.rawModel);
    const modalitiesInput = parseModalities(synced?.modalities_input);
    const modalitiesOutput = parseModalities(synced?.modalities_output);
    const lookupKey = toNonEmptyString(resolved.provider && resolved.model ? `${resolved.provider}/${resolved.model}` : resolved.model || resolved.rawModel || resolved.lookupKey) || "";
    const reasoningDenied = !heuristicReasoning(lookupKey);
    // Provider-level fallback: a live-discovered model (passthroughModels
    // providers like AI Horde) has no per-model registry entry, synced
    // capability, or static spec — every source above resolves to null, so
    // toolCalling would otherwise fall through to heuristicToolCalling's
    // optimistic default (true). Reuse the same unsupportedParams signal the
    // request-time strip already relies on: if the provider declares "tools"
    // unsupported for every model it serves, that's authoritative here too.
    const providerDeniesTools = resolved.provider && resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnsupportedParams"])(resolved.provider, resolved.model).includes("tools") : false;
    const supportsTools = synced?.tool_call ?? (typeof registryModel?.toolCalling === "boolean" ? registryModel.toolCalling : null) ?? (typeof spec?.supportsTools === "boolean" ? spec.supportsTools : null) ?? (providerDeniesTools ? false : null);
    const supportsThinking = reasoningDenied ? false : synced?.reasoning ?? (typeof registryModel?.supportsReasoning === "boolean" ? registryModel.supportsReasoning : null) ?? (typeof spec?.supportsThinking === "boolean" ? spec.supportsThinking : null);
    const authoritativeContextWindow = getAuthoritativeStaticContextWindow(resolved.provider, resolved.model, resolved.rawModel);
    // A persisted context-window override (operator-set or auto-discovered)
    // reflects the real *total* window and wins over every static/synced source.
    // `maxInputTokens` still follows its own precedence chain; only when that
    // chain has no narrower source does it naturally fall back to this window.
    const persistedContextWindow = usePersistedOverrides ? getContextOverride(resolved) : null;
    const contextWindow = persistedContextWindow ?? authoritativeContextWindow ?? synced?.limit_context ?? (typeof registryModel?.contextLength === "number" ? registryModel.contextLength : null) ?? spec?.contextWindow ?? null;
    const maxInputOverride = usePersistedOverrides ? getInputTokenCapabilityOverride(resolved) : null;
    const maxTokenOverride = usePersistedOverrides ? getOutputTokenCapabilityOverride(resolved) : null;
    // Vision consults leaf static metadata for path-shaped ids; other capability
    // fields keep using the non-leaf `spec` from getStaticSpec() above.
    const visionSpec = getVisionStaticSpec(resolved.model, resolved.rawModel);
    const supportsVision = resolveVisionCapability(visionSpec, registryModel, synced, modalitiesInput, modalitiesOutput, lookupKey);
    // #8250: when resolve promoted vision over a contradictory attachment=false,
    // expose attachment=true so catalog / Vision Bridge / clients see one verdict.
    let attachment = synced?.attachment ?? null;
    if (supportsVision === true && attachment === false) {
        attachment = true;
    }
    return {
        provider: resolved.provider,
        model: resolved.model,
        rawModel: resolved.rawModel,
        toolCalling: supportsTools ?? heuristicToolCalling(lookupKey),
        reasoning: supportsThinking ?? heuristicReasoning(lookupKey),
        supportsThinking,
        supportsTools,
        supportsVision,
        supportsMaxTokens: heuristicMaxTokens(lookupKey),
        attachment,
        structuredOutput: synced?.structured_output ?? null,
        temperature: synced?.temperature ?? null,
        contextWindow,
        maxInputTokens: (()=>{
            // Input cap is input-only. An explicit `max_input_tokens` override wins;
            // otherwise fall back to the existing per-source input limits, then to the
            // total window. The effective cap can never exceed the total window
            // (input + output), so clamp it — but never double-count a requested
            // output against this input cap.
            const candidate = maxInputOverride ?? (typeof registryModel?.maxInputTokens === "number" ? registryModel.maxInputTokens : null) ?? authoritativeContextWindow ?? synced?.limit_input ?? contextWindow;
            return candidate !== null && contextWindow !== null ? Math.min(candidate, contextWindow) : candidate;
        })(),
        maxOutputTokens: maxTokenOverride ?? synced?.limit_output ?? (typeof registryModel?.maxOutputTokens === "number" ? registryModel.maxOutputTokens : null) ?? spec?.maxOutputTokens ?? null,
        defaultThinkingBudget: spec?.defaultThinkingBudget ?? 0,
        thinkingBudgetCap: spec?.thinkingBudgetCap ?? null,
        thinkingOverhead: spec?.thinkingOverhead ?? null,
        adaptiveMaxTokens: spec?.adaptiveMaxTokens ?? null,
        family: synced?.family ?? null,
        status: synced?.status ?? null,
        openWeights: synced?.open_weights ?? null,
        knowledgeCutoff: synced?.knowledge_cutoff ?? null,
        releaseDate: synced?.release_date ?? null,
        lastUpdated: synced?.last_updated ?? null,
        modalitiesInput,
        modalitiesOutput,
        interleavedField: synced?.interleaved_field ?? (typeof registryModel?.interleavedField === "string" ? registryModel.interleavedField : null)
    };
}
function resolveInputTokenCapForGate(input, { isCombo = false } = {}) {
    const resolved = resolveCapabilityInput(input);
    // 1. An explicit `max_input_tokens` override always wins and is never bypassed.
    const explicitInputOverride = getInputTokenCapabilityOverride(resolved);
    if (explicitInputOverride !== null) return explicitInputOverride;
    // 2. Combo rescue: an exact persisted context override supersedes the smaller
    //    catalog/client input hint (mirrors contextOverrideGate.evaluateContextLimit).
    if (isCombo) {
        const contextOverride = getContextOverride(resolved);
        if (contextOverride !== null) return contextOverride;
    }
    // 3. Canonical chain (already clamped to the total window by the resolver).
    return getResolvedModelCapabilities(input).maxInputTokens;
}
function supportsToolCalling(input) {
    if (typeof input === "string" && !String(input || "").trim()) return false;
    return getResolvedModelCapabilities(input).toolCalling;
}
function supportsReasoning(input) {
    if (typeof input === "string" && !String(input || "").trim()) return true;
    return getResolvedModelCapabilities(input).reasoning;
}
function supportsMaxTokens(input) {
    if (typeof input === "string" && !String(input || "").trim()) return true;
    return getResolvedModelCapabilities(input).supportsMaxTokens;
}
function capMaxOutputTokens(input, requested) {
    const cap = getResolvedModelCapabilities(input).maxOutputTokens;
    const hasRequested = typeof requested === "number" && Number.isFinite(requested);
    if (cap === null) return hasRequested ? requested : null;
    return hasRequested ? Math.min(requested, cap) : cap;
}
function getDefaultThinkingBudget(input) {
    return getResolvedModelCapabilities(input).defaultThinkingBudget;
}
function capThinkingBudget(input, budget) {
    const resolved = getResolvedModelCapabilities(input);
    let cap = resolved.thinkingBudgetCap;
    const modelId = resolved.model ?? resolved.rawModel ?? "";
    const modelLower = modelId.toLowerCase();
    // Learned-cap lookup needs a concrete provider key (the executor records under
    // `this.provider`). When the input is a bare Gemini id, `resolved.provider` is
    // null — but bare Gemini ids always route to the native Gemini provider, so
    // default to "gemini". Without this a cap learned via the executor would be
    // invisible to bare-model callers. Provider-qualified inputs keep their own
    // provider, preserving per-provider independence.
    const providerForLearned = resolved.provider ?? (modelLower.includes("gemini") ? "gemini" : null);
    const learned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLearnedThinkingCap"])(providerForLearned, modelId);
    if (learned !== null) {
        cap = cap === null ? learned : Math.min(cap, learned);
    }
    if (cap === null && modelLower.includes("gemini")) {
        cap = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GEMINI_FALLBACK_THINKING_CAP"];
    }
    return Math.min(budget, cap ?? budget);
}
function getModelContextLimit(providerOrInput, modelId) {
    const resolved = typeof providerOrInput === "string" && modelId !== undefined ? getResolvedModelCapabilities({
        provider: providerOrInput,
        model: modelId
    }) : getResolvedModelCapabilities(providerOrInput);
    return resolved.contextWindow;
}
}),
"[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionExcludedModels",
    ()=>getConnectionExcludedModels,
    "hasEligibleConnectionForModel",
    ()=>hasEligibleConnectionForModel,
    "isModelExcludedByConnection",
    ()=>isModelExcludedByConnection,
    "normalizeExcludedModelPatterns",
    ()=>normalizeExcludedModelPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-route] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePattern(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || normalized === "**") return null;
    return normalized;
}
function toPatternList(value) {
    if (Array.isArray(value)) {
        return value.map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    if (typeof value === "string") {
        return value.split(",").map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    return [];
}
function uniquePatterns(patterns) {
    return Array.from(new Set(patterns));
}
function getModelMatchCandidates(modelId) {
    const normalized = modelId.trim();
    if (!normalized) return [];
    const withoutExtendedContext = normalized.endsWith("[1m]") ? normalized.slice(0, -4) : normalized;
    const lastSlashIndex = withoutExtendedContext.lastIndexOf("/");
    const rawModel = lastSlashIndex >= 0 ? withoutExtendedContext.slice(lastSlashIndex + 1) : withoutExtendedContext;
    return Array.from(new Set([
        normalized,
        withoutExtendedContext,
        rawModel
    ].filter(Boolean)));
}
function normalizeExcludedModelPatterns(value) {
    return uniquePatterns(toPatternList(value));
}
function getConnectionExcludedModels(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeExcludedModelPatterns(data.excludedModels ?? data.excluded_models);
}
function isModelExcludedByConnection(modelId, providerSpecificData) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return false;
    const candidates = getModelMatchCandidates(modelId);
    const excludedModels = getConnectionExcludedModels(providerSpecificData);
    if (candidates.length === 0 || excludedModels.length === 0) return false;
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/domain/tagRouter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionRoutingTags",
    ()=>getConnectionRoutingTags,
    "matchesRoutingTags",
    ()=>matchesRoutingTags,
    "normalizeRoutingTagMatchMode",
    ()=>normalizeRoutingTagMatchMode,
    "normalizeRoutingTags",
    ()=>normalizeRoutingTags,
    "resolveRequestRoutingTags",
    ()=>resolveRequestRoutingTags
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeSingleRoutingTag(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function normalizeRoutingTags(value) {
    const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    const deduped = new Set();
    for (const rawValue of rawValues){
        const normalized = normalizeSingleRoutingTag(rawValue);
        if (normalized) deduped.add(normalized);
    }
    return Array.from(deduped);
}
function normalizeRoutingTagMatchMode(value) {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : typeof value === "number" ? "" : "";
    return normalized === "all" ? "all" : "any";
}
function getConnectionRoutingTags(providerSpecificData) {
    return normalizeRoutingTags(asRecord(providerSpecificData).tags);
}
function matchesRoutingTags(connectionTags, requestTags, matchMode = "any") {
    if (requestTags.length === 0) return true;
    if (connectionTags.length === 0) return false;
    const tagSet = new Set(connectionTags);
    if (matchMode === "all") {
        return requestTags.every((tag)=>tagSet.has(tag));
    }
    return requestTags.some((tag)=>tagSet.has(tag));
}
function resolveRequestRoutingTags(body) {
    const metadata = asRecord(body?.metadata);
    return {
        tags: normalizeRoutingTags(metadata.tags),
        matchMode: normalizeRoutingTagMatchMode(metadata.tag_match_mode ?? metadata.tagMatchMode)
    };
}
}),
"[project]/src/shared/constants/openRouterPreset.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPENROUTER_PRESET_MAX_LENGTH",
    ()=>OPENROUTER_PRESET_MAX_LENGTH,
    "isOpenRouterPresetValue",
    ()=>isOpenRouterPresetValue,
    "normalizeOpenRouterPreset",
    ()=>normalizeOpenRouterPreset
]);
const OPENROUTER_PRESET_MAX_LENGTH = 200;
function isOpenRouterPresetValue(value) {
    return typeof value === "string" && value.trim().length <= OPENROUTER_PRESET_MAX_LENGTH;
}
function normalizeOpenRouterPreset(value) {
    if (!isOpenRouterPresetValue(value)) return undefined;
    const normalized = value.trim();
    return normalized || undefined;
}
}),
"[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isForbiddenCustomHeaderName",
    ()=>isForbiddenCustomHeaderName,
    "isForbiddenUpstreamHeaderName",
    ()=>isForbiddenUpstreamHeaderName
]);
/**
 * User-supplied upstream extra headers: names we never forward (Host / hop-by-hop / framing).
 * Changing this list requires syncing: `sanitizeUpstreamHeadersMap` (models.ts), Zod
 * `upstreamHeaderNameSchema` / record refine (schemas.ts), and `upstream-headers-sanitize` tests.
 */ const FORBIDDEN = new Set([
    "host",
    "connection",
    "content-length",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "te",
    "trailer",
    "upgrade"
].map((s)=>s.toLowerCase()));
function isForbiddenUpstreamHeaderName(name) {
    return FORBIDDEN.has(String(name).trim().toLowerCase());
}
/**
 * Auth headers that must come from the connection's credentials, never from
 * operator-set per-provider custom headers. Kept here as the single source of
 * truth so the Zod `customHeadersSchema` (schemas.ts) and the executor's
 * apply-loop (open-sse/executors/default.ts) cannot drift apart.
 */ const FORBIDDEN_AUTH = new Set([
    "authorization",
    "x-api-key",
    "x-goog-api-key",
    "api-key",
    "cookie"
].map((s)=>s.toLowerCase()));
function isForbiddenCustomHeaderName(name) {
    const n = String(name).trim().toLowerCase();
    return isForbiddenUpstreamHeaderName(n) || FORBIDDEN_AUTH.has(n);
}
}),
"[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_REASONING_EFFORT_VALUES",
    ()=>CODEX_REASONING_EFFORT_VALUES,
    "buildOpenAIStoreSessionId",
    ()=>buildOpenAIStoreSessionId,
    "ensureOpenAIStoreSessionFallback",
    ()=>ensureOpenAIStoreSessionFallback,
    "getClaudeCodeCompatibleRequestDefaults",
    ()=>getClaudeCodeCompatibleRequestDefaults,
    "getCodexRequestDefaults",
    ()=>getCodexRequestDefaults,
    "getProviderRequestDefaults",
    ()=>getProviderRequestDefaults,
    "isOpenAIResponsesStoreEnabled",
    ()=>isOpenAIResponsesStoreEnabled,
    "normalizeCacheOverride",
    ()=>normalizeCacheOverride,
    "normalizeClaudeCodeCompatibleContext1m",
    ()=>normalizeClaudeCodeCompatibleContext1m,
    "normalizeClaudeCodeCompatibleRedactThinking",
    ()=>normalizeClaudeCodeCompatibleRedactThinking,
    "normalizeClaudeCodeCompatibleSummarizeThinking",
    ()=>normalizeClaudeCodeCompatibleSummarizeThinking,
    "normalizeCodexReasoningEffort",
    ()=>normalizeCodexReasoningEffort,
    "normalizeCodexServiceTier",
    ()=>normalizeCodexServiceTier,
    "normalizeProviderSpecificData",
    ()=>normalizeProviderSpecificData,
    "normalizeRequestDefaults",
    ()=>normalizeRequestDefaults,
    "sanitizeProviderSpecificDataForResponse",
    ()=>sanitizeProviderSpecificDataForResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)");
const CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX = "anthropic-compatible-cc-";
;
;
;
;
const CODEX_REASONING_EFFORT_VALUES = [
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
];
const CODEX_REASONING_EFFORT_SET = new Set(CODEX_REASONING_EFFORT_VALUES);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeString(value) {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
}
const BEDROCK_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/i;
function normalizeAwsRegion(value) {
    const normalized = normalizeString(value);
    if (!normalized || !BEDROCK_REGION_PATTERN.test(normalized)) return undefined;
    return normalized;
}
function hasNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function isClaudeCodeCompatibleProvider(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX);
}
function normalizeCodexReasoningEffort(value) {
    const normalized = normalizeString(value);
    if (!normalized || !CODEX_REASONING_EFFORT_SET.has(normalized)) {
        return undefined;
    }
    return normalized;
}
function normalizeCodexServiceTier(value) {
    const normalized = normalizeString(value);
    if (!normalized) return undefined;
    if (normalized === "fast" || normalized === "priority") return "priority";
    if (normalized === "default" || normalized === "flex") return normalized;
    return undefined;
}
function normalizeClaudeCodeCompatibleContext1m(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleRedactThinking(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleSummarizeThinking(value) {
    return value === true ? true : undefined;
}
function normalizeRequestDefaults(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    if (provider === "codex") {
        const reasoningEffort = normalizeCodexReasoningEffort(record.reasoningEffort);
        if (reasoningEffort) {
            normalized.reasoningEffort = reasoningEffort;
        } else {
            delete normalized.reasoningEffort;
        }
        const serviceTier = normalizeCodexServiceTier(record.serviceTier);
        if (serviceTier) {
            normalized.serviceTier = serviceTier;
        } else {
            delete normalized.serviceTier;
        }
    }
    if (isClaudeCodeCompatibleProvider(provider)) {
        const context1m = normalizeClaudeCodeCompatibleContext1m(record.context1m);
        if (context1m) {
            normalized.context1m = true;
        } else {
            delete normalized.context1m;
        }
        const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(record.redactThinking);
        if (redactThinking) {
            normalized.redactThinking = true;
        } else {
            delete normalized.redactThinking;
        }
        const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(record.summarizeThinking);
        if (summarizeThinking) {
            normalized.summarizeThinking = true;
        } else {
            delete normalized.summarizeThinking;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
const CACHE_PASSTHROUGH_VALUES = new Set([
    "strip",
    "openai-format",
    "claude-format"
]);
function normalizeCacheOverride(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        normalized.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (typeof record.cacheControlPassthrough === "string" && CACHE_PASSTHROUGH_VALUES.has(record.cacheControlPassthrough)) {
        normalized.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
// #6880 — extracted so normalizeProviderSpecificData() stays under the
// max-lines-per-function gate: normalizes the two nested-object sub-fields
// (requestDefaults, cache) in one pass.
function normalizeNestedSubObjects(provider, normalized) {
    if ("requestDefaults" in normalized) {
        const requestDefaults = normalizeRequestDefaults(provider, normalized.requestDefaults);
        if (requestDefaults) {
            normalized.requestDefaults = requestDefaults;
        } else {
            delete normalized.requestDefaults;
        }
    }
    if ("cache" in normalized) {
        const cache = normalizeCacheOverride(normalized.cache);
        if (cache) {
            normalized.cache = cache;
        } else {
            delete normalized.cache;
        }
    }
}
function normalizeProviderSpecificData(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    normalizeNestedSubObjects(provider, normalized);
    if ("openaiStoreEnabled" in normalized && typeof normalized.openaiStoreEnabled !== "boolean") {
        delete normalized.openaiStoreEnabled;
    }
    if ("blockExtraUsage" in normalized && typeof normalized.blockExtraUsage !== "boolean") {
        delete normalized.blockExtraUsage;
    }
    // #2997: per-connection transient-cooldown opt-out — only persist a real boolean.
    if ("disableCooling" in normalized && typeof normalized.disableCooling !== "boolean") {
        delete normalized.disableCooling;
    }
    if ("autoFetchModels" in normalized && typeof normalized.autoFetchModels !== "boolean") {
        delete normalized.autoFetchModels;
    }
    if ("preset" in normalized) {
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
        if (preset) {
            normalized.preset = preset;
        } else {
            delete normalized.preset;
        }
    }
    if (provider === "bedrock" && "region" in normalized) {
        const region = normalizeAwsRegion(normalized.region);
        if (region) {
            normalized.region = region;
        } else {
            delete normalized.region;
        }
    }
    if ("tag" in normalized) {
        if (typeof normalized.tag === "string") {
            const trimmedTag = normalized.tag.trim();
            if (trimmedTag) {
                normalized.tag = trimmedTag;
            } else {
                delete normalized.tag;
            }
        } else {
            delete normalized.tag;
        }
    }
    if ("tags" in normalized) {
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
        if (excludedModels.length > 0) {
            normalized.excludedModels = excludedModels;
        } else {
            delete normalized.excludedModels;
        }
        delete normalized.excluded_models;
    }
    // #8369: connection-level custom upstream headers — sanitize each key against the
    // forbidden-header denylist and drop entries with non-string or empty values.
    if ("customHeaders" in normalized) {
        const raw = normalized.customHeaders;
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const cleaned = {};
            for (const [key, value] of Object.entries(raw)){
                const trimmedKey = key.trim();
                if (!trimmedKey) continue;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
                if (typeof value === "string" && value.trim().length > 0) {
                    cleaned[trimmedKey] = value.trim();
                }
            }
            if (Object.keys(cleaned).length > 0) {
                normalized.customHeaders = cleaned;
            } else {
                delete normalized.customHeaders;
            }
        } else {
            delete normalized.customHeaders;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
function sanitizeProviderSpecificDataForResponse(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const sanitized = {
        ...record
    };
    delete sanitized.consoleApiKey;
    delete sanitized.secretAccessKey;
    delete sanitized.awsSecretAccessKey;
    delete sanitized.sessionToken;
    delete sanitized.awsSessionToken;
    delete sanitized.openCodeGoAuthCookie;
    delete sanitized.opencodeGoAuthCookie;
    delete sanitized.authCookie;
    delete sanitized.ollamaUsageCookie;
    delete sanitized.ollamaCloudUsageCookie;
    delete sanitized.ollamaCloudCookie;
    delete sanitized.usageCookie;
    return sanitized;
}
function isOpenAIResponsesStoreEnabled(providerSpecificData) {
    return asRecord(providerSpecificData).openaiStoreEnabled === true;
}
function buildOpenAIStoreSessionId(sessionId) {
    if (!hasNonEmptyString(sessionId)) return undefined;
    const normalized = String(sessionId).trim().replace(/^ext:/i, "").replace(/[^a-zA-Z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
    if (!normalized) return undefined;
    return `omniroute-session-${normalized}`;
}
function ensureOpenAIStoreSessionFallback(body, sessionId) {
    const explicitSessionId = body.session_id;
    const explicitConversationId = body.conversation_id;
    const promptCacheKey = body.prompt_cache_key ?? body.promptCacheKey;
    if (hasNonEmptyString(explicitSessionId) || hasNonEmptyString(explicitConversationId) || hasNonEmptyString(promptCacheKey)) {
        return body;
    }
    const fallbackSessionId = buildOpenAIStoreSessionId(sessionId);
    if (!fallbackSessionId) return body;
    return {
        ...body,
        session_id: fallbackSessionId
    };
}
function getProviderRequestDefaults(provider, providerSpecificData) {
    return normalizeRequestDefaults(provider, asRecord(providerSpecificData).requestDefaults) || {};
}
function getCodexRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("codex", providerSpecificData);
    const reasoningEffort = normalizeCodexReasoningEffort(defaults.reasoningEffort);
    const serviceTier = normalizeCodexServiceTier(defaults.serviceTier);
    return {
        ...reasoningEffort ? {
            reasoningEffort
        } : {},
        ...serviceTier ? {
            serviceTier
        } : {}
    };
}
function getClaudeCodeCompatibleRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("anthropic-compatible-cc-default", providerSpecificData);
    const context1m = normalizeClaudeCodeCompatibleContext1m(defaults.context1m);
    const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(defaults.redactThinking);
    const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(defaults.summarizeThinking);
    return {
        ...context1m ? {
            context1m
        } : {},
        ...redactThinking ? {
            redactThinking
        } : {},
        ...summarizeThinking ? {
            summarizeThinking
        } : {}
    };
}
}),
"[project]/src/shared/constants/appConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_CONFIG",
    ()=>APP_CONFIG,
    "THEME_CONFIG",
    ()=>THEME_CONFIG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/package.json.[json].mjs [app-route] (ecmascript)");
;
const APP_CONFIG = {
    name: "OmniRoute",
    description: "AI Gateway for Multi-Provider LLMs",
    version: __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].version
};
const THEME_CONFIG = {
    storageKey: "theme",
    defaultTheme: "system"
};
}),
"[project]/src/shared/utils/clineAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyClineAuthHeaders",
    ()=>applyClineAuthHeaders,
    "applyClineProtocolHeaders",
    ()=>applyClineProtocolHeaders,
    "buildClineHeaders",
    ()=>buildClineHeaders,
    "buildClinepassHeaders",
    ()=>buildClinepassHeaders,
    "getClineAccessToken",
    ()=>getClineAccessToken,
    "getClineAuthorizationHeader",
    ()=>getClineAuthorizationHeader,
    "resolveClineTaskId",
    ()=>resolveClineTaskId
]);
/**
 * Cline (cline.bot) auth-shape helpers.
 *
 * Cline's API expects the bearer token to be prefixed with `workos:` (the
 * upstream auth provider), and a set of Cline client-identification headers
 * (HTTP-Referer / X-Title / X-CLIENT-* / X-PLATFORM*). Plain `Bearer <token>`
 * without the `workos:` prefix is rejected upstream, so every Cline request
 * must route its headers through `buildClineHeaders()`.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [app-route] (ecmascript)");
;
;
const APP_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APP_CONFIG"].version;
function cleanHeaderValue(value) {
    if (typeof value !== "string") return undefined;
    const cleaned = value.trim();
    if (!cleaned || cleaned.length > 256 || /[\r\n\0]/.test(cleaned)) return undefined;
    return cleaned;
}
function getHeaderCaseInsensitive(headers, name) {
    const key = Object.keys(headers ?? {}).find((candidate)=>candidate.toLowerCase() === name);
    return key ? cleanHeaderValue(headers?.[key]) : undefined;
}
function resolveClineTaskId(clientHeaders) {
    return getHeaderCaseInsensitive(clientHeaders, "x-task-id") ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
}
function applyClineProtocolHeaders(headers, context = {}) {
    const taskId = cleanHeaderValue(context.taskId) ?? getHeaderCaseInsensitive(headers, "x-task-id") ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const clientVersion = cleanHeaderValue(context.clientVersion) ?? APP_VERSION;
    const required = {
        "HTTP-Referer": "https://cline.bot",
        "X-Title": "Cline",
        "User-Agent": `Cline/${clientVersion}`,
        "X-IS-MULTIROOT": context.isMultiRoot === true ? "true" : "false",
        "X-CLIENT-TYPE": cleanHeaderValue(context.clientType) ?? "omniroute",
        "X-CLIENT-VERSION": clientVersion,
        "X-PLATFORM": cleanHeaderValue(context.platform) ?? process.platform ?? "unknown",
        "X-PLATFORM-VERSION": cleanHeaderValue(context.platformVersion) ?? process.version ?? "unknown",
        "X-CORE-VERSION": cleanHeaderValue(context.coreVersion) ?? APP_VERSION,
        "X-Task-ID": taskId
    };
    for (const [name, value] of Object.entries(required)){
        for (const existing of Object.keys(headers)){
            if (existing !== name && existing.toLowerCase() === name.toLowerCase()) {
                delete headers[existing];
            }
        }
        headers[name] = value;
    }
    return headers;
}
function getClineAccessToken(token) {
    if (typeof token !== "string") return "";
    const trimmed = token.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("workos:") ? trimmed : `workos:${trimmed}`;
}
function getClineAuthorizationHeader(token) {
    const accessToken = getClineAccessToken(token);
    return accessToken ? `Bearer ${accessToken}` : "";
}
function buildClineHeaders(token, extraHeaders = {}, context = {}) {
    const authorization = getClineAuthorizationHeader(token);
    const headers = applyClineProtocolHeaders({
        ...extraHeaders
    }, context);
    if (authorization) {
        headers.Authorization = authorization;
    }
    return headers;
}
function buildClinepassHeaders(credentials, effectiveKey, context = {}) {
    if (credentials?.accessToken) {
        return buildClineHeaders(credentials.accessToken, {}, context);
    }
    const headers = applyClineProtocolHeaders({}, context);
    const byokKey = effectiveKey || credentials?.apiKey;
    if (byokKey) headers.Authorization = `Bearer ${byokKey}`;
    return headers;
}
function applyClineAuthHeaders(headers, credentials, effectiveKey, clientHeaders, isClinepass) {
    const context = {
        taskId: resolveClineTaskId(clientHeaders)
    };
    const built = isClinepass ? buildClinepassHeaders(credentials, effectiveKey, context) : buildClineHeaders(effectiveKey || credentials?.accessToken, {}, context);
    Object.assign(headers, built);
    return headers;
}
}),
"[project]/src/shared/utils/cliCompat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeCliCompatProviderId",
    ()=>normalizeCliCompatProviderId
]);
function normalizeCliCompatProviderId(providerId) {
    const normalized = providerId.toLowerCase();
    if (normalized === "copilot") return "github";
    return normalized;
}
}),
];

//# sourceMappingURL=src_20zbo13._.js.map