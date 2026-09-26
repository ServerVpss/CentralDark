(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useServiceStatus",
    ()=>useServiceStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const POLL_INTERVAL_MS = 5_000;
function useServiceStatus(name) {
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tick, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const mutate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useServiceStatus.useCallback[mutate]": ()=>setTick({
                "useServiceStatus.useCallback[mutate]": (n)=>n + 1
            }["useServiceStatus.useCallback[mutate]"])
    }["useServiceStatus.useCallback[mutate]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useServiceStatus.useEffect": ()=>{
            let cancelled = false;
            async function fetchStatus() {
                try {
                    const res = await fetch(`/api/services/${name}/status`);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const json = await res.json();
                    if (!cancelled) {
                        setData(json);
                        setError(null);
                    }
                } catch (err) {
                    if (!cancelled) {
                        setError(err instanceof Error ? err.message : String(err));
                    }
                } finally{
                    if (!cancelled) setIsLoading(false);
                }
            }
            void fetchStatus();
            const timer = setInterval(fetchStatus, POLL_INTERVAL_MS);
            return ({
                "useServiceStatus.useEffect": ()=>{
                    cancelled = true;
                    clearInterval(timer);
                }
            })["useServiceStatus.useEffect"];
        }
    }["useServiceStatus.useEffect"], [
        name,
        tick
    ]);
    return {
        data,
        isLoading,
        error,
        mutate
    };
}
_s(useServiceStatus, "Irf6+JRWTv2Frcow8yuX0LaqHMM=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceStatusCard",
    ()=>ServiceStatusCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function StateDot({ state, health }) {
    const color = state === "running" && health === "ok" ? "bg-green-500" : state === "running" ? "bg-yellow-500" : state === "starting" ? "bg-blue-400 animate-pulse" : state === "error" ? "bg-red-500" : "bg-border";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-block size-2 rounded-full shrink-0", color)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
_c = StateDot;
function ServiceStatusCard({ name }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { data, isLoading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(name);
    if (isLoading && !data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
            padding: "md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-20 animate-pulse bg-bg-subtle rounded"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    if (error && !data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
            padding: "md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-red-500",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, this);
    }
    if (!data) return null;
    const stateKey = {
        running: "stateRunning",
        stopped: "stateStopped",
        starting: "stateStarting",
        stopping: "stateStopping",
        error: "stateError",
        not_installed: "stateNotInstalled",
        unknown: "stateUnknown"
    }[data.state] ?? "stateUnknown";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StateDot, {
                                state: data.state,
                                health: data.health
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium",
                                        children: t(stateKey)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                                        lineNumber: 66,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted truncate",
                                        children: [
                                            t("port", {
                                                port: data.port
                                            }),
                                            data.pid ? ` · PID ${data.pid}` : ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                                        lineNumber: 67,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    data.installedVersion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-mono text-text-muted",
                                children: [
                                    "v",
                                    data.installedVersion
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, this),
                            data.updateAvailable && data.latestVersion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-yellow-600 dark:text-yellow-400",
                                children: [
                                    "→ v",
                                    data.latestVersion
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                                lineNumber: 78,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            data.adopted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px] shrink-0 mt-0.5",
                        children: "info"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "This process was adopted from an already-running instance, not started by this supervisor — live log tailing isn't available until you restart it (Stop, then Start), or turn on Auto-restart adopted process below."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this),
            data.lastError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-xs text-red-500 break-words",
                children: data.lastError
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
                lineNumber: 99,
                columnNumber: 26
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(ServiceStatusCard, "0xqigWg36gHFj1rAuIevq1cTY98=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c1 = ServiceStatusCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "StateDot");
__turbopack_context__.k.register(_c1, "ServiceStatusCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceLifecycleButtons",
    ()=>ServiceLifecycleButtons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ServiceLifecycleButtons({ name }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { data, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(name);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const running = data?.state === "running";
    const starting = data?.state === "starting";
    const notInstalled = !data?.installedVersion;
    const busy = pending !== null || starting;
    async function action(verb) {
        setPending(verb);
        setError(null);
        try {
            const res = await fetch(`/api/services/${name}/${verb}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });
            if (!res.ok) {
                const payload = await res.json().catch(()=>null);
                throw new Error(payload?.error?.message || `HTTP ${res.status}`);
            }
            mutate();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setPending(null);
        }
    }
    if (notInstalled) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LifecycleButtonGroup, {
            error: error
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
            lineNumber: 49,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        size: "sm",
                        disabled: busy || running,
                        onClick: ()=>action("start"),
                        children: pending === "start" ? t("starting") : t("start")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        size: "sm",
                        variant: "outline",
                        disabled: busy || !running,
                        onClick: ()=>action("stop"),
                        children: pending === "stop" ? t("stopping") : t("stop")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        size: "sm",
                        variant: "outline",
                        disabled: busy || !running,
                        onClick: ()=>action("restart"),
                        children: pending === "restart" ? t("restarting") : t("restart")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        size: "sm",
                        variant: "outline",
                        disabled: busy,
                        onClick: ()=>action("update"),
                        children: pending === "update" ? t("updating") : t("update")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-red-600 dark:text-red-400",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                lineNumber: 78,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
    //TURBOPACK unreachable
    ;
    function LifecycleButtonGroup({ error }) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                    size: "sm",
                    disabled: busy,
                    onClick: ()=>action("install"),
                    children: pending === "install" ? t("installing") : t("install")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-red-600 dark:text-red-400",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
                    lineNumber: 88,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx",
            lineNumber: 84,
            columnNumber: 7
        }, this);
    }
}
_s(ServiceLifecycleButtons, "ELPQnnlAF7t4qejrwMaX01WefMs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = ServiceLifecycleButtons;
var _c;
__turbopack_context__.k.register(_c, "ServiceLifecycleButtons");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceLogs.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useServiceLogs",
    ()=>useServiceLogs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const MAX_LINES = 1000;
function useServiceLogs(name, options = {}) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const [lines, setLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isPaused, setIsPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(options.filter ?? "");
    const pauseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const esRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const togglePause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useServiceLogs.useCallback[togglePause]": ()=>{
            setIsPaused({
                "useServiceLogs.useCallback[togglePause]": (p)=>{
                    pauseRef.current = !p;
                    return !p;
                }
            }["useServiceLogs.useCallback[togglePause]"]);
        }
    }["useServiceLogs.useCallback[togglePause]"], []);
    const clear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useServiceLogs.useCallback[clear]": ()=>setLines([])
    }["useServiceLogs.useCallback[clear]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useServiceLogs.useEffect": ()=>{
            const params = new URLSearchParams();
            if (options.tail !== undefined) params.set("tail", String(options.tail));
            if (filter) params.set("filter", filter);
            const url = `/api/services/${name}/logs?${params.toString()}`;
            const es = new EventSource(url);
            esRef.current = es;
            // Clear any prior error once the stream actually (re)connects, rather than
            // calling setError synchronously in the effect body (which triggers a
            // cascading render and is flagged by react-hooks/set-state-in-effect).
            es.addEventListener("open", {
                "useServiceLogs.useEffect": ()=>setError(null)
            }["useServiceLogs.useEffect"]);
            es.addEventListener("snapshot", {
                "useServiceLogs.useEffect": (e)=>{
                    try {
                        const snapshot = JSON.parse(e.data);
                        setLines(snapshot.slice(-MAX_LINES));
                        setError(null);
                    } catch  {}
                }
            }["useServiceLogs.useEffect"]);
            es.addEventListener("log", {
                "useServiceLogs.useEffect": (e)=>{
                    if (pauseRef.current) return;
                    try {
                        const line = JSON.parse(e.data);
                        setLines({
                            "useServiceLogs.useEffect": (prev)=>{
                                const next = [
                                    ...prev,
                                    line
                                ];
                                return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
                            }
                        }["useServiceLogs.useEffect"]);
                        setError(null);
                    } catch  {}
                }
            }["useServiceLogs.useEffect"]);
            es.onerror = ({
                "useServiceLogs.useEffect": ()=>{
                    setError(t("logStreamFailed", {
                        name
                    }));
                    es.close();
                }
            })["useServiceLogs.useEffect"];
            return ({
                "useServiceLogs.useEffect": ()=>{
                    es.close();
                    esRef.current = null;
                }
            })["useServiceLogs.useEffect"];
        }
    }["useServiceLogs.useEffect"], [
        name,
        filter,
        options.tail,
        t
    ]);
    return {
        lines,
        isPaused,
        error,
        togglePause,
        clear,
        setFilter
    };
}
_s(useServiceLogs, "boDfXlLa1C4OLNKs3u4NRXwcry8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceLogsPanel",
    ()=>ServiceLogsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceLogs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceLogs.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function LogLineRow({ line, locale }) {
    const ts = new Date(line.ts).toLocaleTimeString(locale, {
        hour12: false
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-2 text-[11px] leading-5 font-mono hover:bg-bg-subtle/50 px-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-text-muted shrink-0 select-none",
                children: ts
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-text-muted shrink-0 select-none", line.stream === "stderr" && "text-red-400 dark:text-red-400"),
                children: line.stream === "stderr" ? "ERR" : "OUT"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "break-all",
                children: line.line
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = LogLineRow;
function ServiceLogsPanel({ name }) {
    _s();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const [filterInput, setFilterInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const { lines, isPaused, error, togglePause, clear, setFilter } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceLogs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceLogs"])(name, {
        tail: 200
    });
    const bottomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll to bottom on new lines unless paused
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ServiceLogsPanel.useEffect": ()=>{
            if (!isPaused) {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    }["ServiceLogsPanel.useEffect"], [
        lines,
        isPaused
    ]);
    function applyFilter(val) {
        setFilterInput(val);
        setFilter(val);
    }
    function downloadLogs() {
        const text = lines.map((l)=>`${new Date(l.ts).toISOString()} [${l.stream}] ${l.line}`).join("\n");
        const blob = new Blob([
            text
        ], {
            type: "text/plain"
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${name}-logs.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-border rounded-lg overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 px-3 py-2 border-b border-border bg-bg-subtle",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: t("filterLogs"),
                        value: filterInput,
                        onChange: (e)=>applyFilter(e.target.value),
                        className: "flex-1 bg-transparent text-xs outline-none placeholder:text-text-muted min-w-0"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: togglePause,
                        className: "text-xs text-text-muted hover:text-text-primary shrink-0",
                        children: isPaused ? t("resume") : t("pause")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: clear,
                        className: "text-xs text-text-muted hover:text-text-primary shrink-0",
                        children: t("clear")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: downloadLogs,
                        className: "text-xs text-text-muted hover:text-text-primary shrink-0",
                        children: t("download")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-80 overflow-y-auto bg-bg-main py-1",
                children: [
                    error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-red-600 dark:text-red-400 px-4 py-4",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this) : lines.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted px-4 py-4",
                        children: t("noLogs")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this) : lines.map((l, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LogLineRow, {
                            line: l,
                            locale: locale
                        }, i, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                            lineNumber: 102,
                            columnNumber: 31
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: bottomRef
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(ServiceLogsPanel, "ysOSd5eKmLbfd02As5YmuYFU9jY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceLogs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceLogs"]
    ];
});
_c1 = ServiceLogsPanel;
var _c, _c1;
__turbopack_context__.k.register(_c, "LogLineRow");
__turbopack_context__.k.register(_c1, "ServiceLogsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliproxyModelMappingEditor",
    ()=>CliproxyModelMappingEditor,
    "parseMappingJson",
    ()=>parseMappingJson
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
;
var _s = __turbopack_context__.k.signature();
/**
 * G-08 — CLIProxyAPI Model Mapping editor.
 * Renders inside CliproxyServiceTab, between FallbackRoutingCard and ServiceLogsPanel.
 * Persists to upstream_proxy_config via PATCH /api/settings { cliproxyapi_model_mapping }.
 */ "use client";
;
;
;
function parseMappingJson(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
        return {
            ok: false,
            error: msg,
            messageKey: "mappingInvalidJson"
        };
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {
            ok: false,
            error: "Must be a JSON object (not an array or primitive)",
            messageKey: "mappingMustBeObject"
        };
    }
    const obj = parsed;
    for (const [key, val] of Object.entries(obj)){
        if (typeof val !== "string") {
            return {
                ok: false,
                error: `Value for key "${key}" must be a string, got ${Array.isArray(val) ? "array" : typeof val}`,
                messageKey: "mappingValueMustBeString",
                messageValues: {
                    key
                }
            };
        }
    }
    return {
        ok: true,
        value: obj
    };
}
// ── Component ─────────────────────────────────────────────────────────────────
const EMPTY_MAPPING = "{}";
function formatMapping(value) {
    if (!value || Object.keys(value).length === 0) return EMPTY_MAPPING;
    return JSON.stringify(value, null, 2);
}
function getMappingValidationMessage(result, t) {
    if ("messageKey" in result) return t(result.messageKey, result.messageValues);
    return null;
}
function CliproxyModelMappingEditor() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const [rawText, setRawText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_MAPPING);
    const [savedText, setSavedText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_MAPPING);
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const msgTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load current mapping from /api/settings on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CliproxyModelMappingEditor.useEffect": ()=>{
            fetch("/api/settings").then({
                "CliproxyModelMappingEditor.useEffect": (r)=>r.json()
            }["CliproxyModelMappingEditor.useEffect"]).then({
                "CliproxyModelMappingEditor.useEffect": (data)=>{
                    const mapping = data.cliproxyapi_model_mapping && typeof data.cliproxyapi_model_mapping === "object" && !Array.isArray(data.cliproxyapi_model_mapping) ? data.cliproxyapi_model_mapping : null;
                    const formatted = formatMapping(mapping);
                    setRawText(formatted);
                    setSavedText(formatted);
                }
            }["CliproxyModelMappingEditor.useEffect"]).catch({
                "CliproxyModelMappingEditor.useEffect": ()=>{
                // leave defaults if fetch fails
                }
            }["CliproxyModelMappingEditor.useEffect"]).finally({
                "CliproxyModelMappingEditor.useEffect": ()=>setLoaded(true)
            }["CliproxyModelMappingEditor.useEffect"]);
        }
    }["CliproxyModelMappingEditor.useEffect"], []);
    function showMsg(ok, text) {
        if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
        setMsg({
            ok,
            text
        });
        if (ok) {
            msgTimerRef.current = setTimeout(()=>setMsg(null), 3000);
        }
    }
    const parseResult = parseMappingJson(rawText);
    const isValid = parseResult.ok;
    const validationMessage = getMappingValidationMessage(parseResult, t);
    const isDirty = rawText !== savedText;
    const canSave = isValid && isDirty && !saving;
    async function handleSave() {
        if (!parseResult.ok) return;
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cliproxyapi_model_mapping: parseResult.value
                })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            // Re-format to canonical form after save
            const formatted = formatMapping(parseResult.value);
            setSavedText(formatted);
            setRawText(formatted);
            showMsg(true, t("mappingSaved"));
        } catch  {
            showMsg(false, t("mappingSaveFailed"));
        } finally{
            setSaving(false);
        }
    }
    if (!loaded) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "size-8 rounded-lg flex items-center justify-center bg-violet-500/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-violet-500 text-xl",
                            children: "account_tree"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-medium text-sm",
                                children: t("modelMapping")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t.rich("modelMappingDescription", {
                                    example: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "font-mono bg-bg-subtle px-1 rounded",
                                            children: '"gpt-4o": "openai-gpt-4o"'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                                            lineNumber: 157,
                                            columnNumber: 17
                                        }, this)
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded text-xs ${msg.ok ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: msg.ok ? "check_circle" : "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, this),
                    msg.text
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                lineNumber: 167,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                className: `w-full font-mono text-xs rounded border px-3 py-2 resize-y min-h-[120px] bg-bg-subtle focus:outline-none focus:ring-1 transition-colors ${!isValid && rawText !== EMPTY_MAPPING ? "border-red-400 focus:ring-red-400" : "border-border focus:ring-primary"}`,
                value: rawText,
                onChange: (e)=>{
                    setRawText(e.target.value);
                    setMsg(null);
                },
                spellCheck: false,
                "aria-label": t("modelMappingEditor")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                lineNumber: 181,
                columnNumber: 7
            }, this),
            validationMessage && rawText !== EMPTY_MAPPING && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px] mt-0.5 shrink-0",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this),
                    validationMessage
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                lineNumber: 197,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex justify-end",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleSave,
                    disabled: !canSave,
                    className: `inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${canSave ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-bg-subtle text-text-muted cursor-not-allowed"}`,
                    children: [
                        saving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined animate-spin text-[14px]",
                            children: "progress_activity"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                            lineNumber: 214,
                            columnNumber: 13
                        }, this),
                        t("save")
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                    lineNumber: 204,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
_s(CliproxyModelMappingEditor, "nSWtBQy/O8nlL8/l3yxQAw7Azic=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CliproxyModelMappingEditor;
var _c;
__turbopack_context__.k.register(_c, "CliproxyModelMappingEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoStartToggle",
    ()=>AutoStartToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AutoStartToggle({ name, label, description }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { data, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(name);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const displayLabel = label ?? t("autoStart");
    const displayDescription = description ?? t("autoStartDescription", {
        name
    });
    async function handleToggle(enabled) {
        setPending(true);
        try {
            await fetch(`/api/services/${name}/auto-start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled
                })
            });
            mutate();
        } finally{
            setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: displayLabel
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted mt-0.5",
                            children: displayDescription
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                    checked: data?.autoStart ?? false,
                    onChange: handleToggle,
                    disabled: pending || !data
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(AutoStartToggle, "hPqJ3ZosjNr+90d/5gsBbf7j2s0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = AutoStartToggle;
var _c;
__turbopack_context__.k.register(_c, "AutoStartToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoRestartAdoptedToggle",
    ()=>AutoRestartAdoptedToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Toggle for "auto-restart an adopted process." When a supervisor's
 * probeBeforeSpawn finds a healthy instance already on its port, it adopts
 * that process rather than spawning a new one — but an adopted process has
 * no piped stdout/stderr (nothing was ever spawned to pipe from), so the
 * Logs panel stays empty for its whole lifetime. Enabling this immediately
 * kills an adopted process and spawns a fresh one this supervisor actually
 * owns, trading one restart for working log capture. Off by default —
 * killing a process the operator didn't ask to be killed should be opt-in.
 *
 * English literals used inline rather than i18n keys — mirrors the same
 * choice in DarioAccountPanel.tsx (avoids a translation-drift gate for a
 * single new control; see that file's header comment for the precedent).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function AutoRestartAdoptedToggle({ name }) {
    _s();
    const { data, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(name);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleToggle(enabled) {
        setPending(true);
        try {
            await fetch(`/api/services/${name}/auto-restart-adopted`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled
                })
            });
            mutate();
        } finally{
            setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: "Auto-restart adopted process"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted mt-0.5",
                            children: "If this service is found already running (adopted instead of started fresh), kill and restart it automatically so logs can be captured. Off by default."
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                    checked: data?.autoRestartAdopted ?? false,
                    onChange: handleToggle,
                    disabled: pending || !data
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(AutoRestartAdoptedToggle, "bYZqDhTZheRjvqSMPrUYD8sKzTg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = AutoRestartAdoptedToggle;
var _c;
__turbopack_context__.k.register(_c, "AutoRestartAdoptedToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliproxyConnectionPanel",
    ()=>CliproxyConnectionPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-client] (ecmascript) <export default as Input>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function isValidUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch  {
        return false;
    }
}
function CliproxyConnectionPanel() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        cliproxyapi_fallback_enabled: false,
        cliproxyapi_url: "http://127.0.0.1:8317",
        cliproxyapi_fallback_codes: "502,401,403,429,503"
    });
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CliproxyConnectionPanel.useEffect": ()=>{
            fetch("/api/settings").then({
                "CliproxyConnectionPanel.useEffect": (r)=>r.json()
            }["CliproxyConnectionPanel.useEffect"]).then({
                "CliproxyConnectionPanel.useEffect": (data)=>{
                    setSettings({
                        cliproxyapi_fallback_enabled: data.cliproxyapi_fallback_enabled === true,
                        cliproxyapi_url: typeof data.cliproxyapi_url === "string" ? data.cliproxyapi_url : "http://127.0.0.1:8317",
                        cliproxyapi_fallback_codes: typeof data.cliproxyapi_fallback_codes === "string" ? data.cliproxyapi_fallback_codes : "502,401,403,429,503"
                    });
                    setLoaded(true);
                }
            }["CliproxyConnectionPanel.useEffect"]).catch({
                "CliproxyConnectionPanel.useEffect": ()=>setLoaded(true)
            }["CliproxyConnectionPanel.useEffect"]);
        }
    }["CliproxyConnectionPanel.useEffect"], []);
    const saveSetting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CliproxyConnectionPanel.useCallback[saveSetting]": async (key, value)=>{
            if (key === "cliproxyapi_url" && typeof value === "string" && value.trim() !== "") {
                if (!isValidUrl(value)) {
                    setMsg({
                        ok: false,
                        text: t("invalidUrl")
                    });
                    return;
                }
            }
            setSaving(true);
            setMsg(null);
            try {
                const res = await fetch("/api/settings", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        [key]: value
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setSettings({
                    "CliproxyConnectionPanel.useCallback[saveSetting]": (prev)=>({
                            ...prev,
                            [key]: value
                        })
                }["CliproxyConnectionPanel.useCallback[saveSetting]"]);
                setMsg({
                    ok: true,
                    text: t("saved")
                });
            } catch  {
                setMsg({
                    ok: false,
                    text: t("saveFailed")
                });
            } finally{
                setSaving(false);
            }
        }
    }["CliproxyConnectionPanel.useCallback[saveSetting]"], [
        t
    ]);
    if (!loaded) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "size-8 rounded-lg flex items-center justify-center bg-indigo-500/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-indigo-500 text-xl",
                            children: "swap_horiz"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-medium text-sm",
                                children: t("fallbackRouting")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t("fallbackRoutingDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded text-xs ${msg.ok ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: msg.ok ? "check_circle" : "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this),
                    msg.text
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                lineNumber: 96,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm",
                                children: t("enableFallback")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                lineNumber: 112,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                                checked: settings.cliproxyapi_fallback_enabled,
                                onChange: (v)=>saveSetting("cliproxyapi_fallback_enabled", v),
                                disabled: saving
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    settings.cliproxyapi_fallback_enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs text-text-muted mb-1.5 block",
                                        children: t("cliproxyUrl")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                        lineNumber: 123,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                        value: settings.cliproxyapi_url,
                                        onChange: (e)=>saveSetting("cliproxyapi_url", e.target.value),
                                        placeholder: "http://127.0.0.1:8317"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                        lineNumber: 124,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs text-text-muted mb-1.5 block",
                                        children: t("fallbackCodes")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                        lineNumber: 131,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                        value: settings.cliproxyapi_fallback_codes,
                                        onChange: (e)=>saveSetting("cliproxyapi_fallback_codes", e.target.value),
                                        placeholder: "502,401,403,429,503"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                        lineNumber: 132,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
_s(CliproxyConnectionPanel, "/zVbmky0uEpjmuonI3+P7uz+AyE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CliproxyConnectionPanel;
var _c;
__turbopack_context__.k.register(_c, "CliproxyConnectionPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliproxyProviderExposureCard",
    ()=>CliproxyProviderExposureCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * Provider Exposure toggle for CLIProxyAPI.
 * Persists the `providerExpose` field via POST /api/services/cliproxy/provider-expose.
 * When enabled, CLIProxyAPI models appear as `cliproxyapi/...` in OmniRoute's model selection.
 */ "use client";
;
;
;
const NAME = "cliproxy";
function CliproxyProviderExposureCard() {
    _s();
    const { data, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(NAME);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function handleToggle(enabled) {
        setPending(true);
        setMsg(null);
        try {
            const res = await fetch(`/api/services/${NAME}/provider-expose`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled
                })
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>({}));
                const errorMsg = body?.error?.message ?? body?.message ?? `Failed to update (HTTP ${res.status})`;
                setMsg({
                    ok: false,
                    text: errorMsg
                });
                return;
            }
            setMsg(null);
            mutate();
        } catch  {
            setMsg({
                ok: false,
                text: "Network error — could not update provider exposure setting"
            });
        } finally{
            setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "size-8 rounded-lg flex items-center justify-center bg-sky-500/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-sky-500 text-xl",
                            children: "hub"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-medium text-sm",
                                children: "Provider Exposure"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: [
                                    "Expose CLIProxyAPI models as a routing target under the",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "font-mono bg-bg-subtle px-1 rounded",
                                        children: "cliproxyapi/"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                                        lineNumber: 54,
                                        columnNumber: 13
                                    }, this),
                                    " prefix."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded text-xs ${msg.ok ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: msg.ok ? "check_circle" : "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    msg.text
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                children: [
                                    "Expose as",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "font-mono bg-bg-subtle px-1 rounded text-xs",
                                        children: "cliproxyapi/..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                                        lineNumber: 78,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted mt-0.5",
                                children: "When enabled, discovered models appear in provider selects across OmniRoute."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                        checked: data?.providerExpose ?? false,
                        onChange: handleToggle,
                        disabled: pending || !data
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(CliproxyProviderExposureCard, "xxo9kOk6l0vPX+GUVaCsDzhLqLg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = CliproxyProviderExposureCard;
var _c;
__turbopack_context__.k.register(_c, "CliproxyProviderExposureCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliproxyServiceTab",
    ()=>CliproxyServiceTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$CliproxyModelMappingEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyModelMappingEditor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$CliproxyConnectionPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyConnectionPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$CliproxyProviderExposureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/CliproxyProviderExposureCard.tsx [app-client] (ecmascript)");
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
const NAME = "cliproxy";
function CliproxyServiceTab() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceStatusCard"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLifecycleButtons"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoStartToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoRestartAdoptedToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$CliproxyConnectionPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CliproxyConnectionPanel"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$CliproxyProviderExposureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CliproxyProviderExposureCard"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$CliproxyModelMappingEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CliproxyModelMappingEditor"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLogsPanel"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = CliproxyServiceTab;
var _c;
__turbopack_context__.k.register(_c, "CliproxyServiceTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NinerouterInstallWizard",
    ()=>NinerouterInstallWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * G-09 — Install Wizard for 9Router.
 * Shown only when service state === "not_installed".
 * Calls POST /api/services/9router/install and triggers a status mutate on success.
 */ "use client";
;
;
;
;
const NAME = "9router";
const DEFAULT_PORT = 20130;
function NinerouterInstallWizard() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(NAME);
    const [version, setVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("latest");
    const [port, setPort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(String(DEFAULT_PORT));
    const [installing, setInstalling] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function handleInstall() {
        setInstalling(true);
        setMsg(null);
        try {
            const res = await fetch(`/api/services/${NAME}/install`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    version: version.trim() || "latest"
                })
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>({}));
                const errorMsg = body?.error?.message ?? body?.message ?? t("installationFailed", {
                    status: res.status
                });
                setMsg({
                    ok: false,
                    text: errorMsg
                });
                return;
            }
            setMsg({
                ok: true,
                text: t("installationSucceeded")
            });
            mutate();
        } catch  {
            setMsg({
                ok: false,
                text: t("networkInstallFailed")
            });
        } finally{
            setInstalling(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "size-8 rounded-lg flex items-center justify-center bg-blue-500/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-blue-500 text-xl",
                            children: "download"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-medium text-sm",
                                children: t("install9Router")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t("install9RouterDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium mb-1",
                                htmlFor: "ninerouter-version",
                                children: t("version")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "ninerouter-version",
                                type: "text",
                                className: "w-full rounded border border-border bg-bg-subtle px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary",
                                value: version,
                                onChange: (e)=>setVersion(e.target.value),
                                placeholder: "latest",
                                disabled: installing
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-text-muted",
                                children: t("versionHint")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium mb-1",
                                htmlFor: "ninerouter-port",
                                children: t("servicePort")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "ninerouter-port",
                                type: "number",
                                className: "w-full rounded border border-border bg-bg-subtle px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary",
                                value: port,
                                onChange: (e)=>setPort(e.target.value),
                                min: 1024,
                                max: 65535,
                                disabled: installing
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-text-muted",
                                children: t("servicePortHint")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-1.5 px-2 py-1.5 rounded text-xs ${msg.ok ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[12px]",
                                children: msg.ok ? "check_circle" : "error"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this),
                            msg.text
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        onClick: handleInstall,
                        disabled: installing,
                        className: "w-full",
                        children: installing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined animate-spin text-[14px]",
                                    children: "progress_activity"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                                    lineNumber: 117,
                                    columnNumber: 15
                                }, this),
                                t("installing")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                            lineNumber: 116,
                            columnNumber: 13
                        }, this) : t("install9Router")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(NinerouterInstallWizard, "3HP4Q7sSiSGpKHwF86UUj1VgFnk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = NinerouterInstallWizard;
var _c;
__turbopack_context__.k.register(_c, "NinerouterInstallWizard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NinerouterProviderExposureCard",
    ()=>NinerouterProviderExposureCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
/**
 * G-09 — Provider Exposure toggle for 9Router.
 * Persists the `providerExpose` field via POST /api/services/9router/provider-expose.
 * When enabled, 9Router models appear as `9router/...` in OmniRoute's model selection.
 */ "use client";
;
;
;
;
const NAME = "9router";
function renderPrefix(chunks) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
        className: "font-mono bg-bg-subtle px-1 rounded",
        children: chunks
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
function renderSmallPrefix(chunks) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
        className: "font-mono bg-bg-subtle px-1 rounded text-xs",
        children: chunks
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
        lineNumber: 21,
        columnNumber: 10
    }, this);
}
function NinerouterProviderExposureCard() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { data, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(NAME);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function handleToggle(enabled) {
        setPending(true);
        setMsg(null);
        try {
            const res = await fetch(`/api/services/${NAME}/provider-expose`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled
                })
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>({}));
                const errorMsg = body?.error?.message ?? body?.message ?? t("providerExposureUpdateFailed", {
                    status: res.status
                });
                setMsg({
                    ok: false,
                    text: errorMsg
                });
                return;
            }
            setMsg(null);
            mutate();
        } catch  {
            setMsg({
                ok: false,
                text: t("providerExposureNetworkFailed")
            });
        } finally{
            setPending(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "size-8 rounded-lg flex items-center justify-center bg-purple-500/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-purple-500 text-xl",
                            children: "hub"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-medium text-sm",
                                children: t("providerExposure")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t.rich("providerExposureDescription", {
                                    prefix: renderPrefix
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded text-xs ${msg.ok ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: msg.ok ? "check_circle" : "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this),
                    msg.text
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                lineNumber: 74,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                children: t.rich("providerExposureLabel", {
                                    prefix: renderSmallPrefix
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted mt-0.5",
                                children: t("providerExposureHint")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                        checked: data?.providerExpose ?? false,
                        onChange: handleToggle,
                        disabled: pending || !data
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(NinerouterProviderExposureCard, "W6cphr0ChaW/LHRoB/WLQKYeazY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = NinerouterProviderExposureCard;
var _c;
__turbopack_context__.k.register(_c, "NinerouterProviderExposureCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NinerouterModelList",
    ()=>NinerouterModelList,
    "paginateModels",
    ()=>paginateModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
;
var _s = __turbopack_context__.k.signature();
/**
 * G-09 — Model list for 9Router.
 * Fetches GET /api/services/9router/models (with optional ?refresh=true).
 * Displays a paginated list (20 per page, client-side) with a "Refresh now" button.
 */ "use client";
;
;
;
const NAME = "9router";
const PAGE_SIZE = 20;
function paginateModels(models, page, pageSize) {
    const start = (page - 1) * pageSize;
    return models.slice(start, start + pageSize);
}
function NinerouterModelList() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const [models, setModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [refreshing, setRefreshing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NinerouterModelList.useCallback[fetchModels]": async (refresh = false)=>{
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            try {
                const url = `/api/services/${NAME}/models${refresh ? "?refresh=true" : ""}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const body = await res.json();
                const data = Array.isArray(body?.data) ? body.data : [];
                setModels(data);
                setPage(1);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("modelsLoadFailed"));
            } finally{
                setLoading(false);
                setRefreshing(false);
            }
        }
    }["NinerouterModelList.useCallback[fetchModels]"], [
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NinerouterModelList.useEffect": ()=>{
            void fetchModels(false);
        }
    }["NinerouterModelList.useEffect"], [
        fetchModels
    ]);
    const totalPages = Math.max(1, Math.ceil(models.length / PAGE_SIZE));
    const visibleModels = paginateModels(models, page, PAGE_SIZE);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "size-8 rounded-lg flex items-center justify-center bg-cyan-500/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-cyan-500 text-xl",
                                    children: "list"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-medium text-sm",
                                        children: t("availableModels")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                        lineNumber: 86,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted",
                                        children: loading ? t("modelsLoading") : t("modelsDiscovered", {
                                            count: models.length
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        variant: "secondary",
                        size: "sm",
                        onClick: ()=>fetchModels(true),
                        disabled: loading || refreshing,
                        className: "shrink-0",
                        children: refreshing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined animate-spin text-[12px]",
                                    children: "progress_activity"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this),
                                t("refreshing")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this) : t("refreshNow")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded text-xs bg-red-500/10 text-red-600 dark:text-red-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this),
            !loading && models.length === 0 && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-text-muted text-center py-4",
                children: t("noModels")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                lineNumber: 120,
                columnNumber: 9
            }, this),
            visibleModels.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1",
                children: visibleModels.map((model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-2 py-1.5 rounded hover:bg-bg-subtle transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-xs font-mono text-text truncate",
                                children: model.id
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                lineNumber: 130,
                                columnNumber: 15
                            }, this),
                            model.available === false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 text-[10px] font-medium text-text-muted bg-bg-subtle px-1.5 py-0.5 rounded shrink-0",
                                children: t("unavailable")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                lineNumber: 132,
                                columnNumber: 17
                            }, this)
                        ]
                    }, model.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                        lineNumber: 126,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                lineNumber: 124,
                columnNumber: 9
            }, this),
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mt-3 pt-2 border-t border-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-text-muted",
                        children: t("pageOf", {
                            page,
                            total: totalPages
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPage((p)=>Math.max(1, p - 1)),
                                disabled: page <= 1,
                                className: "px-2 py-1 text-xs rounded border border-border disabled:opacity-40 hover:bg-bg-subtle transition-colors",
                                children: t("previous")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPage((p)=>Math.min(totalPages, p + 1)),
                                disabled: page >= totalPages,
                                className: "px-2 py-1 text-xs rounded border border-border disabled:opacity-40 hover:bg-bg-subtle transition-colors",
                                children: t("next")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
                lineNumber: 143,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_s(NinerouterModelList, "gGAcGDowlXnTa+tbgVOqNVrGENk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = NinerouterModelList;
var _c;
__turbopack_context__.k.register(_c, "NinerouterModelList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiKeyField",
    ()=>ApiKeyField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ApiKeyField({ name, serviceLabel, showReveal = false }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { data, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(name);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Reveal state
    const [revealModalOpen, setRevealModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [revealPending, setRevealPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [plainKey, setPlainKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const hideTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const label = serviceLabel ?? name;
    // Auto-hide plain key after 30s
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ApiKeyField.useEffect": ()=>{
            if (plainKey) {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                hideTimerRef.current = setTimeout({
                    "ApiKeyField.useEffect": ()=>{
                        setPlainKey(null);
                    }
                }["ApiKeyField.useEffect"], 30_000);
            }
            return ({
                "ApiKeyField.useEffect": ()=>{
                    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                }
            })["ApiKeyField.useEffect"];
        }
    }["ApiKeyField.useEffect"], [
        plainKey
    ]);
    async function rotateKey() {
        setPending(true);
        setMsg(null);
        setPlainKey(null);
        try {
            const res = await fetch(`/api/services/${name}/rotate-key`, {
                method: "POST"
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMsg({
                ok: true,
                text: t("keyRotated", {
                    name: label
                })
            });
            mutate();
        } catch  {
            setMsg({
                ok: false,
                text: t("keyRotateFailed")
            });
        } finally{
            setPending(false);
        }
    }
    async function confirmReveal() {
        setRevealPending(true);
        try {
            const res = await fetch(`/api/services/${name}/status?reveal=key`, {
                headers: {
                    "X-Reveal-Confirm": "yes"
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            if (typeof body.apiKeyPlain === "string") {
                setPlainKey(body.apiKeyPlain);
                setMsg(null);
            } else {
                setMsg({
                    ok: false,
                    text: t("keyRevealEmpty")
                });
            }
        } catch  {
            setMsg({
                ok: false,
                text: t("keyRevealFailed")
            });
        } finally{
            setRevealPending(false);
            setRevealModalOpen(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                padding: "md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "size-8 rounded-lg flex items-center justify-center bg-amber-500/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-amber-500 text-xl",
                                    children: "key"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-medium text-sm",
                                        children: t("apiKey")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted",
                                        children: t("apiKeyDescription", {
                                            name: label
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                        lineNumber: 88,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded text-xs ${msg.ok ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[12px]",
                                children: msg.ok ? "check_circle" : "error"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            msg.text
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "flex-1 truncate text-xs font-mono bg-bg-subtle px-2 py-1.5 rounded text-text-muted",
                                children: plainKey ?? data?.apiKeyMasked ?? "—"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this),
                            showReveal && !plainKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                variant: "secondary",
                                size: "sm",
                                onClick: ()=>setRevealModalOpen(true),
                                disabled: revealPending || !data?.installedVersion,
                                className: "shrink-0",
                                children: t("reveal")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 112,
                                columnNumber: 13
                            }, this),
                            plainKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                variant: "secondary",
                                size: "sm",
                                onClick: ()=>setPlainKey(null),
                                className: "shrink-0",
                                children: t("hide")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                variant: "secondary",
                                size: "sm",
                                onClick: rotateKey,
                                disabled: pending || !data?.installedVersion,
                                className: "shrink-0",
                                children: pending ? t("rotating") : t("rotateKey")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    plainKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-[11px] text-text-muted",
                        children: t("keyAutoHide")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                        lineNumber: 143,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            showReveal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmModal"], {
                isOpen: revealModalOpen,
                onClose: ()=>setRevealModalOpen(false),
                onConfirm: confirmReveal,
                title: t("revealTitle"),
                message: t("revealConfirm"),
                confirmText: revealPending ? t("revealing") : t("reveal"),
                cancelText: t("cancel"),
                variant: "secondary",
                loading: revealPending
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(ApiKeyField, "aXFbacHFrZC7JirsL6bFVOOEdCw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = ApiKeyField;
var _c;
__turbopack_context__.k.register(_c, "ApiKeyField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NinerouterEmbedFrame",
    ()=>NinerouterEmbedFrame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const NAME = "9router";
function NinerouterEmbedFrame() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const { data } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(NAME);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isRunning = data?.state === "running";
    if (!isRunning) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "none",
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setExpanded((v)=>!v),
                className: "flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-bg-subtle transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px] text-text-muted",
                                children: "web"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this),
                            t("webUi"),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/dashboard/providers/services/9router/embed/",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-xs font-normal text-primary hover:underline",
                                onClick: (e)=>e.stopPropagation(),
                                children: t("openNewTab")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px] text-text-muted",
                        children: expanded ? "expand_less" : "expand_more"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: "/dashboard/providers/services/9router/embed/",
                title: t("webUi"),
                className: "h-[600px] w-full border-t border-border",
                sandbox: "allow-scripts allow-same-origin allow-forms"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
                lineNumber: 49,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(NinerouterEmbedFrame, "nEJExvSV0NBhwA72NgBFHTnIVQ0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = NinerouterEmbedFrame;
var _c;
__turbopack_context__.k.register(_c, "NinerouterEmbedFrame");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NinerouterServiceTab",
    ()=>NinerouterServiceTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterInstallWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterInstallWizard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterProviderExposureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterProviderExposureCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterModelList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterModelList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ApiKeyField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ApiKeyField.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterEmbedFrame$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/NinerouterEmbedFrame.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/hooks/useServiceStatus.ts [app-client] (ecmascript)");
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
;
;
;
;
const NAME = "9router";
function NinerouterServiceTab() {
    _s();
    const { data } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"])(NAME);
    // Show only the install wizard when not yet installed.
    if (data?.state === "not_installed") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterInstallWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NinerouterInstallWizard"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceStatusCard"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLifecycleButtons"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoStartToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoRestartAdoptedToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ApiKeyField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiKeyField"], {
                name: NAME,
                serviceLabel: "9Router",
                showReveal: true
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterProviderExposureCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NinerouterProviderExposureCard"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterModelList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NinerouterModelList"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$NinerouterEmbedFrame$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NinerouterEmbedFrame"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLogsPanel"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_s(NinerouterServiceTab, "poIOPzR93OeQDZ6As64MVYxAcPk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$hooks$2f$useServiceStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useServiceStatus"]
    ];
});
_c = NinerouterServiceTab;
var _c;
__turbopack_context__.k.register(_c, "NinerouterServiceTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MuxServiceTab",
    ()=>MuxServiceTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
const NAME = "mux";
function MuxServiceTab() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceStatusCard"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLifecycleButtons"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoStartToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoRestartAdoptedToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLogsPanel"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = MuxServiceTab;
var _c;
__turbopack_context__.k.register(_c, "MuxServiceTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BifrostServiceTab",
    ()=>BifrostServiceTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
const NAME = "bifrost";
function BifrostServiceTab() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceStatusCard"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLifecycleButtons"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoStartToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoRestartAdoptedToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLogsPanel"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = BifrostServiceTab;
var _c;
__turbopack_context__.k.register(_c, "BifrostServiceTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/Tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Tooltip({ children, content, position = "top", className = "", delayMs = 200, usePortal = true, multiline = false }) {
    _s();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const tooltipId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tooltipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const show = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[show]": ()=>{
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout({
                "Tooltip.useCallback[show]": ()=>setVisible(true)
            }["Tooltip.useCallback[show]"], delayMs);
        }
    }["Tooltip.useCallback[show]"], [
        delayMs
    ]);
    const hide = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[hide]": ()=>{
            clearTimeout(timeoutRef.current);
            setVisible(false);
        }
    }["Tooltip.useCallback[hide]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tooltip.useEffect": ()=>{
            return ({
                "Tooltip.useEffect": ()=>{
                    clearTimeout(timeoutRef.current);
                }
            })["Tooltip.useEffect"];
        }
    }["Tooltip.useEffect"], []);
    // Position the portal-rendered tooltip relative to the trigger by writing
    // directly to the DOM ref instead of round-tripping through React state.
    // Touching .style here is the canonical React-portal positioning pattern
    // and avoids the cascading-render warning we'd get from setCoords inside
    // a layout effect.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "Tooltip.useLayoutEffect": ()=>{
            if (!visible || !usePortal) return;
            const wrap = wrapperRef.current;
            const tt = tooltipRef.current;
            if (!wrap || !tt) return;
            const rect = wrap.getBoundingClientRect();
            const tRect = tt.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;
            let top = 0;
            let left = 0;
            switch(position){
                case "bottom":
                    top = rect.bottom + scrollY + 8;
                    left = rect.left + scrollX + rect.width / 2 - tRect.width / 2;
                    break;
                case "left":
                    top = rect.top + scrollY + rect.height / 2 - tRect.height / 2;
                    left = rect.left + scrollX - tRect.width - 8;
                    break;
                case "right":
                    top = rect.top + scrollY + rect.height / 2 - tRect.height / 2;
                    left = rect.right + scrollX + 8;
                    break;
                case "top":
                default:
                    top = rect.top + scrollY - tRect.height - 8;
                    left = rect.left + scrollX + rect.width / 2 - tRect.width / 2;
                    break;
            }
            // Clamp horizontally inside the viewport so a trigger near the right
            // edge does not produce a tooltip that bleeds off the screen.
            const margin = 8;
            const maxLeft = window.innerWidth + scrollX - tRect.width - margin;
            const minLeft = scrollX + margin;
            if (left > maxLeft) left = maxLeft;
            if (left < minLeft) left = minLeft;
            tt.style.top = `${top}px`;
            tt.style.left = `${left}px`;
            tt.style.visibility = "visible";
        }
    }["Tooltip.useLayoutEffect"], [
        visible,
        usePortal,
        position,
        content
    ]);
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
    };
    const describedById = content ? tooltipId : undefined;
    const trigger = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElement"])(children) ? (()=>{
        const child = children;
        const existingDescribedBy = child.props["aria-describedby"];
        const mergedDescribedBy = [
            existingDescribedBy,
            describedById
        ].filter(Boolean).join(" ");
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneElement"])(child, {
            "aria-describedby": mergedDescribedBy || undefined
        });
    })() : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        tabIndex: 0,
        "aria-describedby": describedById,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/shared/components/Tooltip.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
    const widthClass = multiline ? "max-w-xs whitespace-normal break-words" : "whitespace-nowrap";
    const baseTooltipClass = "z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900/95 rounded-md shadow-lg pointer-events-none animate-in fade-in duration-150 motion-reduce:transition-none motion-reduce:animate-none border border-white/10";
    const portalEnabled = usePortal && ("TURBOPACK compile-time value", "object") !== "undefined";
    const tooltipEl = visible && content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: tooltipRef,
        id: tooltipId,
        role: "tooltip",
        className: portalEnabled ? `fixed ${baseTooltipClass} ${widthClass}` : `absolute ${baseTooltipClass} ${widthClass} ${positionClasses[position] || positionClasses.top}`,
        // For portal-rendered tooltips, mount off-screen + hidden so the
        // layout effect can measure dimensions before the user sees a flash.
        // The useLayoutEffect above promotes visibility once coords are set.
        style: portalEnabled ? {
            top: -9999,
            left: -9999,
            visibility: "hidden"
        } : undefined,
        children: content
    }, void 0, false, {
        fileName: "[project]/src/shared/components/Tooltip.tsx",
        lineNumber: 159,
        columnNumber: 7
    }, this) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: wrapperRef,
        className: `relative inline-flex ${className}`,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        onKeyDown: (event)=>{
            if (event.key === "Escape") hide();
        },
        children: [
            trigger,
            portalEnabled && tooltipEl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(tooltipEl, document.body) : tooltipEl
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/Tooltip.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
}
_s(Tooltip, "zSscZCzDukTZnxxnJ/tGaZY51ng=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = Tooltip;
var _c;
__turbopack_context__.k.register(_c, "Tooltip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DarioAccountPanel",
    ()=>DarioAccountPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Dario account panel — drives the headless Claude OAuth login flow against the
 * server-side admin-proxy routes (/api/services/dario/admin/*). The real
 * DARIO_ADMIN_TOKEN never reaches this component; the OmniRoute routes attach it.
 *
 * Flow: "Start Login" → render the returned Claude authorize_url as an external
 * link + expiry countdown + a code input → "Complete Login" posts the pasted
 * code → on success the account is routable immediately (Dario hot-reloads) and
 * the account list refreshes. Each row has a "Remove" button.
 *
 * Also offers "Import from OmniRoute": lists any existing OmniRoute `claude`
 * provider connection (OAuth-based) and imports its access+refresh token pair
 * directly into Dario's account store, skipping the browser OAuth round trip
 * entirely — valid because both tools authenticate against the same public
 * Claude Code OAuth client. See
 * /api/services/dario/admin/import-from-omniroute/route.ts for why this is
 * safe (no re-implemented OAuth, just a decrypt()'d token handoff).
 *
 * Structurally mirrors the shared services components (Card/Button, text-xs
 * muted copy). English literals are used inline rather than i18n keys to avoid
 * a translation-drift gate for this one panel — matches how other service-
 * specific panels keep their bespoke copy local.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function formatExpiry(acc) {
    if (typeof acc.expiresInMs === "number") {
        const mins = Math.max(0, Math.round(acc.expiresInMs / 60000));
        if (mins >= 60) return `expires in ~${Math.round(mins / 60)}h`;
        return `expires in ~${mins}m`;
    }
    if (acc.expiresAt) {
        const d = new Date(acc.expiresAt);
        if (!Number.isNaN(d.getTime())) return `expires ${d.toLocaleString()}`;
    }
    return "";
}
function DarioAccountPanel() {
    _s();
    const [accounts, setAccounts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [aliasInput, setAliasInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [codeInput, setCodeInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [omniConnections, setOmniConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [omniLoading, setOmniLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [importBusyId, setImportBusyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshAccounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DarioAccountPanel.useCallback[refreshAccounts]": async ()=>{
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/services/dario/admin/accounts");
                const json = await res.json().catch({
                    "DarioAccountPanel.useCallback[refreshAccounts]": ()=>null
                }["DarioAccountPanel.useCallback[refreshAccounts]"]);
                if (!res.ok) {
                    throw new Error(json?.error || `HTTP ${res.status}`);
                }
                setAccounts(Array.isArray(json?.accounts) ? json.accounts : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally{
                setLoading(false);
            }
        }
    }["DarioAccountPanel.useCallback[refreshAccounts]"], []);
    const refreshOmniConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DarioAccountPanel.useCallback[refreshOmniConnections]": async ()=>{
            setOmniLoading(true);
            try {
                const res = await fetch("/api/services/dario/admin/import-from-omniroute");
                const json = await res.json().catch({
                    "DarioAccountPanel.useCallback[refreshOmniConnections]": ()=>null
                }["DarioAccountPanel.useCallback[refreshOmniConnections]"]);
                if (res.ok) {
                    setOmniConnections(Array.isArray(json?.connections) ? json.connections : []);
                }
            } catch  {
            /* non-fatal — import section just stays empty */ } finally{
                setOmniLoading(false);
            }
        }
    }["DarioAccountPanel.useCallback[refreshOmniConnections]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DarioAccountPanel.useEffect": ()=>{
            void refreshAccounts();
            void refreshOmniConnections();
        }
    }["DarioAccountPanel.useEffect"], [
        refreshAccounts,
        refreshOmniConnections
    ]);
    async function importFromOmniroute(connectionId) {
        setImportBusyId(connectionId);
        setError(null);
        setNotice(null);
        try {
            const res = await fetch("/api/services/dario/admin/import-from-omniroute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    connectionId
                })
            });
            const json = await res.json().catch(()=>null);
            if (!res.ok || !json?.imported) {
                throw new Error(json?.error || `HTTP ${res.status}`);
            }
            setNotice(`Imported as account "${json.alias}" — Dario restarted to pick it up.`);
            await refreshAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setImportBusyId(null);
        }
    }
    async function startLogin() {
        setBusy("start");
        setError(null);
        setNotice(null);
        try {
            const res = await fetch("/api/services/dario/admin/login-start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aliasInput.trim() ? {
                    alias: aliasInput.trim()
                } : {})
            });
            const json = await res.json().catch(()=>null);
            if (!res.ok || !json?.authorize_url || !json?.alias) {
                throw new Error(json?.error || `HTTP ${res.status}`);
            }
            setPending({
                alias: json.alias,
                authorizeUrl: json.authorize_url,
                expiresAt: json.expires_at || ""
            });
            setCodeInput("");
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setBusy(null);
        }
    }
    async function completeLogin() {
        if (!pending) return;
        setBusy("complete");
        setError(null);
        setNotice(null);
        try {
            const res = await fetch("/api/services/dario/admin/login-complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    alias: pending.alias,
                    code: codeInput.trim()
                })
            });
            const json = await res.json().catch(()=>null);
            if (!res.ok) {
                throw new Error(json?.error || `HTTP ${res.status}`);
            }
            setNotice(`Account "${json?.alias ?? pending.alias}" added.`);
            setPending(null);
            setCodeInput("");
            setAliasInput("");
            await refreshAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setBusy(null);
        }
    }
    async function removeAccount(alias) {
        setError(null);
        setNotice(null);
        try {
            const res = await fetch(`/api/services/dario/admin/accounts?alias=${encodeURIComponent(alias)}`, {
                method: "DELETE"
            });
            const json = await res.json().catch(()=>null);
            if (!res.ok) {
                throw new Error(json?.error || `HTTP ${res.status}`);
            }
            await refreshAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: "Claude accounts"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted mt-0.5",
                            children: "Authenticate Dario with your Claude Pro/Max subscription. Traffic bills to your subscription pool. At least one account is required before Dario can route requests (until then /health reports degraded)."
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 245,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 243,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: loading && accounts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-10 animate-pulse bg-bg-subtle rounded"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                        lineNumber: 255,
                        columnNumber: 13
                    }, this) : accounts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: "No accounts configured yet."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                        lineNumber: 257,
                        columnNumber: 13
                    }, this) : accounts.map((acc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-mono truncate",
                                            children: acc.alias
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                            lineNumber: 265,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted truncate",
                                            children: [
                                                formatExpiry(acc),
                                                acc.status,
                                                Array.isArray(acc.scopes) && acc.scopes.length ? `${acc.scopes.length} scope(s)` : ""
                                            ].filter(Boolean).join(" · ")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                            lineNumber: 266,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 264,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    size: "sm",
                                    variant: "outline",
                                    onClick: ()=>removeAccount(acc.alias),
                                    children: "Remove"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 278,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, acc.alias, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 260,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 253,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2 border-t border-border pt-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-medium",
                            children: "Import from OmniRoute"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 288,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: "Reuse an existing OmniRoute Claude connection's OAuth tokens instead of logging in again — skips the browser approval step entirely."
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 289,
                            columnNumber: 11
                        }, this),
                        omniLoading && omniConnections.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-8 animate-pulse bg-bg-subtle rounded"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 294,
                            columnNumber: 13
                        }, this) : omniConnections.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: "No eligible OmniRoute Claude connections found."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 297,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    content: "Will be active once a Claude connection exists in OmniRoute.",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        disabled: true,
                                        children: "Import"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                        lineNumber: 301,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 300,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 296,
                            columnNumber: 13
                        }, this) : omniConnections.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm truncate",
                                                children: c.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                                lineNumber: 313,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-text-muted truncate",
                                                children: [
                                                    c.organizationType,
                                                    c.organizationRateLimitTier
                                                ].filter(Boolean).join(" · ")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                                lineNumber: 314,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                        lineNumber: 312,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        disabled: importBusyId !== null,
                                        onClick: ()=>void importFromOmniroute(c.id),
                                        children: importBusyId === c.id ? "Importing…" : "Import"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                        lineNumber: 318,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, c.id, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                lineNumber: 308,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 287,
                    columnNumber: 9
                }, this),
                !pending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap items-center gap-2 border-t border-border pt-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "alias (optional)",
                            value: aliasInput,
                            onChange: (e)=>setAliasInput(e.target.value),
                            className: "flex-1 min-w-[140px] bg-transparent text-xs border border-border rounded px-2 py-1.5 outline-none placeholder:text-text-muted"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 333,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            disabled: busy !== null,
                            onClick: startLogin,
                            children: busy === "start" ? "Starting…" : "Start Login"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 340,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            variant: "outline",
                            disabled: loading,
                            onClick: ()=>void refreshAccounts(),
                            children: "Refresh"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 343,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 332,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2 border-t border-border pt-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: [
                                "1. Open this URL in your browser and approve access for account",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono",
                                    children: pending.alias
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 356,
                                    columnNumber: 15
                                }, this),
                                ":"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 354,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: pending.authorizeUrl,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "block text-xs text-primary underline break-all",
                            children: pending.authorizeUrl
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 358,
                            columnNumber: 13
                        }, this),
                        pending.expiresAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-text-muted",
                            children: [
                                "Pending login expires ",
                                new Date(pending.expiresAt).toLocaleTimeString()
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 367,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: "2. Paste the code Anthropic displays:"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 371,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "code#state or bare code",
                                    value: codeInput,
                                    onChange: (e)=>setCodeInput(e.target.value),
                                    className: "flex-1 min-w-[180px] bg-transparent text-xs border border-border rounded px-2 py-1.5 outline-none placeholder:text-text-muted font-mono"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 373,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    size: "sm",
                                    disabled: busy !== null || !codeInput.trim(),
                                    onClick: completeLogin,
                                    children: busy === "complete" ? "Completing…" : "Complete Login"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 380,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    size: "sm",
                                    variant: "outline",
                                    disabled: busy !== null,
                                    onClick: ()=>{
                                        setPending(null);
                                        setCodeInput("");
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                                    lineNumber: 387,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                            lineNumber: 372,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 353,
                    columnNumber: 11
                }, this),
                notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-green-600 dark:text-green-400",
                    children: notice
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 402,
                    columnNumber: 20
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-red-600 dark:text-red-400 break-words",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
                    lineNumber: 403,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
            lineNumber: 242,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx",
        lineNumber: 241,
        columnNumber: 5
    }, this);
}
_s(DarioAccountPanel, "uGgLy4/CBOFzsZmw/9nBtjmPdus=");
_c = DarioAccountPanel;
var _c;
__turbopack_context__.k.register(_c, "DarioAccountPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DarioServiceTab",
    ()=>DarioServiceTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceStatusCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLifecycleButtons.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/ServiceLogsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoStartToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/AutoRestartAdoptedToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$DarioAccountPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/components/DarioAccountPanel.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const NAME = "dario";
function DarioServiceTab() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceStatusCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceStatusCard"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLifecycleButtons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLifecycleButtons"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoStartToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoStartToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$AutoRestartAdoptedToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AutoRestartAdoptedToggle"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$DarioAccountPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DarioAccountPanel"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$components$2f$ServiceLogsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ServiceLogsPanel"], {
                name: NAME
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = DarioServiceTab;
var _c;
__turbopack_context__.k.register(_c, "DarioServiceTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ServicesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$CliproxyServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/tabs/CliproxyServiceTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$NinerouterServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/tabs/NinerouterServiceTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$MuxServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/tabs/MuxServiceTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$BifrostServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/tabs/BifrostServiceTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$DarioServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/services/tabs/DarioServiceTab.tsx [app-client] (ecmascript)");
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
;
const TABS = [
    {
        id: "cliproxy",
        label: "CLIProxyAPI",
        icon: "swap_horiz"
    },
    {
        id: "9router",
        label: "9Router",
        icon: "route"
    },
    {
        id: "mux",
        label: "Mux",
        icon: "hub"
    },
    {
        id: "bifrost",
        label: "Bifrost",
        icon: "bolt"
    },
    {
        id: "dario",
        label: "Dario",
        icon: "shield_person"
    }
];
function ServicesPage() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("embeddedServices");
    const sp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const active = sp.get("tab") ?? "cliproxy";
    function setTab(tab) {
        router.push(`/dashboard/providers/services?tab=${tab}`);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-xl font-semibold text-text-primary",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted mt-1",
                        children: t("description")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1 border-b border-border",
                children: TABS.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setTab(tab.id),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors", active === tab.id ? "border-primary text-text-primary" : "border-transparent text-text-muted hover:text-text-primary hover:border-border"),
                        "aria-current": active === tab.id ? "page" : undefined,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px] leading-none",
                                children: tab.icon
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this),
                            tab.label
                        ]
                    }, tab.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    active === "cliproxy" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$CliproxyServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CliproxyServiceTab"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 62,
                        columnNumber: 35
                    }, this),
                    active === "9router" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$NinerouterServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NinerouterServiceTab"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 63,
                        columnNumber: 34
                    }, this),
                    active === "mux" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$MuxServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MuxServiceTab"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 64,
                        columnNumber: 30
                    }, this),
                    active === "bifrost" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$BifrostServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BifrostServiceTab"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 65,
                        columnNumber: 34
                    }, this),
                    active === "dario" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$services$2f$tabs$2f$DarioServiceTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DarioServiceTab"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                        lineNumber: 66,
                        columnNumber: 32
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/services/page.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(ServicesPage, "xxQNx88DqR3kb/tBZMik0ARd3b8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ServicesPage;
var _c;
__turbopack_context__.k.register(_c, "ServicesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_11huzh6._.js.map