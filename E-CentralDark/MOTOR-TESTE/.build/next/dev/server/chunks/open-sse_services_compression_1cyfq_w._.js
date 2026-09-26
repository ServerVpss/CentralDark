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
"[project]/open-sse/services/compression/hardBudget.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Hard-budget post-pass (#17): compress to ≤ N cl100k tokens.
 *
 * Deterministic, independent of the relevance engine. Splits prose into
 * sentences/lines, ranks by average scoreToken ascending, drops the lowest-
 * saliency units until the body fits the target, then reconstructs original order.
 * Units containing FORCE_PRESERVE_RE anchors (errors, numbers, URLs, code) are
 * never dropped.
 */ __turbopack_context__.s([
    "applyHardBudget",
    ()=>applyHardBudget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/ultraHeuristic.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/tiktokenCounter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
;
;
;
/**
 * Units containing these patterns must never be dropped.
 * Anchored to meaningful signals only — never matches a bare end-of-sentence
 * period (which would make every prose line "preserve" → permanent no-op):
 *   - `\d`                      digits (numbers, line refs, ports)
 *   - `https?:\/\/`             URLs
 *   - `(?:Error|…|Traceback):`  error/exception headers
 *   - "```"                    code fences
 *   - `^\s*at\s`                stack-trace frames (digit-less)
 *   - `\/[\w.-]+\/`             real multi-segment paths (but NOT "and/or")
 *   - `[A-Za-z_]\w*=\S`         key=value (credential/config lines, digit-less)
 */ const UNIT_PRESERVE_RE = /\d|https?:\/\/|(?:Error|Exception|TypeError|RangeError|SyntaxError|ReferenceError|Traceback):|```|^\s*at\s|\/[\w.-]+\/|[A-Za-z_]\w*=\S/i;
/** Average scoreToken for each word in the unit (sentence/line). */ function scoreUnit(unit) {
    const words = unit.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0.5;
    const total = words.reduce((sum, w)=>sum + (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreToken"])(w), 0);
    return total / words.length;
}
/** Returns true when the unit must never be dropped. */ function mustPreserve(unit) {
    return UNIT_PRESERVE_RE.test(unit);
}
/**
 * Split text into droppable units (lines, optionally sentence-split for long prose lines).
 */ function splitUnits(text) {
    return text.split(/\n/).flatMap((line)=>{
        if (line.trim() === "") return [
            line
        ];
        // Only sentence-split pure prose lines (no numbers, URLs, error patterns, code)
        if (!UNIT_PRESERVE_RE.test(line) && line.length > 60) {
            const sentences = line.split(/(?<=[.!?])\s+/);
            return sentences.length > 1 ? sentences : [
                line
            ];
        }
        return [
            line
        ];
    });
}
function tagUnits(units, tokenizerContext) {
    return units.map((u, i)=>({
            i,
            u,
            tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(u, tokenizerContext),
            score: scoreUnit(u),
            preserve: mustPreserve(u)
        }));
}
function dropToTarget(tagged, targetTokens) {
    const dropped = new Set();
    let tokCount = tagged.reduce((s, x)=>s + x.tokens, 0);
    // Sort droppable candidates by score ascending (lowest first = drop first)
    const candidates = tagged.filter((x)=>!x.preserve).sort((a, b)=>a.score - b.score);
    for (const candidate of candidates){
        if (tokCount <= targetTokens) break;
        dropped.add(candidate.i);
        tokCount -= candidate.tokens;
    }
    return dropped;
}
function rebuildText(tagged, dropped) {
    return tagged.filter((x)=>!dropped.has(x.i)).map((x)=>x.u).join("\n");
}
function compressText(text, targetTokens, tokenizerContext) {
    const currentTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(text, tokenizerContext);
    if (currentTokens <= targetTokens) return text;
    const units = splitUnits(text);
    if (units.length <= 1) return text;
    const tagged = tagUnits(units, tokenizerContext);
    const dropped = dropToTarget(tagged, targetTokens);
    if (dropped.size === 0) return text;
    return rebuildText(tagged, dropped);
}
function extractMessages(body) {
    const msgs = body.messages;
    if (!Array.isArray(msgs)) return [];
    return msgs;
}
function applyHardBudget(body, opts) {
    const { targetTokens, targetRatio } = opts;
    if (targetTokens == null && targetRatio == null) {
        return {
            body,
            compressed: false,
            stats: null
        };
    }
    const messages = extractMessages(body);
    if (messages.length === 0) return {
        body,
        compressed: false,
        stats: null
    };
    const tokenizerContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokenizerContextFromBody"])(body);
    // Measure total tokens across all messages
    const totalText = messages.map((m)=>typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" ");
    const totalTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(totalText, tokenizerContext);
    // targetTokens wins when both are set
    const effectiveTarget = targetTokens != null ? targetTokens : Math.floor(totalTokens * targetRatio);
    if (totalTokens <= effectiveTarget) {
        return {
            body,
            compressed: false,
            stats: null
        };
    }
    // Distribute the aggregate budget proportionally per message so the SUM stays
    // ≤ target (passing the full target to each message would let an N-message body
    // come back N× over budget).
    const newMessages = messages.map((m)=>{
        if (typeof m.content !== "string") return m;
        const msgTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(m.content, tokenizerContext);
        const perMsgTarget = totalTokens > 0 ? Math.floor(effectiveTarget * (msgTokens / totalTokens)) : effectiveTarget;
        const out = compressText(m.content, perMsgTarget, tokenizerContext);
        return out === m.content ? m : {
            ...m,
            content: out
        };
    });
    const changed = newMessages.some((m, i)=>JSON.stringify(m) !== JSON.stringify(messages[i]));
    // Measure the result to detect when preserve-guarded content makes the target
    // unreachable, so callers are not silently left over budget.
    const usedMessages = changed ? newMessages : messages;
    const resultTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(usedMessages.map((m)=>typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" "), tokenizerContext);
    const overBudget = resultTokens > effectiveTarget;
    // Nothing changed and we are within budget → genuine no-op.
    if (!changed && !overBudget) {
        return {
            body,
            compressed: false,
            stats: null
        };
    }
    const newBody = changed ? {
        ...body,
        messages: newMessages
    } : body;
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
        "hard-budget"
    ]);
    if (overBudget) {
        const warning = `hard-budget: could not reach target (${resultTokens} > ${effectiveTarget}; preserved content exceeds budget)`;
        stats.validationWarnings = [
            ...stats.validationWarnings ?? [],
            warning
        ];
    }
    return {
        body: newBody,
        compressed: changed,
        stats
    };
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
"[project]/open-sse/services/compression/fidelityGate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkFidelity",
    ()=>checkFidelity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
;
const CRITICAL_KINDS = new Set([
    "url",
    "const_case",
    "env_var",
    "version",
    "dotted_identifier",
    "function_call",
    "file_path",
    "inline_code"
]);
// Anti-ReDoS: all quantifiers are bounded.
// NUMERIC_RE matches a number plus any trailing run of digits/dots/commas (e.g. "1,3" in a diff
// hunk, "1," in JSON). This is intentional: comparing the same literal slice in input vs output
// keeps the check structural-aware and ReDoS-bounded ({0,40}).
const NUMERIC_RE = /\d[\d.,]{0,40}/g;
const JSON_KEY_RE = /"([A-Za-z_$][\w$-]{0,80})"\s*:/g;
const HUNK_RE = /@@ -\d{1,9}(?:,\d{1,9})? \+\d{1,9}(?:,\d{1,9})? @@/g;
function survivalRatio(needles, haystack) {
    if (needles.length === 0) return 1;
    let survived = 0;
    for (const n of needles)if (haystack.includes(n)) survived++;
    return survived / needles.length;
}
function uniq(values) {
    return Array.from(new Set(values));
}
function checkFidelity(inputText, outputText, cfg) {
    try {
        const tokens = uniq((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(inputText).blocks.filter((b)=>CRITICAL_KINDS.has(b.kind)).map((b)=>b.content.trim()).filter((c)=>c.length > 0));
        const minTok = (cfg.minTokenSurvivalPercent ?? 95) / 100;
        const tokRatio = survivalRatio(tokens, outputText);
        if (tokRatio < minTok) {
            return {
                passed: false,
                failedInvariant: "protected-tokens",
                detail: `tokens protegidos ${Math.round(tokRatio * 100)}% < ${Math.round(minTok * 100)}%`
            };
        }
        if (cfg.checkDiffHunks !== false) {
            for (const h of uniq(inputText.match(HUNK_RE) ?? [])){
                if (!outputText.includes(h)) {
                    return {
                        passed: false,
                        failedInvariant: "diff-hunks",
                        detail: `hunk "${h}" ausente no output`
                    };
                }
            }
        }
        if (cfg.checkNumericIntegrity !== false) {
            for (const num of uniq(inputText.match(NUMERIC_RE) ?? [])){
                if (!outputText.includes(num)) {
                    return {
                        passed: false,
                        failedInvariant: "numeric",
                        detail: `número "${num}" ausente no output`
                    };
                }
            }
        }
        const keys = uniq(Array.from(inputText.matchAll(JSON_KEY_RE), (m)=>m[1]));
        if (keys.length > 0) {
            const minKey = (cfg.minJsonKeyPercent ?? 90) / 100;
            const keyRatio = survivalRatio(keys.map((k)=>`"${k}"`), outputText);
            if (keyRatio < minKey) {
                return {
                    passed: false,
                    failedInvariant: "json-keys",
                    detail: `chaves JSON ${Math.round(keyRatio * 100)}% < ${Math.round(minKey * 100)}%`
                };
            }
        }
        return {
            passed: true
        };
    } catch  {
        return {
            passed: true
        };
    }
}
}),
"[project]/open-sse/services/compression/engines/registry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCompressionEngineRegistry",
    ()=>clearCompressionEngineRegistry,
    "getCompressionEngine",
    ()=>getCompressionEngine,
    "getEngine",
    ()=>getEngine,
    "getEngineEntry",
    ()=>getEngineEntry,
    "listCompressionEngines",
    ()=>listCompressionEngines,
    "listEnabledEngines",
    ()=>listEnabledEngines,
    "listEngines",
    ()=>listEngines,
    "registerCompressionEngine",
    ()=>registerCompressionEngine,
    "registerEngine",
    ()=>registerEngine,
    "setEngineEnabled",
    ()=>setEngineEnabled,
    "unregisterCompressionEngine",
    ()=>unregisterCompressionEngine,
    "updateEngineConfig",
    ()=>updateEngineConfig
]);
const ENGINES = new Map();
function assertValidEngine(engine) {
    if (!engine?.id || typeof engine.apply !== "function" || typeof engine.compress !== "function" || typeof engine.getConfigSchema !== "function" || typeof engine.validateConfig !== "function") {
        throw new Error("Invalid compression engine registration");
    }
}
function registerEngine(engine, defaultConfig = {}) {
    assertValidEngine(engine);
    const validation = engine.validateConfig(defaultConfig);
    if (!validation.valid) {
        throw new Error(`Invalid default config for ${engine.id}: ${validation.errors.join("; ")}`);
    }
    ENGINES.set(engine.id, {
        engine,
        enabled: true,
        config: {
            ...defaultConfig
        }
    });
}
function registerCompressionEngine(engine) {
    registerEngine(engine);
}
function unregisterCompressionEngine(id) {
    return ENGINES.delete(id);
}
function getEngine(id) {
    return ENGINES.get(id)?.engine ?? null;
}
function getCompressionEngine(id) {
    return getEngine(id);
}
function getEngineEntry(id) {
    return ENGINES.get(id) ?? null;
}
function listEngines() {
    return Array.from(ENGINES.values());
}
function listCompressionEngines() {
    return listEngines().map((entry)=>entry.engine);
}
function listEnabledEngines() {
    return listEngines().filter((entry)=>entry.enabled);
}
function setEngineEnabled(id, enabled) {
    const entry = ENGINES.get(id);
    if (!entry) return false;
    entry.enabled = enabled;
    return true;
}
function updateEngineConfig(id, config) {
    const entry = ENGINES.get(id);
    if (!entry) return {
        valid: false,
        errors: [
            `Unknown compression engine: ${id}`
        ]
    };
    const nextConfig = {
        ...entry.config,
        ...config
    };
    const validation = entry.engine.validateConfig(nextConfig);
    if (!validation.valid) return validation;
    entry.config = nextConfig;
    return {
        valid: true,
        errors: []
    };
}
function clearCompressionEngineRegistry() {
    ENGINES.clear();
}
}),
"[project]/open-sse/services/compression/fidelityGateStep.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gateAdvance",
    ()=>gateAdvance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$fidelityGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/fidelityGate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/registry.ts [app-route] (ecmascript)");
;
;
;
function bodyToText(body) {
    const messages = body.messages;
    if (!Array.isArray(messages)) return "";
    return messages.map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(m.content)).join("\n");
}
function gateAdvance(result, inputBody, fidelityGate, acc, engineId) {
    if (!fidelityGate?.enabled) return true;
    if (engineId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])(engineId)?.sampling) return true; // lossy-by-design, CCR-recoverable
    const verdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$fidelityGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkFidelity"])(bodyToText(inputBody), bodyToText(result.body), fidelityGate);
    if (verdict.passed) return true;
    // mergeStackStep only pushed a breakdown entry when result.stats exists; only then is
    // acc.breakdown's last entry THIS step's (else it would be the prior engine's — don't touch it).
    if (result.stats) {
        const last = acc.breakdown[acc.breakdown.length - 1];
        if (last) {
            last.rejected = true;
            last.rejectReason = verdict.detail ?? verdict.failedInvariant;
            last.compressedTokens = last.originalTokens;
            last.savingsPercent = 0;
        }
    }
    acc.fallbackApplied = true;
    return false;
}
}),
"[project]/open-sse/services/compression/lite.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyLiteCompression",
    ()=>applyLiteCompression,
    "collapseWhitespace",
    ()=>collapseWhitespace,
    "compressToolResults",
    ()=>compressToolResults,
    "dedupSystemPrompt",
    ()=>dedupSystemPrompt,
    "removeRedundantContent",
    ()=>removeRedundantContent,
    "replaceImageUrls",
    ()=>replaceImageUrls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
;
;
function trimTrailingHorizontalWhitespace(line) {
    let end = line.length;
    while(end > 0){
        const code = line.charCodeAt(end - 1);
        if (code !== 32 && code !== 9) break;
        end--;
    }
    return end === line.length ? line : line.slice(0, end);
}
function collapseNewlineRuns(content) {
    let normalized = "";
    let newlineRun = 0;
    for (const char of content){
        if (char === "\n") {
            newlineRun++;
            if (newlineRun <= 2) {
                normalized += char;
            }
            continue;
        }
        newlineRun = 0;
        normalized += char;
    }
    return normalized;
}
function normalizeMessageWhitespace(content) {
    return collapseNewlineRuns(content).split("\n").map(trimTrailingHorizontalWhitespace).join("\n");
}
// Vision detection is centralized in `@/shared/constants/visionModels` (#4072) so
// the lite image-strip gate, the /v1/models listing, and the routing fallback can
// never disagree. The shared list keeps the #3328 MiniMax M3 carve-out and the
// pixtral/llava/qwen-vl/glm-4v/kimi-vl/mistral-medium-3 families this gate used to
// miss (stripping their images and blinding real vision models).
function modelSupportsVision(model) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isVisionModelId"])(model);
}
function collapseWhitespace(body, options = {}) {
    if (!body.messages) return {
        body,
        applied: false
    };
    let applied = false;
    const messages = body.messages.map((msg)=>{
        if (options.preserveSystemPrompt === true && msg.role === "system") return msg;
        if (typeof msg.content !== "string") return msg;
        const normalized = normalizeMessageWhitespace(msg.content);
        if (normalized !== msg.content) applied = true;
        return {
            ...msg,
            content: normalized
        };
    });
    return {
        body: {
            ...body,
            messages
        },
        applied
    };
}
function dedupSystemPrompt(body, options = {}) {
    if (!body.messages) return {
        body,
        applied: false
    };
    if (options.preserveSystemPrompt === true) return {
        body,
        applied: false
    };
    const seen = new Set();
    let applied = false;
    const messages = body.messages.filter((msg)=>{
        if (msg.role !== "system" || typeof msg.content !== "string") return true;
        const key = msg.content.trim().slice(0, 200);
        if (seen.has(key)) {
            applied = true;
            return false;
        }
        seen.add(key);
        return true;
    });
    return {
        body: {
            ...body,
            messages
        },
        applied
    };
}
// Adjust a hard cut index to the nearest whitespace within a small lookback/lookahead
// window, so a truncated tool result never garbles the word it lands in the middle of
// (#8169). Prefers backing off to the end of the previous word (keeps the result at or
// under the limit); if no whitespace precedes the cut within the window (e.g. the tail
// end of a very long unbroken run), looks forward to complete the current word instead.
// Falls back to the original hard cut index when neither direction finds a boundary.
const TOOL_TRUNCATION_LOOKBACK = 80;
function isWordChar(char) {
    return char !== undefined && /\S/.test(char);
}
function findWhitespaceBackward(content, cutIndex) {
    const windowStart = Math.max(0, cutIndex - TOOL_TRUNCATION_LOOKBACK);
    for(let i = cutIndex; i > windowStart; i--){
        if (!isWordChar(content[i - 1])) return i - 1;
    }
    return -1;
}
function findWhitespaceForward(content, cutIndex) {
    const windowEnd = Math.min(content.length, cutIndex + TOOL_TRUNCATION_LOOKBACK);
    for(let i = cutIndex; i < windowEnd; i++){
        if (!isWordChar(content[i])) return i;
    }
    return -1;
}
function backOffToWordBoundary(content, cutIndex) {
    const onWordBoundary = !isWordChar(content[cutIndex - 1]) || !isWordChar(content[cutIndex]);
    if (onWordBoundary) return cutIndex;
    const backward = findWhitespaceBackward(content, cutIndex);
    if (backward !== -1) return backward;
    const forward = findWhitespaceForward(content, cutIndex);
    if (forward !== -1) return forward;
    return cutIndex;
}
function compressToolResults(body) {
    if (!body.messages) return {
        body,
        applied: false
    };
    const MAX_TOOL_LENGTH = 2000;
    let applied = false;
    const messages = body.messages.map((msg)=>{
        if (msg.role !== "tool" || typeof msg.content !== "string") return msg;
        if (msg.content.length <= MAX_TOOL_LENGTH) return msg;
        applied = true;
        const cutIndex = backOffToWordBoundary(msg.content, MAX_TOOL_LENGTH);
        return {
            ...msg,
            content: msg.content.slice(0, cutIndex) + "\n...[truncated]"
        };
    });
    return {
        body: {
            ...body,
            messages
        },
        applied
    };
}
function removeRedundantContent(body, options = {}) {
    if (!body.messages) return {
        body,
        applied: false
    };
    let applied = false;
    const messages = [];
    for(let i = 0; i < body.messages.length; i++){
        const msg = body.messages[i];
        if (options.preserveSystemPrompt === true && msg.role === "system") {
            messages.push(msg);
            continue;
        }
        const contentStr = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        if (i > 0 && body.messages[i - 1].role === msg.role && typeof body.messages[i - 1].content === "string" && body.messages[i - 1].content === contentStr) {
            applied = true;
            continue;
        }
        messages.push(msg);
    }
    return {
        body: {
            ...body,
            messages
        },
        applied
    };
}
function replaceImageUrls(body, options) {
    if (!body.messages) return {
        body,
        applied: false
    };
    const supportsVision = typeof options === "object" && options !== null ? options.supportsVision : typeof options === "string" ? modelSupportsVision(options) : undefined;
    if (supportsVision !== false) return {
        body,
        applied: false
    };
    let applied = false;
    const messages = body.messages.map((msg)=>{
        if (!Array.isArray(msg.content)) return msg;
        const newContent = msg.content.map((part)=>{
            if (typeof part === "object" && part !== null && part.type === "image_url" && typeof part.image_url === "object" && part.image_url?.url) {
                const url = String(part.image_url.url);
                if (url.startsWith("data:image/")) {
                    applied = true;
                    const format = url.slice(url.indexOf("/") + 1, url.indexOf(";")) || "unknown";
                    return {
                        type: "text",
                        text: `[image: ${format}]`
                    };
                }
            }
            return part;
        });
        return {
            ...msg,
            content: newContent
        };
    });
    return {
        body: {
            ...body,
            messages
        },
        applied
    };
}
function applyLiteCompression(body, options) {
    const originalBody = body;
    let current = body;
    const techniquesApplied = [];
    const r1 = collapseWhitespace(current, options);
    current = r1.body;
    if (r1.applied) techniquesApplied.push("whitespace");
    const r2 = dedupSystemPrompt(current, options);
    current = r2.body;
    if (r2.applied) techniquesApplied.push("system-dedup");
    const r3 = compressToolResults(current);
    current = r3.body;
    if (r3.applied) techniquesApplied.push("tool-compress");
    const r4 = removeRedundantContent(current, options);
    current = r4.body;
    if (r4.applied) techniquesApplied.push("redundant-remove");
    const r5 = replaceImageUrls(current, options);
    current = r5.body;
    if (r5.applied) techniquesApplied.push("image-placeholder");
    const compressed = techniquesApplied.length > 0;
    const stats = compressed ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(originalBody, current, "lite", techniquesApplied) : null;
    return {
        body: current,
        compressed,
        stats
    };
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
"[project]/open-sse/services/compression/progressiveAging.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyAging",
    ()=>applyAging
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/lite.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/caveman.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)");
;
;
;
;
const COMPRESSED_MARKER_RE = /^\[COMPRESSED:/;
const JSON_PREFIX_RE = /^\s*[{[]/;
const FENCE_RE = /^\s*```/;
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
function structuredKind(text) {
    const trimmed = text.trim();
    if (FENCE_RE.test(trimmed) && trimmed.endsWith("```")) return "fenced";
    if (JSON_PREFIX_RE.test(trimmed)) {
        try {
            JSON.parse(trimmed);
            return "json";
        } catch  {
            return null;
        }
    }
    return null;
}
/**
 * Build the aged content for a message, keeping structured payloads intact:
 * - pure JSON: leave verbatim and untagged (stays JSON.parse-able). Aging engines
 *   (lite/caveman) do not shrink JSON anyway, so nothing is lost; tracked in stats
 *   via the unchanged content. The recursion guard relies on structuredKind() on the
 *   next pass, so re-running aging is a no-op (idempotent).
 * - fenced code block: place the tag on its own line BEFORE the fence so the block
 *   stays valid and the content still starts with `[COMPRESSED:` (recursion guard).
 * - everything else: inline-prepend the tag as before.
 */ function tagAged(tier, originalText, compressed) {
    const kind = structuredKind(originalText);
    if (kind === "json") {
        return originalText;
    }
    if (kind === "fenced") {
        return `[COMPRESSED:aging:${tier}]\n${originalText}`;
    }
    return `[COMPRESSED:aging:${tier}] ${compressed}`;
}
function setContent(msg, newContent) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceTextContent"])(msg, newContent);
}
function applyAging(messages, thresholds, summarizer, preserveSystemPrompt = true) {
    const t = thresholds ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"].thresholds;
    const sum = summarizer ?? {
        summarize: (msgs)=>{
            const typed = msgs;
            const last = typed.filter((m)=>m.role === "assistant").pop();
            return last ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(last.content).slice(0, 200) : "";
        }
    };
    const typed = messages;
    if (typed.length === 0) return {
        messages: [],
        saved: 0
    };
    const totalMessages = typed.length;
    const result = [];
    let saved = 0;
    for(let i = 0; i < typed.length; i++){
        const msg = typed[i];
        const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(msg.content);
        if (preserveSystemPrompt && msg.role === "system" || COMPRESSED_MARKER_RE.test(text)) {
            result.push(msg);
            continue;
        }
        const distanceFromEnd = totalMessages - 1 - i;
        if (distanceFromEnd <= t.verbatim) {
            result.push(msg);
        } else if (distanceFromEnd <= t.light) {
            const compressed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLiteCompression"])({
                messages: [
                    msg
                ]
            });
            if (compressed?.body?.messages?.[0]?.content) {
                const newContent = typeof compressed.body.messages[0].content === "string" ? compressed.body.messages[0].content : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(compressed.body.messages[0].content);
                const tagged = tagAged("light", text, newContent);
                saved += estimateTokens(text) - estimateTokens(tagged);
                result.push(setContent(msg, tagged));
            } else {
                result.push(msg);
            }
        } else if (distanceFromEnd <= t.moderate) {
            const compressed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cavemanCompress"])({
                messages: [
                    msg
                ]
            });
            if (compressed?.body?.messages?.[0]?.content) {
                const newContent = typeof compressed.body.messages[0].content === "string" ? compressed.body.messages[0].content : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(compressed.body.messages[0].content);
                const tagged = tagAged("moderate", text, newContent);
                saved += estimateTokens(text) - estimateTokens(tagged);
                result.push(setContent(msg, tagged));
            } else {
                result.push(msg);
            }
        } else {
            if (msg.role === "assistant") {
                const summary = sum.summarize([
                    msg
                ]);
                const tagged = tagAged("fullSummary", text, summary);
                saved += estimateTokens(text) - estimateTokens(tagged);
                result.push(setContent(msg, tagged));
            } else if (msg.role === "user") {
                const firstLine = text.split("\n")[0]?.slice(0, 120) ?? "";
                const tagged = tagAged("fullSummary", text, firstLine);
                saved += estimateTokens(text) - estimateTokens(tagged);
                result.push(setContent(msg, tagged));
            } else {
                result.push(msg);
            }
        }
    }
    return {
        messages: result,
        saved: Math.max(0, saved)
    };
}
}),
"[project]/open-sse/services/compression/summarizer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RuleBasedSummarizer",
    ()=>RuleBasedSummarizer,
    "createSummarizer",
    ()=>createSummarizer
]);
const COMPRESSED_MARKER_RE = /^\[COMPRESSED:/;
const INTENT_TRIGGERS = /^(?:request|fix|implement|add|remove|update|refactor|create|delete|change|build)\s*:/i;
const FILE_EXTENSIONS = new Set([
    "ts",
    "tsx",
    "js",
    "jsx",
    "py",
    "md",
    "json",
    "sql",
    "css",
    "html",
    "yaml",
    "yml",
    "sh",
    "rb",
    "go",
    "rs",
    "java",
    "c",
    "cpp",
    "h",
    "hpp"
]);
function stripTokenPunctuation(token) {
    let start = 0;
    let end = token.length;
    const leading = new Set([
        "'",
        '"',
        "`",
        "(",
        "[",
        "{"
    ]);
    const trailing = new Set([
        "'",
        '"',
        "`",
        ")",
        "]",
        "}",
        ",",
        ";",
        ":"
    ]);
    while(start < end && leading.has(token[start]))start++;
    while(end > start && trailing.has(token[end - 1]))end--;
    return token.slice(start, end);
}
function getKnownFilePathToken(token) {
    const clean = stripTokenPunctuation(token);
    const lastDot = clean.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === clean.length - 1) return null;
    const extension = clean.slice(lastDot + 1).toLowerCase();
    if (!FILE_EXTENSIONS.has(extension)) return null;
    if (!clean.includes("/") && !clean.includes(".")) return null;
    return clean;
}
function extractFilePathTokens(text) {
    const paths = [];
    for (const token of text.split(/\s+/)){
        const filePath = getKnownFilePathToken(token);
        if (filePath) paths.push(filePath);
    }
    return paths;
}
function extractErrorSnippets(text) {
    const snippets = [];
    for (const segment of text.split(/[.\n]/)){
        const trimmed = segment.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (trimmed.includes("TypeError:") || trimmed.includes("ReferenceError:") || trimmed.includes("SyntaxError:") || trimmed.includes("RangeError:") || trimmed.includes("URIError:") || trimmed.includes("EvalError:") || trimmed.includes("Error:") || trimmed.includes("Exception:") || lower.includes("error ts")) {
            snippets.push(trimmed);
        }
    }
    return snippets;
}
function extractIntents(messages) {
    const intents = [];
    for (const msg of messages){
        if (msg.role !== "user") continue;
        const text = extractText(msg.content);
        if (!text) continue;
        const firstLine = text.split("\n")[0]?.trim();
        if (firstLine && INTENT_TRIGGERS.test(firstLine)) {
            intents.push(firstLine.slice(0, 120));
        } else if (intents.length === 0 && firstLine) {
            intents.push(firstLine.slice(0, 120));
        }
    }
    return intents;
}
function extractFilePaths(messages) {
    const paths = new Set();
    for (const msg of messages){
        const text = extractText(msg.content);
        if (!text) continue;
        const matches = extractFilePathTokens(text);
        for (const m of matches){
            paths.add(m);
        }
    }
    return [
        ...paths
    ].slice(0, 20);
}
function extractErrors(messages) {
    const errors = [];
    for (const msg of messages){
        const text = extractText(msg.content);
        if (!text) continue;
        for (const match of extractErrorSnippets(text))errors.push(match.slice(0, 150));
    }
    return errors.slice(0, 10);
}
function extractLastDecision(messages) {
    for(let i = messages.length - 1; i >= 0; i--){
        if (messages[i].role === "assistant") {
            const text = extractText(messages[i].content);
            if (text) return text;
        }
    }
    return "";
}
function trimCodeFences(text) {
    let output = "";
    let cursor = 0;
    while(cursor < text.length){
        const start = text.indexOf("```", cursor);
        if (start === -1) {
            output += text.slice(cursor);
            break;
        }
        const openingLineEnd = text.indexOf("\n", start + 3);
        if (openingLineEnd === -1) {
            output += text.slice(cursor);
            break;
        }
        const closeStart = text.indexOf("\n```", openingLineEnd + 1);
        if (closeStart === -1) {
            output += text.slice(cursor);
            break;
        }
        const closeEnd = closeStart + 4;
        const opening = text.slice(start, openingLineEnd);
        const code = text.slice(openingLineEnd + 1, closeStart);
        const lines = code.split("\n");
        output += text.slice(cursor, start);
        if (lines.length <= 4) {
            output += text.slice(start, closeEnd);
        } else {
            const head = lines.slice(0, 3).join("\n");
            const tail = lines[lines.length - 1];
            output += `${opening}\n${head}\n…\n${tail}\n\`\`\``;
        }
        cursor = closeEnd;
    }
    return output;
}
function extractText(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.filter((p)=>typeof p === "object" && p !== null && "text" in p).map((p)=>p.text ?? "").join("\n");
    }
    return "";
}
class RuleBasedSummarizer {
    summarize(messages, opts) {
        const maxLen = opts?.maxLen ?? 2000;
        const preserveCode = opts?.preserveCode ?? true;
        const typed = messages;
        const filtered = typed.filter((msg)=>{
            const text = extractText(msg.content);
            if (!text || text.trim().length === 0) return false;
            return !COMPRESSED_MARKER_RE.test(text);
        });
        if (filtered.length === 0) return "";
        const intents = extractIntents(filtered);
        const files = extractFilePaths(filtered);
        const errors = extractErrors(filtered);
        const decision = extractLastDecision(filtered);
        const parts = [
            "[COMPRESSED:summary]"
        ];
        if (intents.length > 0) {
            parts.push(`Intents: ${intents.join("; ")}.`);
        }
        if (files.length > 0) {
            parts.push(`Files touched: ${files.join(", ")}.`);
        }
        if (errors.length > 0) {
            parts.push(`Errors: ${errors.join("; ")}.`);
        }
        if (decision) {
            const processed = preserveCode ? trimCodeFences(decision) : decision;
            parts.push(`Last decision: ${processed.slice(0, 200)}.`);
        }
        let result = parts.join(" ");
        if (result.length > maxLen) {
            result = result.slice(0, maxLen - 3) + "...";
        }
        return result;
    }
}
function createSummarizer() {
    return new RuleBasedSummarizer();
}
}),
"[project]/open-sse/services/compression/aggressive.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compressAggressive",
    ()=>compressAggressive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/toolResultCompressor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$progressiveAging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/progressiveAging.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$summarizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/summarizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/caveman.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/lite.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const COMPRESSED_MARKER_RE = /^\[COMPRESSED:/;
function setContent(msg, newContent) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceTextContent"])(msg, newContent);
}
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
function compressAggressive(messages, config, stats) {
    const cfg = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"],
        ...config,
        thresholds: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"].thresholds,
            ...config?.thresholds ?? {}
        },
        toolStrategies: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"].toolStrategies,
            ...config?.toolStrategies ?? {}
        }
    };
    const summarizer = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$summarizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RuleBasedSummarizer"]();
    const resultStats = stats ?? {
        originalTokens: 0,
        compressedTokens: 0,
        savingsPercent: 0,
        techniquesUsed: [],
        mode: "aggressive",
        timestamp: Date.now()
    };
    const originalTokens = messages.reduce((sum, m)=>sum + estimateTokens((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(m.content)), 0);
    resultStats.originalTokens = originalTokens;
    let currentMessages = [
        ...messages
    ];
    let summarizerSavings = 0;
    let toolResultSavings = 0;
    let agingSavings = 0;
    // Step 1: Tool-result compression
    try {
        const afterToolResult = currentMessages.map((msg)=>{
            if (cfg.preserveSystemPrompt !== false && msg.role === "system") return msg;
            // OpenAI-shape: a dedicated tool/function message whose content is the result text.
            if (msg.role === "tool" || msg.role === "function") {
                const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(msg.content);
                if (!text || COMPRESSED_MARKER_RE.test(text)) return msg;
                const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressToolResult"])(text, cfg.toolStrategies);
                if (result.strategy === "none" || result.saved <= 0) return msg;
                toolResultSavings += result.saved;
                return setContent(msg, result.compressed);
            }
            // Anthropic-shape: `tool_result` content blocks live inside a (typically user)
            // message's content array. Compress the text inside each block while preserving
            // the tool_use_id and block structure exactly (B-AGG-ANTHROPIC-TR).
            if (!Array.isArray(msg.content)) return msg;
            if (!msg.content.some(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAnthropicToolResultBlock"])) return msg;
            let blockSavings = 0;
            const nextContent = msg.content.map((part)=>{
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAnthropicToolResultBlock"])(part)) return part;
                const { block, saved } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$toolResultCompressor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compressAnthropicToolResultBlock"])(part, cfg.toolStrategies);
                blockSavings += saved;
                return block;
            });
            if (blockSavings <= 0) return msg;
            toolResultSavings += blockSavings;
            return {
                ...msg,
                content: nextContent
            };
        });
        currentMessages = afterToolResult;
    } catch (err) {
    // Downgrade: skip tool-result compression, continue pipeline
    }
    // Step 2: Progressive aging
    try {
        const agingResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$progressiveAging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyAging"])(currentMessages, cfg.thresholds, summarizer, cfg.preserveSystemPrompt !== false);
        agingSavings = agingResult.saved;
        currentMessages = agingResult.messages;
    } catch (err) {
    // Downgrade: skip aging, continue with current messages
    }
    // Step 3: Fallback summarizer for remaining long messages
    if (cfg.summarizerEnabled) {
        try {
            currentMessages = currentMessages.map((msg)=>{
                if (cfg.preserveSystemPrompt !== false && msg.role === "system") return msg;
                const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(msg.content);
                if (!text || COMPRESSED_MARKER_RE.test(text)) return msg;
                if (text.length <= cfg.maxTokensPerMessage * 4) return msg;
                const summary = summarizer.summarize([
                    msg
                ], {
                    maxLen: cfg.maxTokensPerMessage,
                    preserveCode: true
                });
                if (summary && summary.length < text.length) {
                    summarizerSavings += estimateTokens(text) - estimateTokens(summary);
                    return setContent(msg, `[COMPRESSED:summary] ${summary}`);
                }
                return msg;
            });
        } catch (err) {
        // Downgrade: skip fallback summarizer
        }
    }
    // Downgrade chain: if total savings < threshold, try caveman then lite
    const compressedTokens = currentMessages.reduce((sum, m)=>sum + estimateTokens((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTextContent"])(m.content)), 0);
    resultStats.compressedTokens = compressedTokens;
    resultStats.savingsPercent = originalTokens > 0 ? (originalTokens - compressedTokens) / originalTokens * 100 : 0;
    if (resultStats.savingsPercent < cfg.minSavingsThreshold * 100) {
        try {
            const cavemanResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cavemanCompress"])({
                messages: currentMessages
            });
            if (cavemanResult?.compressed && cavemanResult.stats) {
                const cavemanSavings = cavemanResult.stats.savingsPercent ?? 0;
                if (cavemanSavings > resultStats.savingsPercent) {
                    currentMessages = cavemanResult.body?.messages ?? currentMessages;
                    resultStats.compressedTokens = cavemanResult.stats.compressedTokens ?? compressedTokens;
                    resultStats.savingsPercent = cavemanSavings;
                    resultStats.techniquesUsed.push("caveman-fallback");
                }
            }
        } catch (err) {
        // Caveman failed, try lite
        }
        try {
            const liteResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLiteCompression"])({
                messages: currentMessages
            }, {
                preserveSystemPrompt: cfg.preserveSystemPrompt !== false
            });
            if (liteResult?.compressed && liteResult.stats) {
                const liteSavings = liteResult.stats.savingsPercent ?? 0;
                if (liteSavings > resultStats.savingsPercent) {
                    currentMessages = liteResult.body?.messages ?? currentMessages;
                    resultStats.compressedTokens = liteResult.stats.compressedTokens ?? compressedTokens;
                    resultStats.savingsPercent = liteSavings;
                    resultStats.techniquesUsed.push("lite-fallback");
                }
            }
        } catch (err) {
        // Lite also failed, return current messages as-is
        }
    }
    resultStats.techniquesUsed.push(...toolResultSavings > 0 ? [
        "toolResult"
    ] : [], ...agingSavings > 0 ? [
        "aging"
    ] : [], ...summarizerSavings > 0 ? [
        "summarizer"
    ] : []);
    resultStats.aggressive = {
        summarizerSavings,
        toolResultSavings,
        agingSavings
    };
    return {
        messages: currentMessages,
        stats: resultStats
    };
}
;
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
"[project]/open-sse/services/compression/pipelineGuards.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Aggregate guards for the stacked compression pipeline (T02 / Headroom H1).
 *
 * These operate on the WHOLE pipeline result, distinct from the opt-in per-step TV1 bail-out
 * (`decideStep` in `strategySelector.ts`): TV1 governs whether to ADVANCE between steps and is
 * default-off; the inflation guard here is an honest DEFAULT-ON check on the FINAL output.
 */ __turbopack_context__.s([
    "applyStackedInflationGuard",
    ()=>applyStackedInflationGuard,
    "guardPipelineInflation",
    ()=>guardPipelineInflation
]);
function guardPipelineInflation(input) {
    const { originalTokens, compressedTokens } = input;
    if (originalTokens > 0 && compressedTokens > originalTokens) {
        return {
            body: input.originalBody,
            inflated: true
        };
    }
    return {
        body: input.compressedBody,
        inflated: false
    };
}
function applyStackedInflationGuard(originalBody, currentBody, compressed, stats) {
    if (!compressed) return {
        body: currentBody,
        compressed,
        stats
    };
    const inflation = guardPipelineInflation({
        originalBody,
        compressedBody: currentBody,
        originalTokens: stats.originalTokens,
        compressedTokens: stats.compressedTokens
    });
    if (!inflation.inflated) return {
        body: currentBody,
        compressed,
        stats
    };
    const inflatedTokens = stats.compressedTokens;
    const warnings = new Set(stats.validationWarnings ?? []);
    warnings.add(`pipeline-inflation-guard: stacked output (${inflatedTokens} tok) did not shrink input ` + `(${stats.originalTokens} tok); reverted to original`);
    stats.validationWarnings = Array.from(warnings);
    stats.fallbackApplied = true;
    stats.compressedTokens = stats.originalTokens;
    stats.savingsPercent = 0;
    return {
        body: inflation.body,
        compressed: false,
        stats
    };
}
}),
"[project]/open-sse/services/compression/pipelineEngineBreaker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * T02 — pipeline engine circuit-breaker (gaps v3.8.42; opt-in, default OFF).
 *
 * A lightweight, in-memory, per-engine breaker for the stacked compression pipeline. When an
 * engine throws repeatedly ACROSS requests, the breaker opens for that engine id and the
 * stacked loops skip it (keeping the body verbatim for that step — fail-open) until a cooldown
 * elapses, then probe once (lazy half-open). Success closes it; a failed probe re-opens it.
 *
 * This is deliberately NOT the provider breaker (`src/shared/utils/circuitBreaker.ts`), which
 * is provider-scoped and DB-persisted. This one is engine-scoped, process-local, and adds zero
 * DB/IO on the hot path. It composes with — but is independent of — the TV1 per-request bail-out
 * (which skips within a single request); the breaker adds cross-request memory.
 *
 * Default OFF: with `enabled:false` the stacked loops never consult or mutate this state, so
 * behavior is byte-identical to the pre-breaker pipeline (a throwing engine still propagates
 * unless TV1 bail-out is separately enabled).
 */ __turbopack_context__.s([
    "DEFAULT_PIPELINE_BREAKER",
    ()=>DEFAULT_PIPELINE_BREAKER,
    "canRunEngine",
    ()=>canRunEngine,
    "getEngineBreakerState",
    ()=>getEngineBreakerState,
    "recordEngineFailure",
    ()=>recordEngineFailure,
    "recordEngineSuccess",
    ()=>recordEngineSuccess,
    "resetPipelineEngineBreakers",
    ()=>resetPipelineEngineBreakers,
    "resolvePipelineBreakerConfig",
    ()=>resolvePipelineBreakerConfig
]);
const DEFAULT_PIPELINE_BREAKER = {
    enabled: false,
    failureThreshold: 3,
    cooldownMs: 30_000
};
const _state = new Map();
function get(engine) {
    let s = _state.get(engine);
    if (!s) {
        s = {
            failures: 0,
            openedUntil: null
        };
        _state.set(engine, s);
    }
    return s;
}
function toNonNegativeInt(raw, fallback) {
    if (raw === undefined) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}
