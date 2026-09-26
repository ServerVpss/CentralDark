module.exports = [
"[project]/open-sse/services/compression/engineCatalog.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/compression/types.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineCatalog.ts [instrumentation] (ecmascript)");
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
    engines: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ENGINE_IDS"].map((id)=>[
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
"[project]/src/shared/utils/tiktokenCounter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "countTextTokens",
    ()=>countTextTokens,
    "isCodexTokenizerContext",
    ()=>isCodexTokenizerContext,
    "resolveTokenizerEncoding",
    ()=>resolveTokenizerEncoding,
    "tokenizerContextFromBody",
    ()=>tokenizerContextFromBody
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/js-tiktoken/dist/index.js [instrumentation] (ecmascript) <locals>");
;
function tokenizerContextFromBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return {};
    const record = body;
    return {
        provider: typeof record.provider === "string" ? record.provider : undefined,
        model: typeof record.model === "string" ? record.model : undefined
    };
}
const encoders = new Map();
function normalize(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function isCodexTokenizerContext(context) {
    const provider = normalize(context?.provider);
    const model = normalize(context?.model);
    return provider === "codex" || provider === "cx" || model.startsWith("codex/") || model.startsWith("cx/") || model.includes("codex");
}
function resolveTokenizerEncoding(context) {
    return isCodexTokenizerContext(context) ? "o200k_base" : "cl100k_base";
}
function getEncoder(encoding) {
    const cached = encoders.get(encoding);
    if (cached) return cached;
    const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEncoding"])(encoding);
    encoders.set(encoding, created);
    return created;
}
function countTextTokens(text, context) {
    if (!text || typeof text !== "string") return 0;
    try {
        return getEncoder(resolveTokenizerEncoding(context)).encode(text).length;
    } catch  {
        return Math.ceil(text.length / 4);
    }
}
}),
"[project]/open-sse/services/compression/stats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/tiktokenCounter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$anthropic$2d$vision$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/omniglyph/dist/core/anthropic-vision.js [instrumentation] (ecmascript)");
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
            imageTokens += (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$anthropic$2d$vision$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["anthropicImageTokens"])(dims.width, dims.height, "standard");
            imageTokens += __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$omniglyph$2f$dist$2f$core$2f$anthropic$2d$vision$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_IMAGE_BLOCK_OVERHEAD_TOKENS"];
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
        const tokenizerContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tokenizerContextFromBody"])(text);
        const useExactTokenizer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCodexTokenizerContext"])(tokenizerContext);
        const { clone, imageTokens } = blankImageBlocksAndSumImageTokens(text);
        if (imageTokens === 0) {
            // Keep the legacy character estimate for generic payloads. Codex payloads use
            // the model-appropriate tokenizer so their compression stats match hard budgets.
            return useExactTokenizer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["countTextTokens"])(JSON.stringify(text), tokenizerContext) : charTokensOf(text);
        }
        return useExactTokenizer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$tiktokenCounter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["countTextTokens"])(JSON.stringify(clone), tokenizerContext) + imageTokens : charTokensOf(clone) + imageTokens;
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
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_COMPRESSION_CONFIG"],
        cavemanConfig: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CAVEMAN_CONFIG"]
        },
        rtkConfig: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_RTK_CONFIG"]
        },
        languageConfig: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_COMPRESSION_LANGUAGE_CONFIG"]
        }
    };
}
}),
];

//# sourceMappingURL=_0eumir9._.js.map