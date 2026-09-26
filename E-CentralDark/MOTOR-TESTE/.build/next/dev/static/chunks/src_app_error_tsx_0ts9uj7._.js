(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/error.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Error
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function Error({ error, reset }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center min-h-[60vh] p-6 text-center",
        role: "alert",
        "aria-live": "assertive",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[64px] mb-4",
                "aria-hidden": "true",
                children: "🔧"
            }, void 0, false, {
                fileName: "[project]/src/app/error.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-[28px] font-bold mb-2 text-[var(--color-text-main)]",
                children: "Internal Server Error"
            }, void 0, false, {
                fileName: "[project]/src/app/error.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[15px] text-[var(--color-text-muted)] max-w-[400px] leading-relaxed mb-2",
                children: "Something went wrong while processing your request. Our team has been notified and is working on a fix."
            }, void 0, false, {
                fileName: "[project]/src/app/error.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            error?.digest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-[var(--color-text-muted)] mb-6 font-mono",
                children: [
                    "Error ID: ",
                    error.digest
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/error.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this),
            ("TURBOPACK compile-time value", "development") === "development" && error?.message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs max-w-[600px] overflow-auto text-left mb-6",
                "aria-label": "Error details",
                children: error.message
            }, void 0, false, {
                fileName: "[project]/src/app/error.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: reset,
                        "aria-label": "Retry loading the page",
                        className: "px-6 py-2.5 rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 motion-reduce:transition-none bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-accent)]",
                        children: "Try Again"
                    }, void 0, false, {
                        fileName: "[project]/src/app/error.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/dashboard",
                        className: "px-6 py-2.5 rounded-lg text-[var(--color-text-main)] text-sm font-semibold cursor-pointer transition-all duration-200 motion-reduce:transition-none border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] no-underline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-accent)]",
                        "aria-label": "Return to dashboard",
                        children: "Go to Dashboard"
                    }, void 0, false, {
                        fileName: "[project]/src/app/error.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/status",
                        className: "px-6 py-2.5 rounded-lg text-[var(--color-text-main)] text-sm font-semibold cursor-pointer transition-all duration-200 motion-reduce:transition-none border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] no-underline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-accent)]",
                        "aria-label": "Open system status",
                        children: "System Status"
                    }, void 0, false, {
                        fileName: "[project]/src/app/error.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/error.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/error.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = Error;
var _c;
__turbopack_context__.k.register(_c, "Error");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_error_tsx_0ts9uj7._.js.map