function resolvePipelineBreakerConfig(partial, env = process.env) {
    const enabled = partial?.enabled ?? env.COMPRESSION_PIPELINE_BREAKER_ENABLED === "true";
    const failureThreshold = partial?.failureThreshold ?? toNonNegativeInt(env.COMPRESSION_PIPELINE_BREAKER_THRESHOLD, DEFAULT_PIPELINE_BREAKER.failureThreshold);
    const cooldownMs = partial?.cooldownMs ?? toNonNegativeInt(env.COMPRESSION_PIPELINE_BREAKER_COOLDOWN_MS, DEFAULT_PIPELINE_BREAKER.cooldownMs);
    return {
        enabled: enabled === true,
        failureThreshold: Math.max(1, failureThreshold),
        cooldownMs: Math.max(0, cooldownMs)
    };
}
function canRunEngine(engine, config, now = Date.now()) {
    if (!config.enabled) return true;
    const s = get(engine);
    if (s.openedUntil == null) return true; // CLOSED (or already half-open)
    if (now >= s.openedUntil) {
        // Cooldown elapsed → half-open: allow a single probe, but keep failures one below the
        // threshold so the very next failure re-opens the breaker without N more round-trips.
        s.openedUntil = null;
        s.failures = Math.max(0, config.failureThreshold - 1);
        return true;
    }
    return false; // OPEN
}
function recordEngineFailure(engine, config, now = Date.now()) {
    if (!config.enabled) return;
    const s = get(engine);
    s.failures += 1;
    if (s.failures >= config.failureThreshold) {
        s.openedUntil = now + config.cooldownMs;
    }
}
function recordEngineSuccess(engine, config) {
    if (!config.enabled) return;
    const s = get(engine);
    s.failures = 0;
    s.openedUntil = null;
}
function getEngineBreakerState(engine) {
    const s = _state.get(engine);
    return {
        failures: s?.failures ?? 0,
        open: s?.openedUntil != null
    };
}
function resetPipelineEngineBreakers() {
    _state.clear();
}
}),
"[project]/open-sse/services/compression/stackedStepCore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Core telemetry + step-decision machinery for the stacked compression pipeline, extracted
 * from `strategySelector.ts` so that god-file stays bounded. This module is a leaf: it depends
 * only on the shared compression types, so it never participates in a cycle.
 *
 * It holds the per-run accumulator (`StackAccumulator` + `createStackAccumulator`), the TV1
 * bail-out config + advance decision (`BailoutConfig` + `decideStep`), and the per-step
 * telemetry fold (`mergeStackStep`). The sync/async stacked loops in `strategySelector.ts`
 * consume these.
 */ __turbopack_context__.s([
    "createStackAccumulator",
    ()=>createStackAccumulator,
    "decideStep",
    ()=>decideStep,
    "mergeStackStep",
    ()=>mergeStackStep
]);
function createStackAccumulator() {
    return {
        techniques: new Set(),
        rules: new Set(),
        breakdown: [],
        rtkRawOutputPointers: [],
        validationWarnings: new Set(),
        validationErrors: new Set(),
        fallbackApplied: false
    };
}
function decideStep(result, bailout) {
    if (!result.compressed) return {
        advance: false
    };
    // Clamp: a negative minGainPercent would mean "always advance" (invalid state).
    const minGain = Math.max(0, bailout.minGainPercent ?? 10);
    const gain = result.stats?.savingsPercent ?? 0;
    if (gain < minGain) return {
        advance: false
    };
    return {
        advance: true
    };
}
/**
 * A dispatched step whose engine found nothing eligible (e.g. session-dedup with no repeated
 * blocks, ccr below its min-chars threshold) returns `stats: null` instead of throwing or
 * advancing. Left unrecorded, that step vanishes from the pipeline's telemetry with zero trace —
 * no `engineBreakdown` entry, no warning, no error (#6479, #6491). Surface it as a validation
 * warning so operators can tell "engine ran but had nothing to do" apart from "engine never ran".
 */ function recordNullStatsStep(acc, engineId) {
    acc.validationWarnings.add(`${engineId}: skipped (no eligible content)`);
}
function mergeStackStep(acc, engineId, result) {
    if (!result.stats) {
        // No-op engine (e.g. ccr / session-dedup found no candidate): stats is null so there is no
        // telemetry to fold, but the engine still RAN — record a zero-savings breakdown entry so its
        // identity survives. Without this the breakdown stays empty and ensureEngineBreakdown
        // synthesizes a generic "stacked" 0% node, hiding which engine an operator actually asked for.
        // Also surface a validation warning so operators can tell "engine ran but had nothing to do"
        // apart from "engine never ran" (#6479, #6491).
        recordNullStatsStep(acc, engineId);
        acc.breakdown.push({
            engine: engineId,
            originalTokens: 0,
            compressedTokens: 0,
            savingsPercent: 0,
            techniquesUsed: []
        });
        return;
    }
    result.stats.techniquesUsed.forEach((technique)=>acc.techniques.add(technique));
    result.stats.rulesApplied?.forEach((rule)=>acc.rules.add(rule));
    result.stats.rtkRawOutputPointers?.forEach((pointer)=>acc.rtkRawOutputPointers.push(pointer));
    result.stats.validationWarnings?.forEach((warning)=>acc.validationWarnings.add(warning));
    result.stats.validationErrors?.forEach((error)=>acc.validationErrors.add(error));
    acc.fallbackApplied = acc.fallbackApplied || result.stats.fallbackApplied === true;
    acc.breakdown.push({
        engine: engineId,
        originalTokens: result.stats.originalTokens,
        compressedTokens: result.stats.compressedTokens,
        savingsPercent: result.stats.savingsPercent,
        techniquesUsed: result.stats.techniquesUsed,
        ...result.stats.rulesApplied ? {
            rulesApplied: result.stats.rulesApplied
        } : {},
        ...result.stats.durationMs !== undefined ? {
            durationMs: result.stats.durationMs
        } : {}
    });
}
}),
"[project]/open-sse/services/compression/stepDetailConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Resolves the persisted per-engine DETAIL sub-object (settings.headroom / .sessionDedup /
// .ccr) for a stacked-pipeline step. Extracted out of strategySelector.ts (frozen at cap by
// file-size-baseline.json — see scripts/check/check-file-size.mjs) rather than growing that
// file inline.
//
// #8056 wired settings.headroom.minRows into buildStepOptions so the dashboard value takes
// effect even when the stacked-pipeline step itself carries no config. #8388 extends the same
// merge to session-dedup and ccr, whose detail settings previously had nowhere to persist to
// (see compressionDetailNormalizers.ts on the DB write side of the same gap).
__turbopack_context__.s([
    "resolveStepDetailConfig",
    ()=>resolveStepDetailConfig
]);
function resolveStepDetailConfig(engine, config) {
    switch(engine){
        case "headroom":
            return config?.headroom ?? {};
        case "session-dedup":
            return config?.sessionDedup ?? {};
        case "ccr":
            return config?.ccr ?? {};
        default:
            return {};
    }
}
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
"[project]/open-sse/services/compression/engines/cavemanAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aggressiveEngine",
    ()=>aggressiveEngine,
    "cavemanEngine",
    ()=>cavemanEngine,
    "liteEngine",
    ()=>liteEngine,
    "ultraEngine",
    ()=>ultraEngine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/lite.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/caveman.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$aggressive$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/aggressive.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultra$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/ultra.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/bodyAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
