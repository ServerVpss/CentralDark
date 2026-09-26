module.exports = [
"[project]/src/app/(dashboard)/dashboard/context/omniglyph/sampleData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Amostra REAL para o painel "antes → depois": um bloco denso de tool-defs/config
// (1015 chars) renderizado pelo pacote omniglyph em uma página PNG 438×120.
// Números medidos: 254 tokens de texto → 84 tokens de imagem (billing 28px + 4/bloco)
// = 66,9% de economia, dentro da faixa medida de 59–70% ponta a ponta.
// Gerado offline via renderTextToImages — não é mockup, é a saída real da engine.
__turbopack_context__.s([
    "SAMPLE_BEFORE_TEXT",
    ()=>SAMPLE_BEFORE_TEXT,
    "SAMPLE_METRICS",
    ()=>SAMPLE_METRICS,
    "SAMPLE_PAGE_PNG_DATA_URI",
    ()=>SAMPLE_PAGE_PNG_DATA_URI
]);
const SAMPLE_BEFORE_TEXT = `## Tool: search_records(query, filters?, limit=50)
Searches the ledger. filters: {status:"ok"|"pending"|"failed", since:ISO8601, region}.
Returns [{id, status, attempt, region, ts, checksum}]. Rate: 20 rps. Auth: bearer.
## Tool: apply_patch(recordId, patch, dryRun=false)
Mutates one record. patch is RFC-6902 JSON Patch. dryRun returns the diff only.
Idempotency-Key header required. 409 on version conflict; retry with fresh read.
## Config
retry: {base_ms:300, factor:2, max:5}. circuit_breaker:{threshold:5, reset_s:30}.
regions: [us-east, us-west, eu-central, sa-east]. default_region: sa-east.
REGISTRO-A: {"id":"a3f8c2d19b4e","status":"ok","attempt":1,"region":"sa-east"}
REGISTRO-B: {"id":"7b1e4409ccde","status":"pending","attempt":3,"region":"eu-central"}
REGISTRO-C: {"id":"2d909e99f1b3","status":"failed","attempt":5,"region":"us-west"}
Notes: never expose checksum in logs; redact bearer; prefer read-modify-write with
Idempotency-Key; on 429 honor Retry-After; treat 408/500/502/503/504 as retryable.`;
const SAMPLE_PAGE_PNG_DATA_URI = "data:image/png;base64,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";
const SAMPLE_METRICS = {
    beforeChars: 1015,
    pageWidth: 438,
    pageHeight: 120,
    textTokens: 254,
    imageTokens: 84,
    savingsPct: 66.9
};
}),
"[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OmniglyphContextPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// OmniglyphContextPageClient — the dedicated detail screen for the "omniglyph"
// context-as-image compression engine. Four sections: economics (measured savings),
// a real before→after (dense text vs the rendered PNG page), the fail-closed gate
// flow, and the enable control (wired to /api/settings/compression, preview engine).
//
// The sample in ./sampleData.ts is a REAL render from the omniglyph package, not a mockup.
//
// Card/Toggle are imported from their direct module paths (not the @/shared/components
// barrel) — the barrel pulls a Node-only module that hangs vitest/jsdom.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/context/omniglyph/sampleData.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
/** The measured fail-closed gate chain, in evaluation order. Every no-op is telemetered
 *  as `skip:<reason>`; the engine only fires when all pass. */ const GATES = [
    {
        id: "model"
    },
    {
        id: "transport"
    },
    {
        id: "format"
    },
    {
        id: "profitable"
    }
];
const ECONOMICS = [
    {
        value: "~10×",
        id: "fewerTokens"
    },
    {
        value: "59–70%",
        id: "savings"
    },
    {
        value: "1456",
        id: "imageTokens"
    },
    {
        value: "100%",
        id: "accuracy"
    }
];
// Section components are split out of the page component so each function stays
// under the complexity gate's 80-line cap; the page composes them.
function PageHeader() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("omniglyph");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-semibold",
                        children: "OmniGlyph"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400",
                        children: t("preview")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "max-w-2xl text-sm text-text-muted",
                children: t("description")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
function EconomicsCard() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("omniglyph");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "mb-4 text-lg font-semibold",
                children: t("economicsTitle")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
                children: ECONOMICS.map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-2xl font-semibold tabular-nums",
                                children: e.value
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-text-muted",
                                children: t(`economics.${e.id}`)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        ]
                    }, e.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
