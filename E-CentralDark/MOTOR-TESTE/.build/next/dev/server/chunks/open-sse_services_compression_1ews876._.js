module.exports = [
"[project]/open-sse/services/compression/adaptiveCompression/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Context-budget adaptive compression — shared types.
 *
 * Naming note: "adaptiveCompression"/"contextBudget" — NOT "headroom" (which is an
 * unrelated existing engine). "headroom" here = the budget signal (target − prompt tokens).
 */ /** Target-derivation policy (design D-C1). */ __turbopack_context__.s([
    "DEFAULT_CONTEXT_BUDGET",
    ()=>DEFAULT_CONTEXT_BUDGET
]);
const DEFAULT_CONTEXT_BUDGET = {
    mode: "off",
    policy: "reserve-output",
    outputReserve: 4096,
    safetyMargin: 1024,
    pct: 0.85,
    absoluteBudget: 0
};
}),
"[project]/open-sse/services/compression/engineCatalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Cache impact is a qualitative estimate of how much an engine's per-request output
// variance disrupts upstream prompt-prefix caching (e.g. Anthropic/OpenAI prompt
// caching): "none"/"low" = deterministic, cache-friendly; "high" = output shape varies
// enough across requests (summarization, query-dependent pruning) that cached prefixes
// are less likely to be reused. Source: docs/compression/COMPRESSION_GUIDE.md,
// docs/compression/COMPRESSION_ENGINES.md (#7530).
__turbopack_context__.s([
    "ENGINE_CATALOG",
    ()=>ENGINE_CATALOG,
    "ENGINE_IDS",
    ()=>ENGINE_IDS,
    "engineMeta",
    ()=>engineMeta,
    "isSafeDefault",
    ()=>isSafeDefault
]);
const ENGINE_CATALOG = {
    "session-dedup": {
        id: "session-dedup",
        label: "Session Dedup",
        stackPriority: 3,
        isSingleMode: false,
        description: "Cross-turn block deduplication.",
        guidance: {
            tradeoffs: "Lossless — elides only text already sent earlier in the same session; nothing is summarized or dropped. Negligible latency overhead.",
            lossy: false,
            cacheImpact: "low"
        }
    },
    ccr: {
        id: "ccr",
        label: "CCR (Retrieval)",
        stackPriority: 4,
        isSingleMode: false,
        description: "Content-addressed retrieval markers.",
        guidance: {
            tradeoffs: "Lossless — replaces large repeated/contiguous blocks with content-addressed references instead of deleting them; the original content stays retrievable.",
            lossy: false,
            cacheImpact: "low"
        }
    },
    lite: {
        id: "lite",
        label: "Lite",
        stackPriority: 5,
        isSingleMode: true,
        description: "Whitespace/format cleanup.",
        guidance: {
            tradeoffs: "Safest mode (~15% savings, <1ms latency): whitespace/dedup/formatting cleanup only, zero semantic change. Always safe to leave on.",
            lossy: false,
            cacheImpact: "none"
        }
    },
    rtk: {
        id: "rtk",
        label: "RTK",
        stackPriority: 10,
        levels: [
            "minimal",
            "standard",
            "aggressive"
        ],
        isSingleMode: true,
        description: "Command-output filtering.",
        guidance: {
            tradeoffs: "Strips ANSI noise, progress bars, and repeated lines from command/tool output while preserving failures, warnings, and summaries (60-90% upstream savings). The 'aggressive' level trims more tail context than 'minimal'/'standard'.",
            lossy: true,
            cacheImpact: "moderate"
        }
    },
    "codex-responses": {
        id: "codex-responses",
        label: "Responses Tool Output",
        stackPriority: 12,
        isSingleMode: true,
        description: "Conservative compression for supported Responses tool outputs.",
        guidance: {
            tradeoffs: "Lossless-first JSON and bounded diagnostic compression for shell, patch, search, and build outputs. Protected tools and uncertain shapes pass through unchanged.",
            lossy: true,
            cacheImpact: "low"
        }
    },
    headroom: {
        id: "headroom",
        label: "Headroom",
        stackPriority: 15,
        isSingleMode: false,
        description: "Tabular JSON compaction.",
        guidance: {
            tradeoffs: "Lossless columnar compaction (SmartCrusher) of homogeneous JSON-array payloads into a compact '[N rows]' form — no data is discarded.",
            lossy: false,
            cacheImpact: "low"
        }
    },
    relevance: {
        id: "relevance",
        label: "Relevance",
        stackPriority: 18,
        isSingleMode: true,
        description: "Extractive sentence scoring against the last user query.",
        guidance: {
            tradeoffs: "Drops sentences scored as less relevant to the last user query — output depends on the query, so it can omit context a later turn needs.",
            lossy: true,
            cacheImpact: "moderate"
        }
    },
    caveman: {
        id: "caveman",
        label: "Caveman",
        stackPriority: 20,
        levels: [
            "lite",
            "full",
            "ultra"
        ],
        isSingleMode: true,
        description: "Rule-based prose compression.",
        guidance: {
            tradeoffs: "Rule-based prose condensation (~30% savings at 'full'): strips filler and hedging while preserving meaning, but rewrites text so it is not byte-identical to the original.",
            lossy: true,
            cacheImpact: "moderate"
        }
    },
    aggressive: {
        id: "aggressive",
        label: "Aggressive",
        stackPriority: 30,
        isSingleMode: true,
        description: "Summarize + age old turns.",
        guidance: {
            tradeoffs: "Summarizes and progressively ages older turns (~50% savings) — trades older-turn fidelity for context headroom in long sessions; summarized turns can't be perfectly reconstructed.",
            lossy: true,
            cacheImpact: "high"
        }
    },
    llmlingua: {
        id: "llmlingua",
        label: "LLMLingua (SLM)",
        stackPriority: 35,
        isSingleMode: false,
        description: "Semantic pruning (ONNX).",
        guidance: {
            tradeoffs: "Semantic token pruning via a small ONNX classifier — removes individual tokens judged low-information. Fail-opens (returns the original text) on any error, so the worst case is no savings, never corruption.",
            lossy: true,
            cacheImpact: "high"
        }
    },
    ultra: {
        id: "ultra",
        label: "Ultra",
        stackPriority: 40,
        isSingleMode: true,
        description: "Heuristic token pruning (+ optional SLM).",
        guidance: {
            tradeoffs: "Maximum-compression mode (~75% savings): heuristic pruning, code-block thinning, and binary-search truncation. Highest risk of losing context a later turn depended on — best reserved for hitting context limits.",
            lossy: true,
            cacheImpact: "high"
        }
    },
    omniglyph: {
        id: "omniglyph",
        label: "OmniGlyph",
        stackPriority: 90,
        isSingleMode: true,
        description: "Contexto-como-imagem (Claude Fable 5, rota direta).",
        guidance: {
            tradeoffs: "Experimental context-as-image encoding routed directly to Claude Fable 5 only — the most aggressive and least broadly compatible option; not recommended as a general-purpose default.",
            lossy: true,
            cacheImpact: "high"
        }
    }
};
const ENGINE_IDS = Object.values(ENGINE_CATALOG).sort((a, b)=>a.stackPriority - b.stackPriority).map((e)=>e.id);
function engineMeta(id) {
    return ENGINE_CATALOG[id];
}
function isSafeDefault(id) {
    return !engineMeta(id).guidance.lossy;
}
}),
"[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_AGGRESSIVE_CONFIG",
    ()=>DEFAULT_AGGRESSIVE_CONFIG,
    "DEFAULT_CAVEMAN_CONFIG",
    ()=>DEFAULT_CAVEMAN_CONFIG,
    "DEFAULT_CAVEMAN_OUTPUT_MODE_CONFIG",
    ()=>DEFAULT_CAVEMAN_OUTPUT_MODE_CONFIG,
    "DEFAULT_CCR_CONFIG",
    ()=>DEFAULT_CCR_CONFIG,
    "DEFAULT_CODEX_RESPONSES_CONFIG",
    ()=>DEFAULT_CODEX_RESPONSES_CONFIG,
    "DEFAULT_COMPRESSION_CONFIG",
    ()=>DEFAULT_COMPRESSION_CONFIG,
    "DEFAULT_COMPRESSION_LANGUAGE_CONFIG",
    ()=>DEFAULT_COMPRESSION_LANGUAGE_CONFIG,
    "DEFAULT_CONTEXT_EDITING_CONFIG",
    ()=>DEFAULT_CONTEXT_EDITING_CONFIG,
    "DEFAULT_HEADROOM_CONFIG",
    ()=>DEFAULT_HEADROOM_CONFIG,
    "DEFAULT_RTK_CONFIG",
    ()=>DEFAULT_RTK_CONFIG,
    "DEFAULT_SESSION_DEDUP_CONFIG",
    ()=>DEFAULT_SESSION_DEDUP_CONFIG,
    "DEFAULT_ULTRA_CONFIG",
    ()=>DEFAULT_ULTRA_CONFIG
]);
/**
 * Compression Pipeline Types — Lite, Caveman, Aggressive, Ultra, RTK, and Stacked modes.
 *
 * Shared type definitions for the compression pipeline.
 * Phase 1: 'off' and 'lite' modes.
 * Phase 2: 'standard' mode (caveman engine).
 * Phase 3: 'aggressive' mode (summarization + tool compression + aging).
 * Phase 4: 'ultra' mode (heuristic token pruning + optional SLM tier).
 * Phase 5: 'rtk', 'codex-responses', and 'stacked' modes (tool-output filters + multi-engine pipeline).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineCatalog.ts [app-route] (ecmascript)");
;
;
const DEFAULT_CODEX_RESPONSES_CONFIG = {
    enabled: false,
    minBytes: 512,
    maxOutputBytes: 2 * 1024 * 1024,
    maxCandidateBytes: 512 * 1024,
    maxLines: 160,
    minSearchMatches: 8,
    minLogLines: 24,
    preserveToolNames: [
        "Read",
        "Glob",
        "Grep",
        "Write",
        "Edit",
        "WebSearch",
        "WebFetch",
        "read",
        "glob",
        "grep",
        "write",
        "edit",
        "web_search",
        "web_fetch"
    ]
};
const DEFAULT_COMPRESSION_CONFIG = {
    enabled: false,
    defaultMode: "off",
    autoTriggerMode: "lite",
    autoTriggerTokens: 0,
    cacheMinutes: 5,
    preserveSystemPrompt: true,
    preserveSystemPromptMode: "always",
    mcpDescriptionCompressionEnabled: true,
    comboOverrides: {},
    compressionComboId: null,
    stackedPipeline: [
        {
            engine: "rtk",
            intensity: "standard"
        },
        {
            engine: "caveman",
            intensity: "full"
        }
    ],
    engines: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ENGINE_IDS"].map((id)=>[
            id,
            {
                enabled: false
            }
        ])),
    activeComboId: null,
    ultraEngine: "heuristic",
    ultraSlmPrewarm: false,
    liveZone: {
        enabled: false
    },
    codexResponsesConfig: {
        ...DEFAULT_CODEX_RESPONSES_CONFIG
    }
};
const DEFAULT_CAVEMAN_CONFIG = {
    enabled: false,
    compressRoles: [
        "user"
    ],
    skipRules: [],
    minMessageLength: 50,
    // Protect code blocks, inline code, file paths, URLs, and error/stack lines
    // from caveman compression so signal-carrying content is never mangled.
    preservePatterns: [
        "```[\\s\\S]*?```",
        "`[^`\\n]+`",
        "\\b(https?://\\S+)",
        "(?:^|\\s)(\\.{0,2}/[\\w./\\-]+)",
        "^\\s*(Error|TypeError|RangeError|SyntaxError|ReferenceError):",
        "^\\s+at\\s"
    ],
    intensity: "lite"
};
const DEFAULT_CAVEMAN_OUTPUT_MODE_CONFIG = {
    enabled: false,
    intensity: "lite",
    autoClarity: true
};
const DEFAULT_RTK_CONFIG = {
    enabled: false,
    intensity: "minimal",
    applyToToolResults: true,
    applyToCodeBlocks: false,
    applyToAssistantMessages: false,
    enabledFilters: [],
    disabledFilters: [],
    maxLinesPerResult: 120,
    maxCharsPerResult: 12000,
    deduplicateThreshold: 3,
    customFiltersEnabled: true,
    trustProjectFilters: false,
    rawOutputRetention: "never",
    rawOutputMaxBytes: 1_048_576,
    enableGrouping: false,
    groupingThreshold: 3,
    stripCodeComments: false,
    preserveDocstrings: true,
    enableRenderers: false
};
const DEFAULT_COMPRESSION_LANGUAGE_CONFIG = {
    enabled: false,
    defaultLanguage: "en",
    autoDetect: true,
    enabledPacks: [
        "en"
    ]
};
const DEFAULT_CONTEXT_EDITING_CONFIG = {
    enabled: false
};
const DEFAULT_AGGRESSIVE_CONFIG = {
    thresholds: {
        fullSummary: 5,
        moderate: 3,
        light: 2,
        verbatim: 2
    },
    toolStrategies: {
        fileContent: true,
        grepSearch: true,
        shellOutput: true,
        json: true,
        errorMessage: true
    },
    summarizerEnabled: true,
    maxTokensPerMessage: 2048,
    minSavingsThreshold: 0.05
};
const DEFAULT_ULTRA_CONFIG = {
    enabled: false,
    compressionRate: 0.5,
    minScoreThreshold: 0.3,
    slmFallbackToAggressive: true,
    maxTokensPerMessage: 0
};
const DEFAULT_HEADROOM_CONFIG = {
    minRows: 8
};
const DEFAULT_SESSION_DEDUP_CONFIG = {
    minBlockChars: 80,
    fuzzy: false
};
const DEFAULT_CCR_CONFIG = {
    minChars: 600,
    retrievalRampFactor: 2
};
;
}),
"[project]/open-sse/services/compression/engines/mcpAccessibility/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MCP_ACCESSIBILITY_CONFIG",
    ()=>DEFAULT_MCP_ACCESSIBILITY_CONFIG,
    "MCP_ACCESSIBILITY_DEFAULTS",
    ()=>MCP_ACCESSIBILITY_DEFAULTS,
    "MCP_ACCESSIBILITY_MIN_MAX_TEXT_CHARS",
    ()=>MCP_ACCESSIBILITY_MIN_MAX_TEXT_CHARS,
    "MCP_ACCESSIBILITY_TAIL_RESERVE",
    ()=>MCP_ACCESSIBILITY_TAIL_RESERVE,
    "clampMcpAccessibilityConfig",
    ()=>clampMcpAccessibilityConfig
]);
const MCP_ACCESSIBILITY_DEFAULTS = {
    maxTextChars: 50000,
    collapseThreshold: 30,
    collapseKeepHead: 10,
    collapseKeepTail: 5,
    minLengthToProcess: 2000,
    preserveRefPattern: /\[ref=e\d+\]/g
};
const DEFAULT_MCP_ACCESSIBILITY_CONFIG = {
    enabled: true,
    maxTextChars: MCP_ACCESSIBILITY_DEFAULTS.maxTextChars,
    collapseThreshold: MCP_ACCESSIBILITY_DEFAULTS.collapseThreshold,
    collapseKeepHead: MCP_ACCESSIBILITY_DEFAULTS.collapseKeepHead,
    collapseKeepTail: MCP_ACCESSIBILITY_DEFAULTS.collapseKeepTail,
    minLengthToProcess: MCP_ACCESSIBILITY_DEFAULTS.minLengthToProcess
};
const MCP_ACCESSIBILITY_TAIL_RESERVE = 300;
const MCP_ACCESSIBILITY_MIN_MAX_TEXT_CHARS = MCP_ACCESSIBILITY_TAIL_RESERVE * 2;
function boundedInt(value, min, fallback) {
    return typeof value === "number" && Number.isFinite(value) && value >= min ? Math.floor(value) : fallback;
}
function clampMcpAccessibilityConfig(raw) {
    const record = raw && typeof raw === "object" ? raw : {};
    const d = DEFAULT_MCP_ACCESSIBILITY_CONFIG;
    return {
        enabled: record["enabled"] !== false,
        maxTextChars: boundedInt(record["maxTextChars"], MCP_ACCESSIBILITY_MIN_MAX_TEXT_CHARS, d.maxTextChars),
        collapseThreshold: boundedInt(record["collapseThreshold"], 1, d.collapseThreshold),
        collapseKeepHead: boundedInt(record["collapseKeepHead"], 0, d.collapseKeepHead),
        collapseKeepTail: boundedInt(record["collapseKeepTail"], 0, d.collapseKeepTail),
        minLengthToProcess: boundedInt(record["minLengthToProcess"], 1, d.minLengthToProcess)
    };
}
}),
"[project]/open-sse/services/compression/exclusions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isCompressionExcluded",
    ()=>isCompressionExcluded,
    "normalizeCompressionExclusions",
    ()=>normalizeCompressionExclusions
]);
/**
 * Compression Exclusions (#8034) — per-model/endpoint exclusion filter.
 *
 * Lets an operator name model ids / `provider/model` targets that must NEVER be
 * compressed. Matching targets bypass the whole compression pipeline and pass
 * through byte-identical (see `chatCore.ts` — the check runs before any engine
 * executes). Default (empty/absent list) preserves pre-existing behavior exactly.
 *
 * Pattern syntax: `*` is the only wildcard. Every other regex metacharacter is
 * escaped before the pattern is compiled, so a pattern like `gpt-5.6` matches the
 * literal string only (not `gpt-5x6`) — never build a regex from raw operator
 * input without escaping (ReDoS convention, see CLAUDE.md).
 */ const MAX_EXCLUSIONS = 200;
/** Escape every regex metacharacter except `*`, which the caller re-inserts as `.*`. */ function escapeExceptWildcard(pattern) {
    return pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
}
/** Compile a single normalized (already lowercased/trimmed) pattern into a bounded regex. */ function compilePattern(pattern) {
    return new RegExp(`^${escapeExceptWildcard(pattern)}$`);
}
function normalizeCompressionExclusions(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const result = [];
    for (const entry of raw){
        if (typeof entry !== "string") continue;
        const trimmed = entry.trim().toLowerCase();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        result.push(trimmed);
        if (result.length >= MAX_EXCLUSIONS) break;
    }
    return result;
}
function isCompressionExcluded(target, exclusions) {
    if (!exclusions || exclusions.length === 0) return false;
    const model = (target.model ?? "").trim().toLowerCase();
    const provider = (target.provider ?? "").trim().toLowerCase();
    if (!model && !provider) return false;
    const composite = provider && model ? `${provider}/${model}` : "";
    for (const pattern of exclusions){
        if (!pattern) continue;
        const regex = compilePattern(pattern);
        if (model && regex.test(model)) return true;
        if (composite && regex.test(composite)) return true;
    }
    return false;
}
}),
"[project]/open-sse/services/compression/preserveSystemPromptMode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PRESERVE_SYSTEM_PROMPT_MODES",
    ()=>PRESERVE_SYSTEM_PROMPT_MODES,
    "isPreserveSystemPromptMode",
    ()=>isPreserveSystemPromptMode,
    "modeToBaselineBoolean",
    ()=>modeToBaselineBoolean,
    "normalizePreserveSystemPromptMode",
    ()=>normalizePreserveSystemPromptMode,
    "resolvePreserveSystemPrompt",
    ()=>resolvePreserveSystemPrompt
]);
const PRESERVE_SYSTEM_PROMPT_MODES = [
    "always",
    "whenNoCache",
    "never"
];
function isPreserveSystemPromptMode(value) {
    return typeof value === "string" && PRESERVE_SYSTEM_PROMPT_MODES.includes(value);
}
function normalizePreserveSystemPromptMode(config) {
    if (isPreserveSystemPromptMode(config.preserveSystemPromptMode)) {
        return config.preserveSystemPromptMode;
    }
    return config.preserveSystemPrompt === false ? "whenNoCache" : "always";
}
function resolvePreserveSystemPrompt(mode, { hasCache }) {
    switch(mode){
        case "always":
            return true;
        case "never":
            return false;
        case "whenNoCache":
            return hasCache;
    }
}
function modeToBaselineBoolean(mode) {
    return resolvePreserveSystemPrompt(mode, {
        hasCache: false
    });
}
}),
"[project]/open-sse/services/compression/ultraHeuristic.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Ultra Compression — Tier A Heuristic Token Pruner (Phase 4)
 *
 * Scores tokens by information density and prunes low-value tokens
 * to achieve a target compression rate.
 */ __turbopack_context__.s([
    "FORCE_PRESERVE_RE",
    ()=>FORCE_PRESERVE_RE,
    "STOPWORDS",
    ()=>STOPWORDS,
    "pruneByScore",
    ()=>pruneByScore,
    "scoreToken",
    ()=>scoreToken
]);
const STOPWORDS = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "shall",
    "can",
    "need",
    "dare",
    "ought",
    "used",
    "i",
    "we",
    "you",
    "he",
    "she",
    "it",
    "they",
    "me",
    "us",
    "him",
    "her",
    "them",
    "my",
    "our",
    "your",
    "his",
    "its",
    "their",
    "this",
    "that",
    "these",
    "those",
    "and",
    "but",
    "or",
    "nor",
    "for",
    "yet",
    "so",
    "as",
    "at",
    "by",
    "in",
    "of",
    "on",
    "to",
    "up",
    "via",
    "with",
    "from",
    "into",
    "onto",
    "upon",
    "about",
    "just",
    "very",
    "really",
    "quite",
    "rather",
    "also",
    "too",
    "even",
    "still",
    "already",
    "always",
    "never",
    "often",
    "usually",
    "sometimes",
    "here",
    "there"
]);
const FORCE_PRESERVE_RE = /\d|https?:\/\/|[._\/\\]|Error:|Exception:|```/i;
function scoreToken(token) {
    if (FORCE_PRESERVE_RE.test(token)) return 1.0;
    const lower = token.toLowerCase();
    if (STOPWORDS.has(lower)) return 0.1;
    if (token.length <= 2) return 0.2;
    if (/^[A-Z]/.test(token)) return 0.8; // proper nouns / identifiers
    if (token.length >= 6) return 0.7;
    return 0.5;
}
function pruneByScore(text, keepRate = 0.5, minScore = 0.3) {
    if (!text || keepRate >= 1) return text;
    const tokens = text.split(/(\s+)/); // preserve whitespace tokens
    const wordTokens = tokens.filter((t)=>!/^\s+$/.test(t));
    const targetKeep = Math.ceil(wordTokens.length * keepRate);
    // Score each word token
    const scored = wordTokens.map((t, i)=>({
            t,
            i,
            score: scoreToken(t)
        }));
    // Sort by score ascending — lowest scores pruned first
    const sorted = [
        ...scored
    ].sort((a, b)=>a.score - b.score);
    const toPrune = new Set();
    let pruned = 0;
    for (const { i, score } of sorted){
        if (pruned >= wordTokens.length - targetKeep) break;
        if (score < minScore) {
            toPrune.add(i);
            pruned++;
        }
    }
    // Rebuild preserving whitespace
    let wordIdx = 0;
    return tokens.map((t)=>{
        if (/^\s+$/.test(t)) return t;
        const keep = !toPrune.has(wordIdx);
        wordIdx++;
        return keep ? t : "";
    }).join("").replace(/\s{2,}/g, " ").trim();
}
}),
"[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractPreservedBlocks",
    ()=>extractPreservedBlocks,
    "findFencedCodeBlocks",
    ()=>findFencedCodeBlocks,
    "preserveSpans",
    ()=>preserveSpans,
    "restorePreservedBlocks",
    ()=>restorePreservedBlocks,
    "shouldPreserve",
    ()=>shouldPreserve
]);
const SENTINEL_PREFIX = "\u0000OMNI_CAVEMAN";
function randomSentinelSeed() {
    const bytes = new Uint8Array(8);
    const cryptoLike = globalThis.crypto;
    if (cryptoLike?.getRandomValues) {
        cryptoLike.getRandomValues(bytes);
        return `r${Array.from(bytes, (b)=>b.toString(16).padStart(2, "0")).join("")}`;
    }
    return `r${Math.random().toString(36).slice(2)}`;
}
function ensureGlobal(pattern) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    return new RegExp(pattern.source, flags);
}
function compileUserPatterns(patterns) {
    if (!patterns?.length) return [];
    const compiled = [];
    for (const pattern of patterns){
        try {
            compiled.push({
                pattern: typeof pattern === "string" ? new RegExp(pattern, "g") : ensureGlobal(pattern),
                kind: "custom"
            });
        } catch  {
        // Invalid user regexes are ignored by the hot path. Validation/preview exposes warnings.
        }
    }
    return compiled;
}
function replacePattern(text, pattern, kind, addBlock) {
    pattern.lastIndex = 0;
    return text.replace(pattern, (match)=>{
        if (!match) return match;
        if (match.includes(SENTINEL_PREFIX)) return match;
        return addBlock(match, kind);
    });
}
function findFencedCodeBlocks(text) {
    const blocks = [];
    extractFencedCodeBlocks(text, (content)=>{
        blocks.push(content);
        return content;
    });
    return blocks;
}
function extractPreservedBlocks(text, options = {}) {
    const blocks = [];
    const seed = randomSentinelSeed();
    let counter = 0;
    const addBlock = (content, kind)=>{
        const placeholder = `${SENTINEL_PREFIX}_${seed}_${counter}\u0000`;
        blocks.push({
            placeholder,
            content,
            kind
        });
        counter++;
        return placeholder;
    };
    let result = text;
    result = extractFrontmatter(result, addBlock);
    result = extractFencedCodeBlocks(result, (content)=>addBlock(content, "fenced_code"));
    const builtIns = [
        {
            pattern: /\$\$[\s\S]*?\$\$/g,
            kind: "math_block"
        },
        {
            pattern: /\\\[[\s\S]*?\\\]/g,
            kind: "math_block"
        },
        // #4795: exclude `\` from the catch-all branch so a backslash is only ever
        // consumed by the escape branch `\\.`. The previous `[^$\n]` overlapped with
        // `\\.`, making a run of consecutive backslashes (e.g. unmatched `$` + a
        // Windows path) exponentially ambiguous → catastrophic backtracking (ReDoS).
        {
            pattern: /(?<!\$)\$(?![\s$\d])(?:\\.|[^$\n\\]){1,160}?(?<!\s)\$(?!\$)/g,
            kind: "math_inline"
        },
        {
            pattern: /\\begin\{[A-Za-z*]+\}[\s\S]*?\\end\{[A-Za-z*]+\}/g,
            kind: "latex_block"
        },
        {
            pattern: /^#{1,6}\s+.+$/gm,
            kind: "markdown_heading"
        },
        {
            pattern: /^\s*\|.*\|\s*$/gm,
            kind: "markdown_table"
        },
        {
            pattern: /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm,
            kind: "markdown_table"
        },
        {
            pattern: /^\s*#(?:set|show|let|import|include)\b.+$/gm,
            kind: "typst_directive"
        },
        {
            pattern: /`[^`\n]+`/g,
            kind: "inline_code"
        },
        {
            pattern: /\[[^\]\n]+\]\([^) \n]+(?:\s+"[^"]*")?\)/g,
            kind: "markdown_link"
        },
        {
            pattern: /\bhttps?:\/\/[^\s)\]"'>]+/gi,
            kind: "url"
        },
        {
            pattern: /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g,
            kind: "const_case"
        },
        {
            pattern: /\bprocess\.env\.[A-Za-z_][A-Za-z0-9_]*\b/g,
            kind: "env_var"
        },
        {
            pattern: /\$[A-Z_][A-Z0-9_]*\b/g,
            kind: "env_var"
        },
        {
            pattern: /\b\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?\b/g,
            kind: "version"
        },
        {
            pattern: /\b[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)+\(\)?/g,
            kind: "dotted_identifier"
        },
        {
            pattern: /\b[A-Za-z_$][\w$]*\s*\([^()\n]*\)/g,
            kind: "function_call"
        },
        {
            pattern: /(?:^|\s)(?:\.{0,2}\/[A-Za-z0-9_@./-]+|[A-Za-z]:\\[A-Za-z0-9_.\\/-]+)/g,
            kind: "file_path"
        },
        {
            pattern: /\b(?:TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|Error|Exception):[^\n]+/g,
            kind: "error_message"
        }
    ];
    for (const { pattern, kind } of [
        ...builtIns,
        ...compileUserPatterns(options.preservePatterns)
    ]){
        result = replacePattern(result, ensureGlobal(pattern), kind, addBlock);
    }
    return {
        text: result,
        blocks
    };
}
function preserveSpans(text, spans) {
    if (!spans.length) return {
        text,
        blocks: []
    };
    const seed = randomSentinelSeed();
    const blocks = [];
    let result = "";
    let cursor = 0;
    let counter = 0;
    for (const span of spans){
        if (span.start < cursor || span.end > text.length || span.start >= span.end) continue;
        const placeholder = `${SENTINEL_PREFIX}_${seed}_${counter}\u0000`;
        blocks.push({
            placeholder,
            content: text.slice(span.start, span.end),
            kind: span.kind
        });
        result += text.slice(cursor, span.start) + placeholder;
        cursor = span.end;
        counter++;
    }
    result += text.slice(cursor);
    return {
        text: result,
        blocks
    };
}
function extractFrontmatter(text, addBlock) {
    if (!text.startsWith("---\n")) return text;
    const close = text.indexOf("\n---", 4);
    if (close === -1) return text;
    const closeEnd = text.indexOf("\n", close + 4);
    const end = closeEnd === -1 ? text.length : closeEnd + 1;
    return `${addBlock(text.slice(0, end), "frontmatter")}${text.slice(end)}`;
}
function extractFencedCodeBlocks(text, addBlock) {
    const lines = text.match(/[^\n]*(?:\n|$)/g) ?? [
        text
    ];
    let output = "";
    let i = 0;
    while(i < lines.length){
        const line = lines[i];
        if (line === "" && i === lines.length - 1) break;
        const opening = line.match(/^([ \t]{0,3})(`{3,}|~{3,})[^\n]*(?:\n|$)/);
        if (!opening) {
            output += line;
            i++;
            continue;
        }
        const fence = opening[2];
        const fenceChar = fence[0];
        const minLen = fence.length;
        let block = line;
        let j = i + 1;
        let closed = false;
        while(j < lines.length){
            const candidate = lines[j];
            block += candidate;
            const closeMatch = candidate.match(/^([ \t]{0,3})(`{3,}|~{3,})\s*(?:\n|$)/);
            if (closeMatch && closeMatch[2][0] === fenceChar && closeMatch[2].length >= minLen) {
                closed = true;
                break;
            }
            j++;
        }
        if (!closed) {
            output += line;
            i++;
            continue;
        }
        output += addBlock(block);
        i = j + 1;
    }
    return output;
}
function restorePreservedBlocks(text, blocks) {
    let result = text;
    for (const block of blocks){
        result = result.split(block.placeholder).join(block.content);
    }
    return result;
}
function shouldPreserve(text, preservePatterns) {
    return preservePatterns.some((pattern)=>{
        pattern.lastIndex = 0;
        return pattern.test(text);
    });
}
}),
"[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractTextContent",
    ()=>extractTextContent,
    "isTextBlock",
    ()=>isTextBlock,
    "mapTextContent",
    ()=>mapTextContent,
    "replaceTextContent",
    ()=>replaceTextContent
]);
function isTextBlock(value) {
    return !!value && typeof value === "object" && "text" in value && typeof value.text === "string" && (value.type === undefined || value.type === "text" || value.type === "input_text");
}
function extractTextContent(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    const textParts = [];
    for (const part of content){
        if (isTextBlock(part) && part.text) {
            textParts.push(part.text);
        }
    }
    return textParts.join("\n");
}
function mapTextContent(msg, transform) {
    if (typeof msg.content === "string") {
        return {
            ...msg,
            content: transform(msg.content, 0)
        };
    }
    if (!Array.isArray(msg.content)) return msg;
    let textIndex = 0;
    let changed = false;
    const content = msg.content.map((part)=>{
        if (!isTextBlock(part)) return part;
        const nextText = transform(part.text ?? "", textIndex);
        textIndex++;
        if (nextText === part.text) return part;
        changed = true;
        return {
            ...part,
            text: nextText
        };
    });
    return changed ? {
        ...msg,
        content
    } : msg;
}
function replaceTextContent(msg, newText) {
    if (typeof msg.content === "string" || !Array.isArray(msg.content)) {
        return {
            ...msg,
            content: newText
        };
    }
    // The first text block receives `newText`. Trailing text blocks are normally
    // already subsumed by `newText` (callers build it from the JOIN of all text
    // blocks via extractTextContent), so we drop them to avoid duplicating content.
    // But if a caller's `newText` does NOT contain a trailing block's text, dropping
    // it would silently lose content the model can no longer see (B-AGG-TEXTDROP) —
    // so in that case we keep the trailing block instead of returning [].
    let replaced = false;
    const content = msg.content.flatMap((part)=>{
        if (!isTextBlock(part)) return [
            part
        ];
        if (!replaced) {
            replaced = true;
            return [
                {
                    ...part,
                    text: newText
                }
            ];
        }
        const partText = part.text ?? "";
        if (partText && !newText.includes(partText)) return [
            part
        ];
        return [];
    });
    if (!replaced) {
        return {
            ...msg,
            content: [
                {
                    type: "text",
                    text: newText
                },
                ...msg.content
            ]
        };
    }
    return {
        ...msg,
        content
    };
}
}),
"[project]/open-sse/services/compression/engines/llmlingua/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LLMLingua real-engine constants — pure data + types.
 *
 * NO imports of native deps (transformers.js, onnxruntime, etc). This module is
 * safe to import from anywhere (main thread, worker, tests) without pulling in
 * the heavy ONNX runtime.
 *
 * The real backend uses `@atjsh/llmlingua-2` (ONNX via `@huggingface/transformers`),
 * which downloads models from the HuggingFace Hub into a cache dir. Only the two
 * models PROVEN to work end-to-end are registered here.
 */ __turbopack_context__.s([
    "DEFAULT_LLMLINGUA_MODEL",
    ()=>DEFAULT_LLMLINGUA_MODEL,
    "LLMLINGUA_MODELS",
    ()=>LLMLINGUA_MODELS,
    "LLMLINGUA_WORKER_IDLE_MS",
    ()=>LLMLINGUA_WORKER_IDLE_MS,
    "LLMLINGUA_WORKER_TIMEOUT_MS",
    ()=>LLMLINGUA_WORKER_TIMEOUT_MS
]);
const DEFAULT_LLMLINGUA_MODEL = "tinybert";
const LLMLINGUA_MODELS = {
    tinybert: {
        id: "tinybert",
        hfRepo: "atjsh/llmlingua-2-js-tinybert-meetingbank",
        factory: "WithBERTMultilingual",
        dtype: "fp32",
        subfolder: "",
        sizeMB: 57,
        label: "TinyBERT (57MB, fast — default)"
    },
    "bert-base": {
        id: "bert-base",
        hfRepo: "Arcoldd/llmlingua4j-bert-base-onnx",
        factory: "WithBERTMultilingual",
        dtype: "fp32",
        subfolder: "",
        sizeMB: 710,
        label: "BERT-base (710MB, higher accuracy)"
    }
};
const LLMLINGUA_WORKER_TIMEOUT_MS = 5000;
const LLMLINGUA_WORKER_IDLE_MS = 300000;
}),
"[project]/open-sse/services/compression/engines/llmlingua/modelStore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configureTransformersEnv",
    ()=>configureTransformersEnv,
    "getLlmlinguaModelCacheDir",
    ()=>getLlmlinguaModelCacheDir,
    "resolveLlmlinguaModel",
    ()=>resolveLlmlinguaModel
]);
/**
 * LLMLingua model store — thin path/config resolver.
 *
 * transformers.js owns the actual model download (from the HuggingFace Hub into
 * its `cacheDir`). This module only resolves the cache directory, maps config
 * model ids to registry entries, and configures a transformers.js `env` object
 * for either Hub download (default) or a local modelPath override.
 *
 * Deliberately does NOT import the native `@huggingface/transformers` dep — it
 * accepts a minimal structural `env` so the heavy runtime stays out of this path.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/constants.ts [app-route] (ecmascript)");
;
;
;
;
/** Base data dir. Mirrors rtk's getDataDir() at engines/rtk/filterLoader.ts. */ function getDataDir() {
    return process.env.DATA_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
}
function getLlmlinguaModelCacheDir() {
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getDataDir(), "models", "llmlingua");
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
            recursive: true
        });
    } catch  {
    // Ignore mkdir errors — fail-open philosophy: transformers.js will surface a
    // clearer error if the dir is genuinely unusable, and callers fail-open anyway.
    }
    return dir;
}
function resolveLlmlinguaModel(modelId) {
    if (typeof modelId === "string" && modelId.length > 0 && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_MODELS"][modelId]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_MODELS"][modelId];
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_MODELS"][__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_LLMLINGUA_MODEL"]];
}
function configureTransformersEnv(env, opts) {
    env.cacheDir = getLlmlinguaModelCacheDir();
    if (typeof opts.modelPath === "string" && opts.modelPath.length > 0) {
        env.localModelPath = opts.modelPath;
        env.allowRemoteModels = false;
    } else {
        env.allowRemoteModels = true;
    }
}
}),
"[project]/open-sse/services/compression/engines/llmlingua/worker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetLlmlinguaWorkerForTests",
    ()=>__resetLlmlinguaWorkerForTests,
    "depsAvailable",
    ()=>depsAvailable,
    "firstAncestorWith",
    ()=>firstAncestorWith,
    "resolveWorkerFile",
    ()=>resolveWorkerFile,
    "workerBackend",
    ()=>workerBackend
]);
/**
 * LLMLingua-2 worker-thread backend (production path).
 *
 * Real MobileBERT/BERT ONNX inference via `@atjsh/llmlingua-2` running in a
 * `worker_threads.Worker` (`./onnxWorker.ts`). The backend stays STRICTLY
 * fail-open: any failure to resolve deps, spawn the worker, load the model, or
 * classify tokens returns the ORIGINAL text unchanged — never throws to the caller.
 *
 * ## Fail-open paths
 *  1. Optional-deps gate: if any of `@atjsh/llmlingua-2`, `@huggingface/transformers`,
 *     `@tensorflow/tfjs`, `js-tiktoken` does not resolve, return `text` immediately —
 *     NO worker spawn. This is the default in CI / most installs (deps are OPTIONAL).
 *  2. Per-call timeout: first call for a model gets `FIRST_CALL_TIMEOUT_MS` (one-time
 *     model load); warm calls get `LLMLINGUA_WORKER_TIMEOUT_MS`. On timeout → original
 *     text (the worker keeps loading and will warm for the next call).
 *  3. Worker error/exit → resolve all pending with their original text + respawn next.
 *
 * ## Serialization
 *  ONNX/tfjs are not reentrant — calls are queued FIFO and only one message is
 *  in-flight at a time (the next is posted after the previous reply or its timeout).
 *
 * ## Idle eviction
 *  After `LLMLINGUA_WORKER_IDLE_MS` with no calls, the worker is terminated and the
 *  singleton reset (next call respawns). The idle timer is `unref`'d so it never keeps
 *  the process alive.
 *
 * Code blocks NEVER reach this backend — the engine (index.ts) tombstones preserved
 * constructs first; this backend sees prose-only segments.
 *
 * VPS validation (Hard Rule #18): the real model is exercised behind RUN_LLMLINGUA_INT.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:worker_threads [external] (node:worker_threads, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$modelStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/modelStore.ts [app-route] (ecmascript)");
;
;
;
;
;
;
/** One-time model-load budget on the first call for a given model (tinybert ~2s, bert-base ~27s). */ const FIRST_CALL_TIMEOUT_MS = 60000;
/**
 * Gate probe: `@atjsh/llmlingua-2` is the entry package that declares the others
 * (`@huggingface/transformers`, `@tensorflow/tfjs`, `js-tiktoken`) as peers. We probe
 * ONLY it (by manifest existence) because the peers are ESM-only and `require.resolve`
 * throws for them even when installed; the worker still fail-opens if a peer is
 * genuinely missing at `import()` time.
 *
 * ⚠️ We do NOT use `createRequire(import.meta.url).resolve()` nor any other
 * `import.meta.url`-based resolution: the Next.js standalone bundle (webpack) replaces
 * `createRequire(import.meta.url)` with a stub module that ALWAYS throws
 * `MODULE_NOT_FOUND` and freezes `import.meta.url` to the build-machine path, so such a
 * gate is always false / mis-anchored in production (B-SLM). We probe the filesystem
 * from runtime anchors that survive the bundle instead.
 */ const GATE_DEP_REL = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join("node_modules", "@atjsh", "llmlingua-2", "package.json");