;
;
;
;
;
;
;
const CAVEMAN_INTENSITIES = [
    "lite",
    "full",
    "ultra"
];
const CAVEMAN_SCHEMA = [
    {
        key: "intensity",
        type: "select",
        label: "Intensity",
        defaultValue: "full",
        options: CAVEMAN_INTENSITIES.map((value)=>({
                value,
                label: value
            }))
    },
    {
        key: "minMessageLength",
        type: "number",
        label: "Minimum message length",
        defaultValue: 50,
        min: 0,
        max: 10000
    },
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: true
    }
];
const AGGRESSIVE_SCHEMA = [
    {
        key: "summarizerEnabled",
        type: "boolean",
        label: "Summarizer enabled",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"].summarizerEnabled
    },
    {
        key: "maxTokensPerMessage",
        type: "number",
        label: "Max tokens per message",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"].maxTokensPerMessage,
        min: 256,
        max: 32768
    },
    {
        key: "minSavingsThreshold",
        type: "number",
        label: "Minimum savings threshold",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_AGGRESSIVE_CONFIG"].minSavingsThreshold,
        min: 0,
        max: 1
    },
    {
        key: "preserveSystemPrompt",
        type: "boolean",
        label: "Preserve system prompt",
        defaultValue: true
    }
];
const ULTRA_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"].enabled
    },
    {
        key: "compressionRate",
        type: "number",
        label: "Compression rate",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"].compressionRate,
        min: 0,
        max: 1
    },
    {
        key: "minScoreThreshold",
        type: "number",
        label: "Minimum score threshold",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"].minScoreThreshold,
        min: 0,
        max: 1
    },
    {
        key: "slmFallbackToAggressive",
        type: "boolean",
        label: "Fallback to aggressive",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"].slmFallbackToAggressive
    },
    {
        key: "modelPath",
        type: "string",
        label: "Model path",
        defaultValue: ""
    },
    {
        key: "maxTokensPerMessage",
        type: "number",
        label: "Max tokens per message",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ULTRA_CONFIG"].maxTokensPerMessage,
        min: 0,
        max: 32768
    },
    {
        key: "preserveSystemPrompt",
        type: "boolean",
        label: "Preserve system prompt",
        defaultValue: true
    }
];
function ok() {
    return {
        valid: true,
        errors: []
    };
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function validateBoolean(config, key, errors) {
    if (config[key] !== undefined && typeof config[key] !== "boolean") {
        errors.push(`${key} must be a boolean`);
    }
}
function validateNumberRange(config, key, min, max, errors) {
    const value = config[key];
    if (value === undefined) return;
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
        errors.push(`${key} must be a number between ${min} and ${max}`);
    }
}
function validateCavemanLikeConfig(config) {
    const errors = [];
    if (config.intensity !== undefined && !CAVEMAN_INTENSITIES.includes(config.intensity)) {
        errors.push("intensity must be lite, full, or ultra");
    }
    if (config.minMessageLength !== undefined && (typeof config.minMessageLength !== "number" || config.minMessageLength < 0)) {
        errors.push("minMessageLength must be a non-negative number");
    }
    if (config.enabled !== undefined && typeof config.enabled !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function validateAggressiveConfig(config) {
    const errors = [];
    validateBoolean(config, "summarizerEnabled", errors);
    validateBoolean(config, "preserveSystemPrompt", errors);
    validateNumberRange(config, "maxTokensPerMessage", 256, 32768, errors);
    validateNumberRange(config, "minSavingsThreshold", 0, 1, errors);
    if (config.thresholds !== undefined) {
        if (!isRecord(config.thresholds)) {
            errors.push("thresholds must be an object");
        } else {
            for (const key of [
                "fullSummary",
                "moderate",
                "light",
                "verbatim"
            ]){
                validateNumberRange(config.thresholds, key, 1, 100, errors);
            }
        }
    }
    if (config.toolStrategies !== undefined) {
        if (!isRecord(config.toolStrategies)) {
            errors.push("toolStrategies must be an object");
        } else {
            for (const key of [
                "fileContent",
                "grepSearch",
                "shellOutput",
                "json",
                "errorMessage"
            ]){
                validateBoolean(config.toolStrategies, key, errors);
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function validateUltraConfig(config) {
    const errors = [];
    validateBoolean(config, "enabled", errors);
    validateBoolean(config, "slmFallbackToAggressive", errors);
    validateBoolean(config, "preserveSystemPrompt", errors);
    validateNumberRange(config, "compressionRate", 0, 1, errors);
    validateNumberRange(config, "minScoreThreshold", 0, 1, errors);
    validateNumberRange(config, "maxTokensPerMessage", 0, 32768, errors);
    if (config.modelPath !== undefined && typeof config.modelPath !== "string") {
        errors.push("modelPath must be a string");
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// Lite only honors `preserveSystemPrompt` (model/vision are runtime, not user config).
// Previously this engine wrongly exposed AGGRESSIVE_SCHEMA, surfacing irrelevant
// summarizer/threshold fields in the per-engine config UI.
const LITE_SCHEMA = [
    {
        key: "preserveSystemPrompt",
        type: "boolean",
        label: "Preserve system prompt",
        defaultValue: true
    }
];
function validateLiteConfig(config) {
    const errors = [];
    if (config.preserveSystemPrompt !== undefined && typeof config.preserveSystemPrompt !== "boolean") {
        errors.push("preserveSystemPrompt must be a boolean");
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
const liteEngine = {
    id: "lite",
    name: "Lite",
    description: "Fast whitespace, tool-result and image URL reduction.",
    icon: "compress",
    targets: [
        "messages",
        "tool_results"
    ],
    stackable: true,
    stackPriority: 5,
    metadata: {
        id: "lite",
        name: "Lite",
        description: "Fast whitespace, tool-result and image URL reduction.",
        inputScope: "messages",
        targetLatencyMs: 1,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLiteCompression"])(adapter.body, {
            ...options,
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false
        });
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return LITE_SCHEMA;
    },
    validateConfig (config) {
        return validateLiteConfig(config);
    }
};
const cavemanEngine = {
    id: "caveman",
    name: "Caveman",
    description: "Rule-based message compression with preservation and validation.",
    icon: "compress",
    targets: [
        "messages"
    ],
    stackable: true,
    stackPriority: 20,
    metadata: {
        id: "caveman",
        name: "Caveman",
        description: "Rule-based message compression with preservation and validation.",
        inputScope: "messages",
        targetLatencyMs: 1,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
        // Mirror rtkAdapter's default-enabled behavior (see rtk/index.ts:530-535). When this engine
        // is invoked as a stacked step without explicit `enabled` on either the cavemanConfig or the
        // stepConfig, default `enabled: true` so the rules actually run. Without this,
        // DEFAULT_CAVEMAN_CONFIG.enabled=false made cavemanCompress() a silent no-op, and the
        // preview route's default [rtk, caveman] pipeline reported 0% savings even on trigger prose.
        // (Issue #6425.)
        const explicitCavemanConfig = options?.config?.cavemanConfig;
        const explicitStepConfig = options?.stepConfig;
        const explicitEnabled = explicitCavemanConfig && "enabled" in explicitCavemanConfig || explicitStepConfig && "enabled" in explicitStepConfig;
        const enabledDefault = explicitEnabled ? {} : {
            enabled: true
        };
        const cavemanConfig = {
            ...enabledDefault,
            ...explicitCavemanConfig ?? {},
            ...explicitStepConfig ?? {},
            ...options?.config?.languageConfig?.enabled ? {
                language: options.config.languageConfig.defaultLanguage,
                autoDetectLanguage: options.config.languageConfig.autoDetect,
                enabledLanguagePacks: options.config.languageConfig.enabledPacks
            } : {},
            ...options?.config?.preserveSystemPrompt !== false ? {
                compressRoles: (options?.config?.cavemanConfig?.compressRoles ?? [
                    "user"
                ]).filter((role)=>role !== "system")
            } : {}
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cavemanCompress"])(adapter.body, cavemanConfig);
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return CAVEMAN_SCHEMA;
    },
    validateConfig (config) {
        return validateCavemanLikeConfig(config);
    }
};
const aggressiveEngine = {
    id: "aggressive",
    name: "Aggressive",
    description: "Summarization, tool result compression and progressive aging.",
    icon: "speed",
    targets: [
        "messages",
        "tool_results"
    ],
    stackable: true,
    stackPriority: 30,
    metadata: {
        id: "aggressive",
        name: "Aggressive",
        description: "Summarization, tool result compression and progressive aging.",
        inputScope: "messages",
        targetLatencyMs: 5,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
        const messages = adapter.body.messages ?? [];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const aggressiveConfig = {
            ...options?.config?.aggressive ?? {},
            ...options?.stepConfig ?? {},
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$aggressive$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compressAggressive"])(messages, aggressiveConfig);
        const compressedBody = {
            ...adapter.body,
            messages: result.messages
        };
        return {
            body: adapter.restore(compressedBody),
            compressed: result.stats.savingsPercent > 0,
            stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(adapter.body, compressedBody, "aggressive", [
                "aggressive"
            ], result.stats.rulesApplied, result.stats.durationMs)
        };
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return AGGRESSIVE_SCHEMA;
    },
    validateConfig (config) {
        return validateAggressiveConfig(config);
    }
};
const ultraEngine = {
    id: "ultra",
    name: "Ultra",
    description: "Heuristic token pruning with optional local SLM fallback.",
    icon: "bolt",
    targets: [
        "messages"
    ],
    stackable: true,
    stackPriority: 40,
    metadata: {
        id: "ultra",
        name: "Ultra",
        description: "Heuristic token pruning with optional local SLM fallback.",
        inputScope: "messages",
        targetLatencyMs: 5,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body);
        const messages = adapter.body.messages ?? [];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const ultraConfig = {
            ...options?.config?.ultra ?? {},
            ...options?.stepConfig ?? {},
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultra$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ultraCompressHeuristic"])(messages, ultraConfig);
        const compressedBody = {
            ...adapter.body,
            messages: result.messages
        };
        return {
            body: adapter.restore(compressedBody),
            compressed: result.stats.savingsPercent > 0,
            stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(adapter.body, compressedBody, "ultra", [
                "ultra"
            ], result.stats.rulesApplied, result.stats.durationMs)
        };
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return ULTRA_SCHEMA;
    },
    validateConfig (config) {
        return validateUltraConfig(config);
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
"[project]/open-sse/services/compression/engines/session-dedup/fuzzy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_FUZZY_BLOCKS",
    ()=>MAX_FUZZY_BLOCKS,
    "applyFuzzyPass",
    ()=>applyFuzzyPass,
    "findNearDuplicates",
    ()=>findNearDuplicates,
    "jaccard",
    ()=>jaccard,
    "runFuzzyPass",
    ()=>runFuzzyPass,
    "shingles",
    ()=>shingles
]);
// open-sse/services/compression/engines/session-dedup/fuzzy.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ccr/index.ts [app-route] (ecmascript)");
;
const MAX_FUZZY_BLOCKS = 200;
/** FNV-1a 32-bit hash (deterministic, cheap, no Math.random). */ function fnv1a(s) {
    let h = 0x811c9dc5;
    for(let i = 0; i < s.length; i++){
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
function shingles(text, k = 3) {
    const words = text.split(/\s+/).filter(Boolean);
    const out = new Set();
    if (words.length < k) return out;
    for(let i = 0; i + k <= words.length; i++){
        out.add(fnv1a(words.slice(i, i + k).join(" ")));
    }
    return out;
}
function jaccard(a, b) {
    if (a.size === 0 && b.size === 0) return 0;
    const [small, large] = a.size <= b.size ? [
        a,
        b
    ] : [
        b,
        a
    ];
    let inter = 0;
    for (const x of small)if (large.has(x)) inter++;
    const union = a.size + b.size - inter;
    return union === 0 ? 0 : inter / union;
}
function findNearDuplicates(blocks, minJaccard, maxBlocks, shingleSize = 3) {
    if (blocks.length > maxBlocks) return [];
    const sets = blocks.map((b)=>shingles(b.text, shingleSize));
    const out = [];
    for(let i = 0; i < blocks.length; i++){
        let best = -1;
        let bestSim = 0;
        for(let j = 0; j < i; j++){
            const sim = jaccard(sets[i], sets[j]);
            if (sim >= minJaccard && sim > bestSim) {
                bestSim = sim;
                best = j;
            }
        }
        if (best >= 0) {
            out.push({
                block: blocks[i],
                matchedIndex: blocks[best].index,
                similarity: bestSim
            });
        }
    }
    return out;
}
function applyFuzzyPass(messages, opts) {
    try {
        const blocks = [];
        for(let i = 0; i < messages.length; i++){
            const m = messages[i];
            if (m.role === "system") continue;
            if (typeof m.content === "string" && m.content.length >= opts.minBlockChars) {
                blocks.push({
                    text: m.content,
                    index: i
                });
            }
        }
        if (blocks.length < 2) return {
            messages,
            fuzzyCount: 0
        };
        const nearDups = findNearDuplicates(blocks, opts.minJaccard, opts.maxBlocks, opts.shingleSize);
        if (nearDups.length === 0) return {
            messages,
            fuzzyCount: 0
        };
        const replacements = new Map();
        for (const nd of nearDups){
            const stored = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryStoreBlock"])(nd.block.text, opts.principalId, {
                source: "session-dedup"
            });
            if (!stored.stored) continue;
            const marker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCcrMarker"])(stored.hash, nd.block.text.length);
            if (marker.length < nd.block.text.length) replacements.set(nd.block.index, marker);
        }
        if (replacements.size === 0) return {
            messages,
            fuzzyCount: 0
        };
        const out = messages.map((m, i)=>replacements.has(i) ? {
                ...m,
                content: replacements.get(i)
            } : m);
        return {
            messages: out,
            fuzzyCount: replacements.size
        };
    } catch  {
        return {
            messages,
            fuzzyCount: 0
        };
    }
}
function runFuzzyPass(messages, stepConfig, minBlockChars, principalId) {
    const raw = stepConfig["fuzzy"];
    const cfg = typeof raw === "boolean" ? {
        enabled: raw
    } : raw;
    if (!cfg?.enabled) return {
        messages,
        fuzzyCount: 0
    };
    return applyFuzzyPass(messages, {
        minJaccard: typeof cfg.minJaccard === "number" ? cfg.minJaccard : 0.85,
        shingleSize: typeof cfg.shingleSize === "number" ? cfg.shingleSize : 3,
        maxBlocks: MAX_FUZZY_BLOCKS,
        minBlockChars,
        principalId
    });
}
}),
"[project]/open-sse/services/compression/engines/session-dedup/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sessionDedupEngine",
    ()=>sessionDedupEngine
]);
/**
 * session-dedup compression engine (R11 / N2 / TO1)
 *
 * Content-addressed cross-turn deduplication, inspired by the TokenMizer
 * session-graph + line-dedup blueprint (arXiv 2606.06337) and sqz prior-art.
 *
 * Algorithm (two-pass, suffix-block content-addressed):
 *   Pass 1 — scan all non-system messages. For each message, enumerate suffix
 *             line blocks (lines[start..end-of-message]) that meet minBlockChars
 *             and minBlockLines. Hash each block. Record the first message that
 *             owns each hash.
 *   Pass 2 — for each non-system message (index i), find blocks whose hash was
 *             first seen in a STRICTLY EARLIER message (index j < i). Replace the
 *             LONGEST such block's text with `[dedup:ref sha=<8hex>]`.
 *             First occurrence is always kept intact.
 *
 * Greedy, longest-first replacement: sort duplicate blocks by length descending;
 * replace the longest block first so shorter overlapping candidates are skipped.
 *
 * Conservative guards:
 *   - Never touch `role: "system"`.
 *   - Never touch multipart content parts other than `type: "text"`.
 *   - Only dedup blocks ≥ minBlockChars (default 80 chars) AND ≥ MIN_BLOCK_LINES lines.
 *   - First occurrence is ALWAYS kept intact; only later identical occurrences are replaced.
 *
 * Reconstruction:
 *   Replace every `[dedup:ref sha=XXXXXXXX]` marker with the original block text
 *   from the reverse map attached as `__sessionDedupMap__` on the body object.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$session$2d$dedup$2f$fuzzy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/session-dedup/fuzzy.ts [app-route] (ecmascript)");
;
;
;
// ─── constants ────────────────────────────────────────────────────────────────
const ENGINE_ID = "session-dedup";
/** Minimum block character count to be a dedup candidate. */ const DEFAULT_MIN_BLOCK_CHARS = 80;
/** Minimum number of lines a block must span to be a dedup candidate. */ const MIN_BLOCK_LINES = 3;
/**
 * O(n²) guard for {@link findSuffixBlocks} (OOM incident): a single message with
 * thousands of lines otherwise generates one full-length suffix string PER line,
 * all retained at once. A real agent conversation embedding a large
 * line-numbered file view (e.g. a tool result pasting a multi-thousand-line
 * file back into the chat) drove ~1.7GB of live suffix strings and OOM-killed
 * the 2GB heap (heap snapshot confirmed 6801 `{ block }` objects). These bound
 * both the number of suffix starts scanned
 * and the total bytes of retained blocks, so memory is O(budget) instead of O(n²).
 * Dedup is best-effort — skipping the tail only forgoes some compression, never
 * changes output correctness.
 */ const MAX_SUFFIX_STARTS = 2000;
const MAX_TOTAL_BLOCK_BYTES = 8 * 1024 * 1024;
// ─── hash helper (SHA-256 prefix, collision-resistant) ───────────────────────
function hashBlock(text) {
    // 24 hex / 96 bits — collision-resistant (a 32-bit djb2 could collide and make a
    // dedup marker reference the WRONG block). Pass 2 additionally verifies block
    // equality before substituting, so a collision can never cause corruption.
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(text).digest("hex").slice(0, 24);
}
// ─── suffix-block extraction ──────────────────────────────────────────────────
/**
 * For each starting line position, emit the suffix block `lines[start..end]`
 * (i.e. from `start` to the end of the line array). This ensures that any
 * multiline sub-content that appears verbatim in multiple messages is discoverable
 * regardless of what text precedes it in each message.
 *
 * Only emits blocks that meet minBlockChars AND have at least MIN_BLOCK_LINES lines.
 * Uses a seen-set to deduplicate identical suffix blocks.
 */ function findSuffixBlocks(lines, minBlockChars) {
    const n = lines.length;
    const seen = new Set();
    const results = [];
    // O(n²) guard (#OOM): cap the number of suffix starts and the total retained
    // block bytes so a huge message can't materialize thousands of full-length
    // suffix strings at once. See MAX_SUFFIX_STARTS / MAX_TOTAL_BLOCK_BYTES.
    const maxStarts = Math.min(n, MAX_SUFFIX_STARTS);
    let totalBlockBytes = 0;
    for(let start = 0; start < maxStarts; start++){
        const block = lines.slice(start).join("\n");
        const blockLines = n - start;
        if (blockLines >= MIN_BLOCK_LINES && block.length >= minBlockChars && !seen.has(block)) {
            seen.add(block);
            results.push({
                block,
                startLine: start
            });
            totalBlockBytes += block.length;
            if (totalBlockBytes >= MAX_TOTAL_BLOCK_BYTES) break;
        }
    }
    return results;
}
// ─── two-pass dedup on message texts ─────────────────────────────────────────
/**
 * Deduplicates repeated lines within a single message (intra-message dedup).
 * Replaces repeated suffix blocks with markers.
 */ function dedupeWithinMessage(text, minBlockChars) {
    const lines = text.split("\n");
    const blocks = findSuffixBlocks(lines, minBlockChars);
    if (blocks.length < 2) return {
        deduped: text,
        changed: false
    };
    // Find the most common block (likely candidate for intra-message dedup).
    const blockFreq = new Map();
    for (const { block } of blocks){
        blockFreq.set(block, (blockFreq.get(block) || 0) + 1);
    }
    // Sort by frequency descending, then by length descending (prefer replacing more common, longer blocks first).
    const sortedBlocks = [
        ...blocks
    ].sort((a, b)=>{
        const freqDiff = (blockFreq.get(b.block) || 0) - (blockFreq.get(a.block) || 0);
        return freqDiff !== 0 ? freqDiff : b.block.length - a.block.length;
    });
    let result = text;
    let changed = false;
    for (const { block } of sortedBlocks){
        // Only dedup blocks that appear 2+ times in the text.
        const occurrences = (result.match(new RegExp(block.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
        if (occurrences < 2) continue;
        const sha = hashBlock(block);
        const marker = `[dedup:ref sha=${sha}]`;
        // Replace ALL occurrences except the first (keep the original once).
        let count = 0;
        result = result.replace(new RegExp(block.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), ()=>{
            count++;
            return count === 1 ? block : marker;
        });
        changed = true;
    }
    return {
        deduped: result,
        changed
    };
}
/**
 * Runs two-pass dedup over an ordered list of (msgIdx, text) pairs.
 * Returns the replaced texts for duplicate messages, a reverse map, and a count.
 */ function dedupMessageTexts(msgTexts, minBlockChars) {
    const deduped = new Map();
    let dedupCount = 0;
    // Single-message case: apply intra-message dedup.
    if (msgTexts.length === 1) {
        const { text, msgIdx } = msgTexts[0];
        const { deduped: dedupedText, changed } = dedupeWithinMessage(text, minBlockChars);
        if (changed) {
            deduped.set(msgIdx, dedupedText);
            dedupCount++;
        }
        return {
            deduped,
            dedupCount
        };
    }
    // Multi-message case: apply cross-turn dedup.
    // Pass 1: for each message, extract suffix blocks and record first ownership.
    // `firstSeen`: sha → { ownerMsgIdx, block }
    const firstSeen = new Map();
    for (const { msgIdx, text } of msgTexts){
        const lines = text.split("\n");
        const blocks = findSuffixBlocks(lines, minBlockChars);
        for (const { block } of blocks){
            const sha = hashBlock(block);
            if (!firstSeen.has(sha)) {
                firstSeen.set(sha, {
                    ownerMsgIdx: msgIdx,
                    block
                });
            }
        }
    }
    // Pass 2: for each message, find blocks that were FIRST seen in an earlier message.
    for (const { msgIdx, text } of msgTexts){
        const lines = text.split("\n");
        const blocks = findSuffixBlocks(lines, minBlockChars);
        // Collect blocks that are duplicates (owned by an earlier message).
        const dupBlocks = [];
        for (const { block } of blocks){
            const sha = hashBlock(block);
            const owner = firstSeen.get(sha);
            // owner.block === block guards against a (now astronomically unlikely) hash
            // collision substituting a marker that would reference the wrong block.
            if (owner && owner.ownerMsgIdx < msgIdx && owner.block === block) {
                dupBlocks.push({
                    block,
                    sha
                });
            }
        }
        if (dupBlocks.length === 0) continue;
        // Sort longest-first to prefer replacing the longest matching block.
        dupBlocks.sort((a, b)=>b.block.length - a.block.length);
        let result = text;
        let changed = false;
        const replaced = new Set(); // avoid double-replacing overlapping blocks
        for (const { block, sha } of dupBlocks){
            // Skip if this block is a suffix of a block already replaced (overlap guard).
            if ([
                ...replaced
            ].some((r)=>r.includes(block))) continue;
            const idx = result.indexOf(block);
            if (idx !== -1) {
                const marker = `[dedup:ref sha=${sha}]`;
                result = result.slice(0, idx) + marker + result.slice(idx + block.length);
                changed = true;
                replaced.add(block);
                break;
            }
        }
        if (changed) {
            deduped.set(msgIdx, result);
            dedupCount++;
        }
    }
    return {
        deduped,
        dedupCount
    };
}
/**
 * Process messages: collect text content, run two-pass dedup, apply results.
 */ function processMessages(messages, minBlockChars) {
    // Collect (msgIdx, text) for non-system string-content messages.
    // For multipart, index each text part separately.
    const msgTexts = [];
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        if (msg.role === "system") continue;
        if (typeof msg.content === "string") {
            msgTexts.push({
                msgIdx: i,
                text: msg.content
            });
        } else if (Array.isArray(msg.content)) {
            for(let p = 0; p < msg.content.length; p++){
                const part = msg.content[p];
                if (part["type"] === "text" && typeof part["text"] === "string") {
                    // Composite key: i * 100000 + p + 1 (safe for reasonable message counts)
                    msgTexts.push({
                        msgIdx: i * 100000 + p + 1,
                        text: part["text"]
                    });
                }
            }
        }
    }
    if (msgTexts.length === 0) {
        return {
            messages,
            dedupCount: 0
        };
    }
    const { deduped, dedupCount } = dedupMessageTexts(msgTexts, minBlockChars);
    if (dedupCount === 0) {
        return {
            messages,
            dedupCount: 0
        };
    }
    const result = messages.map((msg, i)=>{
        if (msg.role === "system") return {
            ...msg
        };
        if (typeof msg.content === "string") {
            const replacement = deduped.get(i);
            return replacement !== undefined ? {
                ...msg,
                content: replacement
            } : {
                ...msg
            };
        }
        if (Array.isArray(msg.content)) {
            let changed = false;
            const newContent = msg.content.map((part, p)=>{
                if (part["type"] !== "text" || typeof part["text"] !== "string") return part;
                const key = i * 100000 + p + 1;
                const replacement = deduped.get(key);
                if (replacement !== undefined) {
                    changed = true;
                    return {
                        ...part,
                        text: replacement
                    };
                }
                return part;
            });
            return changed ? {
                ...msg,
                content: newContent
            } : {
                ...msg
            };
        }
        return {
            ...msg
        };
    });
    return {
        messages: result,
        dedupCount
    };
}
// ─── schema & validation ──────────────────────────────────────────────────────
const SESSION_DEDUP_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: true
    },
    {
        key: "minBlockChars",
        type: "number",
        label: "Minimum block characters",
        description: "Minimum character count for a suffix block to be a dedup candidate.",
        defaultValue: DEFAULT_MIN_BLOCK_CHARS,
        min: 1,
        max: 100000
    },
    {
        key: "fuzzy",
        type: "boolean",
        label: "Fuzzy near-duplicate dedup",
        description: "Opt-in: replace whole messages ~85%+ similar to an earlier one with a recoverable CCR marker.",
        defaultValue: false
    }
];
function validateSessionDedupConfig(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    if (config["minBlockChars"] !== undefined) {
        const v = config["minBlockChars"];
        if (typeof v !== "number" || !Number.isFinite(v) || v < 1) {
            errors.push("minBlockChars must be a positive number");
        }
    }
    if (config["fuzzy"] !== undefined) {
        const f = config["fuzzy"];
        if (typeof f === "object" && f !== null) {
            const fe = f["enabled"];
            if (fe !== undefined && typeof fe !== "boolean") errors.push("fuzzy.enabled must be a boolean");
        } else if (typeof f !== "boolean") {
            errors.push("fuzzy must be an object { enabled } or a boolean");
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
const sessionDedupEngine = {
    id: ENGINE_ID,
    name: "Session Dedup",
    description: "Content-addressed cross-turn deduplication: replaces repeated multi-line blocks " + "with short reference markers (R11/N2/TO1, TokenMizer blueprint).",
    icon: "content_copy",
    targets: [
        "messages"
    ],
    stackable: true,
    // stackPriority 3 = runs BEFORE lite (5), caveman (20), aggressive (30), ultra (40).
    // Dedup first so downstream engines operate on already-deduplicated content.
    stackPriority: 3,
    metadata: {
        id: ENGINE_ID,
        name: "Session Dedup",
        description: "Content-addressed cross-turn deduplication: replaces repeated multi-line blocks with short reference markers.",
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
        const minBlockChars = typeof stepConfig["minBlockChars"] === "number" ? stepConfig["minBlockChars"] : DEFAULT_MIN_BLOCK_CHARS;
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const start = performance.now();
        const { messages: exactMessages, dedupCount } = processMessages(messages, minBlockChars);
        const { messages: finalMessages, fuzzyCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$session$2d$dedup$2f$fuzzy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runFuzzyPass"])(exactMessages, stepConfig, minBlockChars, options?.principalId);
        if (dedupCount + fuzzyCount === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const newBody = {
            ...body,
            messages: finalMessages
        };
        const durationMs = Math.round(performance.now() - start);
        const techniques = [
            "session-dedup"
        ];
        if (fuzzyCount > 0) techniques.push("fuzzy-dedup");
        const rules = [];
        if (dedupCount > 0) rules.push(`deduplicated-${dedupCount}-blocks`);
        if (fuzzyCount > 0) rules.push(`fuzzy-${fuzzyCount}-blocks`);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", techniques, rules, durationMs);
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
        return SESSION_DEDUP_SCHEMA;
    },
    validateConfig (config) {
        return validateSessionDedupConfig(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/headroom/gcf/scalar.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ATTACHMENT",
    ()=>ATTACHMENT,
    "MISSING",
    ()=>MISSING,
    "formatKey",
    ()=>formatKey,
    "formatNumber",
    ()=>formatNumber,
    "formatScalar",
    ()=>formatScalar,
    "isBareKey",
    ()=>isBareKey,
    "needsQuote",
    ()=>needsQuote,
    "parseQuotedString",
    ()=>parseQuotedString,
    "parseScalar",
    ()=>parseScalar,
    "quoteString",
    ()=>quoteString,
    "splitFieldDecl",
    ()=>splitFieldDecl,
    "splitRespectingQuotes",
    ()=>splitRespectingQuotes
]);
/**
 * Common scalar grammar for GCF (Graph Compact Format).
 * Vendored from gcf-typescript — generic profile only. Current with GCF spec v3.2
 * (nested object flattening) and the [N]: inline-array quoting fix.
 * https://github.com/blackwell-systems/gcf-typescript
 *
 * SPDX-License-Identifier: MIT
 */ const JSON_NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const NUMERIC_LIKE_RE = /^[+-]\.?\d|^\.\d|^0\d/;
const INLINE_ARRAY_RE = /\[[^\]]*\]\s*:/;
function needsQuote(s) {
    if (s === "") return true;
    if (s === "-" || s === "~" || s === "^" || s === "true" || s === "false") return true;
    if (JSON_NUMBER_RE.test(s)) return true;
    if (NUMERIC_LIKE_RE.test(s)) return true;
    if (s[0] === " " || s[s.length - 1] === " ") return true;
    if (s[0] === "#" || s[0] === "@" || s[0] === ".") return true;
    if (INLINE_ARRAY_RE.test(s)) return true;
    for(let i = 0; i < s.length; i++){
        const c = s.charCodeAt(i);
        if (c === 0x22 || c === 0x5c || c < 0x20 || c === 0x0a || c === 0x0d || c === 0x7c || c === 0x2c) return true; // " \ control \n \r | ,
        // C1 control characters
        if (c >= 0x80 && c <= 0x9f) return true;
        // Unicode whitespace beyond ASCII
        if (c > 0x7f && (c === 0xa0 || c === 0x2028 || c === 0x2029 || c === 0xfeff || c === 0x1680 || c >= 0x2000 && c <= 0x200a || c === 0x202f || c === 0x205f || c === 0x3000)) return true;
    }
    return false;
}
function quoteString(s) {
    let out = '"';
    for(let i = 0; i < s.length; i++){
        const c = s.charCodeAt(i);
        switch(c){
            case 0x22:
                out += '\\"';
                break;
            case 0x5c:
                out += "\\\\";
                break;
            case 0x08:
                out += "\\b";
                break;
            case 0x0c:
                out += "\\f";
                break;
            case 0x0a:
                out += "\\n";
                break;
            case 0x0d:
                out += "\\r";
                break;
            case 0x09:
                out += "\\t";
                break;
            default:
                if (c < 0x20) {
                    out += "\\u" + c.toString(16).padStart(4, "0");
                } else {
                    out += s[i];
                }
        }
    }
    return out + '"';
}
function formatScalar(v, delimiter = 0) {
    if (v === null || v === undefined) return "-";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return formatNumber(v);
    const s = String(v);
    if (needsQuote(s) || delimiter && s.includes(String.fromCharCode(delimiter))) {
        return quoteString(s);
    }
    return s;
}
function formatNumber(f) {
    if (Object.is(f, -0)) return "-0";
    if (f === 0) return "0";
    const abs = Math.abs(f);
    if (abs >= 1e-6 && abs < 1e21) {
        return toPreciseDecimal(f);
    }
    // Exponent notation.
    let s = f.toExponential();
    // Normalize: lowercase e, no leading zeros in exponent.
    s = s.replace(/[eE]\+?0*(\d)/, "e+$1").replace(/[eE]-0*(\d)/, "e-$1");
    return s;
}
function toPreciseDecimal(f) {
    // String(f) produces the shortest representation that round-trips through parseFloat.
    return String(f);
}
const BARE_KEY_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
function isBareKey(s) {
    return BARE_KEY_RE.test(s);
}
function formatKey(s) {
    return isBareKey(s) ? s : quoteString(s);
}
function parseScalar(s, tabularContext) {
    if (s === "") return "";
    // 1. Quoted string.
    if (s[0] === '"') return parseQuotedString(s);
    // 2. Null.
    if (s === "-") return null;
    // 3. Missing (tabular only).
    if (s === "~") {
        if (!tabularContext) throw new Error("invalid_missing: ~ outside tabular row cell");
        return MISSING;
    }
    // 4. Attachment (tabular only). Plain ^ or ^{fields} (inline schema).
    if (s === "^" || s.startsWith("^{") && s.endsWith("}")) {
        if (!tabularContext) throw new Error("invalid_attachment_marker: ^ outside tabular row cell");
        if (s === "^") return ATTACHMENT;
        // Inline schema: return the schema string for the caller to parse.
        return {
            __inlineSchema: s.slice(1)
        }; // e.g. "{name,email,tier}"
    }
    // 5. Boolean.
    if (s === "true") return true;
    if (s === "false") return false;
    // 6. Number.
    if (JSON_NUMBER_RE.test(s)) {
        const f = Number(s);
        if (!isNaN(f)) return f;
    }
    // 7. Bare string.
    return s;
}
const MISSING = Symbol("missing");
const ATTACHMENT = Symbol("attachment");
function parseQuotedString(s) {
    if (s.length < 2 || s[0] !== '"') throw new Error("unterminated_quote");
    let out = "";
    let i = 1;
    while(i < s.length){
        if (s[i] === '"') {
            if (i + 1 !== s.length) throw new Error("trailing_characters: after closing quote");
            return out;
        }
        if (s[i] === "\\") {
            if (i + 1 >= s.length) throw new Error("unterminated_quote");
            i++;
            switch(s[i]){
                case '"':
                    out += '"';
                    break;
                case "\\":
                    out += "\\";
                    break;
                case "/":
                    out += "/";
                    break;
                case "b":
                    out += "\b";
                    break;
                case "f":
                    out += "\f";
                    break;
                case "n":
                    out += "\n";
                    break;
                case "r":
                    out += "\r";
                    break;
                case "t":
                    out += "\t";
                    break;
                case "u":
                    {
                        if (i + 4 >= s.length) throw new Error("invalid_escape: incomplete unicode");
                        const hex = s.slice(i + 1, i + 5);
                        const code = parseInt(hex, 16);
                        if (isNaN(code)) throw new Error(`invalid_escape: invalid unicode \\u${hex}`);
                        // Surrogate pair handling.
                        if (code >= 0xd800 && code <= 0xdbff) {
                            if (i + 10 >= s.length || s[i + 5] !== "\\" || s[i + 6] !== "u") {
                                throw new Error("invalid_surrogate: isolated high surrogate");
                            }
                            const hex2 = s.slice(i + 7, i + 11);
                            const low = parseInt(hex2, 16);
                            if (isNaN(low) || low < 0xdc00 || low > 0xdfff) {
                                throw new Error("invalid_surrogate: invalid low surrogate");
                            }
                            out += String.fromCodePoint(0x10000 + (code - 0xd800) * 0x400 + (low - 0xdc00));
                            i += 11;
                            continue;
                        }
                        if (code >= 0xdc00 && code <= 0xdfff) {
                            throw new Error("invalid_surrogate: isolated low surrogate");
                        }
                        out += String.fromCharCode(code);
                        i += 5;
                        continue;
                    }
                default:
                    throw new Error(`invalid_escape: unknown \\${s[i]}`);
            }
            i++;
            continue;
        }
        if (s.charCodeAt(i) < 0x20) {
            throw new Error(`invalid_escape: unescaped control U+${s.charCodeAt(i).toString(16).padStart(4, "0")}`);
        }
        out += s[i];
        i++;
    }
    throw new Error("unterminated_quote");
}
function splitRespectingQuotes(s, delim) {
    const parts = [];
    let current = "";
    let inQuote = false;
    let escaped = false;
    for(let i = 0; i < s.length; i++){
        if (escaped) {
            current += s[i];
            escaped = false;
            continue;
        }
        if (s[i] === "\\" && inQuote) {
            current += s[i];
            escaped = true;
            continue;
        }
        if (s[i] === '"') {
            inQuote = !inQuote;
            current += s[i];
            continue;
        }
        if (s[i] === delim && !inQuote) {
            parts.push(current);
            current = "";
            continue;
        }
        current += s[i];
    }
    parts.push(current);
    return parts;
}
function splitFieldDecl(s) {
    if (s.length < 2 || s[0] !== "{") throw new Error("invalid field declaration");
    const closeIdx = findClosingBrace(s);
    if (closeIdx < 0) throw new Error("invalid field declaration");
    const inner = s.slice(1, closeIdx);
    if (!inner) return [];
    const raw = splitRespectingQuotes(inner, ",");
    const fields = [];
    const seen = new Set();
    for (const f of raw){
        const trimmed = f.trim();
        let name;
        if (trimmed.length >= 2 && trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"') {
            name = parseQuotedString(trimmed);
        } else {
            if (!isBareKey(trimmed)) throw new Error(`invalid field name: ${trimmed}`);
            name = trimmed;
        }
        if (seen.has(name)) throw new Error(`duplicate_field_name: ${name}`);
        seen.add(name);
        fields.push(name);
    }
    return fields;
}
function findClosingBrace(s) {
    let inQuote = false;
    let escaped = false;
    for(let i = 0; i < s.length; i++){
        if (escaped) {
            escaped = false;
            continue;
        }
        if (s[i] === "\\" && inQuote) {
            escaped = true;
            continue;
        }
        if (s[i] === '"') {
            inQuote = !inQuote;
            continue;
        }
        if (s[i] === "}" && !inQuote) return i;
    }
    return -1;
}
}),
"[project]/open-sse/services/compression/engines/headroom/gcf/generic.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encodeGeneric",
    ()=>encodeGeneric
]);
/**
 * GCF generic-profile encoder (encodeGeneric).
 * Vendored from gcf-typescript — generic profile only. Current with GCF spec v3.2
 * (nested object flattening) and the [N]: inline-array quoting fix.
 * https://github.com/blackwell-systems/gcf-typescript
 *
 * SPDX-License-Identifier: MIT
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/scalar.ts [app-route] (ecmascript)");
;
function indent(depth) {
    return "  ".repeat(depth);
}
function encodeGeneric(data, opts) {
    let out = "GCF profile=generic\n";
    out += encodeRootValue(data, opts);
    return out;
}
function encodeRootValue(v, opts) {
    if (v === null || v === undefined) return "=-\n";
    if (Array.isArray(v)) return encodeRootArray(v, opts);
    if (typeof v === "object") return encodeObject(v, 0, opts);
    return `=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0)}\n`;
}
function encodeObject(obj, depth, opts) {
    const prefix = indent(depth);
    let out = "";
    for (const key of Object.keys(obj)){
        const value = obj[key];
        const fk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatKey"])(key);
        if (Array.isArray(value)) {
            out += encodeNamedArray(fk, value, depth, opts);
        } else if (typeof value === "object" && value !== null) {
            out += `${prefix}## ${fk}\n`;
            out += encodeObject(value, depth + 1, opts);
        } else {
            out += `${prefix}${fk}=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(value, 0)}\n`;
        }
    }
    return out;
}
function encodeRootArray(arr, opts) {
    if (arr.length === 0) return "## [0]\n";
    if (allPrimitives(arr)) {
        const vals = arr.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0x2c));
        return `## [${arr.length}]: ${vals.join(",")}\n`;
    }
    const fields = tabularFields(arr);
    if (fields) return encodeTabular("## ", arr, fields, 0, opts);
    return encodeExpanded("## ", arr, 0, opts);
}
function encodeNamedArray(name, arr, depth, opts) {
    const prefix = indent(depth);
    if (arr.length === 0) return `${prefix}## ${name} [0]\n`;
    if (allPrimitives(arr)) {
        const vals = arr.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0x2c));
        return `${prefix}${name}[${arr.length}]: ${vals.join(",")}\n`;
    }
    const fields = tabularFields(arr);
    if (fields) return encodeTabular(`${prefix}## ${name} `, arr, fields, depth, opts);
    return encodeExpanded(`${prefix}## ${name} `, arr, depth, opts);
}
function tabularFields(arr) {
    if (arr.length === 0) return null;
    const fieldOrder = [];
    const seen = new Set();
    for (const item of arr){
        if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
        for (const k of Object.keys(item)){
            if (!seen.has(k)) {
                fieldOrder.push(k);
                seen.add(k);
            }
        }
    }
    return fieldOrder.length > 0 ? fieldOrder : null;
}
/** Check if a field is eligible for inline schema: all rows have same flat object shape with 3+ keys. */ function inlineSchemaFields(arr, fieldName) {
    // First row must have the field.
    const first = arr[0];
    if (!first || !Object.prototype.hasOwnProperty.call(first, fieldName)) return null;
    const firstVal = first[fieldName];
    if (firstVal === null || firstVal === undefined || typeof firstVal !== "object" || Array.isArray(firstVal)) return null;
    let canonicalKeys = null;
    for (const item of arr){
        const obj = item;
        if (!Object.prototype.hasOwnProperty.call(obj, fieldName) || obj[fieldName] === null || obj[fieldName] === undefined) continue;
        const v = obj[fieldName];
        if (typeof v !== "object" || Array.isArray(v)) return null;
        const keys = Object.keys(v);
        // All values must be scalars.
        for (const k of keys){
            const val = v[k];
            if (val !== null && val !== undefined && typeof val === "object") return null;
        }
        if (!canonicalKeys) {
            canonicalKeys = keys;
        } else {
            if (keys.length !== canonicalKeys.length) return null;
            for(let i = 0; i < keys.length; i++){
                if (keys[i] !== canonicalKeys[i]) return null;
            }
        }
    }
    if (!canonicalKeys || canonicalKeys.length < 3) return null;
    return canonicalKeys;
}
/** Check if array attachment has same tabular schema across all rows (first row must have it). All values must be scalars. */ function sharedArraySchema(arr, fieldName) {
    const first = arr[0];
    if (!first || !Object.prototype.hasOwnProperty.call(first, fieldName)) return null;
    const firstVal = first[fieldName];
    if (!Array.isArray(firstVal)) return null;
    let canonicalFields = null;
    for (const item of arr){
        const obj = item;
        if (!Object.prototype.hasOwnProperty.call(obj, fieldName) || obj[fieldName] === null || obj[fieldName] === undefined) continue;
        const v = obj[fieldName];
        if (!Array.isArray(v)) return null;
        const fields = tabularFields(v);
        if (!fields) return null;
        // All values must be scalars.
        for (const arrItem of v){
            if (typeof arrItem !== "object" || arrItem === null) return null;
            for (const val of Object.values(arrItem)){
                if (val !== null && val !== undefined && typeof val === "object") return null;
            }
        }
        if (!canonicalFields) {
            canonicalFields = fields;
        } else {
            if (fields.length !== canonicalFields.length) return null;
            for(let i = 0; i < fields.length; i++){
                if (fields[i] !== canonicalFields[i]) return null;
            }
        }
    }
    return canonicalFields;
}
// Keys that would pollute Object.prototype if used as a flatten path segment.
// An object carrying one of these is never flattened; it round-trips whole.
function isUnsafeKey(k) {
    return k === "__proto__" || k === "constructor" || k === "prototype";
}
function analyzeFlattenable(arr, fieldName, parentPath) {
    // Field names containing ">" cannot be flattened (would create ambiguous paths).
    if (fieldName.includes(">")) return null;
    let canonicalShape = null;
    for (const item of arr){
        const obj = item;
        if (!Object.prototype.hasOwnProperty.call(obj, fieldName) || obj[fieldName] === undefined) continue;
        if (obj[fieldName] === null) {
            // A nested (non-top-level) null cannot be flattened losslessly: its leaves would
            // encode as absent ("~") and unflatten back to a missing key, not null. Bail to
            // the whole-object (attachment) path. A top-level null is fine: it emits "-" and
            // reconstructs via the all-null rule, so just skip the row from shape analysis.
            if (parentPath !== "") return null;
            continue;
        }
        const v = obj[fieldName];
        if (typeof v !== "object" || Array.isArray(v)) return null;
        const keys = Object.keys(v);
        if (!canonicalShape) {
            // Null-prototype map so `k in canonicalShape` below only sees own keys
            // (a field literally named "toString"/"constructor" must not match the
            // Object.prototype chain), and reject prototype-pollution keys outright.
            canonicalShape = Object.create(null);
            for (const k of keys){
                if (k.includes(">") || isUnsafeKey(k)) return null;
                const val = v[k];
                if (val !== null && val !== undefined && typeof val === "object" && !Array.isArray(val)) {
                    canonicalShape[k] = "nested";
                } else if (Array.isArray(val)) {
                    return null;
                } else {
                    canonicalShape[k] = "scalar";
                }
            }
        } else {
            if (keys.length !== Object.keys(canonicalShape).length) return null;
            for (const k of keys){
                if (!Object.prototype.hasOwnProperty.call(canonicalShape, k)) return null;
                const val = v[k];
                const expected = canonicalShape[k];
                if (expected === "scalar") {
                    if (val !== null && val !== undefined && typeof val === "object") return null;
                } else if (expected === "nested") {
                    if (val !== null && val !== undefined) {
                        if (typeof val !== "object" || Array.isArray(val)) return null;
                    }
                }
            }
        }
    }
    if (!canonicalShape) return null;
    const currentPath = parentPath ? parentPath + ">" + fieldName : fieldName;
    const parentKeys = parentPath ? [
        ...parentPath.split(">"),
        fieldName
    ] : [
        fieldName
    ];
    const leaves = [];
    for (const k of Object.keys(canonicalShape)){
        if (canonicalShape[k] === "scalar") {
            leaves.push({
                path: currentPath + ">" + k,
                keys: [
                    ...parentKeys,
                    k
                ]
            });
        } else {
            const subArr = arr.map((item)=>{
                const obj = item;
                if (!Object.prototype.hasOwnProperty.call(obj, fieldName) || obj[fieldName] === null || obj[fieldName] === undefined) return {};
                return obj[fieldName];
            });
            const subLeaves = analyzeFlattenable(subArr, k, currentPath);
            if (!subLeaves || subLeaves.length === 0) return null;
            leaves.push(...subLeaves);
        }
    }
    // Guard: reject if any row has non-null object with all-null leaves.
    if (leaves.length > 0) {
        for (const item of arr){
            const obj = item;
            if (!Object.prototype.hasOwnProperty.call(obj, fieldName) || obj[fieldName] === null || obj[fieldName] === undefined) continue;
            const allNull = leaves.every((leaf)=>{
                const val = resolveKeyChain(item, leaf.keys);
                return val.exists && val.value === null;
            });
            if (allNull) return null;
        }
    }
    return leaves;
}
function resolveKeyChain(item, keys) {
    if (keys.length === 0) return {
        value: undefined,
        exists: false
    };
    const obj = item;
    if (typeof obj !== "object" || obj === null) return {
        value: undefined,
        exists: false
    };
    if (!Object.prototype.hasOwnProperty.call(obj, keys[0])) return {
        value: undefined,
        exists: false
    };
    let current = obj[keys[0]];
    if (current === null || current === undefined) return {
        value: current,
        exists: true
    };
    for(let i = 1; i < keys.length; i++){
        if (typeof current !== "object" || current === null) return {
            value: undefined,
            exists: false
        };
        const c = current;
        if (!Object.prototype.hasOwnProperty.call(c, keys[i])) return {
            value: undefined,
            exists: false
        };
        current = c[keys[i]];
    }
    return {
        value: current,
        exists: true
    };
}
// ── End flattening helpers ───────────────────────────────────────────────
function encodeTabular(headerPrefix, arr, fields, depth, opts) {
    const prefix = indent(depth);
    // Phase 0: Analyze fields for flattening.
    const flattenMap = new Map();
    if (!opts?.noFlatten) {
        for (const f of fields){
            const leaves = analyzeFlattenable(arr, f, "");
            if (leaves && leaves.length > 0) {
                flattenMap.set(f, leaves);
            }
        }
    }
    // Fields whose names contain ">" must not appear as tabular columns
    // because the decoder would interpret them as flattened path columns.
    // Track them for per-row attachment emission (spec rule 7.4.6.1.4).
    const gtFields = new Set();
    for (const f of fields){
        if (!flattenMap.has(f) && f.includes(">")) {
            gtFields.add(f);
        }
    }
    const columns = [];
    for (const f of fields){
        if (gtFields.has(f)) continue;
        const leaves = flattenMap.get(f);
        if (leaves) {
            for (const leaf of leaves){
                columns.push({
                    headerName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatKey"])(leaf.path),
                    colType: "flat",
                    field: f,
                    keys: leaf.keys
                });
            }
        } else {
            columns.push({
                headerName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatKey"])(f),
                colType: "original",
                field: f,
                keys: []
            });
        }
    }
    // If all fields were excluded (all contain ">"), fall back to expanded.
    if (columns.length === 0) {
        return encodeExpanded(headerPrefix, arr, depth, opts);
    }
    // Pre-compute inline schemas and shared array schemas (skip flattened fields).
    const inlineSchemas = new Map();
    const sharedArrSchemas = new Map();
    for (const f of fields){
        if (flattenMap.has(f)) continue;
        const ifs = inlineSchemaFields(arr, f);
        if (ifs) inlineSchemas.set(f, ifs);
        const sas = sharedArraySchema(arr, f);
        if (sas) sharedArrSchemas.set(f, sas);
    }
    const headerFields = columns.map((c)=>c.headerName);
    let out = `${headerPrefix}[${arr.length}]{${headerFields.join(",")}}\n`;
    for(let i = 0; i < arr.length; i++){
        const obj = arr[i];
        const cells = [];
        const attachments = [];
        let rowHasAttachment = false;
        for (const col of columns){
            if (col.colType === "flat") {
                // Resolve value via key chain.
                if (!Object.prototype.hasOwnProperty.call(obj, col.keys[0])) {
                    cells.push("~");
                } else {
                    // Check if top-level field is null.
                    const topVal = obj[col.keys[0]];
                    if (topVal === null || topVal === undefined) {
                        cells.push(topVal === null ? "-" : "~");
                    } else {
                        const resolved = resolveKeyChain(obj, col.keys);
                        if (!resolved.exists) {
                            cells.push("~");
                        } else if (resolved.value === null || resolved.value === undefined) {
                            cells.push("-");
                        } else {
                            cells.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(resolved.value, 0x7c));
                        }
                    }
                }
                continue;
            }
            // Original (non-flattened) field.
            const f = col.field;
            if (!Object.prototype.hasOwnProperty.call(obj, f)) {
                cells.push("~");
                continue;
            }
            const v = obj[f];
            if (v === null || v === undefined) {
                cells.push("-");
                continue;
            }
            if (typeof v === "object") {
                const ifs = inlineSchemas.get(f);
                if (ifs && !Array.isArray(v)) {
                    if (i === 0) {
                        const fmtIF = ifs.map((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatKey"])(k));
                        cells.push(`^{${fmtIF.join(",")}}`);
                    } else {
                        cells.push("^");
                    }
                    attachments.push({
                        name: f,
                        value: v,
                        inline: true,
                        inlineFields: ifs
                    });
                } else {
                    cells.push("^");
                    attachments.push({
                        name: f,
                        value: v,
                        inline: false
                    });
                }
                rowHasAttachment = true;
            } else {
                cells.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0x7c));
            }
        }
        // Emit fields with ">" in their names as per-row attachments.
        for (const f of fields){
            if (!gtFields.has(f)) continue;
            if (!Object.prototype.hasOwnProperty.call(obj, f)) continue;
            rowHasAttachment = true;
            attachments.push({
                name: f,
                value: obj[f],
                inline: false
            });
        }
        const row = cells.join("|");
        if (rowHasAttachment) {
            out += `${prefix}@${i} ${row}\n`;
        } else {
            out += `${prefix}${row}\n`;
        }
        for (const att of attachments){
            const fk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatKey"])(att.name);
            if (att.inline && att.inlineFields) {
                // Inline: single pipe-delimited row, no prefix, no indent.
                const vals = att.inlineFields.map((inf)=>{
                    const val = att.value[inf];
                    if (val === undefined) return "~";
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(val, 0x7c);
                });
                out += `${prefix}${vals.join("|")}\n`;
            } else if (Array.isArray(att.value)) {
                // Shared array schema: omit {fields} on subsequent rows.
                const sas = sharedArrSchemas.get(att.name);
                if (sas && i > 0) {
                    out += encodeAttachmentArrayShared(prefix, fk, att.value, depth + 2, sas, opts);
                } else {
                    out += encodeAttachmentArray(prefix, fk, att.value, depth + 2, opts);
                }
            } else if (typeof att.value === "object" && att.value !== null) {
                out += `${prefix}.${fk} {}\n`;
                out += encodeObject(att.value, depth + 2, opts);
            } else {
                // Scalar attachment (e.g. field names containing ">").
                if (att.value === null || att.value === undefined) {
                    out += `${prefix}.${fk} =-\n`;
                } else {
                    out += `${prefix}.${fk} =${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(att.value, 0)}\n`;
                }
            }
        }
    }
    return out;
}
function encodeAttachmentArray(attPrefix, fk, arr, depth, opts) {
    if (arr.length === 0) return `${attPrefix}.${fk} [0]\n`;
    if (allPrimitives(arr)) {
        const vals = arr.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0x2c));
        return `${attPrefix}.${fk} [${arr.length}]: ${vals.join(",")}\n`;
    }
    const fields = tabularFields(arr);
    if (fields) return encodeTabular(`${attPrefix}.${fk} `, arr, fields, depth, opts);
    return encodeExpanded(`${attPrefix}.${fk} `, arr, depth, opts);
}
function encodeAttachmentArrayShared(attPrefix, fk, arr, depth, sharedFields, opts) {
    if (arr.length === 0) return `${attPrefix}.${fk} [0]\n`;
    if (allPrimitives(arr)) {
        const vals = arr.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0x2c));
        return `${attPrefix}.${fk} [${arr.length}]: ${vals.join(",")}\n`;
    }
    // Verify fields match shared schema.
    const fields = tabularFields(arr);
    if (fields && fields.length === sharedFields.length && fields.every((f, i)=>f === sharedFields[i])) {
        // Omit {fields}, use shared schema.
        const prefix = indent(depth);
        let out = `${attPrefix}.${fk} [${arr.length}]\n`;
        for (const item of arr){
            const obj = item;
            const cells = sharedFields.map((f)=>{
                if (!Object.prototype.hasOwnProperty.call(obj, f)) return "~";
                if (obj[f] === null || obj[f] === undefined) return "-";
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(obj[f], 0x7c);
            });
            out += `${prefix}${cells.join("|")}\n`;
        }
        return out;
    }
    // Fields don't match: fall back to full encoding.
    return encodeAttachmentArray(attPrefix, fk, arr, depth, opts);
}
function encodeExpanded(headerPrefix, arr, depth, opts) {
    const prefix = indent(depth);
    let out = `${headerPrefix}[${arr.length}]\n`;
    for(let i = 0; i < arr.length; i++){
        const item = arr[i];
        if (Array.isArray(item)) {
            out += encodeExpandedArrayItem(prefix, i, item, depth, opts);
        } else if (typeof item === "object" && item !== null) {
            out += `${prefix}@${i} {}\n`;
            out += encodeObject(item, depth + 1, opts);
        } else {
            out += `${prefix}@${i} =${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(item, 0)}\n`;
        }
    }
    return out;
}
function encodeExpandedArrayItem(prefix, idx, arr, depth, opts) {
    if (arr.length === 0) return `${prefix}@${idx} [0]\n`;
    if (allPrimitives(arr)) {
        const vals = arr.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatScalar"])(v, 0x2c));
        return `${prefix}@${idx} [${arr.length}]: ${vals.join(",")}\n`;
    }
    const fields = tabularFields(arr);
    if (fields) return encodeTabular(`${prefix}@${idx} `, arr, fields, depth + 1, opts);
    return encodeExpanded(`${prefix}@${idx} `, arr, depth + 1, opts);
}
function allPrimitives(arr) {
    return arr.every((v)=>typeof v !== "object" || v === null);
}
}),
"[project]/open-sse/services/compression/engines/headroom/gcf/decode_generic.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeGeneric",
    ()=>decodeGeneric
]);
/**
 * GCF generic-profile decoder (decodeGeneric).
 * Vendored from gcf-typescript — generic profile only. Current with GCF spec v3.2
 * (nested object flattening) and the [N]: inline-array quoting fix.
 * https://github.com/blackwell-systems/gcf-typescript
 *
 * SPDX-License-Identifier: MIT
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/scalar.ts [app-route] (ecmascript)");
;
function decodeGeneric(input) {
    input = input.trimEnd();
    if (!input) throw new Error("missing_header: empty input");
    const lines = input.split("\n");
    const header = lines[0].replace(/\r$/, "");
    if (!header.startsWith("GCF ")) throw new Error("missing_header: first line does not begin with GCF");
    const profile = parseHeaderProfile(header);
    if (profile === "graph") {
        throw new Error("graph_profile_unsupported: this vendored build supports the generic profile only");
    }
    if (profile !== "generic") throw new Error(`unknown_profile: ${profile}`);
    // Filter body.
    const contentLines = [];
    let summaryLine = "";
    let deferredSectionCount = 0;
    for(let i = 1; i < lines.length; i++){
        const l = lines[i].replace(/\r$/, "");
        if (l === "") continue;
        // Tab check.
        for(let j = 0; j < l.length; j++){
            if (l[j] === "\t") throw new Error("tab_indentation: tabs in leading whitespace");
            if (l[j] !== " ") break;
        }
        const trimmed = l.trimStart();
        if (trimmed.startsWith("# ")) continue;
        if (trimmed.startsWith("##! ")) {
            summaryLine = trimmed;
            continue;
        }
        if (trimmed.startsWith("## ") && trimmed.includes("[?]")) deferredSectionCount++;
        contentLines.push(l);
    }
    // Validate ##! summary counts.
    if (summaryLine && deferredSectionCount > 0) {
        validateSummaryCounts(summaryLine, deferredSectionCount, contentLines);
    }
    if (contentLines.length === 0) return {};
    const first = contentLines[0].trimStart();
    // Root scalar.
    if (first.startsWith("=")) {
        if (contentLines.length > 1) throw new Error("trailing_characters: extra lines after root scalar");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(first.slice(1), false);
    }
    // Root array.
    if (first.startsWith("## [")) {
        const [arr] = parseArrayFromHeader(contentLines, 0, 0, first.slice(3));
        return arr;
    }
    // Root object.
    const result = {};
    parseObjectBody(contentLines, 0, 0, result);
    return result;
}
function parseHeaderProfile(header) {
    const parts = header.split(/\s+/);
    if (parts.length < 2) throw new Error("missing_profile");
    const seen = new Set();
    let profile = "";
    for(let i = 1; i < parts.length; i++){
        const eq = parts[i].indexOf("=");
        if (eq < 0) throw new Error(`malformed_header_field: ${parts[i]}`);
        const key = parts[i].slice(0, eq);
        if (seen.has(key)) throw new Error(`duplicate_header_field: ${key}`);
        seen.add(key);
        if (key === "profile") profile = parts[i].slice(eq + 1);
    }
    if (!profile) throw new Error("missing_profile");
    return profile;
}
function parseObjectBody(lines, start, depth, out) {
    const ind = "  ".repeat(depth);
    let i = start;
    while(i < lines.length){
        const line = lines[i];
        if (depth > 0 && !line.startsWith(ind)) break;
        const content = depth > 0 ? line.slice(ind.length) : line;
        if (content.length > 0 && content[0] === " ") {
            throw new Error("invalid_indent: indentation increases by more than one level");
        }
        // Array section.
        if (content.startsWith("## ")) {
            const hdr = content.slice(3);
            const bi = hdr.indexOf(" [");
            if (bi >= 0) {
                const name = parseKeyFromHeader(hdr.slice(0, bi));
                checkDup(out, name);
                const [arr, consumed] = parseArrayFromHeader(lines, i, depth, hdr.slice(bi));
                safeAssign(out, name, arr);
                i += consumed;
                continue;
            }
            const name = parseKeyFromHeader(hdr);
            checkDup(out, name);
            i++;
            const nested = {};
            const consumed = parseObjectBody(lines, i, depth + 1, nested);
            safeAssign(out, name, nested);
            i += consumed;
            continue;
        }
        // Key=value. Check this BEFORE inline array detection so that bracket
        // patterns inside quoted values (e.g. text="ERR[404]: Not Found") are
        // not misinterpreted as inline array headers.
        const eqIdx = findKeyValueSplit(content);
        if (eqIdx > 0) {
            const name = parseKeyFromHeader(content.slice(0, eqIdx));
            checkDup(out, name);
            safeAssign(out, name, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(content.slice(eqIdx + 1), false));
            i++;
            continue;
        }
        // Inline array (e.g. items[3]: a,b,c). Only reached if no = found.
        if (!content.startsWith("@") && !content.startsWith("##")) {
            const bracketIdx = content.indexOf("[");
            if (bracketIdx > 0) {
                const rest = content.slice(bracketIdx);
                const closeIdx = rest.indexOf("]");
                if (closeIdx >= 0) {
                    const after = rest.slice(closeIdx + 1);
                    if (after.startsWith(": ") || after === ":") {
                        const name = parseKeyFromHeader(content.slice(0, bracketIdx));
                        checkDup(out, name);
                        const [arr] = parseArrayFromHeader(lines, i, depth, rest);
                        safeAssign(out, name, arr);
                        i++;
                        continue;
                    }
                }
            }
        }
        i++;
    }
    return i - start;
}
function findKeyValueSplit(s) {
    if (!s.length) return -1;
    // Quoted key: "key"=value
    if (s[0] === '"') {
        for(let i = 1; i < s.length; i++){
            if (s[i] === "\\") {
                i++;
                continue;
            }
            if (s[i] === '"') return i + 1 < s.length && s[i + 1] === "=" ? i + 1 : -1;
        }
        return -1;
    }
    // Bare key: find = but only before [ (to avoid matching = inside inline array values)
    const eqIdx = s.indexOf("=");
    if (eqIdx < 0) return -1;
    const bracketIdx = s.indexOf("[");
    if (bracketIdx >= 0 && bracketIdx < eqIdx) return -1;
    return eqIdx;
}
function parseKeyFromHeader(s) {
    s = s.trim();
    if (s.length >= 2 && s[0] === '"') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuotedString"])(s);
    return s;
}
function checkDup(obj, key) {
    // Own-property check only: `key in obj` would spuriously fire on inherited
    // names like "toString"/"constructor" and mislabel them as duplicates.
    if (Object.prototype.hasOwnProperty.call(obj, key)) throw new Error(`duplicate_key: ${key}`);
}
function parseArrayFromHeader(lines, headerLine, depth, bracketPart) {
    const bp = bracketPart.trimStart();
    if (!bp.startsWith("[")) throw new Error("invalid_count");
    const closeIdx = bp.indexOf("]");
    if (closeIdx < 0) throw new Error("invalid_count");
    const countStr = bp.slice(1, closeIdx);
    const afterBracket = bp.slice(closeIdx + 1);
    let count = -1;
    if (countStr !== "?") count = parseCount(countStr);
    if (count === 0 && !afterBracket.startsWith("{") && !afterBracket.startsWith(":")) {
        return [
            [],
            1
        ];
    }
    // Inline.
    if (afterBracket.startsWith(": ") || afterBracket === ":") {
        const valsStr = afterBracket.startsWith(": ") ? afterBracket.slice(2) : "";
        if (!valsStr) {
            if (count >= 0 && count !== 0) throw new Error(`count_mismatch: declared ${count}, got 0`);
            return [
                [],
                1
            ];
        }
        const vals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitRespectingQuotes"])(valsStr, ",");
        if (count >= 0 && vals.length !== count) throw new Error(`count_mismatch: declared ${count}, got ${vals.length}`);
        return [
            vals.map((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(v.trim(), false)),
            1
        ];
    }
    // Tabular.
    if (afterBracket.startsWith("{")) {
        const braceEnd = findClosingBrace(afterBracket);
        if (braceEnd < 0) throw new Error("invalid field declaration");
        const fields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitFieldDecl"])(afterBracket.slice(0, braceEnd + 1));
        const [rows, consumed] = parseTabularBody(lines, headerLine + 1, depth, fields, count);
        if (count >= 0 && rows.length !== count) throw new Error(`count_mismatch: declared ${count}, got ${rows.length}`);
        return [
            rows,
            consumed + 1
        ];
    }
    // Expanded.
    const [items, consumed] = parseExpandedBody(lines, headerLine + 1, depth);
    if (count >= 0 && items.length !== count) throw new Error(`count_mismatch: declared ${count}, got ${items.length}`);
    return [
        items,
        consumed + 1
    ];
}
function findClosingBrace(s) {
    let inQuote = false, escaped = false;
    for(let i = 0; i < s.length; i++){
        if (escaped) {
            escaped = false;
            continue;
        }
        if (s[i] === "\\" && inQuote) {
            escaped = true;
            continue;
        }
        if (s[i] === '"') {
            inQuote = !inQuote;
            continue;
        }
        if (s[i] === "}" && !inQuote) return i;
    }
    return -1;
}
// A path segment that would pollute Object.prototype if written through.
function isUnsafePathKey(k) {
    return k === "__proto__" || k === "constructor" || k === "prototype";
}
// Assign a decoded key without ever mutating Object.prototype: a literal
// "__proto__" key is written as an own data property (matching JSON.parse
// semantics) instead of reassigning the prototype. All other keys, including
// "constructor"/"prototype", are ordinary own-property writes and safe.
function safeAssign(obj, key, value) {
    if (key === "__proto__") {
        Object.defineProperty(obj, key, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
        });
    } else {
        obj[key] = value;
    }
}
function unflattenPaths(pathColumns, flatValues, flatAbsent) {
    // Group by top-level parent.
    const groups = new Map();
    const groupOrder = [];
    for (const [fieldName, paths] of pathColumns){
        if (paths.length === 0) continue;
        // Drop any path with a prototype-pollution segment. A conformant encoder
        // never emits these; their presence means hand-crafted/hostile GCF, so the
        // safe action is to discard the column rather than write through __proto__.
        if (paths.some(isUnsafePathKey)) continue;
        const top = paths[0];
        if (!groups.has(top)) {
            groups.set(top, []);
            groupOrder.push(top);
        }
        groups.get(top).push(fieldName);
    }
    const result = {};
    for (const top of groupOrder){
        const fieldNames = groups.get(top);
        const allAbsent = fieldNames.every((f)=>flatAbsent.has(f));
        const allNull = fieldNames.every((f)=>{
            if (flatAbsent.has(f)) return false;
            const val = flatValues.get(f);
            return val === null;
        });
        if (allAbsent) continue;
        if (allNull) {
            result[top] = null;
            continue;
        }
        for (const fieldName of fieldNames){
            if (flatAbsent.has(fieldName)) continue;
            const paths = pathColumns.get(fieldName);
            const val = flatValues.has(fieldName) ? flatValues.get(fieldName) : null;
            let current = result;
            for(let k = 0; k < paths.length - 1; k++){
                const segment = paths[k];
                const existing = current[segment];
                // Overwrite with a fresh object when the slot is missing OR holds a
                // non-object (null/primitive), so traversal never dereferences a
                // non-object on malformed input. Conformant output never hits this.
                if (!Object.prototype.hasOwnProperty.call(current, segment) || existing === null || typeof existing !== "object") {
                    current[segment] = {};
                }
                current = current[segment];
            }
            current[paths[paths.length - 1]] = val;
        }
    }
    return result;
}
function parseTabularBody(lines, start, depth, fields, expectedCount) {
    const ind = "  ".repeat(depth);
    const rows = [];
    let i = start;
    // Detect path columns: fields containing ">".
    const pathColumnMap = new Map();
    for (const f of fields){
        if (f.includes(">")) {
            const parts = f.split(">");
            // Only treat as a path column if all segments are non-empty.
            // A literal key like ">" would split into ["", ""].
            if (parts.every((p)=>p.length > 0)) {
                pathColumnMap.set(f, parts);
            }
        }
    }
    // Track inline schemas and shared array schemas.
    const inlineSchemas = new Map();
    const sharedArraySchemas = new Map();
    while(i < lines.length){
        const line = lines[i];
        const content = depth > 0 ? line.startsWith(ind) ? line.slice(ind.length) : null : line;
        if (content === null) break;
        if (content.startsWith("## ") || content.startsWith("##!")) break;
        if (content.length > 0 && content[0] === " ") {
            const trimmed = content.trimStart();
            if (trimmed.startsWith(".")) break; // attachment lines handled below (v2 indented or v3)
            break;
        }
        // Strip @N prefix (must be @digits).
        let rowData = content;
        let rowHasID = false;
        if (rowData.startsWith("@")) {
            const sp = rowData.indexOf(" ");
            if (sp > 0) {
                const idStr = rowData.slice(1, sp);
                if (/^\d+$/.test(idStr)) {
                    rowData = rowData.slice(sp + 1);
                    rowHasID = true;
                }
            }
        }
        const vals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitRespectingQuotes"])(rowData, "|");
        if (vals.length !== fields.length) throw new Error(`row_width_mismatch: expected ${fields.length}, got ${vals.length}`);
        // Parse cells: scalars, traditional attachments, and inline schema attachments.
        const cellValues = new Map();
        const traditionalAttFields = [];
        const inlineAttFields = [];
        const inlineAttOrder = [];
        const missingFields = new Set();
        // Collect path column values for unflattening.
        const flatValues = new Map();
        const flatAbsent = new Set();
        for(let j = 0; j < fields.length; j++){
            const cellVal = vals[j];
            // Path columns: store values for later unflattening.
            if (pathColumnMap.has(fields[j])) {
                const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(cellVal, true);
                if (parsed === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MISSING"]) {
                    flatAbsent.add(fields[j]);
                } else {
                    flatValues.set(fields[j], parsed);
                }
                continue;
            }
            // Check for ^{fields} inline schema declaration.
            if (cellVal.startsWith("^{") && cellVal.endsWith("}")) {
                const schemaStr = cellVal.slice(1);
                const ifs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitFieldDecl"])(schemaStr);
                inlineSchemas.set(fields[j], ifs);
                inlineAttFields.push(fields[j]);
                inlineAttOrder.push(fields[j]);
                continue;
            }
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(cellVal, true);
            if (parsed === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MISSING"]) {
                missingFields.add(fields[j]);
                continue;
            }
            if (parsed === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ATTACHMENT"]) {
                // Check if this field has a stored inline schema.
                if (inlineSchemas.has(fields[j])) {
                    inlineAttFields.push(fields[j]);
                    inlineAttOrder.push(fields[j]);
                } else {
                    traditionalAttFields.push(fields[j]);
                }
                continue;
            }
            // Handle inline schema objects returned by parseScalar (for ^{...} that got through).
            if (parsed && typeof parsed === "object" && parsed.__inlineSchema) {
                const ifs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitFieldDecl"])(parsed.__inlineSchema);
                inlineSchemas.set(fields[j], ifs);
                inlineAttFields.push(fields[j]);
                inlineAttOrder.push(fields[j]);
                continue;
            }
            cellValues.set(fields[j], parsed);
        }
        i++;
        // Parse attachments in line order.
        const allAttFields = [
            ...traditionalAttFields,
            ...inlineAttFields
        ];
        const attachmentValues = new Map();
        if (rowHasID) {
            let inlineIdx = 0;
            while(i < lines.length){
                const aLine = lines[i];
                let aContent = null;
                if (depth === 0 || aLine.startsWith(ind)) {
                    aContent = depth > 0 ? aLine.slice(ind.length) : aLine;
                } else {
                    break;
                }
                if (aContent === null) break;
                // Line starts with ".": traditional or prefixed inline attachment.
                // Also handle v2-format indented attachments ("  .field ...").
                let attContent = aContent;
                if (!attContent.startsWith(".") && attContent.startsWith("  .")) {
                    attContent = attContent.slice(2); // strip v2 indent
                }
                if (attContent.startsWith(".")) {
                    const rest = attContent.slice(1);
                    const [attName, afterName] = parseAttachmentName(rest);
                    // Check if this is an inline schema field with pipe-delimited data.
                    const ifs = inlineSchemas.get(attName);
                    if (ifs && !afterName.trimStart().startsWith("{}") && !afterName.trimStart().startsWith("[")) {
                        const data = afterName.trimStart();
                        const inlineVals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitRespectingQuotes"])(data, "|");
                        if (inlineVals.length !== ifs.length) throw new Error(`inline_width_mismatch: ${attName} expected ${ifs.length}, got ${inlineVals.length}`);
                        const obj = {};
                        for(let k = 0; k < ifs.length; k++){
                            const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(inlineVals[k], true);
                            if (p !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MISSING"]) obj[ifs[k]] = p;
                        }
                        if (attachmentValues.has(attName)) throw new Error(`duplicate_attachment: ${attName}`);
                        attachmentValues.set(attName, obj);
                        i++;
                        continue;
                    }
                    // Traditional attachment.
                    const [name, val, consumed, parsedFields] = parseAttachment(lines, i, rest, depth + 2, sharedArraySchemas);
                    if (attachmentValues.has(name)) throw new Error(`duplicate_attachment: ${name}`);
                    // Store shared array schema from first row.
                    if (rows.length === 0 && parsedFields) {
                        sharedArraySchemas.set(name, parsedFields);
                    }
                    attachmentValues.set(name, val);
                    i += consumed;
                    continue;
                }
                // No-prefix line: positional inline data.
                let foundInline = false;
                let nextInlineField = "";
                while(inlineIdx < inlineAttOrder.length){
                    const candidate = inlineAttOrder[inlineIdx];
                    if (!attachmentValues.has(candidate)) {
                        nextInlineField = candidate;
                        foundInline = true;
                        break;
                    }
                    inlineIdx++;
                }
                if (!foundInline) break;
                const ifs = inlineSchemas.get(nextInlineField);
                const inlineVals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitRespectingQuotes"])(aContent, "|");
                if (inlineVals.length !== ifs.length) throw new Error(`inline_width_mismatch: ${nextInlineField} expected ${ifs.length}, got ${inlineVals.length}`);
                const obj = {};
                for(let k = 0; k < ifs.length; k++){
                    const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(inlineVals[k], true);
                    if (p !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MISSING"]) obj[ifs[k]] = p;
                }
                attachmentValues.set(nextInlineField, obj);
                inlineIdx++;
                i++;
            }
            for (const f of allAttFields){
                if (!attachmentValues.has(f)) throw new Error(`missing_attachment: ${f}`);
            }
            // Check for duplicate attachments: if the next line is also an attachment
            // line at this depth, it means there's a second attachment for a field
            // that was already resolved.
            if (i < lines.length) {
                let peekContent = null;
                if (depth === 0 || lines[i].startsWith(ind)) {
                    peekContent = depth > 0 ? lines[i].slice(ind.length) : lines[i];
                }
                if (peekContent !== null) {
                    let peekAtt = peekContent;
                    if (!peekAtt.startsWith(".") && peekAtt.startsWith("  .")) {
                        peekAtt = peekAtt.slice(2);
                    }
                    if (peekAtt.startsWith(".")) {
                        const peekRest = peekAtt.slice(1);
                        const [peekName] = parseAttachmentName(peekRest);
                        if (attachmentValues.has(peekName)) {
                            throw new Error(`duplicate_attachment: ${peekName}`);
                        }
                    }
                }
            }
        }
        // Build row in field declaration order.
        const row = {};
        for (const f of fields){
            if (missingFields.has(f)) continue;
            if (cellValues.has(f)) {
                safeAssign(row, f, cellValues.get(f));
                continue;
            }
            if (attachmentValues.has(f)) {
                safeAssign(row, f, attachmentValues.get(f));
                continue;
            }
        }
        // Also add any orphan attachment values (fields excluded from column list, e.g. ">" fields).
        for (const [k, v] of attachmentValues){
            if (!Object.prototype.hasOwnProperty.call(row, k)) safeAssign(row, k, v);
        }
        // Unflatten path columns into nested objects.
        if (pathColumnMap.size > 0) {
            const nested = unflattenPaths(pathColumnMap, flatValues, flatAbsent);
            for (const [k, v] of Object.entries(nested)){
                safeAssign(row, k, v);
            }
        }
        rows.push(row);
        if (expectedCount >= 0 && rows.length >= expectedCount) break;
    }
    return [
        rows,
        i - start
    ];
}
function parseAttachmentName(rest) {
    if (rest[0] === '"') {
        for(let j = 1; j < rest.length; j++){
            if (rest[j] === "\\") {
                j++;
                continue;
            }
            if (rest[j] === '"') {
                const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuotedString"])(rest.slice(0, j + 1));
                return [
                    name,
                    rest.slice(j + 1)
                ];
            }
        }
        return [
            "",
            rest
        ];
    }
    const sp = rest.indexOf(" ");
    if (sp >= 0) return [
        rest.slice(0, sp),
        rest.slice(sp)
    ];
    return [
        rest,
        ""
    ];
}
/** Attachment parser: returns [name, value, consumed, parsedFields]. parsedFields is set for tabular arrays with explicit {fields}. */ function parseAttachment(lines, lineIdx, rest, depth, sharedSchemas) {
    const [name, afterNameRaw] = parseAttachmentName(rest);
    const afterName = afterNameRaw.trimStart();
    if (afterName.startsWith("{}")) {
        const nested = {};
        const consumed = parseObjectBody(lines, lineIdx + 1, depth, nested);
        return [
            name,
            nested,
            consumed + 1,
            null
        ];
    }
    if (afterName.startsWith("[")) {
        const closeBracket = afterName.indexOf("]");
        if (closeBracket < 0) throw new Error("invalid_count: missing ]");
        const afterClose = afterName.slice(closeBracket + 1);
        // [N]{fields}: has its own schema.
        if (afterClose.startsWith("{")) {
            const endBrace = findClosingBrace(afterClose);
            let parsedFields = null;
            if (endBrace >= 0) {
                try {
                    parsedFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitFieldDecl"])(afterClose.slice(0, endBrace + 1));
                } catch  {}
            }
            const [arr, consumed] = parseArrayFromHeader(lines, lineIdx, depth, afterName);
            return [
                name,
                arr,
                consumed,
                parsedFields
            ];
        }
        // [N]: values or [N] (check for inline primitive array first).
        const afterCloseForInline = afterName.slice(closeBracket + 1);
        if (afterCloseForInline.startsWith(": ") || afterCloseForInline === ":") {
            // Inline primitive array: don't use shared schema.
            const [arr, consumed] = parseArrayFromHeader(lines, lineIdx, depth, afterName);
            return [
                name,
                arr,
                consumed,
                null
            ];
        }
        // [N] without {fields}: check for shared schema.
        if (sharedSchemas.has(name)) {
            const sf = sharedSchemas.get(name);
            const countStr = afterName.slice(1, closeBracket);
            let count = -1;
            if (countStr !== "?") {
                try {
                    count = parseCount(countStr);
                } catch  {
                    count = -1;
                }
            }
            if (count === 0) return [
                name,
                [],
                1,
                null
            ];
            // Peek: if next line starts with @, it's expanded, not tabular.
            const nextIdx = lineIdx + 1;
            const ind = "  ".repeat(depth);
            let useShared = true;
            if (nextIdx < lines.length) {
                let nextContent = lines[nextIdx];
                if (depth > 0 && nextContent.startsWith(ind)) nextContent = nextContent.slice(ind.length);
                if (nextContent.trimStart().startsWith("@")) useShared = false;
            }
            if (useShared) {
                const [rows, consumed] = parseTabularBody(lines, lineIdx + 1, depth, sf, count);
                if (count >= 0 && rows.length !== count) throw new Error(`count_mismatch: declared ${count}, got ${rows.length}`);
                return [
                    name,
                    rows,
                    consumed + 1,
                    null
                ];
            }
        }
        // No shared schema: standard parsing.
        const [arr, consumed] = parseArrayFromHeader(lines, lineIdx, depth, afterName);
        return [
            name,
            arr,
            consumed,
            null
        ];
    }
    // Scalar: =value (field names containing ">" excluded from tabular columns).
    if (afterName.startsWith("=")) {
        const valStr = afterName.slice(1);
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(valStr, true);
        if (parsed === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MISSING"]) return [
            name,
            null,
            1,
            null
        ];
        return [
            name,
            parsed,
            1,
            null
        ];
    }
    throw new Error(`invalid attachment form: ${afterName}`);
}
function parseExpandedBody(lines, start, depth) {
    const ind = "  ".repeat(depth);
    const items = [];
    let i = start;
    while(i < lines.length){
        const line = lines[i];
        const content = depth > 0 ? line.startsWith(ind) ? line.slice(ind.length) : null : line;
        if (content === null) break;
        if (content.startsWith("## ") || content.startsWith("##!")) break;
        if (!content.startsWith("@")) break;
        const sp = content.indexOf(" ");
        if (sp < 0) break;
        const idStr = content.slice(1, sp);
        const id = parseInt(idStr, 10);
        if (!isNaN(id) && id !== items.length) {
            throw new Error(`invalid_item_id: expected @${items.length}, got @${idStr}`);
        }
        const marker = content.slice(sp + 1);
        if (marker.startsWith("=")) {
            items.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$scalar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseScalar"])(marker.slice(1), false));
            i++;
            continue;
        }
        if (marker.startsWith("{}")) {
            const nested = {};
            i++;
            const consumed = parseObjectBody(lines, i, depth + 1, nested);
            items.push(nested);
            i += consumed;
            continue;
        }
        if (marker.startsWith("[")) {
            const [arr, consumed] = parseArrayFromHeader(lines, i, depth + 1, marker);
            items.push(arr);
            i += consumed;
            continue;
        }
        break;
    }
    return [
        items,
        i - start
    ];
}
function parseCount(s) {
    if (s === "0") return 0;
    if (!s.length || s[0] === "0") throw new Error(`invalid_count: ${s}`);
    const n = parseInt(s, 10);
    if (isNaN(n) || String(n) !== s) throw new Error(`invalid_count: ${s}`);
    return n;
}
function validateSummaryCounts(summaryLine, deferredCount, contentLines) {
    // Parse counts from "##! summary counts=N,M,..."
    const parts = summaryLine.split(/\s+/);
    let countsStr = "";
    for (const p of parts){
        if (p.startsWith("counts=")) {
            countsStr = p.slice(7);
            break;
        }
    }
    if (!countsStr) return;
    const countVals = countsStr.split(",");
    if (countVals.length !== deferredCount) {
        throw new Error(`count_mismatch: summary has ${countVals.length} count entries but ${deferredCount} deferred sections`);
    }
    // Count actual items per deferred section.
    const actualCounts = [];
    let inDeferred = false;
    let currentCount = 0;
    for (const l of contentLines){
        const trimmed = l.trimStart();
        if (trimmed.startsWith("## ") && trimmed.includes("[?]")) {
            if (inDeferred) actualCounts.push(currentCount);
            inDeferred = true;
            currentCount = 0;
            continue;
        }
        if (trimmed.startsWith("## ")) {
            if (inDeferred) {
                actualCounts.push(currentCount);
                inDeferred = false;
            }
            continue;
        }
        if (inDeferred && !trimmed.startsWith(" ") && !trimmed.startsWith(".")) {
            currentCount++;
        }
    }
    if (inDeferred) actualCounts.push(currentCount);
    for(let i = 0; i < countVals.length; i++){
        const declared = parseInt(countVals[i], 10);
        if (isNaN(declared)) throw new Error(`count_mismatch: invalid count value "${countVals[i]}"`);
        if (i < actualCounts.length && declared !== actualCounts[i]) {
            throw new Error(`count_mismatch: section ${i} declared ${declared} in summary, actual ${actualCounts[i]}`);
        }
    }
}
}),
"[project]/open-sse/services/compression/engines/headroom/gcf/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * GCF (Graph Compact Format) — generic profile encoder/decoder.
 * Vendored from gcf-typescript for zero-dependency integration. Current with
 * GCF spec v3.2 (nested object flattening) + [N]: inline-array quoting fix.
 * https://github.com/blackwell-systems/gcf-typescript
 *
 * SPDX-License-Identifier: MIT
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$generic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/generic.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$decode_generic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/decode_generic.ts [app-route] (ecmascript)");
;
;
}),
"[project]/open-sse/services/compression/engines/headroom/toon.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TOON_FENCE_CLOSE",
    ()=>TOON_FENCE_CLOSE,
    "TOON_FENCE_OPEN",
    ()=>TOON_FENCE_OPEN,
    "decodeToon",
    ()=>decodeToon,
    "encodeToonBlock",
    ()=>encodeToonBlock,
    "wrapToon",
    ()=>wrapToon
]);
/**
 * toon.ts — TOON (@toon-format/toon) candidate encoder for the headroom engine.
 *
 * TOON is a second encoder considered alongside GCF in the SmartCrusher best-of-N
 * gate. GCF stays the default and tiebreak winner; TOON is used only when strictly
 * smaller. All entry points are FAIL-OPEN: any throw yields null/[] so a TOON bug
 * can never break headroom compaction. Pure: no Date.now / Math.random.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$toon$2d$format$2f$toon$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@toon-format/toon/dist/index.mjs [app-route] (ecmascript)");
;
const TOON_FENCE_OPEN = "```toon";
const TOON_FENCE_CLOSE = "```";
function encodeToonBlock(arr) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$toon$2d$format$2f$toon$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encode"])(arr);
    } catch  {
        return null;
    }
}
function wrapToon(blockContent) {
    return `${TOON_FENCE_OPEN}\n${blockContent}\n${TOON_FENCE_CLOSE}`;
}
function decodeToon(text) {
    let inner = text;
    if (inner.startsWith(TOON_FENCE_OPEN + "\n")) {
        inner = inner.slice(TOON_FENCE_OPEN.length + 1);
        if (inner.endsWith("\n" + TOON_FENCE_CLOSE)) {
            inner = inner.slice(0, inner.length - TOON_FENCE_CLOSE.length - 1);
        } else if (inner.endsWith(TOON_FENCE_CLOSE)) {
            inner = inner.slice(0, inner.length - TOON_FENCE_CLOSE.length);
        }
    }
    try {
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$toon$2d$format$2f$toon$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decode"])(inner);
        if (Array.isArray(decoded)) return decoded;
        return [
            decoded
        ];
    } catch  {
        return [];
    }
}
}),
"[project]/open-sse/services/compression/engines/headroom/tabular.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GCF_FENCE_CLOSE",
    ()=>GCF_FENCE_CLOSE,
    "GCF_FENCE_OPEN",
    ()=>GCF_FENCE_OPEN,
    "TABULAR_FENCE_CLOSE",
    ()=>TABULAR_FENCE_CLOSE,
    "TABULAR_FENCE_OPEN",
    ()=>TABULAR_FENCE_OPEN,
    "TABULAR_MARKER_RE",
    ()=>TABULAR_MARKER_RE,
    "decodeTabular",
    ()=>decodeTabular,
    "decodeTabularBlockLegacy",
    ()=>decodeTabularBlockLegacy,
    "encodeGcfBlock",
    ()=>encodeGcfBlock,
    "encodeTabular",
    ()=>encodeTabular,
    "encodeTabularBlock",
    ()=>encodeTabularBlock,
    "encodeTabularBlockLegacy",
    ()=>encodeTabularBlockLegacy,
    "kindOf",
    ()=>kindOf,
    "parseCsvRow",
    ()=>parseCsvRow,
    "wrapGcf",
    ()=>wrapGcf,
    "wrapTabular",
    ()=>wrapTabular
]);
/**
 * tabular.ts — GCF-powered encoder + backward-compatible omni-tabular decoder.
 *
 * Encoding now uses GCF (Graph Compact Format) generic profile, which handles:
 *   - Homogeneous AND heterogeneous arrays of objects
 *   - Mixed-type columns (nullable, number/string mix)
 *   - Nested objects and arrays (first-class, not JSON-stringified)
 *   - Tabular layout with inline schemas for repeated structures
 *
 * Decoding supports BOTH formats for backward compatibility:
 *   - ```gcf-generic ... ``` (new GCF format)
 *   - ```omni-tabular ... ``` (legacy format, still decoded correctly)
 *
 * The legacy omni-tabular encoder is preserved as encodeTabularBlockLegacy
 * for backward-compat decoding and benchmark comparison.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$generic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/generic.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$decode_generic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/gcf/decode_generic.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/toon.ts [app-route] (ecmascript)");
;
;
const GCF_FENCE_OPEN = "```gcf-generic";
const GCF_FENCE_CLOSE = "```";
const TABULAR_FENCE_OPEN = "```omni-tabular";
const TABULAR_FENCE_CLOSE = "```";
const TABULAR_MARKER_RE = /```(?:gcf-generic|omni-tabular)\n([\s\S]*?)\n```/g;
function kindOf(val) {
    if (val === null) return "null";
    if (typeof val === "number") return "n";
    if (typeof val === "boolean") return "b";
    if (typeof val === "object") return "j";
    return "s";
}
function encodeGcfBlock(arr) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$generic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeGeneric"])(arr);
}
function wrapGcf(blockContent) {
    return `${GCF_FENCE_OPEN}\n${blockContent}\n${GCF_FENCE_CLOSE}`;
}
function encodeTabular(arr) {
    return wrapGcf(encodeGcfBlock(arr));
}
function encodeTabularBlock(arr) {
    return encodeGcfBlock(arr);
}
function wrapTabular(blockContent) {
    return wrapGcf(blockContent);
}
// ─── legacy omni-tabular encoder (preserved for tests/benchmarks) ────────────
function encodeCell(raw) {
    const needsQuoting = raw.includes(",") || raw.includes('"') || raw.includes("\n") || raw.includes("\r") || raw.startsWith(" ") || raw.endsWith(" ");
    if (!needsQuoting) return raw;
    return '"' + raw.replace(/"/g, '""') + '"';
}
function parseCsvRow(line) {
    const cells = [];
    let i = 0;
    const len = line.length;
    while(i < len){
        if (line[i] === '"') {
            let cell = "";
            i++;
            while(i < len){
                if (line[i] === '"') {
                    if (i + 1 < len && line[i + 1] === '"') {
                        cell += '"';
                        i += 2;
                    } else {
                        i++;
                        break;
                    }
                } else {
                    cell += line[i++];
                }
            }
            cells.push(cell);
            if (i < len && line[i] === ",") {
                i++;
                if (i === len) cells.push("");
            }
        } else {
            const start = i;
            while(i < len && line[i] !== ",")i++;
            cells.push(line.slice(start, i));
            if (i < len) {
                i++;
                if (i === len) cells.push("");
            }
        }
    }
    return cells;
}
function encodeTabularBlockLegacy(arr) {
    if (arr.length === 0) return "";
    const keysSet = new Set();
    for (const row of arr){
        for (const k of Object.keys(row))keysSet.add(k);
    }
    const keys = Array.from(keysSet);
    const n = arr.length;
    const kinds = keys.map((k)=>kindOf(arr[0][k]));
    const kindsRow = "__kinds__," + kinds.join(",");
    const headerRow = keys.map(encodeCell).join(",");
    const dataRows = arr.map((row)=>{
        return keys.map((k)=>{
            const val = row[k];
            const kind = kindOf(val);
            if (kind === "null") return "null";
            if (kind === "n") return String(val);
            if (kind === "b") return String(val);
            return encodeCell(JSON.stringify(val));
        }).join(",");
    });
    return `[${n} rows]\n${kindsRow}\n${headerRow}\n${dataRows.join("\n")}`;
}
function decodeTabularBlockLegacy(block) {
    const lines = block.split("\n");
    if (lines.length < 3) return [];
    const countLine = lines[0];
    const countMatch = countLine.match(/^\[(\d+) rows\]$/);
    if (!countMatch) return [];
    const n = parseInt(countMatch[1], 10);
    const kindsLine = lines[1];
    if (!kindsLine.startsWith("__kinds__,")) return [];
    const kindsRaw = parseCsvRow(kindsLine.slice("__kinds__,".length));
    const kinds = kindsRaw;
    const headerLine = lines[2];
    const keys = parseCsvRow(headerLine);
    const result = [];
    for(let i = 0; i < n; i++){
        const rowLine = lines[3 + i];
        if (rowLine === undefined) break;
        const cells = parseCsvRow(rowLine);
        const obj = {};
        for(let j = 0; j < keys.length; j++){
            const key = keys[j];
            const cell = cells[j] ?? "";
            const kind = kinds[j];
            if (kind === "null") {
                obj[key] = null;
            } else if (kind === "n") {
                obj[key] = Number(cell);
            } else if (kind === "b") {
                obj[key] = cell === "true";
            } else {
                try {
                    obj[key] = JSON.parse(cell);
                } catch  {
                    obj[key] = cell;
                }
            }
        }
        result.push(obj);
    }
    return result;
}
function decodeTabular(text) {
    if (text.startsWith(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOON_FENCE_OPEN"] + "\n")) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeToon"])(text);
    // Detect format from fence marker.
    if (text.startsWith(GCF_FENCE_OPEN + "\n") || text.startsWith("GCF ")) {
        // GCF format: strip fence if present, decode via GCF decoder.
        let inner = text;
        const hadFence = inner.startsWith(GCF_FENCE_OPEN + "\n");
        if (hadFence) {
            inner = inner.slice(GCF_FENCE_OPEN.length + 1);
            if (inner.endsWith("\n" + GCF_FENCE_CLOSE)) {
                inner = inner.slice(0, inner.length - GCF_FENCE_CLOSE.length - 1);
            } else if (inner.endsWith(GCF_FENCE_CLOSE)) {
                inner = inner.slice(0, inner.length - GCF_FENCE_CLOSE.length);
            }
        }
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$gcf$2f$decode_generic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeGeneric"])(inner);
        // decodeGeneric returns the decoded value; for arrays, return directly.
        if (Array.isArray(result)) return result;
        // If it decoded to a single object, wrap it.
        return [
            result
        ];
    }
    // Legacy omni-tabular format.
    let inner = text;
    if (inner.startsWith(TABULAR_FENCE_OPEN + "\n")) {
        inner = inner.slice(TABULAR_FENCE_OPEN.length + 1);
    }
    if (inner.endsWith("\n" + TABULAR_FENCE_CLOSE)) {
        inner = inner.slice(0, inner.length - TABULAR_FENCE_CLOSE.length - 1);
    } else if (inner.endsWith(TABULAR_FENCE_CLOSE)) {
        inner = inner.slice(0, inner.length - TABULAR_FENCE_CLOSE.length);
    }
    return decodeTabularBlockLegacy(inner);
}
}),
"[project]/open-sse/services/compression/engines/headroom/smartcrusher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MIN_ROWS",
    ()=>DEFAULT_MIN_ROWS,
    "collectCompactableArrays",
    ()=>collectCompactableArrays,
    "crushMessages",
    ()=>crushMessages,
    "crushText",
    ()=>crushText,
    "detectHomogeneous",
    ()=>detectHomogeneous,
    "pickSmallestEncoding",
    ()=>pickSmallestEncoding,
    "tryCompactJson",
    ()=>tryCompactJson
]);
/**
 * smartcrusher.ts — SmartCrusher: JSON array → GCF compaction (H3 lossless stage).
 *
 * Scans message contents (strings and ```json fenced blocks inside strings) for
 * arrays of objects. When found and when the GCF form is strictly smaller,
 * replaces the JSON array text with a compact GCF block.
 *
 * GCF (Graph Compact Format) handles homogeneous AND heterogeneous arrays,
 * mixed-type columns, nested objects, and nullable fields natively.
 *
 * Conservative guards (inherited from headroom upstream):
 *   - Never touch role: "system" messages.
 *   - Minimum row count gate (default 8).
 *   - Skip if GCF form is NOT smaller than the original JSON (no regression).
 *   - Elements must be objects (not bare primitives or arrays at the top level).
 *
 * Backward compatibility:
 *   - detectHomogeneous is still exported (used by existing tests and may be
 *     useful for analytics), but is no longer a gate for encoding. GCF encodes
 *     both homogeneous and heterogeneous arrays.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/tabular.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/toon.ts [app-route] (ecmascript)");
;
;
const DEFAULT_MIN_ROWS = 8;
/** The fenced block marker we look for to compact json arrays inline. */ const JSON_FENCE_RE = /```json\n([\s\S]*?)\n```/g;
function detectHomogeneous(arr) {
    if (arr.length === 0) return null;
    for (const item of arr){
        if (item === null || typeof item !== "object" || Array.isArray(item)) return null;
    }
    const firstKeys = Object.keys(arr[0]).sort();
    for (const item of arr.slice(1)){
        const itemKeys = Object.keys(item).sort();
        if (itemKeys.length !== firstKeys.length) return null;
        for(let i = 0; i < firstKeys.length; i++){
            if (itemKeys[i] !== firstKeys[i]) return null;
        }
    }
    const first = arr[0];
    for (const key of firstKeys){
        const expected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kindOf"])(first[key]);
        for (const item of arr){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kindOf"])(item[key]) !== expected) return null;
        }
    }
    return firstKeys;
}
/**
 * Check if all elements in an array are objects (not null, not arrays).
 * This is the minimum gate for GCF encoding.
 */ function allObjects(arr) {
    for (const item of arr){
        if (item === null || typeof item !== "object" || Array.isArray(item)) return false;
    }
    return true;
}
function tryCompactJson(jsonStr, minRows = DEFAULT_MIN_ROWS) {
    let parsed;
    try {
        parsed = JSON.parse(jsonStr);
    } catch  {
        return null;
    }
    if (!Array.isArray(parsed) || parsed.length < minRows) return null;
    // All elements must be objects (GCF encodes objects in tabular form).
    if (!allObjects(parsed)) return null;
    const arr = parsed;
    const compact = pickSmallestEncoding(arr);
    // Only use compact form if it is strictly smaller
    if (compact.length >= jsonStr.length) return null;
    return compact;
}
function pickSmallestEncoding(arr) {
    const gcf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapTabular"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeTabularBlock"])(arr));
    const toonInner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeToonBlock"])(arr);
    if (toonInner !== null) {
        const toon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapToon"])(toonInner);
        if (toon.length < gcf.length) return toon;
    }
    return gcf;
}
function collectCompactableArrays(messages, minRows = DEFAULT_MIN_ROWS) {
    const out = [];
    const pushIfCompactable = (jsonStr)=>{
        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch  {
            return;
        }
        if (!Array.isArray(parsed) || parsed.length < minRows) return;
        if (!allObjects(parsed)) return;
        out.push(parsed);
    };
    const scanText = (text)=>{
        const trimmed = text.trimStart();
        if (trimmed.startsWith("[")) pushIfCompactable(text.trim());
        const regex = new RegExp(JSON_FENCE_RE.source, "g");
        let m;
        while((m = regex.exec(text)) !== null)pushIfCompactable(m[1].trim());
    };
    for (const msg of messages){
        if (msg.role === "system" || msg.role === "developer") continue;
        if (typeof msg.content === "string") scanText(msg.content);
        else if (Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (part["type"] === "text" && typeof part["text"] === "string") scanText(part["text"]);
            }
        }
    }
    return out;
}
function crushText(text, minRows = DEFAULT_MIN_ROWS) {
    // 1. Try the whole string as a JSON array first
    const trimmed = text.trimStart();
    if (trimmed.startsWith("[")) {
        const compacted = tryCompactJson(text.trim(), minRows);
        if (compacted !== null) return compacted;
    }
    // 2. Try to compact ```json fenced blocks inside the text
    let result = text;
    let offset = 0;
    const regex = new RegExp(JSON_FENCE_RE.source, "g");
    let match;
    while((match = regex.exec(text)) !== null){
        const fullMatch = match[0]; // ```json\n...\n```
        const innerJson = match[1];
        const compacted = tryCompactJson(innerJson.trim(), minRows);
        if (compacted !== null) {
            const start = match.index + offset;
            const end = start + fullMatch.length;
            result = result.slice(0, start) + compacted + result.slice(end);
            offset += compacted.length - fullMatch.length;
        }
    }
    return result;
}
function crushMessages(messages, minRows = DEFAULT_MIN_ROWS) {
    let changed = false;
    const result = messages.map((msg)=>{
        // Guard: never touch system messages. "developer" is the Responses-API equivalent of
        // "system" used by newer models (e.g. Codex CLI, see open-sse/executors/codex.ts) and
        // carries the same kind of instructions/tool-schema content — compacting a JSON array
        // embedded there (e.g. an update_plan example) can corrupt the model's tool-calling
        // instructions (9router#2132: broke Codex CLI plan mode).
        if (msg.role === "system" || msg.role === "developer") return {
            ...msg
        };
        if (typeof msg.content === "string") {
            const crushed = crushText(msg.content, minRows);
            if (crushed !== msg.content) {
                changed = true;
                return {
                    ...msg,
                    content: crushed
                };
            }
            return {
                ...msg
            };
        }
        if (Array.isArray(msg.content)) {
            let contentChanged = false;
            const newContent = msg.content.map((part)=>{
                if (part["type"] !== "text" || typeof part["text"] !== "string") return part;
                const crushed = crushText(part["text"], minRows);
                if (crushed !== part["text"]) {
                    contentChanged = true;
                    return {
                        ...part,
                        text: crushed
                    };
                }
                return part;
            });
            if (contentChanged) {
                changed = true;
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
        changed
    };
}
}),
"[project]/open-sse/services/compression/engines/headroom/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "headroomEngine",
    ()=>headroomEngine,
    "reconstructHeadroom",
    ()=>reconstructHeadroom
]);
/**
 * headroom compression engine — SmartCrusher: tabular compaction of homogeneous JSON arrays.
 *
 * Implements item H3 (SmartCrusher lossless compaction) + N5 (explicit [N rows] count marker)
 * + GP5' (columnar/tabular encoder, dependency-free) from the compression research plan:
 *   _tasks/research/compression/headroom-plano-implementacao.md
 *   _tasks/research/compression/rodada4-internet-e-coerencia.md
 *   _tasks/research/compression/gcf-proxy-relatorio-plano.md
 *
 * Algorithm:
 *   - Scans non-system message contents (string contents and ```json fenced blocks).
 *   - When content parses as a homogeneous array of objects (≥ minRows, default 8),
 *     replaces it with a compact columnar block (```omni-tabular ...```).
 *   - The columnar block carries: [N rows] count marker, type hints, a header row,
 *     and value-only data rows.
 *   - LOSSLESS: decode(encode(arr)) deep-equals the original (proven by round-trip tests).
 *   - Conservative: only replaces when the compact form is strictly smaller.
 *   - Never touches system messages.
 *
 * Encoder format: see tabular.ts (CSV-style with RFC 4180 quoting for special chars,
 * JSON-stringified nested values quoted as string cells, type-hint metadata row).
 *
 * Note: TOON (@toon-format/toon, ~24.6k★) could be a future drop-in encoder here for
 * improved compression on complex shapes. Plain columnar is used now (dep-free, zero
 * supply-chain risk, ≥30% savings on typical homogeneous arrays already met).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$smartcrusher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/smartcrusher.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/tabular.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/toon.ts [app-route] (ecmascript)");
;
;
;
;
;
// ─── constants ────────────────────────────────────────────────────────────────
const ENGINE_ID = "headroom";
// ─── schema & validation ──────────────────────────────────────────────────────
const HEADROOM_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: true
    },
    {
        key: "minRows",
        type: "number",
        label: "Minimum rows to compact",
        description: "Minimum number of rows in a homogeneous JSON array to trigger tabular compaction. Default: 8.",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$smartcrusher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_MIN_ROWS"],
        min: 2,
        max: 10000
    }
];
function validateHeadroomConfig(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    if (config["minRows"] !== undefined) {
        const v = config["minRows"];
        if (typeof v !== "number" || !Number.isFinite(v) || v < 2) {
            errors.push("minRows must be a number ≥ 2");
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
const headroomEngine = {
    id: ENGINE_ID,
    name: "Headroom SmartCrusher",
    description: "Lossless tabular compaction of homogeneous JSON arrays (H3 + N5 + GP5'). " + "Replaces repetitive JSON arrays with compact columnar blocks, " + "including explicit [N rows] count markers for auditability.",
    icon: "compress",
    targets: [
        "messages",
        "tool_results"
    ],
    stackable: true,
    // stackPriority 15 = between rtk (10) and caveman (20), as specified in headroom-plano.
    stackPriority: 15,
    metadata: {
        id: ENGINE_ID,
        name: "Headroom SmartCrusher",
        description: "Lossless tabular compaction of homogeneous JSON arrays with [N rows] count markers.",
        inputScope: "messages",
        targetLatencyMs: 5,
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
        const minRows = typeof stepConfig["minRows"] === "number" ? stepConfig["minRows"] : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$smartcrusher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_MIN_ROWS"];
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const start = performance.now();
        const { messages: crushedMessages, changed } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$smartcrusher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["crushMessages"])(messages, minRows);
        if (!changed) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const newBody = {
            ...body,
            messages: crushedMessages
        };
        const durationMs = Math.round(performance.now() - start);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
            "headroom-smartcrusher"
        ], [
            "tabular-compaction"
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
        return HEADROOM_SCHEMA;
    },
    validateConfig (config) {
        return validateHeadroomConfig(config);
    }
};
function reconstructHeadroom(body) {
    const messages = body["messages"];
    if (!Array.isArray(messages)) return body;
    let changed = false;
    const restored = messages.map((msg)=>{
        if (typeof msg.content === "string") {
            const reconstructed = restoreText(msg.content);
            if (reconstructed !== msg.content) {
                changed = true;
                return {
                    ...msg,
                    content: reconstructed
                };
            }
            return {
                ...msg
            };
        }
        if (Array.isArray(msg.content)) {
            let contentChanged = false;
            const newContent = msg.content.map((part)=>{
                if (part["type"] !== "text" || typeof part["text"] !== "string") return part;
                const reconstructed = restoreText(part["text"]);
                if (reconstructed !== part["text"]) {
                    contentChanged = true;
                    return {
                        ...part,
                        text: reconstructed
                    };
                }
                return part;
            });
            if (contentChanged) {
                changed = true;
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
    if (!changed) return body;
    return {
        ...body,
        messages: restored
    };
}
/**
 * Restore all GCF (```gcf-generic) and legacy (```omni-tabular) blocks
 * in a text string back to their original JSON.
 */ /** Map a fence-open marker to its matching close tag. */ function closeTagFor(fence) {
    if (fence === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GCF_FENCE_OPEN"]) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GCF_FENCE_CLOSE"];
    if (fence === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOON_FENCE_OPEN"]) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOON_FENCE_CLOSE"];
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TABULAR_FENCE_CLOSE"];
}
/**
 * Decode every occurrence of one fence type in `text`, replacing each block
 * with its original JSON. Extracted from restoreText to keep that function
 * below the cognitive-complexity gate.
 */ function decodeFenceOccurrences(text, fence, closeTag) {
    let result = text;
    let searchFrom = 0;
    while(true){
        const fenceStart = result.indexOf(fence, searchFrom);
        if (fenceStart === -1) break;
        const contentStart = fenceStart + fence.length + 1; // skip "\n" after fence open
        const fenceEnd = result.indexOf("\n" + closeTag, contentStart);
        if (fenceEnd === -1) break;
        const blockContent = result.slice(contentStart, fenceEnd);
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeTabular"])(fence + "\n" + blockContent + "\n" + closeTag);
        const jsonStr = JSON.stringify(decoded);
        const fullFence = result.slice(fenceStart, fenceEnd + closeTag.length + 1); // +1 for the "\n"
        result = result.slice(0, fenceStart) + jsonStr + result.slice(fenceStart + fullFence.length);
        searchFrom = fenceStart + jsonStr.length;
    }
    return result;
}
function restoreText(text) {
    // Fast path: no fence marker present
    if (!text.includes(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TABULAR_FENCE_OPEN"]) && !text.includes(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GCF_FENCE_OPEN"]) && !text.includes(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOON_FENCE_OPEN"])) return text;
    let result = text;
    // Process all fence types: GCF first (new format), then legacy omni-tabular, then TOON
    for (const fence of [
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GCF_FENCE_OPEN"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TABULAR_FENCE_OPEN"],
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOON_FENCE_OPEN"]
    ]){
        result = decodeFenceOccurrences(result, fence, closeTagFor(fence));
    }
    return result;
}
}),
"[project]/open-sse/services/compression/engines/llmlingua/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "llmlinguaEngine",
    ()=>llmlinguaEngine,
    "setLlmlinguaBackend",
    ()=>setLlmlinguaBackend
]);
/**
 * LLMLingua async compression engine (L1/L3 — F2.1).
 *
 * Implements the `CompressionEngine` contract with an async path (`applyAsync`)
 * that compresses prose via a pluggable backend.
 *
 * ## Design
 *
 * ### Backend abstraction
 * `LlmlinguaBackend` is a `(text: string, opts?: LlmlinguaBackendOptions) =>
 * Promise<string>` contract (the opts carry model selection / compression rate /
 * offline model-path override; single-arg fakes remain assignable).
 * Tests inject a fake backend via `setLlmlinguaBackend()`. Production code uses
 * `workerBackend` from `./worker.ts` — the real MobileBERT ONNX worker-thread backend
 * (strictly fail-open: missing optional deps or any error return the original text).
 *
 * ### Code-block protection (inviolable)
 * Before any prose segment reaches the backend, `extractPreservedBlocks` from
 * `preservation.ts` is used to tombstone fenced code blocks (and other
 * preserved constructs) into placeholder strings. The prose between placeholders
 * is what gets sent to the backend. Code blocks are re-stitched verbatim into
 * the output. This is done REGARDLESS of what the backend does — the engine
 * physically never passes code to the model.
 *
 * ### Fail-open points (all errors → original body)
 * 1. Backend rejects for a prose segment → catch → segment kept as-is.
 * 2. Any unexpected error in `applyAsync` → outer try/catch → original body,
 *    compressed:false, stats:null returned (no throw).
 *
 * ### Sync `apply` (pass-through)
 * The sync path is always a no-op (`compressed:false`, original body). The real
 * work is async-only; `applyStackedCompressionAsync` calls `applyAsync` when
 * present and falls back to `apply` otherwise.
 *
 * ### stackPriority
 * 35 — runs after structural engines (CCR=4, session-dedup=3, headroom=15,
 * caveman=20) but before ultra (40). Semantic pruning is most effective after
 * simpler structural compression has already reduced noise.
 *
 * ### Real backend
 * `./worker.ts` runs `@atjsh/llmlingua-2` (MobileBERT ONNX) in a worker_threads.Worker,
 * gated by a minimum token count and strictly fail-open. The optional deps are not
 * installed by default (CI / most installs), so the engine no-ops there; the real model
 * is exercised on the VPS behind RUN_LLMLINGUA_INT (Hard Rule #18). See `./worker.ts`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$worker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/worker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/constants.ts [app-route] (ecmascript)");
;
;
;
;
/** Module-level injectable backend (null = use default production backend). */ let _backend = null;
function setLlmlinguaBackend(b) {
    _backend = b;
}
/** Resolve the active backend: injected fake (for tests) or production stub. */ function resolveBackend() {
    return _backend ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$worker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workerBackend"];
}
/**
 * Split `text` into alternating prose / preserved segments using
 * `extractPreservedBlocks` from preservation.ts.
 *
 * Preserved blocks (fenced code, inline code, math, headings, URLs, etc.)
 * are returned verbatim and are NEVER sent to the backend. Only the prose
 * segments between preserved blocks are eligible for compression.
 *
 * Implementation: `extractPreservedBlocks` returns a text with NUL-delimited
 * placeholder strings in place of preserved blocks, plus a `blocks` array
 * mapping placeholder → original content. We split on those placeholders to
 * interleave prose and preserved segments.
 */ function splitProseAndPreserved(text) {
    const { text: withPlaceholders, blocks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(text);
    if (blocks.length === 0) {
        return [
            {
                kind: "prose",
                text
            }
        ];
    }
    const segments = [];
    const placeholderToOriginal = new Map(blocks.map((b)=>[
            b.placeholder,
            b.content
        ]));
    // Build a pattern matching any placeholder. Placeholders contain NUL
    // characters so they are guaranteed not to appear in user text.
    const escapedPhs = blocks.map((b)=>b.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const splitRe = new RegExp(`(${escapedPhs.join("|")})`, "g");
    const parts = withPlaceholders.split(splitRe);
    for (const part of parts){
        if (!part) continue;
        const original = placeholderToOriginal.get(part);
        if (original !== undefined) {
            segments.push({
                kind: "preserved",
                text: original
            });
        } else {
            segments.push({
                kind: "prose",
                text: part
            });
        }
    }
    return segments;
}
/**
 * Compress a single prose string via the backend.
 * On any error, fail-open and return the original text.
 */ async function compressProseText(text, backend, opts) {
    if (!text.trim()) return {
        text,
        didCompress: false
    };
    try {
        const compressed = await backend(text, opts);
        // Accept only if it actually gets shorter (reject no-ops or expansions)
        if (typeof compressed === "string" && compressed.length < text.length) {
            return {
                text: compressed,
                didCompress: true
            };
        }
        return {
            text,
            didCompress: false
        };
    } catch  {
        // Fail-open: backend error → original segment
        return {
            text,
            didCompress: false
        };
    }
}
/**
 * Process a single message text string:
 *   1. Split into prose / preserved segments.
 *   2. Compress each prose segment via the backend (fail-open per segment).
 *   3. Re-stitch with preserved segments verbatim.
 * Returns the new text and whether any compression happened.
 */ async function compressMessageText(text, backend, opts) {
    const segments = splitProseAndPreserved(text);
    let anyCompressed = false;
    const parts = [];
    for (const seg of segments){
        if (seg.kind === "preserved") {
            // Never send preserved content (code, math, etc.) to the backend
            parts.push(seg.text);
        } else {
            const { text: out, didCompress } = await compressProseText(seg.text, backend, opts);
            parts.push(out);
            if (didCompress) anyCompressed = true;
        }
    }
    return {
        text: parts.join(""),
        didCompress: anyCompressed
    };
}
/**
 * Process all non-system messages, compressing prose in each text content part.
 * Fail-opens per message: any unexpected error → that message kept as-is.
 */ async function processMessages(messages, backend, opts) {
    let compressedCount = 0;
    const result = [];
    for (const msg of messages){
        // Never touch system messages
        if (msg.role === "system") {
            result.push({
                ...msg
            });
            continue;
        }
        try {
            if (typeof msg.content === "string") {
                const { text, didCompress } = await compressMessageText(msg.content, backend, opts);
                if (didCompress) {
                    compressedCount++;
                    result.push({
                        ...msg,
                        content: text
                    });
                } else {
                    result.push({
                        ...msg
                    });
                }
            } else if (Array.isArray(msg.content)) {
                let changed = false;
                const newContent = [];
                for (const part of msg.content){
                    if (part["type"] === "text" && typeof part["text"] === "string") {
                        const { text, didCompress } = await compressMessageText(part["text"], backend, opts);
                        if (didCompress) {
                            changed = true;
                            compressedCount++;
                            newContent.push({
                                ...part,
                                text
                            });
                        } else {
                            newContent.push(part);
                        }
                    } else {
                        newContent.push(part);
                    }
                }
                result.push(changed ? {
                    ...msg,
                    content: newContent
                } : {
                    ...msg
                });
            } else {
                result.push({
                    ...msg
                });
            }
        } catch  {
            // Fail-open per message: keep original
            result.push({
                ...msg
            });
        }
    }
    return {
        messages: result,
        compressedCount
    };
}
// ─── config schema ────────────────────────────────────────────────────────────
const LLMLINGUA_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: true
    },
    {
        key: "model",
        type: "select",
        label: "Model",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_LLMLINGUA_MODEL"],
        options: Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_MODELS"]).map((m)=>({
                value: m.id,
                label: m.label
            }))
    },
    {
        key: "minTokens",
        type: "number",
        label: "Min tokens (floor)",
        defaultValue: 2000,
        min: 0,
        max: 100000
    },
    {
        key: "compressionRate",
        type: "number",
        label: "Compression rate (keep ratio)",
        defaultValue: 0.5,
        min: 0.1,
        max: 0.9
    },
    {
        key: "modelPath",
        type: "string",
        label: "Model path (offline override)",
        defaultValue: ""
    }
];
function validateLlmlinguaConfig(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    if (config["model"] !== undefined) {
        const model = config["model"];
        if (typeof model !== "string" || !(model in __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_MODELS"])) {
            errors.push("model must be one of: " + Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LLMLINGUA_MODELS"]).join(", "));
        }
    }
    if (config["minTokens"] !== undefined) {
        const minTokens = config["minTokens"];
        if (typeof minTokens !== "number" || Number.isNaN(minTokens) || minTokens < 0) {
            errors.push("minTokens must be a number >= 0");
        }
    }
    if (config["compressionRate"] !== undefined) {
        const rate = config["compressionRate"];
        if (typeof rate !== "number" || Number.isNaN(rate) || rate < 0.1 || rate > 0.9) {
            errors.push("compressionRate must be a number between 0.1 and 0.9");
        }
    }
    if (config["modelPath"] !== undefined && typeof config["modelPath"] !== "string") {
        errors.push("modelPath must be a string");
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// ─── engine export ─────────────────────────────────────────────────────────────
const ENGINE_ID = "llmlingua";
const llmlinguaEngine = {
    id: ENGINE_ID,
    name: "LLMLingua-2 (Semantic Pruning)",
    description: "Async semantic token pruning via LLMLingua-2 (ONNX/worker-thread backend). " + "Compresses prose in non-system messages; fenced code blocks and other preserved " + "constructs are never altered. Fail-opens on any backend error. Production backend: " + "@atjsh/llmlingua-2 (TinyBERT 57 MB default, BERT-base optional) in a worker thread; " + "model lazy-downloaded to DATA_DIR. Optional deps — fail-opens if not installed.",
    icon: "brain",
    targets: [
        "messages"
    ],
    stackable: true,
    // stackPriority 35: runs after structural engines (CCR=4, session-dedup=3,
    // headroom=15, caveman=20) but before ultra (40). Semantic pruning is more
    // effective on already-structurally-compressed text.
    stackPriority: 35,
    metadata: {
        id: ENGINE_ID,
        name: "LLMLingua-2 (Semantic Pruning)",
        description: "ONNX-based semantic token classification. Compresses prose only; " + "code blocks and preserved constructs are protected. Fail-open on " + "model/worker error.",
        inputScope: "messages",
        targetLatencyMs: 200,
        supportsPreview: false,
        // Stable. The worker model itself was VPS-validated (real prose 209→107 ch, ok=true),
        // but the EARLIER "walk-up + optional-deps gate confirmed in the bundle" claim was
        // wrong: the Next standalone bundle (webpack) froze `import.meta.url` to the build path
        // and stubbed `createRequire`, so in production the gate was always false and the worker
        // never spawned (it silently fell back to the aggressive summarizer). Fixed in B-SLM —
        // worker.ts now resolves deps + worker file from runtime anchors (cwd / argv[1]). The
        // optional deps must also be co-located into dist/node_modules (#4286) to actually run.
        stable: true
    },
    /**
   * Synchronous pass-through.
   *
   * The real compression is async-only (worker-thread model). The sync path
   * exists only so this engine is safe in sync stacked pipelines — it does
   * nothing and returns the body unchanged. `applyStackedCompressionAsync`
   * will call `applyAsync` instead.
   */ apply (body) {
        return {
            body,
            compressed: false,
            stats: null
        };
    },
    /**
   * Async compression path.
   *
   * For each non-system message, splits text into prose/preserved segments,
   * sends only prose to the backend, and re-stitches with preserved segments
   * (fenced code, inline code, math, etc.) untouched.
   *
   * Fail-open contract:
   *   - Backend rejection/error per prose segment → segment kept as-is.
   *   - Any unexpected outer error → original body returned, no throw.
   */ async applyAsync (body, options) {
        const stepConfig = options?.stepConfig ?? {};
        if (stepConfig["enabled"] === false) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        // minTokens floor: skip the model entirely on small prompts (avoid paying
        // model latency when there is little to gain). 0 disables the floor.
        const minTokens = typeof stepConfig["minTokens"] === "number" ? stepConfig["minTokens"] : 2000;
        if (minTokens > 0) {
            const nonSystemText = messages.filter((m)=>m.role !== "system").map((m)=>typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "")).join("\n");
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(nonSystemText) < minTokens) {
                // Below the floor — skip compression for this small prompt.
                return {
                    body,
                    compressed: false,
                    stats: null
                };
            }
        }
        // Backend options threaded from stepConfig (model selection / rate / offline override).
        const backendOpts = {
            model: typeof stepConfig["model"] === "string" ? stepConfig["model"] : undefined,
            compressionRate: typeof stepConfig["compressionRate"] === "number" ? stepConfig["compressionRate"] : undefined,
            modelPath: typeof stepConfig["modelPath"] === "string" && stepConfig["modelPath"] ? stepConfig["modelPath"] : undefined
        };
        try {
            const backend = resolveBackend();
            const start = performance.now();
            const { messages: newMessages, compressedCount } = await processMessages(messages, backend, backendOpts);
            if (compressedCount === 0) {
                return {
                    body,
                    compressed: false,
                    stats: null
                };
            }
            const newBody = {
                ...body,
                messages: newMessages
            };
            const durationMs = Math.round(performance.now() - start);
            const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
                ENGINE_ID
            ], [
                `llmlingua-compressed-${compressedCount}-messages`
            ], durationMs);
            return {
                body: newBody,
                compressed: true,
                stats
            };
        } catch  {
            // Outer fail-open: any unexpected error → return original body unchanged
            return {
                body,
                compressed: false,
                stats: null
            };
        }
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config ?? {}
        });
    },
    getConfigSchema () {
        return LLMLINGUA_SCHEMA;
    },
    validateConfig (config) {
        return validateLlmlinguaConfig(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/ionizer/sample.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_IONIZER_ROWS",
    ()=>MAX_IONIZER_ROWS,
    "applyIonizerPass",
    ()=>applyIonizerPass,
    "fnv1a",
    ()=>fnv1a,
    "ionize",
    ()=>ionize,
    "isErrorRow",
    ()=>isErrorRow,
    "runIonizerPass",
    ()=>runIonizerPass,
    "schemaUnion",
    ()=>schemaUnion,
    "seededSample",
    ()=>seededSample
]);
// open-sse/services/compression/engines/ionizer/sample.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ccr/index.ts [app-route] (ecmascript)");
;
const MAX_IONIZER_ROWS = 100000;
function fnv1a(s) {
    let h = 0x811c9dc5;
    for(let i = 0; i < s.length; i++){
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
/** mulberry32 PRNG — deterministic, seeded (no Math.random). */ function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
        a |= 0;
        a = a + 0x6d2b79f5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function schemaUnion(rows) {
    const seen = new Set();
    const out = [];
    for (const row of rows){
        for (const key of Object.keys(row)){
            if (!seen.has(key)) {
                seen.add(key);
                out.push(key);
            }
        }
    }
    return out;
}
function isErrorRow(row) {
    for (const key of Object.keys(row)){
        if (/error|fail|exception|stderr|denied/i.test(key) && row[key]) return true;
    }
    for (const k of [
        "status",
        "statusCode",
        "code"
    ]){
        const v = row[k];
        if (typeof v === "number" && v >= 400 && v <= 599) return true;
    }
    return false;
}
function seededSample(pool, k, seed) {
    if (k >= pool.length) return pool.slice();
    const idx = pool.map((_, i)=>i);
    const rand = mulberry32(seed);
    for(let i = 0; i < k; i++){
        const j = i + Math.floor(rand() * (idx.length - i));
        const tmp = idx[i];
        idx[i] = idx[j];
        idx[j] = tmp;
    }
    return idx.slice(0, k).sort((a, b)=>a - b).map((i)=>pool[i]);
}
function ionize(rows, opts) {
    const n = rows.length;
    if (n <= opts.targetRows) return {
        kept: rows,
        keptCount: n,
        totalCount: n
    };
    const keep = new Set();
    const seenKeys = new Set();
    for(let i = 0; i < n; i++){
        let novel = false;
        for (const key of Object.keys(rows[i])){
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                novel = true;
            }
        }
        if (novel) keep.add(i);
    }
    for(let i = 0; i < n; i++)if (isErrorRow(rows[i])) keep.add(i);
    for(let i = 0; i < Math.min(opts.firstK, n); i++)keep.add(i);
    for(let i = Math.max(0, n - opts.lastK); i < n; i++)keep.add(i);
    if (keep.size < opts.targetRows) {
        const middle = [];
        for(let i = 0; i < n; i++)if (!keep.has(i)) middle.push(i);
        const need = opts.targetRows - keep.size;
        for (const idx of seededSample(middle, need, opts.seed))keep.add(idx);
    }
    const keptIdx = [
        ...keep
    ].sort((a, b)=>a - b);
    return {
        kept: keptIdx.map((i)=>rows[i]),
        keptCount: keptIdx.length,
        totalCount: n
    };
}
function isPlainObjectArray(v) {
    return Array.isArray(v) && v.every((el)=>el !== null && typeof el === "object" && !Array.isArray(el));
}
function applyIonizerPass(messages, opts) {
    try {
        let ionizedCount = 0;
        const out = messages.map((m)=>{
            if (m.role === "system" || typeof m.content !== "string") return m;
            const serialized = m.content;
            let parsed;
            try {
                parsed = JSON.parse(serialized);
            } catch  {
                return m;
            }
            if (!Array.isArray(parsed) || parsed.length <= opts.threshold) return m;
            if (parsed.length > MAX_IONIZER_ROWS) return m;
            if (!isPlainObjectArray(parsed)) return m;
            const res = ionize(parsed, {
                targetRows: opts.targetRows,
                firstK: 3,
                lastK: 3,
                seed: fnv1a(serialized)
            });
            if (res.keptCount >= res.totalCount) return m;
            const stored = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryStoreBlock"])(serialized, opts.principalId, {
                contentType: "application/json",
                source: "ionizer"
            });
            if (!stored.stored) return m;
            const marker = `[ionizer: kept ${res.keptCount}/${res.totalCount} rows; full → CCR retrieve hash=${stored.hash} chars=${serialized.length}]`;
            const newContent = `${JSON.stringify(res.kept)}\n${marker}`;
            if (newContent.length >= serialized.length) return m;
            ionizedCount++;
            return {
                ...m,
                content: newContent
            };
        });
        return ionizedCount > 0 ? {
            messages: out,
            ionizedCount
        } : {
            messages,
            ionizedCount: 0
        };
    } catch  {
        return {
            messages,
            ionizedCount: 0
        };
    }
}
function runIonizerPass(messages, stepConfig, principalId) {
    if (stepConfig["enabled"] === false) return {
        messages,
        ionizedCount: 0
    };
    const threshold = typeof stepConfig["threshold"] === "number" ? stepConfig["threshold"] : 200;
    const targetRows = typeof stepConfig["targetRows"] === "number" ? stepConfig["targetRows"] : 50;
    return applyIonizerPass(messages, {
        threshold,
        targetRows,
        principalId
    });
}
}),
"[project]/open-sse/services/compression/engines/ionizer/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ionizerEngine",
    ()=>ionizerEngine
]);
// open-sse/services/compression/engines/ionizer/index.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ionizer$2f$sample$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ionizer/sample.ts [app-route] (ecmascript)");
;
;
const ENGINE_ID = "ionizer";
const IONIZER_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: true
    },
    {
        key: "threshold",
        type: "number",
        label: "Row threshold",
        description: "Only arrays with more than this many object rows are sampled. Default: 200.",
        defaultValue: 200,
        min: 2,
        max: 1000000
    },
    {
        key: "targetRows",
        type: "number",
        label: "Target kept rows",
        description: "Approximate number of rows kept inline after sampling. Default: 50.",
        defaultValue: 50,
        min: 1,
        max: 100000
    }
];
function validateIonizerConfig(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    for (const k of [
        "threshold",
        "targetRows"
    ]){
        if (config[k] !== undefined) {
            const v = config[k];
            if (typeof v !== "number" || !Number.isFinite(v) || v < 1) {
                errors.push(`${k} must be a positive number`);
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
const ionizerEngine = {
    id: ENGINE_ID,
    name: "Ionizer",
    description: "Lossy statistical sampling of oversized homogeneous JSON arrays. Keeps schema + error rows " + "+ first/last rows + a seeded uniform middle sample inline; stores the whole array in CCR " + "for recovery. Complements headroom (lossless) as the fallback when columnar still overflows.",
    icon: "filter_alt",
    targets: [
        "messages"
    ],
    stackable: true,
    // stackPriority 13 = between rtk (10) and headroom (15): sample raw rows BEFORE headroom
    // losslessly compacts the survivors.
    stackPriority: 13,
    sampling: true,
    metadata: {
        id: ENGINE_ID,
        name: "Ionizer",
        description: "Lossy statistical sampling of oversized homogeneous JSON arrays, reversible via CCR.",
        inputScope: "messages",
        targetLatencyMs: 2,
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
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const start = performance.now();
        const { messages: finalMessages, ionizedCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ionizer$2f$sample$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runIonizerPass"])(messages, stepConfig, options?.principalId);
        if (ionizedCount === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const newBody = {
            ...body,
            messages: finalMessages
        };
        const durationMs = Math.round(performance.now() - start);
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
            "ionizer"
        ], [
            `ionizer-${ionizedCount}-arrays-sampled`
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
        return IONIZER_SCHEMA;
    },
    validateConfig (config) {
        return validateIonizerConfig(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/relevance/configSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RELEVANCE_SCHEMA",
    ()=>RELEVANCE_SCHEMA,
    "resolveRelevanceConfig",
    ()=>resolveRelevanceConfig,
    "validateRelevanceConfig",
    ()=>validateRelevanceConfig
]);
const RELEVANCE_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: false
    },
    {
        key: "overlapThreshold",
        type: "number",
        label: "Overlap threshold",
        description: "Sentences with Jaccard overlap below this are candidates for removal.",
        defaultValue: 0.1,
        min: 0,
        max: 1
    },
    {
        key: "budgetPercent",
        type: "number",
        label: "Budget percent",
        description: "Target fraction of original character count to retain (0–1).",
        defaultValue: 0.5,
        min: 0.1,
        max: 1
    },
    {
        key: "boilerplateWeight",
        type: "number",
        label: "Boilerplate weight",
        description: "Weight applied to boilerplate penalty when scoring sentences.",
        defaultValue: 0.5,
        min: 0,
        max: 1
    }
];
function validateRelevanceConfig(config) {
    const errors = [];
    if (config.enabled !== undefined && typeof config.enabled !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    for (const key of [
        "overlapThreshold",
        "budgetPercent",
        "boilerplateWeight"
    ]){
        if (config[key] !== undefined) {
            const v = config[key];
            if (typeof v !== "number" || v < 0 || v > 1) {
                errors.push(`${key} must be a number between 0 and 1`);
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function resolveRelevanceConfig(stepConfig) {
    return {
        enabled: typeof stepConfig.enabled === "boolean" ? stepConfig.enabled : false,
        overlapThreshold: typeof stepConfig.overlapThreshold === "number" ? stepConfig.overlapThreshold : 0.1,
        budgetPercent: typeof stepConfig.budgetPercent === "number" ? stepConfig.budgetPercent : 0.5,
        boilerplateWeight: typeof stepConfig.boilerplateWeight === "number" ? stepConfig.boilerplateWeight : 0.5
    };
}
}),
"[project]/open-sse/services/compression/engines/relevance/scorer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scoreSentences",
    ()=>scoreSentences
]);
const BOILERPLATE_TOKENS = new Set([
    "please",
    "note",
    "important",
    "indeed",
    "certainly",
    "basically",
    "essentially",
    "obviously",
    "clearly",
    "simply",
    "just",
    "really",
    "actually",
    "honestly",
    "conclusion",
    "summary",
    "hope",
    "understand",
    "thing",
    "things",
    "something"
]);
function tokenize(text) {
    const lower = text.toLowerCase();
    const tokens = [];
    let start = -1;
    for(let i = 0; i <= lower.length; i++){
        const ch = i < lower.length ? lower.charCodeAt(i) : -1;
        const isAlnum = ch !== -1 && (ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57);
        if (isAlnum) {
            if (start === -1) start = i;
        } else {
            if (start !== -1) {
                tokens.push(lower.slice(start, i));
                start = -1;
            }
        }
    }
    return tokens;
}
function jaccard(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const t of setA){
        if (setB.has(t)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}
function boilerplateScore(tokens) {
    if (tokens.length === 0) return 0;
    let count = 0;
    for (const t of tokens){
        if (BOILERPLATE_TOKENS.has(t)) count++;
    }
    return count / tokens.length;
}
function scoreSentences(sentences, query, cfg) {
    if (sentences.length === 0) return [];
    if (!query || query.trim().length === 0) return sentences.map(()=>0);
    const queryTokens = new Set(tokenize(query));
    return sentences.map((sentence)=>{
        const sentTokens = tokenize(sentence);
        if (sentTokens.length === 0) return 0;
        const sentSet = new Set(sentTokens);
        const overlap = jaccard(sentSet, queryTokens);
        const boilerplate = boilerplateScore(sentTokens) * cfg.boilerplateWeight;
        return Math.max(0, overlap - boilerplate);
    });
}
}),
"[project]/open-sse/services/compression/engines/relevance/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "relevanceEngine",
    ()=>relevanceEngine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/relevance/configSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$scorer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/relevance/scorer.ts [app-route] (ecmascript)");
;
;
;
// Sentence-level "never drop" guard. We canNOT reuse ultraHeuristic's FORCE_PRESERVE_RE
// here: that token-level pattern includes `[._/\\]`, which matches the period ending EVERY
// prose sentence — gating on it would force-preserve everything and make the engine a
// permanent no-op (the same trap #17's UNIT_PRESERVE_RE avoids). Anchor on real signals:
// digits, URLs, error prefixes, code fences, stack `at`-frames, multi-segment paths, key=value.
const SENTENCE_PRESERVE_RE = /\d|https?:\/\/|(?:Error|Exception|TypeError|RangeError|SyntaxError|ReferenceError|Traceback):|```|^\s*at\s|\/[\w.-]+\/|\w+=\S/i;
// Split AFTER the sentence-final punctuation + its trailing whitespace, keeping that
// whitespace attached to the preceding sentence so a rejoin with "" preserves the
// original paragraph/line structure (e.g. `\n\n` between sentences survives).
const SENTENCE_SPLIT_RE = /(?<=[.!?]\s)/;
function extractText(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.map((block)=>{
            if (block && typeof block === "object" && "text" in block) {
                return String(block.text);
            }
            return "";
        }).join(" ");
    }
    return "";
}
function splitSentences(text) {
    return text.split(SENTENCE_SPLIT_RE).filter((s)=>s.trim().length > 0);
}
function applyRelevanceToText(text, query, cfg) {
    const sentences = splitSentences(text);
    if (sentences.length <= 1) return {
        result: text,
        changed: false
    };
    const scores = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$scorer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreSentences"])(sentences, query, cfg);
    const totalChars = text.length;
    const budget = Math.floor(totalChars * cfg.budgetPercent);
    const indexed = sentences.map((s, i)=>({
            s,
            i,
            score: scores[i]
        }));
    const sorted = [
        ...indexed
    ].sort((a, b)=>b.score - a.score);
    const keepSet = new Set();
    // 1) Force-preserved sentences (errors / code / numbers / URLs) are kept unconditionally
    //    and are "free" — they do NOT consume the budget, so they cannot starve the
    //    highest-relevance content (core-review issue: force-preserve starvation).
    for (const { s, i } of indexed){
        if (SENTENCE_PRESERVE_RE.test(s)) keepSet.add(i);
    }
    // 2) Greedily admit non-force sentences by score desc, gated by overlapThreshold, until
    //    the budget fills. The array is sorted desc, so once below budget we can break.
    //    (Previously the threshold was dead code behind `|| kept < budget`.)
    let kept = 0;
    for (const { s, i, score } of sorted){
        if (keepSet.has(i)) continue;
        if (kept >= budget) break;
        if (score >= cfg.overlapThreshold) {
            keepSet.add(i);
            kept += s.length + 1;
        }
    }
    // 3) Never drop everything: keep at least the single highest-scoring sentence.
    if (keepSet.size === 0 && sorted.length > 0) keepSet.add(sorted[0].i);
    if (keepSet.size === sentences.length) return {
        result: text,
        changed: false
    };
    const ordered = indexed.filter(({ i })=>keepSet.has(i)).sort((a, b)=>a.i - b.i);
    const result = ordered.map(({ s })=>s).join("");
    return {
        result,
        changed: result !== text
    };
}
const relevanceEngine = {
    id: "relevance",
    name: "Relevance",
    description: "Extractive sentence scoring against the last user query.",
    icon: "target",
    targets: [
        "messages"
    ],
    stackable: true,
    stackPriority: 18,
    metadata: {
        id: "relevance",
        name: "Relevance",
        description: "Extractive sentence scoring against the last user query.",
        inputScope: "messages",
        targetLatencyMs: 2,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        try {
            const messages = body.messages;
            if (!Array.isArray(messages)) return {
                body,
                compressed: false,
                stats: null
            };
            const cfg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRelevanceConfig"])(options?.stepConfig ?? {});
            let query = "";
            for(let i = messages.length - 1; i >= 0; i--){
                const msg = messages[i];
                if (msg.role === "user") {
                    query = extractText(msg.content).trim();
                    break;
                }
            }
            if (!query) return {
                body,
                compressed: false,
                stats: null
            };
            // Note: the query is a string snapshot taken BEFORE compression, so compressing the
            // last user message against it is NOT circular — and that message commonly carries
            // the pasted context the feature is meant to trim ("docs longos colados"). So we do
            // NOT skip it (a core-review suggestion to skip the query message was rejected: it
            // would no-op the dominant single-message RAG use case).
            let anyChanged = false;
            const newMessages = messages.map((msg)=>{
                const m = msg;
                if (m.role !== "user") return msg;
                // String content: compress in place.
                if (typeof m.content === "string") {
                    const { result, changed } = applyRelevanceToText(m.content, query, cfg);
                    if (!changed) return msg;
                    anyChanged = true;
                    return {
                        ...m,
                        content: result
                    };
                }
                // Array/multimodal content: only safe when there is EXACTLY ONE text block.
                // Joining all text blocks and stamping the result into each would duplicate and
                // scramble per-block content (core-review issue: multimodal corruption).
                if (Array.isArray(m.content)) {
                    const textBlocks = m.content.filter((b)=>b && typeof b === "object" && "text" in b);
                    if (textBlocks.length !== 1) return msg; // 0 or ≥2 text blocks ⇒ no-op
                    const { result, changed } = applyRelevanceToText(String(textBlocks[0].text), query, cfg);
                    if (!changed) return msg;
                    anyChanged = true;
                    const newContent = m.content.map((block)=>block === textBlocks[0] ? {
                            ...block,
                            text: result
                        } : block);
                    return {
                        ...m,
                        content: newContent
                    };
                }
                return msg;
            });
            if (!anyChanged) return {
                body,
                compressed: false,
                stats: null
            };
            const newBody = {
                ...body,
                messages: newMessages
            };
            const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
                "relevance-extract"
            ]);
            return {
                body: newBody,
                compressed: true,
                stats
            };
        } catch  {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RELEVANCE_SCHEMA"];
    },
    validateConfig (config) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$configSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateRelevanceConfig"])(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/llm/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "llmCompressorEngine",
    ()=>llmCompressorEngine,
    "setLlmCompressorBackend",
    ()=>setLlmCompressorBackend
]);
/**
 * LLM-tier async compression engine (T05/C3 — opt-in, default-off).
 *
 * A generic "LLM compressor" tier: it can condense the prose of non-system messages via
 * a pluggable LLM backend. It mirrors the `llmlingua` engine's contract exactly, but the
 * backend is a full chat-completion model rather than a local ONNX classifier.
 *
 * ## Safe by construction (default-off)
 * - The DEFAULT backend is a no-op (`text => text`), so out of the box the engine NEVER
 *   mutates the payload — it returns the body unchanged (`compressed:false`).
 * - It is NOT part of the default stacked pipeline; an operator must add it explicitly.
 * - `enabled` defaults to `false` in the config schema.
 * A real LLM backend is wired via `setLlmCompressorBackend()` (the same injection seam the
 * tests use). The real production model is intentionally left as a VPS-validated follow-up
 * (Hard Rule #18), exactly as the `llmlingua` worker backend is gated.
 *
 * ## Fail-open everywhere (never throws, never corrupts)
 * 1. Backend rejection/error per prose segment → segment kept as-is.
 * 2. Any unexpected error in `applyAsync` → original body, `compressed:false`, no throw.
 *
 * ## Code-block protection (inviolable)
 * Fenced code blocks (and other preserved constructs) are tombstoned via
 * `extractPreservedBlocks` and re-stitched verbatim — the engine physically never passes
 * code to the backend. System messages are never touched.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
;
;
/** The default production backend: a no-op that returns the text unchanged (pass-through). */ const noopBackend = async (text)=>text;
/** Module-level injectable backend (null = use the no-op default). */ let _backend = null;
function setLlmCompressorBackend(b) {
    _backend = b;
}
function resolveBackend() {
    return _backend ?? noopBackend;
}
function splitProseAndPreserved(text) {
    const { text: withPlaceholders, blocks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(text);
    if (blocks.length === 0) return [
        {
            kind: "prose",
            text
        }
    ];
    const placeholderToOriginal = new Map(blocks.map((b)=>[
            b.placeholder,
            b.content
        ]));
    const escaped = blocks.map((b)=>b.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const splitRe = new RegExp(`(${escaped.join("|")})`, "g");
    const segments = [];
    for (const part of withPlaceholders.split(splitRe)){
        if (!part) continue;
        const original = placeholderToOriginal.get(part);
        segments.push(original !== undefined ? {
            kind: "preserved",
            text: original
        } : {
            kind: "prose",
            text: part
        });
    }
    return segments;
}
async function compressProseText(text, backend, opts) {
    if (!text.trim()) return {
        text,
        didCompress: false
    };
    try {
        const compressed = await backend(text, opts);
        if (typeof compressed === "string" && compressed.length < text.length) {
            return {
                text: compressed,
                didCompress: true
            };
        }
        return {
            text,
            didCompress: false
        };
    } catch  {
        return {
            text,
            didCompress: false
        };
    }
}
async function compressMessageText(text, backend, opts) {
    const segments = splitProseAndPreserved(text);
    let anyCompressed = false;
    const parts = [];
    for (const seg of segments){
        if (seg.kind === "preserved") {
            parts.push(seg.text);
        } else {
            const { text: out, didCompress } = await compressProseText(seg.text, backend, opts);
            parts.push(out);
            if (didCompress) anyCompressed = true;
        }
    }
    return {
        text: parts.join(""),
        didCompress: anyCompressed
    };
}
async function processMessages(messages, backend, opts) {
    let compressedCount = 0;
    const result = [];
    for (const msg of messages){
        if (msg.role === "system") {
            result.push({
                ...msg
            });
            continue;
        }
        try {
            if (typeof msg.content === "string") {
                const { text, didCompress } = await compressMessageText(msg.content, backend, opts);
                if (didCompress) {
                    compressedCount++;
                    result.push({
                        ...msg,
                        content: text
                    });
                } else {
                    result.push({
                        ...msg
                    });
                }
            } else if (Array.isArray(msg.content)) {
                let changed = false;
                const newContent = [];
                for (const part of msg.content){
                    if (part["type"] === "text" && typeof part["text"] === "string") {
                        const { text, didCompress } = await compressMessageText(part["text"], backend, opts);
                        if (didCompress) {
                            changed = true;
                            compressedCount++;
                            newContent.push({
                                ...part,
                                text
                            });
                        } else {
                            newContent.push(part);
                        }
                    } else {
                        newContent.push(part);
                    }
                }
                result.push(changed ? {
                    ...msg,
                    content: newContent
                } : {
                    ...msg
                });
            } else {
                result.push({
                    ...msg
                });
            }
        } catch  {
            result.push({
                ...msg
            });
        }
    }
    return {
        messages: result,
        compressedCount
    };
}
// ─── config schema ────────────────────────────────────────────────────────────
const LLM_COMPRESSOR_SCHEMA = [
    // Default OFF: this tier costs an extra model call and mutates the payload, so it is
    // opt-in (Hard Rule #20 spirit) — never on by default.
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: false
    },
    {
        key: "model",
        type: "string",
        label: "Compression model",
        defaultValue: ""
    },
    {
        key: "minTokens",
        type: "number",
        label: "Min tokens (floor)",
        defaultValue: 2000,
        min: 0,
        max: 100000
    },
    {
        key: "compressionRate",
        type: "number",
        label: "Compression rate (keep ratio)",
        defaultValue: 0.5,
        min: 0.1,
        max: 0.9
    }
];
function validateLlmCompressorConfig(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    if (config["model"] !== undefined && typeof config["model"] !== "string") {
        errors.push("model must be a string");
    }
    if (config["minTokens"] !== undefined) {
        const v = config["minTokens"];
        if (typeof v !== "number" || Number.isNaN(v) || v < 0) errors.push("minTokens must be a number >= 0");
    }
    if (config["compressionRate"] !== undefined) {
        const v = config["compressionRate"];
        if (typeof v !== "number" || Number.isNaN(v) || v < 0.1 || v > 0.9) {
            errors.push("compressionRate must be a number between 0.1 and 0.9");
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// ─── engine export ──────────────────────────────────────────────────────────────
const ENGINE_ID = "llm";
const llmCompressorEngine = {
    id: ENGINE_ID,
    name: "LLM Compressor (opt-in)",
    description: "Opt-in LLM-tier compression: condenses the prose of non-system messages via a pluggable " + "chat-completion backend. Default-off and a no-op until an operator both enables it and wires " + "a real backend; fenced code blocks and system messages are never sent to the model. " + "Fail-opens on any backend error.",
    icon: "robot",
    targets: [
        "messages"
    ],
    stackable: true,
    // Runs after llmlingua (35) but before ultra (40); semantic LLM rewriting is most useful
    // once cheaper structural/semantic passes have already reduced the prose.
    stackPriority: 38,
    metadata: {
        id: ENGINE_ID,
        name: "LLM Compressor (opt-in)",
        description: "Opt-in LLM-tier prose compression via a pluggable backend. Default-off / no-op; " + "code blocks and system messages are protected; fail-open on backend error.",
        inputScope: "messages",
        targetLatencyMs: 1500,
        supportsPreview: false,
        stable: true
    },
    /** Synchronous pass-through — the real work is async-only (`applyAsync`). */ apply (body) {
        return {
            body,
            compressed: false,
            stats: null
        };
    },
    async applyAsync (body, options) {
        const stepConfig = options?.stepConfig ?? {};
        // Opt-in: only runs when explicitly enabled.
        if (stepConfig["enabled"] !== true) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const minTokens = typeof stepConfig["minTokens"] === "number" ? stepConfig["minTokens"] : 2000;
        if (minTokens > 0) {
            const nonSystemText = messages.filter((m)=>m.role !== "system").map((m)=>typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "")).join("\n");
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateCompressionTokens"])(nonSystemText) < minTokens) {
                return {
                    body,
                    compressed: false,
                    stats: null
                };
            }
        }
        const backendOpts = {
            model: typeof stepConfig["model"] === "string" ? stepConfig["model"] : undefined,
            compressionRate: typeof stepConfig["compressionRate"] === "number" ? stepConfig["compressionRate"] : undefined
        };
        try {
            const backend = resolveBackend();
            const start = performance.now();
            const { messages: newMessages, compressedCount } = await processMessages(messages, backend, backendOpts);
            if (compressedCount === 0) {
                return {
                    body,
                    compressed: false,
                    stats: null
                };
            }
            const newBody = {
                ...body,
                messages: newMessages
            };
            const durationMs = Math.round(performance.now() - start);
            const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
                ENGINE_ID
            ], [
                `llm-compressed-${compressedCount}-messages`
            ], durationMs);
            return {
                body: newBody,
                compressed: true,
                stats
            };
        } catch  {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config ?? {}
        });
    },
    getConfigSchema () {
        return LLM_COMPRESSOR_SCHEMA;
    },
    validateConfig (config) {
        return validateLlmCompressorConfig(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/readLifecycle/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collapseSupersededReads",
    ()=>collapseSupersededReads,
    "extractInvocations",
    ()=>extractInvocations,
    "findSupersededReadCallIds",
    ()=>findSupersededReadCallIds,
    "readLifecycleEngine",
    ()=>readLifecycleEngine
]);
/**
 * read-lifecycle compression engine (T08/H7 — gaps v3.8.42; opt-in, default-off).
 *
 * Agentic conversations re-Read the same files repeatedly. An earlier Read becomes **stale**
 * once the same path is Read again (superseded by a newer view) or modified by a later
 * Write/Edit. This engine collapses those superseded Read tool-results to a short stub, keeping
 * only the current (last, un-superseded) Read intact.
 *
 * Unlike `session-dedup` (content-addressed — collapses *identical* blocks) or `ccr` (reversible
 * markers), this is **semantic + lossy**: it removes stale content the later Read supersedes, so
 * it is **opt-in / default-off**. It is conservative: it matches only well-known Read/Write tool
 * names, compares exact paths, and collapses a Read only when a strictly-later invocation touches
 * the same path. Fail-open — any unexpected shape is left untouched.
 *
 * Supports both the Anthropic content-block shape (`tool_use` / `tool_result`) and the OpenAI
 * shape (assistant `tool_calls` + `role:"tool"` messages), linked by call id.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
;
const ENGINE_ID = "read-lifecycle";
/** Conservative tool-name classification (exact, lower-cased) — avoids false collapses. */ const READ_NAMES = new Set([
    "read",
    "read_file",
    "readfile",
    "view",
    "view_file",
    "cat"
]);
const WRITE_NAMES = new Set([
    "write",
    "write_file",
    "writefile",
    "edit",
    "edit_file",
    "multiedit",
    "str_replace",
    "str_replace_editor",
    "str_replace_based_edit_tool",
    "apply_patch",
    "create_file",
    "update_file"
]);
function classifyTool(name) {
    if (typeof name !== "string") return null;
    const lc = name.trim().toLowerCase();
    if (READ_NAMES.has(lc)) return "read";
    if (WRITE_NAMES.has(lc)) return "write";
    return null;
}
function isRecord(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
/** Extract a file path from a tool input object across common field names. */ function extractPath(input) {
    if (!isRecord(input)) return null;
    for (const key of [
        "file_path",
        "path",
        "filePath",
        "filename",
        "file",
        "target_file"
    ]){
        const v = input[key];
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
}
function parseMaybeJson(value) {
    if (isRecord(value)) return value;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch  {
            return null;
        }
    }
    return null;
}
function extractInvocations(messages) {
    const invocations = [];
    const readPathByCallId = new Map();
    let order = 0;
    for (const msg of messages){
        // Anthropic: content array with tool_use blocks.
        if (Array.isArray(msg?.content)) {
            for (const block of msg.content){
                if (!isRecord(block) || block.type !== "tool_use") continue;
                const kind = classifyTool(block.name);
                const callId = typeof block.id === "string" ? block.id : null;
                const path = extractPath(block.input);
                if (kind && callId && path) {
                    invocations.push({
                        callId,
                        kind,
                        path,
                        order: order++
                    });
                    if (kind === "read") readPathByCallId.set(callId, path);
                }
            }
        }
        // OpenAI: assistant.tool_calls array.
        if (Array.isArray(msg?.tool_calls)) {
            for (const call of msg.tool_calls){
                if (!isRecord(call)) continue;
                const fn = isRecord(call.function) ? call.function : null;
                const kind = classifyTool(fn?.name);
                const callId = typeof call.id === "string" ? call.id : null;
                const path = extractPath(parseMaybeJson(fn?.arguments));
                if (kind && callId && path) {
                    invocations.push({
                        callId,
                        kind,
                        path,
                        order: order++
                    });
                    if (kind === "read") readPathByCallId.set(callId, path);
                }
            }
        }
    }
    return {
        invocations,
        readPathByCallId
    };
}
function findSupersededReadCallIds(invocations) {
    const superseded = new Set();
    for (const inv of invocations){
        if (inv.kind !== "read") continue;
        const hasLater = invocations.some((o)=>o.path === inv.path && o.order > inv.order);
        if (hasLater) superseded.add(inv.callId);
    }
    return superseded;
}
function stubFor(path) {
    return `[read superseded — "${path}" was re-read or modified later in the conversation; the current content appears below]`;
}
function replaceResultText(content, stub) {
    if (typeof content === "string") return stub;
    if (Array.isArray(content)) {
        return content.map((part)=>isRecord(part) && part.type === "text" && typeof part.text === "string" ? {
                ...part,
                text: stub
            } : part);
    }
    return stub;
}
function collapseSupersededReads(messages, superseded, readPathByCallId) {
    if (superseded.size === 0) return {
        messages,
        collapsedCount: 0
    };
    let collapsedCount = 0;
    const out = messages.map((msg)=>{
        // OpenAI tool result message.
        if (msg?.role === "tool" && typeof msg.tool_call_id === "string" && superseded.has(msg.tool_call_id)) {
            collapsedCount++;
            const path = readPathByCallId.get(msg.tool_call_id) ?? "file";
            return {
                ...msg,
                content: stubFor(path)
            };
        }
        // Anthropic tool_result blocks inside a content array.
        if (Array.isArray(msg?.content)) {
            let changed = false;
            const newContent = msg.content.map((block)=>{
                if (isRecord(block) && block.type === "tool_result" && typeof block.tool_use_id === "string" && superseded.has(block.tool_use_id)) {
                    changed = true;
                    collapsedCount++;
                    const path = readPathByCallId.get(block.tool_use_id) ?? "file";
                    return {
                        ...block,
                        content: replaceResultText(block.content, stubFor(path))
                    };
                }
                return block;
            });
            if (changed) return {
                ...msg,
                content: newContent
            };
        }
        return msg;
    });
    return {
        messages: out,
        collapsedCount
    };
}
// ─── schema ──────────────────────────────────────────────────────────────────
const SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: false
    }
];
function validate(config) {
    const errors = [];
    if (config["enabled"] !== undefined && typeof config["enabled"] !== "boolean") {
        errors.push("enabled must be a boolean");
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
const readLifecycleEngine = {
    id: ENGINE_ID,
    name: "Read Lifecycle (opt-in)",
    description: "Collapses stale/superseded file-Read tool results: when the same path is re-read or modified " + "later in the conversation, earlier Reads are replaced with a short stub, keeping the current " + "Read intact. Lossy + opt-in (default off). Supports Anthropic and OpenAI tool shapes.",
    icon: "history",
    targets: [
        "messages"
    ],
    stackable: true,
    // Runs early (before content engines) so stale reads are gone before other passes work on them.
    stackPriority: 5,
    metadata: {
        id: ENGINE_ID,
        name: "Read Lifecycle (opt-in)",
        description: "Collapse superseded file-Read tool results (same path re-read/modified later). " + "Lossy, opt-in, default off. Anthropic + OpenAI shapes.",
        inputScope: "messages",
        targetLatencyMs: 2,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const stepConfig = options?.stepConfig ?? {};
        if (stepConfig["enabled"] !== true) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const messages = body["messages"];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        try {
            const start = performance.now();
            const { invocations, readPathByCallId } = extractInvocations(messages);
            const superseded = findSupersededReadCallIds(invocations);
            const { messages: newMessages, collapsedCount } = collapseSupersededReads(messages, superseded, readPathByCallId);
            if (collapsedCount === 0) {
                return {
                    body,
                    compressed: false,
                    stats: null
                };
            }
            const newBody = {
                ...body,
                messages: newMessages
            };
            const durationMs = Math.round(performance.now() - start);
            const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, newBody, "stacked", [
                ENGINE_ID
            ], [
                `read-lifecycle-collapsed-${collapsedCount}`
            ], durationMs);
            return {
                body: newBody,
                compressed: true,
                stats
            };
        } catch  {
            // Fail-open: any unexpected shape leaves the body untouched.
            return {
                body,
                compressed: false,
                stats: null
            };
        }
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config ?? {}
        });
    },
    getConfigSchema () {
        return SCHEMA;
    },
    validateConfig (config) {
        return validate(config);
    }
};
}),
"[project]/open-sse/services/compression/engines/omniglyphAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * OmniGlyph — compressão contexto-como-imagem (Anthropic/Fable 5 apenas).
 * Renderiza system prompt, tool docs, histórico antigo e tool_results grandes
 * como páginas PNG densas; o modelo lê as páginas no lugar do texto por ~10×
 * menos tokens no bloco convertido (59-70% ponta a ponta, medido).
 *
 * GATES (todos fail-closed; cada skip vira técnica `skip:<motivo>` nos stats):
 *  - supportsVision !== true            → skip:no_vision
 *  - modelo fora da allowlist medida    → skip:model_not_approved
 *  - providerTransport !== 'direct'     → skip:transport_not_direct
 *    (agregadores redimensionam imagens e destroem a legibilidade — medido)
 *  - corpo não é formato Claude nativo  → skip:source_format_not_claude
 *  - gate de rentabilidade interno do omniglyph decide o resto (patches 28px
 *    exatos; texto esparso/pequeno passa direto) → skip:not_profitable
 *
 * `sampling: true`: perda é INTENCIONAL (byte-exatos viajam no factsheet em
 * texto) — o fidelity gate pula esta engine por design, não por acidente.
 */ __turbopack_context__.s([
    "omniglyphEngine",
    ()=>omniglyphEngine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$library$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/library.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$applicability$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/applicability.js [app-route] (ecmascript)");
;
;
function skip(body, reason) {
    try {
        return {
            body,
            compressed: false,
            stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, body, "stacked", [
                `skip:${reason}`
            ])
        };
    } catch  {
        // Fail-open guard: a non-serializable body (e.g. circular reference) makes
        // createCompressionStats' internal JSON.stringify throw too — stats become
        // best-effort telemetry, never a reason to propagate the error.
        return {
            body,
            compressed: false,
            stats: null
        };
    }
}
/** Formato Claude nativo: system no topo, nunca role:"system" dentro de messages. */ function isClaudeFormat(body) {
    const messages = body.messages;
    if (!Array.isArray(messages)) return false;
    return !messages.some((m)=>m?.role === "system");
}
async function applyOmniglyph(body, options) {
    const model = options?.model ?? body.model ?? "";
    if (options?.supportsVision !== true) return skip(body, "no_vision");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$applicability$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isOmniGlyphSupportedModel"])(model)) return skip(body, "model_not_approved");
    if (options?.providerTransport !== "direct") return skip(body, "transport_not_direct");
    if (!isClaudeFormat(body)) return skip(body, "source_format_not_claude");
    const started = Date.now();
    let outBody;
    try {
        const encoded = new TextEncoder().encode(JSON.stringify(body));
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$library$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformAnthropicMessages"])({
            body: encoded,
            model
        });
        if (!result.applied) return skip(body, result.reason ?? "not_profitable");
        outBody = JSON.parse(new TextDecoder().decode(result.body));
    } catch  {
        // Fail-open: qualquer erro no encode/transform/decode (ex.: corpo não serializável,
        // render PNG estourando, JSON decodificado malformado) vira skip, nunca propaga.
        return skip(body, "transform_error");
    }
    return {
        body: outBody,
        compressed: true,
        stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, outBody, "stacked", [
            "omniglyph:context-as-image"
        ], undefined, Date.now() - started)
    };
}
const omniglyphEngine = {
    id: "omniglyph",
    name: "OmniGlyph",
    description: "Contexto-como-imagem (Anthropic Fable 5, rota direta): system prompt, tool docs e histórico viram páginas PNG densas — ~10× menos tokens no bloco convertido.",
    icon: "image",
    targets: [
        "messages",
        "tool_results"
    ],
    stackable: true,
    stackPriority: 90,
    sampling: true,
    metadata: {
        id: "omniglyph",
        name: "OmniGlyph",
        description: "Contexto-como-imagem para Claude Fable 5 via rota direta Anthropic.",
        inputScope: "mixed",
        targetLatencyMs: 250,
        supportsPreview: true,
        stable: false
    },
    // Contrato da interface: engines async-only mantêm apply síncrono como pass-through seguro.
    apply (body) {
        return {
            body,
            compressed: false,
            stats: null
        };
    },
    applyAsync: applyOmniglyph,
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return [];
    },
    validateConfig () {
        return {
            valid: true,
            errors: []
        };
    }
};
}),
"[project]/open-sse/services/compression/engines/codexResponses/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "codexResponsesEngine",
    ()=>codexResponsesEngine
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/bodyAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/tiktokenCounter.ts [app-route] (ecmascript)");
;
;
;
;
const ENGINE_ID = "codex-responses";
function countCodexTokens(text) {
    if (!text) return 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countTextTokens"])(text, {
        provider: "codex"
    });
}
const SUPPORTED_TYPES = new Set([
    "function_call_output",
    "local_shell_call_output",
    "apply_patch_call_output"
]);
const DIFF_HUNK_RE = /^@@{1,2}\s+-\d+(?:,\d+)?(?:\s+-\d+(?:,\d+)?)*\s+\+\d+(?:,\d+)?(?:,\d+)?\s+@@{1,2}/m;
const SEARCH_LINE_RE = /^\s*(?:[\w./-]+:\d+(?::\d+)?:|\d+(?::\d+)?[-:])\s*\S/m;
const IMPORTANT_LOG_RE = /(?:^|\b)(?:error|warning|warn|failed|failure|fatal|panic|exception|traceback|assertion|exit\s+code)\b/i;
const BUILD_RE = /\b(?:build|compile|test|lint|npm|yarn|pnpm|mix|make|cargo|gradle|maven|pytest|rspec|exunit)\b/i;
const CODEX_SCHEMA = [
    {
        key: "enabled",
        type: "boolean",
        label: "Enabled",
        defaultValue: false
    },
    {
        key: "minBytes",
        type: "number",
        label: "Minimum output bytes",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].minBytes,
        min: 0,
        max: 2_000_000
    },
    {
        key: "maxOutputBytes",
        type: "number",
        label: "Maximum output bytes",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].maxOutputBytes,
        min: 1,
        max: 10_000_000
    },
    {
        key: "maxCandidateBytes",
        type: "number",
        label: "Maximum candidate bytes",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].maxCandidateBytes,
        min: 1,
        max: 2_000_000
    },
    {
        key: "maxLines",
        type: "number",
        label: "Maximum retained lines",
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].maxLines,
        min: 1,
        max: 10_000
    }
];
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function bounded(value, fallback, min, max) {
    return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
}
function mergeConfig(options) {
    const source = options?.config?.codexResponsesConfig ?? {};
    const step = options?.stepConfig ?? {};
    const merged = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"],
        ...source,
        ...step
    };
    return {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"],
        enabled: merged.enabled !== false,
        minBytes: bounded(merged.minBytes, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].minBytes, 0, 2_000_000),
        maxOutputBytes: bounded(merged.maxOutputBytes, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].maxOutputBytes, 1, 10_000_000),
        maxCandidateBytes: bounded(merged.maxCandidateBytes, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].maxCandidateBytes, 1, 2_000_000),
        maxLines: bounded(merged.maxLines, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].maxLines, 1, 10_000),
        minSearchMatches: bounded(merged.minSearchMatches, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].minSearchMatches, 2, 10_000),
        minLogLines: bounded(merged.minLogLines, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].minLogLines, 2, 10_000),
        preserveToolNames: Array.isArray(merged.preserveToolNames) ? merged.preserveToolNames.filter((name)=>typeof name === "string") : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CODEX_RESPONSES_CONFIG"].preserveToolNames
    };
}
function minifyJson(text) {
    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed) && !isRecord(parsed)) return null;
        return JSON.stringify(parsed);
    } catch  {
        return null;
    }
}
function collapseLines(text, config) {
    const lines = text.split(/\r?\n/);
    if (lines.length < config.minLogLines) return null;
    const important = lines.map((line, index)=>({
            line,
            index
        })).filter(({ line })=>IMPORTANT_LOG_RE.test(line) || /^(?:\s*(?:at\s|File\s|\S+[:(]\d+))/.test(line)).map(({ index })=>index);
    if (important.length === 0 && !BUILD_RE.test(text)) return null;
    const keep = new Set();
    for(let index = 0; index < Math.min(8, lines.length); index++)keep.add(index);
    for(let index = Math.max(0, lines.length - 8); index < lines.length; index++)keep.add(index);
    for (const index of important){
        for(let offset = -2; offset <= 2; offset++){
            if (index + offset >= 0 && index + offset < lines.length) keep.add(index + offset);
        }
    }
    const indexes = [
        ...keep
    ].sort((a, b)=>a - b).slice(0, config.maxLines);
    const output = [];
    let previous = -1;
    for (const index of indexes){
        if (index - previous > 1) output.push(`[compressed log output: omitted ${index - previous - 1} lines]`);
        output.push(lines[index]);
        previous = index;
    }
    if (previous < lines.length - 1) output.push(`[compressed log output: omitted ${lines.length - previous - 1} lines]`);
    return output.join("\n");
}
function compactDiff(text, config) {
    if (!DIFF_HUNK_RE.test(text)) return null;
    const lines = text.split(/\r?\n/);
    const output = [];
    let changedSinceContext = 0;
    for (const line of lines){
        const changed = line.startsWith("+") || line.startsWith("-") || line.startsWith("@@");
        if (changed) {
            output.push(line);
            changedSinceContext = 0;
        } else if (changedSinceContext < 2) {
            output.push(line);
            changedSinceContext++;
        }
    }
    return output.length < lines.length && output.length <= config.maxLines * 4 ? output.join("\n") : null;
}
function compactSearch(text, config) {
    const lines = text.split(/\r?\n/);
    const matches = lines.filter((line)=>SEARCH_LINE_RE.test(line));
    if (matches.length < config.minSearchMatches) return null;
    const grouped = new Map();
    for (const line of matches){
        const path = line.trim().split(/:\d/)[0].split(/-\d/)[0];
        const group = grouped.get(path) ?? [];
        if (group.length < 3) group.push(line.trim());
        grouped.set(path, group);
    }
    const output = [
        ...grouped.entries()
    ].map(([path, entries])=>[
            path,
            ...entries
        ].join("\n")).join("\n");
    return output.length < text.length ? output : null;
}
function candidateRewrite(text, config) {
    if (Buffer.byteLength(text, "utf8") < config.minBytes) return null;
    if (Buffer.byteLength(text, "utf8") > config.maxCandidateBytes) return null;
    const json = minifyJson(text);
    const diff = compactDiff(text, config);
    const search = compactSearch(text, config);
    const log = collapseLines(text, config);
    return [
        json,
        diff,
        search,
        log
    ].filter((value)=>typeof value === "string").sort((a, b)=>Buffer.byteLength(a) - Buffer.byteLength(b))[0] ?? null;
}
function rewriteText(value, config) {
    if (typeof value !== "string") return null;
    if (Buffer.byteLength(value, "utf8") > config.maxOutputBytes) return null;
    const rewritten = candidateRewrite(value, config);
    if (!rewritten || Buffer.byteLength(rewritten) >= Buffer.byteLength(value)) return null;
    if (countCodexTokens(rewritten) >= countCodexTokens(value)) {
        return null;
    }
    return rewritten;
}
function hasLossyRewriteCandidate(text, config) {
    if (typeof text !== "string") return false;
    return compactDiff(text, config) !== null || compactSearch(text, config) !== null || collapseLines(text, config) !== null;
}
function protectedByConfig(meta) {
    return !SUPPORTED_TYPES.has(meta.type) || !meta.eligible;
}
const codexResponsesEngine = {
    id: ENGINE_ID,
    name: "Responses Tool Output",
    description: "Conservative lossless-first compression for supported Responses tool outputs.",
    icon: "data_object",
    targets: [
        "tool_results"
    ],
    stackable: true,
    stackPriority: 12,
    metadata: {
        id: ENGINE_ID,
        name: "Responses Tool Output",
        description: "Compresses eligible shell, patch, search, build, and JSON outputs.",
        inputScope: "tool-results",
        targetLatencyMs: 5,
        supportsPreview: true,
        stable: true
    },
    apply (body, options) {
        const config = mergeConfig(options);
        if (!config.enabled || !Array.isArray(body.messages)) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        let changed = false;
        const messages = body.messages.map((raw)=>{
            if (!isRecord(raw) || raw.role !== "tool") return raw;
            const meta = raw[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_RESPONSE_ITEM_META"]];
            if (!meta || typeof meta.type !== "string" || meta.eligible !== true) return raw;
            const typeMeta = {
                type: meta.type,
                eligible: true
            };
            if (protectedByConfig(typeMeta)) return raw;
            if (meta.type === "local_shell_call_output" && hasLossyRewriteCandidate(raw.content, config)) {
                return raw;
            }
            const next = rewriteText(raw.content, config);
            if (next === null) return raw;
            changed = true;
            return {
                ...raw,
                content: next
            };
        });
        if (!changed) return {
            body,
            compressed: false,
            stats: null
        };
        const nextBody = {
            ...body,
            messages
        };
        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(body, nextBody, "codex-responses", [
            ENGINE_ID
        ]);
        const originalTokens = countCodexTokens(JSON.stringify(body));
        const compressedTokens = countCodexTokens(JSON.stringify(nextBody));
        stats.originalTokens = originalTokens;
        stats.compressedTokens = compressedTokens;
        stats.savingsPercent = originalTokens > 0 ? Math.round((originalTokens - compressedTokens) / originalTokens * 10000) / 100 : 0;
        return {
            body: nextBody,
            compressed: stats.compressedTokens < stats.originalTokens,
            stats
        };
    },
    compress (body, config) {
        return this.apply(body, {
            stepConfig: config
        });
    },
    getConfigSchema () {
        return CODEX_SCHEMA;
    },
    validateConfig (config) {
        const errors = [];
        for (const [key, min, max] of [
            [
                "minBytes",
                0,
                2_000_000
            ],
            [
                "maxOutputBytes",
                1,
                10_000_000
            ],
            [
                "maxCandidateBytes",
                1,
                2_000_000
            ],
            [
                "maxLines",
                1,
                10_000
            ],
            [
                "minSearchMatches",
                2,
                10_000
            ],
            [
                "minLogLines",
                2,
                10_000
            ]
        ]){
            if (config[key] !== undefined && (typeof config[key] !== "number" || config[key] < min || config[key] > max)) {
                errors.push(`${key} must be between ${min} and ${max}`);
            }
        }
        if (config.enabled !== undefined && typeof config.enabled !== "boolean") errors.push("enabled must be boolean");
        return {
            valid: errors.length === 0,
            errors
        };
    }
};
}),
"[project]/open-sse/services/compression/engines/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "registerBuiltinCompressionEngines",
    ()=>registerBuiltinCompressionEngines
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/registry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/cavemanAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$session$2d$dedup$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/session-dedup/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ccr/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llmlingua/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ionizer$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/ionizer/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/relevance/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llm$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/llm/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$readLifecycle$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/readLifecycle/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$omniglyphAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/omniglyphAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$codexResponses$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/codexResponses/index.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
let registered = false;
function registerBuiltinCompressionEngines() {
    // The `registered` latch is a fast-path to skip the loop, but it must not block
    // re-registration after clearCompressionEngineRegistry() empties the map (tests do this).
    // Re-run when the registry was cleared so the builtins are restored.
    if (registered && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["liteEngine"].id)) return;
    registered = true;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["liteEngine"].id)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerCompressionEngine"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["liteEngine"]);
    const engines = [
        {
            id: "caveman",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cavemanEngine"]
        },
        {
            id: "aggressive",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggressiveEngine"]
        },
        {
            id: "ultra",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$cavemanAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ultraEngine"]
        },
        {
            id: "rtk",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["rtkEngine"]
        },
        {
            id: "codex-responses",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$codexResponses$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["codexResponsesEngine"]
        },
        {
            id: "session-dedup",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$session$2d$dedup$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sessionDedupEngine"]
        },
        {
            id: "headroom",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["headroomEngine"]
        },
        {
            id: "ccr",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ccr$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ccrEngine"]
        },
        {
            id: "llmlingua",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llmlingua$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["llmlinguaEngine"]
        },
        {
            id: "ionizer",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$ionizer$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ionizerEngine"]
        },
        {
            id: "relevance",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$relevance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relevanceEngine"]
        },
        {
            id: "llm",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$llm$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["llmCompressorEngine"]
        },
        {
            id: "read-lifecycle",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$readLifecycle$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readLifecycleEngine"]
        },
        {
            id: "omniglyph",
            engine: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$omniglyphAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["omniglyphEngine"]
        }
    ];
    for (const { id, engine } of engines){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])(id)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerCompressionEngine"])(engine);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/engines/omniglyphSingleMode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyOmniglyphSingleMode",
    ()=>applyOmniglyphSingleMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/registry.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function applyOmniglyphSingleMode(body, options) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerBuiltinCompressionEngines"])();
    const engine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])("omniglyph");
    if (!engine?.applyAsync) return {
        body,
        compressed: false,
        stats: null
    };
    return engine.applyAsync(body, options);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/cachingAware.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCachingContext",
    ()=>detectCachingContext,
    "getCacheAwareStrategy",
    ()=>getCacheAwareStrategy
]);
/**
 * Cache-aware strategy selection for AI model compression.
 * Implements logic to detect caching context from request body and adjust strategies accordingly.
 *
 * @file cachingAware.ts
 * @exports CachingContext, CacheAwareStrategy, detectCachingContext, getCacheAwareStrategy
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cacheControlPolicy.ts [app-route] (ecmascript)");
;
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function normalizeString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function inferProviderFromModel(model) {
    const normalized = normalizeString(model);
    if (!normalized) return null;
    const slashIndex = normalized.indexOf("/");
    if (slashIndex <= 0) return null;
    return normalized.slice(0, slashIndex).toLowerCase();
}
function hasOwnCacheControl(value) {
    return isRecord(value) && value.cache_control !== undefined && value.cache_control !== null;
}
function arrayHasCacheControl(values) {
    return Array.isArray(values) && values.some((value)=>hasCacheControl(value));
}
function hasCacheControl(value) {
    if (hasOwnCacheControl(value)) return true;
    if (Array.isArray(value)) return value.some((item)=>hasCacheControl(item));
    if (!isRecord(value)) return false;
    if (arrayHasCacheControl(value.system)) return true;
    if (arrayHasCacheControl(value.tools)) return true;
    if (arrayHasCacheControl(value.messages)) return true;
    if (arrayHasCacheControl(value.input)) return true;
    if (arrayHasCacheControl(value.contents)) return true;
    if (isRecord(value.request) && arrayHasCacheControl(value.request.contents)) return true;
    if (isRecord(value.content) || Array.isArray(value.content)) {
        return hasCacheControl(value.content);
    }
    return false;
}
function detectCachingContext(body, context = {}) {
    const bodyRecord = isRecord(body) ? body : {};
    const provider = normalizeString(context.provider)?.toLowerCase() ?? inferProviderFromModel(context.model) ?? inferProviderFromModel(bodyRecord.model);
    const targetFormat = normalizeString(context.targetFormat)?.toLowerCase() ?? null;
    return {
        hasCacheControl: hasCacheControl(body),
        provider,
        targetFormat,
        isCachingProvider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerSupportsCaching"])(provider, targetFormat, context.connectionCacheOverride)
    };
}
function getCacheAwareStrategy(strategy, ctx) {
    // #3955: a caching provider is enough on its own to protect the cacheable prefix.
    // OpenAI / Codex (and other automatic-prefix-cache providers) carry NO explicit
    // `cache_control` markers, yet the upstream still caches the longest matching prefix
    // (system prompt / earliest messages). Gating on `hasCacheControl` skipped the guard
    // for those providers, so a prefix-compressing mode rewrote the prefix → guaranteed
    // cache miss. Treat `isCachingProvider` alone as sufficient; the explicit
    // `cache_control` path is now a subset of this.
    if (ctx.isCachingProvider) {
        return {
            strategy: [
                "aggressive",
                "ultra"
            ].includes(strategy) ? "standard" : strategy,
            skipSystemPrompt: true,
            deterministicOnly: true
        };
    }
    // Return the original strategy with no modifications
    return {
        strategy,
        skipSystemPrompt: false,
        deterministicOnly: false
    };
}
}),
"[project]/open-sse/services/compression/deriveDefaultPlan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deriveDefaultPlan",
    ()=>deriveDefaultPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineCatalog.ts [app-route] (ecmascript)");
;
/** Maps single-mode engine ids to the effective CompressionMode name. */ const SINGLE_MODE_OF = {
    lite: "lite",
    caveman: "standard",
    aggressive: "aggressive",
    ultra: "ultra",
    rtk: "rtk",
    "codex-responses": "codex-responses",
    omniglyph: "omniglyph"
};
function deriveDefaultPlan(engines, masterEnabled) {
    if (!masterEnabled) return {
        mode: "off",
        stackedPipeline: []
    };
    const onIds = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ENGINE_CATALOG"]).filter((id)=>engines[id]?.enabled === true);
    if (onIds.length === 0) return {
        mode: "off",
        stackedPipeline: []
    };
    if (onIds.length === 1 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["engineMeta"])(onIds[0]).isSingleMode) {
        return {
            mode: SINGLE_MODE_OF[onIds[0]],
            stackedPipeline: []
        };
    }
    const ordered = onIds.sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["engineMeta"])(a).stackPriority - (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["engineMeta"])(b).stackPriority);
    const stackedPipeline = ordered.map((id)=>{
        const level = engines[id]?.level;
        return level ? {
            engine: id,
            intensity: level
        } : {
            engine: id
        };
    });
    return {
        mode: "stacked",
        stackedPipeline
    };
}
}),
"[project]/open-sse/services/compression/resolveCompressionPlan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveCompressionPlan",
    ()=>resolveCompressionPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/deriveDefaultPlan.ts [app-route] (ecmascript)");
;
function resolveCompressionPlan(config, ctx) {
    if (config?.enabled === false) return {
        mode: "off",
        stackedPipeline: []
    };
    // routing-combo override
    const ov = ctx.comboId ? config?.comboOverrides?.[ctx.comboId] : undefined;
    if (ov) return modeToPlan(ov, config);
    // active named combo
    if (config?.activeComboId && ctx.combos?.[config.activeComboId]) {
        return {
            mode: "stacked",
            stackedPipeline: ctx.combos[config.activeComboId]
        };
    }
    // derived default
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveDefaultPlan"])(config?.engines ?? {}, config?.enabled !== false);
}
function modeToPlan(mode, config) {
    return mode === "stacked" ? {
        mode: "stacked",
        stackedPipeline: config?.stackedPipeline ?? []
    } : {
        mode,
        stackedPipeline: []
    };
}
}),
"[project]/open-sse/services/compression/planResolution.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildNamedComboLookup",
    ()=>buildNamedComboLookup,
    "deriveDefaultPlanFromConfig",
    ()=>deriveDefaultPlanFromConfig,
    "formatCompressionAnnotation",
    ()=>formatCompressionAnnotation,
    "formatCompressionMeta",
    ()=>formatCompressionMeta,
    "planFromHeader",
    ()=>planFromHeader,
    "withSource",
    ()=>withSource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resolveCompressionPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/resolveCompressionPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/deriveDefaultPlan.ts [app-route] (ecmascript)");
;
;
const MAX_COMPRESSION_ANNOTATION_BYTES = 768;
const NON_ASCII_HEADER_VALUE_CHARS = /[^\x20-\x7e]/g;
function utf8ByteLength(value) {
    return new TextEncoder().encode(value).byteLength;
}
function withSource(plan, source) {
    return {
        ...plan,
        source
    };
}
function planFromHeader(config, header, combos) {
    const h = header.trim();
    if (!h) return null;
    const lower = h.toLowerCase();
    if (lower === "off") return withSource({
        mode: "off",
        stackedPipeline: []
    }, "request-header");
    if (lower === "default") {
        // Empty combos + null comboId yields the pure panel default (no active-combo leak).
        return withSource(deriveDefaultPlanFromConfig(config, null, {}), "request-header");
    }
    if (lower.startsWith("engine:")) {
        const id = lower.slice("engine:".length).trim();
        const engine = config.engines?.[id];
        return engine?.enabled ? withSource((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveDefaultPlan"])({
            [id]: engine
        }, true), "request-header") : null;
    }
    const combo = combos[lower] ?? combos[h];
    return combo ? withSource({
        mode: "stacked",
        stackedPipeline: combo
    }, "request-header") : null;
}
function formatCompressionMeta(plan) {
    return `${plan.mode}; source=${plan.source ?? "off"}`;
}
function formatCompressionAnnotation(stats) {
    const rules = stats.rulesApplied;
    if (!rules || rules.length === 0) return "";
    const counts = new Map();
    for (const rule of rules){
        const safeRule = rule.replace(NON_ASCII_HEADER_VALUE_CHARS, "?");
        counts.set(safeRule, (counts.get(safeRule) ?? 0) + 1);
    }
    const sorted = [
        ...counts.entries()
    ].sort((a, b)=>b[1] - a[1] || a[0].localeCompare(b[0]));
    const prefix = `tokens=${stats.originalTokens}->${stats.compressedTokens}; rules: `;
    const suffix = ", ...";
    const parts = [];
    let bytes = utf8ByteLength(prefix);
    for (const [name, n] of sorted){
        const part = `${name}x${n}`;
        const separator = parts.length > 0 ? ", " : "";
        const partBytes = utf8ByteLength(separator + part);
        if (bytes + partBytes > MAX_COMPRESSION_ANNOTATION_BYTES - utf8ByteLength(suffix)) {
            if (parts.length === 0) return "";
            return `${prefix}${parts.join(", ")}${suffix}`;
        }
        parts.push(part);
        bytes += partBytes;
    }
    const agg = parts.join(", ");
    return `${prefix}${agg}`;
}
function buildNamedComboLookup(combos) {
    const map = {};
    for (const c of combos){
        map[c.id] = c.pipeline;
        const name = c.name?.trim();
        if (name) map[name.toLowerCase()] = c.pipeline;
    }
    return map;
}
function deriveDefaultPlanFromConfig(config, comboId, combos = {}) {
    if (config.enginesExplicit) {
        // Panel-configured: the engines map (via the resolver, which stays header/active-combo
        // aware for Phases 2-3) is authoritative — including an explicit "everything off".
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resolveCompressionPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCompressionPlan"])(config, {
            comboId,
            combos
        });
    }
    // Legacy path: defaultMode carries the effective mode (the engines map is display-only here).
    const legacyMode = config.defaultMode;
    if (legacyMode && legacyMode !== "off") {
        return legacyMode === "stacked" ? {
            mode: legacyMode,
            stackedPipeline: config.stackedPipeline ?? []
        } : {
            mode: legacyMode,
            stackedPipeline: []
        };
    }
    return {
        mode: "off",
        stackedPipeline: []
    };
}
}),
"[project]/open-sse/services/compression/adaptiveCompression/ladder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_LADDER",
    ()=>DEFAULT_LADDER,
    "aggressivenessOf",
    ()=>aggressivenessOf,
    "expectedReductionFactor",
    ()=>expectedReductionFactor
]);
const DEFAULT_LADDER = [
    {
        engine: "session-dedup"
    },
    {
        engine: "rtk",
        intensity: "standard"
    },
    {
        engine: "headroom"
    },
    {
        engine: "lite"
    },
    {
        engine: "caveman",
        intensity: "full"
    },
    {
        engine: "aggressive"
    },
    {
        engine: "ultra"
    }
];
/**
 * Aggressiveness rank used to know where a base plan sits so `floor` mode escalates
 * BEYOND it (design §4.2). Keyed by engine id AND by the equivalent CompressionMode name
 * ("standard" === caveman) so a base plan's `mode` string maps cleanly.
 *
 * Rescaled ×10 vs the original 7-entry scale (#6533) to make room for the novel catalog
 * engines that ship in `open-sse/services/compression/engines/index.ts` but are not part
 * of DEFAULT_LADDER: `ccr` and `llmlingua` are intentionally excluded from the AUTOMATIC
 * ladder (see DEFAULT_LADDER doc comment) yet must still rank correctly when an operator
 * adds them via `ladderOverride` — same for `ionizer`, `relevance`, `llm`, `read-lifecycle`,
 * and `codex-responses`. Placement follows each engine's documented `stackPriority` in
 * `engineCatalog.ts` / its own module header, interpolated onto the existing 7-tier scale
 * (the `lite` exception — ranked after `headroom` despite a lower stackPriority — is a
 * pre-existing, deliberate design call and is left untouched).
 */ const AGGRESSIVENESS = {
    off: 0,
    "session-dedup": 10,
    ccr: 15,
    rtk: 20,
    "codex-responses": 22,
    ionizer: 25,
    headroom: 30,
    lite: 40,
    "read-lifecycle": 42,
    relevance: 45,
    caveman: 50,
    standard: 50,
    stacked: 50,
    aggressive: 60,
    llmlingua: 65,
    llm: 68,
    ultra: 70,
    omniglyph: 80
};
function aggressivenessOf(engineOrMode) {
    return AGGRESSIVENESS[engineOrMode] ?? 0;
}
/**
 * Cheap per-engine EXPECTED reduction factor (output/input). Used by the default injected
 * estimator to model "apply this stage" WITHOUT a dry-run (design §9: no per-stage dry-run
 * in the hot path). Conservative, monotonic with aggressiveness; never 0 (content preserved).
 */ const REDUCTION_FACTOR = {
    "session-dedup": 0.95,
    ccr: 0.9,
    rtk: 0.85,
    "codex-responses": 0.84,
    ionizer: 0.83,
    headroom: 0.8,
    lite: 0.92,
    "read-lifecycle": 0.88,
    relevance: 0.75,
    caveman: 0.7,
    standard: 0.7,
    aggressive: 0.55,
    llmlingua: 0.5,
    llm: 0.45,
    ultra: 0.4,
    omniglyph: 0.35
};
function expectedReductionFactor(engine) {
    return REDUCTION_FACTOR[engine] ?? 0.9;
}
}),
"[project]/open-sse/services/compression/adaptiveCompression/computeTarget.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeTarget",
    ()=>computeTarget
]);
function computeTarget(policy, modelContextLimit, requestMaxTokens, config) {
    if (policy === "absolute") {
        return Math.max(0, Math.floor(config.absoluteBudget));
    }
    if (policy === "percentage") {
        const pct = config.pct > 0 && config.pct <= 1 ? config.pct : 1;
        return Math.max(0, Math.floor(modelContextLimit * pct));
    }
    // reserve-output (default): limit − output reservation − safety margin.
    const reserve = typeof requestMaxTokens === "number" && requestMaxTokens > 0 ? requestMaxTokens : config.outputReserve;
    return Math.max(0, Math.floor(modelContextLimit - reserve - config.safetyMargin));
}
}),
"[project]/open-sse/services/compression/adaptiveCompression/resolveAdaptivePlan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveAdaptivePlan",
    ()=>resolveAdaptivePlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/adaptiveCompression/ladder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$computeTarget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/adaptiveCompression/computeTarget.ts [app-route] (ecmascript)");
;
;
const defaultEstimate = (prior, stage)=>Math.round(prior * (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expectedReductionFactor"])(stage.engine));
function resolveAdaptivePlan(input) {
    const { basePlan, estimatedTokens, modelContextLimit, requestMaxTokens, config } = input;
    const estimate = input.estimate ?? defaultEstimate;
    if (config.mode === "off") return {
        plan: basePlan,
        telemetry: null
    };
    if (!modelContextLimit || modelContextLimit <= 0) {
        return {
            plan: basePlan,
            telemetry: null
        }; // unknown limit → skip (D-C / §6)
    }
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$computeTarget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeTarget"])(config.policy, modelContextLimit, requestMaxTokens, config);
    const headroomBefore = target - estimatedTokens;
    // replace-autotrigger only acts on a bare Default/off base plan; an explicit choice wins.
    const baseRank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggressivenessOf"])(basePlan.mode);
    if (config.mode === "replace-autotrigger" && baseRank > (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggressivenessOf"])("off")) {
        return {
            plan: basePlan,
            telemetry: {
                policy: config.policy,
                target,
                headroomBefore,
                stagesApplied: [],
                headroomAfter: headroomBefore,
                fit: headroomBefore >= 0
            }
        };
    }
    // Already fits → never over-compress (D-C2).
    if (headroomBefore >= 0) {
        return {
            plan: basePlan,
            telemetry: {
                policy: config.policy,
                target,
                headroomBefore,
                stagesApplied: [],
                headroomAfter: headroomBefore,
                fit: true
            }
        };
    }
    // Escalation: start just ABOVE the base plan's aggressiveness (floor escalates beyond it).
    const ladder = config.ladderOverride && config.ladderOverride.length > 0 ? config.ladderOverride : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_LADDER"];
    const startTier = config.mode === "floor" ? baseRank : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggressivenessOf"])("off");
    const stages = ladder.filter((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$ladder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggressivenessOf"])(s.engine) > startTier);
    let current = estimatedTokens;
    const applied = [];
    for (const stage of stages){
        current = estimate(current, stage);
        applied.push(stage);
        if (current <= target) break;
    }
    const headroomAfter = target - current;
    const fit = headroomAfter >= 0;
    return {
        plan: planFromStages(basePlan, applied),
        telemetry: {
            policy: config.policy,
            target,
            headroomBefore,
            stagesApplied: applied.map((s)=>s.engine),
            headroomAfter,
            fit
        }
    };
}
/**
 * Turn the applied ladder stages into a DerivedPlan. A single applied stage that is a
 * single-mode engine collapses to that engine's mode; otherwise a stacked pipeline.
 * The base plan's own pipeline is preserved as the prefix (floor escalates AFTER the base).
 */ function planFromStages(basePlan, applied) {
    if (applied.length === 0) return basePlan;
    const basePipeline = basePlan.mode === "stacked" ? basePlan.stackedPipeline : [];
    const stackedPipeline = [
        ...basePipeline,
        ...applied
    ];
    return {
        mode: "stacked",
        stackedPipeline
    };
}
}),
"[project]/open-sse/services/compression/riskGate/riskPatterns.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Risk-gate pattern catalog. Every variable-length pattern uses bounded
 * quantifiers (`{0,N}`) to prevent catastrophic backtracking (ReDoS) on
 * untrusted input. Patterns are ours (not agent-supplied), so safe-regex is not
 * required — boundedness is verified by an adversarial-input test.
 */ __turbopack_context__.s([
    "MAX_PEM_LEN",
    ()=>MAX_PEM_LEN,
    "RISK_PATTERNS",
    ()=>RISK_PATTERNS,
    "SELF_EVIDENT",
    ()=>SELF_EVIDENT
]);
const MAX_PEM_LEN = 4096;
const SELF_EVIDENT = new Set([
    "private_key",
    "k8s_secret",
    "db_migration"
]);
const RISK_PATTERNS = [
    {
        category: "private_key",
        regex: new RegExp(`-----BEGIN [A-Z0-9 ]{0,40}PRIVATE KEY-----[\\s\\S]{1,${MAX_PEM_LEN}}?-----END [A-Z0-9 ]{0,40}PRIVATE KEY-----`, "g")
    },
    {
        category: "secret_assignment",
        regex: /\b(?:api[_-]?key|secret|token|password|passwd|bearer|authorization|client[_-]?secret)\b[ \t]{0,20}[:=][ \t]{0,20}["']?[A-Za-z0-9._\-+/]{8,200}/gi
    },
    {
        category: "stack_trace",
        regex: /^\s{0,8}(?:at\s+\S.{0,300}|File ".{1,300}", line \d{1,9}|Traceback \(most recent call last\):|[A-Za-z_.]{1,80}(?:Error|Exception):.{0,300})$/gm
    },
    {
        // Single DDL hit; the ">=2 DDL" promotion rule is enforced in riskGate.ts.
        category: "db_migration",
        regex: /\b(?:CREATE|ALTER|DROP)\s+(?:TABLE|INDEX|SCHEMA|DATABASE|COLUMN)\b/gi
    },
    {
        category: "legal",
        regex: /\bWITHOUT WARRANTY\b|\bPermission is hereby granted\b|^SPDX-License-Identifier:.{0,200}$|\bCopyright \(c\)\b|\bAll rights reserved\b/gim
    }
];
}),
"[project]/open-sse/services/compression/riskGate/riskGate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectRiskSpans",
    ()=>detectRiskSpans
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/riskGate/riskPatterns.ts [app-route] (ecmascript)");
;
const SHORT_SECTION = 200;
const MIN_DDL = 2;
const VCS_LINE = /^(?:commit [0-9a-f]{7,40}|diff --git |@@ |[+-]{3} )/m;
const DIFF_HUNK_LINE = /^[+-]/;
function isLikelyVcsContext(text) {
    return VCS_LINE.test(text);
}
/** Collect raw regex hits for enabled categories (no guards yet). */ function collectRegexHits(text, enabled) {
    const hits = [];
    for (const { category, regex } of __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RISK_PATTERNS"]){
        if (!enabled.has(category)) continue;
        regex.lastIndex = 0;
        let m;
        while((m = regex.exec(text)) !== null){
            if (m[0].length === 0) {
                regex.lastIndex++;
                continue;
            }
            hits.push({
                start: m.index,
                end: m.index + m[0].length,
                category
            });
        }
    }
    return hits;
}
/** True when the hit's line starts with a diff marker (`+`/`-`). */ function inDiffHunk(text, start) {
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    return DIFF_HUNK_LINE.test(text.slice(lineStart, lineStart + 1));
}
/** Structural k8s Secret detector: a YAML doc carrying `kind: Secret` + `data:`. */ function detectK8sSecret(text) {
    const hits = [];
    const kindRe = /^kind:[ \t]*Secret\b/gm;
    let m;
    while((m = kindRe.exec(text)) !== null){
        // Document boundaries: nearest `---`/start before, nearest `---`/end after.
        const prevSep = text.lastIndexOf("\n---", m.index);
        const docStart = prevSep === -1 ? 0 : prevSep + 1;
        const nextSep = text.indexOf("\n---", m.index);
        const docEnd = nextSep === -1 ? text.length : nextSep + 1;
        const doc = text.slice(docStart, docEnd);
        if (/^\s*(?:data|stringData):/m.test(doc)) {
            hits.push({
                start: docStart,
                end: docEnd,
                category: "k8s_secret"
            });
        }
    }
    return hits;
}
function mergeSpans(spans) {
    if (spans.length <= 1) return spans;
    const sorted = [
        ...spans
    ].sort((a, b)=>a.start - b.start);
    const out = [
        sorted[0]
    ];
    for(let i = 1; i < sorted.length; i++){
        const last = out[out.length - 1];
        const cur = sorted[i];
        if (cur.start <= last.end) {
            last.end = Math.max(last.end, cur.end);
        } else {
            out.push(cur);
        }
    }
    return out;
}
function detectRiskSpans(text, cfg) {
    try {
        if (!cfg.enabled) return [];
        if (!text) return [];
        const enabled = new Set(cfg.categories?.length ? cfg.categories : [
            "stack_trace",
            "private_key",
            "secret_assignment",
            "k8s_secret",
            "db_migration",
            "legal"
        ]);
        const vcs = isLikelyVcsContext(text);
        const regexHits = collectRegexHits(text, enabled);
        const k8sHits = enabled.has("k8s_secret") ? detectK8sSecret(text) : [];
        // db_migration: require >=MIN_DDL hits; drop those inside a diff hunk.
        const ddl = regexHits.filter((h)=>h.category === "db_migration" && !(vcs && inDiffHunk(text, h.start)));
        const ddlPromoted = ddl.length >= MIN_DDL ? [
            {
                start: ddl[0].start,
                end: ddl[ddl.length - 1].end,
                category: "db_migration"
            }
        ] : [];
        // Guarded categories: secret_assignment, stack_trace, legal.
        const guarded = regexHits.filter((h)=>h.category === "secret_assignment" || h.category === "stack_trace" || h.category === "legal");
        // private_key is the only regex-hit self-evident category; k8s_secret and
        // db_migration self-promote via their own structural paths below.
        const selfEvident = regexHits.filter((h)=>h.category === "private_key");
        // Count corroborating signals (self-evident + promoted-ddl + k8s + guarded).
        const signalCount = selfEvident.length + (ddlPromoted.length ? 1 : 0) + k8sHits.length + guarded.length;
        const shortSection = !vcs && text.length < SHORT_SECTION;
        const guardedPromoted = signalCount >= 2 || shortSection ? guarded : [];
        const promoted = [
            ...selfEvident.map((h)=>({
                    start: h.start,
                    end: h.end,
                    category: h.category
                })),
            ...k8sHits.map((h)=>({
                    start: h.start,
                    end: h.end,
                    category: h.category
                })),
            ...ddlPromoted,
            ...guardedPromoted.map((h)=>({
                    start: h.start,
                    end: h.end,
                    category: h.category
                }))
        ];
        return mergeSpans(promoted);
    } catch  {
        return [];
    }
}
}),
"[project]/open-sse/services/compression/riskGate/riskGateStep.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyRiskMask",
    ()=>applyRiskMask,
    "restoreRiskBlocks",
    ()=>restoreRiskBlocks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/riskGate/riskGate.ts [app-route] (ecmascript)");
;
;
/** Mask one content string; returns masked text + blocks + per-category counts. */ function maskString(text, cfg, tally) {
    const spans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectRiskSpans"])(text, cfg);
    if (!spans.length) return {
        masked: text,
        blocks: []
    };
    for (const s of spans)tally[s.category] = (tally[s.category] ?? 0) + 1;
    const { text: masked, blocks } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preserveSpans"])(text, spans.map((s)=>({
            start: s.start,
            end: s.end,
            kind: `risk_${s.category}`
        })));
    return {
        masked,
        blocks
    };
}
function applyRiskMask(body, cfg) {
    const tally = {};
    const allBlocks = [];
    const messages = body.messages;
    if (!Array.isArray(messages)) {
        return {
            maskedBody: body,
            blocks: [],
            stats: {
                spansProtected: 0,
                categories: {}
            }
        };
    }
    let changed = false;
    const maskedMessages = messages.map((msg)=>{
        const m = msg;
        if (typeof m.content === "string") {
            const { masked, blocks } = maskString(m.content, cfg, tally);
            if (!blocks.length) return msg;
            changed = true;
            allBlocks.push(...blocks);
            return {
                ...m,
                content: masked
            };
        }
        if (Array.isArray(m.content)) {
            let partChanged = false;
            const parts = m.content.map((p)=>{
                if (p && p.type === "text" && typeof p.text === "string") {
                    const { masked, blocks } = maskString(p.text, cfg, tally);
                    if (!blocks.length) return p;
                    partChanged = true;
                    allBlocks.push(...blocks);
                    return {
                        ...p,
                        text: masked
                    };
                }
                return p;
            });
            if (!partChanged) return msg;
            changed = true;
            return {
                ...m,
                content: parts
            };
        }
        return msg;
    });
    const maskedBody = changed ? {
        ...body,
        messages: maskedMessages
    } : body;
    return {
        maskedBody,
        blocks: allBlocks,
        stats: {
            spansProtected: allBlocks.length,
            categories: tally
        }
    };
}
function restoreRiskBlocks(body, blocks) {
    if (!blocks.length) return body;
    const messages = body.messages;
    if (!Array.isArray(messages)) return body;
    const restoreParts = (content)=>{
        if (typeof content === "string") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePreservedBlocks"])(content, blocks);
        if (Array.isArray(content)) {
            return content.map((p)=>p && p.type === "text" && typeof p.text === "string" ? {
                    ...p,
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restorePreservedBlocks"])(p.text, blocks)
                } : p);
        }
        return content;
    };
    return {
        ...body,
        messages: messages.map((msg)=>{
            const m = msg;
            if (typeof m.content === "string" || Array.isArray(m.content)) {
                return {
                    ...m,
                    content: restoreParts(m.content)
                };
            }
            return msg;
        })
    };
}
}),
"[project]/open-sse/services/compression/riskGate/strategyWrap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveRiskGate",
    ()=>resolveRiskGate,
    "withRiskGate",
    ()=>withRiskGate,
    "withRiskGateAsync",
    ()=>withRiskGateAsync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskGateStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/riskGate/riskGateStep.ts [app-route] (ecmascript)");
;
function resolveRiskGate(options) {
    const rg = options?.riskGate ?? options?.config?.riskGate;
    return rg?.enabled ? rg : undefined;
}
function attach(result, mask) {
    if (mask.blocks.length) result.body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskGateStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restoreRiskBlocks"])(result.body, mask.blocks);
    if (result.stats) result.stats.riskGate = mask.stats;
    return result;
}
function withRiskGate(body, riskGate, run) {
    if (!riskGate) return run(body);
    const mask = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskGateStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyRiskMask"])(body, riskGate);
    return attach(run(mask.maskedBody), mask);
}
async function withRiskGateAsync(body, riskGate, run) {
    if (!riskGate) return run(body);
    const mask = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$riskGateStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyRiskMask"])(body, riskGate);
    return attach(await run(mask.maskedBody), mask);
}
}),
"[project]/open-sse/services/compression/quantumLock/quantumPatterns.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * QuantumLock leaf module: category enum, span/config/stats types, constants, and the
 * fixed-order, ReDoS-bounded detection patterns. No imports — keeps every consumer one-way
 * (cycle-safe). See docs/superpowers/specs/2026-06-28-compression-quantumlock-design.md.
 */ __turbopack_context__.s([
    "QUANTUM_PATTERNS",
    ()=>QUANTUM_PATTERNS,
    "TAIL_DELIM",
    ()=>TAIL_DELIM,
    "placeholderFor",
    ()=>placeholderFor
]);
const TAIL_DELIM = "⟦QUANTUMLOCK⟧";
const placeholderFor = (i)=>`⟦Q${i}⟧`;
const QUANTUM_PATTERNS = [
    // JWTs start with base64url of `{"` → "eyJ". Run first so the whole token wins.
    // Trailing negative-lookahead (not \b): a JWT signature can END in base64url `-`/`_`,
    // where \b would misfire (it needs a following word char) and let the token escape detection.
    {
        category: "jwt",
        pattern: /\beyJ[A-Za-z0-9_-]{8,512}\.[A-Za-z0-9_-]{8,512}\.[A-Za-z0-9_-]{8,512}(?![A-Za-z0-9_-])/g
    },
    // Prefixed API keys (stripe/github/slack shapes).
    {
        category: "api_key_shape",
        pattern: /\b(?:sk|pk|rk|ghp|gho|xox[baprs])[-_][A-Za-z0-9]{16,200}\b/g
    },
    // Bearer tokens. Bounded whitespace ([ \t]{1,4}) per the file convention (no unbounded \s+).
    {
        category: "api_key_shape",
        pattern: /\bBearer[ \t]{1,4}[A-Za-z0-9._-]{16,400}\b/g
    },
    // Canonical UUID. Runs before long_hex so its inner hex is not re-claimed.
    {
        category: "uuid",
        pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
    },
    // Correlation / request ids.
    {
        category: "request_id",
        pattern: /\b(?:req|trace|span|corr|request)[-_][A-Za-z0-9]{6,128}\b/gi
    },
    // Digests / SHAs. After uuid/jwt so it never eats their inner hex.
    {
        category: "long_hex",
        pattern: /\b[0-9a-f]{16,128}\b/gi
    },
    // 10- or 13-digit unix epoch in the 2001–2033 window (leading 1). LAST so it never
    // fragments a longer token already claimed above.
    {
        category: "unix_ts",
        pattern: /\b1[0-9]{9}(?:[0-9]{3})?\b/g
    }
];
}),
"[project]/open-sse/services/compression/quantumLock/quantumLock.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectVolatileSpans",
    ()=>detectVolatileSpans
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/quantumPatterns.ts [app-route] (ecmascript)");
;
function detectVolatileSpans(text, cfg) {
    if (!text) return [];
    const allow = cfg.categories && cfg.categories.length > 0 ? new Set(cfg.categories) : null;
    const raw = [];
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["QUANTUM_PATTERNS"].forEach(({ category, pattern }, prio)=>{
            if (allow && !allow.has(category)) return;
            pattern.lastIndex = 0;
            let m;
            while((m = pattern.exec(text)) !== null){
                if (m[0].length === 0) {
                    pattern.lastIndex++;
                    continue;
                }
                raw.push({
                    start: m.index,
                    end: m.index + m[0].length,
                    category,
                    prio
                });
            }
        });
    } catch  {
        return [];
    }
    raw.sort((a, b)=>a.start - b.start || b.end - a.end || a.prio - b.prio);
    // Greedy non-overlapping sweep: accept a span only if it starts at/after the last accepted
    // span's end. A nested or PARTIALLY-overlapping span is dropped whole (never split) — this is
    // always SAFE (it can only under-stabilize, never corrupt text or shift placeholder numbering).
    // With the current `\b`-anchored patterns true partial overlaps are unreachable; the drop rule
    // is the conservative default if a future pattern can produce one.
    const merged = [];
    let lastEnd = -1;
    for (const s of raw){
        if (s.start >= lastEnd) {
            merged.push({
                start: s.start,
                end: s.end,
                category: s.category
            });
            lastEnd = s.end;
        }
    }
    return merged;
}
}),
"[project]/open-sse/services/compression/quantumLock/quantumLockStep.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyQuantumLock",
    ()=>applyQuantumLock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/quantumLock.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/quantumPatterns.ts [app-route] (ecmascript)");
