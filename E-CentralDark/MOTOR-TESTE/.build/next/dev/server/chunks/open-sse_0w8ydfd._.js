module.exports = [
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
"[project]/open-sse/utils/cacheControlPolicy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cache Control Policy
 *
 * Determines when to preserve client-side prompt caching headers (cache_control)
 * vs. applying OmniRoute's own caching strategy.
 *
 * Client-side caching (e.g., Claude Code) is preserved when:
 * 1. Client is Claude Code or similar caching-aware client
 * 2. Provider supports prompt caching (Anthropic, etc.)
 *
 * Combo membership / routing strategy no longer gates preservation: rewriting a
 * caching-aware client's markers produced per-request breakpoint positions that
 * thrashed the provider prompt cache, while preserving them is never worse
 * (see shouldPreserveCacheControl).
 */ __turbopack_context__.s([
    "isClaudeCodeClient",
    ()=>isClaudeCodeClient,
    "isDeterministicStrategy",
    ()=>isDeterministicStrategy,
    "providerHonorsOpenAIFormatCacheControl",
    ()=>providerHonorsOpenAIFormatCacheControl,
    "providerSupportsCaching",
    ()=>providerSupportsCaching,
    "resolveConnectionCacheOverride",
    ()=>resolveConnectionCacheOverride,
    "shouldPreserveCacheControl",
    ()=>shouldPreserveCacheControl,
    "trackCacheMetrics",
    ()=>trackCacheMetrics,
    "updateCacheTokenMetrics",
    ()=>updateCacheTokenMetrics
]);
/**
 * Routing strategies that are deterministic (same request → same provider)
 */ const DETERMINISTIC_STRATEGIES = new Set([
    "priority",
    "cost-optimized"
]);
/**
 * Providers that support prompt caching
 */ const CACHING_PROVIDERS = new Set([
    "claude",
    "anthropic",
    "zai",
    "deepseek",
    // Kimi Code's OpenAI protocol requires prompt_cache_key for Coding Plan
    // cache affinity. The OAuth card and hidden API-key compatibility ID share
    // the same upstream API.
    "kimi-coding",
    "kimi-coding-apikey",
    // #3088 — Xiaomi MiMo honors OpenAI-format cache_control breakpoints. Without
    // this entry, shouldPreserveCacheControl() returns false for Claude Code
    // clients and filterToOpenAIFormat() strips cache_control, so Xiaomi never
    // sees the cache hints and every request is a cache miss.
    "xiaomi-mimo",
    // #3955 — OpenAI / Codex / Azure-OpenAI use AUTOMATIC prefix caching: the longest
    // matching prefix of a request is cached upstream WITHOUT any explicit cache_control
    // markers. They must count as caching providers so the cache-aware compression guard
    // preserves the cacheable prefix (system prompt / earliest messages) instead of
    // rewriting it and forcing a cache miss. This also activates the intended
    // `prompt_cache_key` cache-routing hint for OpenAI in chatCore.
    "openai",
    "codex",
    "azure",
    // #2069 — DashScope's OpenAI-compatible endpoints (Alibaba Model Studio and
    // Qwen Cloud pay-as-you-go, upstream "alicode"/"alicode-intl") natively honor
    // `cache_control: {type:"ephemeral"}` breakpoints. Without these entries
    // shouldPreserveCacheControl() returns false for Claude Code clients and the
    // OpenAI-format translator strips cache_control, so DashScope never sees the
    // hints and every request is a cache miss.
    "alibaba",
    "alibaba-cn",
    "qwen-cloud"
]);
/**
 * Providers that honor EXPLICIT `cache_control` breakpoints carried inside an
 * OpenAI-format request body (i.e. the markers must be passed THROUGH the
 * Claude→OpenAI translation instead of stripped).
 *
 * This is a strict subset of CACHING_PROVIDERS and deliberately excludes
 * `openai` / `codex` / `azure`: those use AUTOMATIC prefix caching (#3955) and
 * do NOT accept explicit `cache_control` fields in the request — forwarding the
 * markers there is meaningless at best and a 400 "unknown field" at worst, and
 * it broke the chatCore "strips cache markers for non-Claude providers" test.
 * Claude-format providers re-inject markers via prepareClaudeRequest, so they
 * are not listed here either.
 */ const OPENAI_FORMAT_CACHE_CONTROL_PROVIDERS = new Set([
    // #2069 — DashScope OpenAI-compatible endpoints accept ephemeral breakpoints.
    "alibaba",
    "alibaba-cn",
    "qwen-cloud",
    // #3088 — Xiaomi MiMo honors OpenAI-format cache_control breakpoints.
    "xiaomi-mimo"
]);
function resolveConnectionCacheOverride(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return null;
    const cache = providerSpecificData.cache;
    if (!cache || typeof cache !== "object" || Array.isArray(cache)) return null;
    const record = cache;
    const result = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        result.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (record.cacheControlPassthrough === "strip" || record.cacheControlPassthrough === "openai-format" || record.cacheControlPassthrough === "claude-format") {
        result.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(result).length > 0 ? result : null;
}
function providerHonorsOpenAIFormatCacheControl(provider, connectionCacheOverride) {
    if (connectionCacheOverride?.cacheControlPassthrough === "openai-format") return true;
    if (connectionCacheOverride?.cacheControlPassthrough === "strip") return false;
    if (!provider) return false;
    return OPENAI_FORMAT_CACHE_CONTROL_PROVIDERS.has(provider.toLowerCase());
}
function isClaudeCodeClient(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    // Claude Code user agents
    if (ua.includes("claude-code") || ua.includes("claude_code")) return true;
    if (ua.includes("claude-cli/")) return true;
    if (ua.includes("sdk-cli")) return true;
    if (ua.includes("anthropic") && ua.includes("cli")) return true;
    return false;
}
function providerSupportsCaching(provider, targetFormat, connectionCacheOverride) {
    if (typeof connectionCacheOverride?.supportsPromptCaching === "boolean") {
        return connectionCacheOverride.supportsPromptCaching;
    }
    if (!provider) return false;
    if (CACHING_PROVIDERS.has(provider.toLowerCase())) return true;
    // All Claude-protocol providers support prompt caching
    if (targetFormat === "claude") return true;
    return false;
}
function isDeterministicStrategy(strategy) {
    if (!strategy) return false;
    return DETERMINISTIC_STRATEGIES.has(strategy);
}
function shouldPreserveCacheControl({ userAgent, targetProvider, targetFormat, settings, connectionCacheOverride }) {
    // User override takes precedence
    if (settings?.alwaysPreserveClientCache === "always") {
        return true;
    }
    if (settings?.alwaysPreserveClientCache === "never") {
        return false;
    }
    // Auto mode: must be a caching-aware client…
    if (!isClaudeCodeClient(userAgent)) {
        return false;
    }
    // …talking to a provider that supports prompt caching.
    return providerSupportsCaching(targetProvider, targetFormat, connectionCacheOverride);
}
function trackCacheMetrics({ preserved, provider, strategy, metrics, inputTokens, cachedTokens, cacheCreationTokens }) {
    const now = new Date().toISOString();
    // Initialize metrics if empty
    if (!metrics) {
        metrics = {
            totalRequests: 0,
            requestsWithCacheControl: 0,
            totalInputTokens: 0,
            totalCachedTokens: 0,
            totalCacheCreationTokens: 0,
            tokensSaved: 0,
            estimatedCostSaved: 0,
            byProvider: {},
            byStrategy: {},
            lastUpdated: now
        };
    }
    // Increment total requests
    metrics.totalRequests++;
    // Track token counts
    const input = inputTokens || 0;
    const cached = cachedTokens || 0;
    const creation = cacheCreationTokens || 0;
    metrics.totalInputTokens += input;
    metrics.totalCachedTokens += cached;
    metrics.totalCacheCreationTokens += creation;
    // Calculate tokens saved (cached tokens are reused, not charged)
    if (cached > 0) {
        metrics.tokensSaved += cached;
    }
    // Only track requests where cache_control was preserved
    if (preserved) {
        metrics.requestsWithCacheControl++;
        // Initialize provider tracking
        if (!metrics.byProvider[provider]) {
            metrics.byProvider[provider] = {
                requests: 0,
                inputTokens: 0,
                cachedTokens: 0,
                cacheCreationTokens: 0
            };
        }
        metrics.byProvider[provider].requests++;
        metrics.byProvider[provider].inputTokens += input;
        metrics.byProvider[provider].cachedTokens += cached;
        metrics.byProvider[provider].cacheCreationTokens += creation;
        // Initialize strategy tracking
        if (strategy && !metrics.byStrategy[strategy]) {
            metrics.byStrategy[strategy] = {
                requests: 0,
                inputTokens: 0,
                cachedTokens: 0,
                cacheCreationTokens: 0
            };
        }
        if (strategy) {
            metrics.byStrategy[strategy].requests++;
            metrics.byStrategy[strategy].inputTokens += input;
            metrics.byStrategy[strategy].cachedTokens += cached;
            metrics.byStrategy[strategy].cacheCreationTokens += creation;
        }
    }
    metrics.lastUpdated = now;
    return metrics;
}
function updateCacheTokenMetrics({ metrics, provider, strategy, inputTokens, cachedTokens, cacheCreationTokens, costSaved }) {
    metrics.totalCachedTokens += cachedTokens;
    metrics.totalCacheCreationTokens += cacheCreationTokens;
    metrics.totalInputTokens += inputTokens;
    // Cached tokens are reused (saved), creation tokens are new cache writes
    metrics.tokensSaved += cachedTokens;
    if (costSaved !== undefined) {
        metrics.estimatedCostSaved += costSaved;
    }
    // Update provider tracking
    if (metrics.byProvider[provider]) {
        metrics.byProvider[provider].cachedTokens += cachedTokens;
        metrics.byProvider[provider].cacheCreationTokens += cacheCreationTokens;
        metrics.byProvider[provider].inputTokens += inputTokens;
    }
    // Update strategy tracking
    if (strategy && metrics.byStrategy[strategy]) {
        metrics.byStrategy[strategy].cachedTokens += cachedTokens;
        metrics.byStrategy[strategy].cacheCreationTokens += cacheCreationTokens;
        metrics.byStrategy[strategy].inputTokens += inputTokens;
    }
    metrics.lastUpdated = new Date().toISOString();
    return metrics;
}
}),
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
"[project]/open-sse/services/compression/strategySelector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "activeComboResolves",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["activeComboResolves"],
    "applyCompression",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyCompression"],
    "applyCompressionAsync",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyCompressionAsync"],
    "applyStackedCompression",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyStackedCompression"],
    "applyStackedCompressionAsync",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyStackedCompressionAsync"],
    "buildNamedComboLookup",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildNamedComboLookup"],
    "checkComboOverride",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkComboOverride"],
    "enginesMapDerivesStackedPipeline",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["enginesMapDerivesStackedPipeline"],
    "formatCompressionAnnotation",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatCompressionAnnotation"],
    "formatCompressionMeta",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatCompressionMeta"],
    "getEffectiveMode",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEffectiveMode"],
    "planFromHeader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planFromHeader"],
    "resolveCacheAwareConfig",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cacheAwareConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCacheAwareConfig"],
    "selectCompressionPlan",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectCompressionPlan"],
    "selectCompressionStrategy",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectCompressionStrategy"],
    "shouldAutoTrigger",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shouldAutoTrigger"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/compression/strategySelector.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$planResolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/planResolution.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$cacheAwareConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/compression/cacheAwareConfig.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$compression$2f$strategySelector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_0w8ydfd._.js.map