/** Relative path (from an install root) to the esbuild'd / source worker entry. */ const WORKER_JS_REL = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join("open-sse", "services", "compression", "engines", "llmlingua", "onnxWorker.js");
const WORKER_TS_REL = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join("open-sse", "services", "compression", "engines", "llmlingua", "onnxWorker.ts");
const MAX_WALK_UP = 8;
function firstAncestorWith(anchors, relPath) {
    for (const anchor of anchors){
        if (!anchor) continue;
        let dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(anchor);
        for(let i = 0; i <= MAX_WALK_UP; i++){
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, relPath))) return dir;
            const parent = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
    }
    return null;
}
/**
 * Runtime install-root anchors that SURVIVE the standalone bundle:
 *  - `process.cwd()` — `dist/server.js` runs `process.chdir(__dirname)` → the dist root.
 *  - `dirname(process.argv[1])` — the entry script (server.js / bin), walked up.
 */ function runtimeAnchors() {
    const anchors = [
        process.cwd()
    ];
    const argv1 = process.argv[1];
    if (typeof argv1 === "string" && argv1) anchors.push(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(argv1));
    return anchors;
}
// ─── optional-deps gate (memoized) ──────────────────────────────────────────────
let _depsAvailable = null;
function depsAvailable() {
    if (_depsAvailable !== null) return _depsAvailable;
    _depsAvailable = firstAncestorWith(runtimeAnchors(), GATE_DEP_REL) !== null;
    return _depsAvailable;
}
let worker = null;
let nextId = 1;
const pending = new Map();
const queue = [];
let busy = false;
/** Model keys (resolved `id`) that have completed at least one successful load. */ const warmedModels = new Set();
let idleTimer = null;
function resolveWorkerFile() {
    const anchors = runtimeAnchors();
    // Prod first: the esbuild'd .js under the install root.
    const jsRoot = firstAncestorWith(anchors, WORKER_JS_REL);
    if (jsRoot) return {
        workerFile: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(jsRoot, WORKER_JS_REL),
        execArgv: []
    };
    // Dev: the .ts source (tsx loader).
    const tsRoot = firstAncestorWith(anchors, WORKER_TS_REL);
    if (tsRoot) return {
        workerFile: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(tsRoot, WORKER_TS_REL),
        execArgv: [
            "--import",
            "tsx/esm"
        ]
    };
    // Nothing found — return a cwd-relative .js path; the spawn will fail-open.
    return {
        workerFile: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), WORKER_JS_REL),
        execArgv: []
    };
}
/** Reset the idle eviction timer; terminates the worker after the idle window. */ function bumpIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(()=>{
        resetWorker();
    }, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_WORKER_IDLE_MS"]);
    // Never keep the process alive just for idle eviction.
    if (typeof idleTimer.unref === "function") idleTimer.unref();
}
/** Tear down the worker + all runtime state (fail-open any pending). Next call respawns. */ function resetWorker() {
    const w = worker;
    worker = null;
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }
    // Fail-open every in-flight call with its ORIGINAL text.
    for (const [, entry] of pending){
        clearTimeout(entry.timer);
        entry.resolve(entry.originalText);
    }
    pending.clear();
    busy = false;
    warmedModels.clear();
    if (w) {
        try {
            void w.terminate();
        } catch  {
        // ignore terminate errors
        }
    }
}
/** Spawn the singleton worker and wire its message/error/exit handlers. */ function ensureWorker() {
    if (worker) return worker;
    const { workerFile, execArgv } = resolveWorkerFile();
    const absoluteWorkerFile = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(workerFile);
    const w = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["Worker"]((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["pathToFileURL"])(absoluteWorkerFile).href, {
        execArgv
    });
    w.on("message", (reply)=>{
        const entry = pending.get(reply.id);
        if (entry) {
            clearTimeout(entry.timer);
            pending.delete(reply.id);
            // Only a genuine success warms the model so later calls use the short timeout.
            // A timeout/error/fail-open MUST NOT warm it (else a still-loading model would
            // be starved of its one-time load budget on the next call).
            if (reply.ok) warmedModels.add(entry.modelKey);
            // ok:false already carries the ORIGINAL text → resolving with it IS fail-open.
            entry.resolve(reply.text);
        }
        busy = false;
        pump();
    });
    const failOpenAndRespawn = ()=>{
        // Resolve every pending entry fail-open, then drop the worker so the next call respawns.
        failAllPending();
        if (worker === w) worker = null;
        busy = false;
    };
    w.on("error", failOpenAndRespawn);
    w.on("exit", failOpenAndRespawn);
    worker = w;
    return w;
}
/** Resolve all pending entries with their stored fail-open value (original text). */ function failAllPending() {
    for (const [id, entry] of pending){
        clearTimeout(entry.timer);
        pending.delete(id);
        entry.resolve(entry.originalText);
    }
}
/** Post the next queued item to the worker (one in-flight at a time). */ function pump() {
    if (busy) return;
    const item = queue.shift();
    if (!item) return;
    busy = true;
    bumpIdleTimer();
    let w;
    try {
        w = ensureWorker();
    } catch  {
        // Spawn failed → fail-open this item and continue draining the queue.
        busy = false;
        item.resolve(item.text);
        pump();
        return;
    }
    const id = nextId++;
    const modelKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$modelStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveLlmlinguaModel"])(item.opts?.model).id;
    const warm = warmedModels.has(modelKey);
    const timeoutMs = warm ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_WORKER_TIMEOUT_MS"] : FIRST_CALL_TIMEOUT_MS;
    const timer = setTimeout(()=>{
        // Timeout → fail-open with the ORIGINAL text; drop the pending entry but keep the
        // worker (it may still be loading the model and will warm for the next call).
        const entry = pending.get(id);
        if (entry) {
            pending.delete(id);
            entry.resolve(item.text);
        }
        busy = false;
        pump();
    }, timeoutMs);
    if (typeof timer.unref === "function") timer.unref();
    pending.set(id, {
        // Warming is decided by the reply handler (success only) — not here, so a
        // timeout/error fail-open never marks the model warm.
        resolve: item.resolve,
        timer,
        originalText: item.text,
        modelKey
    });
    try {
        w.postMessage({
            id,
            text: item.text,
            model: item.opts?.model,
            compressionRate: item.opts?.compressionRate,
            modelPath: item.opts?.modelPath
        });
    } catch  {
        // postMessage failed → fail-open this item and respawn.
        clearTimeout(timer);
        pending.delete(id);
        item.resolve(item.text);
        if (worker === w) worker = null;
        busy = false;
        pump();
    }
}
const workerBackend = async (text, opts)=>{
    // Fail-open WITHOUT spawning when the optional deps are not installed (the common case).
    if (!depsAvailable()) {
        return text;
    }
    return new Promise((resolve)=>{
        queue.push({
            text,
            opts,
            resolve
        });
        pump();
    });
};
function __resetLlmlinguaWorkerForTests() {
    // Drain the queue fail-open so no callers hang.
    while(queue.length){
        const item = queue.shift();
        item.resolve(item.text);
    }
    resetWorker();
    _depsAvailable = null;
    nextId = 1;
}
}),
"[project]/open-sse/services/compression/engines/llmlingua/ultraEntry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetUltraEntryForTests",
    ()=>__resetUltraEntryForTests,
    "__setUltraSlmTestHooks",
    ()=>__setUltraSlmTestHooks,
    "prewarmLlmlinguaUltra",
    ()=>prewarmLlmlinguaUltra,
    "runLlmlinguaUltra",
    ()=>runLlmlinguaUltra,
    "slmAvailable",
    ()=>slmAvailable
]);
/**
 * LLMLingua-2 entry point for the `ultra` mode (Phase 4, Sub-project B).
 *
 * A THIN wrapper over the existing worker backend (`./worker.ts`) — no new ONNX
 * integration. It adds exactly what the `ultra` two-tier resolver needs:
 *   - `slmAvailable()` — cached, NON-BLOCKING probe (reuses the worker's memoized
 *     optional-deps gate). It NEVER loads a model; an actual load happens lazily
 *     inside the worker under its first-call timeout.
 *   - `runLlmlinguaUltra(text, opts)` — compress ONE prose string. Throws when the
 *     backend fail-opens to the original text (no-op), so the ultra resolver can
 *     fall through to the Tier-A heuristic and record "heuristic-fallback".
 *   - `prewarmLlmlinguaUltra()` — best-effort warm call (errors swallowed).
 *
 * The structure-preservation split (code/math/URLs never reach the model) is done
 * by the CALLER (`ultra.ts`), exactly as the heuristic path already does — this
 * entry only sees prose.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$worker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/worker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/constants.ts [app-route] (ecmascript)");
;
;
/** Cached probe result. null = not probed yet. */ let _slmAvailable = null;
let _testHooks = null;
function __setUltraSlmTestHooks(hooks) {
    _testHooks = hooks;
}
function slmAvailable() {
    if (_testHooks && typeof _testHooks.available === "boolean") return _testHooks.available;
    if (_slmAvailable !== null) return _slmAvailable;
    _slmAvailable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$worker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["depsAvailable"])();
    return _slmAvailable;
}
async function runLlmlinguaUltra(text, opts) {
    if (_testHooks?.run) {
        const out = await _testHooks.run(text, opts);
        if (typeof out !== "string" || out.length >= text.length) {
            throw new Error("llmlingua-ultra: backend produced no gain");
        }
        return out;
    }
    const out = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$worker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workerBackend"])(text, {
        model: opts?.model,
        compressionRate: opts?.compressionRate,
        modelPath: opts?.modelPath
    });
    if (typeof out !== "string" || out.length >= text.length) {
        // Fail-open / no-op from the worker → let the caller fall back to heuristic.
        throw new Error("llmlingua-ultra: backend produced no gain");
    }
    return out;
}
async function prewarmLlmlinguaUltra(opts) {
    if (!slmAvailable()) return false;
    try {
        // A small but non-trivial sample so the worker triggers a real model load.
        // Route through `runLlmlinguaUltra` so the same backend seam (and test hook)
        // is exercised; a no-op/throw from the worker is fine here (best-effort).
        await runLlmlinguaUltra("The quick brown fox jumps over the lazy dog while the sun sets behind the hills.", {
            model: opts?.model ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_LLMLINGUA_MODEL"],
            compressionRate: opts?.compressionRate
        });
    } catch  {
    // swallow — pre-warm is best-effort (a no-op/throw from the worker is fine).
    }
    return true;
}
function __resetUltraEntryForTests() {
    _slmAvailable = null;
    _testHooks = null;
}
}),
"[project]/open-sse/services/compression/ultra.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maybePrewarmUltraSlmOnConfig",
    ()=>maybePrewarmUltraSlmOnConfig,
    "shouldPrewarmUltraSlm",
    ()=>shouldPrewarmUltraSlm,
    "ultraCompress",
    ()=>ultraCompress,
    "ultraCompressHeuristic",
    ()=>ultraCompressHeuristic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/ultraHeuristic.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$ultraEntry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/ultraEntry.ts [app-route] (ecmascript)");