;
;
/**
 * Fresh zero-stats per call. NOT a shared singleton on purpose: `applyQuantumLock` is a public
 * export and `categories` is mutable, so returning one shared object would let a stats-aggregating
 * caller corrupt the no-op result for every subsequent call in the process.
 */ const emptyStats = ()=>({
        fragments: 0,
        categories: {}
    });
function isRecord(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
/** v1 stabilizes string-content system messages only. Array/multimodal ⇒ no-op (follow-up). */ function systemTextOf(msg) {
    return typeof msg.content === "string" ? msg.content : "";
}
function applyQuantumLock(body, cfg, _ctx) {
    const messages = body.messages;
    if (!Array.isArray(messages)) return {
        body,
        stats: emptyStats()
    };
    const idx = messages.findIndex((m)=>isRecord(m) && m.role === "system");
    if (idx === -1) return {
        body,
        stats: emptyStats()
    };
    const sys = messages[idx];
    const text = systemTextOf(sys);
    if (!text) return {
        body,
        stats: emptyStats()
    };
    if (text.includes(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TAIL_DELIM"])) return {
        body,
        stats: emptyStats()
    }; // idempotency
    const spans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectVolatileSpans"])(text, cfg);
    if (spans.length === 0) return {
        body,
        stats: emptyStats()
    };
    let out = "";
    let cursor = 0;
    const values = [];
    const categories = {};
    spans.forEach((span, i)=>{
        out += text.slice(cursor, span.start) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["placeholderFor"])(i);
        values.push(text.slice(span.start, span.end));
        categories[span.category] = (categories[span.category] ?? 0) + 1;
        cursor = span.end;
    });
    out += text.slice(cursor);
    const tail = `\n\n${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TAIL_DELIM"]}\n${values.map((v, i)=>`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumPatterns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["placeholderFor"])(i)}=${v}`).join("\n")}`;
    const newMessages = messages.slice();
    newMessages[idx] = {
        ...sys,
        content: out + tail
    };
    return {
        body: {
            ...body,
            messages: newMessages
        },
        stats: {
            fragments: values.length,
            categories
        }
    };
}
}),
"[project]/open-sse/services/compression/quantumLock/strategyWrap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "quantumCachingContext",
    ()=>quantumCachingContext,
    "resolveQuantumLock",
    ()=>resolveQuantumLock,
    "withQuantumLock",
    ()=>withQuantumLock,
    "withQuantumLockAsync",
    ()=>withQuantumLockAsync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cachingAware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLockStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/quantumLockStep.ts [app-route] (ecmascript)");
