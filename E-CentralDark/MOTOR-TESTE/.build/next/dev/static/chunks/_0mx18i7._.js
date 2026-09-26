(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/open-sse/services/compression/engineCatalog.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
const ENGINE_IDS = Object.values(ENGINE_CATALOG).sort((a, b)=>a.stackPriority - b.stackPriority).map(_c = (e)=>e.id);
_c1 = ENGINE_IDS;
function engineMeta(id) {
    return ENGINE_CATALOG[id];
}
function isSafeDefault(id) {
    return !engineMeta(id).guidance.lossy;
}
var _c, _c1;
__turbopack_context__.k.register(_c, "ENGINE_IDS$Object.values(ENGINE_CATALOG)\r\n  .sort((a, b) => a.stackPriority - b.stackPriority)\r\n  .map");
__turbopack_context__.k.register(_c1, "ENGINE_IDS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/engines/mcpAccessibility/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/types.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engines$2f$mcpAccessibility$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engines/mcpAccessibility/constants.ts [app-client] (ecmascript)");
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
    engines: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENGINE_IDS"].map((id)=>[
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/messageContent.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/outputMode.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CAVEMAN_INSTRUCTION_BY_LANGUAGE",
    ()=>CAVEMAN_INSTRUCTION_BY_LANGUAGE,
    "SHARED_BOUNDARIES",
    ()=>SHARED_BOUNDARIES,
    "applyCavemanOutputMode",
    ()=>applyCavemanOutputMode,
    "buildCavemanOutputInstruction",
    ()=>buildCavemanOutputInstruction,
    "shouldBypassCavemanOutputMode",
    ()=>shouldBypassCavemanOutputMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/types.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/messageContent.ts [app-client] (ecmascript)");
;
;
const SHARED_BOUNDARIES = "Code blocks, file paths, commands, errors, URLs: keep exact. Security warnings, irreversible action confirmations, multi-step ordered sequences: write normal. Resume terse style after. Active every response until user asks for normal mode.";
const CAVEMAN_INSTRUCTION_BY_LANGUAGE = {
    en: {
        lite: `Respond concise. Drop filler, pleasantries, hedging. Keep full sentences, technical terms, code, errors, URLs, and identifiers exact. ${SHARED_BOUNDARIES}`,
        full: `Respond terse like smart caveman. Drop articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries, hedging. Fragments OK. Short synonyms (big not extensive, fix not implement). Keep all technical substance, code, errors, URLs, identifiers exact. ${SHARED_BOUNDARIES}`,
        ultra: `Respond ultra terse. Maximum compression. Telegraphic. Abbreviate (DB/auth/config/req/res/fn/impl), strip conjunctions, arrows for causality (X → Y). One word when one word enough. Never abbreviate code symbols, API names, error strings, URLs, or identifiers. ${SHARED_BOUNDARIES}`
    },
    "pt-BR": {
        lite: `Responda conciso. Remova enrolacao, cortesias e incerteza. Preserve termos tecnicos, codigo, erros, URLs e identificadores exatamente. ${SHARED_BOUNDARIES}`,
        full: `Responda seco e compacto. Frases curtas OK. Preserve todo conteudo tecnico, codigo, erros, URLs e identificadores exatamente. ${SHARED_BOUNDARIES}`,
        ultra: `Responda ultra compacto. Use prosa tecnica curta e abreviacoes comuns como DB/auth/config/req/res/fn. Nunca abrevie simbolos de codigo, APIs, erros, URLs ou identificadores. ${SHARED_BOUNDARIES}`
    },
    es: {
        lite: `Responde conciso. Quita relleno, cortesias y dudas. Conserva terminos tecnicos, codigo, errores, URLs e identificadores exactos. ${SHARED_BOUNDARIES}`,
        full: `Responde seco y compacto. Fragmentos OK. Conserva todo el contenido tecnico, codigo, errores, URLs e identificadores exactos. ${SHARED_BOUNDARIES}`,
        ultra: `Responde ultra compacto. Usa prosa tecnica corta y abreviaturas comunes como DB/auth/config/req/res/fn. Nunca abrevies simbolos de codigo, APIs, errores, URLs o identificadores. ${SHARED_BOUNDARIES}`
    },
    de: {
        lite: `Antworte knapp. Entferne Fuellwoerter, Hoeflichkeit und Unsicherheit. Bewahre Fachbegriffe, Code, Fehler, URLs und Bezeichner exakt. ${SHARED_BOUNDARIES}`,
        full: `Antworte sehr knapp. Fragmente OK. Bewahre alle technischen Inhalte, Code, Fehler, URLs und Bezeichner exakt. ${SHARED_BOUNDARIES}`,
        ultra: `Antworte ultra knapp. Nutze kurze technische Prosa und uebliche Abkuerzungen wie DB/auth/config/req/res/fn. Code-Symbole, APIs, Fehler, URLs und Bezeichner nie abkuerzen. ${SHARED_BOUNDARIES}`
    },
    fr: {
        lite: `Reponds concis. Retire remplissage, politesses et hesitations. Garde termes techniques, code, erreurs, URLs et identifiants exacts. ${SHARED_BOUNDARIES}`,
        full: `Reponds tres compact. Fragments OK. Garde tout le contenu technique, code, erreurs, URLs et identifiants exacts. ${SHARED_BOUNDARIES}`,
        ultra: `Reponds ultra compact. Utilise une prose technique courte et des abreviations communes comme DB/auth/config/req/res/fn. N'abrege jamais symboles de code, APIs, erreurs, URLs ou identifiants. ${SHARED_BOUNDARIES}`
    },
    ja: {
        lite: `簡潔に回答。冗長表現、挨拶、曖昧表現を削る。技術用語、コード、エラー、URL、識別子は正確に保持。${SHARED_BOUNDARIES}`,
        full: `短く圧縮して回答。断片文可。技術内容、コード、エラー、URL、識別子は正確に保持。${SHARED_BOUNDARIES}`,
        ultra: `超短く回答。DB/auth/config/req/res/fn など一般的な略語は可。コード記号、API名、エラー文字列、URL、識別子は省略しない。${SHARED_BOUNDARIES}`
    },
    id: {
        lite: `Jawab ringkas. Hapus pengisi, salam sopan santun, keraguan. Pertahankan istilah teknis, kode, error, URL, & identifier secara persis. ${SHARED_BOUNDARIES}`,
        full: `Jawab sangat singkat ala caveman pintar. Hapus kata pengisi (hanya/sangat/sebenarnya), salam sopan santun. Kalimat pendek/tidak lengkap OK. Gunakan sinonim pendek. Pertahankan semua substansi teknis, kode, error, URL, & identifier secara persis. ${SHARED_BOUNDARIES}`,
        ultra: `Jawab ultra singkat. Kompresi maksimal. Gunakan singkatan umum (DB/auth/config/req/res/fn/impl), hilangkan kata hubung, gunakan panah untuk kausalitas (X → Y). Satu kata jika cukup. Jangan singkat simbol kode, nama API, string error, URL, atau identifier. ${SHARED_BOUNDARIES}`
    }
};
const CAVEMAN_OUTPUT_MARKER = "[OmniRoute Caveman Output Mode]";
function shouldBypassCavemanOutputMode(messages) {
    const text = messages.slice(-3).map((message)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$messageContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractTextContent"])(message.content).toLowerCase()).join("\n");
    if (!text.trim()) return null;
    if (/\b(security|vulnerability|exploit|credential leak|secret leak|malware|phishing)\b/.test(text)) {
        return "security_warning";
    }
    if (/\b(delete|drop table|truncate|destroy|wipe|irreversible|permanently remove)\b/.test(text)) {
        return "irreversible_action";
    }
    if (/\b(clarify|explain in detail|more detail|step by step|why exactly|what do you mean)\b/.test(text)) {
        return "clarification_requested";
    }
    if (/\b(first|then|after that|before|rollback|backup)\b[\s\S]{0,240}\b(delete|drop|migrate|deploy|release)\b/.test(text)) {
        return "order_sensitive_sequence";
    }
    return null;
}
function buildCavemanOutputInstruction(config, language = "en") {
    const intensity = config.intensity ?? "full";
    const instructions = CAVEMAN_INSTRUCTION_BY_LANGUAGE[language] ?? CAVEMAN_INSTRUCTION_BY_LANGUAGE.en;
    return `${CAVEMAN_OUTPUT_MARKER}\n${instructions[intensity]}`;
}
function applyCavemanOutputMode(body, options, language = "en") {
    const config = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CAVEMAN_OUTPUT_MODE_CONFIG"],
        ...options
    };
    if (!config.enabled) return {
        body,
        applied: false,
        skippedReason: "disabled"
    };
    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages || messages.length === 0) {
        const instruction = buildCavemanOutputInstruction(config, language);
        if (typeof body.instructions === "string") {
            if (body.instructions.includes(CAVEMAN_OUTPUT_MARKER)) {
                return {
                    body,
                    applied: false,
                    skippedReason: "already_applied"
                };
            }
            return {
                body: {
                    ...body,
                    instructions: `${body.instructions.trim()}\n\n${instruction}`
                },
                applied: true
            };
        }
        if (typeof body.input === "string" || Array.isArray(body.input)) {
            return {
                body: {
                    ...body,
                    instructions: instruction
                },
                applied: true
            };
        }
        return {
            body,
            applied: false,
            skippedReason: "no_messages"
        };
    }
    // Check idempotency before bypass so the marker in an already-injected system
    // message doesn't trigger a false-positive bypass (e.g. SHARED_BOUNDARIES keywords).
    const alreadyApplied = messages.some((message)=>message.role === "system" && typeof message.content === "string" && message.content.includes(CAVEMAN_OUTPUT_MARKER));
    if (alreadyApplied) return {
        body,
        applied: false,
        skippedReason: "already_applied"
    };
    if (config.autoClarity !== false) {
        const bypass = shouldBypassCavemanOutputMode(messages);
        if (bypass) return {
            body,
            applied: false,
            skippedReason: bypass
        };
    }
    const instruction = buildCavemanOutputInstruction(config, language);
    const nextMessages = [
        ...messages
    ];
    const first = nextMessages[0];
    if (first?.role === "system" && typeof first.content === "string") {
        nextMessages[0] = {
            ...first,
            content: `${first.content.trim()}\n\n${instruction}`
        };
    } else {
        nextMessages.unshift({
            role: "system",
            content: instruction
        });
    }
    return {
        body: {
            ...body,
            messages: nextMessages
        },
        applied: true
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/outputStyles/catalog.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OUTPUT_STYLE_CATALOG",
    ()=>OUTPUT_STYLE_CATALOG,
    "OUTPUT_STYLE_IDS",
    ()=>OUTPUT_STYLE_IDS,
    "outputStyleMeta",
    ()=>outputStyleMeta
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/outputMode.ts [app-client] (ecmascript)");
;
const OUTPUT_STYLE_CATALOG = {
    "terse-prose": {
        id: "terse-prose",
        label: "Terse prose",
        description: "Drop filler/articles/hedging; keep technical substance exact.",
        // Migrated verbatim from the caveman output mode (outputMode.ts) — referenced (not
        // re-typed) so the back-compat injection stays byte-identical across ALL languages,
        // not just English (the legacy mode localized to en/pt-BR/ja/id).
        levels: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CAVEMAN_INSTRUCTION_BY_LANGUAGE"].en,
        i18n: {
            "pt-BR": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CAVEMAN_INSTRUCTION_BY_LANGUAGE"]["pt-BR"],
            ja: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CAVEMAN_INSTRUCTION_BY_LANGUAGE"].ja,
            id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CAVEMAN_INSTRUCTION_BY_LANGUAGE"].id
        }
    },
    "less-code": {
        id: "less-code",
        label: "Less code",
        description: "YAGNI ladder: smallest working change, no unrequested abstractions.",
        // Ported from 9router ponytail (ponytailPrompt.js); attribution preserved.
        levels: {
            lite: `Write the smallest change that satisfies the request. Skip speculative abstractions. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
            full: `Act like a lazy senior dev applying YAGNI. Smallest working change only. No unrequested abstractions, no premature generalization, no extra layers, no defensive scaffolding the request did not ask for. Reuse existing code over adding new code. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
            ultra: `Minimal diff discipline. Touch the fewest lines that make it work. Zero new files, classes, or config unless strictly required. Inline over abstract. No "while we're here" extras. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
        }
    },
    // Ponytail (lazy-senior-dev mode) — integrated into the output-style registry
    // so it rides the existing production injector instead of a bespoke module.
    // Source: https://github.com/DietrichGebert/ponytail (MIT). This is a fuller
    // treatment than "less-code" (which is the 9router port); both are offered so
    // users can pick the leaner or the richer ladder.
    ponytail: {
        id: "ponytail",
        label: "Ponytail (lazy senior dev)",
        description: "Lazy senior-dev discipline: climb the YAGNI ladder, fix root cause, smallest working diff.",
        levels: {
            lite: `# Ponytail (lite)\nBefore writing code: does it need to exist? Does it already exist here? Does the stdlib or an installed dep cover it? Only then: write the minimum. Reuse over rewrite. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
            full: `# Ponytail — lazy senior dev\n\nYou are a lazy senior developer. Lazy = efficient, not careless. The best code is the code never written.\n\nBefore writing any code, stop at the first rung that holds:\n1. Does this need to exist? (YAGNI)\n2. Does it already exist in this codebase? Reuse it.\n3. Does the stdlib do this? Use it.\n4. Does a platform feature or installed dep cover it? Use it.\n5. Can it be one line? Make it one line.\n6. Only then: write the minimum that works.\n\nBug fix = root cause, not symptom. Grep every caller of the function you touch; fix the shared function once — one guard there is a smaller diff than one per caller.\n\nRules:\n- No unrequested abstractions. No new deps. No boilerplate.\n- Deletion over addition. Boring over clever. Fewest files.\n- Shortest working diff wins — but only after you understand the problem.\n- Question complex asks: "Do you need X, or does Y cover it?"\n- When two solutions tie, pick the edge-case-correct one. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
            ultra: `# Ponytail (ultra)\nLazy senior dev. Best code = code never written. Before any code: YAGNI → reuse → stdlib → platform → installed dep → one line → minimum that works. Fix root cause not symptom: grep every caller, patch shared function once. No unrequested abstractions, no new deps, no boilerplate. Deletion > addition. Fewest files. Shortest working diff, only after understanding the problem. Question complex asks. Edge-case-correct when tied. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
        },
        // i18n maps: localized ponytail prompts by language.
        // Each captures the same YAGNI ladder + root-cause discipline in the target
        // language's dev-community vernacular.
        i18n: {
            "pt-BR": {
                lite: `# Ponytail (lite)\nAntes de escrever código: ele precisa existir? Já existe aqui? A stdlib ou uma dep já instalada cobre? Só então: escreva o mínimo. Reutilize em vez de reescrever. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                full: `# Ponytail — dev sênior preguiçoso\n\nVocê é um dev sênior preguiçoso. Preguiçoso = eficiente, não descuidado. O melhor código é o código nunca escrito.\n\nAntes de escrever qualquer código, pare no primeiro degrau que segurar:\n1. Isso precisa existir? (YAGNI)\n2. Já existe nesse codebase? Reutilize.\n3. A stdlib faz isso? Use.\n4. Uma feature da plataforma ou dep instalada cobre? Use.\n5. Dá pra fazer em uma linha? Faça em uma.\n6. Só então: escreva o mínimo que funciona.\n\nBug fix = causa raiz, não sintoma. Grep em todos os callers da função; corrija a função compartilhada uma vez — um guard ali é um diff menor que um por caller.\n\nRegras:\n- Sem abstrações não solicitadas. Sem novas deps. Sem boilerplate.\n- Deleção > adição. Tedioso > engenhoso. Menos arquivos.\n- Menor diff funcional vence — mas só depois de entender o problema.\n- Questione pedidos complexos: "Você precisa de X, ou Y cobre?"\n- Em empate técnico, escolha o correto para edge-cases. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                ultra: `# Ponytail (ultra)\nDev sênior preguiçoso. Melhor código = nunca escrito. Antes de código: YAGNI → reuso → stdlib → plataforma → dep instalada → uma linha → mínimo que funciona. Corrige causa raiz, não sintoma: grep todo caller, corrige função compartilhada uma vez. Sem abstrações não solicitadas, sem deps novas, sem boilerplate. Deleção > adição. Menos arquivos. Menor diff, só depois de entender o problema. Questione pedidos complexos. Correto para edge-cases em empate. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
            },
            vi: {
                lite: `# Ponytail (lite)\nTrước khi viết code: có thực sự cần không? Đã có ở đây chưa? Thư viện chuẩn hoặc dep có sẵn giải quyết được không? Chỉ khi không: viết tối thiểu. Dùng lại hơn viết mới. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                full: `# Ponytail — dev già lười\n\nBạn là một senior dev lười. Lười = hiệu quả, không cẩu thả. Code tốt nhất là code không bao giờ viết.\n\nTrước khi viết, dừng ở nấc thang đầu tiên đúng:\n1. Có thực sự cần? (YAGNI)\n2. Đã có trong codebase? Dùng lại.\n3. Thư viện chuẩn làm được? Dùng nó.\n4. Platform hoặc dep có sẵn đáp ứng? Dùng nó.\n5. Có thể một dòng? Làm một dòng.\n6. Chỉ khi không: viết tối thiểu.\n\nSửa lỗi = căn nguyên, không triệu chứng. Grep mọi caller của hàm bạn sửa; sửa hàm chung một lần — một guard ở đó nhỏ hơn một guard mỗi caller.\n\nLuật:\n- Không abstraction không được yêu cầu. Không dep mới. Không boilerplate.\n- Xoá > thêm. Đơn giản > khéo léo. Ít file nhất.\n- Diff ngắn nhất thắng — nhưng chỉ sau khi hiểu vấn đề.\n- Hỏi lại yêu cầu phức tạp: "Bạn cần X, hay Y đủ?"\n- Khi hai giải pháp hoà, chọn cái đúng edge-case. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                ultra: `# Ponytail (ultra)\nDev già lười. Code tốt nhất = không viết. Trước code: YAGNI → dùng lại → stdlib → platform → dep → một dòng → tối thiểu. Sửa căn nguyên, không triệu chứng: grep mọi caller, sửa hàm chung một lần. Không abstraction lạ, không dep mới, không boilerplate. Xoá > thêm. Ít file nhất. Diff ngắn nhất, chỉ sau khi hiểu vấn đề. Hỏi lại yêu cầu phức tạp. Edge-case-correct khi hoà. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
            },
            ja: {
                lite: `# Ponytail（軽量）\nコードを書く前に：本当に必要か？既にここに存在するか？標準ライブラリやインストール済み依存でカバーできるか？それから初めて：最小限を書く。再利用＞書き直し。${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                full: `# Ponytail — 怠惰なシニア開発者\n\nあなたは怠惰なシニア開発者です。怠惰＝効率的、不注意ではない。最高のコードは書かれなかったコードです。\n\nコードを書く前に、最初の段階で止まれ：\n1. これ必要か？（YAGNI）\n2. コードベースに既にあるか？再利用。\n3. 標準ライブラリでできるか？使え。\n4. プラットフォーム機能やインストール済み依存でカバー？使え。\n5. 一行でできるか？一行に。\n6. それから初めて：動く最小限。\n\nバグ修正＝根本原因、症状ではない。触る関数の全呼び出し箇所をgrep；共有関数を一箇所修正 — そこに1つのguardが呼び出し元ごとにguardを置くより小さい。\n\nルール：\n- 要求されていない抽象化は禁止。新しい依存も禁止。ボイラープレートも禁止。\n- 削除＞追加。地味＞巧妙。最小ファイル数。\n- 最短の動くdiffが勝ち — ただし問題を理解した後に限る。\n- 複雑な要求に疑問を：「Xが必要ですか、それともYで足りますか？」\n- 解決策が同点の時は、エッジケースでも正しい方を選べ。${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                ultra: `# Ponytail（超重量）\n怠惰なシニア開発者。最高のコード＝書かれなかったもの。コードの前：YAGNI→再利用→std→platform→依存→一行→最小限。根本原因修正、症状じゃない：全callerをgrep、共有関数を一箇所修正。不要な抽象化禁止、新しい依存禁止、ボイラープレート禁止。削除＞追加。最小ファイル数。最短diff、問題理解後に限る。複雑要求に疑問。同点時はedge-case正解。${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
            },
            id: {
                lite: `# Ponytail (lite)\nSebelum menulis kode: apakah perlu? Sudah ada di sini? Stdlib atau dep terinstal mencakup? Baru tulis minimal. Pakai ulang daripada tulis ulang. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                full: `# Ponytail — dev senior malas\n\nKamu adalah senior developer yang malas. Malas = efisien, bukan ceroboh. Kode terbaik adalah kode yang tidak pernah ditulis.\n\nSebelum menulis kode, berhenti di anak tangga pertama yang tepat:\n1. Apakah ini perlu? (YAGNI)\n2. Sudah ada di codebase? Pakai ulang.\n3. Stdlib melakukan ini? Pakai.\n4. Fitur platform atau dep terinstal mencakup? Pakai.\n5. Bisa satu baris? Buat satu baris.\n6. Baru tulis minimum yang bekerja.\n\nPerbaiki bug = akar masalah, bukan gejala. Grep semua pemanggil fungsi yang disentuh; perbaiki fungsi bersama sekali — satu guard di sana lebih kecil daripada satu guard per pemanggil.\n\nAturan:\n- Tanpa abstraksi yang tidak diminta. Tanpa dep baru. Tanpa boilerplate.\n- Hapus > tambah. Membosankan > cerdas. Paling sedikit file.\n- Diff terpendek menang — tapi hanya setelah paham masalah.\n- Tanyai permintaan kompleks: "Kamu perlu X, atau Y mencakup?"\n- Saat dua solusi imbang, pilih yang benar untuk edge-case. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
                ultra: `# Ponytail (ultra)\nDev senior malas. Kode terbaik = tak pernah ditulis. Sebelum kode: YAGNI → pakai ulang → stdlib → platform → dep → satu baris → minimum. Perbaiki akar, bukan gejala: grep semua caller, perbaiki fungsi bersama sekali. Tanpa abstraksi tak diminta, tanpa dep baru, tanpa boilerplate. Hapus > tambah. Paling sedikit file. Diff terpendek, hanya setelah paham masalah. Tanya permintaan kompleks. Edge-case benar saat imbang. ${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
            }
        }
    },
    "terse-cjk": {
        id: "terse-cjk",
        label: "Terse CJK (文言)",
        description: "Classical-Chinese ultra-terse style (locale-gated to zh).",
        // Ported from 9router wenyan (cavemanPrompts.js); the worked extensibility example.
        locale: "zh",
        levels: {
            lite: `回答从简，去虚词、寒暄、修饰。代码、路径、命令、错误、URL、标识符一律照原样保留。${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
            full: `以文言简体回答，惜字如金，去赘语虚词。代码、路径、命令、错误、URL、标识符照原样保留，不得改写。${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`,
            ultra: `以极简文言回答，字字千金。仅留要义。代码、API名、错误串、URL、标识符照原样保留，绝不省略或改写。${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputMode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHARED_BOUNDARIES"]}`
        }
    }
};
const OUTPUT_STYLE_IDS = Object.keys(OUTPUT_STYLE_CATALOG);
_c = OUTPUT_STYLE_IDS;
function outputStyleMeta(id) {
    return OUTPUT_STYLE_CATALOG[id];
}
var _c;
__turbopack_context__.k.register(_c, "OUTPUT_STYLE_IDS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/deriveDefaultPlan.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deriveDefaultPlan",
    ()=>deriveDefaultPlan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineCatalog.ts [app-client] (ecmascript)");
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
    const onIds = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENGINE_CATALOG"]).filter((id)=>engines[id]?.enabled === true);
    if (onIds.length === 0) return {
        mode: "off",
        stackedPipeline: []
    };
    if (onIds.length === 1 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["engineMeta"])(onIds[0]).isSingleMode) {
        return {
            mode: SINGLE_MODE_OF[onIds[0]],
            stackedPipeline: []
        };
    }
    const ordered = onIds.sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["engineMeta"])(a).stackPriority - (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["engineMeta"])(b).stackPriority);
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EngineGuidanceDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// EngineGuidanceDetail — per-engine expandable guidance block for CompressionPanel
// (#7530). Surfaces the `guidance` metadata from engineCatalog.ts (tradeoffs, lossy
// flag → "safe default" badge, cache impact) so operators can see quality/latency
// tradeoffs without leaving Settings. Extracted into its own component to keep
// CompressionPanel's per-row JSX flat (cognitive-complexity ratchet).
//
// Like the rest of the engine row, the guidance copy itself is catalog-hardcoded
// English (not i18n) so it stays deterministic; only the surrounding chrome (toggle
// button, badge, "cache impact" label) is translated.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const CACHE_IMPACT_LABEL = {
    none: "None",
    low: "Low",
    moderate: "Moderate",
    high: "High"
};
function EngineGuidanceDetail({ id, guidance, expanded, onToggle }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-1 flex flex-col gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    !guidance.lossy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "data-testid": `engine-safe-default-${id}`,
                        className: "rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500",
                        children: t("compressionGuidanceSafeDefault")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "data-testid": `engine-guidance-toggle-${id}`,
                        onClick: onToggle,
                        "aria-expanded": expanded,
                        className: "text-[10px] uppercase tracking-wider text-primary hover:underline",
                        children: expanded ? t("compressionGuidanceHide") : t("compressionGuidanceShow")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-testid": `engine-guidance-detail-${id}`,
                className: "rounded border border-border/50 bg-bg-subtle p-2 text-xs text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: guidance.tradeoffs
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-text-main",
                                children: [
                                    t("compressionGuidanceCacheImpact"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this),
                            " ",
                            CACHE_IMPACT_LABEL[guidance.cacheImpact]
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(EngineGuidanceDetail, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = EngineGuidanceDetail;
var _c;
__turbopack_context__.k.register(_c, "EngineGuidanceDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/adaptiveCompression/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/open-sse/services/compression/adaptiveCompression/computeTarget.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/context/settings/adaptiveTargetLabel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatAdaptiveTarget",
    ()=>formatAdaptiveTarget,
    "getAdaptiveTargetSummary",
    ()=>getAdaptiveTargetSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$computeTarget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/adaptiveCompression/computeTarget.ts [app-client] (ecmascript)");
;
function formatAdaptiveTarget(config, representativeModelContextLimit) {
    if (config.mode === "off") return "Adaptive context budget: off (legacy auto-trigger)";
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$computeTarget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeTarget"])(config.policy, representativeModelContextLimit, null, config);
    return `Adaptive (${config.mode}, policy: ${config.policy}) — target ≈ ${target.toLocaleString()} tokens (for a ${representativeModelContextLimit.toLocaleString()}-token window)`;
}
function getAdaptiveTargetSummary(config, representativeModelContextLimit) {
    if (config.mode === "off") return {
        enabled: false
    };
    return {
        enabled: true,
        mode: config.mode,
        policy: config.policy,
        target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$computeTarget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeTarget"])(config.policy, representativeModelContextLimit, null, config),
        contextLimit: representativeModelContextLimit
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompressionPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// CompressionPanel — the single-source engine-grid UI for compression.
//
// Renders the master on/off switch, one row per catalog engine (on/off + level +
// link to its detail page), the cavemanOutput intensity row, the mcpAccessibility
// toggle (its own endpoint / separate store), a read-only derived-pipeline preview,
// and the general settings (auto-trigger tokens + preserve-system-prompt).
//
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
// Import Card/Toggle from their direct module paths rather than the @/shared/components
// barrel: the barrel transitively pulls a heavy/Node-only module that hangs the
// vitest/jsdom component test. Direct imports resolve identically under Next.js.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/engineCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputStyles$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/outputStyles/catalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/deriveDefaultPlan.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$settings$2f$EngineGuidanceDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/context/settings/EngineGuidanceDetail.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/adaptiveCompression/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$settings$2f$adaptiveTargetLabel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/context/settings/adaptiveTargetLabel.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
const CAVEMAN_OUTPUT_LEVELS = [
    "lite",
    "full",
    "ultra"
];
const DEFAULT_CONFIG = {
    enabled: false,
    autoTriggerTokens: 0,
    preserveSystemPrompt: true,
    engines: {},
    activeComboId: null,
    cavemanOutputMode: {
        enabled: false,
        intensity: "full",
        autoClarity: true
    },
    outputStyles: [],
    ultraEngine: "heuristic",
    ultraSlmPrewarm: false,
    liveZone: {
        enabled: false
    }
};
function normalizeEngines(raw) {
    const engines = {};
    const source = raw && typeof raw === "object" ? raw : {};
    for (const id of __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENGINE_IDS"]){
        const cur = source[id];
        engines[id] = cur ? {
            enabled: cur.enabled === true,
            ...cur.level ? {
                level: cur.level
            } : {}
        } : {
            enabled: false
        };
    }
    return engines;
}
function LiveZoneToggle({ enabled, saving, onChange }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "flex items-center justify-between gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "space-y-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-sm text-text-muted",
                        children: t("compressionLiveZoneTitle")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-xs text-text-muted",
                        children: t("compressionLiveZoneDesc")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                size: "sm",
                checked: enabled,
                onChange: onChange,
                disabled: saving,
                ariaLabel: t("compressionLiveZoneTitle")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_s(LiveZoneToggle, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = LiveZoneToggle;
function AdaptiveTargetPreview({ contextBudget }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$settings$2f$adaptiveTargetLabel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdaptiveTargetSummary"])(contextBudget ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$adaptiveCompression$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONTEXT_BUDGET"], 200000);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-testid": "adaptive-target-preview",
        className: "mb-4 rounded-md border border-border/60 bg-bg-subtle px-3 py-2 text-xs text-text-muted",
        children: target.enabled ? t("compressionAdaptiveTarget", {
            mode: target.mode,
            policy: target.policy,
            target: target.target,
            contextLimit: target.contextLimit
        }) : t("compressionAdaptiveOff")
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s1(AdaptiveTargetPreview, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = AdaptiveTargetPreview;
function CompressionPanel() {
    _s2();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    // D-A6/§7: locale-gated styles (e.g. terse-cjk → zh) are only OFFERED under their locale.
    // Compare the UI language base ("zh-CN" → "zh") against the style's `locale`.
    const uiLang = ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])() || "en").split("-")[0];
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_CONFIG);
    const [mcpAccessibility, setMcpAccessibility] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // #7530 — per-engine expandable guidance (tradeoffs/lossy/cache-impact); collapsed by
    // default so the grid stays scannable.
    const [expandedGuidance, setExpandedGuidance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompressionPanel.useEffect": ()=>{
            fetch("/api/settings/compression").then({
                "CompressionPanel.useEffect": (r)=>r.ok ? r.json() : null
            }["CompressionPanel.useEffect"]).then({
                "CompressionPanel.useEffect": (data)=>{
                    if (data) {
                        setConfig({
                            ...DEFAULT_CONFIG,
                            ...data,
                            engines: normalizeEngines(data.engines),
                            cavemanOutputMode: data.cavemanOutputMode ?? DEFAULT_CONFIG.cavemanOutputMode,
                            outputStyles: data.outputStyles ?? DEFAULT_CONFIG.outputStyles
                        });
                    }
                }
            }["CompressionPanel.useEffect"]).catch({
                "CompressionPanel.useEffect": ()=>{}
            }["CompressionPanel.useEffect"]).finally({
                "CompressionPanel.useEffect": ()=>setLoading(false)
            }["CompressionPanel.useEffect"]);
            fetch("/api/settings/compression/mcp-accessibility").then({
                "CompressionPanel.useEffect": (r)=>r.ok ? r.json() : null
            }["CompressionPanel.useEffect"]).then({
                "CompressionPanel.useEffect": (data)=>{
                    if (data && typeof data.enabled === "boolean") setMcpAccessibility(data.enabled);
                }
            }["CompressionPanel.useEffect"]).catch({
                "CompressionPanel.useEffect": ()=>{}
            }["CompressionPanel.useEffect"]);
        }
    }["CompressionPanel.useEffect"], []);
    // Persist a merge-patch. The DB persists `engines` as one whole row, so callers that
    // touch an engine pass the full engines map to avoid dropping the other engines.
    const save = async (updates)=>{
        const next = {
            ...config,
            ...updates
        };
        setConfig(next);
        setSaving(true);
        setStatus("");
        try {
            const res = await fetch("/api/settings/compression", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                setStatus("saved");
                setTimeout(()=>setStatus(""), 2000);
            } else {
                setStatus("error");
            }
        } catch  {
            setStatus("error");
        } finally{
            setSaving(false);
        }
    };
    const setEngine = (id, patch)=>{
        const engines = {
            ...config.engines,
            [id]: {
                ...config.engines[id] ?? {
                    enabled: false
                },
                ...patch
            }
        };
        // Send the full engines map — the persistence layer stores it as one JSON row.
        save({
            engines
        });
    };
    const toggleGuidance = (id)=>{
        setExpandedGuidance((prev)=>({
                ...prev,
                [id]: !prev[id]
            }));
    };
    const setOutputStyle = (id, patch)=>{
        const current = config.outputStyles ?? [];
        const existing = current.find((s)=>s.id === id);
        let next = current;
        if (patch.enabled === false) {
            next = current.filter((s)=>s.id !== id);
        } else {
            const level = patch.level ?? existing?.level ?? "full";
            next = existing ? current.map((s)=>s.id === id ? {
                    id,
                    level
                } : s) : [
                ...current,
                {
                    id,
                    level
                }
            ];
        }
        // Persist in catalog order so injection order is stable.
        const ordered = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputStyles$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OUTPUT_STYLE_IDS"].flatMap((sid)=>{
            const hit = next.find((s)=>s.id === sid);
            return hit ? [
                hit
            ] : [];
        });
        save({
            outputStyles: ordered
        });
    };
    const toggleMcpAccessibility = async (enabled)=>{
        setMcpAccessibility(enabled);
        try {
            await fetch("/api/settings/compression/mcp-accessibility", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled
                })
            });
        } catch  {
        // Surface nothing — the row reflects optimistic local state; the next mount re-reads.
        }
    };
    const derived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$deriveDefaultPlan$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveDefaultPlan"])(config.engines, config.enabled);
    const derivedText = derived.mode === "off" ? t("compressionDerivedOff") : derived.stackedPipeline.length > 0 ? t("compressionDerivedRuns", {
        pipeline: derived.stackedPipeline.map((s)=>s.engine).join(" → ")
    }) : t("compressionDerivedMode", {
        mode: derived.mode
    });
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-text-muted",
                children: t("loading")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 266,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
            lineNumber: 265,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-6",
        "data-testid": "compression-panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5 flex items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg bg-blue-500/10 p-2 text-blue-500",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[20px]",
                                    "aria-hidden": "true",
                                    children: "compress"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 276,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold",
                                        children: t("compressionTitle")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 282,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-text-muted",
                                        children: t("compressionDesc")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 283,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "https://github.com/diegosouzapw/OmniRoute/blob/main/docs/compression/COMPRESSION_GUIDE.md",
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        "data-testid": "compression-guide-link",
                                        className: "mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline",
                                        children: [
                                            t("compressionGuidanceFullGuideLink"),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[12px]",
                                                "aria-hidden": "true",
                                                children: "open_in_new"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                                lineNumber: 292,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 281,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 275,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            status === "saved" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1 text-xs font-medium text-emerald-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "check_circle"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 301,
                                        columnNumber: 15
                                    }, this),
                                    " ",
                                    t("saved")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 300,
                                columnNumber: 13
                            }, this),
                            status === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1 text-xs font-medium text-red-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "error"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 307,
                                        columnNumber: 15
                                    }, this),
                                    " ",
                                    t("saveFailed")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 306,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                size: "md",
                                checked: config.enabled,
                                onChange: (enabled)=>save({
                                        enabled
                                    }),
                                disabled: saving,
                                ariaLabel: t("compressionTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 310,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 298,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 274,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-testid": "derived-pipeline-preview",
                className: "mb-4 rounded-md border border-border/60 bg-bg-subtle px-3 py-2 text-xs text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium text-text-main",
                        children: t("compressionEffectivePipeline")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 325,
                        columnNumber: 9
                    }, this),
                    " ",
                    derivedText
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 321,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdaptiveTargetPreview, {
                contextBudget: config.contextBudget
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 330,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `divide-y divide-border ${config.enabled ? "" : "opacity-60"}`,
                children: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENGINE_IDS"].map((id)=>{
                    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$engineCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["engineMeta"])(id);
                    const engine = config.engines[id] ?? {
                        enabled: false
                    };
                    const levels = meta.levels;
                    const level = engine.level ?? levels?.[0] ?? "";
                    const engineLabel = t(`compressionEngine.${id}.label`);
                    const engineDescription = t(`compressionEngine.${id}.description`);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "data-testid": `engine-row-${id}`,
                        className: "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm font-medium text-text-main",
                                        children: [
                                            engineLabel,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/dashboard/context/${id}`,
                                                className: "rounded border border-border bg-bg-subtle px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted hover:border-primary/40 hover:text-primary",
                                                children: id
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                                lineNumber: 350,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 348,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-0.5 text-xs text-text-muted",
                                        children: engineDescription
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 357,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$settings$2f$EngineGuidanceDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        id: id,
                                        guidance: meta.guidance,
                                        expanded: Boolean(expandedGuidance[id]),
                                        onToggle: ()=>toggleGuidance(id)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 358,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 347,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex shrink-0 items-center gap-2",
                                children: [
                                    levels && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: level,
                                        onChange: (e)=>setEngine(id, {
                                                level: e.target.value
                                            }),
                                        disabled: !config.enabled || !engine.enabled || saving,
                                        className: "w-28 rounded border border-border bg-surface px-2 py-1 text-xs text-text-main",
                                        children: levels.map((lvl)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: lvl,
                                                children: t(`compressionLevel.${lvl}`)
                                            }, lvl, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                                lineNumber: 374,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 367,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-testid": `engine-toggle-${id}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            size: "sm",
                                            checked: engine.enabled,
                                            onChange: (enabled)=>setEngine(id, {
                                                    enabled
                                                }),
                                            disabled: !config.enabled || saving,
                                            ariaLabel: engineLabel
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                            lineNumber: 381,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 380,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 365,
                                columnNumber: 15
                            }, this)
                        ]
                    }, id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 342,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 333,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex flex-col gap-3 border-t border-border/30 py-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-text-main",
                                children: t("compressionSettingsOutputStyles")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 398,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-xs text-text-muted",
                                children: t("compressionOutputStylesDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 401,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 397,
                        columnNumber: 9
                    }, this),
                    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputStyles$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OUTPUT_STYLE_IDS"].filter((id)=>{
                        const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputStyles$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["outputStyleMeta"])(id);
                        return !m?.locale || m.locale === uiLang;
                    }).map((id)=>{
                        const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$outputStyles$2f$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["outputStyleMeta"])(id);
                        const sel = config.outputStyles?.find((s)=>s.id === id);
                        const styleLabel = t(`compressionOutputStyle.${id}.label`);
                        const styleDescription = t(`compressionOutputStyle.${id}.description`);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "data-testid": `output-style-row-${id}`,
                            className: "flex items-center justify-between gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-text-main",
                                            children: styleLabel
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                            lineNumber: 420,
                                            columnNumber: 17
                                        }, this),
                                        meta.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: styleDescription
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                            lineNumber: 421,
                                            columnNumber: 38
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                    lineNumber: 419,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex shrink-0 items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            "data-testid": `output-style-level-${id}`,
                                            value: sel?.level ?? "full",
                                            onChange: (e)=>setOutputStyle(id, {
                                                    level: e.target.value
                                                }),
                                            disabled: !sel || saving,
                                            className: "w-28 rounded border border-border bg-surface px-2 py-1 text-xs text-text-main",
                                            children: CAVEMAN_OUTPUT_LEVELS.map((lvl)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: lvl,
                                                    children: t(`compressionLevel.${lvl}`)
                                                }, lvl, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                                    lineNumber: 434,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                            lineNumber: 424,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            "data-testid": `output-style-toggle-${id}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                size: "sm",
                                                checked: Boolean(sel),
                                                onChange: (enabled)=>setOutputStyle(id, {
                                                        enabled
                                                    }),
                                                disabled: saving,
                                                ariaLabel: styleLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                                lineNumber: 440,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                            lineNumber: 439,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                    lineNumber: 423,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, id, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                            lineNumber: 414,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 396,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex flex-col gap-3 border-t border-border/30 py-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium text-text-main",
                                children: t("compressionUltraEngine")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 458,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                "data-testid": "ultra-engine-select",
                                value: config.ultraEngine ?? "heuristic",
                                onChange: (e)=>save({
                                        ultraEngine: e.target.value === "slm" ? "slm" : "heuristic"
                                    }),
                                disabled: saving,
                                className: "w-44 rounded border border-border bg-surface px-2 py-1 text-sm text-text-main",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "heuristic",
                                        children: t("compressionUltraEngineHeuristic")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 466,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "slm",
                                        children: t("compressionUltraEngineSlm")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 467,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 459,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 457,
                        columnNumber: 9
                    }, this),
                    config.ultraEngine === "slm" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t("compressionUltraSlmHint")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 473,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-text-muted",
                                        children: t("compressionUltraSlmPrewarm")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 475,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "data-testid": "ultra-slm-prewarm-toggle",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            size: "sm",
                                            checked: config.ultraSlmPrewarm ?? false,
                                            onChange: (ultraSlmPrewarm)=>save({
                                                    ultraSlmPrewarm
                                                }),
                                            disabled: saving,
                                            ariaLabel: t("compressionUltraSlmPrewarm")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                            lineNumber: 477,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 476,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 474,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 456,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2 border-t border-border/30 py-3 sm:flex-row sm:items-center sm:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-text-main",
                                children: t("mcpAccessibilityTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 493,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-xs text-text-muted",
                                children: t("mcpAccessibilityDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 494,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 492,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "data-testid": "mcp-accessibility-toggle",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            size: "sm",
                            checked: mcpAccessibility,
                            onChange: toggleMcpAccessibility,
                            ariaLabel: t("mcpAccessibilityTitle")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                            lineNumber: 497,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 496,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 491,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 border-t border-border/30 pt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-sm font-medium text-text-main",
                        children: t("compressionGeneral")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 508,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-text-muted",
                                children: t("compressionAutoTrigger")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 510,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: 0,
                                        max: 100000,
                                        value: config.autoTriggerTokens,
                                        onChange: (e)=>save({
                                                autoTriggerTokens: parseInt(e.target.value) || 0
                                            }),
                                        className: "w-24 rounded border border-border bg-surface px-2 py-1 text-sm text-text-main"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 512,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted",
                                        children: t("tokens")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 520,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 511,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 509,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-text-muted",
                                children: t("compressionPreserveSystem")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 524,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: config.preserveSystemPromptMode ?? (config.preserveSystemPrompt === false ? "whenNoCache" : "always"),
                                onChange: (e)=>save({
                                        preserveSystemPromptMode: e.target.value
                                    }),
                                disabled: saving,
                                "aria-label": t("compressionPreserveSystem"),
                                "data-testid": "preserve-system-mode-select",
                                className: "w-36 rounded border border-border bg-surface px-2 py-1 text-sm text-text-main",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "always",
                                        children: t("compressionPreserveSystemAlways")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 540,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "whenNoCache",
                                        children: t("compressionPreserveSystemWhenNoCache")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 541,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "never",
                                        children: t("compressionPreserveSystemNever")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                        lineNumber: 542,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                                lineNumber: 525,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 523,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveZoneToggle, {
                        enabled: config.liveZone?.enabled === true,
                        saving: saving,
                        onChange: (enabled)=>save({
                                liveZone: {
                                    enabled
                                }
                            })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                        lineNumber: 545,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx",
        lineNumber: 272,
        columnNumber: 5
    }, this);
}
_s2(CompressionPanel, "fWhBcjE6dYHRpYxZLzyKBdmg2zU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c2 = CompressionPanel;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "LiveZoneToggle");
__turbopack_context__.k.register(_c1, "AdaptiveTargetPreview");
__turbopack_context__.k.register(_c2, "CompressionPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompressionStylesTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const EMPTY = {
    totalRuns: 0,
    totalTokensSaved: 0,
    runsWithStyles: 0,
    bypassCount: 0,
    totalOutputTokens: 0,
    appliedStyleCounts: {}
};
function CompressionStylesTile() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompressionStylesTile.useEffect": ()=>{
            fetch("/api/settings/compression/run-telemetry").then({
                "CompressionStylesTile.useEffect": (r)=>r.ok ? r.json() : null
            }["CompressionStylesTile.useEffect"]).then({
                "CompressionStylesTile.useEffect": (data)=>{
                    if (data) setSummary(data);
                }
            }["CompressionStylesTile.useEffect"]).catch({
                "CompressionStylesTile.useEffect": ()=>{}
            }["CompressionStylesTile.useEffect"]);
        }
    }["CompressionStylesTile.useEffect"], []);
    const styles = Object.entries(summary.appliedStyleCounts);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-testid": "compression-styles-tile",
        className: "rounded-lg border border-border/40 bg-surface p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-text-main",
                children: t("compressionStylesTileTitle")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-2xl font-semibold text-text-main",
                children: summary.totalTokensSaved.toLocaleString(locale, {
                    useGrouping: false
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-text-muted",
                children: t("compressionStylesTileSummary", {
                    tokens: summary.totalTokensSaved,
                    runs: summary.runsWithStyles
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex flex-wrap gap-1",
                children: styles.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-text-muted",
                    children: t("compressionStylesTileEmpty")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
                    lineNumber: 57,
                    columnNumber: 11
                }, this) : styles.map(([id, count])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded bg-border/30 px-2 py-0.5 text-xs text-text-main",
                        children: [
                            id,
                            " · ",
                            count
                        ]
                    }, id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
                        lineNumber: 60,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(CompressionStylesTile, "ZBDmNikMAn+KBN2Dmo/N59Lj3iM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c = CompressionStylesTile;
var _c;
__turbopack_context__.k.register(_c, "CompressionStylesTile");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/context/settings/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompressionSettingsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$settings$2f$CompressionPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/context/settings/CompressionPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$CompressionStylesTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/context/CompressionStylesTile.tsx [app-client] (ecmascript)");
"use client";
;
;
;
function CompressionSettingsPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4 p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$settings$2f$CompressionPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/page.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$CompressionStylesTile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/page.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/settings/page.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = CompressionSettingsPage;
var _c;
__turbopack_context__.k.register(_c, "CompressionSettingsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0mx18i7._.js.map