function BeforeAfterCard() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("omniglyph");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-1 flex items-baseline justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold",
                        children: t("beforeAfterTitle")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-emerald-600 dark:text-emerald-400",
                        children: t("blockSavings", {
                            percent: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].savingsPct
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-4 text-xs text-text-muted",
                children: t("realRender", {
                    characters: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].beforeChars
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium uppercase tracking-wide text-text-muted",
                                children: t("textTokens", {
                                    tokens: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].textTokens
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "max-h-60 overflow-auto rounded border border-black/10 bg-black/5 p-3 text-[11px] leading-relaxed dark:border-white/10 dark:bg-white/5",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_BEFORE_TEXT"]
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium uppercase tracking-wide text-text-muted",
                                children: t("renderedTokens", {
                                    tokens: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].imageTokens
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-auto rounded border border-black/10 bg-white p-3 dark:border-white/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_PAGE_PNG_DATA_URI"],
                                    alt: t("renderedImageAlt", {
                                        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].pageWidth,
                                        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].pageHeight
                                    }),
                                    width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].pageWidth,
                                    height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$context$2f$omniglyph$2f$sampleData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAMPLE_METRICS"].pageHeight,
                                    className: "max-w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
function GatesCard() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("omniglyph");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "mb-1 text-lg font-semibold",
                children: t("gatesTitle")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-4 text-xs text-text-muted",
                children: t.rich("gatesDescription", {
                    code: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            children: chunks
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                            lineNumber: 135,
                            columnNumber: 29
                        }, this)
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 133,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                className: "flex flex-col gap-3",
                children: GATES.map((g, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-semibold tabular-nums dark:bg-white/10",
                                children: i + 1
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 141,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: [
                                            t(`gates.${g.id}.label`),
                                            " —",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-emerald-600 dark:text-emerald-400",
                                                children: t(`gates.${g.id}.pass`)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                                lineNumber: 147,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted",
                                        children: t(`gates.${g.id}.why`)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                lineNumber: 144,
                                columnNumber: 13
                            }, this)
                        ]
                    }, g.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
function EnableCard(props) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("omniglyph");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        className: "p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-start justify-between gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold",
                            children: t("enableTitle")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "max-w-xl text-sm text-text-muted",
                            children: t.rich("enableDescription", {
                                code: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: chunks
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                                        lineNumber: 174,
                                        columnNumber: 33
                                    }, this)
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "mt-1 h-4 text-xs text-text-muted",
                            "aria-live": "polite",
                            children: props.status === "saved" ? t("saved") : props.status === "error" ? t("saveFailed") : ""
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                            lineNumber: 177,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                    lineNumber: 170,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    "data-testid": "omniglyph-enable-toggle",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        size: "md",
                        checked: props.enabled,
                        onChange: props.onToggle,
                        disabled: props.disabled,
                        ariaLabel: t("enableAria")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                        lineNumber: 186,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                    lineNumber: 185,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
            lineNumber: 169,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
function OmniglyphContextPageClient() {
    const [engines, setEngines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [enabled, setEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch("/api/settings/compression").then((r)=>r.ok ? r.json() : null).then((data)=>{
            const e = data?.engines ?? {};
            setEngines(e);
            setEnabled(e.omniglyph?.enabled === true);
        }).catch(()=>{}).finally(()=>setLoading(false));
    }, []);
    // Persist the FULL engines map (the store keeps it as one JSON row — a partial patch
    // of a single engine would drop the others). Mirrors CompressionPanel.setEngine.
    const toggle = async (next)=>{
        setEnabled(next);
        const nextEngines = {
            ...engines,
            omniglyph: {
                ...engines.omniglyph ?? {
                    enabled: false
                },
                enabled: next
            }
        };
        setEngines(nextEngines);
        setSaving(true);
        setStatus("");
        try {
            const res = await fetch("/api/settings/compression", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    engines: nextEngines
                })
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto flex max-w-4xl flex-col gap-6 p-6",
        "data-testid": "omniglyph-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PageHeader, {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 250,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EconomicsCard, {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 251,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BeforeAfterCard, {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GatesCard, {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EnableCard, {
                enabled: enabled,
                disabled: loading || saving,
                status: status,
                onToggle: toggle
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
                lineNumber: 254,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/omniglyph/OmniglyphContextPageClient.tsx",
        lineNumber: 249,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_app_%28dashboard%29_dashboard_context_omniglyph_1wng3ge._.js.map