;
;
;
;
;
const COMPRESSED_PREFIX = "[COMPRESSED:";
/**
 * Async sibling of `mapTextContent`: applies an async transform to each text part
 * of a message's content (string content → single call; array content → each
 * `{type:"text"}` part). Non-text parts and structure are preserved exactly.
 */ async function mapTextContentAsync(msg, fn) {
    if (typeof msg.content === "string") {
        return {
            ...msg,
            content: await fn(msg.content)
        };
    }
    if (Array.isArray(msg.content)) {
        const next = [];
        for (const part of msg.content){
            const p = part;
            if (p && p["type"] === "text" && typeof p["text"] === "string") {
                next.push({
                    ...p,
                    text: await fn(p["text"])
                });
            } else {
                next.push(part);
            }
        }
        return {
            ...msg,
            content: next
        };
    }
    return msg;
}
/**
 * Prune PROSE only. Fenced code, inline code, URLs, CONST_CASE, versions, etc. are
 * tombstoned by `extractPreservedBlocks` and re-stitched verbatim, so the heuristic
 * NEVER mangles structured content (mirrors caveman.ts / llmlingua/index.ts).
 *
 * Without this, `pruneByScore` tokenizes the whole text and drops low-score tokens
 * (`b)`, `{`, `+`, …) inside code blocks, corrupting them while leaving the fence
 * markers intact — output that looks like valid code but isn't (B-ULTRA-CODE).
 */ function pruneProseOnly(text, rate, minScore) {
    const { text: withPlaceholders, blocks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(text);
    if (blocks.length === 0) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pruneByScore"])(text, rate, minScore);
    const placeholderToContent = new Map(blocks.map((b)=>[
            b.placeholder,
            b.content
        ]));
    const escaped = blocks.map((b)=>b.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const splitRe = new RegExp(`(${escaped.join("|")})`, "g");
    return withPlaceholders.split(splitRe).map((part)=>{
        if (!part) return "";
        const preserved = placeholderToContent.get(part);
        if (preserved !== undefined) return preserved; // verbatim — never pruned
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pruneByScore"])(part, rate, minScore); // prose only
    }).join("");
}
async function compressProseSlm(text, cfg) {
    const { text: withPlaceholders, blocks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(text);
    if (blocks.length === 0) {
        return slmOrHeuristic(text, cfg);
    }
    const placeholderToContent = new Map(blocks.map((b)=>[
            b.placeholder,
            b.content
        ]));
    const escaped = blocks.map((b)=>b.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const splitRe = new RegExp(`(${escaped.join("|")})`, "g");
    const parts = withPlaceholders.split(splitRe);
    const out = [];
    let usedSlm = false;
    for (const part of parts){
        if (!part) {
            out.push("");
            continue;
        }
        const preserved = placeholderToContent.get(part);
        if (preserved !== undefined) {
            out.push(preserved); // verbatim — never sent to the model
        } else {
            const seg = await slmOrHeuristic(part, cfg);
            out.push(seg.text);
            if (seg.usedSlm) usedSlm = true;
        }
    }
    return {
        text: out.join(""),
        usedSlm
    };
}
/**
 * Run the SLM on a prose segment; on throw/no-op, fall back to the Tier-A pruner for it.
 * `usedSlm` is true ONLY when the SLM backend itself produced the output.
 */ async function slmOrHeuristic(prose, cfg) {
    try {
        const text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$ultraEntry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runLlmlinguaUltra"])(prose, {
            model: cfg.modelPath ? undefined : undefined,
            compressionRate: cfg.compressionRate,
            modelPath: cfg.modelPath
        });
        return {
            text,
            usedSlm: true
        };
    } catch  {
        return {
            text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pruneByScore"])(prose, cfg.compressionRate, cfg.minScoreThreshold),
            usedSlm: false
        };
    }
}
function ultraCompressHeuristic(messages, config = {}, tier = "heuristic") {
    const start = Date.now();
    const effectiveConfig = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"],
        ...config
    };
    const { compressionRate, minScoreThreshold, maxTokensPerMessage } = effectiveConfig;
    let originalChars = 0;
    let compressedChars = 0;
    const compressed = messages.map((msg)=>{
        if (effectiveConfig.preserveSystemPrompt !== false && msg.role === "system") return msg;
        const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(msg.content);
        if (!text) return msg;
        if (text.startsWith(COMPRESSED_PREFIX)) return msg;
        if (maxTokensPerMessage > 0 && Math.ceil(text.length / 4) <= maxTokensPerMessage) {
            return msg;
        }
        let messageOriginalChars = 0;
        let messageCompressedChars = 0;
        const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTextContent"])(msg, (textPart)=>{
            if (!textPart || textPart.startsWith(COMPRESSED_PREFIX)) return textPart;
            messageOriginalChars += textPart.length;
            const pruned = pruneProseOnly(textPart, compressionRate, minScoreThreshold);
            messageCompressedChars += pruned.length;
            return pruned;
        });
        originalChars += messageOriginalChars;
        compressedChars += messageCompressedChars;
        return next;
    });
    const originalTokens = Math.ceil(originalChars / 4);
    const compressedTokens = Math.ceil(compressedChars / 4);
    const savingsPercent = originalTokens > 0 ? Math.round((originalTokens - compressedTokens) / originalTokens * 100 * 10) / 10 : 0;
    const stats = {
        originalTokens,
        compressedTokens,
        savingsPercent,
        techniquesUsed: [
            "ultra-heuristic-pruning"
        ],
        mode: "ultra",
        timestamp: Date.now(),
        durationMs: Date.now() - start,
        ultraTier: tier
    };
    return {
        messages: compressed,
        stats
    };
}
async function ultraCompress(messages, config = {}) {
    if (config.ultraEngine !== "slm" || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$ultraEntry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slmAvailable"])()) {
        return ultraCompressHeuristic(messages, config, "heuristic");
    }
    const start = Date.now();
    const effectiveConfig = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"],
        ...config
    };
    const { maxTokensPerMessage } = effectiveConfig;
    let originalChars = 0;
    let compressedChars = 0;
    let anySlm = false;
    try {
        const compressed = [];
        for (const msg of messages){
            if (effectiveConfig.preserveSystemPrompt !== false && msg.role === "system") {
                compressed.push(msg);
                continue;
            }
            const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(msg.content);
            if (!text || text.startsWith(COMPRESSED_PREFIX)) {
                compressed.push(msg);
                continue;
            }
            if (maxTokensPerMessage > 0 && Math.ceil(text.length / 4) <= maxTokensPerMessage) {
                compressed.push(msg);
                continue;
            }
            let messageOriginalChars = 0;
            let messageCompressedChars = 0;
            const next = await mapTextContentAsync(msg, async (textPart)=>{
                if (!textPart || textPart.startsWith(COMPRESSED_PREFIX)) return textPart;
                messageOriginalChars += textPart.length;
                const { text: out, usedSlm } = await compressProseSlm(textPart, effectiveConfig);
                if (usedSlm) anySlm = true;
                messageCompressedChars += out.length;
                return out;
            });
            originalChars += messageOriginalChars;
            compressedChars += messageCompressedChars;
            compressed.push(next);
        }
        const originalTokens = Math.ceil(originalChars / 4);
        const compressedTokens = Math.ceil(compressedChars / 4);
        const savingsPercent = originalTokens > 0 ? Math.round((originalTokens - compressedTokens) / originalTokens * 100 * 10) / 10 : 0;
        const stats = {
            originalTokens,
            compressedTokens,
            savingsPercent,
            techniquesUsed: anySlm ? [
                "ultra-slm"
            ] : [
                "ultra-heuristic-pruning"
            ],
            mode: "ultra",
            timestamp: Date.now(),
            durationMs: Date.now() - start,
            ultraTier: anySlm ? "slm" : "heuristic-fallback"
        };
        return {
            messages: compressed,
            stats
        };
    } catch  {
        // Any unexpected error in the SLM path → whole-request fail-open to Tier-A.
        return ultraCompressHeuristic(messages, config, "heuristic-fallback");
    }
}
function shouldPrewarmUltraSlm(config) {
    return config.ultraEngine === "slm" && config.ultraSlmPrewarm === true;
}
async function maybePrewarmUltraSlmOnConfig(config) {
    if (!shouldPrewarmUltraSlm(config)) return;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$ultraEntry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prewarmLlmlinguaUltra"])();
    } catch  {
    // best-effort
    }
}
}),
"[project]/open-sse/services/compression/ruleLoader.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAvailableLanguagePacks",
    ()=>getAvailableLanguagePacks,
    "listCavemanRulePacks",
    ()=>listCavemanRulePacks,
    "loadAllRulesForLanguage",
    ()=>loadAllRulesForLanguage,
    "loadCavemanFileRules",
    ()=>loadCavemanFileRules,
    "loadRulePack",
    ()=>loadRulePack,
    "validateRulePack",
    ()=>validateRulePack
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
;
;
;
const VALID_CONTEXTS = new Set([
    "all",
    "user",
    "system",
    "assistant"
]);
const VALID_CATEGORIES = new Set([
    "filler",
    "context",
    "structural",
    "dedup",
    "terse",
    "ultra"
]);
const VALID_INTENSITIES = new Set([
    "lite",
    "full",
    "ultra"
]);
const cache = new Map();
let rulesDirCache = null;
function normalizeReplacementKey(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}
function compileReplacement(rule) {
    if (!rule.replacementMap) return rule.replacement ?? "";
    const normalizedMap = new Map(Object.entries(rule.replacementMap).map(([key, value])=>[
            normalizeReplacementKey(key),
            value
        ]));
    const fallback = rule.replacement;
    return (match)=>{
        const normalized = normalizeReplacementKey(match);
        if (normalizedMap.has(normalized)) return normalizedMap.get(normalized) ?? "";
        return fallback ?? match;
    };
}
function getRuleFlags(rule) {
    return rule.flags ?? "gi";
}
function getModuleDir() {
    const anchors = [
        process.cwd()
    ];
    const argv1 = process.argv[1];
    if (typeof argv1 === "string" && argv1) anchors.push(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(argv1));
    const rel = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join("open-sse", "services", "compression");
    for (const anchor of anchors){
        let dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(anchor);
        for(let i = 0; i <= 8; i++){
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, rel))) return dir;
            const parent = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
}
function getRulesDir() {
    if (rulesDirCache) return rulesDirCache;
    const root = getModuleDir();
    const candidates = [
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, "open-sse", "services", "compression", "rules"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, "app", "open-sse", "services", "compression", "rules")
    ];
    rulesDirCache = candidates.find((candidate, index)=>{
        return candidates.indexOf(candidate) === index && __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidate);
    }) ?? candidates[0];
    return rulesDirCache;
}
function compileRule(rule, source) {
    try {
        const flags = getRuleFlags(rule);
        return {
            name: rule.name,
            pattern: new RegExp(rule.pattern, flags),
            replacement: compileReplacement(rule),
            context: rule.context ?? "all",
            category: rule.category ?? "filler",
            minIntensity: rule.minIntensity ?? "lite",
            description: rule.description
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid Caveman rule pattern in ${source}:${rule.name}: ${message}`);
    }
}
function validateRulePack(pack) {
    const errors = [];
    if (!pack || typeof pack !== "object") {
        return {
            valid: false,
            errors: [
                "Rule pack must be an object"
            ]
        };
    }
    const value = pack;
    if (typeof value.language !== "string" || !value.language.trim()) {
        errors.push("language must be a non-empty string");
    }
    if (typeof value.category !== "string" || !value.category.trim()) {
        errors.push("category must be a non-empty string");
    }
    if (!Array.isArray(value.rules)) {
        errors.push("rules must be an array");
    } else {
        value.rules.forEach((rule, index)=>{
            if (!rule || typeof rule !== "object") {
                errors.push(`rules[${index}] must be an object`);
                return;
            }
            const entry = rule;
            const flags = typeof entry.flags === "string" ? entry.flags : "gi";
            if (typeof entry.name !== "string" || !entry.name.trim()) {
                errors.push(`rules[${index}].name must be a non-empty string`);
            }
            if (typeof entry.pattern !== "string" || !entry.pattern.trim()) {
                errors.push(`rules[${index}].pattern must be a non-empty string`);
            } else {
                try {
                    new RegExp(entry.pattern, flags);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    errors.push(`rules[${index}].pattern is invalid: ${message}`);
                }
            }
            if (entry.flags !== undefined && typeof entry.flags !== "string") {
                errors.push(`rules[${index}].flags must be a string`);
            }
            if (entry.replacement !== undefined && typeof entry.replacement !== "string") {
                errors.push(`rules[${index}].replacement must be a string`);
            }
            if (entry.replacementMap !== undefined) {
                if (!entry.replacementMap || typeof entry.replacementMap !== "object" || Array.isArray(entry.replacementMap)) {
                    errors.push(`rules[${index}].replacementMap must be an object`);
                } else {
                    Object.entries(entry.replacementMap).forEach(([key, replacement])=>{
                        if (!key.trim()) {
                            errors.push(`rules[${index}].replacementMap contains an empty key`);
                        }
                        if (typeof replacement !== "string") {
                            errors.push(`rules[${index}].replacementMap.${key} must be a string`);
                        }
                    });
                }
            }
            if (typeof entry.replacement !== "string" && entry.replacementMap === undefined) {
                errors.push(`rules[${index}] must define replacement or replacementMap`);
            }
            if (entry.context !== undefined && !VALID_CONTEXTS.has(entry.context)) {
                errors.push(`rules[${index}].context is invalid`);
            }
            if (entry.category !== undefined && !VALID_CATEGORIES.has(entry.category)) {
                errors.push(`rules[${index}].category is invalid`);
            }
            if (entry.minIntensity !== undefined && !VALID_INTENSITIES.has(entry.minIntensity)) {
                errors.push(`rules[${index}].minIntensity is invalid`);
            }
        });
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function readPack(language, category) {
    const filename = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getRulesDir(), language, `${category}.json`);
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(filename)) return null;
    const parsed = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(filename, "utf8"));
    const validation = validateRulePack(parsed);
    if (!validation.valid) {
        throw new Error(`Invalid Caveman rule pack ${language}/${category}: ${validation.errors.join("; ")}`);
    }
    return parsed;
}
function loadRulePack(language, category, options = {}) {
    const key = `${getRulesDir()}:${language}:${category}`;
    if (cache.has(key) && !options.refresh) return cache.get(key) ?? [];
    const pack = readPack(language, category);
    if (!pack) {
        cache.set(key, []);
        return [];
    }
    const rules = pack.rules.map((rule)=>compileRule(rule, `${language}/${category}`));
    cache.set(key, rules);
    return rules;
}
function loadAllRulesForLanguage(language, options = {}) {
    const key = `${getRulesDir()}:${language}:*`;
    if (cache.has(key) && !options.refresh) return cache.get(key) ?? [];
    const languageDir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getRulesDir(), language);
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(languageDir)) {
        cache.set(key, []);
        return [];
    }
    const rules = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(languageDir).filter((entry)=>entry.endsWith(".json")).sort().flatMap((entry)=>loadRulePack(language, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].basename(entry, ".json"), options));
    cache.set(key, rules);
    return rules;
}
function getAvailableLanguagePacks() {
    const root = getRulesDir();
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(root)) return [];
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(root).filter((entry)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, entry)).isDirectory()).map((language)=>{
        const categories = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, language)).filter((entry)=>entry.endsWith(".json")).map((entry)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].basename(entry, ".json")).sort();
        const ruleCount = categories.reduce((count, category)=>count + loadRulePack(language, category).length, 0);
        return {
            language,
            categories,
            ruleCount
        };
    }).sort((a, b)=>a.language.localeCompare(b.language));
}
function loadCavemanFileRules(language, options = {}) {
    return loadAllRulesForLanguage(language, options);
}
function listCavemanRulePacks() {
    return getAvailableLanguagePacks();
}
}),
"[project]/open-sse/services/compression/cavemanRules.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CAVEMAN_RULES",
    ()=>CAVEMAN_RULES,
    "getCavemanRuleMetadata",
    ()=>getCavemanRuleMetadata,
    "getRuleByName",
    ()=>getRuleByName,
    "getRulesForContext",
    ()=>getRulesForContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ruleLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/ruleLoader.ts [app-route] (ecmascript)");
;
const CAVEMAN_RULES = [
    // ── Category 1: Filler Removal (10+ rules) ──────────────────────────
    {
        name: "redundant_phrasing",
        pattern: /\b(?:make sure to|be sure to|due to the fact that|the reason is because|it is important to|you should|remember to)\b\s*/gi,
        replacement: (match)=>{
            const map = {
                "make sure to": "ensure ",
                "be sure to": "ensure ",
                "due to the fact that": "because ",
                "the reason is because": "because ",
                "it is important to": "",
                "you should": "",
                "remember to": ""
            };
            return map[match.trim().toLowerCase()] ?? "";
        },
        context: "all",
        category: "structural",
        minIntensity: "full",
        description: "Replace verbose stock phrases with shorter equivalents."
    },
    {
        name: "pleasantries",
        pattern: /(?<!make\s)(?<!be\s)\b(?:i'?d be happy to|i would be happy to|i'?d be glad to|i would be glad to|glad to help|happy to|thank you|thanks|no problem|you'?re welcome|absolutely|certainly|of course|sure)\b[,.!?\s]*/gi,
        replacement: "",
        context: "all",
        category: "filler",
        minIntensity: "lite",
        description: "Drop conversational acknowledgements that do not change request meaning."
    },
    {
        name: "polite_framing",
        pattern: /\b(?:please|kindly|could you please|would you please|can you please|I would like you to|I want you to|I need you to)\b\s*/gi,
        replacement: "",
        context: "all",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "hedging",
        pattern: /\b(?:it seems like|it appears that|I think that|I believe that|probably|possibly|maybe it)\b\s*/gi,
        replacement: "",
        context: "all",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "verbose_instructions",
        pattern: /\b(?:provide a detailed explanation of|give me a comprehensive explanation of|write an in-depth explanation of|create a thorough explanation of|provide a detailed|give me a comprehensive|write an in-depth|create a thorough|explain in detail)\b/gi,
        replacement: (match)=>{
            const map = {
                "provide a detailed explanation of": "explain ",
                "give me a comprehensive explanation of": "explain ",
                "write an in-depth explanation of": "explain ",
                "create a thorough explanation of": "explain ",
                "provide a detailed": "provide ",
                "give me a comprehensive": "give ",
                "write an in-depth": "write ",
                "create a thorough": "create ",
                "explain in detail": "explain "
            };
            const lower = match.toLowerCase();
            return map[lower] ?? match;
        },
        context: "all",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "filler_adverbs",
        pattern: /(?<![a-z])\b(?:basically|essentially|actually|literally|simply|currently)\b\s*/gi,
        replacement: "",
        context: "all",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "articles",
        pattern: /\b(?:[Aa]n|[Aa]|[Tt]he)\s+(?=[a-z])/g,
        replacement: "",
        context: "all",
        category: "terse",
        minIntensity: "full",
        description: "Remove English articles from prose while protected technical tokens stay intact."
    },
    {
        name: "filler_phrases",
        pattern: /^(?:I want to|I need to|I'd like to|I'm looking for)\b\s*/gim,
        replacement: "",
        context: "user",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "redundant_openers",
        pattern: /^(?:Hi there|Hello|Good morning|Hey)\s*[,.!?\s]?\s*/gim,
        replacement: "",
        context: "user",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "verbose_requests",
        pattern: /\b(?:I was wondering if you could|Would it be possible to)\b\s*/gi,
        replacement: "",
        context: "user",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "leader_phrases",
        pattern: /^(?:i'?ll|i will|i can|i'?d|let me|you can|we will|we can|let'?s)\s+(?=[a-z])/gim,
        replacement: "",
        context: "all",
        category: "terse",
        minIntensity: "full",
        description: "Remove leading helper phrases before the actual instruction or answer."
    },
    {
        name: "self_reference",
        pattern: /^(?:I am trying to|I am working on|I have been)\b\s*/gim,
        replacement: "",
        context: "user",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "excessive_gratitude",
        pattern: /\b(?:Thank you so much|Thanks in advance|I really appreciate)\b[,.!?\s]*/gi,
        replacement: "",
        context: "all",
        category: "filler",
        minIntensity: "lite"
    },
    {
        name: "qualifier_removal",
        pattern: /\b(?:a bit|a little|somewhat|kind of|sort of)\b\s*/gi,
        replacement: "",
        context: "all",
        category: "filler",
        minIntensity: "lite"
    },
    // ── Category 2: Context Condensation (8+ rules) ──────────────────────
    {
        name: "compound_collapse",
        pattern: /\band any potential\b/gi,
        replacement: "",
        context: "all",
        category: "context",
        minIntensity: "full"
    },
    {
        name: "explanatory_prefix",
        pattern: /\b(?:The function appears to be handling|The code seems to|The class is|This module is)\b/gi,
        replacement: (match)=>{
            const map = {
                "the function appears to be handling": "Function:",
                "the code seems to": "Code:",
                "the class is": "Class:",
                "this module is": "Module:"
            };
            return map[match.toLowerCase()] ?? match;
        },
        context: "all",
        category: "context",
        minIntensity: "lite"
    },
    {
        name: "question_to_directive",
        pattern: /\b(?:Can you explain why|Could you show me how|Would you tell me|Can you tell me)\b\s*/gi,
        replacement: (match)=>{
            const trimmed = match.trimEnd().toLowerCase();
            const map = {
                "can you explain why": "Explain why ",
                "could you show me how": "Show how ",
                "would you tell me": "Tell me ",
                "can you tell me": "Tell me "
            };
            return map[trimmed] ?? match;
        },
        context: "user",
        category: "context",
        minIntensity: "lite"
    },
    {
        name: "context_setup",
        pattern: /\b(?:I have the following code|Here is my code|Below is the code)\b\s*[:.]?\s*/gi,
        replacement: "Code:",
        context: "user",
        category: "context",
        minIntensity: "lite"
    },
    {
        name: "intent_clarification",
        pattern: /\b(?:What I'm trying to do is|My objective is to|What I need is|I'm aiming to)\b\s*/gi,
        replacement: "Goal:",
        context: "user",
        category: "context",
        minIntensity: "lite"
    },
    {
        name: "background_removal",
        pattern: /\b(?:As you may know,?\s*|As we discussed earlier,?\s*)/gi,
        replacement: "",
        context: "all",
        category: "context",
        minIntensity: "lite"
    },
    {
        name: "meta_commentary",
        pattern: /^(?:Note that|Keep in mind that|Remember that)\b\s*/gim,
        replacement: "",
        context: "all",
        category: "context",
        minIntensity: "lite"
    },
    {
        name: "purpose_statement",
        pattern: /\b(?:for the purpose of|with the goal of|in an effort to|for every)\b/gi,
        replacement: (match)=>{
            const map = {
                "for the purpose of": "for",
                "with the goal of": "to",
                "in an effort to": "to",
                "for every": "per"
            };
            return map[match.toLowerCase()] ?? match;
        },
        context: "all",
        category: "context",
        minIntensity: "lite"
    },
    // ── Category 3: Structural Compression (7+ rules) ────────────────────
    {
        name: "list_conjunction",
        pattern: /,\s*and also\s+|,\s*as well as\s+/gi,
        replacement: ", ",
        context: "all",
        category: "structural",
        minIntensity: "full"
    },
    {
        name: "purpose_phrases",
        pattern: /\b(?:in order to|so as to)\b\s*/gi,
        replacement: "to ",
        context: "all",
        category: "structural",
        minIntensity: "lite"
    },
    {
        name: "redundant_quantifiers",
        pattern: /\b(?:each and every single|each and every|any and all)\b/gi,
        replacement: (match)=>{
            const map = {
                "each and every single": "each",
                "each and every": "each",
                "any and all": "all"
            };
            return map[match.toLowerCase()] ?? match;
        },
        context: "all",
        category: "structural",
        minIntensity: "full"
    },
    {
        name: "verbose_connectors",
        pattern: /\b(?:furthermore|additionally|moreover|in addition)\b\s*/gi,
        replacement: "also ",
        context: "all",
        category: "structural",
        minIntensity: "lite"
    },
    {
        name: "transition_removal",
        pattern: /^(?:On the other hand,?\s*|In contrast,?\s*|However,?\s*)/gim,
        replacement: "",
        context: "all",
        category: "structural",
        minIntensity: "lite"
    },
    {
        name: "emphasis_removal",
        pattern: /\b(?:very|really|extremely|highly|quite)\s+(?=[a-z])/gi,
        replacement: "",
        context: "all",
        category: "structural",
        minIntensity: "lite"
    },
    {
        name: "passive_voice",
        pattern: /\b(?:is being used|is being called|is being generated|was created|was generated|was implemented)\b/gi,
        replacement: (match)=>{
            const map = {
                "is being used": "uses",
                "is being called": "calls",
                "is being generated": "generated",
                "was created": "created",
                "was generated": "generated",
                "was implemented": "implemented"
            };
            return map[match.toLowerCase()] ?? match;
        },
        context: "all",
        category: "structural",
        minIntensity: "full"
    },
    // ── Category 4: Multi-Turn Dedup (5+ rules) ─────────────────────────
    {
        name: "repeated_context",
        pattern: /\b(?:As we discussed earlier|As mentioned before|As previously stated|As I said before)\b[,.]?\s*/gi,
        replacement: "See above. ",
        context: "all",
        category: "dedup",
        minIntensity: "lite"
    },
    {
        name: "repeated_question",
        pattern: /\b(?:Same question as before|I asked this earlier|This is the same question)\b[,.]?\s*/gi,
        replacement: "[same question] ",
        context: "user",
        category: "dedup",
        minIntensity: "lite"
    },
    {
        name: "reestablished_context",
        pattern: /\b(?:Going back to the code above|Referring back to|Returning to)\b\s*/gi,
        replacement: "Re: ",
        context: "all",
        category: "dedup",
        minIntensity: "lite"
    },
    {
        name: "summary_replacement",
        pattern: /\b(?:To summarize what we've discussed|In summary of our conversation|To recap)\b[,.]?\s*/gi,
        replacement: "Summary: ",
        context: "assistant",
        category: "dedup",
        minIntensity: "lite"
    },
    // ── Category 5: Ultra Abbreviations ─────────────────────────────────
    {
        name: "ultra_abbreviations",
        pattern: /\b(?:database|configuration|function|request|response|implementation|authentication|authorization|application|dependency|dependencies)\b/gi,
        replacement: (match)=>{
            const map = {
                database: "DB",
                configuration: "config",
                function: "fn",
                request: "req",
                response: "res",
                implementation: "impl",
                authentication: "auth",
                authorization: "authz",
                application: "app",
                dependency: "dep",
                dependencies: "deps"
            };
            return map[match.toLowerCase()] ?? match;
        },
        context: "all",
        category: "ultra",
        minIntensity: "ultra"
    }
];
const INTENSITY_RANK = {
    lite: 0,
    full: 1,
    ultra: 2
};
function getRulesForContext(context, intensity = "full", language = "en") {
    const rank = INTENSITY_RANK[intensity] ?? INTENSITY_RANK.full;
    const fileRules = language ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ruleLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadAllRulesForLanguage"])(language) : [];
    const rules = fileRules.length > 0 ? fileRules : CAVEMAN_RULES;
    const selected = rules.filter((rule)=>{
        const minRank = INTENSITY_RANK[rule.minIntensity ?? "lite"];
        return (rule.context === "all" || rule.context === context) && minRank <= rank;
    });
    return selected.length > 0 ? selected : CAVEMAN_RULES.filter((rule)=>{
        const minRank = INTENSITY_RANK[rule.minIntensity ?? "lite"];
        return (rule.context === "all" || rule.context === context) && minRank <= rank;
    });
}
function getRuleByName(name) {
    return CAVEMAN_RULES.find((rule)=>rule.name === name);
}
function getCavemanRuleMetadata() {
    const intensities = [
        "lite",
        "full",
        "ultra"
    ];
    return CAVEMAN_RULES.map((rule)=>({
            name: rule.name,
            context: rule.context,
            category: rule.category ?? "terse",
            minIntensity: rule.minIntensity ?? "lite",
            intensities: intensities.filter((intensity)=>INTENSITY_RANK[intensity] >= INTENSITY_RANK[rule.minIntensity ?? "lite"]),
            description: rule.description ?? rule.name.replace(/_/g, " ")
        }));
}
;
}),
"[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCompressionStats",
    ()=>createCompressionStats,
    "estimateCompressionTokens",
    ()=>estimateCompressionTokens,
    "getDefaultCompressionConfig",
    ()=>getDefaultCompressionConfig,
    "trackCompressionStats",
    ()=>trackCompressionStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/tiktokenCounter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$anthropic$2d$vision$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/anthropic-vision.js [app-route] (ecmascript)");
;
;
;
const CHARS_PER_TOKEN = 4;
function isAnthropicPngImageBlock(value) {
    if (!value || typeof value !== "object") return false;
    const block = value;
    if (block.type !== "image") return false;
    const source = block.source;
    if (!source || typeof source !== "object") return false;
    return source.type === "base64" && source.media_type === "image/png" && typeof source.data === "string";
}
/**
 * Decode PNG width/height from the IHDR chunk without decoding the whole image.
 * PNG layout: 8-byte signature, then IHDR chunk `length(4) + "IHDR"(4) + width(4) +
 * height(4) + ...`. Width/height live at bytes 16..19 / 20..23 (big-endian uint32),
 * so we need through byte 23 (24 raw bytes). We slice the first 64 base64 chars
 * → 48 raw bytes, a comfortable margin over the 24 required.
 * Returns null (never throws) on malformed/non-PNG/truncated input.
 */ function decodePngDimensions(base64) {
    try {
        const prefix = base64.slice(0, 64);
        const bytes = Buffer.from(prefix, "base64");
        if (bytes.length < 24) return null;
        // PNG signature check (bytes 0..7): 89 50 4E 47 0D 0A 1A 0A
        const PNG_SIGNATURE = [
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a
        ];
        for(let i = 0; i < PNG_SIGNATURE.length; i++){
            if (bytes[i] !== PNG_SIGNATURE[i]) return null;
        }
        const width = bytes.readUInt32BE(16);
        const height = bytes.readUInt32BE(20);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return null;
        }
        return {
            width,
            height
        };
    } catch  {
        return null;
    }
}
/** Char-count fallback for one value (same accounting as the legacy estimator). */ function charTokensOf(value) {
    if (value === null || value === undefined) return 0;
    const str = typeof value === "string" ? value : JSON.stringify(value);
    return Math.ceil(str.length / CHARS_PER_TOKEN);
}
/**
 * Walk `messages[].content[]` (and `system` when it is an array) looking for Anthropic
 * base64 PNG image blocks. For each recognized block: blank its `data` (shallow clone,
 * so the char-count pass below doesn't double-count the base64) and add its real
 * image-token cost (`anthropicImageTokens` + per-block overhead). Malformed/undecodable
 * blocks are left as-is and fall back to char-counting like any other value — never throw.
 * Tier is fixed to "standard": production resolves every tier to standard today (measured
 * in the omniglyph billing sweep — see anthropic-vision.ts), so there is no model-specific
 * signal available here that would change the result.
 */ function blankImageBlocksAndSumImageTokens(body) {
    let imageTokens = 0;
    const clone = {
        ...body
    };
    const processContentArray = (content)=>{
        if (!Array.isArray(content)) return content;
        return content.map((block)=>{
            if (!isAnthropicPngImageBlock(block)) return block;
            const dims = decodePngDimensions(block.source.data);
            if (!dims) return block; // fall back to char-counting this block as-is
            imageTokens += (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$anthropic$2d$vision$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["anthropicImageTokens"])(dims.width, dims.height, "standard");
            imageTokens += __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$anthropic$2d$vision$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTHROPIC_IMAGE_BLOCK_OVERHEAD_TOKENS"];
            return {
                ...block,
                source: {
                    ...block.source,
                    data: ""
                }
            };
        });
    };
    if (Array.isArray(clone.messages)) {
        clone.messages = clone.messages.map((message)=>{
            if (!message || typeof message !== "object") return message;
            const m = message;
            if (!Array.isArray(m.content)) return message;
            return {
                ...m,
                content: processContentArray(m.content)
            };
        });
    }
    if (Array.isArray(clone.system)) {
        clone.system = processContentArray(clone.system);
    }
    return {
        clone,
        imageTokens
    };
}
function estimateCompressionTokens(text) {
    if (!text) return 0;
    if (typeof text === "string") {
        return charTokensOf(text);
    }
    try {
        const tokenizerContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokenizerContextFromBody"])(text);
        const useExactTokenizer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexTokenizerContext"])(tokenizerContext);
        const { clone, imageTokens } = blankImageBlocksAndSumImageTokens(text);
        if (imageTokens === 0) {
            // Keep the legacy character estimate for generic payloads. Codex payloads use
            // the model-appropriate tokenizer so their compression stats match hard budgets.
            return useExactTokenizer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(JSON.stringify(text), tokenizerContext) : charTokensOf(text);
        }
        return useExactTokenizer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(JSON.stringify(clone), tokenizerContext) + imageTokens : charTokensOf(clone) + imageTokens;
    } catch  {
        // Non-serializable/unexpected shape → fall back to the legacy char-count,
        // never throw out of an estimator.
        return charTokensOf(text);
    }
}
function createCompressionStats(originalBody, compressedBody, mode, techniquesUsed, rulesApplied, durationMs) {
    const originalTokens = estimateCompressionTokens(originalBody);
    const compressedTokens = estimateCompressionTokens(compressedBody);
    const savingsPercent = originalTokens > 0 ? Math.round((originalTokens - compressedTokens) / originalTokens * 10000) / 100 : 0;
    return {
        originalTokens,
        compressedTokens,
        savingsPercent,
        techniquesUsed,
        mode,
        timestamp: Date.now(),
        ...rulesApplied && rulesApplied.length > 0 ? {
            rulesApplied
        } : {},
        ...durationMs !== undefined ? {
            durationMs
        } : {}
    };
}
function trackCompressionStats(stats) {
    if (stats.originalTokens <= 0) return;
    const rulesInfo = stats.rulesApplied?.length ? ` rules=${stats.rulesApplied.join(",")}` : "";
    const durationInfo = stats.durationMs !== undefined ? ` ${stats.durationMs}ms` : "";
// Compression stats tracking — no-op in production (use structured logging if needed)
}
function getDefaultCompressionConfig() {
    return {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_COMPRESSION_CONFIG"],
        cavemanConfig: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CAVEMAN_CONFIG"]
        },
        rtkConfig: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"]
        },
        languageConfig: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_COMPRESSION_LANGUAGE_CONFIG"]
        }
    };
}
}),
"[project]/open-sse/services/compression/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateCompression",
    ()=>validateCompression
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
;
function requireExactPresence(label, originalItems, compressed, errors) {
    for (const item of originalItems){
        if (!compressed.includes(item)) {
            const preview = collapseWhitespaceForPreview(item).slice(0, 80);
            errors.push(`${label} changed or missing: ${preview}`);
        }
    }
}
function isPreviewWhitespace(char) {
    return char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f" || char === "\v";
}
function isHorizontalWhitespace(char) {
    return char === " " || char === "\t";
}
function isAsciiDigit(char) {
    return !!char && char >= "0" && char <= "9";
}
function isAsciiUpper(char) {
    return !!char && char >= "A" && char <= "Z";
}
function isAsciiLetter(char) {
    return !!char && (char >= "A" && char <= "Z" || char >= "a" && char <= "z");
}
function isAsciiAlphaNumeric(char) {
    return !!char && (isAsciiLetter(char) || isAsciiDigit(char));
}
function isWordChar(char) {
    return !!char && (isAsciiAlphaNumeric(char) || char === "_");
}
function isUrlTerminator(char) {
    return isPreviewWhitespace(char) || char === ")" || char === "]" || char === '"' || char === "'" || char === ">";
}
function collapseWhitespaceForPreview(text) {
    let output = "";
    let previousWasWhitespace = false;
    let changed = false;
    for (const char of text){
        if (isPreviewWhitespace(char)) {
            if (!previousWasWhitespace) {
                output += " ";
            } else {
                changed = true;
            }
            if (char !== " ") changed = true;
            previousWasWhitespace = true;
            continue;
        }
        output += char;
        previousWasWhitespace = false;
    }
    return changed ? output : text;
}
function validateCompression(original, compressed) {
    const errors = [];
    const warnings = [];
    if (typeof original !== "string" || typeof compressed !== "string") {
        return {
            valid: false,
            errors: [
                "validation received non-string input"
            ],
            warnings,
            fallbackApplied: true
        };
    }
    if (original.length > 0 && compressed.trim().length === 0) {
        errors.push("compressed text is empty");
    }
    requireExactPresence("fenced code block", (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findFencedCodeBlocks"])(original), compressed, errors);
    requireExactPresence("inline code", collectInlineCode(original), compressed, errors);
    requireExactPresence("URL", collectUrls(original), compressed, errors);
    requireExactPresence("markdown link", collectMarkdownLinks(original), compressed, errors);
    requireExactPresence("frontmatter", collectFrontmatter(original), compressed, errors);
    requireExactPresence("heading", collectHeadings(original), compressed, errors);
    requireExactPresence("table row", collectTableRows(original), compressed, errors);
    requireExactPresence("math block", collectMathBlocks(original), compressed, errors);
    requireExactPresence("inline math", collectInlineMath(original), compressed, errors);
    requireExactPresence("LaTeX block", collectLatexBlocks(original), compressed, errors);
    requireExactPresence("version", collectVersions(original), compressed, errors);
    requireExactPresence("CONST_CASE", collectConstCase(original), compressed, errors);
    const originalFenceCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findFencedCodeBlocks"])(original).length;
    const compressedFenceCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findFencedCodeBlocks"])(compressed).length;
    if (compressedFenceCount < originalFenceCount) {
        errors.push(`fenced code block count dropped: ${originalFenceCount} -> ${compressedFenceCount}`);
    }
    if (compressed.length > original.length) {
        warnings.push("compressed text is longer than original");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        fallbackApplied: errors.length > 0
    };
}
function collectInlineCode(text) {
    const matches = [];
    for(let index = 0; index < text.length; index++){
        if (text[index] !== "`") continue;
        const end = text.indexOf("`", index + 1);
        if (end === -1) break;
        const content = text.slice(index + 1, end);
        if (content.length > 0 && !content.includes("\n")) {
            matches.push(text.slice(index, end + 1));
            index = end;
        }
    }
    return matches;
}
function collectUrls(text) {
    const matches = [];
    for(let index = 0; index < text.length; index++){
        const startsWithHttp = text.startsWith("http://", index);
        const startsWithHttps = text.startsWith("https://", index);
        if (!startsWithHttp && !startsWithHttps) continue;
        if (index > 0 && isWordChar(text[index - 1])) continue;
        let end = index + (startsWithHttps ? "https://".length : "http://".length);
        while(end < text.length && !isUrlTerminator(text[end])){
            end++;
        }
        if (end > index) {
            matches.push(text.slice(index, end));
            index = end - 1;
        }
    }
    return matches;
}
function collectMarkdownLinks(text) {
    const matches = [];
    for(let index = 0; index < text.length; index++){
        if (text[index] !== "[") continue;
        const labelEnd = text.indexOf("]", index + 1);
        if (labelEnd === -1 || labelEnd - index - 1 > 1000) continue;
        if (text.slice(index + 1, labelEnd).includes("\n")) continue;
        if (text[labelEnd + 1] !== "(") continue;
        const targetStart = labelEnd + 2;
        const maxTargetEnd = Math.min(text.length, targetStart + 2000);
        let targetEnd = -1;
        for(let cursor = targetStart; cursor < maxTargetEnd; cursor++){
            if (text[cursor] === "\n") break;
            if (text[cursor] === ")") {
                targetEnd = cursor;
                break;
            }
        }
        if (targetEnd !== -1) {
            matches.push(text.slice(index, targetEnd + 1));
            index = targetEnd;
        }
    }
    return matches;
}
function collectFrontmatter(text) {
    if (!text.startsWith("---\n")) return [];
    const close = text.indexOf("\n---", 4);
    if (close === -1) return [];
    const closeEnd = text.indexOf("\n", close + 4);
    const end = closeEnd === -1 ? text.length : closeEnd + 1;
    return [
        text.slice(0, end)
    ];
}
function collectHeadings(text) {
    return collectLines(text).filter((line)=>{
        let markerCount = 0;
        while(markerCount < line.length && line[markerCount] === "#"){
            markerCount++;
        }
        if (markerCount < 1 || markerCount > 6) return false;
        if (!isPreviewWhitespace(line[markerCount] ?? "")) return false;
        for(let index = markerCount + 1; index < line.length; index++){
            if (!isPreviewWhitespace(line[index])) return true;
        }
        return false;
    });
}
function collectTableRows(text) {
    return collectLines(text).filter((line)=>{
        let index = 0;
        while(index < line.length && isHorizontalWhitespace(line[index])){
            index++;
        }
        if (line[index] !== "|") return false;
        let pipeCount = 0;
        for(; index < line.length; index++){
            if (line[index] === "|") pipeCount++;
        }
        return pipeCount >= 2;
    });
}
function collectLines(text) {
    const lines = [];
    let start = 0;
    for(let index = 0; index < text.length; index++){
        if (text[index] !== "\n") continue;
        lines.push(text.slice(start, index));
        start = index + 1;
    }
    lines.push(text.slice(start));
    return lines;
}
function collectMathBlocks(text) {
    const matches = [];
    let index = 0;
    while(index < text.length){
        const start = text.indexOf("$$", index);
        if (start === -1) break;
        const end = text.indexOf("$$", start + 2);
        if (end === -1) break;
        if (end - start - 2 <= 10000) {
            matches.push(text.slice(start, end + 2));
            index = end + 2;
        } else {
            index = start + 2;
        }
    }
    return matches;
}
function collectInlineMath(text) {
    const matches = [];
    for(let index = 0; index < text.length; index++){
        if (text[index] !== "$") continue;
        if (text[index - 1] === "$") continue;
        const next = text[index + 1];
        if (!next || isPreviewWhitespace(next) || next === "$" || isAsciiDigit(next)) continue;
        const maxEnd = Math.min(text.length, index + 1 + 160);
        for(let cursor = index + 1; cursor < maxEnd; cursor++){
            const char = text[cursor];
            if (char === "\n") break;
            if (char === "\\") {
                cursor++;
                continue;
            }
            if (char !== "$") continue;
            if (isPreviewWhitespace(text[cursor - 1] ?? "")) continue;
            if (text[cursor + 1] === "$") continue;
            matches.push(text.slice(index, cursor + 1));
            index = cursor;
            break;
        }
    }
    return matches;
}
function collectLatexBlocks(text) {
    const matches = [];
    let index = 0;
    while(index < text.length){
        const start = text.indexOf("\\begin{", index);
        if (start === -1) break;
        const envStart = start + "\\begin{".length;
        const envEnd = text.indexOf("}", envStart);
        if (envEnd === -1 || envEnd - envStart < 1 || envEnd - envStart > 50) {
            index = envStart;
            continue;
        }
        const env = text.slice(envStart, envEnd);
        if (![
            ...env
        ].every((char)=>isAsciiLetter(char) || char === "*")) {
            index = envStart;
            continue;
        }
        const closeToken = `\\end{${env}}`;
        const closeStart = text.indexOf(closeToken, envEnd + 1);
        if (closeStart === -1) {
            index = envEnd + 1;
            continue;
        }
        if (closeStart - envEnd - 1 <= 10000) {
            const end = closeStart + closeToken.length;
            matches.push(text.slice(start, end));
            index = end;
        } else {
            index = envEnd + 1;
        }
    }
    return matches;
}
function collectVersions(text) {
    const matches = [];
    for(let index = 0; index < text.length; index++){
        if (!isAsciiDigit(text[index])) continue;
        if (index > 0 && isWordChar(text[index - 1])) continue;
        let cursor = readDigits(text, index);
        let dotGroups = 0;
        while(dotGroups < 3 && text[cursor] === "." && isAsciiDigit(text[cursor + 1])){
            cursor = readDigits(text, cursor + 1);
            dotGroups++;
        }
        if (dotGroups < 1) continue;
        if ((text[cursor] === "-" || text[cursor] === "+") && isVersionSuffixChar(text[cursor + 1])) {
            cursor++;
            while(cursor < text.length && isVersionSuffixChar(text[cursor])){
                cursor++;
            }
        }
        if (isWordChar(text[cursor])) continue;
        matches.push(text.slice(index, cursor));
        index = cursor - 1;
    }
    return matches;
}
function readDigits(text, start) {
    let cursor = start;
    while(cursor < text.length && isAsciiDigit(text[cursor])){
        cursor++;
    }
    return cursor;
}
function isVersionSuffixChar(char) {
    return !!char && (isAsciiAlphaNumeric(char) || char === "." || char === "-");
}
function collectConstCase(text) {
    const matches = [];
    for(let index = 0; index < text.length; index++){
        if (!isAsciiUpper(text[index])) continue;
        if (index > 0 && isWordChar(text[index - 1])) continue;
        let cursor = index + 1;
        let hasUnderscore = false;
        while(cursor < text.length){
            const char = text[cursor];
            if (char === "_") {
                if (!isAsciiUpper(text[cursor + 1]) && !isAsciiDigit(text[cursor + 1])) break;
                hasUnderscore = true;
                cursor++;
                continue;
            }
            if (!isAsciiUpper(char) && !isAsciiDigit(char)) break;
            cursor++;
        }
        if (!hasUnderscore || isWordChar(text[cursor])) continue;
        matches.push(text.slice(index, cursor));
        index = cursor - 1;
    }
    return matches;
}
}),
"[project]/open-sse/services/compression/languageDetector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCompressionLanguage",
    ()=>detectCompressionLanguage,
    "listSupportedCompressionLanguages",
    ()=>listSupportedCompressionLanguages
]);
const LANGUAGE_HINTS = {
    it: [
        /\b(?:perche|perché|pero|però|cioe|cioè|quindi|potresti|vorrei|adesso|errore|grazie|devo|voglio|questo|quello|anche|sono|molto)\b/i
    ],
    "pt-BR": [
        /\b(?:voce|você|preciso|arquivo|codigo|código|erro|falha|obrigado)\b/i
    ],
    // NOTE: English-ambiguous words are intentionally excluded — "error" (es) and
    // "configuration" (fr) are identical in English and would misclassify English text.
    // Spanish/French keep their distinctive native spellings (fallo / erreur, etc).
    es: [
        /\b(?:necesito|archivo|codigo|código|fallo|gracias|puedes)\b/i
    ],
    de: [
        /\b(?:ich|datei|fehler|bitte|kannst|konfiguration|danke)\b/i
    ],
    fr: [
        /\b(?:fichier|erreur|merci|peux|besoin)\b/i
    ],
    ja: [
        /[\u3040-\u30ff]/
    ],
    id: [
        /\b(?:saya|kamu|anda|dengan|untuk|yang|tidak|bisa|terima\s+kasih|dari)\b/i
    ]
};
function detectCompressionLanguage(text) {
    // CJK disambiguation: Han ideographs (U+4E00–U+9FFF) are shared by Chinese and Japanese, but
    // kana (U+3040–U+30FF) is Japanese-exclusive. Text with Han and no kana is Chinese (zh); text
    // with kana falls through to the scorer below, where the `ja` kana hint catches it. Keeping zh
    // out of the additive scorer means a Han-heavy Japanese sentence is never misread as Chinese.
    if (/[一-鿿]/.test(text) && !/[぀-ヿ]/.test(text)) {
        return "zh";
    }
    let best = "en";
    let bestScore = 0;
    for (const [language, patterns] of Object.entries(LANGUAGE_HINTS)){
        let score = 0;
        for (const pattern of patterns){
            const global = pattern.flags.includes("g") ? pattern : new RegExp(pattern.source, pattern.flags + "g");
            const matches = text.match(global);
            if (matches) score += matches.length;
        }
        if (score > bestScore) {
            bestScore = score;
            best = language;
        }
    }
    return best;
}
function listSupportedCompressionLanguages() {
    // zh is detected via the CJK Han/kana disambiguation in detectCompressionLanguage rather than a
    // keyword hint (so it stays out of the additive scorer), hence it is listed explicitly here.
    return [
        "en",
        "zh",
        ...Object.keys(LANGUAGE_HINTS)
    ];
}
}),
"[project]/open-sse/services/compression/caveman.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyRulesToText",
    ()=>applyRulesToText,
    "cavemanCompress",
    ()=>cavemanCompress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cavemanRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cavemanRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$languageDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/languageDetector.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const RULE_KEYWORDS = {
    redundant_phrasing: [
        "make sure",
        "be sure"
    ],
    redundant_because: [
        "due to the fact",
        "the reason is because"
    ],
    redundant_directive: [
        "it is important",
        "you should",
        "remember to"
    ],
    pleasantries: [
        "sure",
        "certainly",
        "of course",
        "happy to",
        "thanks",
        "thank you",
        "glad to help",
        "glad to",
        "no problem",
        "you're welcome",
        "youre welcome",
        "absolutely"
    ],
    polite_framing: [
        "please",
        "kindly",
        "could you please",
        "would you please",
        "can you please",
        "i would like you",
        "i want you",
        "i need you"
    ],
    hedging: [
        "it seems like",
        "it appears that",
        "i think that",
        "i believe that",
        "probably",
        "possibly",
        "maybe it"
    ],
    verbose_instructions: [
        "provide a detailed",
        "give me a comprehensive",
        "write an in-depth",
        "create a thorough",
        "explain in detail"
    ],
    filler_adverbs: [
        "basically",
        "essentially",
        "actually",
        "literally",
        "simply",
        "currently"
    ],
    filler_phrases: [
        "i want to",
        "i need to",
        "i'd like to",
        "i'm looking for"
    ],
    redundant_openers: [
        "hi there",
        "hello",
        "good morning",
        "hey"
    ],
    verbose_requests: [
        "i was wondering",
        "would it be possible"
    ],
    leader_phrases: [
        "i'll",
        "i will",
        "i can",
        "i'd",
        "let me",
        "you can",
        "we will",
        "we can",
        "let's"
    ],
    self_reference: [
        "i am trying to",
        "i am working on",
        "i have been"
    ],
    excessive_gratitude: [
        "thank you so much",
        "thanks in advance",
        "i really appreciate"
    ],
    qualifier_removal: [
        "a bit",
        "a little",
        "somewhat",
        "kind of",
        "sort of"
    ],
    softeners: [
        "if possible",
        "when you get a chance",
        "at your convenience",
        "just wondering"
    ],
    uncertainty_fillers: [
        "i guess",
        "i suppose",
        "more or less",
        "in a way"
    ],
    assistant_fillers: [
        "here's",
        "below is",
        "this is"
    ],
    compound_collapse: [
        "and any potential"
    ],
    explanatory_prefix: [
        "the function appears to be handling",
        "the code seems to",
        "the class is",
        "this module is"
    ],
    question_to_directive: [
        "can you explain why",
        "could you show me how",
        "would you tell me",
        "can you tell me"
    ],
    context_setup: [
        "i have the following code",
        "here is my code",
        "below is the code"
    ],
    intent_clarification: [
        "what i'm trying to do",
        "my objective is to",
        "what i need is",
        "i'm aiming to"
    ],
    background_removal: [
        "as you may know",
        "as we discussed earlier"
    ],
    meta_commentary: [
        "note that",
        "keep in mind",
        "remember that"
    ],
    purpose_statement: [
        "for the purpose of",
        "with the goal of",
        "in an effort to",
        "for every"
    ],
    list_conjunction: [
        "and also",
        "as well as"
    ],
    purpose_phrases: [
        "in order to",
        "so as to"
    ],
    redundant_quantifiers: [
        "each and every",
        "any and all"
    ],
    all_quantifier: [
        "any and all"
    ],
    verbose_connectors: [
        "furthermore",
        "additionally",
        "moreover",
        "in addition"
    ],
    transition_removal: [
        "on the other hand",
        "in contrast",
        "however"
    ],
    emphasis_removal: [
        "very",
        "really",
        "extremely",
        "highly",
        "quite"
    ],
    passive_voice: [
        "is being used",
        "is being called",
        "is being generated",
        "was created",
        "was generated",
        "was implemented"
    ],
    repeated_context: [
        "as we discussed earlier",
        "as mentioned before",
        "as previously stated",
        "as i said before"
    ],
    repeated_question: [
        "same question as before",
        "i asked this earlier",
        "this is the same question"
    ],
    reestablished_context: [
        "going back to the code above",
        "referring back to",
        "returning to"
    ],
    summary_replacement: [
        "to summarize",
        "in summary of our conversation",
        "to recap"
    ],
    ultra_abbreviations: [
        "database"
    ],
    ultra_config_abbreviation: [
        "configuration"
    ],
    ultra_function_abbreviation: [
        "function"
    ],
    ultra_request_abbreviation: [
        "request"
    ],
    ultra_response_abbreviation: [
        "response"
    ],
    ultra_implementation_abbreviation: [
        "implementation"
    ],
    ultra_authentication_abbreviation: [
        "authentication"
    ],
    ultra_authorization_abbreviation: [
        "authorization"
    ],
    ultra_application_abbreviation: [
        "application"
    ],
    ultra_dependency_abbreviation: [
        "dependency",
        "dependencies"
    ],
    ultra_common_abbreviations: [
        "implementation",
        "authentication",
        "authorization",
        "application",
        "dependency",
        "dependencies"
    ]
};
const ARTICLE_HINT_RE = /\b(?:a|an|the)\b/;
function shouldAttemptRule(ruleName, lowerText) {
    if (ruleName === "articles") {
        ARTICLE_HINT_RE.lastIndex = 0;
        return ARTICLE_HINT_RE.test(lowerText);
    }
    const keywords = RULE_KEYWORDS[ruleName];
    return !keywords || keywords.some((keyword)=>lowerText.includes(keyword));
}
function applyRulesToText(text, rules) {
    let result = text;
    const lowerResult = text.toLowerCase();
    const appliedRules = [];
    for (const rule of rules){
        if (!shouldAttemptRule(rule.name, lowerResult)) continue;
        const before = result;
        const { pattern, replacement } = rule;
        if (typeof replacement === "function") {
            const fn = replacement;
            result = result.replace(pattern, (...args)=>{
                const match = args[0];
                return fn(match, ...args.slice(1, -2));
            });
        } else {
            result = result.replace(pattern, replacement);
        }
        if (result !== before) {
            appliedRules.push(rule.name);
        }
    }
    return {
        text: result,
        appliedRules
    };
}
function cleanupArtifacts(text) {
    let result = text;
    if (hasRepeatedHorizontalWhitespace(result)) {
        result = collapseHorizontalWhitespaceRuns(result);
    }
    result = removeHorizontalWhitespaceBeforePunctuation(result);
    result = collapseRepeatedSentencePunctuation(result);
    if (result.includes(" \n") || result.includes("\t\n")) {
        result = stripLineTrailingHorizontalWhitespace(result);
    }
    if (result.endsWith(" ") || result.endsWith("\t")) result = result.trimEnd();
    if (result.includes("\n\n\n")) result = collapseExcessNewlines(result);
    if (result.startsWith("\n")) result = trimLeadingNewlines(result);
    if (result.endsWith("\n")) result = trimTrailingNewlines(result);
    return result;
}
function isHorizontalWhitespace(char) {
    return char === " " || char === "\t";
}
function isSentencePunctuation(char) {
    return char === "." || char === "!" || char === "?";
}
function isCleanupPunctuation(char) {
    return char === "," || char === "." || char === ";" || char === ":" || char === "!" || char === "?";
}
function hasRepeatedHorizontalWhitespace(text) {
    let previousWasWhitespace = false;
    for (const char of text){
        const currentIsWhitespace = isHorizontalWhitespace(char);
        if (currentIsWhitespace && previousWasWhitespace) return true;
        previousWasWhitespace = currentIsWhitespace;
    }
    return false;
}
function collapseHorizontalWhitespaceRuns(text) {
    let output = "";
    let changed = false;
    for(let index = 0; index < text.length; index++){
        const char = text[index];
        if (!isHorizontalWhitespace(char)) {
            output += char;
            continue;
        }
        const start = index;
        while(index + 1 < text.length && isHorizontalWhitespace(text[index + 1])){
            index++;
        }
        if (index > start) {
            output += " ";
            changed = true;
        } else {
            output += char;
        }
    }
    return changed ? output : text;
}
function removeHorizontalWhitespaceBeforePunctuation(text) {
    let output = "";
    let changed = false;
    for(let index = 0; index < text.length; index++){
        const char = text[index];
        if (!isHorizontalWhitespace(char)) {
            output += char;
            continue;
        }
        const start = index;
        while(index + 1 < text.length && isHorizontalWhitespace(text[index + 1])){
            index++;
        }
        const nextChar = text[index + 1];
        if (nextChar && isCleanupPunctuation(nextChar)) {
            changed = true;
            continue;
        }
        output += text.slice(start, index + 1);
    }
    return changed ? output : text;
}
function collapseRepeatedSentencePunctuation(text) {
    let output = "";
    let changed = false;
    for(let index = 0; index < text.length; index++){
        const char = text[index];
        if (!isSentencePunctuation(char)) {
            output += char;
            continue;
        }
        let lastPunctuation = char;
        const start = index;
        while(index + 1 < text.length && isSentencePunctuation(text[index + 1])){
            index++;
            lastPunctuation = text[index];
        }
        if (index > start) changed = true;
        output += lastPunctuation;
    }
    return changed ? output : text;
}
function trimEndHorizontalWhitespace(text) {
    let end = text.length;
    while(end > 0 && isHorizontalWhitespace(text[end - 1])){
        end--;
    }
    return end === text.length ? text : text.slice(0, end);
}
function stripLineTrailingHorizontalWhitespace(text) {
    const lines = text.split("\n");
    let changed = false;
    const cleanedLines = lines.map((line)=>{
        const cleaned = trimEndHorizontalWhitespace(line);
        if (cleaned !== line) changed = true;
        return cleaned;
    });
    return changed ? cleanedLines.join("\n") : text;
}
function collapseExcessNewlines(text) {
    let output = "";
    let changed = false;
    for(let index = 0; index < text.length; index++){
        const char = text[index];
        if (char !== "\n") {
            output += char;
            continue;
        }
        const start = index;
        while(index + 1 < text.length && text[index + 1] === "\n"){
            index++;
        }
        const newlineCount = index - start + 1;
        if (newlineCount > 2) {
            output += "\n\n";
            changed = true;
        } else {
            output += text.slice(start, index + 1);
        }
    }
    return changed ? output : text;
}
function trimLeadingNewlines(text) {
    let start = 0;
    while(start < text.length && text[start] === "\n"){
        start++;
    }
    return start === 0 ? text : text.slice(start);
}
function trimTrailingNewlines(text) {
    let end = text.length;
    while(end > 0 && text[end - 1] === "\n"){
        end--;
    }
    return end === text.length ? text : text.slice(0, end);
}
function recapitalizeSentences(text) {
    return text.replace(/(^|[.!?][ \t]|\n[ \t]*)([a-z])/g, (_match, prefix, char)=>{
        return `${prefix}${char.toUpperCase()}`;
    });
}
function createCavemanStats(originalTokens, compressedTokens, techniquesUsed, rulesApplied, durationMs) {
    const savingsPercent = originalTokens > 0 ? Math.round((originalTokens - compressedTokens) / originalTokens * 10000) / 100 : 0;
    return {
        originalTokens,
        compressedTokens,
        savingsPercent,
        techniquesUsed,
        mode: "standard",
        timestamp: Date.now(),
        ...rulesApplied && rulesApplied.length > 0 ? {
            rulesApplied
        } : {},
        durationMs
    };
}
function compileUserPreservePatterns(patterns) {
    const compiled = [];
    const warnings = [];
    for (const pattern of patterns){
        try {
            compiled.push(new RegExp(pattern, "g"));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            warnings.push(`Invalid preservePatterns regex ignored: ${pattern} (${message})`);
        }
    }
    return {
        patterns: compiled,
        warnings
    };
}
const PROTECTED_STRUCTURE_RE = /```|~~~|`|https?:\/\/|\[[^\]\n]{1,1000}\]\([^)[ \t\n]{1,2000}(?:[ \t]+"[^"]{0,1000}")?\)|^#{1,6}\s+|^[ \t]*\|(?:[^|\n]{0,1000}\|){1,100}[ \t]*$|\$\$|\\\[|\\begin\{|^\s*#(?:set|show|let|import|include)\b|\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\bprocess\.env\.[A-Za-z_][A-Za-z0-9_]*\b|\$[A-Z_][A-Z0-9_]*\b|\b\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?\b|\b[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)+\(\)?|\b[A-Za-z_$][\w$]*[ \t]*\([^()\n]{0,1000}\)|(?:^|\s)(?:\.{0,2}\/[A-Za-z0-9_@./-]+|[A-Za-z]:\\[A-Za-z0-9_.\\/-]+)|\b(?:TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|Error|Exception):[^\n]{0,1000}/im;
const PROTECTED_STRUCTURE_PREFILTER_RE = /[`~\[\]\|$#\\/:_()0-9]/;
function hasProtectedStructure(text) {
    if (!PROTECTED_STRUCTURE_PREFILTER_RE.test(text)) return false;
    PROTECTED_STRUCTURE_RE.lastIndex = 0;
    return PROTECTED_STRUCTURE_RE.test(text);
}
function cavemanCompress(body, options) {
    const startMs = performance.now();
    const config = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CAVEMAN_CONFIG"],
        ...options
    };
    const emptyResult = ()=>({
            body: body,
            compressed: false,
            stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, body, "standard", [])
        });
    if (!config.enabled) {
        return emptyResult();
    }
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        return emptyResult();
    }
    let totalOriginalTokens = 0;
    let totalCompressedTokens = 0;
    const allAppliedRules = [];
    const validationWarnings = [];
    const validationErrors = [];
    let fallbackApplied = false;
    let preservedBlockCount = 0;
    const customPreservation = compileUserPreservePatterns(config.preservePatterns ?? []);
    validationWarnings.push(...customPreservation.warnings);
    const compressedMessages = body.messages.map((msg)=>{
        if (typeof msg.content !== "string" && !Array.isArray(msg.content)) {
            return msg;
        }
        const contentStr = typeof msg.content === "string" ? msg.content : msg.content.map((part)=>part && typeof part === "object" && "text" in part && typeof part.text === "string" ? part.text : "").filter(Boolean).join("\n");
        totalOriginalTokens += (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(contentStr);
        if (!contentStr || contentStr.length < config.minMessageLength) {
            totalCompressedTokens += (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(contentStr);
            return msg;
        }
        if (!config.compressRoles.includes(msg.role)) {
            totalCompressedTokens += (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(contentStr);
            return msg;
        }
        const compressTextPart = (textPart)=>{
            if (!textPart || textPart.length < config.minMessageLength) return textPart;
            const shouldPreserve = customPreservation.patterns.length > 0 || hasProtectedStructure(textPart);
            const { text: extractedText, blocks } = shouldPreserve ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(textPart, {
                preservePatterns: customPreservation.patterns
            }) : {
                text: textPart,
                blocks: []
            };
            preservedBlockCount += blocks.length;
            const detectedLanguage = config.autoDetectLanguage ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$languageDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCompressionLanguage"])(textPart) : config.language ?? "en";
            const enabledPacks = config.enabledLanguagePacks ?? [
                "en",
                detectedLanguage
            ];
            // When auto-detect is on, honor the detected language directly: the detector only
            // returns languages that have a rule pack, and falling back to the English pack on
            // non-English text mangles it (the EN `articles` rule deletes pt-BR "a"/"o").
            // enabledPacks still gates MANUAL pack selection (auto-detect off). (B-LANG-DORMANT)
            const language = config.autoDetectLanguage ? detectedLanguage : enabledPacks.includes(detectedLanguage) ? detectedLanguage : enabledPacks.includes("en") ? "en" : detectedLanguage;
            const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cavemanRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRulesForContext"])(msg.role, config.intensity, language).filter((rule)=>!config.skipRules.includes(rule.name));
            const { text: rulesApplied, appliedRules } = applyRulesToText(extractedText, rules);
            allAppliedRules.push(...appliedRules);
            const normalized = recapitalizeSentences(cleanupArtifacts(rulesApplied));
            const cleaned = blocks.length > 0 ? cleanupArtifacts((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePreservedBlocks"])(normalized, blocks)) : normalized;
            if (shouldPreserve || blocks.length > 0) {
                const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateCompression"])(textPart, cleaned);
                validationWarnings.push(...validation.warnings);
                if (!validation.valid) {
                    validationErrors.push(...validation.errors);
                    fallbackApplied = true;
                    return textPart;
                }
            }
            return cleaned;
        };
        const compressedMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTextContent"])(msg, compressTextPart);
        const cleaned = typeof compressedMessage.content === "string" ? compressedMessage.content : Array.isArray(compressedMessage.content) ? compressedMessage.content.map((part)=>part && typeof part === "object" && "text" in part && typeof part.text === "string" ? part.text : "").filter(Boolean).join("\n") : contentStr;
        totalCompressedTokens += (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(cleaned);
        return compressedMessage;
    });
    const durationMs = performance.now() - startMs;
    const uniqueRules = [
        ...new Set(allAppliedRules)
    ];
    const stats = createCavemanStats(totalOriginalTokens, totalCompressedTokens, uniqueRules.length > 0 ? [
        "caveman-rules"
    ] : [], uniqueRules.length > 0 ? uniqueRules : undefined, Math.round(durationMs * 100) / 100);
    if (validationWarnings.length > 0) stats.validationWarnings = [
        ...new Set(validationWarnings)
    ];
    if (validationErrors.length > 0) stats.validationErrors = [
        ...new Set(validationErrors)
    ];
    if (fallbackApplied) stats.fallbackApplied = true;
    if (preservedBlockCount > 0) stats.preservedBlockCount = preservedBlockCount;
    const compressed = totalCompressedTokens < totalOriginalTokens;
    const result = {
        body: {
            ...body,
            messages: compressedMessages
        },
        compressed,
        stats
    };
    return result;
}
}),
"[project]/open-sse/services/compression/engines/ccr/ccrQuery.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_GREP_MATCHES",
    ()=>MAX_GREP_MATCHES,
    "MAX_PATTERN_LEN",
    ()=>MAX_PATTERN_LEN,
    "MAX_RANGE_LINES",
    ()=>MAX_RANGE_LINES,
    "queryBlock",
    ()=>queryBlock
]);
/**
 * ccrQuery.ts — ranged/grep/stats retrieval over a CCR block (pure).
 *
 * `full`/absent → whole text (backward-compat). All modes are fail-safe:
 * incoherent params or an unsafe regex yield { error }, never throw. The grep
 * mode validates the pattern with `safe-regex` (no catastrophic backtracking)
 * before compiling, and bounds matches/pattern length.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$safe$2d$regex$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/safe-regex/index.js [app-route] (ecmascript)");
;
const MAX_RANGE_LINES = 10_000;
const MAX_GREP_MATCHES = 1_000;
const MAX_PATTERN_LEN = 512;
const err = (m)=>({
        error: m
    });
const ok = (c)=>({
        content: c
    });
function clampCount(n) {
    if (typeof n !== "number" || !Number.isFinite(n) || n < 1) return null;
    return Math.min(Math.floor(n), MAX_RANGE_LINES);
}
function sliceHead(lines, n) {
    const c = clampCount(n);
    if (c === null) return err("head requires a positive 'n'");
    return ok(lines.slice(0, c).join("\n"));
}
function sliceTail(lines, n) {
    const c = clampCount(n);
    if (c === null) return err("tail requires a positive 'n'");
    return ok(lines.slice(Math.max(0, lines.length - c)).join("\n"));
}
function sliceLines(lines, start, end) {
    if (typeof start !== "number" || typeof end !== "number" || start < 1 || end < 1) {
        return err("lines requires positive 'start' and 'end' (1-indexed)");
    }
    if (start > end) return err("lines: 'start' must be <= 'end'");
    return ok(lines.slice(start - 1, Math.min(end, lines.length)).join("\n"));
}
function grepLines(lines, pattern, unique) {
    if (!pattern) return err("grep requires a 'pattern'");
    if (pattern.length > MAX_PATTERN_LEN) return err(`pattern exceeds ${MAX_PATTERN_LEN} chars`);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$safe$2d$regex$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(pattern)) return err("pattern rejected: potentially catastrophic backtracking");
    let re;
    try {
        re = new RegExp(pattern);
    } catch  {
        return err("invalid regex pattern");
    }
    const matched = [];
    let truncated = false;
    for (const line of lines){
        if (re.test(line)) {
            matched.push(line);
            if (matched.length >= MAX_GREP_MATCHES) {
                truncated = true;
                break;
            }
        }
    }
    const out = unique ? [
        ...new Set(matched)
    ] : matched;
    const body = out.join("\n");
    return ok(truncated ? `${body}\n…[truncated at ${MAX_GREP_MATCHES} matches]` : body);
}
function blockStats(text, lines) {
    return ok(JSON.stringify({
        lines: lines.length,
        chars: text.length,
        bytes: Buffer.byteLength(text, "utf8")
    }));
}
function queryBlock(text, q) {
    const mode = q.mode ?? "full";
    if (mode === "full") return ok(text);
    const lines = text.split("\n");
    switch(mode){
        case "head":
            return sliceHead(lines, q.n);
        case "tail":
            return sliceTail(lines, q.n);
        case "lines":
            return sliceLines(lines, q.start, q.end);
        case "grep":
            return grepLines(lines, q.pattern, q.unique);
        case "stats":
            return blockStats(text, lines);
        default:
            return err(`unknown mode: ${String(mode)}`);
    }
}
}),
"[project]/open-sse/services/compression/engines/ccr/protocolInstruction.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CCR_PROTOCOL_INSTRUCTION",
    ()=>CCR_PROTOCOL_INSTRUCTION,
    "CCR_PROTOCOL_MARKER_SENTINEL",
    ()=>CCR_PROTOCOL_MARKER_SENTINEL,
    "callerSupportsCcrRetrieve",
    ()=>callerSupportsCcrRetrieve,
    "injectCcrProtocolInstruction",
    ()=>injectCcrProtocolInstruction
]);
/**
 * CCR retrieve-protocol instruction (#8033)
 *
 * The CCR engine replaces large blocks of text with a bare
 * `[CCR retrieve hash=<24hex> chars=N]` marker (see `index.ts`). A caller that has
 * never been told what that marker means has no way to recover the original
 * content — it can only call `omniroute_ccr_retrieve` if it (a) knows the tool
 * exists and (b) copies the 24-hex hash verbatim.
 *
 * This module injects a single, idempotent `system` message the first time a
 * request carries a CCR marker, teaching the model the marker → tool contract —
 * but ONLY when the caller's advertised `tools[]` proves it can actually reach
 * `omniroute_ccr_retrieve` (an MCP-capable caller). Plain OpenAI-compatible
 * callers that cannot reach the tool must never be told to call it.
 */ const CCR_RETRIEVE_TOOL_NAME = "omniroute_ccr_retrieve";
const CCR_PROTOCOL_MARKER_SENTINEL = "[CCR protocol]";
const CCR_PROTOCOL_INSTRUCTION = `${CCR_PROTOCOL_MARKER_SENTINEL} This conversation uses content-compression-retrieve (CCR). When you see a marker like \`[CCR retrieve hash=<24hex> chars=N]\` in a message, it means the full original text (N characters) was stored and replaced with this marker to save space — call the \`${CCR_RETRIEVE_TOOL_NAME}\` tool with that hash to get the original text back verbatim. Copy the hash EXACTLY as written — all 24 hexadecimal characters, never truncated, abbreviated, or reformatted — a single wrong character will make the retrieval fail. If you instead see a marker like \`[dedup:ref sha=...]\`, it means that content already appeared earlier in this conversation — look back in the message history for it; do NOT call ${CCR_RETRIEVE_TOOL_NAME} for a dedup reference.`;
function callerSupportsCcrRetrieve(body) {
    const tools = body["tools"];
    if (!Array.isArray(tools)) return false;
    return tools.some((tool)=>{
        const t = tool;
        const flatName = typeof t?.name === "string" ? t.name : undefined;
        const nestedName = typeof t?.function?.name === "string" ? t.function.name : undefined;
        return flatName === CCR_RETRIEVE_TOOL_NAME || nestedName === CCR_RETRIEVE_TOOL_NAME;
    });
}
function messageContainsSentinel(message) {
    const content = message?.content;
    if (typeof content === "string") return content.includes(CCR_PROTOCOL_MARKER_SENTINEL);
    if (Array.isArray(content)) {
        return content.some((part)=>part && typeof part === "object" && typeof part["text"] === "string" && part["text"].includes(CCR_PROTOCOL_MARKER_SENTINEL));
    }
    return false;
}
function injectCcrProtocolInstruction(messages, body) {
    if (!callerSupportsCcrRetrieve(body)) return messages;
    if (messages.some((message)=>messageContainsSentinel(message))) return messages;
    const instructionMessage = {
        role: "system",
        content: CCR_PROTOCOL_INSTRUCTION
    };
    return [
        instructionMessage,
        ...messages
    ];
}
}),
"[project]/open-sse/services/compression/engines/ccr/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CCR_TTL_SECONDS",
    ()=>DEFAULT_CCR_TTL_SECONDS,
    "MAX_CCR_BLOCK_BYTES",
    ()=>MAX_CCR_BLOCK_BYTES,
    "MAX_CCR_ENTRIES",
    ()=>MAX_CCR_ENTRIES,
    "MAX_CCR_GLOBAL_BYTES",
    ()=>MAX_CCR_GLOBAL_BYTES,
    "MAX_CCR_MCP_FULL_BYTES",
    ()=>MAX_CCR_MCP_FULL_BYTES,
    "MAX_CCR_PRINCIPAL_BYTES",
    ()=>MAX_CCR_PRINCIPAL_BYTES,
    "MAX_CCR_TTL_SECONDS",
    ()=>MAX_CCR_TTL_SECONDS,
    "buildCcrMarker",
    ()=>buildCcrMarker,
    "buildCcrReference",
    ()=>buildCcrReference,
    "ccrEngine",
    ()=>ccrEngine,
    "deleteCcrBlock",
    ()=>deleteCcrBlock,
    "effectiveMinChars",
    ()=>effectiveMinChars,
    "flushCcrDurableWrites",
    ()=>flushCcrDurableWrites,
    "getCcrStoreStats",
    ()=>getCcrStoreStats,
    "handleCcrRetrieve",
    ()=>handleCcrRetrieve,
    "inspectCcrBlock",
    ()=>inspectCcrBlock,
    "isCcrStoreRejection",
    ()=>isCcrStoreRejection,
    "listCcrBlocks",
    ()=>listCcrBlocks,
    "recordRetrieval",
    ()=>recordRetrieval,
    "resetCcrStore",
    ()=>resetCcrStore,
    "resolveRetrievalRampFactor",
    ()=>resolveRetrievalRampFactor,
    "retrieveBlock",
    ()=>retrieveBlock,
    "shouldSkipCompression",
    ()=>shouldSkipCompression,
    "storeBlock",
    ()=>storeBlock,
    "tryStoreBlock",
    ()=>tryStoreBlock
]);
/**
 * CCR (Content-Compression-Retrieve) engine (H4)
 *
 * Replaces large contiguous blocks of text with a content-addressed
 * retrieve marker: `[CCR retrieve hash=<24hex> chars=<N>]`
 *
 * The verbatim block is stored in a principal-scoped, bounded in-module store.
 * The store key is `${principalId ?? "__anon__"} ${contentHash}` so that one
 * principal cannot read another's stored blocks (IDOR protection).
 *
 * The `retrieve` MCP tool (or the `handleCcrRetrieve` helper exported here)
 * returns the block on demand when called with the matching callerId.
 *
 * Algorithm:
 *   - Scan non-system messages; for each `type:"text"` part or string content,
 *     find contiguous text blocks ≥ minChars characters.
 *   - Replace the block with `[CCR retrieve hash=<24hex> chars=<N>]` only if
 *     the marker is shorter than the original block.
 *   - Store the original block keyed by (principalId, hash) in the CCR store.
 *
 * Feedback (scoped by principal):
 *   - `recordRetrieval(hash, principalId)` increments a retrieval counter for
 *     that (principalId, hash) pair.
 *   - `shouldSkipCompression(hash, principalId)` returns true once the counter
 *     reaches RETRIEVAL_THRESHOLD for that principal — one principal's behaviour
 *     does not affect another's (cross-tenant state drift protection).
 *
 * Memory bound:
 *   - Entries are capped by count, global bytes, per-principal bytes, block bytes and TTL.
 *   - Expired and least-recently-used entries are removed before a store is rejected.
 *
 * Conservative guards:
 *   - Never touch `role: "system"`.
 *   - Only replace if it shrinks (marker shorter than original).
 *   - Only replace blocks ≥ minChars (default 600).
 *   - `stackable: true`, `stackPriority: 4` (runs just after session-dedup(3)).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccrBlocks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$ccrQuery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ccr/ccrQuery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$protocolInstruction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ccr/protocolInstruction.ts [app-route] (ecmascript)");
;
;
;
;
;
// ─── constants ────────────────────────────────────────────────────────────────
const ENGINE_ID = "ccr";
/** Default minimum character count for a block to be a CCR candidate. */ const DEFAULT_MIN_CHARS = 600;
/** Number of retrievals before a block is flagged "do-not-compress" for that principal. */ const RETRIEVAL_THRESHOLD = 3;
/**
 * H8 — default retrieval ramp factor. Each prior retrieval (below the threshold) raises a block's
 * effective `minChars` linearly, so hot content is compressed progressively less; `1` disables the
 * ramp (only the >= threshold cliff remains — the legacy binary behavior).
 */ const RETRIEVAL_RAMP_FACTOR_DEFAULT = 2;