;
;
function resolveQuantumLock(options) {
    const ql = options?.config?.quantumLock;
    return ql?.enabled ? ql : undefined;
}
function quantumCachingContext(body, options) {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCachingContext"])(body, options?.cachingContext ?? {
        model: options?.model
    });
    return {
        isCachingProvider: ctx.isCachingProvider
    };
}
/** Attach QuantumLock stats to a result, creating a minimal stats carrier when needed. */ function attachQuantumLockStats(result, qlStats) {
    if (result.stats) {
        result.stats.quantumLock = qlStats;
        return result;
    }
    // Downstream compression produced no stats (e.g. message too short to compress).
    // Create a passthrough carrier so the quantumLock field is not lost.
    const carrier = {
        originalTokens: 0,
        compressedTokens: 0,
        savingsPercent: 0,
        techniquesUsed: [
            "quantum-lock"
        ],
        mode: "off",
        timestamp: Date.now(),
        quantumLock: qlStats
    };
    return {
        ...result,
        stats: carrier
    };
}
function withQuantumLock(body, ql, ctx, run) {
    if (!ql || !ctx.isCachingProvider) return run(body);
    const { body: locked, stats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLockStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyQuantumLock"])(body, ql, ctx);
    const result = run(locked);
    if (stats.fragments > 0) return attachQuantumLockStats(result, stats);
    return result;
}
async function withQuantumLockAsync(body, ql, ctx, run) {
    if (!ql || !ctx.isCachingProvider) return run(body);
    const { body: locked, stats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLockStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyQuantumLock"])(body, ql, ctx);
    const result = await run(locked);
    if (stats.fragments > 0) return attachQuantumLockStats(result, stats);
    return result;
}
}),
"[project]/open-sse/services/compression/quantumLock/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/quantumLock.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$quantumLockStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/quantumLockStep.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/strategyWrap.ts [app-route] (ecmascript)");
;
;
;
;
}),
"[project]/open-sse/services/compression/entrypointWrap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withCompressionEntrypointGuards",
    ()=>withCompressionEntrypointGuards,
    "withCompressionEntrypointGuardsAsync",
    ()=>withCompressionEntrypointGuardsAsync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/riskGate/strategyWrap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/quantumLock/strategyWrap.ts [app-route] (ecmascript)");
