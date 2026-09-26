module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
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
"[project]/open-sse/services/ccBridgeTransforms.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CCH_POSITIONS",
    ()=>CCH_POSITIONS,
    "CCH_SALT",
    ()=>CCH_SALT,
    "CLAUDE_AGENT_SDK_IDENTITY",
    ()=>CLAUDE_AGENT_SDK_IDENTITY,
    "DEFAULT_CC_BRIDGE_PIPELINE",
    ()=>DEFAULT_CC_BRIDGE_PIPELINE,
    "DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG",
    ()=>DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG,
    "DEFAULT_CLAUDE_CODE_VERSION",
    ()=>DEFAULT_CLAUDE_CODE_VERSION,
    "DEFAULT_IDENTITY_PREFIXES",
    ()=>DEFAULT_IDENTITY_PREFIXES,
    "DEFAULT_PARAGRAPH_REMOVAL_ANCHORS",
    ()=>DEFAULT_PARAGRAPH_REMOVAL_ANCHORS,
    "DEFAULT_TEXT_REPLACEMENTS",
    ()=>DEFAULT_TEXT_REPLACEMENTS,
    "applyCcBridgeTransformPipeline",
    ()=>applyCcBridgeTransformPipeline,
    "buildBillingHeaderValue",
    ()=>buildBillingHeaderValue,
    "computeCchSha256FirstUser",
    ()=>computeCchSha256FirstUser,
    "computeDaystampVersionSuffix",
    ()=>computeDaystampVersionSuffix,
    "computeExMachinaVersionSuffix",
    ()=>computeExMachinaVersionSuffix,
    "extractFirstUserMessageText",
    ()=>extractFirstUserMessageText,
    "getCcBridgeTransformsConfig",
    ()=>getCcBridgeTransformsConfig,
    "resetCcBridgeTransformsConfig",
    ()=>resetCcBridgeTransformsConfig,
    "setCcBridgeTransformsConfig",
    ()=>setCcBridgeTransformsConfig
]);
/**
 * CC Bridge Transforms — config-driven request body normalization for the
 * Claude Code Compatible (`anthropic-compatible-cc-*`) bridge.
 *
 * Goal: ensure the final request body OmniRoute sends to Anthropic's
 * `/v1/messages?beta=true` endpoint has classifier-correct structure
 * regardless of which client (OpenCode, Cline, Cursor, Continue, raw API
 * consumer) supplied the prompt.
 *
 * Approach: an ordered pipeline of declarative `TransformOp` entries that
 * mutate the request body in place. Each op is idempotent; the executor is
 * pure (no I/O); new defenses can be added through Settings UI by appending
 * a new op — no new TypeScript needed.
 *
 * Reference implementation: ex-machina/opencode-anthropic-auth `transform.ts`
 * and `cch.ts`. Ported with the same defaults (paragraph anchors, identity
 * prefixes, text replacements, billing header algorithm) but generalised
 * behind a discriminated-union DSL so future fingerprints are configurable.
 *
 * Related: OmniRoute issue #2260.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [app-route] (ecmascript)");
;
;
const CCH_SALT = "59cf53e54c78";
const CCH_POSITIONS = [
    4,
    7,
    20
];
const DEFAULT_CLAUDE_CODE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_AGENT_SDK_IDENTITY = "You are a Claude agent, built on Anthropic's Claude Agent SDK.";
const DEFAULT_PARAGRAPH_REMOVAL_ANCHORS = [
    "github.com/anomalyco/opencode",
    "opencode.ai/docs",
    "github.com/cline/cline",
    "github.com/getcursor/cursor",
    "continue.dev"
];
const DEFAULT_IDENTITY_PREFIXES = [
    "You are OpenCode"
];
const DEFAULT_TEXT_REPLACEMENTS = [
    {
        match: "if OpenCode honestly",
        replacement: "if the assistant honestly"
    },
    {
        match: "Here is some useful information about the environment you are running in:",
        replacement: "Environment context you are running in:"
    }
];
const DEFAULT_CC_BRIDGE_PIPELINE = [
    // Sanitize caller-supplied system blocks first so dropped paragraphs do not
    // accidentally contain a stale billing header from a previous pass.
    {
        kind: "drop_paragraph_if_contains",
        needles: [
            ...DEFAULT_PARAGRAPH_REMOVAL_ANCHORS
        ]
    },
    {
        kind: "drop_paragraph_if_starts_with",
        prefixes: [
            ...DEFAULT_IDENTITY_PREFIXES
        ]
    },
    ...DEFAULT_TEXT_REPLACEMENTS.map((r)=>({
            kind: "replace_text",
            match: r.match,
            replacement: r.replacement,
            allOccurrences: true
        })),
    // Then prepend the SDK identity (becomes block[1] after billing prepend).
    {
        kind: "prepend_system_block",
        text: CLAUDE_AGENT_SDK_IDENTITY,
        idempotencyKey: "claude-agent-sdk-identity"
    },
    // Billing header always lands at block[0] — matches T4-200 fixture layout.
    {
        kind: "inject_billing_header",
        entrypoint: "sdk-cli",
        versionFormat: "ex-machina",
        cchAlgo: "sha256-first-user",
        buildRevision: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_BUILD_REVISION"]
    }
];
const DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG = {
    enabled: true,
    pipeline: DEFAULT_CC_BRIDGE_PIPELINE
};
function extractFirstUserMessageText(messages) {
    if (!Array.isArray(messages)) return "";
    for (const msg of messages){
        if (msg?.role !== "user") continue;
        if (typeof msg.content === "string") return msg.content;
        if (Array.isArray(msg.content)) {
            for (const block of msg.content){
                if (block?.type === "text" && typeof block.text === "string") {
                    return block.text;
                }
            }
        }
    }
    return "";
}
function sha256Hex(input) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(input, "utf8").digest("hex");
}
function pickCharsAtPositions(text, positions) {
    return positions.map((p)=>typeof text[p] === "string" ? text[p] : "\0").join("");
}
function computeExMachinaVersionSuffix(firstUserText, version) {
    const picks = pickCharsAtPositions(firstUserText, CCH_POSITIONS);
    return sha256Hex(`${CCH_SALT}${picks}${version}`).slice(0, 3);
}
function computeDaystampVersionSuffix(version, now = new Date()) {
    const dayStamp = now.toISOString().slice(0, 10);
    return sha256Hex(`${dayStamp}${version}`).slice(0, 3);
}
function computeCchSha256FirstUser(firstUserText) {
    return sha256Hex(firstUserText).slice(0, 5);
}
function buildBillingHeaderValue(messages, options) {
    const version = options.version || DEFAULT_CLAUDE_CODE_VERSION;
    const firstUserText = extractFirstUserMessageText(messages);
    const suffix = options.buildRevision ?? (options.versionFormat === "omniroute-daystamp" ? computeDaystampVersionSuffix(version, options.now) : computeExMachinaVersionSuffix(firstUserText, version));
    let cch;
    switch(options.cchAlgo){
        case "sha256-first-user":
            cch = computeCchSha256FirstUser(firstUserText);
            break;
        case "xxhash64-body":
        case "static-zero":
        default:
            cch = "00000";
            break;
    }
    return `x-anthropic-billing-header: cc_version=${version}.${suffix}; cc_entrypoint=${options.entrypoint}; cch=${cch};`;
}
function normalizeSystemToBlocks(system) {
    if (system === null || system === undefined) return [];
    if (typeof system === "string") {
        return system.length > 0 ? [
            {
                type: "text",
                text: system
            }
        ] : [];
    }
    if (Array.isArray(system)) {
        return system.filter((b)=>!!b && typeof b === "object").map((b)=>({
                ...b
            }));
    }
    if (typeof system === "object") {
        const block = system;
        return block && typeof block.text === "string" ? [
            {
                ...block
            }
        ] : [];
    }
    return [];
}
function isTextBlock(block) {
    return block.type === "text" && typeof block.text === "string";
}
function containsString(haystack, needle, caseSensitive) {
    if (caseSensitive) return haystack.includes(needle);
    return haystack.toLowerCase().includes(needle.toLowerCase());
}
function startsWithString(haystack, prefix, caseSensitive) {
    if (caseSensitive) return haystack.startsWith(prefix);
    return haystack.toLowerCase().startsWith(prefix.toLowerCase());
}
// ────────────────────────────────────────────────────────────────────────────
// Op executors
// ────────────────────────────────────────────────────────────────────────────
function applyDropParagraphIfContains(blocks, op) {
    const caseSensitive = op.caseSensitive !== false;
    const needles = op.needles || [];
    if (needles.length === 0) return blocks;
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        const paragraphs = block.text.split(/\n\n+/);
        const filtered = paragraphs.filter((p)=>!needles.some((n)=>containsString(p, n, caseSensitive)));
        return {
            ...block,
            text: filtered.join("\n\n")
        };
    });
}
function applyDropParagraphIfStartsWith(blocks, op) {
    const caseSensitive = op.caseSensitive !== false;
    const prefixes = op.prefixes || [];
    if (prefixes.length === 0) return blocks;
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        const paragraphs = block.text.split(/\n\n+/);
        const filtered = paragraphs.filter((p)=>!prefixes.some((prefix)=>startsWithString(p.trimStart(), prefix, caseSensitive)));
        return {
            ...block,
            text: filtered.join("\n\n")
        };
    });
}
function applyReplaceText(blocks, op) {
    if (!op.match) return blocks;
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        if (!block.text.includes(op.match)) return block;
        let next = block.text;
        if (op.allOccurrences) {
            next = next.split(op.match).join(op.replacement);
        } else {
            next = next.replace(op.match, op.replacement);
        }
        return {
            ...block,
            text: next
        };
    });
}
function applyReplaceRegex(blocks, op) {
    if (!op.pattern) return blocks;
    let regex;
    try {
        regex = new RegExp(op.pattern, op.flags ?? "u");
    } catch  {
        return blocks;
    }
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        return {
            ...block,
            text: block.text.replace(regex, op.replacement)
        };
    });
}
function applyDropBlockIfContains(blocks, op) {
    const needles = op.needles || [];
    if (needles.length === 0) return blocks;
    return blocks.filter((block)=>{
        if (!isTextBlock(block)) return true;
        return !needles.some((n)=>block.text.includes(n));
    });
}
function applyPrependSystemBlock(blocks, op) {
    if (!op.text) return blocks;
    // Idempotency: skip if any text block already starts with idempotencyKey (when
    // set) or with op.text itself (default). Scans ALL blocks, not just the first.
    const prefix = op.idempotencyKey ?? op.text;
    const alreadyPresent = blocks.some((b)=>isTextBlock(b) && b.text.startsWith(prefix));
    if (alreadyPresent) return blocks;
    return [
        {
            type: "text",
            text: op.text
        },
        ...blocks
    ];
}
function applyAppendSystemBlock(blocks, op) {
    if (!op.text) return blocks;
    // Idempotency: skip if any text block already starts with idempotencyKey (when
    // set) or is an exact match of op.text (default). Scans ALL blocks.
    const prefix = op.idempotencyKey;
    const alreadyPresent = prefix ? blocks.some((b)=>isTextBlock(b) && b.text.startsWith(prefix)) : blocks.some((b)=>isTextBlock(b) && b.text === op.text);
    if (alreadyPresent) return blocks;
    return [
        ...blocks,
        {
            type: "text",
            text: op.text
        }
    ];
}
function applyInjectBillingHeader(body, blocks, op) {
    // No user message → no billing header (ex-machina parity, transform.ts:340).
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const hasUser = messages.some((m)=>m?.role === "user");
    if (!hasUser) return blocks;
    const headerValue = buildBillingHeaderValue(messages, {
        entrypoint: op.entrypoint,
        versionFormat: op.versionFormat,
        cchAlgo: op.cchAlgo,
        version: op.version,
        buildRevision: op.buildRevision
    });
    // Idempotency: replace any existing billing header block (ex-machina + native
    // OAuth path both rebuild on retry; see executors/base.ts issue #1712).
    const headerPrefix = "x-anthropic-billing-header:";
    const filtered = blocks.filter((b)=>!(isTextBlock(b) && b.text.startsWith(headerPrefix)));
    return [
        {
            type: "text",
            text: headerValue
        },
        ...filtered
    ];
}
function applyCcBridgeTransformPipeline(body, config = getCcBridgeTransformsConfig()) {
    if (!body || typeof body !== "object") {
        return {
            body,
            appliedOpKinds: []
        };
    }
    if (!config.enabled || !Array.isArray(config.pipeline) || config.pipeline.length === 0) {
        return {
            body,
            appliedOpKinds: []
        };
    }
    let blocks = normalizeSystemToBlocks(body.system);
    const appliedOpKinds = [];
    for (const op of config.pipeline){
        switch(op.kind){
            case "drop_paragraph_if_contains":
                blocks = applyDropParagraphIfContains(blocks, op);
                break;
            case "drop_paragraph_if_starts_with":
                blocks = applyDropParagraphIfStartsWith(blocks, op);
                break;
            case "replace_text":
                blocks = applyReplaceText(blocks, op);
                break;
            case "replace_regex":
                blocks = applyReplaceRegex(blocks, op);
                break;
            case "drop_block_if_contains":
                blocks = applyDropBlockIfContains(blocks, op);
                break;
            case "prepend_system_block":
                blocks = applyPrependSystemBlock(blocks, op);
                break;
            case "append_system_block":
                blocks = applyAppendSystemBlock(blocks, op);
                break;
            case "inject_billing_header":
                blocks = applyInjectBillingHeader(body, blocks, op);
                break;
            default:
                {
                    continue;
                }
        }
        appliedOpKinds.push(op.kind);
    }
    // Drop empty text blocks left behind by paragraph removal (matches
    // ex-machina sanitizeSystemText trim semantics).
    blocks = blocks.filter((b)=>!isTextBlock(b) || b.text.length > 0);
    body.system = blocks;
    return {
        body,
        appliedOpKinds
    };
}
// ────────────────────────────────────────────────────────────────────────────
// Runtime singleton (mirrors cliFingerprints `_cliCompatProviders` pattern).
// ────────────────────────────────────────────────────────────────────────────
let _runtimeConfig = DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG;
function setCcBridgeTransformsConfig(config) {
    if (!config) {
        _runtimeConfig = DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG;
        return;
    }
    _runtimeConfig = {
        enabled: config.enabled !== false,
        pipeline: Array.isArray(config.pipeline) ? config.pipeline : DEFAULT_CC_BRIDGE_PIPELINE
    };
}
function getCcBridgeTransformsConfig() {
    return _runtimeConfig;
}
function resetCcBridgeTransformsConfig() {
    _runtimeConfig = DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG;
}
}),
"[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE",
    ()=>DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE,
    "DEFAULT_CLAUDE_PIPELINE",
    ()=>DEFAULT_CLAUDE_PIPELINE,
    "DEFAULT_OBFUSCATE_WORDS",
    ()=>DEFAULT_OBFUSCATE_WORDS,
    "DEFAULT_SYSTEM_TRANSFORMS_CONFIG",
    ()=>DEFAULT_SYSTEM_TRANSFORMS_CONFIG,
    "HERMES_IDENTITY_PREFIXES",
    ()=>HERMES_IDENTITY_PREFIXES,
    "HERMES_PARAGRAPH_ANCHORS",
    ()=>HERMES_PARAGRAPH_ANCHORS,
    "OPENWEBUI_IDENTITY_PREFIXES",
    ()=>OPENWEBUI_IDENTITY_PREFIXES,
    "OPENWEBUI_PARAGRAPH_ANCHORS",
    ()=>OPENWEBUI_PARAGRAPH_ANCHORS,
    "PI_PARAGRAPH_ANCHORS",
    ()=>PI_PARAGRAPH_ANCHORS,
    "PROVIDER_CC_BRIDGE",
    ()=>PROVIDER_CC_BRIDGE,
    "PROVIDER_CLAUDE",
    ()=>PROVIDER_CLAUDE,
    "applySystemTransformPipeline",
    ()=>applySystemTransformPipeline,
    "applyTransformPipeline",
    ()=>applyTransformPipeline,
    "getSystemTransformsConfig",
    ()=>getSystemTransformsConfig,
    "resetSystemTransformsConfig",
    ()=>resetSystemTransformsConfig,
    "setSystemTransformsConfig",
    ()=>setSystemTransformsConfig
]);
/**
 * System Transforms — generic, per-provider, config-driven body normalization.
 *
 * Generalises the CC-bridge-only transforms (`ccBridgeTransforms.ts`) into
 * a per-provider registry so the same pipeline DSL can run against ANY
 * provider's request body: native `claude` OAuth, `anthropic-compatible-cc-*`
 * bridge, `gemini`, `codex`, `openai`, etc.
 *
 * Each provider has its own `{ enabled, pipeline }`. Defaults shipped:
 *   - `claude`: obfuscate_words ON (adds Open WebUI words on top of native
 *     ZWJ pass). Billing+sentinel handled by native code (executors/base.ts
 *     :753-782); DSL on this path does NOT inject billing.
 *   - `anthropic-compatible-cc-*`: full T4-200 pipeline (anchors + identity
 *     prefixes + replacements + prepend identity + inject_billing_header).
 *   - all other providers: `{ enabled: false, pipeline: [] }`.
 *
 * Adds a new op kind `obfuscate_words` (ZWJ insertion driven by configurable
 * word list, replaces the hardcoded `claudeCodeObfuscation.ts` defaults for
 * users who opt-in).
 *
 * Migration: legacy `ccBridgeTransforms` config (single-pipeline shape) is
 * accepted and normalized into `systemTransforms.providers["anthropic-compatible-cc-*"]`.
 *
 * Reference: OmniRoute issue #2260 + comment 4459544580 (Open WebUI bypass).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccBridgeTransforms.ts [app-route] (ecmascript)");
;
;
const DEFAULT_OBFUSCATE_WORDS = [
    // legacy hardcoded set
    "opencode",
    "open-code",
    "cline",
    "roo-cline",
    "roo_cline",
    "cursor",
    "windsurf",
    "aider",
    "continue.dev",
    "copilot",
    "avante",
    "codecompanion",
    // Open WebUI additions
    "openwebui",
    "open-webui",
    // Hermes additions (#8350)
    "hermes-agent",
    "hermes"
];
const OPENWEBUI_PARAGRAPH_ANCHORS = [
    "github.com/open-webui/open-webui",
    "openwebui.com",
    "docs.openwebui.com"
];
const OPENWEBUI_IDENTITY_PREFIXES = [
    "You are Open WebUI"
];
const PI_PARAGRAPH_ANCHORS = [
    "@earendil-works/pi-coding-agent",
    "/.pi/",
    "Pi documentation (read only when the user asks about pi itself"
];
const HERMES_PARAGRAPH_ANCHORS = [
    "hermes-agent.nousresearch.com",
    "github.com/NousResearch/hermes-agent"
];
const HERMES_IDENTITY_PREFIXES = [
    "You are Hermes Agent"
];
const PROVIDER_CLAUDE = "claude";
const PROVIDER_CC_BRIDGE = "anthropic-compatible-cc";
const DEFAULT_CLAUDE_PIPELINE = [
    // Drop paragraphs containing 3rd-party-agent anchors (anomalyco/opencode,
    // opencode.ai/docs, cline, getcursor/cursor, continue.dev, Open WebUI, Pi docs).
    {
        kind: "drop_paragraph_if_contains",
        needles: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_PARAGRAPH_REMOVAL_ANCHORS"],
            ...OPENWEBUI_PARAGRAPH_ANCHORS,
            ...PI_PARAGRAPH_ANCHORS,
            ...HERMES_PARAGRAPH_ANCHORS
        ]
    },
    // Drop "You are OpenCode" + "You are Open WebUI" + "You are Hermes Agent"
    // identity paragraphs.
    {
        kind: "drop_paragraph_if_starts_with",
        prefixes: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_IDENTITY_PREFIXES"],
            ...OPENWEBUI_IDENTITY_PREFIXES,
            ...HERMES_IDENTITY_PREFIXES
        ]
    },
    // Replace the "Here is some useful information about the environment you are
    // running in:" billing-gate trigger phrase + the "if OpenCode honestly"
    // phrase-shape filter (DEFAULT_TEXT_REPLACEMENTS from ccBridgeTransforms.ts).
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TEXT_REPLACEMENTS"].map((r)=>({
            kind: "replace_text",
            match: r.match,
            replacement: r.replacement,
            allOccurrences: true
        })),
    // ZWJ obfuscation of sensitive client words (opencode, cline, cursor, …,
    // openwebui). Layers on top of the legacy `obfuscateInBody` pass at
    // `executors/base.ts:622` (which only covers `DEFAULT_SENSITIVE_WORDS`).
    {
        kind: "obfuscate_words",
        words: [
            ...DEFAULT_OBFUSCATE_WORDS
        ],
        targets: [
            "system",
            "messages",
            "tools"
        ]
    }
];
const DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE = [
    // Extra Open WebUI anchors (the base pipeline only carries OpenCode/Cline/
    // Cursor/Continue anchors).
    {
        kind: "drop_paragraph_if_contains",
        needles: [
            ...OPENWEBUI_PARAGRAPH_ANCHORS
        ]
    },
    {
        kind: "drop_paragraph_if_starts_with",
        prefixes: [
            ...OPENWEBUI_IDENTITY_PREFIXES
        ]
    },
    // ZWJ obfuscate Open WebUI words across system+messages+tools.
    {
        kind: "obfuscate_words",
        words: [
            "openwebui",
            "open-webui"
        ],
        targets: [
            "system",
            "messages",
            "tools"
        ]
    },
    // Base CC bridge pipeline (anchors + identity prefixes + replacements +
    // prepend SDK identity + inject billing header).
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_CC_BRIDGE_PIPELINE"]
];
const DEFAULT_SYSTEM_TRANSFORMS_CONFIG = {
    providers: {
        [PROVIDER_CLAUDE]: {
            // Enabled by default — matches the module-level docstring ("claude:
            // obfuscate_words ON …") and closes the native-OAuth third-party-agent
            // leak that surfaces as `[400] Third-party apps now draw from extra
            // usage` when opencode (or any non-claude-cli client) hits OmniRoute's
            // `/v1/chat/completions` endpoint with a `claude/*` model slug. User
            // overrides via Settings UI (setSystemTransformsConfig) still win.
            enabled: true,
            pipeline: DEFAULT_CLAUDE_PIPELINE
        },
        [PROVIDER_CC_BRIDGE]: {
            enabled: true,
            pipeline: DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE
        }
    }
};
// ────────────────────────────────────────────────────────────────────────────
// Op: obfuscate_words (the only op kind beyond the base set).
// ────────────────────────────────────────────────────────────────────────────
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const ZWJ = "\u200d";
function obfuscateWord(word) {
    if (word.length <= 1) return word;
    return word[0] + ZWJ + word.slice(1);
}
/**
 * Stateless variant of `obfuscateSensitiveWords` — uses the supplied word
 * list instead of the module-level singleton, so concurrent requests with
 * different op configs do not race.
 */ // Per-word regex cache: obfuscateWithList runs over the whole request body on every