const MAX_CCR_ENTRIES = 5_000;
const MAX_CCR_BLOCK_BYTES = 2 * 1024 * 1024;
const MAX_CCR_PRINCIPAL_BYTES = 16 * 1024 * 1024;
const MAX_CCR_GLOBAL_BYTES = 64 * 1024 * 1024;
const DEFAULT_CCR_TTL_SECONDS = 24 * 60 * 60;
const MAX_CCR_TTL_SECONDS = 7 * 24 * 60 * 60;
const MAX_CCR_MCP_FULL_BYTES = 256 * 1024;
function isCcrStoreRejection(result) {
    return result.stored === false;
}
// ─── principal-scoped, bounded content store ──────────────────────────────────
/**
 * Store key = `${principalId ?? "__anon__"} ${contentHash}`.
 * Using a compound key scopes data to the principal that stored it.
 */ const ccrStore = new Map();
const retrievalCounts = new Map();
const principalBytesMap = new Map();
let ccrTotalBytes = 0;
const lifecycleByPrincipal = new Map();
/** Sentinel used when no principalId is provided. */ const ANON = "__anon__";
function buildStoreKey(hash, principalId) {
    return `${principalId ?? ANON} ${hash}`;
}
// ─── durable second tier (#9061) ──────────────────────────────────────────────
/**
 * The map above is the hot cache. It loses entries to cross-principal LRU eviction, to
 * the TTL, to restarts, and to a retrieve landing on another instance, while
 * `fidelityGateStep` waives fidelity checks for sampling engines on the grounds that
 * their drop is "CCR-recoverable", and the protocol instruction promises the model a
 * verbatim block. These helpers put the block on disk so that promise survives.
 *
 * Every one of them is best-effort: a store without a usable database (compression
 * preview, unit tests, a read-only volume) degrades to today's in-memory behaviour
 * rather than failing the request.
 *
 * Three guards keep this from changing what the deployment stores at rest more than it
 * has to. They follow the call-log artifact path, which faced the same question:
 *
 *   1. Blocks over `MAX_DURABLE_BLOCK_BYTES` stay memory-only. `MAX_CCR_BLOCK_BYTES` is
 *      2 MB, and 5,000 of those would be 10 GB of prompt text in SQLite. 512 KB is the
 *      ceiling #1647 already set on call artifacts for this exact reason.
 *   2. No durable tier on a cloud runtime, which has no local disk to write to.
 *   3. `COMPRESSION_CCR_DURABLE_STORE=false` turns it off. The content is prompt text, and an
 *      operator who does not want that on disk needs a switch that is not a rebuild.
 *
 * The switch defaults to on because the model is already told, by the CCR protocol
 * instruction, that it can retrieve the block verbatim. Leaving it off by default would
 * keep that promise hollow for everyone who never reads this file.
 */ const MAX_DURABLE_BLOCK_BYTES = 512 * 1024;
/** Matches the detection call-log artifacts use (`callLogArtifacts.ts`). */ const isCloudRuntime = typeof globalThis.caches === "object" && globalThis.caches !== null;
function durableTierEnabled() {
    return !isCloudRuntime && process.env.COMPRESSION_CCR_DURABLE_STORE !== "false";
}
const loggedDurableErrors = new Set();
function warnDurableError(operation, error) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (loggedDurableErrors.has(operation)) return;
    if (loggedDurableErrors.size >= 20) {
        const first = loggedDurableErrors.values().next().value;
        if (first !== undefined) loggedDurableErrors.delete(first);
    }
    loggedDurableErrors.add(operation);
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[ccr] durable ${operation} failed: ${message}`);
}
/**
 * Writes are deferred off the request path. Measured on this repo, a synchronous
 * `persistCcrBlock` costs 0.032 ms at the 600-char minimum block but 1.77 ms at 500 KB,
 * past the 1 ms this engine declares in its metadata, and roughly 7x the sha256 it
 * already pays over the same bytes. The block is in the map before the defer runs, so an
 * in-process retrieve never waits for the disk; only a crash inside that tick loses the
 * durable copy, and the client's next request re-stores it under the same hash.
 *
 * Persist and delete share this queue so they cannot reorder: `setImmediate` is FIFO, and
 * a delete that overtook its own persist would resurrect the block it just removed.
 */ const MAX_PENDING_DURABLE_WRITES = 1_000;
let pendingDurableWrites = 0;
let droppedDurableWrites = 0;
function deferDurable(operation, work, droppable = false) {
    // Backpressure. A burst faster than SQLite drains would otherwise queue without bound
    // and hold every block's content live in the closure. Dropping a persist is safe: the
    // block is still in the map, and the client re-stores it under the same hash on its
    // next request. Deletes are never dropped, or a deleted block would come back.
    if (droppable && pendingDurableWrites >= MAX_PENDING_DURABLE_WRITES) {
        droppedDurableWrites++;
        return;
    }
    pendingDurableWrites++;
    setImmediate(()=>{
        pendingDurableWrites--;
        try {
            work();
        } catch (error) {
            warnDurableError(operation, error);
        }
    });
}
function persistEntry(entry) {
    if (!durableTierEnabled()) return;
    if (entry.bytes > MAX_DURABLE_BLOCK_BYTES) return;
    const snapshot = {
        ...entry
    };
    deferDurable("persist", ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistCcrBlock"])(snapshot), true);
}
function forgetEntry(hash, principalId) {
    if (!durableTierEnabled()) return;
    deferDurable("delete", ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCcrBlockRow"])(principalId, hash));
}
/**
 * Read a block the map no longer holds and put it back in the map, so the LRU/byte
 * accounting keeps working from there. Returns null when there is no durable row, which
 * is also what a missing database looks like.
 */ function rehydrateEntry(hash, principalId, now) {
    if (!durableTierEnabled()) return null;
    let row;
    try {
        row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCcrBlock"])(principalId, hash, now);
    } catch (error) {
        warnDurableError("load", error);
        return null;
    }
    if (!row) return null;
    const entry = {
        hash: row.hash,
        principalId: row.principalId,
        content: row.content,
        bytes: row.bytes,
        chars: row.chars,
        lines: row.lines,
        contentType: row.contentType,
        source: row.source,
        createdAt: row.createdAt,
        lastAccessedAt: now,
        expiresAt: row.expiresAt
    };
    // Re-admit through the same budgets a fresh store would face. If the block no longer
    // fits, it stays on disk and is served straight from the row instead of being cached.
    if (enforcePrincipalBudget(entry.principalId, entry.bytes) && enforceGlobalBudget(entry.bytes)) {
        const key = buildStoreKey(hash, principalId === ANON ? undefined : principalId);
        ccrStore.set(key, entry);
        ccrTotalBytes += entry.bytes;
        principalBytesMap.set(entry.principalId, principalBytes(entry.principalId) + entry.bytes);
    }
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["touchCcrBlock"])(entry.principalId, hash, now);
    } catch (error) {
        warnDurableError("touch", error);
    }
    return entry;
}
function readLifecycleCounters(principalId) {
    return lifecycleByPrincipal.get(principalId) ?? {
        expiredEvictions: 0,
        capacityEvictions: 0,
        rejectedStores: 0
    };
}
function mutableLifecycleCounters(principalId) {
    const existing = lifecycleByPrincipal.get(principalId);
    if (existing) return existing;
    const counters = {
        expiredEvictions: 0,
        capacityEvictions: 0,
        rejectedStores: 0
    };
    lifecycleByPrincipal.set(principalId, counters);
    return counters;
}
function publicMetadata(entry) {
    const { principalId: _principalId, content: _content, ...metadata } = entry;
    return {
        ...metadata,
        retrievalCount: retrievalCounts.get(buildStoreKey(entry.hash, entry.principalId)) ?? 0
    };
}
function setRetrievalCount(key, count) {
    if (!retrievalCounts.has(key) && retrievalCounts.size >= MAX_CCR_ENTRIES) {
        const oldestKey = retrievalCounts.keys().next().value;
        if (oldestKey !== undefined) retrievalCounts.delete(oldestKey);
    }
    retrievalCounts.delete(key);
    retrievalCounts.set(key, count);
}
function removeEntry(key, reason) {
    const entry = ccrStore.get(key);
    if (!entry) return false;
    ccrStore.delete(key);
    ccrTotalBytes = Math.max(0, ccrTotalBytes - entry.bytes);
    const remainingPrincipalBytes = Math.max(0, (principalBytesMap.get(entry.principalId) ?? 0) - entry.bytes);
    if (remainingPrincipalBytes === 0) principalBytesMap.delete(entry.principalId);
    else principalBytesMap.set(entry.principalId, remainingPrincipalBytes);
    const counters = mutableLifecycleCounters(entry.principalId);
    if (reason === "expired") {
        counters.expiredEvictions++;
        // Expiry is the one eviction that means the block is finished. Capacity eviction is
        // not: that block stays on disk, which is the point of the durable tier (#9061).
        forgetEntry(entry.hash, entry.principalId);
    }
    if (reason === "capacity") counters.capacityEvictions++;
    return true;
}
function purgeExpired(now = Date.now()) {
    for (const [key, entry] of ccrStore){
        if (entry.expiresAt <= now) removeEntry(key, "expired");
    }
}
function getActiveEntry(key, now = Date.now()) {
    const entry = ccrStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= now) {
        removeEntry(key, "expired");
        return null;
    }
    return entry;
}
function principalBytes(principalId) {
    return principalBytesMap.get(principalId) ?? 0;
}
function evictOldestMatching(predicate) {
    for (const [key, entry] of ccrStore){
        if (predicate(entry)) return removeEntry(key, "capacity");
    }
    return false;
}
function normalizeTtlSeconds(value) {
    if (!Number.isFinite(value) || value === undefined) return DEFAULT_CCR_TTL_SECONDS;
    return Math.max(60, Math.min(MAX_CCR_TTL_SECONDS, Math.floor(value)));
}
/**
 * Compute a 24-hex content hash for a text block (SHA-256 prefix).
 * This is the hash embedded in the marker; principal scoping is internal to
 * the store key and is NOT part of the marker itself.
 */ function hashContent(text) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(text).digest("hex").slice(0, 24);
}
function rejectStore(hash, owner, reason) {
    mutableLifecycleCounters(owner).rejectedStores++;
    return {
        stored: false,
        hash,
        reason
    };
}
function enforcePrincipalBudget(owner, bytes) {
    while(principalBytes(owner) + bytes > MAX_CCR_PRINCIPAL_BYTES && evictOldestMatching((entry)=>entry.principalId === owner)){
    // Evict the owner's least-recently-used entries until this block fits.
    }
    return principalBytes(owner) + bytes <= MAX_CCR_PRINCIPAL_BYTES;
}
/**
 * Enforce the entry and global byte caps, giving up the storing principal's own
 * least-recently-used blocks before anyone else's.
 *
 * The caps here are global while the only per-principal cap is `MAX_CCR_PRINCIPAL_BYTES`,
 * so nothing bounds a principal's entry *count*. Blocks start at `DEFAULT_MIN_CHARS`, so
 * 5,000 of them is around 3 MB, under a fifth of one principal's 16 MB byte allowance,
 * and enough to exhaust the shared entry budget on its own. Evicting the globally oldest
 * entry from there took a block from whoever had been quiet longest, because LRU keeps
 * promoting the busy principal's own entries to the tail.
 *
 * Preferring `owner` keeps the global bound exactly as strict and makes a principal pay
 * for its own pressure first. Falling back to any principal preserves the previous
 * behaviour for the case that actually needs it: a newcomer storing into a store held
 * entirely by others, which would otherwise never fit.
 */ function enforceGlobalBudget(owner, bytes) {
    const overBudget = ()=>ccrStore.size >= MAX_CCR_ENTRIES || ccrTotalBytes + bytes > MAX_CCR_GLOBAL_BYTES;
    while(overBudget()){
        if (evictOldestMatching((entry)=>entry.principalId === owner)) continue;
        if (evictOldestMatching(()=>true)) continue;
        break;
    }
    return ccrTotalBytes + bytes <= MAX_CCR_GLOBAL_BYTES;
}
function tryStoreBlock(text, principalId, options = {}) {
    const hash = hashContent(text);
    const owner = principalId ?? ANON;
    const key = buildStoreKey(hash, principalId);
    const now = options.now ?? Date.now();
    purgeExpired(now);
    const existing = ccrStore.get(key);
    if (existing) {
        existing.lastAccessedAt = now;
        existing.expiresAt = now + normalizeTtlSeconds(options.ttlSeconds) * 1000;
        ccrStore.delete(key);
        ccrStore.set(key, existing);
        return {
            stored: true,
            hash,
            metadata: publicMetadata(existing)
        };
    }
    const bytes = Buffer.byteLength(text, "utf8");
    if (bytes > MAX_CCR_BLOCK_BYTES) {
        return rejectStore(hash, owner, "block_too_large");
    }
    if (!enforcePrincipalBudget(owner, bytes)) {
        return rejectStore(hash, owner, "principal_budget_exceeded");
    }
    if (!enforceGlobalBudget(owner, bytes)) {
        return rejectStore(hash, owner, "global_budget_exceeded");
    }
    const ttlSeconds = normalizeTtlSeconds(options.ttlSeconds);
    const entry = {
        hash,
        principalId: owner,
        content: text,
        bytes,
        chars: text.length,
        lines: text.length === 0 ? 0 : text.split("\n").length,
        contentType: options.contentType?.trim().slice(0, 128) || "text/plain",
        source: options.source ?? "compression",
        createdAt: now,
        lastAccessedAt: now,
        expiresAt: now + ttlSeconds * 1000
    };
    ccrStore.set(key, entry);
    ccrTotalBytes += bytes;
    principalBytesMap.set(owner, principalBytes(owner) + bytes);
    persistEntry(entry);
    return {
        stored: true,
        hash,
        metadata: publicMetadata(entry)
    };
}
function storeBlock(text, principalId, options = {}) {
    const result = tryStoreBlock(text, principalId, options);
    if (isCcrStoreRejection(result)) {
        throw new RangeError(`CCR store rejected block: ${result.reason}`);
    }
    return result.hash;
}
function retrieveBlock(hash, principalId, now = Date.now()) {
    const key = buildStoreKey(hash, principalId);
    const entry = getActiveEntry(key, now);
    if (!entry) {
        // Miss in the hot cache is not proof the block is gone (#9061): LRU eviction, the TTL
        // sweep, a restart, or another instance all land here while the row is still on disk.
        const restored = rehydrateEntry(hash, principalId ?? ANON, now);
        return restored ? restored.content : null;
    }
    entry.lastAccessedAt = now;
    ccrStore.delete(key);
    ccrStore.set(key, entry);
    return entry.content;
}
function recordRetrieval(hash, principalId) {
    const key = buildStoreKey(hash, principalId);
    setRetrievalCount(key, (retrievalCounts.get(key) ?? 0) + 1);
}
function shouldSkipCompression(hash, principalId) {
    const key = buildStoreKey(hash, principalId);
    return (retrievalCounts.get(key) ?? 0) >= RETRIEVAL_THRESHOLD;
}
function effectiveMinChars(baseMinChars, hash, principalId, rampFactor) {
    const count = retrievalCounts.get(buildStoreKey(hash, principalId)) ?? 0;
    if (count >= RETRIEVAL_THRESHOLD) return Number.POSITIVE_INFINITY;
    if (count <= 0 || rampFactor <= 1) return baseMinChars;
    // Linear ramp: count=1 → base·rampFactor; count=2 → base·(1 + 2·(rampFactor−1)); …
    return Math.round(baseMinChars * (1 + (rampFactor - 1) * count));
}
function resolveRetrievalRampFactor(env = process.env) {
    const raw = env.COMPRESSION_CCR_RETRIEVAL_RAMP_FACTOR;
    if (raw === undefined) return RETRIEVAL_RAMP_FACTOR_DEFAULT;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? n : RETRIEVAL_RAMP_FACTOR_DEFAULT;
}
function resetCcrStore() {
    ccrStore.clear();
    retrievalCounts.clear();
    principalBytesMap.clear();
    ccrTotalBytes = 0;
    lifecycleByPrincipal.clear();
    // Through the same queue as persist/delete, so a reset cannot overtake a write it was
    // meant to clear.
    deferDurable("reset", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteAllCcrBlocks"]);
}
function flushCcrDurableWrites() {
    return new Promise((resolve)=>setImmediate(resolve));
}
function inspectCcrBlock(hash, principalId, now = Date.now()) {
    const entry = getActiveEntry(buildStoreKey(hash, principalId), now);
    return entry ? publicMetadata(entry) : null;
}
function listCcrBlocks(principalId, options = {}) {
    purgeExpired(options.now);
    const owner = principalId ?? ANON;
    const offset = Math.max(0, Math.floor(options.offset ?? 0));
    const limit = Math.max(1, Math.min(100, Math.floor(options.limit ?? 25)));
    const all = [];
    for (const entry of ccrStore.values()){
        if (entry.principalId === owner) all.push(publicMetadata(entry));
    }
    all.reverse();
    return {
        entries: all.slice(offset, offset + limit),
        total: all.length,
        offset,
        limit,
        hasMore: offset + limit < all.length
    };
}
function deleteCcrBlock(hash, principalId, _now = Date.now()) {
    const removedFromCache = removeEntry(buildStoreKey(hash, principalId));
    // An explicit delete must reach the durable tier too, otherwise the next retrieve
    // rehydrates the block the caller just deleted.
    forgetEntry(hash, principalId ?? ANON);
    return removedFromCache;
}
function getCcrStoreStats(principalId, now = Date.now()) {
    purgeExpired(now);
    const owner = principalId ?? ANON;
    const entries = Array.from(ccrStore.values()).filter((entry)=>entry.principalId === owner);
    return {
        storage: "memory",
        entries: entries.length,
        bytes: entries.reduce((sum, entry)=>sum + entry.bytes, 0),
        limits: {
            maxEntries: MAX_CCR_ENTRIES,
            maxBlockBytes: MAX_CCR_BLOCK_BYTES,
            maxPrincipalBytes: MAX_CCR_PRINCIPAL_BYTES,
            maxGlobalBytes: MAX_CCR_GLOBAL_BYTES,
            defaultTtlSeconds: DEFAULT_CCR_TTL_SECONDS,
            maxTtlSeconds: MAX_CCR_TTL_SECONDS,
            maxMcpFullBytes: MAX_CCR_MCP_FULL_BYTES
        },
        lifecycle: {
            ...readLifecycleCounters(owner)
        }
    };
}
function handleCcrRetrieve(args, callerId) {
    if (!args.hash || typeof args.hash !== "string") {
        return {
            error: "hash parameter is required and must be a string"
        };
    }
    const block = retrieveBlock(args.hash, callerId);
    if (block === null) {
        return {
            error: `CCR block not found for hash=${args.hash}. The block may have expired or the hash is invalid.`
        };
    }
    recordRetrieval(args.hash, callerId);
    if (!args.mode || args.mode === "full") return {
        content: block
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$ccrQuery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryBlock"])(block, args);
}
function buildCcrMarker(hash, charCount) {
    return `[CCR retrieve hash=${hash} chars=${charCount}]`;
}
function buildCcrReference(hash, charCount) {
    return {
        hash,
        uri: `ccr://${hash}`,
        marker: buildCcrMarker(hash, charCount)
    };
}
/**
 * #7746 guard: how many leading characters of the original block to keep in front
 * of the marker. `maybeCcrReplace` treats an entire message/part as ONE candidate
 * block (see module docstring), so a bare marker alone would silently discard the
 * ENTIRE prompt for any caller that cannot resolve `omniroute_ccr_retrieve`
 * (every plain OpenAI-compatible client — it is only ever exposed as an MCP tool).
 * Keeping a short, human-readable preamble means the model still sees the start
 * of the user's intent even when the marker itself is unreachable, while the full
 * text remains verbatim-retrievable by hash for MCP-capable callers.
 */ const MARKER_PREAMBLE_CHARS = 200;