;
;
function withCompressionEntrypointGuards(body, options, run) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withQuantumLock"])(body, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveQuantumLock"])(options), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quantumCachingContext"])(body, options), (quantumBody)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withRiskGate"])(quantumBody, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRiskGate"])(options), (riskBody)=>run(riskBody)));
}
function withCompressionEntrypointGuardsAsync(body, options, run) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withQuantumLockAsync"])(body, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveQuantumLock"])(options), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$quantumLock$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quantumCachingContext"])(body, options), run);
}
}),
"[project]/open-sse/services/compression/resultMemo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MEMO_CAP",
    ()=>MEMO_CAP,
    "clearMemoStore",
    ()=>clearMemoStore,
    "isDeterministicMode",
    ()=>isDeterministicMode,
    "makeMemoKey",
    ()=>makeMemoKey,
    "memoLookup",
    ()=>memoLookup,
    "memoStore",
    ()=>memoStore
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const MEMO_CAP = 5_000;
const memoMap = new Map();
// Opt-IN whitelist (NOT opt-out): cache only engines proven pure + STATELESS across
// requests. Excluded on purpose: `ccr` and `session-dedup` write to the cross-request
// CCR store (`ccr/index.ts` ccrStore; session-dedup imports storeBlock), so their output
// depends on prior state → not safe to memoize; `ultra`/`aggressive`/`llmlingua` are
// model-backed/non-deterministic. Any NEW engine is excluded until explicitly vetted.
// "omniglyph" is intentionally excluded too (P2 registry-consistency pass): it renders
// context as an image via a model-backed pipeline, so it is not yet proven deterministic
// across requests — conservative default (never-wrong) until explicitly vetted.
const DETERMINISTIC_ENGINES = new Set([
    "lite",
    "caveman",
    "rtk"
]);
/** Top-level modes safe to cache (whitelist — any unknown/new mode defaults to false).
 * "omniglyph" intentionally omitted — see comment on DETERMINISTIC_ENGINES above. */ const DETERMINISTIC_MODES = new Set([
    "lite",
    "standard",
    "rtk"
]);
function isDeterministicMode(mode, config) {
    if (mode === "stacked") {
        const pipeline = config?.stackedPipeline;
        if (!pipeline || pipeline.length === 0) return false;
        return pipeline.every((step)=>DETERMINISTIC_ENGINES.has(step.engine));
    }
    return DETERMINISTIC_MODES.has(mode);
}
function sha256hex(text) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(text).digest("hex");
}
function makeMemoKey(body, mode, config, principalId, model, supportsVision) {
    const bodyHash = sha256hex(JSON.stringify(body));
    // #8137: Only include model + supportsVision in the cache key when the compression
    // result actually depends on them. The `lite` engine strips data:image URLs only when
    // vision is unsupported (replaceImageUrls / modelSupportsVision), so the same (body,
    // config) yields a DIFFERENT result per target — omitting them would return a wrong
    // (image-stripped or image-kept) cached body across vision/non-vision targets.
    //
    // For all other deterministic engines (caveman, rtk), the output is model-independent.
    // Including model in the key defeats memoization across combo retries — the body is
    // identical but the model changes each attempt, producing a fresh cache miss every time
    // and re-running the full compression pipeline 5-8x per request.
    const isVisionDependent = usesVisionDependentEngine(mode, config);
    return sha256hex(JSON.stringify({
        bodyHash,
        mode,
        config,
        principalId: principalId ?? null,
        model: isVisionDependent ? model ?? null : null,
        supportsVision: isVisionDependent ? supportsVision ?? null : null
    }));
}
/**
 * Whether the compression pipeline for this mode/config includes the `lite` engine,
 * whose output depends on the target's vision support (image-URL stripping).
 * Only `lite` itself, `standard` (lite → caveman), and `stacked` pipelines containing
 * a `lite` step are vision-dependent.
 */ function usesVisionDependentEngine(mode, config) {
    if (mode === "lite") return true;
    if (mode === "standard") return true; // standard = lite → caveman pipeline
    if (mode === "stacked") {
        const pipeline = config?.stackedPipeline;
        if (!pipeline || pipeline.length === 0) return false;
        return pipeline.some((step)=>step.engine === "lite");
    }
    return false;
}
function boundedSet(key, value) {
    if (!memoMap.has(key) && memoMap.size >= MEMO_CAP) {
        const firstKey = memoMap.keys().next().value;
        if (firstKey !== undefined) {
            memoMap.delete(firstKey);
        }
    }
    memoMap.set(key, value);
}
function memoLookup(key) {
    const hit = memoMap.get(key);
    if (!hit) return null;
    // Return a clone so downstream mutation cannot corrupt the cached value.
    return JSON.parse(JSON.stringify(hit));
}
function memoStore(key, result) {
    // Clone on STORE too (memoLookup already clones on read). Storing the caller's live
    // object would let a later mutation of it (e.g. an async engine holding a sub-ref)
    // corrupt the cached entry. Both ends isolated ⇒ the cache is immutable once stored.
    boundedSet(key, JSON.parse(JSON.stringify(result)));
}
function clearMemoStore() {
    memoMap.clear();
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
"[project]/open-sse/services/compression/prefixFreeze.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PREFIX_FREEZE",
    ()=>DEFAULT_PREFIX_FREEZE,
    "MAX_PREFIX_ENTRIES",
    ()=>MAX_PREFIX_ENTRIES,
    "extractStablePrefixHash",
    ()=>extractStablePrefixHash,
    "getPrefixObservations",
    ()=>getPrefixObservations,
    "isPrefixFrozen",
    ()=>isPrefixFrozen,
    "observePrefix",
    ()=>observePrefix,
    "resetPrefixFreeze",
    ()=>resetPrefixFreeze,
    "resolvePrefixFreezeConfig",
    ()=>resolvePrefixFreezeConfig
]);
/**
 * T08/H5 — usage-observed prefix freeze (gaps v3.8.42; opt-in, default OFF).
 *
 * Augments the static cache-aware heuristic (`getCacheAwareStrategy`). Instead of only freezing the
 * system prompt for providers the static check knows to cache, it OBSERVES which system prompts
 * actually recur across requests and, once one has been seen `>= threshold` times, treats it as a
 * stable cacheable prefix to preserve — even for a provider the static check does not recognize.
 *
 * Content-addressed by a hash of the system prompt (no principal needed): a "freeze" only
 * *preserves* the prefix from compression, which never corrupts a payload and is safe to share
 * across tenants. In-memory + bounded, zero DB/IO. Default OFF
 * (`COMPRESSION_PREFIX_FREEZE_ENABLED`); when off the observer is never consulted (zero cost).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const DEFAULT_PREFIX_FREEZE = {
    enabled: false,
    threshold: 3
};
const MAX_PREFIX_ENTRIES = 5_000;
const observations = new Map();
function boundedInc(hash) {
    if (!observations.has(hash) && observations.size >= MAX_PREFIX_ENTRIES) {
        const oldest = observations.keys().next().value;
        if (oldest !== undefined) observations.delete(oldest);
    }
    observations.set(hash, (observations.get(hash) ?? 0) + 1);
}
function toPositiveInt(raw, fallback) {
    if (raw === undefined) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}
function resolvePrefixFreezeConfig(env = process.env) {
    return {
        enabled: env.COMPRESSION_PREFIX_FREEZE_ENABLED === "true",
        threshold: toPositiveInt(env.COMPRESSION_PREFIX_FREEZE_THRESHOLD, DEFAULT_PREFIX_FREEZE.threshold)
    };
}
// ─── prefix extraction ──────────────────────────────────────────────────────────
function isRecord(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
/**
 * Pull plain text out of the system-prompt shapes: `string`, `Array<…>`, `{text}` (OpenAI/Claude
 * text parts), and `{parts: [...]}` (Gemini `systemInstruction`).
 */ function collectText(value, out) {
    if (typeof value === "string") {
        if (value.trim()) out.push(value);
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value)collectText(item, out);
        return;
    }
    if (isRecord(value)) {
        if (typeof value.text === "string" && value.text.trim()) out.push(value.text);
        if (value.parts !== undefined) collectText(value.parts, out); // Gemini systemInstruction
    }
}
function extractStablePrefixHash(body) {
    if (!isRecord(body)) return null;
    const parts = [];
    collectText(body.system, parts);
    collectText(body.systemInstruction, parts);
    collectText(body.system_instruction, parts);
    const messages = body.messages;
    if (Array.isArray(messages)) {
        for (const msg of messages){
            if (isRecord(msg) && msg.role === "system") collectText(msg.content, parts);
        }
    }
    if (parts.length === 0) return null;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 24);
}
function observePrefix(hash) {
    boundedInc(hash);
}
function isPrefixFrozen(hash, threshold) {
    return (observations.get(hash) ?? 0) >= threshold;
}
function getPrefixObservations(hash) {
    return observations.get(hash) ?? 0;
}
function resetPrefixFreeze() {
    observations.clear();
}
}),
"[project]/open-sse/services/compression/cacheAwareConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveCacheAwareConfig",
    ()=>resolveCacheAwareConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cachingAware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preserveSystemPromptMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preserveSystemPromptMode.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$prefixFreeze$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/prefixFreeze.ts [app-route] (ecmascript)");