// request when obfuscation is enabled, recompiling one RegExp per word each time. The
// word list is stable per op config, so memoize. Bounded by distinct configured words
// (with a defensive cap). Global regexes are safe to reuse: String.replace resets lastIndex.
const _obfuscationRegexCache = new Map();
function getObfuscationRegex(word) {
    let regex = _obfuscationRegexCache.get(word);
    if (!regex) {
        if (_obfuscationRegexCache.size > 2000) _obfuscationRegexCache.clear();
        regex = new RegExp(escapeRegex(word), "gi");
        _obfuscationRegexCache.set(word, regex);
    }
    return regex;
}
function obfuscateWithList(text, words) {
    if (!text || words.length === 0) return text;
    let result = text;
    for (const word of words){
        if (!word) continue;
        const regex = getObfuscationRegex(word);
        result = result.replace(regex, (match)=>obfuscateWord(match));
    }
    return result;
}
function applyObfuscateWords(body, op) {
    const words = op.words || [];
    if (words.length === 0) return;
    const targets = op.targets && op.targets.length > 0 ? op.targets : [
        "system",
        "messages",
        "tools"
    ];
    if (targets.includes("system")) {
        if (typeof body.system === "string") {
            body.system = obfuscateWithList(body.system, words);
        } else if (Array.isArray(body.system)) {
            for (const block of body.system){
                if (typeof block.text === "string") {
                    block.text = obfuscateWithList(block.text, words);
                }
            }
        }
    }
    if (targets.includes("messages") && Array.isArray(body.messages)) {
        for (const msg of body.messages){
            const content = msg.content;
            if (typeof content === "string") {
                msg.content = obfuscateWithList(content, words);
            } else if (Array.isArray(content)) {
                // A signed Anthropic thinking turn covers its text siblings too. Leave
                // the entire turn byte-for-byte intact so its signature remains valid.
                const blocks = content;
                const hasSignedThinking = blocks.some((block)=>block?.type === "thinking" || block?.type === "redacted_thinking");
                if (!hasSignedThinking) {
                    for (const block of blocks){
                        if (typeof block.text === "string") {
                            block.text = obfuscateWithList(block.text, words);
                        }
                    }
                }
            }
        }
    }
    if (targets.includes("tools") && Array.isArray(body.tools)) {
        for (const tool of body.tools){
            if (typeof tool.description === "string") {
                tool.description = obfuscateWithList(tool.description, words);
            }
            const fn = tool.function;
            if (fn && typeof fn.description === "string") {
                fn.description = obfuscateWithList(fn.description, words);
            }
        }
    }
}
function isObfuscateWordsOp(op) {
    return op.kind === "obfuscate_words";
}
function applyTransformPipeline(body, pipeline) {
    if (!body || typeof body !== "object") return {
        body,
        appliedOpKinds: []
    };
    if (!Array.isArray(pipeline) || pipeline.length === 0) {
        return {
            body,
            appliedOpKinds: []
        };
    }
    const appliedOpKinds = [];
    let baseRun = [];
    const flushBaseRun = ()=>{
        if (baseRun.length === 0) return;
        const config = {
            enabled: true,
            pipeline: baseRun
        };
        // Local `RequestBody` interface is intentionally looser than the strict one
        // exported by ccBridgeTransforms — system transforms accept any shape.
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyCcBridgeTransformPipeline"])(body, config);
        appliedOpKinds.push(...result.appliedOpKinds);
        baseRun = [];
    };
    for (const op of pipeline){
        if (isObfuscateWordsOp(op)) {
            flushBaseRun();
            applyObfuscateWords(body, op);
            appliedOpKinds.push(op.kind);
        } else {
            baseRun.push(op);
        }
    }
    flushBaseRun();
    return {
        body,
        appliedOpKinds
    };
}
function applySystemTransformPipeline(providerId, body, config = getSystemTransformsConfig()) {
    if (!body || typeof body !== "object") return {
        body,
        appliedOpKinds: []
    };
    if (!config || !config.providers) return {
        body,
        appliedOpKinds: []
    };
    const providerConfig = resolveProviderConfig(providerId, config);
    if (!providerConfig || !providerConfig.enabled) {
        return {
            body,
            appliedOpKinds: []
        };
    }
    return applyTransformPipeline(body, providerConfig.pipeline);
}
function resolveProviderConfig(providerId, config) {
    if (!providerId) return undefined;
    const exact = config.providers[providerId];
    if (exact) return exact;
    // CC bridge providers (anthropic-compatible-cc-*) all share one config.
    if (providerId.startsWith(`${PROVIDER_CC_BRIDGE}-`) || providerId === PROVIDER_CC_BRIDGE) {
        return config.providers[PROVIDER_CC_BRIDGE];
    }
    return undefined;
}
// ────────────────────────────────────────────────────────────────────────────
// Runtime singleton.
// ────────────────────────────────────────────────────────────────────────────
// Backed by globalThis so the config is shared across the SEPARATE webpack module
// graphs Next.js builds for `instrumentation.ts` (boot-time hydration via
// applyRuntimeSettings → setSystemTransformsConfig) and the app-route / open-sse
// executors (per-request reads in base.ts / claudeCodeCompatible.ts). A module-local
// `let` is duplicated per graph, so a Settings-UI override applied at boot never
// reaches the request path (the #5312-class module-graph bug; the protective
// compiled default still runs, but operator customizations were silently dropped).
// Mirrors systemPrompt.ts (#2470) and thinkingBudget.ts (#5312).
const GLOBAL_KEY = "__omniroute_systemTransforms_config__";
const _store = globalThis;
function getStore() {
    if (!_store[GLOBAL_KEY]) {
        _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
    }
    return _store[GLOBAL_KEY];
}
function setSystemTransformsConfig(input) {
    if (!input || typeof input !== "object") {
        _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
        return;
    }
    const candidate = input;
    // Legacy shape: { enabled, pipeline } → migrate to per-provider map.
    if ("pipeline" in candidate && Array.isArray(candidate.pipeline)) {
        _store[GLOBAL_KEY] = {
            providers: {
                ...DEFAULT_SYSTEM_TRANSFORMS_CONFIG.providers,
                [PROVIDER_CC_BRIDGE]: {
                    enabled: candidate.enabled !== false,
                    pipeline: candidate.pipeline
                }
            }
        };
        return;
    }
    // Per-provider shape: { providers: Record<string, { enabled, pipeline }> }
    if ("providers" in candidate && candidate.providers && typeof candidate.providers === "object") {
        const next = {
            providers: {}
        };
        const providers = candidate.providers;
        for (const [providerId, providerEntry] of Object.entries(providers)){
            if (!providerEntry || typeof providerEntry !== "object") continue;
            const entry = providerEntry;
            next.providers[providerId] = {
                enabled: entry.enabled !== false,
                pipeline: Array.isArray(entry.pipeline) ? entry.pipeline : []
            };
        }
        // Merge defaults for any unset provider — keeps ZWJ on by default even
        // when the user only configured one provider explicitly.
        for (const [providerId, providerDefault] of Object.entries(DEFAULT_SYSTEM_TRANSFORMS_CONFIG.providers)){
            if (!next.providers[providerId]) {
                next.providers[providerId] = providerDefault;
            }
        }
        _store[GLOBAL_KEY] = next;
        return;
    }
    _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
}
function getSystemTransformsConfig() {
    return getStore();
}
function resetSystemTransformsConfig() {
    _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
}
}),
"[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_AGENT_SDK_IDENTITY",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_AGENT_SDK_IDENTITY"],
    "DEFAULT_CC_BRIDGE_PIPELINE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_CC_BRIDGE_PIPELINE"],
    "DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE"],
    "DEFAULT_CLAUDE_PIPELINE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CLAUDE_PIPELINE"],
    "DEFAULT_IDENTITY_PREFIXES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_IDENTITY_PREFIXES"],
    "DEFAULT_OBFUSCATE_WORDS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_OBFUSCATE_WORDS"],
    "DEFAULT_PARAGRAPH_REMOVAL_ANCHORS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_PARAGRAPH_REMOVAL_ANCHORS"],
    "DEFAULT_SYSTEM_TRANSFORMS_CONFIG",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_SYSTEM_TRANSFORMS_CONFIG"],
    "DEFAULT_TEXT_REPLACEMENTS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TEXT_REPLACEMENTS"],
    "HERMES_IDENTITY_PREFIXES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HERMES_IDENTITY_PREFIXES"],
    "HERMES_PARAGRAPH_ANCHORS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HERMES_PARAGRAPH_ANCHORS"],
    "OPENWEBUI_IDENTITY_PREFIXES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OPENWEBUI_IDENTITY_PREFIXES"],
    "OPENWEBUI_PARAGRAPH_ANCHORS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OPENWEBUI_PARAGRAPH_ANCHORS"],
    "PI_PARAGRAPH_ANCHORS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PI_PARAGRAPH_ANCHORS"],
    "PROVIDER_CC_BRIDGE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CC_BRIDGE"],
    "PROVIDER_CLAUDE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"],
    "applySystemTransformPipeline",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applySystemTransformPipeline"],
    "applyTransformPipeline",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyTransformPipeline"],
    "getSystemTransformsConfig",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSystemTransformsConfig"],
    "resetSystemTransformsConfig",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetSystemTransformsConfig"],
    "setSystemTransformsConfig",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setSystemTransformsConfig"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccBridgeTransforms.ts [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ofen9v._.js.map