/**
 * Build the text that replaces a compressed block: a short preamble of the
 * original content followed by the retrieve marker, never the marker alone.
 */ function buildCcrReplacementText(text, marker) {
    const preamble = text.slice(0, MARKER_PREAMBLE_CHARS).trimEnd();
    return `${preamble}… ${marker}`;
}
/**
 * Replace a large text block with a CCR marker if it shrinks the content.
 * Returns the new text and a flag indicating whether replacement happened.
 */ function maybeCcrReplace(text, minChars, principalId, rampFactor) {
    // Base floor first (no hash cost for tiny blocks that could never compress anyway).
    if (text.length < minChars) {
        return {
            text,
            replaced: false,
            hash: null
        };
    }
    const hash = hashContent(text);
    // H8: retrieved blocks demand an ever-larger size before compressing; at/above the retrieval
    // threshold the effective minimum is Infinity, so the block is excluded (subsumes the former
    // binary shouldSkipCompression cliff).
    if (text.length < effectiveMinChars(minChars, hash, principalId, rampFactor)) {
        return {
            text,
            replaced: false,
            hash: null
        };
    }
    const marker = buildCcrMarker(hash, text.length);
    // #7746: never leave a caller with ONLY the bare marker — keep a short preamble
    // so the original prompt is not silently, totally unreachable for non-MCP callers.
    const replacement = buildCcrReplacementText(text, marker);
    // Only replace if it actually shrinks
    if (replacement.length >= text.length) {
        return {
            text,
            replaced: false,
            hash: null
        };
    }
    const stored = tryStoreBlock(text, principalId, {
        source: "compression"
    });
    if (!stored.stored) return {
        text,
        replaced: false,
        hash: null
    };
    return {
        text: replacement,
        replaced: true,
        hash
    };
}
/**
 * Process all non-system messages: find large text blocks and replace with CCR markers.
 */ function processMessages(messages, minChars, principalId, rampFactor) {
    let replacedCount = 0;
    const result = messages.map((msg)=>{
        if (msg.role === "system") return {
            ...msg
        };
        // H-fix1: skip tool outputs (OpenAI `role:"tool"` and Anthropic user
        // messages whose content is exclusively `tool_result` parts). When
        // OmniRoute is used as a chat-completion PROVIDER, the upstream LLM has no
        // way to call `omniroute_ccr_retrieve` and expand markers — replacing tool
        // outputs with `[CCR retrieve hash=…]` placeholders therefore breaks the agent
        // loop. Preserve tool outputs verbatim so the LLM can keep reasoning.
        if (msg.role === "tool") return {
            ...msg
        };
        if (msg.role === "user" && Array.isArray(msg.content)) {
            const parts = msg.content;
            if (parts.length > 0 && parts.every((p)=>p?.["type"] === "tool_result")) {
                return {
                    ...msg
                };
            }
        }
        if (typeof msg.content === "string") {
            const { text, replaced } = maybeCcrReplace(msg.content, minChars, principalId, rampFactor);
            if (replaced) {
                replacedCount++;
                return {
                    ...msg,
                    content: text
                };
            }
            return {
                ...msg
            };
        }
        if (Array.isArray(msg.content)) {
            let changed = false;
            const newContent = msg.content.map((part)=>{
                if (part?.["type"] !== "text" || typeof part?.["text"] !== "string") return part;
                const { text, replaced } = maybeCcrReplace(part["text"], minChars, principalId, rampFactor);
                if (replaced) {
                    changed = true;
                    replacedCount++;
                    return {
                        ...part,
                        text
                    };
                }
                return part;
            });
            if (changed) {
                return {
                    ...msg,
                    content: newContent
                };
            }
            return {
                ...msg
            };
        }
        return {
            ...msg
        };
    });
    return {
        messages: result,
        replacedCount
    };
}
// ─── schema & validation ──────────────────────────────────────────────────────
const CCR_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: true
    },
    {
        key: "minChars",
        type: "number",
        label: "Minimum block characters",
        description: "Minimum character count for a block to be a CCR candidate.",
        defaultValue: DEFAULT_MIN_CHARS,
        min: 100,
        max: 1_000_000
    },
    {
        key: "retrievalRampFactor",
        type: "number",
        label: "Retrieval ramp factor (H8)",
        description: "How steeply frequently-retrieved blocks resist compression. Each prior retrieval raises " + "the effective minimum block size linearly; 1 disables the ramp (binary skip at the " + "threshold only).",
        defaultValue: RETRIEVAL_RAMP_FACTOR_DEFAULT,
        min: 1,
        max: 100
    }
];
function validateCcrConfig(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    if (config["minChars"] !== undefined) {
        const v = config["minChars"];
        if (typeof v !== "number" || !Number.isFinite(v) || v < 1) {
            errors.push("minChars must be a positive number");
        }
    }
    if (config["retrievalRampFactor"] !== undefined) {
        const v = config["retrievalRampFactor"];
        if (typeof v !== "number" || !Number.isFinite(v) || v < 1) {
            errors.push("retrievalRampFactor must be a number >= 1");
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
const ccrEngine = {
    id: ENGINE_ID,
    name: "CCR (Content-Compression-Retrieve)",
    description: "Replaces large blocks of text with content-addressed retrieve markers " + "`[CCR retrieve hash=<24hex> chars=N]`. The original block is stored and " + "retrievable via the `omniroute_ccr_retrieve` MCP tool (H4). " + "Store is principal-scoped: only the storing principal can retrieve their blocks.",
    icon: "archive",
    targets: [
        "messages"
    ],
    stackable: true,
    // stackPriority 4 = runs just after session-dedup (3), before headroom (15),
    // caveman (20), aggressive (30), ultra (40).
    stackPriority: 4,
    metadata: {
        id: ENGINE_ID,
        name: "CCR (Content-Compression-Retrieve)",
        description: "Reversible compression: large blocks → retrieve marker. " + "Original retrievable via MCP tool (H4). Principal-scoped for tenant isolation.",
        inputScope: "messages",
        targetLatencyMs: 1,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const stepConfig = options?.stepConfig ?? {};
        if (stepConfig["enabled"] === false) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const minChars = typeof stepConfig["minChars"] === "number" ? stepConfig["minChars"] : DEFAULT_MIN_CHARS;
        // H8: retrieval-aware ramp factor — stepConfig wins, else env (default 2). 1 = binary cliff only.
        const rampFactor = typeof stepConfig["retrievalRampFactor"] === "number" ? stepConfig["retrievalRampFactor"] : resolveRetrievalRampFactor();
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const start = performance.now();
        const { messages: newMessages, replacedCount } = processMessages(messages, minChars, options?.principalId, rampFactor);
        if (replacedCount === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        // #8033: teach MCP-capable callers the marker → omniroute_ccr_retrieve contract
        // (once per session; never told to non-MCP callers who cannot reach the tool).
        const messagesWithProtocol = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$protocolInstruction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["injectCcrProtocolInstruction"])(newMessages, body);
        const newBody = {
            ...body,
            messages: messagesWithProtocol
        };
        const durationMs = Math.round(performance.now() - start);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
            "ccr"
        ], [
            `ccr-replaced-${replacedCount}-blocks`
        ], durationMs);
        return {
            body: newBody,
            compressed: true,
            stats
        };
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config ?? {}
        });
    },
    getConfigSchema () {
        return CCR_SCHEMA;
    },
    validateConfig (config) {
        return validateCcrConfig(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/rtk/splitCompositeCommand.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Quote-aware composite-command splitter.
 *
 * Splits a shell command string on top-level `&&`, `||`, or `;` separators
 * (i.e. those NOT inside single quotes, double quotes, backtick subshells,
 * or `$(...)` subshells) and returns the LAST significant segment (trimmed).
 *
 * - No separator found → returns the input unchanged.
 * - Last segment is empty (e.g. trailing `&&`) → falls back to the previous non-empty one.
 * - O(n) char-by-char scan; zero RegExp over the full input (anti-ReDoS).
 */ __turbopack_context__.s([
    "lastCommandSegment",
    ()=>lastCommandSegment
]);
function lastCommandSegment(command) {
    if (!command) return command;
    const segments = [];
    let current = 0; // start index of the current segment
    let depth = 0; // nesting depth for $(...) / (...)
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    const push = (end)=>{
        segments.push(command.slice(current, end));
    };
    for(let i = 0; i < command.length; i++){
        const ch = command[i];
        // ── quote / subshell state tracking ──────────────────────────────────
        if (inSingle) {
            if (ch === "'") inSingle = false;
            continue;
        }
        if (inBacktick) {
            if (ch === "`") inBacktick = false;
            continue;
        }
        if (inDouble) {
            if (ch === '"') inDouble = false;
            // $( inside double-quotes still opens a subshell
            if (ch === "$" && command[i + 1] === "(") {
                depth++;
                i++; // skip the '('
            }
            continue;
        }
        if (depth > 0) {
            if (ch === "(") depth++;
            else if (ch === ")") depth--;
            continue;
        }
        // ── open new quote / subshell context ────────────────────────────────
        if (ch === "'") {
            inSingle = true;
            continue;
        }
        if (ch === '"') {
            inDouble = true;
            continue;
        }
        if (ch === "`") {
            inBacktick = true;
            continue;
        }
        if (ch === "$" && command[i + 1] === "(") {
            depth++;
            i++; // skip the '('
            continue;
        }
        if (ch === "(") {
            depth++;
            continue;
        }
        // ── top-level separator detection ─────────────────────────────────────
        if (ch === "&" && command[i + 1] === "&") {
            push(i);
            i += 1; // skip second '&'
            current = i + 1;
            continue;
        }
        if (ch === "|" && command[i + 1] === "|") {
            push(i);
            i += 1; // skip second '|'
            current = i + 1;
            continue;
        }
        if (ch === ";") {
            push(i);
            current = i + 1;
            continue;
        }
    }
    // push the remainder
    push(command.length);
    if (segments.length === 1) {
        // no top-level separator found → return unchanged
        return command;
    }
    // find the last non-empty (after trim) segment
    for(let i = segments.length - 1; i >= 0; i--){
        const trimmed = segments[i].trim();
        if (trimmed) return trimmed;
    }
    return command;
}
}),
"[project]/open-sse/services/compression/engines/rtk/commandDetector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCommandFromText",
    ()=>detectCommandFromText,
    "detectCommandOutput",
    ()=>detectCommandOutput,
    "detectCommandType",
    ()=>detectCommandType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$splitCompositeCommand$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/splitCompositeCommand.ts [app-route] (ecmascript)");
;
const COMMAND_PREFIXES = [
    "git",
    "make",
    "gradle",
    "gradlew",
    "dotnet",
    "terraform",
    "tofu",
    "opentofu",
    "systemctl",
    "npm",
    "pnpm",
    "yarn",
    "vitest",
    "jest",
    "pytest",
    "python",
    "go",
    "cargo",
    "tsc",
    "eslint",
    "webpack",
    "vite",
    "biome",
    "prettier",
    "turbo",
    "nx",
    "playwright",
    "ruff",
    "mypy",
    "pip",
    "uv",
    "poetry",
    "golangci-lint",
    "bundle",
    "rubocop",
    "kubectl",
    "composer",
    "gh",
    "docker",
    "aws",
    "gcloud",
    "ssh",
    "rsync",
    "curl",
    "wget",
    "ls",
    "find",
    "grep",
    "rg",
    "ag",
    "ps",
    "df",
    "du"
];
const COMMAND_PREFIX_PATTERN = new RegExp(`^(?:${COMMAND_PREFIXES.join("|")})\\b`);
const DETECTORS = [
    {
        type: "git-status",
        category: "git",
        commandPatterns: [
            /^git\s+status\b/i
        ],
        contentPatterns: [
            /^On branch /m,
            /^Changes (?:not staged|to be committed)/m,
            /^Untracked files:/m
        ]
    },
    {
        type: "git-branch",
        category: "git",
        commandPatterns: [
            /^git\s+branch\b/i,
            /^git\s+checkout\b/i,
            /^git\s+switch\b/i
        ],
        contentPatterns: [
            /^\*\s+\S+/m,
            /Switched to (?:a new )?branch/i,
            /Already on ['"][^'"]+['"]/i
        ]
    },
    {
        type: "git-diff",
        category: "git",
        commandPatterns: [
            /^git\s+diff\b/i,
            /^git\s+show\b/i
        ],
        contentPatterns: [
            /^diff --git /m,
            /^@@\s+-\d+,\d+\s+\+\d+,\d+\s+@@/m
        ]
    },
    {
        type: "git-log",
        category: "git",
        commandPatterns: [
            /^git\s+log\b/i
        ],
        contentPatterns: [
            /^commit [0-9a-f]{7,40}/m,
            /^Author: /m
        ]
    },
    {
        type: "make",
        category: "build",
        commandPatterns: [
            /^make\b/i
        ],
        contentPatterns: [
            /^make\[\d+\]: (?:Entering|Leaving) directory/m,
            /make: \*\*\* /
        ]
    },
    {
        type: "gradle",
        category: "build",
        commandPatterns: [
            /^(?:gradle|gradlew|\.\/gradlew)\b/i
        ],
        contentPatterns: [
            /^> Task :/m,
            /^BUILD (?:SUCCESSFUL|FAILED)\b/m
        ]
    },
    {
        type: "dotnet",
        category: "build",
        commandPatterns: [
            /^dotnet\s+(?:build|test|run|restore|publish|pack|msbuild)\b/i,
            /^dotnet\b/i
        ],
        contentPatterns: [
            /^Build (?:succeeded|FAILED)\b/m,
            /\b(?:error|warning) CS\d+\b/m
        ]
    },
    {
        type: "terraform-plan",
        category: "infra",
        commandPatterns: [
            /^terraform\s+plan\b/i
        ],
        contentPatterns: [
            /Terraform will perform the following actions:/,
            /Plan: \d+ to add/i
        ]
    },
    {
        type: "tofu-plan",
        category: "infra",
        commandPatterns: [
            /^(?:tofu|opentofu)\s+plan\b/i
        ],
        contentPatterns: [
            /OpenTofu will perform the following actions:/,
            /Plan: \d+ to add/i
        ]
    },
    {
        type: "systemctl-status",
        category: "infra",
        commandPatterns: [
            /^systemctl\s+status\b/i
        ],
        contentPatterns: [
            /^\s*Loaded:\s+/m,
            /^\s*Active:\s+/m,
            /^●\s+\S+\.service/m
        ]
    },
    {
        type: "test-vitest",
        category: "test",
        commandPatterns: [
            /^vitest\b/i,
            /^npm\s+(?:run\s+)?test:vitest\b/i
        ],
        contentPatterns: [
            /\bvitest\b/i,
            /^ ✓ /m,
            /^ ❯ /m,
            /Test Files\s+\d+\s+(?:passed|failed)/i
        ]
    },
    {
        type: "test-jest",
        category: "test",
        commandPatterns: [
            /^jest\b/i,
            /^npm\s+(?:run\s+)?test\b/i
        ],
        contentPatterns: [
            /Test Suites:\s+\d+/i,
            /Tests:\s+\d+/i,
            /^PASS\s+/m,
            /^FAIL\s+/m
        ]
    },
    {
        type: "test-pytest",
        category: "test",
        commandPatterns: [
            /^pytest\b/i,
            /^python\s+-m\s+pytest\b/i
        ],
        contentPatterns: [
            /=+\s+(?:\d+\s+)?(?:passed|failed|errors?)/i,
            /^E\s+/m,
            /^FAILED /m
        ]
    },
    {
        type: "test-cargo",
        category: "test",
        commandPatterns: [
            /^cargo\s+test\b/i,
            /^cargo\s+nextest\b/i
        ],
        contentPatterns: [
            /^running \d+ tests?/m,
            /^test\s+[\w:.-]+\s+\.\.\.\s+(?:ok|FAILED|ignored)/m,
            /test result:\s+(?:ok|FAILED)/i
        ]
    },
    {
        type: "test-go",
        category: "test",
        commandPatterns: [
            /^go\s+test\b/i
        ],
        contentPatterns: [
            /^(?:ok|FAIL)\s+[\w./-]+\s+[\d.]+s/m,
            /^--- FAIL: /m,
            /^panic: /m
        ]
    },
    {
        type: "build-typescript",
        category: "build",
        commandPatterns: [
            /^tsc\b/i,
            /^npm\s+run\s+typecheck\b/i
        ],
        contentPatterns: [
            /TS\d{4}:/,
            /error TS\d{4}/i
        ]
    },
    {
        type: "build-eslint",
        category: "build",
        commandPatterns: [
            /^eslint\b/i,
            /^npm\s+run\s+lint\b/i
        ],
        contentPatterns: [
            /\s+\d+:\d+\s+(?:error|warning)\s+/,
            /✖\s+\d+\s+problems?/
        ]
    },
    {
        type: "build-webpack",
        category: "build",
        commandPatterns: [
            /^webpack\b/i,
            /^npx\s+webpack\b/i,
            /^npm\s+run\s+build:webpack\b/i
        ],
        contentPatterns: [
            /webpack\s+\d/i,
            /compiled (?:successfully|with \d+ errors?)/i,
            /asset .+\.js/i
        ]
    },
    {
        type: "build-vite",
        category: "build",
        commandPatterns: [
            /^vite\s+build\b/i,
            /^npm\s+run\s+build\b/i,
            /^pnpm\s+build\b/i
        ],
        contentPatterns: [
            /vite v[\d.]+/i,
            /✓ built in/i,
            /transforming \(\d+\)/i
        ]
    },
    {
        type: "biome",
        category: "build",
        commandPatterns: [
            /^biome\b/i,
            /^npx\s+biome\b/i
        ],
        contentPatterns: [
            /lint\/[A-Za-z0-9/.-]+/,
            /Checked \d+ files? in/i
        ]
    },
    {
        type: "prettier",
        category: "build",
        commandPatterns: [
            /^prettier\b/i,
            /^npx\s+prettier\b/i
        ],
        contentPatterns: [
            /^Checking formatting\.\.\./m,
            /Code style issues found/i
        ]
    },
    {
        type: "turbo",
        category: "build",
        commandPatterns: [
            /^turbo\b/i,
            /^npx\s+turbo\b/i
        ],
        contentPatterns: [
            /^• Packages in scope:/m,
            /^Tasks:\s+\d+\s+successful/m
        ]
    },
    {
        type: "nx",
        category: "build",
        commandPatterns: [
            /^nx\b/i,
            /^npx\s+nx\b/i
        ],
        contentPatterns: [
            /^NX\s+/m,
            /^> nx run /m
        ]
    },
    {
        type: "playwright",
        category: "test",
        commandPatterns: [
            /^playwright\s+test\b/i,
            /^npx\s+playwright\s+test\b/i
        ],
        contentPatterns: [
            /Running \d+ tests? using \d+ workers?/i,
            /^\s+\d+ failed/m
        ]
    },
    {
        type: "npm-install",
        category: "package",
        commandPatterns: [
            /^(?:npm|pnpm|yarn)\s+(?:install|add|update)\b/i
        ],
        contentPatterns: [
            /added \d+ packages/i,
            /packages are looking for funding/i,
            /audited \d+ packages/i
        ]
    },
    {
        type: "npm-audit",
        category: "package",
        commandPatterns: [
            /^(?:npm|pnpm|yarn)\s+audit\b/i
        ],
        contentPatterns: [
            /found \d+ vulnerabilities/i,
            /\b(?:low|moderate|high|critical)\b/i
        ]
    },
    {
        type: "ruff",
        category: "build",
        commandPatterns: [
            /^ruff\b/i,
            /^uv\s+run\s+ruff\b/i
        ],
        contentPatterns: [
            /^[\w./-]+\.py:\d+:\d+:\s+[A-Z]\d+/m,
            /Found \d+ errors?\./i
        ]
    },
    {
        type: "mypy",
        category: "build",
        commandPatterns: [
            /^mypy\b/i,
            /^python\s+-m\s+mypy\b/i
        ],
        contentPatterns: [
            /^[\w./-]+\.py:\d+:\s+error:/m,
            /Found \d+ errors? in \d+ files?/i
        ]
    },
    {
        type: "pip",
        category: "package",
        commandPatterns: [
            /^pip\s+(?:install|download|uninstall)\b/i,
            /^python\s+-m\s+pip\b/i
        ],
        contentPatterns: [
            /^Collecting /m,
            /^Successfully installed /m
        ]
    },
    {
        type: "uv-sync",
        category: "package",
        commandPatterns: [
            /^uv\s+sync\b/i,
            /^uv\s+pip\s+install\b/i
        ],
        contentPatterns: [
            /^Resolved \d+ packages?/m,
            /^Installed \d+ packages?/m
        ]
    },
    {
        type: "poetry-install",
        category: "package",
        commandPatterns: [
            /^poetry\s+install\b/i
        ],
        contentPatterns: [
            /^Installing dependencies from lock file/m,
            /^Package operations:/m
        ]
    },
    {
        type: "golangci-lint",
        category: "build",
        commandPatterns: [
            /^golangci-lint\b/i
        ],
        contentPatterns: [
            /^[\w./-]+\.go:\d+:\d+:/m,
            /^\d+ issues?:/m
        ]
    },
    {
        type: "bundle-install",
        category: "package",
        commandPatterns: [
            /^bundle\s+install\b/i
        ],
        contentPatterns: [
            /^Fetching gem metadata from /m,
            /^Bundle complete!/m
        ]
    },
    {
        type: "rubocop",
        category: "build",
        commandPatterns: [
            /^rubocop\b/i,
            /^bundle\s+exec\s+rubocop\b/i
        ],
        contentPatterns: [
            /^Inspecting \d+ files/m,
            /^[\w./-]+\.rb:\d+:\d+:\s+[A-Z]:/m
        ]
    },
    {
        type: "docker-ps",
        category: "docker",
        commandPatterns: [
            /^docker\s+ps\b/i
        ],
        contentPatterns: [
            /^CONTAINER ID\s+IMAGE\s+COMMAND/m
        ]
    },
    {
        type: "docker-logs",
        category: "docker",
        commandPatterns: [
            /^docker\s+logs\b/i,
            /^docker\s+compose\s+logs\b/i
        ],
        contentPatterns: [
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/m,
            /\b(?:ERROR|WARN|INFO)\b/,
            /^Attaching to /m
        ]
    },
    {
        type: "aws",
        category: "cloud",
        commandPatterns: [
            /^aws\b/i
        ],
        contentPatterns: [
            /An error occurred \([A-Za-z0-9]+\) when calling/,
            /^(?:upload|download): /m
        ]
    },
    {
        type: "gcloud",
        category: "cloud",
        commandPatterns: [
            /^gcloud\b/i
        ],
        contentPatterns: [
            /^ERROR: \(gcloud\./m,
            /^Updated property \[/m
        ]
    },
    {
        type: "ssh",
        category: "cloud",
        commandPatterns: [
            /^ssh\b/i
        ],
        contentPatterns: [
            /Permission denied \(/,
            /Host key verification failed/,
            /Connection timed out/
        ]
    },
    {
        type: "rsync",
        category: "cloud",
        commandPatterns: [
            /^rsync\b/i
        ],
        contentPatterns: [
            /^sending incremental file list/m,
            /^rsync error:/m
        ]
    },
    {
        type: "curl",
        category: "cloud",
        commandPatterns: [
            /^curl\b/i
        ],
        contentPatterns: [
            /curl: \(\d+\)/,
            /^HTTP\/\d(?:\.\d)? \d{3}/m
        ]
    },
    {
        type: "wget",
        category: "cloud",
        commandPatterns: [
            /^wget\b/i
        ],
        contentPatterns: [
            /^--\d{4}-\d{2}-\d{2}/m,
            /^ERROR \d{3}:/m
        ]
    },
    {
        type: "json-output",
        category: "generic",
        commandPatterns: [
            /^jq\b/i,
            /^cat\s+.*\.json\b/i
        ],
        contentPatterns: [
            /^\s*[\[{][\s\S]*[\]}]\s*$/
        ]
    },
    {
        type: "shell-ls",
        category: "shell",
        commandPatterns: [
            /^ls(?:\s+-[A-Za-z]+)?\b/i
        ],
        contentPatterns: [
            /^total \d+/m,
            /^\S+\s+\S+\s+\d+\s+\w+\s+\d{1,2}\s+/m
        ]
    },
    {
        type: "shell-find",
        category: "shell",
        commandPatterns: [
            /^find\b/i
        ],
        contentPatterns: [
            /^(?:\.{1,2}|\/|[\w.-]+\/).+/m
        ]
    },
    {
        type: "shell-grep",
        category: "shell",
        commandPatterns: [
            /^(?:grep|rg|ag)\b/i
        ],
        contentPatterns: [
            /^[\w./-]+\.(?:ts|tsx|js|jsx|py|go|rs|java|rb|md|json|ya?ml|txt):\d*:/m,
            /^[\w./-]+\/[\w./-]+:\d*:/m
        ]
    },
    {
        type: "shell-ps",
        category: "shell",
        commandPatterns: [
            /^ps\b/i
        ],
        contentPatterns: [
            /^(?:USER\s+PID|\s*PID\s+)/m
        ]
    },
    {
        type: "shell-df",
        category: "shell",
        commandPatterns: [
            /^df\b/i
        ],
        contentPatterns: [
            /^Filesystem\s+.*Use%/m
        ]
    },
    {
        type: "shell-du",
        category: "shell",
        commandPatterns: [
            /^du\b/i
        ],
        contentPatterns: [
            /^\d+(?:\.\d+)?[KMGTP]?\s+\S+/m
        ]
    },
    {
        type: "error-stacktrace",
        category: "generic",
        commandPatterns: [],
        contentPatterns: [
            /Traceback \(most recent call last\):/,
            /^\s+at\s+\S+\s+\(.+:\d+:\d+\)/m,
            /^panic: /m,
            /^thread '[^']+' panicked at/m
        ]
    },
    {
        type: "generic-error",
        category: "generic",
        commandPatterns: [],
        contentPatterns: [
            /Error:/,
            /Exception:/,
            /Traceback \(most recent call last\):/
        ]
    }
];
function detectCommandFromText(text) {
    const firstLines = text.split(/\r?\n/).slice(0, 4);
    for (const line of firstLines){
        const trimmed = line.trim().replace(/^\$\s+/, "");
        if (!trimmed) continue;
        if (COMMAND_PREFIX_PATTERN.test(trimmed)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$splitCompositeCommand$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lastCommandSegment"])(trimmed);
        }
    }
    return null;
}
function detectCommandType(text, command) {
    const detectedCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$splitCompositeCommand$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lastCommandSegment"])(command?.trim() || detectCommandFromText(text) || "") || null;
    let best = null;
    for (const detector of DETECTORS){
        const matchedPatterns = [];
        const commandMatched = Boolean(detectedCommand) && detector.commandPatterns.some((pattern)=>{
            const matched = pattern.test(detectedCommand ?? "");
            if (matched) matchedPatterns.push(pattern.source);
            return matched;
        });
        const contentMatches = detector.contentPatterns.filter((pattern)=>{
            const matched = pattern.test(text);
            if (matched) matchedPatterns.push(pattern.source);
            return matched;
        }).length;
        if (!commandMatched && contentMatches === 0) continue;
        const confidence = Math.min(1, (commandMatched ? 0.55 : 0) + contentMatches * 0.25);
        if (!best || confidence > best.confidence) {
            best = {
                type: detector.type,
                command: detectedCommand,
                confidence,
                category: detector.category,
                matchedPatterns
            };
        }
    }
    return best ?? {
        type: "unknown",
        command: detectedCommand,
        confidence: detectedCommand ? 0.35 : 0.1,
        category: "generic",
        matchedPatterns: []
    };
}
const detectCommandOutput = detectCommandType;
}),
"[project]/open-sse/services/compression/engines/rtk/configSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RTK_SCHEMA",
    ()=>RTK_SCHEMA,
    "validateRtkEngineConfig",
    ()=>validateRtkEngineConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