;
;
;
/**
 * T08/H5 — augment the static cache signal with usage-observed prefix freeze. Opt-in
 * (default off): when a system prompt has recurred `>= threshold` times, treat it as a stable
 * cacheable prefix to preserve even for a provider the static check does not flag as caching.
 * "Freeze" only *preserves* the prefix, so it never corrupts a payload.
 */ function observeAndCheckPrefixFreeze(body) {
    const cfg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$prefixFreeze$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePrefixFreezeConfig"])();
    if (!cfg.enabled) return false;
    const hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$prefixFreeze$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractStablePrefixHash"])(body);
    if (!hash) return false;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$prefixFreeze$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["observePrefix"])(hash);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$prefixFreeze$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPrefixFrozen"])(hash, cfg.threshold);
}
function resolveCacheAwareConfig(config, body, context) {
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preserveSystemPromptMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePreserveSystemPromptMode"])(config);
    // No request body → no cacheable prefix to detect; honor the mode at its no-cache baseline.
    // The signal is the static caching heuristic OR (H5, opt-in) a usage-observed stable prefix.
    const staticCache = body ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCacheAwareStrategy"])(config.defaultMode, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCachingContext"])(body, context)).skipSystemPrompt : false;
    const hasCache = staticCache || (body ? observeAndCheckPrefixFreeze(body) : false);
    const effective = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preserveSystemPromptMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePreserveSystemPrompt"])(mode, {
        hasCache
    });
    if (effective === config.preserveSystemPrompt) return config;
    return {
        ...config,
        preserveSystemPrompt: effective
    };
}
}),
"[project]/open-sse/services/compression/strategySelector.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "activeComboResolves",
    ()=>activeComboResolves,
    "applyCompression",
    ()=>applyCompression,
    "applyCompressionAsync",
    ()=>applyCompressionAsync,
    "applyStackedCompression",
    ()=>applyStackedCompression,
    "applyStackedCompressionAsync",
    ()=>applyStackedCompressionAsync,
    "checkComboOverride",
    ()=>checkComboOverride,
    "enginesMapDerivesStackedPipeline",
    ()=>enginesMapDerivesStackedPipeline,
    "getEffectiveMode",
    ()=>getEffectiveMode,
    "selectCompressionPlan",
    ()=>selectCompressionPlan,
    "selectCompressionStrategy",
    ()=>selectCompressionStrategy,
    "shouldAutoTrigger",
    ()=>shouldAutoTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$hardBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/hardBudget.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$fidelityGateStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/fidelityGateStep.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/lite.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/caveman.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$aggressive$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/aggressive.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultra$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/ultra.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineGuards$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/pipelineGuards.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/pipelineEngineBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stackedStepCore.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stepDetailConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/stepDetailConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/registry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$codexResponses$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/codexResponses/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$omniglyphSingleMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/omniglyphSingleMode.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/rtk/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/bodyAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cachingAware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resolveCompressionPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/resolveCompressionPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/deriveDefaultPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/planResolution.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$resolveAdaptivePlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/adaptiveCompression/resolveAdaptivePlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/riskGate/strategyWrap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$entrypointWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/entrypointWrap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/resultMemo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cacheAwareConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cacheAwareConfig.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$omniglyphSingleMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$omniglyphSingleMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function checkComboOverride(config, comboId) {
    if (!comboId || !config.comboOverrides) return null;
    return config.comboOverrides[comboId] ?? null;
}
function shouldAutoTrigger(config, estimatedTokens) {
    return config.autoTriggerTokens > 0 && estimatedTokens >= config.autoTriggerTokens;
}
/**
 * Resolves the effective compression plan (mode + derived stacked pipeline) WITHOUT
 * the caching-aware mode adjustment (that is layered on by {@link selectCompressionPlan}).
 *
 * Precedence — preserved from the historical {@link getEffectiveMode} ordering:
 *   1. master off                     → off
 *   2. routing-combo override (comboId)→ that mode (resolver honors it via ctx.comboId)
 *   3. active named profile (Phase 2)  → that combo's stacked pipeline (manual operator choice)
 *   4. auto-trigger (large prompt)     → autoTriggerMode, BEFORE the plain derived default
 *   5. derived default                 → resolveCompressionPlan (engines map → mode/pipeline)
 *
 * Step 3 is an EXPLICIT operator selection (`config.activeComboId` resolved against the
 * `combos` map): it beats auto-trigger (a manual choice outranks automatic escalation) but
 * stays below a routing-combo override (route-scoped is more specific). Step 4 mirrors the
 * historical behaviour: auto-trigger precedes the plain derived default but never a routing
 * override.
 *
 * `combos` defaults to `{}` so Phase-1 callers are unchanged; when supplied, chatCore passes
 * its DB-loaded named-combo map so the active profile can resolve here purely (no DB import).
 */ /** True when the adaptive resolver owns automatic-by-size escalation (D-C4). */ function adaptiveEnabled(config) {
    const mode = config.contextBudget?.mode;
    return mode === "floor" || mode === "replace-autotrigger";
}
function resolveBasePlan(config, comboId, estimatedTokens, combos = {}, header = null) {
    if (!config.enabled) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSource"])({
        mode: "off",
        stackedPipeline: []
    }, "off");
    // Phase 3: an explicit, recognized header wins over every operator layer (Decision B).
    // The master switch above is the hard kill: a header cannot turn compression on.
    if (header) {
        const fromHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planFromHeader"])(config, header, combos);
        if (fromHeader) return fromHeader; // already tagged "request-header"
    }
    const comboMode = checkComboOverride(config, comboId);
    if (comboMode) {
        // A routing-combo "stacked" override still wants the configured stacked pipeline,
        // so route it through the resolver (which reads config.stackedPipeline for stacked).
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSource"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resolveCompressionPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCompressionPlan"])(config, {
            comboId,
            combos
        }), "routing-override");
    }
    // Active profile: an EXPLICIT operator choice. Resolves regardless of enginesExplicit and
    // above auto-trigger (manual choice beats automatic escalation), but below a routing-combo
    // override (route-scoped is more specific).
    if (config.activeComboId && combos[config.activeComboId]) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSource"])({
            mode: "stacked",
            stackedPipeline: combos[config.activeComboId]
        }, "active-profile");
    }
    if (!adaptiveEnabled(config) && shouldAutoTrigger(config, estimatedTokens)) {
        const mode = config.autoTriggerMode ?? "lite";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSource"])(mode === "stacked" ? {
            mode,
            stackedPipeline: config.stackedPipeline ?? []
        } : {
            mode,
            stackedPipeline: []
        }, "auto-trigger");
    }
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveDefaultPlanFromConfig"])(config, comboId, combos);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withSource"])(plan, plan.mode === "off" ? "off" : "default");
}
function enginesMapDerivesStackedPipeline(config) {
    if (!config.enginesExplicit) return false;
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveDefaultPlan"])(config.engines ?? {}, config.enabled !== false);
    return plan.mode === "stacked" && plan.stackedPipeline.length > 0;
}
function activeComboResolves(config, combos = {}) {
    return Boolean(config.activeComboId && combos[config.activeComboId]);
}
function getEffectiveMode(config, comboId, estimatedTokens, combos = {}, header = null) {
    return resolveBasePlan(config, comboId, estimatedTokens, combos, header).mode;
}
function selectCompressionPlan(config, comboId, estimatedTokens, body, context, combos = {}, header = null, adaptiveOptions) {
    let plan = resolveBasePlan(config, comboId, estimatedTokens, combos, header);
    // Adaptive context-budget floor/escalation (D-C4): after the base plan, replacing the
    // (now-bypassed) auto-trigger branch. Pure resolver; chatCore supplies the model limit.
    if (adaptiveEnabled(config) && config.contextBudget) {
        const { plan: adaptivePlan, telemetry } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$resolveAdaptivePlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAdaptivePlan"])({
            basePlan: plan,
            estimatedTokens,
            modelContextLimit: adaptiveOptions?.modelContextLimit ?? null,
            requestMaxTokens: adaptiveOptions?.requestMaxTokens ?? null,
            config: config.contextBudget
        });
        plan = adaptivePlan;
        if (telemetry && adaptiveOptions?.onAdaptive) adaptiveOptions.onAdaptive(telemetry);
    }
    // Apply caching-aware adjustments to the mode if body is provided
    if (body) {
        const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCachingContext"])(body, context);
        const cacheAware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cachingAware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCacheAwareStrategy"])(plan.mode, ctx);
        return {
            ...plan,
            mode: cacheAware.strategy
        }; // ...plan preserves source
    }
    return plan;
}
function selectCompressionStrategy(config, comboId, estimatedTokens, body, context, combos = {}, header = null) {
    return selectCompressionPlan(config, comboId, estimatedTokens, body, context, combos, header).mode;
}
function applyCompression(body, mode, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$entrypointWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withCompressionEntrypointGuards"])(body, options, (b)=>runCompression(b, mode, options));
}
function runCompression(body, mode, options) {
    if (mode === "off") {
        return {
            body,
            compressed: false,
            stats: null
        };
    }
    if (options?.config?.memoizeCompressionResults === true && // Only memoize for an explicit principal — a missing principalId would collapse
    // authenticated callers into the shared anonymous (null) key space and let one
    // principal receive another's cached body. No principal ⇒ skip the cache.
    typeof options?.principalId === "string" && options.principalId.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDeterministicMode"])(mode, options.config)) {
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeMemoKey"])(body, mode, options.config, options.principalId, options.model, options.supportsVision);
        const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoLookup"])(key);
        if (hit) return hit;
        const result = runCompression({
            ...body
        }, mode, {
            ...options,
            config: {
                ...options.config,
                memoizeCompressionResults: false
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoStore"])(key, result);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoLookup"])(key);
    }
    if (mode === "rtk") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$rtk$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyRtkCompression"])(body, {
            // Selecting the "rtk" mode IS the enable signal — run it even if the per-engine
            // rtkConfig.enabled flag is off (that flag gates stacked steps). (B-MODE-ENGINE-DECOUPLE)
            config: {
                ...options?.config?.rtkConfig ?? {},
                enabled: true
            }
        });
    }
    if (mode === "codex-responses") {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body, options?.config?.codexResponsesConfig?.preserveToolNames);
        const result = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$codexResponses$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["codexResponsesEngine"].apply(adapter.body, {
            ...options,
            config: options?.config,
            stepConfig: {
                enabled: true
            }
        });
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    }
    if (mode === "omniglyph") {
        // omniglyph is async-only — use applyCompressionAsync. Safe no-op here.
        return {
            body,
            compressed: false,
            stats: null
        };
    }
    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body, options?.config?.codexResponsesConfig?.preserveToolNames);
    const compressionBody = adapter.body;
    if (mode === "lite") {
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$lite$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyLiteCompression"])(compressionBody, {
            ...options,
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false
        });
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    }
    if (mode === "stacked") {
        const result = applyStackedCompression(compressionBody, options?.config?.stackedPipeline, options);
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    }
    if (mode === "standard") {
        const cavemanConfig = {
            ...options?.config?.cavemanConfig ?? {},
            ...options?.config?.languageConfig?.enabled ? {
                language: options.config.languageConfig.defaultLanguage,
                autoDetectLanguage: options.config.languageConfig.autoDetect,
                enabledLanguagePacks: options.config.languageConfig.enabledPacks
            } : {},
            ...options?.config?.preserveSystemPrompt !== false ? {
                compressRoles: (options?.config?.cavemanConfig?.compressRoles ?? [
                    "user"
                ]).filter((role)=>role !== "system")
            } : {},
            // Selecting the "standard" mode runs caveman regardless of the per-engine
            // cavemanConfig.enabled flag (that flag gates stacked steps). (B-MODE-ENGINE-DECOUPLE)
            enabled: true
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$caveman$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cavemanCompress"])(compressionBody, cavemanConfig);
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    }
    if (mode === "aggressive") {
        const messages = compressionBody.messages ?? [];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const aggressiveConfig = {
            ...options?.config?.aggressive ?? {},
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$aggressive$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compressAggressive"])(messages, aggressiveConfig);
        const compressedBody = {
            ...compressionBody,
            messages: result.messages
        };
        return {
            body: adapter.restore(compressedBody),
            compressed: result.stats.savingsPercent > 0,
            stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(compressionBody, compressedBody, mode, [
                "aggressive"
            ], result.stats.rulesApplied, result.stats.durationMs)
        };
    }
    if (mode === "ultra") {
        const messages = compressionBody.messages ?? [];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const ultraConfig = {
            ...options?.config?.ultra ?? {},
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultra$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ultraCompressHeuristic"])(messages, ultraConfig);
        const compressedBody = {
            ...compressionBody,
            messages: result.messages
        };
        return {
            body: adapter.restore(compressedBody),
            compressed: result.stats.savingsPercent > 0,
            stats: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(compressionBody, compressedBody, mode, [
                    "ultra"
                ], result.stats.rulesApplied, result.stats.durationMs),
                ultraTier: result.stats.ultraTier
            }
        };
    }
    return {
        body,
        compressed: false,
        stats: null
    };
}
async function applyCompressionAsync(body, mode, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$entrypointWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withCompressionEntrypointGuardsAsync"])(body, options, (b)=>runCompressionAsync(b, mode, options));
}
async function runCompressionAsync(body, mode, options) {
    if (options?.config?.memoizeCompressionResults === true && // Only memoize for an explicit principal — a missing principalId would collapse
    // authenticated callers into the shared anonymous (null) key space and let one
    // principal receive another's cached body. No principal ⇒ skip the cache.
    typeof options?.principalId === "string" && options.principalId.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDeterministicMode"])(mode, options.config)) {
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeMemoKey"])(body, mode, options.config, options.principalId, options.model, options.supportsVision);
        const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoLookup"])(key);
        if (hit) return hit;
        const result = await runCompressionAsync({
            ...body
        }, mode, {
            ...options,
            config: {
                ...options.config,
                memoizeCompressionResults: false
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoStore"])(key, result);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$resultMemo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoLookup"])(key);
    }
    // Single-mode omniglyph (async-only) — resolution lives in engines/omniglyphSingleMode.ts.
    if (mode === "omniglyph") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$omniglyphSingleMode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyOmniglyphSingleMode"])(body, options);
    if (mode === "stacked") {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body, options?.config?.codexResponsesConfig?.preserveToolNames);
        const result = await applyStackedCompressionAsync(adapter.body, options?.config?.stackedPipeline, options);
        return adapter.adapted ? {
            ...result,
            body: adapter.restore(result.body)
        } : result;
    }
    // Ultra's optional SLM (model) tier is async — route it here when a model is configured.
    if (mode === "ultra") {
        return applyUltraAsync(body, options);
    }
    return applyCompression(body, mode, options);
}
/**
 * Ultra mode with the optional local SLM (model) tier.
 *
 * When `config.ultra.modelPath` is set, the prose is routed through the llmlingua engine
 * (the real local-model compressor). The llmlingua backend fail-opens when the model is
 * absent (e.g. the ONNX model is not provisioned), so this degrades gracefully:
 *  - model present and it compresses  → return the SLM result (tagged "ultra-slm");
 *  - model absent / no gain / failure → fall back to `aggressive` when
 *    `slmFallbackToAggressive` is set, otherwise the heuristic ultra (`pruneByScore`).
 *
 * Without `modelPath` the behavior is byte-identical to the synchronous heuristic ultra.
 */ async function applyUltraAsync(body, options) {
    const ultraConfig = options?.config?.ultra;
    const modelPath = typeof ultraConfig?.modelPath === "string" ? ultraConfig.modelPath.trim() : "";
    // No explicit modelPath → run the two-tier ultra resolver (heuristic, or SLM when
    // config.ultraEngine === "slm" and the worker backend is available). This is the
    // Phase-4 (B) path; it fail-opens to the heuristic and records the resolved tier.
    if (!modelPath) {
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$bodyAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adaptBodyForCompression"])(body, options?.config?.codexResponsesConfig?.preserveToolNames);
        const messages = adapter.body.messages ?? [];
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                body,
                compressed: false,
                stats: null
            };
        }
        const ultraConfig = {
            ...options?.config?.ultra ?? {},
            preserveSystemPrompt: options?.config?.preserveSystemPrompt !== false,
            ultraEngine: options?.config?.ultraEngine
        };
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultra$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ultraCompress"])(messages, ultraConfig);
        const compressedBody = {
            ...adapter.body,
            messages: result.messages
        };
        return {
            body: adapter.restore(compressedBody),
            compressed: result.stats.savingsPercent > 0,
            stats: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(adapter.body, compressedBody, "ultra", result.stats.techniquesUsed, result.stats.rulesApplied, result.stats.durationMs),
                ultraTier: result.stats.ultraTier
            }
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerBuiltinCompressionEngines"])();
    const slmEngine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])("llmlingua");
    if (slmEngine?.applyAsync) {
        const engineOptions = {
            model: options?.model,
            supportsVision: options?.supportsVision,
            config: options?.config,
            principalId: options?.principalId,
            stepConfig: {
                modelPath,
                ...typeof ultraConfig?.compressionRate === "number" ? {
                    compressionRate: ultraConfig.compressionRate
                } : {}
            }
        };
        try {
            const slm = await slmEngine.applyAsync(body, engineOptions);
            if (slm.compressed && slm.stats) {
                // Attribute the result to ultra (the selected mode) while marking the SLM tier.
                return {
                    ...slm,
                    stats: {
                        ...slm.stats,
                        mode: "ultra",
                        techniquesUsed: Array.from(new Set([
                            ...slm.stats.techniquesUsed ?? [],
                            "ultra-slm"
                        ]))
                    }
                };
            }
        } catch  {
        // llmlingua fail-opens internally, but guard anyway and use the configured fallback.
        }
    }
    // SLM tier unavailable or produced no gain → fall back per slmFallbackToAggressive.
    return applyCompression(body, ultraConfig?.slmFallbackToAggressive ? "aggressive" : "ultra", options);
}
function normalizePipelineStep(step) {
    if (typeof step !== "string") return step;
    if (step === "standard") return {
        engine: "caveman"
    };
    if (step === "rtk" || step === "codex-responses") return {
        engine: step
    };
    if (step === "lite" || step === "aggressive" || step === "ultra") return {
        engine: step
    };
    return {
        engine: "caveman"
    };
}
/** Emit a per-engine step to the live streaming callback (best-effort, no-op when unset). */ function reportEngineStep(onStep, stepIndex, totalSteps, engine, result) {
    if (!onStep) return;
    const s = result.stats;
    onStep({
        stepIndex,
        totalSteps,
        engine,
        state: result.compressed ? "done" : "skipped",
        originalTokens: s?.originalTokens ?? 0,
        compressedTokens: s?.compressedTokens ?? s?.originalTokens ?? 0,
        savingsPercent: s?.savingsPercent ?? 0,
        ...s?.durationMs !== undefined ? {
            durationMs: s.durationMs
        } : {}
    });
}
/**
 * #6463: When callers dispatch mode="stacked" WITHOUT pre-deriving the pipeline from the
 * per-engine toggle map (e.g. /api/compression/preview, external routes that only forward
 * the persisted config), the stacked loop must not silently fall back to the built-in
 * [rtk, caveman] default while ignoring the operator's toggled engines. This resolver
 * honors the explicit pipeline first, then the engines-derived pipeline, and only
 * falls back to the historical default when neither source produced steps.
 */ function resolveStackSteps(pipeline, config) {
    if (pipeline && pipeline.length > 0) return pipeline.map(normalizePipelineStep);
    const engines = config?.engines;
    if (engines && Object.values(engines).some((e)=>e?.enabled === true)) {
        const derived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveDefaultPlan"])(engines, true);
        if (derived.mode === "stacked" && derived.stackedPipeline.length > 0) {
            return derived.stackedPipeline;
        }
    }
    return [
        {
            engine: "rtk",
            intensity: "standard"
        },
        {
            engine: "caveman",
            intensity: "full"
        }
    ];
}
function buildStepOptions(step, options) {
    // Detail sub-objects (headroom.minRows #8056; sessionDedup/ccr #8388) live on
    // settings.<engine>, not only on step.config. Merge them so the stacked runner
    // honors the dashboard value. Explicit step.config still wins so combo pipelines
    // can override per step. See resolveStepDetailConfig (stepDetailConfig.ts).
    const stepConfig = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stepDetailConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveStepDetailConfig"])(step.engine, options?.config),
        ...step.config ?? {},
        ...step.intensity ? {
            intensity: step.intensity
        } : {}
    };
    // Selecting an engine in an explicit stacked pipeline is itself the enablement
    // signal. Preserve an explicit per-step opt-out, but do not let the standalone
    // default (codexResponsesConfig.enabled=false) turn a selected stacked step into
    // a no-op.
    if (step.engine === "codex-responses" && stepConfig.enabled === undefined) {
        stepConfig.enabled = true;
    }
    return {
        ...options,
        compressionComboId: options?.compressionComboId ?? options?.config?.compressionComboId,
        principalId: options?.principalId,
        stepConfig
    };
}
function finalizeStackedResult(originalBody, currentBody, compressed, acc, start, compressionComboId) {
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCompressionStats"])(originalBody, currentBody, "stacked", Array.from(acc.techniques), acc.rules.size > 0 ? Array.from(acc.rules) : undefined, Math.round((performance.now() - start) * 100) / 100);
    stats.engine = "stacked";
    stats.compressionComboId = compressionComboId ?? null;
    stats.engineBreakdown = acc.breakdown;
    if (acc.validationWarnings.size > 0) {
        stats.validationWarnings = Array.from(acc.validationWarnings);
    }
    if (acc.validationErrors.size > 0) {
        stats.validationErrors = Array.from(acc.validationErrors);
    }
    if (acc.fallbackApplied) {
        stats.fallbackApplied = true;
    }
    if (acc.rtkRawOutputPointers.length > 0) {
        const seenPointers = new Set();
        stats.rtkRawOutputPointers = acc.rtkRawOutputPointers.filter((pointer)=>{
            if (seenPointers.has(pointer.id)) return false;
            seenPointers.add(pointer.id);
            return true;
        });
    }
    // T02 / H1 / #6480: honest aggregate inflation guard, gated on the loop-level `compressed`
    // flag so a pipeline where nothing ever advanced isn't mislabeled as a reverted fallback.
    // See `applyStackedInflationGuard` in `pipelineGuards.ts` for the full rationale.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineGuards$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyStackedInflationGuard"])(originalBody, currentBody, compressed, stats);
}
/** Failure path: record the breaker failure (when on) + keep the verbatim body, surfacing it in telemetry. */ function recordStepFailure(acc, engineId, err, ctx) {
    if (ctx.breakerOn) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordEngineFailure"])(engineId, ctx.breaker);
    acc.validationErrors.add(`${engineId}: bailed out — ${err instanceof Error ? err.message : String(err)}`);
    acc.fallbackApplied = true;
}
/**
 * Success path: record the breaker success (when on), merge telemetry, and decide whether to
 * advance `currentBody`. Advance rule: TV1 bail-out uses min-gain (`decideStep`); otherwise the
 * legacy `result.compressed`. Returns the (possibly unchanged) body + whether it advanced.
 */ function commitStepResult(acc, step, result, currentBody, ctx) {
    if (ctx.breakerOn) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordEngineSuccess"])(step.engine, ctx.breaker);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeStackStep"])(acc, step.engine, result);
    const advance = ctx.bailout?.enabled ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decideStep"])(result, ctx.bailout).advance : result.compressed;
    if (advance && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$fidelityGateStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gateAdvance"])(result, currentBody, ctx.fidelityGate, acc, step.engine)) {
        return {
            body: result.body,
            advanced: true
        };
    }
    return {
        body: currentBody,
        advanced: false
    };
}
function applyStackedCompression(body, pipeline, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withRiskGate"])(body, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRiskGate"])(options), (b)=>runStackedCompression(b, pipeline, options));
}
function runStackedCompression(body, pipeline, options) {
    const steps = resolveStackSteps(pipeline, options?.config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerBuiltinCompressionEngines"])();
    let currentBody = body;
    let compressed = false;
    const acc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createStackAccumulator"])();
    const start = performance.now();
    const bailout = options?.bailout;
    const breaker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePipelineBreakerConfig"])(options?.circuitBreaker ?? options?.config?.pipelineCircuitBreaker);
    const breakerOn = breaker.enabled;
    const fidelityGate = options?.fidelityGate ?? options?.config?.fidelityGate;
    const onStep = options?.onEngineStep;
    const totalSteps = steps.length;
    let stepIdx = 0;
    for (const step of steps){
        const engine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])(step.engine);
        if (!engine) {
            acc.validationErrors.add(`Unknown compression engine: "${step.engine}"`);
            continue;
        }
        // Respect the registry enabled flag: a step naming a disabled engine is skipped, so an
        // operator can turn an engine off (setEngineEnabled) without editing every pipeline.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEngineEntry"])(step.engine)?.enabled === false) {
            acc.validationWarnings.add(`${step.engine}: skipped (engine disabled in registry)`);
            continue;
        }
        // T02: when the per-engine breaker is OPEN, skip this step (verbatim body kept — fail-open).
        if (breakerOn && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canRunEngine"])(step.engine, breaker)) {
            acc.validationWarnings.add(`${step.engine}: skipped (pipeline circuit-breaker open)`);
            continue;
        }
        // TV1 bail-out (per-request) OR T02 breaker (cross-request) wrap the call so a throwing engine
        // is caught + recorded; when neither is on, a throw propagates (byte-identical to legacy).
        const ctx = {
            bailout,
            breakerOn,
            breaker,
            fidelityGate
        };
        let result;
        if (bailout?.enabled || breakerOn) {
            try {
                result = engine.apply(currentBody, buildStepOptions(step, options));
            } catch (err) {
                recordStepFailure(acc, step.engine, err, ctx);
                continue;
            }
        } else {
            result = engine.apply(currentBody, buildStepOptions(step, options));
        }
        const committed = commitStepResult(acc, step, result, currentBody, ctx);
        currentBody = committed.body;
        if (committed.advanced) compressed = true;
        // The pre-existing bail-out path did not stream per-step; everything else does.
        if (!bailout?.enabled) reportEngineStep(onStep, stepIdx++, totalSteps, step.engine, result);
    }
    // Hard-budget post-pass (#17): runs after all engines, before finalize.
    if (options?.config?.targetTokens != null || options?.config?.targetRatio != null) {
        const hbResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$hardBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyHardBudget"])(currentBody, {
            targetTokens: options.config.targetTokens,
            targetRatio: options.config.targetRatio
        });
        if (hbResult.compressed) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeStackStep"])(acc, "hard-budget", hbResult);
            currentBody = hbResult.body;
            compressed = true;
        } else {
            // No unit could be dropped (e.g. every unit is preserve-guarded): surface the
            // unreachable-budget validationWarnings instead of dropping them silently (#17 fix #3).
            // mergeStackStep is gated on `compressed`, so propagate the warnings here directly.
            hbResult.stats?.validationWarnings?.forEach((w)=>acc.validationWarnings.add(w));
        }
    }
    return finalizeStackedResult(body, currentBody, compressed, acc, start, options?.compressionComboId ?? options?.config?.compressionComboId);
}
async function applyStackedCompressionAsync(body, pipeline, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withRiskGateAsync"])(body, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$riskGate$2f$strategyWrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRiskGate"])(options), (b)=>runStackedCompressionAsync(b, pipeline, options));
}
async function runStackedCompressionAsync(body, pipeline, options) {
    const steps = resolveStackSteps(pipeline, options?.config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerBuiltinCompressionEngines"])();
    let currentBody = body;
    let compressed = false;
    const acc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createStackAccumulator"])();
    const start = performance.now();
    const bailout = options?.bailout;
    const breaker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePipelineBreakerConfig"])(options?.circuitBreaker ?? options?.config?.pipelineCircuitBreaker);
    const breakerOn = breaker.enabled;
    const fidelityGate = options?.fidelityGate ?? options?.config?.fidelityGate;
    const onStep = options?.onEngineStep;
    const totalSteps = steps.length;
    let stepIdx = 0;
    for (const step of steps){
        const engine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompressionEngine"])(step.engine);
        if (!engine) {
            acc.validationErrors.add(`Unknown compression engine: "${step.engine}"`);
            continue;
        }
        // Respect the registry enabled flag (same as the sync loop) — keep both in lockstep.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEngineEntry"])(step.engine)?.enabled === false) {
            acc.validationWarnings.add(`${step.engine}: skipped (engine disabled in registry)`);
            continue;
        }
        // T02: skip an engine whose breaker is OPEN (verbatim body kept — fail-open). Lockstep w/ sync.
        if (breakerOn && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$pipelineEngineBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canRunEngine"])(step.engine, breaker)) {
            acc.validationWarnings.add(`${step.engine}: skipped (pipeline circuit-breaker open)`);
            continue;
        }
        const stepOptions = buildStepOptions(step, options);
        // TV1 bail-out (per-request) OR T02 breaker (cross-request) wrap the call (lockstep w/ sync).
        const ctx = {
            bailout,
            breakerOn,
            breaker,
            fidelityGate
        };
        let result;
        if (bailout?.enabled || breakerOn) {
            try {
                result = engine.applyAsync ? await engine.applyAsync(currentBody, stepOptions) : engine.apply(currentBody, stepOptions);
            } catch (err) {
                recordStepFailure(acc, step.engine, err, ctx);
                continue;
            }
        } else {
            result = engine.applyAsync ? await engine.applyAsync(currentBody, stepOptions) : engine.apply(currentBody, stepOptions);
        }
        const committed = commitStepResult(acc, step, result, currentBody, ctx);
        currentBody = committed.body;
        if (committed.advanced) compressed = true;
        if (!bailout?.enabled) reportEngineStep(onStep, stepIdx++, totalSteps, step.engine, result);
    }
    // Hard-budget post-pass (#17): runs after all engines, before finalize.
    if (options?.config?.targetTokens != null || options?.config?.targetRatio != null) {
        const hbResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$hardBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyHardBudget"])(currentBody, {
            targetTokens: options.config.targetTokens,
            targetRatio: options.config.targetRatio
        });
        if (hbResult.compressed) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$stackedStepCore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeStackStep"])(acc, "hard-budget", hbResult);
            currentBody = hbResult.body;
            compressed = true;
        } else {
            // No unit could be dropped (e.g. every unit is preserve-guarded): surface the
            // unreachable-budget validationWarnings instead of dropping them silently (#17 fix #3).
            // mergeStackStep is gated on `compressed`, so propagate the warnings here directly.
            hbResult.stats?.validationWarnings?.forEach((w)=>acc.validationWarnings.add(w));
        }
    }
    return finalizeStackedResult(body, currentBody, compressed, acc, start, options?.compressionComboId ?? options?.config?.compressionComboId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/compression/diffHelper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MAX_PREVIEW_DIFF_TOKEN_PRODUCT",
    ()=>DEFAULT_MAX_PREVIEW_DIFF_TOKEN_PRODUCT,
    "buildCompressionDiff",
    ()=>buildCompressionDiff,
    "buildCompressionPreviewDiff",
    ()=>buildCompressionPreviewDiff
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/preservation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/ultraHeuristic.ts [app-route] (ecmascript)");
;
;
;
const DEFAULT_MAX_PREVIEW_DIFF_TOKEN_PRODUCT = 1_000_000;
function tokenize(text) {
    return text.match(/\s+|[^\s]+/g) ?? [];
}
function getDiffSkipWarning(original, compressed, options = {}) {
    const maxTokenProduct = options.maxTokenProduct ?? DEFAULT_MAX_PREVIEW_DIFF_TOKEN_PRODUCT;
    if (maxTokenProduct <= 0) return null;
    const originalTokens = tokenize(original).length;
    const compressedTokens = tokenize(compressed).length;
    if (originalTokens * compressedTokens <= maxTokenProduct) return null;
    return `Preview diff omitted because token product ${originalTokens}x${compressedTokens} exceeds safe limit ${maxTokenProduct}.`;
}
function buildCompressionDiff(original, compressed) {
    const a = tokenize(original);
    const b = tokenize(compressed);
    const dp = Array.from({
        length: a.length + 1
    }, ()=>Array(b.length + 1).fill(0));
    for(let i = a.length - 1; i >= 0; i--){
        for(let j = b.length - 1; j >= 0; j--){
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
    const segments = [];
    const push = (type, text)=>{
        if (!text) return;
        const last = segments[segments.length - 1];
        if (last?.type === type) {
            last.text += text;
        } else {
            segments.push({
                type,
                text
            });
        }
    };
    let i = 0;
    let j = 0;
    while(i < a.length && j < b.length){
        if (a[i] === b[j]) {
            push("same", a[i]);
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            push("removed", a[i]);
            i++;
        } else {
            push("added", b[j]);
            j++;
        }
    }
    while(i < a.length)push("removed", a[i++]);
    while(j < b.length)push("added", b[j++]);
    return segments;
}
/**
 * Walk original-side diff segments (same + removed; skip added) to build a
 * Set of token indices that survived into the compressed output.
 */ function keptIndicesFromSegments(segments) {
    const keptSet = new Set();
    let cursor = 0;
    for (const seg of segments){
        if (seg.type === "added") continue;
        const segLen = tokenize(seg.text).length;
        if (seg.type === "same") {
            for(let k = 0; k < segLen; k++)keptSet.add(cursor + k);
        }
        cursor += segLen;
    }
    return keptSet;
}
/**
 * Walk original-side diff segments to build [lo, hi] index ranges for removed spans.
 */ function removedRangesFromSegments(segments) {
    const ranges = [];
    let cursor = 0;
    for (const seg of segments){
        if (seg.type === "added") continue;
        const segLen = tokenize(seg.text).length;
        if (seg.type === "removed") ranges.push([
            cursor,
            cursor + segLen - 1
        ]);
        cursor += segLen;
    }
    return ranges;
}
/**
 * Build a per-token saliency heatmap for the original text.
 *
 * ultra: score each token using scoreToken (0–1); kept = token not in a removed-only diff segment.
 * universal: score is binary (1 = kept, 0 = removed); kept derived from diff segments.
 */ function buildHeatmap(mode, original, segments) {
    const rawTokens = tokenize(original);
    if (mode === "universal") {
        const keptSet = keptIndicesFromSegments(segments);
        return {
            mode,
            tokens: rawTokens.map((text, idx)=>{
                const kept = keptSet.has(idx);
                return {
                    text,
                    score: kept ? 1 : 0,
                    kept
                };
            })
        };
    }
    // ultra mode: use scoreToken; kept = not in a purely removed segment position
    const removedRanges = removedRangesFromSegments(segments);
    return {
        mode,
        tokens: rawTokens.map((text, idx)=>{
            const removed = removedRanges.some(([lo, hi])=>idx >= lo && idx <= hi);
            return {
                text,
                score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$ultraHeuristic$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreToken"])(text),
                kept: !removed
            };
        })
    };
}
function buildCompressionPreviewDiff(original, compressed, stats, options = {}, heatmapMode) {
    const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateCompression"])(original, compressed);
    const preserved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$preservation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPreservedBlocks"])(original).blocks.map((block)=>({
            kind: block.kind,
            preview: block.content.replace(/\s+/g, " ").slice(0, 120)
        }));
    const diffSkipWarning = getDiffSkipWarning(original, compressed, options);
    const segments = diffSkipWarning ? [
        {
            type: "same",
            text: "[diff omitted: input too large]"
        }
    ] : buildCompressionDiff(original, compressed);
    let fallbackReason;
    if (validation.fallbackApplied) {
        fallbackReason = validation.errors.length > 0 ? `validation-failed: ${validation.errors[0]}` : "validation-failed";
    } else if (stats?.fallbackApplied) {
        fallbackReason = "compression-fallback";
    }
    const result = {
        segments,
        preservedBlocks: preserved,
        ruleRemovals: stats?.rulesApplied ?? [],
        validationWarnings: [
            ...stats?.validationWarnings ?? [],
            ...validation.warnings,
            ...diffSkipWarning ? [
                diffSkipWarning
            ] : []
        ],
        validationErrors: [
            ...stats?.validationErrors ?? [],
            ...validation.errors
        ],
        fallbackApplied: Boolean(stats?.fallbackApplied || validation.fallbackApplied),
        ...fallbackReason && {
            fallbackReason
        }
    };
    if (heatmapMode) {
        result.heatmap = buildHeatmap(heatmapMode, original, segments);
    }
    return result;
}
}),
"[project]/open-sse/services/compression/engineBreakdown.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureEngineBreakdown",
    ()=>ensureEngineBreakdown,
    "reconcileSingleEngineTokens",
    ()=>reconcileSingleEngineTokens
]);
function ensureEngineBreakdown(stats) {
    if (stats.engineBreakdown && stats.engineBreakdown.length > 0) {
        return stats.engineBreakdown;
    }
    return [
        {
            engine: stats.engine || stats.mode || "compression",
            originalTokens: stats.originalTokens,
            compressedTokens: stats.compressedTokens,
            savingsPercent: stats.savingsPercent,
            techniquesUsed: stats.techniquesUsed ?? [],
            ...stats.rulesApplied ? {
                rulesApplied: stats.rulesApplied
            } : {},
            ...stats.durationMs !== undefined ? {
                durationMs: stats.durationMs
            } : {}
        }
    ];
}
function reconcileSingleEngineTokens(breakdown, outerOriginalTokens, outerCompressedTokens, outerSavingsPercent) {
    if (breakdown.length !== 1) return breakdown;
    const [entry] = breakdown;
    return [
        {
            ...entry,
            originalTokens: outerOriginalTokens,
            compressedTokens: outerCompressedTokens,
            savingsPercent: outerSavingsPercent
        }
    ];
}
}),
"[project]/open-sse/services/compression/engines/headroom/encoderComparison.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "summarizeEncoderCandidates",
    ()=>summarizeEncoderCandidates
]);
/**
 * encoderComparison.ts — pure A/B aggregator for the studio.
 * Scans the same arrays SmartCrusher would compact and reports JSON vs GCF vs TOON
 * sizes (bytes + tokens). countTokens is injected by the caller (open-sse must not
 * import the app-side tiktoken counter). Fail-open: if TOON is unavailable on any
 * array, toonAvailable=false and TOON is not eligible as winner.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/tabular.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/toon.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$smartcrusher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/headroom/smartcrusher.ts [app-route] (ecmascript)");
;
;
;
const ZERO = {
    bytes: 0,
    tokens: 0
};
function add(a, text, countTokens) {
    return {
        bytes: a.bytes + Buffer.byteLength(text, "utf8"),
        tokens: a.tokens + countTokens(text)
    };
}
function pickWinner(json, gcf, toon, toonAvailable) {
    const candidates = [
        [
            "gcf",
            gcf
        ],
        [
            "json",
            json
        ]
    ];
    if (toonAvailable) candidates.push([
        "toon",
        toon
    ]);
    candidates.sort((a, b)=>a[1].tokens - b[1].tokens || a[1].bytes - b[1].bytes);
    return candidates[0][0];
}
function summarizeEncoderCandidates(messages, minRows, countTokens) {
    const arrays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$smartcrusher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectCompactableArrays"])(messages, minRows);
    let json = {
        ...ZERO
    }, gcf = {
        ...ZERO
    }, toon = {
        ...ZERO
    };
    let toonAvailable = arrays.length > 0;
    for (const arr of arrays){
        json = add(json, JSON.stringify(arr), countTokens);
        gcf = add(gcf, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapTabular"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$tabular$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeTabularBlock"])(arr)), countTokens);
        const toonInner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encodeToonBlock"])(arr);
        if (toonInner === null) toonAvailable = false;
        else toon = add(toon, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$headroom$2f$toon$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrapToon"])(toonInner), countTokens);
    }
    return {
        arraysCompared: arrays.length,
        json,
        gcf,
        toon: toonAvailable ? toon : {
            ...ZERO
        },
        toonAvailable,
        winner: pickWinner(json, gcf, toon, toonAvailable)
    };
}
}),
];

//# sourceMappingURL=open-sse_services_compression_1cyfq_w._.js.map