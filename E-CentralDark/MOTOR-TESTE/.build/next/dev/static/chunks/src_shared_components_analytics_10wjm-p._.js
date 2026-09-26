(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/components/analytics/chartColors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_COLORS",
    ()=>PROVIDER_COLORS
]);
const PROVIDER_COLORS = [
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#10b981",
    "#06b6d4",
    "#ec4899",
    "#f97316",
    "#6366f1",
    "#14b8a6",
    "#a855f7"
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/modelBreakdownSort.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure sort helper for the Usage → Model Breakdown table (#8769).
 * Kept out of charts.tsx so the frozen god-file does not grow and so
 * sort behavior is unit-testable without mounting React.
 */ __turbopack_context__.s([
    "nextModelBreakdownSort",
    ()=>nextModelBreakdownSort,
    "sortModelBreakdownRows",
    ()=>sortModelBreakdownRows,
    "withModelBreakdownShare",
    ()=>withModelBreakdownShare
]);
const STRING_FIELDS = new Set([
    "model"
]);
function sortModelBreakdownRows(rows, sortBy, sortOrder) {
    const arr = [
        ...rows || []
    ];
    arr.sort((a, b)=>{
        const rawA = a[sortBy];
        const rawB = b[sortBy];
        if (STRING_FIELDS.has(sortBy) || typeof rawA === "string" || typeof rawB === "string") {
            const sa = String(rawA ?? "");
            const sb = String(rawB ?? "");
            const cmp = sa.localeCompare(sb, undefined, {
                sensitivity: "base",
                numeric: true
            });
            return sortOrder === "asc" ? cmp : -cmp;
        }
        const va = Number(rawA ?? 0);
        const vb = Number(rawB ?? 0);
        const safeA = Number.isFinite(va) ? va : 0;
        const safeB = Number.isFinite(vb) ? vb : 0;
        return sortOrder === "asc" ? safeA - safeB : safeB - safeA;
    });
    return arr;
}
function nextModelBreakdownSort(currentBy, currentOrder, field) {
    if (currentBy === field) {
        return {
            sortBy: field,
            sortOrder: currentOrder === "asc" ? "desc" : "asc"
        };
    }
    return {
        sortBy: field,
        sortOrder: "desc"
    };
}
function withModelBreakdownShare(rows, totalTokens) {
    const total = Number(totalTokens ?? 0);
    return (rows || []).map((row)=>{
        if (row.pct !== undefined && row.pct !== null && row.pct !== "") return {
            ...row
        };
        const tokens = Number(row.totalTokens ?? 0);
        const pct = total > 0 ? (tokens / total * 100).toFixed(1) : "0";
        return {
            ...row,
            pct
        };
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/ModelTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelTable",
    ()=>ModelTable,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Model Breakdown table for Usage analytics (#8769).
 * Extracted from charts.tsx so sort logic can be fixed/tested without
 * growing the frozen charts god-file.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$modelBreakdownSort$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/modelBreakdownSort.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const COLUMNS = [
    {
        field: "model",
        labelKey: "chartModel",
        align: "left"
    },
    {
        field: "requests",
        labelKey: "chartRequests",
        align: "right"
    },
    {
        field: "promptTokens",
        labelKey: "chartInput",
        align: "right"
    },
    {
        field: "completionTokens",
        labelKey: "chartOutput",
        align: "right"
    },
    {
        field: "totalTokens",
        labelKey: "chartTotal",
        align: "right"
    },
    {
        field: "cost",
        labelKey: "chartCost",
        align: "right"
    }
];
function SortIndicator({ active, sortOrder }) {
    if (!active) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-30",
            children: "unfold_more"
        }, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "material-symbols-outlined text-[12px] text-primary",
        children: sortOrder === "asc" ? "expand_less" : "expand_more"
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = SortIndicator;
function ModelTable({ byModel, summary }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const [sort, setSort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        by: "totalTokens",
        order: "desc"
    });
    const toggleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ModelTable.useCallback[toggleSort]": (field)=>{
            setSort({
                "ModelTable.useCallback[toggleSort]": (prev)=>{
                    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$modelBreakdownSort$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextModelBreakdownSort"])(prev.by, prev.order, field);
                    return {
                        by: next.sortBy,
                        order: next.sortOrder
                    };
                }
            }["ModelTable.useCallback[toggleSort]"]);
        }
    }["ModelTable.useCallback[toggleSort]"], []);
    const rowsWithShare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModelTable.useMemo[rowsWithShare]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$modelBreakdownSort$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withModelBreakdownShare"])(byModel, summary?.totalTokens)
    }["ModelTable.useMemo[rowsWithShare]"], [
        byModel,
        summary?.totalTokens
    ]);
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModelTable.useMemo[sorted]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$modelBreakdownSort$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortModelBreakdownRows"])(rowsWithShare, sort.by, sort.order)
    }["ModelTable.useMemo[sorted]"], [
        rowsWithShare,
        sort.by,
        sort.order
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider",
                    children: t("chartModelBreakdown")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "text-xs text-text-muted uppercase bg-black/[0.02] dark:bg-white/[0.02]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    COLUMNS.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: `px-4 py-2.5 ${col.align === "right" ? "text-right" : "text-left"}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: `inline-flex items-center gap-1 cursor-pointer group hover:text-text-main ${col.align === "right" ? "justify-end w-full" : "justify-start"}`,
                                                onClick: ()=>toggleSort(col.field),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: t(col.labelKey)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                        lineNumber: 105,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                        active: sort.by === col.field,
                                                        sortOrder: sort.order
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                        lineNumber: 106,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                lineNumber: 98,
                                                columnNumber: 19
                                            }, this)
                                        }, col.field, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 94,
                                            columnNumber: 17
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right w-36",
                                        children: t("chartShare")
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-border",
                            children: sorted.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-2 h-2 rounded-full shrink-0",
                                                        style: {
                                                            backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i)
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                        lineNumber: 121,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: m.model
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                        lineNumber: 125,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                lineNumber: 120,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 119,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-text-muted",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(m.requests)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 128,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-primary",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(m.promptTokens)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 131,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-emerald-500",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(m.completionTokens)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono font-semibold",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(m.totalTokens)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 137,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-amber-500",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"])(m.cost)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 140,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 justify-end",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-full rounded-full transition-all",
                                                            style: {
                                                                width: `${m.pct ?? 0}%`,
                                                                backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i)
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                            lineNumber: 146,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                        lineNumber: 145,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-mono text-text-muted w-10 text-right",
                                                        children: [
                                                            m.pct ?? 0,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                        lineNumber: 154,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                                lineNumber: 144,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                            lineNumber: 143,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, String(m.model ?? i), true, {
                                    fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                                    lineNumber: 115,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/ModelTable.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(ModelTable, "vU2auJ+hwu7VdIWxpr27uQQyIO4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = ModelTable;
const __TURBOPACK__default__export__ = ModelTable;
var _c, _c1;
__turbopack_context__.k.register(_c, "SortIndicator");
__turbopack_context__.k.register(_c1, "ModelTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/charts.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityHeatmap",
    ()=>ActivityHeatmap,
    "ApiKeyTable",
    ()=>ApiKeyTable,
    "CompactStatGrid",
    ()=>CompactStatGrid,
    "MostActiveDay7d",
    ()=>MostActiveDay7d,
    "ProviderTable",
    ()=>ProviderTable,
    "ServiceTierBreakdown",
    ()=>ServiceTierBreakdown,
    "SortIndicator",
    ()=>SortIndicator,
    "StatCard",
    ()=>StatCard,
    "UsageDetail",
    ()=>UsageDetail,
    "WeeklySquares7d",
    ()=>WeeklySquares7d
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/chartColors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/serviceTierLabels.ts [app-client] (ecmascript)");
// ── ModelTable (extracted — see ModelTable.tsx / #8769) ───────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$ModelTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/ModelTable.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function createDateFormatter(locale, options) {
    try {
        return new Intl.DateTimeFormat(locale, options);
    } catch  {
        return new Intl.DateTimeFormat(undefined, options);
    }
}
function SortIndicator({ active, sortOrder }) {
    if (!active) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-30",
            children: "unfold_more"
        }, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/charts.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "material-symbols-outlined text-[12px] text-primary",
        children: sortOrder === "asc" ? "expand_less" : "expand_more"
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_c = SortIndicator;
function StatCard({ icon, label, value, subValue, color = "text-text-main" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "px-4 py-3 flex flex-col gap-1 min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 text-text-muted text-[11px] uppercase font-semibold tracking-wide min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px] shrink-0",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `text-2xl font-bold ${color} truncate`,
                title: String(value),
                children: value
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            subValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-text-muted truncate",
                children: subValue
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 69,
                columnNumber: 20
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_c1 = StatCard;
function CompactStatGrid({ sections }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "px-5 py-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3",
            children: sections.map((section, si)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        si > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-black/[0.06] dark:border-white/[0.06] mb-3"
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 90,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[10px] uppercase font-semibold tracking-widest text-text-muted/50 mb-2",
                            children: section.title
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: section.wideValues ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-2" : "grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-2",
                            children: section.items.map((stat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2 min-w-0 py-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-center gap-1.5 ${section.wideValues ? "shrink-0" : "min-w-0"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px] text-text-muted shrink-0",
                                                    children: stat.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[11px] uppercase font-semibold tracking-wide text-text-muted ${section.wideValues ? "whitespace-nowrap" : "truncate"}`,
                                                    children: stat.label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                    lineNumber: 110,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 104,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-sm font-bold text-right ${section.wideValues ? "truncate min-w-0" : "shrink-0"} ${stat.color || "text-text-main"}`,
                                            title: String(stat.value),
                                            children: stat.value
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 116,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                    lineNumber: 103,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this)
                    ]
                }, si, true, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 88,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/charts.tsx",
            lineNumber: 86,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c2 = CompactStatGrid;
function ActivityHeatmap({ activityMap }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const monthFormatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityHeatmap.useMemo[monthFormatter]": ()=>createDateFormatter(locale, {
                month: "short"
            })
    }["ActivityHeatmap.useMemo[monthFormatter]"], [
        locale
    ]);
    const weekdayFormatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityHeatmap.useMemo[weekdayFormatter]": ()=>createDateFormatter(locale, {
                weekday: "short"
            })
    }["ActivityHeatmap.useMemo[weekdayFormatter]"], [
        locale
    ]);
    const cells = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityHeatmap.useMemo[cells]": ()=>{
            const today = new Date();
            const days = [];
            let maxVal = 0;
            for(let i = 364; i >= 0; i--){
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const val = activityMap?.[key] || 0;
                if (val > maxVal) maxVal = val;
                days.push({
                    date: key,
                    value: val,
                    dayOfWeek: d.getDay()
                });
            }
            return {
                days,
                maxVal
            };
        }
    }["ActivityHeatmap.useMemo[cells]"], [
        activityMap
    ]);
    const weeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityHeatmap.useMemo[weeks]": ()=>{
            const w = [];
            let current = [];
            const firstDay = cells.days[0]?.dayOfWeek || 0;
            for(let i = 0; i < firstDay; i++){
                current.push(null);
            }
            for (const day of cells.days){
                current.push(day);
                if (current.length === 7) {
                    w.push(current);
                    current = [];
                }
            }
            if (current.length > 0) w.push(current);
            return w;
        }
    }["ActivityHeatmap.useMemo[weeks]"], [
        cells
    ]);
    // Auto-scroll to the right edge so the current date is visible
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ActivityHeatmap.useEffect": ()=>{
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
            }
        }
    }["ActivityHeatmap.useEffect"], [
        weeks
    ]);
    const monthLabels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityHeatmap.useMemo[monthLabels]": ()=>{
            const labels = [];
            let lastMonth = -1;
            weeks.forEach({
                "ActivityHeatmap.useMemo[monthLabels]": (week, weekIdx)=>{
                    const firstDay = week.find({
                        "ActivityHeatmap.useMemo[monthLabels].firstDay": (d)=>d !== null
                    }["ActivityHeatmap.useMemo[monthLabels].firstDay"]);
                    if (firstDay) {
                        const m = new Date(firstDay.date).getMonth();
                        if (m !== lastMonth) {
                            labels.push({
                                weekIdx,
                                label: monthFormatter.format(new Date(2024, m, 1))
                            });
                            lastMonth = m;
                        }
                    }
                }
            }["ActivityHeatmap.useMemo[monthLabels]"]);
            return labels;
        }
    }["ActivityHeatmap.useMemo[monthLabels]"], [
        monthFormatter,
        weeks
    ]);
    const weekdayLabels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityHeatmap.useMemo[weekdayLabels]": ()=>[
                1,
                3,
                5
            ].map({
                "ActivityHeatmap.useMemo[weekdayLabels]": (day)=>weekdayFormatter.format(new Date(2024, 0, 7 + day))
            }["ActivityHeatmap.useMemo[weekdayLabels]"])
    }["ActivityHeatmap.useMemo[weekdayLabels]"], [
        weekdayFormatter
    ]);
    function getCellColor(value) {
        if (!value || value === 0) return "bg-white/[0.04]";
        const intensity = Math.min(value / (cells.maxVal || 1), 1);
        if (intensity < 0.25) return "bg-primary/20";
        if (intensity < 0.5) return "bg-primary/40";
        if (intensity < 0.75) return "bg-primary/60";
        return "bg-primary/90";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4 h-full min-w-0 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-semibold text-text-muted uppercase tracking-wider",
                        children: t("overview")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-text-muted",
                        children: t("activitySummary", {
                            active: Object.keys(activityMap || {}).length,
                            tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(Object.values(activityMap || {}).reduce((a, b)=>a + b, 0)),
                            days: 365
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-max",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-[3px] mb-1 ml-6",
                            style: {
                                fontSize: "10px"
                            },
                            children: monthLabels.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-text-muted",
                                    style: {
                                        position: "relative",
                                        left: `${m.weekIdx * 13}px`,
                                        marginLeft: i === 0 ? 0 : "-20px"
                                    },
                                    children: m.label
                                }, i, false, {
                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                    lineNumber: 236,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 234,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-[3px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-[3px] shrink-0 text-[10px] text-text-muted pr-1 sticky left-0 z-10 bg-surface",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 252,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px] leading-[10px]",
                                            children: weekdayLabels[0]
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 253,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 254,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px] leading-[10px]",
                                            children: weekdayLabels[1]
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 255,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 256,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px] leading-[10px]",
                                            children: weekdayLabels[2]
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 257,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-[10px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 258,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                    lineNumber: 251,
                                    columnNumber: 13
                                }, this),
                                weeks.map((week, wi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-[3px]",
                                        children: week.map((day, di)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                title: day ? t("activityCellTitle", {
                                                    date: day.date,
                                                    tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(day.value)
                                                }) : "",
                                                className: `w-[10px] h-[10px] rounded-[2px] ${day ? getCellColor(day.value) : "bg-transparent"}`
                                            }, di, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 264,
                                                columnNumber: 19
                                            }, this))
                                    }, wi, false, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 262,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 250,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 233,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1 mt-2 ml-6 text-[10px] text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t("activityLess")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 281,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[10px] h-[10px] rounded-[2px] bg-white/[0.04]"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[10px] h-[10px] rounded-[2px] bg-primary/20"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 283,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[10px] h-[10px] rounded-[2px] bg-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[10px] h-[10px] rounded-[2px] bg-primary/60"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[10px] h-[10px] rounded-[2px] bg-primary/90"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 286,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t("activityMore")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 287,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 280,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 216,
        columnNumber: 5
    }, this);
}
_s(ActivityHeatmap, "1FcO8D4KkdYDeqDtVuZplZKP/yM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c3 = ActivityHeatmap;
function ApiKeyTable({ byApiKey }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("totalTokens");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyTable.useMemo[data]": ()=>byApiKey || []
    }["ApiKeyTable.useMemo[data]"], [
        byApiKey
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyTable.useMemo[filtered]": ()=>{
            const q = query.trim().toLowerCase();
            if (!q) return data;
            return data.filter({
                "ApiKeyTable.useMemo[filtered]": (row)=>(row.apiKeyName || "").toLowerCase().includes(q) || (row.apiKeyId || "").toLowerCase().includes(q)
            }["ApiKeyTable.useMemo[filtered]"]);
        }
    }["ApiKeyTable.useMemo[filtered]"], [
        data,
        query
    ]);
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyTable.useMemo[sorted]": ()=>{
            const arr = [
                ...filtered
            ];
            arr.sort({
                "ApiKeyTable.useMemo[sorted]": (a, b)=>{
                    const va = a[sortBy] ?? 0;
                    const vb = b[sortBy] ?? 0;
                    if (typeof va === "string") {
                        return sortOrder === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
                    }
                    return sortOrder === "asc" ? va - vb : vb - va;
                }
            }["ApiKeyTable.useMemo[sorted]"]);
            return arr;
        }
    }["ApiKeyTable.useMemo[sorted]"], [
        filtered,
        sortBy,
        sortOrder
    ]);
    const toggleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ApiKeyTable.useCallback[toggleSort]": (field)=>{
            if (sortBy === field) {
                setSortOrder({
                    "ApiKeyTable.useCallback[toggleSort]": (prev)=>prev === "asc" ? "desc" : "asc"
                }["ApiKeyTable.useCallback[toggleSort]"]);
                return;
            }
            setSortBy(field);
            setSortOrder("desc");
        }
    }["ApiKeyTable.useCallback[toggleSort]"], [
        sortBy
    ]);
    const hasData = data.length > 0;
    if (!hasData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4 flex-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartApiKeyBreakdown")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 341,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 344,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/charts.tsx",
            lineNumber: 340,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-border flex items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-semibold text-text-muted uppercase tracking-wider",
                        children: t("chartApiKeyBreakdown")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 352,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: query,
                        onChange: (e)=>setQuery(e.target.value),
                        placeholder: t("filterSearchKeys"),
                        className: "w-full max-w-[220px] px-3 py-1.5 rounded-lg bg-bg-subtle border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 355,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 351,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "text-xs text-text-muted uppercase bg-black/[0.02] dark:bg-white/[0.02]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-left cursor-pointer group",
                                        onClick: ()=>toggleSort("apiKeyName"),
                                        children: [
                                            t("chartApiKey"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "apiKeyName",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 372,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 367,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("requests"),
                                        children: [
                                            t("chartRequests"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "requests",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 379,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 374,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("promptTokens"),
                                        children: [
                                            t("chartInput"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "promptTokens",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 386,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 381,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("completionTokens"),
                                        children: [
                                            t("chartOutput"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "completionTokens",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 393,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 388,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("totalTokens"),
                                        children: [
                                            t("chartTotal"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "totalTokens",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 400,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 395,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("cost"),
                                        children: [
                                            t("chartCost"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "cost",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 406,
                                                columnNumber: 34
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 402,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 366,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 365,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-border",
                            children: [
                                sorted.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-2.5",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium",
                                                    title: row.apiKeyName || row.apiKeyId || "unknown",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatApiKeyLabel"])(row.apiKeyName, row.apiKeyId)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 416,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-2.5 text-right font-mono text-text-muted",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(row.requests)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 421,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-2.5 text-right font-mono text-primary",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(row.promptTokens)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 424,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-2.5 text-right font-mono text-emerald-500",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(row.completionTokens)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 427,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-2.5 text-right font-mono font-semibold",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(row.totalTokens)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 430,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-2.5 text-right font-mono text-amber-500",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"])(row.cost)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 433,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, `${row.apiKeyId || row.apiKeyName || "key"}-${i}`, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 412,
                                        columnNumber: 15
                                    }, this)),
                                sorted.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        colSpan: 6,
                                        className: "px-4 py-8 text-center text-text-muted",
                                        children: t("filterNoKeysMatch")
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 440,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                    lineNumber: 439,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 410,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 364,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 363,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 350,
        columnNumber: 5
    }, this);
}
_s1(ApiKeyTable, "OS1Sv/RxVCAkoTmXKdVRJV7cslA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c4 = ApiKeyTable;
function MostActiveDay7d({ activityMap }) {
    _s2();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const weekdayFormatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MostActiveDay7d.useMemo[weekdayFormatter]": ()=>createDateFormatter(locale, {
                weekday: "long"
            })
    }["MostActiveDay7d.useMemo[weekdayFormatter]"], [
        locale
    ]);
    const dateFormatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MostActiveDay7d.useMemo[dateFormatter]": ()=>createDateFormatter(locale, {
                month: "short",
                day: "numeric"
            })
    }["MostActiveDay7d.useMemo[dateFormatter]"], [
        locale
    ]);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MostActiveDay7d.useMemo[data]": ()=>{
            if (!activityMap) return null;
            const today = new Date();
            let peakKey = null;
            let peakVal = 0;
            for(let i = 0; i < 7; i++){
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const val = activityMap[key] || 0;
                if (val > peakVal) {
                    peakVal = val;
                    peakKey = key;
                }
            }
            if (!peakKey || peakVal === 0) return null;
            const peakDate = new Date(peakKey + "T12:00:00");
            return {
                weekday: weekdayFormatter.format(peakDate),
                label: dateFormatter.format(peakDate),
                tokens: peakVal
            };
        }
    }["MostActiveDay7d.useMemo[data]"], [
        activityMap,
        dateFormatter,
        weekdayFormatter
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4 flex flex-col justify-center",
        style: {
            flex: 1,
            minHeight: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-xs font-semibold uppercase tracking-wider mb-2",
                style: {
                    color: "var(--color-text-muted)"
                },
                children: t("mostActiveDay")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 491,
                columnNumber: 7
            }, this),
            data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xl font-bold capitalize",
                        style: {
                            lineHeight: 1.2
                        },
                        children: data.weekday
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 499,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs mt-1",
                        style: {
                            color: "var(--color-text-muted)"
                        },
                        children: t("datedTokenCount", {
                            date: data.label,
                            tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(data.tokens)
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 502,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs",
                style: {
                    color: "var(--color-text-muted)"
                },
                children: t("noDataLast7Days")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 507,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 490,
        columnNumber: 5
    }, this);
}
_s2(MostActiveDay7d, "DRpRkD+KEkoWM5ZYpxVUm8PbPLc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c5 = MostActiveDay7d;
function WeeklySquares7d({ activityMap }) {
    _s3();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const weekdayFormatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WeeklySquares7d.useMemo[weekdayFormatter]": ()=>createDateFormatter(locale, {
                weekday: "short"
            })
    }["WeeklySquares7d.useMemo[weekdayFormatter]"], [
        locale
    ]);
    const dateFormatter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WeeklySquares7d.useMemo[dateFormatter]": ()=>createDateFormatter(locale, {
                month: "short",
                day: "numeric"
            })
    }["WeeklySquares7d.useMemo[dateFormatter]"], [
        locale
    ]);
    const days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WeeklySquares7d.useMemo[days]": ()=>{
            if (!activityMap) return [];
            const today = new Date();
            const result = [];
            let maxVal = 0;
            for(let i = 6; i >= 0; i--){
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const val = activityMap[key] || 0;
                if (val > maxVal) maxVal = val;
                result.push({
                    key,
                    val,
                    label: weekdayFormatter.format(d),
                    dateLabel: dateFormatter.format(d)
                });
            }
            return result.map({
                "WeeklySquares7d.useMemo[days]": (d)=>({
                        ...d,
                        intensity: maxVal > 0 ? d.val / maxVal : 0
                    })
            }["WeeklySquares7d.useMemo[days]"]);
        }
    }["WeeklySquares7d.useMemo[days]"], [
        activityMap,
        dateFormatter,
        weekdayFormatter
    ]);
    function getSquareStyle(intensity) {
        if (intensity === 0) return {
            background: "rgba(255,255,255,0.04)"
        };
        const opacity = 0.15 + intensity * 0.75;
        return {
            background: `rgba(229, 77, 94, ${opacity.toFixed(2)})`
        };
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4 flex flex-col justify-center",
        style: {
            flex: 1,
            minHeight: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-xs font-semibold uppercase tracking-wider mb-3",
                style: {
                    color: "var(--color-text-muted)"
                },
                children: t("chartWeekly")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 558,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 6,
                    justifyContent: "center"
                },
                children: days.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                title: t("activityCellTitle", {
                                    date: d.dateLabel,
                                    tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(d.val)
                                }),
                                style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    ...getSquareStyle(d.intensity),
                                    transition: "all 0.2s",
                                    cursor: "default"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 570,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color: "var(--color-text-muted)",
                                    letterSpacing: "0.03em"
                                },
                                children: d.label
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 581,
                                columnNumber: 13
                            }, this)
                        ]
                    }, d.key, true, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 566,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 564,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 557,
        columnNumber: 5
    }, this);
}
_s3(WeeklySquares7d, "s36LEg1bZyUymzVBCLvpdI37Lzs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c6 = WeeklySquares7d;
;
function getServiceTierIcon(serviceTier) {
    if (serviceTier === "priority") return "bolt";
    if (serviceTier === "flex") return "savings";
    return "speed";
}
function getServiceTierIconClass(serviceTier) {
    if (serviceTier === "priority") return "text-sky-500";
    if (serviceTier === "flex") return "text-emerald-500";
    return "text-text-muted";
}
function getServiceTierBarClass(serviceTier) {
    if (serviceTier === "priority") return "bg-sky-500";
    if (serviceTier === "flex") return "bg-emerald-500";
    return "bg-text-muted/50";
}
function getServiceTierCostClass(serviceTier) {
    return serviceTier === "flex" ? "text-emerald-500" : "text-amber-500";
}
function ServiceTierBreakdown({ byServiceTier, summary }) {
    _s4();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("costs");
    const tAnalytics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ServiceTierBreakdown.useMemo[data]": ()=>byServiceTier || []
    }["ServiceTierBreakdown.useMemo[data]"], [
        byServiceTier
    ]);
    const totalRequests = Number(summary?.totalRequests || 0);
    const totalCost = Number(summary?.totalCost || 0);
    if (!data.length) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-border flex items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-semibold text-text-muted uppercase tracking-wider",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateCostText"])(t, "serviceTierBreakdownTitle", "Service Tier")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 638,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-text-muted",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateCostText"])(t, "serviceTierBreakdownSubtitle", "Fast / Flex / Standard split")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 641,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 637,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-border",
                children: data.map((tier)=>{
                    const isFlex = tier.serviceTier === "flex";
                    const tierLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServiceTierDisplayLabel"])(t, tier.serviceTier, tier.label);
                    const requestPct = totalRequests > 0 ? (Number(tier.requests || 0) / totalRequests * 100).toFixed(1) : "0";
                    const costPct = totalCost > 0 ? (Number(tier.cost || 0) / totalCost * 100).toFixed(1) : "0";
                    const usageSavings = Number(tier.usageSavingsTokens || 0);
                    const costSavings = Number(tier.savings || 0);
                    const usageSavingsText = isFlex && usageSavings > 0 ? ` · ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(usageSavings)} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateCostText"])(t, "serviceTierUsageSaved", "usage saved")}` : "";
                    const costDetailText = isFlex && costSavings > 0 ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"])(costSavings)} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateCostText"])(t, "serviceTierCostSaved", "saved")}` : `${costPct}% ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$serviceTierLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateCostText"])(t, "serviceTierCostShareSuffix", "of cost")}`;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 flex flex-col gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `material-symbols-outlined text-[18px] ${getServiceTierIconClass(tier.serviceTier)}`,
                                                children: getServiceTierIcon(tier.serviceTier)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 674,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-semibold text-text-main",
                                                        children: tierLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                        lineNumber: 682,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-text-muted",
                                                        children: [
                                                            tAnalytics("requestTokenSummary", {
                                                                requests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(tier.requests),
                                                                tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(tier.totalTokens)
                                                            }),
                                                            usageSavingsText
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                        lineNumber: 683,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 681,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 673,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `font-mono text-sm font-semibold ${getServiceTierCostClass(tier.serviceTier)}`,
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"])(tier.cost)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 693,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-text-muted",
                                                children: costDetailText
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 700,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 692,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 672,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `h-full rounded-full ${getServiceTierBarClass(tier.serviceTier)}`,
                                    style: {
                                        width: `${requestPct}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                    lineNumber: 704,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 703,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tier.serviceTier, true, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 671,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 645,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 636,
        columnNumber: 5
    }, this);
}
_s4(ServiceTierBreakdown, "iUJHzqdBqM/XFTGqKPad4N9Bspg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c7 = ServiceTierBreakdown;
function UsageDetail({ summary }) {
    _s5();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const items = [
        {
            label: t("chartInput"),
            value: summary?.promptTokens,
            color: "text-primary"
        },
        {
            label: t("chartCacheRead"),
            value: 0,
            color: "text-text-muted"
        },
        {
            label: t("chartOutput"),
            value: summary?.completionTokens,
            color: "text-emerald-500"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4 flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                children: t("chartUsageDetail")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 729,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-sm ${item.color}`,
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 735,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono font-medium text-sm",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(item.value)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 736,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                        lineNumber: 734,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 732,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 728,
        columnNumber: 5
    }, this);
}
_s5(UsageDetail, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c8 = UsageDetail;
function ProviderTable({ byProvider }) {
    _s6();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("totalTokens");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTable.useMemo[data]": ()=>byProvider || []
    }["ProviderTable.useMemo[data]"], [
        byProvider
    ]);
    const totalTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTable.useMemo[totalTokens]": ()=>data.reduce({
                "ProviderTable.useMemo[totalTokens]": (acc, p)=>acc + p.totalTokens
            }["ProviderTable.useMemo[totalTokens]"], 0)
    }["ProviderTable.useMemo[totalTokens]"], [
        data
    ]);
    const toggleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderTable.useCallback[toggleSort]": (field)=>{
            if (sortBy === field) {
                setSortOrder({
                    "ProviderTable.useCallback[toggleSort]": (prev)=>prev === "asc" ? "desc" : "asc"
                }["ProviderTable.useCallback[toggleSort]"]);
            } else {
                setSortBy(field);
                setSortOrder("desc");
            }
        }
    }["ProviderTable.useCallback[toggleSort]"], [
        sortBy
    ]);
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTable.useMemo[sorted]": ()=>{
            const arr = [
                ...data
            ];
            arr.sort({
                "ProviderTable.useMemo[sorted]": (a, b)=>{
                    const va = a[sortBy] ?? 0;
                    const vb = b[sortBy] ?? 0;
                    if (typeof va === "string") return sortOrder === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
                    return sortOrder === "asc" ? va - vb : vb - va;
                }
            }["ProviderTable.useMemo[sorted]"]);
            return arr;
        }
    }["ProviderTable.useMemo[sorted]"], [
        data,
        sortBy,
        sortOrder
    ]);
    if (!data.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartProviderBreakdown")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 781,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 784,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/charts.tsx",
            lineNumber: 780,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider",
                    children: t("chartProviderBreakdown")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 792,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 791,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "text-xs text-text-muted uppercase bg-black/[0.02] dark:bg-white/[0.02]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-left cursor-pointer group",
                                        onClick: ()=>toggleSort("provider"),
                                        children: [
                                            t("chartProvider"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "provider",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 805,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 800,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("requests"),
                                        children: [
                                            t("chartRequests"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "requests",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 812,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 807,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("promptTokens"),
                                        children: [
                                            t("chartInput"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "promptTokens",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 819,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 814,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("completionTokens"),
                                        children: [
                                            t("chartOutput"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "completionTokens",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 826,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 821,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("totalTokens"),
                                        children: [
                                            t("chartTotal"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "totalTokens",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 833,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 828,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right cursor-pointer group",
                                        onClick: ()=>toggleSort("cost"),
                                        children: [
                                            t("chartCost"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIndicator, {
                                                active: sortBy === "cost",
                                                sortOrder: sortOrder
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 839,
                                                columnNumber: 34
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 835,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-2.5 text-right w-36",
                                        children: t("chartShare")
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                        lineNumber: 841,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                lineNumber: 799,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 798,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-border",
                            children: sorted.map((p, i)=>{
                                const pct = totalTokens > 0 ? (p.totalTokens / totalTokens * 100).toFixed(1) : "0";
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-2 h-2 rounded-full shrink-0",
                                                        style: {
                                                            backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][i % __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"].length]
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                        lineNumber: 854,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium capitalize",
                                                        children: p.provider
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                        lineNumber: 858,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 853,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 852,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-text-muted",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(p.requests)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 861,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-primary",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(p.promptTokens)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 864,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-emerald-500",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(p.completionTokens)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 867,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono font-semibold",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(p.totalTokens)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 870,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right font-mono text-amber-500",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"])(p.cost)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 873,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-2.5 text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 justify-end",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-full rounded-full transition-all",
                                                            style: {
                                                                width: `${pct}%`,
                                                                backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][i % __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"].length]
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                            lineNumber: 879,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                        lineNumber: 878,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-mono text-text-muted w-10 text-right",
                                                        children: [
                                                            pct,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                        lineNumber: 887,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                                lineNumber: 877,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                            lineNumber: 876,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, `${p.provider}-${i}`, true, {
                                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                                    lineNumber: 848,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/charts.tsx",
                            lineNumber: 844,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/charts.tsx",
                    lineNumber: 797,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/charts.tsx",
                lineNumber: 796,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/charts.tsx",
        lineNumber: 790,
        columnNumber: 5
    }, this);
}
_s6(ProviderTable, "Ajahn71T3Ven2mPOg2HqckCXtzo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c9 = ProviderTable;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "SortIndicator");
__turbopack_context__.k.register(_c1, "StatCard");
__turbopack_context__.k.register(_c2, "CompactStatGrid");
__turbopack_context__.k.register(_c3, "ActivityHeatmap");
__turbopack_context__.k.register(_c4, "ApiKeyTable");
__turbopack_context__.k.register(_c5, "MostActiveDay7d");
__turbopack_context__.k.register(_c6, "WeeklySquares7d");
__turbopack_context__.k.register(_c7, "ServiceTierBreakdown");
__turbopack_context__.k.register(_c8, "UsageDetail");
__turbopack_context__.k.register(_c9, "ProviderTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/rechartsCore.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChartLoadingCard",
    ()=>ChartLoadingCard,
    "DarkTooltip",
    ()=>DarkTooltip,
    "loadRecharts",
    ()=>loadRecharts,
    "useRecharts",
    ()=>useRecharts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
let rechartsModule = null;
let rechartsPromise = null;
function loadRecharts() {
    if (rechartsModule) return Promise.resolve(rechartsModule);
    if (!rechartsPromise) {
        rechartsPromise = __turbopack_context__.A("[project]/node_modules/recharts/es6/index.js [app-client] (ecmascript, async loader)").then((module)=>{
            rechartsModule = module;
            return module;
        }).catch((error)=>{
            rechartsPromise = null;
            throw error;
        });
    }
    return rechartsPromise;
}
function useRecharts() {
    _s();
    const [module, setModule] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(rechartsModule);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRecharts.useEffect": ()=>{
            if (module) return;
            let cancelled = false;
            loadRecharts().then({
                "useRecharts.useEffect": (loadedModule)=>{
                    if (!cancelled) setModule(loadedModule);
                }
            }["useRecharts.useEffect"]).catch({
                "useRecharts.useEffect": ()=>{
                    if (!cancelled) setModule(null);
                }
            }["useRecharts.useEffect"]);
            return ({
                "useRecharts.useEffect": ()=>{
                    cancelled = true;
                }
            })["useRecharts.useEffect"];
        }
    }["useRecharts.useEffect"], [
        module
    ]);
    return module;
}
_s(useRecharts, "t9dXAkaiHpNWz/YMO3ylHlu6W9M=");
function ChartLoadingCard({ className = "p-4 flex-1" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: className,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-8",
            "aria-hidden": "true"
        }, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c = ChartLoadingCard;
function DarkTooltip({ active, payload, label, formatter }) {
    if (!active || !payload?.length) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs shadow-lg",
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-semibold text-text-main mb-1",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
                lineNumber: 70,
                columnNumber: 17
            }, this),
            payload.map((entry, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5 text-text-muted",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "w-2 h-2 rounded-full shrink-0",
                            style: {
                                backgroundColor: entry.color
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                entry.name,
                                ":"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono font-medium text-text-main",
                            children: formatter ? formatter(entry.value) : entry.value
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/rechartsCore.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_c1 = DarkTooltip;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChartLoadingCard");
__turbopack_context__.k.register(_c1, "DarkTooltip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/rechartsDonuts.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AccountDonut",
    ()=>AccountDonut,
    "ApiKeyDonut",
    ()=>ApiKeyDonut,
    "ProviderCostDonut",
    ()=>ProviderCostDonut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/chartColors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/rechartsCore.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function CompactDonutCard({ pieData, title, formatter, valueClassName = "text-text-muted", labelClassName = "", getLegendKey, getLegendTitle }) {
    _s();
    const recharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"])();
    if (!recharts) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChartLoadingCard"], {}, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
            lineNumber: 27,
            columnNumber: 12
        }, this);
    }
    const { Cell, PieChart, Pie, Tooltip, ResponsiveContainer } = recharts;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4 flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResponsiveContainer, {
                        width: 120,
                        height: 120,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PieChart, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Pie, {
                                    data: pieData,
                                    dataKey: "value",
                                    nameKey: "name",
                                    cx: "50%",
                                    cy: "50%",
                                    innerRadius: 28,
                                    outerRadius: 55,
                                    paddingAngle: 1,
                                    animationDuration: 600,
                                    children: pieData.map((entry, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Cell, {
                                            fill: entry.fill,
                                            stroke: "none"
                                        }, i, false, {
                                            fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                            lineNumber: 52,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                                    content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DarkTooltip"], {
                                        formatter: formatter
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                        lineNumber: 55,
                                        columnNumber: 31
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 min-w-0 flex-1",
                        children: pieData.map((seg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 rounded-full shrink-0",
                                                style: {
                                                    backgroundColor: seg.fill
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                                lineNumber: 65,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `truncate text-text-main ${labelClassName}`.trim(),
                                                title: getLegendTitle?.(seg),
                                                children: seg.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                                lineNumber: 69,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `font-mono font-medium shrink-0 ${valueClassName}`,
                                        children: formatter(seg.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                        lineNumber: 76,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, getLegendKey ? getLegendKey(seg, i) : i, true, {
                                fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(CompactDonutCard, "v0x2Lf3k3EcxfDNuo4nHIkulSRQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"]
    ];
});
_c = CompactDonutCard;
function AccountDonut({ byAccount }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AccountDonut.useMemo[data]": ()=>byAccount || []
    }["AccountDonut.useMemo[data]"], [
        byAccount
    ]);
    const hasData = data.length > 0;
    const pieData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AccountDonut.useMemo[pieData]": ()=>{
            return data.slice(0, 8).map({
                "AccountDonut.useMemo[pieData]": (item, i)=>({
                        name: item.account,
                        value: item.totalTokens,
                        fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i)
                    })
            }["AccountDonut.useMemo[pieData]"]);
        }
    }["AccountDonut.useMemo[pieData]"], [
        data
    ]);
    if (!hasData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4 flex-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartByAccount")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactDonutCard, {
        pieData: pieData,
        title: t("chartByAccount"),
        formatter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"]
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
        lineNumber: 113,
        columnNumber: 10
    }, this);
}
_s1(AccountDonut, "faQbTc4RIll9BMbFXUTnjkTqRdE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = AccountDonut;
function ApiKeyDonut({ byApiKey }) {
    _s2();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyDonut.useMemo[data]": ()=>byApiKey || []
    }["ApiKeyDonut.useMemo[data]"], [
        byApiKey
    ]);
    const hasData = data.length > 0;
    const pieData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyDonut.useMemo[pieData]": ()=>{
            return data.slice(0, 8).map({
                "ApiKeyDonut.useMemo[pieData]": (item, i)=>({
                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatApiKeyLabel"])(item.apiKeyName, item.apiKeyId),
                        fullName: item.apiKeyName || item.apiKeyId || t("unknownApiKey"),
                        value: item.totalTokens,
                        fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i)
                    })
            }["ApiKeyDonut.useMemo[pieData]"]);
        }
    }["ApiKeyDonut.useMemo[pieData]"], [
        data,
        t
    ]);
    if (!hasData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4 flex-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartByApiKey")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
            lineNumber: 134,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactDonutCard, {
        pieData: pieData,
        title: t("chartByApiKey"),
        formatter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"],
        getLegendKey: (seg, i)=>`${seg.fullName}-${i}`,
        getLegendTitle: (seg)=>seg.fullName
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
_s2(ApiKeyDonut, "faQbTc4RIll9BMbFXUTnjkTqRdE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c2 = ApiKeyDonut;
function ProviderCostDonut({ byProvider }) {
    _s3();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderCostDonut.useMemo[data]": ()=>byProvider || []
    }["ProviderCostDonut.useMemo[data]"], [
        byProvider
    ]);
    const hasData = data.length > 0 && data.some((p)=>p.cost > 0);
    const pieData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderCostDonut.useMemo[pieData]": ()=>{
            return data.filter({
                "ProviderCostDonut.useMemo[pieData]": (item)=>item.cost > 0
            }["ProviderCostDonut.useMemo[pieData]"]).sort({
                "ProviderCostDonut.useMemo[pieData]": (a, b)=>b.cost - a.cost
            }["ProviderCostDonut.useMemo[pieData]"]).slice(0, 8).map({
                "ProviderCostDonut.useMemo[pieData]": (item, i)=>({
                        name: item.provider,
                        value: item.cost,
                        fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][i % __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"].length]
                    })
            }["ProviderCostDonut.useMemo[pieData]"]);
        }
    }["ProviderCostDonut.useMemo[pieData]"], [
        data
    ]);
    if (!hasData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4 flex-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartCostByProvider")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                    lineNumber: 176,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoCostData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
                    lineNumber: 179,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
            lineNumber: 175,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactDonutCard, {
        pieData: pieData,
        title: t("chartCostByProvider"),
        formatter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"],
        valueClassName: "text-amber-500",
        labelClassName: "capitalize"
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsDonuts.tsx",
        lineNumber: 185,
        columnNumber: 5
    }, this);
} // ── ModelOverTimeChart (Stacked Area) ──────────────────────────────────────
_s3(ProviderCostDonut, "faQbTc4RIll9BMbFXUTnjkTqRdE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c3 = ProviderCostDonut;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "CompactDonutCard");
__turbopack_context__.k.register(_c1, "AccountDonut");
__turbopack_context__.k.register(_c2, "ApiKeyDonut");
__turbopack_context__.k.register(_c3, "ProviderCostDonut");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/rechartsUsageCharts.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DailyTrendChart",
    ()=>DailyTrendChart,
    "ModelOverTimeChart",
    ()=>ModelOverTimeChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/rechartsCore.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function DailyTrendChart({ dailyTrend }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const chartData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyTrendChart.useMemo[chartData]": ()=>{
            return (dailyTrend || []).map({
                "DailyTrendChart.useMemo[chartData]": (d)=>({
                        date: d.date.slice(5),
                        [t("chartInput")]: d.promptTokens,
                        [t("chartOutput")]: d.completionTokens,
                        [t("chartCost")]: d.cost || 0
                    })
            }["DailyTrendChart.useMemo[chartData]"]);
        }
    }["DailyTrendChart.useMemo[chartData]"], [
        dailyTrend,
        t
    ]);
    const hasCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyTrendChart.useMemo[hasCost]": ()=>chartData.some({
                "DailyTrendChart.useMemo[hasCost]": (d)=>d[t("chartCost")] > 0
            }["DailyTrendChart.useMemo[hasCost]"])
    }["DailyTrendChart.useMemo[hasCost]"], [
        chartData,
        t
    ]);
    if (!chartData.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartModelUsageOverTime")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DailyTrendChartBody, {
        chartData: chartData,
        hasCost: hasCost
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 36,
        columnNumber: 10
    }, this);
}
_s(DailyTrendChart, "A6CXMFze7MuWJ4cmAkstHxTHUsQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = DailyTrendChart;
function DailyTrendChartBody({ chartData, hasCost }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const recharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"])();
    if (!recharts) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChartLoadingCard"], {}, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
            lineNumber: 44,
            columnNumber: 12
        }, this);
    }
    const { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } = recharts;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4 flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                children: t("chartModelUsageOverTime")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResponsiveContainer, {
                width: "100%",
                height: 140,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ComposedChart, {
                    data: chartData,
                    margin: {
                        top: 0,
                        right: hasCost ? 40 : 0,
                        left: 0,
                        bottom: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(XAxis, {
                            dataKey: "date",
                            tick: {
                                fontSize: 9,
                                fill: "var(--color-text-muted)"
                            },
                            axisLine: false,
                            tickLine: false,
                            interval: Math.max(Math.floor(chartData.length / 6), 0)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        hasCost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(YAxis, {
                            yAxisId: "cost",
                            orientation: "right",
                            tick: {
                                fontSize: 8,
                                fill: "#f59e0b"
                            },
                            axisLine: false,
                            tickLine: false,
                            tickFormatter: (v)=>`$${v.toFixed(2)}`,
                            width: 36
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 67,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CostTooltip, {}, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 77,
                                columnNumber: 29
                            }, this),
                            cursor: {
                                fill: "rgba(255,255,255,0.04)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                            dataKey: t("chartInput"),
                            stackId: "a",
                            fill: "var(--color-primary)",
                            opacity: 0.7,
                            radius: [
                                0,
                                0,
                                0,
                                0
                            ],
                            animationDuration: 600
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                            dataKey: t("chartOutput"),
                            stackId: "a",
                            fill: "#10b981",
                            opacity: 0.7,
                            radius: [
                                3,
                                3,
                                0,
                                0
                            ],
                            animationDuration: 600
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        hasCost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                            yAxisId: "cost",
                            type: "monotone",
                            dataKey: t("chartCost"),
                            stroke: "#f59e0b",
                            strokeWidth: 2,
                            dot: false,
                            animationDuration: 600
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 mt-2 text-[10px] text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2 h-2 rounded-full bg-primary/70"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, this),
                            " ",
                            t("chartInput")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2 h-2 rounded-full bg-emerald-500/70"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 112,
                                columnNumber: 11
                            }, this),
                            " ",
                            t("chartOutput")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    hasCost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2 h-2 rounded-full bg-amber-500/70"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 116,
                                columnNumber: 13
                            }, this),
                            " ",
                            t("chartCost"),
                            " ($)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s1(DailyTrendChartBody, "bBf0d6GgXiolr35QqeRTxXw9I3I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"]
    ];
});
_c1 = DailyTrendChartBody;
// ── Cost-aware Tooltip ─────────────────────────────────────────────────────
function CostTooltip({ active, payload, label }) {
    _s2();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    if (!active || !payload?.length) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs shadow-lg",
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-semibold text-text-main mb-1",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 139,
                columnNumber: 17
            }, this),
            payload.map((entry, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5 text-text-muted",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "w-2 h-2 rounded-full shrink-0",
                            style: {
                                backgroundColor: entry.color
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                entry.name,
                                ":"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono font-medium text-text-main",
                            children: entry.name === t("chartCost") ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCost"])(entry.value) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(entry.value)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 141,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_s2(CostTooltip, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c2 = CostTooltip;
// ── WeeklyPattern (Recharts) ───────────────────────────────────────────────
function WeeklyPattern({ weeklyPattern }) {
    _s3();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const chartData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WeeklyPattern.useMemo[chartData]": ()=>{
            return (weeklyPattern || []).map({
                "WeeklyPattern.useMemo[chartData]": (w)=>({
                        day: w.day.slice(0, 3),
                        Tokens: w.totalTokens
                    })
            }["WeeklyPattern.useMemo[chartData]"]);
        }
    }["WeeklyPattern.useMemo[chartData]"], [
        weeklyPattern
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WeeklyPatternBody, {
        chartData: chartData,
        title: t("chartWeekly")
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 167,
        columnNumber: 10
    }, this);
}
_s3(WeeklyPattern, "cR6/04I1JcfYzJW+TRkfYrvSTyQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c3 = WeeklyPattern;
function WeeklyPatternBody({ chartData, title }) {
    _s4();
    const recharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"])();
    if (!recharts) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "px-4 py-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xs font-semibold text-text-muted uppercase tracking-wider mb-2",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 176,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-12"
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 179,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
            lineNumber: 175,
            columnNumber: 7
        }, this);
    }
    const { ResponsiveContainer, BarChart, XAxis, Tooltip, Bar } = recharts;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "px-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-xs font-semibold text-text-muted uppercase tracking-wider mb-2",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResponsiveContainer, {
                width: "100%",
                height: 48,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BarChart, {
                    data: chartData,
                    margin: {
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(XAxis, {
                            dataKey: "day",
                            tick: {
                                fontSize: 9,
                                fill: "var(--color-text-muted)"
                            },
                            axisLine: false,
                            tickLine: false
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 193,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DarkTooltip"], {
                                formatter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"]
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 200,
                                columnNumber: 22
                            }, this),
                            cursor: {
                                fill: "rgba(255,255,255,0.04)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                            dataKey: "Tokens",
                            fill: "var(--color-text-muted)",
                            opacity: 0.3,
                            radius: [
                                3,
                                3,
                                0,
                                0
                            ],
                            animationDuration: 400
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 192,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 187,
        columnNumber: 5
    }, this);
}
_s4(WeeklyPatternBody, "v0x2Lf3k3EcxfDNuo4nHIkulSRQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"]
    ];
});
_c4 = WeeklyPatternBody;
function ModelOverTimeChart({ dailyByModel, modelNames }) {
    _s5();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModelOverTimeChart.useMemo[data]": ()=>dailyByModel || []
    }["ModelOverTimeChart.useMemo[data]"], [
        dailyByModel
    ]);
    const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModelOverTimeChart.useMemo[models]": ()=>modelNames || []
    }["ModelOverTimeChart.useMemo[models]"], [
        modelNames
    ]);
    // Prepare chart data — format dates (must be before early return for rules-of-hooks)
    const chartData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModelOverTimeChart.useMemo[chartData]": ()=>{
            return data.map({
                "ModelOverTimeChart.useMemo[chartData]": (d)=>{
                    const row = {
                        ...d
                    };
                    // Short date label
                    if (d.date) {
                        const parts = d.date.split("-");
                        row.dateLabel = `${parts[1]}/${parts[2]}`;
                    }
                    return row;
                }
            }["ModelOverTimeChart.useMemo[chartData]"]);
        }
    }["ModelOverTimeChart.useMemo[chartData]"], [
        data
    ]);
    if (!data.length || !models.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            className: "p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                    children: t("chartModelUsageOverTime")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 239,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-text-muted text-sm py-8",
                    children: t("chartNoData")
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 242,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
            lineNumber: 238,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModelOverTimeChartBody, {
        chartData: chartData,
        models: models
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 247,
        columnNumber: 10
    }, this);
}
_s5(ModelOverTimeChart, "qgNS6HPfNAJXWfaiwEHLJwpSt8I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c5 = ModelOverTimeChart;
function ModelOverTimeChartBody({ chartData, models }) {
    _s6();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const recharts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"])();
    if (!recharts) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChartLoadingCard"], {
            className: "p-4"
        }, void 0, false, {
            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
            lineNumber: 255,
            columnNumber: 12
        }, this);
    }
    const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } = recharts;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-text-muted uppercase tracking-wider mb-3",
                children: t("chartModelUsageOverTime")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResponsiveContainer, {
                width: "100%",
                height: 240,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AreaChart, {
                    data: chartData,
                    margin: {
                        top: 4,
                        right: 4,
                        left: 0,
                        bottom: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(XAxis, {
                            dataKey: "dateLabel",
                            tick: {
                                fontSize: 10,
                                fill: "var(--color-text-muted)"
                            },
                            axisLine: false,
                            tickLine: false,
                            interval: "preserveStartEnd"
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(YAxis, {
                            tick: {
                                fontSize: 10,
                                fill: "var(--color-text-muted)"
                            },
                            tickFormatter: (v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(v),
                            axisLine: false,
                            tickLine: false,
                            width: 50
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 274,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
                            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DarkTooltip"], {
                                formatter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"]
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 281,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                            lineNumber: 281,
                            columnNumber: 11
                        }, this),
                        models.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Area, {
                                type: "monotone",
                                dataKey: m,
                                stackId: "1",
                                stroke: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i),
                                fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i),
                                fillOpacity: 0.4,
                                strokeWidth: 1.5,
                                animationDuration: 600
                            }, m, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 283,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                    lineNumber: 266,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-text-muted",
                children: models.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2 h-2 rounded-full shrink-0",
                                style: {
                                    backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelColor"])(i)
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                                lineNumber: 300,
                                columnNumber: 13
                            }, this),
                            m
                        ]
                    }, m, true, {
                        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
                lineNumber: 297,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/rechartsUsageCharts.tsx",
        lineNumber: 261,
        columnNumber: 5
    }, this);
} // ── ProviderTable ──────────────────────────────────────────────────────────
_s6(ModelOverTimeChartBody, "bBf0d6GgXiolr35QqeRTxXw9I3I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsCore$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRecharts"]
    ];
});
_c6 = ModelOverTimeChartBody;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "DailyTrendChart");
__turbopack_context__.k.register(_c1, "DailyTrendChartBody");
__turbopack_context__.k.register(_c2, "CostTooltip");
__turbopack_context__.k.register(_c3, "WeeklyPattern");
__turbopack_context__.k.register(_c4, "WeeklyPatternBody");
__turbopack_context__.k.register(_c5, "ModelOverTimeChart");
__turbopack_context__.k.register(_c6, "ModelOverTimeChartBody");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ApiKeyFilterDropdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function maskKeyName(name) {
    if (!name || name.length <= 8) return name || "unknown";
    return `${name.slice(0, 6)}…${name.slice(-4)}`;
}
function ApiKeyFilterDropdown({ available, selected, onChange }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close on click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ApiKeyFilterDropdown.useEffect": ()=>{
            if (!open) return;
            function handleClick(e) {
                if (ref.current && !ref.current.contains(e.target)) {
                    setOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "ApiKeyFilterDropdown.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["ApiKeyFilterDropdown.useEffect"];
        }
    }["ApiKeyFilterDropdown.useEffect"], [
        open
    ]);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ApiKeyFilterDropdown.useEffect": ()=>{
            if (!open) return;
            function handleKey(e) {
                if (e.key === "Escape") setOpen(false);
            }
            document.addEventListener("keydown", handleKey);
            return ({
                "ApiKeyFilterDropdown.useEffect": ()=>document.removeEventListener("keydown", handleKey)
            })["ApiKeyFilterDropdown.useEffect"];
        }
    }["ApiKeyFilterDropdown.useEffect"], [
        open
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyFilterDropdown.useMemo[filtered]": ()=>{
            const q = query.trim().toLowerCase();
            if (!q) return available;
            return available.filter({
                "ApiKeyFilterDropdown.useMemo[filtered]": (k)=>k.name.toLowerCase().includes(q) || k.id.toLowerCase().includes(q)
            }["ApiKeyFilterDropdown.useMemo[filtered]"]);
        }
    }["ApiKeyFilterDropdown.useMemo[filtered]"], [
        available,
        query
    ]);
    const isAllSelected = selected.length === 0;
    const toggleKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ApiKeyFilterDropdown.useCallback[toggleKey]": (id)=>{
            if (selected.includes(id)) {
                const next = selected.filter({
                    "ApiKeyFilterDropdown.useCallback[toggleKey].next": (s)=>s !== id
                }["ApiKeyFilterDropdown.useCallback[toggleKey].next"]);
                onChange(next);
            } else {
                onChange([
                    ...selected,
                    id
                ]);
            }
        }
    }["ApiKeyFilterDropdown.useCallback[toggleKey]"], [
        selected,
        onChange
    ]);
    const selectAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ApiKeyFilterDropdown.useCallback[selectAll]": ()=>{
            onChange([]);
        }
    }["ApiKeyFilterDropdown.useCallback[selectAll]"], [
        onChange
    ]);
    const buttonLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ApiKeyFilterDropdown.useMemo[buttonLabel]": ()=>{
            if (isAllSelected) return t("filterAllKeys");
            if (selected.length === 1) {
                const key = available.find({
                    "ApiKeyFilterDropdown.useMemo[buttonLabel].key": (k)=>k.id === selected[0]
                }["ApiKeyFilterDropdown.useMemo[buttonLabel].key"]);
                return key ? maskKeyName(key.name) : t("filterOneKey");
            }
            return t("filterMultipleKeys", {
                count: selected.length
            });
        }
    }["ApiKeyFilterDropdown.useMemo[buttonLabel]"], [
        isAllSelected,
        selected,
        available,
        t
    ]);
    if (available.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: ref,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((v)=>!v),
                className: `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${isAllSelected ? "border-border/50 bg-black/[0.03] text-text-muted hover:text-text-main dark:bg-white/[0.03]" : "border-primary/40 bg-primary/10 text-primary"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px]",
                        children: "vpn_key"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    buttonLabel,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `material-symbols-outlined text-[14px] transition-transform ${open ? "rotate-180" : ""}`,
                        children: "expand_more"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-0 top-full z-50 mt-1.5 w-[260px] rounded-xl border border-border/50 bg-surface shadow-xl",
                style: {
                    backdropFilter: "blur(16px)"
                },
                children: [
                    available.length > 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-b border-border/30 p-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: query,
                            onChange: (e)=>setQuery(e.target.value),
                            placeholder: t("filterSearchKeys"),
                            className: "w-full rounded-md border border-border/30 bg-black/[0.03] px-2.5 py-1.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary dark:bg-white/[0.03]",
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                            lineNumber: 121,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                        lineNumber: 120,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-[280px] overflow-y-auto p-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: selectAll,
                                className: `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${isAllSelected ? "bg-primary/10 text-primary font-semibold" : "text-text-muted hover:bg-black/[0.04] hover:text-text-main dark:hover:bg-white/[0.04]"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${isAllSelected ? "border-primary bg-primary text-white" : "border-border/60 bg-transparent"}`,
                                        children: isAllSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[12px]",
                                            children: "check"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                            lineNumber: 151,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                        lineNumber: 143,
                                        columnNumber: 15
                                    }, this),
                                    t("filterAllKeys"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-auto text-[10px] text-text-muted font-normal",
                                        children: available.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                        lineNumber: 155,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "my-1 h-px bg-border/20"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this),
                            filtered.map((key)=>{
                                const isChecked = selected.includes(key.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>toggleKey(key.id),
                                    className: `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${isChecked ? "bg-primary/[0.06] text-text-main" : "text-text-muted hover:bg-black/[0.04] hover:text-text-main dark:hover:bg-white/[0.04]"}`,
                                    title: key.name || key.id,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${isChecked ? "border-primary bg-primary text-white" : "border-border/60 bg-transparent"}`,
                                            children: isChecked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[12px]",
                                                children: "check"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                                lineNumber: 187,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                            lineNumber: 179,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate",
                                            children: maskKeyName(key.name || key.id)
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                            lineNumber: 190,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, key.id, true, {
                                    fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                    lineNumber: 168,
                                    columnNumber: 17
                                }, this);
                            }),
                            filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-2.5 py-3 text-center text-[11px] text-text-muted",
                                children: t("filterNoKeysMatch")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                                lineNumber: 196,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                        lineNumber: 132,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_s(ApiKeyFilterDropdown, "e4JqsphnPYaeNAQdU612Phox/yk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = ApiKeyFilterDropdown;
var _c;
__turbopack_context__.k.register(_c, "ApiKeyFilterDropdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/CustomRangePicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomRangePicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function toLocalDatetime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n)=>String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalDatetime(local) {
    if (!local) return "";
    return new Date(local).toISOString();
}
function getPresetRange(preset) {
    const now = new Date();
    const end = toLocalDatetime(now.toISOString());
    const s = new Date(now);
    switch(preset){
        case "today":
            s.setHours(0, 0, 0, 0);
            break;
        case "yesterday":
            {
                s.setDate(s.getDate() - 1);
                s.setHours(0, 0, 0, 0);
                const e = new Date(s);
                e.setHours(23, 59, 59, 999);
                return {
                    start: toLocalDatetime(s.toISOString()),
                    end: toLocalDatetime(e.toISOString())
                };
            }
        case "thisWeek":
            s.setDate(s.getDate() - s.getDay());
            s.setHours(0, 0, 0, 0);
            break;
        case "thisMonth":
            s.setDate(1);
            s.setHours(0, 0, 0, 0);
            break;
        case "last3d":
            s.setDate(s.getDate() - 3);
            break;
        case "last14d":
            s.setDate(s.getDate() - 14);
            break;
        default:
            s.setDate(s.getDate() - 7);
    }
    return {
        start: toLocalDatetime(s.toISOString()),
        end
    };
}
function CustomRangePicker({ start, end, onApply, onClose }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const [localStart, setLocalStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(toLocalDatetime(start) || "");
    const [localEnd, setLocalEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(toLocalDatetime(end) || "");
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close on click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomRangePicker.useEffect": ()=>{
            function handleClick(e) {
                if (ref.current && !ref.current.contains(e.target)) {
                    onClose();
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "CustomRangePicker.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["CustomRangePicker.useEffect"];
        }
    }["CustomRangePicker.useEffect"], [
        onClose
    ]);
    // Close on Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomRangePicker.useEffect": ()=>{
            function handleKey(e) {
                if (e.key === "Escape") onClose();
            }
            document.addEventListener("keydown", handleKey);
            return ({
                "CustomRangePicker.useEffect": ()=>document.removeEventListener("keydown", handleKey)
            })["CustomRangePicker.useEffect"];
        }
    }["CustomRangePicker.useEffect"], [
        onClose
    ]);
    const handleApply = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CustomRangePicker.useCallback[handleApply]": ()=>{
            if (localStart && localEnd) {
                onApply(fromLocalDatetime(localStart), fromLocalDatetime(localEnd));
            }
        }
    }["CustomRangePicker.useCallback[handleApply]"], [
        localStart,
        localEnd,
        onApply
    ]);
    const handlePreset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CustomRangePicker.useCallback[handlePreset]": (preset)=>{
            const { start: s, end: e } = getPresetRange(preset);
            setLocalStart(s);
            setLocalEnd(e);
        }
    }["CustomRangePicker.useCallback[handlePreset]"], []);
    const isValid = localStart && localEnd && new Date(localStart) <= new Date(localEnd);
    const presets = [
        {
            key: "today",
            label: t("rangeToday")
        },
        {
            key: "yesterday",
            label: t("rangeYesterday")
        },
        {
            key: "last3d",
            label: t("rangeLast3Days")
        },
        {
            key: "thisWeek",
            label: t("rangeThisWeek")
        },
        {
            key: "last14d",
            label: t("rangeLast14Days")
        },
        {
            key: "thisMonth",
            label: t("rangeThisMonth")
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: "absolute right-0 top-full z-50 mt-2 w-[340px] rounded-xl border border-border/50 bg-surface p-4 shadow-xl",
        style: {
            backdropFilter: "blur(16px)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5",
                        children: t("rangeQuickSelect")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1",
                        children: presets.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handlePreset(p.key),
                                className: "rounded-md border border-border/30 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium text-text-muted transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30 dark:bg-white/[0.03]",
                                children: p.label
                            }, p.key, false, {
                                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-border/30 mb-3"
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1 block",
                                children: t("rangeStart")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "datetime-local",
                                value: localStart,
                                onChange: (e)=>setLocalStart(e.target.value),
                                className: "w-full rounded-lg border border-border/50 bg-black/[0.04] px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary dark:bg-white/[0.04]"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                                lineNumber: 150,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1 block",
                                children: t("rangeEnd")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "datetime-local",
                                value: localEnd,
                                onChange: (e)=>setLocalEnd(e.target.value),
                                className: "w-full rounded-lg border border-border/50 bg-black/[0.04] px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary dark:bg-white/[0.04]"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            localStart && localEnd && !isValid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1.5 text-[11px] text-error",
                children: t("rangeErrorInvalid")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                lineNumber: 172,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex items-center justify-end gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onClose,
                        className: "rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-main transition-colors",
                        children: t("rangeCancel")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: !isValid,
                        onClick: handleApply,
                        className: "rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed",
                        children: t("rangeApply")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/CustomRangePicker.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_s(CustomRangePicker, "Th9ZwTWEWoMnury7oddU1SKu+EU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CustomRangePicker;
var _c;
__turbopack_context__.k.register(_c, "CustomRangePicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/RequestCountDateFilter.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequestCountDateFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function RequestCountDateFilter({ title, dateLabel, value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 border-b border-border flex items-center justify-between flex-wrap gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-text-muted uppercase tracking-wider",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/RequestCountDateFilter.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "date",
                        value: value,
                        onChange: (e)=>onChange(e.target.value),
                        "aria-label": dateLabel,
                        className: "px-2 py-1 rounded-md text-xs bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/RequestCountDateFilter.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onChange(""),
                        className: "text-xs text-text-muted hover:text-text-main",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[14px]",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/analytics/RequestCountDateFilter.tsx",
                            lineNumber: 35,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/analytics/RequestCountDateFilter.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/RequestCountDateFilter.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/RequestCountDateFilter.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = RequestCountDateFilter;
var _c;
__turbopack_context__.k.register(_c, "RequestCountDateFilter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/RequestCountTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequestCountTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * RequestCountTable — pure presentational table for #4009.
 * Split out of RequestCountByProviderDateTable to keep that container under
 * the max-lines-per-function complexity gate.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/chartColors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/charts.tsx [app-client] (ecmascript) <locals>");
"use client";
;
;
;
;
function RequestCountTable({ rows, sortBy, sortOrder, onToggleSort, dateLabel, providerLabel, requestsLabel, totalLabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    className: "text-xs text-text-muted uppercase bg-black/[0.02] dark:bg-white/[0.02]",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-4 py-2.5 text-left cursor-pointer group",
                                onClick: ()=>onToggleSort("date"),
                                children: [
                                    dateLabel,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SortIndicator"], {
                                        active: sortBy === "date",
                                        sortOrder: sortOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                        lineNumber: 54,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-4 py-2.5 text-left cursor-pointer group",
                                onClick: ()=>onToggleSort("provider"),
                                children: [
                                    providerLabel,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SortIndicator"], {
                                        active: sortBy === "provider",
                                        sortOrder: sortOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                        lineNumber: 60,
                                        columnNumber: 31
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                lineNumber: 56,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-4 py-2.5 text-right cursor-pointer group",
                                onClick: ()=>onToggleSort("requests"),
                                children: [
                                    requestsLabel,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SortIndicator"], {
                                        active: sortBy === "requests",
                                        sortOrder: sortOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                        lineNumber: 66,
                                        columnNumber: 31
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-4 py-2.5 text-right cursor-pointer group",
                                onClick: ()=>onToggleSort("totalTokens"),
                                children: [
                                    totalLabel,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SortIndicator"], {
                                        active: sortBy === "totalTokens",
                                        sortOrder: sortOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                        lineNumber: 72,
                                        columnNumber: 28
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                lineNumber: 68,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    className: "divide-y divide-border",
                    children: rows.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-2.5 font-mono text-text-muted",
                                    children: row.date
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-2.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-2 h-2 rounded-full shrink-0",
                                                style: {
                                                    backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][i % __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$chartColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"].length]
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                                lineNumber: 85,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium capitalize",
                                                children: row.provider
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                                lineNumber: 89,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                        lineNumber: 84,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                    lineNumber: 83,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-2.5 text-right font-mono font-semibold",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtFull"])(row.requests)
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                    lineNumber: 92,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-2.5 text-right font-mono text-text-muted",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCompact"])(row.totalTokens)
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, `${row.date}::${row.provider}`, true, {
                            fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/analytics/RequestCountTable.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_c = RequestCountTable;
var _c;
__turbopack_context__.k.register(_c, "RequestCountTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/useProviderDailyUsage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProviderDailyUsage",
    ()=>useProviderDailyUsage
]);
/**
 * useProviderDailyUsage — data hook for #4009's request-count-by-provider-date table.
 * Split out of RequestCountByProviderDateTable to keep that container under the
 * max-lines-per-function complexity gate.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchError$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/fetchError.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function useProviderDailyUsage(range, dateFilter) {
    _s();
    const tCommon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useProviderDailyUsage.useCallback[fetchRows]": async ()=>{
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (dateFilter) {
                    params.set("date", dateFilter);
                } else {
                    params.set("range", range);
                }
                const res = await fetch(`/api/usage/requests-by-provider-date?${params.toString()}`);
                if (!res.ok) throw new Error(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchError$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readFetchErrorMessage"])(res, tCommon("error")));
                const data = await res.json();
                setRows(Array.isArray(data.rows) ? data.rows : []);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally{
                setLoading(false);
            }
        }
    }["useProviderDailyUsage.useCallback[fetchRows]"], [
        range,
        dateFilter,
        tCommon
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useProviderDailyUsage.useEffect": ()=>{
            fetchRows();
        }
    }["useProviderDailyUsage.useEffect"], [
        fetchRows
    ]);
    return {
        rows,
        loading,
        error
    };
}
_s(useProviderDailyUsage, "k9ItfCAkr5sHdcRWqRLD5nIHLls=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/requestCountSort.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * requestCountSort — pure sort helper for #4009's request-count-by-provider-date table.
 * Split out of RequestCountByProviderDateTable to keep that container under the
 * max-lines-per-function complexity gate.
 */ __turbopack_context__.s([
    "sortProviderDailyUsageRows",
    ()=>sortProviderDailyUsageRows
]);
function sortProviderDailyUsageRows(rows, sortBy, sortOrder) {
    const arr = [
        ...rows
    ];
    arr.sort((a, b)=>{
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === "string" && typeof vb === "string") {
            return sortOrder === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return sortOrder === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });
    return arr;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequestCountByProviderDateTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * RequestCountByProviderDateTable — #4009
 *
 * Some providers bill by request rather than by token, so operators need a
 * plain per-provider, per-date request count (not just token aggregates).
 * Self-contained: fetches its own data (via useProviderDailyUsage) from a
 * dedicated endpoint so the main analytics route (frozen at the file-size
 * baseline) stays untouched. Header + table markup are split into
 * RequestCountDateFilter / RequestCountTable to keep this container under
 * the max-lines-per-function complexity gate.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountDateFilter$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/RequestCountDateFilter.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/RequestCountTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$useProviderDailyUsage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/useProviderDailyUsage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$requestCountSort$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/requestCountSort.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function RequestCountByProviderDateTable({ range }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    const tCommon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [dateFilter, setDateFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("date");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    const { rows, loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$useProviderDailyUsage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProviderDailyUsage"])(range, dateFilter);
    const toggleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RequestCountByProviderDateTable.useCallback[toggleSort]": (field)=>{
            if (sortBy === field) {
                setSortOrder({
                    "RequestCountByProviderDateTable.useCallback[toggleSort]": (prev)=>prev === "asc" ? "desc" : "asc"
                }["RequestCountByProviderDateTable.useCallback[toggleSort]"]);
            } else {
                setSortBy(field);
                setSortOrder("desc");
            }
        }
    }["RequestCountByProviderDateTable.useCallback[toggleSort]"], [
        sortBy
    ]);
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RequestCountByProviderDateTable.useMemo[sorted]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$requestCountSort$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortProviderDailyUsageRows"])(rows, sortBy, sortOrder)
    }["RequestCountByProviderDateTable.useMemo[sorted]"], [
        rows,
        sortBy,
        sortOrder
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountDateFilter$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                title: t("chartRequestsByProviderDate"),
                dateLabel: t("chartDate"),
                value: dateFilter,
                onChange: setDateFilter
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            loading && rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-text-muted text-sm py-8",
                children: tCommon("loading")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-red-500 text-sm py-8",
                children: [
                    tCommon("errorShort"),
                    ": ",
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this) : sorted.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-text-muted text-sm py-8",
                children: t("chartNoData")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                rows: sorted,
                sortBy: sortBy,
                sortOrder: sortOrder,
                onToggleSort: toggleSort,
                dateLabel: t("chartDate"),
                providerLabel: t("chartProvider"),
                requestsLabel: t("chartRequests"),
                totalLabel: t("chartTotal")
            }, void 0, false, {
                fileName: "[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(RequestCountByProviderDateTable, "C9NQS+StngzfZFbJ0WkPV6r7ooU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$useProviderDailyUsage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProviderDailyUsage"]
    ];
});
_c = RequestCountByProviderDateTable;
var _c;
__turbopack_context__.k.register(_c, "RequestCountByProviderDateTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/index.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Analytics Charts — Barrel export
 *
 * TODO (#5): Split charts.js into individual component files:
 *   - StatCard.js, ActivityHeatmap.js, DailyTrendChart.js
 *   - AccountDonut.js, ApiKeyDonut.js, ProviderCostDonut.js
 *   - ApiKeyTable.js, ModelTable.js
 *   - WeeklyPattern.js, MostActiveDay7d.js, WeeklySquares7d.js
 *   - UsageDetail.js, SortIndicator.js
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/charts.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$ModelTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/ModelTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsDonuts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/rechartsDonuts.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$rechartsUsageCharts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/rechartsUsageCharts.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$ApiKeyFilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$CustomRangePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/CustomRangePicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountByProviderDateTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx [app-client] (ecmascript) <export default as ApiKeyFilterDropdown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiKeyFilterDropdown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$ApiKeyFilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$ApiKeyFilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/ApiKeyFilterDropdown.tsx [app-client] (ecmascript)");
}),
"[project]/src/shared/components/analytics/CustomRangePicker.tsx [app-client] (ecmascript) <export default as CustomRangePicker>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomRangePicker",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$CustomRangePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$CustomRangePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/CustomRangePicker.tsx [app-client] (ecmascript)");
}),
"[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx [app-client] (ecmascript) <export default as RequestCountByProviderDateTable>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequestCountByProviderDateTable",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountByProviderDateTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$analytics$2f$RequestCountByProviderDateTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/analytics/RequestCountByProviderDateTable.tsx [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=src_shared_components_analytics_10wjm-p._.js.map