;
const RTK_SCHEMA = [
    {
        key: "intensity",
        type: "select",
        label: "Intensity",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].intensity,
        options: [
            {
                value: "minimal",
                label: "minimal"
            },
            {
                value: "standard",
                label: "standard"
            },
            {
                value: "aggressive",
                label: "aggressive"
            }
        ]
    },
    {
        key: "applyToToolResults",
        type: "boolean",
        label: "Apply to tool results",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].applyToToolResults
    },
    {
        key: "applyToAssistantMessages",
        type: "boolean",
        label: "Apply to assistant messages",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].applyToAssistantMessages
    },
    {
        key: "applyToCodeBlocks",
        type: "boolean",
        label: "Apply to code blocks",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].applyToCodeBlocks
    },
    {
        key: "maxLinesPerResult",
        type: "number",
        label: "Max lines per result",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].maxLinesPerResult,
        min: 0,
        max: 5000
    },
    {
        key: "maxCharsPerResult",
        type: "number",
        label: "Max chars per result",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].maxCharsPerResult,
        min: 0,
        max: 500000
    },
    {
        key: "deduplicateThreshold",
        type: "number",
        label: "Deduplicate threshold",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].deduplicateThreshold,
        min: 2,
        max: 100
    },
    {
        key: "rawOutputRetention",
        type: "select",
        label: "Raw output retention",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].rawOutputRetention,
        options: [
            {
                value: "never",
                label: "never"
            },
            {
                value: "failures",
                label: "failures"
            },
            {
                value: "always",
                label: "always"
            }
        ]
    },
    {
        key: "enableRenderers",
        type: "boolean",
        label: "Semantic renderers",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].enableRenderers
    }
];
function validateRtkEngineConfig(config) {
    const errors = [];
    if (config.intensity !== undefined && config.intensity !== "minimal" && config.intensity !== "standard" && config.intensity !== "aggressive") {
        errors.push("intensity must be minimal, standard, or aggressive");
    }
    for (const key of [
        "enabled",
        "applyToToolResults",
        "applyToAssistantMessages",
        "applyToCodeBlocks"
    ]){
        if (config[key] !== undefined && typeof config[key] !== "boolean") {
            errors.push(`${key} must be a boolean`);
        }
    }
    for (const key of [
        "maxLinesPerResult",
        "maxCharsPerResult",
        "deduplicateThreshold"
    ]){
        if (config[key] !== undefined && (typeof config[key] !== "number" || config[key] < 0)) {
            errors.push(`${key} must be a non-negative number`);
        }
    }
    if (config.enabledFilters !== undefined && !Array.isArray(config.enabledFilters)) {
        errors.push("enabledFilters must be an array");
    }
    if (config.disabledFilters !== undefined && !Array.isArray(config.disabledFilters)) {
        errors.push("disabledFilters must be an array");
    }
    if (config.rawOutputRetention !== undefined && config.rawOutputRetention !== "never" && config.rawOutputRetention !== "failures" && config.rawOutputRetention !== "always") {
        errors.push("rawOutputRetention must be never, failures, or always");
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/deduplicator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deduplicateRepeatedLines",
    ()=>deduplicateRepeatedLines
]);
function deduplicateRepeatedLines(text, options = {}) {
    const threshold = Math.max(2, Math.floor(options.threshold ?? 3));
    const lines = text.split(/\r?\n/);
    const output = [];
    let collapsed = 0;
    for(let index = 0; index < lines.length; index++){
        const line = lines[index];
        let runLength = 1;
        while(index + runLength < lines.length && lines[index + runLength] === line){
            runLength++;
        }
        if (line.trim() && runLength >= threshold) {
            output.push(line);
            output.push(`[line repeated ${runLength - 1}x]`);
            output.push(`[rtk:dropped ${runLength - 1} repeated lines]`);
            collapsed += runLength - 1;
            index += runLength - 1;
            continue;
        }
        output.push(line);
    }
    return {
        text: output.join("\n"),
        collapsed
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/grouper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * RTK Grouping strategy (R5).
 *
 * Collapses consecutive "near-equivalent" lines — lines that normalise to the
 * same canonical form after stripping volatile bits (digits, hex ids,
 * timestamps) — into a single representative line plus a count marker:
 *
 *   <representative line> [rtk:grouped ×N]
 *
 * Only consecutive runs of length ≥ threshold are collapsed (default: 3).
 * Non-similar lines are passed through unchanged.
 */ __turbopack_context__.s([
    "groupSimilarLines",
    ()=>groupSimilarLines,
    "normalizeLine",
    ()=>normalizeLine
]);
function normalizeLine(line) {
    let s = line;
    // ISO timestamps like 2024-01-15T10:30:00.123Z or 2024-01-15 10:30:00
    s = s.replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?/g, "<N>");
    // Bracketed date+time like [2024-01-01 10:00:00]
    s = s.replace(/\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\]/g, "[<N>]");
    // Hex ids: 6-40 hex chars (not preceded/followed by word char to avoid over-matching)
    s = s.replace(/\b[0-9a-fA-F]{6,40}\b/g, "<N>");
    // Semantic version tokens like v1.2.3 or 1.2.3
    s = s.replace(/\bv?\d+\.\d+\.\d+(?:\.\d+)*\b/g, "<N>");
    // Standalone integers (whole word)
    s = s.replace(/\b\d+\b/g, "<N>");
    // Collapse repeated whitespace
    s = s.replace(/\s+/g, " ");
    return s.trim();
}
function groupSimilarLines(text, options = {}) {
    const threshold = Math.max(2, Math.floor(options.threshold ?? 3));
    const lines = text.split(/\r?\n/);
    const output = [];
    let grouped = 0;
    let index = 0;
    while(index < lines.length){
        const line = lines[index];
        const normalised = normalizeLine(line);
        // Count consecutive lines that normalise to the same form
        let runLength = 1;
        while(index + runLength < lines.length && normalizeLine(lines[index + runLength]) === normalised){
            runLength++;
        }
        if (runLength >= threshold) {
            // Keep the first (representative) line + the count marker
            output.push(`${line} [rtk:grouped ×${runLength}]`);
            grouped += runLength - 1;
            index += runLength;
        } else {
            output.push(line);
            index++;
        }
    }
    return {
        text: output.join("\n"),
        grouped
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/filterSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isReDoSProne",
    ()=>isReDoSProne,
    "rtkFilterSchema",
    ()=>rtkFilterSchema,
    "validateRtkFilter",
    ()=>validateRtkFilter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const rtkFilterCategorySchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
    "git",
    "test",
    "build",
    "shell",
    "docker",
    "package",
    "infra",
    "cloud",
    "generic"
]);
const rtkReplaceRuleSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    pattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    replacement: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
}).strict();
const rtkMatchOutputRuleSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    pattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    message: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    unless: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional()
}).strict();
const rtkInlineTestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    input: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    expected: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    command: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
}).strict();
const rtkFilterMatchSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    commands: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)).default([]),
    patterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)).default([]),
    outputTypes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)).default([])
}).strict();
const rtkFilterRulesSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    stripAnsi: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false),
    replace: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(rtkReplaceRuleSchema).default([]),
    matchOutput: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(rtkMatchOutputRuleSchema).default([]),
    includePatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    dropPatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    collapsePatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    deduplicate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false),
    truncateLineAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(0),
    maxLines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(0),
    headLines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(20),
    tailLines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(20),
    onEmpty: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().default(""),
    filterStderr: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false)
}).strict();
const rtkFilterPreserveSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    errorPatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    summaryPatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([])
}).strict();
const rtkFilterPackSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    label: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().default(""),
    category: rtkFilterCategorySchema,
    priority: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(100).default(50),
    match: rtkFilterMatchSchema,
    rules: rtkFilterRulesSchema.default({}),
    preserve: rtkFilterPreserveSchema.default({}),
    tests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(rtkInlineTestSchema).default([])
}).strict();
const legacyRtkFilterSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().default(""),
    commandTypes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)).min(1),
    category: rtkFilterCategorySchema,
    priority: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(100).default(50),
    stripPatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    keepPatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    priorityPatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    collapsePatterns: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([]),
    stripAnsi: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false),
    replace: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(rtkReplaceRuleSchema).default([]),
    matchOutput: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(rtkMatchOutputRuleSchema).default([]),
    truncateLineAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(0),
    onEmpty: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().default(""),
    filterStderr: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false),
    maxLines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(0),
    preserveHead: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(20),
    preserveTail: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(20),
    tests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(rtkInlineTestSchema).default([])
}).strict();
const rtkFilterSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
    rtkFilterPackSchema,
    legacyRtkFilterSchema
]);
function isCanonicalFilter(value) {
    return "label" in value && "match" in value && "rules" in value;
}
function isReDoSProne(pattern) {
    return /\([^()]*(?:[+*]|\{\d+,\})[^()]*\)\s*(?:[+*]|\{\d+,\})/.test(pattern);
}
function dropReDoSProne(patterns) {
    return patterns.filter((p)=>!isReDoSProne(p));
}
function validateRtkFilter(value) {
    const parsed = rtkFilterSchema.parse(value);
    if (!isCanonicalFilter(parsed)) {
        const collapse = dropReDoSProne(parsed.collapsePatterns);
        return {
            ...parsed,
            stripPatterns: dropReDoSProne(parsed.stripPatterns),
            keepPatterns: dropReDoSProne(parsed.keepPatterns),
            priorityPatterns: dropReDoSProne(parsed.priorityPatterns),
            collapsePatterns: collapse,
            replace: parsed.replace.filter((r)=>!isReDoSProne(r.pattern)),
            matchOutput: parsed.matchOutput.filter((r)=>!isReDoSProne(r.pattern)),
            commandPatterns: [],
            matchPatterns: [],
            deduplicate: collapse.length > 0
        };
    }
    const preservePatterns = [
        ...parsed.preserve.errorPatterns,
        ...parsed.preserve.summaryPatterns
    ];
    return {
        id: parsed.id,
        name: parsed.label,
        description: parsed.description,
        commandTypes: parsed.match.outputTypes,
        commandPatterns: dropReDoSProne(parsed.match.commands),
        matchPatterns: dropReDoSProne(parsed.match.patterns),
        category: parsed.category,
        priority: parsed.priority,
        stripPatterns: dropReDoSProne(parsed.rules.dropPatterns),
        keepPatterns: dropReDoSProne(parsed.rules.includePatterns),
        priorityPatterns: dropReDoSProne(preservePatterns),
        collapsePatterns: dropReDoSProne(parsed.rules.collapsePatterns),
        stripAnsi: parsed.rules.stripAnsi,
        replace: parsed.rules.replace.filter((r)=>!isReDoSProne(r.pattern)),
        matchOutput: parsed.rules.matchOutput.filter((r)=>!isReDoSProne(r.pattern)),
        truncateLineAt: parsed.rules.truncateLineAt,
        onEmpty: parsed.rules.onEmpty,
        filterStderr: parsed.rules.filterStderr,
        deduplicate: parsed.rules.deduplicate,
        maxLines: parsed.rules.maxLines,
        preserveHead: parsed.rules.headLines,
        preserveTail: parsed.rules.tailLines,
        tests: parsed.tests
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/engines/rtk/smartTruncate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "smartTruncate",
    ()=>smartTruncate
]);
function smartTruncate(text, options = {}) {
    const maxChars = Math.max(0, Math.floor(options.maxChars ?? 0));
    const maxLines = Math.max(0, Math.floor(options.maxLines ?? 0));
    const lines = text.split(/\r?\n/);
    const overLineLimit = maxLines > 0 && lines.length > maxLines;
    const overCharLimit = maxChars > 0 && text.length > maxChars;
    if (!overLineLimit && !overCharLimit) {
        return {
            text,
            truncated: false,
            droppedLines: 0
        };
    }
    const preserveHead = Math.max(0, Math.floor(options.preserveHead ?? 20));
    const preserveTail = Math.max(0, Math.floor(options.preserveTail ?? 20));
    const priorityPatterns = options.priorityPatterns ?? [];
    const priorityLines = priorityPatterns.length ? lines.filter((line)=>priorityPatterns.some((pattern)=>pattern.test(line))) : [];
    const head = lines.slice(0, preserveHead);
    const tail = preserveTail > 0 ? lines.slice(-preserveTail) : [];
    const selected = [
        ...head
    ];
    for (const line of priorityLines){
        if (!selected.includes(line)) selected.push(line);
    }
    const tailStart = lines.length - tail.length;
    tail.forEach((line, offset)=>{
        const originalIndex = tailStart + offset;
        if (originalIndex >= preserveHead && !selected.includes(line)) selected.push(line);
    });
    const droppedLines = Math.max(0, lines.length - selected.length);
    let result = [
        ...selected.slice(0, head.length),
        `[rtk:truncated ${droppedLines} lines]`,
        ...selected.slice(head.length)
    ].join("\n");
    if (maxChars > 0 && result.length > maxChars) {
        const marker = "\n[rtk:truncated by chars]\n";
        const budget = Math.max(0, maxChars - marker.length);
        if (budget === 0) {
            result = marker.slice(0, maxChars);
            return {
                text: result,
                truncated: true,
                droppedLines
            };
        }
        const headChars = Math.ceil(budget * 0.55);
        const tailChars = Math.max(0, budget - headChars);
        const tailText = tailChars > 0 ? result.slice(-tailChars) : "";
        result = `${result.slice(0, headChars)}${marker}${tailText}`;
        if (result.length > maxChars) result = result.slice(0, maxChars);
    }
    return {
        text: result,
        truncated: true,
        droppedLines
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/lineFilter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyLineFilter",
    ()=>applyLineFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$smartTruncate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/smartTruncate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$deduplicator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/deduplicator.ts [app-route] (ecmascript)");
;
;
// ──────────────── RegExp cache ────────────────
//
// Patterns are static (loaded from filter JSON files on boot) but were being
// compiled via `new RegExp(...)` on every call to applyLineFilter().  For a
// busy proxy this means thousands of redundant RegExp instantiations per
// second.  Cache them here once.
const regexCache = new Map();
function cachedRegExp(pattern, flags) {
    const key = `${pattern}::${flags}`;
    const cached = regexCache.get(key);
    if (cached) return cached;
    try {
        const re = new RegExp(pattern, flags);
        regexCache.set(key, re);
        return re;
    } catch  {
        return null;
    }
}
function compilePatterns(patterns) {
    return patterns.flatMap((pattern)=>{
        const re = cachedRegExp(pattern, "i");
        return re ? [
            re
        ] : [];
    });
}
function compileGlobalPattern(pattern) {
    return cachedRegExp(pattern, "g");
}
function compileBlobPattern(pattern) {
    return cachedRegExp(pattern, "im");
}
function stripAnsi(text) {
    return text.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}
function normalizeStderrPrefix(line) {
    return line.replace(/^\s*(?:stderr|err)\s*(?:\||:)\s*/i, "");
}
function applyRtkTomlLineLimits(lines, filter, appliedRules) {
    const head = filter.rtkTomlHeadLines;
    const tail = filter.rtkTomlTailLines;
    const total = lines.length;
    if (head !== undefined && tail !== undefined) {
        if (total > head + tail) {
            lines = [
                ...lines.slice(0, head),
                `... (${total - head - tail} lines omitted)`,
                ...tail > 0 ? lines.slice(-tail) : []
            ];
            appliedRules.push(`${filter.id}:rtk-head-tail`);
        }
    } else if (head !== undefined && total > head) {
        lines = [
            ...lines.slice(0, head),
            `... (${total - head} lines omitted)`
        ];
        appliedRules.push(`${filter.id}:rtk-head`);
    } else if (tail !== undefined && total > tail) {
        lines = [
            `... (${total - tail} lines omitted)`,
            ...tail > 0 ? lines.slice(-tail) : []
        ];
        appliedRules.push(`${filter.id}:rtk-tail`);
    }
    const maxLines = filter.rtkTomlMaxLines;
    if (maxLines !== undefined && lines.length > maxLines) {
        const dropped = lines.length - maxLines;
        lines = [
            ...lines.slice(0, maxLines),
            `... (${dropped} lines truncated)`
        ];
        appliedRules.push(`${filter.id}:rtk-max-lines`);
    }
    return lines;
}
function truncateUnicodeSafe(line, maxChars) {
    if (maxChars <= 0) return line;
    const chars = Array.from(line);
    if (chars.length <= maxChars) return line;
    if (maxChars <= 3) return chars.slice(0, maxChars).join("");
    return `${chars.slice(0, maxChars - 3).join("")}...`;
}
function applyLineFilter(text, filter) {
    const stripPatterns = compilePatterns(filter.stripPatterns);
    const keepPatterns = compilePatterns(filter.keepPatterns);
    const collapsePatterns = compilePatterns(filter.collapsePatterns);
    const priorityPatterns = compilePatterns(filter.priorityPatterns);
    const appliedRules = [];
    let lines = text.split(/\r?\n/);
    if (filter.sourceFormat === "rtk-toml-v1" && lines.at(-1) === "") lines.pop();
    const originalLineCount = lines.length;
    if (filter.stripAnsi) {
        const stripped = lines.map(stripAnsi);
        if (stripped.join("\n") !== lines.join("\n")) {
            appliedRules.push(`${filter.id}:strip-ansi`);
        }
        lines = stripped;
    }
    if (filter.filterStderr) {
        const normalized = lines.map(normalizeStderrPrefix);
        if (normalized.join("\n") !== lines.join("\n")) {
            appliedRules.push(`${filter.id}:filter-stderr`);
        }
        lines = normalized;
    }
    for (const rule of filter.replace){
        const pattern = compileGlobalPattern(rule.pattern);
        if (!pattern) continue;
        const replaced = lines.map((line)=>line.replace(pattern, rule.replacement));
        if (replaced.join("\n") !== lines.join("\n")) {
            appliedRules.push(`${filter.id}:replace`);
        }
        lines = replaced;
    }
    if (filter.matchOutput.length > 0) {
        const blob = lines.join("\n");
        for (const rule of filter.matchOutput){
            const pattern = compileBlobPattern(rule.pattern);
            if (!pattern?.test(blob)) continue;
            const unless = rule.unless ? compileBlobPattern(rule.unless) : null;
            if (unless?.test(blob)) continue;
            appliedRules.push(`${filter.id}:match-output`);
            return {
                text: rule.message,
                strippedLines: Math.max(0, originalLineCount - 1),
                keptByRule: false,
                appliedRules
            };
        }
    }
    if (stripPatterns.length > 0) {
        lines = lines.filter((line)=>!stripPatterns.some((pattern)=>pattern.test(line)));
        if (lines.length !== originalLineCount) appliedRules.push(`${filter.id}:strip`);
    }
    if (keepPatterns.length > 0) {
        const kept = lines.filter((line)=>keepPatterns.some((pattern)=>pattern.test(line)));
        if (kept.length > 0) {
            lines = kept;
            appliedRules.push(`${filter.id}:keep`);
        }
    }
    if (collapsePatterns.length > 0) {
        const seen = new Set();
        lines = lines.filter((line)=>{
            if (!collapsePatterns.some((pattern)=>pattern.test(line))) return true;
            const key = line.trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        appliedRules.push(`${filter.id}:collapse`);
    }
    if (filter.truncateLineAt > 0) {
        const truncatedLines = lines.map((line)=>truncateUnicodeSafe(line, filter.truncateLineAt));
        if (truncatedLines.join("\n") !== lines.join("\n")) {
            lines = truncatedLines;
            appliedRules.push(`${filter.id}:truncate-line`);
        }
    }
    // Per-filter line dedup (opt-in via the filter's `deduplicate` flag): collapse consecutive
    // duplicate lines before truncation. The engine-wide dedup (config.deduplicateThreshold) is
    // separate; this lets a single filter force it for its own output.
    if (filter.deduplicate) {
        const deduped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$deduplicator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deduplicateRepeatedLines"])(lines.join("\n"));
        if (deduped.collapsed > 0) {
            lines = deduped.text.split(/\r?\n/);
            appliedRules.push(`${filter.id}:deduplicate`);
        }
    }
    if (filter.sourceFormat === "rtk-toml-v1") {
        lines = applyRtkTomlLineLimits(lines, filter, appliedRules);
        const output = lines.join("\n");
        const finalOutput = output.trim().length === 0 && filter.onEmpty ? filter.onEmpty : output;
        return {
            text: finalOutput,
            strippedLines: Math.max(0, originalLineCount - finalOutput.split(/\r?\n/).length),
            keptByRule: keepPatterns.length > 0,
            appliedRules
        };
    }
    const truncated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$smartTruncate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["smartTruncate"])(lines.join("\n"), {
        maxLines: filter.maxLines,
        preserveHead: filter.preserveHead,
        preserveTail: filter.preserveTail,
        priorityPatterns
    });
    if (truncated.truncated) appliedRules.push(`${filter.id}:truncate`);
    const output = truncated.text.trim().length === 0 && filter.onEmpty ? filter.onEmpty : truncated.text;
    return {
        text: output,
        strippedLines: Math.max(0, originalLineCount - output.split(/\r?\n/).length),
        keptByRule: keepPatterns.length > 0,
        appliedRules
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/tomlCompatibility.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "RTK_TOML_MAX_BYTES",
    ()=>RTK_TOML_MAX_BYTES,
    "RtkTomlCompatibilityError",
    ()=>RtkTomlCompatibilityError,
    "getGlobalRtkTomlPath",
    ()=>getGlobalRtkTomlPath,
    "installGlobalRtkTomlV1",
    ()=>installGlobalRtkTomlV1,
    "parseRtkTomlV1",
    ()=>parseRtkTomlV1
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$smol$2d$toml$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/smol-toml/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$smol$2d$toml$2f$dist$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/smol-toml/dist/parse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/filterSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$lineFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/lineFilter.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const MAX_TOML_BYTES = 1024 * 1024;
const replaceRuleSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    pattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    replacement: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
}).strict();
const matchOutputRuleSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    pattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    message: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    unless: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional()
}).strict();
const filterSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    match_command: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    strip_ansi: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    filter_stderr: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    strip_lines_matching: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    keep_lines_matching: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    replace: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(replaceRuleSchema).optional(),
    match_output: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(matchOutputRuleSchema).optional(),
    truncate_lines_at: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional(),
    head_lines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional(),
    tail_lines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional(),
    max_lines: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional(),
    on_empty: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
}).strict();
const inlineTestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    input: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    expected: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()
}).strict();
const fileSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    schema_version: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal(1),
    filters: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1), filterSchema).default({}),
    tests: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(inlineTestSchema)).default({})
}).strict();
function arrayOrEmpty(value) {
    return value ?? [];
}
function numberOrZero(value) {
    return value ?? 0;
}
class RtkTomlCompatibilityError extends Error {
    publicMessage;
    constructor(message){
        super("RTK TOML schema v1 compatibility error");
        this.name = "RtkTomlCompatibilityError";
        this.publicMessage = message;
    }
}
function compatibilityError(message) {
    return new RtkTomlCompatibilityError(message);
}
function categoryFor(name, commandPattern) {
    const value = `${name} ${commandPattern}`.toLowerCase();
    if (/\b(?:git|gh)\b/.test(value)) return "git";
    if (/\b(?:test|jest|vitest|pytest|cargo test|go test|rspec|playwright)\b/.test(value)) {
        return "test";
    }
    if (/\b(?:build|tsc|eslint|ruff|clippy|gradle|make|next|vite|webpack)\b/.test(value)) {
        return "build";
    }
    if (/\b(?:docker|kubectl|podman|compose)\b/.test(value)) return "docker";
    if (/\b(?:npm|pnpm|yarn|bun|pip|poetry|uv|bundle|composer)\b/.test(value)) {
        return "package";
    }
    if (/\b(?:terraform|tofu|ansible|helm|pulumi)\b/.test(value)) return "infra";
    if (/\b(?:aws|gcloud|az|cloudflare)\b/.test(value)) return "cloud";
    if (/\b(?:ls|find|grep|rg|df|du|ps|systemctl|ssh|rsync)\b/.test(value)) return "shell";
    return "generic";
}
function regexFields(filter) {
    return [
        {
            field: "match_command",
            pattern: filter.match_command
        },
        ...(filter.strip_lines_matching ?? []).map((pattern)=>({
                field: "strip_lines_matching",
                pattern
            })),
        ...(filter.keep_lines_matching ?? []).map((pattern)=>({
                field: "keep_lines_matching",
                pattern
            })),
        ...(filter.replace ?? []).map(({ pattern })=>({
                field: "replace.pattern",
                pattern
            })),
        ...(filter.match_output ?? []).flatMap(({ pattern, unless })=>[
                {
                    field: "match_output.pattern",
                    pattern
                },
                ...unless ? [
                    {
                        field: "match_output.unless",
                        pattern: unless
                    }
                ] : []
            ])
    ];
}
function validateRegexes(name, filter) {
    for (const { field, pattern } of regexFields(filter)){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isReDoSProne"])(pattern)) {
            throw compatibilityError(`filter '${name}' has an unsafe regex in ${field}`);
        }
        try {
            new RegExp(pattern);
        } catch  {
            throw compatibilityError(`filter '${name}' has an invalid regex in ${field}`);
        }
    }
}
function toDefinition(name, filter, tests) {
    if ((filter.strip_lines_matching?.length ?? 0) > 0 && (filter.keep_lines_matching?.length ?? 0) > 0) {
        throw compatibilityError(`filter '${name}' cannot combine strip_lines_matching with keep_lines_matching`);
    }
    validateRegexes(name, filter);
    return {
        id: name,
        name,
        description: filter.description ?? "",
        commandTypes: [],
        commandPatterns: [
            filter.match_command
        ],
        matchPatterns: [],
        category: categoryFor(name, filter.match_command),
        priority: 50,
        stripPatterns: arrayOrEmpty(filter.strip_lines_matching),
        keepPatterns: arrayOrEmpty(filter.keep_lines_matching),
        priorityPatterns: [],
        collapsePatterns: [],
        stripAnsi: filter.strip_ansi ?? false,
        replace: arrayOrEmpty(filter.replace),
        matchOutput: arrayOrEmpty(filter.match_output),
        truncateLineAt: numberOrZero(filter.truncate_lines_at),
        onEmpty: filter.on_empty ?? "",
        filterStderr: false,
        deduplicate: false,
        maxLines: numberOrZero(filter.max_lines),
        preserveHead: 0,
        preserveTail: 0,
        rtkTomlHeadLines: filter.head_lines,
        rtkTomlTailLines: filter.tail_lines,
        rtkTomlMaxLines: filter.max_lines,
        sourceFormat: "rtk-toml-v1",
        tests
    };
}
function comparable(value) {
    return value.replace(/\n+$/g, "");
}
function tomlSyntaxLocation(error) {
    if (typeof error !== "object" || error === null) return "";
    const { line, column } = error;
    if (!Number.isSafeInteger(line) || !Number.isSafeInteger(column)) return "";
    return ` (line ${line}, column ${column})`;
}
function parseRtkTomlV1(content) {
    if (Buffer.byteLength(content, "utf8") > MAX_TOML_BYTES) {
        throw compatibilityError(`file exceeds the ${MAX_TOML_BYTES}-byte limit`);
    }
    let raw;
    try {
        raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$smol$2d$toml$2f$dist$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(content);
    } catch (error) {
        throw compatibilityError(`invalid TOML syntax${tomlSyntaxLocation(error)}`);
    }
    const parsed = fileSchema.safeParse(raw);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const field = issue?.path.length ? issue.path.join(".") : "document";
        throw compatibilityError(`${field}: ${issue?.message ?? "invalid document"}`);
    }
    if (Object.keys(parsed.data.filters).length === 0) {
        throw compatibilityError("document contains no filters");
    }
    for (const testName of Object.keys(parsed.data.tests)){
        if (!(testName in parsed.data.filters)) {
            throw compatibilityError(`tests reference unknown filter '${testName}'`);
        }
    }
    const filters = Object.entries(parsed.data.filters).map(([name, filter])=>toDefinition(name, filter, parsed.data.tests[name] ?? []));
    const outcomes = filters.flatMap((filter)=>filter.tests.map((test)=>{
            const actual = comparable((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$lineFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLineFilter"])(test.input, filter).text);
            const expected = comparable(test.expected);
            return {
                filterId: filter.id,
                testName: test.name,
                passed: actual === expected,
                actual,
                expected
            };
        }));
    const filtersWithoutTests = filters.filter((filter)=>filter.tests.length === 0).map((filter)=>filter.id);
    const warnings = filtersWithoutTests.map((id)=>`Filter '${id}' has no inline tests and should be reviewed before installation`);
    for (const [id, filter] of Object.entries(parsed.data.filters)){
        if (filter.filter_stderr) {
            warnings.push(`Filter '${id}': filter_stderr is accepted as a no-op because OmniRoute receives already-captured tool output`);
        }
    }
    return {
        schemaVersion: 1,
        sha256: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(content).digest("hex"),
        filters,
        outcomes,
        filtersWithoutTests,
        warnings,
        passed: outcomes.every((outcome)=>outcome.passed)
    };
}
function getDataDir() {
    return process.env.DATA_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
}
function getGlobalRtkTomlPath() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getDataDir(), "rtk", "filters.toml");
}
function installGlobalRtkTomlV1(content, options = {}) {
    const result = parseRtkTomlV1(content);
    if (!result.passed) {
        throw compatibilityError("one or more inline tests failed");
    }
    const target = getGlobalRtkTomlPath();
    const directory = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(target);
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(directory, {
        recursive: true,
        mode: 0o700
    });
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].chmodSync(directory, 0o700);
    } catch  {
    // Best effort on filesystems that do not support POSIX permissions.
    }
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(target) && !options.overwrite) {
        throw compatibilityError("filters.toml already exists; confirm overwrite to replace it");
    }
    let backupCreated = false;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(target)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].copyFileSync(target, `${target}.bak`);
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].chmodSync(`${target}.bak`, 0o600);
        } catch  {
        // Best effort on filesystems that do not support POSIX permissions.
        }
        backupCreated = true;
    }
    const temporary = `${target}.${process.pid}.${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID()}.tmp`;
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(temporary, content, {
            encoding: "utf8",
            mode: 0o600,
            flag: "wx"
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].renameSync(temporary, target);
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].chmodSync(target, 0o600);
        } catch  {
        // Best effort on filesystems that do not support POSIX permissions.
        }
    } finally{
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(temporary, {
            force: true
        });
    }
    return {
        ...result,
        installedPath: "rtk/filters.toml",
        backupCreated
    };
}
const RTK_TOML_MAX_BYTES = MAX_TOML_BYTES;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/engines/rtk/filterLoader.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getRtkFilterCatalog",
    ()=>getRtkFilterCatalog,
    "getRtkFilterLoadDiagnostics",
    ()=>getRtkFilterLoadDiagnostics,
    "loadRtkFilters",
    ()=>loadRtkFilters,
    "matchRtkFilter",
    ()=>matchRtkFilter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$commandDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/commandDetector.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/filterSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$tomlCompatibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/tomlCompatibility.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$tomlCompatibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$tomlCompatibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
