module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/promptCache/prefixAnalyzer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzePrefix",
    ()=>analyzePrefix,
    "generatePromptCacheKey",
    ()=>generatePromptCacheKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function normalizeContent(content) {
    if (typeof content === "string") return content;
    return JSON.stringify(content);
}
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
function analyzePrefix(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return {
            prefixEndIdx: -1,
            prefixHash: "",
            prefixTokens: 0,
            prefixType: "system_only",
            confidence: 0
        };
    }
    let prefixEndIdx = -1;
    let prefixType = "system_only";
    let confidence = 0.5;
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        const role = msg.role || "user";
        if (role === "system") {
            prefixEndIdx = i;
            prefixType = "system_only";
            confidence = 0.9;
        } else if (role === "tool" || role === "assistant" && Array.isArray(msg.content)) {
            prefixEndIdx = i;
            prefixType = "system_and_tools";
            confidence = 0.8;
        } else if (role === "assistant") {
            prefixEndIdx = i;
            prefixType = "system_tools_history";
            confidence = 0.7;
        } else {
            break;
        }
    }
    const prefixMessages = messages.slice(0, prefixEndIdx + 1);
    const prefixText = prefixMessages.map((m)=>normalizeContent(m.content)).join("\n");
    const prefixHash = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(prefixText).digest("hex");
    const prefixTokens = estimateTokens(prefixText);
    return {
        prefixEndIdx,
        prefixHash,
        prefixTokens,
        prefixType,
        confidence
    };
}
function generatePromptCacheKey(messages) {
    const analysis = analyzePrefix(messages);
    if (analysis.prefixHash) {
        return `omni-${analysis.prefixHash.slice(0, 32)}`;
    }
    return "";
}
}),
"[project]/src/lib/promptCache/index.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/promptCache/prefixAnalyzer.ts [instrumentation] (ecmascript)");
;
}),
"[project]/src/lib/promptCache/index.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzePrefix",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["analyzePrefix"],
    "generatePromptCacheKey",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generatePromptCacheKey"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/promptCache/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/promptCache/prefixAnalyzer.ts [instrumentation] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10fz8yq._.js.map