let cache = null;
let cacheKey = null;
let diagnostics = [];
// RegExp cache for matchPatterns — same pattern strings are tested against
// many different lines across requests; avoid compiling them every time.
const regexCache = new Map();
function cachedMatchPattern(pattern, value) {
    const key = `${pattern}::im`;
    let re = regexCache.get(key);
    if (!re) {
        try {
            re = new RegExp(pattern, "im");
            regexCache.set(key, re);
        } catch  {
            return false;
        }
    }
    return re.test(value);
}
function getModuleDir() {
    const anchors = [
        process.cwd()
    ];
    const argv1 = process.argv[1];
    if (typeof argv1 === "string" && argv1) anchors.push(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(argv1));
    const rel = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join("open-sse", "services", "compression");
    for (const anchor of anchors){
        let dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(anchor);
        for(let i = 0; i <= 8; i++){
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, rel))) return dir;
            const parent = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
}
function getFiltersDir() {
    const root = getModuleDir();
    const candidates = [
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, "open-sse", "services", "compression", "engines", "rtk", "filters"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, "app", "open-sse", "services", "compression", "engines", "rtk", "filters")
    ];
    return candidates.find((candidate, index)=>{
        return candidates.indexOf(candidate) === index && __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidate);
    }) ?? candidates[0];
}
function getDataDir() {
    return process.env.DATA_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
}
function sha256(value) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(value).digest("hex");
}
function projectFiltersTrusted(filtersPath, trustProjectFilters = false) {
    if (trustProjectFilters) return true;
    if (process.env.OMNIROUTE_RTK_TRUST_PROJECT_FILTERS === "1") return true;
    const trustPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(filtersPath), "trust.json");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(trustPath)) return false;
    try {
        const filtersHash = sha256(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(filtersPath, "utf8"));
        const trust = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(trustPath, "utf8"));
        const isToml = filtersPath.endsWith(".toml");
        const trustedHash = isToml ? typeof trust.filtersTomlSha256 === "string" ? trust.filtersTomlSha256 : null : typeof trust.filtersSha256 === "string" ? trust.filtersSha256 : typeof trust.trustedFiltersSha256 === "string" ? trust.trustedFiltersSha256 : null;
        if (!trustedHash) return false;
        return trustedHash === filtersHash ? true : "changed";
    } catch  {
        return false;
    }
}
function collectFilterSources(options = {}) {
    const sources = [];
    if (options.customFiltersEnabled !== false) {
        collectProjectFilterSources(sources, options);
        collectGlobalFilterSources(sources);
    }
    collectBuiltinFilterSources(sources);
    return sources;
}
function collectProjectFilterSources(sources, options) {
    const projectCandidates = [
        {
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), ".rtk", "filters.toml"),
            format: "rtk-toml-v1"
        },
        {
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), ".rtk", "filters.json"),
            format: "omniroute-json"
        }
    ];
    for (const candidate of projectCandidates){
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidate.path)) continue;
        const trusted = projectFiltersTrusted(candidate.path, options.trustProjectFilters === true);
        if (trusted === true) {
            sources.push({
                source: "project",
                ...candidate,
                trusted: true
            });
            continue;
        }
        diagnostics.push({
            source: "project",
            format: candidate.format,
            path: candidate.path,
            level: "warning",
            message: trusted === "changed" ? "Project RTK filters changed after trust and were skipped" : "Project RTK filters are untrusted and were skipped"
        });
    }
}
function collectGlobalFilterSources(sources) {
    const globalCandidates = [
        {
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getDataDir(), "rtk", "filters.toml"),
            format: "rtk-toml-v1"
        },
        {
            path: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getDataDir(), "rtk", "filters.json"),
            format: "omniroute-json"
        }
    ];
    for (const candidate of globalCandidates){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidate.path)) {
            sources.push({
                source: "global",
                ...candidate,
                trusted: true
            });
        }
    }
}
function collectBuiltinFilterSources(sources) {
    const builtinDir = getFiltersDir();
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(builtinDir)) {
        let builtinFiles = [];
        try {
            builtinFiles = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(builtinDir).filter((entry)=>entry.endsWith(".json")).sort();
        } catch  {
            // A read failure on the builtin dir (lost permission, TOCTOU after existsSync, NFS
            // timeout, read-only container) must not fail the request — degrade to the filters
            // already collected. listRtkCommandSamples guards readdirSync the same way.
            builtinFiles = [];
        }
        for (const file of builtinFiles){
            sources.push({
                source: "builtin",
                path: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(builtinDir, file),
                trusted: true,
                format: "omniroute-json"
            });
        }
    }
}
function parseFilterFile(source) {
    try {
        const content = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(source.path, "utf8");
        const definitions = source.format === "rtk-toml-v1" ? (()=>{
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$tomlCompatibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRtkTomlV1"])(content);
            if (!result.passed) {
                throw new Error("one or more inline tests failed");
            }
            for (const warning of result.warnings){
                diagnostics.push({
                    source: source.source,
                    format: source.format,
                    path: source.path,
                    level: "warning",
                    message: warning
                });
            }
            return result.filters;
        })() : (()=>{
            const parsed = JSON.parse(content);
            const entries = Array.isArray(parsed) ? parsed : [
                parsed
            ];
            return entries.map(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateRtkFilter"]);
        })();
        return definitions.map((definition)=>({
                ...definition,
                source: source.source,
                sourceFormat: definition.sourceFormat ?? source.format
            }));
    } catch (error) {
        const message = error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$tomlCompatibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RtkTomlCompatibilityError"] ? error.publicMessage : error instanceof Error ? error.message : String(error);
        if (source.source === "builtin") {
            throw new Error(`Invalid RTK filter ${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].basename(source.path)}: ${message}`);
        }
        diagnostics.push({
            source: source.source,
            format: source.format,
            path: source.path,
            level: "warning",
            message: `Invalid custom RTK filter skipped: ${message}`
        });
        return [];
    }
}
function loadRtkFilters(options = {}) {
    const currentCacheKey = [
        process.cwd(),
        getDataDir(),
        options.customFiltersEnabled === false ? "builtin-only" : "custom",
        options.trustProjectFilters === true ? "trusted-project" : "trust-file",
        process.env.OMNIROUTE_RTK_TRUST_PROJECT_FILTERS === "1" ? "env-trust" : "env-normal"
    ].join("|");
    if (cache && cacheKey === currentCacheKey && !options.refresh) return cache;
    diagnostics = [];
    const filters = [];
    for (const source of collectFilterSources(options)){
        filters.push(...parseFilterFile(source));
    }
    const sourceRank = {
        project: 3,
        global: 2,
        builtin: 1
    };
    const formatRank = {
        "rtk-toml-v1": 2,
        "omniroute-json": 1
    };
    const sorted = filters.sort((a, b)=>sourceRank[b.source ?? "builtin"] - sourceRank[a.source ?? "builtin"] || formatRank[b.sourceFormat ?? "omniroute-json"] - formatRank[a.sourceFormat ?? "omniroute-json"] || b.priority - a.priority || a.id.localeCompare(b.id));
    cache = sorted;
    cacheKey = currentCacheKey;
    return sorted;
}
function getRtkFilterLoadDiagnostics() {
    loadRtkFilters();
    return diagnostics.map((entry)=>({
            ...entry
        }));
}
function getRtkFilterCatalog() {
    return loadRtkFilters().map((filter)=>({
            id: filter.id,
            name: filter.name,
            description: filter.description,
            commandTypes: filter.commandTypes,
            category: filter.category,
            priority: filter.priority,
            source: filter.source,
            sourceFormat: filter.sourceFormat
        }));
}
function matchRtkFilter(text, command, options = {}) {
    const detection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$commandDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCommandType"])(text, command);
    const detectedCommand = detection.command ?? command ?? "";
    const filters = loadRtkFilters(options);
    for (const source of [
        "project",
        "global",
        "builtin"
    ]){
        const scoped = filters.filter((filter)=>(filter.source ?? "builtin") === source);
        const matched = scoped.find((filter)=>filter.sourceFormat === "rtk-toml-v1" && detectedCommand && filter.commandPatterns.some((pattern)=>cachedMatchPattern(pattern, detectedCommand))) ?? scoped.find((filter)=>filter.commandTypes.includes(detection.type)) ?? scoped.find((filter)=>detectedCommand && filter.commandPatterns.some((pattern)=>cachedMatchPattern(pattern, detectedCommand))) ?? scoped.find((filter)=>filter.matchPatterns.some((pattern)=>cachedMatchPattern(pattern, text)));
        if (matched) return matched;
    }
    return filters.find((filter)=>filter.commandTypes.includes("generic-output")) ?? null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/engines/rtk/codeStripper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setTypeScriptModuleLoaderForTests",
    ()=>__setTypeScriptModuleLoaderForTests,
    "detectCodeLanguage",
    ()=>detectCodeLanguage,
    "normalizeCodeLanguage",
    ()=>normalizeCodeLanguage,
    "stripCode",
    ()=>stripCode
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:module [external] (node:module, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/services/compression/engines/rtk/codeStripper.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
// `typescript` is a devDependency used only for opt-in AST-based comment
// stripping. A production-lean deploy (`npm run build && npm prune --omit=dev`,
// recommended in Discussion #6956) removes it, so importing it eagerly at module
// top level broke *every* Compression Context page (#7096). Resolve it lazily on
// first use and degrade to a no-op when it is unavailable.
let typeScriptModule;
let warnedMissingTypeScript = false;
let loadTypeScriptModule = defaultLoadTypeScriptModule;
function defaultLoadTypeScriptModule() {
    try {
        const requireFromHere = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
        return __turbopack_context__.r("[externals]/typescript [external] (typescript, cjs, [project]/node_modules/typescript)");
    } catch  {
        return null;
    }
}
function resolveTypeScript() {
    if (typeScriptModule === undefined) {
        typeScriptModule = loadTypeScriptModule();
        if (!typeScriptModule && !warnedMissingTypeScript) {
            warnedMissingTypeScript = true;
            // One-time warning: compression still works, just without AST-based
            // code-comment stripping (which is opt-in and off by default anyway).
            console.warn("[compression/rtk] optional dependency 'typescript' is not installed; " + "skipping AST-based code-comment stripping (compression still works). " + "Install 'typescript' to re-enable it.");
        }
    }
    return typeScriptModule;
}
function __setTypeScriptModuleLoaderForTests(loader) {
    loadTypeScriptModule = loader ?? defaultLoadTypeScriptModule;
    typeScriptModule = undefined;
    warnedMissingTypeScript = false;
}
const LANGUAGE_ALIASES = {
    js: "javascript",
    jsx: "javascript",
    javascript: "javascript",
    ts: "typescript",
    tsx: "typescript",
    typescript: "typescript",
    py: "python",
    python: "python",
    rs: "rust",
    rust: "rust",
    go: "go",
    rb: "ruby",
    ruby: "ruby",
    java: "java"
};
function normalizeCodeLanguage(language) {
    if (!language) return "unknown";
    return LANGUAGE_ALIASES[language.trim().toLowerCase()] ?? "unknown";
}
function detectCodeLanguage(text) {
    if (/\b(?:interface|type)\s+\w+\s*=|:\s*(?:string|number|boolean)\b/.test(text)) {
        return "typescript";
    }
    if (/\b(?:const|let|function|import|export)\b|=>/.test(text)) return "javascript";
    if (/\bdef\s+\w+\(|\bimport\s+\w+|print\(/.test(text)) return "python";
    if (/\bfn\s+\w+\(|\blet\s+mut\b|println!\(/.test(text)) return "rust";
    if (/\bfunc\s+\w+\(|package\s+\w+/.test(text)) return "go";
    if (/\bclass\s+\w+|System\.out\.println/.test(text)) return "java";
    if (/\bdef\s+\w+|puts\s+|end\s*$/.test(text)) return "ruby";
    return "unknown";
}
/**
 * Remove JS/TS comments using the TypeScript parser (R1/N3). Using the parser —
 * not a regex or the raw scanner — means string, template and regex literals are
 * never mistaken for comments (the scanner alone cannot tell a regex from a
 * division without parser context). Bails out entirely when JSX is present so
 * JSX expression-container comments are never corrupted.
 */ function stripJsTsComments(text, preserveDocstrings) {
    const ts = resolveTypeScript();
    // Graceful degradation: when `typescript` is unavailable (e.g. after
    // `npm prune --omit=dev`), skip AST-based comment stripping and leave the
    // code untouched rather than crashing (#7096).
    if (!ts) return text;
    const source = ts.createSourceFile("snippet.tsx", text, ts.ScriptTarget.Latest, /* setParentNodes */ true, ts.ScriptKind.TSX);
    let hasJsx = false;
    const detectJsx = (node)=>{
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
            hasJsx = true;
            return;
        }
        if (!hasJsx) ts.forEachChild(node, detectJsx);
    };
    detectJsx(source);
    if (hasJsx) return text;
    const ranges = new Map();
    const collect = (node)=>{
        for (const range of ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []){
            ranges.set(range.pos, range);
        }
        for (const range of ts.getTrailingCommentRanges(text, node.getEnd()) ?? []){
            ranges.set(range.pos, range);
        }
        ts.forEachChild(node, collect);
    };
    collect(source);
    if (ranges.size === 0) return text;
    let result = text;
    for (const range of [
        ...ranges.values()
    ].sort((a, b)=>b.pos - a.pos)){
        // Keep JSDoc/docstring block comments (`/** ... */`) when preserveDocstrings is on — they
        // carry API documentation that is worth more than the bytes they cost.
        if (preserveDocstrings && text.startsWith("/**", range.pos)) continue;
        result = result.slice(0, range.pos) + result.slice(range.end);
    }
    return result;
}
function stripCode(text, language = "unknown", options = {}) {
    const resolvedLanguage = language === "unknown" ? detectCodeLanguage(text) : language;
    const opts = {
        // Opt-in (default false): historically this flag was read but never applied,
        // so the effective behaviour was "preserve". Keeping the default at preserve
        // avoids a silent production change; callers opt in with removeComments:true.
        removeComments: options.removeComments === true,
        removeEmptyLines: options.removeEmptyLines !== false,
        collapseWhitespace: options.collapseWhitespace !== false,
        preserveDocstrings: options.preserveDocstrings === true
    };
    const originalLines = text.split(/\r?\n/).length;
    let result = text;
    if (opts.removeComments && (resolvedLanguage === "javascript" || resolvedLanguage === "typescript")) {
        result = stripJsTsComments(result, opts.preserveDocstrings);
    }
    if (opts.removeEmptyLines) result = result.replace(/^\s*$(?:\r?\n)?/gm, "");
    if (opts.collapseWhitespace) {
        result = result.split(/\r?\n/).map((line)=>line.replace(/[ \t]+$/g, "")).join("\n");
    }
    result = result.replace(/^\s*\n/, "").replace(/\n\s*$/, "");
    const strippedLines = Math.max(0, originalLines - (result ? result.split(/\r?\n/).length : 0));
    return {
        text: result,
        strippedLines,
        language: resolvedLanguage
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/rawOutput.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isLikelyFailureOutput",
    ()=>isLikelyFailureOutput,
    "listRtkCommandSamples",
    ()=>listRtkCommandSamples,
    "maybePersistRtkRawOutput",
    ()=>maybePersistRtkRawOutput,
    "readRtkRawOutput",
    ()=>readRtkRawOutput,
    "redactRtkRawOutput",
    ()=>redactRtkRawOutput
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
;
;
;
const SECRET_PATTERNS = [
    [
        /\b(sk-[A-Za-z0-9_-]{16,})\b/g,
        "[REDACTED_OPENAI_KEY]"
    ],
    [
        /\b(xox[baprs]-[A-Za-z0-9-]{16,})\b/g,
        "[REDACTED_SLACK_TOKEN]"
    ],
    [
        /\b(AKIA[0-9A-Z]{16})\b/g,
        "[REDACTED_AWS_KEY]"
    ],
    // key=value / key: value for common credential field names (flat alternation — no nesting,
    // so no ReDoS). Covers names the bare token/secret/password set misses (private_key, etc).
    [
        /((?:api[_-]?key|api[_-]?token|access[_-]?key|access[_-]?token|client[_-]?secret|auth[_-]?token|private[_-]?key|secret[_-]?key|credentials?|token|secret|password)\s*[:=]\s*)("[^"]+"|'[^']+'|[^\s]+)/gi,
        "$1[REDACTED]"
    ],
    // Authorization / Proxy-Authorization with Bearer OR Basic (curl -v emits Basic <base64>).
    [
        /((?:Proxy-)?Authorization:\s*(?:Bearer|Basic)\s+)[A-Za-z0-9._~+/-]+=*/gi,
        "$1[REDACTED]"
    ]
];
function dataDir() {
    return process.env.DATA_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".omniroute");
}
function safeId(seed) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(seed).digest("hex").slice(0, 24);
}
function safeUtf8Slice(value, maxBytes) {
    if (maxBytes <= 0 || Buffer.byteLength(value, "utf8") <= maxBytes) return value;
    let bytes = 0;
    let output = "";
    for (const char of value){
        const len = Buffer.byteLength(char, "utf8");
        if (bytes + len > maxBytes) break;
        output += char;
        bytes += len;
    }
    return `${output}\n\n--- truncated at ${maxBytes} bytes ---`;
}
function redactRtkRawOutput(value) {
    let redacted = false;
    let text = value;
    for (const [pattern, replacement] of SECRET_PATTERNS){
        const next = text.replace(pattern, (...args)=>{
            redacted = true;
            return typeof replacement === "string" ? replacement.replace("$1", args[1] ?? "") : replacement;
        });
        text = next;
    }
    return {
        text,
        redacted
    };
}
function isLikelyFailureOutput(value) {
    return /\b(error|failed|failure|exception|traceback|panic|fatal|critical|TS\d{4}|FAIL)\b/i.test(value);
}
function maybePersistRtkRawOutput(raw, options) {
    if (options.retention === "never") return null;
    const failure = options.failure ?? isLikelyFailureOutput(raw);
    if (options.retention === "failures" && !failure) return null;
    if (raw.trim().length === 0) return null;
    const maxBytes = Math.max(1024, Math.floor(options.maxBytes ?? 1_048_576));
    const redaction = redactRtkRawOutput(safeUtf8Slice(raw, maxBytes));
    const now = Date.now();
    const commandSlug = (options.command || "tool-output").replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
    const id = safeId(`${now}:${commandSlug}:${raw.length}:${redaction.text}`);
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDir(), "rtk", "raw-output");
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, `${now}-${commandSlug || "tool-output"}-${id}.log`);
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
            recursive: true
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, redaction.text);
    } catch  {
        // Best-effort capture: a disk error (ENOSPC / EACCES / read-only DATA_DIR) must NEVER
        // fail the compression pipeline. Skip the capture, exactly like retention "never".
        return null;
    }
    // Sidecar metadata: the .log filename only carries a lossy command SLUG, so persist
    // the FULL command (and timestamp/flags) next to it. Keeps the .log pure output (the
    // raw-output recovery route still returns it verbatim) while letting the RTK
    // learn/discover sample source recover the exact command. Best-effort: a sidecar
    // write failure never fails the capture.
    try {
        const metaPath = filePath.replace(/\.log$/, ".meta.json");
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(metaPath, JSON.stringify({
            command: options.command ?? null,
            timestamp: now,
            failure,
            redacted: redaction.redacted,
            bytes: Buffer.byteLength(redaction.text, "utf8")
        }));
    } catch  {
    // Sidecar is an optimisation for learn/discover; the .log (with slug) still works.
    }
    return {
        id,
        path: filePath,
        bytes: Buffer.byteLength(redaction.text, "utf8"),
        sha256: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(redaction.text).digest("hex"),
        redacted: redaction.redacted
    };
}
function readRtkRawOutput(pointerId) {
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDir(), "rtk", "raw-output");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) return null;
    const entry = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir).find((file)=>file.endsWith(".log") && file.includes(pointerId));
    if (!entry) return null;
    const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, entry);
    if (!fullPath.startsWith(dir)) return null;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(fullPath, "utf8");
}
/** Recover the command for a `.log` from its filename slug (legacy, sidecar-less captures). */ function commandFromSlug(fileName) {
    // `<timestamp>-<slug>-<id>.log` → strip the leading timestamp and the trailing id.
    const slug = fileName.replace(/^\d+-/, "").replace(/-[0-9a-f]{24}\.log$/i, "").replace(/\.log$/i, "");
    return slug.replace(/_+/g, " ").trim();
}
function listRtkCommandSamples(opts = {}) {
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDir(), "rtk", "raw-output");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) return [];
    const limit = Math.max(1, Math.floor(opts.limit ?? 500));
    let logs;
    try {
        logs = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir).filter((f)=>f.endsWith(".log"));
    } catch  {
        return [];
    }
    // Newest first: the filename is timestamp-prefixed, so a reverse lexical sort works.
    logs.sort((a, b)=>a < b ? 1 : a > b ? -1 : 0);
    const samples = [];
    for (const fileName of logs){
        if (samples.length >= limit) break;
        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, fileName);
        if (!fullPath.startsWith(dir)) continue;
        let output;
        try {
            output = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(fullPath, "utf8");
        } catch  {
            continue;
        }
        if (output.trim().length === 0) continue;
        let command = "";
        try {
            const metaRaw = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(fullPath.replace(/\.log$/, ".meta.json"), "utf8");
            const meta = JSON.parse(metaRaw);
            if (typeof meta.command === "string" && meta.command.trim()) command = meta.command.trim();
        } catch  {
        // No/!invalid sidecar → fall back to the filename slug below.
        }
        if (!command) command = commandFromSlug(fileName) || "tool-output";
        samples.push({
            command,
            output
        });
    }
    return samples;
}
}),
"[project]/open-sse/services/compression/engines/rtk/renderers/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NO_RENDER",
    ()=>NO_RENDER
]);
const NO_RENDER = (text)=>({
        text,
        changed: false,
        renderer: ""
    });
}),
"[project]/open-sse/services/compression/engines/rtk/renderers/gitDiff.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderGitDiff",
    ()=>renderGitDiff
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/types.ts [app-route] (ecmascript)");
;
function renderGitDiff(text, _detection) {
    // Guard: must have at least one hunk header
    if (!text.includes("@@ ")) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    }
    const kept = [];
    for (const line of text.split("\n")){
        if (line.startsWith("diff --git ") || line.startsWith("@@ ")) {
            kept.push(line);
        } else if (/^[+-](?![+-])/.test(line)) {
            // change line (+foo or -foo) but NOT +++ or ---
            kept.push(line);
        }
    // drop: context lines (space), index lines, --- a/, +++ b/, mode lines, etc.
    }
    const out = kept.join("\n");
    if (out === text) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    return {
        text: out,
        changed: true,
        renderer: "git-diff"
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/renderers/testGreen.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderTestGreen",
    ()=>renderTestGreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/types.ts [app-route] (ecmascript)");
;
function renderTestGreen(text, _detection) {
    // Strip ANSI color codes before applying the failure guards. jest/vitest emit a
    // colored "FAIL" status whose preceding ANSI byte ("m" of [31m) is a word
    // character, defeating a /\bFAIL\b/ boundary on the raw string. Guards run on the
    // stripped copy; the original `text` is what we return on a no-op (lossless).
    const stripped = text.replace(/\[[0-9;]*m/g, "");
    // Failure guard — must check FIRST; never weaken
    if (/\bFAIL\b/.test(stripped)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    if (/✖/.test(stripped)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    if (/Error/.test(stripped)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    if (/Traceback/.test(stripped)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    if (/AssertionError/.test(stripped)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    // "failed" with a nonzero count, e.g. "1 failed" or "failed: 3"
    const failedMatch = stripped.match(/(\d+)\s+failed/i) ?? stripped.match(/failed[:\s]+(\d+)/i);
    if (failedMatch && parseInt(failedMatch[1], 10) > 0) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    // Try to extract a recognised summary line (from the stripped copy → ANSI-free)
    const summary = extractSummaryLine(stripped);
    if (!summary) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    return {
        text: summary,
        changed: true,
        renderer: "test-green"
    };
}
function extractSummaryLine(text) {
    const lines = text.split("\n");
    // pytest: === N passed in X.Xs ===  (also handles variants like  === N passed, M warning ===)
    for (const line of lines){
        if (/={3,}\s+\d+\s+passed/.test(line)) return line.trim();
    }
    // jest / vitest: "Tests: N passed, N total" or "Test Suites: ... Tests: ..."
    for (const line of lines){
        if (/Tests:\s+\d+\s+passed/.test(line)) return line.trim();
    }
    // vitest / jest run summary line: "✓ N tests passed"
    for (const line of lines){
        if (/\d+\s+tests?\s+passed/i.test(line)) return line.trim();
    }
    // eslint / build-eslint: empty output = clean; if we reach here with no failures, synthesize
    if (text.trim() === "" || text.trim().startsWith("\n")) {
        return "ESLint: 0 problems found";
    }
    return null;
}
}),
"[project]/open-sse/services/compression/engines/rtk/renderers/terraformPlan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderTerraformPlan",
    ()=>renderTerraformPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/types.ts [app-route] (ecmascript)");
;
function renderTerraformPlan(text, _detection) {
    // "No changes" is already compact — idempotent no-op
    if (/^No changes\./m.test(text)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    // Extract the canonical Plan summary line
    const planMatch = text.match(/Plan:\s+(\d+)\s+to add,\s+(\d+)\s+to change,\s+(\d+)\s+to destroy/);
    if (!planMatch) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    const [, add, change, destroy] = planMatch;
    const summary = `Plan: +${add} ~${change} -${destroy}`;
    // Collect resource address lines: "  # <addr> will be <verb>"
    const resources = [];
    for (const line of text.split("\n")){
        const m = line.match(/^\s+#\s+(\S+)\s+will\s+be\s+\S+/);
        if (m) {
            resources.push(`  # ${m[1]} will be ${line.trim().replace(/^#\s+\S+\s+will\s+be\s+/, "")}`);
        }
    }
    const out = [
        summary,
        ...resources
    ].join("\n");
    return {
        text: out,
        changed: true,
        renderer: "terraform-plan"
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/renderers/structuredTable.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderStructuredTable",
    ()=>renderStructuredTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/types.ts [app-route] (ecmascript)");
;
const MAX_TABLE_ROWS = 200;
const MAX_COLUMNS = 5;
// Priority column names to prefer when choosing which columns to display
const PRIORITY_KEYS = [
    "name",
    "id",
    "status",
    "type",
    "kind"
];
function renderStructuredTable(text, _detection) {
    const parsed = tryParse(text.trim());
    if (!parsed) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    // Must be an array of ≥2 objects
    if (!Array.isArray(parsed) || parsed.length < 2) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    const items = parsed;
    // Every item must be a non-null, non-array object
    if (!items.every((item)=>item !== null && typeof item === "object" && !Array.isArray(item))) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    }
    const objects = items;
    // Collect scalar keys across all objects, count occurrences
    const keyCount = {};
    for (const obj of objects){
        for (const [k, v] of Object.entries(obj)){
            if (v === null || typeof v !== "object") {
                keyCount[k] = (keyCount[k] ?? 0) + 1;
            }
        }
    }
    if (Object.keys(keyCount).length === 0) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    // Choose columns: prioritize PRIORITY_KEYS, then by frequency, cap at MAX_COLUMNS
    const threshold = Math.floor(objects.length / 2);
    const candidateKeys = Object.entries(keyCount).filter(([, count])=>count >= threshold).map(([k])=>k);
    const priorityChosen = PRIORITY_KEYS.filter((k)=>candidateKeys.includes(k));
    const rest = candidateKeys.filter((k)=>!PRIORITY_KEYS.includes(k)).sort((a, b)=>(keyCount[b] ?? 0) - (keyCount[a] ?? 0));
    const columns = [
        ...priorityChosen,
        ...rest
    ].slice(0, MAX_COLUMNS);
    if (columns.length === 0) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    // Build table
    const rows = objects.slice(0, MAX_TABLE_ROWS);
    const extra = objects.length > MAX_TABLE_ROWS ? objects.length - MAX_TABLE_ROWS : 0;
    const header = columns.join("\t");
    const body = rows.map((obj)=>columns.map((k)=>String(obj[k] ?? "")).join("\t")).join("\n");
    const out = extra > 0 ? `${header}\n${body}\n… (+${extra} more)` : `${header}\n${body}`;
    return {
        text: out,
        changed: true,
        renderer: "structured-table"
    };
}
function tryParse(text) {
    // Direct parse
    try {
        return JSON.parse(text);
    } catch  {
        // Try to find the largest [...] substring
        const start = text.indexOf("[");
        const end = text.lastIndexOf("]");
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            } catch  {
                return null;
            }
        }
        return null;
    }
}
}),
"[project]/open-sse/services/compression/engines/rtk/renderers/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REGISTRY",
    ()=>REGISTRY,
    "applyRenderer",
    ()=>applyRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$gitDiff$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/gitDiff.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$testGreen$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/testGreen.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$terraformPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/terraformPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$structuredTable$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/structuredTable.ts [app-route] (ecmascript)");
;
;
;
;
;
// preenchido nas tasks 2–5
const REGISTRY = {};
// Task 2: git-diff renderer
// Note: "git-show" is not a real detection type in commandDetector.ts DETECTORS array,
// so only "git-diff" is registered here.
REGISTRY["git-diff"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$gitDiff$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderGitDiff"];
// Task 3: test-green renderer
// Note: "test-eslint" is not a real detection type; the real type is "build-eslint".
REGISTRY["test-pytest"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$testGreen$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderTestGreen"];
REGISTRY["test-jest"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$testGreen$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderTestGreen"];
REGISTRY["test-vitest"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$testGreen$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderTestGreen"];
REGISTRY["build-eslint"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$testGreen$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderTestGreen"];
// Task 4: terraform-plan renderer
REGISTRY["terraform-plan"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$terraformPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderTerraformPlan"];
REGISTRY["tofu-plan"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$terraformPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderTerraformPlan"];
// Task 5: structured-table renderer
// Note: "kubectl" is not a real detection type in commandDetector.ts DETECTORS array
// (it's in KNOWN_COMMANDS but has no DETECTOR entry with a "kubectl" type).
// Kubectl JSON output will be detected as "json-output" or "aws" depending on content.
// Registering "aws" and "json-output" which are the real types for this output shape.
REGISTRY["aws"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$structuredTable$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderStructuredTable"];
REGISTRY["json-output"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$structuredTable$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["renderStructuredTable"];
function applyRenderer(text, detection, config) {
    const r = REGISTRY[detection.type];
    if (!r) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    if (config.renderers && config.renderers.length > 0 && !config.renderers.includes(detection.type)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NO_RENDER"])(text);
    }
    return r(text, detection);
}
;
}),
"[project]/open-sse/services/compression/bodyAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_RESPONSE_ITEM_META",
    ()=>CODEX_RESPONSE_ITEM_META,
    "adaptBodyForCompression",
    ()=>adaptBodyForCompression
]);
const CODEX_RESPONSE_ITEM_META = Symbol("codexResponseItemMeta");
const RESPONSES_MESSAGE_TYPES = new Set([
    "message",
    "function_call_output",
    "custom_tool_call_output",
    "local_shell_call_output",
    "apply_patch_call_output"
]);
const COMPRESSION_INPUT_INDEX = Symbol("compressionInputIndex");
// Kiro envelope path back to the original tool-result text inside
// `conversationState.{history|currentMessage}[].userInputMessage.userInputMessageContext.toolResults[N].content[M].text`.
// Stored on the synthesized role:"tool" message so we can restore the rewritten text
// to the exact source slot after any compression engine runs.
//
// This lifts Kiro support from RTK-only (upstream decolua/9router#1194) to the shared
// adapter layer, so every compression engine (RTK, lite, aggressive…) automatically
// covers Kiro/CodeWhisperer payloads, not just RTK.
const KIRO_TOOL_RESULT_PATH = Symbol("kiroToolResultPath");
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function normalizeRole(role, fallback) {
    return typeof role === "string" && role.length > 0 ? role : fallback;
}
function toChatContent(content, fallbackOutput) {
    return content === undefined ? fallbackOutput : content;
}
function fromChatContent(nextContent, originalContent) {
    if (Array.isArray(originalContent) && typeof nextContent === "string") {
        let replaced = false;
        const mapped = originalContent.map((part)=>{
            if (!isRecord(part) || typeof part.text !== "string") return part;
            if (replaced) return {
                ...part,
                text: ""
            };
            replaced = true;
            return {
                ...part,
                text: nextContent
            };
        });
        return replaced ? mapped : originalContent;
    }
    return nextContent;
}
function customToolOutputToChatContent(rawOutput) {
    if (typeof rawOutput !== "string") {
        if (isRecord(rawOutput) && typeof rawOutput.output === "string") return rawOutput.output;
        return rawOutput;
    }
    try {
        const parsed = JSON.parse(rawOutput);
        if (isRecord(parsed) && typeof parsed.output === "string") return parsed.output;
    } catch  {
    // Plain-text custom tool output is already in the form compression engines expect.
    }
    return rawOutput;
}
function restoreCustomToolOutput(nextContent, originalOutput) {
    if (typeof originalOutput === "string") {
        try {
            const parsed = JSON.parse(originalOutput);
            if (isRecord(parsed) && typeof parsed.output === "string") {
                return JSON.stringify({
                    ...parsed,
                    output: nextContent
                });
            }
        } catch  {
        // Preserve the original plain-text representation below.
        }
    }
    if (isRecord(originalOutput) && typeof originalOutput.output === "string") {
        return {
            ...originalOutput,
            output: nextContent
        };
    }
    return fromChatContent(nextContent, originalOutput);
}
function responsesToolOutputField(item) {
    return item.output !== null && item.output !== undefined ? "output" : "content";
}
function responsesItemToMessage(item) {
    const type = typeof item.type === "string" ? item.type : "message";
    if (!RESPONSES_MESSAGE_TYPES.has(type)) return null;
    if (type === "function_call_output" || type === "custom_tool_call_output" || type === "local_shell_call_output" || type === "apply_patch_call_output") {
        const rawOutput = item.output ?? item.content;
        // OpenAI Responses shape (Codex): body.input holds Responses items. When
        // output is a JSON object (not a string or content array), serialise it so
        // compression engines can process the text. On restore the serialised string
        // is kept as output — the Responses API accepts string output. (#1998)
        const isObjectOutput = rawOutput !== null && rawOutput !== undefined && typeof rawOutput === "object" && !Array.isArray(rawOutput);
        return {
            role: "tool",
            content: type === "custom_tool_call_output" ? customToolOutputToChatContent(rawOutput) : isObjectOutput ? JSON.stringify(rawOutput) : toChatContent(rawOutput),
            [CODEX_RESPONSE_ITEM_META]: {
                type,
                eligible: false
            }
        };
    }
    return {
        role: normalizeRole(item.role, "user"),
        content: toChatContent(item.content, item.output)
    };
}
const DEFAULT_CODEX_PROTECTED_TOOL_NAMES = new Set([
    "read",
    "glob",
    "grep",
    "write",
    "edit",
    "websearch",
    "webfetch",
    "web_search",
    "web_fetch"
]);
function markCodexResponseEligibility(messages, inputItems, preserveToolNames = []) {
    const protectedNames = new Set([
        ...DEFAULT_CODEX_PROTECTED_TOOL_NAMES,
        ...preserveToolNames.map((name)=>name.trim().toLowerCase())
    ]);
    const functionCalls = new Map();
    const skippedCallIds = new Set();
    for (const raw of inputItems){
        if (!isRecord(raw) || raw.type !== "function_call") continue;
        if (typeof raw.call_id !== "string" || raw.call_id.length === 0) continue;
        const name = typeof raw.name === "string" ? raw.name : "";
        functionCalls.set(raw.call_id, name);
        if (protectedNames.has(name.trim().toLowerCase()) || name === "headless_retrieval" || name.endsWith("__headless_retrieval")) {
            skippedCallIds.add(raw.call_id);
        }
    }
    for (const message of messages){
        const meta = message[CODEX_RESPONSE_ITEM_META];
        if (!meta) continue;
        if (meta.type === "local_shell_call_output" || meta.type === "apply_patch_call_output") {
            meta.eligible = true;
            continue;
        }
        if (meta.type !== "function_call_output") continue;
        const rawIndex = message[COMPRESSION_INPUT_INDEX];
        const rawItem = typeof rawIndex === "number" ? inputItems[rawIndex] : null;
        const callId = isRecord(rawItem) && typeof rawItem.call_id === "string" ? rawItem.call_id : "";
        meta.eligible = callId.length > 0 && functionCalls.has(callId) && !skippedCallIds.has(callId);
    }
}
function messageToResponsesItem(message, originalItem) {
    const type = typeof originalItem.type === "string" ? originalItem.type : "message";
    if (type === "function_call_output" || type === "custom_tool_call_output" || type === "local_shell_call_output" || type === "apply_patch_call_output") {
        const outputField = responsesToolOutputField(originalItem);
        const originalOutput = originalItem[outputField];
        return {
            ...originalItem,
            [outputField]: type === "custom_tool_call_output" ? restoreCustomToolOutput(message.content, originalOutput) : fromChatContent(message.content, originalOutput)
        };
    }
    return {
        ...originalItem,
        content: fromChatContent(message.content, originalItem.content)
    };
}
function hasTextContent(message) {
    if (typeof message.content === "string") return message.content.length > 0;
    if (!Array.isArray(message.content)) return false;
    return message.content.some((part)=>isRecord(part) && typeof part.text === "string" && part.text.length > 0);
}
function isInlineBase64ImageUrl(value) {
    return typeof value === "string" && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}
/** Image-only Responses turns must enter the adapter so #8560 image pruning can see them. */ function hasInlineImageContent(message) {
    if (!Array.isArray(message.content)) return false;
    return message.content.some((part)=>{
        if (!isRecord(part)) return false;
        if (part.type === "input_image" && isInlineBase64ImageUrl(part.image_url)) return true;
        if (part.type === "image_url") {
            const imageUrl = part.image_url;
            if (isInlineBase64ImageUrl(imageUrl)) return true;
            return isRecord(imageUrl) && isInlineBase64ImageUrl(imageUrl.url);
        }
        if (part.type === "image") {
            if (isInlineBase64ImageUrl(part.image)) return true;
            const source = part.source;
            return isRecord(source) && source.type === "base64" && typeof source.data === "string";
        }
        const inlineData = part.inlineData ?? part.inline_data;
        return isRecord(inlineData) && typeof inlineData.data === "string";
    });
}
function hasCompressibleContent(message) {
    return hasTextContent(message) || hasInlineImageContent(message);
}
function adaptBodyForCompression(body, preserveToolNames = []) {
    if (Array.isArray(body.messages)) {
        return {
            body,
            adapted: false,
            restore: (compressedBody)=>compressedBody
        };
    }
    // Kiro / AWS CodeWhisperer envelope: tool results live deep inside
    // conversationState.{currentMessage|history[]}.userInputMessage.userInputMessageContext.toolResults.
    // Flatten the tool-result text into synthesized role:"tool" messages so every engine
    // can compress them, then restore the rewritten text back into the exact source slot.
    if (isRecord(body.conversationState)) {
        return adaptKiroBodyForCompression(body);
    }
    if (!Array.isArray(body.input) && typeof body.input !== "string") {
        return {
            body,
            adapted: false,
            restore: (compressedBody)=>compressedBody
        };
    }
    const inputItems = Array.isArray(body.input) ? body.input : [
        {
            type: "message",
            role: "user",
            content: body.input
        }
    ];
    const mappings = [];
    const messages = [];
    inputItems.forEach((item, index)=>{
        if (!isRecord(item)) return;
        const message = responsesItemToMessage(item);
        if (!message || !hasCompressibleContent(message)) return;
        mappings.push({
            index,
            item: item
        });
        messages.push({
            ...message,
            [COMPRESSION_INPUT_INDEX]: index
        });
    });
    markCodexResponseEligibility(messages, inputItems, preserveToolNames);
    if (messages.length === 0) {
        return {
            body,
            adapted: false,
            restore: (compressedBody)=>compressedBody
        };
    }
    const bodyWithoutInput = {
        ...body
    };
    delete bodyWithoutInput.input;
    const mappedIndexSet = new Set(mappings.map((mapping)=>mapping.index));
    return {
        body: {
            ...bodyWithoutInput,
            messages
        },
        adapted: true,
        restore (compressedBody, options = {}) {
            const dropMissingMappedItems = options.dropMissingMappedItems === true;
            const compressedMessagesByIndex = new Map();
            if (Array.isArray(compressedBody.messages)) {
                for (const message of compressedBody.messages){
                    if (typeof message[COMPRESSION_INPUT_INDEX] === "number") {
                        compressedMessagesByIndex.set(message[COMPRESSION_INPUT_INDEX], message);
                    }
                }
            }
            if (!dropMissingMappedItems) {
                // Legacy restore: patch survivors in place; leave missing mapped items untouched
                // so lite/caveman dedup of synthetic messages cannot desync Responses positions.
                const nextInput = [
                    ...inputItems
                ];
                mappings.forEach((mapping)=>{
                    const compressedMessage = compressedMessagesByIndex.get(mapping.index);
                    if (!compressedMessage) return;
                    nextInput[mapping.index] = messageToResponsesItem(compressedMessage, mapping.item);
                });
                const rest = {
                    ...compressedBody
                };
                delete rest.messages;
                if (typeof body.input === "string") {
                    const first = nextInput[0];
                    return {
                        ...rest,
                        input: isRecord(first) ? first.content ?? body.input : body.input
                    };
                }
                return {
                    ...rest,
                    input: nextInput
                };
            }
            // Compaction restore (#8560): rebuild input so Layer-3 history drops actually shrink
            // Responses payloads. Also drop orphan function_call items whose outputs vanished.
            const nextInput = [];
            const survivingCallIds = new Set();
            inputItems.forEach((item, index)=>{
                if (mappedIndexSet.has(index)) {
                    const compressedMessage = compressedMessagesByIndex.get(index);
                    if (!compressedMessage) return;
                    const mapping = mappings.find((entry)=>entry.index === index);
                    if (!mapping) return;
                    const restored = messageToResponsesItem(compressedMessage, mapping.item);
                    nextInput.push(restored);
                    if (isRecord(restored) && (restored.type === "function_call_output" || restored.type === "custom_tool_call_output" || restored.type === "local_shell_call_output" || restored.type === "apply_patch_call_output") && typeof restored.call_id === "string") {
                        survivingCallIds.add(restored.call_id);
                    }
                    return;
                }
                nextInput.push(item);
            });
            const cleanedInput = nextInput.filter((item)=>{
                if (!isRecord(item)) return true;
                const t = item.type;
                if (t !== "function_call" && t !== "custom_tool_call" && t !== "local_shell_call" && t !== "apply_patch_call") {
                    return true;
                }
                if (typeof item.call_id !== "string" || item.call_id.length === 0) return true;
                const hadMappedOutput = mappings.some((mapping)=>{
                    const original = mapping.item;
                    return (original.type === "function_call_output" || original.type === "custom_tool_call_output" || original.type === "local_shell_call_output" || original.type === "apply_patch_call_output") && original.call_id === item.call_id;
                });
                if (!hadMappedOutput) return true;
                return survivingCallIds.has(item.call_id);
            });
            const rest = {
                ...compressedBody
            };
            delete rest.messages;
            if (typeof body.input === "string") {
                const first = cleanedInput[0];
                return {
                    ...rest,
                    input: isRecord(first) ? first.content ?? body.input : body.input
                };
            }
            return {
                ...rest,
                input: cleanedInput
            };
        }
    };
}
/**
 * Flatten a Kiro / AWS CodeWhisperer body so compression engines can rewrite the
 * tool-result text, then restore the rewritten text back into the original envelope
 * shape. Mirrors the OpenAI tool-role contract:
 *
 * - Each surviving tool-result content block becomes one role:"tool" message whose
 *   `content` is its inner text (engines see a familiar shape).
 * - Error tool results (`status === "error"`) are intentionally left out of the
 *   synthesized messages so engines cannot rewrite them — preserves diagnostics
 *   byte-for-byte (matches upstream decolua/9router#1194 behavior).
 * - Non-string text parts are skipped.
 * - On restore, only string `content` (or an array whose first text part is a string)
 *   is written back to `toolResults[N].content[M].text`.
 */ function adaptKiroBodyForCompression(body) {
    const state = body.conversationState;
    const history = Array.isArray(state.history) ? state.history : [];
    const currentMessage = isRecord(state.currentMessage) ? state.currentMessage : null;
    const messages = [];
    const collectFrom = (container, scope, historyIndex)=>{
        const uim = container.userInputMessage;
        if (!isRecord(uim)) return;
        const ctx = uim.userInputMessageContext;
        if (!isRecord(ctx)) return;
        const toolResults = ctx.toolResults;
        if (!Array.isArray(toolResults)) return;
        toolResults.forEach((tr, trIdx)=>{
            if (!isRecord(tr)) return;
            if (tr.status === "error") return; // preserve error traces — never compress
            const content = tr.content;
            if (!Array.isArray(content)) return;
            content.forEach((part, partIdx)=>{
                if (!isRecord(part)) return;
                if (typeof part.text !== "string" || part.text.length === 0) return;
                messages.push({
                    role: "tool",
                    content: part.text,
                    [KIRO_TOOL_RESULT_PATH]: {
                        scope,
                        historyIndex,
                        toolResultIndex: trIdx,
                        contentIndex: partIdx
                    }
                });
            });
        });
    };
    history.forEach((entry, idx)=>{
        if (!isRecord(entry)) return;
        collectFrom(entry, "history", idx);
    });
    if (currentMessage) collectFrom(currentMessage, "currentMessage", -1);
    if (messages.length === 0) {
        return {
            body,
            adapted: false,
            restore: (compressedBody)=>compressedBody
        };
    }
    return {
        body: {
            ...body,
            messages
        },
        adapted: true,
        restore (compressedBody) {
            // Build a path → rewritten text map from the synthesized tool messages.
            const rewrites = new Map();
            if (Array.isArray(compressedBody.messages)) {
                for (const message of compressedBody.messages){
                    const path = message[KIRO_TOOL_RESULT_PATH];
                    if (!path) continue;
                    let nextText = null;
                    if (typeof message.content === "string") {
                        nextText = message.content;
                    } else if (Array.isArray(message.content)) {
                        const firstText = message.content.find((part)=>isRecord(part) && typeof part.text === "string");
                        if (firstText) nextText = firstText.text;
                    }
                    if (nextText === null) continue;
                    rewrites.set(kiroPathKey(path), nextText);
                }
            }
            const nextState = {
                ...state
            };
            // Rebuild history with any rewritten tool-result text.
            if (history.length > 0) {
                nextState.history = history.map((entry, idx)=>{
                    if (!isRecord(entry)) return entry;
                    return rewriteKiroEntry(entry, "history", idx, rewrites);
                });
            }
            if (currentMessage) {
                nextState.currentMessage = rewriteKiroEntry(currentMessage, "currentMessage", -1, rewrites);
            }
            const rest = {
                ...compressedBody
            };
            delete rest.messages;
            return {
                ...rest,
                conversationState: nextState
            };
        }
    };
}
function kiroPathKey(path) {
    return `${path.scope}|${path.historyIndex}|${path.toolResultIndex}|${path.contentIndex}`;
}
function rewriteKiroEntry(entry, scope, historyIndex, rewrites) {
    const uim = entry.userInputMessage;
    if (!isRecord(uim)) return entry;
    const ctx = uim.userInputMessageContext;
    if (!isRecord(ctx)) return entry;
    const toolResults = ctx.toolResults;
    if (!Array.isArray(toolResults)) return entry;
    let entryChanged = false;
    const nextToolResults = toolResults.map((tr, trIdx)=>{
        if (!isRecord(tr)) return tr;
        const content = tr.content;
        if (!Array.isArray(content)) return tr;
        let trChanged = false;
        const nextContent = content.map((part, partIdx)=>{
            if (!isRecord(part) || typeof part.text !== "string") return part;
            const key = kiroPathKey({
                scope,
                historyIndex,
                toolResultIndex: trIdx,
                contentIndex: partIdx
            });
            const rewritten = rewrites.get(key);
            if (rewritten === undefined || rewritten === part.text) return part;
            trChanged = true;
            return {
                ...part,
                text: rewritten
            };
        });
        if (!trChanged) return tr;
        entryChanged = true;
        return {
            ...tr,
            content: nextContent
        };
    });
    if (!entryChanged) return entry;
    return {
        ...entry,
        userInputMessage: {
            ...uim,
            userInputMessageContext: {
                ...ctx,
                toolResults: nextToolResults
            }
        }
    };
}
}),
"[project]/open-sse/services/compression/toolResultCompressor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compressAnthropicToolResultBlock",
    ()=>compressAnthropicToolResultBlock,
    "compressToolResult",
    ()=>compressToolResult,
    "isAnthropicToolResultBlock",
    ()=>isAnthropicToolResultBlock
]);
const ANSI_RE = /\x1b\[[0-9;]*[a-zA-Z]/g;
const SHELL_PROMPT_RE = /\$\s/;
const JSON_PREFIX_RE = /^\s*[{[]/;
const COMPRESSED_MARKER_RE = /^\[COMPRESSED:/;
function isCodeLikeLine(rawLine) {
    const line = rawLine.trimStart();
    return line.startsWith("import ") || line.startsWith("export ") || line.startsWith("function ") || line.startsWith("class ") || line.startsWith("const ") || line.startsWith("let ") || line.startsWith("var ") || line.startsWith("return ") || line.startsWith("if(") || line.startsWith("if (") || line.startsWith("for(") || line.startsWith("for (") || line.startsWith("while(") || line.startsWith("while (");
}
function parseGrepLinePath(line) {
    const firstColon = line.indexOf(":");
    if (firstColon <= 0) return null;
    const secondColon = line.indexOf(":", firstColon + 1);
    if (secondColon === -1) return null;
    const lineNumber = line.slice(firstColon + 1, secondColon);
    if (!lineNumber || ![
        ...lineNumber
    ].every((char)=>char >= "0" && char <= "9")) {
        return null;
    }
    const filePath = line.slice(0, firstColon);
    if (!filePath || /\s/.test(filePath)) return null;
    return filePath;
}
function hasErrorLikeOutput(content) {
    const lower = content.toLowerCase();
    return lower.includes("error:") || lower.includes("error ") || lower.includes("[error]") || lower.includes("exception:") || lower.includes("exception ") || lower.includes("[exception]") || lower.includes("traceback");
}
function compressFileContent(content) {
    const lines = content.split("\n");
    if (lines.length < 3) return null;
    if (!lines.some(isCodeLikeLine)) return null;
    const keep = 20;
    const tail = 5;
    if (lines.length <= keep + tail) return content;
    const head = lines.slice(0, keep).join("\n");
    const tailLines = lines.slice(-tail).join("\n");
    const elided = lines.length - keep - tail;
    return `${head}\n… [${elided} lines elided] …\n${tailLines}`;
}
function compressGrepSearch(content) {
    const lines = content.split("\n");
    const grepLines = lines.filter((line)=>parseGrepLinePath(line) !== null);
    if (grepLines.length === 0) return null;
    const paths = new Set();
    for (const line of grepLines){
        const filePath = parseGrepLinePath(line);
        if (filePath) paths.add(filePath);
    }
    const top30 = grepLines.slice(0, 30);
    const remaining = grepLines.length - top30.length;
    let result = top30.join("\n");
    if (remaining > 0) {
        result += `\n… [${remaining} more matches]`;
    }
    result += `\nFiles: ${[
        ...paths
    ].join(", ")}`;
    return result;
}
function compressShellOutput(content) {
    const hasAnsi = ANSI_RE.test(content);
    const hasPrompt = SHELL_PROMPT_RE.test(content);
    if (!hasAnsi && !hasPrompt) return null;
    let cleaned = content.replace(ANSI_RE, "");
    const lines = cleaned.split("\n");
    const last50 = lines.slice(-50);
    const deduped = [];
    for (const line of last50){
        if (deduped.length === 0 || line !== deduped[deduped.length - 1]) {
            deduped.push(line);
        }
    }
    return deduped.join("\n");
}
function compressJson(content) {
    if (content.length <= 2000) return null;
    if (!JSON_PREFIX_RE.test(content)) return null;
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch  {
        return null;
    }
    if (Array.isArray(parsed)) {
        const arr = parsed;
        if (arr.length <= 7) return content;
        const head = arr.slice(0, 5);
        const tail = arr.slice(-2);
        return JSON.stringify({
            type: "array",
            total: arr.length,
            first5: head,
            last2: tail
        }, null, 2);
    }
    if (typeof parsed === "object" && parsed !== null) {
        const obj = parsed;
        const keys = Object.keys(obj);
        const summary = {};
        for (const key of keys.slice(0, 20)){
            const val = obj[key];
            if (typeof val === "object" && val !== null) {
                summary[key] = `{…${Object.keys(val).length} keys}`;
            } else {
                summary[key] = val;
            }
        }
        if (keys.length > 20) {
            summary[`_remaining_${keys.length - 20}_keys`] = true;
        }
        return JSON.stringify(summary, null, 2);
    }
    return null;
}
function compressErrorMessage(content) {
    if (!hasErrorLikeOutput(content)) return null;
    const lines = content.split("\n");
    const errorLine = lines[0] || "";
    const stackLines = lines.slice(1);
    const head = stackLines.slice(0, 10);
    const tail = stackLines.length > 10 ? stackLines.slice(-3) : [];
    const middle = stackLines.length > 13 ? [
        `… [${stackLines.length - 13} frames elided] …`
    ] : [];
    const result = [
        errorLine,
        ...head,
        ...middle,
        ...tail
    ].join("\n");
    return result;
}
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
function isAnthropicToolResultBlock(value) {
    return !!value && typeof value === "object" && value.type === "tool_result";
}
function compressAnthropicToolResultBlock(block, opts) {
    const content = block.content;
    if (typeof content === "string") {
        if (!content || COMPRESSED_MARKER_RE.test(content)) return {
            block,
            saved: 0
        };
        const result = compressToolResult(content, opts);
        if (result.strategy === "none" || result.saved <= 0) return {
            block,
            saved: 0
        };
        return {
            block: {
                ...block,
                content: result.compressed
            },
            saved: result.saved
        };
    }
    if (Array.isArray(content)) {
        let saved = 0;
        let changed = false;
        const nextContent = content.map((part)=>{
            if (!part || typeof part !== "object" || part.type !== "text" || typeof part.text !== "string") {
                return part;
            }
            const text = part.text;
            if (!text || COMPRESSED_MARKER_RE.test(text)) return part;
            const result = compressToolResult(text, opts);
            if (result.strategy === "none" || result.saved <= 0) return part;
            saved += result.saved;
            changed = true;
            return {
                ...part,
                text: result.compressed
            };
        });
        if (!changed) return {
            block,
            saved: 0
        };
        return {
            block: {
                ...block,
                content: nextContent
            },
            saved
        };
    }
    return {
        block,
        saved: 0
    };
}
function compressToolResult(content, opts) {
    if (opts.fileContent) {
        const result = compressFileContent(content);
        if (result !== null) {
            return {
                compressed: result,
                strategy: "fileContent",
                saved: estimateTokens(content) - estimateTokens(result)
            };
        }
    }
    if (opts.grepSearch) {
        const result = compressGrepSearch(content);
        if (result !== null) {
            return {
                compressed: result,
                strategy: "grepSearch",
                saved: estimateTokens(content) - estimateTokens(result)
            };
        }
    }
    if (opts.shellOutput) {
        const result = compressShellOutput(content);
        if (result !== null) {
            return {
                compressed: result,
                strategy: "shellOutput",
                saved: estimateTokens(content) - estimateTokens(result)
            };
        }
    }
    if (opts.json) {
        const result = compressJson(content);
        if (result !== null) {
            return {
                compressed: result,
                strategy: "json",
                saved: estimateTokens(content) - estimateTokens(result)
            };
        }
    }
    if (opts.errorMessage) {
        const result = compressErrorMessage(content);
        if (result !== null) {
            return {
                compressed: result,
                strategy: "errorMessage",
                saved: estimateTokens(content) - estimateTokens(result)
            };
        }
    }
    return {
        compressed: content,
        strategy: "none",
        saved: 0
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/verify.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "runRtkFilterTests",
    ()=>runRtkFilterTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/filterLoader.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$lineFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/lineFilter.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function trimComparable(value) {
    return value.replace(/\n+$/g, "");
}
function runRtkFilterTests(options = {}) {
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadRtkFilters"])({
        refresh: true,
        customFiltersEnabled: options.customFiltersEnabled,
        trustProjectFilters: options.trustProjectFilters
    });
    const outcomes = [];
    const filtersWithoutTests = [];
    const benchmarkByCategory = new Map();
    for (const filter of filters){
        const categoryStats = benchmarkByCategory.get(filter.category) ?? {
            filters: new Set(),
            tests: 0,
            savingsTotal: 0
        };
        categoryStats.filters.add(filter.id);
        benchmarkByCategory.set(filter.category, categoryStats);
        if (filter.tests.length === 0) {
            filtersWithoutTests.push(filter.id);
            continue;
        }
        for (const test of filter.tests){
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$lineFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLineFilter"])(test.input, filter).text;
            const actual = trimComparable(result);
            const expected = trimComparable(test.expected);
            const originalTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(test.input);
            const compressedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(result);
            const savings = originalTokens > 0 ? (originalTokens - compressedTokens) / originalTokens * 100 : 0;
            categoryStats.tests += 1;
            categoryStats.savingsTotal += Math.max(0, savings);
            outcomes.push({
                filterId: filter.id,
                testName: test.name,
                passed: actual === expected,
                actual,
                expected
            });
        }
    }
    const benchmark = Array.from(benchmarkByCategory.entries()).map(([category, value])=>({
            category,
            filters: value.filters.size,
            tests: value.tests,
            averageSavingsPercent: value.tests > 0 ? Math.round(value.savingsTotal / value.tests * 100) / 100 : 0
        })).sort((a, b)=>a.category.localeCompare(b.category));
    const failed = outcomes.some((outcome)=>!outcome.passed);
    return {
        passed: !failed && (!options.requireAll || filtersWithoutTests.length === 0),
        outcomes,
        filtersWithoutTests,
        benchmark,
        diagnostics: options.customFiltersEnabled === false ? [] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRtkFilterLoadDiagnostics"])()
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/engines/rtk/discover.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "discoverNormalizeLine",
    ()=>discoverNormalizeLine,
    "discoverRepeatedNoise",
    ()=>discoverRepeatedNoise
]);
/**
 * RTK discover — R7 / N7
 *
 * Pure function, no I/O.  DB wiring (reading from call_logs) is a follow-up task.
 * The function takes an in-memory array of CommandSample values so it can be
 * fully unit-tested with synthetic data.
 *
 * Finds line-templates that recur across many samples and are therefore good
 * DROP candidates (high-frequency noise) or PRESERVE candidates (errors/summaries).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$grouper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/grouper.ts [app-route] (ecmascript)");
;
function discoverNormalizeLine(line) {
    let s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$grouper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLine"])(line);
    // npm/pip package identifiers with version: word@version → <PKG>@<N>
    // Handles both original (left-pad@1.2.3) and already-normalised (left-pad@<N>)
    // Bounded quantifiers ({0,N}) are mandatory: `[\w]` ⊂ `[\w.-]` followed by a
    // required `@` is the classic catastrophic-backtracking shape on a long
    // word-char run with no `@` (CLAUDE.md ReDoS rule). Real package names are short.
    s = s.replace(/[\w][\w.-]{0,128}@(?:<N>|\d[\w.-]{0,64})/g, "<PKG>@<N>");
    // Error/exit codes like E404, ENOENT, E2BIG, EACCES
    s = s.replace(/\bE[A-Z0-9]{2,}\b/g, "<CODE>");
    // Numeric values with attached units: 5s, 120ms, 4kb, 12MB, 0.5s, etc.
    s = s.replace(/\b\d+(?:\.\d+)?(?:ms|[smhd]|[kmg]b?)\b/gi, "<N>");
    // Also collapse the already-substituted <N> followed by a unit suffix leftover
    s = s.replace(/<N>(?:ms|[smhd]|[kmg]b?)\b/gi, "<N>");
    // Collapse repeated whitespace again after substitutions
    s = s.replace(/\s+/g, " ").trim();
    return s;
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
/**
 * Convert a normalised line (with <N> placeholders) to a regex pattern that
 * is safe to use in `new RegExp(pattern, "i")`.
 *
 * Strategy:
 *   1. Escape all regex special chars in the normalised form.
 *   2. Replace the literal placeholder `<N>` (already normalised) with `[\S]+`
 *      so the pattern matches the volatile fragments in real lines.
 *   3. Anchor loosely with a leading `^` so it matches from the start of a line
 *      (RTK dropPatterns are matched line-by-line via a startsWith / ^-anchored regex).
 */ function normalizedToPattern(normalised) {
    // Escape regex special chars (< and > are not special, so placeholders survive intact)
    const escaped = normalised.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
    // Replace placeholder tokens with wildcard regex fragments
    const withWildcards = escaped.replace(/<N>/g, "[\\S]+").replace(/<PKG>/g, "[\\S]+").replace(/<CODE>/g, "[A-Z][A-Z0-9]+");
    return `^${withWildcards}`;
}
function discoverRepeatedNoise(samples) {
    if (samples.length === 0) return [];
    // Count how many samples contain each normalised line (at least once per sample).
    const hitsBySample = new Map();
    for(let i = 0; i < samples.length; i++){
        const lines = samples[i].output.split(/\r?\n/);
        const seenInThisSample = new Set();
        for (const raw of lines){
            const trimmed = raw.trim();
            if (trimmed.length === 0) continue;
            const norm = discoverNormalizeLine(trimmed);
            if (norm.length === 0) continue;
            if (seenInThisSample.has(norm)) continue; // count each normalised form once per sample
            seenInThisSample.add(norm);
            if (!hitsBySample.has(norm)) {
                hitsBySample.set(norm, new Set());
            }
            hitsBySample.get(norm).add(i);
        }
    }
    const candidates = [];
    for (const [norm, sampleSet] of hitsBySample){
        if (sampleSet.size <= 1) continue; // must appear in more than one sample
        candidates.push({
            pattern: normalizedToPattern(norm),
            hits: sampleSet.size
        });
    }
    // Sort descending by hits, then alphabetically for deterministic output
    candidates.sort((a, b)=>b.hits - a.hits || a.pattern.localeCompare(b.pattern));
    return candidates;
}
}),
"[project]/open-sse/services/compression/engines/rtk/learn.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "commandToId",
    ()=>commandToId,
    "suggestFilter",
    ()=>suggestFilter
]);
/**
 * RTK learn — R6 / N7
 *
 * Pure function, no I/O.  DB wiring (reading from call_logs) is a follow-up task.
 * Takes an in-memory array of CommandSample values → returns a suggested RTK
 * filter draft in the canonical RtkFilterPack shape (same JSON structure as
 * filters/pip.json, filters/make.json, etc.) so it can be reviewed and saved
 * as a real filter without conversion.
 *
 * Key design decisions
 * ───────────────────
 * 1. Drop threshold: a normalised line template is included in dropPatterns only if
 *    it recurs in ≥ DROP_THRESHOLD_RATIO of samples (default 50 %).  Single-sample
 *    noise is too specific to be useful as a filter rule.
 *
 * 2. Preserve-vs-drop conflict guard: a candidate drop pattern is silently omitted
 *    if it matches ANY line that also matches an error or summary preserve pattern.
 *    This is conservative by design — it's safer to miss a drop than to drop an
 *    important error/summary.
 *
 * 3. Error / summary heuristics (ACON-style):
 *    - errorPatterns: lines whose normalised form contains "error", "err!", "fail",
 *      "warning", "warn", "critical", "exception", "fatal", or "panic".
 *    - summaryPatterns: lines whose normalised form contains "success", "done",
 *      "complete", "built", "added", "installed", "finished", or "passed".
 *
 * 4. The output id/label is derived mechanically from the command string so the
 *    caller can save it directly without rename.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$discover$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/discover.ts [app-route] (ecmascript)");
;
// ---------------------------------------------------------------------------
// Internal constants and helpers
// ---------------------------------------------------------------------------
/**
 * A normalised line template must appear in at least this fraction of samples
 * to be included as a drop pattern.  50 % is conservative — it avoids flagging
 * lines that happen to appear in only a handful of runs.
 */ const DROP_THRESHOLD_RATIO = 0.5;
/**
 * Matched against the RAW (untrimmed) output line, case-insensitive.
 *
 * Error heuristic: lines that strongly signal a failure or warning worth
 * preserving.  "WARN deprecated" (npm deprecation noise) is deliberately
 * excluded — it is structural noise, not an actionable error signal.
 * We match "ERR!" (npm error prefix), "error:" / "error " patterns, etc.
 */ const ERROR_PATTERN = /(?:\bERR!|\berror\s*[:/]|\bfailed?\b|\bfailure\b|\bcritical\b|\bexception\b|\bfatal\b|\bpanic\b)/i;
/**
 * Matched against the RAW output line, case-insensitive.
 * Summary heuristic: lines that indicate a successful outcome or final tally.
 */ const SUMMARY_PATTERN = /(?:\bsuccess(?:ful(?:ly)?)?\b|\bdone\b|\bcomplete(?:d)?\b|\bbuilt\b|\badded\b|\binstalled\b|\bfinished?\b|\bpassed?\b)/i;
function commandToId(command) {
    return command.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
/**
 * Build a regex anchor pattern for the command so the filter's match.commands
 * array targets this specific invocation, e.g. "^npm\\s+install\\b".
 */ function commandToMatchPattern(command) {
    const parts = command.trim().split(/\s+/);
    const escaped = parts.map((p)=>p.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&"));
    return `^${escaped.join("\\s+")}\\b`;
}
/**
 * Test whether a raw output line (from any sample) is matched by any of the
 * given regex patterns.  Invalid patterns are silently skipped.
 */ function matchesAny(line, patterns) {
    for (const p of patterns){
        try {
            if (new RegExp(p, "i").test(line)) return true;
        } catch  {
        // ignore invalid regex
        }
    }
    return false;
}
function suggestFilter(command, samples) {
    const id = commandToId(command) || "unknown";
    const commandPattern = commandToMatchPattern(command);
    const totalSamples = samples.length;
    if (totalSamples === 0) {
        return {
            id: `suggested-${id}`,
            label: command,
            description: `Auto-suggested filter for '${command}' (0 samples — no rules derived).`,
            category: "generic",
            priority: 50,
            match: {
                outputTypes: [],
                commands: [
                    commandPattern
                ],
                patterns: []
            },
            rules: {
                stripAnsi: true,
                dropPatterns: [],
                collapsePatterns: [],
                includePatterns: [],
                deduplicate: true,
                maxLines: 200,
                headLines: 30,
                tailLines: 40,
                onEmpty: `${id}: ok`
            },
            preserve: {
                errorPatterns: [],
                summaryPatterns: []
            },
            _meta: {
                learnedFromSamples: 0,
                dropThreshold: DROP_THRESHOLD_RATIO
            }
        };
    }
    // ── Step 1: discover recurring noise candidates ──────────────────────────
    const noiseCandidates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$discover$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discoverRepeatedNoise"])(samples);
    const dropThresholdHits = Math.max(2, Math.ceil(totalSamples * DROP_THRESHOLD_RATIO));
    // ── Step 2: build error/summary preserve patterns from ALL lines ─────────
    // We scan every line in every sample and collect normalised forms that look
    // like errors or summaries.  Each unique normalised form becomes one pattern.
    const errorNorms = new Set();
    const summaryNorms = new Set();
    for (const sample of samples){
        for (const raw of sample.output.split(/\r?\n/)){
            const trimmed = raw.trim();
            if (!trimmed) continue;
            const norm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$discover$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discoverNormalizeLine"])(trimmed);
            if (!norm) continue;
            // Classify using the RAW line (before normalisation) so that textual
            // signals like "ERR!" and "added N packages" are not obscured by
            // placeholder substitutions like <CODE>.
            if (ERROR_PATTERN.test(trimmed)) {
                errorNorms.add(norm);
            } else if (SUMMARY_PATTERN.test(trimmed)) {
                summaryNorms.add(norm);
            }
        }
    }
    /**
   * Convert a set of normalised lines into regex patterns (same escaping as
   * normalizedToPattern in discover.ts, but re-implemented here to avoid
   * coupling to the internal helper).
   */ function normsToPatterns(norms) {
        return Array.from(norms).map((norm)=>{
            // Escape regex special chars (< and > are not special, so placeholders survive)
            const escaped = norm.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
            const withWildcards = escaped.replace(/<N>/g, "[\\S]+").replace(/<PKG>/g, "[\\S]+").replace(/<CODE>/g, "[A-Z][A-Z0-9]+");
            return withWildcards; // no ^ anchor: preserve patterns are substring-matched
        });
    }
    const errorPatterns = normsToPatterns(errorNorms);
    const summaryPatterns = normsToPatterns(summaryNorms);
    const allPreservePatterns = [
        ...errorPatterns,
        ...summaryPatterns
    ];
    // ── Step 3: filter noise candidates into safe drop patterns ─────────────
    // A candidate is safe to drop only if:
    //   (a) it recurs in >= dropThresholdHits samples, AND
    //   (b) its pattern does NOT match any preserve (error/summary) line from
    //       any sample (conflict guard).
    //
    // To apply the conflict guard we also collect all raw lines matched by
    // preserve patterns, then check each drop candidate against them.
    // Collect every raw line that any preserve pattern would protect.
    const preservedRawLines = [];
    for (const sample of samples){
        for (const raw of sample.output.split(/\r?\n/)){
            const trimmed = raw.trim();
            if (!trimmed) continue;
            if (matchesAny(trimmed, allPreservePatterns)) {
                preservedRawLines.push(trimmed);
            }
        }
    }
    const dropPatterns = [];
    for (const candidate of noiseCandidates){
        if (candidate.hits < dropThresholdHits) continue; // below threshold
        // Conflict guard: skip if the drop pattern matches a preserved line
        const conflictsWithPreserve = preservedRawLines.some((line)=>{
            try {
                return new RegExp(candidate.pattern, "i").test(line);
            } catch  {
                return false;
            }
        });
        if (conflictsWithPreserve) continue;
        dropPatterns.push(candidate.pattern);
    }
    return {
        id: `suggested-${id}`,
        label: command,
        description: `Auto-suggested filter for '${command}' learned from ${totalSamples} sample(s).`,
        category: "generic",
        priority: 50,
        match: {
            outputTypes: [],
            commands: [
                commandPattern
            ],
            patterns: []
        },
        rules: {
            stripAnsi: true,
            dropPatterns,
            collapsePatterns: [],
            includePatterns: [
                ...errorPatterns,
                ...summaryPatterns
            ],
            deduplicate: true,
            maxLines: 200,
            headLines: 30,
            tailLines: 40,
            onEmpty: `${id}: ok`
        },
        preserve: {
            errorPatterns,
            summaryPatterns
        },
        _meta: {
            learnedFromSamples: totalSamples,
            dropThreshold: DROP_THRESHOLD_RATIO
        }
    };
}
}),
"[project]/open-sse/services/compression/engines/rtk/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyRtkCompression",
    ()=>applyRtkCompression,
    "effectiveMaxLines",
    ()=>effectiveMaxLines,
    "processRtkText",
    ()=>processRtkText,
    "rtkEngine",
    ()=>rtkEngine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$commandDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/commandDetector.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/configSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$deduplicator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/deduplicator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$grouper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/grouper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/filterLoader.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$lineFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/lineFilter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$smartTruncate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/smartTruncate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$codeStripper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/codeStripper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$rawOutput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/rawOutput.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/renderers/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/bodyAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/toolResultCompressor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$verify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/verify.ts [app-route] (ecmascript)");
// RTK learn/discover: the sample-source adapter (rawOutput) feeds these pure miners.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$discover$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/discover.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$learn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/learn.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$verify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$verify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Same terminal-tool pattern as grok-web.ts isTerminalTool(): RTK's command-aware filters
// only apply to bash/shell tool results. Non-shell tools (read, glob, grep, edit, write…)
// skip filter matching to avoid content-based false positives (e.g. a .ts file matching
// the build-typescript filter).
const SHELL_TOOL_NAME_RE = /\b(bash|shell|terminal|run_command|execute_command|exec|command)\b/;
/**
 * A content block (or text sub-block) carrying `cache_control` is an explicit upstream
 * prompt-cache breakpoint — the provider caches the prefix up to and INCLUDING it. Rewriting
 * such a block's text invalidates that cached prefix every turn (guaranteed cache miss), the
 * "provider cache broken" regression once RTK started compressing Anthropic tool_result blocks.
 * So we preserve any cache_control-marked block byte-for-byte. (#3936: under caching, only ever
 * preserve more of the prefix — never rewrite a client-declared breakpoint.)
 */ function hasCacheControlMarker(part) {
    return !!part && typeof part === "object" && part.cache_control !== undefined && part.cache_control !== null;
}
/**
 * Resolve the shell command + whether to skip RTK filters for a tool result, given the
 * tool id (OpenAI `tool_call_id` / Anthropic `tool_use_id`) and the lookup built from the
 * preceding assistant tool calls. A missing entry runs filters with text-based command
 * detection; a non-shell tool name skips filters.
 */ function resolveToolMeta(toolId, lookup) {
    const meta = toolId ? lookup.get(toolId) : null;
    if (!meta) return {
        command: null,
        skipFilters: false
    };
    if (SHELL_TOOL_NAME_RE.test(meta.toolName.toLowerCase())) {
        return {
            command: meta.command,
            skipFilters: false
        };
    }
    return {
        command: null,
        skipFilters: true
    };
}
function mergeRtkConfig(base, override) {
    const merged = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"],
        ...base ?? {},
        ...override ?? {}
    };
    return {
        ...merged,
        intensity: merged.intensity === "minimal" || merged.intensity === "standard" || merged.intensity === "aggressive" ? merged.intensity : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].intensity,
        enabledFilters: Array.isArray(merged.enabledFilters) ? merged.enabledFilters.filter((id)=>typeof id === "string") : [],
        disabledFilters: Array.isArray(merged.disabledFilters) ? merged.disabledFilters.filter((id)=>typeof id === "string") : [],
        maxLinesPerResult: typeof merged.maxLinesPerResult === "number" && Number.isFinite(merged.maxLinesPerResult) ? Math.max(0, Math.floor(merged.maxLinesPerResult)) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].maxLinesPerResult,
        maxCharsPerResult: typeof merged.maxCharsPerResult === "number" && Number.isFinite(merged.maxCharsPerResult) ? Math.max(0, Math.floor(merged.maxCharsPerResult)) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].maxCharsPerResult,
        deduplicateThreshold: typeof merged.deduplicateThreshold === "number" && Number.isFinite(merged.deduplicateThreshold) ? Math.max(2, Math.floor(merged.deduplicateThreshold)) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].deduplicateThreshold,
        customFiltersEnabled: typeof merged.customFiltersEnabled === "boolean" ? merged.customFiltersEnabled : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].customFiltersEnabled,
        trustProjectFilters: typeof merged.trustProjectFilters === "boolean" ? merged.trustProjectFilters : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].trustProjectFilters,
        rawOutputRetention: merged.rawOutputRetention === "never" || merged.rawOutputRetention === "failures" || merged.rawOutputRetention === "always" ? merged.rawOutputRetention : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].rawOutputRetention,
        rawOutputMaxBytes: typeof merged.rawOutputMaxBytes === "number" && Number.isFinite(merged.rawOutputMaxBytes) ? Math.max(1024, Math.floor(merged.rawOutputMaxBytes)) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"].rawOutputMaxBytes
    };
}
function shouldCompressMessage(message, config) {
    // Anthropic-shape tool results live in (typically role:"user") messages as `tool_result`
    // content blocks — treat them like OpenAI tool messages (gated by applyToToolResults).
    if (config.applyToToolResults && Array.isArray(message.content) && message.content.some(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAnthropicToolResultBlock"])) return true;
    if (message.role === "tool") return config.applyToToolResults || config.applyToCodeBlocks && hasCodeFence(message.content);
    if (message.role === "assistant") return config.applyToAssistantMessages || config.applyToCodeBlocks && hasCodeFence(message.content);
    return false;
}
function hasCodeFence(content) {
    if (!content) return false;
    if (typeof content === "string") return /```/.test(content);
    if (!Array.isArray(content)) return false;
    return content.some((part)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTextBlock"])(part) && typeof part.text === "string" && /```/.test(part.text));
}
function codeOnlyConfig(config) {
    return config.applyToCodeBlocks && !config.applyToToolResults && !config.applyToAssistantMessages;
}
function processRtkCodeBlocksOnly(content, config) {
    const techniquesUsed = [];
    const rulesApplied = [];
    const rawOutputPointers = [];
    const processText = (text)=>{
        let compressed = false;
        const nextText = text.replace(/```([\s\S]*?)```/g, (match)=>{
            const processed = processRtkText(match, {
                config
            });
            techniquesUsed.push(...processed.techniquesUsed);
            rulesApplied.push(...processed.rulesApplied);
            if (processed.rawOutputPointers) rawOutputPointers.push(...processed.rawOutputPointers);
            if (!processed.compressed) return match;
            compressed = true;
            return processed.text;
        });
        return {
            text: compressed ? nextText : text,
            compressed
        };
    };
    if (typeof content === "string") {
        const processed = processText(content);
        return {
            content: processed.text,
            compressed: processed.compressed,
            techniquesUsed,
            rulesApplied,
            rawOutputPointers
        };
    }
    if (!Array.isArray(content)) {
        return {
            content,
            compressed: false,
            techniquesUsed,
            rulesApplied,
            rawOutputPointers
        };
    }
    let compressed = false;
    const nextContent = content.map((part)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTextBlock"])(part) || !part.text) return part;
        const processed = processText(part.text);
        if (!processed.compressed) return part;
        compressed = true;
        return {
            ...part,
            text: processed.text
        };
    });
    return {
        content: compressed ? nextContent : content,
        compressed,
        techniquesUsed,
        rulesApplied,
        rawOutputPointers
    };
}
function processRtkText(text, options = {}) {
    const config = mergeRtkConfig(options.config);
    const originalTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(text);
    const techniquesUsed = [];
    const rulesApplied = [];
    const rawOutputPointers = [];
    let result = text;
    const detection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$commandDetector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCommandType"])(text, options.command);
    // #4559: A document/file read (e.g. a Read tool returning a ~147-line code/prose
    // file) is NOT repetitive command output, but the generic-output *fallback* filter
    // and the final line/char hard-cap (designed for npm/make/docker logs) silently drop
    // its middle. Treat content as a document read when RTK recognized no command,
    // classified it "unknown", and it carries none of the generic error markers the
    // generic-output filter keys on — then skip the truncating fallbacks. Genuine logs
    // detect as a known command type (or carry a command / error markers), so RTK's
    // value on those is preserved.
    const hasGenericErrorMarkers = /Error:|Exception:|Traceback \(most recent call last\):/.test(text);
    const isDocumentLikeRead = detection.type === "unknown" && !detection.command && !hasGenericErrorMarkers;
    let matchedFilterPatterns = [];
    if (!options.skipFilters && !isDocumentLikeRead) {
        const filter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$filterLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matchRtkFilter"])(text, detection.command, {
            customFiltersEnabled: config.customFiltersEnabled,
            trustProjectFilters: config.trustProjectFilters
        });
        if (filter && !config.disabledFilters.includes(filter.id)) {
            if (config.enabledFilters.length === 0 || config.enabledFilters.includes(filter.id)) {
                const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$lineFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLineFilter"])(result, {
                    ...filter,
                    maxLines: effectiveMaxLines(filter.maxLines || config.maxLinesPerResult, config.intensity)
                });
                result = filtered.text;
                if (filtered.appliedRules.length > 0) {
                    techniquesUsed.push("rtk-filter");
                    rulesApplied.push(...filtered.appliedRules);
                }
                matchedFilterPatterns = filter.priorityPatterns;
            }
        }
    }
    // #10: semantic renderers — opt-in via enableRenderers flag (default OFF), fail-open
    if (config.enableRenderers) {
        try {
            const rendered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$renderers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyRenderer"])(result, detection, config);
            if (rendered.changed) {
                result = rendered.text;
                techniquesUsed.push(`rtk-render:${rendered.renderer}`);
                rulesApplied.push(`rtk:render:${rendered.renderer}`);
            }
        } catch  {
        // fail-open: renderer never brings down the request
        }
    }
    if (config.applyToCodeBlocks) {
        let strippedCodeBlocks = 0;
        result = result.replace(/```([A-Za-z0-9_+.-]*)\r?\n([\s\S]*?)```/g, (match, languageHint, code)=>{
            const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$codeStripper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripCode"])(code, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$codeStripper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCodeLanguage"])(languageHint), {
                // Opt-in comment removal (default off = no silent production change). Docstrings/JSDoc
                // are preserved unless explicitly disabled.
                removeComments: config.stripCodeComments === true,
                preserveDocstrings: config.preserveDocstrings !== false
            });
            if (stripped.strippedLines <= 0 && stripped.text === code.trim()) return match;
            strippedCodeBlocks++;
            const fenceLanguage = languageHint?.trim() || stripped.language;
            return `\`\`\`${fenceLanguage}\n${stripped.text}\n\`\`\``;
        });
        if (strippedCodeBlocks > 0) {
            techniquesUsed.push("rtk-code-strip");
            rulesApplied.push("rtk:code-strip");
        }
    }
    const deduped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$deduplicator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deduplicateRepeatedLines"])(result, {
        threshold: config.deduplicateThreshold
    });
    if (deduped.collapsed > 0) {
        result = deduped.text;
        techniquesUsed.push("rtk-dedup");
        rulesApplied.push("rtk:dedup");
    }
    // R5: grouping — opt-in via enableGrouping flag (default OFF)
    if (config.enableGrouping) {
        const grouped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$grouper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["groupSimilarLines"])(result, {
            threshold: config.groupingThreshold
        });
        if (grouped.grouped > 0) {
            result = grouped.text;
            techniquesUsed.push("rtk-grouping");
            rulesApplied.push("rtk:grouping");
        }
    }
    const defaultPriorityPatterns = [
        /error|failed|exception|traceback|TS\d{4}|FAIL|✖/i
    ];
    const filterPriorityPatterns = matchedFilterPatterns.flatMap((pattern)=>{
        try {
            return [
                new RegExp(pattern, "i")
            ];
        } catch  {
            return [];
        }
    });
    // #4559: skip the generic line/char hard-cap for document/file reads (see
    // isDocumentLikeRead above) so the middle of a code/prose read is not dropped.
    const truncated = isDocumentLikeRead ? {
        text: result,
        truncated: false,
        droppedLines: 0
    } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$smartTruncate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["smartTruncate"])(result, {
        maxLines: effectiveMaxLines(config.maxLinesPerResult, config.intensity),
        maxChars: config.maxCharsPerResult,
        preserveHead: config.intensity === "aggressive" ? 16 : 24,
        preserveTail: config.intensity === "aggressive" ? 16 : 24,
        priorityPatterns: [
            ...defaultPriorityPatterns,
            ...filterPriorityPatterns
        ]
    });
    if (truncated.truncated) {
        result = truncated.text;
        techniquesUsed.push("rtk-truncate");
        rulesApplied.push("rtk:truncate");
    }
    const compressedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(result);
    if (compressedTokens < originalTokens) {
        const pointer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$rawOutput$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybePersistRtkRawOutput"])(text, {
            retention: config.rawOutputRetention,
            command: detection.command,
            maxBytes: config.rawOutputMaxBytes
        });
        if (pointer) {
            rawOutputPointers.push(pointer);
            techniquesUsed.push("rtk-raw-output-retention");
            rulesApplied.push("rtk:raw-output-retention");
        }
    }
    return {
        text: result,
        compressed: compressedTokens < originalTokens,
        originalTokens,
        compressedTokens,
        techniquesUsed: [
            ...new Set(techniquesUsed)
        ],
        rulesApplied: [
            ...new Set(rulesApplied)
        ],
        ...rawOutputPointers.length > 0 ? {
            rawOutputPointers
        } : {}
    };
}
/**
 * Compress the text inside Anthropic-shape `tool_result` content blocks (string or nested
 * text-block content), resolving the shell command per block from its `tool_use_id`. The
 * block type and `tool_use_id` are preserved exactly — only the inner text is rewritten.
 */ function processToolResultBlocks(content, config, toolCallLookup) {
    const techniquesUsed = [];
    const rulesApplied = [];
    const rawOutputPointers = [];
    if (!Array.isArray(content)) {
        return {
            content,
            compressed: false,
            techniquesUsed,
            rulesApplied,
            rawOutputPointers
        };
    }
    const collect = (processed)=>{
        techniquesUsed.push(...processed.techniquesUsed);
        rulesApplied.push(...processed.rulesApplied);
        if (processed.rawOutputPointers) rawOutputPointers.push(...processed.rawOutputPointers);
    };
    let compressed = false;
    const nextContent = content.map((part)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAnthropicToolResultBlock"])(part)) return part;
        // The block itself is a cache breakpoint — preserve it byte-for-byte.
        if (hasCacheControlMarker(part)) return part;
        const toolUseId = typeof part.tool_use_id === "string" ? part.tool_use_id : null;
        const { command, skipFilters } = resolveToolMeta(toolUseId, toolCallLookup);
        const inner = part.content;
        if (typeof inner === "string") {
            if (!inner) return part;
            const processed = processRtkText(inner, {
                config,
                command,
                skipFilters
            });
            collect(processed);
            if (!processed.compressed) return part;
            compressed = true;
            return {
                ...part,
                content: processed.text
            };
        }
        if (Array.isArray(inner)) {
            let blockChanged = false;
            const nextInner = inner.map((sub)=>{
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTextBlock"])(sub) || !sub.text) return sub;
                // A text sub-block can carry its own cache breakpoint — preserve it byte-for-byte.
                if (hasCacheControlMarker(sub)) return sub;
                const processed = processRtkText(sub.text, {
                    config,
                    command,
                    skipFilters
                });
                collect(processed);
                if (!processed.compressed) return sub;
                blockChanged = true;
                compressed = true;
                return {
                    ...sub,
                    text: processed.text
                };
            });
            return blockChanged ? {
                ...part,
                content: nextInner
            } : part;
        }
        return part;
    });
    return {
        content: compressed ? nextContent : content,
        compressed,
        techniquesUsed,
        rulesApplied,
        rawOutputPointers
    };
}
function processRtkContent(content, config, options) {
    if (codeOnlyConfig(config)) {
        return processRtkCodeBlocksOnly(content, config);
    }
    const techniquesUsed = [];
    const rulesApplied = [];
    const rawOutputPointers = [];
    const collect = (processed)=>{
        techniquesUsed.push(...processed.techniquesUsed);
        rulesApplied.push(...processed.rulesApplied);
        if (processed.rawOutputPointers) rawOutputPointers.push(...processed.rawOutputPointers);
    };
    if (typeof content === "string") {
        if (!content) {
            return {
                content,
                compressed: false,
                techniquesUsed,
                rulesApplied,
                rawOutputPointers
            };
        }
        const processed = processRtkText(content, {
            config,
            command: options?.command,
            skipFilters: options?.skipFilters
        });
        collect(processed);
        return {
            content: processed.compressed ? processed.text : content,
            compressed: processed.compressed,
            techniquesUsed,
            rulesApplied,
            rawOutputPointers
        };
    }
    if (!Array.isArray(content)) {
        return {
            content,
            compressed: false,
            techniquesUsed,
            rulesApplied,
            rawOutputPointers
        };
    }
    let compressed = false;
    const nextContent = content.map((part)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTextBlock"])(part) || !part.text) return part;
        const processed = processRtkText(part.text, {
            config,
            command: options?.command,
            skipFilters: options?.skipFilters
        });
        collect(processed);
        if (!processed.compressed) return part;
        compressed = true;
        return {
            ...part,
            text: processed.text
        };
    });
    return {
        content: compressed ? nextContent : content,
        compressed,
        techniquesUsed,
        rulesApplied,
        rawOutputPointers
    };
}
function effectiveMaxLines(base, intensity) {
    const factor = intensity === "aggressive" ? 0.5 : intensity === "minimal" ? 1.5 : 1;
    return Math.max(1, Math.round(base * factor));
}
function applyRtkCompression(body, options = {}) {
    const start = performance.now();
    const stepConfig = options.stepConfig && options.stepConfig.enabled === undefined ? {
        enabled: true,
        ...options.stepConfig
    } : options.stepConfig;
    const explicitConfig = options.config && Object.keys(options.config).length > 0;
    const baseConfig = !explicitConfig && !stepConfig ? {
        enabled: true
    } : options.config ?? {};
    const config = mergeRtkConfig(baseConfig, stepConfig);
    if (!config.enabled) return {
        body,
        compressed: false,
        stats: null
    };
    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
    const messages = adapter.body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
        return {
            body,
            compressed: false,
            stats: null
        };
    }
    const allTechniques = [];
    const allRules = [];
    const rawOutputPointers = [];
    // Build tool_call_id → tool metadata lookup from assistant messages.
    // This lets us distinguish bash tool results (which RTK filters are designed for)
    // from non-shell tool results (read, grep, glob, etc.) that should skip filters.
    const toolCallLookup = new Map();
    for (const msg of messages){
        if (msg.role !== "assistant") continue;
        // OpenAI-shape: assistant.tool_calls[].function.{name, arguments(JSON).command}
        const toolCalls = msg.tool_calls;
        if (Array.isArray(toolCalls)) {
            for (const tc of toolCalls){
                if (!tc || typeof tc !== "object") continue;
                const id = typeof tc.id === "string" ? tc.id : null;
                if (!id) continue;
                const fn = tc.function;
                if (!fn || typeof fn !== "object") continue;
                const toolName = typeof fn.name === "string" ? fn.name : "";
                let command = null;
                if (typeof fn.arguments === "string") {
                    try {
                        const args = JSON.parse(fn.arguments);
                        command = typeof args.command === "string" ? args.command : typeof args.cmd === "string" ? args.cmd : null;
                    } catch  {
                    // non-JSON arguments
                    }
                }
                toolCallLookup.set(id, {
                    toolName,
                    command
                });
            }
        }
        // Anthropic-shape: assistant.content[] holds { type:"tool_use", id, name, input.command }.
        if (Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (!part || typeof part !== "object" || part.type !== "tool_use") continue;
                const id = typeof part.id === "string" ? part.id : null;
                if (!id) continue;
                const toolName = typeof part.name === "string" ? part.name : "";
                const input = part.input;
                let command = null;
                if (input && typeof input === "object") {
                    command = typeof input.command === "string" ? input.command : typeof input.cmd === "string" ? input.cmd : null;
                }
                toolCallLookup.set(id, {
                    toolName,
                    command
                });
            }
        }
    }
    const compressedMessages = messages.map((message)=>{
        if (!shouldCompressMessage(message, config)) return message;
        // Anthropic-shape tool results: `tool_result` content blocks inside a (typically
        // role:"user") message. Compress each block's inner text, resolving the shell command
        // per block from the matching assistant `tool_use` (mirrors the OpenAI tool path).
        if (Array.isArray(message.content) && message.content.some(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAnthropicToolResultBlock"])) {
            const processed = processToolResultBlocks(message.content, config, toolCallLookup);
            allTechniques.push(...processed.techniquesUsed);
            allRules.push(...processed.rulesApplied);
            rawOutputPointers.push(...processed.rawOutputPointers);
            if (!processed.compressed) return message;
            return {
                ...message,
                content: processed.content
            };
        }
        // OpenAI-shape tool message: resolve metadata from the preceding assistant tool_calls.
        let command = null;
        let skipFilters = false;
        if (message.role === "tool") {
            const callId = typeof message.tool_call_id === "string" ? message.tool_call_id : null;
            ({ command, skipFilters } = resolveToolMeta(callId, toolCallLookup));
        }
        const processed = processRtkContent(message.content, config, {
            command,
            skipFilters
        });
        allTechniques.push(...processed.techniquesUsed);
        allRules.push(...processed.rulesApplied);
        rawOutputPointers.push(...processed.rawOutputPointers);
        if (!processed.compressed) return message;
        return {
            ...message,
            content: processed.content
        };
    });
    const compressedBody = {
        ...adapter.body,
        messages: compressedMessages
    };
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(adapter.body, compressedBody, "rtk", [
        ...new Set(allTechniques)
    ], allRules.length > 0 ? [
        ...new Set(allRules)
    ] : undefined, Math.round((performance.now() - start) * 100) / 100);
    stats.engine = "rtk";
    if (rawOutputPointers.length > 0) {
        stats.rtkRawOutputPointers = rawOutputPointers;
    }
    return {
        body: adapter.restore(compressedBody),
        compressed: stats.compressedTokens < stats.originalTokens,
        stats
    };
}
const rtkEngine = {
    id: "rtk",
    name: "RTK",
    description: "Command-aware tool output compression with declarative filters.",
    icon: "filter_alt",
    targets: [
        "tool_results",
        "code_blocks"
    ],
    stackable: true,
    stackPriority: 10,
    metadata: {
        id: "rtk",
        name: "RTK",
        description: "Command-aware tool output compression with declarative filters.",
        inputScope: "tool-results",
        targetLatencyMs: 5,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        return applyRtkCompression(body, {
            config: options?.config?.rtkConfig,
            stepConfig: options?.stepConfig
        });
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RTK_SCHEMA"];
    },
    validateConfig (config) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateRtkEngineConfig"])(config);
    }
};
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/engines/mcpAccessibility/collapseRepeated.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collapseRepeated",
    ()=>collapseRepeated,
    "extractRefs",
    ()=>extractRefs,
    "findLastNSiblingStart",
    ()=>findLastNSiblingStart,
    "findNthSiblingEnd",
    ()=>findNthSiblingEnd
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/mcpAccessibility/constants.ts [app-route] (ecmascript)");
;
const SIBLING_PATTERN = /^(\s*)-\s*([a-zA-Z]+)\b/;
function extractRefs(text) {
    const seen = new Set();
    const refs = [];
    // Fresh regex per call: the shared pattern carries the global flag (stateful lastIndex).
    const pattern = new RegExp(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MCP_ACCESSIBILITY_DEFAULTS"].preserveRefPattern.source, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MCP_ACCESSIBILITY_DEFAULTS"].preserveRefPattern.flags);
    for (const m of text.matchAll(pattern)){
        if (!seen.has(m[0])) {
            seen.add(m[0]);
            refs.push(m[0]);
        }
    }
    return refs;
}
function findNthSiblingEnd(lines, start, indent, role, n) {
    let count = 0;
    for(let k = start; k < lines.length; k++){
        const mm = lines[k].match(SIBLING_PATTERN);
        if (mm && mm[1] === indent && mm[2] === role) {
            count++;
            if (count > n) return k;
        }
    }
    return lines.length;
}
function findLastNSiblingStart(lines, end, indent, role, n) {
    const positions = [];
    for(let k = 0; k < end; k++){
        const mm = lines[k].match(SIBLING_PATTERN);
        if (mm && mm[1] === indent && mm[2] === role) positions.push(k);
    }
    return positions.length >= n ? positions[positions.length - n] : end;
}
function collapseRepeated(text, threshold, keepHead, keepTail) {
    const lines = text.split("\n");
    const out = [];
    let i = 0;
    while(i < lines.length){
        const line = lines[i];
        const m = line.match(SIBLING_PATTERN);
        if (!m) {
            out.push(line);
            i++;
            continue;
        }
        const indent = m[1];
        const role = m[2];
        let j = i;
        while(j < lines.length){
            const ln = lines[j];
            const mm = ln.match(SIBLING_PATTERN);
            if (mm && mm[1] === indent && mm[2] === role) {
                j++;
                continue;
            }
            if (ln.startsWith(`${indent} `) || ln.startsWith(`${indent}\t`)) {
                j++;
                continue;
            }
            // A blank line (noise removal can leave these) must not break a sibling run.
            if (ln.trim() === "") {
                j++;
                continue;
            }
            break;
        }
        const groupLen = j - i;
        if (groupLen >= threshold) {
            const headEnd = findNthSiblingEnd(lines, i, indent, role, keepHead);
            const tailStart = findLastNSiblingStart(lines.slice(0, j), j, indent, role, keepTail);
            for(let k = i; k < headEnd; k++)out.push(lines[k]);
            out.push(`${indent}... [${groupLen - keepHead - keepTail} similar "${role}" items omitted by OmniRoute MCP filter]`);
            // BUG A invariant: the omitted middle siblings carry [ref=eNN] anchors the agent needs to
            // click. Extract every ref from the dropped lines and keep them alongside the notice so
            // extractRefs(input) ⊆ extractRefs(output) always holds.
            const omittedRefs = extractRefs(lines.slice(headEnd, tailStart).join("\n"));
            if (omittedRefs.length > 0) {
                out.push(`${indent}  [refs of omitted "${role}" items (clickable): ${omittedRefs.join(" ")}]`);
            }
            for(let k = tailStart; k < j; k++)out.push(lines[k]);
        } else {
            for(let k = i; k < j; k++)out.push(lines[k]);
        }
        i = j;
    }
    return out.join("\n");
}
}),
"[project]/open-sse/services/compression/engines/mcpAccessibility/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "smartFilterText",
    ()=>smartFilterText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$collapseRepeated$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/mcpAccessibility/collapseRepeated.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/mcpAccessibility/constants.ts [app-route] (ecmascript)");
;
;
// Per-line (non-global, anchored) noise matchers. Used to DELETE whole noise lines rather than
// blank them: `replace(pattern, "")` would leave empty strings behind, and a blank line between two
// sibling headers breaks collapseRepeated's sibling run (an empty line is neither a sibling header
// nor an indented child), so collapse would never fire on realistic interleaved trees.
const NOISE_LINE_PATTERNS = [
    /^\s*-\s*generic:?\s*$/,
    /^\s*-\s*text:\s*""\s*$/
];
function isNoiseLine(line) {
    return NOISE_LINE_PATTERNS.some((p)=>p.test(line));
}
function smartFilterText(text, config) {
    if (typeof text !== "string" || text.length < config.minLengthToProcess) {
        return text;
    }
    // Drop noise lines entirely (not blank them) so interleaved noise does not split sibling runs.
    let out = text.split("\n").filter((line)=>!isNoiseLine(line)).join("\n");
    out = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$collapseRepeated$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collapseRepeated"])(out, config.collapseThreshold, config.collapseKeepHead, config.collapseKeepTail);
    if (out.length > config.maxTextChars) {
        // Clamp to >=0: a maxTextChars below the tail reservation would make headSize negative, and
        // slice(0, negative) counts from the END — silently keeping a wrong, oversized fragment
        // instead of the intended head. (clampMcpAccessibilityConfig keeps maxTextChars sane, but
        // smartFilterText is also called with raw configs in tests, so the clamp stays here too.)
        const headSize = Math.max(0, config.maxTextChars - __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MCP_ACCESSIBILITY_TAIL_RESERVE"]);
        const head = out.slice(0, headSize);
        // Measure omitted against the FILTERED text (out), not the raw input (text), which may
        // have shrunk via noise removal / collapse above.
        const omitted = out.length - head.length;
        out = `${head}\n\n... [truncated ${omitted} chars by OmniRoute MCP filter. ` + `Page is large; ask user to scroll/navigate to a specific section, or click an element with the refs shown above]`;
    }
    return out;
}
;
}),
];

//# sourceMappingURL=open-sse_services_compression_1ews876._.js.map